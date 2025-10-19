package org.example.clothheaven.Service;

import org.example.clothheaven.DTO.CreateOrderDTO;
import org.example.clothheaven.DTO.OrderResponseDTO;
import org.example.clothheaven.DTO.UpdateOrderStatusDTO;
import org.example.clothheaven.Exception.CartItemNotFoundException;
import org.example.clothheaven.Exception.EmptyCartException;
import org.example.clothheaven.Exception.OrderNotFoundException;
import org.example.clothheaven.Mapper.OrderMapper;
import org.example.clothheaven.Model.Cart;
import org.example.clothheaven.Model.CartItem;
import org.example.clothheaven.Model.OrderItem;
import org.example.clothheaven.Model.Orders;
import org.example.clothheaven.Repository.CartRepository;
import org.example.clothheaven.Repository.ImageRepository;
import org.example.clothheaven.Repository.OrderItemRepository;
import org.example.clothheaven.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

@Service
@Transactional
public class OrderService {

        @Autowired
        private org.example.clothheaven.Repository.UserRepository userRepository;

        @Autowired
        private org.example.clothheaven.Repository.ProductRepository productRepository;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private OrderItemRepository orderItemRepository;

        @Autowired
        private CartRepository cartRepository;

        @Autowired
        private CartService cartService;

        @Autowired
        private OrderMapper orderMapper;

        @Autowired
        private ImageRepository imageRepository;

        public OrderResponseDTO createOrder(CreateOrderDTO createOrderDTO) {
                // Get user's cart
                Cart cart = cartRepository.findByUserIdWithItems(createOrderDTO.getUserId())
                                .orElseThrow(() -> new CartItemNotFoundException("Cart not found for user: " + createOrderDTO.getUserId()));

                if (cart.getCartItems().isEmpty()) {
                        throw new EmptyCartException("Cannot create order from empty cart");
                }

                // Fetch user entity
                org.example.clothheaven.Model.User user = userRepository.findById(createOrderDTO.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found: " + createOrderDTO.getUserId()));

                // Create new order with shipping and payment information
                Orders order = new Orders(user);

                // Set shipping information
                order.setFirstName(createOrderDTO.getFirstName());
                order.setLastName(createOrderDTO.getLastName());
                order.setCountry(createOrderDTO.getCountry());
                order.setPostalCode(createOrderDTO.getPostalCode());
                order.setPhoneNumber(createOrderDTO.getPhoneNumber());
                order.setHomeAddress(createOrderDTO.getHomeAddress());
                order.setEmailAddress(createOrderDTO.getEmailAddress());

                // Set payment information
                order.setPaymentMethod(createOrderDTO.getPaymentMethod());
                order.setPaymentSlipUrl(createOrderDTO.getPaymentSlipUrl());

                Orders savedOrder = orderRepository.save(order);

                // Create order items from cart items
                BigDecimal totalPrice = BigDecimal.ZERO;
                for (CartItem cartItem : cart.getCartItems()) {
                        // Fetch product entity
                        org.example.clothheaven.Model.Product product = productRepository
                                        .findById(cartItem.getProduct().getProductId())
                                        .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProduct().getProductId()));

                        BigDecimal itemPrice = BigDecimal.valueOf(product.getProductPrice());
                        BigDecimal itemTotal = itemPrice.multiply(new BigDecimal(cartItem.getCartItemsQuantity()));

                        OrderItem orderItem = new OrderItem(
                                        savedOrder,
                                        product,
                                        cartItem.getCartItemsQuantity(),
                                        itemTotal);

                        orderItemRepository.save(orderItem);
                        totalPrice = totalPrice.add(itemTotal);
                }

                // Update order total price
                savedOrder.setOrdersPrice(totalPrice);
                orderRepository.save(savedOrder);

                // Clear the cart after successful order creation
                cartService.clearCart(createOrderDTO.getUserId());

                // Return order with items
                Orders orderWithItems = orderRepository.findByIdWithItems(savedOrder.getOrderId())
                                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

                return orderMapper.toOrderResponseDTO(orderWithItems);
        }

        public List<OrderResponseDTO> getUserOrders(Long userId) {
                org.example.clothheaven.Model.User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                List<Orders> orders = orderRepository.findByUserWithItemsOrderByOrderDateDesc(user);

                return orders.stream()
                                .map(orderMapper::toOrderResponseDTO)
                                .collect(Collectors.toList());
        }

        public OrderResponseDTO getOrderById(Long orderId) {
                Orders order = orderRepository.findByIdWithItems(orderId)
                                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

                return orderMapper.toOrderResponseDTO(order);
        }

        public OrderResponseDTO updateOrderStatus(Long orderId, UpdateOrderStatusDTO updateOrderStatusDTO) {
                Orders order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

                order.setStatus(updateOrderStatusDTO.getStatus());
                orderRepository.save(order);

                Orders updatedOrder = orderRepository.findByIdWithItems(orderId)
                                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

                return orderMapper.toOrderResponseDTO(updatedOrder);
        }

        public OrderResponseDTO uploadPaymentSlip(Long orderId, MultipartFile file) {
                Orders order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("File is required");
                }

                String origName = file.getOriginalFilename();
                String original = StringUtils.cleanPath(origName != null ? origName : "file");
                String lower = original == null ? "" : original.toLowerCase();
                if (!(lower.endsWith(".pdf") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))) {
                        throw new IllegalArgumentException("Only PDF, PNG, JPG, JPEG files are allowed");
                }

                try {
                        java.nio.file.Path root = java.nio.file.Paths.get("uploads/payment-slips");
                        java.nio.file.Files.createDirectories(root);
                        String filename = orderId + "-" + System.currentTimeMillis() + "-" + original;
                        java.nio.file.Path dest = root.resolve(filename);
                        file.transferTo(dest.toFile());

                        // Set relative URL that frontend can load via static handler
                        String url = "/uploads/payment-slips/" + filename;
                        order.setPaymentSlipUrl(url);
                        orderRepository.save(order);

                        Orders updated = orderRepository.findByIdWithItems(orderId)
                                        .orElseThrow(() -> new OrderNotFoundException("Order not found"));
                        return orderMapper.toOrderResponseDTO(updated);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
                }
        }

        public byte[] generateOrderPdf(Long orderId) {
                Orders order = orderRepository.findByIdWithItems(orderId)
                                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

                try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                        PDPage page = new PDPage(PDRectangle.LETTER);
                        doc.addPage(page);
                        try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                                float margin = 50;
                                float y = page.getMediaBox().getHeight() - margin;

                                cs.setFont(PDType1Font.HELVETICA_BOLD, 16);
                                cs.beginText();
                                cs.newLineAtOffset(margin, y);
                                cs.showText("Order Details");
                                cs.endText();

                                y -= 24;
                                cs.setFont(PDType1Font.HELVETICA, 12);

                                String[] lines = new String[] {
                                                "Order ID: " + order.getOrderId(),
                                                "Order Date: " + order.getOrderDate(),
                                                "Status: " + order.getStatus(),
                                                "Customer: " + order.getFirstName() + " " + order.getLastName(),
                                                "Email: " + order.getEmailAddress(),
                                                "Phone: " + order.getPhoneNumber(),
                                                "Address: " + order.getHomeAddress() + ", " + order.getCountry() + " " + order.getPostalCode(),
                                                "Payment Method: " + order.getPaymentMethod(),
                                };

                                for (String l : lines) {
                                        y -= 16;
                                        cs.beginText();
                                        cs.newLineAtOffset(margin, y);
                                        cs.showText(l);
                                        cs.endText();
                                }

                                y -= 20;
                                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                                cs.beginText();
                                cs.newLineAtOffset(margin, y);
                                cs.showText("Items:");
                                cs.endText();
                                y -= 16;
                                cs.setFont(PDType1Font.HELVETICA, 12);

                                for (OrderItem it : order.getOrderItems()) {
                                        if (y < margin + 90) break; // leave space for image block
                                        String itemLine = String.format("- Product #%d  Qty: %d  Line Total: Rs. %s",
                                                        it.getProduct().getProductId(),
                                                        it.getOrderItemsQuantity(),
                                                        it.getOrderItemsPrice());
                                        y -= 14;
                                        cs.beginText();
                                        cs.newLineAtOffset(margin, y);
                                        cs.showText(itemLine);
                                        cs.endText();

                                        // Color / Size placeholders (not tracked in backend yet)
                                        y -= 14;
                                        cs.beginText();
                                        cs.newLineAtOffset(margin + 16, y);
                                        cs.showText("Color: N/A   Size: N/A");
                                        cs.endText();

                                        // Try to embed product image (first image)
                                        try {
                                                Long pid = it.getProduct().getProductId();
                                                List<org.example.clothheaven.Model.Image> imgs = imageRepository.findByProductProductId(pid);
                                                if (imgs != null && !imgs.isEmpty()) {
                                                        String urlStr = imgs.get(0).getImageUrl();
                                                        BufferedImage bimg = null;
                                                        if (urlStr != null) {
                                                                if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
                                                                        try (InputStream is = new URL(urlStr).openStream()) {
                                                                                bimg = ImageIO.read(is);
                                                                        }
                                                                } else if (urlStr.startsWith("/uploads/")) {
                                                                        String rel = urlStr.replaceFirst("^/", "");
                                                                        File f = new File(rel); // maps to uploads/... on disk
                                                                        if (f.exists()) {
                                                                                bimg = ImageIO.read(f);
                                                                        }
                                                                } else {
                                                                        // Try as local file path
                                                                        File f = new File(urlStr);
                                                                        if (f.exists()) {
                                                                                bimg = ImageIO.read(f);
                                                                        }
                                                                }
                                                        }
                                                        if (bimg != null) {
                                                                PDImageXObject pdImage = LosslessFactory.createFromImage(doc, bimg);
                                                                float imgW = 64, imgH = 64;
                                                                float imgX = page.getMediaBox().getWidth() - margin - imgW;
                                                                float imgY = y - imgH + 8;
                                                                if (imgY < margin) imgY = margin;
                                                                cs.drawImage(pdImage, imgX, imgY, imgW, imgH);
                                                        }
                                                }
                                        } catch (Exception ignore) {
                                                // ignore image failures; continue
                                        }

                                        y -= 8;
                                }

                                y -= 24;
                                cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
                                cs.beginText();
                                cs.newLineAtOffset(margin, y);
                                cs.showText("Total: Rs. " + order.getOrdersPrice());
                                cs.endText();
                        }

                        doc.save(baos);
                        return baos.toByteArray();
                } catch (Exception e) {
                        throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
                }
        }
}
package org.example.clothheaven.Controller;

import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;
import org.example.clothheaven.DTO.CreateOrderDTO;
import org.example.clothheaven.DTO.OrderResponseDTO;
import org.example.clothheaven.DTO.UpdateOrderStatusDTO;
import org.example.clothheaven.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@Validated
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody CreateOrderDTO createOrderDTO) {
        OrderResponseDTO orderResponse = orderService.createOrder(createOrderDTO);
        return new ResponseEntity<>(orderResponse, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(@PathVariable Long userId) {
        List<OrderResponseDTO> orders = orderService.getUserOrders(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long orderId) {
        OrderResponseDTO orderResponse = orderService.getOrderById(orderId);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusDTO updateOrderStatusDTO) {
        OrderResponseDTO orderResponse = orderService.updateOrderStatus(orderId, updateOrderStatusDTO);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @PostMapping(path = "/{orderId}/payment-slip", consumes = { "multipart/form-data" })
    public ResponseEntity<OrderResponseDTO> uploadPaymentSlip(
            @PathVariable Long orderId,
            @RequestParam("file") MultipartFile file) {
        OrderResponseDTO orderResponse = orderService.uploadPaymentSlip(orderId, file);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @PostMapping("/{orderId}/payment-slip-url")
    public ResponseEntity<OrderResponseDTO> submitPaymentSlipUrl(
            @PathVariable Long orderId,
            @RequestBody String url) {
        OrderResponseDTO orderResponse = orderService.submitPaymentSlipUrl(orderId, url);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @GetMapping(value = "/{orderId}/pdf")
    public ResponseEntity<byte[]> downloadOrderPdf(@PathVariable Long orderId) {
        byte[] pdf = orderService.generateOrderPdf(orderId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-" + orderId + ".pdf");
        headers.setContentLength(pdf.length);
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/{orderId}/payment-slip")
    public ResponseEntity<byte[]> getPaymentSlip(@PathVariable Long orderId) {
        byte[] slipData = orderService.getPaymentSlipData(orderId);
        String contentType = orderService.getPaymentSlipContentType(orderId);
        String filename = orderService.getPaymentSlipFilename(orderId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"" + (filename != null ? filename : "payment-slip") + "\"");
        headers.setContentLength(slipData.length);
        return new ResponseEntity<>(slipData, headers, HttpStatus.OK);
    }
}
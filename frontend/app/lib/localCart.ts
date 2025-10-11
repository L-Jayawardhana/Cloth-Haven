// Local cart management utilities

export interface LocalCartItem {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: string;
}

export interface LocalCart {
  items: LocalCartItem[];
}

const CART_STORAGE_KEY = "localCart";

export const localCartUtils = {
  // Get cart from localStorage
  getCart(): LocalCart {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : { items: [] };
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return { items: [] };
    }
  },

  // Save cart to localStorage
  saveCart(cart: LocalCart): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      // Trigger custom event to update cart count in navigation
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  },

  // Add item to cart
  addItem(productId: number, quantity: number = 1, size?: string, color?: string): LocalCart {
    const cart = this.getCart();
    
    // Check if item with same productId, size, and color already exists
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        size,
        color,
        addedAt: new Date().toISOString()
      });
    }

    this.saveCart(cart);
    return cart;
  },

  // Remove item from cart
  removeItem(productId: number): LocalCart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.productId !== productId);
    this.saveCart(cart);
    return cart;
  },

  // Remove item from cart with size/color matching
  removeItemWithSizeColor(productId: number, size?: string, color?: string): LocalCart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => 
      !(item.productId === productId && item.size === size && item.color === color)
    );
    this.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateQuantity(productId: number, quantity: number): LocalCart {
    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        cart.items[existingItemIndex].quantity = quantity;
      }
    }

    this.saveCart(cart);
    return cart;
  },

  // Update item quantity with size/color matching
  updateQuantityWithSizeColor(productId: number, quantity: number, size?: string, color?: string): LocalCart {
    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && item.size === size && item.color === color
    );

    if (existingItemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        cart.items[existingItemIndex].quantity = quantity;
      }
    }

    this.saveCart(cart);
    return cart;
  },

  // Clear entire cart
  clearCart(): LocalCart {
    const emptyCart = { items: [] };
    this.saveCart(emptyCart);
    return emptyCart;
  },

  // Get total items count
  getTotalItems(): number {
    const cart = this.getCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },

  // Check if product is in cart
  isProductInCart(productId: number): boolean {
    const cart = this.getCart();
    return cart.items.some(item => item.productId === productId);
  },

  // Get product quantity in cart
  getProductQuantity(productId: number): number {
    const cart = this.getCart();
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }
};
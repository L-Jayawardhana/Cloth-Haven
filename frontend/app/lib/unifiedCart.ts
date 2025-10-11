// Unified cart service that handles both local and backend carts
import { cartApi, type Cart, type CartItem, type AddToCartRequest } from './api';
import { localCartUtils, type LocalCart, type LocalCartItem } from './localCart';

interface User {
  userid: number;
  username: string;
  email: string;
  token?: string;
}

class UnifiedCartService {
  // Get current user from localStorage
  private getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.token !== undefined;
  }

  // Convert local cart to backend format
  private convertLocalToBackendCart(localCart: LocalCart, userId: number): Cart {
    return {
      cartId: 0, // Will be set by backend
      userId: userId,
      items: localCart.items.map((item, index) => ({
        cartItemId: index, // Temporary ID for local items
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    };
  }

  // Convert backend cart to local format
  private convertBackendToLocalCart(backendCart: Cart): LocalCart {
    return {
      items: backendCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        addedAt: new Date().toISOString()
      }))
    };
  }

  // Sync local cart to backend when user logs in
  async syncLocalCartToBackend(user: User): Promise<void> {
    const localCart = localCartUtils.getCart();
    
    if (localCart.items.length > 0) {
      try {
        // Add each local cart item to backend
        for (const item of localCart.items) {
          const addRequest: AddToCartRequest = {
            userId: user.userid,
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          };
          await cartApi.addItemToCart(addRequest);
        }
        
        // Clear local cart after successful sync
        localCartUtils.clearCart();
      } catch (error) {
        console.error('Error syncing local cart to backend:', error);
      }
    }
  }

  // Add item to cart (local or backend based on authentication)
  async addItem(productId: number, quantity: number = 1, size?: string, color?: string): Promise<void> {
    const user = this.getCurrentUser();
    
    if (this.isAuthenticated() && user) {
      // Use backend cart
      const addRequest: AddToCartRequest = {
        userId: user.userid,
        productId: productId,
        quantity: quantity,
        size: size,
        color: color
      };
      await cartApi.addItemToCart(addRequest);
    } else {
      // Use local cart
      localCartUtils.addItem(productId, quantity, size, color);
    }
  }

  // Get cart (local or backend based on authentication)
  async getCart(): Promise<Cart | null> {
    const user = this.getCurrentUser();
    
    if (this.isAuthenticated() && user) {
      // Get backend cart
      try {
        return await cartApi.getCartByUserId(user.userid);
      } catch (error) {
        console.error('Error getting backend cart:', error);
        return null;
      }
    } else {
      // Get local cart and convert to Cart format
      const localCart = localCartUtils.getCart();
      if (localCart.items.length === 0) {
        return null;
      }
      
      return {
        cartId: 0,
        userId: 0,
        items: localCart.items.map((item, index) => ({
          cartItemId: index,
          productId: item.productId,
          quantity: item.quantity
        }))
      };
    }
  }

  // Update item quantity
  async updateQuantity(itemIdentifier: number | string, quantity: number): Promise<void> {
    const user = this.getCurrentUser();
    
    if (this.isAuthenticated() && user) {
      // Backend cart - itemIdentifier is cartItemId
      if (typeof itemIdentifier === 'number') {
        await cartApi.updateCartItemQuantity(itemIdentifier, quantity);
      }
    } else {
      // Local cart - itemIdentifier is productId
      if (typeof itemIdentifier === 'number') {
        localCartUtils.updateQuantity(itemIdentifier, quantity);
      }
    }
  }

  // Update item quantity with size/color for local cart
  async updateQuantityLocal(productId: number, quantity: number, size?: string, color?: string): Promise<void> {
    localCartUtils.updateQuantityWithSizeColor(productId, quantity, size, color);
  }

  // Remove item from cart
  async removeItem(itemIdentifier: number): Promise<void> {
    const user = this.getCurrentUser();
    
    if (this.isAuthenticated() && user) {
      // Backend cart - itemIdentifier is productId
      await cartApi.removeItemFromCart(user.userid, itemIdentifier);
    } else {
      // Local cart - itemIdentifier is productId
      localCartUtils.removeItem(itemIdentifier);
    }
  }

  // Remove item by cartItemId (for authenticated users)
  async removeItemByCartItemId(cartItemId: number): Promise<void> {
    const user = this.getCurrentUser();
    
    if (this.isAuthenticated() && user) {
      // For backend, we need to use the cart API - but first we need to get the item to find productId
      const cart = await this.getCart();
      const item = cart?.items.find(i => i.cartItemId === cartItemId);
      if (item) {
        await cartApi.removeItemFromCart(user.userid, item.productId);
      }
    }
  }

  // Remove item from local cart with size/color matching
  async removeItemLocal(productId: number, size?: string, color?: string): Promise<void> {
    localCartUtils.removeItemWithSizeColor(productId, size, color);
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    const user = this.getCurrentUser();
    
    if (this.isAuthenticated() && user) {
      // Clear backend cart
      await cartApi.clearCart(user.userid);
    } else {
      // Clear local cart
      localCartUtils.clearCart();
    }
  }

  // Get total items count
  async getTotalItems(): Promise<number> {
    const cart = await this.getCart();
    if (!cart) return 0;
    
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Check if product is in cart
  async isProductInCart(productId: number): Promise<boolean> {
    const cart = await this.getCart();
    if (!cart) return false;
    
    return cart.items.some(item => item.productId === productId);
  }

  // Get product quantity in cart
  async getProductQuantity(productId: number): Promise<number> {
    const cart = await this.getCart();
    if (!cart) return 0;
    
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Handle user login - sync local cart to backend
  async handleUserLogin(user: User): Promise<void> {
    await this.syncLocalCartToBackend(user);
  }

  // Handle user logout - optionally sync backend cart to local
  async handleUserLogout(): Promise<void> {
    // Optionally sync backend cart to local cart before logout
    // For now, we'll just clear everything
    const user = this.getCurrentUser();
    if (user) {
      try {
        const backendCart = await cartApi.getCartByUserId(user.userid);
        const localCart = this.convertBackendToLocalCart(backendCart);
        localCartUtils.saveCart(localCart);
      } catch (error) {
        console.error('Error syncing backend cart to local on logout:', error);
      }
    }
  }
}

export const unifiedCartService = new UnifiedCartService();
export type { Cart, CartItem };
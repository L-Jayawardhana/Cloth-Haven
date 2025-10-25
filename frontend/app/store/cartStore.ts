import { create } from 'zustand';
import { cartApi } from '../lib/api';

interface CartStore {
  cartCount: number;
  loading: boolean;
  fetchCartCount: (userId: number) => Promise<void>;
  incrementCount: (amount?: number) => void;
  decrementCount: (amount?: number) => void;
  setCount: (count: number) => void;
  resetCount: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cartCount: 0,
  loading: false,
  
  fetchCartCount: async (userId: number) => {
    try {
      set({ loading: true });
      const cart = await cartApi.getCartByUserId(userId);
      const totalItems = cart.items.reduce((sum, item) => 
        sum + (item.quantity ?? item.cartItemsQuantity ?? 0), 0
      );
      set({ cartCount: totalItems, loading: false });
    } catch (error) {
      // Silently fail - don't show error for empty cart or network issues
      // Just set count to 0 and stop loading
      set({ cartCount: 0, loading: false });
    }
  },
  
  incrementCount: (amount = 1) => {
    set((state) => ({ cartCount: state.cartCount + amount }));
  },
  
  decrementCount: (amount = 1) => {
    set((state) => ({ cartCount: Math.max(0, state.cartCount - amount) }));
  },
  
  setCount: (count: number) => {
    set({ cartCount: Math.max(0, count) });
  },
  
  resetCount: () => {
    set({ cartCount: 0 });
  },
}));

// Custom hook for handling authentication and cart synchronization
import { useEffect } from 'react';
import { unifiedCartService } from '../lib/unifiedCart';

interface User {
  userid: number;
  username: string;
  email: string;
  token?: string;
}

export const useAuthCartSync = () => {
  useEffect(() => {
    // Listen for storage changes (login/logout events)
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'user') {
        const userData = event.newValue;
        
        if (userData) {
          // User logged in
          try {
            const user: User = JSON.parse(userData);
            await unifiedCartService.handleUserLogin(user);
            
            // Trigger cart count update
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          } catch (error) {
            console.error('Error handling user login cart sync:', error);
          }
        } else {
          // User logged out
          try {
            await unifiedCartService.handleUserLogout();
            
            // Trigger cart count update
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          } catch (error) {
            console.error('Error handling user logout cart sync:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to trigger cart sync manually (useful for login/logout handlers)
  const syncCart = async (user?: User) => {
    try {
      if (user) {
        await unifiedCartService.handleUserLogin(user);
      } else {
        await unifiedCartService.handleUserLogout();
      }
      
      // Trigger cart count update
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  return { syncCart };
};
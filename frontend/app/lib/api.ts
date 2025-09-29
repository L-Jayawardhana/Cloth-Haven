const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface User {
  userid: number;
  username: string;
  email: string;
  phoneNo?: string;
  address?: string;
  role: string;
  createdAt?: string;
}

// Cart endpoints
export interface CartItem {
  cartItemId: number;
  productId: number;
  quantity: number;
  productName?: string;
  productImage?: string;
  price?: number;
}

export interface Cart {
  cartId: number;
  userId: number;
  items: CartItem[];
}



class CartApi {
  async getCartByUserId(userId: number): Promise<Cart | null> {
    return apiService["request"](`/cart/user/${userId}`);
  }

  async addItemToCart(userId: number, productId: number, quantity: number = 1): Promise<void> {
    await apiService["request"](`/cart/add`, {
      method: "POST",
      body: JSON.stringify({ userId, productId, quantity }),
    });
  }

  async removeItemFromCart(userId: number, productId: number): Promise<void> {
    await apiService["request"](`/cart/user/${userId}/product/${productId}`, { method: "DELETE" });
  }

  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<Cart | null> {
    return apiService["request"](`/cart/item/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async clearCart(userId: number): Promise<void> {
    await apiService["request"](`/cart/user/${userId}/clear`, { method: "DELETE" });
  }
}

export const cartApi = new CartApi();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phoneNo?: string;
  address?: string;
  pw: string;
  role?: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  phoneNo?: string;
  address?: string;
  role: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Attach JWT if present
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          defaultHeaders['Authorization'] = `Bearer ${parsed.token}`;
        }
      }
    } catch {}

    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      // If response is 204 No Content, return null
      if (response.status === 204) {
        return null as any;
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<(User & { token?: string }) | null> {
    return this.request<User & { token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<(User & { token?: string }) | null> {
    return this.request<User & { token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getUser(userId: number): Promise<User | null> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User | null> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(userId: number, passwordData: PasswordChangeRequest): Promise<{ message: string } | null> {
    return this.request<{ message: string }>(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async getAllUsers(): Promise<User[] | null> {
    return this.request<User[]>('/users');
  }

  async deleteAccount(userId: number, password: string): Promise<{ message: string } | null> {
    return this.request<{ message: string }>(`/users/${userId}/delete-account`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
}

export const apiService = new ApiService();

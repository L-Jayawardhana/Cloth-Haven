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
  productName: string;
  productPrice: number;
  quantity: number;
  productImage?: string;
}

export interface Cart {
  cartId: number;
  userId: number;
  items: CartItem[];
}



class CartApi {
  async getCartByUserId(userId: number, skipThrottle: boolean = false): Promise<Cart | null> {
    if (skipThrottle) {
      // Use a special method that bypasses some throttling for cart refreshes
      return apiService.requestWithReducedThrottling(`/cart/user/${userId}`);
    }
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
  role?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

class ApiService {
  private requestQueue = new Map<string, Promise<any>>();
  private requestCooldowns = new Map<string, number>();
  private readonly COOLDOWN_DURATION = 3000; // 3 seconds minimum between identical requests
  private readonly MAX_CONCURRENT_REQUESTS = 2; // Maximum 2 concurrent requests
  private activeRequests = new Set<string>();
  
  // Circuit breaker for emergency stopping
  private circuitBreakerOpen = false;
  private failureCount = 0;
  private readonly MAX_FAILURES = 5;
  private circuitBreakerOpenTime = 0;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      if (Date.now() - this.circuitBreakerOpenTime > this.CIRCUIT_BREAKER_TIMEOUT) {
        console.log('[API] Circuit breaker timeout - resetting');
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
      } else {
        console.log('[API] Circuit breaker OPEN - blocking all requests');
        throw new Error('Circuit breaker open - API temporarily disabled');
      }
    }

    // Create a unique key for this request
    const requestKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || {})}`;
    
    // If same request is already in progress, return that promise
    if (this.requestQueue.has(requestKey)) {
      console.log('[API] Reusing existing request:', requestKey);
      return this.requestQueue.get(requestKey);
    }

    // Check if request is on cooldown
    const lastRequest = this.requestCooldowns.get(requestKey);
    if (lastRequest && Date.now() - lastRequest < this.COOLDOWN_DURATION) {
      console.log('[API] Request blocked - on cooldown:', requestKey);
      this.failureCount++;
      this.checkCircuitBreaker();
      throw new Error('Request blocked - too frequent');
    }

    // Check concurrent request limit
    if (this.activeRequests.size >= this.MAX_CONCURRENT_REQUESTS) {
      console.log('[API] Request blocked - too many concurrent:', requestKey);
      this.failureCount++;
      this.checkCircuitBreaker();
      throw new Error('Request blocked - too many concurrent requests');
    }

    // Mark request as active
    this.activeRequests.add(requestKey);
    this.requestCooldowns.set(requestKey, Date.now());
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

    // Create the actual request promise
    const requestPromise = (async () => {
      try {
        console.log('[API] Making request:', requestKey);
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
      } finally {
        // Clean up the request from queue and active set after completion
        this.requestQueue.delete(requestKey);
        this.activeRequests.delete(requestKey);
        console.log('[API] Request completed:', requestKey);
      }
    })();

    // Add to queue
    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
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

  async forgotPassword(email: string): Promise<{ message: string } | null> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string } | null> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
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

  async adminDeleteUser(userId: number, adminPassword: string): Promise<{ message: string } | null> {
    return this.request<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ adminPassword }),
    });
  }

  // Special method with reduced throttling for cart operations
  async requestWithReducedThrottling<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    // Create a unique key for this request
    const requestKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || {})}`;
    
    // Check if same request is already in progress
    if (this.requestQueue.has(requestKey)) {
      console.log('[API] Reusing existing request (reduced throttle):', requestKey);
      return this.requestQueue.get(requestKey);
    }

    // Reduced cooldown for cart operations (1 second instead of 3)
    const REDUCED_COOLDOWN = 1000;
    const lastRequest = this.requestCooldowns.get(requestKey);
    if (lastRequest && Date.now() - lastRequest < REDUCED_COOLDOWN) {
      console.log('[API] Request blocked - reduced cooldown active:', requestKey);
      throw new Error('Request blocked - please wait a moment');
    }

    // Mark request as active
    this.activeRequests.add(requestKey);
    this.requestCooldowns.set(requestKey, Date.now());

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

    // Create the actual request promise
    const requestPromise = (async () => {
      try {
        console.log('[API] Making request (reduced throttle):', requestKey);
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
      } finally {
        // Clean up the request from queue and active set after completion
        this.requestQueue.delete(requestKey);
        this.activeRequests.delete(requestKey);
        console.log('[API] Request completed (reduced throttle):', requestKey);
      }
    })();

    // Add to queue
    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
  }

  private checkCircuitBreaker() {
    if (this.failureCount >= this.MAX_FAILURES && !this.circuitBreakerOpen) {
      console.log('[API] Circuit breaker TRIGGERED - opening circuit');
      this.circuitBreakerOpen = true;
      this.circuitBreakerOpenTime = Date.now();
      
      // Clear all pending requests
      this.requestQueue.clear();
      this.activeRequests.clear();
      
      // Show emergency notification
      if (typeof window !== 'undefined') {
        console.error('🚨 API CIRCUIT BREAKER ACTIVATED - Too many failed requests. API temporarily disabled.');
      }
    }
  }

  // Manual circuit breaker reset
  public resetCircuitBreaker() {
    console.log('[API] Circuit breaker manually reset');
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
    this.requestQueue.clear();
    this.activeRequests.clear();
    this.requestCooldowns.clear();
  }

  // Get API status
  public getApiStatus() {
    return {
      circuitBreakerOpen: this.circuitBreakerOpen,
      failureCount: this.failureCount,
      activeRequests: this.activeRequests.size,
      queuedRequests: this.requestQueue.size
    };
  }
}

export const apiService = new ApiService();

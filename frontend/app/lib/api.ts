const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface User {
  userId: number;
  username: string;
  email: string;
  phoneNo?: string;
  address?: string;
  role: string;
  createdAt?: string;
}

export interface LoginResponse extends User {
  token: string;
  redirectUrl?: string;
}

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
  // role removed - users can't change their own role
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<User & { token?: string }> {
    return this.request<User & { token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(userId: number, passwordData: PasswordChangeRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async deleteAccount(userId: number, password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/delete-account`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async adminDeleteUser(userId: number, adminPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/admin-delete`, {
      method: 'POST',
      body: JSON.stringify({ password: adminPassword }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }
}

export const apiService = new ApiService();

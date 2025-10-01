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
  async getCartByUserId(userId: number): Promise<Cart> {
    return apiService["request"](`/cart/user/${userId}`);
  }

  async removeItemFromCart(userId: number, productId: number): Promise<void> {
    await apiService["request"](`/cart/user/${userId}/product/${productId}`, { method: "DELETE" });
  }

  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<Cart> {
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
  async login(credentials: LoginRequest): Promise<User & { token?: string }> {
    return this.request<User & { token?: string }>('/auth/login', {
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
}

export const apiService = new ApiService();

// Product interfaces - Updated to match backend DTO
export interface Product {
  productId: number;
  name: string;
  description?: string;
  productPrice: number;
  categoryId: number;
  subCategoryId?: number;
  inStock?: boolean;
  success?: boolean;
  message?: string;
  data?: any;
  availableSizes?: string[];
  availableColors?: string[];
  totalQuantity?: number;
}

// Category interfaces
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  subCategories?: SubCategory[];
}

// Backend CategoryResponseDTO structure
interface CategoryResponseDTO {
  success: boolean;
  message: string;
  categoryNames?: string[];
}

// Backend SubCategoryResponseDTO structure
interface SubCategoryResponseDTO {
  success: boolean;
  message: string;
  data?: any; // Can be SubCategoryCreateDTO or array of SubCategoryCreateDTO
}

// Backend SubCategoryCreateDTO structure
interface SubCategoryCreateDTO {
  subCategoryId: number;
  categoryId: number;
  subCategory: string;
}

// SubCategory interfaces
export interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  description?: string;
}

// Product Image interfaces - Updated to match backend DTO
export interface ProductImage {
  imageId: number;
  productId: number;
  imageUrl: string;
}

// Color Size Quantity Availability interfaces - Updated to match backend DTO
export interface ColorsSizeQuantityAvailability {
  id: number;
  productId: number;
  color: string;
  size: string;
  availability: boolean;
  quantity: number;
}

// Product API
class ProductApi {
  async getProductById(productId: number): Promise<Product> {
    return apiService["request"]<Product>(`/products/${productId}`);
  }

  async getAllProducts(): Promise<Product[]> {
    return apiService["request"]<Product[]>('/products/get-products');
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return apiService["request"]<Product[]>(`/products/category/${categoryId}`);
  }

  async getProductsBySubCategory(subCategoryId: number): Promise<Product[]> {
    return apiService["request"]<Product[]>(`/products/sub-category/${subCategoryId}`);
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return apiService["request"]<Product[]>(`/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
  }
}

// Category API
class CategoryApi {
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Making API call to /categories/all...');
      const response = await apiService["request"]<CategoryResponseDTO>('/categories/all');
      console.log('🏷️ Raw Categories API response:', response);
      
      if (response.success && response.categoryNames) {
        console.log('✅ Category names received:', response.categoryNames);
        // Convert category names to Category objects with mock IDs
        // Since backend only returns names, we'll create IDs based on array index + 1
        const categories = response.categoryNames.map((name, index) => ({
          categoryId: index + 1,
          categoryName: name
        }));
        console.log('🎯 Converted to Category objects:', categories);
        return categories;
      } else {
        console.warn('⚠️ API response indicates failure or no data:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryById(categoryId: number): Promise<Category | null> {
    try {
      console.log(`🔍 Fetching category by ID: ${categoryId}`);
      const response = await apiService["request"]<CategoryResponseDTO>(`/categories/${categoryId}`);
      if (response.success && response.categoryNames && response.categoryNames.length > 0) {
        return {
          categoryId: categoryId,
          categoryName: response.categoryNames[0]
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching category:', error);
      return null;
    }
  }

  async getCategoriesWithSubCategories(): Promise<Category[]> {
    // For now, just return basic categories since subcategories need separate API calls
    return this.getAllCategories();
  }
}

// SubCategory API  
class SubCategoryApi {
  async getAllSubCategories(): Promise<SubCategory[]> {
    try {
      console.log('🔍 Making API call to /sub-categories/all...');
      const response = await apiService["request"]<SubCategoryResponseDTO>('/sub-categories/all');
      console.log('📂 Raw SubCategories API response:', response);
      
      if (response.success && response.data) {
        const subCategories = Array.isArray(response.data) ? response.data : [response.data];
        const convertedSubCategories = subCategories.map((sub: SubCategoryCreateDTO) => ({
          subCategoryId: sub.subCategoryId,
          subCategoryName: sub.subCategory,
          categoryId: sub.categoryId
        }));
        console.log('✅ Converted subcategories:', convertedSubCategories);
        return convertedSubCategories;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching subcategories:', error);
      return [];
    }
  }

  async getSubCategoriesByCategory(categoryId: number): Promise<SubCategory[]> {
    try {
      console.log(`🔍 Fetching subcategories for category ${categoryId}...`);
      const response = await apiService["request"]<SubCategoryResponseDTO>(`/sub-categories/by-category/${categoryId}`);
      console.log(`📂 SubCategories for category ${categoryId}:`, response);
      
      if (response.success && response.data) {
        const subCategories = Array.isArray(response.data) ? response.data : [response.data];
        const convertedSubCategories = subCategories.map((sub: SubCategoryCreateDTO) => ({
          subCategoryId: sub.subCategoryId,
          subCategoryName: sub.subCategory,
          categoryId: sub.categoryId
        }));
        console.log(`✅ Converted subcategories for category ${categoryId}:`, convertedSubCategories);
        return convertedSubCategories;
      }
      return [];
    } catch (error) {
      console.error(`❌ Error fetching subcategories for category ${categoryId}:`, error);
      return [];
    }
  }

  async getSubCategoryById(subCategoryId: number): Promise<SubCategory | null> {
    try {
      console.log(`🔍 Fetching subcategory by ID: ${subCategoryId}`);
      const response = await apiService["request"]<SubCategoryResponseDTO>(`/sub-categories/${subCategoryId}`);
      
      if (response.success && response.data) {
        const sub = response.data as SubCategoryCreateDTO;
        return {
          subCategoryId: sub.subCategoryId,
          subCategoryName: sub.subCategory,
          categoryId: sub.categoryId
        };
      }
      return null;
    } catch (error) {
      console.error(`❌ Error fetching subcategory ${subCategoryId}:`, error);
      return null;
    }
  }
}

// Image API
class ImageApi {
  async getImagesByProductId(productId: number): Promise<ProductImage[]> {
    console.log(`🖼️ Fetching images for product ID: ${productId} from /api/v1/images/product/${productId}`);
    try {
      const images = await apiService["request"]<ProductImage[]>(`/images/product/${productId}`);
      console.log(`✅ Images retrieved for product ${productId}:`, images);
      return images;
    } catch (error) {
      console.error(`❌ Error fetching images for product ${productId}:`, error);
      throw error;
    }
  }
}

// Color Size API with aggressive cache busting
class ColorsSizeQuantityAvailabilityApi {
  async getByProductId(productId: number): Promise<ColorsSizeQuantityAvailability[]> {
    try {
      // Add multiple cache busting parameters for REAL-TIME updates
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(7);
      const response = await apiService["request"]<ColorsSizeQuantityAvailability[]>(
        `/colors-size-quantity-availability/product/${productId}?_t=${timestamp}&_r=${random}&cache=false`
      );
      console.log(`🔥 FRESH API CALL for product ${productId}:`, response);
      return response;
    } catch (error) {
      console.error('🔴 Error fetching color-size data for product:', error);
      return [];
    }
  }
}

export const productApi = new ProductApi();
export const categoryApi = new CategoryApi();
export const subCategoryApi = new SubCategoryApi();
export const imageApi = new ImageApi();
export const colorSizeApi = new ColorsSizeQuantityAvailabilityApi();

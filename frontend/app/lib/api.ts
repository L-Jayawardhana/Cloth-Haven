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

// Cart endpoints
export interface CartItem {
  cartItemId: number;
  productId: number;
  quantity?: number;
  cartItemsQuantity?: number; // backend field name
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
    return apiService.request<Cart>(`/cart/user/${userId}`);
  }

  async removeItemFromCart(userId: number, productId: number): Promise<void> {
    await apiService.request<void>(`/cart/user/${userId}/product/${productId}`, { method: "DELETE" });
  }

  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<Cart> {
    return apiService.request<Cart>(`/cart/item/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async clearCart(userId: number): Promise<void> {
    await apiService.request<void>(`/cart/user/${userId}/clear`, { method: "DELETE" });
  }

  async addItemToCart(payload: { userId: number; productId: number; quantity: number }): Promise<Cart> {
    return apiService.request<Cart>(`/cart/add`, {
      method: 'POST',
      body: JSON.stringify({ userId: payload.userId, productId: payload.productId, quantity: payload.quantity }),
    });
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
  public async request<T>(
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
      
      // Handle empty responses (like 204 No Content for DELETE operations)
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If it's a 204 No Content or empty response, return empty object
      if (response.status === 204 || contentLength === '0' || 
          (!contentType || !contentType.includes('application/json'))) {
        return {} as T;
      }
      
      // Try to parse JSON, but handle empty responses gracefully
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }
      
      return JSON.parse(text);
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

  async validateResetToken(token: string): Promise<{ message: string; valid: boolean }> {
    return this.request<{ message: string; valid: boolean }>('/auth/validate-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
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
  deleted?: boolean;
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
  categories?: CategoryCreateDTO[]; // Add support for full category data
}

// Backend CategoryCreateDTO structure
interface CategoryCreateDTO {
  categoryId: number;
  categoryName: string;
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

  async createProduct(productData: {
    name: string;
    description?: string;
    productPrice: number;
    categoryId: number;
    subCategoryId?: number;
  }): Promise<Product> {
    // Backend expects ProductResponseDTO format
    const backendPayload = {
      name: productData.name,
      description: productData.description || '',
      productPrice: productData.productPrice,
      categoryId: productData.categoryId,
      subCategoryId: productData.subCategoryId || null,
      inStock: true,
      success: false, // This will be set by backend
      message: '', // This will be set by backend
      data: null // This will be set by backend
    };
    
    console.log('Sending product payload to backend:', backendPayload);
    
    const response = await apiService["request"]<any>('/products/add-product', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
    
    console.log('Backend response:', response);
    
    // Convert backend response to frontend Product format
    return {
      productId: response.productId || response.data?.productId,
      name: response.name,
      description: response.description,
      productPrice: response.productPrice,
      categoryId: response.categoryId,
      subCategoryId: response.subCategoryId,
      inStock: response.inStock,
      success: response.success,
      message: response.message,
      data: response.data
    };
  }

  async updateProduct(productId: number, productData: {
    name: string;
    description?: string;
    productPrice: number;
    categoryId: number;
    subCategoryId?: number;
  }): Promise<Product> {
    // Backend expects ProductResponseDTO format
    const backendPayload = {
      productId: productId,
      name: productData.name,
      description: productData.description || '',
      productPrice: productData.productPrice,
      categoryId: productData.categoryId,
      subCategoryId: productData.subCategoryId || null,
      inStock: true,
      success: false, // This will be set by backend
      message: '', // This will be set by backend
      data: null // This will be set by backend
    };
    
    console.log('Sending product update payload to backend:', backendPayload);
    
    const response = await apiService["request"]<any>(`/products/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(backendPayload),
    });
    
    console.log('Backend update response:', response);
    
    // Convert backend response to frontend Product format
    return {
      productId: response.productId || response.data?.productId,
      name: response.name,
      description: response.description,
      productPrice: response.productPrice,
      categoryId: response.categoryId,
      subCategoryId: response.subCategoryId,
      inStock: response.inStock,
      success: response.success,
      message: response.message,
      data: response.data
    };
  }

  async softDeleteProduct(productId: number): Promise<boolean> {
    try {
      const response = await apiService["request"]<boolean>(`/products/soft-delete/${productId}`, {
        method: 'PUT'
      });
      return response;
    } catch (error) {
      console.error('Error soft deleting product:', error);
      return false;
    }
  }

  async adminSoftDeleteProduct(productId: number, adminPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Admin soft deleting product ${productId}`);
      const response = await apiService["request"]<{ message: string }>(`/products/${productId}/admin-soft-delete`, {
        method: 'POST',
        body: JSON.stringify({ password: adminPassword }),
      });
      console.log('Admin product soft deletion response:', response);
      
      return {
        success: true,
        message: response.message || 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error admin soft deleting product:', error);
      return {
        success: false,
        message: 'Admin password is incorrect or product cannot be deleted'
      };
    }
  }
}

// Category API
class CategoryApi {
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Making API call to /categories/all...');
      const response = await apiService["request"]<CategoryResponseDTO>('/categories/all');
      console.log('🏷️ Raw Categories API response:', response);
      
      if (response.success) {
        // Try to get full category data first (if backend provides it)
        if (response.categories && Array.isArray(response.categories)) {
          console.log('✅ Full category data received:', response.categories);
          const categories = response.categories.map((cat: CategoryCreateDTO) => ({
            categoryId: cat.categoryId,
            categoryName: cat.categoryName
          }));
          console.log('🎯 Converted to Category objects:', categories);
          return categories;
        }
        
        // Fallback to category names only (current backend behavior)
        if (response.categoryNames && Array.isArray(response.categoryNames)) {
          console.log('✅ Category names received:', response.categoryNames);
          // For now, use sequential IDs as a temporary workaround
          // This will be fixed when backend provides full data
          const categories = response.categoryNames.map((name, index) => ({
            categoryId: index + 1,
            categoryName: name
          }));
          console.log('🎯 Converted to Category objects (with temp IDs):', categories);
          return categories;
        }
      }
      
      console.warn('⚠️ API response indicates failure or no data:', response);
      return [];
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

  async addCategory(categoryData: { categoryName: string }): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🆕 Creating new category:', categoryData);
      const response = await apiService["request"]<CategoryResponseDTO>('/categories/add-category', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
      console.log('✅ Category creation response:', response);
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'Category created successfully' : 'Failed to create category')
      };
    } catch (error) {
      console.error('❌ Error creating category:', error);
      return {
        success: false,
        message: 'Failed to create category'
      };
    }
  }

  async updateCategory(categoryId: number, categoryData: { categoryName: string }): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Updating category ${categoryId}:`, categoryData);
      const response = await apiService["request"]<CategoryResponseDTO>(`/categories/update/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
      });
      console.log('✅ Category update response:', response);
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'Category updated successfully' : 'Failed to update category')
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        message: 'Failed to update category'
      };
    }
  }

  async deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Deleting category ${categoryId}`);
      const response = await apiService["request"]<CategoryResponseDTO>(`/categories/delete/${categoryId}`, {
        method: 'DELETE'
      });
      console.log('Category deletion response:', response);
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'Category deleted successfully' : 'Failed to delete category')
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        message: 'Failed to delete category'
      };
    }
  }

  async adminDeleteCategory(categoryId: number, adminPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Admin deleting category ${categoryId}`);
      const response = await apiService["request"]<{ message: string }>(`/categories/${categoryId}/admin-delete`, {
        method: 'POST',
        body: JSON.stringify({ password: adminPassword }),
      });
      console.log('Admin category deletion response:', response);
      
      return {
        success: true,
        message: response.message || 'Category deleted successfully'
      };
    } catch (error) {
      console.error('Error admin deleting category:', error);
      return {
        success: false,
        message: 'Admin password is incorrect or category cannot be deleted'
      };
    }
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

  async createSubCategory(subCategoryData: { subCategory: string; categoryId: number }): Promise<SubCategoryResponseDTO> {
    try {
      console.log('🆕 Creating new subcategory:', subCategoryData);
      const response = await apiService["request"]<SubCategoryResponseDTO>('/sub-categories/add', {
        method: 'POST',
        body: JSON.stringify(subCategoryData)
      });
      console.log('✅ SubCategory created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating subcategory:', error);
      throw error;
    }
  }

  async updateSubCategory(subCategoryId: number, subCategoryData: { subCategory: string; categoryId: number }): Promise<SubCategoryResponseDTO> {
    try {
      console.log(`🔄 Updating subcategory ${subCategoryId}:`, subCategoryData);
      const response = await apiService["request"]<SubCategoryResponseDTO>(`/sub-categories/update/${subCategoryId}`, {
        method: 'PUT',
        body: JSON.stringify(subCategoryData)
      });
      console.log('✅ SubCategory updated:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating subcategory ${subCategoryId}:`, error);
      throw error;
    }
  }

  async deleteSubCategory(subCategoryId: number): Promise<SubCategoryResponseDTO> {
    try {
      console.log(`🗑️ Deleting subcategory ${subCategoryId}`);
      const response = await apiService["request"]<SubCategoryResponseDTO>(`/sub-categories/delete/${subCategoryId}`, {
        method: 'DELETE'
      });
      console.log('✅ SubCategory deleted:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting subcategory ${subCategoryId}:`, error);
      throw error;
    }
  }

  async adminDeleteSubCategory(subCategoryId: number, adminPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Admin deleting subcategory ${subCategoryId}`);
      const response = await apiService["request"]<{ message: string }>(`/sub-categories/${subCategoryId}/admin-delete`, {
        method: 'POST',
        body: JSON.stringify({ password: adminPassword }),
      });
      console.log('Admin subcategory deletion response:', response);
      
      return {
        success: true,
        message: response.message || 'Subcategory deleted successfully'
      };
    } catch (error) {
      console.error('Error admin deleting subcategory:', error);
      return {
        success: false,
        message: 'Admin password is incorrect or subcategory cannot be deleted'
      };
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

  async createImage(imageData: {
    imageUrl: string;
    productId: number;
  }): Promise<ProductImage> {
    console.log('🖼️ Creating image:', imageData);
    try {
      const response = await apiService["request"]<ProductImage>('/images', {
        method: 'POST',
        body: JSON.stringify(imageData),
      });
      console.log('✅ Image created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating image:', error);
      throw error;
    }
  }

  async createImagesBatch(images: Array<{
    imageUrl: string;
    productId: number;
  }>): Promise<ProductImage[]> {
    console.log('🖼️ Creating images batch:', images);
    const results: ProductImage[] = [];
    
    for (const imageData of images) {
      try {
        const result = await this.createImage(imageData);
        results.push(result);
      } catch (error) {
        console.error('❌ Error creating image:', imageData, error);
        // Continue with other images even if one fails
      }
    }
    
    return results;
  }

  async deleteByProductId(productId: number): Promise<void> {
    console.log('Deleting all images for product:', productId);
    return apiService.request<void>(`/images/product/${productId}`, {
      method: 'DELETE',
    });
  }

  async deleteImage(imageId: number): Promise<void> {
    console.log('Deleting image with ID:', imageId);
    return apiService.request<void>(`/images/${imageId}`, {
      method: 'DELETE',
    });
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

  async createColorSizeEntry(data: {
    productId: number;
    color: string;
    size: string;
    quantity?: number;
    availability?: boolean;
  }): Promise<ColorsSizeQuantityAvailability> {
    const payload = {
      productId: data.productId,
      color: data.color,
      size: data.size,
      quantity: data.quantity || 0,
      availability: data.availability !== false // default to true
    };
    
    return apiService.request<ColorsSizeQuantityAvailability>('/colors-size-quantity-availability', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createColorSizeEntriesBatch(entries: Array<{
    productId: number;
    color: string;
    size: string;
    quantity?: number;
    availability?: boolean;
  }>): Promise<ColorsSizeQuantityAvailability[]> {
    const payload = entries.map(data => ({
      productId: data.productId,
      color: data.color,
      size: data.size,
      quantity: data.quantity || 0,
      availability: data.availability !== false // default to true
    }));
    
    console.log('Creating color-size entries batch:', payload);
    
    return apiService.request<ColorsSizeQuantityAvailability[]>('/colors-size-quantity-availability/batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteByProductId(productId: number): Promise<void> {
    console.log('Deleting all color-size entries for product:', productId);
    return apiService.request<void>(`/colors-size-quantity-availability/product/${productId}`, {
      method: 'DELETE',
    });
  }

  async deleteVariant(id: number): Promise<void> {
    console.log('Deleting color-size variant with ID:', id);
    return apiService.request<void>(`/colors-size-quantity-availability/${id}`, {
      method: 'DELETE',
    });
  }
}

// Inventory Management Interfaces
export interface InventoryStockUpdate {
  productId: number;
  color: string;
  size: string;
  changeType: 'ORDER' | 'RESTOCK' | 'CANCEL' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT';
  quantityChange: number;
  reason?: string;
}

export interface ColorsSizeQuantityAvailability {
  id: number;
  productId: number;
  color: string;
  size: string;
  quantity: number;
  availability: boolean;
}

// Inventory Management API
class InventoryApi {
  async updateStock(updateData: InventoryStockUpdate): Promise<ColorsSizeQuantityAvailability> {
    return apiService.request<ColorsSizeQuantityAvailability>('/inventoryLogs/updateStock', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  async getProductVariants(productId: number): Promise<ColorsSizeQuantityAvailability[]> {
    return apiService.request<ColorsSizeQuantityAvailability[]>(`/colors-size-quantity-availability/product/${productId}`);
  }
}

export const productApi = new ProductApi();
export const categoryApi = new CategoryApi();
export const subCategoryApi = new SubCategoryApi();
export const imageApi = new ImageApi();
export const colorSizeApi = new ColorsSizeQuantityAvailabilityApi();
export const inventoryApi = new InventoryApi();

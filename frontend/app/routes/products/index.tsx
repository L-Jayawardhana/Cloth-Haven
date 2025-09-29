import React, { useEffect, useState } from "react";
import { cartApi } from "../../lib/api";

// Mock UI components since shadcn/ui might not be available
type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  [x: string]: any;
};

const Button = ({ children, type = "button", disabled = false, onClick, ...props }: ButtonProps) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      disabled 
        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
        : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

type Category = {
  categoryId: number;
  categoryName?: string;
};

type SubCategory = {
  subCategoryId: number;
  subCategoryName?: string;
};

type Product = {
  productId?: number;
  name: string;
  description: string;
  productPrice: number;
  category: Category;
  subCategory: SubCategory;
  imageUrl?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, 'productId' | 'imageUrl'>>({
    name: "",
    description: "",
    productPrice: 0,
    category: { categoryId: 1 },
    subCategory: { subCategoryId: 1 },
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    let mounted = true;
    
    const fetchProducts = async () => {
      if (loading) return; // Prevent multiple simultaneous requests
      
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/api/v1/products/get-products");
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        if (mounted) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to fetch products");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "categoryId") {
      setForm((f) => ({
        ...f,
        category: { ...f.category, categoryId: Number(value) },
      }));
    } else if (name === "subCategoryId") {
      setForm((f) => ({
        ...f,
        subCategory: { ...f.subCategory, subCategoryId: Number(value) },
      }));
    } else if (name === "productPrice") {
      setForm((f) => ({ ...f, productPrice: Number(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("productPrice", String(form.productPrice));
      formData.append("categoryId", String(form.category.categoryId));
      formData.append("subCategoryId", String(form.subCategory.subCategoryId));
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const res = await fetch("http://localhost:8080/api/v1/products/add-product", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add product');
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || "Failed to add product");
      } else {
        setProducts((prev) => [...prev, data]);
        setForm({
          name: "",
          description: "",
          productPrice: 0,
          category: { categoryId: 1 },
          subCategory: { subCategoryId: 1 },
        });
        setImageFile(null);
      }
    } catch (err) {
      setError("Failed to add product");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Products Management</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Add Product Form */}
      <form className="bg-white rounded-lg shadow-md p-6 mb-8" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <Input
            name="productPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={form.productPrice}
            onChange={handleChange}
            required
          />
          <Input
            name="categoryId"
            type="number"
            min="1"
            placeholder="Category ID"
            value={form.category.categoryId}
            onChange={handleChange}
            required
          />
          <Input
            name="subCategoryId"
            type="number"
            min="1"
            placeholder="SubCategory ID"
            value={form.subCategory.subCategoryId}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
            className="col-span-full border border-gray-300 rounded-md px-3 py-2"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
      
      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Products ({products.length})
        </h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products found</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.productId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-green-600">
                    ${product.productPrice.toFixed(2)}
                  </span>
                  <div className="text-gray-500">
                    Cat: {product.category?.categoryId} | Sub: {product.subCategory?.subCategoryId}
                  </div>
                </div>
                <Button 
                  disabled={loading}
                  onClick={async (e) => {
                    const button = e.currentTarget;
                    if (button.disabled) return;
                    
                    button.disabled = true;
                    try {
                      // Get user from localStorage
                      let user = null;
                      try {
                        const raw = localStorage.getItem("user");
                        user = raw ? JSON.parse(raw) : null;
                      } catch {}
                      if (!user) {
                        alert("Please sign in to add to cart.");
                        return;
                      }
                      if (typeof product.productId !== 'number') {
                        alert("Invalid product ID");
                        return;
                      }
                      await cartApi.addItemToCart(user.userid, product.productId, 1);
                      alert("Item added to cart!");
                      // Use React Router navigation instead of window.location
                      setTimeout(() => {
                        window.location.href = '/cart';
                      }, 1000);
                    } catch (error) {
                      console.error('Error adding to cart:', error);
                      alert('Failed to add item to cart');
                    } finally {
                      setTimeout(() => {
                        button.disabled = false;
                      }, 2000); // Prevent rapid clicking
                    }
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
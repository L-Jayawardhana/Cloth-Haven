type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  tag?: string;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Cotton T-Shirt",
    price: 24.99,
    originalPrice: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop",
    tag: "Sale",
    category: "Tops",
    description: "Premium cotton blend t-shirt with comfortable fit",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy", "Gray"],
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: "2",
    name: "Denim Jacket",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1600&auto=format&fit=crop",
    tag: "New",
    category: "Outerwear",
    description: "Classic denim jacket with vintage wash",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Black"],
    rating: 4.8,
    reviews: 89,
    inStock: true,
  },
  {
    id: "3",
    name: "High-Waist Jeans",
    price: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1600&auto=format&fit=crop",
    category: "Bottoms",
    description: "Comfortable high-waist jeans with stretch",
    sizes: ["24", "26", "28", "30", "32"],
    colors: ["Blue", "Black", "Light Blue"],
    rating: 4.3,
    reviews: 156,
    inStock: true,
  },
  {
    id: "4",
    name: "Oversized Hoodie",
    price: 54.99,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1600&auto=format&fit=crop",
    tag: "Limited",
    category: "Tops",
    description: "Cozy oversized hoodie perfect for layering",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Black", "Cream"],
    rating: 4.7,
    reviews: 203,
    inStock: true,
  },
  {
    id: "5",
    name: "Summer Dress",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1600&auto=format&fit=crop",
    tag: "New",
    category: "Dresses",
    description: "Flowing summer dress with floral pattern",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Floral", "Solid Blue", "Solid Pink"],
    rating: 4.6,
    reviews: 94,
    inStock: true,
  },
  {
    id: "6",
    name: "Cargo Pants",
    price: 64.99,
    imageUrl: "https://images.unsplash.com/photo-1506629905607-9b0b0b0b0b0b?q=80&w=1600&auto=format&fit=crop",
    category: "Bottoms",
    description: "Utility cargo pants with multiple pockets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Khaki", "Black", "Olive"],
    rating: 4.4,
    reviews: 67,
    inStock: true,
  },
  {
    id: "7",
    name: "Knit Sweater",
    price: 89.99,
    originalPrice: 119.99,
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1600&auto=format&fit=crop",
    tag: "Sale",
    category: "Tops",
    description: "Soft knit sweater for cold weather",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Gray", "Navy"],
    rating: 4.9,
    reviews: 178,
    inStock: true,
  },
  {
    id: "8",
    name: "Leather Jacket",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1600&auto=format&fit=crop",
    tag: "Premium",
    category: "Outerwear",
    description: "Genuine leather jacket with classic cut",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    rating: 4.8,
    reviews: 45,
    inStock: false,
  },
  {
    id: "9",
    name: "Casual Blouse",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1600&auto=format&fit=crop",
    category: "Tops",
    description: "Elegant blouse perfect for office wear",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy", "Pink"],
    rating: 4.2,
    reviews: 112,
    inStock: true,
  },
  {
    id: "10",
    name: "Jogger Pants",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1506629905607-9b0b0b0b0b0b?q=80&w=1600&auto=format&fit=crop",
    category: "Bottoms",
    description: "Comfortable jogger pants with elastic waist",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gray", "Navy"],
    rating: 4.5,
    reviews: 89,
    inStock: true,
  },
  {
    id: "11",
    name: "Maxi Dress",
    price: 94.99,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1600&auto=format&fit=crop",
    tag: "Eco",
    category: "Dresses",
    description: "Sustainable maxi dress made from organic cotton",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Green", "Blue", "Pink"],
    rating: 4.7,
    reviews: 134,
    inStock: true,
  },
  {
    id: "12",
    name: "Bomber Jacket",
    price: 74.99,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1600&auto=format&fit=crop",
    category: "Outerwear",
    description: "Stylish bomber jacket with ribbed cuffs",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Olive"],
    rating: 4.4,
    reviews: 76,
    inStock: true,
  },
];

import React, { useState } from "react";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [priceRange, setPriceRange] = useState(200);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear"];
  const tags = ["All", "New", "Sale", "Limited", "Eco", "Premium"];

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesTag = selectedTag === "All" || product.tag === selectedTag;
    const matchesPrice = product.price <= priceRange;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesTag && matchesPrice && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cloth Haven</h1>
          <p className="text-gray-600">Discover our premium collection of clothing</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            {/* Search */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Search</h3>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span className="font-medium">${priceRange}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTag === tag
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedTag("All");
                setPriceRange(200);
                setSearchQuery("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear All Filters
            </button>
          </aside>

          {/* Product Grid */}
          <section className="space-y-6">
            {/* Header with Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {sortedProducts.length} Products Found
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategory !== "All" && `in ${selectedCategory}`}
                  {selectedTag !== "All" && ` • ${selectedTag}`}
                </p>
              </div>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.tag && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                        {product.tag}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Colors */}
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-xs text-gray-500">Colors:</span>
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' :
                                             color.toLowerCase() === 'black' ? '#000000' :
                                             color.toLowerCase() === 'navy' ? '#1e3a8a' :
                                             color.toLowerCase() === 'gray' ? '#6b7280' :
                                             color.toLowerCase() === 'blue' ? '#3b82f6' :
                                             color.toLowerCase() === 'pink' ? '#ec4899' :
                                             color.toLowerCase() === 'cream' ? '#fef3c7' :
                                             color.toLowerCase() === 'brown' ? '#92400e' :
                                             color.toLowerCase() === 'olive' ? '#84cc16' :
                                             color.toLowerCase() === 'khaki' ? '#d4af37' :
                                             color.toLowerCase() === 'green' ? '#10b981' :
                                             color.toLowerCase() === 'light blue' ? '#93c5fd' : '#e5e7eb'
                            }}
                            title={color}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      disabled={!product.inStock}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        product.inStock
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedTag("All");
                    setPriceRange(200);
                    setSearchQuery("");
                  }}
                  className="rounded-lg bg-gray-900 text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}



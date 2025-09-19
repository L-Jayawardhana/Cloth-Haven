import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "~/lib/api";
import { Link } from "react-router";
import ProductDetail from "./product-detail";

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
  availableSizes?: string[];
  availableColors?: string[];
  totalQuantity?: number;
};

// Removed demo/mock products. Data now comes from the backend only.

// Function to get color value for any color name
const getColorValue = (colorName: string): string => {
  const color = colorName.toLowerCase().trim();
  
  // Common color mappings
  const colorMap: { [key: string]: string } = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#10b981',
    'yellow': '#f59e0b',
    'orange': '#f97316',
    'purple': '#8b5cf6',
    'pink': '#ec4899',
    'brown': '#92400e',
    'gray': '#6b7280',
    'grey': '#6b7280',
    'navy': '#1e3a8a',
    'cream': '#fef3c7',
    'beige': '#f5f5dc',
    'olive': '#84cc16',
    'khaki': '#d4af37',
    'light blue': '#93c5fd',
    'dark blue': '#1e40af',
    'light green': '#86efac',
    'dark green': '#166534',
    'light red': '#fca5a5',
    'dark red': '#991b1b',
    'maroon': '#7f1d1d',
    'burgundy': '#7c2d12',
    'coral': '#ff7f7f',
    'turquoise': '#06b6d4',
    'teal': '#14b8a6',
    'indigo': '#6366f1',
    'violet': '#8b5cf6',
    'magenta': '#d946ef',
    'cyan': '#06b6d4',
    'lime': '#84cc16',
    'gold': '#fbbf24',
    'silver': '#9ca3af',
    'bronze': '#cd7f32',
    'copper': '#b87333'
  };
  
  // Check if it's a direct match
  if (colorMap[color]) {
    return colorMap[color];
  }
  
  // Try to find partial matches
  for (const [key, value] of Object.entries(colorMap)) {
    if (color.includes(key) || key.includes(color)) {
      return value;
    }
  }
  
  // If no match found, try to generate a color from the name
  // This creates a consistent color based on the string
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate RGB values
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  
  // Ensure minimum brightness
  const minBrightness = 100;
  const finalR = Math.max(r, minBrightness);
  const finalG = Math.max(g, minBrightness);
  const finalB = Math.max(b, minBrightness);
  
  return `rgb(${finalR}, ${finalG}, ${finalB})`;
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [priceRange, setPriceRange] = useState(100000);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: categoryNames } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Backend returns CategoryResponseDTO with message, success and data: string[]
      const res = await getJson<{ success: boolean; message: string; data?: string[] }>(
        "/categories/names"
      );
      return res?.data ?? [];
    },
    staleTime: 60_000,
  });
  const categories = ["All", ...(categoryNames ?? [])];
  const tags = ["All", "New", "Sale", "Limited", "Eco", "Premium"];

  const queryParams = {
    q: searchQuery || undefined,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    tag: selectedTag !== "All" ? selectedTag : undefined,
    maxPrice: priceRange || undefined,
    sort: sortBy || undefined,
  } as const;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: async () => {
      // Map backend Product -> UI Product
      type BackendProduct = {
        productId: number;
        name: string;
        description?: string;
        productPrice: number;
        size?: string;
        colour?: string;
        category?: { categoryName?: string } | null;
        inStock?: boolean;
        availableSizes?: string[];
        availableColors?: string[];
        totalQuantity?: number;
      };
      const items = await getJson<BackendProduct[]>(
        "/products/get-products",
        queryParams as Record<string, string | number | boolean | undefined>
      );
      type ImageDTO = { imageId: number; imageUrl: string; productId: number };
      // Create a mapping for categoryId to category name
      const categoryMap: { [key: number]: string } = {
        1: "Men's Wear",
        2: "Women's Wear", 
        3: "Kids' Wear",
        4: "Accessories"
      };

      const mappedBase: Product[] = (items ?? []).map((p, idx) => ({
        id: String(p.productId ?? idx + 1),
        name: p.name ?? "Unnamed",
        price: typeof p.productPrice === "number" ? p.productPrice : 0,
        originalPrice: undefined,
        imageUrl: "https://placehold.co/600x800?text=No+Image",
        tag: undefined,
        category: categoryMap[p.categoryId] ?? "Uncategorized",
        description: p.description ?? "",
        sizes: p.size ? [p.size] : ["Free"],
        colors: p.colour ? [p.colour] : ["Black"],
        rating: 0,
        reviews: 0,
        inStock: p.inStock ?? true,
        availableSizes: p.availableSizes ?? (p.size ? [p.size] : ["Free"]),
        availableColors: p.availableColors ?? (p.colour ? [p.colour] : ["Black"]),
        totalQuantity: p.totalQuantity ?? 0,
      }));

      // Fetch first image URL for each product (if any)
      const withImages = await Promise.all(
        mappedBase.map(async (p) => {
          try {
            const imgs = await getJson<ImageDTO[]>(`/images/product/${p.id}`);
            const url = (imgs && imgs.length > 0) ? imgs[0].imageUrl : undefined;
            return { ...p, imageUrl: url ?? p.imageUrl };
          } catch {
            return p;
          }
        })
      );
      return withImages;
    },
    staleTime: 60_000,
  });

  const sourceProducts = data ?? [];

  const formatLkr = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `LKR ${Math.round(amount).toLocaleString()}`;
    }
  };

  const filteredProducts = sourceProducts.filter((product) => {
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
                  max="100000"
                  value={priceRange}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatLkr(0)}</span>
                  <span className="font-medium">{formatLkr(priceRange)}</span>
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
                  {isLoading ? "Loading products..." : `${sortedProducts.length} Products Found`}
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

            {/* Loading state */}
            {isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="aspect-[4/5] bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-2/3 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                      <div className="h-8 w-full bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load products from the server.
                <button onClick={() => refetch()} className="ml-3 underline">
                  Retry
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                      />
                    </Link>
                    {product.tag && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                        {product.tag}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    
                    {/* Hover overlay with stock and size info */}
                    {hoveredProduct === product.id && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 pointer-events-none">
                        <div className="text-center space-y-3">
                          <div className="text-lg font-semibold">
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </div>
                          {product.totalQuantity && product.totalQuantity > 0 && (
                            <div className="text-sm opacity-90">
                              {product.totalQuantity} units available
                            </div>
                          )}
                          {product.availableSizes && product.availableSizes.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Available Sizes:</div>
                              <div className="flex flex-wrap gap-1 justify-center">
                                {product.availableSizes.map((size, index) => (
                                  <span
                                    key={index}
                                    className="bg-white/20 px-2 py-1 rounded text-xs"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {product.availableColors && product.availableColors.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Available Colors:</div>
                              <div className="flex flex-wrap gap-1 justify-center max-w-32">
                                {product.availableColors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-4 h-4 rounded-full border border-white/30"
                                    style={{
                                      backgroundColor: getColorValue(color)
                                    }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 hover:text-gray-700 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
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
                        {formatLkr(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>


                    {/* Add to Cart Button */}
                    <div className="space-y-2">
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
                      {product.inStock && product.totalQuantity && product.totalQuantity > 0 && (
                        <div className="text-xs text-gray-600 text-center">
                          Max: {product.totalQuantity} units available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* No Results */}
            {!isLoading && sortedProducts.length === 0 && (
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
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}



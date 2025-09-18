import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "~/lib/api";

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

// Removed demo/mock products. Data now comes from the backend only.

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [priceRange, setPriceRange] = useState(100000);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

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
        stockQuantity?: number;
        category?: { categoryName?: string } | null;
      };
      const items = await getJson<BackendProduct[]>(
        "/products/get-products",
        queryParams as Record<string, string | number | boolean | undefined>
      );
      type ImageDTO = { imageId: number; imageUrl: string; productId: number };
      const mappedBase: Product[] = (items ?? []).map((p, idx) => ({
        id: String(p.productId ?? idx + 1),
        name: p.name ?? "Unnamed",
        price: typeof p.productPrice === "number" ? p.productPrice : 0,
        originalPrice: undefined,
        imageUrl: "https://placehold.co/600x800?text=No+Image",
        tag: undefined,
        category: p.category?.categoryName ?? "Uncategorized",
        description: p.description ?? "",
        sizes: p.size ? [p.size] : ["Free"],
        colors: p.colour ? [p.colour] : ["Black"],
        rating: 0,
        reviews: 0,
        inStock: (p.stockQuantity ?? 0) > 0,
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
                        {formatLkr(product.price)}
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
    </div>
  );
}



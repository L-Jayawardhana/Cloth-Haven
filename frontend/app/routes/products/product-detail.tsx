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
  availableSizes?: string[];
  availableColors?: string[];
  totalQuantity?: number;
};

// Function to get color value for any color name
const getColorValue = (colorName: string): string => {
  const color = colorName.toLowerCase().trim();
  
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
  
  if (colorMap[color]) {
    return colorMap[color];
  }
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (color.includes(key) || key.includes(color)) {
      return value;
    }
  }
  
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  
  const minBrightness = 100;
  const finalR = Math.max(r, minBrightness);
  const finalG = Math.max(g, minBrightness);
  const finalB = Math.max(b, minBrightness);
  
  return `rgb(${finalR}, ${finalG}, ${finalB})`;
};

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const formatLkr = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `LKR ${Math.round(amount).toLocaleString()}`;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const maxQuantity = product.totalQuantity || 10;
  const availableSizes = product.availableSizes || product.sizes;
  const availableColors = product.availableColors || product.colors;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Product Images */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional Images (if available) */}
            <div className="grid grid-cols-4 gap-2">
              {[product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl].map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-gray-900' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-6">
              {/* Product Title & Price */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatLkr(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatLkr(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: getColorValue(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Max: {maxQuantity} units available
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4">
                <button
                  disabled={!product.inStock || !selectedSize || !selectedColor}
                  className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors ${
                    product.inStock && selectedSize && selectedColor
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                {/* Installment Option */}
                <div className="text-center text-gray-600">
                  or with 3 installments of <strong>{formatLkr(product.price / 3)}</strong>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3 text-gray-700">
                  <p>{product.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Premium quality materials</li>
                      <li>Comfortable fit</li>
                      <li>Durable construction</li>
                      <li>Easy care instructions</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Care Details:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Machine wash cold</li>
                      <li>Do not bleach</li>
                      <li>Line dry</li>
                      <li>Iron on medium heat</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Free shipping on orders over LKR 20,000</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Free Exchange & Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

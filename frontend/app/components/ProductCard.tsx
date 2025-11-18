import React, { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardFooter } from './ui/card';
import { type Product, type ProductImage } from '../lib/api';

interface ProductCardProps {
  product: Product;
  images: ProductImage[];
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, images, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  const primaryImage = images.length > 0 
    ? images[0].imageUrl 
    : "https://placehold.co/400x500?text=No+Image&bg=000000&color=ffffff";

  const isOutOfStock = product.inStock === false;
  
  const handleAddToCart = async () => {
    if (!onAddToCart || isAdding) return;
    setIsAdding(true);
    try {
      await onAddToCart(product.productId);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <Card className="group product-card overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200 bg-white">
      {/* Product Image - Clickable */}
      <Link to={`/products/${product.productId}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-black cursor-pointer">
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/400x500?text=No+Image&bg=000000&color=ffffff";
            }}
          />

          {/* Stock Status Badge - Only show when Out of Stock */}
          {isOutOfStock && (
            <div className="absolute top-3 right-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-lg">
                <div className="w-2 h-2 rounded-full mr-2 bg-red-400 animate-pulse"></div>
                Out
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>

      {/* Product Information - Clean and minimal */}
      <CardContent className="p-4 space-y-3">
        <div>
          <Link to={`/products/${product.productId}`}>
            <h3 className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price Section - Clean black text */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            LKR {product.productPrice.toFixed(2)}
          </span>
          {!isOutOfStock && (
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          )}
        </div>
      </CardContent>

      {/* Action Button - Yellow Add to Cart */}
      <CardFooter className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform btn-animate ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isAdding
              ? 'bg-yellow-400 text-white cursor-wait'
              : 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white shadow-lg hover:shadow-xl active:scale-95'
          }`}
        >
          {isOutOfStock ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Out of Stock</span>
            </span>
          ) : isAdding ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L3 3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0V9a1 1 0 011-1h6a1 1 0 011 1v4.1" />
              </svg>
              <span>Add to Cart</span>
            </span>
          )}
        </button>
      </CardFooter>
    </Card>
  );
}
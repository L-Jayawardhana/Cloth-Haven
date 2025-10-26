import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCartStore } from "./store/cartStore";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState("");
  const cartCount = useCartStore((state) => state.cartCount);
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);
  
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    
    // Listen for navigation changes
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const isAdmin = currentPath.startsWith("/admin");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch cart count when user is loaded
      const userId = parsedUser?.userId ?? parsedUser?.userid ?? parsedUser?.id;
      if (userId && !isAdmin) {
        fetchCartCount(userId);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-stone-50 text-gray-900 antialiased">
        {/* Fixed Cart Icon in Top Right Corner */}
        {!isAdmin && (
          <a 
            href="/cart" 
            className="fixed top-4 right-4 z-50 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border-2 border-gray-200 transition-all hover:scale-110 group"
            title="Shopping Cart"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-md">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </a>
        )}
        
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href={isAdmin ? "/admin" : "/"} className="inline-flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-gray-900 text-white grid place-items-center font-bold">CH</span>
              <span className="font-semibold tracking-tight">Cloth Haven</span>
            </a>
            {isAdmin ? (
              <div className="flex items-center justify-between w-full md:w-auto md:justify-center">
                <span className="hidden md:inline-block text-sm font-medium text-amber-700">Admin Dashboard</span>
              </div>
            ) : (
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <a href="/products" className="hover:text-gray-700">Products</a>
                {user && <a href="/orders" className="hover:text-gray-700">Orders</a>}
                {user && <a href="/profile" className="hover:text-gray-700">Profile</a>}
              </nav>
            )}
            {isAdmin ? (
              <div className="relative">
                <details className="group">
                  <summary className="list-none flex items-center gap-3 cursor-pointer select-none">
                    <span className="hidden sm:inline-block text-sm text-indigo-800">Welcome, Admin</span>
                    <span className="h-8 w-8 rounded-full bg-gray-300 text-gray-800 grid place-items-center text-xs font-medium">AD</span>
                  </summary>
                  <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg p-2 text-sm">
                    <a href="/admin/settings" className="block rounded px-2 py-1 hover:bg-gray-50">Settings</a>
                    <button onClick={handleLogout} className="mt-1 w-full text-left rounded px-2 py-1 text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </details>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Hi, {user.username}</span>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href="/login" className="text-sm hidden sm:inline-block hover:text-gray-700">Sign in</a>
                <a href="/register" className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Sign up</a>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-gray-900 text-white grid place-items-center font-bold">CH</span>
                <span className="font-semibold">Cloth Haven</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">Premium fashion, thoughtfully curated.</p>
            </div>
            <div className="text-sm">
              <p className="font-medium mb-2">Explore</p>
              <div className="grid gap-1">
                <a href="/products" className="hover:text-gray-700">All products</a>
                <a href="/cart" className="hover:text-gray-700 flex items-center gap-2">
                  Cart
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </a>
                {user && <a href="/orders" className="hover:text-gray-700">Orders</a>}
                {user && <a href="/profile" className="hover:text-gray-700">Account</a>}
              </div>
            </div>
            <div className="text-sm">
              <p className="font-medium mb-2">Company</p>
              <div className="grid gap-1">
                <a href="#" className="hover:text-gray-700">About</a>
                <a href="#" className="hover:text-gray-700">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-500 flex items-center justify-between">
              <span>© {new Date().getFullYear()} Cloth Haven</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

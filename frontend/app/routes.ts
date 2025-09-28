import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // Clean paths for common pages
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("products", "routes/products/index.tsx"),
  route("cart", "routes/cart/index.tsx"),
  route("profile", "routes/profile/index.tsx"),
  route("checkout", "routes/checkout/index.tsx"),
  // Admin routes
  route("admin", "routes/admin/route.tsx", [
    index("routes/admin/index.tsx"),
    route("users", "routes/admin/users.tsx"),
    route("products", "routes/admin/products.tsx"),
    route("inventory", "routes/admin/inventory.tsx"),
    route("orders", "routes/admin/orders.tsx"),
    route("reports", "routes/admin/reports.tsx"),
    route("settings", "routes/admin/settings.tsx"),
  ]),
  // Authentication routes
  route("forgot-password", "routes/auth/forgot-password.tsx"),
  route("reset-password", "routes/auth/reset-password.tsx"),
  route("login-fixed", "routes/auth/login-fixed.tsx"),
  // Debug and test routes
  route("debug", "routes/debug.tsx"),
  route("simple-test", "routes/simple-test.tsx"),
  route("browser-test", "routes/browser-test.tsx"),
  route("test-login", "routes/test-login.tsx"),
] satisfies RouteConfig;

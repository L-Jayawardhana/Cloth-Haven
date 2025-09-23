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
  route("debug", "routes/debug.tsx"),
  route("simple-test", "routes/simple-test.tsx"),
  route("login-fixed", "routes/auth/login-fixed.tsx"),
  route("browser-test", "routes/browser-test.tsx"),
  route("test-login", "routes/test-login.tsx"),
  route("forgot-password", "routes/auth/forgot-password.tsx"),
  route("reset-password", "routes/auth/reset-password.tsx"),
] satisfies RouteConfig;

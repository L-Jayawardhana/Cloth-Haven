import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  // Clean paths for common pages
  route("home", "routes/home.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("products", "routes/products/index.tsx"),
  route("cart", "routes/cart/index.tsx"),
  route("profile", "routes/profile/index.tsx"),
  route("checkout", "routes/checkout/index.tsx"),
] satisfies RouteConfig;

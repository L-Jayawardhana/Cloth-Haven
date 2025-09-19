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
  route("products/:productId", "routes/products/$productId.tsx"),
  route("cart", "routes/cart/index.tsx"),
  route("profile", "routes/profile/index.tsx"),
  route("checkout", "routes/checkout/index.tsx"),
] satisfies RouteConfig;

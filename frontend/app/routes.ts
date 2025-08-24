import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products", "routes/products/index.tsx"),
  route("auth/login", "routes/auth/login.tsx"),
  route("auth/register", "routes/auth/register.tsx"),
  route("cart", "routes/cart/index.tsx"),
  route("profile", "routes/profile/index.tsx"),
  route("checkout", "routes/checkout/index.tsx"),
] satisfies RouteConfig;

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });

  const emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email" : "";
  const passwordError = touched.password && password.length < 6 ? "Minimum 6 characters" : "";

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-8 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-2xl bg-gray-100 lg:block">
        <img
          src="https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=1600&auto=format&fit=crop"
          alt="Fashion"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/10" aria-hidden="true"></div>
        <div className="relative p-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20">Cloth Haven</div>
          <p className="mt-3 max-w-md text-sm text-white/90">Premium fashion, thoughtfully curated. Sign in to continue your shopping.</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={`mt-1 w-full rounded-md border px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/20 ${emailError ? "border-red-400" : "border-gray-300"}`}
                placeholder="you@example.com"
              />
              {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-700">Password</label>
                <a href="#" className="text-xs text-gray-600 hover:text-gray-800">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  className={`mt-1 w-full rounded-md border px-3 py-2 pr-10 outline-none transition focus:ring-2 focus:ring-gray-900/20 ${passwordError ? "border-red-400" : "border-gray-300"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordError ? <p className="mt-1 text-xs text-red-600">{passwordError}</p> : null}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Remember me</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:translate-y-px"
              disabled={!!emailError || !!passwordError || !email || !password}
            >
              Sign in
            </button>
          </form>
          <div className="mt-6 grid gap-3">
            <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">Continue with Google</button>
            <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">Continue with Apple</button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            New here? <a href="/register" className="font-medium text-gray-900 hover:underline">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

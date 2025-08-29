import { useState } from "react";
import { apiService } from "../../lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    
    if (!username || !emailOk || !pw) return;
    
    try {
      setSubmitting(true);
      const userData = await apiService.register({ username, email, phoneNo, pw, role: "CUSTOMER" });
      localStorage.setItem("user", JSON.stringify(userData));
      window.location.href = "/";
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-8 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-2xl bg-gray-100 lg:block">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"
          alt="Fashion"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/10" aria-hidden="true"></div>
        <div className="relative p-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-inset ring-white/20">Cloth Haven</div>
          <p className="mt-3 max-w-md text-sm text-white/90">Create an account to save your favorites and speed up checkout.</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-gray-600">Join Cloth Haven today</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-700">Full name</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" 
                placeholder="Jane Doe" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" 
                placeholder="you@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Phone</label>
              <input 
                value={phoneNo} 
                onChange={(e) => setPhoneNo(e.target.value)} 
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" 
                placeholder="+1 555 0100" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input 
                value={pw} 
                onChange={(e) => setPw(e.target.value)} 
                type="password" 
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" 
                placeholder="••••••••" 
              />
            </div>
            <button 
              disabled={!username || !emailOk || !pw || submitting} 
              type="submit" 
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create account"}
            </button>
            {serverError ? <p className="text-xs text-red-600">{serverError}</p> : null}
          </form>
          <div className="mt-6 grid gap-3">
            <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-50">Continue with Google</button>
            <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-50">Continue with Apple</button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="font-medium text-gray-900 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

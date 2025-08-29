export default function Register() {
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
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20">Cloth Haven</div>
          <p className="mt-3 max-w-md text-sm text-white/90">Create an account to save your favorites and speed up checkout.</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-gray-600">Join Cloth Haven today</p>
          <form className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Full name</label>
              <input type="text" className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input type="password" className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Create account</button>
          </form>
          <div className="mt-6 grid gap-3">
            <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">Continue with Google</button>
            <button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">Continue with Apple</button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="font-medium text-gray-900 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

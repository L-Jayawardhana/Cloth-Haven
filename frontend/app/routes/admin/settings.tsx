export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-indigo-700">Settings</h1>

      <section className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Profile</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span>Name</span>
            <input className="h-10 rounded-md border border-indigo-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" defaultValue="Admin" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Email</span>
            <input className="h-10 rounded-md border border-indigo-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" defaultValue="admin@clothhaven.com" />
          </label>
          <div>
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">Save Changes</button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Session</h2>
        <button className="mt-3 rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">Logout</button>
      </section>
    </div>
  );
}

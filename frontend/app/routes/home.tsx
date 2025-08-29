import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cloth Heaven - Premium Fashion" },
    { name: "description", content: "Premium fashion e-commerce platform" },
  ];
}

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero with image overlay */}
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop"
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/60" aria-hidden="true"></div>
        <div className="relative px-6 py-20 sm:py-28 lg:px-12 text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/20">New drop • Summer 2025</span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight">Elevate your wardrobe</h1>
            <p className="mt-4 text-white/90 max-w-xl">Curated collections and everyday essentials designed for comfort, quality, and style.</p>
            <div className="mt-8 flex gap-3">
              <a href="/products" className="inline-flex items-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100">Shop now</a>
              <a href="#categories" className="inline-flex items-center rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium hover:bg-white/10">Explore</a>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance features */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Free shipping", desc: "On orders over $80" },
          { title: "30-day returns", desc: "Hassle-free & easy" },
          { title: "Secure checkout", desc: "Trusted payments" },
          { title: "Premium quality", desc: "Curated selection" },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md">
            <p className="font-medium">{f.title}</p>
            <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories with images */}
      <section id="categories" className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Featured categories</h2>
          <a href="/products" className="text-sm text-gray-600 hover:text-gray-800">View all</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "New Arrivals", img: "https://images.unsplash.com/photo-1520975922284-9d8cc6c7e533?q=80&w=1600&auto=format&fit=crop" },
            { title: "Essentials", img: "https://images.unsplash.com/photo-1520975954732-35dd222996f2?q=80&w=1600&auto=format&fit=crop" },
            { title: "Sale Picks", img: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1600&auto=format&fit=crop" },
          ].map((item) => (
            <a key={item.title} href="/products" className="group relative overflow-hidden rounded-2xl">
              <img src={item.img} alt={item.title} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10"></div>
              <div className="absolute inset-0 flex items-end p-5">
                <div>
                  <p className="text-white text-lg font-medium">{item.title}</p>
                  <span className="mt-1 inline-block text-xs text-white/80">Shop now →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Trending products with richer hover */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Trending now</h2>
          <a href="/products" className="text-sm text-gray-600 hover:text-gray-800">Browse all</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <a key={i} href="/products" className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-lg">
              <div className="relative aspect-[4/5] bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1521577352947-9bb58764b69a?q=80&w=1600&auto=format&fit=crop"
                  alt="Product"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium">New</span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">Essential Tee</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-gray-600">$29.00</p>
                  <button className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">Add</button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Brand strip */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {['Aurora','North','Vista','Mono','Peak','Orbit'].map((b) => (
            <span key={b} className="text-sm font-medium text-gray-500">{b}</span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">What customers say</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Amina', text: 'Great quality and fast shipping. My go-to store!' },
            { name: 'Ravi', text: 'Clean, modern styles that fit perfectly.' },
            { name: 'Sara', text: 'Love the essentials line—super comfortable.' },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-700">“{t.text}”</p>
              <p className="mt-3 text-sm font-medium">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 sm:p-10">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">Stay in the loop</h2>
            <p className="mt-2 text-sm text-gray-600">Get updates on new drops and exclusive offers.</p>
          </div>
          <form className="flex gap-3">
            <input type="email" className="w-full rounded-md border-gray-300" placeholder="you@example.com" />
            <button className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

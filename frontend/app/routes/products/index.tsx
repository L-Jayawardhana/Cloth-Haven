type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  tag?: string;
};

const MOCK_PRODUCTS: Product[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: `Essential Tee ${i + 1}`,
  price: 29 + (i % 4) * 10,
  imageUrl:
    "https://images.unsplash.com/photo-1520975922284-9d8cc6c7e533?q=80&w=1600&auto=format&fit=crop",
  tag: i % 3 === 0 ? "New" : undefined,
}));

export default function Products() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="font-medium">Filters</p>
          <div className="mt-3 space-y-4 text-sm">
            <div>
              <label className="block text-gray-600">Category</label>
              <select className="mt-1 w-full rounded-md border-gray-300">
                <option>All</option>
                <option>Tops</option>
                <option>Bottoms</option>
                <option>Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600">Price range</label>
              <input type="range" min={0} max={150} className="mt-2 w-full" />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>$0</span><span>$150+</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['XS','S','M','L','XL','XXL'].map(s => (
                <button key={s} className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="font-medium">Tags</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {['New','Sale','Limited','Eco'].map(t => (
              <span key={t} className="rounded-full border border-gray-300 px-2 py-1">{t}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* Product grid */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h1 className="text-xl font-semibold">Products</h1>
          <select className="rounded-md border-gray-300 text-sm">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {MOCK_PRODUCTS.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-lg">
              <div className="relative aspect-[4/5] bg-gray-100">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {p.tag ? (
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium">{p.tag}</span>
                ) : null}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{p.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-gray-600">${p.price.toFixed(2)}</p>
                  <button className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}



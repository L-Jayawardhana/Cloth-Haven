import { Outlet, NavLink } from "react-router";

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="lg:sticky lg:top-20 h-max rounded-xl border border-indigo-100 bg-white shadow-sm">
        <nav className="p-2 text-sm">
          <Section title="Dashboard">
            <NavItem to="/admin" end>Overview</NavItem>
          </Section>
          <Section title="Management">
            <NavItem to="/admin/users">Users & Staff</NavItem>
            <NavItem to="/admin/products">Products & Categories</NavItem>
            <NavItem to="/admin/inventory">Inventory</NavItem>
            <NavItem to="/admin/orders">Orders</NavItem>
          </Section>
          <Section title="Analytics">
            <NavItem to="/admin/reports">Sales Reports</NavItem>
          </Section>
          <Section title="Account">
            <NavItem to="/admin/settings">Settings</NavItem>
          </Section>
        </nav>
      </aside>

      <section className="min-h-[60vh]">
        <Outlet />
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="px-2 pb-2 text-xs font-medium text-indigo-900/80">{title}</p>
      <div className="grid">
        {children}
      </div>
    </div>
  );
}

function NavItem(
  { to, end, children }: { to: string; end?: boolean; children: React.ReactNode }
) {
  // Determine colors based on the route
  const isUsersPage = to === "/admin/users";
  const isOverviewPage = to === "/admin";
  
  const getColors = (isActive: boolean) => {
    if (isUsersPage) {
      // Orange/amber theme for Users & Staff
      return isActive
        ? "bg-amber-100 text-amber-900 font-medium"
        : "text-gray-700 hover:bg-amber-50 hover:text-amber-800";
    } else if (isOverviewPage) {
      // Light blue theme for Overview (matching indigo KPI cards)
      return isActive
        ? "bg-indigo-100 text-indigo-900 font-medium"
        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700";
    } else {
      // Default theme for other pages
      return isActive
        ? "bg-gray-100 text-gray-900 font-medium"
        : "text-gray-700 hover:bg-gray-50";
    }
  };

  const getDotColor = () => {
    if (isUsersPage) {
      return "bg-amber-500";
    } else if (isOverviewPage) {
      return "bg-indigo-500";
    }
    return "bg-gray-400";
  };

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${getColors(isActive)}`
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDotColor()}`} />
      {children}
    </NavLink>
  );
}

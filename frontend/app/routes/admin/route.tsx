import { Outlet, NavLink } from "react-router";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      const userData = localStorage.getItem("user");
      
      if (!userData) {
        // No user data, redirect to login
        window.location.href = "/login";
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.role === "ADMIN") {
          setIsAuthorized(true);
        } else {
          // Not an admin, redirect to home with error message
          alert("Access denied. Admin privileges required.");
          window.location.href = "/";
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = "/login";
        return;
      }
      
      setIsLoading(false);
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="lg:sticky lg:top-20 h-max rounded-xl border border-indigo-100 bg-white shadow-sm">
        <nav className="p-2 text-sm">
          <Section title="Dashboard">
            <NavItem to="/admin" end>Overview</NavItem>
          </Section>
          <Section title="Management">
            <NavItem to="/admin/users">Users & Staff</NavItem>
            <NavItem to="/admin/products">Products</NavItem>
            <NavItem to="/admin/categories">Categories</NavItem>
            <NavItem to="/admin/subcategories">Subcategories</NavItem>
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

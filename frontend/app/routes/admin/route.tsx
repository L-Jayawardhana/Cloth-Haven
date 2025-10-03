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
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="lg:sticky lg:top-20 h-max rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-600">Cloth Haven Management</p>
        </div>
        <nav className="p-3 text-sm">
          <Section title="Dashboard">
            <NavItem to="/admin" end accent="emerald">
              Dashboard Overview
            </NavItem>
          </Section>
          
          <Section title="User Management">
            <NavItem to="/admin/users" accent="blue">
              Users & Staff
            </NavItem>
          </Section>
          
          <Section title="Product Management">
            <NavItem to="/admin/products" accent="purple">
              Products
            </NavItem>
            <NavItem to="/admin/categories" accent="indigo">
              Categories
            </NavItem>
            <NavItem to="/admin/subcategories" accent="violet">
              Subcategories
            </NavItem>
            <NavItem to="/admin/inventory" accent="orange">
              Inventory
            </NavItem>
          </Section>
          
          <Section title="Order Management">
            <NavItem to="/admin/orders" accent="green">
              Orders
            </NavItem>
          </Section>
          
          <Section title="Analytics & Reports">
            <NavItem to="/admin/reports" accent="cyan">
              Sales Reports
            </NavItem>
          </Section>
          
          <Section title="System">
            <NavItem to="/admin/settings" accent="gray">
              Settings
            </NavItem>
          </Section>
        </nav>
      </aside>

      <section className="min-h-[60vh]">
        <Outlet />
      </section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-3 pb-3">
        {icon && <span className="text-base">{icon}</span>}
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wider">{title}</p>
      </div>
      <div className="grid gap-1">
        {children}
      </div>
    </div>
  );
}

function NavItem(
  { to, end, accent = "gray", children }: { to: string; end?: boolean; accent?: string; children: React.ReactNode }
) {
  const getColors = (isActive: boolean) => {
    const colorMap: { [key: string]: { active: string; inactive: string; dot: string } } = {
      emerald: {
        active: "bg-emerald-100 text-emerald-800 border-emerald-200",
        inactive: "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-transparent hover:border-emerald-100",
        dot: "bg-emerald-500"
      },
      blue: {
        active: "bg-blue-100 text-blue-800 border-blue-200",
        inactive: "text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-transparent hover:border-blue-100",
        dot: "bg-blue-500"
      },
      purple: {
        active: "bg-purple-100 text-purple-800 border-purple-200",
        inactive: "text-gray-700 hover:bg-purple-50 hover:text-purple-700 border-transparent hover:border-purple-100",
        dot: "bg-purple-500"
      },
      indigo: {
        active: "bg-indigo-100 text-indigo-800 border-indigo-200",
        inactive: "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border-transparent hover:border-indigo-100",
        dot: "bg-indigo-500"
      },
      violet: {
        active: "bg-violet-100 text-violet-800 border-violet-200",
        inactive: "text-gray-700 hover:bg-violet-50 hover:text-violet-700 border-transparent hover:border-violet-100",
        dot: "bg-violet-500"
      },
      orange: {
        active: "bg-orange-100 text-orange-800 border-orange-200",
        inactive: "text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-transparent hover:border-orange-100",
        dot: "bg-orange-500"
      },
      green: {
        active: "bg-green-100 text-green-800 border-green-200",
        inactive: "text-gray-700 hover:bg-green-50 hover:text-green-700 border-transparent hover:border-green-100",
        dot: "bg-green-500"
      },
      cyan: {
        active: "bg-cyan-100 text-cyan-800 border-cyan-200",
        inactive: "text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 border-transparent hover:border-cyan-100",
        dot: "bg-cyan-500"
      },
      gray: {
        active: "bg-gray-100 text-gray-800 border-gray-200",
        inactive: "text-gray-700 hover:bg-gray-50 hover:text-gray-800 border-transparent hover:border-gray-100",
        dot: "bg-gray-500"
      }
    };

    const colors = colorMap[accent] || colorMap.gray;
    return {
      className: isActive ? colors.active : colors.inactive,
      dotColor: colors.dot
    };
  };

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }: { isActive: boolean }) => {
        const { className } = getColors(isActive);
        return `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 border font-medium ${className}`;
      }}
    >
      {({ isActive }: { isActive: boolean }) => {
        const { dotColor } = getColors(isActive);
        return (
          <>
            <span className={`h-2 w-2 rounded-full transition-colors ${dotColor}`} />
            <span className="text-sm">{children}</span>
          </>
        );
      }}
    </NavLink>
  );
}

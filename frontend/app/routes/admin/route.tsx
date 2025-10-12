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
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="w-72 bg-white border-r border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CH</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
                <p className="text-sm text-slate-500">Cloth Haven</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
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

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="px-3 pb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-1">
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
        active: "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500",
        inactive: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
        dot: "bg-emerald-500"
      },
      blue: {
        active: "bg-blue-50 text-blue-700 border-r-2 border-blue-500",
        inactive: "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
        dot: "bg-blue-500"
      },
      purple: {
        active: "bg-purple-50 text-purple-700 border-r-2 border-purple-500",
        inactive: "text-slate-600 hover:bg-purple-50 hover:text-purple-700",
        dot: "bg-purple-500"
      },
      indigo: {
        active: "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500",
        inactive: "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
        dot: "bg-indigo-500"
      },
      violet: {
        active: "bg-violet-50 text-violet-700 border-r-2 border-violet-500",
        inactive: "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
        dot: "bg-violet-500"
      },
      orange: {
        active: "bg-orange-50 text-orange-700 border-r-2 border-orange-500",
        inactive: "text-slate-600 hover:bg-orange-50 hover:text-orange-700",
        dot: "bg-orange-500"
      },
      green: {
        active: "bg-green-50 text-green-700 border-r-2 border-green-500",
        inactive: "text-slate-600 hover:bg-green-50 hover:text-green-700",
        dot: "bg-green-500"
      },
      cyan: {
        active: "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-500",
        inactive: "text-slate-600 hover:bg-cyan-50 hover:text-cyan-700",
        dot: "bg-cyan-500"
      },
      gray: {
        active: "bg-slate-100 text-slate-700 border-r-2 border-slate-500",
        inactive: "text-slate-600 hover:bg-slate-50 hover:text-slate-700",
        dot: "bg-slate-500"
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
        return `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 font-medium ${className}`;
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

import Link from "next/link";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Package, 
  DollarSign, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/doctor/schedule", icon: Calendar },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Inventory", href: "/doctor/inventory", icon: Package },
    { name: "Finance", href: "/doctor/finance", icon: DollarSign },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-doctor text-white flex flex-col hidden md:flex shadow-2xl z-10">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Al-Shifa <span className="text-blue-200">Admin</span></h1>
          <p className="text-xs text-blue-300 mt-1">Dr. Portal v1.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-200 hover:text-white transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8">
           <h2 className="text-lg font-semibold text-slate-800">Clinic Overview</h2>
           <div className="flex items-center gap-4">
             <div className="text-right">
               <p className="text-sm font-bold text-slate-900">Dr. Arif Alvi</p>
               <p className="text-xs text-green-600 font-medium">Online • OPD 1</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-doctor/10 flex items-center justify-center text-doctor font-bold">DA</div>
           </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

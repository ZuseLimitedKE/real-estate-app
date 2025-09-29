/* eslint-disable @typescript-eslint/no-explicit-any */
// admin/src/components/layout/admin-layout.tsx
'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Building2, 
  Home, 
  Users, 
  Settings,
  Bell,
  User,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  session: any;
}

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard, color: "text-purple-400" },
  { title: "Agencies", url: "/admin/agencies", icon: Building2, color: "text-blue-400" },
  { title: "Properties", url: "/admin/properties", icon: Home, color: "text-green-400" },
  { title: "Users", url: "/admin/users", icon: Users, color: "text-pink-400" }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar with Fixed Toggle Button */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header with Toggle Button INSIDE */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border relative">
          <div className={cn("flex items-center gap-3 transition-all", sidebarOpen ? "opacity-100" : "opacity-0")}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Atria Africa</h2>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          
          {/* Toggle Button INSIDE the sidebar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-8 h-8 p-0 hover:bg-sidebar-hover hover:text-sidebar-hover-foreground transition-colors absolute -right-0.25 top-1/2 transform -translate-y-1/2 bg-sidebar border-2 border-sidebar-border shadow-lg"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    active
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-sidebar-foreground border-l-4 border-purple-500 shadow-lg"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
                  )}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  {/* Animated background effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500",
                    active ? "opacity-10" : "opacity-0 group-hover:opacity-5"
                  )} />
                  
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors z-10",
                    active ? "text-purple-400" : item.color,
                    sidebarOpen ? "" : "mx-auto"
                  )} />
                  
                  <span className={cn(
                    "transition-all duration-300 z-10",
                    sidebarOpen ? "opacity-100" : "opacity-0 lg:hidden",
                    active ? "font-semibold" : "font-medium"
                  )}>
                    {item.title}
                  </span>

                  {/* Hover effect */}
                  <div className={cn(
                    "",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )} />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-3 ">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@atriaafrica.com</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Enhanced Top Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <Button variant="ghost" size="sm" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 shadow-lg">
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3 hover:bg-primary/10 hover:text-primary transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-semibold text-foreground">Admin User</div>
                      <div className="text-xs text-muted-foreground">Administrator</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-card">
                  <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
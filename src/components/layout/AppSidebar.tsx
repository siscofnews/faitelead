import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/I18nProvider";

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  menuItems: MenuItem[];
  isSuperAdmin?: boolean;
}

const AppSidebar = ({ isOpen, onClose, menuItems, isSuperAdmin = false }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-50 hidden md:flex h-6 w-6 rounded-full border border-border bg-card shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <ScrollArea className="h-full py-4">
          {/* Super Admin Badge */}
          {isSuperAdmin && !collapsed && (
            <div className="mx-3 mb-4 p-3 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 shadow-lg border-2 border-amber-300/50">
              <div className="flex items-center gap-2 text-white">
                <Crown className="h-5 w-5 drop-shadow-md" />
                <div className="flex-1">
                  <h3 className="text-xs font-bold leading-tight tracking-wide drop-shadow">
                    {t("nav.super_admin_portal")}
                  </h3>
                  <p className="text-[10px] opacity-90 font-medium">
                    {t("nav.global_access")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isSuperAdmin && collapsed && (
            <div className="mx-2 mb-4 flex justify-center">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                <Crown className="h-5 w-5 text-white drop-shadow-md" />
              </div>
            </div>
          )}

          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              const linkContent = (
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-foreground")} />
                  {!collapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>

          {/* Bottom Section */}
          {!collapsed && (
            <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-hero text-primary-foreground">
              <h4 className="font-display font-semibold mb-1">{t("common.help_title")}</h4>
              <p className="text-xs opacity-90 mb-3">
                {t("common.help_desc")}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs font-medium"
                onClick={() => window.location.href = "/student/support"}
              >
                {t("common.contact_button")}
              </Button>
            </div>
          )}
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
};

export default AppSidebar;

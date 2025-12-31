import { Bell, Search, Menu, LogOut, User, Settings, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import faitelLogo from "@/assets/faitel-logo.png";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

const getRoleLabel = (role: string, t: (k: any) => string) => {
  const map: Record<string, keyof any> = {
    super_admin: "role_super_admin",
    admin: "role_admin",
    teacher: "role_teacher",
    director: "role_director",
    student: "role_student",
  }
  const key = map[role] || "role_student"
  return t(key as any)
};

const DashboardHeader = ({ userName, userRole = "student", onLogout, onMenuToggle }: DashboardHeaderProps) => {
  const { t } = useI18n()
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full bg-glass border-b border-border/50">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo & Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={faitelLogo}
              alt="FAITEL"
              className="h-10 w-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-primary">FAITELEAD</h1>
              <p className="text-xs text-muted-foreground">{t("common.ead_platform", { defaultValue: "Plataforma EAD" })}</p>
            </div>
          </Link>

          <Link to="/">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>{t("home")}</span>
            </Button>
          </Link>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(userRole, t)}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

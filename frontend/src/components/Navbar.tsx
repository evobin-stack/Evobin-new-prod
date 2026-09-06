import { Menu, Settings, Bell, LogOut, Shield, BarChart, Award, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useRealtime } from "../contexts/RealtimeContext";
import { toast } from "sonner";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useRealtime();

  // Public navigation (before login)
  const publicNavItems = [
    { label: t('nav.home'), value: "landing" },
    { label: t('nav.education'), value: "education" },
    { label: t('nav.events'), value: "events" },
    { label: t('nav.aboutUs'), value: "about" },
  ];

  // Role-specific navigation items
  const userNavItems = [
    { label: t('nav.dashboard'), value: "dashboard" },
    { label: t('nav.upload'), value: "upload" },
    { label: t('nav.education'), value: "education" },
    { label: t('nav.map'), value: "map" },
    { label: t('nav.rewards'), value: "rewards" },
    { label: t('nav.community'), value: "community" },
  ];

  const workerNavItems = [
    { label: t('nav.dashboard'), value: "dashboard" },
    { label: t('nav.map'), value: "map" },
    { label: t('nav.education'), value: "education" },
    { label: t('nav.dispatchHub'), value: "admin" },
  ];

  const organizationNavItems = [
    { label: t('nav.dashboard'), value: "dashboard" },
    { label: t('nav.upload'), value: "upload" },
    { label: t('nav.map'), value: "map" },
    { label: t('nav.education'), value: "education" },
    { label: t('nav.community'), value: "community" },
    { label: t('nav.corporatePortal'), value: "admin" },
  ];

  const adminNavItems = [
    { label: t('nav.dashboard'), value: "dashboard" },
    { label: t('nav.upload'), value: "upload" },
    { label: t('nav.map'), value: "map" },
    { label: t('nav.education'), value: "education" },
    { label: t('nav.community'), value: "community" },
    { label: t('nav.admin'), value: "admin" },
  ];

  const getAuthNavItems = () => {
    if (!user) return userNavItems;
    if (user.role === 'worker') return workerNavItems;
    if (user.role === 'organization') return organizationNavItems;
    if (user.role === 'admin') return adminNavItems;
    return userNavItems; // default for 'user' role
  };

  const moreNavItems = [
    { label: t('nav.education'), value: "education" },
    { label: t('nav.leaderboard'), value: "leaderboard" },
    { label: t('nav.events'), value: "events" },
    // analytics only for user and admin
    ...(user?.role === 'user' || user?.role === 'admin' ? [{ label: t('nav.analytics'), value: "analytics" }] : []),
  ];

  // Use role-appropriate nav items
  const navItems = isAuthenticated ? getAuthNavItems() : publicNavItems;

  const handleNavigate = (page: string) => {
    // Allow public navigation without authentication
    if (page === "landing" || page === "education" || page === "about" || page === "events") {
      onNavigate(page);
      setMobileMenuOpen(false);
      return;
    }

    // Check if user is authenticated for other pages
    if (!isAuthenticated) {
      // Redirect directly to login page
      onNavigate("login");
      setMobileMenuOpen(false);
      return;
    }

    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success(t('nav.logout') + " " + "successfully");
    onNavigate("landing");
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="w-full bg-white dark:bg-background border-b border-border px-2 md:px-4 py-1 sticky top-0 z-50 notranslate" translate="no">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => handleNavigate("landing")}
          className="flex items-center gap-2 flex-shrink-0"
        >
          {/* <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">E♻</span>
          </div>
          <span className="text-lg md:text-xl font-bold text-foreground hidden sm:inline">EvoBin</span> */}
          <div className="flex items-center">
  <img
    src="/assets/logoevobin.png" // <-- update with your logo file path
    alt="EvoBin Logo"
    className="w-40 h-25 object-contain"
  />
</div>

        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-6">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavigate(item.value)}
              className={`px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm ${
                currentPage === item.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <img
  src="/assets/logocmr.png"
  alt="Partner Logo"
  className="w-40 h-25 object-contain ml-auto hidden md:block"
/>

          <LanguageSwitcher />
          <ThemeToggle />
          
          {/* Notifications - Only show when authenticated */}
          {isAuthenticated && (
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate("notifications")}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {/* User Menu - Desktop */}
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex items-center gap-3 py-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                        {user.level && (
                          <Badge variant="outline" className="text-xs">
                            Level {user.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigate("profile")}>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('nav.profileSettings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("analytics")}>
                    <BarChart className="h-4 w-4 mr-2" />
                    {t('nav.analyticsReports')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("rewards")}>
                    <Award className="h-4 w-4 mr-2" />
                    {t('nav.rewards')} ({user.points || 0} pts)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("education")}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {t('nav.educationGuides')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("leaderboard")}>
                    {t('nav.leaderboard')}
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleNavigate("admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        {t('nav.adminPanel')}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => handleNavigate("login")} className="bg-primary hover:bg-primary/90 notranslate" translate="no">
                {t('nav.signIn')}
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-[280px] sm:w-[360px] overflow-y-auto notranslate" translate="no">
              <SheetHeader className="text-left">
                <SheetTitle>{t('nav.navigation')}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                
                {/* Language Switcher - Mobile */}
                <div className="flex items-center justify-between px-2 pb-2 border-b">
                  <span className="text-sm text-muted-foreground">{t('language.select')}</span>
                  <LanguageSwitcher />
                </div>

                {/* Show Sign In button at top for non-authenticated users on mobile */}
                {!isAuthenticated && (
                  <Button 
                    onClick={() => handleNavigate("login")} 
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {t('nav.signIn')}
                  </Button>
                )}

                {/* Main Navigation */}
                <div className="space-y-2">
                  <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('nav.navigation')}</h3>
                  {navItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleNavigate(item.value)}
                      className={`w-full px-4 py-2.5 rounded-lg transition-colors text-left text-sm font-medium ${
                        currentPage === item.value
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* More Options */}
                <div className="space-y-2 pt-2 border-t">
                  <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('nav.explore')}</h3>
                  {moreNavItems.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleNavigate(item.value)}
                        className={`w-full px-4 py-2.5 rounded-lg transition-colors text-left text-sm font-medium ${
                          currentPage === item.value
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>

                {/* Profile Section - Only show for authenticated users */}
                {isAuthenticated && user && (
                  <div className="space-y-2 pt-2 border-t mt-auto">
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('nav.account')}</h3>
                    <div className="px-3 py-2.5 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary text-white text-sm">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNavigate("profile")}
                      className="w-full px-4 py-2.5 rounded-lg transition-colors text-left hover:bg-secondary text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>{t('nav.profileSettings')}</span>
                      </div>
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavigate("admin")}
                        className="w-full px-4 py-2.5 rounded-lg transition-colors text-left hover:bg-secondary text-sm font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>{t('nav.adminPanel')}</span>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 rounded-lg transition-colors text-left hover:bg-destructive/10 text-destructive text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

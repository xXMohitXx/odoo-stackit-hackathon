import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Get search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchQuery(search);
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b border-border/50 glass-effect shadow-card sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover-lift">
              <h1 className="text-2xl font-bold text-gradient hover:scale-105 transition-transform">
                StackIt
              </h1>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
               <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background/80 transition-all"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                {/* Ask Question */}
                <Link to="/ask" className="hidden sm:block">
                  <Button variant="default" size="sm" className="interactive-scale">
                    Ask Question
                  </Button>
                </Link>
                {/* User Avatar and Logout */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="mt-3 sm:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background/80 transition-all"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Stethoscope, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  const location = useLocation();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
      else setUser(null);
    } catch {
      setUser(null);
    }
  }, [location]);

  const menuItems = [
    { name: "الرئيسية", path: "/" },
    { name: "الأطباء", path: "/doctors" },
    { name: "معامل التحاليل", path: "/labs" },
    { name: "المدارس والتأمين", path: "/schools-insurance" },
    { name: "اتصل بنا", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-card"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} className="p-2 bg-gradient-medical rounded-lg shadow-medical">
              <Stethoscope className="h-8 w-8 text-white" />
            </motion.div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-primary">صحتي</h1>
              <p className="text-sm text-muted-foreground">نظام الكشف الطبي</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                asChild
                className={`${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-medical"
                    : "hover:bg-medical-light-blue"
                } transition-all duration-300`}
              >
                <Link to={item.path} className="font-medium">
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="outline" className="hidden md:flex gap-2" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span>{user.full_name ?? user.email}</span>
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="hidden md:flex gap-2" asChild>
                <Link to="/auth">
                  <UserCircle className="h-5 w-5" />
                  الملف الشخصي
                </Link>
              </Button>
            )}

            <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col gap-2 pt-4">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  asChild
                  className={`justify-end ${
                    isActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-medical-light-blue"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to={item.path} className="w-full text-right">
                    {item.name}
                  </Link>
                </Button>
              ))}
              {user ? (
                <Button variant="outline" className="justify-end mt-2 gap-2" asChild>
                  <Link to="/auth" className="w-full text-right flex items-center justify-end gap-2">
                    <UserCircle className="h-5 w-5" />
                    <span>{user.full_name ?? user.email}</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" className="justify-end mt-2 gap-2" asChild>
                  <Link to="/auth" className="w-full text-right">
                    <UserCircle className="h-5 w-5" />
                    الملف الشخصي
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

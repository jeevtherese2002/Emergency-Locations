import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { MapPin, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2" onClick={scrollToTop}>
          <MapPin className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">EasyConnect</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a onClick={() => scrollToSection('about')} className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="hidden md:block">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              Get Started
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col space-y-6 mt-8">
                <a onClick={() => scrollToSection('features')} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a onClick={() => scrollToSection('how-it-works')} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
                <a onClick={() => scrollToSection('about')} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <div className="flex flex-col space-y-4 pt-6">
                  <Link to="/login">
                    <Button variant="ghost" className="justify-start text-lg w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
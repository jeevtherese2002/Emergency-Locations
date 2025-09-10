import { MapPin, Mail, Phone, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">EasyConnect</span>
            </div>
            <p className="text-muted-foreground">
              Your trusted emergency companion, connecting you with help when you need it most.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Report Issue</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Feedback</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Emergency</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Emergency: 911</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>help@easyconnect.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 EasyConnect. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="w-4 h-4 mx-1 text-emergency" /> for safer communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
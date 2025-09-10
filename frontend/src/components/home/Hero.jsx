import { Button } from "../ui/button";
import { MapPin, Clock, Shield } from "lucide-react";
import heroImage from "../../assets/images/hero.png";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Find Help,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Fast
                </span>
              </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  In emergencies, every second counts. EasyConnect shows your location and nearby emergency services as clear icons on an interactive map.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Services Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Trusted Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">GPS Accurate</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={heroImage} 
                alt="Emergency services visualization with mobile interface" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating elements for visual interest */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
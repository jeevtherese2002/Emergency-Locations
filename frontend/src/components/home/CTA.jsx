import { Button } from "../ui/button";
import { MapPin, ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-foreground/90"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-background mb-6">
            Your Emergency Companion
          </h2>
          <p className="text-xl text-background/80 mb-8 leading-relaxed">
            Quick, reliable, and made for everyone. EasyConnect is ready when you need it most. 
            Join thousands who trust us to connect them with emergency services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-background/20 text-foreground hover:bg-background/10 hover:text-background text-lg px-8 py-6"
            >
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          <div className="mt-8 text-background/60 text-sm">
            Available 24/7 • No subscription required • Trusted by communities
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default CTA;
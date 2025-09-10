import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { MapPin, Search, Phone } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: MapPin,
    title: "Open EasyConnect",
    description: "Launch the app and allow location access for the most accurate results near you."
  },
  {
    step: "02",
    icon: Search,
    title: "Search or Browse",
    description: "Use the interactive map or search function to find emergency services by type or location."
  },
  {
    step: "03",
    icon: Phone,
    title: "Connect Instantly",
    description: "Tap any emergency service icon to get contact information and connect immediately."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How EasyConnect Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting help has never been simpler. Just three steps between you and emergency assistance.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="text-center border-border/50 hover:border-primary/20 hover:shadow-elegant transition-all duration-300 group">
              <CardContent className="pt-8 pb-8">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Try EasyConnect Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
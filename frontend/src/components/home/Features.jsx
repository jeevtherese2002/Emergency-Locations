import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MapPin, Search, Clock, Users, Shield, MessageSquare } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Interactive Emergency Map",
    description: "See your location and nearby emergency services as clear icons - police, hospitals, fire stations - all at a glance."
  },
  {
    icon: Search,
    title: "Smart Location Search",
    description: "Search for emergency services by location, type, or specific needs. Find exactly what you need, when you need it."
  },
  {
    icon: Clock,
    title: "Real-time Availability",
    description: "Get up-to-date information about service availability, contact details, and response times in your area."
  },
  {
    icon: Users,
    title: "Community Feedback",
    description: "Share and read reviews from other users to help everyone make informed decisions about emergency services."
  },
  {
    icon: Shield,
    title: "Verified Services",
    description: "All emergency services are verified and regularly updated to ensure you're getting accurate, trustworthy information."
  },
  {
    icon: MessageSquare,
    title: "Instant Contact",
    description: "Get contact details instantly with one-click calling. See emergency services as clear icons on your map."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need in an Emergency
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            EasyConnect brings together all the tools and information you need to find help quickly and reliably.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 hover:border-primary/20 hover:shadow-elegant transition-all duration-300 group"
            >
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
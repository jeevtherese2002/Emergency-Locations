import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MapPin, Users, Shield, Clock } from "lucide-react";

const About = () => {
  return (
    <section className="py-24 bg-muted/30" id="about">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            About EasyConnect
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing emergency response by connecting people with local emergency services instantly and efficiently.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Our Mission</h3>
              <p className="text-muted-foreground text-lg mb-4">
                EasyConnect was born from the simple belief that in times of emergency, every second counts. 
                We've built a platform that eliminates confusion and connects you directly with the help you need.
              </p>
              <p className="text-muted-foreground text-lg">
                Whether you're facing a medical emergency, need police assistance, or require fire services, 
                our platform ensures you get connected to the right local emergency services quickly and efficiently.
              </p>
            </div>
            <div className="bg-gradient-primary rounded-2xl p-8 text-primary-foreground">
              <h4 className="text-xl font-bold mb-4">Our Promise</h4>
              <p className="opacity-90">
                To provide a reliable, fast, and user-friendly emergency connection service that works when you need it most.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-12">Our Core Values</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every second matters in an emergency. We prioritize speed in every aspect of our service.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Reliability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our platform is built to work when you need it most, with 99.9% uptime guarantee.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Precision</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accurate location services ensure emergency responders reach you as quickly as possible.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We believe in building safer communities through better emergency response connections.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-subtle rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Always available when emergencies strike</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">&lt;30s</div>
              <p className="text-muted-foreground">Average connection time to emergency services</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">Partner emergency service providers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
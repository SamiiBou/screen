import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDemo } from "@/components/ui/aceternity-card";

export default function UIShowcasePage() {
  return (
    <div 
      className="min-h-screen p-8"
      style={{
        backgroundColor: '#f8fafc !important',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{
              color: '#1a1a1a !important',
              fontWeight: '700 !important',
              letterSpacing: '-0.025em !important'
            }}
          >
            UI Component Showcase
          </h1>
          <p 
            className="text-xl max-w-3xl mx-auto mb-8"
            style={{
              color: '#6b7280 !important',
              lineHeight: '1.6 !important'
            }}
          >
            Combining the power of shadcn/ui with the beauty of Aceternity UI
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge 
              variant="secondary" 
              className="text-sm px-4 py-2"
              style={{
                backgroundColor: '#007AFF !important',
                color: '#ffffff !important'
              }}
            >
              shadcn/ui
            </Badge>
            <Badge 
              variant="secondary" 
              className="text-sm px-4 py-2"
              style={{
                backgroundColor: '#34D399 !important',
                color: '#ffffff !important'
              }}
            >
              Aceternity UI
            </Badge>
            <Badge 
              variant="secondary" 
              className="text-sm px-4 py-2"
              style={{
                backgroundColor: '#F59E0B !important',
                color: '#ffffff !important'
              }}
            >
              Next.js 15
            </Badge>
            <Badge 
              variant="secondary" 
              className="text-sm px-4 py-2"
              style={{
                backgroundColor: '#8B5CF6 !important',
                color: '#ffffff !important'
              }}
            >
              Tailwind CSS
            </Badge>
          </div>
        </div>

        {/* Aceternity UI Section */}
        <section>
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: '#1a1a1a !important',
              fontWeight: '600 !important'
            }}
          >
            Aceternity UI Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardDemo />
            <CardDemo />
            <CardDemo />
          </div>
        </section>

        {/* shadcn/ui Section */}
        <section>
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: '#1a1a1a !important',
              fontWeight: '600 !important'
            }}
          >
            shadcn/ui Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Standard Card */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>
                  This is a standard shadcn/ui card component with clean design.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="mt-1"
                    />
                  </div>
                  <Button className="w-full">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Modern features built with shadcn/ui components.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>TypeScript Support</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Responsive Design</span>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common actions with beautiful button variants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="default">
                    Primary Action
                  </Button>
                  <Button className="w-full" variant="secondary">
                    Secondary Action
                  </Button>
                  <Button className="w-full" variant="outline">
                    Outline Action
                  </Button>
                  <Button className="w-full" variant="ghost">
                    Ghost Action
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Combined Section */}
        <section>
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: '#1a1a1a !important',
              fontWeight: '600 !important'
            }}
          >
            Best of Both Worlds
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Aceternity Card */}
            <div>
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: '#1a1a1a !important' }}
              >
                Aceternity UI - Interactive Cards
              </h3>
              <CardDemo />
            </div>

            {/* Right: shadcn/ui Form */}
            <div>
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: '#1a1a1a !important' }}
              >
                shadcn/ui - Contact Form
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Send us a message and we'll get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <textarea 
                        id="message"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Your message here..."
                      />
                    </div>
                    <Button className="w-full">
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p 
            className="text-lg"
            style={{
              color: '#6b7280 !important'
            }}
          >
            Built with ❤️ using Next.js, shadcn/ui, and Aceternity UI
          </p>
        </div>

      </div>
    </div>
  );
} 
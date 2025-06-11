import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { FranzAILogo } from "@/components/franzai-logo";
import { ArrowRight, FileText, Sparkles, Wand2, Brain, Layers, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const features = [
    {
      icon: Wand2,
      title: "AI-Powered Workflows",
      description: "Transform ideas into polished documents with intelligent multi-step guidance"
    },
    {
      icon: Brain,
      title: "Smart Content Generation", 
      description: "Powered by advanced AI models for natural, context-aware writing"
    },
    {
      icon: Layers,
      title: "Structured Creation",
      description: "Build documents step-by-step with dependencies and smart validation"
    }
  ];

  const benefits = [
    "SEO-optimized content creation",
    "Recipe and article workflows",
    "Real-time collaboration ready",
    "Export to multiple formats"
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-8">
            <FranzAILogo size="lg" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
            Write Better, Faster with{" "}
            <span className="text-blue-600">AI Guidance</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create professional documents through intelligent workflows. 
            From SEO articles to recipes, let AI help you craft perfect content every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Link 
                href="/dashboard"
                id="home-get-started-button"
                data-testid="home-get-started-button"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link 
                href="/login"
                id="home-login-button"
                data-testid="home-login-button"
              >
                Sign In
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Export anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything you need to write professionally
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={cn(
                  "flex flex-col items-center text-center p-6 rounded-lg",
                  "bg-background border hover:shadow-md transition-shadow"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Benefits List */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to transform your writing?
          </h2>
          <p className="text-muted-foreground">
            Join writers who are creating better content with AI assistance.
          </p>
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Link href="/dashboard">
              <FileText className="mr-2 h-5 w-5" />
              Start Writing Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
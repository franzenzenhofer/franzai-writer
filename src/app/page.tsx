import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { FranzAILogo } from "@/components/franzai-logo";
import { ArrowRight, FileText, Sparkles, Wand2, Brain, Layers } from "lucide-react";
import Link from "next/link";

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

  return (
    <div>
      {/* Hero Section - Top Aligned with More Breathing Room */}
      <section className="px-6 py-12">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          
          {/* Logo - Centered */}
          <div className="flex justify-center mb-8">
            <FranzAILogo size="lg" />
          </div>
          
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Write Better, Faster with{" "}
              <span className="text-blue-600">AI Guidance</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto">
              Create professional documents through intelligent workflows. 
              From SEO articles to recipes, let AI help you craft perfect content.
            </p>
          </div>

          {/* Buttons - Centered */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Try it out
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              Free to start • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - With More Breathing Room */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Everything you need to write professionally
          </h2>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center space-y-4 p-6 bg-white rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Benefits - With More Space */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>SEO-optimized content</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Multiple workflows</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Export ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - With More Breathing Room */}
      <section className="px-6 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">
            Ready to start writing?
          </h2>
          <Button asChild>
            <Link href="/dashboard">
              <FileText className="mr-2 h-4 w-4" />
              Start Writing Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
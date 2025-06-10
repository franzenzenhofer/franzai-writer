import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <BrainCircuit className="w-24 h-24 text-primary mb-6" />
      <h1 className="text-5xl font-bold font-headline mb-4">
        Welcome to {siteConfig.name}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        {siteConfig.description} Craft compelling documents effortlessly with our AI-powered, multi-step wizard.
      </p>
      <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/dashboard">
          <Zap className="mr-2 h-5 w-5" />
          Get Started
        </Link>
      </Button>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold font-headline mb-2">Intuitive Wizard</h3>
          <p className="text-sm text-muted-foreground">Break down complex content creation into manageable, AI-assisted steps.</p>
        </div>
        <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold font-headline mb-2">Powerful AI</h3>
          <p className="text-sm text-muted-foreground">Leverage OpenAI and Gemini models for drafting, analysis, and refinement.</p>
        </div>
        <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold font-headline mb-2">Seamless Experience</h3>
          <p className="text-sm text-muted-foreground">Enjoy a modern, responsive interface designed for efficiency and creativity.</p>
        </div>
      </div>
    </div>
  );
}

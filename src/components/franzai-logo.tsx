import { cn } from "@/lib/utils";

interface FranzAILogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FranzAILogo({ className, size = "md" }: FranzAILogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "font-bold font-headline tracking-tight",
        sizeClasses[size]
      )}>
        <span className="text-blue-600">Franz</span>
        <span className="text-gray-700">AI</span>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full bg-blue-600 animate-pulse",
        size === "sm" && "w-1.5 h-1.5",
        size === "lg" && "w-3 h-3"
      )} />
      <div className={cn(
        "font-bold font-headline tracking-tight",
        sizeClasses[size],
        "text-gray-700"
      )}>
        Writer
      </div>
    </div>
  );
}
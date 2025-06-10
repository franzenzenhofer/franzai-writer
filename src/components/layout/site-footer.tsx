import { siteConfig } from "@/config/site";
import { Github } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href={siteConfig.links.github} // Assuming a link to your profile or project
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            YourName/Team
          </a>
          . The source code is available on{" "}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            GitHub
          </a>
          .
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <Github className="h-5 w-5 hover:text-primary" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

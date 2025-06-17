
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Franz AI Writer",
  description:
    "Generate documents using an AI-powered, multi-step wizard.",
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "AI Logs",
      href: "/debug/ai-log-viewer",
    },
  ],
  links: {
    github: "https://github.com/your-repo/franz-ai-writer", // Updated placeholder
  },
};

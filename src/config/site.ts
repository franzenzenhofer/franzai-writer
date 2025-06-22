
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Franz AI Writer",
  description:
    "Generate documents using an AI-powered, multi-step wizard.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Documents",
      href: "/documents",
    },
    {
      title: "AI Logs",
      href: "/admin/debug/ai-log-viewer",
    },
  ],
  links: {
    website: "https://www.franzai.com",
  },
};

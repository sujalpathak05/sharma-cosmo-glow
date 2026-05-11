export const sectionRoutes = {
  home: "/",
  about: "/about",
  services: "/services",
  appointment: "/appointment",
  gallery: "/gallery",
  testimonials: "/testimonials",
  blogs: "/blogs",
  contact: "/contact",
} as const;

export type SectionId = keyof typeof sectionRoutes;

export const sectionPaths = Object.values(sectionRoutes).filter((path) => path !== "/");

const pathToSectionId: Record<string, SectionId> = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/appointment": "appointment",
  "/gallery": "gallery",
  "/testimonials": "testimonials",
  "/blogs": "blogs",
  "/contact": "contact",
};

export const getSectionIdForPath = (pathname: string) => pathToSectionId[pathname];

export const getPathForHash = (hash: string) => {
  const sectionId = hash.replace(/^#/, "") as SectionId;
  return sectionRoutes[sectionId];
};

export const scrollToSectionId = (sectionId: SectionId, behavior: ScrollBehavior = "smooth") => {
  if (typeof window === "undefined") return false;

  if (sectionId === "home") {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const target = document.getElementById(sectionId);
  if (!target) return false;

  const headerOffset = 88;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, targetTop), behavior });
  return true;
};

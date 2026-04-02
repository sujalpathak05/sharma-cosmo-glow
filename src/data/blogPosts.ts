import { acneTreatmentGuide } from "@/data/blogPosts/acneTreatmentGuide";
import { antiAgingGuide } from "@/data/blogPosts/antiAgingGuide";
import { hairFallGuide } from "@/data/blogPosts/hairFallGuide";
import { laserVsWaxingGuide } from "@/data/blogPosts/laserVsWaxingGuide";

import type { BlogPost } from "@/data/blogPostTypes";

export type { BlogFaq, BlogPost, BlogSection } from "@/data/blogPostTypes";

export const blogPosts: BlogPost[] = [
  acneTreatmentGuide,
  hairFallGuide,
  laserVsWaxingGuide,
  antiAgingGuide,
];

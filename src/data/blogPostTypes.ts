export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  category: "Hair Treatment" | "Skin Treatment";
  readTime: string;
  title: string;
  summary: string;
  metaDescription: string;
  publishedAt: string;
  publishedLabel: string;
  updatedAt: string;
  highlights: string[];
  keywords: string[];
  intro: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
};

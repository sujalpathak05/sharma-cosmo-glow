export type TreatmentFaq = {
  question: string;
  answer: string;
};

export type TreatmentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Treatment = {
  slug: string;
  category: "Skin Treatment" | "Hair Treatment" | "Aesthetic Treatment";
  title: string;
  pageTitle: string;
  tagline: string;
  metaDescription: string;
  keywords: string[];
  summary: string;
  highlights: string[];
  intro: string[];
  sections: TreatmentSection[];
  faqs: TreatmentFaq[];
};

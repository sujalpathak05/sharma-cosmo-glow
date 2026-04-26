export type SeoKeywordCluster = {
  title: string;
  description: string;
  keywords: string[];
};

export type SeoContentBlock = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export const homeKeywordClusters: SeoKeywordCluster[] = [
  {
    title: "Local intent searches",
    description:
      "These are the location-driven phrases patients often use when they are actively looking for a nearby clinic.",
    keywords: [
      "skin clinic in Delhi",
      "cosmetic clinic near me",
      "laser hair removal Delhi",
      "acne treatment Delhi",
      "best dermatologist Delhi",
    ],
  },
  {
    title: "Service-based searches",
    description:
      "These keywords usually come from patients who already know the procedure they want to compare or book.",
    keywords: [
      "PRP hair treatment",
      "chemical peel treatment",
      "psoriasis treatment",
      "alopecia treatment",
      "vitiligo treatment",
      "botox clinic",
      "anti-aging treatment",
    ],
  },
  {
    title: "Long-form content themes",
    description:
      "Detailed educational pages help answer high-intent questions and build topical authority for skin and hair care.",
    keywords: [
      "Acne treatment guide",
      "Hair fall causes and solutions",
      "Psoriasis treatment planning",
      "Vitiligo treatment options",
      "Laser vs waxing comparison",
      "Anti-aging tips",
    ],
  },
];

export const homeSeoBlocks: SeoContentBlock[] = [
  {
    title: "A Noida skin clinic that is easy for Delhi NCR patients to reach",
    paragraphs: [
      "Many people start with searches like skin clinic in Delhi or cosmetic clinic near me because they want expert care close to home, transparent pricing, and a treatment plan that feels trustworthy from the first consultation. Sharma Cosmo Clinic is located in Noida, but the clinic regularly serves patients from across Delhi NCR who prefer a doctor-led setup with clear diagnosis, practical advice, and continuity of care after the first visit.",
      "That local convenience matters because skin and hair treatment usually works best when follow-up is easy. Acne, pigmentation, psoriasis, vitiligo, hair fall, alopecia, laser sessions, anti-aging care, and procedure aftercare rarely end in a single visit. Patients comparing options around Delhi often choose a nearby clinic that is accessible, calm, and consistent, especially when they want a single place to manage consultation, treatment planning, and progress review without jumping between multiple providers.",
    ],
    bullets: [
      "Noida clinic location with easy access for Delhi NCR patients",
      "Doctor-led consultation before any procedure is recommended",
      "Focused on skin, hair, laser, and aesthetic treatment planning",
    ],
  },
  {
    title: "Acne treatment and chemical peel planning should start with the cause, not the trend",
    paragraphs: [
      "Patients searching acne treatment Delhi are often dealing with more than one issue at the same time: active pimples, painful inflammation, post-acne marks, oily skin, enlarged pores, or a damaged skin barrier from random products. A good plan separates those concerns instead of treating everything with one harsh routine. That is why acne management usually begins with understanding whether the breakout pattern is hormonal, cosmetic-related, stress-linked, inflammatory, or mixed.",
      "Chemical peel treatment can be useful when the goal is oil control, smoother texture, tan reduction, or gradual improvement in superficial acne marks, but not every patient needs the same peel strength or schedule. At Sharma Cosmo Clinic, treatment decisions are matched to skin sensitivity, pigmentation risk, downtime comfort, and long-term maintenance. This helps patients avoid aggressive experimentation and move toward safer improvement that looks natural in everyday light rather than only on treatment day.",
    ],
    bullets: [
      "Assessment for active acne, acne marks, pigmentation, and sensitivity",
      "Chemical peel treatment selected according to skin type and concern",
      "Clear home-care guidance to support in-clinic improvement",
    ],
  },
  {
    title: "PRP hair treatment works best when the hair fall diagnosis is clear",
    paragraphs: [
      "Hair loss is one of the most common reasons patients visit a skin and hair clinic, but PRP hair treatment should not be treated like a shortcut or a universal answer. Thinning can be driven by stress, genetics, dandruff, postpartum shedding, nutritional deficiency, thyroid changes, or scalp inflammation. When the reason behind hair fall is not identified, even advanced procedures can feel disappointing because the trigger keeps working in the background.",
      "A better approach is to combine diagnosis, scalp assessment, and realistic treatment sequencing. PRP hair treatment is often most useful in early to moderate thinning when follicles are still active and the goal is to strengthen weak roots, improve density, and slow progression. Some patients also benefit from scalp care, medicines, mesotherapy, nutrition correction, or habit changes. The strongest plans are usually the ones that explain what the treatment can do, what it cannot do, and how long results genuinely take.",
    ],
    bullets: [
      "Hair fall planning that looks at scalp health, pattern, and triggers",
      "PRP hair treatment used where it is most likely to help",
      "Long-term maintenance explained before treatment starts",
    ],
  },
  {
    title: "Laser hair removal, botox, and anti-aging treatment need a conservative strategy",
    paragraphs: [
      "People who search laser hair removal Delhi or botox clinic options are usually not just comparing price. They want to know whether the procedure is suitable for Indian skin, whether downtime is manageable, and whether the results will look refined instead of overdone. A conservative, step-by-step strategy matters because aesthetic procedures work best when skin tone, treatment history, expectations, and recovery comfort are all considered before energy-based treatment or injectables are planned.",
      "Anti-aging treatment is not only about wrinkles. Patients often want support with dullness, dehydration, early laxity, uneven tone, or tired-looking skin before lines become deep. A strong anti-aging plan may include sunscreen discipline, skincare upgrades, chemical peels, laser-based correction, hydration-focused procedures, and botox clinic consultations when expression lines need targeted softening. The goal is not dramatic change. The goal is healthier skin quality and natural-looking improvement that still feels like you.",
    ],
    bullets: [
      "Laser hair removal planned according to skin tone and hair pattern",
      "Botox clinic consultations focused on subtle and natural-looking outcomes",
      "Anti-aging treatment plans that balance prevention, correction, and maintenance",
    ],
  },
  {
    title: "What patients usually mean when they search for the best dermatologist in Delhi",
    paragraphs: [
      "Searches for the best dermatologist Delhi often reflect trust questions more than ranking questions. Patients usually want someone who will explain the diagnosis clearly, avoid overselling treatment, and suggest a plan that fits both the condition and the budget. In real life, most patients are not only comparing titles. They are comparing whether the clinic listens, whether follow-up is available, whether the procedure environment feels professional, and whether the recommendations remain consistent from one visit to the next.",
      "Sharma Cosmo Clinic positions itself around that decision-making process. The clinic does not need to make exaggerated promises to be useful. Instead, the focus stays on doctor-led planning, transparent communication, and practical next steps for acne, pigmentation, hair fall, PRP, laser procedures, chemical peel treatment, and anti-aging care. For patients across Noida and Delhi NCR, that clarity often becomes the deciding factor because confident treatment choices usually come from understanding, not pressure.",
    ],
    bullets: [
      "Clear consultation and treatment planning before commitment",
      "Realistic timelines and maintenance discussed openly",
      "A patient experience built around continuity rather than one-time procedures",
    ],
  },
];

export const homeFaqs: SeoFaq[] = [
  {
    question: "Are you a skin clinic in Delhi?",
    answer:
      "Sharma Cosmo Clinic is located in Noida, Uttar Pradesh, and serves patients from across Delhi NCR. That means people travelling from Delhi, New Delhi, Ghaziabad, and nearby areas can still visit the clinic for skin, hair, laser, and anti-aging consultations while keeping the location claim accurate.",
  },
  {
    question: "If I am searching for a cosmetic clinic near me, can I book from Delhi?",
    answer:
      "Yes. Many patients searching for a cosmetic clinic near me in Delhi NCR prefer a nearby Noida clinic that is easy to revisit for follow-up, PRP sessions, chemical peels, laser appointments, and aftercare reviews. The clinic location is in Noida, but bookings are open to Delhi NCR patients.",
  },
  {
    question: "Do you offer acne treatment Delhi NCR patients can visit for active acne and acne marks?",
    answer:
      "Yes. The clinic treats active acne, post-acne marks, oily skin concerns, and related pigmentation issues for patients from Noida and Delhi NCR. Treatment may include consultation, topical guidance, oral support where needed, chemical peels, and skin barrier-focused routines depending on the acne pattern.",
  },
  {
    question: "Is PRP hair treatment available at Sharma Cosmo Clinic?",
    answer:
      "Yes. PRP hair treatment is offered after scalp evaluation and is usually recommended when follicles are still active and the goal is to strengthen weak roots, reduce shedding, and improve density over time. Patients are also guided about whether PRP should be combined with scalp care, medicines, or maintenance sessions.",
  },
  {
    question: "Do you provide laser hair removal Delhi NCR patients can access from Noida?",
    answer:
      "Yes. The clinic offers laser-based hair reduction and related aesthetic laser planning for patients visiting from Noida and nearby Delhi NCR locations. Suitability depends on skin tone, hair thickness, treatment area, and the number of sessions needed for durable reduction.",
  },
  {
    question: "What does chemical peel treatment help with?",
    answer:
      "Chemical peel treatment is commonly used for acne marks, superficial pigmentation, dullness, tanning, texture irregularity, and oil control. The best peel depends on skin sensitivity, recovery comfort, and the specific concern being treated, which is why assessment is important before choosing the procedure.",
  },
  {
    question: "Do you work like a botox clinic for anti-aging concerns?",
    answer:
      "Yes, the clinic provides botox consultations as part of broader anti-aging treatment planning. The emphasis stays on conservative, natural-looking correction for expression lines and facial balance, rather than overdone results that change facial character too aggressively.",
  },
  {
    question: "How can I choose between anti-aging treatment options?",
    answer:
      "The right anti-aging treatment depends on whether the main concern is fine lines, dullness, dehydration, uneven tone, texture, or loss of firmness. Some patients need better home care and sunscreen first, while others may benefit from peels, injectables, laser support, or maintenance plans designed around age, skin condition, and recovery tolerance.",
  },
];

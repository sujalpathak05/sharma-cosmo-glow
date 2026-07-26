import { acneTreatment } from "@/data/treatments/acneTreatment";
import { chemicalPeelTreatment } from "@/data/treatments/chemicalPeelTreatment";
import { prpHairTreatment } from "@/data/treatments/prpHairTreatment";
import { alopeciaTreatment } from "@/data/treatments/alopeciaTreatment";
import { psoriasisTreatment } from "@/data/treatments/psoriasisTreatment";
import { vitiligoTreatment } from "@/data/treatments/vitiligoTreatment";
import { laserHairRemoval } from "@/data/treatments/laserHairRemoval";
import { botoxAntiAgingTreatment } from "@/data/treatments/botoxAntiAgingTreatment";
import { aestheticConsultations } from "@/data/treatments/aestheticConsultations";

import type { Treatment } from "@/data/treatmentTypes";

export type { Treatment, TreatmentFaq, TreatmentSection } from "@/data/treatmentTypes";

export const treatments: Treatment[] = [
  acneTreatment,
  chemicalPeelTreatment,
  prpHairTreatment,
  alopeciaTreatment,
  psoriasisTreatment,
  vitiligoTreatment,
  laserHairRemoval,
  botoxAntiAgingTreatment,
  aestheticConsultations,
];

export const treatmentSlugByTitle: Record<string, string> = treatments.reduce(
  (map, treatment) => {
    map[treatment.title] = treatment.slug;
    return map;
  },
  {} as Record<string, string>
);

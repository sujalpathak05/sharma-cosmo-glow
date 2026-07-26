import { supabase } from "@/integrations/supabase/client";
import { normalizeIndianPhone } from "@/lib/hairTestStore";

export { normalizeIndianPhone } from "@/lib/hairTestStore";

export type SkinTestGender = "Female" | "Male" | "Non-binary" | "Prefer not to say";
export type SkinTestAffectedArea = "Face";
export type SkinTestSkinType = "Oily" | "Dry" | "Combination" | "Sensitive" | "Normal";
export type SkinTestYesNo = "Yes" | "No";

export type SkinTestConditionKey =
  | "acne_breakout_prone_skin"
  | "post_acne_marks_pigmentation"
  | "melasma_hyperpigmentation"
  | "sensitive_reactive_skin"
  | "scaly_patchy_skin"
  | "pigment_loss_patches"
  | "early_ageing_dull_skin"
  | "oily_congested_skin"
  | "dry_dehydrated_skin"
  | "general_skin_care";

export type SkinTestAssessment = {
  conditionKey: SkinTestConditionKey;
  conditionName: string;
  confidenceLabel: string;
  issueSummary: string;
  kitRecommendation: string[];
  testsRecommended: string[];
  urgencyNote: string;
};

export type SkinTestFormValues = {
  name: string;
  phone: string;
  age: string;
  gender: SkinTestGender | "";
  skinConcerns: string[];
  affectedArea: SkinTestAffectedArea | "";
  issueDuration: string;
  skinType: SkinTestSkinType | "";
  sunExposure: string;
  waterIntake: string;
  dietType: string;
  stressLevel: string;
  sleepQuality: string;
  knownAllergies: string[];
  currentSkincareUse: SkinTestYesNo | "";
  currentSkincareProducts: string;
  currentMedicineUse: SkinTestYesNo | "";
  currentMedicines: string;
  medicalCondition: string;
};

export type SkinTestPhotoMeta = {
  name: string;
  size: number;
  type: string;
};

export type SkinTestRecord = {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: SkinTestGender;
  skin_concerns: string[];
  affected_area: SkinTestAffectedArea;
  issue_duration: string;
  skin_type: SkinTestSkinType;
  sun_exposure: string;
  water_intake: string;
  diet_type: string;
  stress_level: string;
  sleep_quality: string;
  known_allergies: string[];
  current_skincare_use: SkinTestYesNo;
  current_skincare_products: string | null;
  current_medicine_use: SkinTestYesNo;
  current_medicines: string | null;
  medical_condition: string | null;
  likely_condition: string;
  assessment_summary: string;
  kit_recommendation: string[];
  photo_path: string | null;
  photo_name: string | null;
  photo_size: number | null;
  photo_type: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
  source: "cloud" | "local";
};

type SkinTestCloudPayload = Omit<SkinTestRecord, "source" | "created_at"> & {
  created_at?: string;
};

type SkinTestTableClient = {
  from: (table: "skin_test_submissions") => {
    insert: (payload: SkinTestCloudPayload) => Promise<{ error: { message?: string } | null }>;
  };
};

export type SubmitSkinTestInput = SkinTestFormValues & {
  photo?: File | null;
};

export type SubmitSkinTestResult =
  | { mode: "invalid" }
  | { mode: "cloud" | "local"; id: string; assessment: SkinTestAssessment; photoUrl: string | null };

const LOCAL_SKIN_TESTS_KEY = "sharma-cosmo-local-skin-tests";
const LOCAL_SKIN_TESTS_EVENT = "skin-tests:local-updated";
const SKIN_TEST_PHOTO_BUCKET = "skin-test-photos";
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitLocalSkinTestsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCAL_SKIN_TESTS_EVENT));
  }
};

const createSkinTestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "skin-photo";

const sanitizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];

const sanitizeSkinTestRecords = (value: unknown): SkinTestRecord[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Partial<SkinTestRecord> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createSkinTestId(),
      name: typeof item.name === "string" ? item.name : "",
      phone: typeof item.phone === "string" ? item.phone : "",
      age: typeof item.age === "number" ? item.age : Number(item.age) || 0,
      gender: typeof item.gender === "string" ? (item.gender as SkinTestGender) : "Prefer not to say",
      skin_concerns: sanitizeStringArray(item.skin_concerns),
      affected_area: typeof item.affected_area === "string" ? (item.affected_area as SkinTestAffectedArea) : "Face",
      issue_duration: typeof item.issue_duration === "string" ? item.issue_duration : "",
      skin_type: typeof item.skin_type === "string" ? (item.skin_type as SkinTestSkinType) : "Normal",
      sun_exposure: typeof item.sun_exposure === "string" ? item.sun_exposure : "",
      water_intake: typeof item.water_intake === "string" ? item.water_intake : "",
      diet_type: typeof item.diet_type === "string" ? item.diet_type : "",
      stress_level: typeof item.stress_level === "string" ? item.stress_level : "",
      sleep_quality: typeof item.sleep_quality === "string" ? item.sleep_quality : "",
      known_allergies: sanitizeStringArray(item.known_allergies),
      current_skincare_use: (item.current_skincare_use === "Yes" ? "Yes" : "No") as SkinTestYesNo,
      current_skincare_products: typeof item.current_skincare_products === "string" ? item.current_skincare_products : null,
      current_medicine_use: (item.current_medicine_use === "Yes" ? "Yes" : "No") as SkinTestYesNo,
      current_medicines: typeof item.current_medicines === "string" ? item.current_medicines : null,
      medical_condition: typeof item.medical_condition === "string" ? item.medical_condition : null,
      likely_condition: typeof item.likely_condition === "string" ? item.likely_condition : "General skin care",
      assessment_summary: typeof item.assessment_summary === "string" ? item.assessment_summary : "",
      kit_recommendation: sanitizeStringArray(item.kit_recommendation),
      photo_path: typeof item.photo_path === "string" ? item.photo_path : null,
      photo_name: typeof item.photo_name === "string" ? item.photo_name : null,
      photo_size: typeof item.photo_size === "number" ? item.photo_size : null,
      photo_type: typeof item.photo_type === "string" ? item.photo_type : null,
      status: (item.status === "contacted" || item.status === "closed" ? item.status : "new") as SkinTestRecord["status"],
      created_at: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
      source: "local" as const,
    }))
    .filter((item) => item.name && item.phone && item.age > 0 && item.skin_concerns.length > 0);
};

const writeLocalSkinTests = (records: SkinTestRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_SKIN_TESTS_KEY, JSON.stringify(records));
  emitLocalSkinTestsUpdated();
};

export const readLocalSkinTests = () => {
  if (!canUseStorage()) return [] as SkinTestRecord[];

  try {
    const raw = window.localStorage.getItem(LOCAL_SKIN_TESTS_KEY);
    if (!raw) return [];
    return sanitizeSkinTestRecords(JSON.parse(raw));
  } catch {
    return [];
  }
};

const saveLocalSkinTest = (record: SkinTestRecord) => {
  const existing = readLocalSkinTests();
  writeLocalSkinTests([{ ...record, source: "local" }, ...existing]);
  return record;
};

const removeLocalSkinTest = (id: string) => {
  const existing = readLocalSkinTests();
  writeLocalSkinTests(existing.filter((record) => record.id !== id));
};

export const validateSkinTestPhoto = (photo: File | null | undefined) => {
  if (!photo) return null;
  if (!ALLOWED_PHOTO_TYPES.has(photo.type)) return "Please upload a JPG, PNG, WEBP, HEIC, or HEIF image.";
  if (photo.size > MAX_PHOTO_BYTES) return "Please upload an image smaller than 8 MB.";
  return null;
};

const hasConcern = (input: SkinTestFormValues, token: string) =>
  input.skinConcerns.some((concern) => concern.toLowerCase().includes(token));

const assessmentMap: Record<SkinTestConditionKey, Omit<SkinTestAssessment, "conditionKey">> = {
  acne_breakout_prone_skin: {
    conditionName: "Acne and breakout-prone skin",
    confidenceLabel: "Likely active acne pattern",
    issueSummary:
      "Your answers suggest active breakouts, which can be linked to excess oil, clogged pores, hormones, or an unsuitable skincare routine. Active acne is usually treated before marks or scars are targeted.",
    kitRecommendation: [
      "A personalised acne-care kit with a gentle cleanser, oil-control and spot-correcting actives, and a barrier-safe moisturiser.",
      "Daily broad-spectrum sunscreen to prevent new breakouts from turning into dark marks.",
      "In-clinic options such as acne facials, targeted peels, or prescription care may be added after examination.",
    ],
    testsRecommended: ["Skin type and sensitivity check", "Acne severity grading", "Hormonal review if breakouts are recurring or jawline-focused"],
    urgencyNote: "If breakouts are painful, widespread, or leaving marks quickly, book a clinic review soon.",
  },
  post_acne_marks_pigmentation: {
    conditionName: "Post-acne marks and pigmentation",
    confidenceLabel: "Marks and dark spots from past acne",
    issueSummary:
      "Your answers point toward marks and dark spots left behind after acne rather than active breakouts. These usually respond well to consistent sun protection and mark-focused correction.",
    kitRecommendation: [
      "A personalised brightening kit with a gentle exfoliant, mark-fading actives, and daily sunscreen.",
      "Chemical peel sessions may be recommended in-clinic once your skin sensitivity is assessed.",
      "A barrier-repair moisturiser to keep the skin comfortable while marks fade.",
    ],
    testsRecommended: ["Skin type and pigment-risk check", "Mark vs scar assessment"],
    urgencyNote: "Marks fade gradually; a doctor-guided plan helps them fade faster and more evenly.",
  },
  melasma_hyperpigmentation: {
    conditionName: "Uneven skin tone and pigmentation",
    confidenceLabel: "Pattern suggests pigmentation or dullness",
    issueSummary:
      "Your answers suggest uneven tone, dark patches, or dullness, which can come from sun exposure, hormonal changes, or a skincare routine that is not suited to your skin. This is one of the most common concerns we treat.",
    kitRecommendation: [
      "A personalised pigmentation-care kit with brightening actives, antioxidant support, and a high-SPF sunscreen.",
      "Chemical peel or pigmentation-correction sessions may be suggested in-clinic based on depth and cause.",
      "A daily routine focused on protecting skin from further sun-triggered darkening.",
    ],
    testsRecommended: ["Skin tone and pigmentation depth check", "Sun-damage assessment", "Hormonal review if melasma pattern is suspected"],
    urgencyNote: "Pigmentation responds best to early, consistent sun protection alongside treatment.",
  },
  sensitive_reactive_skin: {
    conditionName: "Sensitive or reactive skin",
    confidenceLabel: "Barrier appears easily irritated",
    issueSummary:
      "Your answers suggest skin that reacts easily to products, weather, or friction. Treatment usually starts with calming and strengthening the skin barrier before introducing active ingredients.",
    kitRecommendation: [
      "A personalised barrier-repair kit with a fragrance-free cleanser, soothing moisturiser, and mineral sunscreen.",
      "Active ingredients are introduced gradually and only once irritation has settled.",
      "Patch testing is recommended before starting any new product.",
    ],
    testsRecommended: ["Patch test for known triggers", "Skin barrier and sensitivity assessment"],
    urgencyNote: "If your skin is frequently red, burning, or reacting to routine products, book a consultation before trying new actives.",
  },
  scaly_patchy_skin: {
    conditionName: "Scaly or persistently itchy patches",
    confidenceLabel: "Pattern needs a dermatologist review",
    issueSummary:
      "Your answers describe scaly, thick, or persistently itchy patches, which can have several underlying causes. This pattern is best confirmed in person before starting any treatment.",
    kitRecommendation: [
      "Avoid strong exfoliants or unverified home remedies on these patches until a doctor examines your skin.",
      "A gentle, fragrance-free moisturiser can be used to reduce dryness and discomfort in the meantime.",
      "Your personalised kit and treatment plan will be shared once your specialist confirms the exact cause.",
    ],
    testsRecommended: ["In-person skin examination", "Trigger and history review"],
    urgencyNote: "Please book a clinic visit soon so patches can be assessed and treated correctly.",
  },
  pigment_loss_patches: {
    conditionName: "Patches of skin colour loss",
    confidenceLabel: "Pattern needs a dermatologist review",
    issueSummary:
      "Your answers describe patches where the skin appears to be losing colour. This needs an in-person examination to confirm the cause and plan the right course of action.",
    kitRecommendation: [
      "Protect the affected patches from strong sun exposure with sunscreen or covered clothing.",
      "Avoid applying strong actives on these patches until a doctor has examined them.",
      "Your personalised care plan will be shared after your specialist reviews your skin in person.",
    ],
    testsRecommended: ["In-person skin examination", "Family history and progression review"],
    urgencyNote: "Early evaluation gives the best chance of managing this condition effectively, so please book a consultation soon.",
  },
  early_ageing_dull_skin: {
    conditionName: "Early signs of ageing and tired-looking skin",
    confidenceLabel: "Prevention and refresh-focused pattern",
    issueSummary:
      "Your answers point toward fine lines, tiredness, or early signs of ageing. At this stage, prevention-focused care usually gives the best long-term results.",
    kitRecommendation: [
      "A personalised anti-ageing kit with antioxidant serum, collagen-support actives, and daily SPF.",
      "In-clinic options such as peels or skin-quality treatments may be suggested based on your goals.",
      "A consistent hydration and sun-protection routine to slow further visible ageing.",
    ],
    testsRecommended: ["Skin elasticity and texture check", "Sun-damage assessment"],
    urgencyNote: "Starting care early generally gives more natural, longer-lasting results.",
  },
  oily_congested_skin: {
    conditionName: "Oily and congestion-prone skin",
    confidenceLabel: "Skin type suggests excess oil and clogged pores",
    issueSummary:
      "Your skin type and answers suggest excess oil and a tendency toward congestion or clogged pores, even without a specific active concern reported.",
    kitRecommendation: [
      "A personalised oil-balancing kit with a gentle foaming cleanser, lightweight hydration, and a non-comedogenic sunscreen.",
      "Regular clinic facials or peels can help keep pores clear if congestion becomes frequent.",
      "Avoid over-cleansing, which can trigger the skin to produce even more oil.",
    ],
    testsRecommended: ["Skin type confirmation", "Pore congestion check"],
    urgencyNote: "If oiliness is accompanied by frequent breakouts, mention this during your consultation.",
  },
  dry_dehydrated_skin: {
    conditionName: "Dry and dehydrated skin",
    confidenceLabel: "Skin type suggests low moisture retention",
    issueSummary:
      "Your skin type and answers suggest dryness or dehydration, which can make skin look dull and feel tight, even without a specific active concern reported.",
    kitRecommendation: [
      "A personalised hydration kit with a cream cleanser, barrier-repair moisturiser, and hydrating sunscreen.",
      "Humectant and ceramide-based products are usually prioritised over strong actives.",
      "Increasing water intake and using a humidifier in dry weather can help alongside topical care.",
    ],
    testsRecommended: ["Skin type confirmation", "Barrier function check"],
    urgencyNote: "Persistent dryness that does not improve with moisturising should be reviewed by a doctor.",
  },
  general_skin_care: {
    conditionName: "General skin health and maintenance",
    confidenceLabel: "No single dominant concern identified",
    issueSummary:
      "Your answers do not point strongly toward one specific skin condition, which usually means a maintenance-focused routine and periodic professional check-ins will serve you well.",
    kitRecommendation: [
      "A personalised daily-care kit with a suitable cleanser, moisturiser, and broad-spectrum sunscreen.",
      "Your specialist will fine-tune the kit further once your skin is examined in person.",
      "Simple, consistent habits usually matter more than adding many products at once.",
    ],
    testsRecommended: ["General skin type and health check"],
    urgencyNote: "A one-time consultation can help confirm your skin type and build the right long-term routine.",
  },
};

export const buildSkinTestAssessment = (input: SkinTestFormValues): SkinTestAssessment => {
  const age = Number(input.age) || 0;

  let conditionKey: SkinTestConditionKey = "general_skin_care";

  if (hasConcern(input, "white patches")) {
    conditionKey = "pigment_loss_patches";
  } else if (hasConcern(input, "scaly") || hasConcern(input, "itchy patches")) {
    conditionKey = "scaly_patchy_skin";
  } else if (hasConcern(input, "acne / pimples") || hasConcern(input, "pimples")) {
    conditionKey = "acne_breakout_prone_skin";
  } else if (hasConcern(input, "acne scars") || hasConcern(input, "marks")) {
    conditionKey = "post_acne_marks_pigmentation";
  } else if (hasConcern(input, "pigmentation") || hasConcern(input, "uneven skin tone") || hasConcern(input, "dullness")) {
    conditionKey = "melasma_hyperpigmentation";
  } else if (hasConcern(input, "fine lines") && age >= 26) {
    conditionKey = "early_ageing_dull_skin";
  } else if (input.skinType === "Sensitive" || hasConcern(input, "sensitive")) {
    conditionKey = "sensitive_reactive_skin";
  } else if (input.skinType === "Oily" || hasConcern(input, "oily")) {
    conditionKey = "oily_congested_skin";
  } else if (input.skinType === "Dry" || hasConcern(input, "dry")) {
    conditionKey = "dry_dehydrated_skin";
  }

  return {
    conditionKey,
    ...assessmentMap[conditionKey],
  };
};

const uploadSkinTestPhoto = async (recordId: string, photo: File | null | undefined) => {
  if (!photo) return { path: null as string | null, publicUrl: null as string | null };

  const photoError = validateSkinTestPhoto(photo);
  if (photoError) return { path: null, publicUrl: null };

  const path = `${recordId}/${Date.now()}-${sanitizeFileName(photo.name)}`;
  const { error } = await supabase.storage.from(SKIN_TEST_PHOTO_BUCKET).upload(path, photo, {
    cacheControl: "3600",
    contentType: photo.type,
    upsert: false,
  });

  if (error) return { path: null, publicUrl: null };

  const { data } = supabase.storage.from(SKIN_TEST_PHOTO_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data?.publicUrl ?? null };
};

export const submitSkinTest = async (input: SubmitSkinTestInput): Promise<SubmitSkinTestResult> => {
  const phone = normalizeIndianPhone(input.phone);
  if (!phone || !input.gender || !input.affectedArea || !input.skinType) {
    return { mode: "invalid" };
  }

  const assessment = buildSkinTestAssessment(input);
  const id = createSkinTestId();
  const createdAt = new Date().toISOString();
  const photoMeta: SkinTestPhotoMeta | null = input.photo
    ? { name: input.photo.name, size: input.photo.size, type: input.photo.type }
    : null;

  const baseRecord: SkinTestRecord = {
    id,
    name: input.name.trim(),
    phone,
    age: Number(input.age),
    gender: input.gender,
    skin_concerns: input.skinConcerns,
    affected_area: input.affectedArea,
    issue_duration: input.issueDuration,
    skin_type: input.skinType,
    sun_exposure: input.sunExposure,
    water_intake: input.waterIntake,
    diet_type: input.dietType,
    stress_level: input.stressLevel,
    sleep_quality: input.sleepQuality,
    known_allergies: input.knownAllergies,
    current_skincare_use: input.currentSkincareUse || "No",
    current_skincare_products: input.currentSkincareProducts.trim() || null,
    current_medicine_use: input.currentMedicineUse || "No",
    current_medicines: input.currentMedicines.trim() || null,
    medical_condition: input.medicalCondition.trim() || null,
    likely_condition: assessment.conditionName,
    assessment_summary: assessment.issueSummary,
    kit_recommendation: assessment.kitRecommendation,
    photo_path: null,
    photo_name: photoMeta?.name ?? null,
    photo_size: photoMeta?.size ?? null,
    photo_type: photoMeta?.type ?? null,
    status: "new",
    created_at: createdAt,
    source: "local",
  };

  saveLocalSkinTest(baseRecord);

  const { path: photoPath, publicUrl } = await uploadSkinTestPhoto(id, input.photo);
  const cloudPayload: SkinTestCloudPayload = {
    ...baseRecord,
    photo_path: photoPath,
    created_at: createdAt,
  };
  delete (cloudPayload as Partial<SkinTestRecord>).source;

  const { error } = await (supabase as unknown as SkinTestTableClient)
    .from("skin_test_submissions")
    .insert(cloudPayload);

  if (error) {
    return { mode: "local", id, assessment, photoUrl: publicUrl };
  }

  removeLocalSkinTest(id);
  return { mode: "cloud", id, assessment, photoUrl: publicUrl };
};

export const localSkinTestsEventName = LOCAL_SKIN_TESTS_EVENT;

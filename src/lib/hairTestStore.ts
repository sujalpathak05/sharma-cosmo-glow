import { supabase } from "@/integrations/supabase/client";

export type HairTestGender = "Female" | "Male" | "Non-binary" | "Prefer not to say";
export type HairTestFamilyHistory = "Yes" | "No";
export type HairTestFamilyHistorySide = "Mother side" | "Father side" | "Both sides" | "No known family history";
export type HairTestLossPattern =
  | "Hairline"
  | "Crown"
  | "Both hairline and crown"
  | "Diffuse thinning / shedding"
  | "Circular patches"
  | "Scalp dandruff / itching";
export type HairTestScalpCondition = "Healthy scalp" | "Mild dandruff" | "Heavy dandruff" | "Itchy / inflamed scalp";
export type HairTestGastricIssue = "No gastric issue" | "Acidity" | "Gas" | "Heaviness" | "Sometimes";
export type HairTestCurrentMedicineUse = "Yes" | "No";

export type HairTestConditionKey =
  | "general_hair_loss"
  | "dht_based_hair_loss"
  | "female_pattern_hair_loss"
  | "dupa"
  | "alopecia_areata"
  | "dandruff_related_hair_fall"
  | "postpartum_hair_fall";

export type HairTestAssessment = {
  conditionKey: HairTestConditionKey;
  conditionName: string;
  confidenceLabel: string;
  issueSummary: string;
  medicineRecommendation: string[];
  testsRecommended: string[];
  urgencyNote: string;
};

export type HairTestFormValues = {
  name: string;
  phone: string;
  age: string;
  gender: HairTestGender | "";
  hairConcerns: string[];
  lossPattern: HairTestLossPattern | "";
  issueDuration: string;
  familyHistory: HairTestFamilyHistory | "";
  familyHistorySide: HairTestFamilyHistorySide | "";
  scalpCondition: HairTestScalpCondition | "";
  stressLevel: string;
  sleepQuality: string;
  dietType: string;
  personalHabits: string[];
  gastricIssue: HairTestGastricIssue | "";
  lifestyleDiseases: string[];
  currentMedicineUse: HairTestCurrentMedicineUse | "";
  currentMedicines: string;
  medicalCondition: string;
};

export type HairTestPhotoMeta = {
  name: string;
  size: number;
  type: string;
};

export type HairTestRecord = {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: HairTestGender;
  hair_concerns: string[];
  loss_pattern: HairTestLossPattern;
  issue_duration: string;
  family_history: HairTestFamilyHistory;
  family_history_side: HairTestFamilyHistorySide;
  scalp_condition: HairTestScalpCondition;
  stress_level: string;
  sleep_quality: string;
  diet_type: string;
  personal_habits: string[];
  gastric_issue: HairTestGastricIssue;
  lifestyle_diseases: string[];
  current_medicine_use: HairTestCurrentMedicineUse;
  current_medicines: string | null;
  medical_condition: string | null;
  likely_condition: string;
  assessment_summary: string;
  medicine_recommendation: string[];
  photo_path: string | null;
  photo_name: string | null;
  photo_size: number | null;
  photo_type: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
  source: "cloud" | "local";
};

type HairTestCloudPayload = Omit<HairTestRecord, "source" | "created_at"> & {
  created_at?: string;
};

type HairTestTableClient = {
  from: (table: "hair_test_submissions") => {
    insert: (payload: HairTestCloudPayload) => Promise<{ error: { message?: string } | null }>;
  };
};

export type SubmitHairTestInput = HairTestFormValues & {
  photo?: File | null;
};

const LOCAL_HAIR_TESTS_KEY = "sharma-cosmo-local-hair-tests";
const LOCAL_HAIR_TESTS_EVENT = "hair-tests:local-updated";
const HAIR_TEST_PHOTO_BUCKET = "hair-test-photos";
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitLocalHairTestsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCAL_HAIR_TESTS_EVENT));
  }
};

const createHairTestId = () => {
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
    .slice(0, 80) || "scalp-photo";

const sanitizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];

const sanitizeHairTestRecords = (value: unknown): HairTestRecord[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Partial<HairTestRecord> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createHairTestId(),
      name: typeof item.name === "string" ? item.name : "",
      phone: typeof item.phone === "string" ? item.phone : "",
      age: typeof item.age === "number" ? item.age : Number(item.age) || 0,
      gender: typeof item.gender === "string" ? (item.gender as HairTestGender) : "Prefer not to say",
      hair_concerns: sanitizeStringArray(item.hair_concerns),
      loss_pattern: typeof item.loss_pattern === "string" ? (item.loss_pattern as HairTestLossPattern) : "Diffuse thinning / shedding",
      issue_duration: typeof item.issue_duration === "string" ? item.issue_duration : "",
      family_history: item.family_history === "Yes" ? "Yes" : "No",
      family_history_side: typeof item.family_history_side === "string" ? (item.family_history_side as HairTestFamilyHistorySide) : "No known family history",
      scalp_condition: typeof item.scalp_condition === "string" ? (item.scalp_condition as HairTestScalpCondition) : "Healthy scalp",
      stress_level: typeof item.stress_level === "string" ? item.stress_level : "",
      sleep_quality: typeof item.sleep_quality === "string" ? item.sleep_quality : "",
      diet_type: typeof item.diet_type === "string" ? item.diet_type : "",
      personal_habits: sanitizeStringArray(item.personal_habits),
      gastric_issue: typeof item.gastric_issue === "string" ? (item.gastric_issue as HairTestGastricIssue) : "No gastric issue",
      lifestyle_diseases: sanitizeStringArray(item.lifestyle_diseases),
      current_medicine_use: item.current_medicine_use === "Yes" ? "Yes" : "No",
      current_medicines: typeof item.current_medicines === "string" ? item.current_medicines : null,
      medical_condition: typeof item.medical_condition === "string" ? item.medical_condition : null,
      likely_condition: typeof item.likely_condition === "string" ? item.likely_condition : "General hair loss",
      assessment_summary: typeof item.assessment_summary === "string" ? item.assessment_summary : "",
      medicine_recommendation: sanitizeStringArray(item.medicine_recommendation),
      photo_path: typeof item.photo_path === "string" ? item.photo_path : null,
      photo_name: typeof item.photo_name === "string" ? item.photo_name : null,
      photo_size: typeof item.photo_size === "number" ? item.photo_size : null,
      photo_type: typeof item.photo_type === "string" ? item.photo_type : null,
      status: item.status === "contacted" || item.status === "closed" ? item.status : "new",
      created_at: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
      source: "local" as const,
    }))
    .filter((item) => item.name && item.phone && item.age > 0 && item.hair_concerns.length > 0);
};

const writeLocalHairTests = (records: HairTestRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_HAIR_TESTS_KEY, JSON.stringify(records));
  emitLocalHairTestsUpdated();
};

export const readLocalHairTests = () => {
  if (!canUseStorage()) return [] as HairTestRecord[];

  try {
    const raw = window.localStorage.getItem(LOCAL_HAIR_TESTS_KEY);
    if (!raw) return [];
    return sanitizeHairTestRecords(JSON.parse(raw));
  } catch {
    return [];
  }
};

const saveLocalHairTest = (record: HairTestRecord) => {
  const existing = readLocalHairTests();
  writeLocalHairTests([{ ...record, source: "local" }, ...existing]);
  return record;
};

const removeLocalHairTest = (id: string) => {
  const existing = readLocalHairTests();
  writeLocalHairTests(existing.filter((record) => record.id !== id));
};

export const normalizeIndianPhone = (phone: string) => {
  const compact = phone.trim().replace(/[\s-]/g, "");
  const withoutCountryCode = compact.startsWith("+91") ? compact.slice(3) : compact.startsWith("91") && compact.length === 12 ? compact.slice(2) : compact;

  if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) return null;
  return `+91${withoutCountryCode}`;
};

export const validateHairTestPhoto = (photo: File | null | undefined) => {
  if (!photo) return null;
  if (!ALLOWED_PHOTO_TYPES.has(photo.type)) return "Please upload a JPG, PNG, WEBP, HEIC, or HEIF image.";
  if (photo.size > MAX_PHOTO_BYTES) return "Please upload an image smaller than 8 MB.";
  return null;
};

const hasConcern = (input: HairTestFormValues, token: string) =>
  input.hairConcerns.some((concern) => concern.toLowerCase().includes(token));

const hasLifestyleTrigger = (input: HairTestFormValues) =>
  input.stressLevel === "High" ||
  input.stressLevel === "Very high" ||
  input.sleepQuality === "Poor" ||
  input.sleepQuality === "Irregular" ||
  input.dietType === "Irregular meals" ||
  input.gastricIssue !== "No gastric issue" ||
  input.currentMedicineUse === "Yes" ||
  input.lifestyleDiseases.some((item) => item !== "No known lifestyle disease");

const assessmentMap: Record<HairTestConditionKey, Omit<HairTestAssessment, "conditionKey">> = {
  general_hair_loss: {
    conditionName: "General hair loss or nutritional hair fall",
    confidenceLabel: "Likely lifestyle or nutrition linked",
    issueSummary:
      "Your answers suggest diffuse or general hair fall. This can happen with low nutrition, stress, poor sleep, gastric issues, recent illness, medicines, or vitamin and mineral deficiency.",
    medicineRecommendation: [
      "Doctor may suggest a hair nutrition plan with protein support and multivitamin correction after checking deficiency risk.",
      "Iron, vitamin D, vitamin B12, ferritin, or thyroid correction should be started only if deficiency is confirmed.",
      "A topical hair growth serum or minoxidil may be discussed if shedding is persistent or density is reducing.",
    ],
    testsRecommended: ["CBC", "Ferritin / iron profile", "Vitamin D", "Vitamin B12", "TSH"],
    urgencyNote: "If hair fall is sudden, severe, or continuing beyond 3 months, book a clinic review.",
  },
  dht_based_hair_loss: {
    conditionName: "DHT-based hair loss",
    confidenceLabel: "Pattern suggests androgenetic hair loss",
    issueSummary:
      "Hairline, crown, or both-area thinning in men commonly points toward DHT-based hair loss. Family history can make this more likely.",
    medicineRecommendation: [
      "Doctor may consider topical minoxidil and an anti-DHT plan after scalp examination.",
      "Finasteride or dutasteride type medicines should not be started without doctor approval and suitability check.",
      "PRP, GFC, or hair density support can be discussed if thinning is progressive.",
    ],
    testsRecommended: ["Scalp trichoscopy", "Vitamin D", "Ferritin", "TSH if shedding is diffuse"],
    urgencyNote: "Early treatment usually works better for hairline and crown thinning.",
  },
  female_pattern_hair_loss: {
    conditionName: "Female pattern hair loss",
    confidenceLabel: "Pattern suggests FPHL",
    issueSummary:
      "Diffuse thinning, crown thinning, or hairline changes in women can fit female pattern hair loss, especially with family history, thyroid/PCOS symptoms, or hormonal changes.",
    medicineRecommendation: [
      "Doctor may consider topical minoxidil, hair growth serum, and nutritional correction after examination.",
      "Hormonal, thyroid, or PCOS-related treatment should be decided after consultation and relevant tests.",
      "PRP or GFC therapy can be discussed for density support when suitable.",
    ],
    testsRecommended: ["CBC", "Ferritin", "Vitamin D", "TSH", "Hormonal/PCOS evaluation if indicated"],
    urgencyNote: "Please avoid self-starting hormone or anti-androgen medicines.",
  },
  dupa: {
    conditionName: "Diffuse unpatterned alopecia",
    confidenceLabel: "Diffuse pattern needs scalp check",
    issueSummary:
      "Diffuse thinning across the scalp can fit DUPA or a shedding disorder. It needs trichoscopy because the treatment path changes with the exact pattern.",
    medicineRecommendation: [
      "Doctor may discuss topical growth therapy such as minoxidil after confirming the pattern.",
      "Nutrition and thyroid correction may be needed if tests show deficiency or imbalance.",
      "PRP or GFC can be considered only after the cause is mapped.",
    ],
    testsRecommended: ["Scalp trichoscopy", "CBC", "Ferritin", "Vitamin D", "B12", "TSH"],
    urgencyNote: "Diffuse thinning should be examined early, especially if density is dropping quickly.",
  },
  alopecia_areata: {
    conditionName: "Alopecia areata",
    confidenceLabel: "Patchy hair loss pattern",
    issueSummary:
      "Circular bald patches can fit alopecia areata, an immune-related patchy hair loss condition. It needs dermatologist confirmation.",
    medicineRecommendation: [
      "Doctor may recommend topical or intralesional steroid-based therapy depending on patch size and activity.",
      "Do not apply strong steroid creams or injections without dermatologist supervision.",
      "Early evaluation helps reduce patch spread and plan follow-up.",
    ],
    testsRecommended: ["Scalp examination", "Dermoscopy", "TSH or autoimmune screening if indicated"],
    urgencyNote: "Book a clinic visit soon if patches are increasing or beard/eyebrow areas are involved.",
  },
  dandruff_related_hair_fall: {
    conditionName: "Dandruff-related scalp inflammation",
    confidenceLabel: "Scalp health suggests dandruff involvement",
    issueSummary:
      "Dandruff, itching, or scalp inflammation can increase shedding and breakage. Heavy dandruff may need a stronger medicated routine.",
    medicineRecommendation: [
      "Doctor may suggest an anti-dandruff kit with a medicated shampoo such as ketoconazole, ciclopirox, or zinc pyrithione.",
      "If itching or redness is heavy, a short supervised scalp lotion plan may be needed.",
      "Avoid oiling over active dandruff unless the doctor advises it.",
    ],
    testsRecommended: ["Scalp examination", "Fungal/seborrheic dermatitis assessment if severe"],
    urgencyNote: "Heavy dandruff with redness, pain, or scaling should be reviewed in clinic.",
  },
  postpartum_hair_fall: {
    conditionName: "Post-pregnancy hair fall",
    confidenceLabel: "Postpartum shedding pattern",
    issueSummary:
      "Post-pregnancy hair fall is commonly linked to hormonal shift, nutrition demand, sleep disruption, and iron/vitamin deficiency risk.",
    medicineRecommendation: [
      "Doctor may suggest a lactation-safe nutrition and hair support plan after understanding delivery and feeding status.",
      "Iron, vitamin D, B12, and thyroid correction should be based on tests.",
      "Avoid self-starting hair medicines while breastfeeding unless the doctor approves them.",
    ],
    testsRecommended: ["CBC", "Ferritin", "Vitamin D", "Vitamin B12", "TSH"],
    urgencyNote: "If shedding is severe, patchy, or lasting beyond 6 months, take a clinic review.",
  },
};

export const buildHairTestAssessment = (input: HairTestFormValues): HairTestAssessment => {
  const age = Number(input.age) || 0;
  const isMale = input.gender === "Male";
  const isFemale = input.gender === "Female";
  const pattern = input.lossPattern;
  const hasFamilyHistory = input.familyHistory === "Yes" || input.familyHistorySide !== "No known family history";
  const dandruffPattern =
    pattern === "Scalp dandruff / itching" ||
    input.scalpCondition === "Mild dandruff" ||
    input.scalpCondition === "Heavy dandruff" ||
    input.scalpCondition === "Itchy / inflamed scalp" ||
    hasConcern(input, "dandruff") ||
    hasConcern(input, "itchy");

  let conditionKey: HairTestConditionKey = "general_hair_loss";

  if (pattern === "Circular patches" || hasConcern(input, "bald")) {
    conditionKey = "alopecia_areata";
  } else if (hasConcern(input, "post pregnancy")) {
    conditionKey = "postpartum_hair_fall";
  } else if (dandruffPattern && !["Hairline", "Crown", "Both hairline and crown"].includes(pattern)) {
    conditionKey = "dandruff_related_hair_fall";
  } else if (isMale && ["Hairline", "Crown", "Both hairline and crown"].includes(pattern)) {
    conditionKey = "dht_based_hair_loss";
  } else if (isFemale && (["Hairline", "Crown", "Both hairline and crown"].includes(pattern) || age >= 20 || hasFamilyHistory)) {
    conditionKey = "female_pattern_hair_loss";
  } else if (pattern === "Diffuse thinning / shedding" && isMale && age >= 20) {
    conditionKey = "dupa";
  } else if (pattern === "Diffuse thinning / shedding" && !hasLifestyleTrigger(input)) {
    conditionKey = isFemale && age >= 30 ? "female_pattern_hair_loss" : "general_hair_loss";
  }

  if (conditionKey === "general_hair_loss" && dandruffPattern) {
    conditionKey = "dandruff_related_hair_fall";
  }

  return {
    conditionKey,
    ...assessmentMap[conditionKey],
  };
};

const uploadHairTestPhoto = async (recordId: string, photo: File | null | undefined) => {
  if (!photo) return null;

  const photoError = validateHairTestPhoto(photo);
  if (photoError) return null;

  const path = `${recordId}/${Date.now()}-${sanitizeFileName(photo.name)}`;
  const { error } = await supabase.storage.from(HAIR_TEST_PHOTO_BUCKET).upload(path, photo, {
    cacheControl: "3600",
    contentType: photo.type,
    upsert: false,
  });

  return error ? null : path;
};

export const submitHairTest = async (input: SubmitHairTestInput) => {
  const phone = normalizeIndianPhone(input.phone);
  if (!phone || !input.gender || !input.familyHistory || !input.lossPattern || !input.scalpCondition) {
    return { mode: "invalid" as const };
  }

  const assessment = buildHairTestAssessment(input);
  const id = createHairTestId();
  const createdAt = new Date().toISOString();
  const photoMeta: HairTestPhotoMeta | null = input.photo
    ? { name: input.photo.name, size: input.photo.size, type: input.photo.type }
    : null;

  const baseRecord: HairTestRecord = {
    id,
    name: input.name.trim(),
    phone,
    age: Number(input.age),
    gender: input.gender,
    hair_concerns: input.hairConcerns,
    loss_pattern: input.lossPattern,
    issue_duration: input.issueDuration,
    family_history: input.familyHistory,
    family_history_side: input.familyHistorySide || "No known family history",
    scalp_condition: input.scalpCondition,
    stress_level: input.stressLevel,
    sleep_quality: input.sleepQuality,
    diet_type: input.dietType,
    personal_habits: input.personalHabits,
    gastric_issue: input.gastricIssue || "No gastric issue",
    lifestyle_diseases: input.lifestyleDiseases,
    current_medicine_use: input.currentMedicineUse || "No",
    current_medicines: input.currentMedicines.trim() || null,
    medical_condition: input.medicalCondition.trim() || null,
    likely_condition: assessment.conditionName,
    assessment_summary: assessment.issueSummary,
    medicine_recommendation: assessment.medicineRecommendation,
    photo_path: null,
    photo_name: photoMeta?.name ?? null,
    photo_size: photoMeta?.size ?? null,
    photo_type: photoMeta?.type ?? null,
    status: "new",
    created_at: createdAt,
    source: "local",
  };

  saveLocalHairTest(baseRecord);

  const photoPath = await uploadHairTestPhoto(id, input.photo);
  const cloudPayload: HairTestCloudPayload = {
    ...baseRecord,
    photo_path: photoPath,
    created_at: createdAt,
  };
  delete (cloudPayload as Partial<HairTestRecord>).source;

  const { error } = await (supabase as unknown as HairTestTableClient)
    .from("hair_test_submissions")
    .insert(cloudPayload);

  if (error) {
    return { mode: "local" as const, id, assessment };
  }

  removeLocalHairTest(id);
  return { mode: "cloud" as const, id, assessment };
};

export const localHairTestsEventName = LOCAL_HAIR_TESTS_EVENT;

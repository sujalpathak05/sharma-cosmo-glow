import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildSkinTestAssessment,
  type SkinTestAffectedArea,
  type SkinTestAssessment,
  type SkinTestFormValues,
  type SkinTestSkinType,
  type SkinTestYesNo,
  normalizeIndianPhone,
  submitSkinTest,
  validateSkinTestPhoto,
} from "@/lib/skinTestStore";
import { cn } from "@/lib/utils";

type SkinTestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SkinTestFieldError = Partial<Record<keyof SkinTestFormValues | "photo" | "form", string>>;

const TOTAL_STEPS = 7;
const skinTestWhatsAppNumber = "+919810622372";

const initialValues: SkinTestFormValues = {
  name: "",
  phone: "",
  age: "",
  gender: "",
  skinConcerns: [],
  affectedArea: "",
  issueDuration: "",
  skinType: "",
  sunExposure: "",
  waterIntake: "",
  dietType: "",
  stressLevel: "",
  sleepQuality: "",
  knownAllergies: [],
  currentSkincareUse: "",
  currentSkincareProducts: "",
  currentMedicineUse: "",
  currentMedicines: "",
  medicalCondition: "",
};

const genderOptions: SkinTestFormValues["gender"][] = ["Female", "Male", "Non-binary", "Prefer not to say"];
const skinConcernOptions = [
  "Acne / pimples",
  "Acne scars / marks",
  "Pigmentation / dark spots",
  "Uneven skin tone",
  "Dullness / tan",
  "Fine lines / wrinkles",
  "Open pores",
  "Dry / flaky skin",
  "Oily / greasy skin",
  "White patches",
  "Scaly / itchy patches",
  "Sensitive / easily irritated skin",
];
const affectedAreaOptions: SkinTestAffectedArea[] = ["Face"];
const issueDurationOptions = ["Less than 1 month", "1-3 months", "3-6 months", "More than 6 months"];
const skinTypeOptions: SkinTestSkinType[] = ["Oily", "Dry", "Combination", "Sensitive", "Normal"];
const sunExposureOptions = ["Low (mostly indoors)", "Moderate", "High (long outdoor hours)"];
const waterIntakeOptions = ["Less than 1.5L/day", "1.5-2.5L/day", "More than 2.5L/day"];
const dietTypeOptions = ["Vegetarian", "Non-vegetarian", "Vegan", "Mixed / balanced", "Irregular meals"];
const stressLevelOptions = ["Low", "Moderate", "High", "Very high"];
const sleepQualityOptions = ["Good", "Average", "Poor", "Irregular"];
const knownAllergyOptions = ["Cosmetic / skincare product allergy", "Food allergy", "Seasonal allergy", "No known allergy"];
const currentSkincareUseOptions: SkinTestYesNo[] = ["Yes", "No"];
const currentMedicineUseOptions: SkinTestYesNo[] = ["Yes", "No"];

const fieldClass =
  "w-full rounded-2xl border border-[#f0d7dc] bg-white/90 px-4 py-3 font-body text-sm text-foreground shadow-sm outline-none transition focus:border-[#d8607a] focus:ring-2 focus:ring-[#f3c6d0]";
const labelClass = "mb-2 block font-body text-sm font-semibold text-[#3b1f26]";
const errorClass = "mt-1.5 font-body text-xs font-medium text-destructive";

const joinList = (items: string[]) => (items.length > 0 ? items.join(", ") : "Not selected");

const buildSkinTestWhatsAppMessage = (
  formValues: SkinTestFormValues,
  currentAssessment: SkinTestAssessment | null,
  photoUrl: string | null,
) => {
  const normalizedPhone = normalizeIndianPhone(formValues.phone) ?? formValues.phone;
  const lines = [
    "Hi Sharma Cosmo Clinic, I completed the Skin Test. Please review my details.",
    `Clinic WhatsApp: ${skinTestWhatsAppNumber}`,
    "",
    "Patient details:",
    `Name: ${formValues.name || "-"}`,
    `Phone: ${normalizedPhone || "-"}`,
    `Age: ${formValues.age || "-"}`,
    `Gender: ${formValues.gender || "-"}`,
    "",
    "Skin concern:",
    `Concerns: ${joinList(formValues.skinConcerns)}`,
    `Affected area: ${formValues.affectedArea || "-"}`,
    `Duration: ${formValues.issueDuration || "-"}`,
    `Skin type: ${formValues.skinType || "-"}`,
    "",
    "Lifestyle:",
    `Sun exposure: ${formValues.sunExposure || "-"}`,
    `Water intake: ${formValues.waterIntake || "-"}`,
    `Diet: ${formValues.dietType || "-"}`,
    `Stress: ${formValues.stressLevel || "-"}`,
    `Sleep: ${formValues.sleepQuality || "-"}`,
    `Known allergies: ${joinList(formValues.knownAllergies)}`,
    `Current skincare products: ${formValues.currentSkincareUse || "-"}${formValues.currentSkincareProducts ? ` - ${formValues.currentSkincareProducts}` : ""}`,
    `Current medicine: ${formValues.currentMedicineUse || "-"}${formValues.currentMedicines ? ` - ${formValues.currentMedicines}` : ""}`,
    `Present condition: ${formValues.medicalCondition || "-"}`,
    `Skin photo: ${photoUrl ?? "Not shared"}`,
    "",
    "Skin Test result:",
    `Likely concern: ${currentAssessment?.conditionName ?? "-"}`,
    `Summary: ${currentAssessment?.issueSummary ?? "-"}`,
    `Suggested checks: ${currentAssessment?.testsRecommended.join(", ") ?? "-"}`,
    "",
    "Our expert dermatologists will review these details and share my personalized skin care kit and treatment plan. Please guide me with the next steps.",
  ];

  return lines.join("\n");
};

const buildSkinTestWhatsAppHref = (message: string) =>
  `https://wa.me/${skinTestWhatsAppNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;

const SkinTestModal = ({ open, onOpenChange }: SkinTestModalProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<SkinTestFormValues>(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [errors, setErrors] = useState<SkinTestFieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assessment, setAssessment] = useState<SkinTestAssessment | null>(null);
  const [submittedPhotoUrl, setSubmittedPhotoUrl] = useState<string | null>(null);
  const progress = useMemo(() => Math.round((step / TOTAL_STEPS) * 100), [step]);
  const skinTestWhatsAppMessage = useMemo(
    () => buildSkinTestWhatsAppMessage(values, assessment, submittedPhotoUrl),
    [assessment, submittedPhotoUrl, values],
  );
  const skinTestWhatsAppHref = useMemo(
    () => buildSkinTestWhatsAppHref(skinTestWhatsAppMessage),
    [skinTestWhatsAppMessage],
  );

  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
  }, []);

  const setSelectedPhoto = useCallback((nextPhoto: File | null) => {
    setPhotoPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return nextPhoto ? URL.createObjectURL(nextPhoto) : null;
    });
    setPhoto(nextPhoto);
  }, []);

  const resetForm = useCallback(() => {
    stopCamera();
    setStep(1);
    setValues(initialValues);
    setSelectedPhoto(null);
    setCameraError(null);
    setErrors({});
    setSubmitting(false);
    setSubmitted(false);
    setAssessment(null);
    setSubmittedPhotoUrl(null);
  }, [setSelectedPhoto, stopCamera]);

  useEffect(() => {
    if (!open && submitted) {
      const timer = window.setTimeout(resetForm, 220);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, resetForm, submitted]);

  useEffect(() => {
    if (!open) stopCamera();
  }, [open, stopCamera]);

  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraActive]);

  useEffect(
    () => () => {
      stopCamera();
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    },
    [photoPreviewUrl, stopCamera],
  );

  const updateField = (field: keyof SkinTestFormValues, nextValue: string) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const toggleSkinConcern = (concern: string) => {
    setValues((current) => {
      const exists = current.skinConcerns.includes(concern);
      return {
        ...current,
        skinConcerns: exists
          ? current.skinConcerns.filter((item) => item !== concern)
          : [...current.skinConcerns, concern],
      };
    });
    setErrors((current) => ({ ...current, skinConcerns: undefined, form: undefined }));
  };

  const toggleExclusiveArrayValue = (field: "knownAllergies", option: string, noneOption: string) => {
    setValues((current) => {
      const currentValues = current[field];
      if (option === noneOption) {
        return { ...current, [field]: currentValues.includes(option) ? [] : [option] };
      }

      const withoutNone = currentValues.filter((item) => item !== noneOption);
      const nextValues = withoutNone.includes(option)
        ? withoutNone.filter((item) => item !== option)
        : [...withoutNone, option];

      return { ...current, [field]: nextValues };
    });
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const chooseOption = (field: keyof SkinTestFormValues, option: string) => {
    updateField(field, option);
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhoto = event.target.files?.[0] ?? null;
    const photoError = validateSkinTestPhoto(selectedPhoto);
    setSelectedPhoto(photoError ? null : selectedPhoto);
    setErrors((current) => ({ ...current, photo: photoError ?? undefined, form: undefined }));

    if (photoError) {
      event.target.value = "";
    }
  };

  const startLiveCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not available in this browser. Please use upload image.");
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraActive(true);
      window.setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 0);
    } catch {
      setCameraError("Camera permission was blocked. Please allow camera access or upload an image.");
    }
  };

  const captureLivePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 960;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture photo. Please try upload image.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to capture photo. Please try again.");
          return;
        }

        const capturedPhoto = new File([blob], `live-skin-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        const photoError = validateSkinTestPhoto(capturedPhoto);
        if (photoError) {
          setErrors((current) => ({ ...current, photo: photoError }));
          return;
        }

        setSelectedPhoto(capturedPhoto);
        setErrors((current) => ({ ...current, photo: undefined, form: undefined }));
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  };

  const validateStep = (targetStep = step) => {
    const nextErrors: SkinTestFieldError = {};
    const ageValue = Number(values.age);

    if (targetStep === 1) {
      if (values.name.trim().length < 2) nextErrors.name = "Please enter your full name.";
      if (!normalizeIndianPhone(values.phone)) nextErrors.phone = "Please enter a valid Indian mobile number.";
      if (!values.age || Number.isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
        nextErrors.age = "Please enter a valid age.";
      }
      if (!values.gender) nextErrors.gender = "Please select your gender.";
    }

    if (targetStep === 2) {
      if (values.skinConcerns.length === 0) nextErrors.skinConcerns = "Please choose at least one concern.";
      if (!values.affectedArea) nextErrors.affectedArea = "Please select the main affected area.";
    }

    if (targetStep === 3 && !values.issueDuration) {
      nextErrors.issueDuration = "Please select how long this has been happening.";
    }

    if (targetStep === 4 && !values.skinType) {
      nextErrors.skinType = "Please select your skin type.";
    }

    if (targetStep === 5) {
      if (!values.sunExposure) nextErrors.sunExposure = "Please select your sun exposure.";
      if (!values.waterIntake) nextErrors.waterIntake = "Please select your water intake.";
      if (!values.dietType) nextErrors.dietType = "Please select your diet type.";
      if (!values.stressLevel) nextErrors.stressLevel = "Please select your stress level.";
      if (!values.sleepQuality) nextErrors.sleepQuality = "Please select your sleep quality.";
      if (values.knownAllergies.length === 0) nextErrors.knownAllergies = "Please select allergy details.";
      if (!values.currentSkincareUse) nextErrors.currentSkincareUse = "Please select current skincare status.";
      if (values.currentSkincareUse === "Yes" && !values.currentSkincareProducts.trim()) {
        nextErrors.currentSkincareProducts = "Please mention the skincare products you are using.";
      }
      if (!values.currentMedicineUse) nextErrors.currentMedicineUse = "Please select current medicine status.";
      if (values.currentMedicineUse === "Yes" && !values.currentMedicines.trim()) {
        nextErrors.currentMedicines = "Please mention current medicines or supplements.";
      }
      if (!values.medicalCondition.trim()) nextErrors.medicalCondition = "Write none if there is no present condition.";
    }

    const photoError = validateSkinTestPhoto(photo);
    if (targetStep === 6 && photoError) nextErrors.photo = photoError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAll = () => {
    for (let currentStep = 1; currentStep <= 6; currentStep += 1) {
      if (!validateStep(currentStep)) {
        setStep(currentStep);
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step < TOTAL_STEPS) {
      goNext();
      return;
    }

    if (!validateAll()) return;

    const nextAssessment = buildSkinTestAssessment(values);
    setAssessment(nextAssessment);
    setSubmitting(true);
    const result = await submitSkinTest({ ...values, photo });
    setSubmitting(false);

    if (result.mode === "invalid") {
      setErrors({ form: "Please review the highlighted details and try again." });
      toast.error("Please review the skin test details.");
      return;
    }

    setAssessment(result.assessment ?? nextAssessment);
    setSubmittedPhotoUrl(result.photoUrl);
    setSubmitted(true);
    toast.success(
      result.mode === "cloud"
        ? "Skin test submitted successfully."
        : "Skin test saved safely in this browser backup queue.",
    );
  };

  const handleChatWithTeam = () => {
    window.location.href = skinTestWhatsAppHref;
  };

  const renderChoice = (
    label: string,
    selected: boolean,
    onClick: () => void,
    mode: "checkbox" | "radio" = "radio",
  ) => (
    <button
      key={label}
      type="button"
      role={mode}
      aria-checked={selected}
      aria-pressed={mode === "checkbox" ? selected : undefined}
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left font-body text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8607a] focus-visible:ring-offset-2",
        selected
          ? "border-[#c33d5d] bg-[linear-gradient(135deg,#3a2026,#221217)] text-white shadow-[0_16px_32px_-24px_rgba(60,17,29,0.85)]"
          : "border-[#f0d7dc] bg-white/88 text-[#3b1f26] hover:border-[#d8607a] hover:bg-[#fff5f6]",
      )}
    >
      {label}
    </button>
  );

  const renderAssessmentCard = (currentAssessment: SkinTestAssessment) => (
    <div className="rounded-[1.5rem] border border-[#f2d3da] bg-white/82 p-5 text-left shadow-[0_22px_55px_-42px_rgba(90,20,38,0.45)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#fde3e8] text-[#b23a52]">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-[#a1264a]">Likely concern</p>
          <h3 className="mt-1 font-display text-2xl leading-tight text-[#2f1720]">
            {currentAssessment.conditionName}
          </h3>
          <p className="mt-2 font-body text-sm font-semibold text-[#6b1930]">{currentAssessment.confidenceLabel}</p>
        </div>
      </div>

      <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
        {currentAssessment.issueSummary}
      </p>

      <div className="mt-5 rounded-2xl bg-[#fff5f6] p-4">
        <p className="font-body text-sm font-bold text-[#3b1f26]">Your personalized skin kit will include</p>
        <ul className="mt-3 space-y-2 font-body text-sm leading-relaxed text-muted-foreground">
          {currentAssessment.kitRecommendation.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#b23a52]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-[#f0d7dc] bg-white/72 p-4">
        <p className="font-body text-sm font-bold text-[#3b1f26]">Suggested checks</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
          {currentAssessment.testsRecommended.join(", ")}
        </p>
      </div>

      <p className="mt-4 rounded-2xl bg-[#2f1720] px-4 py-3 font-body text-xs leading-relaxed text-white/82">
        {currentAssessment.urgencyNote} This is an initial screening result, not a final prescription. Our expert
        dermatologists at Sharma Cosmo Clinic will review your details and share your personalized kit before any
        treatment begins.
      </p>
    </div>
  );

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="skin-test-name" className={labelClass}>Name *</label>
            <input
              id="skin-test-name"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={cn(fieldClass, errors.name && "border-destructive focus:border-destructive focus:ring-destructive/25")}
              autoComplete="name"
              maxLength={100}
              placeholder="Your full name"
            />
            {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="skin-test-phone" className={labelClass}>Phone number *</label>
            <input
              id="skin-test-phone"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={cn(fieldClass, errors.phone && "border-destructive focus:border-destructive focus:ring-destructive/25")}
              autoComplete="tel"
              inputMode="tel"
              maxLength={16}
              placeholder="+91 9876543210"
            />
            {errors.phone ? <p className={errorClass}>{errors.phone}</p> : null}
          </div>

          <div>
            <label htmlFor="skin-test-age" className={labelClass}>Age *</label>
            <input
              id="skin-test-age"
              value={values.age}
              onChange={(event) => updateField("age", event.target.value.replace(/\D/g, "").slice(0, 3))}
              className={cn(fieldClass, errors.age && "border-destructive focus:border-destructive focus:ring-destructive/25")}
              inputMode="numeric"
              placeholder="Age"
            />
            {errors.age ? <p className={errorClass}>{errors.age}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <p className={labelClass}>Gender *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Gender">
              {genderOptions.map((option) =>
                renderChoice(option, values.gender === option, () => chooseOption("gender", option)),
              )}
            </div>
            {errors.gender ? <p className={errorClass}>{errors.gender}</p> : null}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div>
            <p className={labelClass}>Skin concern options *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Skin concerns">
              {skinConcernOptions.map((option) =>
                renderChoice(option, values.skinConcerns.includes(option), () => toggleSkinConcern(option), "checkbox"),
              )}
            </div>
            {errors.skinConcerns ? <p className={errorClass}>{errors.skinConcerns}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Which area is mostly affected? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Affected area">
              {affectedAreaOptions.map((option) =>
                renderChoice(option, values.affectedArea === option, () => chooseOption("affectedArea", option)),
              )}
            </div>
            {errors.affectedArea ? <p className={errorClass}>{errors.affectedArea}</p> : null}
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div>
          <p className={labelClass}>Since when are you facing this issue? *</p>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Issue duration">
            {issueDurationOptions.map((option) =>
              renderChoice(option, values.issueDuration === option, () => chooseOption("issueDuration", option)),
            )}
          </div>
          {errors.issueDuration ? <p className={errorClass}>{errors.issueDuration}</p> : null}
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-6">
          <div>
            <p className={labelClass}>What is your skin type? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Skin type">
              {skinTypeOptions.map((option) =>
                renderChoice(option, values.skinType === option, () => chooseOption("skinType", option)),
              )}
            </div>
            {errors.skinType ? <p className={errorClass}>{errors.skinType}</p> : null}
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="space-y-6">
          <div>
            <p className={labelClass}>How much sun exposure do you get? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Sun exposure">
              {sunExposureOptions.map((option) =>
                renderChoice(option, values.sunExposure === option, () => chooseOption("sunExposure", option)),
              )}
            </div>
            {errors.sunExposure ? <p className={errorClass}>{errors.sunExposure}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Daily water intake *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Water intake">
              {waterIntakeOptions.map((option) =>
                renderChoice(option, values.waterIntake === option, () => chooseOption("waterIntake", option)),
              )}
            </div>
            {errors.waterIntake ? <p className={errorClass}>{errors.waterIntake}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Diet type *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Diet type">
              {dietTypeOptions.map((option) =>
                renderChoice(option, values.dietType === option, () => chooseOption("dietType", option)),
              )}
            </div>
            {errors.dietType ? <p className={errorClass}>{errors.dietType}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Stress level *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Stress level">
              {stressLevelOptions.map((option) =>
                renderChoice(option, values.stressLevel === option, () => chooseOption("stressLevel", option)),
              )}
            </div>
            {errors.stressLevel ? <p className={errorClass}>{errors.stressLevel}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Sleep quality *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Sleep quality">
              {sleepQualityOptions.map((option) =>
                renderChoice(option, values.sleepQuality === option, () => chooseOption("sleepQuality", option)),
              )}
            </div>
            {errors.sleepQuality ? <p className={errorClass}>{errors.sleepQuality}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Any known allergies? * <span className="font-normal text-muted-foreground">(select all that apply)</span></p>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Known allergies">
              {knownAllergyOptions.map((option) =>
                renderChoice(
                  option,
                  values.knownAllergies.includes(option),
                  () => toggleExclusiveArrayValue("knownAllergies", option, "No known allergy"),
                  "checkbox",
                ),
              )}
            </div>
            {errors.knownAllergies ? <p className={errorClass}>{errors.knownAllergies}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Are you currently using any skincare products? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Current skincare use">
              {currentSkincareUseOptions.map((option) =>
                renderChoice(option, values.currentSkincareUse === option, () => chooseOption("currentSkincareUse", option)),
              )}
            </div>
            {errors.currentSkincareUse ? <p className={errorClass}>{errors.currentSkincareUse}</p> : null}
          </div>

          {values.currentSkincareUse === "Yes" ? (
            <div>
              <label htmlFor="skin-test-current-products" className={labelClass}>Skincare product names *</label>
              <textarea
                id="skin-test-current-products"
                rows={2}
                value={values.currentSkincareProducts}
                onChange={(event) => updateField("currentSkincareProducts", event.target.value)}
                className={cn(fieldClass, "resize-none", errors.currentSkincareProducts && "border-destructive focus:border-destructive focus:ring-destructive/25")}
                maxLength={400}
                placeholder="Cleanser, serum, cream, or other product names"
              />
              {errors.currentSkincareProducts ? <p className={errorClass}>{errors.currentSkincareProducts}</p> : null}
            </div>
          ) : null}

          <div>
            <p className={labelClass}>Are you taking any medicine presently? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Current medicine use">
              {currentMedicineUseOptions.map((option) =>
                renderChoice(option, values.currentMedicineUse === option, () => chooseOption("currentMedicineUse", option)),
              )}
            </div>
            {errors.currentMedicineUse ? <p className={errorClass}>{errors.currentMedicineUse}</p> : null}
          </div>

          {values.currentMedicineUse === "Yes" ? (
            <div>
              <label htmlFor="skin-test-current-medicines" className={labelClass}>Medicine or supplement names *</label>
              <textarea
                id="skin-test-current-medicines"
                rows={2}
                value={values.currentMedicines}
                onChange={(event) => updateField("currentMedicines", event.target.value)}
                className={cn(fieldClass, "resize-none", errors.currentMedicines && "border-destructive focus:border-destructive focus:ring-destructive/25")}
                maxLength={400}
                placeholder="Medicine or supplement names"
              />
              {errors.currentMedicines ? <p className={errorClass}>{errors.currentMedicines}</p> : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="skin-test-medical-condition" className={labelClass}>Share your present condition *</label>
            <textarea
              id="skin-test-medical-condition"
              rows={3}
              value={values.medicalCondition}
              onChange={(event) => updateField("medicalCondition", event.target.value)}
              className={cn(fieldClass, "resize-none", errors.medicalCondition && "border-destructive focus:border-destructive focus:ring-destructive/25")}
              maxLength={500}
              placeholder="Thyroid, PCOS, diabetes, pregnancy, recent illness, or none"
            />
            {errors.medicalCondition ? <p className={errorClass}>{errors.medicalCondition}</p> : null}
          </div>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div>
          <p className={labelClass}>Upload skin photo optional</p>
          <div className="rounded-[1.5rem] border border-dashed border-[#e8adba] bg-white/80 px-5 py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fde3e8] text-[#b23a52]">
              {photo ? <CheckCircle2 className="h-6 w-6" aria-hidden="true" /> : <Camera className="h-6 w-6" aria-hidden="true" />}
            </div>
            <p className="font-body text-sm font-semibold text-[#3b1f26]">
              {photo ? photo.name : "Share a live skin photo or upload an image"}
            </p>
            <p className="mt-2 font-body text-xs text-muted-foreground">
              Camera preview opens here. Capture a live photo, or upload JPG, PNG, WEBP, HEIC, or HEIF up to 8 MB.
            </p>

            {photoPreviewUrl ? (
              <div className="mx-auto mt-5 max-w-sm overflow-hidden rounded-[1.25rem] border border-[#f2d3da] bg-white shadow-sm">
                <img src={photoPreviewUrl} alt="Captured skin preview" className="aspect-[4/3] w-full object-cover" />
              </div>
            ) : null}

            {cameraActive ? (
              <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[#f2d3da] bg-[#221217]">
                <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full object-cover" />
                <div className="grid gap-3 bg-white/95 p-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={captureLivePhoto}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3a2026,#221217)] px-5 py-3 font-body text-sm font-semibold text-white shadow-[0_18px_36px_-28px_rgba(60,17,29,0.85)] transition hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Capture photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center justify-center rounded-full border border-[#e8adba] bg-white px-5 py-3 font-body text-sm font-semibold text-[#6b1930] transition hover:bg-[#fff5f6] active:scale-[0.98]"
                  >
                    Close camera
                  </button>
                </div>
              </div>
            ) : null}

            {cameraError ? <p className="mt-3 font-body text-xs font-medium text-destructive">{cameraError}</p> : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void startLiveCamera()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3a2026,#221217)] px-5 py-3 font-body text-sm font-semibold text-white shadow-[0_18px_36px_-28px_rgba(60,17,29,0.85)] transition hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Take live photo
              </button>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e8adba] bg-white px-5 py-3 font-body text-sm font-semibold text-[#6b1930] transition hover:bg-[#fff5f6] active:scale-[0.98]">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Upload image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
          {photo ? (
            <button
              type="button"
              onClick={() => {
                setSelectedPhoto(null);
                setErrors((current) => ({ ...current, photo: undefined }));
              }}
              className="mt-3 rounded-full border border-[#e8adba] bg-white px-4 py-2 font-body text-xs font-semibold text-[#6b1930] transition hover:bg-[#fff5f6]"
            >
              Remove photo
            </button>
          ) : null}
          {errors.photo ? <p className={errorClass}>{errors.photo}</p> : null}
        </div>
      );
    }

    const reviewAssessment = buildSkinTestAssessment(values);

    return (
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-[#f0d7dc] bg-white/78 p-5">
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[#a1264a]">Review your skin test</p>
          <div className="mt-4 grid gap-3 font-body text-sm text-muted-foreground sm:grid-cols-2">
            <p><span className="font-semibold text-foreground">Name:</span> {values.name}</p>
            <p><span className="font-semibold text-foreground">Phone:</span> {normalizeIndianPhone(values.phone) ?? values.phone}</p>
            <p><span className="font-semibold text-foreground">Age:</span> {values.age}</p>
            <p><span className="font-semibold text-foreground">Gender:</span> {values.gender}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-foreground">Concerns:</span> {values.skinConcerns.join(", ")}</p>
            <p><span className="font-semibold text-foreground">Affected area:</span> {values.affectedArea}</p>
            <p><span className="font-semibold text-foreground">Duration:</span> {values.issueDuration}</p>
            <p><span className="font-semibold text-foreground">Skin type:</span> {values.skinType}</p>
            <p><span className="font-semibold text-foreground">Sun exposure:</span> {values.sunExposure}</p>
            <p><span className="font-semibold text-foreground">Water intake:</span> {values.waterIntake}</p>
            <p><span className="font-semibold text-foreground">Diet:</span> {values.dietType}</p>
            <p><span className="font-semibold text-foreground">Stress:</span> {values.stressLevel}</p>
            <p><span className="font-semibold text-foreground">Sleep:</span> {values.sleepQuality}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-foreground">Allergies:</span> {values.knownAllergies.join(", ")}</p>
            <p><span className="font-semibold text-foreground">Current medicine:</span> {values.currentMedicineUse}</p>
            <p><span className="font-semibold text-foreground">Photo:</span> {photo ? photo.name : "Not uploaded"}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-foreground">Present condition:</span> {values.medicalCondition}</p>
          </div>
        </div>
        {renderAssessmentCard(reviewAssessment)}
        {errors.form ? <p className={errorClass}>{errors.form}</p> : null}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-3xl overflow-hidden rounded-[2rem] border-[#f2d3da] bg-[linear-gradient(180deg,#fffbfb,#fff2f4)] p-0 shadow-[0_34px_90px_-48px_rgba(80,20,36,0.75)] sm:rounded-[2rem]">
        {submitted ? (
          <div className="max-h-[92vh] overflow-y-auto px-5 py-8 sm:px-10">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fde3e8] text-[#b23a52]">
                <ShieldCheck className="h-9 w-9" aria-hidden="true" />
              </div>
              <DialogTitle className="font-display text-3xl text-[#2f1720]">Your Skin Test Result</DialogTitle>
              <DialogDescription className="mx-auto mt-3 max-w-md font-body text-base leading-relaxed text-muted-foreground">
                Thank you! Our expert dermatologists at Sharma Cosmo Clinic will review your details and share your
                personalized skin care kit with you shortly.
              </DialogDescription>
            </div>

            <div className="mt-7">
              {assessment ? renderAssessmentCard(assessment) : null}
            </div>

            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => void handleChatWithTeam()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#168b4c] px-6 py-3 font-body text-sm font-semibold text-white shadow-[0_20px_42px_-26px_rgba(22,139,76,0.85)] transition hover:-translate-y-0.5 hover:bg-[#127640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168b4c] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat with our team
              </button>
              {photo ? (
                <p className="mt-3 font-body text-xs text-muted-foreground">
                  Your skin photo link will be included with the WhatsApp message.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-h-[92vh] flex-col">
            <div className="border-b border-[#f6e0e4] bg-white/72 px-5 pb-5 pt-6 sm:px-8">
              <DialogHeader className="pr-8 text-left">
                <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[#a1264a]">Step {step} of {TOTAL_STEPS}</p>
                <DialogTitle className="font-display text-2xl text-[#2f1720] sm:text-3xl">
                  Sharma Cosmo Clinic Skin Test
                </DialogTitle>
                <DialogDescription className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Answer a few questions to understand the root cause of your skin problems.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#f8e2e6]" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#3a2026,#d8607a,#f1a9ba)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="sr-only">{progress}% complete</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              <div key={step} className="animate-in fade-in-0 slide-in-from-right-3 duration-300">
                {renderStep()}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#f6e0e4] bg-white/76 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1 || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f2d3da] bg-white px-5 py-3 font-body text-sm font-semibold text-[#4b2a32] transition hover:bg-[#fff5f6] disabled:pointer-events-none disabled:opacity-45"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3a2026,#221217)] px-6 py-3 font-body text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(60,17,29,0.85)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-65"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Submitting...
                  </>
                ) : step === TOTAL_STEPS ? (
                  <>
                    Submit
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SkinTestModal;

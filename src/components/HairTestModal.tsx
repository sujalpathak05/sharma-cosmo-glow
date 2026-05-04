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
  buildHairTestAssessment,
  type HairTestAssessment,
  type HairTestCurrentMedicineUse,
  type HairTestFamilyHistory,
  type HairTestFamilyHistorySide,
  type HairTestFormValues,
  type HairTestGastricIssue,
  type HairTestLossPattern,
  type HairTestScalpCondition,
  normalizeIndianPhone,
  submitHairTest,
  validateHairTestPhoto,
} from "@/lib/hairTestStore";
import { cn } from "@/lib/utils";

type HairTestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type HairTestFieldError = Partial<Record<keyof HairTestFormValues | "photo" | "form", string>>;

const TOTAL_STEPS = 7;
const hairTestWhatsAppNumber = "+919810622372";

const initialValues: HairTestFormValues = {
  name: "",
  phone: "",
  age: "",
  gender: "",
  hairConcerns: [],
  lossPattern: "",
  issueDuration: "",
  familyHistory: "",
  familyHistorySide: "",
  scalpCondition: "",
  stressLevel: "",
  sleepQuality: "",
  dietType: "",
  personalHabits: [],
  gastricIssue: "",
  lifestyleDiseases: [],
  currentMedicineUse: "",
  currentMedicines: "",
  medicalCondition: "",
};

const genderOptions: HairTestFormValues["gender"][] = ["Female", "Male", "Non-binary", "Prefer not to say"];
const hairConcernOptions = [
  "Hair fall",
  "Hair thinning",
  "Bald patches",
  "Dandruff",
  "Itchy scalp",
  "Post pregnancy hair fall",
];
const lossPatternOptions: HairTestLossPattern[] = [
  "Hairline",
  "Crown",
  "Both hairline and crown",
  "Diffuse thinning / shedding",
  "Circular patches",
  "Scalp dandruff / itching",
];
const issueDurationOptions = ["Less than 1 month", "1-3 months", "3-6 months", "More than 6 months"];
const familyHistoryOptions: HairTestFamilyHistory[] = ["Yes", "No"];
const familyHistorySideOptions: HairTestFamilyHistorySide[] = [
  "Mother side",
  "Father side",
  "Both sides",
  "No known family history",
];
const scalpConditionOptions: HairTestScalpCondition[] = [
  "Healthy scalp",
  "Mild dandruff",
  "Heavy dandruff",
  "Itchy / inflamed scalp",
];
const stressLevelOptions = ["Low", "Moderate", "High", "Very high"];
const sleepQualityOptions = ["Good", "Average", "Poor", "Irregular"];
const dietTypeOptions = ["Vegetarian", "Non-vegetarian", "Vegan", "Mixed / balanced", "Irregular meals"];
const personalHabitOptions = ["Smoking", "Tobacco", "Alcohol", "No personal habit"];
const gastricIssueOptions: HairTestGastricIssue[] = ["No gastric issue", "Acidity", "Gas", "Heaviness", "Sometimes"];
const lifestyleDiseaseOptions = ["BP", "Sugar / Diabetes", "Thyroid", "Obesity", "No known lifestyle disease"];
const currentMedicineUseOptions: HairTestCurrentMedicineUse[] = ["Yes", "No"];

const fieldClass =
  "w-full rounded-2xl border border-[#eadcc4] bg-white/90 px-4 py-3 font-body text-sm text-foreground shadow-sm outline-none transition focus:border-[#d9a34a] focus:ring-2 focus:ring-[#f0d49e]";
const labelClass = "mb-2 block font-body text-sm font-semibold text-[#3b3028]";
const errorClass = "mt-1.5 font-body text-xs font-medium text-destructive";

const joinList = (items: string[]) => (items.length > 0 ? items.join(", ") : "Not selected");

const buildHairTestWhatsAppMessage = (
  formValues: HairTestFormValues,
  currentAssessment: HairTestAssessment | null,
  selectedPhoto: File | null,
) => {
  const normalizedPhone = normalizeIndianPhone(formValues.phone) ?? formValues.phone;
  const lines = [
    "Hi Sharma Cosmo Clinic, I completed the Hair Test. Please review my details.",
    `Clinic WhatsApp: ${hairTestWhatsAppNumber}`,
    "",
    "Patient details:",
    `Name: ${formValues.name || "-"}`,
    `Phone: ${normalizedPhone || "-"}`,
    `Age: ${formValues.age || "-"}`,
    `Gender: ${formValues.gender || "-"}`,
    "",
    "Hair concern:",
    `Concerns: ${joinList(formValues.hairConcerns)}`,
    `Area/pattern: ${formValues.lossPattern || "-"}`,
    `Duration: ${formValues.issueDuration || "-"}`,
    `Family history: ${formValues.familyHistory || "-"}${formValues.familyHistorySide ? ` (${formValues.familyHistorySide})` : ""}`,
    `Scalp health: ${formValues.scalpCondition || "-"}`,
    "",
    "Lifestyle:",
    `Stress: ${formValues.stressLevel || "-"}`,
    `Sleep: ${formValues.sleepQuality || "-"}`,
    `Diet: ${formValues.dietType || "-"}`,
    `Habits: ${joinList(formValues.personalHabits)}`,
    `Gastric issue: ${formValues.gastricIssue || "-"}`,
    `Lifestyle disease: ${joinList(formValues.lifestyleDiseases)}`,
    `Current medicine: ${formValues.currentMedicineUse || "-"}${formValues.currentMedicines ? ` - ${formValues.currentMedicines}` : ""}`,
    `Present condition: ${formValues.medicalCondition || "-"}`,
    `Scalp/hair photo: ${selectedPhoto ? `Captured/selected (${selectedPhoto.name}) and submitted through the Hair Test form` : "Not shared"}`,
    "",
    "Hair Test result:",
    `Likely issue: ${currentAssessment?.conditionName ?? "-"}`,
    `Summary: ${currentAssessment?.issueSummary ?? "-"}`,
    `Suggested checks: ${currentAssessment?.testsRecommended.join(", ") ?? "-"}`,
    "",
    "Please guide me with the next steps.",
  ];

  return lines.join("\n");
};

const buildHairTestWhatsAppHref = (message: string) =>
  `https://wa.me/${hairTestWhatsAppNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;

const HairTestModal = ({ open, onOpenChange }: HairTestModalProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<HairTestFormValues>(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [errors, setErrors] = useState<HairTestFieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assessment, setAssessment] = useState<HairTestAssessment | null>(null);
  const progress = useMemo(() => Math.round((step / TOTAL_STEPS) * 100), [step]);
  const hairTestWhatsAppMessage = useMemo(
    () => buildHairTestWhatsAppMessage(values, assessment, photo),
    [assessment, photo, values],
  );
  const hairTestWhatsAppHref = useMemo(
    () => buildHairTestWhatsAppHref(hairTestWhatsAppMessage),
    [hairTestWhatsAppMessage],
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

  const updateField = (field: keyof HairTestFormValues, nextValue: string) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const toggleHairConcern = (concern: string) => {
    setValues((current) => {
      const exists = current.hairConcerns.includes(concern);
      return {
        ...current,
        hairConcerns: exists
          ? current.hairConcerns.filter((item) => item !== concern)
          : [...current.hairConcerns, concern],
      };
    });
    setErrors((current) => ({ ...current, hairConcerns: undefined, form: undefined }));
  };

  const toggleExclusiveArrayValue = (
    field: "personalHabits" | "lifestyleDiseases",
    option: string,
    noneOption: string,
  ) => {
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

  const chooseOption = (field: keyof HairTestFormValues, option: string) => {
    updateField(field, option);
  };

  const chooseFamilyHistory = (option: HairTestFamilyHistory) => {
    setValues((current) => ({
      ...current,
      familyHistory: option,
      familyHistorySide: option === "No" ? "No known family history" : current.familyHistorySide === "No known family history" ? "" : current.familyHistorySide,
    }));
    setErrors((current) => ({ ...current, familyHistory: undefined, familyHistorySide: undefined, form: undefined }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhoto = event.target.files?.[0] ?? null;
    const photoError = validateHairTestPhoto(selectedPhoto);
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

        const capturedPhoto = new File([blob], `live-scalp-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        const photoError = validateHairTestPhoto(capturedPhoto);
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
    const nextErrors: HairTestFieldError = {};
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
      if (values.hairConcerns.length === 0) nextErrors.hairConcerns = "Please choose at least one concern.";
      if (!values.lossPattern) nextErrors.lossPattern = "Please select the main area or pattern of hair loss.";
    }

    if (targetStep === 3 && !values.issueDuration) {
      nextErrors.issueDuration = "Please select how long this has been happening.";
    }

    if (targetStep === 4) {
      if (!values.familyHistory) nextErrors.familyHistory = "Please select an answer.";
      if (values.familyHistory === "Yes" && (!values.familyHistorySide || values.familyHistorySide === "No known family history")) {
        nextErrors.familyHistorySide = "Please select where family hair fall is seen.";
      }
    }

    if (targetStep === 5) {
      if (!values.scalpCondition) nextErrors.scalpCondition = "Please select scalp health.";
      if (!values.stressLevel) nextErrors.stressLevel = "Please select your stress level.";
      if (!values.sleepQuality) nextErrors.sleepQuality = "Please select your sleep quality.";
      if (!values.dietType) nextErrors.dietType = "Please select your diet type.";
      if (values.personalHabits.length === 0) nextErrors.personalHabits = "Please select habit details.";
      if (!values.gastricIssue) nextErrors.gastricIssue = "Please select gastric issue status.";
      if (values.lifestyleDiseases.length === 0) nextErrors.lifestyleDiseases = "Please select lifestyle disease details.";
      if (!values.currentMedicineUse) nextErrors.currentMedicineUse = "Please select current medicine status.";
      if (values.currentMedicineUse === "Yes" && !values.currentMedicines.trim()) {
        nextErrors.currentMedicines = "Please mention current medicines or multivitamins.";
      }
      if (!values.medicalCondition.trim()) nextErrors.medicalCondition = "Write none if there is no present condition.";
    }

    const photoError = validateHairTestPhoto(photo);
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

    const nextAssessment = buildHairTestAssessment(values);
    setAssessment(nextAssessment);
    setSubmitting(true);
    const result = await submitHairTest({ ...values, photo });
    setSubmitting(false);

    if (result.mode === "invalid") {
      setErrors({ form: "Please review the highlighted details and try again." });
      toast.error("Please review the hair test details.");
      return;
    }

    setAssessment(result.assessment ?? nextAssessment);
    setSubmitted(true);
    toast.success(
      result.mode === "cloud"
        ? "Hair test submitted successfully."
        : "Hair test saved safely in this browser backup queue.",
    );
  };

  const handleChatWithTeam = () => {
    window.location.href = hairTestWhatsAppHref;
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
        "rounded-2xl border px-4 py-3 text-left font-body text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a34a] focus-visible:ring-offset-2",
        selected
          ? "border-[#c58a32] bg-[linear-gradient(135deg,#3a302a,#1f1b18)] text-white shadow-[0_16px_32px_-24px_rgba(35,27,20,0.85)]"
          : "border-[#eadcc4] bg-white/88 text-[#3b3028] hover:border-[#d9a34a] hover:bg-[#fff8ed]",
      )}
    >
      {label}
    </button>
  );

  const renderAssessmentCard = (currentAssessment: HairTestAssessment) => (
    <div className="rounded-[1.5rem] border border-[#ead7b0] bg-white/82 p-5 text-left shadow-[0_22px_55px_-42px_rgba(68,43,13,0.45)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#fff0cd] text-[#bf7e22]">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-[#a16c23]">Likely issue</p>
          <h3 className="mt-1 font-display text-2xl leading-tight text-[#2f251f]">
            {currentAssessment.conditionName}
          </h3>
          <p className="mt-2 font-body text-sm font-semibold text-[#6b4a19]">{currentAssessment.confidenceLabel}</p>
        </div>
      </div>

      <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
        {currentAssessment.issueSummary}
      </p>

      <div className="mt-5 rounded-2xl bg-[#fff8ed] p-4">
        <p className="font-body text-sm font-bold text-[#3b3028]">Medicine / care recommendation</p>
        <ul className="mt-3 space-y-2 font-body text-sm leading-relaxed text-muted-foreground">
          {currentAssessment.medicineRecommendation.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#bf7e22]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-[#eadcc4] bg-white/72 p-4">
        <p className="font-body text-sm font-bold text-[#3b3028]">Suggested checks</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
          {currentAssessment.testsRecommended.join(", ")}
        </p>
      </div>

      <p className="mt-4 rounded-2xl bg-[#2f251f] px-4 py-3 font-body text-xs leading-relaxed text-white/82">
        {currentAssessment.urgencyNote} This is an initial screening result, not a final prescription. Please confirm medicines with Sharma Cosmo Clinic doctor before starting.
      </p>
    </div>
  );

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="hair-test-name" className={labelClass}>Name *</label>
            <input
              id="hair-test-name"
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
            <label htmlFor="hair-test-phone" className={labelClass}>Phone number *</label>
            <input
              id="hair-test-phone"
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
            <label htmlFor="hair-test-age" className={labelClass}>Age *</label>
            <input
              id="hair-test-age"
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
            <p className={labelClass}>Hair concern options *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Hair concerns">
              {hairConcernOptions.map((option) =>
                renderChoice(option, values.hairConcerns.includes(option), () => toggleHairConcern(option), "checkbox"),
              )}
            </div>
            {errors.hairConcerns ? <p className={errorClass}>{errors.hairConcerns}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Area or pattern of hair loss *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Area or pattern of hair loss">
              {lossPatternOptions.map((option) =>
                renderChoice(option, values.lossPattern === option, () => chooseOption("lossPattern", option)),
              )}
            </div>
            {errors.lossPattern ? <p className={errorClass}>{errors.lossPattern}</p> : null}
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
            <p className={labelClass}>Family history of hair loss? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Family history of hair loss">
              {familyHistoryOptions.map((option) =>
                renderChoice(option, values.familyHistory === option, () => chooseFamilyHistory(option)),
              )}
            </div>
            {errors.familyHistory ? <p className={errorClass}>{errors.familyHistory}</p> : null}
          </div>

          {values.familyHistory === "Yes" ? (
            <div>
              <p className={labelClass}>Which side has hair fall? *</p>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Family history side">
                {familyHistorySideOptions
                  .filter((option) => option !== "No known family history")
                  .map((option) =>
                    renderChoice(option, values.familyHistorySide === option, () => chooseOption("familyHistorySide", option)),
                  )}
              </div>
              {errors.familyHistorySide ? <p className={errorClass}>{errors.familyHistorySide}</p> : null}
            </div>
          ) : null}
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="space-y-6">
          <div>
            <p className={labelClass}>Is your scalp healthy? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Scalp health">
              {scalpConditionOptions.map((option) =>
                renderChoice(option, values.scalpCondition === option, () => chooseOption("scalpCondition", option)),
              )}
            </div>
            {errors.scalpCondition ? <p className={errorClass}>{errors.scalpCondition}</p> : null}
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
            <p className={labelClass}>Diet type *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Diet type">
              {dietTypeOptions.map((option) =>
                renderChoice(option, values.dietType === option, () => chooseOption("dietType", option)),
              )}
            </div>
            {errors.dietType ? <p className={errorClass}>{errors.dietType}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Any personal habits? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Personal habits">
              {personalHabitOptions.map((option) =>
                renderChoice(
                  option,
                  values.personalHabits.includes(option),
                  () => toggleExclusiveArrayValue("personalHabits", option, "No personal habit"),
                  "checkbox",
                ),
              )}
            </div>
            {errors.personalHabits ? <p className={errorClass}>{errors.personalHabits}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Do you have any gastric issues? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Gastric issue">
              {gastricIssueOptions.map((option) =>
                renderChoice(option, values.gastricIssue === option, () => chooseOption("gastricIssue", option)),
              )}
            </div>
            {errors.gastricIssue ? <p className={errorClass}>{errors.gastricIssue}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Do you have any lifestyle disease? * <span className="font-normal text-muted-foreground">(select all that apply)</span></p>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Lifestyle disease">
              {lifestyleDiseaseOptions.map((option) =>
                renderChoice(
                  option,
                  values.lifestyleDiseases.includes(option),
                  () => toggleExclusiveArrayValue("lifestyleDiseases", option, "No known lifestyle disease"),
                  "checkbox",
                ),
              )}
            </div>
            {errors.lifestyleDiseases ? <p className={errorClass}>{errors.lifestyleDiseases}</p> : null}
          </div>

          <div>
            <p className={labelClass}>Are you taking any medicine or multivitamin presently? *</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Current medicine use">
              {currentMedicineUseOptions.map((option) =>
                renderChoice(option, values.currentMedicineUse === option, () => chooseOption("currentMedicineUse", option)),
              )}
            </div>
            {errors.currentMedicineUse ? <p className={errorClass}>{errors.currentMedicineUse}</p> : null}
          </div>

          {values.currentMedicineUse === "Yes" ? (
            <div>
              <label htmlFor="hair-test-current-medicines" className={labelClass}>Medicine or multivitamin names *</label>
              <textarea
                id="hair-test-current-medicines"
                rows={2}
                value={values.currentMedicines}
                onChange={(event) => updateField("currentMedicines", event.target.value)}
                className={cn(fieldClass, "resize-none", errors.currentMedicines && "border-destructive focus:border-destructive focus:ring-destructive/25")}
                maxLength={400}
                placeholder="Medicine, supplement, or multivitamin names"
              />
              {errors.currentMedicines ? <p className={errorClass}>{errors.currentMedicines}</p> : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="hair-test-medical-condition" className={labelClass}>Share your present condition *</label>
            <textarea
              id="hair-test-medical-condition"
              rows={3}
              value={values.medicalCondition}
              onChange={(event) => updateField("medicalCondition", event.target.value)}
              className={cn(fieldClass, "resize-none", errors.medicalCondition && "border-destructive focus:border-destructive focus:ring-destructive/25")}
              maxLength={500}
              placeholder="Thyroid, PCOS, diabetes, recent illness, postpartum status, or none"
            />
            {errors.medicalCondition ? <p className={errorClass}>{errors.medicalCondition}</p> : null}
          </div>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div>
          <p className={labelClass}>Upload scalp/hair photo optional</p>
          <div className="rounded-[1.5rem] border border-dashed border-[#d9b36d] bg-white/80 px-5 py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0cd] text-[#bf7e22]">
              {photo ? <CheckCircle2 className="h-6 w-6" aria-hidden="true" /> : <Camera className="h-6 w-6" aria-hidden="true" />}
            </div>
            <p className="font-body text-sm font-semibold text-[#3b3028]">
              {photo ? photo.name : "Share a live scalp photo or upload an image"}
            </p>
            <p className="mt-2 font-body text-xs text-muted-foreground">
              Camera preview opens here. Capture a live photo, or upload JPG, PNG, WEBP, HEIC, or HEIF up to 8 MB.
            </p>

            {photoPreviewUrl ? (
              <div className="mx-auto mt-5 max-w-sm overflow-hidden rounded-[1.25rem] border border-[#ead7b0] bg-white shadow-sm">
                <img src={photoPreviewUrl} alt="Captured scalp preview" className="aspect-[4/3] w-full object-cover" />
              </div>
            ) : null}

            {cameraActive ? (
              <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[#ead7b0] bg-[#1f1b18]">
                <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full object-cover" />
                <div className="grid gap-3 bg-white/95 p-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={captureLivePhoto}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3a302a,#1f1b18)] px-5 py-3 font-body text-sm font-semibold text-white shadow-[0_18px_36px_-28px_rgba(32,24,18,0.85)] transition hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Capture photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center justify-center rounded-full border border-[#e4c07d] bg-white px-5 py-3 font-body text-sm font-semibold text-[#6b4a19] transition hover:bg-[#fff8ed] active:scale-[0.98]"
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3a302a,#1f1b18)] px-5 py-3 font-body text-sm font-semibold text-white shadow-[0_18px_36px_-28px_rgba(32,24,18,0.85)] transition hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Take live photo
              </button>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e4c07d] bg-white px-5 py-3 font-body text-sm font-semibold text-[#6b4a19] transition hover:bg-[#fff8ed] active:scale-[0.98]">
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
              className="mt-3 rounded-full border border-[#e4c07d] bg-white px-4 py-2 font-body text-xs font-semibold text-[#6b4a19] transition hover:bg-[#fff8ed]"
            >
              Remove photo
            </button>
          ) : null}
          {errors.photo ? <p className={errorClass}>{errors.photo}</p> : null}
        </div>
      );
    }

    const reviewAssessment = buildHairTestAssessment(values);

    return (
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-[#eadcc4] bg-white/78 p-5">
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[#a16c23]">Review your hair test</p>
          <div className="mt-4 grid gap-3 font-body text-sm text-muted-foreground sm:grid-cols-2">
            <p><span className="font-semibold text-foreground">Name:</span> {values.name}</p>
            <p><span className="font-semibold text-foreground">Phone:</span> {normalizeIndianPhone(values.phone) ?? values.phone}</p>
            <p><span className="font-semibold text-foreground">Age:</span> {values.age}</p>
            <p><span className="font-semibold text-foreground">Gender:</span> {values.gender}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-foreground">Concerns:</span> {values.hairConcerns.join(", ")}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-foreground">Pattern:</span> {values.lossPattern}</p>
            <p><span className="font-semibold text-foreground">Duration:</span> {values.issueDuration}</p>
            <p><span className="font-semibold text-foreground">Family history:</span> {values.familyHistorySide || values.familyHistory}</p>
            <p><span className="font-semibold text-foreground">Scalp:</span> {values.scalpCondition}</p>
            <p><span className="font-semibold text-foreground">Stress:</span> {values.stressLevel}</p>
            <p><span className="font-semibold text-foreground">Sleep:</span> {values.sleepQuality}</p>
            <p><span className="font-semibold text-foreground">Diet:</span> {values.dietType}</p>
            <p><span className="font-semibold text-foreground">Habits:</span> {values.personalHabits.join(", ")}</p>
            <p><span className="font-semibold text-foreground">Gastric:</span> {values.gastricIssue}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-foreground">Lifestyle disease:</span> {values.lifestyleDiseases.join(", ")}</p>
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
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-3xl overflow-hidden rounded-[2rem] border-[#ead7b0] bg-[linear-gradient(180deg,#fffdf9,#fff7e9)] p-0 shadow-[0_34px_90px_-48px_rgba(39,28,18,0.75)] sm:rounded-[2rem]">
        {submitted ? (
          <div className="max-h-[92vh] overflow-y-auto px-5 py-8 sm:px-10">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0cd] text-[#bf7e22]">
                <ShieldCheck className="h-9 w-9" aria-hidden="true" />
              </div>
              <DialogTitle className="font-display text-3xl text-[#2f251f]">Your Hair Test Result</DialogTitle>
              <DialogDescription className="mx-auto mt-3 max-w-md font-body text-base leading-relaxed text-muted-foreground">
                Thank you! Our Sharma Cosmo Clinic hair expert will contact you soon.
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
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-h-[92vh] flex-col">
            <div className="border-b border-[#f0dfc3] bg-white/72 px-5 pb-5 pt-6 sm:px-8">
              <DialogHeader className="pr-8 text-left">
                <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[#b47a27]">Step {step} of {TOTAL_STEPS}</p>
                <DialogTitle className="font-display text-2xl text-[#2f251f] sm:text-3xl">
                  Sharma Cosmo Clinic Hair Test
                </DialogTitle>
                <DialogDescription className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Answer a few questions to understand the root cause of your hair problems.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#f2e5cf]" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#3a302a,#d8a24a,#f1d99e)] transition-all duration-500"
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

            <div className="flex flex-col-reverse gap-3 border-t border-[#f0dfc3] bg-white/76 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1 || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ead7b0] bg-white px-5 py-3 font-body text-sm font-semibold text-[#4b3b30] transition hover:bg-[#fff8ed] disabled:pointer-events-none disabled:opacity-45"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3a302a,#1f1b18)] px-6 py-3 font-body text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(32,24,18,0.85)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-65"
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

export default HairTestModal;

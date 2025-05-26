// studentFormOptions.ts
export type OptionType = { value: string; label: string; };

export const genderOptions: OptionType[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

export const transportModeOptions: OptionType[] = [
  { value: "School Provided", label: "School Provided" },
  { value: "Personal", label: "Personal" },
  { value: "Private", label: "Private" }
];

export const religionOptions: OptionType[] = [
  { value: "Christianity", label: "Christianity" },
  { value: "Islam", label: "Islam" },
  { value: "Hinduism", label: "Hinduism" },
  { value: "Buddhism", label: "Buddhism" },
  { value: "Judaism", label: "Judaism" },
  { value: "Sikhism", label: "Sikhism" },
  { value: "Traditional/Indigenous Religions", label: "Traditional/Indigenous Religions" },
  { value: "Baháʼí Faith", label: "Baháʼí Faith" },
  { value: "Jainism", label: "Jainism" },
  { value: "Shinto", label: "Shinto" },
  { value: "Taoism", label: "Taoism" },
  { value: "Zoroastrianism", label: "Zoroastrianism" },
  { value: "No Religion / Atheist / Agnostic", label: "No Religion / Atheist / Agnostic" }
];

export const bloodGroupOptions: OptionType[] = [
  { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
  { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" }, { value: "O-", label: "O-" }
];

export const classEnrolledOptions: OptionType[] = [
  { value: "Nursery / Pre-Nursery / Playgroup", label: "Nursery / Pre-Nursery / Playgroup" },
  { value: "LKG / KG1", label: "LKG / KG1" },
  { value: "UKG / KG2", label: "UKG / KG2" },
  { value: "Grade 1 / Class 1", label: "Grade 1 / Class 1" },
  { value: "Grade 2 / Class 2", label: "Grade 2 / Class 2" },
  { value: "Grade 3 / Class 3", label: "Grade 3 / Class 3" },
  { value: "Grade 4 / Class 4", label: "Grade 4 / Class 4" },
  { value: "Grade 5 / Class 5", label: "Grade 5 / Class 5" },
  { value: "Grade 6 / Class 6", label: "Grade 6 / Class 6" },
  { value: "Grade 7 / Class 7", label: "Grade 7 / Class 7" },
  { value: "Grade 8 / Class 8", label: "Grade 8 / Class 8" },
  { value: "Grade 9 / Class 9", label: "Grade 9 / Class 9" },
  { value: "Grade 10 / Class 10", label: "Grade 10 / Class 10" },
  { value: "Grade 11 / Class 11", label: "Grade 11 / Class 11" },
  { value: "Grade 12 / Class 12", label: "Grade 12 / Class 12" }
];

export const healthIssuesOptions: OptionType[] = [
  { value: "None", label: "None" }, { value: "Asthma", label: "Asthma" },
  { value: "Diabetes", label: "Diabetes" }, { value: "Epilepsy", label: "Epilepsy" },
  { value: "Allergies", label: "Allergies" }, { value: "Heart Condition", label: "Heart Condition" },
  { value: "Vision Impairment", label: "Vision Impairment" }, { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Physical Disability", label: "Physical Disability" }, { value: "Other (please specify)", label: "Other (please specify)" }
];

export const specialNeedsOptions: OptionType[] = [
  { value: "None", label: "None" },
  { value: "Autism Spectrum Disorder (ASD)", label: "Autism Spectrum Disorder (ASD)" },
  { value: "Attention Deficit Hyperactivity Disorder (ADHD)", label: "Attention Deficit Hyperactivity Disorder (ADHD)" },
  { value: "Dyslexia", label: "Dyslexia" },
  { value: "Speech/Language Disorder", label: "Speech/Language Disorder" },
  { value: "Learning Disability", label: "Learning Disability" },
  { value: "Intellectual Disability", label: "Intellectual Disability" },
  { value: "Emotional/Behavioral Disorder", label: "Emotional/Behavioral Disorder" },
  { value: "Physical Disability", label: "Physical Disability" },
  { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Visual Impairment", label: "Visual Impairment" },
  { value: "Developmental Delay", label: "Developmental Delay" },
  { value: "Gifted/Talented", label: "Gifted/Talented" },
  { value: "Other", label: "Other" }
];

export const steps = [
  "Personal Info",
  "Student Photo",
  "Family/Guardian",
  "Admission & Previous",
  "Contact & Address",
  "Medical & Other"
];

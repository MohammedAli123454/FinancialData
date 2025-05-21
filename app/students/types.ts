export type Student = {
    id: number;
    admissionNumber: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    nationality?: string | null;
    religion?: string | null;
    category?: string | null;
    bloodGroup?: string | null;
    motherTongue?: string | null;
    photoUrl?: string | null;
    admissionDate: string;
    classEnrolled: string;
    section?: string | null;
    previousSchool?: string | null;
    transferCertificateNo?: string | null;
    fatherName?: string | null;
    fatherOccupation?: string | null;
    motherName?: string | null;
    motherOccupation?: string | null;
    guardianName?: string | null;
    guardianRelation?: string | null;
    contactPhonePrimary: string;
    contactPhoneSecondary?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    aadharNumber?: string | null;
    healthIssues?: string | null;
    specialNeeds?: string | null;
    transportMode?: string | null;
    remarks?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  
  // Use Omit for form values (id, timestamps not required)
  export type StudentForm = Omit<Student, "id" | "createdAt" | "updatedAt">;
  
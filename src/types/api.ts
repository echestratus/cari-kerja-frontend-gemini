export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  WIDOWED = 'WIDOWED',
  DIVORCED = 'DIVORCED',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  REMOTE = 'REMOTE',
  INTERNSHIP = 'INTERNSHIP'
}

export enum VacancyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  VIEWED = 'VIEWED',
  INTERVIEW = 'INTERVIEW',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  createdAt: string;
  _count?: {
    jobVacancies: number;
  };
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  _count?: {
    jobVacancies: number;
  };
  subCategories?: SubCategory[];
}

export interface Industry {
  id: number;
  name: string;
  createdAt: string;
}

export interface Country {
  id: number;
  name: string;
  isoAlpha2: string;
  isoAlpha3: string;
  currencyCode: string;
  currencySymbol: string;
  phoneCode: string;
  createdAt: string;
}

export interface City {
  id: number;
  name: string;
  countryId: number;
  createdAt: string;
  country?: Country;
}

export interface Certificate {
  id: string;
  jobSeekerId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  name: string;
  normalizedName: string;
  createdAt: string;
}

export interface Experience {
  id: string;
  jobSeekerId: string;
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string | null;
  isCurrentJob: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  jobSeekerId: string;
  degree: string | null;
  institutionName: string;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  gpa: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobSeeker {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  cityId: number | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  portfolioUrl: string | null;
  linkedInUrl: string | null;
  summary: string | null;
  willingToRelocate: boolean;
  maritalStatus: MaritalStatus | null;
  taxId: string | null;
  dependents: number | null;
  nationality: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  city?: City;
  resumes?: Resume[];
  skills?: Skill[];
  experiences?: Experience[];
  educations?: Education[];
  certificates?: Certificate[];
}

export interface Resume {
  id: string;
  jobSeekerId: string;
  jobTitle: string;
  expectedSalary: number | null;
  fileUrl: string | null;
  isSearchable: boolean;
  createdAt: string;
  updatedAt: string;
  jobSeeker?: JobSeeker;
  subCategories?: SubCategory[];
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  companyDescription: string | null;
  website: string | null;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  cityId: number | null;
  employeeSize: string | null;
  industryId: number | null;
  verificationStatus: VerificationStatus;
  jobPostingQuota: number;
  resumeViewQuota: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  city?: City;
  industry?: Industry;
  jobVacancies?: JobVacancy[];
}

export interface JobVacancy {
  id: string;
  employerId: string;
  cityId: number;
  title: string;
  description: string;
  requirements: string;
  salaryMin: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isSalaryVisible?: boolean;
  employmentType: EmploymentType;
  status: VacancyStatus;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  employer?: Employer;
  city?: City;
  subCategories?: SubCategory[];
  skills?: Skill[];
}

export interface Application {
  id: string;
  vacancyId: string;
  resumeId: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  vacancy?: JobVacancy;
  resume?: Resume;
}

export interface ApplicationLog {
  id: string;
  applicationId: string;
  oldStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedBy: UserRole;
  createdAt: string;
}

export interface Transaction {
  id: string;
  employerId: string;
  orderId: string;
  amount: number;
  package: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface SavedJob {
  id: string;
  jobSeekerId: string;
  vacancyId: string;
  createdAt: string;
  vacancy?: JobVacancy;
}

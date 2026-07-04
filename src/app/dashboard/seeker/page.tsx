"use client";

import { useState, useEffect, useRef } from "react";
import { ApplicationStatus, Application, SavedJob, PaginatedResponse, JobVacancy, Gender, MaritalStatus, Skill, Experience, Education, Country, City } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { RoleGuard } from "@/components/RoleGuard";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Briefcase, Building2, MapPin, Clock, Trash2, CheckCircle2, XCircle, Loader2, User as UserIcon, FileText, Settings, ShieldAlert, Check, Search, Plus, Edit2, GraduationCap, UploadCloud, X, Printer, Eye } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewResumeDialog from './ViewResumeDialog';

export default function SeekerDashboard() {
  const { user, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    portfolioUrl: "",
    linkedInUrl: "",
    summary: "",
    countryId: "",
    cityId: "",
    willingToRelocate: false,
    maritalStatus: "",
    taxId: "",
    dependents: 0,
    nationality: ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user?.jobSeeker) {
      setFormData({
        fullName: user.jobSeeker.fullName || "",
        phone: user.jobSeeker.phone || "",
        dateOfBirth: user.jobSeeker.dateOfBirth ? user.jobSeeker.dateOfBirth.slice(0, 10) : "",
        gender: user.jobSeeker.gender || "",
        portfolioUrl: user.jobSeeker.portfolioUrl || "",
        linkedInUrl: user.jobSeeker.linkedInUrl || "",
        summary: user.jobSeeker.summary || "",
        countryId: user.jobSeeker.city?.countryId?.toString() || "",
        cityId: user.jobSeeker.cityId?.toString() || "",
        willingToRelocate: user.jobSeeker.willingToRelocate || false,
        maritalStatus: user.jobSeeker.maritalStatus || "",
        taxId: user.jobSeeker.taxId || "",
        dependents: user.jobSeeker.dependents || 0,
        nationality: user.jobSeeker.nationality || ""
      });
    }
  }, [user]);

  // -- Countries & Cities State --
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await apiClient.get<Country[]>('/countries');
      return res.data;
    }
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', formData.countryId],
    queryFn: async () => {
      if (!formData.countryId) return [];
      const res = await apiClient.get<City[]>(`/cities?countryId=${formData.countryId}`);
      return res.data;
    },
    enabled: !!formData.countryId
  });

  // -- Experience State & Mutations --
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState({ jobTitle: "", companyName: "", startDate: "", endDate: "", isCurrentJob: false, description: "" });
  const [isSavingExp, setIsSavingExp] = useState(false);

  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingExpId(exp.id);
      setExpForm({
        jobTitle: exp.jobTitle,
        companyName: exp.companyName,
        startDate: exp.startDate ? exp.startDate.slice(0, 10) : "",
        endDate: exp.endDate ? exp.endDate.slice(0, 10) : "",
        isCurrentJob: exp.isCurrentJob,
        description: exp.description || ""
      });
    } else {
      setEditingExpId(null);
      setExpForm({ jobTitle: "", companyName: "", startDate: "", endDate: "", isCurrentJob: false, description: "" });
    }
    setExpModalOpen(true);
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingExp(true);
    try {
      const payload: any = { ...expForm };
      payload.startDate = new Date(payload.startDate).toISOString();
      if (!payload.isCurrentJob && payload.endDate) {
        payload.endDate = new Date(payload.endDate).toISOString();
      } else {
        payload.endDate = null;
      }
      
      if (editingExpId) {
        await apiClient.put(`/job-seekers/experience/${editingExpId}`, payload);
      } else {
        await apiClient.post(`/job-seekers/experience`, payload);
      }
      await checkAuth();
      setExpModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save experience");
    } finally {
      setIsSavingExp(false);
    }
  };

  const deleteExp = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      await apiClient.delete(`/job-seekers/experience/${id}`);
      await checkAuth();
    } catch (err) {
      console.error(err);
    }
  };

  // -- Education State & Mutations --
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState({ degree: "", institutionName: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" });
  const [isSavingEdu, setIsSavingEdu] = useState(false);

  const openEduModal = (edu?: Education) => {
    if (edu) {
      setEditingEduId(edu.id);
      setEduForm({
        degree: edu.degree || "",
        institutionName: edu.institutionName,
        fieldOfStudy: edu.fieldOfStudy || "",
        startDate: edu.startDate ? edu.startDate.slice(0, 10) : "",
        endDate: edu.endDate ? edu.endDate.slice(0, 10) : "",
        gpa: edu.gpa ? edu.gpa.toString() : ""
      });
    } else {
      setEditingEduId(null);
      setEduForm({ degree: "", institutionName: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" });
    }
    setEduModalOpen(true);
  };

  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdu(true);
    try {
      const payload: any = { ...eduForm };
      payload.startDate = new Date(payload.startDate).toISOString();
      if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();
      else payload.endDate = null;
      if (payload.gpa) payload.gpa = parseFloat(payload.gpa);
      else payload.gpa = null;
      
      if (editingEduId) {
        await apiClient.put(`/job-seekers/education/${editingEduId}`, payload);
      } else {
        await apiClient.post(`/job-seekers/education`, payload);
      }
      await checkAuth();
      setEduModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save education");
    } finally {
      setIsSavingEdu(false);
    }
  };

  const deleteEdu = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      await apiClient.delete(`/job-seekers/education/${id}`);
      await checkAuth();
    } catch (err) {
      console.error(err);
    }
  };

  // -- Skills State & Mutations --
  const [skillsSearch, setSkillsSearch] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [isSyncingSkills, setIsSyncingSkills] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (skillsSearch.trim().length > 1) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await apiClient.get(`/skills?q=${encodeURIComponent(skillsSearch)}`);
          setSuggestedSkills(res.data);
        } catch (err) {
          console.error(err);
        }
      }, 300);
    } else {
      setSuggestedSkills([]);
    }
  }, [skillsSearch]);

  const addSkill = async (skillName: string) => {
    const currentSkills = user?.jobSeeker?.skills?.map(s => s.name) || [];
    if (currentSkills.includes(skillName)) return;
    
    setIsSyncingSkills(true);
    try {
      const newSkillsList = [...currentSkills, skillName];
      await apiClient.patch('/job-seekers/skills', { skills: newSkillsList });
      await checkAuth();
      setSkillsSearch("");
      setSuggestedSkills([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingSkills(false);
    }
  };

  const removeSkill = async (skillName: string) => {
    const currentSkills = user?.jobSeeker?.skills?.map(s => s.name) || [];
    const newSkillsList = currentSkills.filter(s => s !== skillName);
    setIsSyncingSkills(true);
    try {
      await apiClient.patch('/job-seekers/skills', { skills: newSkillsList });
      await checkAuth();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingSkills(false);
    }
  };


  // -- Certificate State & Mutations --
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    credentialId: "",
    credentialUrl: ""
  });
  const [isSavingCert, setIsSavingCert] = useState(false);

  const openCreateCertModal = () => {
    setEditingCertId(null);
    setCertForm({ name: "", issuingOrganization: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "" });
    setCertModalOpen(true);
  };

  const openEditCertModal = (cert: any) => {
    setEditingCertId(cert.id);
    setCertForm({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate.split('T')[0],
      expirationDate: cert.expirationDate ? cert.expirationDate.split('T')[0] : "",
      credentialId: cert.credentialId || "",
      credentialUrl: cert.credentialUrl || ""
    });
    setCertModalOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCert(true);
    try {
      const payload: any = { ...certForm };
      if (!payload.expirationDate) payload.expirationDate = null;
      if (!payload.credentialId) payload.credentialId = null;
      if (!payload.credentialUrl) payload.credentialUrl = null;

      if (editingCertId) {
        await apiClient.put(`/job-seekers/certificate/${editingCertId}`, payload);
      } else {
        await apiClient.post(`/job-seekers/certificate`, payload);
      }
      await checkAuth();
      setCertModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save certificate");
    } finally {
      setIsSavingCert(false);
    }
  };

  const deleteCert = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      await apiClient.delete(`/job-seekers/certificate/${id}`);
      await checkAuth();
    } catch (err) {
      console.error(err);
    }
  };


  // -- CV Upload & Resume Profile State --
  const [uploadingCv, setUploadingCv] = useState(false);
  const [selectedResumeForUpload, setSelectedResumeForUpload] = useState<string | null>(null);
  
  // Full CRUD state
  const [resumeModal, setResumeModal] = useState<{isOpen: boolean, mode: 'create'|'edit', id: string | null}>({isOpen: false, mode: 'create', id: null});
  const [resumeForm, setResumeForm] = useState<{
    jobTitle: string;
    subCategoryId: string;
    professionalSummary: string;
    experienceIds: string[];
    educationIds: string[];
    skillIds: number[];
    certificateIds: string[];
  }>({ jobTitle: "", subCategoryId: "", professionalSummary: "", experienceIds: [], educationIds: [], skillIds: [], certificateIds: [] });
  const [isSavingResume, setIsSavingResume] = useState(false);
  
  const [deleteResumeModal, setDeleteResumeModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [viewResumeModal, setViewResumeModal] = useState<{isOpen: boolean, resume: any | null}>({isOpen: false, resume: null});
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Categories for Resume Profile
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data;
    }
  });

  const handleOpenCreateResume = () => {
    setResumeForm({ 
      jobTitle: "", 
      subCategoryId: "",
      professionalSummary: "",
      experienceIds: [],
      educationIds: [],
      skillIds: [],
      certificateIds: []
    });
    setResumeModal({ isOpen: true, mode: 'create', id: null });
  };

  const handleOpenEditResume = (resume: any) => {
    setResumeForm({ 
      jobTitle: resume.jobTitle, 
      subCategoryId: resume.subCategories?.[0]?.id?.toString() || "",
      professionalSummary: resume.professionalSummary || "",
      experienceIds: resume.experiences?.map((e: any) => e.id) || [],
      educationIds: resume.educations?.map((e: any) => e.id) || [],
      skillIds: resume.skills?.map((s: any) => s.id) || [],
      certificateIds: resume.certificates?.map((c: any) => c.id) || []
    });
    setResumeModal({ isOpen: true, mode: 'edit', id: resume.id });
  };

  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingResume(true);
    try {
      const payload = {
        jobTitle: resumeForm.jobTitle,
        subCategoryIds: [parseInt(resumeForm.subCategoryId)],
        professionalSummary: resumeForm.professionalSummary,
        experienceIds: resumeForm.experienceIds,
        educationIds: resumeForm.educationIds,
        skillIds: resumeForm.skillIds,
        certificateIds: resumeForm.certificateIds
      };
      
      if (resumeModal.mode === 'create') {
        await apiClient.post('/resumes', payload);
        alert("Resume profile created successfully!");
      } else if (resumeModal.mode === 'edit' && resumeModal.id) {
        await apiClient.patch(`/resumes/${resumeModal.id}`, payload);
        alert("Resume profile updated successfully!");
      }
      await checkAuth();
      setResumeModal({ isOpen: false, mode: 'create', id: null });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save resume profile");
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!deleteResumeModal.id) return;
    setIsDeletingResume(true);
    try {
      await apiClient.delete(`/resumes/${deleteResumeModal.id}`);
      await checkAuth();
      alert("Resume profile deleted successfully!");
      setDeleteResumeModal({ isOpen: false, id: null });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete resume profile");
    } finally {
      setIsDeletingResume(false);
    }
  };

  const triggerUploadCv = (resumeId: string) => {
    setSelectedResumeForUpload(resumeId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedResumeForUpload) return;

    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await apiClient.post(`/resumes/${selectedResumeForUpload}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await checkAuth(); 
      alert("CV Uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload CV");
    } finally {
      setUploadingCv(false);
      setSelectedResumeForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fetch Applications
  const { data: appsData, isLoading: loadingApps } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<Application>>('/applications?limit=100');
      return res.data;
    }
  });

  // Fetch Saved Jobs
  const { data: savedJobsData, isLoading: loadingSaved } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const res = await apiClient.get<SavedJob[]>('/saved-jobs');
      return res.data;
    }
  });

  // Withdraw Mutation
  const withdrawMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      await apiClient.patch(`/applications/${applicationId}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    }
  });

  // Unsave Mutation
  const unsaveMutation = useMutation({
    mutationFn: async (vacancyId: string) => {
      await apiClient.delete(`/saved-jobs/${vacancyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    }
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case ApplicationStatus.VIEWED:
      case ApplicationStatus.INTERVIEW: return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Review</Badge>;
      case ApplicationStatus.HIRED: return <Badge variant="secondary" className="bg-green-100 text-green-800">Hired</Badge>;
      case ApplicationStatus.REJECTED: return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      case ApplicationStatus.WITHDRAWN: return <Badge variant="outline" className="text-zinc-500">Withdrawn</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const applications = appsData?.data || [];
  const savedJobs = savedJobsData || [];

  const totalApplied = applications.length;
  const activeApps = applications.filter(a => [ApplicationStatus.APPLIED, ApplicationStatus.VIEWED, ApplicationStatus.INTERVIEW].includes(a.status)).length;
  const hiredApps = applications.filter(a => a.status === ApplicationStatus.HIRED).length;
  const totalSaved = savedJobs.length;

  // Calculate Profile Completion
  const calcCompletion = () => {
    const fields = ['fullName', 'phone', 'dateOfBirth', 'gender', 'nationality', 'maritalStatus', 'linkedInUrl', 'dependents'];
    let filled = 0;
    fields.forEach(f => {
      if (formData[f as keyof typeof formData] !== "" && formData[f as keyof typeof formData] !== null) filled++;
    });
    // also check if they have at least 1 exp, edu, skill
    if (user?.jobSeeker?.experiences?.length) filled++;
    if (user?.jobSeeker?.educations?.length) filled++;
    if (user?.jobSeeker?.skills?.length) filled++;
    return Math.round((filled / (fields.length + 3)) * 100);
  };
  const completionPercentage = calcCompletion();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const payload: any = { ...formData };
      if (payload.dependents === "") payload.dependents = null;
      else payload.dependents = parseInt(payload.dependents, 10);
      
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      else payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();

      if (!payload.gender) delete payload.gender;
      if (!payload.maritalStatus) delete payload.maritalStatus;

      if (payload.cityId) payload.cityId = parseInt(payload.cityId, 10);
      else payload.cityId = null;
      delete payload.countryId; // We don't send countryId to the backend for JobSeeker update

      await apiClient.patch('/job-seekers/profile', payload);
      await checkAuth(); // Refresh user data
      setProfileSuccess(true);
      setAvatarError(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Check console for details.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      await apiClient.post('/job-seekers/avatar/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await checkAuth(); 
      alert("Profile photo updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload profile photo");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  return (
    <RoleGuard allowedRoles={["JOB_SEEKER"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
               <UserIcon className="w-5 h-5 text-blue-600" />
               My Dashboard
            </div>
            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="outline">Browse Jobs</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 bg-zinc-200/50 dark:bg-zinc-900 p-1 rounded-xl flex flex-wrap h-auto gap-2">
                <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="basic-profile" className="rounded-lg">Personal Info</TabsTrigger>
                <TabsTrigger value="professional" className="rounded-lg">Professional Background</TabsTrigger>
                <TabsTrigger value="resumes" className="rounded-lg">My Resumes & CV</TabsTrigger>
                <TabsTrigger value="applications" className="rounded-lg">Applications</TabsTrigger>
                <TabsTrigger value="saved" className="rounded-lg">Saved Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-0">
                {completionPercentage < 100 ? (
                   <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900/50 shadow-none mb-6">
                     <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                       <div className="p-3 bg-orange-100 text-orange-600 rounded-full dark:bg-orange-800 dark:text-orange-200">
                         <ShieldAlert className="w-6 h-6" />
                       </div>
                       <div className="flex-1 space-y-2 text-center sm:text-left">
                         <h3 className="font-bold text-orange-900 dark:text-orange-100">Complete your profile to stand out!</h3>
                         <p className="text-orange-700 dark:text-orange-300 text-sm">Your profile is only {completionPercentage}% complete. Make sure to add experiences, education, and skills.</p>
                         <div className="w-full bg-orange-200 dark:bg-orange-950 rounded-full h-2.5 mt-2">
                            <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
                         </div>
                       </div>
                       <div className="flex gap-2 flex-col sm:flex-row">
                          <Button onClick={() => setActiveTab("basic-profile")} className="bg-orange-600 hover:bg-orange-700 text-white shrink-0">
                            Personal Info
                          </Button>
                          <Button onClick={() => setActiveTab("professional")} variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-100 shrink-0">
                            Add Experience
                          </Button>
                       </div>
                     </CardContent>
                   </Card>
                ) : (
                   <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/50 shadow-none mb-6">
                     <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                       <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-800 dark:text-green-200">
                         <CheckCircle2 className="w-6 h-6" />
                       </div>
                       <div className="flex-1 space-y-2 text-center sm:text-left">
                         <h3 className="font-bold text-green-900 dark:text-green-100">Profile 100% Complete!</h3>
                         <p className="text-green-700 dark:text-green-300 text-sm">Outstanding work. A complete profile makes you 3x more likely to be contacted by recruiters.</p>
                         <div className="w-full bg-green-200 dark:bg-green-950 rounded-full h-2.5 mt-2">
                            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `100%` }}></div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="text-sm font-medium text-zinc-500 mb-1">Total Applied</div>
                      <div className="text-3xl font-bold">{totalApplied}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="text-sm font-medium text-blue-500 mb-1">Active Applications</div>
                      <div className="text-3xl font-bold text-blue-600">{activeApps}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="text-sm font-medium text-green-500 mb-1">Hired</div>
                      <div className="text-3xl font-bold text-green-600">{hiredApps}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="text-sm font-medium text-purple-500 mb-1">Saved Jobs</div>
                      <div className="text-3xl font-bold text-purple-600">{totalSaved}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                   <Card className="border-0 shadow-md group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("resumes")}>
                     <CardContent className="p-8 text-center space-y-4">
                       <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-900/40 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                         <FileText className="w-8 h-8" />
                       </div>
                       <h3 className="font-bold text-xl">My Resumes & CV</h3>
                       <p className="text-zinc-500 text-sm">Upload your PDF/DOC resume or create a new ATS-friendly one using our builder.</p>
                       <Button variant="outline" className="w-full mt-2 pointer-events-none">Manage Resumes</Button>
                     </CardContent>
                   </Card>
                   
                   <Card className="border-0 shadow-md group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("professional")}>
                     <CardContent className="p-8 text-center space-y-4">
                       <div className="w-16 h-16 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Briefcase className="w-8 h-8" />
                       </div>
                       <h3 className="font-bold text-xl">Professional Background</h3>
                       <p className="text-zinc-500 text-sm">Update your work experiences, education history, and highlight your top skills.</p>
                       <Button variant="outline" className="w-full mt-2 pointer-events-none">Edit Background</Button>
                     </CardContent>
                   </Card>
                </div>
              </TabsContent>

              <TabsContent value="basic-profile" className="mt-0">
                <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
                  <div className="border-b px-8 py-6 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Personal Information</h2>
                      <p className="text-zinc-500 text-sm mt-1">Update your details to help recruiters find you.</p>
                    </div>
                    {profileSuccess && (
                      <Badge className="bg-green-100 text-green-800 px-3 py-1 animate-pulse"><Check className="w-3 h-3 mr-1"/> Saved</Badge>
                    )}
                  </div>
                  <CardContent className="p-8">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-950 shadow-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          {user?.jobSeeker?.avatarUrl && !avatarError ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','') || 'http://localhost:3000'}${user.jobSeeker.avatarUrl}`} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                              onError={() => setAvatarError(true)}
                            />
                          ) : (
                            <UserIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
                          )}
                        </div>
                        <Button 
                          size="icon" 
                          className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-sm"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        </Button>
                        <input type="file" ref={avatarInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={handleAvatarUpload} />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="font-bold text-lg">Profile Photo</h3>
                        <p className="text-sm text-zinc-500 mb-2">Upload a professional photo to stand out to recruiters.</p>
                        <p className="text-xs text-zinc-400">JPG, JPEG or PNG. Max size 5MB.</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 border-b pb-2">Basic Info</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium leading-none mb-1 block">Full Name</label>
                            <Input value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium leading-none mb-1 block">Phone Number</label>
                            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+62..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <label className="text-sm font-medium leading-none mb-1 block">Date of Birth</label>
                               <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                               <label className="text-sm font-medium leading-none mb-1 block">Gender</label>
                               <select 
                                 className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                 value={formData.gender} 
                                 onChange={(e) => setFormData({...formData, gender: e.target.value})}
                               >
                                 <option value="">Select Gender</option>
                                 <option value="MALE">Male</option>
                                 <option value="FEMALE">Female</option>
                                 <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                               </select>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <label className="text-sm font-medium leading-none mb-1 block">Country of Residence</label>
                               <select 
                                 className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                 value={formData.countryId} 
                                 onChange={(e) => setFormData({...formData, countryId: e.target.value, cityId: ""})}
                               >
                                 <option value="">Select Country</option>
                                 {countries.map(country => (
                                   <option key={country.id} value={country.id}>
                                     {country.name} ({country.phoneCode})
                                   </option>
                                 ))}
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-sm font-medium leading-none mb-1 block">City</label>
                               <select 
                                 className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                 value={formData.cityId} 
                                 onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                                 disabled={!formData.countryId || cities.length === 0}
                               >
                                 <option value="">Select City</option>
                                 {cities.map(city => (
                                   <option key={city.id} value={city.id}>{city.name}</option>
                                 ))}
                               </select>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <label className="text-sm font-medium leading-none mb-1 block">Nationality</label>
                               <Input value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} placeholder="e.g. Indonesian" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-sm font-medium leading-none mb-1 block">Marital Status</label>
                               <select 
                                 className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                 value={formData.maritalStatus} 
                                 onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                               >
                                 <option value="">Select Status</option>
                                 <option value="SINGLE">Single</option>
                                 <option value="MARRIED">Married</option>
                                 <option value="DIVORCED">Divorced</option>
                                 <option value="WIDOWED">Widowed</option>
                               </select>
                             </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 border-b pb-2">Professional & Extra</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium leading-none mb-1 block">Professional Summary</label>
                            <textarea 
                              className="flex min-h-[100px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300" 
                              value={formData.summary} 
                              onChange={(e) => setFormData({...formData, summary: e.target.value})} 
                              placeholder="A brief summary of your professional background and goals..." 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium leading-none mb-1 block">LinkedIn URL</label>
                            <Input value={formData.linkedInUrl} onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})} placeholder="https://linkedin.com/in/..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium leading-none mb-1 block">Portfolio URL</label>
                            <Input value={formData.portfolioUrl} onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} placeholder="https://..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium leading-none mb-1 block">Tax ID (NPWP)</label>
                              <Input value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium leading-none mb-1 block">Dependents (Children)</label>
                              <Input type="number" min="0" value={formData.dependents} onChange={(e) => setFormData({...formData, dependents: parseInt(e.target.value) || 0})} />
                            </div>
                          </div>
                          <div className="pt-2">
                            <label className="flex items-center gap-3 p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:border-blue-500 transition-colors">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-blue-600 rounded"
                                checked={formData.willingToRelocate}
                                onChange={(e) => setFormData({...formData, willingToRelocate: e.target.checked})}
                              />
                              <div className="space-y-1">
                                <p className="font-medium text-sm leading-none">Willing to Relocate</p>
                                <p className="text-xs text-zinc-500">I am open to relocating for a job opportunity.</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t dark:border-zinc-800">
                        <Button type="submit" size="lg" disabled={isUpdatingProfile} className="px-8 font-semibold">
                          {isUpdatingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving...</> : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional" className="mt-0 space-y-6">
                
                {/* SKILLS SECTION */}
                <Card className="border-0 shadow-md overflow-visible">
                   <CardHeader className="border-b pb-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                     <CardTitle className="text-xl flex items-center gap-2"><Settings className="w-5 h-5 text-blue-600"/> Skills</CardTitle>
                   </CardHeader>
                   <CardContent className="p-6">
                     <div className="flex flex-wrap gap-2 mb-4">
                       {user?.jobSeeker?.skills?.map(skill => (
                         <Badge key={skill.id} variant="secondary" className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2">
                           {skill.name}
                           <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill.name)} />
                         </Badge>
                       ))}
                       {(!user?.jobSeeker?.skills || user.jobSeeker.skills.length === 0) && (
                         <span className="text-zinc-500 text-sm">No skills added yet.</span>
                       )}
                     </div>
                     <div className="relative max-w-sm">
                       <Input 
                         placeholder="Type a skill and press Enter..." 
                         value={skillsSearch}
                         onChange={(e) => setSkillsSearch(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter' && skillsSearch.trim()) {
                             e.preventDefault();
                             addSkill(skillsSearch.trim());
                           }
                         }}
                         disabled={isSyncingSkills}
                       />
                       {isSyncingSkills && <Loader2 className="absolute right-3 top-2.5 w-5 h-5 animate-spin text-zinc-400" />}
                       
                       {suggestedSkills.length > 0 && (
                         <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border rounded-md shadow-lg max-h-48 overflow-y-auto">
                           {suggestedSkills.map(skill => (
                             <div 
                               key={skill.id} 
                               className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-sm"
                               onClick={() => addSkill(skill.name)}
                             >
                               {skill.name}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                     <p className="text-xs text-zinc-500 mt-2">Example: ReactJS, Leadership, Data Analysis. Select from suggestions or type your own.</p>
                   </CardContent>
                </Card>

                {/* EXPERIENCE SECTION */}
                <Card className="border-0 shadow-md">
                   <CardHeader className="border-b pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between space-y-0">
                     <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-600"/> Work Experience</CardTitle>
                     <Button size="sm" onClick={() => openExpModal()}><Plus className="w-4 h-4 mr-1"/> Add Experience</Button>
                   </CardHeader>
                   <CardContent className="p-0 divide-y">
                     {(!user?.jobSeeker?.experiences || user.jobSeeker.experiences.length === 0) ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">No work experience added yet.</div>
                     ) : user.jobSeeker.experiences.map((exp: Experience) => (
                        <div key={exp.id} className="p-6 flex justify-between group hover:bg-zinc-50/50 transition-colors">
                          <div>
                            <h4 className="font-bold text-lg">{exp.jobTitle}</h4>
                            <p className="font-medium text-zinc-700">{exp.companyName}</p>
                            <p className="text-sm text-zinc-500 mt-1">
                              {new Date(exp.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} - 
                              {exp.isCurrentJob ? " Present" : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}` : ""}
                            </p>
                            {exp.description && <p className="text-sm text-zinc-600 mt-3 whitespace-pre-line">{exp.description}</p>}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="icon" onClick={() => openExpModal(exp)}><Edit2 className="w-4 h-4 text-zinc-600" /></Button>
                            <Button variant="outline" size="icon" className="hover:text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => deleteExp(exp.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                     ))}
                   </CardContent>
                </Card>

                {/* EDUCATION SECTION */}
                <Card className="border-0 shadow-md">
                   <CardHeader className="border-b pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between space-y-0">
                     <CardTitle className="text-xl flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-600"/> Education</CardTitle>
                     <Button size="sm" onClick={() => openEduModal()}><Plus className="w-4 h-4 mr-1"/> Add Education</Button>
                   </CardHeader>
                   <CardContent className="p-0 divide-y">
                     {(!user?.jobSeeker?.educations || user.jobSeeker.educations.length === 0) ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">No education added yet.</div>
                     ) : user.jobSeeker.educations.map((edu: Education) => (
                        <div key={edu.id} className="p-6 flex justify-between group hover:bg-zinc-50/50 transition-colors">
                          <div>
                            <h4 className="font-bold text-lg">{edu.institutionName}</h4>
                            <p className="font-medium text-zinc-700">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                            <p className="text-sm text-zinc-500 mt-1">
                              {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"} 
                              {edu.gpa && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">GPA: {edu.gpa}</span>}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="icon" onClick={() => openEduModal(edu)}><Edit2 className="w-4 h-4 text-zinc-600" /></Button>
                            <Button variant="outline" size="icon" className="hover:text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => deleteEdu(edu.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                     ))}
                   </CardContent>
                </Card>

                {/* CERTIFICATIONS SECTION */}
                <Card className="border-0 shadow-md">
                   <CardHeader className="border-b pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between space-y-0">
                     <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="w-5 h-5 text-amber-600"/> Certifications</CardTitle>
                     <Button size="sm" onClick={() => openCreateCertModal()}><Plus className="w-4 h-4 mr-1"/> Add Certificate</Button>
                   </CardHeader>
                   <CardContent className="p-0 divide-y">
                     {(!user?.jobSeeker?.certificates || user.jobSeeker.certificates.length === 0) ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">No certifications added yet.</div>
                     ) : user.jobSeeker.certificates.map((cert: any) => (
                        <div key={cert.id} className="p-6 flex justify-between group hover:bg-zinc-50/50 transition-colors">
                          <div>
                            <h4 className="font-bold text-lg">{cert.name}</h4>
                            <p className="font-medium text-zinc-700">{cert.issuingOrganization}</p>
                            <p className="text-sm text-zinc-500 mt-1">
                              Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                              {cert.expirationDate ? ` - Expires: ${new Date(cert.expirationDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}` : " (No Expiration)"}
                            </p>
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">View Credential</a>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="icon" onClick={() => openEditCertModal(cert)}><Edit2 className="w-4 h-4 text-zinc-600" /></Button>
                            <Button variant="outline" size="icon" className="hover:text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => deleteCert(cert.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                     ))}
                   </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resumes" className="mt-0 space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader className="border-b pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2"><UploadCloud className="w-5 h-5 text-blue-600"/> CV & Resumes</CardTitle>
                    {(!user?.jobSeeker?.resumes || user.jobSeeker.resumes.length < 5) && (
                      <Button size="sm" onClick={handleOpenCreateResume}><Plus className="w-4 h-4 mr-1"/> Add Resume</Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                    
                    {(!user?.jobSeeker?.resumes || user.jobSeeker.resumes.length === 0) ? (
                      <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium">No Resumes Yet</h3>
                        <p className="max-w-xs mx-auto text-sm">Create your first resume profile to start applying to jobs.</p>
                        <Button className="mt-2" onClick={handleOpenCreateResume}>Create Resume Profile</Button>
                      </div>
                    ) : (
                      <div className="p-6 space-y-6">
                        {user.jobSeeker.resumes.map((resume: any, index: number) => (
                          <div key={resume.id} className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b bg-zinc-50/30 dark:bg-zinc-900/30">
                              <div>
                                {index === 0 && <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">Primary Resume</Badge>}
                                <h3 className="font-bold text-xl mb-1">{resume.jobTitle}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {resume.subCategories?.map((sub: any) => (
                                    <Badge variant="outline" key={sub.id}>{sub.name}</Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-zinc-500 mt-3">Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <Link href={`/cv/builder/${resume.id}`}>
                                  <Button variant="default" size="sm" className="flex-1 md:flex-none"><Printer className="w-4 h-4 mr-2" /> CV Builder</Button>
                                </Link>
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => setViewResumeModal({ isOpen: true, resume })}><Eye className="w-4 h-4 mr-2" /> View Details</Button>
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => handleOpenEditResume(resume)}><Edit2 className="w-4 h-4 mr-2" /> Edit</Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700" onClick={() => setDeleteResumeModal({isOpen: true, id: resume.id})}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </div>
                            
                            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
                              {resume.fileUrl ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                      <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]">{resume.fileUrl.split('/').pop()}</p>
                                      <p className="text-xs text-green-600 font-medium flex items-center mt-0.5"><CheckCircle2 className="w-3 h-3 mr-1"/> CV Attached</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 w-full sm:w-auto">
                                    <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','') || 'http://localhost:3000'}${resume.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                                      <Button variant="secondary" size="sm" className="w-full">View</Button>
                                    </a>
                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => triggerUploadCv(resume.id)} disabled={uploadingCv}>
                                      {uploadingCv && selectedResumeForUpload === resume.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                                      Replace
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                  <div className="text-sm text-zinc-500 flex items-center">
                                    <XCircle className="w-4 h-4 mr-2 text-orange-500"/> No CV uploaded yet. Employers prefer candidates with a CV.
                                  </div>
                                  <Button size="sm" onClick={() => triggerUploadCv(resume.id)} disabled={uploadingCv} className="w-full sm:w-auto">
                                    {uploadingCv && selectedResumeForUpload === resume.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>} Upload PDF/DOC
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="mt-0">
                <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {loadingApps ? (
                      <div className="p-12 text-center text-zinc-500 flex justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>
                    ) : applications.length === 0 ? (
                      <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center"><Search className="w-8 h-8 text-zinc-400" /></div>
                        <h3 className="text-lg font-medium">No Applications Yet</h3>
                        <p className="max-w-xs mx-auto">You haven't applied to any jobs yet. Start browsing and applying!</p>
                        <Link href="/jobs"><Button className="mt-2">Browse Jobs</Button></Link>
                      </div>
                    ) : applications.map((app) => (
                      <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <div className="flex-1 space-y-1">
                          <Link href={`/jobs/${app.vacancyId}`} className="font-bold text-xl text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors">
                            {app.vacancy?.title || 'Unknown Vacancy'}
                          </Link>
                          <div className="flex flex-wrap items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 gap-x-4 gap-y-2 mt-2">
                            <span className="flex items-center"><Building2 className="w-4 h-4 mr-1.5" /> {app.vacancy?.employer?.companyName || 'Unknown Company'}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {app.vacancy?.city ? `${app.vacancy.city.name}, ${app.vacancy.city.country?.name}` : 'Unknown Location'}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-3">
                          {getStatusBadge(app.status)}
                          
                          {app.status !== ApplicationStatus.WITHDRAWN && app.status !== ApplicationStatus.REJECTED && app.status !== ApplicationStatus.HIRED && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                              onClick={() => withdrawMutation.mutate(app.id)}
                              disabled={withdrawMutation.isPending}
                            >
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingSaved ? (
                    <div className="p-12 text-center text-zinc-500 col-span-full flex justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>
                  ) : savedJobs.length === 0 ? (
                    <Card className="col-span-full border-0 shadow-lg rounded-2xl bg-white dark:bg-zinc-900">
                      <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-zinc-400" /></div>
                        <h3 className="text-lg font-medium">No Saved Jobs</h3>
                        <p className="max-w-xs mx-auto">Jobs you save for later will appear here.</p>
                      </div>
                    </Card>
                  ) : savedJobs.map((saved) => (
                    <Card key={saved.id} className="flex flex-col border-0 shadow-md rounded-2xl overflow-hidden group">
                      <CardContent className="p-6 flex-1 flex flex-col relative bg-white dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm">
                            <Building2 className="w-6 h-6 text-zinc-400" />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => unsaveMutation.mutate(saved.vacancyId)}
                            disabled={unsaveMutation.isPending}
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-lg mb-1">{saved.vacancy?.title}</h4>
                        <p className="font-medium text-blue-600 dark:text-blue-400 text-sm mb-3">{saved.vacancy?.employer?.companyName}</p>
                        
                        <div className="mt-auto pt-4 flex gap-2">
                          <Link href={`/jobs/${saved.vacancyId}`} className="w-full">
                            <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">View Job</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Experience Modal */}
            <Dialog open={expModalOpen} onOpenChange={setExpModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpId ? "Edit Experience" : "Add Experience"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleExpSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input value={expForm.jobTitle} onChange={e => setExpForm({...expForm, jobTitle: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input value={expForm.companyName} onChange={e => setExpForm({...expForm, companyName: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input type="date" value={expForm.startDate} onChange={e => setExpForm({...expForm, startDate: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input type="date" value={expForm.endDate} onChange={e => setExpForm({...expForm, endDate: e.target.value})} disabled={expForm.isCurrentJob} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={expForm.isCurrentJob} onChange={e => setExpForm({...expForm, isCurrentJob: e.target.checked})} />
                    <span className="text-sm">I currently work here</span>
                  </label>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})}></textarea>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSavingExp}>{isSavingExp ? "Saving..." : "Save Experience"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Education Modal */}
            <Dialog open={eduModalOpen} onOpenChange={setEduModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEduId ? "Edit Education" : "Add Education"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEduSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Institution Name</label>
                    <Input value={eduForm.institutionName} onChange={e => setEduForm({...eduForm, institutionName: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Degree</label>
                    <Input value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} placeholder="e.g. Bachelor of Science" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Field of Study</label>
                    <Input value={eduForm.fieldOfStudy} onChange={e => setEduForm({...eduForm, fieldOfStudy: e.target.value})} placeholder="e.g. Computer Science" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input type="date" value={eduForm.startDate} onChange={e => setEduForm({...eduForm, startDate: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input type="date" value={eduForm.endDate} onChange={e => setEduForm({...eduForm, endDate: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">GPA (Optional)</label>
                    <Input type="number" step="0.01" value={eduForm.gpa} onChange={e => setEduForm({...eduForm, gpa: e.target.value})} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSavingEdu}>{isSavingEdu ? "Saving..." : "Save Education"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Certificate Modal */}
            <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCertId ? "Edit Certificate" : "Add Certificate"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveCert} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Certificate Name</label>
                    <Input value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} required placeholder="e.g. AWS Certified Solutions Architect" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Issuing Organization</label>
                    <Input value={certForm.issuingOrganization} onChange={e => setCertForm({...certForm, issuingOrganization: e.target.value})} required placeholder="e.g. Amazon Web Services" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Issue Date</label>
                      <Input type="date" value={certForm.issueDate} onChange={e => setCertForm({...certForm, issueDate: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expiration Date (Optional)</label>
                      <Input type="date" value={certForm.expirationDate} onChange={e => setCertForm({...certForm, expirationDate: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Credential ID (Optional)</label>
                    <Input value={certForm.credentialId} onChange={e => setCertForm({...certForm, credentialId: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Credential URL (Optional)</label>
                    <Input type="url" value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} placeholder="https://..." />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSavingCert}>{isSavingCert ? "Saving..." : "Save Certificate"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Resume Modal (Create/Edit) */}
            <Dialog open={resumeModal.isOpen} onOpenChange={(open) => !open && setResumeModal({ isOpen: false, mode: 'create', id: null })}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{resumeModal.mode === 'create' ? "Create Resume Profile" : "Edit Resume Profile"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveResume} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Job Title</label>
                    <Input value={resumeForm.jobTitle} onChange={e => setResumeForm({...resumeForm, jobTitle: e.target.value})} placeholder="e.g. Frontend Developer" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                      value={resumeForm.subCategoryId} 
                      onChange={e => setResumeForm({...resumeForm, subCategoryId: e.target.value})} 
                      required
                    >
                       <option value="">Select Category</option>
                       {categoriesData?.map((cat: any) => (
                          <optgroup label={cat.name} key={cat.id}>
                            {cat.subCategories.map((sub: any) => (
                              <option value={sub.id} key={sub.id}>{sub.name}</option>
                            ))}
                          </optgroup>
                       ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Professional Summary</label>
                    <textarea 
                      className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 min-h-[80px] dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                      value={resumeForm.professionalSummary} 
                      onChange={e => setResumeForm({...resumeForm, professionalSummary: e.target.value})} 
                      placeholder="Summary specific to this resume..."
                    />
                  </div>
                  
                  {/* Select Experiences */}
                  {user?.jobSeeker?.experiences && user.jobSeeker.experiences.length > 0 && (
                    <div className="border rounded-md p-3 dark:border-zinc-800">
                      <label className="text-sm font-bold mb-2 block">Experiences to Include</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {user.jobSeeker.experiences.map((exp: any) => (
                          <label key={exp.id} className="flex items-start gap-2 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={resumeForm.experienceIds.includes(exp.id)}
                              onChange={(e) => {
                                if (e.target.checked) setResumeForm({...resumeForm, experienceIds: [...resumeForm.experienceIds, exp.id]});
                                else setResumeForm({...resumeForm, experienceIds: resumeForm.experienceIds.filter(id => id !== exp.id)});
                              }}
                              className="mt-1"
                            />
                            <span><strong className="font-semibold">{exp.jobTitle}</strong> at {exp.companyName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Educations */}
                  {user?.jobSeeker?.educations && user.jobSeeker.educations.length > 0 && (
                    <div className="border rounded-md p-3 dark:border-zinc-800">
                      <label className="text-sm font-bold mb-2 block">Educations to Include</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {user.jobSeeker.educations.map((edu: any) => (
                          <label key={edu.id} className="flex items-start gap-2 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={resumeForm.educationIds.includes(edu.id)}
                              onChange={(e) => {
                                if (e.target.checked) setResumeForm({...resumeForm, educationIds: [...resumeForm.educationIds, edu.id]});
                                else setResumeForm({...resumeForm, educationIds: resumeForm.educationIds.filter(id => id !== edu.id)});
                              }}
                              className="mt-1"
                            />
                            <span><strong className="font-semibold">{edu.degree}</strong> from {edu.institutionName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Skills */}
                  {user?.jobSeeker?.skills && user.jobSeeker.skills.length > 0 && (
                    <div className="border rounded-md p-3 dark:border-zinc-800">
                      <label className="text-sm font-bold mb-2 block">Skills to Include</label>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {user.jobSeeker.skills.map((skill: any) => (
                          <label key={skill.id} className="flex items-center gap-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700">
                            <input 
                              type="checkbox" 
                              checked={resumeForm.skillIds.includes(skill.id)}
                              onChange={(e) => {
                                if (e.target.checked) setResumeForm({...resumeForm, skillIds: [...resumeForm.skillIds, skill.id]});
                                else setResumeForm({...resumeForm, skillIds: resumeForm.skillIds.filter(id => id !== skill.id)});
                              }}
                            />
                            <span>{skill.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Certificates */}
                  {user?.jobSeeker?.certificates && user.jobSeeker.certificates.length > 0 && (
                    <div className="border rounded-md p-3 dark:border-zinc-800">
                      <label className="text-sm font-bold mb-2 block">Certifications to Include</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {user.jobSeeker.certificates.map((cert: any) => (
                          <label key={cert.id} className="flex items-start gap-2 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={resumeForm.certificateIds.includes(cert.id)}
                              onChange={(e) => {
                                if (e.target.checked) setResumeForm({...resumeForm, certificateIds: [...resumeForm.certificateIds, cert.id]});
                                else setResumeForm({...resumeForm, certificateIds: resumeForm.certificateIds.filter(id => id !== cert.id)});
                              }}
                              className="mt-1"
                            />
                            <span><strong className="font-semibold">{cert.name}</strong> from {cert.issuingOrganization}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <DialogFooter className="pt-2">
                    <Button type="submit" disabled={isSavingResume}>
                      {isSavingResume ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving...</> : "Save Resume Profile"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Resume Confirmation Modal */}
            <Dialog open={deleteResumeModal.isOpen} onOpenChange={(open) => !open && setDeleteResumeModal({ isOpen: false, id: null })}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Resume Profile</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-zinc-600 dark:text-zinc-400">
                  Are you sure you want to delete this resume? This action cannot be undone and any attached CV will be lost.
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteResumeModal({ isOpen: false, id: null })} disabled={isDeletingResume}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteResume} disabled={isDeletingResume}>
                    {isDeletingResume ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Deleting...</> : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
          <ViewResumeDialog
            isOpen={viewResumeModal.isOpen}
            setIsOpen={(isOpen) => setViewResumeModal(prev => ({ ...prev, isOpen }))}
            resume={viewResumeModal.resume}
          />
        </main>
      </div>
    </RoleGuard>
  );
}

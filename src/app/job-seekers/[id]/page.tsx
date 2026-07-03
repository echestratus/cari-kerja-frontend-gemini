"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User, MapPin, Briefcase, Globe, Mail, Phone, Settings, GraduationCap, FileText, Download } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobSeeker } from "@/types/api";
import { apiClient } from "@/lib/api-client";

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await apiClient.get(`/job-seekers/${id}`);
        setCandidate(res.data);
      } catch (err) {
        console.error("Failed to fetch candidate", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCandidate();
  }, [id]);

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    return Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={["EMPLOYER", "ADMIN"]}>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </RoleGuard>
    );
  }

  if (!candidate) {
    return (
      <RoleGuard allowedRoles={["EMPLOYER", "ADMIN"]}>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 flex-col gap-4">
          <h1 className="text-2xl font-bold">Candidate Not Found</h1>
          <Link href="/job-seekers" className="text-blue-600 hover:underline">Back to Directory</Link>
        </div>
      </RoleGuard>
    );
  }

  const age = calculateAge(candidate.dateOfBirth);
  const primaryResume = candidate.resumes?.find(r => r.isSearchable) || candidate.resumes?.[0];

  return (
    <RoleGuard allowedRoles={["EMPLOYER", "ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <SiteHeader />
        
        <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/job-seekers" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back to directory
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 shadow-sm overflow-hidden mb-12">
            <div className="h-40 bg-gradient-to-r from-blue-600/20 via-blue-400/20 to-indigo-600/20 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            
            <div className="px-8 pb-10">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-8 relative z-10">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-zinc-800 p-2 shadow-xl border dark:border-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {candidate.avatarUrl ? (
                    <img src={candidate.avatarUrl} alt={candidate.fullName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-16 h-16 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight">{candidate.fullName}</h1>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {primaryResume && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <Briefcase className="w-4 h-4"/> {primaryResume.jobTitle}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <MapPin className="w-4 h-4 text-zinc-500"/> {candidate.city ? `${candidate.city.name}, ${candidate.city.country?.name}` : 'Location Unspecified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  
                  {/* PERSONAL INFORMATION */}
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2 border-b dark:border-zinc-800 pb-2">
                      <User className="w-5 h-5 text-blue-600"/>
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <p className="text-sm font-semibold text-zinc-400 mb-1">Age</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">{age ? `${age} years old` : 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-400 mb-1">Gender</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">{candidate.gender ? candidate.gender.toLowerCase().replace(/_/g, ' ') : 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-400 mb-1">Marital Status</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">{candidate.maritalStatus ? candidate.maritalStatus.toLowerCase().replace(/_/g, ' ') : 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-400 mb-1">Nationality</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">{candidate.nationality || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-400 mb-1">Dependents</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">{candidate.dependents !== null ? candidate.dependents : 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-400 mb-1">Willing to Relocate</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">{candidate.willingToRelocate ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </section>
                  
                  {/* SKILLS */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2 border-b dark:border-zinc-800 pb-2">
                        <Settings className="w-5 h-5 text-blue-600"/>
                        Professional Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                           <Badge key={skill.id} variant="secondary" className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                             {skill.name}
                           </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* EXPERIENCE */}
                  {candidate.experiences && candidate.experiences.length > 0 && (
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2 border-b dark:border-zinc-800 pb-2">
                        <Briefcase className="w-5 h-5 text-indigo-600"/>
                        Work Experience
                      </h2>
                      <div className="flex flex-col gap-6">
                        {candidate.experiences.map((exp) => (
                          <div key={exp.id} className="relative bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{exp.jobTitle}</h4>
                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">{exp.companyName}</p>
                            <p className="text-sm text-zinc-500 mb-3">
                              {new Date(exp.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} - 
                              {exp.isCurrentJob ? " Present" : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}` : ""}
                            </p>
                            {exp.description && <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* EDUCATION */}
                  {candidate.educations && candidate.educations.length > 0 && (
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2 border-b dark:border-zinc-800 pb-2">
                        <GraduationCap className="w-5 h-5 text-emerald-600"/>
                        Education
                      </h2>
                      <div className="flex flex-col gap-6">
                        {candidate.educations.map((edu) => (
                          <div key={edu.id} className="relative bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{edu.institutionName}</h4>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <p className="text-sm text-zinc-500">
                                {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                              </p>
                              {edu.gpa && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">GPA: {edu.gpa}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
                
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <CardContent className="p-8 space-y-6">
                      <h3 className="font-bold text-xl mb-4 text-zinc-900 dark:text-white">Contact Info</h3>
                      {candidate.user?.email && (
                        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm flex-shrink-0">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-zinc-900 dark:text-zinc-200 font-medium truncate">{candidate.user.email}</span>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm flex-shrink-0">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-zinc-900 dark:text-zinc-200 font-medium">{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.linkedInUrl && (
                        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 group/link">
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm group-hover/link:bg-blue-50 transition-colors flex-shrink-0">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <a href={candidate.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate">LinkedIn Profile</a>
                        </div>
                      )}
                      {candidate.portfolioUrl && (
                        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 group/link">
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm group-hover/link:bg-blue-50 transition-colors flex-shrink-0">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate">Portfolio</a>
                        </div>
                      )}

                      {/* Download CV Feature */}
                      {primaryResume?.fileUrl && (
                        <div className="mt-8 pt-6 border-t dark:border-zinc-800 text-center">
                          <p className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-400">CV / Resume Document</p>
                          <a href={`http://localhost:3000${primaryResume.fileUrl}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                            <Button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                              <Download className="w-4 h-4"/> Download CV
                            </Button>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

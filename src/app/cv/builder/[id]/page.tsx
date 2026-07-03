'use client';

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft, MapPin, Phone, Mail, Globe, Palette } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const THEMES = [
  { id: 'classic', name: 'Classic Black', primary: 'bg-black', text: 'text-black', border: 'border-black' },
  { id: 'slate', name: 'Slate', primary: 'bg-slate-800', text: 'text-slate-800', border: 'border-slate-800' },
  { id: 'navy', name: 'Navy Blue', primary: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-900' },
];

export default function CVBuilder() {
  const { user } = useAuth();
  const params = useParams();
  const resumeId = params?.id as string;
  const [activeTheme, setActiveTheme] = useState(THEMES[0]); // Default Classic Black

  const handlePrint = () => {
    window.print();
  };

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const res = await apiClient.get(`/resumes/${resumeId}`);
      return res.data;
    },
    enabled: !!resumeId && !!user,
  });

  const js = user?.jobSeeker;

  if (!user || isLoading) {
    return (
      <RoleGuard allowedRoles={["JOB_SEEKER"]}>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
           <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </RoleGuard>
    );
  }

  // Use tailored resume data
  const jobTitle = resume?.jobTitle || "Professional";
  const professionalSummary = resume?.professionalSummary || `Highly motivated and detail-oriented ${jobTitle} with a proven track record of success. Eager to leverage skills and professional background to contribute effectively to a forward-thinking organization.`;
  const experiences = resume?.experiences || [];
  const educations = resume?.educations || [];
  const skills = resume?.skills || [];
  const certificates = resume?.certificates || [];

  return (
    <RoleGuard allowedRoles={["JOB_SEEKER"]}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          html, body { margin: 0; padding: 0; background: white; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { size: A4; margin: 0; }
        }
      `}} />
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col print:bg-white print:dark:bg-white">
        
        {/* TOP NAVBAR - HIDDEN ON PRINT */}
        <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-50 flex items-center justify-between print:hidden shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/seeker">
              <Button variant="ghost" size="sm" className="gap-2"><ChevronLeft className="w-4 h-4"/> Back to Dashboard</Button>
            </Link>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>
            <h1 className="font-bold text-lg hidden sm:block">CV Builder</h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Palette className="w-4 h-4 text-zinc-500 hidden sm:block" />
              <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-full">
                {THEMES.map(theme => (
                  <button 
                    key={theme.id}
                    onClick={() => setActiveTheme(theme)}
                    className={`w-6 h-6 rounded-full ${theme.primary} ${activeTheme.id === theme.id ? 'ring-2 ring-offset-2 ring-zinc-800 dark:ring-zinc-200 dark:ring-offset-zinc-900 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'} transition-all`}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </header>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          
          {/* A4 PAPER CONTAINER - ATS FRIENDLY */}
          <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-10 sm:p-14 font-serif text-[11pt] leading-snug shadow-2xl ring-1 ring-zinc-200 print:shadow-none print:ring-0 print:w-full print:max-w-none print:p-0 print:m-0">
            
            {/* HEADER */}
            <div className="text-center mb-6">
              <h1 className={`text-3xl font-bold uppercase tracking-widest mb-2 ${activeTheme.text}`}>{js?.fullName}</h1>
              <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-sm text-zinc-800">
                {user.email && <span>{user.email}</span>}
                {user.email && js?.phone && <span>|</span>}
                {js?.phone && <span>{js.phone}</span>}
                {js?.phone && js?.location && <span>|</span>}
                {js?.location && <span>{js.location.city}, {js.location.country}</span>}
                {js?.location && js?.linkedInUrl && <span>|</span>}
                {js?.linkedInUrl && <span>{js.linkedInUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>}
              </div>
            </div>

            {/* PROFESSIONAL SUMMARY */}
            <div className="mb-6">
              <h2 className={`text-sm font-bold uppercase tracking-wider border-b-2 ${activeTheme.border} pb-1 mb-3 ${activeTheme.text}`}>Professional Summary</h2>
              <p className="text-justify text-zinc-900 leading-relaxed">{professionalSummary}</p>
            </div>

            {/* WORK EXPERIENCE */}
            {experiences.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-sm font-bold uppercase tracking-wider border-b-2 ${activeTheme.border} pb-1 mb-3 ${activeTheme.text}`}>Work Experience</h2>
                <div className="space-y-4">
                  {experiences.map((exp: any) => (
                    <div key={exp.id}>
                      <div className="flex justify-between font-bold text-zinc-900">
                        <span>{exp.jobTitle}</span>
                        <span>{new Date(exp.startDate).getFullYear()} - {exp.isCurrentJob ? 'Present' : new Date(exp.endDate).getFullYear()}</span>
                      </div>
                      <div className="italic text-zinc-800 mb-1">{exp.companyName}</div>
                      {exp.description && (
                        <p className="text-justify text-zinc-900 leading-relaxed whitespace-pre-line text-sm mt-1">
                          {exp.description.split('\n').map((line: string, i: number) => line.trim().startsWith('-') ? (
                            <span key={i} className="block ml-4">{line.trim()}</span>
                          ) : (
                            <span key={i} className="block">{line}</span>
                          ))}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {educations.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-sm font-bold uppercase tracking-wider border-b-2 ${activeTheme.border} pb-1 mb-3 ${activeTheme.text}`}>Education</h2>
                <div className="space-y-4">
                  {educations.map((edu: any) => (
                    <div key={edu.id}>
                      <div className="flex justify-between font-bold text-zinc-900">
                        <span>{edu.institutionName}</span>
                        <span>{new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</span>
                      </div>
                      <div className="italic text-zinc-800">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</div>
                      {edu.gpa && <div className="text-zinc-800 text-sm">GPA: {edu.gpa}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKILLS */}
            {skills.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-sm font-bold uppercase tracking-wider border-b-2 ${activeTheme.border} pb-1 mb-3 ${activeTheme.text}`}>Skills & Competencies</h2>
                <div className="text-zinc-900 leading-relaxed font-medium">
                  {skills.map((skill: any) => skill.name).join(' • ')}
                </div>
              </div>
            )}

            {/* CERTIFICATIONS */}
            {certificates.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-sm font-bold uppercase tracking-wider border-b-2 ${activeTheme.border} pb-1 mb-3 ${activeTheme.text}`}>Certifications & Licenses</h2>
                <div className="space-y-3">
                  {certificates.map((cert: any) => (
                    <div key={cert.id} className="flex justify-between text-zinc-900">
                      <div>
                        <div className="font-bold">{cert.name}</div>
                        <div className="italic text-zinc-800 text-sm">{cert.issuingOrganization}</div>
                      </div>
                      <div className="text-right text-sm font-bold whitespace-nowrap">
                        {new Date(cert.issueDate).getFullYear()}
                        {cert.expirationDate ? ` - ${new Date(cert.expirationDate).getFullYear()}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ADDITIONAL DETAILS */}
            <div className="mb-6">
              <h2 className={`text-sm font-bold uppercase tracking-wider border-b-2 ${activeTheme.border} pb-1 mb-3 ${activeTheme.text}`}>Additional Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-zinc-900">
                {js?.nationality && (
                  <div><span className="font-semibold">Nationality:</span> {js.nationality}</div>
                )}
                {js?.maritalStatus && (
                  <div><span className="font-semibold">Marital Status:</span> <span className="capitalize">{js.maritalStatus.toLowerCase()}</span></div>
                )}
                {js?.dateOfBirth && (
                  <div><span className="font-semibold">Date of Birth:</span> {new Date(js.dateOfBirth).toLocaleDateString()}</div>
                )}
              </div>
            </div>

          </div>

          <div className="text-center mt-8 pb-12 text-zinc-500 text-sm print:hidden">
            <p className="font-medium bg-zinc-200/50 dark:bg-zinc-800/50 inline-block px-4 py-2 rounded-xl">
              💡 Tip: In the Print Dialog, set <strong>Destination</strong> to "Save as PDF", <strong>Paper Size</strong> to "A4", and <strong>Margins</strong> to "None".
            </p>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

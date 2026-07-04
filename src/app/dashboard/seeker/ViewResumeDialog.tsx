import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, MapPin, Calendar, Building2, GraduationCap, Award } from 'lucide-react';

export default function ViewResumeDialog({ 
  resume, 
  isOpen, 
  setIsOpen 
}: { 
  resume: any, 
  isOpen: boolean, 
  setIsOpen: (val: boolean) => void 
}) {
  if (!resume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-4 border-b pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Resume Details
          </DialogTitle>
          <div className="text-zinc-500 mt-1">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{resume.jobTitle}</h3>
            <p className="text-sm">Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Professional Summary */}
          {resume.professionalSummary && (
            <section>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Professional Summary</h4>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap">
                {resume.professionalSummary}
              </p>
            </section>
          )}

          {/* Sub Categories & Skills */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resume.subCategories && resume.subCategories.length > 0 && (
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.subCategories.map((sub: any) => (
                    <Badge key={sub.id} variant="secondary">{sub.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill: any) => (
                    <Badge key={skill.id} className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Experience */}
          {resume.experiences && resume.experiences.length > 0 && (
            <section>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 border-b pb-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                Work Experience
              </h4>
              <div className="space-y-4">
                {resume.experiences.map((exp: any) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                    <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full -left-[6px] top-1.5 border-2 border-white dark:border-zinc-950"></div>
                    <h5 className="font-medium text-zinc-900 dark:text-zinc-100">{exp.jobTitle}</h5>
                    <div className="text-sm text-zinc-500 mb-2 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{exp.companyName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {exp.startDate?.substring(0,7)} - {exp.isCurrentJob ? 'Present' : exp.endDate?.substring(0,7) || 'Present'}</span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resume.educations && resume.educations.length > 0 && (
            <section>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 border-b pb-2">
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                Education
              </h4>
              <div className="space-y-4">
                {resume.educations.map((edu: any) => (
                  <div key={edu.id} className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                    <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full -left-[6px] top-1.5 border-2 border-white dark:border-zinc-950"></div>
                    <h5 className="font-medium text-zinc-900 dark:text-zinc-100">{edu.degree} in {edu.fieldOfStudy}</h5>
                    <div className="text-sm text-zinc-500 mb-2 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{edu.institutionName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {edu.startDate?.substring(0,7)} - {edu.endDate ? edu.endDate.substring(0,7) : 'Expected'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificates */}
          {resume.certificates && resume.certificates.length > 0 && (
            <section>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 border-b pb-2">
                <Award className="w-4 h-4 text-zinc-400" />
                Licenses & Certifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resume.certificates.map((cert: any) => (
                  <div key={cert.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                    <h5 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">{cert.name}</h5>
                    <p className="text-sm text-zinc-500 mb-2">{cert.issuingOrganization}</p>
                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Issued {cert.issueDate.substring(0,7)}
                    </div>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-3 inline-block font-medium">
                        View Credential &rarr;
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

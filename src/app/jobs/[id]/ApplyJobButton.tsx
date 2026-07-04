'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

export default function ApplyJobButton({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [meetsAllRequirements, setMeetsAllRequirements] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // If user is not logged in or not a job seeker, they can't apply
  // We can just show a button that prompts them to login.
  if (!user || user.role !== 'JOB_SEEKER') {
    return (
      <Button 
        size="lg" 
        className="w-full md:w-auto px-10 text-base"
        onClick={() => toast.error('Please login as a Job Seeker to apply.')}
      >
        Apply Now
      </Button>
    );
  }

  const jobSeeker = user.jobSeeker;
  const resumes = jobSeeker?.resumes || [];

  const handleApply = async () => {
    if (!resumeId) {
      toast.error('Please select a resume to apply.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/applications', {
        vacancyId: jobId,
        resumeId,
        coverLetter,
        meetsAllRequirements,
      });
      
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setIsOpen(false);
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error('You have already applied for this job.');
        setHasApplied(true);
        setIsOpen(false);
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit application.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasApplied) {
    return (
      <Button size="lg" className="w-full md:w-auto px-10 text-base" disabled>
        Already Applied
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ size: "lg", className: "w-full md:w-auto px-10 text-base bg-blue-600 hover:bg-blue-700" })}>
        Apply Now
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Submit Application</DialogTitle>
          <DialogDescription>
            Choose your resume and write a cover letter to apply for this position.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Resume <span className="text-red-500">*</span></label>
            {resumes.length > 0 ? (
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
              >
                <option value="">-- Choose a Resume --</option>
                {resumes.map((resume: any) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.jobTitle}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                You don't have any resumes yet. Please create one in your dashboard first.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Letter (Optional)</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
              placeholder="Why are you a great fit for this role?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="flex items-start space-x-3 mt-2">
            <Checkbox
              id="requirements"
              checked={meetsAllRequirements}
              onCheckedChange={(checked) => setMeetsAllRequirements(checked as boolean)}
            />
            <label
              htmlFor="requirements"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1"
            >
              I confirm that I meet the core requirements for this role.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!resumeId || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

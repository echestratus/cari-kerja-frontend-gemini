import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Building2, Clock, DollarSign, Calendar, ChevronLeft, Share2, BookmarkPlus, Briefcase } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { JobVacancy, ApiResponse } from '@/types/api';
import JobActions from './JobActions';

async function getJob(id: string): Promise<JobVacancy | null> {
  try {
    // Determine base url for SSR fetch
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';
    const res = await fetch(`${baseUrl}/vacancies/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json() as JobVacancy;
    return json;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  
  if (!job) {
    return { title: 'Job Not Found | CariKerja' };
  }

  return {
    title: `${job.title} at ${job.employer?.companyName || 'Company'} | CariKerja`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} at ${job.employer?.companyName}`,
      description: job.description.substring(0, 160),
      type: 'website',
    },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Link href="/jobs" className={buttonVariants({ variant: "default" })}>Back to Jobs</Link>
        </div>
      </div>
    );
  }

  // Calculate a generic validThrough date if none exists
  const validThroughDate = new Date(job.createdAt);
  validThroughDate.setMonth(validThroughDate.getMonth() + 1);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.createdAt,
    "validThrough": validThroughDate.toISOString(),
    "employmentType": job.employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.employer?.companyName || "Unknown Company",
      "sameAs": job.employer?.website || "https://example.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.city ? `${job.city.name}, ${job.city.country?.name}` : "Remote",
      }
    },
    "baseSalary": job.salaryMin && job.isSalaryVisible !== false ? {
      "@type": "MonetaryAmount",
      "currency": job.salaryCurrency || "USD",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salaryMin,
        "maxValue": job.salaryMax || job.salaryMin,
        "unitText": "MONTH"
      }
    } : undefined
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/jobs" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to jobs
          </Link>
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
            CariKerja
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg font-medium text-blue-600">
                    <Building2 className="w-5 h-5" /> {job.employer?.companyName || "Unknown Company"}
                  </div>
                </div>
                <JobActions jobId={job.id} jobTitle={job.title} />
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {job.salaryMin && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm py-1">
                     {job.isSalaryVisible !== false ? `${job.salaryCurrency || "USD"} ${job.salaryMin.toLocaleString()}${job.salaryMax ? ` - ${job.salaryCurrency || "USD"} ${job.salaryMax.toLocaleString()}` : ''}` : "Competitive"}
                  </Badge>
                )}
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 gap-1 text-sm font-medium">
                  <MapPin className="w-4 h-4" /> {job.city ? `${job.city.name}, ${job.city.country?.name}` : "Remote"}
                </div>
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 gap-1 text-sm font-medium">
                  <Briefcase className="w-4 h-4" /> {job.employmentType.replace('_', ' ')}
                </div>
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 gap-1 text-sm font-medium">
                  <Calendar className="w-4 h-4" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.subCategories?.map(sub => (
                  <Badge key={sub.id} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-sm font-medium">
                    {sub.name}
                  </Badge>
                ))}
              </div>

              <Button size="lg" className="w-full md:w-auto px-10 text-base">Apply Now</Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border dark:border-zinc-800 shadow-sm space-y-6">
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Job Description</h2>
                <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Requirements</h2>
                <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </section>
            </div>
          </div>
          
          <aside className="w-full md:w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border overflow-hidden">
                    {job.employer?.logoUrl ? (
                      <img src={job.employer.logoUrl} alt={job.employer.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{job.employer?.companyName}</h3>
                    <p className="text-sm text-zinc-500">Verified Employer</p>
                  </div>
                </div>
                <Link href={`/employers/${job.employer?.id}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                  View Company Profile
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

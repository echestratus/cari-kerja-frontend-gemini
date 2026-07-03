import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, Building2, MapPin, Users, Globe, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Employer } from '@/types/api';
import { SiteHeader } from '@/components/SiteHeader';

async function getEmployer(id: string): Promise<Employer | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';
    const res = await fetch(`${baseUrl}/employers/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json() as Employer;
  } catch (error) {
    console.error("Failed to fetch employer:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const employer = await getEmployer(id);
  if (!employer) return { title: 'Company Not Found | CariKerja' };
  return { title: `${employer.companyName} | CariKerja` };
}

export default async function EmployerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employer = await getEmployer(id);

  if (!employer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 flex-col gap-4">
        <h1 className="text-2xl font-bold">Company Not Found</h1>
        <Link href="/employers" className="text-blue-600 hover:underline">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />
      <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/employers" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to directory
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 shadow-sm overflow-hidden mb-12 group">
          <div className="h-40 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>
          <div className="px-8 pb-10">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-8 relative z-10">
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-zinc-800 p-2 shadow-xl border dark:border-zinc-700 overflow-hidden flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:shadow-blue-500/20">
                {employer.logoUrl ? (
                  <img src={employer.logoUrl} alt={employer.companyName} className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <Building2 className="w-full h-full text-zinc-300 p-4" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight">{employer.companyName}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {employer.industry && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <Briefcase className="w-4 h-4"/> {employer.industry.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <MapPin className="w-4 h-4 text-zinc-500"/> {employer.city ? `${employer.city.name}, ${employer.city.country?.name}` : 'Remote'}
                  </span>
                  {employer.employeeSize && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Users className="w-4 h-4 text-zinc-500"/> {employer.employeeSize} employees
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600"><Building2 className="w-4 h-4"/></span>
                    About {employer.companyName}
                  </h2>
                  <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
                    {employer.companyDescription || "This company hasn't provided a description yet."}
                  </div>
                </section>
              </div>
              
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="font-bold text-xl mb-4 text-zinc-900 dark:text-white">Contact & Info</h3>
                    {employer.website && (
                      <div className="flex items-start gap-4 text-zinc-600 dark:text-zinc-400 group/link">
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm group-hover/link:bg-blue-50 transition-colors">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Website</span>
                          <a href={employer.website} target="_blank" rel="noreferrer" className="text-zinc-900 dark:bg-zinc-200 hover:text-blue-600 font-medium transition-colors break-all">{employer.website}</a>
                        </div>
                      </div>
                    )}
                    {employer.phone && (
                      <div className="flex items-start gap-4 text-zinc-600 dark:text-zinc-400">
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Phone</span>
                          <span className="text-zinc-900 dark:text-zinc-200 font-medium">{employer.phone}</span>
                        </div>
                      </div>
                    )}
                    {employer.address && (
                      <div className="flex items-start gap-4 text-zinc-600 dark:text-zinc-400">
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Address</span>
                          <span className="text-zinc-900 dark:text-zinc-200 font-medium">{employer.address}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Active Openings</h2>
            <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {employer.jobVacancies?.length || 0}
            </Badge>
          </div>
          
          {employer.jobVacancies && employer.jobVacancies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employer.jobVacancies.map(job => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <Card className="hover:-translate-y-1 hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer group h-full rounded-2xl border-zinc-200 dark:border-zinc-800">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-tight">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4 font-medium">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{job.city ? `${job.city.name}, ${job.city.country?.name}` : 'Remote'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{job.employmentType.replace('_', ' ')}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-4">
               <Briefcase className="w-12 h-12 text-zinc-300" />
               <p className="text-lg">No active job openings at the moment.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

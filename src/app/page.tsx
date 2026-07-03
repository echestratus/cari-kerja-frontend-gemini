import Link from "next/link";
import { Search, Building2, TrendingUp, DollarSign, Folder } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, JobVacancy, PaginatedResponse, Employer } from "@/types/api";
import { MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategoryIcon } from "@/lib/utils";

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';
    const res = await fetch(`${baseUrl}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json() as Category[];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

async function getPremiumJobs(): Promise<JobVacancy[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';
    const res = await fetch(`${baseUrl}/vacancies?isPremium=true&limit=4`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as PaginatedResponse<JobVacancy>;
    return json.data || [];
  } catch (error) {
    console.error("Failed to fetch premium jobs:", error);
    return [];
  }
}

async function getTopEmployers(): Promise<Employer[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';
    const res = await fetch(`${baseUrl}/employers?limit=4`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as Employer[];
    return Array.isArray(json) ? json.slice(0, 4) : [];
  } catch (error) {
    console.error("Failed to fetch top employers:", error);
    return [];
  }
}

export default async function Home() {
  const allCategories = await getCategories();
  const premiumJobs = await getPremiumJobs();
  const topEmployers = await getTopEmployers();
  
  // Sort categories by total vacancies across all their subcategories (descending)
  const sortedCategories = [...allCategories].sort((a, b) => {
    const aCount = a.subCategories?.reduce((acc, sub) => acc + (sub._count?.jobVacancies || 0), 0) || 0;
    const bCount = b.subCategories?.reduce((acc, sub) => acc + (sub._count?.jobVacancies || 0), 0) || 0;
    return bCount - aCount;
  });
  
  const topCategories = sortedCategories.slice(0, 8); // Show up to 8 categories on homepage
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">dream job</span> today
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              The smartest way to search for a job, create an ATS-friendly resume, and connect with top employers in your industry.
            </p>
            
            <form action="/jobs" method="GET" className="bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2 border dark:border-zinc-800">
              <div className="flex-1 flex items-center px-4 gap-3 border-b sm:border-b-0 border-zinc-200 dark:border-zinc-800 pb-2 sm:pb-0">
                <Search className="w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  name="search"
                  placeholder="Job title, keyword, company, or city" 
                  className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="sm:w-32 h-12 rounded-xl text-md font-semibold">
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Popular Categories</h2>
            <Link href="/categories" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const subIds = cat.subCategories?.map(s => s.id).join(',') || '';
              return (
                <Link href={`/jobs?subCategoryIds=${subIds}`} key={cat.id}>
                  <Card className="h-full group hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-6 flex flex-col items-start gap-4">
                      <div className={`p-3 rounded-lg bg-blue-50 dark:bg-blue-950`}>
                        <Icon className={`w-6 h-6 text-blue-500`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{cat.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {cat.subCategories?.reduce((acc, sub) => acc + (sub._count?.jobVacancies || 0), 0) || 0} vacancies
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Companies Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Top Companies Hiring</h2>
              <p className="text-zinc-500">Discover your next great opportunity with industry leaders.</p>
            </div>
            <Link href="/employers" className="hidden sm:flex text-blue-600 font-medium hover:underline items-center gap-1">
              View directory
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topEmployers.map(employer => (
              <Link href={`/employers/${employer.id}`} key={employer.id}>
                <Card className="hover:shadow-lg transition-all cursor-pointer group h-full border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 p-2 shadow-sm border mb-4 group-hover:scale-105 transition-transform">
                      {employer.logoUrl ? (
                        <img src={employer.logoUrl} alt={employer.companyName} className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <Building2 className="w-full h-full text-zinc-300 p-2" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{employer.companyName}</h3>
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-1">{employer.industry?.name || 'Various Industries'}</p>
                    <div className="w-full flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                       <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {employer.location ? employer.location.city : 'Remote'}</span>
                       <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">View Profile</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/employers" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              View all companies
            </Link>
          </div>
        </section>

        {/* Premium Jobs Section */}
        <section className="py-20 px-6 bg-white dark:bg-zinc-900 border-t border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Premium Jobs</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {premiumJobs.length > 0 ? premiumJobs.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-yellow-400 cursor-pointer group h-full">
                    <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border overflow-hidden">
                        {job.employer?.logoUrl ? (
                          <img src={job.employer.logoUrl} alt={job.employer.companyName} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                          <p className="text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1 line-clamp-1">
                            {job.employer?.companyName || "Unknown Company"} • {job.location ? `${job.location.city}, ${job.location.country}` : "Remote"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.salaryMin && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${job.salaryMin.toLocaleString()} {job.salaryMax ? `- $${job.salaryMax.toLocaleString()}` : ''}
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900">{job.employmentType.replace('_', ' ')}</Badge>
                          {job.subCategories && job.subCategories.length > 0 && job.subCategories.slice(0, 2).map(sub => (
                            <Badge key={sub.id} variant="outline">{sub.name}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )) : (
                <div className="col-span-1 md:col-span-2 text-center py-10 text-zinc-500">
                  No premium jobs found at the moment.
                </div>
              )}
            </div>
            <div className="mt-10 text-center">
              <Link href="/jobs" className={buttonVariants({ variant: "outline", size: "lg" })}>
                View all jobs
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 px-6 bg-zinc-950 text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold tracking-tighter text-white">
            CariKerja
          </div>
          <p>© 2026 CariKerja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

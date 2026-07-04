"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Filter, CheckCircle2, Building2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { JobVacancy, PaginatedResponse, Category, Country, City } from "@/types/api";
import { SiteHeader } from "@/components/SiteHeader";
import { CustomPagination } from "@/components/ui/custom-pagination";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <JobsPageContent />
    </Suspense>
  );
}

function JobsPageContent() {
  const searchParams = useSearchParams();
  const subCategoryIdsParam = searchParams.get('subCategoryIds');
  const initialSubCategoryIds = subCategoryIdsParam ? subCategoryIdsParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
  const initialSearch = searchParams.get('search') || "";
  const countryParam = searchParams.get('country') || "";
  const cityParam = searchParams.get('city') || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [sortBy, setSortBy] = useState<"createdAt" | "salary">("createdAt");
  const [employmentType, setEmploymentType] = useState<string[]>([]);
  const [countryId, setCountryId] = useState<string>(countryParam);
  const [cityId, setCityId] = useState<string>(cityParam);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>(initialSubCategoryIds);

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await apiClient.get<Country[]>('/countries');
      return res.data;
    }
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      const res = await apiClient.get<City[]>(`/cities?countryId=${countryId}`);
      return res.data;
    },
    enabled: !!countryId
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get<Category[]>('/categories');
      return res.data;
    }
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vacancies', searchQuery, page, selectedSubCategories, sortOrder, sortBy, countryId, cityId, employmentType],
    queryFn: async () => {
      let url = `/vacancies?search=${encodeURIComponent(searchQuery)}&page=${page}&sortOrder=${sortOrder}&sortBy=${sortBy}`;
      if (selectedSubCategories.length > 0) {
        url += `&subCategoryIds=${selectedSubCategories.join(',')}`;
      }
      if (countryId) {
        url += `&countryId=${countryId}`;
      }
      if (cityId) {
        url += `&cityId=${cityId}`;
      }
      if (employmentType.length > 0) {
        url += `&employmentType=${encodeURIComponent(employmentType.join(','))}`;
      }
      const res = await apiClient.get<PaginatedResponse<JobVacancy>>(url);
      return res.data;
    }
  });

  const jobs = data?.data || [];
  const meta = data?.meta;

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader maxWidth="max-w-7xl">
        <div className="flex w-full max-w-2xl bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all mx-8">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <input 
              type="text" 
              placeholder="Job title or keyword" 
              className="w-full bg-transparent border-none outline-none h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button className="rounded-none h-10 px-8" onClick={handleSearch}>Find</Button>
        </div>
      </SiteHeader>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Filters</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Employment Type</h3>
              <div className="space-y-2">
                {["FULL_TIME", "PART_TIME", "REMOTE", "INTERNSHIP"].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" 
                      checked={employmentType.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked 
                          ? [...employmentType, type]
                          : employmentType.filter(t => t !== type);
                        setEmploymentType(newTypes);
                        setPage(1); // Reset page on filter change
                      }}
                    />
                    {type.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Category</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {categoriesData?.map(cat => (
                  <div key={cat.id} className="space-y-2">
                    <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-1">{cat.name}</div>
                    <div className="pl-1 space-y-1.5">
                      {cat.subCategories?.map(sub => (
                        <label key={sub.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white">
                          <input 
                            type="checkbox" 
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" 
                            checked={selectedSubCategories.includes(sub.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked 
                                ? [...selectedSubCategories, sub.id]
                                : selectedSubCategories.filter(id => id !== sub.id);
                              setSelectedSubCategories(newIds);
                              setPage(1);
                            }}
                          />
                          <span className="line-clamp-1">{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Location</h3>
              <div className="space-y-3">
                <select 
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm py-2 px-3 focus:ring-blue-500"
                  value={countryId}
                  onChange={(e) => {
                    setCountryId(e.target.value);
                    setCityId("");
                    setPage(1);
                  }}
                >
                  <option value="">All Countries</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select 
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm py-2 px-3 focus:ring-blue-500 disabled:opacity-50"
                  value={cityId}
                  onChange={(e) => {
                    setCityId(e.target.value);
                    setPage(1);
                  }}
                  disabled={!countryId || cities.length === 0}
                >
                  <option value="">All Cities</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {isLoading ? "Searching..." : `${meta?.total || 0} jobs found`}
            </h1>
            <select 
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as "createdAt" | "salary");
                setSortOrder(newSortOrder as "desc" | "asc");
                setPage(1); // Reset page on sort change
              }}
              className="bg-transparent border-zinc-300 dark:border-zinc-700 rounded-md text-sm py-1.5 pl-3 pr-8 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="salary-desc">Highest Salary</option>
              <option value="salary-asc">Lowest Salary</option>
            </select>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}
            
            {isError && (
              <div className="text-center text-red-500 py-10">
                Failed to load vacancies. Please try again.
              </div>
            )}

            {!isLoading && !isError && jobs.length === 0 && (
              <div className="text-center text-zinc-500 py-20">
                No jobs found matching your criteria.
              </div>
            )}

            {jobs.map(job => (
              <Card key={job.id} className="hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="w-14 h-14 rounded-lg border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {job.employer?.logoUrl ? (
                        <img src={job.employer.logoUrl} alt={job.employer.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link href={`/jobs/${job.id}`} className="text-xl font-semibold text-blue-600 dark:text-blue-400 group-hover:underline line-clamp-1">
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-zinc-600 dark:text-zinc-400 font-medium text-sm">
                            <span>{job.employer?.companyName || "Unknown Company"}</span>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.city ? `${job.city.name}, ${job.city.country?.name}` : "Remote"}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold whitespace-nowrap">
                          {job.salaryMin && job.isSalaryVisible !== false ? `${formatCurrency(job.salaryMin, job.salaryCurrency || "USD")}${job.salaryMax ? ` - ${formatCurrency(job.salaryMax, job.salaryCurrency || "USD")}` : ''}` : "Competitive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-zinc-50 dark:bg-zinc-900">
                            {job.employmentType.replace('_', ' ')}
                          </Badge>
                          {job.subCategories && job.subCategories.length > 0 ? (
                            job.subCategories.slice(0, 2).map(sub => (
                              <Badge key={sub.id} variant="outline" className="text-xs">{sub.name}</Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">General</Badge>
                          )}
                          {job.skills && job.skills.length > 0 && job.skills.slice(0, 3).map(skill => (
                            <Badge key={skill.id} variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                          {job.skills && job.skills.length > 3 && (
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                          {job.subCategories && job.subCategories.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{job.subCategories.length - 2} more</Badge>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {meta && meta.lastPage > 1 && (
              <CustomPagination 
                currentPage={meta.page} 
                lastPage={meta.lastPage} 
                onPageChange={(p) => setPage(p)} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

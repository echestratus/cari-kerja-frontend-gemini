"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, MapPin, Briefcase } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { JobSeeker } from "@/types/api";
import { apiClient } from "@/lib/api-client";

export default function CandidateDirectory() {
  const [candidates, setCandidates] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await apiClient.get("/job-seekers");
        setCandidates(res.data);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  return (
    <RoleGuard allowedRoles={["EMPLOYER", "ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">Candidate Directory</h1>
          <p className="text-zinc-500 mb-8">Discover top talent for your company.</p>
          
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : candidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map(candidate => (
                <Link href={`/job-seekers/${candidate.id}`} key={candidate.id}>
                  <Card className="hover:shadow-lg transition-all h-full hover:border-blue-500 cursor-pointer group border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white dark:border-zinc-800 shadow-sm">
                          {candidate.avatarUrl ? (
                            <img src={candidate.avatarUrl} alt={candidate.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-blue-500" />
                          )}
                        </div>
                        <div className="pt-2 flex-1 min-w-0">
                          <h2 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                            {candidate.fullName}
                          </h2>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{candidate.resumes?.[0]?.jobTitle || 'No title provided'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-zinc-400" />
                          <span className="line-clamp-1">{candidate.location ? `${candidate.location.city}, ${candidate.location.country}` : 'Unknown Location'}</span>
                        </div>
                        {candidate.willingToRelocate && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <MapPin className="w-4 h-4" />
                            <span>Willing to relocate</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                           <Briefcase className="w-4 h-4 text-zinc-400" />
                           <span className="capitalize">{candidate.gender ? candidate.gender.toLowerCase().replace(/_/g, ' ') : 'Not specified'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
              No candidates found.
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}

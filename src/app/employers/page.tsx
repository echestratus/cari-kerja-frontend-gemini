import Link from 'next/link';
import { Building2, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';
import { Employer, PaginatedResponse } from '@/types/api';

async function getEmployers(): Promise<Employer[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1';
    const res = await fetch(`${baseUrl}/employers?limit=50`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as Employer[];
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error("Failed to fetch employers:", error);
    return [];
  }
}

export default async function EmployersPage() {
  const employers = await getEmployers();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Company Directory</h1>
        <p className="text-zinc-500 mb-8">Discover great companies hiring right now.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employers.map(employer => (
            <Link href={`/employers/${employer.id}`} key={employer.id}>
              <Card className="hover:shadow-md transition-all h-full hover:border-blue-500 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl border bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {employer.logoUrl ? (
                        <img src={employer.logoUrl} alt={employer.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                        {employer.companyName}
                      </h2>
                      <div className="text-sm text-zinc-500 line-clamp-1">{employer.industry?.name || 'Various Industries'}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{employer.location ? `${employer.location.city}, ${employer.location.country}` : 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{employer.employeeSize || 'N/A'} employees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

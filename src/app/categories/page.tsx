import Link from "next/link";
import { ChevronLeft, Folder } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/api";
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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 flex items-center gap-1 mb-4 inline-flex">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">Job Categories</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">Browse open positions by your profession.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const subIds = cat.subCategories?.map(s => s.id).join(',') || '';
            return (
              <Link href={`/jobs?subCategoryIds=${subIds}`} key={cat.id} className="block group">
                <Card className="h-full hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-start gap-4">
                    <div className={`p-3 rounded-lg bg-blue-50 dark:bg-blue-950`}>
                      <Icon className={`w-6 h-6 text-blue-500`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {cat.subCategories?.reduce((acc, sub) => acc + (sub._count?.jobVacancies || 0), 0) || 0} vacancies
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
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

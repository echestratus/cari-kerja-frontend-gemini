"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { HeaderAuth } from "@/components/HeaderAuth";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  maxWidth?: "max-w-6xl" | "max-w-7xl";
  children?: React.ReactNode;
}

export function SiteHeader({ maxWidth = "max-w-6xl", children }: SiteHeaderProps) {
  const { user, isLoading } = useAuth();

  return (
    <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className={`${maxWidth} mx-auto flex items-center justify-between`}>
        <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">
          CariKerja
        </Link>
        
        {children ? (
          <div className="flex-1 flex justify-center">
            {children}
          </div>
        ) : (
          <nav className="hidden md:flex gap-6 font-medium text-sm text-zinc-600 dark:text-zinc-300">
            <Link href="/jobs" className="hover:text-blue-600 transition-colors">Find a Job</Link>
            
            {/* Conditional Links based on Role */}
            {(!user || user.role === "JOB_SEEKER") && (
              <Link href="/cv/builder" className="hover:text-blue-600 transition-colors">Create CV</Link>
            )}
            
            {(!user || user.role === "EMPLOYER") && (
              <Link href="/dashboard/employer" className="hover:text-blue-600 transition-colors">Employers</Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          <HeaderAuth />
          
          {/* Post a Job button is only for employers or logged out users */}
          {(!isLoading && (!user || user.role === "EMPLOYER")) && (
            <Link href={user ? "/dashboard/employer/jobs/new" : "/login"}>
              <Button size="sm">Post a Job</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

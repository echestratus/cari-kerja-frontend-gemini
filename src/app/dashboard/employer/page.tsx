"use client";

import { useState } from "react";
import { ApplicationStatus } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";

export default function EmployerDashboard() {
  const [applicants, setApplicants] = useState([
    { id: "1", name: "Ivan Petrenko", role: "Frontend Developer", status: ApplicationStatus.APPLIED, exp: "3 years" },
    { id: "2", name: "Olena K.", role: "Frontend Developer", status: ApplicationStatus.VIEWED, exp: "5 years" },
    { id: "3", name: "Dmytro S.", role: "Frontend Developer", status: ApplicationStatus.INTERVIEW, exp: "4 years" },
  ]);

  const updateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  const columns = [
    { title: "New (Applied)", status: ApplicationStatus.APPLIED },
    { title: "Reviewed", status: ApplicationStatus.VIEWED },
    { title: "Interview", status: ApplicationStatus.INTERVIEW },
    { title: "Hired", status: ApplicationStatus.HIRED },
    { title: "Rejected", status: ApplicationStatus.REJECTED },
  ];

  return (
    <RoleGuard allowedRoles={["EMPLOYER"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="px-6 py-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">Employer ATS Dashboard</div>
          <div className="flex gap-4">
            <Button variant="outline">My Vacancies</Button>
            <Button>Post New Job</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Frontend Developer - Candidates</h1>
          
          <div className="flex gap-6 items-start pb-4">
            {columns.map(col => (
              <div key={col.status} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 min-w-[320px] w-[320px] flex flex-col gap-4 border dark:border-zinc-800">
                <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300">
                  {col.title}
                  <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800">{applicants.filter(a => a.status === col.status).length}</Badge>
                </div>

                {applicants.filter(a => a.status === col.status).map(app => (
                  <Card key={app.id} className="cursor-pointer hover:border-blue-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-zinc-900 dark:text-white">{app.name}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                      <div className="text-sm text-zinc-500 mb-4">{app.role} • {app.exp} experience</div>
                      
                      <div className="flex gap-2">
                        {col.status === ApplicationStatus.APPLIED && (
                          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => updateStatus(app.id, ApplicationStatus.VIEWED)}>Mark Reviewed</Button>
                        )}
                        {col.status === ApplicationStatus.VIEWED && (
                          <Button size="sm" className="w-full text-xs bg-blue-600" onClick={() => updateStatus(app.id, ApplicationStatus.INTERVIEW)}>Invite to Interview</Button>
                        )}
                        {col.status === ApplicationStatus.INTERVIEW && (
                          <div className="flex gap-2 w-full">
                            <Button size="sm" className="w-1/2 text-xs bg-green-600" onClick={() => updateStatus(app.id, ApplicationStatus.HIRED)}>Hire</Button>
                            <Button size="sm" variant="destructive" className="w-1/2 text-xs" onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}>Reject</Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}

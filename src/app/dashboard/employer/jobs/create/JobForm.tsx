"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { Loader2, Briefcase } from "lucide-react";
import { EmploymentType, Category, CreateVacancyDto } from "@/types/api";
import { apiClient } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Please provide a detailed description"),
  requirements: z.string().min(20, "Please provide detailed requirements"),
  cityId: z.number({ required_error: "City is required" }),
  subCategoryIds: z.array(z.number()).min(1, "Select at least one subcategory"),
  skillIds: z.array(z.number()).min(1, "Select at least one skill"),
  employmentType: z.nativeEnum(EmploymentType),
  salaryMin: z.number({ required_error: "Minimum salary is required" }).min(0),
  salaryMax: z.number().optional().nullable(),
  salaryCurrency: z.string().default("IDR"),
  isSalaryVisible: z.boolean().default(true),
}).refine(data => {
  if (data.salaryMax && data.salaryMax < data.salaryMin) {
    return false;
  }
  return true;
}, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salaryMax"],
});

type FormValues = z.infer<typeof formSchema>;

export default function JobForm({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten subcategories for standard react-select
  const subCategoryOptions = initialCategories.flatMap(cat => 
    cat.subCategories?.map(sub => ({
      value: sub.id,
      label: `${cat.name} > ${sub.name}`
    })) || []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      subCategoryIds: [],
      skillIds: [],
      employmentType: EmploymentType.FULL_TIME,
      salaryCurrency: "IDR",
      isSalaryVisible: true,
    },
  });

  // Async loaders for react-select/async
  const loadCities = async (inputValue: string) => {
    try {
      const res = await apiClient.get(`/cities?search=${inputValue}`);
      return (res.data || []).map((city: any) => ({
        value: city.id,
        label: `${city.name}, ${city.country?.name || ""}`
      }));
    } catch (e) {
      return [];
    }
  };

  const loadSkills = async (inputValue: string) => {
    try {
      const res = await apiClient.get(`/skills?search=${inputValue}`);
      return (res.data || []).map((skill: any) => ({
        value: skill.id,
        label: skill.name
      }));
    } catch (e) {
      return [];
    }
  };

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // Clean up payload
      const payload: CreateVacancyDto = {
        ...data,
        salaryMax: data.salaryMax || undefined
      };
      
      await apiClient.post("/vacancies", payload);
      alert("Job posted successfully!");
      router.push("/dashboard/employer");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Common styling for react-select to match shadcn
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? '#3b82f6' : '#e4e4e7',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      borderRadius: '0.5rem',
      padding: '2px',
      backgroundColor: 'transparent',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f4f4f5' : 'white',
      color: state.isSelected ? '#1d4ed8' : '#18181b',
      cursor: 'pointer'
    })
  };

  return (
    <Card className="border-0 shadow-lg bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FormLabel className="text-base font-semibold">Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Frontend Developer" className="h-12 text-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
                      <FormLabel>Employment Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-12 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
                          {...field}
                        >
                          {Object.values(EmploymentType).map((type) => (
                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                      <FormLabel>Location (City)</FormLabel>
                      <FormControl>
                        <AsyncSelect
                          cacheOptions
                          defaultOptions
                          loadOptions={loadCities}
                          styles={selectStyles}
                          placeholder="Search city..."
                          onChange={(option: any) => field.onChange(option?.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subCategoryIds"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                      <FormLabel>Job Categories</FormLabel>
                      <FormControl>
                        <Select
                          isMulti
                          options={subCategoryOptions}
                          styles={selectStyles}
                          placeholder="Select categories..."
                          onChange={(options: any) => field.onChange(options.map((o: any) => o.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillIds"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                      <FormLabel>Required Skills</FormLabel>
                      <FormControl>
                        <AsyncSelect
                          isMulti
                          cacheOptions
                          defaultOptions
                          loadOptions={loadSkills}
                          styles={selectStyles}
                          placeholder="Search skills..."
                          onChange={(options: any) => field.onChange(options.map((o: any) => o.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 pt-6">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-xl font-semibold">Job Details</h3>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail the responsibilities and day-to-day tasks..." 
                        className="min-h-[150px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
                    <FormLabel>Requirements & Qualifications</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the required qualifications, experience, and nice-to-haves..." 
                        className="min-h-[150px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6 pt-6">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-xl font-semibold">Compensation</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-12 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                          {...field}
                        >
                          <option value="IDR">IDR (Rupiah)</option>
                          <option value="USD">USD (US Dollar)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                      <FormLabel>Minimum Salary</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 10000000" 
                          className="h-12"
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                      <FormLabel>Maximum Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 15000000" 
                          className="h-12"
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isSalaryVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold">Salary Visibility</FormLabel>
                      <FormDescription>
                        Turn off to hide the exact amount from job seekers (will display as "Competitive").
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-8 flex justify-end gap-4 border-t">
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" size="lg" className="px-10" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Job
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

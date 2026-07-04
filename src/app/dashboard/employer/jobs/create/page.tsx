import { Category } from "@/types/api";
import JobForm from "./JobForm";

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/categories`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error("Failed to fetch categories");
      return [];
    }
    const data = await res.json();
    return data as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CreateJobPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Post a New Job</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Fill in the details below to create a new job vacancy and find the perfect candidate.
        </p>
      </div>
      <JobForm initialCategories={categories} />
    </div>
  );
}

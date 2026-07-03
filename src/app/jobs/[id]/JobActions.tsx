'use client';

import { useState, useEffect } from 'react';
import { BookmarkPlus, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/AuthProvider';

export default function JobActions({ jobId, jobTitle }: { jobId: string, jobTitle: string }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'JOB_SEEKER') {
      fetchSavedStatus();
    } else {
      setLoading(false);
    }
  }, [user, jobId]);

  const fetchSavedStatus = async () => {
    try {
      const res = await apiClient.get('/saved-jobs');
      const savedJobs = res.data;
      const saved = savedJobs.some((job: any) => job.vacancyId === jobId);
      setIsSaved(saved);
    } catch (err) {
      console.error("Error fetching saved jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      alert("Please login as a Job Seeker to save jobs.");
      return;
    }
    if (user.role !== 'JOB_SEEKER') {
      alert("Only Job Seekers can save jobs.");
      return;
    }

    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      if (previousState) {
        await apiClient.delete(`/saved-jobs/${jobId}`);
      } else {
        await apiClient.post(`/saved-jobs/${jobId}`);
      }
    } catch (err: any) {
      console.error("Failed to toggle save", err);
      setIsSaved(previousState); // revert on failure
      alert(err.response?.data?.message || "Failed to save/unsave job.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${jobTitle} | CariKerja`,
      text: `Check out this job opportunity: ${jobTitle}`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant={isSaved ? "default" : "outline"} 
        size="icon" 
        onClick={toggleSave}
        disabled={loading}
        title={isSaved ? "Unsave Job" : "Save Job"}
      >
        {isSaved ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
      </Button>
      <Button variant="outline" size="icon" onClick={handleShare} title="Share Job">
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UploadCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  resumeTitle: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadCvModal({ isOpen, onClose, onUpload, resumeTitle }: UploadCvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_SIZE_MB = 5;

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Only PDF, DOC, or DOCX files are allowed.';
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size must not exceed ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleSelectFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setErrorMessage(err);
      setFile(null);
      setStatus('error');
      return;
    }
    setFile(f);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleSelectFile(dropped);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleSelectFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      await onUpload(file);
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to upload CV. Please try again.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus('idle');
    setErrorMessage('');
    setIsDragging(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (name: string) => name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/50">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/50">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-lg font-semibold">Upload CV</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 ml-12">
              For resume: <span className="font-medium text-zinc-700 dark:text-zinc-300">{resumeTitle}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Success State */}
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Upload Successful!</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your CV has been attached to this resume profile.</p>
              </div>
              <Button onClick={handleClose} className="mt-2 w-full">Done</Button>
            </div>
          ) : (
            <>
              {/* Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
                  ${isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                    : file
                    ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleInputChange}
                />
                {isDragging ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-medium text-blue-600 text-sm">Drop it here!</p>
                  </>
                ) : file ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/50">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm max-w-[240px] truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{getFileExtension(file.name)} · {formatFileSize(file.size)}</p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Click to change file</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300 text-sm">Drag & drop your CV here</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">or <span className="text-blue-600 dark:text-blue-400 font-medium">click to browse</span></p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">PDF</span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">DOC</span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">DOCX</span>
                      <span>· Max {MAX_SIZE_MB} MB</span>
                    </div>
                  </>
                )}
              </div>

              {/* Error Message */}
              {status === 'error' && errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Uploading Progress */}
              {status === 'uploading' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Uploading your CV, please wait...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
          <DialogFooter className="px-6 pb-6 gap-2">
            <Button variant="outline" onClick={handleClose} disabled={status === 'uploading'} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {status === 'uploading' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><UploadCloud className="w-4 h-4 mr-2" /> Upload CV</>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface CustomPaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function CustomPagination({ currentPage, lastPage, onPageChange }: CustomPaginationProps) {
  if (lastPage <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', lastPage);
      } else if (currentPage >= lastPage - 3) {
        pages.push(1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage);
      }
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-sm font-medium text-zinc-500">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        const pageNumber = page as number;
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            size="icon"
            className={`h-9 w-9 ${currentPage === pageNumber ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 5;
const COLUMNS = 7;

export function GRLoadingSkeleton() {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {Array.from({ length: COLUMNS }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b">
              {Array.from({ length: COLUMNS }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

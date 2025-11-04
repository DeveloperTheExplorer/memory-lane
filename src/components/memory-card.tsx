import * as React from "react";
import { Calendar, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/types/supabase";
import Image from "next/image";

type Memory = Tables<"memory">;

interface MemoryCardProps {
  memory: Memory;
  isFirst?: boolean;
  isLast?: boolean;
}

export const MemoryCard = ({ memory, isFirst, isLast }: MemoryCardProps) => {
  const formattedDate = new Date(memory.date_of_event).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative flex gap-6 pb-8">
      {/* Timeline Line and Dot */}
      <div className="relative flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full bg-primary ring-4 ring-background ${isFirst ? "mt-2" : ""
            }`}
        />
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Memory Card */}
      <Card className="flex-1 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-2">{memory.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={memory.date_of_event}>{formattedDate}</time>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Memory Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={memory.image_url}
              alt={memory.name}
              className="object-cover w-full h-full"
              fill
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            {/* Fallback for failed images */}
            <div className="hidden absolute inset-0 items-center justify-center bg-muted">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
          </div>

          {/* Memory Description */}
          <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
            {memory.description}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export const MemoryCardSkeleton = ({ isFirst, isLast }: { isFirst?: boolean; isLast?: boolean }) => {
  return (
    <div className="relative flex gap-6 pb-8">
      {/* Timeline Line and Dot */}
      <div className="relative flex flex-col items-center">
        <Skeleton className={`w-4 h-4 rounded-full ${isFirst ? "mt-2" : ""}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      {/* Memory Card Skeleton */}
      <Card className="flex-1">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


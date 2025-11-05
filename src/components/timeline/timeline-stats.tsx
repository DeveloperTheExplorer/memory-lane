import { Calendar, Image as ImageIcon } from "lucide-react";

interface TimelineStatsProps {
  memoryCount: number;
  createdDate: string;
}

export const TimelineStats = ({ memoryCount, createdDate }: TimelineStatsProps) => {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        <span>
          {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>Created {createdDate}</span>
      </div>
    </div>
  );
};


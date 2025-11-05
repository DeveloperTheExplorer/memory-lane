import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineErrorStateProps {
  type: "error" | "not-found";
  errorMessage?: string;
}

export const TimelineErrorState = ({ type, errorMessage }: TimelineErrorStateProps) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      
      {type === "error" ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {errorMessage || "Failed to load timeline"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-semibold mb-2">Timeline not found</h3>
            <p className="text-muted-foreground text-center mb-6">
              The timeline you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>Browse All Timelines</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


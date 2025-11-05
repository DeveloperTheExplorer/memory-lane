import { Plus, Image as ImageIcon, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/router";

interface EmptyMemoriesStateProps {
  onAddMemory: () => void;
}

export const EmptyMemoriesState = ({ onAddMemory }: EmptyMemoriesStateProps) => {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
        <p className="text-muted-foreground text-center mb-6">
          Start capturing your memories by adding your first one to this timeline.
        </p>
        {user ? (
          <Button className="gap-2" onClick={onAddMemory}>
            <Plus className="h-4 w-4" />
            Add Your First Memory
          </Button>
        ) : (
          <Button className="gap-2" onClick={() => router.push('/login')}>
            <LogIn className="h-4 w-4" />
            Login to Add Memories
          </Button>
        )}
      </CardContent>
    </Card>
  );
};


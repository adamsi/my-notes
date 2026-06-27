"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-lg font-medium">Something went wrong</p>
      <p className="text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}

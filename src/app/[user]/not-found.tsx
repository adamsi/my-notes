import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UserNotFound() {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-lg font-medium">User not found</p>
      <p className="text-sm text-muted-foreground">
        This user doesn&apos;t exist. They may have been removed.
      </p>
      <Button render={<Link href="/" />}>Back to users</Button>
    </Card>
  );
}

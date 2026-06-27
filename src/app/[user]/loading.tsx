import { Skeleton } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

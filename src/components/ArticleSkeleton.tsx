import { Skeleton } from "@/components/ui/skeleton";

export const ArticleSkeleton = () => {
  return (
    <div className="bg-card rounded-xl shadow-elevation-2 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center space-x-2 pt-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeaturedArticleSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl shadow-premium overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="h-80 lg:h-96 w-full" />
        <div className="p-8 lg:p-12 space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex items-center space-x-4 pt-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="pt-4">
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};
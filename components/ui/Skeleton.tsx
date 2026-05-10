"use client";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--surface-3) 25%, var(--surface-4) 50%, var(--surface-3) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        ...style,
      }}
    />
  );
}

export function ConversationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: "var(--surface-3)" }}>
          <Skeleton style={{ height: "14px", width: "75%" }} />
          <Skeleton style={{ height: "11px", width: "40%" }} />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <Skeleton style={{ height: "44px", width: "200px", borderRadius: "16px 16px 4px 16px" }} />
      </div>
      <div className="flex gap-3">
        <Skeleton style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0 }} />
        <Skeleton style={{ height: "80px", flex: 1, borderRadius: "16px 16px 16px 4px" }} />
      </div>
    </div>
  );
}

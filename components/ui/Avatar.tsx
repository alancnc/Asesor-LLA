"use client";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name, email, size = 36, className = "" }: AvatarProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email
    ? email.slice(0, 2).toUpperCase()
    : "?";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? email ?? "avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7C3AED, #4C1D95)",
        color: "#fff",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

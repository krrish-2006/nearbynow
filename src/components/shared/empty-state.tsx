import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function EmptyState({
  title,
  description,
  buttonText,
  buttonHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
      <h2 className="text-3xl font-black">
        {title}
      </h2>

      <p className="mt-3 text-neutral-500">
        {description}
      </p>

      {buttonText && buttonHref && (
        <Link
          href={buttonHref}
          className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-black px-8 text-lg font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

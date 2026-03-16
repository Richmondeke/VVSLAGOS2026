import Link from "next/link";

type Props = {
    message: string;
    ctaLabel?: string;
    ctaHref?: string;
};

export function EmptyState({ message, ctaLabel, ctaHref }: Props) {
    return (
        <div className="flex flex-col items-center rounded-lg bg-gray-50 p-8 text-center">
            <div className="mb-3 text-4xl text-gray-300">📭</div>
            <p className="mb-4 text-sm text-gray-600">{message}</p>
            {ctaLabel && ctaHref && (
                <Link
                    href={ctaHref}
                    className="rounded-lg bg-vvs-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-vvs-accent/90"
                >
                    {ctaLabel}
                </Link>
            )}
        </div>
    );
}

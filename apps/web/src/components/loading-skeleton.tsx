type Props = {
    className?: string;
};

export function LoadingSkeleton({ className = "h-24" }: Props) {
    return (
        <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
    );
}

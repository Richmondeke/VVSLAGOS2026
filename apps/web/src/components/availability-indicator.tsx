type AvailabilityStatus = "available" | "busy" | "unavailable";

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; dotClass: string }> = {
    available: { label: "Available", dotClass: "bg-avail-available" },
    busy: { label: "Busy", dotClass: "bg-avail-busy" },
    unavailable: { label: "Not Taking Work", dotClass: "bg-avail-unavailable" },
};

type Props = {
    status: AvailabilityStatus;
};

export function AvailabilityIndicator({ status }: Props) {
    const config = STATUS_CONFIG[status];

    return (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
            {config.label}
        </span>
    );
}

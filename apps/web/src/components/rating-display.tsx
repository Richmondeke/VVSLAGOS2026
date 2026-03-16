"use client";

type ReadProps = {
    mode: "read";
    rating: number;
    count?: number;
};

type WriteProps = {
    mode: "write";
    rating: number;
    onChange: (rating: number) => void;
};

type Props = ReadProps | WriteProps;

export function RatingDisplay(props: Props) {
    const stars = [1, 2, 3, 4, 5];

    if (props.mode === "write") {
        return (
            <div className="flex items-center gap-1">
                {stars.map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => props.onChange(star)}
                        className={`text-2xl transition-colors ${
                            star <= props.rating ? "text-yellow-400" : "text-gray-300"
                        } hover:text-yellow-400`}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex">
                {stars.map((star) => (
                    <span
                        key={star}
                        className={`text-sm ${
                            star <= Math.round(props.rating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                    >
                        ★
                    </span>
                ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{props.rating.toFixed(1)}</span>
            {props.count != null && (
                <span className="text-sm text-gray-500">({props.count})</span>
            )}
        </div>
    );
}

import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Lagos 2026 Pop-Up: Collectors Day Preview"
            eventDate="July 9, 2026"
            eventTime="12:00 PM WAT"
            eventVenue="Mikano, 65 Adeola Odeku, VI, Lagos"
            eventDescription="An exclusive preview event for art collectors and patrons, showcasing high luxury design and select curated items."
            eventType="collectors_day_preview"
            preSelectedEvents={["JULY 9_COLLECTORS"]}
        />
    );
}

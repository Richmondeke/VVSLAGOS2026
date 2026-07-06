import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Lagos 2026 Art Exhibition"
            eventDate="July 8 - 12, 2026"
            eventTime="12:00 PM WAT"
            eventVenue="Blank Space, VI, Lagos"
            eventDescription="VVS Lagos 2026 Art Exhibition: showcasing outstanding modern and contemporary visual art installations."
            eventType="art_exhibition"
            preSelectedEvents={["JULY 8-12"]}
        />
    );
}

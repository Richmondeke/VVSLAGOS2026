import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Lagos 2026 Art Exhibition"
            eventDate="July 9 - 12, 2026"
            eventTime="7:00 PM WAT"
            eventVenue="Blank Space, Grace Arena Plaza, VI, Lagos"
            eventDescription="VVS Lagos 2026 Art Exhibition: showcasing outstanding modern and contemporary visual art installations, curated by Ifeanyi Nwune and Richard Vedelago."
            eventType="art_exhibition"
            preSelectedEvents={["JULY 9-12"]}
        />
    );
}

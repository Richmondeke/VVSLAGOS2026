import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Lagos 2026 Pop-Up: Trunk Show"
            eventDate="July 7 - 11, 2026"
            eventTime="10:00 AM WAT"
            eventVenue="Mikano, 65 Adeola Odeku, VI, Lagos"
            eventDescription="A premium trunk show featuring retail collections from luxury Nigerian fashion brands and our VVS Innovators."
            eventType="popup_trunk_show"
            preSelectedEvents={["JULY 7-11"]}
        />
    );
}

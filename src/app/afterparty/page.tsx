import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Runway Show & Afterparty"
            eventDate="July 12, 2026"
            eventTime="6:00 PM WAT"
            eventVenue="TBD, Lagos"
            eventDescription="The final celebratory fashion runway showcase and closing party of VVS Lagos 2026."
            eventType="runway_afterparty"
            preSelectedEvents={["JULY 12"]}
        />
    );
}

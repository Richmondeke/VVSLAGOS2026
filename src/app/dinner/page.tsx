import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Private Dinner"
            eventDate="July 11, 2026"
            eventTime="7:00 PM WAT"
            eventVenue="Four Points by Sheraton, VI, Lagos"
            eventDescription="An exclusive, invitation-only private dinner gathering for VVS Lagos 2026 guests, partners, and curators."
            eventType="private_dinner"
            preSelectedEvents={["JULY 11_DINNER"]}
        />
    );
}

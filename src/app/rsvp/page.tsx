"use client";

import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function RSVPPage() {
    return (
        <EventRSVPForm
            eventTitle="VVS Lagos RSVP"
            eventDate="July 6 - 12, 2026"
            eventTime="All Day"
            eventVenue="Various Venues, Lagos"
            eventDescription="Submit request for invitations to VVS Lagos 2026 events. Choose your target events below."
            eventType="general_rsvp"
            preSelectedEvents={["JULY 6"]}
            showEventSelection={true}
        />
    );
}

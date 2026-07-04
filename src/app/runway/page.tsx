import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Runway Show (Main Event)"
            eventDate="July 12, 2026"
            eventTime="6:00 PM WAT"
            eventVenue="TBD, Lagos"
            eventDescription="The official runway show and main fashion event of VVS Lagos 2026. Presentation of collections by the VVS Innovators."
            eventType="runway_show"
            preSelectedEvents={["JULY 12"]}
            ticketUrl="https://www.pv.rsvp/vvs-fashion-show"
        />
    );
}

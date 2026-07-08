import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Runway Show (Main Event)"
            eventDate="July 12, 2026"
            eventTime="5:00 PM WAT"
            eventVenue="Club 245, VI, Lagos"
            eventDescription="The official runway show and main fashion event of VVS Lagos 2026. Presenting collections by Abigail Ajobi, Oshobor (VVS New Designer), Lai Labode Couture, and I.N Official."
            eventType="runway_show"
            preSelectedEvents={["JULY 12"]}
            ticketUrl="https://www.pv.rsvp/vvs-fashion-show"
        />
    );
}

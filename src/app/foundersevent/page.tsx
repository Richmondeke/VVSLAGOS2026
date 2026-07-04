import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Founders Reception"
            eventDate="July 6, 2026"
            eventTime="6:00 PM WAT"
            eventVenue="Alliance Française, Ikoyi, Lagos"
            eventDescription="An exclusive gathering of founders, creators, and leaders to kick off VVS Lagos 2026. Network with fellow innovators and enjoy curated hospitality in a premium setting."
            eventType="founders_reception"
            preSelectedEvents={["JULY 6"]}
        />
    );
}

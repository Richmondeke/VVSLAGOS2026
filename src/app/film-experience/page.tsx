import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Film Experience with AFRIFF"
            eventDate="July 11, 2026"
            eventTime="3:00 PM WAT"
            eventVenue="TBD, Lagos"
            eventDescription="A curated series of screenings, short films, and panel discussions on new-age African cinema, presented in partnership with AFRIFF."
            eventType="film_experience"
            preSelectedEvents={["JULY 11"]}
        />
    );
}

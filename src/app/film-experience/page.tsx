import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Film Experience with AFRIFF"
            eventDate="July 11, 2026"
            eventTime="4:00 PM - 8:00 PM WAT"
            eventVenue="Film One Landmark, VI, Lagos"
            eventDescription="A curated series of screenings, short films, and panel discussions on new-age African cinema, presented in partnership with AFRIFF at Landmark Filmhouse."
            eventType="film_experience"
            preSelectedEvents={["JULY 11"]}
        />
    );
}

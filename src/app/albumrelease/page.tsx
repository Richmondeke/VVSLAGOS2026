import React from "react";
import EventRSVPForm from "@/components/EventRSVPForm";

export default function Page() {
    return (
        <EventRSVPForm
            eventTitle="VVS Album Release Party"
            eventDate="July 9, 2026"
            eventTime="10:00 PM WAT"
            eventVenue="Octo Lagos, Musa Yar'Adua, VI, Lagos"
            eventDescription="An exclusive celebration for the release of the official VVS Lagos album, featuring guest DJ sets and live performances."
            eventType="album_release_party"
            preSelectedEvents={["JULY 9_ALBUM"]}
        />
    );
}

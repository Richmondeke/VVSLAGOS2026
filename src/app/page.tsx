import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/sections/Hero";
import Theme from "@/components/sections/Theme";
import Journey from "@/components/sections/Journey";
import EventsCalendar from "@/components/sections/EventsCalendar";
import Highlights from "@/components/sections/Highlights";
import Designers from "@/components/sections/Designers";
import GetInvolved from "@/components/sections/GetInvolved";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <MainLayout>
      <Hero />
      <Highlights />
      <Theme />
      <Journey />
      <EventsCalendar />
      <Designers />
      <GetInvolved />
      <Newsletter />
    </MainLayout>
  );
}

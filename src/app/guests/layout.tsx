import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VVS Lagos 2026 | Guest Onboarding",
  description: "Welcome to VVS Lagos 2026. Onboarding and check-in portal for guests.",
};

export default function GuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

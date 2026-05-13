"use client";

import { useState } from "react";

const gold = "#C9A84C";
const cream = "#F5F0E8";
const dark = "#0D0D0D";
const charcoal = "#1A1A1A";
const muted = "#888";
const accent = "#E8D5A3";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .vvs-root {
    background: ${dark};
    color: ${cream};
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .hero {
    background: linear-gradient(160deg, #0D0D0D 60%, #1a1400 100%);
    border-bottom: 1px solid ${gold}33;
    padding: 60px 48px 48px;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: 'VVS';
    position: absolute;
    right: -20px;
    top: -20px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 280px;
    color: ${gold}08;
    line-height: 1;
    pointer-events: none;
  }

  .hero-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 4px;
    color: ${gold};
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 300;
    line-height: 1.05;
    color: ${cream};
    margin-bottom: 8px;
  }

  .hero-title em {
    color: ${gold};
  }

  .hero-sub {
    font-size: 11px;
    color: ${muted};
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 20px;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid #222;
    background: #111;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar { display: none; }

  .tab {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 16px 24px;
    color: ${muted};
    cursor: pointer;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .tab:hover { color: ${cream}; }
  .tab.active { color: ${gold}; border-bottom-color: ${gold}; }

  .content {
    padding: 48px;
    max-width: 1100px;
  }

  .section-label {
    font-size: 9px;
    letter-spacing: 4px;
    color: ${gold};
    text-transform: uppercase;
    margin-bottom: 32px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${gold}33;
  }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px;
    font-weight: 700;
    color: ${cream};
    margin-bottom: 12px;
    line-height: 1.1;
  }

  .section-desc {
    font-size: 12px;
    color: ${muted};
    line-height: 1.8;
    max-width: 680px;
    margin-bottom: 48px;
  }

  .pillar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2px;
    margin-bottom: 48px;
  }

  .pillar-card {
    background: #111;
    border: 1px solid #1e1e1e;
    padding: 28px;
    transition: border-color 0.2s;
    cursor: default;
  }

  .pillar-card:hover { border-color: ${gold}55; }

  .pillar-num {
    font-size: 9px;
    color: ${gold};
    letter-spacing: 3px;
    margin-bottom: 12px;
  }

  .pillar-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: ${cream};
    margin-bottom: 12px;
  }

  .pillar-desc {
    font-size: 11px;
    color: #777;
    line-height: 1.75;
    margin-bottom: 16px;
  }

  .pillar-items {
    list-style: none;
  }

  .pillar-items li {
    font-size: 10px;
    color: ${accent};
    padding: 4px 0;
    padding-left: 14px;
    position: relative;
    letter-spacing: 0.5px;
  }

  .pillar-items li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: ${gold};
  }

  .timeline {
    position: relative;
    margin-bottom: 48px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, ${gold}, ${gold}22);
  }

  .tl-item {
    padding: 0 0 36px 32px;
    position: relative;
  }

  .tl-dot {
    position: absolute;
    left: -4px;
    top: 4px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${gold};
    box-shadow: 0 0 0 3px ${dark}, 0 0 0 4px ${gold}44;
  }

  .tl-phase {
    font-size: 9px;
    color: ${gold};
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .tl-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    color: ${cream};
    margin-bottom: 8px;
  }

  .tl-detail {
    font-size: 11px;
    color: #666;
    line-height: 1.8;
  }

  .tl-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .tag {
    font-size: 9px;
    letter-spacing: 1px;
    padding: 3px 10px;
    border: 1px solid ${gold}33;
    color: ${gold};
    text-transform: uppercase;
  }

  .radar-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 48px;
  }

  .radar-table th {
    font-size: 9px;
    letter-spacing: 3px;
    color: ${gold};
    text-transform: uppercase;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid ${gold}33;
  }

  .radar-table td {
    font-size: 11px;
    padding: 14px 16px;
    border-bottom: 1px solid #1a1a1a;
    color: #aaa;
    vertical-align: top;
  }

  .radar-table tr:hover td { background: #111; }

  .company-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    color: ${cream};
    display: block;
    margin-bottom: 2px;
  }

  .badge {
    font-size: 8px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 2px;
    display: inline-block;
  }

  .badge-sponsor { background: ${gold}22; color: ${gold}; border: 1px solid ${gold}44; }
  .badge-partner { background: #1a2a1a; color: #7acc7a; border: 1px solid #3a5a3a; }
  .badge-tech { background: #1a1a2a; color: #7a7acc; border: 1px solid #3a3a5a; }
  .badge-infra { background: #2a1a1a; color: #cc7a7a; border: 1px solid #5a3a3a; }

  .priority-high { color: #cc9933; }
  .priority-mid { color: #888; }

  .screen-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    margin-bottom: 48px;
  }

  .screen-block {
    background: #0f0f0f;
    border: 1px solid #1e1e1e;
    padding: 28px;
  }

  .screen-block.full { grid-column: 1 / -1; }

  .screen-block-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: ${gold};
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .screen-block-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    color: ${cream};
    margin-bottom: 10px;
  }

  .screen-block-text {
    font-size: 11px;
    color: #666;
    line-height: 1.8;
  }

  .step-list {
    list-style: none;
    margin-top: 16px;
  }

  .step-list li {
    font-size: 11px;
    color: #888;
    padding: 8px 0;
    padding-left: 24px;
    position: relative;
    border-bottom: 1px solid #161616;
    line-height: 1.6;
  }

  .step-list li:last-child { border-bottom: none; }

  .step-list li .step-num {
    position: absolute;
    left: 0;
    color: ${gold};
    font-size: 9px;
    top: 10px;
  }

  .pv-card {
    background: linear-gradient(135deg, #0f0f0f, #1a1200);
    border: 1px solid ${gold}33;
    padding: 32px;
    margin-bottom: 24px;
  }

  .pv-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    color: ${gold};
    margin-bottom: 12px;
  }

  .pv-body {
    font-size: 11px;
    color: #888;
    line-height: 1.9;
    margin-bottom: 20px;
  }

  .agenda-list {
    list-style: none;
  }

  .agenda-list li {
    display: flex;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid #1a1a1a;
    font-size: 11px;
    color: #aaa;
  }

  .agenda-time {
    color: ${gold};
    min-width: 60px;
    font-size: 10px;
    margin-top: 1px;
  }

  .champion-box {
    background: ${gold}0d;
    border-left: 3px solid ${gold};
    padding: 20px 24px;
    margin-top: 24px;
  }

  .champion-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: ${gold};
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .champion-text {
    font-size: 12px;
    color: ${cream};
    line-height: 1.8;
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
  }

  @media (max-width: 640px) {
    .content { padding: 24px; }
    .hero { padding: 40px 24px 32px; }
    .screen-grid { grid-template-columns: 1fr; }
    .screen-block.full { grid-column: 1; }
  }
`;

const TABS = [
  { id: "tech", label: "01 — Tech UX Plan" },
  { id: "partyverse", label: "02 — PartyVerse Call" },
  { id: "radar", label: "03 — Partner Radar" },
  { id: "kene", label: "04 — Kene Screens" },
];

const TECH_PILLARS = [
  {
    num: "01",
    name: "Festival Website",
    desc: "The digital front door — optimised for discovery, ticketing conversion, and brand storytelling.",
    items: [
      "Pre-festival hype & countdown page",
      "Programme schedule with filterable tracks",
      "Artist & speaker profile pages",
      "Mobile-first, fast-loading on 4G/LTE",
      "Instagram / X live feed embed",
    ],
  },
  {
    num: "02",
    name: "Ticketing & Access",
    desc: "End-to-end digital ticketing from purchase to gate — seamless, branded, and fraud-resistant.",
    items: [
      "Integrated ticketing (Tix.africa or Paystack Storefront)",
      "Unique QR code per ticket, scannable offline",
      "Multi-tier ticket types (General, VIP, VVS Society)",
      "Instant WhatsApp / email ticket delivery",
      "On-site check-in dashboard for ops team",
    ],
  },
  {
    num: "03",
    name: "Festival App / PWA",
    desc: "A lightweight progressive web app guests can save to home screen — no download friction.",
    items: [
      "Personalised schedule builder",
      "Live programme updates & push alerts",
      "Interactive venue map",
      "QR code wallet for access",
      "Social sharing & moments capture",
    ],
  },
  {
    num: "04",
    name: "On-Site Screens & Signage",
    desc: "A coherent digital wayfinding and content system across all screens at every venue.",
    items: [
      "Stage countdown & now-playing displays",
      "Sponsor / partner rotations with dwell metrics",
      "Real-time social wall (#VVSLagos)",
      "Wayfinding totems at entry points",
      "Ambient art-mode screensavers between sets",
    ],
  },
  {
    num: "05",
    name: "QR Code Ecosystem",
    desc: "QR as a connective layer — linking physical moments to digital experiences across the festival.",
    items: [
      "Artist / artwork QR codes linking to bios & streaming",
      "Sponsor activation QR codes with UTM tracking",
      "Exhibition piece QR codes for extended content",
      "Wristband NFC/QR for cashless bar payments",
      "Post-event QR codes on merch for digital collectibles",
    ],
  },
  {
    num: "06",
    name: "AI & Immersive Tech",
    desc: "Cutting-edge AI and VR activations that make VVS a conversation about the African future.",
    items: [
      "AI portrait booth (attendee styled in Afrofuturist looks)",
      "VR room: archive of VVS editions 1–4",
      "AI-generated personalised festival recap video",
      "Generative art wall that responds to crowd movement",
      "GPT-powered VVS chatbot for programme Q&A",
    ],
  },
  {
    num: "07",
    name: "Livestream & Content",
    desc: "Taking VVS global — real-time broadcast and post-event content that extends the festival's reach.",
    items: [
      "YouTube / Instagram Live for keynote sessions",
      "Multi-cam fashion show livestream",
      "Highlight reels uploaded same-day",
      "VVS Society broadcast channel content pipeline",
      "Clip licensing kit for press & partners",
    ],
  },
  {
    num: "08",
    name: "Data & Analytics",
    desc: "Knowing who came, what moved them, and what to improve — responsibly.",
    items: [
      "Attendance & check-in analytics dashboard",
      "QR scan heatmaps by zone",
      "Social sentiment tracking (#VVSLagos)",
      "Ticket sales funnel reporting",
      "Post-event NPS survey via WhatsApp",
    ],
  },
];

const TIMELINE = [
  {
    phase: "T-8 weeks",
    title: "Foundation",
    detail: "Finalise tech stack decisions. Brief all vendors. Launch ticketing. Publish website v1 with early-bird ticket CTA. Set up analytics tracking.",
    tags: ["Website", "Ticketing", "Vendors"],
  },
  {
    phase: "T-4 weeks",
    title: "Activation Build",
    detail: "PWA / app live. QR code system designed and printed. Screen content templates built. AI booth vendor confirmed and briefed. Livestream platform set up.",
    tags: ["App", "QR", "Screens", "AI"],
  },
  {
    phase: "T-1 week",
    title: "Rehearsal & Testing",
    detail: "Full dry-run of check-in flow. Screen content uploaded and tested on-site. Wi-Fi load tested. Ops team trained on check-in dashboard. Emergency tech protocols documented.",
    tags: ["Testing", "Training", "Ops"],
  },
  {
    phase: "Festival Days",
    title: "Live Operations",
    detail: "Tech war room on-site. Real-time screen management. Check-in support. Livestream monitored. Social wall moderated. Daily analytics review each morning.",
    tags: ["On-site", "Live", "Monitoring"],
  },
  {
    phase: "Post-Festival",
    title: "Wrap & Insights",
    detail: "All session recordings published within 48h. NPS survey sent via WhatsApp. Analytics report compiled. AI-generated recap videos distributed. Learnings documented for VVS 2026.",
    tags: ["Content", "Analytics", "Report"],
  },
];

const PARTNERS = [
  { name: "Bumpa", type: "partner", category: "E-commerce / Merchant Tech", pitch: "Power a VVS marketplace for creators selling during & after the festival. Co-branded commerce experience.", priority: "high" },
  { name: "Topship", type: "sponsor", category: "Logistics / Shipping", pitch: "Official logistics partner — VVS merch & physical deliveries. Already a VVS partner. Upsell to tech sponsor.", priority: "high" },
  { name: "MTN Nigeria", type: "sponsor", category: "Connectivity / Telco", pitch: "Official connectivity sponsor. MTN-branded Wi-Fi zones. 5G experience activation. Already a VVS partner.", priority: "high" },
  { name: "Paystack", type: "tech", category: "Payments", pitch: "Power cashless payments, wristband NFC transactions, and ticket sales. Co-branded 'Powered by Paystack' across all payment touchpoints.", priority: "high" },
  { name: "Flutterwave", type: "tech", category: "Payments", pitch: "Alternative to Paystack — international payment rails for diaspora ticket buyers.", priority: "mid" },
  { name: "Tix.africa", type: "tech", category: "Ticketing Platform", pitch: "Africa-native ticketing platform. QR code system, data dashboard, mobile check-in — purpose-built for Lagos events.", priority: "high" },
  { name: "Termii", type: "tech", category: "Messaging / Notifications", pitch: "Power all WhatsApp & SMS notifications — ticket delivery, schedule reminders, post-event NPS.", priority: "high" },
  { name: "Mono / Okra", type: "tech", category: "Fintech Infrastructure", pitch: "Identity verification for VIP attendees. KYC layer for high-value ticket tiers.", priority: "mid" },
  { name: "Interswitch", type: "sponsor", category: "Digital Payments", pitch: "Co-branded cashless wristband / tap-to-pay experience. VVS as a showcase for Interswitch's event payments product.", priority: "mid" },
  { name: "Konga / Jumia", type: "partner", category: "E-commerce", pitch: "Official online retail partner for VVS merchandise and featured designer drops.", priority: "mid" },
  { name: "Showmax / Netflix Africa", type: "sponsor", category: "Streaming", pitch: "Co-host VVS Film Screening / AFRIFF tie-in. Content licensing for VVS documentary.", priority: "mid" },
  { name: "Google Nigeria", type: "sponsor", category: "Tech / AI", pitch: "AI activation partner (Google Lens, AI portrait experience). 'Built with Google' branding on tech infrastructure.", priority: "high" },
  { name: "Sterling Bank", type: "sponsor", category: "Banking", pitch: "Already a VVS partner. Expand to digital co-branding — co-sponsor the AI/VR zone as 'Sterling Futures Lab'.", priority: "high" },
  { name: "Cowrywise / PiggyVest", type: "partner", category: "Fintech / Savings", pitch: "Financial wellness panel partner targeting the creator economy audience. Brand activation at VVS Conversations.", priority: "mid" },
  { name: "AWS / Azure Nigeria", type: "tech", category: "Cloud Infrastructure", pitch: "Power livestreaming infrastructure and AI workloads. In-kind tech credit in exchange for 'Powered by' badge.", priority: "mid" },
  { name: "Zoho Africa", type: "tech", category: "Business Software", pitch: "CRM and operations platform for VVS team. Co-brand the 'Future Labs' mentorship programme administration.", priority: "mid" },
];

const badgeClass = (type: string) => {
  if (type === "sponsor") return "badge-sponsor";
  if (type === "partner") return "badge-partner";
  if (type === "tech") return "badge-tech";
  return "badge-infra";
};

const badgeLabel = (type: string) => {
  if (type === "sponsor") return "Sponsor";
  if (type === "partner") return "Partner";
  if (type === "tech") return "Tech";
  return "Infra";
};

export default function VVSTech() {
  const [activeTab, setActiveTab] = useState("tech");

  return (
    <div className="vvs-root">
      <style>{styles}</style>

      <div className="hero">
        <div className="hero-label">VVS Lagos — Internal Strategy Document</div>
        <h1 className="hero-title">
          Technology &<br /><em>Digital Experience</em><br />Strategy
        </h1>
        <div className="hero-sub">Very Very Special · Festival Technology Playbook · 2026</div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: TECH UX PLAN ── */}
      {activeTab === "tech" && (
        <div className="content">
          <div className="section-label">Technology User Experience Plan</div>
          <h2 className="section-title">Every screen, code,<br />and signal — intentional.</h2>
          <p className="section-desc">
            VVS Lagos is Africa's premier creative convention. The technology experience should match that ambition — invisible where it needs to be frictionless, spectacular where it can create a moment. This plan covers the full digital surface area of the festival, from pre-sale to post-event recap.
          </p>

          <div className="section-label">Eight Pillars of the VVS Tech Experience</div>
          <div className="pillar-grid">
            {TECH_PILLARS.map((p) => (
              <div className="pillar-card" key={p.num}>
                <div className="pillar-num">PILLAR {p.num}</div>
                <div className="pillar-name">{p.name}</div>
                <div className="pillar-desc">{p.desc}</div>
                <ul className="pillar-items">
                  {p.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="section-label" style={{ marginTop: 48 }}>Delivery Timeline</div>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div className="tl-item" key={i}>
                <div className="tl-dot" />
                <div className="tl-phase">{t.phase}</div>
                <div className="tl-title">{t.title}</div>
                <div className="tl-detail">{t.detail}</div>
                <div className="tl-tags">
                  {t.tags.map((tag, j) => <span className="tag" key={j}>{tag}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="champion-box">
            <div className="champion-label">Championing This Plan</div>
            <div className="champion-text">
              This document serves as the foundation for the tech experience pitch to the core VVS team. Recommend presenting in a dedicated 45-minute session — walk through each pillar, assign owners, and lock vendors by end of meeting. Assign a Technology Lead who sits in all cross-functional briefings and owns the digital experience end-to-end.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PARTYVERSE ── */}
      {activeTab === "partyverse" && (
        <div className="content">
          <div className="section-label">PartyVerse Call</div>
          <h2 className="section-title">Aligning the<br />digital ecosystem.</h2>
          <p className="section-desc">
            PartyVerse connects African event organisers with the tools, platforms, and partners shaping the future of live experiences. This call brief outlines how to position VVS Lagos and what to explore.
          </p>

          <div className="pv-card">
            <div className="pv-title">Call Objectives</div>
            <div className="pv-body">
              VVS Lagos is a culture-first creative convention with infrastructure ambitions. The PartyVerse call is an opportunity to explore how their platform and network can plug into our digital experience strategy — from ticketing intelligence and attendee data, to co-marketing and branded tech activations during the festival week.
            </div>
            <ul className="pillar-items">
              <li>Present VVS 2026 scope, audience, and cultural positioning</li>
              <li>Understand PartyVerse's current product and event partner offer</li>
              <li>Explore co-branded digital experiences or data integrations</li>
              <li>Discuss mutual visibility — VVS in PartyVerse's network; PartyVerse at VVS</li>
              <li>Agree next steps: pilot, POC, or partnership term sheet</li>
            </ul>
          </div>

          <div className="section-label">Suggested Call Agenda</div>
          <ul className="agenda-list">
            {[
              ["00:00", "Intros & context — what is VVS, who is on the call"],
              ["05:00", "VVS 2026 overview — scale, audience, programming, cultural positioning"],
              ["12:00", "Tech landscape brief — our current plan and where we have open slots"],
              ["20:00", "PartyVerse product demo / overview — what they can offer"],
              ["32:00", "Fit assessment — where does PartyVerse slot into our plan?"],
              ["42:00", "Commercial framing — sponsor, partner, or in-kind?"],
              ["50:00", "Next steps, timeline, point of contact"],
            ].map(([time, item], i) => (
              <li key={i}>
                <span className="agenda-time">{time as string}</span>
                <span>{item as string}</span>
              </li>
            ))}
          </ul>

          <div className="section-label" style={{ marginTop: 48 }}>Key Talking Points for VVS</div>
          <div className="pillar-grid">
            {[
              { num: "A", name: "The Audience", desc: "VVS attracts tastemakers, founders, artists, and media across Africa and the diaspora. This is a high-value, hard-to-reach audience for any tech platform." },
              { num: "B", name: "The Scale", desc: "Week-long programming across multiple venues. Thousands of attendees. Global livestream audience. Multiple surfaces for brand integration." },
              { num: "C", name: "The Legacy", desc: "4th edition. Federal Ministry backing. British Council. MTN. Sterling Bank. VVS is not a startup event — it is an institution in the making." },
              { num: "D", name: "The Ask", desc: "We want a tech partner who adds real value — not just a logo. PartyVerse could own the digital attendee journey if the product fits." },
            ].map((p) => (
              <div className="pillar-card" key={p.num}>
                <div className="pillar-num">POINT {p.num}</div>
                <div className="pillar-name">{p.name}</div>
                <div className="pillar-desc">{p.desc}</div>
              </div>
            ))}
          </div>

          <div className="champion-box">
            <div className="champion-label">Pre-Call Action</div>
            <div className="champion-text">
              Send PartyVerse a one-page VVS overview and this tech plan summary 48 hours before the call. Frame it as: "We're building something serious. We want to know if you're the right partner for this chapter." Come with clear asks, not open questions.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PARTNER RADAR ── */}
      {activeTab === "radar" && (
        <div className="content">
          <div className="section-label">Technology Partner & Sponsor Radar</div>
          <h2 className="section-title">Who to call.<br />Why. How.</h2>
          <p className="section-desc">
            A curated radar of Nigerian and pan-African tech companies the VVS team should approach — organised by category, with a clear pitch angle for each. Prioritised by strategic fit and likelihood to convert.
          </p>

          <table className="radar-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Type</th>
                <th>Category</th>
                <th>Pitch Angle</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {PARTNERS.map((p, i) => (
                <tr key={i}>
                  <td>
                    <span className="company-name">{p.name}</span>
                  </td>
                  <td>
                    <span className={`badge ${badgeClass(p.type)}`}>{badgeLabel(p.type)}</span>
                  </td>
                  <td style={{ fontSize: 10, color: "#666" }}>{p.category}</td>
                  <td style={{ maxWidth: 320 }}>{p.pitch}</td>
                  <td>
                    <span className={p.priority === "high" ? "priority-high" : "priority-mid"}>
                      {p.priority === "high" ? "● High" : "○ Mid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="section-label">Outreach Strategy</div>
          <div className="screen-grid">
            <div className="screen-block">
              <div className="screen-block-label">The Approach</div>
              <div className="screen-block-title">Lead with culture, close with metrics.</div>
              <div className="screen-block-text">
                VVS's power is its cultural credibility. Lead every outreach with the story — "Africa's #1 creative convention, backed by the Federal Ministry, 4th edition, thousands of attendees." Then follow with hard numbers: reach, audience demographics, media impressions. Close with a specific, time-bound ask.
              </div>
            </div>
            <div className="screen-block">
              <div className="screen-block-label">The Tiers</div>
              <div className="screen-block-title">Three partnership levels.</div>
              <div className="screen-block-text">
                <strong style={{ color: gold }}>Title Tech Partner</strong> — one exclusive brand owns "VVS Tech" (e.g., "VVS Lagos, Powered by MTN"). Full integration across all digital touchpoints.<br /><br />
                <strong style={{ color: gold }}>Zone Sponsor</strong> — brand owns one experience (AI Booth, Cashless Payments, Livestream).<br /><br />
                <strong style={{ color: gold }}>In-Kind Tech Partner</strong> — software / platform in exchange for logo placement and case study rights.
              </div>
            </div>
            <div className="screen-block full">
              <div className="screen-block-label">Outreach Timeline</div>
              <ul className="step-list">
                <li><span className="step-num">W1</span>Send warm intro emails to high-priority targets. Use existing relationships (Topship, MTN, Sterling already in network).</li>
                <li><span className="step-num">W2</span>Follow up with one-pager and partnership deck. Offer 30-min discovery calls.</li>
                <li><span className="step-num">W3</span>Present partnership tiers and negotiate terms. Aim for LOIs by end of week.</li>
                <li><span className="step-num">W4</span>Lock signed agreements. Brief tech partners on integration requirements and deadlines.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: KENE SCREENS ── */}
      {activeTab === "kene" && (
        <div className="content">
          <div className="section-label">Kene's Team — Interactive Screen Experiences</div>
          <h2 className="section-title">Screens that<br />feel alive.</h2>
          <p className="section-desc">
            Kene's team brings existing interactive screen infrastructure to VVS Lagos. The goal is to design experiences that feel native to VVS's aesthetic — not generic tech demos, but cultural moments that happen to use screens.
          </p>

          <div className="section-label">Proposed Screen Experience Concepts</div>
          <div className="screen-grid">
            {[
              {
                label: "Concept 01",
                title: "The VVS Collective Portrait Wall",
                text: "An interactive photo wall where attendees tap to trigger their name + face to appear on a mosaic display. By end of day, the full mosaic forms a VVS Lagos artwork. Shared on socials as the 'face of VVS 2026'.",
              },
              {
                label: "Concept 02",
                title: "Live Programme Command Screen",
                text: "A large-format 'mission control' screen at the main entrance showing the live schedule, stage activity, session count, and social feed. Updates in real time. Doubles as a sponsor billboard between content slots.",
              },
              {
                label: "Concept 03",
                title: "Generative Art Mode",
                text: "During transitions and between sessions, screens enter 'art mode' — generative visuals that respond to live audio levels from the stage. Built with p5.js or TouchDesigner. Feels like VVS has its own visual identity breathing through the walls.",
              },
              {
                label: "Concept 04",
                title: "The Conversation Wall",
                text: "A prompt appears on screens: 'What does African creativity mean to you?' Attendees respond via QR → SMS → screen. Best responses curated and displayed live. Creates emotional connection and shareable content.",
              },
              {
                label: "Concept 05 — Full Width",
                title: "AI Style Oracle",
                text: "Attendees step in front of a camera screen, strike a pose, and an AI processes their look in real time — generating a 'VVS Style Card' describing their aesthetic in elevated language. Print or share to phone instantly. Huge crowd magnet, long dwell time, shareable moment. Sponsor this experience with a fashion or beauty brand.",
                full: true,
              },
            ].map((c, i) => (
              <div className={`screen-block${c.full ? " full" : ""}`} key={i}>
                <div className="screen-block-label">{c.label}</div>
                <div className="screen-block-title">{c.title}</div>
                <div className="screen-block-text">{c.text}</div>
              </div>
            ))}
          </div>

          <div className="section-label">Working with Kene's Team — Process</div>
          <ul className="step-list" style={{ marginBottom: 48 }}>
            {[
              "Briefing session: Share VVS 2026 theme, brand guidelines, venue map, and programme schedule with Kene's team.",
              "Audit Kene's existing hardware: screen sizes, input types (touch, camera, sensor), connectivity, content management system.",
              "Co-design sprint: 2-hour working session to map each screen to a concept from the list above — or generate new ones based on their existing capabilities.",
              "Content pipeline: VVS creative team provides brand assets (colours, typefaces, imagery) for Kene's team to build templates.",
              "Integration points: Agree how VVS's live schedule, social feeds, and QR systems will pipe into Kene's screens.",
              "On-site dry run (T-2 days): Full test of all interactive experiences with VVS staff as guinea pigs. Fix any latency or UX issues.",
              "Festival week: Kene's team manages screen ops. VVS tech contact has a direct line for any changes or emergencies.",
              "Post-event: Kene's team exports engagement data (dwell time, interactions). Include in VVS analytics report.",
            ].map((step, i) => (
              <li key={i}>
                <span className="step-num">0{i + 1}</span>
                {step}
              </li>
            ))}
          </ul>

          <div className="champion-box">
            <div className="champion-label">Design Principle for All Screens</div>
            <div className="champion-text">
              Every screen at VVS should feel like it was made for VVS — not repurposed event tech. Dark backgrounds. Gold and cream type. Cormorant Garamond for display. Mono fonts for data. The screens are part of the festival's art direction, not a departure from it. Kene's team should receive the full VVS brand kit before building a single frame.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

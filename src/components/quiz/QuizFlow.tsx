"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptic";
import * as htmlToImage from "html-to-image";
import { UploadCloud, Image as ImageIcon, ArrowRight, Download, Check, RefreshCw, X, Award, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

// 7 categories of nominees with images from Downloads folder (copied to assets/nominees)
const AWARDS_DATA = [
  {
    id: "fashion",
    categoryName: "Fashion Designer Excellence",
    folder: "FASHION DESIGNER EXCLLENCE AWARD",
    nominees: [
      { name: "Adebayo Oke-Lawal (Orange Culture)", file: "Adebayo Oke-Lawal (Orange Culture) .jpg" },
      { name: "Bubu Ogisi (IAMISIGO)", file: "Bubu Ogisi (IAMISIGO) .jpg" },
      { name: "Floryntina Agu (Hertunba)", file: "Floryntina Agu (Hertunba).jpg" },
      { name: "Ifedayo Nupo (Moyé)", file: "Ifedayo Nupo (Moye\u0301) .jpg" }
    ]
  },
  {
    id: "visual_arts",
    categoryName: "Contemporary Visual Artist",
    folder: "CONTEMPORARY VISUAL ARTIST OF THE YEAR AWARD",
    nominees: [
      { name: "Anthony Azekwoh", file: "Anthony Azekwoh.jpg" },
      { name: "Ken Nwadiogbu", file: "Ken Nwadiogbu.webp" },
      { name: "Modupe Fadugba", file: "Modupe Fadugba  .jpg" },
      { name: "Olaolu Slawn", file: "Olaolu Slawn.jpg" },
      { name: "Yinka Ilori", file: "Yinka Ilori.jpg" }
    ]
  },
  {
    id: "creator",
    categoryName: "Digital Creator of the Year",
    folder: "DIGITAL CREATOR OF THE YEAR",
    nominees: [
      { name: "Creatorium (Salem & Ada)", file: "Creatorium (Salem & Ada).png" },
      { name: "Dele\u2019s Life", file: "Dele\u2019s Life.jpg" },
      { name: "Dezny", file: "Dezny.jpg" },
      { name: "Rachel Ojuromi", file: "Rachel Ojuromi.jpg" },
      { name: "Tobe Szn", file: "Tobe Szn.jpg" }
    ]
  },
  {
    id: "music",
    categoryName: "Emerging Music Artist of the Year",
    folder: "EMERGING MUSIC ARTIST OF THE YEAR",
    nominees: [
      { name: "Amaeya", file: "Amaeya.jpg" },
      { name: "Egertton", file: "Egertton.jpg" },
      { name: "Esoterica", file: "Esoterica.jpg" },
      { name: "Fimi", file: "Fimi.jpg" },
      { name: "Scottyolorin", file: "Scottyolorin.jpg" },
      { name: "Zaylevelten", file: "Zaylevelten.jpg" }
    ]
  },
  {
    id: "film_storytelling",
    categoryName: "Excellence in Film & Screen Storytelling",
    folder: "EXCELLENCE IN FILM & SCREEN STORYTELLING",
    nominees: [
      { name: "Dammy Twitch (Call of My Life)", file: "Dammy Twitch \u2014 Call of My Life .jpg" },
      { name: "Kemi Adetiba (To Kill a Monkey)", file: "Kemi Adetiba \u2014 To Kill a Monkey.jpg" },
      { name: "Wale & Akinola Davies (My Father’s Shadow)", file: "Wale & Akinola Davies and Funmbi Ogunbanwo — My Father’s Shadow .jpg" }
    ]
  },
  {
    id: "tech",
    categoryName: "Innovation & Technology Excellence",
    folder: "INNOVATION & TECHNOLOGY EXCELLENCE AWARD",
    nominees: [
      { name: "Big Cabal (Tomiwa Aladekomo)", file: "Big Cabal (Tomiwa Aladekomo) .jpg" },
      { name: "Bumpa (Kelvin Umechukwu)", file: "Bumpa (Kelvin Umechukwu)  .jpg" },
      { name: "Moniepoint (Tosin Eniolorunda)", file: "Moniepoint (Tosin Eniolorunda) .jpg" },
      { name: "PiggyVest (Odunayo Eweniyi)", file: "PiggyVest (Odunayo Eweniyi)  .png" },
      { name: "Zappie (Kelvin Edosa)", file: "Zappie (Kelvin Edosa) .jpg" }
    ]
  },
  {
    id: "leadership",
    categoryName: "Visionary Leadership",
    folder: "VISIONARY LEADERSHIP AWARD",
    nominees: [
      { name: "Akarachi Amadi", file: "Akarachi Amadi .webp" },
      { name: "Chioma Ude", file: "Chioma Ude.webp" },
      { name: "Juliet Olanipekun", file: "Juliet Olanipekun  .jpg" },
      { name: "Ugoma Chinelo Ebilah", file: "Ugoma Chinelo Ebilah .jpg" }
    ]
  }
];

export default function VvsPassAndVotingFlow() {
  const votingClosed = true;
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"vote" | "verify" | "signup" | "success">("vote");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("25");
  const [occupation, setOccupation] = useState("");
  const [gender, setGender] = useState("unspecified");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [isSavingVotePass, setIsSavingVotePass] = useState(false);
  const [memberId] = useState(() => `VVS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberCardRef = useRef<HTMLDivElement>(null);
  const voterCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("vvs_voter_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleVote = (categoryId: string, nomineeName: string) => {
    if (votingClosed) return;
    triggerHaptic("light");
    setVotes(prev => ({
      ...prev,
      [categoryId]: nomineeName
    }));
  };

  const handleOpenVerify = () => {
    triggerHaptic("medium");
    if (Object.keys(votes).length === 0) {
      setError("Please vote for at least one category.");
      return;
    }
    setError(null);
    setPhase("verify");
  };

  const handleCheckEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setCheckingEmail(true);

    try {
      // 1. Check if user already has votes in award_votes table
      const { data: existingVotes, error: votesErr } = await supabase
        .from("award_votes")
        .select("category, nominee")
        .eq("email", email.trim().toLowerCase());

      if (votesErr) {
        throw votesErr;
      }

      // 2. Fetch member info from community_members
      const res = await fetch("/api/check-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (!res.ok) {
        throw new Error("Failed to check member status.");
      }

      const { exists, member } = await res.json();

      if (existingVotes && existingVotes.length > 0) {
        // User has already voted before!
        const loadedVotes: Record<string, string> = {};
        existingVotes.forEach(v => {
          loadedVotes[v.category] = v.nominee;
        });
        setVotes(loadedVotes);
        setAlreadyVoted(true);

        if (exists && member) {
          setName(member.name);
          setSelfieUrl(member.selfie_url);
          setUsername(member.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
          localStorage.setItem("vvs_voter_email", email.trim().toLowerCase());
          triggerHaptic("success");
          setPhase("success");
        } else {
          // If voted but community member details are missing, direct to signup info gathering
          setPhase("signup");
        }
      } else {
        // User has NOT voted yet
        if (votingClosed) {
          setError("Voting has closed. Only registered voters who submitted ballots can retrieve passes.");
          return;
        }
        if (exists && member) {
          setName(member.name);
          setSelfieUrl(member.selfie_url);
          setUsername(member.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
          await submitVotesOnly(email.trim().toLowerCase());
        } else {
          setPhase("signup");
        }
      }
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(err.message || "Failed to verify email. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const submitVotesOnly = async (userEmail: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await supabase.from("award_votes").delete().eq("email", userEmail);

      const voteEntries = Object.entries(votes).map(([category, nominee]) => ({
        email: userEmail,
        category,
        nominee
      }));

      const { error: insertErr } = await supabase.from("award_votes").insert(voteEntries);
      if (insertErr) throw insertErr;

      localStorage.setItem("vvs_voter_email", userEmail);
      triggerHaptic("success");
      setPhase("success");
    } catch (err: any) {
      console.error("Submit votes error:", err);
      setError(err.message || "Failed to submit votes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      triggerHaptic("light");
    }
  };

  const handleJoinAndSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!username.trim()) {
      setError("Please choose a VVS username.");
      return;
    }
    if (!file) {
      setError("Please upload an ID photo.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: "VVSmember2026",
        options: {
          data: {
            name: name.trim(),
            age: parseInt(age),
            occupation: occupation.trim() || "Creative",
            city: "Lagos",
            gender
          }
        }
      });

      if (signUpError) {
        console.warn("Auth signup notice:", signUpError.message);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `community/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("selfies")
        .upload(filePath, file, { contentType: file.type, upsert: false });

      let publicUrl = null;
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("selfies").getPublicUrl(filePath);
        publicUrl = urlData?.publicUrl ?? null;
        setSelfieUrl(publicUrl);
      } else {
        console.warn("Storage upload error:", uploadError.message);
      }

      const res = await fetch("/api/community-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: parseInt(age),
          email: email.trim().toLowerCase(),
          occupation: occupation.trim() || "Creative",
          city: "Lagos",
          gender,
          selfie_url: publicUrl
        })
      });

      if (!res.ok) {
        const errResult = await res.json();
        throw new Error(errResult.error || "Failed to register profile");
      }

      await submitVotesOnly(email.trim().toLowerCase());

    } catch (err: any) {
      console.error("Join & Submit error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCard = async (cardElement: HTMLDivElement | null, type: "pass" | "vote") => {
    if (!cardElement) return;
    triggerHaptic("medium");
    if (type === "pass") setIsSavingPass(true);
    else setIsSavingVotePass(true);

    try {
      await htmlToImage.toPng(cardElement, { skipFonts: true, pixelRatio: 3, backgroundColor: "#000000" });
      const dataUrl = await htmlToImage.toPng(cardElement, { skipFonts: true, pixelRatio: 3, backgroundColor: "#000000" });

      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}_VVS_${type === "pass" ? "Member_Card" : "Ballot_Pass"}.png`;
      link.href = dataUrl;
      link.click();
      triggerHaptic("success");
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      if (type === "pass") setIsSavingPass(false);
      else setIsSavingVotePass(false);
    }
  };

  const profileUrl = `https://members.vvslagos.com/${username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=c5a059&bgcolor=000000&data=${encodeURIComponent(profileUrl)}`;
  const voteUrl = `https://vvslagos.com/awards`;
  const qrCodeVoteUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=c5a059&bgcolor=000000&data=${encodeURIComponent(voteUrl)}`;

  // Styling helpers matching join community form
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#c5a059] transition-colors uppercase font-mono tracking-wider";
  const labelClass = "text-[10px] font-mono uppercase tracking-widest font-bold text-white/50 block mb-1.5";

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-x-hidden relative font-sans">
      <title>VVS Pass & Awards Voting | VVS Lagos 2026</title>
      <meta name="description" content="Generate your digital VVS Lagos member card and cast your votes for the VVS Awards 2026." />

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute -top-1/2 -left-1/2 w-[200vw] h-[200vw] border border-[#c5a059]/30 rounded-full animate-[spin_120s_linear_infinite]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 py-20 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* ── PHASE 1: VOTING DASHBOARD ── */}
          {phase === "vote" && (
            <motion.div
              key="vote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-12">
                <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-3">VVS Awards 2026</span>
                <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter leading-tight">{votingClosed ? "Voting Closed" : "Cast Your Votes"}</h1>
                <p className="text-white/60 text-xs mt-3 max-w-2xl mx-auto leading-relaxed">
                  {votingClosed 
                    ? "Voting is now closed. Registered voters who already submitted their ballots can retrieve and download their digital passes and top picks using the button below." 
                    : "As part of VVS Lagos, 2026, the VVS luminary awards celebrates outstanding Individuals and organizations of Nigerian Descent whose work is shaping the future of African culture, creativity, innovation and storytelling. The awards recognize visionary leaders and changemakers whose impact continues to elevate Africa on the global stage. Select your choices for each category, click the button below to submit, and claim your premium passes."}
                </p>
              </div>

              {/* Grid of Categories */}
              <div className="w-full flex flex-col gap-14 max-w-4xl">
                {AWARDS_DATA.map((cat) => {
                  const isJury = cat.id === "tech" || cat.id === "leadership";
                  return (
                    <div key={cat.id} className="border-t border-white/10 pt-10">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                        <div>
                          <span className="text-[#c5a059] font-mono text-[9px] uppercase tracking-widest block mb-1">
                            {isJury ? "Jury Selection (Non-Voting)" : "AWARD CATEGORY"}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">{cat.categoryName}</h2>
                        </div>
                        {isJury ? (
                          <span className="text-white/40 text-xs font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
                            Jury Selection only (Non-Voting)
                          </span>
                        ) : votes[cat.id] ? (
                          <span className="text-[#c5a059] text-xs font-mono flex items-center gap-1.5 bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                            <Check size={12} /> Selection Locked
                          </span>
                        ) : null}
                      </div>

                      {/* Nominee Selector Grid with Grayscale to Color updates */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cat.nominees.map((nominee) => {
                          const isSelected = votes[cat.id] === nominee.name;
                          const imgSrc = `/assets/nominees/${encodeURIComponent(cat.folder)}/${encodeURIComponent(nominee.file)}`;
                          return (
                            <div
                              key={nominee.name}
                              onClick={() => {
                                if (isJury || votingClosed) return;
                                handleVote(cat.id, nominee.name);
                              }}
                              className={`group border rounded-xl overflow-hidden transition-all duration-500 relative ${
                                isJury
                                  ? "border-[#c5a059]/25 bg-[#c5a059]/5 cursor-not-allowed"
                                  : isSelected
                                    ? `border-[#c5a059] border-2 bg-[#c5a059]/10 shadow-[0_0_25px_rgba(197,160,89,0.2)] ${votingClosed ? 'cursor-default' : 'scale-[1.02] cursor-pointer'}`
                                    : `border-white/10 bg-white/[0.01] ${votingClosed ? 'cursor-default' : 'hover:border-white/20 hover:bg-white/[0.02] cursor-pointer'}`
                              }`}
                            >
                              <div className="aspect-square relative w-full overflow-hidden bg-white/5">
                                <img
                                  src={imgSrc}
                                  alt={nominee.name}
                                  className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                                    isJury
                                      ? "grayscale-0 scale-100 opacity-100"
                                      : isSelected 
                                        ? "grayscale-0 scale-105" 
                                        : `grayscale opacity-60 ${votingClosed ? '' : 'group-hover:opacity-85'}`
                                  }`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                                
                                {isSelected && !isJury && (
                                  <div className="absolute top-2.5 right-2.5 bg-[#c5a059] text-black px-2 py-1 rounded font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-md">
                                    <Check size={8} strokeWidth={4} /> SELECTED
                                  </div>
                                )}
                              </div>
                              <div className={`p-3 transition-colors duration-300 ${isSelected && !isJury ? "bg-[#c5a059]/5" : ""}`}>
                                <p className={`text-xs font-extrabold leading-tight line-clamp-2 uppercase ${isSelected && !isJury ? "text-[#c5a059]" : "text-white/70 group-hover:text-white"}`}>{nominee.name}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Summary action bar */}
              {votingClosed ? (
                <div className="fixed bottom-0 left-0 w-full bg-black/85 backdrop-blur-md border-t border-white/10 py-5 px-6 z-50 flex justify-center shadow-2xl">
                  <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm font-mono font-extrabold uppercase tracking-widest text-[#c5a059] animate-pulse">
                      VOTING NOW CLOSED... Winners to be announced.
                    </span>
                    <button
                      onClick={() => {
                        setError(null);
                        setPhase("verify");
                      }}
                      className="px-8 py-3 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white transition-all shadow-lg active:scale-95"
                    >
                      Retrieve My Pass
                    </button>
                  </div>
                </div>
              ) : (
                <div className="fixed bottom-0 left-0 w-full bg-black/85 backdrop-blur-md border-t border-white/10 py-4 px-6 z-50 flex justify-center shadow-2xl">
                  <div className="w-full max-w-4xl flex items-center justify-between gap-4">
                    <span className="text-xs font-mono text-white/60">
                      VOTED IN <span className="text-[#c5a059] font-bold">{Object.keys(votes).length}</span> OF 5 PUBLIC CATEGORIES
                    </span>
                    <button
                      onClick={handleOpenVerify}
                      disabled={Object.keys(votes).length === 0}
                      className="px-8 py-3 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#c5a059] disabled:hover:text-black"
                    >
                      Submit Votes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── PHASE 2: EMAIL VERIFICATION ── */}
          {phase === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-md flex flex-col items-center bg-[#0d0d0d] border border-white/10 p-8 rounded-2xl relative"
            >
              <button 
                onClick={() => setPhase("vote")}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <Award className="w-12 h-12 text-[#c5a059] mb-4" />
              <h2 className="text-2xl font-bold uppercase tracking-tight text-center mb-2">Submit Vote</h2>
              <p className="text-white/40 text-xs text-center mb-6 leading-relaxed">
                Enter your email address to register your votes. If you don&apos;t have a member profile, you will be prompted to create one to claim your VVS Pass.
              </p>

              <div className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. richmond@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className={inputClass}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-950/20 border border-red-500/20 px-4 py-2.5 rounded-xl text-center">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCheckEmail}
                  disabled={checkingEmail || submitting}
                  className="w-full py-3.5 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {checkingEmail || submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PHASE 3: SIGNUP FORM MIMICKING COMMUNITY PAGE ── */}
          {phase === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-md flex flex-col items-center bg-[#0d0d0d] border border-white/10 p-8 rounded-2xl relative"
            >
              <button 
                onClick={() => setPhase("verify")}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#c5a059] mb-1 text-center">Claim VVS Pass</h2>
              <p className="text-white/40 text-xs text-center mb-6">
                No member profile found for <span className="text-white font-semibold">{email}</span>. Please complete your registration details to submit your votes.
              </p>

              <div className="w-full flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    className={inputClass}
                    required
                  />
                </div>

                {/* VVS Username */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>VVS Username</label>
                  <input
                    type="text"
                    placeholder="e.g. richmondeke"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                      setError(null);
                    }}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Age & Specialty Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      value={age}
                      min="16"
                      max="100"
                      onChange={(e) => setAge(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Designer, Artist"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Selfie Upload - Styled with a smaller centered card if uploaded */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>ID Photo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-6 border border-dashed border-white/15 rounded-xl bg-white/[0.01] hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative ${
                      preview ? "border-[#c5a059]" : ""
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {preview ? (
                      <div className="relative inline-block text-center">
                        <img 
                          src={preview} 
                          alt="Upload preview" 
                          className="w-28 h-28 rounded-xl object-cover mx-auto border-2 border-[#c5a059]" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreview(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                        <p className="text-[10px] text-[#c5a059] font-mono mt-2 uppercase tracking-widest">Photo selected ✓</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="mx-auto mb-3 text-white/30" size={32} />
                        <p className="text-xs text-white/50 mb-1">Click to upload your ID photo</p>
                        <p className="text-[10px] text-white/30 font-mono">JPG, PNG, WEBP · Max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-950/20 border border-red-500/20 px-4 py-2.5 rounded-xl text-center">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleJoinAndSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit & Claim Pass"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PHASE 4: SUCCESS & DUAL CARDS (MEMBER CARD + 9:16 SPOTIFY BALLOT) ── */}
          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-10">
                <Check className="w-12 h-12 text-green-400 bg-green-500/10 p-2.5 rounded-full border border-green-500/20 mb-3 mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
                  {alreadyVoted ? "Welcome Back!" : "Votes Submitted!"}
                </h2>
                <p className="text-white/40 text-xs mt-2 max-w-sm">
                  {alreadyVoted 
                    ? "You have already voted. Your previous VVS Pass and VVS Top Picks ballot are shown below." 
                    : "Your votes have been successfully logged. Download your VVS passes below."}
                </p>
              </div>

              {/* Passes Grid */}
              <div className="flex flex-col lg:flex-row gap-12 items-start justify-center w-full max-w-4xl mb-12 text-center lg:text-left">
                
                {/* 1. VVS MEMBER CARD (Horizontal Credit Card) */}
                <div className="flex flex-col items-center gap-4 self-center lg:self-start">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold">01 / VVS MEMBER PASS</span>
                  <div
                    ref={memberCardRef}
                    className="relative w-[320px] h-[202px] bg-black border border-white/20 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_20px_40px_-15px_rgba(197,160,89,0.15)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-white/[0.06] pointer-events-none" />
                    <div className="absolute -top-1/2 -right-1/4 w-[220px] h-[220px] bg-[#c5a059]/[0.02] rounded-full filter blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between z-10 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <img src="/assets/VVSWhiteMAsk.png" alt="VVS Logo" className="w-5 h-5 object-contain" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-white">VVS LAGOS</span>
                      </div>
                      <span className="text-[7px] font-mono font-bold uppercase tracking-[0.2em] text-[#c5a059]">MEMBER</span>
                    </div>

                    <div className="flex items-center gap-4 z-10 my-auto text-left">
                      <div className="w-[64px] h-[64px] rounded-lg overflow-hidden border border-[#c5a059]/40 bg-white/5 flex-shrink-0">
                        {selfieUrl ? (
                          <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px] font-mono">NO PHOTO</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-extrabold uppercase tracking-tight text-white truncate">{name}</h3>
                        <p className="text-[9px] font-mono text-[#c5a059]/75 mt-0.5 truncate">@{username || "member"}</p>
                        <p className="text-[8px] font-mono text-white/40 mt-1.5">ID: {memberId}</p>
                      </div>
                      <div className="w-[60px] h-[60px] rounded-lg bg-black border border-white/10 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={qrCodeUrl} alt="QR Link" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center z-10 border-t border-white/10 pt-2 text-[7px] font-mono text-white/30 uppercase tracking-widest">
                      <span>EST. 2026</span>
                      <span>LAGOS, NG</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadCard(memberCardRef.current, "pass")}
                    disabled={isSavingPass}
                    className="flex items-center gap-2 px-6 py-2.5 border border-white/15 hover:border-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <Download size={12} /> {isSavingPass ? "Saving..." : "Download VVS Pass"}
                  </button>
                </div>

                {/* 2. VVS VOTER BALLOT (Vertical 9:16 Custom Ballot Style card) */}
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold">02 / MY VVS TOP PICKS</span>
                  <div
                    ref={voterCardRef}
                    className="relative w-[320px] h-[568px] bg-black border border-[#c5a059]/30 rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-[0_25px_50px_-12px_rgba(197,160,89,0.18)]"
                  >
                    {/* Ballot color backgrounds */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/[0.08] via-transparent to-transparent pointer-events-none" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-[280px] h-[280px] bg-[#c5a059]/[0.05] rounded-full filter blur-3xl pointer-events-none" />

                    {/* Logo & Header */}
                    <div className="flex flex-col items-center text-center z-10 border-b border-white/10 pb-4">
                      <img src="/assets/VVSWhiteMAsk.png" alt="VVS Logo" className="w-10 h-10 object-contain mb-2" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c5a059]">VVS LAGOS 2026</span>
                      <h3 className="text-lg font-black uppercase tracking-tighter mt-1">MY VVS TOP PICKS</h3>
                    </div>

                    {/* User profile row */}
                    <div className="flex items-center gap-4 z-10 bg-white/[0.02] border border-white/5 p-3 rounded-xl my-4 text-left">
                      <div className="w-[44px] h-[44px] rounded-full overflow-hidden border border-[#c5a059]/40 bg-white/5 flex-shrink-0">
                        {selfieUrl ? (
                          <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-[6px] font-mono">PHOTO</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[7px] font-mono text-[#c5a059] uppercase tracking-widest block">BALLOT BY</span>
                        <h4 className="text-xs font-black uppercase text-white truncate">{name}</h4>
                        <p className="text-[9px] font-mono text-white/40 truncate">@{username}</p>
                      </div>
                    </div>

                    {/* Voted categories list */}
                    <div className="flex-1 z-10 flex flex-col justify-start gap-3 mt-1 overflow-hidden text-left">
                      <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block mb-1">VOTING RECORD:</span>
                      {AWARDS_DATA.map((cat) => {
                        const votedNominee = votes[cat.id];
                        if (!votedNominee) return null;
                        
                        // Find matching nominee image file
                        const nomineeObj = cat.nominees.find(n => n.name === votedNominee);
                        const file = nomineeObj ? nomineeObj.file : "";
                        const imgSrc = `/assets/nominees/${encodeURIComponent(cat.folder)}/${encodeURIComponent(file)}`;

                        return (
                          <div key={cat.id} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-b-0">
                            <div className="w-8 h-8 rounded bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                              {file && <img src={imgSrc} alt="" className="w-full h-full object-cover grayscale-0" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[7px] font-mono text-[#c5a059] uppercase tracking-wider block leading-none">{cat.categoryName}</span>
                              <span className="text-[10px] font-extrabold text-white uppercase block truncate mt-0.5">{votedNominee}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom confirmation details */}
                    <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between z-10 text-left">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono text-[#c5a059] font-black uppercase tracking-widest">✦ VOTE CONFIRMED</span>
                        <span className="text-[7px] font-mono text-white/30">ID: {memberId}-V</span>
                      </div>
                      <div className="w-[48px] h-[48px] rounded bg-black border border-white/15 p-0.5 flex-shrink-0">
                        <img src={qrCodeVoteUrl} alt="QR" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadCard(voterCardRef.current, "vote")}
                    disabled={isSavingVotePass}
                    className="flex items-center gap-2 px-6 py-2.5 border border-[#c5a059]/30 hover:border-[#c5a059] rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 text-[#c5a059]"
                  >
                    <Download size={12} /> {isSavingVotePass ? "Saving..." : "Download Voter Ballot"}
                  </button>
                </div>

              </div>

              {/* Done button */}
              <button
                onClick={() => {
                  triggerHaptic("success");
                  window.location.href = "/";
                }}
                className="px-10 py-4 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white transition-all shadow-lg active:scale-95"
              >
                Done
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

const GAMEPLAY_PILLARS = [
  {
    icon: "🗺️",
    title: "Territorial Conquest",
    desc: "Expand your empire province by province across expansive continental maps. Manage border fortifications, cut off enemy supply lines, and claim total territorial dominion.",
    badge: "Country Conquest",
    badgeColor: "border-[#00f0ff]/30 text-[#00f0ff] bg-[#00f0ff]/10",
  },
  {
    icon: "⚔️",
    title: "Tactical Warfare & Armies",
    desc: "Raise battalions, deploy specialized armor divisions, coordinate air support, and execute pincer movements. Every border skirmish shapes the geopolitical balance.",
    badge: "Deep Strategy",
    badgeColor: "border-amber-400/30 text-amber-400 bg-amber-400/10",
  },
  {
    icon: "🤝",
    title: "Ruthless Diplomacy",
    desc: "Forge strategic alliances, draft non-aggression treaties, share radar intel, or orchestrate clandestine betrayals when your ally least expects it.",
    badge: "Real Politics",
    badgeColor: "border-purple-400/30 text-purple-400 bg-purple-400/10",
  },
  {
    icon: "⚡",
    title: "National Doctrines & Tech",
    desc: "Progress from industrial mobilization into modern hybrid warfare. Choose doctrines: defensive turtle supremacy, relentless blitzkrieg, or economic hegemony.",
    badge: "Tech Evolution",
    badgeColor: "border-emerald-400/30 text-emerald-400 bg-emerald-400/10",
  },
  {
    icon: "🌐",
    title: "Massive Multiplayer Arenas",
    desc: "Compete against up to 50 commanders in real-time tactical matches or take your time in turn-based strategic grand campaigns with cross-platform synchronization.",
    badge: "Cross-Platform",
    badgeColor: "border-rose-400/30 text-rose-400 bg-rose-400/10",
  },
  {
    icon: "🏰",
    title: "Empire Customization",
    desc: "Design your nation's flag, heraldry, military doctrine, capital city fortifications, and custom commander avatars. Leave your mark on the global leaderboard.",
    badge: "Identity",
    badgeColor: "border-cyan-400/30 text-cyan-400 bg-cyan-400/10",
  },
];

const ROADMAP_PHASES = [
  {
    phase: "01",
    status: "CURRENT",
    statusColor: "bg-[#00f0ff] text-[#070a12]",
    title: "Core Conquest Engine & Map Physics",
    desc: "Developing seamless territorial borders, troop mobilization pathfinding, provincial capture mechanics, and responsive tactical controls.",
  },
  {
    phase: "02",
    status: "Q3 2026",
    statusColor: "bg-white/10 text-white/80",
    title: "Closed Alpha & Playtest Dispatch",
    desc: "Inviting early enlistees to test balancing, combat calculations, alliance mechanics, and regional war theaters in confidential playtest flights.",
  },
  {
    phase: "03",
    status: "Q4 2026",
    statusColor: "bg-white/10 text-white/80",
    title: "Steam & Mobile Closed Beta",
    desc: "Expanding cross-play matchmaking between PC (Steam) and mobile (iOS & Android) with seasonal leaderboard trials and alliance leagues.",
  },
  {
    phase: "04",
    status: "2027",
    statusColor: "bg-white/10 text-white/80",
    title: "Global Early Access & World Editor",
    desc: "Official public launch featuring custom map creators, user-generated campaigns, competitive ranked seasons, and major continent expansions.",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"conquest" | "intel" | "doctrines">("conquest");

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Studio Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070a12]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f0ff] via-[#0284c7] to-[#0f172a] shadow-md shadow-[#00f0ff]/20 border border-white/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-[#070a12] text-xl tracking-tighter">A</span>
            </div>
            <div>
              <span className="font-black tracking-wider text-base text-white flex items-center gap-1.5">
                ALINNIA <span className="text-[#00f0ff] text-xs px-1.5 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/20">STUDIOS</span>
              </span>
              <span className="block text-[10px] tracking-widest text-[#8493a8] uppercase font-mono">
                Interactive Strategy
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8493a8]">
            <a href="#everland" className="hover:text-[#00f0ff] transition-colors">
              Everland
            </a>
            <a href="#gameplay" className="hover:text-[#00f0ff] transition-colors">
              Gameplay
            </a>
            <a href="#war-room" className="hover:text-[#00f0ff] transition-colors">
              War Room
            </a>
            <a href="#about" className="hover:text-[#00f0ff] transition-colors">
              About Studio
            </a>
            <a href="#roadmap" className="hover:text-[#00f0ff] transition-colors">
              Roadmap
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#pre-register"
              className="cursor-pointer rounded-full bg-gradient-to-r from-[#00f0ff] to-[#0284c7] px-5 py-2 text-xs font-bold text-[#070a12] shadow-md shadow-[#00f0ff]/20 hover:from-[#38bdf8] hover:to-[#0369a1] hover:scale-105 active:scale-95 transition-all"
            >
              Enlist in Alpha ➔
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#00f0ff]/15 via-sky-500/10 to-amber-500/10 blur-[120px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-5xl text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-4 py-1.5 text-xs font-semibold text-[#00f0ff] mb-8 shadow-sm backdrop-blur-md">
            <span className="inline-block h-2 w-2 rounded-full bg-[#00f0ff] animate-ping" />
            <span>ALINNIA STUDIOS PRESENTS</span>
            <span className="text-white/30">|</span>
            <span className="text-amber-300">FLAGSHIP STRATEGY TITLE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] mb-6">
            E V E R L A N D
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-[#00f0ff] tracking-wide mb-4">
            Master the Map. Conquer the World.
          </p>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#8493a8] leading-relaxed mb-10">
            Following in the footsteps of <strong className="text-white">Conquer Countries</strong>, Everland is the next-generation territorial grand strategy game. Command massive battalions, seize enemy provinces, orchestrate diplomacy, and claim global supremacy.
          </p>

          {/* Pre-Registration Form */}
          <div id="pre-register" className="mb-12">
            <WaitlistForm />
          </div>

          {/* Target Platforms */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8493a8]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
              <span className="text-sm">🎮</span> Steam (PC / Mac)
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
              <span className="text-sm">🍏</span> Apple iOS
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
              <span className="text-sm">🤖</span> Google Android
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
              <span className="text-sm">⚡</span> Cross-Play Enabled
            </div>
          </div>
        </div>
      </section>

      {/* ── War Room Tactical Map Simulation Card ── */}
      <section id="war-room" className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1626] to-[#070a12] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00f0ff] animate-pulse" />
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    TACTICAL WAR ROOM · LIVE SIMULATOR
                  </h3>
                </div>
                <p className="text-xs text-[#8493a8] mt-1 font-mono">
                  THEATER: CONTINENTAL CAMPAIGN · SECTOR 07
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#070a12] p-1 rounded-xl border border-white/10 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("conquest")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "conquest"
                      ? "bg-[#00f0ff] text-[#070a12] shadow-sm"
                      : "text-[#8493a8] hover:text-white"
                  }`}
                >
                  Territory Borders
                </button>
                <button
                  onClick={() => setActiveTab("intel")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "intel"
                      ? "bg-[#00f0ff] text-[#070a12] shadow-sm"
                      : "text-[#8493a8] hover:text-white"
                  }`}
                >
                  Troop Heatmap
                </button>
                <button
                  onClick={() => setActiveTab("doctrines")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "doctrines"
                      ? "bg-[#00f0ff] text-[#070a12] shadow-sm"
                      : "text-[#8493a8] hover:text-white"
                  }`}
                >
                  War Doctrines
                </button>
              </div>
            </div>

            {/* Simulated Battlefield Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Left: Map Projection */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#070a12]/90 p-6 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
                {/* Background Grid & Radar Sweep */}
                <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[#00f0ff]/10 pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-[#00f0ff]/20 pointer-events-none" />

                {/* Top Metrics Row */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">
                      NATION: VALORIA
                    </span>
                    <span className="text-[#8493a8]">PROVINCES: 14 / 28</span>
                  </div>
                  <div className="flex items-center gap-4 text-[#8493a8]">
                    <span>STEEL: 8,450 ⛏️</span>
                    <span>GOLD: 14.2K 🪙</span>
                    <span className="text-emerald-400">SUPPLY: 98% ⚡</span>
                  </div>
                </div>

                {/* Simulated Interactive Provinces */}
                <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Province 1 */}
                  <div className="rounded-xl border border-[#00f0ff]/50 bg-[#00f0ff]/10 p-3.5 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-[#00f0ff]">
                      <span>NORDLAND</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00f0ff]/20">ALLIED</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">420K</div>
                    <div className="text-[10px] text-[#8493a8] font-mono mt-0.5">Heavy Infantry Garrison</div>
                  </div>

                  {/* Province 2 (Active Skirmish) */}
                  <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3.5 backdrop-blur-sm animate-pulse">
                    <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                      <span>VERIDIA PASS</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">CONTESTED</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-rose-400">890K</div>
                    <div className="text-[10px] text-rose-300/80 font-mono mt-0.5">Active Skirmish vs Oakhaven</div>
                  </div>

                  {/* Province 3 */}
                  <div className="rounded-xl border border-amber-400/50 bg-amber-400/10 p-3.5 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-amber-400">
                      <span>AETHEL COAST</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20">FORTIFIED</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">250K</div>
                    <div className="text-[10px] text-[#8493a8] font-mono mt-0.5">Coastal Artillery Battery</div>
                  </div>

                  {/* Province 4 */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-white/70">
                      <span>EAST WYNDHAM</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">NEUTRAL</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-white/70">110K</div>
                    <div className="text-[10px] text-[#8493a8] font-mono mt-0.5">Border Buffer Zone</div>
                  </div>

                  {/* Province 5 */}
                  <div className="rounded-xl border border-[#00f0ff]/50 bg-[#00f0ff]/10 p-3.5 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-[#00f0ff]">
                      <span>CAPITAL CITADEL</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00f0ff]/20">HEADQUARTERS</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">1.2M</div>
                    <div className="text-[10px] text-[#8493a8] font-mono mt-0.5">Imperial Elite Core</div>
                  </div>

                  {/* Province 6 */}
                  <div className="rounded-xl border border-purple-400/50 bg-purple-400/10 p-3.5 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-400">
                      <span>SOLARIS BASIN</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-400/20">COALITION</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">630K</div>
                    <div className="text-[10px] text-[#8493a8] font-mono mt-0.5">Pact Defense Legion</div>
                  </div>
                </div>

                {/* Bottom Status Bar */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-[#8493a8] border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Borders Secured: 4 Frontiers
                  </span>
                  <span className="text-[#00f0ff] font-mono">CONQUEST ORDERS READY ➔</span>
                </div>
              </div>

              {/* Right: Tactical Dispatch Feed */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#070a12]/80 p-5">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#8493a8] uppercase">
                    <span>Battle Dispatch</span>
                    <span className="text-[#00f0ff]">Real-Time</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="border-l-2 border-rose-500 pl-3 py-0.5">
                      <p className="text-rose-300 font-bold">Invasion Alert: Veridia Pass</p>
                      <p className="text-[11px] text-[#8493a8]">Oakhaven armored division launched surprise siege across river bridgehead.</p>
                    </div>
                    <div className="border-l-2 border-emerald-400 pl-3 py-0.5">
                      <p className="text-emerald-300 font-bold">Province Annexed: Nordland</p>
                      <p className="text-[11px] text-[#8493a8]">100% control established. +2,400 Steel output gained per turn.</p>
                    </div>
                    <div className="border-l-2 border-amber-400 pl-3 py-0.5">
                      <p className="text-amber-300 font-bold">Pact Signed: Solaris League</p>
                      <p className="text-[11px] text-[#8493a8]">Non-aggression treaty confirmed for 12 turns.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#00f0ff]/5 p-5">
                  <h4 className="text-sm font-bold text-white mb-1">Inspired by Conquer Countries</h4>
                  <p className="text-xs text-[#8493a8] leading-relaxed">
                    Everland expands the pure joy of country conquest into deeper tactical formations, resource supply lines, tech trees, and diplomatic stratagems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Everland Gameplay Pillars ── */}
      <section id="gameplay" className="px-6 py-24 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff]">
              DEEP TACTICAL SYSTEMS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
              Built for Strategy Purists
            </h2>
            <p className="text-base text-[#8493a8]">
              Every country is unique. Every border decision matters. In Everland, success requires both grand battlefield mastery and cold-blooded political cunning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMEPLAY_PILLARS.map((pillar, i) => (
              <div key={i} className="glow-card rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl">{pillar.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${pillar.badgeColor}`}>
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-[#8493a8] leading-relaxed">{pillar.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#00f0ff]">
                  <span>SYSTEM #{i + 1}</span>
                  <span>TACTICAL SPEC ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Alinnia Studios ── */}
      <section id="about" className="px-6 py-24 border-t border-white/10 bg-gradient-to-b from-[#070a12] via-[#0e1626]/60 to-[#070a12]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium text-[#8493a8] mb-6">
                <span>ABOUT ALINNIA STUDIOS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                Crafting Emergent Strategy Experiences
              </h2>
              <p className="text-base text-[#8493a8] leading-relaxed mb-4">
                At <strong className="text-white">Alinnia Studios</strong>, we believe the greatest gaming moments are born from player decisions — the daring last-stand defense of a bridgehead, the sudden turn of an alliance, and the thrill of watching your borders sweep across a conquered continent.
              </p>
              <p className="text-base text-[#8493a8] leading-relaxed mb-6">
                We are strategy purists building for players who love grand map conquest, deep tactical mechanics, and fair, skill-first competition across PC and mobile.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-2xl font-black text-[#00f0ff]">100%</div>
                  <div className="text-xs text-[#8493a8] mt-0.5">Player-Driven Strategy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">Cross-Play</div>
                  <div className="text-xs text-[#8493a8] mt-0.5">PC & Mobile Matchmaking</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">Zero</div>
                  <div className="text-xs text-[#8493a8] mt-0.5">Pay-to-Win Mechanics</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-[#0e1626] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-4">Studio Manifesto</h3>
              <ul className="space-y-3.5 text-sm text-[#8493a8]">
                <li className="flex items-start gap-3">
                  <span className="text-[#00f0ff] font-bold">01.</span>
                  <span><strong>Depth Over Gimmicks:</strong> Every mechanic must add meaningful strategic trade-offs and replayability.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00f0ff] font-bold">02.</span>
                  <span><strong>Living Communities:</strong> Player feedback directly shapes unit balancing, doctrine trees, and map scenarios.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00f0ff] font-bold">03.</span>
                  <span><strong>Frictionless Cross-Play:</strong> Start a campaign on your desktop via Steam, continue seamlessly on your phone.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Development Roadmap ── */}
      <section id="roadmap" className="px-6 py-24 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff]">
              THE MARCH FORWARD
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-3 tracking-tight">
              Everland Development Roadmap
            </h2>
            <p className="text-sm text-[#8493a8]">
              Transparent milestones on our journey to world conquest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROADMAP_PHASES.map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#0e1626]/80 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-white/40 font-mono">PHASE {item.phase}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#8493a8] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Pre-Registration Call to Arms ── */}
      <section className="px-6 py-20 border-t border-white/10 relative overflow-hidden bg-gradient-to-b from-[#070a12] to-[#0d1322]">
        <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-bold text-[#00f0ff] mb-4">
            CLOSED ALPHA ENLISTMENT OPEN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 uppercase">
            Claim Your Commander Title
          </h2>
          <p className="text-base text-[#8493a8] leading-relaxed mb-8 max-w-xl mx-auto">
            Enlist now to secure early access keys, exclusive Founder Nation Heraldry, and direct participation in confidential alpha test flights.
          </p>

          <WaitlistForm />
        </div>
      </section>

      {/* ── Studio Footer ── */}
      <footer className="border-t border-white/10 bg-[#05070d] px-6 py-12 text-sm text-[#8493a8]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#0284c7] font-black text-[#070a12] text-sm">
              A
            </div>
            <div>
              <span className="font-bold text-white">ALINNIA STUDIOS</span>
              <p className="text-[11px] text-[#8493a8]">© 2026 Alinnia Studios. All rights reserved.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a href="#everland" className="hover:text-white transition-colors">
              Everland
            </a>
            <a href="#roadmap" className="hover:text-white transition-colors">
              Roadmap
            </a>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:contact@alinnia.com" className="text-[#00f0ff] hover:underline">
              contact@alinnia.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoveUpRight,
  Shapes,
  Terminal,
  Pencil,
  MousePointer2,
  Users,
  Zap,
  Database,
  Menu,
  X,
  Github,
} from "lucide-react";

const Logo = ({ size = 28, dark = false }: { size?: number; dark?: boolean }) => (
  <motion.svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <motion.circle cx="12" cy="16" r="9" stroke="var(--coral)" strokeWidth="1.8" fill="var(--coral)" fillOpacity="0.15"
      animate={{ cx: [12, 11.2, 12] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.circle cx="20" cy="16" r="9" stroke={dark ? "var(--on-dark)" : "var(--ink)"} strokeWidth="1.8" fill={dark ? "var(--on-dark)" : "var(--ink)"} fillOpacity="0.07"
      animate={{ cx: [20, 20.8, 20] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.ellipse cx="16" cy="16" rx="3.5" ry="6" fill="var(--coral)" fillOpacity="0.55"
      animate={{ fillOpacity: [0.45, 0.75, 0.45] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
  </motion.svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav style={{ background: "var(--canvas)", borderBottom: "1px solid var(--hairline)" }} className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 md:px-12">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span style={{ fontFamily: "var(--font-sans)", color: "var(--ink)", fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px" }}>DrawSync</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" style={{ color: "var(--muted-color)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }} className="hover:text-[var(--ink)] transition-colors">Features</a>
            <a href="#how-it-works" style={{ color: "var(--muted-color)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }} className="hover:text-[var(--ink)] transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" style={{ color: "var(--ink)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }} className="hidden md:block hover:text-[var(--muted-color)] transition-colors">Sign in</Link>
            <Link href="/auth" style={{ background: "var(--coral)", color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", padding: "10px 20px", borderRadius: 8, lineHeight: 1 }} className="hidden md:inline-block hover:opacity-90 transition-opacity">Try DrawSync</Link>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2" style={{ color: "var(--ink)" }}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{ background: "var(--canvas)", borderBottom: "1px solid var(--hairline)" }}
            className="fixed top-16 inset-x-0 z-40 flex flex-col px-6 py-6 gap-5 md:hidden">
            {["Features", "How it works"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} onClick={() => setOpen(false)} style={{ color: "var(--ink)", fontSize: 16, fontWeight: 500, fontFamily: "var(--font-sans)" }}>{item}</a>
            ))}
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20, display: "flex", flexDirection: "column" as const, gap: 12 }}>
              <Link href="/auth" onClick={() => setOpen(false)} style={{ color: "var(--ink)", fontSize: 15, fontWeight: 500, fontFamily: "var(--font-sans)" }}>Sign in</Link>
              <Link href="/auth" onClick={() => setOpen(false)} style={{ background: "var(--coral)", color: "#fff", fontSize: 15, fontWeight: 500, fontFamily: "var(--font-sans)", padding: "12px 20px", borderRadius: 8, textAlign: "center" as const }}>Try DrawSync</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => (
  <section style={{ background: "var(--canvas)", paddingTop: 120 }} className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-20">
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <span style={{ background: "var(--coral)", color: "#fff", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)", letterSpacing: "1.5px", padding: "5px 14px", borderRadius: 9999, textTransform: "uppercase" as const }}>
        Real-time collaborative whiteboard
      </span>
    </motion.div>

    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
      style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-2px", color: "var(--ink)", marginTop: 28, maxWidth: 880 }}>
      Dirty your hands{" "}<br className="hidden sm:block" />
      <em style={{ color: "var(--coral)", fontStyle: "italic" }}>collaboratively</em>
    </motion.h1>

    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
      style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--muted-color)", lineHeight: 1.6, marginTop: 24, maxWidth: 480 }}>
      Explain your brilliant ideas in real time. A whiteboard built for teams who think fast and draw faster.
    </motion.p>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-10 w-full max-w-xs sm:max-w-none sm:w-auto">
      <Link href="/auth" style={{ background: "var(--coral)", color: "#fff", fontSize: 15, fontWeight: 500, fontFamily: "var(--font-sans)", padding: "14px 32px", borderRadius: 8, lineHeight: 1, textAlign: "center" as const }} className="hover:opacity-90 transition-opacity">
        Start Drawing →
      </Link>
      <a href="#features" style={{ background: "var(--canvas)", color: "var(--ink)", fontSize: 15, fontWeight: 500, fontFamily: "var(--font-sans)", padding: "14px 32px", borderRadius: 8, lineHeight: 1, border: "1px solid var(--hairline)", textAlign: "center" as const }} className="hover:bg-[var(--surface-soft)] transition-colors">
        See how it works
      </a>
    </motion.div>

    

    <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="w-full max-w-5xl mt-12">
      <div style={{ background: "var(--surface-dark)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.22)" }}>
        {/* Browser chrome */}
        <div style={{ background: "var(--surface-dark-elevated)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1.5">
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <div style={{ flex: 1, maxWidth: 220, margin: "0 auto", background: "var(--surface-dark-soft)", borderRadius: 5, padding: "3px 10px", fontSize: 11, color: "var(--on-dark-soft)", fontFamily: "var(--font-mono)", textAlign: "center" as const }}>
            drawsync.app/canvas/room-123
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c840" }} />
            <span style={{ fontSize: 10, color: "var(--on-dark-soft)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>LIVE</span>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ position: "relative" as const, height: 420, background: "#0f0e0c", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          <div style={{ position: "absolute" as const, inset: 0, background: "radial-gradient(ellipse at 25% 35%, rgba(204,120,92,0.08) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(93,184,166,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />

          {/* Toolbar */}
          <div style={{ position: "absolute" as const, top: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(37,35,32,0.96)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", display: "flex", gap: 8, zIndex: 10 }}>
            {[Pencil, Shapes, Terminal, MoveUpRight].map((Icon, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 7, background: i === 0 ? "var(--coral)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} color={i === 0 ? "#fff" : "rgba(255,255,255,0.35)"} />
              </div>
            ))}
          </div>

          {/* Avatars */}
          <div className="hidden sm:flex" style={{ position: "absolute" as const, top: 20, right: 20, zIndex: 10 }}>
            {[{ color: "#ef4444", label: "A" }, { color: "#3b82f6", label: "B" }, { color: "#10b981", label: "C" }].map((u, i) => (
              <div key={u.label} style={{ width: 30, height: 30, borderRadius: "50%", background: u.color, border: "2px solid #0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--font-sans)", marginLeft: i === 0 ? 0 : -8 }}>
                {u.label}
              </div>
            ))}
            <div style={{ marginLeft: -8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid #0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>+2</div>
          </div>

          {/* Cursor Alice */}
          <motion.div animate={{ left: ["8%", "42%", "28%", "8%"], top: ["48%", "32%", "70%", "48%"] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute" as const, zIndex: 20 }}>
            <MousePointer2 size={16} fill="#ef4444" color="#ef4444" />
            <div style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, marginLeft: 14, marginTop: 2, whiteSpace: "nowrap" as const, fontFamily: "var(--font-sans)" }}>Alice</div>
          </motion.div>

          {/* Cursor Bob */}
          <motion.div animate={{ left: ["82%", "62%", "72%", "82%"], top: ["58%", "76%", "42%", "58%"] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ position: "absolute" as const, zIndex: 20 }}>
            <MousePointer2 size={16} fill="#3b82f6" color="#3b82f6" />
            <div style={{ background: "#3b82f6", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, marginLeft: 14, marginTop: 2, whiteSpace: "nowrap" as const, fontFamily: "var(--font-sans)" }}>Bob</div>
          </motion.div>

          {/* idea.tsx box */}
          <motion.div animate={{ rotate: [0, 1.5, -1.5, 0] }} transition={{ duration: 8, repeat: Infinity }}
            style={{ position: "absolute" as const, top: "38%", left: "8%", width: "42%", maxWidth: 180, minWidth: 110, height: 90, border: "1.5px dashed var(--coral)", borderRadius: 10, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Pencil size={14} color="var(--coral)" style={{ opacity: 0.7 }} />
            <span style={{ color: "var(--coral)", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600 }}>idea.tsx</span>
            <span style={{ color: "rgba(204,120,92,0.5)", fontSize: 9, fontFamily: "var(--font-mono)" }}>editing...</span>
          </motion.div>

          {/* WebSocket circle */}
          <motion.div animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }} transition={{ duration: 4, repeat: Infinity }}
            className="hidden sm:flex"
            style={{ position: "absolute" as const, bottom: "16%", right: "16%", width: 130, height: 130, borderRadius: "50%", border: "1.5px solid var(--accent-teal)", background: "rgba(93,184,166,0.08)", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Zap size={16} color="var(--accent-teal)" />
            <span style={{ color: "var(--accent-teal)", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}>WebSocket</span>
            <span style={{ color: "rgba(93,184,166,0.5)", fontSize: 9, fontFamily: "var(--font-mono)" }}>ws://live</span>
          </motion.div>

          {/* Prisma box */}
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity }}
            className="hidden sm:flex"
            style={{ position: "absolute" as const, bottom: "24%", left: "44%", width: 115, height: 68, background: "rgba(232,165,90,0.08)", border: "1.5px solid var(--accent-amber)", borderRadius: 8, flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Database size={13} color="var(--accent-amber)" />
            <span style={{ color: "var(--accent-amber)", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}>Prisma ORM</span>
          </motion.div>

          {/* Dashed connector */}
          <svg className="hidden sm:block" style={{ position: "absolute" as const, inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}>
            <motion.path d="M 270 150 C 370 150 370 300 510 300" stroke="rgba(204,120,92,0.18)" strokeWidth="1.5" strokeDasharray="6 4" fill="none"
              animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          </svg>

          {/* Chat bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 0.85], y: [8, 0, 0, 8] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 6, delay: 3 }}
            className="hidden sm:block"
            style={{ position: "absolute" as const, top: "14%", right: "26%", background: "rgba(37,35,32,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", zIndex: 15 }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, fontFamily: "var(--font-sans)" }}>💡 what if we add auth here?</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </section>
);

const features = [
  { icon: Zap, title: "Live Sync", description: "Dedicated WebSocket servers deliver sub-second updates to every connected client with zero perceptible lag.", accent: "var(--coral)" },
  { icon: Shapes, title: "Monorepo Architecture", description: "Turborepo cleanly separates HTTP, WebSocket, and Frontend apps from shared packages and configs.", accent: "var(--accent-teal)" },
  { icon: Database, title: "Persistent Storage", description: "Every room, shape, and message is reliably stored via Prisma ORM and PostgreSQL.", accent: "var(--accent-amber)" },
];

const Features = () => (
  <section id="features" style={{ background: "var(--surface-soft)", paddingTop: 96, paddingBottom: 96 }} className="px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)", letterSpacing: "2px", color: "var(--coral)", textTransform: "uppercase" as const }}>
          Why DrawSync
        </span>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 400, letterSpacing: "-0.5px", color: "var(--ink)", marginTop: 14, lineHeight: 1.15 }}>
          Everything your team needs
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ background: "var(--canvas)", borderRadius: 14, padding: "36px 32px", border: "1px solid var(--hairline)", position: "relative" as const, overflow: "hidden" }}>
            {/* Accent top bar */}
            <div style={{ position: "absolute" as const, top: 0, left: 0, right: 0, height: 3, background: f.accent, borderRadius: "14px 14px 0 0" }} />
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--surface-soft)", border: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <f.icon size={22} color={f.accent} />
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 600, color: "var(--ink)", marginBottom: 10, lineHeight: 1.3 }}>{f.title}</h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--muted-color)", lineHeight: 1.65 }}>{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { step: "01", icon: Users, title: "Create a room", desc: "Sign up and spin up a drawing room in seconds. Share the link — your team joins instantly, no install needed." },
  { step: "02", icon: Pencil, title: "Start drawing", desc: "Sketch shapes, annotate ideas, and brainstorm freely on an infinite canvas built for speed." },
  { step: "03", icon: MoveUpRight, title: "Sync in real time", desc: "Every stroke broadcasts to all collaborators via WebSockets. See teammates' cursors move live." },
];

const HowItWorks = () => (
  <section id="how-it-works" style={{ background: "var(--surface-dark)", paddingTop: 96, paddingBottom: 96 }} className="px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)", letterSpacing: "2px", color: "var(--coral)", textTransform: "uppercase" as const }}>How it works</span>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 400, letterSpacing: "-0.5px", color: "var(--on-dark)", marginTop: 14, lineHeight: 1.15 }}>
          From idea to canvas in seconds
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((item, i) => (
          <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ background: "var(--surface-dark-elevated)", borderRadius: 14, padding: "36px 32px", border: "1px solid rgba(255,255,255,0.06)", position: "relative" as const }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, color: "var(--coral)", fontWeight: 700, opacity: 0.25, position: "absolute" as const, top: 24, right: 28 }}>{item.step}</span>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--surface-dark-soft)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <item.icon size={22} color="var(--coral)" />
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 600, color: "var(--on-dark)", marginBottom: 10, lineHeight: 1.3 }}>{item.title}</h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--on-dark-soft)", lineHeight: 1.65 }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTABand = () => (
  <section style={{ background: "var(--coral)", padding: "80px 24px", position: "relative" as const, overflow: "hidden" }} className="text-center">
    {/* Background texture circles */}
    <div style={{ position: "absolute" as const, top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
    <div style={{ position: "absolute" as const, bottom: -80, right: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
    <div style={{ position: "absolute" as const, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative" as const, zIndex: 1 }}>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, letterSpacing: "-0.3px", color: "#fff", marginBottom: 16, lineHeight: 1.15 }}>
        Ready to draw together?
      </h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 17, color: "rgba(255,255,255,0.82)", marginBottom: 36, maxWidth: 380, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
        Create your first room free. No credit card required.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/auth" style={{ background: "#fff", color: "var(--coral)", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-sans)", padding: "14px 32px", borderRadius: 8, lineHeight: 1, display: "inline-block" }} className="hover:opacity-90 transition-opacity">
          Get started free →
        </Link>
        <a href="https://github.com/Bhavysinghal/draw-app" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 6, padding: "14px 20px" }} className="hover:text-white transition-colors">
          <Github size={16} />
          View on GitHub
        </a>
      </div>
    </motion.div>
  </section>
);

const Footer = () => (
  <footer style={{ background: "var(--surface-dark)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 24px" }}>
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Logo size={22} dark />
        <span style={{ fontFamily: "var(--font-sans)", color: "var(--on-dark-soft)", fontSize: 13 }}>
          © 2026 DrawSync — built by{" "}
          <a href="https://github.com/Bhavysinghal" style={{ color: "var(--coral)" }} className="hover:opacity-80 transition-opacity">Bhavysinghal</a>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#features" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-soft)" }} className="hover:text-[var(--on-dark)] transition-colors">Features</a>
        <a href="#how-it-works" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-soft)" }} className="hover:text-[var(--on-dark)] transition-colors">How it works</a>
        <a href="https://github.com/Bhavysinghal/draw-app" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-soft)", display: "flex", alignItems: "center", gap: 4 }} className="hover:text-[var(--on-dark)] transition-colors">
          <Github size={13} /> GitHub
        </a>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div style={{ background: "var(--canvas)" }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTABand />
      <Footer />
    </div>
  );
}
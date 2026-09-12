import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  MapPin,
  ChevronDown,
  Sparkles,
  CalendarPlus,
  Share2,
  Send,
  Check,
  Users,
  Flower2,
} from 'lucide-react';
import emailjs from '@emailjs/browser';

/* =========================================================================
   DESIGN TOKENS
========================================================================= */

const C = {
  maroon900: '#4A0913',
  maroon800: '#6B0F1F',
  maroon700: '#7F1526',

  gold300: '#EAD48C',
  gold500: '#C9A24B',
  gold700: '#8C6A24',

  cream50: '#FCF6E7',
  cream100: '#F5E8C8',
  ivory: '#FFFBF1',

  green700: '#33532E',
  green900: '#1F3A1C',
  green500: '#4B7A45',

  terracotta: '#B5482F',
  rose: '#C24B5C',

  ink: '#3B230F',
};

const FONT_IMPORT_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Cinzel:wght@500;600&family=Parisienne&family=Tiro+Devanagari+Hindi&display=swap';

/* =========================================================================
   ASSETS
========================================================================= */

const GANESHA_IMAGE = '/assets/art/ganesha.png';
const GANPATI_AUDIO = '/audio/ganpati-bappa-morya.mp3';

/* =========================================================================
   EMAILJS
========================================================================= */

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/* =========================================================================
   EVENT DATA
========================================================================= */

const EVENT = {
  hosts: 'Bharat Padmavat and Family',
  startISO: '2026-09-14',
  endISO: '2026-09-18',
  startLabel: '14 September 2026',
  endLabel: '18 September 2026',
  addressLine1: '803, Building No. 20, Regency Anantam',
  addressLine2: 'Dombivli East – 421203',
};

const ADDRESS_TEXT = `${EVENT.addressLine1}, ${EVENT.addressLine2}`;
const MAPS_URL = `https://www.google.com/search?q=${encodeURIComponent(ADDRESS_TEXT)}`;

/* =========================================================================
   UTILITIES
========================================================================= */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', fn) : mq.removeListener(fn);
    };
  }, []);
  return reduced;
}

function useCountdown(targetISO) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });
  useEffect(() => {
    const target = new Date(`${targetISO}T00:00:00`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setLeft({ d: 0, h: 0, m: 0, s: 0, done: true }); return; }
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        done: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  return left;
}

/* =========================================================================
   PETALS + GLOW
========================================================================= */

function useFallingPetalsCanvas(canvasRef, reduced) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let petals = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const spawn = () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      size: 5 + Math.random() * 6,
      speed: 0.35 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.03,
      opacity: 0.4 + Math.random() * 0.4,
    });
    petals = Array.from({ length: 22 }, spawn);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.y += p.speed; p.x += p.drift; p.angle += p.spin;
        if (p.y > canvas.height + 20) Object.assign(p, spawn(), { y: -20 });
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = C.terracotta;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [canvasRef, reduced]);
}

function useAmbientGlowCanvas(canvasRef, reduced) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 60 + Math.random() * 90,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      orbs.forEach((o) => {
        if (!reduced) { o.x += o.vx; o.y += o.vy; }
        if (o.x < 0 || o.x > 1) o.vx *= -1;
        if (o.y < 0 || o.y > 1) o.vy *= -1;
        const cx = o.x * canvas.width;
        const cy = o.y * canvas.height;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        grad.addColorStop(0, 'rgba(233,196,120,0.16)');
        grad.addColorStop(1, 'rgba(233,196,120,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [canvasRef, reduced]);
}

/* =========================================================================
   SVG DECORATIONS
========================================================================= */

const TempleBell = ({ size = 40, id }) => (
  <svg viewBox="0 0 100 120" width={size} height={size * 1.2}>
    <defs>
      <linearGradient id={`bellGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={C.gold700} />
        <stop offset="30%" stopColor={C.gold500} />
        <stop offset="55%" stopColor={C.gold300} />
        <stop offset="80%" stopColor={C.gold500} />
        <stop offset="100%" stopColor={C.gold700} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="10" r="6.5" fill="none" stroke={`url(#bellGrad-${id})`} strokeWidth="4" />
    <rect x="46.5" y="15" width="7" height="7" rx="2" fill={`url(#bellGrad-${id})`} />
    <path
      d="M50 22 C36 22 31 35 29 58 C27.5 70 20 74 16.5 78 C15.5 79.5 16.5 81.5 18.5 81.5 L81.5 81.5 C83.5 81.5 84.5 79.5 83.5 78 C80 74 72.5 70 71 58 C69 35 64 22 50 22 Z"
      fill={`url(#bellGrad-${id})`}
    />
    <ellipse cx="50" cy="75" rx="28" ry="3" fill="none" stroke={C.gold700} strokeWidth="1" opacity="0.6" />
    <ellipse cx="50" cy="81.5" rx="31" ry="4.2" fill={`url(#bellGrad-${id})`} />
    <circle cx="50" cy="88" r="5" fill={C.maroon900} />
  </svg>
);

/* BellChain now uses a FIXED STRING_HEIGHT for every bell.
   Variation comes from bell size + swing timing only, so all bells
   visually hang from the SAME top line. */
const BellChain = ({ size, id, reduced, delay = 0, rotate = 3 }) => {
  const STRING_HEIGHT = 58;
  return (
    <motion.div
      className="flex flex-col items-center origin-top"
      animate={reduced ? {} : { rotate: [0, rotate, -rotate, 0] }}
      transition={{ repeat: Infinity, duration: 4 + delay, delay, ease: 'easeInOut' }}
    >
      <div className="relative" style={{ width: 10, height: STRING_HEIGHT }}>
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 2,
            height: '100%',
            background: `repeating-linear-gradient(to bottom, ${C.gold300} 0px, ${C.gold300} 3px, transparent 3px, transparent 7px)`,
          }}
        />
        {[20, 50, 80].map((p, i) => (
          <span
            key={i}
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: `${p}%`, width: 4, height: 4, border: `1px solid ${C.gold500}` }}
          />
        ))}
      </div>
      <TempleBell size={size} id={id} />
    </motion.div>
  );
};

const Dome = ({ width = 120 }) => (
  <svg viewBox="0 0 160 90" width={width} height={width * 0.56}>
    <path d="M10 90 C10 30 150 30 150 90" fill="none" stroke={C.gold500} strokeWidth="3" />
    <path d="M10 90 C10 40 150 40 150 90" fill={C.gold300} opacity="0.25" />
    <path d="M65 30 L80 6 L95 30" fill="none" stroke={C.gold500} strokeWidth="2.5" />
    <circle cx="80" cy="4" r="4" fill={C.gold500} />
    {[...Array(7)].map((_, i) => (
      <line key={i} x1={20 + i * 20} y1="90" x2={20 + i * 20} y2="84" stroke={C.gold500} strokeWidth="2" />
    ))}
  </svg>
);

const DamaskFlourish = ({ size = 46, flip = false, className = '' }) => (
  <svg
    viewBox="0 0 60 60" width={size} height={size} className={className}
    style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
  >
    <path d="M2 58 C2 30 20 20 20 2 M2 58 C20 58 22 44 34 40 M2 40 C14 40 16 30 26 26"
      fill="none" stroke={C.gold500} strokeWidth="1.6" opacity="0.85" />
    <circle cx="20" cy="2" r="2.4" fill={C.gold500} />
    <circle cx="34" cy="40" r="1.8" fill={C.terracotta} />
  </svg>
);

const Pillar = ({ height = 260, flip = false }) => (
  <svg
    viewBox="0 0 40 300" width={height * 0.13} height={height}
    style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
    preserveAspectRatio="none"
  >
    <rect x="14" y="0" width="12" height="300" fill={C.cream100} stroke={C.gold500} strokeWidth="1" />
    <rect x="6" y="0" width="28" height="10" fill={C.gold500} opacity="0.8" />
    <rect x="6" y="290" width="28" height="10" fill={C.gold500} opacity="0.8" />
    {[...Array(9)].map((_, i) => (
      <circle key={i} cx="20" cy={24 + i * 30} r="3" fill={C.gold500} opacity="0.7" />
    ))}
  </svg>
);

const RoseBloom = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <circle cx="12" cy="12" r="9" fill={C.rose} opacity="0.9" />
    <circle cx="12" cy="12" r="5.4" fill="#DE7C88" />
    <circle cx="12" cy="12" r="2.2" fill={C.gold300} />
  </svg>
);

const CreeperVine = ({ height = 220, flip = false, reduced }) => (
  <motion.div
    className="origin-top relative"
    animate={reduced ? {} : { rotate: [0, flip ? -2 : 2, 0] }}
    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
  >
    <svg
      viewBox="0 0 60 220" width={height * 0.27} height={height}
      style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
    >
      <path d="M10 0 C40 30 5 60 35 90 C55 110 15 140 35 170 C50 190 20 205 30 220"
        fill="none" stroke={C.green500} strokeWidth="2.4" />
      {[18, 65, 115, 165, 205].map((y, i) => (
        <circle key={i} cx={i % 2 === 0 ? 22 : 28} cy={y} r="5" fill={C.green700} opacity="0.85" />
      ))}
    </svg>
    <div className="absolute" style={{ top: '6%', left: flip ? 'auto' : '-4px', right: flip ? '-4px' : 'auto' }}>
      <RoseBloom size={14} />
    </div>
  </motion.div>
);

const CanopyBush = ({ size = 60, flip = false }) => (
  <svg
    viewBox="0 0 80 50" width={size} height={size * 0.62}
    style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
  >
    <circle cx="20" cy="30" r="20" fill={C.green700} />
    <circle cx="45" cy="20" r="24" fill={C.green500} />
    <circle cx="65" cy="32" r="16" fill={C.green700} />
  </svg>
);

const ArchPanel = () => (
  <svg viewBox="0 0 320 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
    <path d="M6 200 L6 60 C6 20 60 4 160 4 C260 4 314 20 314 60 L314 200"
      fill="none" stroke={C.gold500} strokeWidth="1.5" strokeDasharray="1 5" opacity="0.6" />
  </svg>
);

const GaneshaImage = ({ size = 150, reduced }) => (
  <motion.div
    className="relative flex items-center justify-center"
    animate={reduced ? {} : { y: [0, -3, 0] }}
    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
  >
    <div
      className="absolute rounded-full"
      style={{
        width: size * 0.98, height: size * 0.98,
        background: `radial-gradient(circle, ${C.gold300}45 0%, ${C.gold300}18 45%, transparent 72%)`,
        filter: 'blur(5px)',
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        width: size + 20, height: size + 20,
        border: `1.5px solid ${C.gold500}`,
        boxShadow: `0 0 0 5px ${C.cream50}, 0 0 0 6px ${C.gold500}70, 0 0 35px ${C.gold500}30`,
      }}
    />
    <div
      className="absolute rounded-full"
      style={{ width: size + 8, height: size + 8, border: `1px dashed ${C.gold700}` }}
    />
    <img
      src={GANESHA_IMAGE}
      alt="Lord Ganesha"
      className="relative z-10 object-contain"
      style={{ width: size, height: size, filter: `drop-shadow(0 8px 12px ${C.maroon900}20)` }}
    />
  </motion.div>
);

const DecorativeDiya = ({ reduced, delay = 0 }) => (
  <motion.div
    animate={reduced ? {} : { y: [0, -2, 0] }}
    transition={{ repeat: Infinity, duration: 2.8, delay, ease: 'easeInOut' }}
    className="flex flex-col items-center"
  >
    <motion.div
      animate={reduced ? {} : { scaleY: [1, 1.12, 0.94, 1.08, 1], scaleX: [1, 0.95, 1.04, 0.98, 1] }}
      transition={{ repeat: Infinity, duration: 1.5, delay }}
      style={{
        width: 12, height: 20, borderRadius: '50% 50% 45% 45%',
        background: `radial-gradient(ellipse at center bottom, ${C.gold300}, ${C.terracotta} 55%, transparent 70%)`,
        filter: `drop-shadow(0 0 8px ${C.gold500})`,
        transformOrigin: 'center bottom',
      }}
    />
    <div
      style={{
        width: 34, height: 12, borderRadius: '50% 50% 45% 45%',
        background: `linear-gradient(to bottom, ${C.gold300}, ${C.gold700})`,
        border: `1px solid ${C.gold500}`,
      }}
    />
  </motion.div>
);

const TraditionalRangoli = ({ reduced }) => (
  <div className="relative w-full py-8 px-4 overflow-hidden">
    {/* top divider */}
    <div className="flex items-center gap-3 mb-6">
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(to right, transparent, ${C.maroon800})` }}
      />
      <Sparkles className="w-4 h-4" style={{ color: C.maroon800 }} />
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(to left, transparent, ${C.maroon800})` }}
      />
    </div>

    {/* Rangoli */}
    <motion.div
      className="relative mx-auto w-40 h-40 flex items-center justify-center"
      animate={reduced ? {} : { rotate: [0, 1.5, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
    >
      {/* outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: `1.5px solid ${C.gold700}` }}
      />
      {/* inner dashed ring */}
      <div
        className="absolute inset-4 rounded-full"
        style={{ border: `1.5px dashed ${C.maroon800}` }}
      />
      {/* four petal arcs */}
      {[0, 45, 90, 135].map((deg) => (
        <div key={deg} className="absolute" style={{ transform: `rotate(${deg}deg)` }}>
          <div
            className="w-20 h-20"
            style={{
              border: `2px solid ${C.maroon700}`,
              borderRadius: '50% 0 50% 0',
              transform: 'rotate(45deg)',
              opacity: 0.85,
            }}
          />
        </div>
      ))}
      {/* dots around */}
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 76;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${Math.cos(a) * r}px)`,
              top: `calc(50% + ${Math.sin(a) * r}px)`,
              width: 5,
              height: 5,
              background: C.gold700,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
      {/* centre ॐ medallion */}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: C.maroon800,
          border: `2px solid ${C.gold500}`,
          color: C.gold300,
          fontFamily: "'Tiro Devanagari Hindi', serif",
          fontSize: 24,
          boxShadow: `0 0 0 4px ${C.cream50}, 0 0 0 5px ${C.gold500}70`,
        }}
      >
        ॐ
      </div>
    </motion.div>

    {/* Diyas + label */}
    <div className="flex justify-center items-end gap-10 mt-6">
      <DecorativeDiya reduced={reduced} delay={0} />
      <div className="text-center">
        <p className="font-deva text-lg" style={{ color: C.maroon800 }}>मंगलम्</p>
        <p className="font-label text-[9px] mt-1" style={{ color: C.gold700 }}>शुभ आरंभ</p>
      </div>
      <DecorativeDiya reduced={reduced} delay={0.3} />
    </div>

    {/* bottom floral accents */}
    <div className="flex justify-center items-center gap-2 mt-6">
      <RoseBloom size={15} />
      <span className="w-1 h-1 rounded-full" style={{ background: C.gold700 }} />
      <RoseBloom size={19} />
      <span className="w-1 h-1 rounded-full" style={{ background: C.gold700 }} />
      <RoseBloom size={15} />
    </div>
  </div>
);

const MandalaCorner = ({ className = '' }) => (
  <svg viewBox="0 0 60 60" width="30" height="30" className={className}>
    <path d="M2 2 L2 20 M2 2 L20 2" stroke={C.gold500} strokeWidth="1.5" fill="none" />
    <circle cx="2" cy="2" r="3" fill="none" stroke={C.gold500} strokeWidth="1.2" />
  </svg>
);

const Idle = ({ children, reduced, rotate = 4, duration = 3, delay = 0, y }) => (
  <motion.div
    className="origin-top"
    animate={
      reduced
        ? {}
        : { rotate: [0, rotate, -rotate, 0], ...(y ? { y: [0, y, 0] } : {}) }
    }
    transition={{ repeat: Infinity, duration, ease: 'easeInOut', delay }}
  >
    {children}
  </motion.div>
);

const RevealPanel = ({ children, className = '', reduced }) => (
  <motion.div
    className={`relative ${className}`}
    initial={reduced ? false : 'hidden'}
    whileInView={reduced ? undefined : 'visible'}
    viewport={{ once: true, amount: 0.3 }}
  >
    {!reduced && (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <motion.rect
          x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
          fill="none" stroke={C.gold500} strokeWidth="1.5"
          variants={{
            hidden: { pathLength: 0, opacity: 0.3 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1.4, ease: 'easeInOut' } },
          }}
        />
      </svg>
    )}
    {children}
  </motion.div>
);


/* =========================================================================
   MAIN
========================================================================= */

export default function GaneshChaturthiInvitation() {
  const reduced = usePrefersReducedMotion();

  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState('');
  const [guests, setGuests] = useState(1);
  const [attending, setAttending] = useState('yes');
  const [message, setMessage] = useState('');
  const [rsvps, setRsvps] = useState([]);
  const [rsvpLoading, setRsvpLoading] = useState(true);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);

  const audioRef = useRef(null);
  const petalCanvasRef = useRef(null);
  const glowCanvasRef = useRef(null);

  useFallingPetalsCanvas(petalCanvasRef, reduced);
  useAmbientGlowCanvas(glowCanvasRef, reduced);

  const countdown = useCountdown(EVENT.startISO);

  /* ----------------- AUDIO ----------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.38;
    audio.loop = true;
  }, []);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (musicOn) { audio.pause(); setMusicOn(false); }
      else { await audio.play(); setMusicOn(true); }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  }, [musicOn]);

  const handleOpening = useCallback(async () => {
    if (isCurtainOpen) return;
    setIsCurtainOpen(true);
    const audio = audioRef.current;
    if (audio && !musicOn) {
      try { await audio.play(); setMusicOn(true); }
      catch (error) { console.warn('Music could not autoplay:', error); }
    }
  }, [musicOn, isCurtainOpen]);

  /* ----------------- RSVP STORAGE ----------------- */
  useEffect(() => {
    (async () => {
      try {
        if (typeof window !== 'undefined' && window.storage) {
          const res = await window.storage.get('rsvp-responses', true);
          setRsvps(res?.value ? JSON.parse(res.value) : []);
        } else {
          const raw = localStorage.getItem('rsvp-responses');
          setRsvps(raw ? JSON.parse(raw) : []);
        }
      } catch {
        setRsvps([]);
      } finally {
        setRsvpLoading(false);
      }
    })();
  }, []);

  const submitRSVP = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setRsvpSubmitting(true);
    setRsvpError(false);

    const guestCount = attending === 'yes' ? Number(guests) || 1 : 0;
    const entry = {
      name: name.trim(),
      attending,
      guests: guestCount,
      message: message.trim(),
      ts: Date.now(),
    };

    try {
      /* ---------- 1. Save locally (works everywhere) ---------- */
      const updated = [...rsvps, entry];
      try {
        if (typeof window !== 'undefined' && window.storage) {
          await window.storage.set('rsvp-responses', JSON.stringify(updated), true);
        } else {
          localStorage.setItem('rsvp-responses', JSON.stringify(updated));
        }
      } catch {
        localStorage.setItem('rsvp-responses', JSON.stringify(updated));
      }

      /* ---------- 2. Send email via EmailJS ---------- */
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn(
          'EmailJS env vars missing. RSVP saved locally but not emailed. ' +
          'Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY to .env'
        );
        // Don't throw — still mark the RSVP as done so the user sees success.
        setRsvps(updated);
        setRsvpDone(true);
        return;
      }

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          guest_name: entry.name,
          attending: entry.attending === 'yes' ? 'Yes' : 'No',
          guest_count: entry.guests,
          guest_message: entry.message || 'No message provided',
          event_name: 'Ganesh Chaturthi Darshan',
          event_dates: `${EVENT.startLabel} – ${EVENT.endLabel}`,
          hosts: EVENT.hosts,
          location: ADDRESS_TEXT,
          submitted_at: new Date(entry.ts).toLocaleString('en-IN'),
        },
        PUBLIC_KEY
      );

      setRsvps(updated);
      setRsvpDone(true);
    } catch (error) {
      console.error('RSVP submission error:', error);
      setRsvpError(true);
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const joiningCount = rsvps
    .filter((r) => r.attending === 'yes')
    .reduce((s, r) => s + (r.guests || 1), 0);

  /* ----------------- CALENDAR ----------------- */
  const downloadICS = () => {
    const fmt = (iso) => iso.replace(/-/g, '');
    const endExclusive = new Date(`${EVENT.endISO}T00:00:00`);
    endExclusive.setDate(endExclusive.getDate() + 1);
    const endStr = endExclusive.toISOString().slice(0, 10).replace(/-/g, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${fmt(EVENT.startISO)}`,
      `DTEND;VALUE=DATE:${endStr}`,
      'SUMMARY:Ganesh Chaturthi Darshan',
      `LOCATION:${ADDRESS_TEXT}`,
      `DESCRIPTION:Hosted by ${EVENT.hosts}. Come for darshan\\, prasad and celebration.`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ganesh-chaturthi.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ----------------- SHARE ----------------- */
  const shareInvite = async () => {
    const shareData = {
      title: 'Ganesh Chaturthi Invitation',
      text: `${EVENT.hosts} invite you for Ganesh Chaturthi darshan, ${EVENT.startLabel}.`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url || shareData.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (_) { }
  };

  /* =========================================================================
     RENDER
  ========================================================================= */
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: C.cream50, color: C.ink, fontFamily: "'Cormorant Garamond', serif" }}
    >
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        .font-script { font-family: 'Parisienne', cursive; }
        .font-label { font-family: 'Cinzel', serif; letter-spacing: 0.12em; }
        .font-deva { font-family: 'Tiro Devanagari Hindi', serif; }
        input, textarea { font-family: 'Cormorant Garamond', serif; }

        .velvet-curtain { position: relative; overflow: hidden; }
        .velvet-curtain::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.025) 0px,
            rgba(255,255,255,0.025) 2px,
            rgba(0,0,0,0.12) 7px,
            rgba(0,0,0,0.08) 13px
          );
          mix-blend-mode: soft-light;
        }
        .curtain-fold {
          position: absolute; top: 0; bottom: 0; width: 18%; opacity: 0.32;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
        }
        .curtain-fold:nth-child(1) { left: 5%; }
        .curtain-fold:nth-child(2) { left: 27%; }
        .curtain-fold:nth-child(3) { left: 49%; }
        .curtain-fold:nth-child(4) { left: 71%; }
      `}</style>

      {/* BACKGROUND AUDIO */}
      <audio ref={audioRef} src={GANPATI_AUDIO} preload="auto" loop />

      {/* FALLING PETALS */}
      <canvas ref={petalCanvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* ================================================================
    ROYAL RED CURTAIN OPENING OVERLAY
================================================================ */}
      <AnimatePresence>
        {!isCurtainOpen && (
          <motion.div
            key="curtain-overlay"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.6, delay: 1.0 },
            }}
            className="fixed inset-0 z-[100] flex overflow-hidden pointer-events-auto"
          >
            {/* LEFT CRIMSON VELVET CURTAIN */}
            <motion.div
              initial={{ x: 0, opacity: 1 }}
              animate={
                isCurtainOpen
                  ? { x: '-100%', opacity: 0 }
                  : { x: [0, -4, 0], opacity: 1 }
              }
              transition={
                isCurtainOpen
                  ? {
                    x: { duration: 1.4, ease: [0.77, 0, 0.175, 1] },
                    opacity: { duration: 1.2, delay: 0.3, ease: 'easeOut' },
                  }
                  : { repeat: Infinity, duration: 6, ease: 'easeInOut' }
              }
              className="w-[calc(50%-10px)] h-full relative shadow-[25px_0_40px_rgba(0,0,0,0.9)] border-r border-[#D4AF37]/40"
              style={{
                backgroundColor: '#80001A',
                backgroundImage: `
            linear-gradient(90deg,
              rgba(20, 0, 4, 0.95) 0%,
              rgba(180, 20, 50, 0.35) 12%,
              rgba(40, 0, 8, 0.85) 28%,
              rgba(255, 120, 90, 0.22) 48%,
              rgba(60, 0, 12, 0.9) 70%,
              rgba(15, 0, 3, 0.98) 100%
            ),
            radial-gradient(circle at 50% 50%, rgba(140, 0, 25, 0.5) 20%, transparent 80%)
          `,
                backgroundSize: '100% 100%, 40px 40px',
              }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#B8860B] via-[#FFF8DC] to-[#8B6508] shadow-md" />
            </motion.div>

            {/* CENTER PILLAR */}
            <motion.div
              animate={isCurtainOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-5 h-full bg-gradient-to-b from-[#150003] via-[#300007] to-[#150003] flex justify-center items-center relative z-10 shadow-inner"
            >
              <div className="h-full w-1.5 bg-repeat-y bg-[length:6px_14px] bg-[radial-gradient(circle,_#FFF5C0_40%,_#AA7A1E_70%)] opacity-80" />
            </motion.div>

            {/* RIGHT CRIMSON VELVET CURTAIN */}
            <motion.div
              initial={{ x: 0, opacity: 1 }}
              animate={
                isCurtainOpen
                  ? { x: '100%', opacity: 0 }
                  : { x: [0, 4, 0], opacity: 1 }
              }
              transition={
                isCurtainOpen
                  ? {
                    x: { duration: 1.4, ease: [0.77, 0, 0.175, 1] },
                    opacity: { duration: 1.2, delay: 0.3, ease: 'easeOut' },
                  }
                  : { repeat: Infinity, duration: 6, ease: 'easeInOut' }
              }
              className="w-[calc(50%-10px)] h-full relative shadow-[-25px_0_40px_rgba(0,0,0,0.9)] border-l border-[#D4AF37]/40"
              style={{
                backgroundColor: '#80001A',
                backgroundImage: `
            linear-gradient(270deg,
              rgba(20, 0, 4, 0.95) 0%,
              rgba(180, 20, 50, 0.35) 12%,
              rgba(40, 0, 8, 0.85) 28%,
              rgba(255, 120, 90, 0.22) 48%,
              rgba(60, 0, 12, 0.9) 70%,
              rgba(15, 0, 3, 0.98) 100%
            ),
            radial-gradient(circle at 50% 50%, rgba(140, 0, 25, 0.5) 20%, transparent 80%)
          `,
                backgroundSize: '100% 100%, 40px 40px',
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#8B6508] via-[#FFF8DC] to-[#B8860B] shadow-md" />
            </motion.div>

            {/* CENTER BELL BUTTON */}
            <motion.div
              animate={isCurtainOpen ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-auto space-y-6"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-[#210006]/90 border border-[#D4AF37]/70 px-6 py-2 rounded-md shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-md"
              >
                <h2 className="text-xl md:text-2xl font-bold tracking-widest text-[#F5E6AD] font-sans">
                  ॥ श्री गणेशाय नमः ॥
                </h2>
              </motion.div>

              <motion.button
                onClick={handleOpening}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative focus:outline-none cursor-pointer p-4"
                aria-label="Tap to open invitation"
              >
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-[#D4AF37] bg-[#2D0008]/90 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.4)] backdrop-blur-md relative">
                  <div className="absolute inset-1.5 rounded-full border border-dashed border-[#F5E6AD]/30" />
                  <motion.svg
                    viewBox="0 0 100 120"
                    animate={{ rotate: [0, 4, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    className="w-24 h-28 md:w-28 md:h-32 drop-shadow-[0_12px_15px_rgba(0,0,0,0.85)] origin-top"
                  >
                    <defs>
                      <linearGradient id="mainBellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7A520C" />
                        <stop offset="25%" stopColor="#D4AF37" />
                        <stop offset="50%" stopColor="#FFF8DC" />
                        <stop offset="75%" stopColor="#AA7A1E" />
                        <stop offset="100%" stopColor="#4A3000" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="11" r="7" fill="none" stroke="url(#mainBellGrad)" strokeWidth="4" />
                    <rect x="46" y="17" width="8" height="7" rx="2" fill="url(#mainBellGrad)" />
                    <path
                      d="M50 24 C35 24 30 38 28 64 C26 76 18 80 15 84 C14 85 15 87 17 87 L83 87 C85 87 86 85 85 84 C82 80 74 76 72 64 C70 38 65 24 50 24 Z"
                      fill="url(#mainBellGrad)"
                    />
                    <ellipse cx="50" cy="80" rx="31" ry="3.5" fill="none" stroke="#583A08" strokeWidth="1.5" />
                    <ellipse cx="50" cy="87" rx="34" ry="4.5" fill="url(#mainBellGrad)" />
                    <circle cx="50" cy="94" r="5.5" fill="#3D2400" />
                  </motion.svg>
                </div>
              </motion.button>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-[#210006]/90 border border-[#D4AF37]/70 px-6 py-2.5 rounded-md text-center shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-md"
              >
                <p className="text-base font-bold tracking-wider uppercase text-[#F5E6AD] font-sans">
                  घंटी बजाइए
                </p>
                <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-semibold">
                  TAP THE BELL TO OPEN
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING MUSIC */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleMusic}
          className="p-3.5 rounded-full shadow-xl border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{ background: C.maroon800, color: C.gold300, borderColor: C.gold500 }}
          aria-label="Toggle music"
        >
          {musicOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-80" />}
        </button>
      </div>

      {/* =====================================================================
          HERO
      ===================================================================== */}
      <section className="min-h-screen relative flex flex-col justify-between items-center py-10 px-4">
        <canvas ref={glowCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="w-full max-w-xl mx-auto flex flex-col items-center relative z-10">
          <div className="flex items-center gap-2 mb-3" style={{ color: C.terracotta }}>
            <Sparkles className="w-4 h-4" />
            <span className="font-label text-[11px]">an auspicious invitation</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <p className="font-label text-xs md:text-sm mb-4" style={{ color: C.maroon800 }}>
            {EVENT.hosts}
          </p>

          {/* CARD */}
          {/* GRAND ARCH FRAME */}
          <div className="relative my-4 w-full max-w-lg mx-auto flex flex-col items-center">
            <div
              className="relative w-full min-h-[560px] md:min-h-[640px] rounded-t-[120px] bg-[#FFFDF7] p-4 shadow-xl flex flex-col items-center justify-between overflow-hidden"
              style={{
                border: '2px solid #E3A027',
                boxShadow:
                  '0 0 0 6px #FFFDF7, 0 0 0 7px rgba(227,160,39,0.5), 0 12px 30px rgba(128,0,32,0.15)',
              }}
            >
              {/* Inner arch decoration */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 320"
                preserveAspectRatio="none"
              >
                {/* Inner dashed arch */}
                <path
                  d="M20 320 L20 120 C20 60 80 20 200 20 C320 20 380 60 380 120 L380 320"
                  fill="none"
                  stroke="rgba(128,0,32,0.30)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                {/* Inner gold rule */}
                <path
                  d="M32 320 L32 124 C32 70 88 32 200 32 C312 32 368 70 368 124 L368 320"
                  fill="none"
                  stroke="#E3A027"
                  strokeWidth="0.8"
                  opacity="0.55"
                />
                {/* Bottom dotted trim */}
                {[...Array(20)].map((_, i) => (
                  <circle key={i} cx={28 + i * 18} cy={310} r="1.6" fill="#E3A027" opacity="0.65" />
                ))}
              </svg>

              {/* ---- TORAN (mango leaves) ---- */}
              <div className="z-20 flex space-x-1 pt-1">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-8 bg-[#234E20] rounded-b-full shadow-sm border-t border-[#122A10]"
                  />
                ))}
              </div>

              {/* ---- ALIGNED BELL ROW ----
        Every bell hangs from the SAME top line (uniform chain height).
        Variation is only in bell size + swing delay. */}
              <div className="absolute top-0 inset-x-4 flex justify-center items-start gap-3 md:gap-4 z-20 pointer-events-none">
                {[
                  { size: 'w-6 h-8', delay: 0.0 },
                  { size: 'w-7 h-9', delay: 0.3 },
                  { size: 'w-8 h-10', delay: 0.15 },
                  { size: 'w-9 h-11', delay: 0.45 }, // center — biggest
                  { size: 'w-8 h-10', delay: 0.2 },
                  { size: 'w-7 h-9', delay: 0.5 },
                  { size: 'w-6 h-8', delay: 0.35 },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ rotate: [0, 4, -4, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3 + idx * 0.35,
                      ease: 'easeInOut',
                      delay: item.delay,
                    }}
                    className="flex flex-col items-center origin-top"
                  >
                    {/* Identical chain height for every bell → same top line */}
                    <div
                      className="w-1 h-16 bg-repeat-y bg-[length:4px_8px] bg-[radial-gradient(circle,_#FFF5C0_40%,_#AA7A1E_70%)] drop-shadow-sm"
                    />
                    {/* Brass bell */}
                    <svg viewBox="0 0 100 120" className={`${item.size} drop-shadow-md`}>
                      <defs>
                        <linearGradient
                          id={`archBellGrad_${idx}`}
                          x1="0%" y1="0%" x2="100%" y2="0%"
                        >
                          <stop offset="0%" stopColor="#8A5A0C" />
                          <stop offset="30%" stopColor="#E5C158" />
                          <stop offset="60%" stopColor="#FFF8DC" />
                          <stop offset="85%" stopColor="#C49A2E" />
                          <stop offset="100%" stopColor="#5A3A00" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="50" cy="11" r="7"
                        fill="none"
                        stroke={`url(#archBellGrad_${idx})`}
                        strokeWidth="4"
                      />
                      <rect
                        x="46" y="17" width="8" height="7" rx="2"
                        fill={`url(#archBellGrad_${idx})`}
                      />
                      <path
                        d="M50 24 C35 24 30 38 28 64 C26 76 18 80 15 84 L85 84 C82 80 74 76 72 64 C70 38 65 24 50 24 Z"
                        fill={`url(#archBellGrad_${idx})`}
                      />
                      <ellipse
                        cx="50" cy="84" rx="35" ry="4"
                        fill={`url(#archBellGrad_${idx})`}
                      />
                      <circle cx="50" cy="91" r="5" fill="#3D2400" />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* ---- CENTRAL GANESHA MOTIF ---- */}
              <div className="my-auto pt-10 flex justify-center items-center z-10">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-dashed border-[#E3A027]/80 flex items-center justify-center p-3 relative bg-[#FFFBF0]/90 shadow-md">
                  <img
                    src="/assets/art/ganesha.png"
                    alt="Lord Ganesha Motif"
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <svg
                    viewBox="0 0 100 100"
                    className="w-24 h-24 text-[#800020] fill-none stroke-current stroke-[2.5] hidden"
                    style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                  >
                    <circle cx="50" cy="50" r="46" stroke="#E3A027" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="42" stroke="#800020" strokeWidth="1" />
                    <path d="M 50 22 C 42 22 36 28 36 36 C 36 44 42 46 48 48 C 54 50 56 56 54 64 C 52 72 44 74 38 70" />
                    <path d="M 50 22 C 58 22 64 28 64 36 C 64 42 60 46 54 48" />
                    <path d="M 42 22 L 50 12 L 58 22 Z" fill="#800020" />
                    <path d="M 36 30 C 26 28 24 38 34 42" />
                    <path d="M 64 30 C 74 28 76 38 66 42" />
                    <line x1="50" y1="26" x2="50" y2="34" stroke="#C83B2B" strokeWidth="3" />
                  </svg>
                </div>
              </div>
              <div
                className="w-full relative mt-2 rounded-sm overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, ${C.cream100}55, ${C.cream50})`,
                  borderTop: `1px solid ${C.gold500}40`,
                }}
              >
                <TraditionalRangoli reduced={reduced} />
              </div>
            </div>

            {/* Ring Me button + heading + date (unchanged) */}
            <button
              onClick={toggleMusic}
              className="my-3 flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#E3A027] bg-[#FFF8E7] shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-5 h-5 text-[#C83B2B] ${musicOn ? 'animate-bounce' : ''}`}
              >
                <path d="M12 2a2 2 0 00-2 2v.29C7.12 5.14 5 7.82 5 11v5l-2 2v1h18v-1l-2-2v-5c0-3.18-2.12-5.86-5-6.71V4a2 2 0 00-2-2zm-3 18a3 3 0 006 0H9z" />
              </svg>
              <span className="text-xs font-semibold font-serif text-[#800020] uppercase tracking-wider">
                {musicOn ? 'Ringing Music' : 'Ring Me'}
              </span>
            </button>

            <h1 className="text-4xl md:text-6xl font-serif text-[#800020] text-center mt-2 font-bold tracking-wide leading-tight drop-shadow-sm italic">
              Ganesh Chaturthi
            </h1>

            <div className="flex items-center space-x-3 my-2 text-[#6B4226]">
              <span className="h-[1px] w-12 bg-[#E3A027]" />
              <p className="text-sm md:text-base font-semibold uppercase tracking-wider">
                14 September 2026 • 18 September 2026
              </p>
              <span className="h-[1px] w-12 bg-[#E3A027]" />
            </div>
          </div>
        </div>

        <motion.div
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="flex flex-col items-center mt-6 relative z-10"
        >
          <div
            className="px-4 py-1 rounded-full border text-xs"
            style={{ borderColor: `${C.maroon800}40`, background: `${C.ivory}cc`, color: C.maroon800 }}
          >
            scroll · नीचे देखिए
          </div>
          <ChevronDown className="w-4 h-4 mt-1" style={{ color: C.maroon800 }} />
        </motion.div>
      </section>

      {/* =====================================================================
          SHLOKA  (Ganesha image REMOVED per request)
      ===================================================================== */}
      <section
        className="relative mx-4 md:mx-auto max-w-3xl my-10 rounded-sm overflow-hidden"
        style={{ background: C.maroon900 }}
      >
        <div className="py-14 px-6 md:px-12 text-center">
          <h2 className="font-deva text-xl md:text-3xl leading-relaxed" style={{ color: C.gold300 }}>
            ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ॥
          </h2>
          <h2 className="font-deva text-xl md:text-3xl leading-relaxed mt-2" style={{ color: C.gold300 }}>
            ॥ निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
          </h2>
          <p
            className="mt-6 text-sm md:text-base italic max-w-2xl mx-auto"
            style={{ color: `${C.cream100}cc`, fontFamily: "'Cormorant Garamond', serif" }}
          >
            "O Lord with the twisted trunk and massive body, whose radiance equals a million suns —
            keep every undertaking of ours free from obstacles, always."
          </p>
        </div>
      </section>

      {/* =====================================================================
          INVITATION
      ===================================================================== */}
      <RevealPanel reduced={reduced} className="mx-4 md:mx-auto max-w-2xl my-10">
        <div className="text-center py-12 px-6 md:px-14" style={{ background: C.ivory }}>
          <div className="font-deva text-lg mb-3" style={{ color: C.gold500 }}>ॐ</div>
          <p className="font-label text-xs mb-4" style={{ color: C.maroon700 }}>{EVENT.startLabel}</p>
          <h2 className="font-script text-4xl md:text-5xl mb-5" style={{ color: C.maroon800 }}>
            A Joyful Darshan Awaits
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            {EVENT.hosts} cordially invite you and your family for the auspicious darshan of Lord Ganesha.
          </p>
          <div className="my-6 py-2.5 border-y max-w-md mx-auto" style={{ borderColor: `${C.gold500}70` }}>
            <p className="font-label text-[11px] md:text-xs" style={{ color: C.maroon800 }}>
              bappa will grace our home for five blessed days
            </p>
          </div>
          <p className="font-script text-2xl md:text-3xl" style={{ color: C.maroon800 }}>
            Come, seek blessings, share prasad and celebrate with us.
          </p>
        </div>
      </RevealPanel>

      {/* =====================================================================
          COUNTDOWN
      ===================================================================== */}
      <RevealPanel reduced={reduced} className="mx-4 md:mx-auto max-w-2xl my-10">
        <div className="text-center py-12 px-6" style={{ background: C.cream100 }}>
          <p className="font-label text-xs mb-4" style={{ color: C.maroon700 }}>
            counting down to the celebration
          </p>
          {countdown.done ? (
            <p className="font-script text-3xl" style={{ color: C.maroon800 }}>
              Bappa has arrived — Ganpati Bappa Morya!
            </p>
          ) : (
            <div className="flex items-center justify-center gap-4 md:gap-6">
              {[
                { v: countdown.d, l: 'days' },
                { v: countdown.h, l: 'hrs' },
                { v: countdown.m, l: 'min' },
                { v: countdown.s, l: 'sec' },
              ].map((u) => (
                <div key={u.l} className="flex flex-col items-center min-w-[56px]">
                  <div
                    className="text-3xl md:text-4xl font-semibold tabular-nums px-3 py-2 rounded-sm"
                    style={{ background: C.maroon800, color: C.gold300, fontFamily: "'Cinzel', serif" }}
                  >
                    {String(u.v).padStart(2, '0')}
                  </div>
                  <span className="font-label text-[10px] mt-1.5" style={{ color: C.maroon700 }}>{u.l}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={downloadICS}
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-label text-xs transition-transform hover:scale-105 active:scale-95"
            style={{ background: C.maroon800, color: C.gold300, border: `1px solid ${C.gold500}` }}
          >
            <CalendarPlus className="w-4 h-4" /> add to calendar
          </button>
        </div>
      </RevealPanel>

      {/* =====================================================================
          RSVP
      ===================================================================== */}
      <RevealPanel reduced={reduced} className="mx-4 md:mx-auto max-w-2xl my-10">
        <div className="py-12 px-6 md:px-12 text-center" style={{ background: C.ivory }}>
          <Users className="w-6 h-6 mx-auto mb-3" style={{ color: C.terracotta }} />
          <h2 className="font-script text-4xl mb-2" style={{ color: C.maroon800 }}>Will you join us?</h2>
          <p className="text-sm mb-6" style={{ color: `${C.ink}aa` }}>
            {rsvpLoading
              ? 'Loading responses…'
              : joiningCount > 0
                ? `${joiningCount} guest${joiningCount > 1 ? 's' : ''} already joining the celebration.`
                : 'Be the first to confirm you’re coming.'}
          </p>

          {rsvpDone ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 py-6"
            >
              <Check className="w-8 h-8" style={{ color: C.green700 }} />
              <p className="font-label text-sm" style={{ color: C.maroon800 }}>
                Thank you, {name.split(' ')[0]}!
              </p>
              <p className="text-sm" style={{ color: `${C.ink}99` }}>
                Your response has been saved and emailed to the hosts.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={submitRSVP} className="max-w-sm mx-auto text-left space-y-4">
              <div>
                <label className="font-label text-[10px]" style={{ color: C.maroon700 }}>your name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full mt-1 px-3 py-2 text-base border-b bg-transparent focus:outline-none"
                  style={{ borderColor: `${C.gold500}90`, color: C.ink }}
                  placeholder="Full name"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="attending" checked={attending === 'yes'} onChange={() => setAttending('yes')} />
                  Joyfully attending
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="attending" checked={attending === 'no'} onChange={() => setAttending('no')} />
                  Can't make it
                </label>
              </div>

              {attending === 'yes' && (
                <div>
                  <label className="font-label text-[10px]" style={{ color: C.maroon700 }}>number of guests</label>
                  <input
                    type="number" min={1} max={20} value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-base border-b bg-transparent focus:outline-none"
                    style={{ borderColor: `${C.gold500}90`, color: C.ink }}
                  />
                </div>
              )}

              <div>
                <label className="font-label text-[10px]" style={{ color: C.maroon700 }}>a note (optional)</label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                  className="w-full mt-1 px-3 py-2 text-base border-b bg-transparent focus:outline-none resize-none"
                  style={{ borderColor: `${C.gold500}90`, color: C.ink }}
                  placeholder="Looking forward to it!"
                />
              </div>

              {rsvpError && (
                <div
                  className="text-xs rounded-sm px-3 py-2"
                  style={{ color: C.terracotta, background: `${C.terracotta}10`, border: `1px solid ${C.terracotta}30` }}
                >
                  Couldn't send your response. Please check the EmailJS configuration and try again.
                </div>
              )}

              <button
                type="submit" disabled={rsvpSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-label text-xs transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{ background: C.maroon800, color: C.gold300, border: `1px solid ${C.gold500}` }}
              >
                <Send className="w-3.5 h-3.5" />
                {rsvpSubmitting ? 'sending…' : 'send response'}
              </button>
              <p className="text-[11px] text-center" style={{ color: `${C.ink}77` }}>
                Your response will be emailed to the hosts.
              </p>
            </form>
          )}
        </div>
      </RevealPanel>

      {/* =====================================================================
          LOCATION
      ===================================================================== */}
      <RevealPanel reduced={reduced} className="mx-4 md:mx-auto max-w-2xl my-10">
        <div className="py-12 px-6 text-center" style={{ background: C.cream100 }}>
          <p className="font-label text-xs mb-1" style={{ color: C.terracotta }}>स्थान</p>
          <h2 className="font-script text-4xl md:text-5xl mb-4" style={{ color: C.maroon800 }}>Where</h2>
          <h3 className="font-label text-lg mb-4" style={{ color: C.maroon800 }}>हमारा घर</h3>

          <p className="text-lg font-semibold mb-1">{EVENT.addressLine1}</p>
          <p className="text-sm md:text-base mb-6" style={{ color: `${C.ink}bb` }}>{EVENT.addressLine2}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-label text-xs transition-transform hover:scale-105 active:scale-95"
              style={{ background: C.maroon800, color: C.gold300, border: `1px solid ${C.gold500}` }}
            >
              <MapPin className="w-4 h-4" /> open in maps
            </a>
            <button
              onClick={shareInvite}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-label text-xs transition-transform hover:scale-105 active:scale-95"
              style={{ background: 'transparent', color: C.maroon800, border: `1px solid ${C.maroon800}60` }}
            >
              <Share2 className="w-4 h-4" /> {copied ? 'link copied' : 'share invite'}
            </button>
          </div>
        </div>
      </RevealPanel>

      {/* =====================================================================
          FOOTER
      ===================================================================== */}
      <section className="py-16 px-4 text-center relative overflow-hidden" style={{ background: C.maroon900, color: C.gold300 }}>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-deva text-3xl md:text-4xl">॥ शुभम् ॥</h2>

          <div className="flex items-center justify-center gap-6">
            <DecorativeDiya reduced={reduced} />
            <Flower2 className="w-5 h-5 opacity-70" />
            <DecorativeDiya reduced={reduced} />
          </div>

          <p className="text-sm md:text-base italic" style={{ color: `${C.gold300}cc` }}>
            "One lamp is lit for the house, and one for whoever is on their way to it."
          </p>

          <div className="pt-8 border-t" style={{ borderColor: `${C.gold500}30` }}>
            <p className="font-script text-2xl md:text-3xl mb-2">
              Ganpati Bappa Morya, pudhchya varshi lavkar ya
            </p>
            <p className="font-label text-[10px]">
              with love, {EVENT.hosts.toLowerCase()}
            </p>
          </div>

          <div className="pt-8 space-y-2">
            <h3 className="font-deva text-xl md:text-2xl">॥ गणपति बाप्पा मोरया ॥</h3>
            <p className="font-script text-2xl md:text-3xl">Mangalmurti Morya</p>
            <p className="text-xs pt-4 opacity-70">{EVENT.startLabel} · Dombivli East</p>
          </div>
        </div>
      </section>
    </div>
  );
}
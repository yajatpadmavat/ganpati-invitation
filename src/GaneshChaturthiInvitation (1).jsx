import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

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
  Heart,
} from 'lucide-react';

import * as Tone from 'tone';

/* =========================================================================
   DESIGN TOKENS
========================================================================= */

const C = {
  maroon950: '#30050D',
  maroon900: '#4A0913',
  maroon850: '#590A18',
  maroon800: '#6B0F1F',
  maroon700: '#7F1526',

  gold200: '#F4E5A8',
  gold300: '#EAD48C',
  gold500: '#C9A24B',
  gold600: '#A98232',
  gold700: '#8C6A24',

  cream50: '#FCF6E7',
  cream100: '#F5E8C8',
  ivory: '#FFFBF1',

  green700: '#33532E',
  green900: '#1F3A1C',

  terracotta: '#B5482F',
  ink: '#3B230F',
};

const FONT_IMPORT_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Cinzel:wght@500;600;700&family=Parisienne&family=Tiro+Devanagari+Hindi&display=swap';


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

const ADDRESS_TEXT =
  `${EVENT.addressLine1}, ${EVENT.addressLine2}`;

const MAPS_URL =
  `https://www.google.com/search?q=${encodeURIComponent(ADDRESS_TEXT)}`;


/* =========================================================================
   IMAGE ASSET MAP
   -------------------------------------------------------------------------
   Replace these paths with your actual image links/assets.

   IMPORTANT:
   Keep artwork as transparent PNG/WebP/SVG wherever possible.

   The reference design works because every decorative object is an
   independent layer that can move slightly.
========================================================================= */

const ART = {

  /*
   * ================================================================
   * TOP / ARCH ARTWORK
   * ================================================================
   */

  // ADD IMAGE LINK:
  // Main ornamental temple/mandap arch.
  arch: '/assets/art/arch-panel.jpeg',

  // ADD IMAGE LINK:
  // Decorative dome/crown at the top.
  dome: '/assets/art/dome.webp',

  // ADD IMAGE LINK:
  // Left/right pillars.
  pillarLeft: '/assets/art/pillar.jpeg',
  pillarRight: '/assets/art/pillar.jpeg',

  // ADD IMAGE LINK:
  // Damask ornamental background.
  damask: '/assets/art/damask.jpeg',

  /*
   * ================================================================
   * SIDE DECORATIONS
   * ================================================================
   */

  // ADD IMAGE LINK:
  // Decorative bushes/canopy leaves.
  bush: '/assets/art/bush.jpeg',
  bushFlip: '/assets/art/bush.jpeg',

  // ADD IMAGE LINK:
  // Hanging creepers.
  creeper: '/assets/art/creeper.png',
  creeperFlip: '/assets/art/creeper.png',

  // ADD IMAGE LINK:
  // Elephant motifs.
  elephant: '/assets/art/elephant.png',
  elephantFlip: '/assets/art/elephant-flip.png',

  // ADD IMAGE LINK:
  // Lotus leaves.
  leaf: '/assets/art/leaf.png',

  /*
   * ================================================================
   * WATER / LOWER DECORATION
   * ================================================================
   */

  // ADD IMAGE LINK:
  // Water/ripple artwork.
  water: '/assets/art/water.png',

  // ADD IMAGE LINK:
  // Lotus flowers.
  lotus: '/assets/art/lotus.png',

  /*
   * ================================================================
   * CENTER GANESHA IMAGE
   * ================================================================
   */

  // ADD IMAGE LINK:
  // Transparent PNG/WebP of your preferred Ganesh idol.
  //
  // Recommended:
  //  - transparent background
  //  - front-facing
  //  - traditional decoration
  //  - approximately 500–1000px tall
  //
  // If this is not provided, the hand-drawn SVG Ganesha below is used.
  ganesha: '/assets/art/ganesha.png',

  /*
   * ================================================================
   * OPTIONAL BACKGROUND
   * ================================================================
   */

  // ADD IMAGE LINK:
  // Very subtle parchment/paper texture.
  paperTexture: '/assets/art/paper-texture.webp',
};


/* =========================================================================
   SMALL UTILITIES
========================================================================= */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    setReduced(mq.matches);

    const fn = (e) => setReduced(e.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', fn);
    } else {
      mq.addListener(fn);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', fn);
      } else {
        mq.removeListener(fn);
      }
    };
  }, []);

  return reduced;
}


/* =========================================================================
   COUNTDOWN
========================================================================= */

function useCountdown(targetISO) {
  const [left, setLeft] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
    done: false,
  });

  useEffect(() => {
    const target =
      new Date(`${targetISO}T00:00:00`).getTime();

    const tick = () => {
      const diff = target - Date.now();

      if (diff <= 0) {
        setLeft({
          d: 0,
          h: 0,
          m: 0,
          s: 0,
          done: true,
        });
        return;
      }

      const d = Math.floor(diff / 86400000);

      const h = Math.floor(
        (diff % 86400000) / 3600000
      );

      const m = Math.floor(
        (diff % 3600000) / 60000
      );

      const s = Math.floor(
        (diff % 60000) / 1000
      );

      setLeft({
        d,
        h,
        m,
        s,
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
   IMAGE COMPONENT
   -------------------------------------------------------------------------
   Provides a graceful fallback if an optional artwork hasn't been added.
========================================================================= */

function ArtImage({
  src,
  alt = '',
  className = '',
  style = {},
  draggable = false,
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={draggable}
      onError={() => setFailed(true)}
      className={className}
      style={{
        position: 'absolute',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}


/* =========================================================================
   TEMPLE BELL SVG
========================================================================= */

const TempleBell = ({
  size = 40,
  color = C.gold500,
  id = 'bell',
}) => (
  <svg
    viewBox="0 0 100 120"
    width={size}
    height={size * 1.2}
  >
    <defs>
      <linearGradient
        id={`bellGrad-${id}`}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor={C.gold700} />
        <stop offset="30%" stopColor={C.gold500} />
        <stop offset="55%" stopColor={C.gold300} />
        <stop offset="80%" stopColor={C.gold500} />
        <stop offset="100%" stopColor={C.gold700} />
      </linearGradient>
    </defs>

    <circle
      cx="50"
      cy="10"
      r="6.5"
      fill="none"
      stroke={`url(#bellGrad-${id})`}
      strokeWidth="4"
    />

    <rect
      x="46.5"
      y="15"
      width="7"
      height="7"
      rx="2"
      fill={`url(#bellGrad-${id})`}
    />

    <path
      d="M50 22
      C36 22 31 35 29 58
      C27.5 70 20 74 16.5 78
      C15.5 79.5 16.5 81.5 18.5 81.5
      L81.5 81.5
      C83.5 81.5 84.5 79.5 83.5 78
      C80 74 72.5 70 71 58
      C69 35 64 22 50 22 Z"
      fill={`url(#bellGrad-${id})`}
    />

    <ellipse
      cx="50"
      cy="75"
      rx="28"
      ry="3"
      fill="none"
      stroke={C.gold700}
      strokeWidth="1"
      opacity="0.6"
    />

    <ellipse
      cx="50"
      cy="81.5"
      rx="31"
      ry="4.2"
      fill={`url(#bellGrad-${id})`}
    />

    <circle
      cx="50"
      cy="88"
      r="5"
      fill={C.maroon900}
    />
  </svg>
);


/* =========================================================================
   HANGING BELLS
========================================================================= */

const HangingBellRow = ({ reduced }) => {

  const bells = [
    { size: 28, delay: 0.10 },
    { size: 24, delay: 0.30 },
    { size: 35, delay: 0.00 },
    { size: 24, delay: 0.45 },
    { size: 28, delay: 0.20 },
    { size: 22, delay: 0.55 },
    { size: 25, delay: 0.35 },
  ];

  /*
   * The reference has different rope lengths so the bells form an arch.
   */
  const ropeLengths = [
    82,
    66,
    48,
    66,
    82,
    96,
    76,
  ];

  return (
    <div
      className="
        flex
        items-start
        justify-center
        gap-[2px]
        sm:gap-2
      "
    >
      {bells.map((b, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center origin-top"
          animate={
            reduced
              ? {}
              : {
                rotate: [0, 3, -3, 0],
              }
          }
          transition={{
            repeat: Infinity,
            duration: 3.4 + i * 0.22,
            ease: 'easeInOut',
            delay: b.delay,
          }}
        >
          <div
            className="w-[2px]"
            style={{
              height: ropeLengths[i],
              background: `
                repeating-linear-gradient(
                  to bottom,
                  ${C.gold300} 0px,
                  ${C.gold300} 3px,
                  transparent 3px,
                  transparent 7px
                )
              `,
            }}
          />

          <TempleBell
            size={b.size}
            id={`hero-bell-${i}`}
          />
        </motion.div>
      ))}
    </div>
  );
};


/* =========================================================================
   MANGO LEAF TORAN
========================================================================= */

const MangoLeafToran = () => (
  <div className="flex items-start justify-center gap-[1px]">
    {[...Array(15)].map((_, i) => (
      <svg
        key={i}
        width="17"
        height="30"
        viewBox="0 0 16 28"
        style={{
          transform: `
            rotate(${(i - 7) * 3.2}deg)
            translateY(${Math.abs(i - 7) * 1.5}px)
          `,
        }}
      >
        <path
          d="
            M8 0
            C14 6 14 20 8 28
            C2 20 2 6 8 0 Z
          "
          fill={C.green700}
          stroke={C.green900}
          strokeWidth="0.6"
        />

        <line
          x1="8"
          y1="2"
          x2="8"
          y2="26"
          stroke={C.green900}
          strokeWidth="0.5"
          opacity="0.6"
        />
      </svg>
    ))}
  </div>
);


/* =========================================================================
   LOTUS
========================================================================= */

const LotusFlower = ({ size = 34 }) => (
  <svg
    viewBox="0 0 60 60"
    width={size}
    height={size}
  >
    {[0, 45, 90, 135, 180, 225, 270, 315].map(
      (deg) => (
        <ellipse
          key={deg}
          cx="30"
          cy="30"
          rx="8"
          ry="18"
          fill={C.terracotta}
          opacity="0.85"
          transform={`rotate(${deg} 30 30)`}
        />
      )
    )}

    <circle
      cx="30"
      cy="30"
      r="7"
      fill={C.gold500}
    />
  </svg>
);


/* =========================================================================
   DIYA
========================================================================= */

const DiyaFlame = ({ reduced }) => (
  <svg
    viewBox="0 0 30 40"
    width="22"
    height="30"
  >
    <path
      d="M4 30 C2 20 26 20 24 30 C24 34 4 34 4 30 Z"
      fill={C.gold700}
    />

    <motion.path
      d="
        M15 6
        C10 14 10 20 15 24
        C20 20 20 14 15 6 Z
      "
      fill={C.terracotta}
      animate={
        reduced
          ? {}
          : {
            scaleY: [1, 1.12, 0.95, 1.05, 1],
            scaleX: [1, 0.94, 1.05, 0.97, 1],
          }
      }
      transition={{
        repeat: Infinity,
        duration: 1.6,
        ease: 'easeInOut',
      }}
      style={{
        transformOrigin: '15px 24px',
      }}
    />
  </svg>
);


/* =========================================================================
   GANESHA MEDALLION FALLBACK
========================================================================= */

const GaneshaMedallion = ({
  size = 150,
}) => (
  <svg
    viewBox="0 0 200 200"
    width={size}
    height={size}
  >
    <defs>
      <linearGradient
        id="medGold"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop
          offset="0%"
          stopColor={C.gold300}
        />
        <stop
          offset="100%"
          stopColor={C.gold700}
        />
      </linearGradient>
    </defs>

    <circle
      cx="100"
      cy="100"
      r="96"
      fill={C.cream50}
      stroke="url(#medGold)"
      strokeWidth="2"
      strokeDasharray="2 4"
    />

    <circle
      cx="100"
      cy="100"
      r="86"
      fill="none"
      stroke="url(#medGold)"
      strokeWidth="2.5"
    />

    {[...Array(20)].map((_, i) => {
      const a = (i / 20) * Math.PI * 2;

      const x =
        100 + Math.cos(a) * 90;

      const y =
        100 + Math.sin(a) * 90;

      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="2.2"
          fill={C.gold500}
        />
      );
    })}

    <g
      stroke={C.maroon800}
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M78 60 L100 40 L122 60" />

      <circle
        cx="100"
        cy="38"
        r="5"
        fill={C.maroon800}
      />

      <path d="M70 76 C50 70 48 92 66 98" />
      <path d="M130 76 C150 70 152 92 134 98" />

      <path
        d="
          M74 70
          C74 100 80 118 100 118
          C108 118 114 114 114 106
          C114 98 106 96 102 100
          C98 104 100 112 108 114
          C118 117 124 108 122 96
          C120 80 110 70 100 70
          C90 70 74 70 74 70 Z
        "
      />

      <path
        d="M96 108 L90 118"
        strokeWidth="2"
      />

      <circle
        cx="88"
        cy="82"
        r="2.6"
        fill={C.maroon800}
      />

      <circle
        cx="112"
        cy="82"
        r="2.6"
        fill={C.maroon800}
      />

      <line
        x1="100"
        y1="68"
        x2="100"
        y2="76"
        stroke={C.terracotta}
        strokeWidth="3"
      />
    </g>
  </svg>
);


/* =========================================================================
   DECORATIVE CORNER
========================================================================= */

const MandalaCorner = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 60 60"
    width="34"
    height="34"
    className={className}
  >
    <path
      d="M2 2 L2 20 M2 2 L20 2"
      stroke={C.gold500}
      strokeWidth="1.5"
      fill="none"
    />

    <circle
      cx="2"
      cy="2"
      r="3"
      fill="none"
      stroke={C.gold500}
      strokeWidth="1.2"
    />
  </svg>
);


/* =========================================================================
   FALLING PETALS
========================================================================= */

const PetalField = ({ reduced }) => {

  const petals = useMemo(
    () =>
      [...Array(22)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 7 + Math.random() * 8,
        delay: Math.random() * 6,
        scale: 0.5 + Math.random() * 0.8,
        rotate: Math.random() * 90,
      })),
    []
  );

  if (reduced) return null;

  return (
    <div
      className="
        fixed
        inset-0
        pointer-events-none
        z-40
        overflow-hidden
      "
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute animate-falling-petal"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `scale(${p.scale})`,
          }}
        >
          <div
            className="
              w-3
              h-4
              rounded-tl-full
              rounded-br-full
              rotate-45
              blur-[0.5px]
            "
            style={{
              background: `${C.terracotta}66`,
            }}
          />
        </div>
      ))}
    </div>
  );
};


/* =========================================================================
   REVEAL PANEL
========================================================================= */

const RevealPanel = ({
  children,
  className = '',
  reduced,
}) => {

  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0.3,
    },

    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.4,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={
        reduced
          ? false
          : 'hidden'
      }
      whileInView={
        reduced
          ? undefined
          : 'visible'
      }
      viewport={{
        once: true,
        amount: 0.3,
      }}
    >

      {!reduced && (
        <svg
          className="
            absolute
            inset-0
            w-full
            h-full
            pointer-events-none
            z-10
          "
          preserveAspectRatio="none"
        >
          <motion.rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            fill="none"
            stroke={C.gold500}
            strokeWidth="1.5"
            variants={pathVariants}
          />
        </svg>
      )}

      {children}
    </motion.div>
  );
};


/* =========================================================================
   REALISTIC INVITATION HERO
   -------------------------------------------------------------------------
   This is the major change from the original version.

   It creates the "physical invitation card" look from the reference:
   paper -> damask -> arch -> pillars -> canopy -> bells -> Ganesh -> water.
========================================================================= */

function InvitationStage({
  reduced,
  openInvitation,
}) {

  return (
    <section
      className="
        relative
        min-h-screen
        flex
        items-center
        justify-center
        px-2
        sm:px-4
        py-8
        overflow-hidden
      "
      style={{
        background: `
          radial-gradient(
            circle at 50% 35%,
            ${C.cream50} 0%,
            ${C.cream100} 55%,
            #E8D4A8 100%
          )
        `,
      }}
    >

      {/* ===============================================================
          OUTER SHADOW / CARD
      =============================================================== */}

      <div
        className="
          relative
          w-full
          max-w-[720px]
          min-h-[780px]
          sm:min-h-[900px]
          md:min-h-[1100px]
          overflow-hidden
        "
        style={{
          background: C.cream50,

          boxShadow: `
            0 0 0 3px ${C.gold700},
            0 0 0 6px ${C.cream50},
            0 0 0 7px ${C.gold500},
            0 0 0 12px ${C.cream50},
            0 0 0 13px ${C.gold500}60,
            0 30px 80px rgba(40,10,10,.28),
            0 8px 25px rgba(40,10,10,.16)
          `,

          border: `3px solid ${C.gold500}`,
        }}
      >

        {/* ── Traditional inner dashed border ── */}
        <div
          className="absolute pointer-events-none z-[25]"
          style={{
            inset: '12px',
            border: `1px dashed ${C.gold500}90`,
            borderRadius: 2,
          }}
        />

        {/* ── Corner ornament top-left ── */}
        <svg className="absolute top-[6px] left-[6px] z-[26]" width="36" height="36" viewBox="0 0 36 36">
          <path d="M4 4 L4 18 M4 4 L18 4" stroke={C.gold500} strokeWidth="2" fill="none" />
          <circle cx="4" cy="4" r="3" fill="none" stroke={C.gold500} strokeWidth="1.5" />
          <circle cx="4" cy="4" r="1.2" fill={C.gold500} />
        </svg>

        {/* ── Corner ornament top-right ── */}
        <svg className="absolute top-[6px] right-[6px] z-[26] rotate-90" width="36" height="36" viewBox="0 0 36 36">
          <path d="M4 4 L4 18 M4 4 L18 4" stroke={C.gold500} strokeWidth="2" fill="none" />
          <circle cx="4" cy="4" r="3" fill="none" stroke={C.gold500} strokeWidth="1.5" />
          <circle cx="4" cy="4" r="1.2" fill={C.gold500} />
        </svg>

        {/* ── Corner ornament bottom-right ── */}
        <svg className="absolute bottom-[6px] right-[6px] z-[26] rotate-180" width="36" height="36" viewBox="0 0 36 36">
          <path d="M4 4 L4 18 M4 4 L18 4" stroke={C.gold500} strokeWidth="2" fill="none" />
          <circle cx="4" cy="4" r="3" fill="none" stroke={C.gold500} strokeWidth="1.5" />
          <circle cx="4" cy="4" r="1.2" fill={C.gold500} />
        </svg>

        {/* ── Corner ornament bottom-left ── */}
        <svg className="absolute bottom-[6px] left-[6px] z-[26] -rotate-90" width="36" height="36" viewBox="0 0 36 36">
          <path d="M4 4 L4 18 M4 4 L18 4" stroke={C.gold500} strokeWidth="2" fill="none" />
          <circle cx="4" cy="4" r="3" fill="none" stroke={C.gold500} strokeWidth="1.5" />
          <circle cx="4" cy="4" r="1.2" fill={C.gold500} />
        </svg>

        {/* =============================================================
            PAPER TEXTURE
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Optional parchment texture.

            Example:
            /assets/art/paper-texture.webp
        */}

        <ArtImage
          src={ART.paperTexture}
          alt=""
          className="inset-0 w-full h-full object-cover opacity-20"
        />


        {/* =============================================================
            DAMASK BACKGROUND
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Add a very subtle damask pattern here.
        */}

        <ArtImage
          src={ART.damask}
          alt=""
          className="
            inset-0
            w-full
            h-full
            object-cover
            opacity-[0.12]
          "
        />


        {/* =============================================================
            TOP GOLD LINE
        ============================================================= */}

        <div
          className="
            absolute
            top-0
            left-0
            right-0
            h-2
            z-20
          "
          style={{
            background: `
              linear-gradient(
                90deg,
                ${C.gold700},
                ${C.gold300},
                ${C.gold700}
              )
            `,
          }}
        />


        {/* =============================================================
            TEMPLE DOME
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Decorative dome/crown artwork.
        */}

        <ArtImage
          src={ART.dome}
          alt=""
          className="
            top-0
            left-1/2
            -translate-x-1/2
            w-[72%]
            max-w-[480px]
            z-[3]
          "
          style={{
            height: 'auto',
          }}
        />


        {/* =============================================================
            ARCH
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Main decorative arch.
        */}

        <ArtImage
          src={ART.arch}
          alt=""
          className="
            top-[5%]
            left-1/2
            -translate-x-1/2
            w-[94%]
            max-w-[680px]
            z-[4]
          "
        />


        {/* =============================================================
            LEFT PILLAR
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Left architectural pillar.
        */}

        <ArtImage
          src={ART.pillarLeft}
          alt=""
          className="
            left-[-1%]
            top-[15%]
            w-[22%]
            z-[6]
          "
        />


        {/* =============================================================
            RIGHT PILLAR
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Right architectural pillar.
        */}

        <ArtImage
          src={ART.pillarRight}
          alt=""
          className="
            right-[-1%]
            top-[15%]
            w-[22%]
            z-[6]
          "
        />


        {/* =============================================================
            LEFT CREEPER
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Decorative hanging creeper.
        */}

        <motion.div
          className="
            absolute
            left-0
            top-[12%]
            w-[22%]
            h-[38%]
            z-[8]
            pointer-events-none
          "
          animate={
            reduced
              ? {}
              : {
                y: [0, 4, 0],
                rotate: [0, 0.7, 0],
              }
          }
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: 'easeInOut',
          }}
        >
          <ArtImage
            src={ART.creeper}
            alt=""
            className="inset-0 w-full h-full object-contain"
          />
        </motion.div>


        {/* =============================================================
            RIGHT CREEPER
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Mirrored decorative creeper.
        */}

        <motion.div
          className="
            absolute
            right-0
            top-[12%]
            w-[22%]
            h-[38%]
            z-[8]
            pointer-events-none
          "
          animate={
            reduced
              ? {}
              : {
                y: [0, -4, 0],
                rotate: [0, -0.7, 0],
              }
          }
          transition={{
            repeat: Infinity,
            duration: 5.7,
            ease: 'easeInOut',
          }}
        >
          <ArtImage
            src={ART.creeperFlip}
            alt=""
            className="inset-0 w-full h-full object-contain"
          />
        </motion.div>


        {/* =============================================================
            TORAN
        ============================================================= */}

        <div
          className="
            absolute
            top-[14%]
            left-1/2
            -translate-x-1/2
            z-20
            w-[88%]
          "
        >
          <MangoLeafToran />
        </div>


        {/* =============================================================
            HANGING BELL ARCH
        ============================================================= */}

        <div
          className="
            absolute
            top-[17%]
            left-1/2
            -translate-x-1/2
            z-20
            w-full
          "
        >
          <HangingBellRow reduced={reduced} />
        </div>


        {/* =============================================================
            CENTER CONTENT
        ============================================================= */}

        <div
          className="
            absolute
            top-[29%]
            left-1/2
            -translate-x-1/2
            w-[84%]
            max-w-[520px]
            z-30
            text-center
          "
        >

          <motion.p
            initial={
              reduced
                ? false
                : {
                  opacity: 0,
                  y: -10,
                }
            }
            animate={
              reduced
                ? {}
                : {
                  opacity: 1,
                  y: 0,
                }
            }
            transition={{
              delay: 0.25,
              duration: 0.8,
            }}
            className="font-deva text-lg md:text-xl"
            style={{
              color: C.maroon800,
            }}
          >
            ॥ श्री गणेशाय नमः ॥
          </motion.p>


          <div className="mt-3 flex items-center justify-center gap-3">
            <span
              className="h-px w-12"
              style={{
                background: C.gold500,
              }}
            />

            <Sparkles
              className="w-4 h-4"
              style={{
                color: C.gold500,
              }}
            />

            <span
              className="h-px w-12"
              style={{
                background: C.gold500,
              }}
            />
          </div>


          {/* =========================================================
              GANESHA IMAGE
          ========================================================= */}

          <motion.div
            className="
              relative
              mx-auto
              mt-6
              w-[230px]
              h-[260px]
              sm:w-[270px]
              sm:h-[300px]
            "
            initial={
              reduced
                ? false
                : {
                  opacity: 0,
                  scale: 0.92,
                }
            }
            animate={
              reduced
                ? {}
                : {
                  opacity: 1,
                  scale: 1,
                }
            }
            transition={{
              delay: 0.35,
              duration: 1,
            }}
          >

            {/* ADD IMAGE LINK:
                YOUR MAIN GANESHA / BAPPA IMAGE.

                Recommended transparent WebP/PNG.

                This is the most important image in the entire
                invitation.
            */}

            {ART.ganesha ? (
              <img
                src={ART.ganesha}
                alt="Lord Ganesha"
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-contain
                  drop-shadow-[0_18px_18px_rgba(70,20,10,.22)]
                "
              />
            ) : (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                "
              >
                <GaneshaMedallion size={230} />
              </div>
            )}

          </motion.div>


          {/* =========================================================
              TITLE
          ========================================================= */}

          <motion.h1
            initial={
              reduced
                ? false
                : {
                  opacity: 0,
                  y: 15,
                }
            }
            animate={
              reduced
                ? {}
                : {
                  opacity: 1,
                  y: 0,
                }
            }
            transition={{
              delay: 0.55,
              duration: 0.9,
            }}
            className="
              font-script
              text-5xl
              sm:text-6xl
              md:text-7xl
              leading-none
            "
            style={{
              color: C.maroon800,
              textShadow:
                `0 2px 0 ${C.gold300}80`,
            }}
          >
            Ganesh Chaturthi
          </motion.h1>


          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              mt-5
            "
          >
            <span
              className="h-px w-8 sm:w-12"
              style={{
                background: C.gold500,
              }}
            />

            <p
              className="
                font-label
                text-[9px]
                sm:text-[11px]
              "
              style={{
                color: C.maroon800,
              }}
            >
              {EVENT.startLabel}
            </p>

            <span
              className="h-px w-8 sm:w-12"
              style={{
                background: C.gold500,
              }}
            />
          </div>


          <p
            className="
              font-deva
              mt-4
              text-base
              sm:text-lg
            "
            style={{
              color: C.maroon700,
            }}
          >
            मंगलमूर्ति मोरया
          </p>

        </div>


        {/* =============================================================
            LEFT ELEPHANT
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Optional decorative elephant.
        */}

        <motion.div
          className="
            absolute
            left-[3%]
            bottom-[17%]
            w-[25%]
            z-20
          "
          animate={
            reduced
              ? {}
              : {
                y: [0, -5, 0],
              }
          }
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: 'easeInOut',
          }}
        >
          <ArtImage
            src={ART.elephant}
            alt=""
            className="relative w-full h-auto"
          />
        </motion.div>


        {/* =============================================================
            RIGHT ELEPHANT
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Mirrored decorative elephant.
        */}

        <motion.div
          className="
            absolute
            right-[3%]
            bottom-[17%]
            w-[25%]
            z-20
          "
          animate={
            reduced
              ? {}
              : {
                y: [0, -4, 0],
              }
          }
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: 'easeInOut',
          }}
        >
          <ArtImage
            src={ART.elephantFlip}
            alt=""
            className="relative w-full h-auto"
          />
        </motion.div>


        {/* =============================================================
            WATER / LOWER DECORATION
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Decorative water/ripple layer.
        */}

        <ArtImage
          src={ART.water}
          alt=""
          className="
            bottom-0
            left-0
            w-full
            z-10
          "
        />


        {/* =============================================================
            LOTUS
        ============================================================= */}

        {/* ADD IMAGE LINK:
            Lotus artwork.
        */}

        <ArtImage
          src={ART.lotus}
          alt=""
          className="
            bottom-[5%]
            left-1/2
            -translate-x-1/2
            w-[25%]
            max-w-[150px]
            z-20
          "
        />


        {/* =============================================================
            INVITATION MESSAGE
        ============================================================= */}

        <div
          className="
            absolute
            bottom-[5%]
            left-1/2
            -translate-x-1/2
            z-30
            w-[82%]
            text-center
          "
        >
          <p
            className="
              font-script
              text-2xl
              sm:text-3xl
            "
            style={{
              color: C.maroon800,
            }}
          >
            You are lovingly invited
          </p>

          <p
            className="
              mt-1
              text-sm
              sm:text-base
            "
          >
            by {EVENT.hosts}
          </p>
        </div>

      </div>


      {/* ===============================================================
          SCROLL INDICATOR
      =============================================================== */}

      <motion.div
        animate={
          reduced
            ? {}
            : {
              y: [0, 7, 0],
            }
        }
        transition={{
          repeat: Infinity,
          duration: 1.8,
        }}
        className="
          absolute
          bottom-5
          left-1/2
          -translate-x-1/2
          z-40
          flex
          flex-col
          items-center
        "
      >
        <div
          className="
            px-4
            py-1
            rounded-full
            border
            text-xs
            backdrop-blur-sm
          "
          style={{
            borderColor: `${C.maroon800}40`,
            background: `${C.ivory}dd`,
            color: C.maroon800,
          }}
        >
          scroll · नीचे देखिए
        </div>

        <ChevronDown
          className="w-4 h-4 mt-1"
          style={{
            color: C.maroon800,
          }}
        />
      </motion.div>

    </section>
  );
}


/* =========================================================================
   MAIN COMPONENT
========================================================================= */

export default function GaneshChaturthiInvitation() {

  const reduced = usePrefersReducedMotion();

  const [curtainOpen, setCurtainOpen] =
    useState(false);

  const [musicOn, setMusicOn] =
    useState(false);

  const [audioReady, setAudioReady] =
    useState(false);

  const [copied, setCopied] =
    useState(false);


  /* ================================================================
     RSVP
  ================================================================ */

  const [name, setName] =
    useState('');

  const [guests, setGuests] =
    useState(1);

  const [attending, setAttending] =
    useState('yes');

  const [message, setMessage] =
    useState('');

  const [rsvps, setRsvps] =
    useState([]);

  const [rsvpLoading, setRsvpLoading] =
    useState(true);

  const [rsvpSubmitting, setRsvpSubmitting] =
    useState(false);

  const [rsvpError, setRsvpError] =
    useState(false);

  const [rsvpDone, setRsvpDone] =
    useState(false);


  /* ================================================================
     AUDIO REFS
  ================================================================ */

  const bellSynth =
    useRef(null);

  const droneLoop =
    useRef(null);

  const reverb =
    useRef(null);

  const droneSynth =
    useRef(null);


  /* ================================================================
     COUNTDOWN
  ================================================================ */

  const countdown =
    useCountdown(EVENT.startISO);


  /* ================================================================
     LOAD RSVP
  ================================================================ */

  useEffect(() => {

    (async () => {

      try {

        if (
          typeof window === 'undefined' ||
          !window.storage
        ) {
          setRsvps([]);
          return;
        }

        const res =
          await window.storage.get(
            'rsvp-responses',
            true
          );

        setRsvps(
          res?.value
            ? JSON.parse(res.value)
            : []
        );

      } catch (e) {

        setRsvps([]);

      } finally {

        setRsvpLoading(false);

      }

    })();

  }, []);


  /* ================================================================
     RSVP SUBMISSION
  ================================================================ */

  const submitRSVP = async (e) => {

    e.preventDefault();

    if (!name.trim()) return;

    setRsvpSubmitting(true);
    setRsvpError(false);

    const entry = {
      name: name.trim(),
      attending,
      guests:
        attending === 'yes'
          ? Number(guests) || 1
          : 0,
      message: message.trim(),
      ts: Date.now(),
    };

    try {

      const updated = [
        ...rsvps,
        entry,
      ];

      if (
        typeof window === 'undefined' ||
        !window.storage
      ) {
        throw new Error(
          'Storage unavailable'
        );
      }

      const res =
        await window.storage.set(
          'rsvp-responses',
          JSON.stringify(updated),
          true
        );

      if (!res) {
        throw new Error(
          'write failed'
        );
      }

      setRsvps(updated);
      setRsvpDone(true);

    } catch (err) {

      setRsvpError(true);

    } finally {

      setRsvpSubmitting(false);

    }
  };


  const joiningCount =
    rsvps
      .filter(
        (r) => r.attending === 'yes'
      )
      .reduce(
        (s, r) =>
          s + (Number(r.guests) || 1),
        0
      );


  /* ================================================================
     AUDIO INITIALIZATION
  ================================================================ */

  const initAudio =
    useCallback(
      async () => {

        if (audioReady) return;

        await Tone.start();

        reverb.current =
          new Tone.Reverb({
            decay: 4,
            wet: 0.35,
          }).toDestination();

        bellSynth.current =
          new Tone.MetalSynth({
            envelope: {
              attack: 0.001,
              decay: 1.2,
              release: 0.4,
            },

            harmonicity: 5.1,

            modulationIndex: 16,

            resonance: 800,

            octaves: 1.2,

          }).connect(
            reverb.current
          );

        bellSynth.current.volume.value =
          -16;


        droneSynth.current =
          new Tone.FMSynth({

            harmonicity: 2,

            modulationIndex: 3,

            envelope: {
              attack: 2,
              decay: 1,
              sustain: 0.6,
              release: 3,
            },

          }).connect(
            reverb.current
          );

        droneSynth.current.volume.value =
          -24;


        droneLoop.current =
          new Tone.Loop(
            (time) => {

              bellSynth.current?.triggerAttackRelease(
                'C6',
                '4n',
                time
              );

              droneSynth.current?.triggerAttackRelease(
                'C3',
                '2n',
                time + 0.1
              );

            },
            3.2
          );


        Tone.Transport.bpm.value =
          60;

        setAudioReady(true);

      },
      [audioReady]
    );


  /* ================================================================
     SINGLE BELL
  ================================================================ */

  const ringBellOnce =
    useCallback(
      async () => {

        await initAudio();

        bellSynth.current?.triggerAttackRelease(
          'E6',
          '2n'
        );

      },
      [initAudio]
    );


  /* ================================================================
     MUSIC TOGGLE
  ================================================================ */

  const toggleMusic =
    useCallback(
      async () => {

        await initAudio();

        if (musicOn) {

          Tone.Transport.stop();

          droneLoop.current?.stop(0);

          setMusicOn(false);

        } else {

          droneLoop.current?.start(0);

          Tone.Transport.start();

          setMusicOn(true);

        }

      },
      [musicOn, initAudio]
    );


  /* ================================================================
     OPEN INVITATION
  ================================================================ */

  const openInvitation =
    async () => {

      setCurtainOpen(true);

      await ringBellOnce();

      if (!musicOn) {
        await toggleMusic();
      }

    };


  /* ================================================================
     CLEANUP AUDIO
  ================================================================ */

  useEffect(() => {

    return () => {

      try {

        Tone.Transport.stop();

        droneLoop.current?.dispose();

        bellSynth.current?.dispose();

        droneSynth.current?.dispose();

        reverb.current?.dispose();

      } catch (_) { }

    };

  }, []);


  /* ================================================================
     CALENDAR
  ================================================================ */

  const downloadICS = () => {

    const fmt = (iso) =>
      iso.replace(/-/g, '');

    const endExclusive =
      new Date(
        `${EVENT.endISO}T00:00:00`
      );

    endExclusive.setDate(
      endExclusive.getDate() + 1
    );

    const endStr =
      endExclusive
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

    const ics = [

      'BEGIN:VCALENDAR',

      'VERSION:2.0',

      'PRODID:-//Ganesh Chaturthi Invitation//EN',

      'BEGIN:VEVENT',

      `DTSTART;VALUE=DATE:${fmt(
        EVENT.startISO
      )}`,

      `DTEND;VALUE=DATE:${endStr}`,

      'SUMMARY:Ganesh Chaturthi Darshan',

      `LOCATION:${ADDRESS_TEXT}`,

      `DESCRIPTION:Hosted by ${EVENT.hosts}. Come for darshan\\, prasad and celebration.`,

      'END:VEVENT',

      'END:VCALENDAR',

    ].join('\r\n');

    const blob =
      new Blob(
        [ics],
        {
          type: 'text/calendar',
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      'ganesh-chaturthi.ics';

    a.click();

    URL.revokeObjectURL(url);
  };


  /* ================================================================
     SHARE
  ================================================================ */

  const shareInvite =
    async () => {

      const shareData = {

        title:
          'Ganesh Chaturthi Invitation',

        text:
          `${EVENT.hosts} invite you for Ganesh Chaturthi darshan, ${EVENT.startLabel}.`,

        url:
          typeof window !== 'undefined'
            ? window.location.href
            : '',

      };

      try {

        if (navigator.share) {

          await navigator.share(
            shareData
          );

        } else {

          await navigator.clipboard.writeText(
            shareData.url ||
            shareData.text
          );

          setCopied(true);

          setTimeout(
            () =>
              setCopied(false),
            2000
          );
        }

      } catch (_) { }

    };


  return (

    <div
      className="
        min-h-screen
        relative
        overflow-x-hidden
      "
      style={{
        background: C.cream50,
        color: C.ink,
        fontFamily:
          "'Cormorant Garamond', serif",
      }}
    >

      {/* =============================================================
          GLOBAL CSS
      ============================================================= */}

      <style>{`

        @import url('${FONT_IMPORT_URL}');

        .font-script {
          font-family: 'Parisienne', cursive;
        }

        .font-label {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.12em;
        }

        .font-deva {
          font-family:
            'Tiro Devanagari Hindi',
            serif;
        }

        @keyframes falling-petal {

          0% {
            transform:
              translateY(-10vh)
              rotate(0deg);

            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          100% {

            transform:
              translateY(105vh)
              rotate(360deg);

            opacity: 0;
          }

        }

        .animate-falling-petal {
          animation:
            falling-petal linear infinite;
        }

        input,
        textarea,
        button {
          font-family:
            'Cormorant Garamond',
            serif;
        }

        button,
        a {
          -webkit-tap-highlight-color:
            transparent;
        }

        .invitation-paper {
          background-image:
            radial-gradient(
              rgba(100, 55, 20, .045)
              0.7px,
              transparent 0.7px
            );

          background-size:
            7px 7px;
        }

        .gold-glow {
          box-shadow:
            0 0 35px
            rgba(201,162,75,.25);
        }

        @media (max-width: 640px) {

          .mobile-stage {
            min-height:
              780px;
          }

        }

      `}</style>


      {/* =============================================================
          OPENING CURTAINS
      ============================================================= */}

      <AnimatePresence>

        {!curtainOpen && (

          <motion.div
            key="curtain"
            initial={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.5,
                delay: 1,
              },
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              overflow-hidden
            "
          >

            {/* =======================================================
                LEFT CURTAIN
            ======================================================= */}

            <motion.div
              initial={{
                x: 0,
              }}
              exit={{
                x: '-100%',
                transition: {
                  duration: 1.25,
                  ease: [
                    0.77,
                    0,
                    0.175,
                    1,
                  ],
                },
              }}
              className="
                w-1/2
                h-full
                relative
              "
              style={{
                background: `
                  linear-gradient(
                    90deg,
                    #170006 0%,
                    #520915 30%,
                    #78152B 50%,
                    #3B0610 75%,
                    #120004 100%
                  )
                `,

                boxShadow:
                  '25px 0 45px rgba(0,0,0,.85)',
              }}
            >

              <div
                className="
                  absolute
                  top-0
                  bottom-0
                  right-0
                  w-2.5
                "
                style={{
                  background: `
                    linear-gradient(
                      ${C.gold700},
                      ${C.gold300},
                      ${C.gold700}
                    )
                  `,
                }}
              />

            </motion.div>


            {/* =======================================================
                RIGHT CURTAIN
            ======================================================= */}

            <motion.div
              initial={{
                x: 0,
              }}
              exit={{
                x: '100%',
                transition: {
                  duration: 1.25,
                  ease: [
                    0.77,
                    0,
                    0.175,
                    1,
                  ],
                },
              }}
              className="
                w-1/2
                h-full
                relative
              "
              style={{
                background: `
                  linear-gradient(
                    270deg,
                    #170006 0%,
                    #520915 30%,
                    #78152B 50%,
                    #3B0610 75%,
                    #120004 100%
                  )
                `,

                boxShadow:
                  '-25px 0 45px rgba(0,0,0,.85)',
              }}
            >

              <div
                className="
                  absolute
                  top-0
                  bottom-0
                  left-0
                  w-2.5
                "
                style={{
                  background: `
                    linear-gradient(
                      ${C.gold700},
                      ${C.gold300},
                      ${C.gold700}
                    )
                  `,
                }}
              />

            </motion.div>


            {/* =======================================================
                CENTER OPEN BUTTON
            ======================================================= */}

            <motion.div
              initial={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.25,
                },
              }}
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
                z-10
                px-5
              "
            >

              <motion.div
                initial={{
                  y: -18,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="
                  border
                  px-6
                  py-2
                  rounded-sm
                "
                style={{
                  background:
                    'rgba(30,0,6,.86)',
                  borderColor:
                    `${C.gold500}90`,
                }}
              >

                <h2
                  className="
                    font-deva
                    text-lg
                    sm:text-2xl
                  "
                  style={{
                    color:
                      C.gold300,
                  }}
                >
                  ॥ श्री गणेशाय नमः ॥
                </h2>

              </motion.div>


              <motion.button
                type="button"
                onClick={openInvitation}
                whileHover={{
                  scale: 1.06,
                }}
                whileTap={{
                  scale: 0.93,
                }}
                className="
                  rounded-full
                  p-5
                  mt-8
                  focus:outline-none
                "
                style={{
                  boxShadow:
                    `0 0 65px ${C.gold500}55`,

                  background:
                    'rgba(35,0,7,.92)',

                  border:
                    `2px solid ${C.gold500}`,
                }}
                aria-label="Tap to open invitation"
              >

                <motion.div
                  animate={
                    reduced
                      ? {}
                      : {
                        rotate: [
                          0,
                          5,
                          -5,
                          0,
                        ],
                      }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                >
                  <TempleBell
                    size={85}
                    id="opening-bell"
                  />
                </motion.div>

              </motion.button>


              <motion.div
                initial={{
                  y: 16,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="
                  text-center
                  border
                  px-6
                  py-2.5
                  rounded-sm
                  mt-6
                "
                style={{
                  background:
                    'rgba(30,0,6,.86)',

                  borderColor:
                    `${C.gold500}90`,
                }}
              >

                <p
                  className="
                    font-label
                    text-sm
                  "
                  style={{
                    color:
                      C.gold300,
                  }}
                >
                  घंटी बजाइए
                </p>

                <p
                  className="
                    font-label
                    text-[9px]
                    mt-1
                  "
                  style={{
                    color:
                      C.gold500,
                  }}
                >
                  TAP THE BELL TO OPEN
                </p>

              </motion.div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>


      {/* =============================================================
          FALLING PETALS
      ============================================================= */}

      <PetalField reduced={reduced} />


      {/* =============================================================
          FLOATING MUSIC CONTROL
      ============================================================= */}

      <div
        className="
          fixed
          bottom-5
          right-5
          z-50
        "
      >

        <button
          onClick={toggleMusic}
          className="
            p-3.5
            rounded-full
            shadow-xl
            border-2
            flex
            items-center
            justify-center
            transition-transform
            hover:scale-110
            active:scale-95
          "
          style={{
            background:
              C.maroon800,

            color:
              C.gold300,

            borderColor:
              C.gold500,
          }}
          aria-label="Toggle music"
        >

          {musicOn ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX
              className="
                w-5
                h-5
                opacity-80
              "
            />
          )}

        </button>

      </div>


      {/* =============================================================
          MAIN ILLUSTRATED HERO
      ============================================================= */}

      <InvitationStage
        reduced={reduced}
        openInvitation={openInvitation}
      />


      {/* =============================================================
          SHLOKA
      ============================================================= */}

      <section
        className="
          relative
          mx-3
          md:mx-auto
          max-w-3xl
          my-12
          rounded-sm
          overflow-hidden
        "
        style={{
          background:
            C.maroon900,
        }}
      >

        <div
          className="
            flex
            flex-col
            md:flex-row
            items-center
            gap-6
            md:gap-10
            py-14
            px-6
            md:px-12
          "
        >

          <div className="shrink-0">

            {/* ADD IMAGE LINK:
                Optional small Ganesha portrait/medallion.
            */}

            <GaneshaMedallion size={145} />

          </div>


          <div
            className="
              text-center
              md:text-left
            "
            style={{
              color:
                C.gold300,
            }}
          >

            <h2
              className="
                font-deva
                text-xl
                md:text-3xl
                leading-relaxed
              "
            >
              ॥ वक्रतुण्ड महाकाय
              सूर्यकोटि समप्रभ ॥
            </h2>

            <h2
              className="
                font-deva
                text-xl
                md:text-3xl
                leading-relaxed
                mt-2
              "
            >
              ॥ निर्विघ्नं कुरु मे देव
              सर्वकार्येषु सर्वदा ॥
            </h2>

            <p
              className="
                mt-6
                text-sm
                md:text-base
                italic
              "
              style={{
                color:
                  `${C.cream100}cc`,
              }}
            >
              "O Lord with the twisted trunk and
              massive body, whose radiance equals
              a million suns — keep every undertaking
              of ours free from obstacles, always."
            </p>

          </div>

        </div>

      </section>


      {/* =============================================================
          INVITATION MESSAGE
      ============================================================= */}

      <RevealPanel
        reduced={reduced}
        className="
          mx-3
          md:mx-auto
          max-w-2xl
          my-12
        "
      >

        <div
          className="
            text-center
            py-14
            px-6
            md:px-14
          "
          style={{
            background:
              C.ivory,
          }}
        >

          <div
            className="
              font-deva
              text-lg
              mb-3
            "
            style={{
              color:
                C.gold500,
            }}
          >
            ॐ
          </div>

          <p
            className="
              font-label
              text-xs
              mb-4
            "
            style={{
              color:
                C.maroon700,
            }}
          >
            {EVENT.startLabel}
          </p>

          <h2
            className="
              font-script
              text-4xl
              md:text-5xl
              mb-5
            "
            style={{
              color:
                C.maroon800,
            }}
          >
            A Joyful Darshan Awaits
          </h2>

          <p
            className="
              text-base
              md:text-lg
              leading-relaxed
              max-w-lg
              mx-auto
            "
          >
            {EVENT.hosts} cordially invite you
            and your family for the auspicious
            darshan of Lord Ganesha.
          </p>

          <div
            className="
              my-7
              py-3
              border-y
              max-w-md
              mx-auto
            "
            style={{
              borderColor:
                `${C.gold500}70`,
            }}
          >

            <p
              className="
                font-label
                text-[10px]
                md:text-xs
              "
              style={{
                color:
                  C.maroon800,
              }}
            >
              BAPPA WILL GRACE OUR HOME
              FOR FIVE BLESSED DAYS
            </p>

          </div>

          <p
            className="
              font-script
              text-2xl
              md:text-3xl
            "
            style={{
              color:
                C.maroon800,
            }}
          >
            Come, seek blessings, share prasad
            and celebrate with us.
          </p>

        </div>

      </RevealPanel>


      {/* =============================================================
          COUNTDOWN
      ============================================================= */}

      <RevealPanel
        reduced={reduced}
        className="
          mx-3
          md:mx-auto
          max-w-2xl
          my-12
        "
      >

        <div
          className="
            text-center
            py-12
            px-6
          "
          style={{
            background:
              C.cream100,
          }}
        >

          <p
            className="
              font-label
              text-xs
              mb-5
            "
            style={{
              color:
                C.maroon700,
            }}
          >
            COUNTING DOWN TO THE CELEBRATION
          </p>


          {countdown.done ? (

            <p
              className="
                font-script
                text-3xl
              "
              style={{
                color:
                  C.maroon800,
              }}
            >
              Bappa has arrived —
              Ganpati Bappa Morya!
            </p>

          ) : (

            <div
              className="
                grid
                grid-cols-4
                gap-2
                sm:gap-4
                max-w-md
                mx-auto
              "
            >

              {[
                {
                  v: countdown.d,
                  l: 'days',
                },

                {
                  v: countdown.h,
                  l: 'hrs',
                },

                {
                  v: countdown.m,
                  l: 'min',
                },

                {
                  v: countdown.s,
                  l: 'sec',
                },

              ].map((u) => (

                <div
                  key={u.l}
                  className="
                    flex
                    flex-col
                    items-center
                  "
                >

                  <div
                    className="
                      text-2xl
                      sm:text-3xl
                      md:text-4xl
                      font-semibold
                      tabular-nums
                      px-2
                      sm:px-3
                      py-2
                      rounded-sm
                      w-full
                    "
                    style={{
                      background:
                        C.maroon800,

                      color:
                        C.gold300,

                      fontFamily:
                        "'Cinzel', serif",
                    }}
                  >
                    {String(u.v)
                      .padStart(2, '0')}
                  </div>

                  <span
                    className="
                      font-label
                      text-[8px]
                      sm:text-[10px]
                      mt-1.5
                    "
                    style={{
                      color:
                        C.maroon700,
                    }}
                  >
                    {u.l}
                  </span>

                </div>

              ))}

            </div>

          )}


          <button
            onClick={downloadICS}
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              px-5
              py-2.5
              rounded-sm
              font-label
              text-xs
              transition-transform
              hover:scale-105
              active:scale-95
            "
            style={{
              background:
                C.maroon800,

              color:
                C.gold300,

              border:
                `1px solid ${C.gold500}`,
            }}
          >

            <CalendarPlus
              className="w-4 h-4"
            />

            ADD TO CALENDAR

          </button>

        </div>

      </RevealPanel>


      {/* =============================================================
          RSVP
      ============================================================= */}

      <RevealPanel
        reduced={reduced}
        className="
          mx-3
          md:mx-auto
          max-w-2xl
          my-12
        "
      >

        <div
          className="
            py-12
            px-6
            md:px-12
            text-center
          "
          style={{
            background:
              C.ivory,
          }}
        >

          <Users
            className="
              w-6
              h-6
              mx-auto
              mb-3
            "
            style={{
              color:
                C.terracotta,
            }}
          />

          <h2
            className="
              font-script
              text-4xl
              mb-2
            "
            style={{
              color:
                C.maroon800,
            }}
          >
            Will you join us?
          </h2>

          <p
            className="
              text-sm
              mb-6
            "
            style={{
              color:
                `${C.ink}aa`,
            }}
          >
            {rsvpLoading
              ? 'Loading responses…'
              : joiningCount > 0
                ? `${joiningCount} guest${joiningCount > 1 ? 's' : ''} already joining the celebration.`
                : 'Be the first to confirm you’re coming.'}
          </p>


          {rsvpDone ? (

            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                flex
                flex-col
                items-center
                gap-2
                py-6
              "
            >

              <Check
                className="w-8 h-8"
                style={{
                  color:
                    C.green700,
                }}
              />

              <p
                className="
                  font-label
                  text-sm
                "
                style={{
                  color:
                    C.maroon800,
                }}
              >
                Thank you,
                {' '}
                {name.split(' ')[0]}!
              </p>

              <p
                className="text-sm"
                style={{
                  color:
                    `${C.ink}99`,
                }}
              >
                Your response has been saved.
              </p>

            </motion.div>

          ) : (

            <form
              onSubmit={submitRSVP}
              className="
                max-w-sm
                mx-auto
                text-left
                space-y-4
              "
            >

              <div>

                <label
                  className="
                    font-label
                    text-[10px]
                  "
                  style={{
                    color:
                      C.maroon700,
                  }}
                >
                  YOUR NAME
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  className="
                    w-full
                    mt-1
                    px-3
                    py-2
                    text-base
                    border-b
                    bg-transparent
                    focus:outline-none
                  "
                  style={{
                    borderColor:
                      `${C.gold500}90`,
                    color:
                      C.ink,
                  }}
                  placeholder="Full name"
                />

              </div>


              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-3
                  sm:gap-6
                "
              >

                <label
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    cursor-pointer
                  "
                >

                  <input
                    type="radio"
                    name="attending"
                    checked={
                      attending === 'yes'
                    }
                    onChange={() =>
                      setAttending('yes')
                    }
                  />

                  Joyfully attending

                </label>


                <label
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    cursor-pointer
                  "
                >

                  <input
                    type="radio"
                    name="attending"
                    checked={
                      attending === 'no'
                    }
                    onChange={() =>
                      setAttending('no')
                    }
                  />

                  Can't make it

                </label>

              </div>


              {attending === 'yes' && (

                <div>

                  <label
                    className="
                      font-label
                      text-[10px]
                    "
                    style={{
                      color:
                        C.maroon700,
                    }}
                  >
                    NUMBER OF GUESTS
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={guests}
                    onChange={(e) =>
                      setGuests(e.target.value)
                    }
                    className="
                      w-full
                      mt-1
                      px-3
                      py-2
                      text-base
                      border-b
                      bg-transparent
                      focus:outline-none
                    "
                    style={{
                      borderColor:
                        `${C.gold500}90`,
                      color:
                        C.ink,
                    }}
                  />

                </div>

              )}


              <div>

                <label
                  className="
                    font-label
                    text-[10px]
                  "
                  style={{
                    color:
                      C.maroon700,
                  }}
                >
                  A NOTE (OPTIONAL)
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  rows={2}
                  className="
                    w-full
                    mt-1
                    px-3
                    py-2
                    text-base
                    border-b
                    bg-transparent
                    focus:outline-none
                    resize-none
                  "
                  style={{
                    borderColor:
                      `${C.gold500}90`,
                    color:
                      C.ink,
                  }}
                  placeholder="Looking forward to it!"
                />

              </div>


              {rsvpError && (

                <p
                  className="text-xs"
                  style={{
                    color:
                      C.terracotta,
                  }}
                >
                  Couldn't save your response —
                  please try again.
                </p>

              )}


              <button
                type="submit"
                disabled={
                  rsvpSubmitting
                }
                className="
                  w-full
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-sm
                  font-label
                  text-xs
                  transition-transform
                  hover:scale-[1.02]
                  active:scale-95
                  disabled:opacity-60
                "
                style={{
                  background:
                    C.maroon800,

                  color:
                    C.gold300,

                  border:
                    `1px solid ${C.gold500}`,
                }}
              >

                <Send
                  className="w-3.5 h-3.5"
                />

                {rsvpSubmitting
                  ? 'SENDING…'
                  : 'SEND RESPONSE'}

              </button>


              <p
                className="
                  text-[11px]
                  text-center
                "
                style={{
                  color:
                    `${C.ink}77`,
                }}
              >
                Visible to other guests visiting
                this invitation.
              </p>

            </form>

          )}

        </div>

      </RevealPanel>


      {/* =============================================================
          LOCATION
      ============================================================= */}

      <RevealPanel
        reduced={reduced}
        className="
          mx-3
          md:mx-auto
          max-w-2xl
          my-12
        "
      >

        <div
          className="
            py-12
            px-6
            text-center
          "
          style={{
            background:
              C.cream100,
          }}
        >

          <p
            className="
              font-label
              text-xs
              mb-1
            "
            style={{
              color:
                C.terracotta,
            }}
          >
            स्थान
          </p>

          <h2
            className="
              font-script
              text-4xl
              md:text-5xl
              mb-4
            "
            style={{
              color:
                C.maroon800,
            }}
          >
            Where
          </h2>

          <h3
            className="
              font-label
              text-lg
              mb-4
            "
            style={{
              color:
                C.maroon800,
            }}
          >
            हमारा घर
          </h3>


          <p
            className="
              text-lg
              font-semibold
              mb-1
            "
          >
            {EVENT.addressLine1}
          </p>

          <p
            className="
              text-sm
              md:text-base
              mb-6
            "
            style={{
              color:
                `${C.ink}bb`,
            }}
          >
            {EVENT.addressLine2}
          </p>


          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-3
            "
          >

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-sm
                font-label
                text-xs
                transition-transform
                hover:scale-105
                active:scale-95
              "
              style={{
                background:
                  C.maroon800,

                color:
                  C.gold300,

                border:
                  `1px solid ${C.gold500}`,
              }}
            >

              <MapPin
                className="w-4 h-4"
              />

              OPEN IN MAPS

            </a>


            <button
              onClick={shareInvite}
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-sm
                font-label
                text-xs
                transition-transform
                hover:scale-105
                active:scale-95
              "
              style={{
                background:
                  'transparent',

                color:
                  C.maroon800,

                border:
                  `1px solid ${C.maroon800}60`,
              }}
            >

              <Share2
                className="w-4 h-4"
              />

              {copied
                ? 'LINK COPIED'
                : 'SHARE INVITE'}

            </button>

          </div>

        </div>

      </RevealPanel>


      {/* =============================================================
          FINAL DECORATIVE STRIP
      ============================================================= */}

      <section
        className="
          relative
          py-12
          px-4
          overflow-hidden
        "
        style={{
          background:
            C.cream50,
        }}
      >

        <div
          className="
            max-w-xl
            mx-auto
            flex
            items-center
            justify-center
            gap-5
          "
        >

          <DiyaFlame
            reduced={reduced}
          />

          <LotusFlower size={28} />

          <DiyaFlame
            reduced={reduced}
          />

        </div>

      </section>


      {/* =============================================================
          FOOTER
      ============================================================= */}

      <section
        className="
          py-16
          px-4
          text-center
          relative
          overflow-hidden
        "
        style={{
          background:
            C.maroon900,

          color:
            C.gold300,
        }}
      >

        {/* ADD IMAGE LINK:
            Optional subtle mandala / temple background.
            Keep opacity around 5–10%.
        */}

        <ArtImage
          src={ART.damask}
          alt=""
          className="
            inset-0
            w-full
            h-full
            object-cover
            opacity-[0.06]
          "
        />


        <div
          className="
            max-w-xl
            mx-auto
            space-y-6
            relative
            z-10
          "
        >

          <h2
            className="
              font-deva
              text-3xl
              md:text-4xl
            "
          >
            ॥ शुभम् ॥
          </h2>


          <div
            className="
              flex
              items-center
              justify-center
              gap-6
            "
          >

            <DiyaFlame
              reduced={reduced}
            />

            <Flower2
              className="
                w-5
                h-5
                opacity-70
              "
            />

            <DiyaFlame
              reduced={reduced}
            />

          </div>


          <p
            className="
              text-sm
              md:text-base
              italic
            "
            style={{
              color:
                `${C.gold300}cc`,
            }}
          >
            "One lamp is lit for the house,
            and one for whoever is on their way to it."
          </p>


          <div
            className="
              pt-8
              border-t
            "
            style={{
              borderColor:
                `${C.gold500}30`,
            }}
          >

            <p
              className="
                font-script
                text-2xl
                md:text-3xl
                mb-2
              "
            >
              Ganpati Bappa Morya,
              <br />
              pudhchya varshi lavkar ya
            </p>

            <p
              className="
                font-label
                text-[10px]
              "
            >
              WITH LOVE, {EVENT.hosts.toUpperCase()}
            </p>

          </div>


          <div
            className="
              pt-8
              space-y-2
            "
          >

            <h3
              className="
                font-deva
                text-xl
                md:text-2xl
              "
            >
              ॥ गणपति बाप्पा मोरया ॥
            </h3>

            <p
              className="
                font-script
                text-2xl
                md:text-3xl
              "
            >
              Mangalmurti Morya
            </p>

            <p
              className="
                text-xs
                pt-4
                opacity-70
              "
            >
              {EVENT.startLabel}
              {' · '}
              Dombivli East
            </p>

          </div>


          <Heart
            className="
              w-4
              h-4
              mx-auto
              opacity-50
            "
          />

        </div>

      </section>

    </div>
  );
}
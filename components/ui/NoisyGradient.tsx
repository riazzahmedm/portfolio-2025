/**
 * A soft gradient glow across the top of a page, with film grain over it, fading into the page background.
 * The page root must be positioned and isolated (position: relative; isolation: isolate) so the glow sits behind everything.
 * The glow drifts very slowly; it stands still for visitors who prefer reduced motion.
 */
export default function NoisyGradient({ glow = ['rgba(104,72,226,0.36)', 'rgba(243,195,77,0.14)', 'rgba(150,126,230,0.2)'] }: { glow?: [string, string, string] | string[] }) {
  const [a, b, c] = glow
  return (
    <div className="ng" aria-hidden="true" style={{ ['--ng-a' as string]: a, ['--ng-b' as string]: b, ['--ng-c' as string]: c }}>
      <style>{`
        .ng { position: absolute; top: 0; left: 0; right: 0; height: min(620px, 82vh); z-index: -1; overflow: hidden; pointer-events: none;
          -webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent 100%); mask-image: linear-gradient(to bottom, #000 30%, transparent 100%); }
        .ng-glow { position: absolute; inset: -20%; filter: blur(30px);
          background:
            radial-gradient(42% 46% at 22% 18%, var(--ng-a), transparent 70%),
            radial-gradient(38% 40% at 82% 12%, var(--ng-b), transparent 70%),
            radial-gradient(46% 44% at 58% 46%, var(--ng-c), transparent 72%);
          animation: ng-drift 22s ease-in-out infinite alternate; }
        /* grain: fractal noise, blended into the glow so it reads as texture, not as a pattern */
        .ng-grain { position: absolute; inset: 0; opacity: 0.45; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size: 220px 220px; }
        @keyframes ng-drift { from { transform: translate3d(-2%, -1%, 0) scale(1); } to { transform: translate3d(3%, 2%, 0) scale(1.08); } }
        @media (prefers-reduced-motion: reduce) { .ng-glow { animation: none; } }
      `}</style>
      <div className="ng-glow" />
      <div className="ng-grain" />
    </div>
  )
}

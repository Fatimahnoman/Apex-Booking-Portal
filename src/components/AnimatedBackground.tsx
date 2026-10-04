export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: '#060D0B' }}>
      {/* Base radial gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.15), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(6,182,212,0.08), transparent), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(20,184,166,0.06), transparent)',
        }}
      />

      {/* Animated gradient waves */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-1/2 -left-1/4 h-[600px] w-[600px] rounded-full animate-blob bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-1/4 h-[500px] w-[500px] rounded-full animate-blob-delay bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full animate-blob bg-teal-500/8 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

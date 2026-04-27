/* VARIANT 2 — windmill/spiral logo. The spiral is the existing
   public/logo-spiral.svg, copied to this variant's assets folder.
   Wordmark is rendered as: <spiral icon>  GWTH.ai (text), so the
   multi-blade colour palette stays visible at small sizes and the
   accent palette can pull from the blade colours without feeling
   disjointed. */

const GwthWordmark = ({ height = 28 }) => {
  const iconSize = Math.round(height * 1.05);
  return (
    <span className="gwth-mark gwth-mark--windmill" style={{ height, display: 'inline-flex', alignItems: 'center', gap: 8 }} aria-label="GWTH.ai">
      <img
        src="assets/logo-spiral.svg"
        alt=""
        style={{ width: iconSize, height: iconSize, display: 'block' }}
      />
      <span
        className="gwth-wordtext"
        style={{
          fontFamily: '"Inter Tight", Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: Math.round(height * 0.95),
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
          lineHeight: 1,
        }}
      >GWTH<span style={{ color: 'var(--blade-mint, #1CBA93)' }}>.ai</span></span>
    </span>
  );
};

/* Compact icon for small UI moments (badges, buttons) — just the spiral. */
const GwthIcon = ({ size = 32, mintColor }) => {
  return (
    <span
      className="gwth-icon-spiral"
      style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="GWTH"
    >
      <img src="assets/logo-spiral.svg" alt="" style={{ width: size, height: size, display: 'block' }} />
    </span>
  );
};

window.GwthWordmark = GwthWordmark;
window.GwthIcon = GwthIcon;

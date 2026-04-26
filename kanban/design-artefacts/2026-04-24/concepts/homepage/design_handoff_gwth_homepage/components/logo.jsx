/* GWTH wordmark — uses the user-provided PNG assets, processed to have
   transparent backgrounds. Light variant (black mark) shows on light
   surfaces; dark variant (cream mark) shows on dark surfaces. CSS handles
   the swap based on the closest .theme-* ancestor. */

const GwthWordmark = ({ height = 24 }) => {
  return (
    <span className="gwth-mark gwth-mark--png" style={{ height }} aria-label="GWTH.ai">
      <img src="assets/logo-on-light.png" className="gwth-logo gwth-logo--for-light" alt="GWTH.ai" />
      <img src="assets/logo-on-dark.png"  className="gwth-logo gwth-logo--for-dark"  alt="GWTH.ai" />
    </span>
  );
};

/* Compact icon for small UI moments (badges, buttons). Crops just the G+arrow
   from the same processed PNG using a wide image + clip on the parent. */
const GwthIcon = ({ size = 32, mintColor }) => {
  // The wordmark image is ~5.25× wider than tall (765/146). The G+arrow
  // occupies roughly the first 1× of that width. So we render the full
  // image at height=size and clip to width=size.
  return (
    <span
      className="gwth-icon-clip"
      style={{ width: size, height: size, display: 'inline-block', overflow: 'hidden', position: 'relative', verticalAlign: 'middle' }}
      aria-label="GWTH"
    >
      <img
        src="assets/logo-on-light.png"
        className="gwth-logo gwth-logo--for-light"
        alt=""
        style={{ height: size, width: 'auto', display: 'block', position: 'absolute', left: 0, top: 0 }}
      />
      <img
        src="assets/logo-on-dark.png"
        className="gwth-logo gwth-logo--for-dark"
        alt=""
        style={{ height: size, width: 'auto', display: 'block', position: 'absolute', left: 0, top: 0 }}
      />
    </span>
  );
};

window.GwthWordmark = GwthWordmark;
window.GwthIcon = GwthIcon;

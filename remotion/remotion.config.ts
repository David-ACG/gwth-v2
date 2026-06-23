import { Config } from "@remotion/cli/config";

// ============================================================
// GWTH.ai EXPLAINER — Remotion config (FDE journal register)
// ============================================================
// Web-optimised 1080p MP4. The FDE register is nearly static,
// so single-threaded stability is fine and keeps renders clean.

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
// CRF 20 = visually lossless-ish at a sensible web file size.
Config.setCrf(20);
Config.setDelayRenderTimeoutInMilliseconds(120000);
Config.setChromiumOpenGlRenderer("angle");

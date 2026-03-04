# Task: Add Country Flags to Tech Radar Tools

## What to change

Add a `country_code` field to each tool in the Tech Radar, and display a country flag emoji next to each tool name in the Tech Radar grid. This helps users see at a glance where each AI tool originates from, reinforcing GWTH's messaging about vendor independence and the dominance of US tools in the AI landscape.

### Context

As part of GWTH's UK-first positioning, David wants the Tech Radar to visually show where each AI tool comes from. This makes the point that most AI tools are US-based without needing to say it explicitly -- the flags speak for themselves. It also highlights when tools are from the UK, France, or other countries.

### Type changes (`src/lib/types.ts`)

Add a new field to the `TechRadarTool` interface:

```typescript
/** ISO 3166-1 alpha-2 country code for the tool's headquarters/origin (e.g., "US", "GB", "FR") */
country_code: string;
```

### Data changes (`docs/tech_radar.json`)

Add a `country_code` field to every tool in the JSON file. Use ISO 3166-1 alpha-2 codes. Research the actual headquarters of each tool:

Common mappings (verify against the actual tools in the JSON):

- **US**: OpenAI (ChatGPT, DALL-E), Anthropic (Claude), Google (Gemini, NotebookLM), Meta (Llama), Microsoft (Copilot), Midjourney, Perplexity, Cursor, Vercel (v0), Replit, GitHub Copilot, Zapier, Make (originally CZ but now US-headquartered), Jasper, Copy.ai, ElevenLabs (originally PL but HQ now US), Runway, Suno, etc.
- **GB**: DeepMind (owned by Google but London-based -- use GB), Stability AI (London), ARM (Cambridge -- if listed)
- **FR**: Mistral AI, HuggingFace
- **DE**: Aleph Alpha, DeepL
- **CN**: Baidu (Ernie), Alibaba (Qwen), ByteDance (Doubao), DeepSeek
- **CA**: Cohere
- **IL**: AI21 Labs
- **AE**: Falcon (TII)
- **KR**: Naver (HyperCLOVA)

If a tool's country is genuinely ambiguous (e.g., fully distributed team with no clear HQ), use the country where the company is legally incorporated.

Read the actual `docs/tech_radar.json` file first to see which tools are listed, then add the correct `country_code` for each one. Do not guess -- look up the headquarters if unsure.

### Display changes (`src/components/tech-radar/tech-radar-grid.tsx`)

1. **Create a country flag helper**: Add a small utility function or inline map that converts ISO country codes to flag emoji. The formula is: for each letter in the 2-character country code, add `0x1F1E6 - 0x41` (offset from 'A' to regional indicator 'A') to get the regional indicator symbol. Example:

```typescript
/** Converts ISO 3166-1 alpha-2 country code to flag emoji */
function countryFlag(code: string): string {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}
```

2. **Display the flag**: In the tool card rendering, show the flag emoji immediately after (or before) the tool name. Use a small `<span>` with a title attribute showing the full country name for accessibility:

```tsx
<span title="United States" aria-label="United States" className="text-base">
  {countryFlag(tool.country_code)}
</span>
```

3. **Add a country filter** (optional, nice-to-have): If time permits, add a filter dropdown or pill bar for filtering by country. This is lower priority than the flag display.

### Data layer changes (`src/lib/data/tech-radar.ts`)

No changes needed to the data functions -- they already pass through all fields from the JSON. The new `country_code` field will flow through automatically once it is in the JSON and the type.

## Files likely affected

- `src/lib/types.ts` -- add `country_code` field to `TechRadarTool`
- `docs/tech_radar.json` -- add `country_code` to every tool entry
- `src/components/tech-radar/tech-radar-grid.tsx` -- add flag emoji display, add `countryFlag()` helper

## Acceptance criteria

- [ ] `TechRadarTool` interface in `src/lib/types.ts` has a `country_code: string` field with JSDoc
- [ ] Every tool in `docs/tech_radar.json` has a `country_code` field with a valid ISO 3166-1 alpha-2 code
- [ ] The Tech Radar grid displays a flag emoji next to each tool name
- [ ] The flag has a `title` attribute with the full country name for accessibility
- [ ] US tools show the US flag, UK tools show the UK flag, etc. (spot check at least 5 tools)
- [ ] The page renders without errors
- [ ] `npm test` passes with no failures
- [ ] The site builds successfully with `npm run build`

## Notes

- Use emoji flags, not image files. Emoji flags are universally supported on modern browsers and require no additional assets.
- The flag should be visually subtle -- same size as or slightly smaller than the tool name text. Do not make it overpowering.
- If ElevenLabs is listed, use "US" (they moved HQ to the US despite Polish founders). If Stability AI is listed, use "GB" (London HQ). If DeepMind is listed, use "GB" (London).
- This is a self-contained change with no dependencies on other UK-first prompts.

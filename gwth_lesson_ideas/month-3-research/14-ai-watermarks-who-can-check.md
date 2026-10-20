# AI Watermarks: Who Can Actually Check?

*Checked on the web 2026-10-20 for bead gwth-launch-m0b1. Nearest lesson: M3 L34 Responsible AI, Ethics, IP, And Disclosure ("Deciding when to disclose AI use in your sector").*

David asked, after the Monday digest said "OpenAI now hides a detectable watermark in text for EU rules": *"I thought this new detectable watermark was only detectable by the company that made the AI model ... I don't want to scare people into thinking that everyone can now detect AI work."*

## Short answer

**For writing, he is right.** Nobody outside OpenAI (plus a few approved researchers) can check ChatGPT text for its watermark, and nobody outside Google can check Gemini text. There is no public text checker from either company.

**For pictures, video and audio, it changed this month.** Since 6 October 2026 anyone who signs in to Google's SynthID Detector can upload an image, video or audio file and check it for the hidden mark that Google, OpenAI, Nvidia and Kakao put in their generated media. Anyone can also upload an image to the Content Credentials Verify site and read its label, if it still has one.

**Guessing tools also exist** (Turnitin, GPTZero and others). Schools and some employers use them. They do not read a watermark: they guess from the style of the writing, and they are wrong often enough that a court has thrown out a cheating finding based on one.

## The detail

### OpenAI text watermark ("textGrain"), announced 5 October 2026
- An invisible statistical pattern in the words the model picks. Added automatically only to ChatGPT and Codex text for users in the EU, rolled out over the following weeks. For API customers anywhere it is opt-in and off by default.
- Why now: EU AI Act Article 50 requires AI providers to mark generated audio, images, video and text in a machine-readable way, from 2 August 2026.
- Who can check: OpenAI. It opened applications for its detector on 5 October, but access goes case by case to approved researchers and expert organisations under the EU Code of Practice. It held back a public tool because of missed marks and false alarms. An open-source release is planned, with no date.
- How well it works: about 80% caught at 200 tokens and 95% at 400 tokens, at a 1% false-alarm setting, much lower for maths. Swapping 10% of the words for synonyms dropped detection from about 92% to 66%. Short passages, maths answers and translated text are weak spots.
- OpenAI's own caution: a missing watermark does not prove a human wrote it.

### Google SynthID
- Gemini text is watermarked, and Google open-sourced the text method (SynthID Text). But the open-source library only checks text marked with your own keys. Google's Gemini keys are private, so no one outside Google can check Gemini text.
- The public SynthID Detector portal (open to anyone who signs in since 6 October 2026, English, worldwide) accepts image, video and audio files only, not text. It checks only marks from companies that adopted SynthID (Google, OpenAI, Nvidia, Kakao). It is not a general AI detector.

### Content Credentials (C2PA)
- A visible-to-software label saying what made a file and whether AI was used. Anyone can check one at contentcredentials.org/verify, for images, video, audio and PDFs.
- The label is easy to lose (a screenshot or re-save strips it), and in October 2026 a researcher showed a way to alter a signed image without breaking the signature. It is not used for plain text.

### Guessing detectors (Turnitin, GPTZero and similar)
- They score writing on how "AI-like" it reads. No watermark is involved, so they work on any model's text, and they also flag human writing.
- A Stanford study found they regularly mark non-native English writers as AI. In January 2026 a New York court annulled an academic-integrity finding based on Turnitin.

## How to put this in a lesson without scaring anyone

Frame it as **"Who can tell, and why it should not matter to you"**:

1. Your manager or a client cannot check your email or report for an AI watermark. Only the AI company can, and only for its own model.
2. Pictures, video and audio are different: anyone can now check those for a hidden mark or a label. Assume an AI image can be identified.
3. Guessing tools exist and get it wrong in both directions. Never use one to accuse someone, and do not panic if one flags you.
4. The reason to disclose AI use is trust and your sector's rules, not fear of being caught. That is the point L34 already makes.

## Sources
- TechCrunch, "OpenAI will start watermarking ChatGPT's text in the EU", 5 Oct 2026: https://techcrunch.com/2026/10/05/openai-will-start-watermarking-chatgpts-text-in-the-eu/
- Unite.AI, "OpenAI Begins Phased Text Watermarking Under EU AI Act Rules": https://www.unite.ai/openai-begins-phased-text-watermarking-under-eu-ai-act-rules/
- OpenAI, "Our approach to EU text provenance rules" (the digest find; blocked our fetcher, facts taken from the two reports above): https://openai.com/index/eu-text-provenance
- PPC Land, "Google's SynthID Detector gains public access and covers 4 companies": https://ppc.land/googles-synthid-detector-gains-public-access-and-covers-4-companies/
- google-deepmind/synthid-text on GitHub: https://github.com/google-deepmind/synthid-text
- Content Credentials Verify: https://contentcredentials.org/verify ; Wikipedia, Content Credentials: https://en.wikipedia.org/wiki/Content_Credentials
- Liang et al., "GPT detectors are biased against non-native English writers" (Stanford, 2023): https://arxiv.org/abs/2304.02819
- Wikipedia, "Artificial intelligence content detection": https://en.wikipedia.org/wiki/Artificial_intelligence_content_detection

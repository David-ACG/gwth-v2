-- ============================================================================
-- GWTH News & Voting System — Database Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zdhnwxknovzdnxgvwykt/sql
-- ============================================================================

-- ─── 1. NEWS ARTICLES TABLE ─────────────────────────────────────────────────

CREATE TABLE news_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  excerpt         TEXT NOT NULL,
  content         TEXT NOT NULL,
  url             TEXT,
  category        TEXT NOT NULL DEFAULT 'ai-launch',
  tags            TEXT[] DEFAULT '{}',
  thumbnail_url   TEXT,
  author          TEXT NOT NULL DEFAULT 'David',
  vote_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  lab_slug        TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_articles_slug ON news_articles(slug);
CREATE INDEX idx_news_articles_status ON news_articles(status);
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_votes ON news_articles(vote_count DESC);
CREATE INDEX idx_news_articles_tags ON news_articles USING GIN(tags);

-- ─── 2. NEWS VOTES TABLE ────────────────────────────────────────────────────
-- user_id is TEXT for now. Will migrate to UUID REFERENCES auth.users(id)
-- once Supabase Auth is configured for GWTH.

CREATE TABLE news_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_news_votes_article ON news_votes(article_id);
CREATE INDEX idx_news_votes_user ON news_votes(user_id);

-- ─── 3. NEWS COMMENTS TABLE ─────────────────────────────────────────────────
-- user_id is TEXT for now. Same auth migration plan as votes.

CREATE TABLE news_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  parent_id       UUID REFERENCES news_comments(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  user_name       TEXT NOT NULL DEFAULT 'Anonymous',
  user_avatar     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_comments_article ON news_comments(article_id);
CREATE INDEX idx_news_comments_parent ON news_comments(parent_id);

-- ─── 4. ROW LEVEL SECURITY ──────────────────────────────────────────────────

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- Public read for published articles
CREATE POLICY "Public can read published articles"
  ON news_articles FOR SELECT
  USING (status = 'published');

-- Service role (admin) can manage all articles
CREATE POLICY "Service role manages articles"
  ON news_articles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anyone can read votes
CREATE POLICY "Public can read votes"
  ON news_votes FOR SELECT
  USING (true);

-- Service role can manage votes (auth-gated in app code for now)
CREATE POLICY "Service role manages votes"
  ON news_votes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anyone can read comments
CREATE POLICY "Public can read comments"
  ON news_comments FOR SELECT
  USING (true);

-- Service role can manage comments
CREATE POLICY "Service role manages comments"
  ON news_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── 5. HOTNESS SCORE VIEW ──────────────────────────────────────────────────
-- HN formula: (votes - 1) / (hours + 2)^1.8

CREATE OR REPLACE VIEW news_articles_ranked AS
SELECT
  *,
  CASE
    WHEN vote_count <= 1 THEN 0
    ELSE (vote_count - 1)::FLOAT /
         POWER(EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 + 2, 1.8)
  END AS hotness_score
FROM news_articles
WHERE status = 'published';

-- ─── 6. TOGGLE VOTE FUNCTION ────────────────────────────────────────────────
-- Atomic insert-or-delete + update count.

CREATE OR REPLACE FUNCTION toggle_news_vote(p_article_id UUID, p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_existing UUID;
  v_new_count INTEGER;
  v_voted BOOLEAN;
BEGIN
  -- Check if vote exists
  SELECT id INTO v_existing
  FROM news_votes
  WHERE article_id = p_article_id AND user_id = p_user_id;

  IF v_existing IS NOT NULL THEN
    DELETE FROM news_votes WHERE id = v_existing;
    UPDATE news_articles
      SET vote_count = vote_count - 1, updated_at = NOW()
      WHERE id = p_article_id;
    v_voted := FALSE;
  ELSE
    INSERT INTO news_votes (article_id, user_id) VALUES (p_article_id, p_user_id);
    UPDATE news_articles
      SET vote_count = vote_count + 1, updated_at = NOW()
      WHERE id = p_article_id;
    v_voted := TRUE;
  END IF;

  SELECT vote_count INTO v_new_count FROM news_articles WHERE id = p_article_id;

  RETURN json_build_object('voted', v_voted, 'vote_count', v_new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 7. COMMENT COUNT TRIGGER ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_news_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news_articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news_articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_comment_count_trigger
  AFTER INSERT OR DELETE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION update_news_comment_count();

-- ─── 8. UPDATED_AT TRIGGER ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_news_updated_at();

CREATE TRIGGER news_comments_updated_at
  BEFORE UPDATE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION update_news_updated_at();

-- ─── 9. SEED DATA ───────────────────────────────────────────────────────────

INSERT INTO news_articles (slug, title, excerpt, content, url, category, tags, author, vote_count, is_featured, published_at) VALUES
(
  'claude-remote-control',
  'Claude Can Now Control Your Computer Remotely',
  'Anthropic launches remote computer control for Claude, enabling AI agents to operate desktop applications directly.',
  E'## Remote Control Changes Everything\n\nAnthropic has released a groundbreaking new capability: Claude can now control your computer remotely. This means AI agents can interact with desktop applications, navigate the web, and perform complex multi-step tasks — all through natural language instructions.\n\n### What This Means\n\n- **Desktop automation** — Claude can open apps, click buttons, type text, and navigate menus\n- **Web browsing** — Full browser control for research, data gathering, and form filling\n- **Multi-step workflows** — Chain complex operations across multiple applications\n- **Developer tooling** — Interact with IDEs, terminals, and development environments\n\n### Getting Started\n\nThe computer use API is available through Claude''s API. You''ll need to set up a virtual display environment and grant appropriate permissions.\n\n```python\nimport anthropic\n\nclient = anthropic.Anthropic()\nresult = client.messages.create(\n    model="claude-sonnet-4-20250514",\n    max_tokens=1024,\n    tools=[{"type": "computer_20250124", "display_width": 1024, "display_height": 768}],\n    messages=[{"role": "user", "content": "Open the browser and search for AI news"}]\n)\n```\n\n### Security Considerations\n\nAlways run computer use in a sandboxed environment. Never give Claude access to sensitive systems without proper safeguards.',
  'https://docs.anthropic.com/en/docs/agents-and-tools/computer-use',
  'ai-launch',
  ARRAY['claude', 'anthropic', 'agents', 'computer-use', 'automation'],
  'David',
  203,
  true,
  NOW() - INTERVAL '2 days'
),
(
  'openai-gpt5-announcement',
  'GPT-5 Launches with Native Tool Use and Extended Context',
  'OpenAI releases GPT-5 with 1M token context, native function calling improvements, and new reasoning capabilities.',
  E'## GPT-5 Is Here\n\nOpenAI has officially launched GPT-5, bringing significant improvements across the board.\n\n### Key Features\n\n- **1M token context window** — Process entire codebases, long documents, and extensive conversations\n- **Improved reasoning** — Better at multi-step logic, math, and code generation\n- **Native tool use** — Built-in function calling with better reliability\n- **Faster responses** — 2x speed improvement over GPT-4 Turbo\n\n### Pricing\n\nGPT-5 is available at $15/1M input tokens and $60/1M output tokens through the API.',
  'https://openai.com/blog',
  'ai-launch',
  ARRAY['openai', 'gpt-5', 'llm', 'context-window'],
  'David',
  156,
  true,
  NOW() - INTERVAL '5 days'
),
(
  'mcp-protocol-explained',
  'Model Context Protocol: The Standard for AI Tool Integration',
  'The MCP protocol is becoming the standard way to connect AI models to external tools and data sources.',
  E'## What is MCP?\n\nThe Model Context Protocol (MCP) is an open standard for connecting AI assistants to external data sources and tools. Think of it as a universal adapter that lets any AI model talk to any service.\n\n### Why It Matters\n\n- **Standardization** — One protocol instead of custom integrations per tool\n- **Interoperability** — Works with Claude, GPT, and other models\n- **Security** — Built-in permission model and sandboxing\n- **Extensibility** — Easy to create custom MCP servers for your tools\n\n### Building an MCP Server\n\n```typescript\nimport { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";\n\nconst server = new McpServer({ name: "my-tool", version: "1.0.0" });\n\nserver.tool("get-weather", { city: z.string() }, async ({ city }) => {\n  const data = await fetchWeather(city);\n  return { content: [{ type: "text", text: JSON.stringify(data) }] };\n});\n```\n\n### Growing Ecosystem\n\nMCP servers already exist for GitHub, Slack, databases, file systems, and more. The ecosystem is growing rapidly.',
  'https://modelcontextprotocol.io',
  'tool',
  ARRAY['mcp', 'protocol', 'tools', 'integration', 'agents'],
  'David',
  89,
  false,
  NOW() - INTERVAL '8 days'
),
(
  'ai-regulation-eu-act',
  'EU AI Act Enforcement Begins: What Developers Need to Know',
  'The EU AI Act is now in effect. Here''s what it means for AI developers and businesses operating in Europe.',
  E'## EU AI Act: Key Points for Developers\n\nThe EU AI Act, the world''s first comprehensive AI regulation, has entered its enforcement phase. Here''s what you need to know.\n\n### Risk Categories\n\n1. **Unacceptable risk** — Banned (social scoring, real-time biometric surveillance)\n2. **High risk** — Strict requirements (healthcare, education, employment AI)\n3. **Limited risk** — Transparency obligations (chatbots, deepfakes)\n4. **Minimal risk** — No restrictions (spam filters, AI in games)\n\n### Developer Requirements\n\n- **Documentation** — Maintain technical documentation for high-risk systems\n- **Data governance** — Training data must be relevant, representative, and error-free\n- **Transparency** — Users must know when they''re interacting with AI\n- **Human oversight** — High-risk systems must allow human intervention\n\n### Timeline\n\n- Feb 2025: Prohibited practices banned\n- Aug 2025: Obligations for general-purpose AI\n- Aug 2026: Full enforcement for high-risk systems',
  NULL,
  'industry',
  ARRAY['regulation', 'eu', 'compliance', 'policy'],
  'David',
  67,
  false,
  NOW() - INTERVAL '12 days'
),
(
  'cursor-vs-claude-code',
  'AI Coding Tools Compared: Cursor vs Claude Code vs GitHub Copilot',
  'A practical comparison of the top AI coding assistants for real-world development workflows.',
  E'## The AI Coding Tool Landscape\n\nAI coding assistants have gone from novelty to necessity. Here''s how the top tools compare for real-world development.\n\n### Cursor\n\n- **Strengths:** IDE-native experience, great tab completion, multi-file editing\n- **Weaknesses:** Subscription cost, can be slow on large codebases\n- **Best for:** Full-time development in a VS Code-like environment\n\n### Claude Code\n\n- **Strengths:** CLI-native, agentic capabilities, deep codebase understanding, tool use\n- **Weaknesses:** Terminal-only (no GUI), requires API key\n- **Best for:** Complex refactors, multi-file changes, DevOps tasks\n\n### GitHub Copilot\n\n- **Strengths:** Deep GitHub integration, broad language support, affordable\n- **Weaknesses:** Less capable for complex reasoning, no agentic features\n- **Best for:** Inline completions, quick code generation\n\n### Verdict\n\nThere''s no single winner. Many developers use a combination — Cursor or Copilot for daily coding, Claude Code for complex architectural tasks.',
  NULL,
  'tutorial',
  ARRAY['cursor', 'claude-code', 'copilot', 'developer-tools', 'comparison'],
  'David',
  112,
  false,
  NOW() - INTERVAL '3 days'
),
(
  'supabase-ai-integration',
  'Supabase Adds Native AI Vector Search and Embeddings',
  'Supabase extends its platform with pgvector integration, making it easy to add semantic search to any project.',
  E'## AI Meets Your Database\n\nSupabase has made it dramatically easier to build AI-powered applications by integrating pgvector directly into their platform.\n\n### What''s New\n\n- **pgvector built-in** — No extensions to install, just start using vectors\n- **Embedding generation** — Generate embeddings via Edge Functions\n- **Similarity search** — Built-in functions for cosine, inner product, and L2 distance\n- **Hybrid search** — Combine full-text search with semantic search\n\n### Quick Start\n\n```sql\n-- Enable the extension\nCREATE EXTENSION IF NOT EXISTS vector;\n\n-- Add a vector column\nALTER TABLE documents ADD COLUMN embedding vector(1536);\n\n-- Search by similarity\nSELECT * FROM documents\nORDER BY embedding <=> $1\nLIMIT 5;\n```\n\n### Use Cases\n\n- RAG (Retrieval Augmented Generation) for chatbots\n- Semantic document search\n- Image similarity matching\n- Recommendation systems',
  'https://supabase.com/blog',
  'tool',
  ARRAY['supabase', 'vectors', 'embeddings', 'database', 'pgvector'],
  'David',
  78,
  false,
  NOW() - INTERVAL '10 days'
),
(
  'local-llm-ollama-guide',
  'Running LLMs Locally with Ollama: A Practical Guide',
  'How to run powerful language models on your own hardware using Ollama — no cloud API needed.',
  E'## Why Run LLMs Locally?\n\n- **Privacy** — Your data never leaves your machine\n- **Cost** — No per-token API charges\n- **Speed** — No network latency for inference\n- **Offline** — Works without internet\n\n### Getting Started with Ollama\n\n```bash\n# Install Ollama\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# Pull a model\nollama pull llama3.1\n\n# Chat with it\nollama run llama3.1 "Explain MCP protocol in one paragraph"\n```\n\n### Hardware Requirements\n\n| Model | Parameters | RAM Required | GPU VRAM |\n|-------|-----------|-------------|----------|\n| Llama 3.1 8B | 8B | 8GB | 6GB |\n| Mistral 7B | 7B | 8GB | 6GB |\n| Llama 3.1 70B | 70B | 48GB | 40GB |\n| Mixtral 8x7B | 47B | 32GB | 24GB |\n\n### API Integration\n\nOllama exposes an OpenAI-compatible API at `http://localhost:11434`:\n\n```python\nimport openai\n\nclient = openai.OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")\nresponse = client.chat.completions.create(\n    model="llama3.1",\n    messages=[{"role": "user", "content": "Hello!"}]\n)\n```',
  NULL,
  'tutorial',
  ARRAY['ollama', 'local-llm', 'llama', 'self-hosted', 'privacy'],
  'David',
  34,
  false,
  NOW() - INTERVAL '15 days'
);

#!/bin/bash

echo "🔄 Applying TTS enhancement database migration..."

# Extract database connection details from environment
source .env.local

# Run the SQL migration
psql "$DATABASE_URL" << 'EOF'
-- Add columns for enhanced TTS functionality

-- Add audio timestamps and content tracking to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_timestamps JSONB;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_outdated BOOLEAN DEFAULT false;

-- Add audio timestamps and content tracking to labs
ALTER TABLE labs ADD COLUMN IF NOT EXISTS audio_timestamps JSONB;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
ALTER TABLE labs ADD COLUMN IF NOT EXISTS audio_outdated BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_content_hash ON lessons(content_hash);
CREATE INDEX IF NOT EXISTS idx_lessons_audio_outdated ON lessons(audio_outdated);
CREATE INDEX IF NOT EXISTS idx_labs_content_hash ON labs(content_hash);
CREATE INDEX IF NOT EXISTS idx_labs_audio_outdated ON labs(audio_outdated);

-- Add GIN index for JSONB timestamps for efficient querying
CREATE INDEX IF NOT EXISTS idx_lessons_audio_timestamps ON lessons USING GIN (audio_timestamps);
CREATE INDEX IF NOT EXISTS idx_labs_audio_timestamps ON labs USING GIN (audio_timestamps);

-- Show results
SELECT 'Migration completed successfully!' as status;
EOF

echo "✅ Migration completed!"
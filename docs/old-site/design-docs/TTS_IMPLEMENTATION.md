# Text-to-Speech (TTS) Implementation

## Overview

This document describes the text-to-speech system implemented for GWTH.ai, which automatically generates audio files during lesson and lab publishing.

## Features

- **Automatic Audio Generation**: Audio files are generated when content is published
- **Caching System**: Audio files are cached locally to reduce costs and improve performance
- **Content Hash Tracking**: Only regenerates audio when content changes
- **Provider Abstraction**: Easy switching between TTS providers (currently Google Cloud TTS)
- **Cost Tracking**: Monitors TTS usage and costs
- **Modern Audio Player**: Custom audio player with speed controls, progress tracking, and download
- **Publishing Confirmation**: Option to skip audio generation during publishing

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Lesson/Lab      │    │  TTS Service    │    │   File Storage  │
│ Publishing      │───▶│ - Google TTS    │───▶│ /public/audio/  │
│                 │    │ - Cost Tracking │    │ - lessons/      │
│                 │    │ - Caching       │    │ - labs/         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup

### 1. Google Cloud TTS Setup

1. Create a Google Cloud project
2. Enable the Text-to-Speech API
3. Create a service account with TTS permissions
4. Download the service account key JSON

### 2. Environment Variables

Copy the TTS environment variables to your `.env.local`:

```bash
# TTS Provider
TTS_PROVIDER=google

# Google Cloud TTS
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account",...}'

# Default Options
TTS_DEFAULT_VOICE=en-US-Wavenet-D
TTS_DEFAULT_LANGUAGE=en-US
```

### 3. Database Migration

Run the Prisma migration to add TTS fields:

```bash
npx prisma migrate dev
```

## Usage

### Publishing Content

When publishing a lesson or lab, the system will:

1. Show a confirmation dialog with audio generation option
2. Estimate the cost based on character count
3. Generate audio if requested
4. Cache the audio file locally
5. Track usage for cost monitoring

### Audio Player

The audio player appears on lesson and lab pages when audio is available:

- Play/Pause controls
- 10-second skip forward/backward
- Playback speed adjustment (0.5x to 2x)
- Volume control
- Progress bar with seek
- Download button

### Cost Monitoring

View TTS usage statistics at `/backend/tts-usage` (admin only):

- Total characters processed
- Total cost estimate
- Usage by content type
- Recent generation history
- Success/failure rates

## File Structure

```
/public/audio/
├── lessons/
│   └── {lessonId}_{contentHash}.mp3
└── labs/
    └── {labId}_{contentHash}.mp3
```

## API Endpoints

### Publishing with Audio

```typescript
POST /api/lessons/{id}/publish
{
  "isPublished": true,
  "generateAudio": true  // Optional, defaults to true
}
```

### TTS Usage Stats

```typescript
GET /api/backend/tts-usage
// Returns usage statistics and cost data
```

## Content Preparation

The system prepares content for TTS by:

1. Extracting title and description
2. Including introduction/video scripts
3. Parsing structured content (JSON)
4. Removing HTML/Markdown formatting
5. Combining into natural reading order

## Cost Optimization

- **Content Hashing**: Only regenerates when content changes
- **Local Caching**: Serves from cache when possible
- **Selective Generation**: Option to skip audio during publishing
- **WaveNet Voices**: Better quality at $16/million characters

## Future Enhancements

1. **CDN Integration**: Serve audio files from CDN
2. **Multiple Voices**: Support different voices for sections
3. **SSML Support**: Enhanced pronunciation and emphasis
4. **Batch Processing**: Generate multiple files efficiently
5. **Alternative Providers**: Azure, AWS Polly, OpenAI TTS

## Troubleshooting

### Audio Not Generating

1. Check Google Cloud credentials in environment
2. Verify TTS API is enabled in Google Cloud Console
3. Check server logs for error messages
4. Ensure sufficient Google Cloud quota

### High Costs

1. Review content length before publishing
2. Use publishing dialog to skip audio when not needed
3. Monitor usage at `/backend/tts-usage`
4. Consider implementing character limits

### Audio Quality Issues

1. Review content formatting (remove special characters)
2. Test different voices (Wavenet vs Standard)
3. Adjust speaking rate in TTS options
4. Consider SSML markup for better control

## Security Considerations

- Service account keys should never be committed
- Audio files are publicly accessible once generated
- Consider access controls for premium content audio
- Monitor for unusual usage patterns
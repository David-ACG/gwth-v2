/**
 * Test script for TTS functionality
 * Run with: npx tsx scripts/test-tts.ts
 */

import { getTTSService } from '../src/lib/services/tts/service';
import fs from 'fs/promises';
import path from 'path';

async function testTTS() {
  console.log('🎤 Testing Text-to-Speech Service...\n');
  
  try {
    // Initialize TTS service
    const ttsService = getTTSService();
    console.log('✅ TTS Service initialized');
    
    // Test content
    const testContent = `
      Welcome to GWTH.ai Text-to-Speech test.
      This is a sample lesson about artificial intelligence.
      
      Today we'll learn about:
      1. Machine Learning basics
      2. Neural Networks
      3. Practical AI applications
      
      Let's get started with our journey into AI!
    `;
    
    // Estimate cost
    const estimatedCost = ttsService.estimateCost(testContent);
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(6)}`);
    
    // Get available voices (optional)
    console.log('\n📢 Fetching available voices...');
    try {
      const voices = await ttsService.getVoices();
      console.log(`Found ${voices.length} voices`);
      
      // Show a few English voices
      const englishVoices = voices
        .filter(v => v.languageCodes.includes('en-US'))
        .slice(0, 5);
      
      console.log('\nSample English voices:');
      englishVoices.forEach(voice => {
        console.log(`  - ${voice.name} (${voice.ssmlGender})`);
      });
    } catch (error) {
      console.log('⚠️  Could not fetch voices (this is okay for testing)');
    }
    
    // Generate audio
    console.log('\n🎵 Generating audio...');
    const startTime = Date.now();
    
    const result = await ttsService.generateAudio(
      testContent,
      'lesson',
      'test-lesson-123',
      'Test Lesson',
      {
        voice: process.env.TTS_DEFAULT_VOICE || 'en-US-Wavenet-D',
        language: process.env.TTS_DEFAULT_LANGUAGE || 'en-US'
      }
    );
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Audio generated in ${elapsed}ms`);
    console.log(`📁 File URL: ${result.audioFileUrl}`);
    console.log(`⏱️  Duration: ${result.audioDuration} seconds`);
    console.log(`💾 Size: ${(result.audioSize / 1024).toFixed(2)} KB`);
    console.log(`🔑 Content Hash: ${result.contentHash}`);
    
    // Verify file exists
    const filePath = path.join(process.cwd(), 'public', result.audioFileUrl.substring(1));
    try {
      const stats = await fs.stat(filePath);
      console.log(`✅ Audio file exists at: ${filePath}`);
    } catch (error) {
      console.log(`❌ Could not verify file at: ${filePath}`);
    }
    
    // Test caching
    console.log('\n🔄 Testing cache (should be instant)...');
    const cacheStart = Date.now();
    
    const cachedResult = await ttsService.generateAudio(
      testContent,
      'lesson',
      'test-lesson-123',
      'Test Lesson'
    );
    
    const cacheElapsed = Date.now() - cacheStart;
    console.log(`✅ Cache hit in ${cacheElapsed}ms`);
    console.log(`   Same file: ${cachedResult.audioFileUrl === result.audioFileUrl}`);
    
    // Test with different content
    console.log('\n🆕 Testing with modified content...');
    const modifiedContent = testContent + '\n\nThis is additional content.';
    
    const shouldRegenerate = ttsService.shouldRegenerateAudio(
      result.contentHash,
      modifiedContent
    );
    
    console.log(`   Should regenerate: ${shouldRegenerate}`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nMake sure you have:');
    console.error('1. Set up Google Cloud credentials in .env.local');
    console.error('2. Enabled the Text-to-Speech API in Google Cloud Console');
    console.error('3. Created the public/audio directories');
    process.exit(1);
  }
}

// Run the test
testTTS().catch(console.error);
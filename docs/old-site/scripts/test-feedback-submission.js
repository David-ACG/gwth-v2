#!/usr/bin/env node

// Test script to submit feedback with screenshot
// Run: node scripts/test-feedback-submission.js

const fs = require('fs');
const path = require('path');

// Create a simple test image as base64
function createTestImage() {
  // Create a simple 1x1 pixel PNG image
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02, // bit depth = 8, color type = 2 (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xde, // CRC
    0x00, 0x00, 0x00, 0x0c, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xfe, 0xff, 0x00, 0x00, 0x00, 0x02, // pixel data
    0x00, 0x01, // CRC start
    0x4f, 0xc1, 0x16, 0xb2, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk size
    0x49, 0x45, 0x4e, 0x44, // IEND
    0xae, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return `data:image/png;base64,${pngHeader.toString('base64')}`;
}

async function testFeedbackSubmission() {
  const testData = {
    action: "submit",
    subject: "Test Feedback Submission with Screenshot",
    content: "This is a test feedback submission to verify MinIO screenshot upload is working correctly.",
    screenshot: createTestImage(),
    category: "bug",
    rating: 4,
    userEmail: "test@example.com",
    userName: "Test User",
    lessonId: null,
    labId: null,
    courseId: null,
  };

  try {
    console.log('Submitting test feedback with screenshot...');
    
    const response = await fetch('http://localhost:3001/api/backend/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Feedback submitted successfully!');
      console.log('Response:', result);
      
      if (result.feedbackId) {
        console.log(`\nFeedback ID: ${result.feedbackId}`);
        console.log('You can check the feedback in the admin panel at:');
        console.log('http://localhost:3001/backend/feedback');
      }
    } else {
      console.error('❌ Failed to submit feedback:');
      console.error('Status:', response.status);
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
  }
}

// Run the test
testFeedbackSubmission();
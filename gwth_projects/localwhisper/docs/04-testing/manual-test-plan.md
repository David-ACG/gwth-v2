# Manual Test Plan

## Date: 2026-02-14

## Purpose
Some features require manual testing because they involve hardware interaction,
visual verification, or cross-application behavior.

## Test Procedures

### MT-01: Basic Dictation in Notepad
1. Start LocalWhisper
2. Open Notepad
3. Click in Notepad's text area
4. Hold Ctrl+Shift+Space
5. Say "Hello, this is a test of local whisper"
6. Release Ctrl+Shift+Space
7. **Expected**: Text appears in Notepad within 2 seconds
8. **Pass criteria**: Text is reasonably accurate (>80% of words correct)

### MT-02: Dictation in Notion
1. Start LocalWhisper
2. Open Notion in browser
3. Click in a text block
4. Hold Ctrl+Shift+Space
5. Say "Meeting notes for February fourteenth"
6. Release hotkey
7. **Expected**: Text appears in Notion text block
8. **Pass criteria**: Text appears, formatting preserved

### MT-03: Dictation in Warp Terminal
1. Start LocalWhisper
2. Open Warp terminal
3. Click in command line
4. Hold Ctrl+Shift+Space
5. Say "git status"
6. Release hotkey
7. **Expected**: "git status" appears at cursor (using Ctrl+Shift+V)
8. **Pass criteria**: Text appears correctly, no garbled characters

### MT-04: Dictation in Claude Code (Warp)
1. Start LocalWhisper
2. Open Claude Code in Warp
3. At the prompt, hold Ctrl+Shift+Space
4. Say "Please fix the failing test"
5. Release hotkey
6. **Expected**: Text appears in Claude Code input
7. **Pass criteria**: Full sentence appears correctly

### MT-05: Overlay Behavior
1. Start recording
2. **Check**: Red overlay appears at top of screen
3. **Check**: Overlay does NOT steal focus from current app
4. **Check**: You can still type in the focused app
5. Stop recording
6. **Check**: Overlay disappears

### MT-06: System Tray
1. Start LocalWhisper
2. **Check**: Green icon appears in system tray
3. Right-click tray icon
4. **Check**: Menu appears with all options
5. Click "Settings"
6. **Check**: Browser opens to settings page
7. Start recording
8. **Check**: Tray icon turns red
9. Stop recording
10. **Check**: Tray icon returns to green

### MT-07: Settings Persistence
1. Open settings page
2. Change model to "small"
3. Click Save
4. Quit LocalWhisper
5. Restart LocalWhisper
6. Open settings page
7. **Check**: Model is still "small"

### MT-08: Long Dictation
1. Open Notepad
2. Hold hotkey for 15 seconds while speaking continuously
3. Release hotkey
4. **Check**: All speech is transcribed (may take a few seconds)
5. **Check**: No words lost from beginning or end

### MT-09: Clipboard Preservation
1. Copy some text to clipboard ("ORIGINAL TEXT")
2. Open Notepad
3. Dictate "test dictation"
4. After text appears, Ctrl+V in another location
5. **Check**: "ORIGINAL TEXT" is pasted (clipboard was restored)

### MT-10: Multiple Rapid Dictations
1. Open Notepad
2. Dictate "First sentence" -> release -> wait for text
3. Dictate "Second sentence" -> release -> wait for text
4. Dictate "Third sentence" -> release -> wait for text
5. **Check**: All three sentences appear correctly
6. **Check**: No crashes or hangs between dictations

## Results Tracking

| Test ID | Date | Result | Notes |
|---------|------|--------|-------|
| MT-01 | | | |
| MT-02 | | | |
| MT-03 | | | |
| MT-04 | | | |
| MT-05 | | | |
| MT-06 | | | |
| MT-07 | | | |
| MT-08 | | | |
| MT-09 | | | |
| MT-10 | | | |

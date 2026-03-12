# Ralph Wiggum Autonomous Build Loop

## Date: 2026-02-14

## What Is This?
The "Ralph Wiggum Loop" is a self-sustaining autonomous development protocol.
Like Ralph Wiggum, it does its own thing without asking questions.
Every decision is pre-made. Every gate is automated. Every failure has a recovery path.

## The Loop

```
START
  |
  v
[Read Phase Doc] --> [Execute Tasks] --> [Run Tests]
                                              |
                                       Pass?  |
                                      /       |        \
                                   Yes        |        No
                                    |         |         |
                                    v         |         v
                             [Log Success]    |   [Fix & Retry]
                                    |         |         |
                                    v         |    Attempt <= 3?
                             [Check Context]  |    /          \
                                    |         |  Yes           No
                              > 120k?        |   |             |
                              /      \       |   v             v
                            Yes       No     | [Retry]    [STOP & Log]
                             |         |     |               Error
                             v         v     |
                        [/compact]  [Next    |
                             |      Phase]   |
                             v         |     |
                        [Continue]<----+-----+
                             |
                             v
                        All Phases Done?
                        /            \
                      Yes             No
                       |               |
                       v               v
                    [DONE]         [Next Phase]
```

## Pre-Made Decisions (No Questions Needed)

### Architecture Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | Python 3.11+ | faster-whisper native, single stack |
| Speech engine | faster-whisper | Best perf/VRAM for CTranslate2 |
| Default model | large-v3-turbo int8 | Best accuracy in 4GB VRAM |
| Fallback model | small float16 | Fast, reliable fallback |
| Audio library | sounddevice | Cross-platform, simple API |
| Hotkey library | keyboard | Global hotkeys, push-to-talk |
| Text injection | Clipboard + Ctrl+V | Most reliable across all apps |
| Terminal detect | win32 window class | Accurate, no false positives |
| System tray | pystray | Lightweight, pure Python |
| Overlay | tkinter | Built-in, no extra deps |
| Settings UI | FastAPI + Jinja2 | Playwright-testable |
| Database | SQLite (stdlib) | Zero config, embedded |
| Config format | TOML (stdlib) | Human-readable, Python 3.11+ |
| Testing | pytest + Playwright | Industry standard |
| Hotkey default | Ctrl+Shift+Space | Doesn't conflict with common shortcuts |
| Server port | 9876 | Uncommon, unlikely to conflict |

### When Things Go Wrong
| Situation | Automatic Resolution |
|-----------|---------------------|
| Model download fails | Retry once, then use smallest available model |
| CUDA not available | Fall back to CPU with warning |
| Microphone not found | Show error in tray, disable recording |
| Port in use | Try ports 9876-9886 |
| Clipboard access fails | Retry once, then skip injection with error |
| Test fails | Fix code, retry (max 3 attempts) |
| Same test fails 3x | STOP, log detailed error to errors.md |
| Context > 120k tokens | Run /compact, then continue |
| Import error | Check requirements, pip install, retry |
| Permission denied | Log warning, suggest run as admin |

## Phase Execution Protocol

For each phase (0-6):

1. **READ**: Read the phase document completely
2. **CREATE**: Create all files described in the phase
3. **TEST**: Run all tests listed in acceptance criteria
4. **VERIFY**: All tests pass = proceed. Any failure = fix & retry.
5. **COMPACT**: If context > 100k estimated, run /compact
6. **LOG**: Write phase completion to `docs/05-operations/build-log.md`
7. **NEXT**: Move to next phase

## Context Window Budget

| Phase | Estimated Context Cost | Running Total | Action |
|-------|----------------------|---------------|--------|
| Research & Plan | ~30k | 30k | - |
| Phase 0: Setup | ~15k | 45k | - |
| Phase 1: Core | ~30k | 75k | /compact -> ~25k |
| Phase 2: Injection | ~20k | 45k | - |
| Phase 3: UI | ~20k | 65k | - |
| Phase 4: Web | ~30k | 95k | /compact -> ~30k |
| Phase 5: Integration | ~25k | 55k | - |
| Phase 6: Security | ~10k | 65k | - |
| Buffer | ~35k | 100k | Safe margin |

**Hard limit**: Never exceed 120k / 200k (60%)
**Compact trigger**: At 100k or after every 2 phases

## Build Log Template

Each phase completion is logged:

```markdown
## Phase X: [Name]
- **Started**: [timestamp]
- **Completed**: [timestamp]
- **Tests**: X passed, Y failed, Z skipped
- **Files Created**: [list]
- **Files Modified**: [list]
- **Issues Encountered**: [list or "none"]
- **Context at completion**: ~Xk (estimated)
- **Compacted**: Yes/No
```

## Emergency Stop Conditions

The loop STOPS immediately if:
1. Same test fails 3 times with identical error
2. Unrecoverable error (disk full, Python not found, etc.)
3. Context exceeds 150k tokens (emergency)
4. Circular dependency detected in fixes

When stopped, write full diagnostic to `docs/05-operations/errors.md`:
- Phase and task where failure occurred
- Full error message and stack trace
- What was tried
- Suggested next steps for human

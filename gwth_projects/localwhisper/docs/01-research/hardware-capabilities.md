# Hardware Capabilities & Model Selection

## Date: 2026-02-14

## Target Hardware

| Component | Spec |
|-----------|------|
| GPU | NVIDIA T1000 (Turing architecture) |
| VRAM | 4GB GDDR6 |
| CUDA Cores | 896 |
| Platform | Windows 11 Pro |
| Use Case | Real-time speech-to-text dictation |

## faster-whisper Model VRAM Requirements

| Model | Parameters | float16 VRAM | int8 VRAM | Relative Speed |
|-------|-----------|-------------|-----------|----------------|
| tiny | 39M | ~1 GB | ~0.5 GB | Fastest |
| base | 74M | ~1 GB | ~0.7 GB | Very Fast |
| small | 244M | ~2 GB | ~1.2 GB | Fast |
| medium | 769M | ~5 GB | ~2.5 GB | Moderate |
| large-v3 | 1550M | ~10 GB | ~4.7 GB | Slow |
| large-v3-turbo | 809M | ~5 GB | ~2.5 GB | Fast (best ratio) |

## Recommended Model Strategy for T1000 (4GB)

### Primary: `large-v3-turbo` with int8 quantization
- **VRAM**: ~2.5 GB (fits comfortably in 4GB)
- **Speed**: 19.6s for 13min audio (benchmark) = ~40x real-time
- **Quality**: Near large-v3 accuracy with turbo speed
- **Why**: Best accuracy-to-speed ratio that fits our VRAM

### Fallback: `medium` with int8 quantization
- **VRAM**: ~2.5 GB
- **Speed**: Slightly slower than turbo but proven reliable
- **Quality**: Good for English, acceptable for multilingual

### Quick Mode: `small` with float16
- **VRAM**: ~2 GB
- **Speed**: Very fast, nearly instant for short clips
- **Quality**: Good for English, adequate for common languages

## Performance Expectations

Based on benchmarks with similar hardware:
- **Latency target**: <1 second for 5-second audio clips
- **End-to-end**: 380-520ms (audio capture to transcript) with Silero VAD
- **Silero VAD**: <1ms per 30ms audio chunk on CPU
- **Real-time factor**: >10x (processes audio 10x faster than real-time)

## CUDA Setup Requirements

```
CUDA Toolkit: 12.x (compatible with faster-whisper CTranslate2)
cuDNN: 9.x (bundled with faster-whisper wheels)
Driver: 560+ (Windows 11 latest recommended)
```

## Sources
- [Tom's Hardware Whisper GPU Benchmarks](https://www.tomshardware.com/news/whisper-audio-transcription-gpus-benchmarked)
- [faster-whisper GitHub](https://github.com/SYSTRAN/faster-whisper)
- [faster-whisper turbo benchmark](https://github.com/SYSTRAN/faster-whisper/issues/1030)
- [OpenAI Whisper GPU Discussion #918](https://github.com/openai/whisper/discussions/918)

# Platform Specifications, Clip Lengths, and Reframing

Read this when the user names a platform, asks for clips or chunking, or asks to reframe or export for one or more platforms. The FFmpeg commands for each reframing strategy are in `../operations.md` ("Social Media Reframing").

## Platform Specifications

| Platform | Aspect Ratio | Resolution | Duration Range | Ideal Length | Max File Size |
|----------|-------------|------------|---------------|-------------|--------------|
| **TikTok** | 9:16 vertical | 1080--1920 | 10--45s | 25s | 287 MB |
| **Instagram Reels** | 9:16 vertical | 1080--1920 | 10--30s | 20s | 250 MB |
| **Instagram Stories** | 9:16 vertical | 1080--1920 | 1--60s | 15s | 250 MB |
| **Instagram Feed** | 1:1 square or 4:5 portrait | 1080--1080 or 1080--1350 | 3--60s | 30s | 250 MB |
| **YouTube Shorts** | 9:16 vertical | 1080--1920 | 15--60s | 40s | 256 MB |
| **YouTube (standard)** | 16:9 landscape | 1920--1080 | any | any | 256 GB |
| **X / Twitter** | 16:9 landscape | 1280--720 | 10--45s | 25s | 512 MB |
| **X / Twitter (square)** | 1:1 square | 720--720 | 10--45s | 25s | 512 MB |
| **Facebook Reels** | 9:16 vertical | 1080--1920 | 10--30s | 20s | 250 MB |
| **Facebook Feed** | 16:9 or 1:1 | 1920--1080 or 1080--1080 | any | 15--60s | 4 GB |
| **LinkedIn** | 16:9 landscape or 1:1 | 1920--1080 or 1080--1080 | 10--60s | 30s | 5 GB |
| **Pinterest** | 9:16 or 2:3 vertical | 1080--1920 or 1000--1500 | 6--60s | 15--30s | 2 GB |
| **Snapchat Spotlight** | 9:16 vertical | 1080--1920 | 5--60s | 15--30s | 250 MB |

**When the user says a platform name, apply both the correct duration targets AND the correct aspect ratio/resolution.** For example:

- "Make TikTok clips" -- chunk to 10-45s AND reframe to 9:16 (1080--1920)
- "Instagram feed posts" -- chunk to 3-60s AND reframe to 1:1 (1080--1080) or 4:5 (1080--1350)
- "YouTube Shorts" -- chunk to 15-60s AND reframe to 9:16 (1080--1920)
- "Clips for X" -- chunk to 10-45s, keep 16:9 (1280--720)

## Clip Length Guidelines

| Platform | Ideal Length | Max Length | Notes |
|----------|-------------|------------|-------|
| TikTok | 15-45s | 10 min | 15-30s performs best for new accounts |
| Instagram Reels | 15-30s | 90s | Under 30s gets more reach |
| YouTube Shorts | 30-60s | 60s | Hard cap at 60 seconds |
| X / Twitter | 15-45s | 2m 20s | Shorter gets more engagement |

## Social Media Reframing

Automatically reframe videos for different social media platforms. Each platform has a preferred aspect ratio and resolution -- this feature handles the conversion intelligently.

### Platform Specs

| Platform | Aspect Ratio | Resolution | Notes |
|----------|-------------|------------|-------|
| YouTube | 16:9 | 1920x1080 | Standard landscape, also supports 4K (3840x2160) |
| TikTok / Reels | 9:16 | 1080x1920 | Vertical video, max 60s for Reels, 10min for TikTok |
| Instagram Feed | 1:1 | 1080x1080 | Square format |
| X / Twitter | 16:9 or 1:1 | 1280x720 or 720x720 | Supports both, 2min 20s max |

### Reframing Strategies

When converting between aspect ratios, there are three strategies:

1. **Center crop** (default) -- Crop from the center to fill the target ratio. Fast, works well for most content. May cut off edges.
2. **Letterbox/pillarbox** -- Add black bars (or blurred background) to fit without cropping. Preserves all content but adds empty space.
3. **Blurred fill** -- Use a blurred, scaled-up version of the video as the background behind the original. Looks much better than black bars, especially for vertical reframing. This is the recommended approach for going from 16:9 to 9:16.

### Multi-platform Export

When the user wants to export for multiple platforms at once, generate all versions in a batch:

```text
Input (16:9) -- YouTube (copy) + TikTok (9:16 blurred fill) + Instagram (1:1 center crop) + X (1280x720 copy)
```

This is a common workflow -- the user shoots in landscape and needs versions for every platform.

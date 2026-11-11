# FFmpeg Setup, Code Patterns, and Editor UI

Read this before writing the first script or API route for a video task, when you need the installed codec list, or when the user wants a video editor UI. Exact FFmpeg commands for each operation are in `../operations.md`.

## Environment

FFmpeg 6.1.2 is pre-installed in Replit with full codec support:

- **Video codecs:** H.264 (libx264), H.265 (libx265), VP8/VP9 (libvpx), AV1 (libaom, libsvtav1, librav1e), Theora
- **Audio codecs:** AAC, MP3 (libmp3lame), Opus, Vorbis, FLAC, WAV
- **Image formats:** PNG, JPEG, WebP, JPEG XL (libjxl)
- **Subtitle rendering:** libass (for styled subtitles), libfreetype + libfontconfig (for drawtext)
- **Filters:** All standard filters available -- scale, crop, overlay, drawtext, concat, fade, crossfade, etc.
- **Tools:** `ffmpeg`,`ffprobe` (both available on PATH)

No additional installation is needed for FFmpeg itself.

## Architecture Decisions

### Script-based editing (simple tasks)

For one-off or single-operation tasks (trim a clip, convert a format, extract audio), write a Node.js script in `scripts/src/`using`fluent-ffmpeg`or direct`child_process.execFile` calls to FFmpeg.

```bash
pnpm --filter @workspace/scripts add fluent-ffmpeg
pnpm --filter @workspace/scripts add -D @types/fluent-ffmpeg
```

### API-based editing (complex workflows or UI)

For multi-step editing workflows or when building a video editor UI, add routes to the API server (`artifacts/api-server/`) that accept video files, process them with FFmpeg, and return results.

```bash
pnpm --filter @workspace/api-server add fluent-ffmpeg multer
pnpm --filter @workspace/api-server add -D @types/fluent-ffmpeg @types/multer
```

### Choosing the right approach

| Scenario | Approach |
|----------|----------|
| "Trim this video to 0:30-1:15" | Script in `scripts/src/` |
| "Convert this MP4 to WebM" | Script in `scripts/src/` |
| "Build me a video editor app" | React-vite artifact + API routes |
| "Add subtitles to all my videos" | Script in `scripts/src/` |
| "Merge these 5 clips with transitions" | Script in `scripts/src/` (or API if repeated) |

## Code Patterns

### Probe Before Processing

Always probe the input file first to understand its properties. This prevents errors from wrong assumptions about codecs, resolution, frame rate, or duration.

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function probeVideo(filePath: string) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath
  ]);
  return JSON.parse(stdout);
}
```

### Use fluent-ffmpeg for Complex Operations

fluent-ffmpeg provides a chainable API that is easier to maintain than raw command strings. Use it for multi-step operations.

```typescript
import ffmpeg from 'fluent-ffmpeg';

function trimVideo(input: string, output: string, start: string, duration: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(start)
      .setDuration(duration)
      .output(output)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### Use execFile for Simple One-Liners

For straightforward operations where the FFmpeg command is well-known, calling FFmpeg directly is cleaner.

```typescript
await execFileAsync('ffmpeg', [
  '-i', inputPath,
  '-vf', 'scale=1280:720',
  '-c:a', 'copy',
  outputPath
]);
```

### Progress Reporting

FFmpeg outputs progress to stderr. Parse it for progress reporting in longer operations:

```typescript
ffmpeg(input)
  .output(output)
  .on('progress', (progress) => {
    console.log(`Processing: ${progress.percent?.toFixed(1)}% done`);
  })
  .on('end', () => console.log('Done'))
  .run();
```

## Building a Video Editor UI

If the user wants a visual editor interface:

1. Create a `react-vite` artifact for the frontend
2. Add API routes to `artifacts/api-server/` for video processing
3. Use `multer` for file uploads to the API
4. Process videos with FFmpeg on the server
5. Return processed files for download or preview
6. Use the `object-storage` skill for persisting uploaded and processed files if needed

Key frontend considerations:

- Use `<video>` element for preview playback
- Show a timeline UI for trim/cut operations
- Display progress during processing (poll an API status endpoint or use Server-Sent Events)
- Provide download links for processed output

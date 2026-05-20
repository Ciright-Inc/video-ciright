# Video HLS Transcoder

Standalone Node.js service that converts uploaded S3 videos to adaptive HLS (m3u8 + segments).

## Requirements

- Node.js 20+
- ffmpeg installed on the host (`apt install ffmpeg` or use Docker)

## Setup

```bash
cd services/transcoder
cp .env.example .env
# Fill AWS credentials and TRANSCODE_SECRET (must match Next.js app)
npm install
```

## Run

```bash
npm run dev
```

Service listens on `http://localhost:4000`.

## Docker

```bash
docker build -t video-transcoder .
docker run -p 4000:4000 --env-file .env video-transcoder
```

## API

### `POST /transcode`

```json
{
  "videoId": "cuid",
  "channelId": "cuid",
  "s3Key": "videos/{channelId}/{videoId}/original.mp4",
  "callbackUrl": "https://your-app/api/videos/{id}/transcode-complete",
  "secret": "shared-secret"
}
```

Returns `202` immediately; processing runs in the background.

### `GET /health`

Health check.

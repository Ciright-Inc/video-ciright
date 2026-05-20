export type TranscodeRequest = {
  videoId: string;
  channelId: string;
  s3Key: string;
  callbackUrl: string;
  secret: string;
};

export type TranscodeCallbackPayload = {
  secret: string;
  status: "ready" | "failed";
  videoUrl?: string;
  duration?: number;
  error?: string;
};

export function getWatchUrl(videoId: string, origin: string) {
  return `${origin}/watch/${videoId}`;
}

export type ShareChannel = {
  id: string;
  label: string;
  getShareUrl: (params: { url: string; title: string }) => string;
};

export const SHARE_CHANNELS: ShareChannel[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    getShareUrl: ({ url, title }) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: "gmail",
    label: "Gmail",
    getShareUrl: ({ url, title }) =>
      `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    getShareUrl: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    getShareUrl: ({ url, title }) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    getShareUrl: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    getShareUrl: ({ url, title }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    getShareUrl: ({ url, title }) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

export function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

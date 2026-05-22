import type { NotificationType } from "@prisma/client";

function actorName(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed : null;
}

function othersPhrase(count: number): string {
  if (count <= 0) return "";
  if (count === 1) return " and 1 other";
  return ` and ${count} others`;
}

function peoplePhrase(count: number, verb: string): string {
  if (count === 1) return `Someone ${verb}`;
  return `${count} people ${verb}`;
}

type FormatInput = {
  type: NotificationType;
  actorCount: number;
  latestActorName?: string | null;
  channelName?: string | null;
};

export function formatNotificationMessage({
  type,
  actorCount,
  latestActorName,
  channelName,
}: FormatInput): string {
  const name = actorName(latestActorName);
  const others = actorCount - 1;

  switch (type) {
    case "VIDEO_LIKE": {
      if (name) {
        return others > 0
          ? `${name}${othersPhrase(others)} liked your video`
          : `${name} liked your video`;
      }
      return peoplePhrase(actorCount, "liked your video");
    }
    case "VIDEO_DISLIKE": {
      if (name) {
        return others > 0
          ? `${name}${othersPhrase(others)} disliked your video`
          : `${name} disliked your video`;
      }
      return peoplePhrase(actorCount, "disliked your video");
    }
    case "COMMENT_LIKE": {
      if (name) {
        return others > 0
          ? `${name}${othersPhrase(others)} liked your comment`
          : `${name} liked your comment`;
      }
      return peoplePhrase(actorCount, "liked your comment");
    }
    case "COMMENT_DISLIKE": {
      if (name) {
        return others > 0
          ? `${name}${othersPhrase(others)} disliked your comment`
          : `${name} disliked your comment`;
      }
      return peoplePhrase(actorCount, "disliked your comment");
    }
    case "COMMENT_REPLY": {
      if (name) {
        return others > 0
          ? `${name}${othersPhrase(others)} replied to your comment`
          : `${name} replied to your comment`;
      }
      return peoplePhrase(actorCount, "replied to your comment");
    }
    case "SUBSCRIPTION_NEW_VIDEO": {
      const channel = channelName?.trim() || "A channel you follow";
      if (actorCount > 1) {
        return `${channel} uploaded ${actorCount} new videos`;
      }
      return `${channel} uploaded a new video`;
    }
    case "CHANNEL_NEW_SUBSCRIBER": {
      if (actorCount > 1) {
        return `${actorCount.toLocaleString()} new subscribers`;
      }
      if (name) {
        return `${name} subscribed to your channel`;
      }
      return "Someone subscribed to your channel";
    }
    default:
      return "New notification";
  }
}

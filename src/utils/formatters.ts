import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy");
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm");
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

interface TextStats {
  words: number;
  characters: number;
  readingTime: number;
}

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, "");
};

export const getTextStats = (content: string): TextStats => {
  const text = stripHtml(content);
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const characters = text.replace(/\s/g, "").length;

  // Average reading speed: 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(words.length / 200));

  return {
    words: words.length,
    characters,
    readingTime: readingTimeMinutes,
  };
};

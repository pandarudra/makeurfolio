import { Globe, Code2, Briefcase, MessageSquare, Video, Link as LinkIcon, MessageCircle, FileText, PenTool } from "lucide-react";
import React from "react";
export interface NormalizedSocialLink {
  label: string;
  url: string;
  icon: string;
}
/**
 * Normalizes a URL and extracts a standard label and icon name.
 * 
 * Supports platforms: GitHub, LinkedIn, Twitter/X, Telegram, Medium, Dev.to, Hashnode, YouTube, Personal Blogs
 */
export function normalizeSocialLink(rawUrl: string): NormalizedSocialLink {
  // Basic normalization: ensure it starts with https:// if it looks like a domain
  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    // Check if it looks like an email
    if (url.includes("@") && !url.includes("/")) {
      return { label: "Email", url: `mailto:${url}`, icon: "mail" };
    }
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    // Map common domains to standard labels and icons
    if (hostname.includes("github.com")) {
      return { label: "GitHub", url, icon: "github" };
    }
    if (hostname.includes("linkedin.com")) {
      return { label: "LinkedIn", url, icon: "linkedin" };
    }
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return { label: "X (Twitter)", url, icon: "twitter" };
    }
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return { label: "YouTube", url, icon: "youtube" };
    }
    if (hostname.includes("t.me") || hostname.includes("telegram.me")) {
      return { label: "Telegram", url, icon: "message-circle" };
    }
    if (hostname.includes("medium.com")) {
      return { label: "Medium", url, icon: "file-text" };
    }
    if (hostname.includes("dev.to")) {
      return { label: "Dev.to", url, icon: "code" };
    }
    if (hostname.includes("hashnode.com") || hostname.includes("hashnode.dev")) {
      return { label: "Hashnode", url, icon: "pen-tool" };
    }
    if (hostname.includes("discord.com") || hostname.includes("discord.gg")) {
      return { label: "Discord", url, icon: "message-circle" };
    }
    if (hostname.includes("dribbble.com")) {
      return { label: "Dribbble", url, icon: "globe" }; // Dribbble exists in lucide but keeping standard globe if missing
    }
    if (hostname.includes("behance.net")) {
      return { label: "Behance", url, icon: "globe" };
    }
    if (hostname.includes("substack.com")) {
      return { label: "Substack", url, icon: "file-text" };
    }
    // Default for personal sites or unrecognized domains
    // Try to make a readable label from the hostname
    const cleanHost = hostname.replace(/^www\./, "");
    return { label: cleanHost, url, icon: "globe" };
  } catch (error) {
    // Invalid URL fallback
    return { label: "Website", url: rawUrl, icon: "link" };
  }
}
/**
 * Returns the corresponding Lucide React component for a given icon string.
 */
export function getSocialIconComponent(iconName: string): React.ElementType {
  switch (iconName) {
    case "github": return Code2;
    case "linkedin": return Briefcase;
    case "twitter": return MessageSquare;
    case "youtube": return Video;
    case "message-circle": return MessageCircle;
    case "file-text": return FileText;
    case "code": return Code2;
    case "pen-tool": return PenTool;
    case "globe": return Globe;
    case "link": return LinkIcon;
    default: return Globe;
  }
}

/**
 * Theme Manifest — Single source of truth for theme metadata.
 *
 * The editor's theme selector consumes this manifest to display
 * theme cards. Adding a new theme requires adding an entry here.
 */

export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  previewImage: string;
}

export const themes: ThemeMetadata[] = [
  {
    id: "minimal-editorial",
    name: "Minimal Editorial",
    description: "Clean recruiter-first design focused on readability",
    previewImage: "/themes/minimal-editorial.png",
  },
  {
    id: "founder-os",
    name: "Founder OS",
    description: "Modern founder / startup operator portfolio focused on products and impact",
    previewImage: "/themes/founder-os.png",
  },
];

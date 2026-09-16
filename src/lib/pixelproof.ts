export type IssueCategory = "Visual" | "Accessibility" | "Content" | "Interaction";
export type IssuePriority = "High" | "Medium" | "Low";
export type IssueStatus = "Open" | "Resolved";

export type ReviewIssue = {
  id: string;
  pageId: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  x: number;
  y: number;
  author: string;
  createdAt: string;
  comments: { id: string; text: string; author: string; createdAt: string }[];
};

export type ReviewPage = { id: string; name: string; path: string; url: string; reviewed: boolean; screenshotAssetId?: string };
export type ChecklistItem = { id: string; label: string; complete: boolean };
export type ReviewProject = {
  id: string;
  name: string;
  client: string;
  url: string;
  pages: ReviewPage[];
  issues: ReviewIssue[];
  checklist: ChecklistItem[];
  updatedAt: string;
  revision: number;
};

const timestamp = "2026-11-06T10:00:00.000Z";
export function createDemoProject(): ReviewProject {
  return {
    id: "sprout-marketing",
    name: "Sprout — Marketing site",
    client: "Studio North",
    url: "https://sprout.garden",
    updatedAt: timestamp,
    revision: 1,
    pages: [
      { id: "home", name: "Home", path: "/", url: "https://sprout.garden", reviewed: true },
      { id: "collection", name: "Shop all", path: "/collections/all", url: "https://sprout.garden/collections/all", reviewed: true },
      { id: "product", name: "Product detail", path: "/products/monstera", url: "https://sprout.garden/products/monstera", reviewed: false },
      { id: "story", name: "Our story", path: "/pages/our-story", url: "https://sprout.garden/pages/our-story", reviewed: false },
    ],
    issues: [
      { id: "issue-contrast", pageId: "home", title: "Button contrast is too low", description: "The secondary call-to-action falls below WCAG AA contrast guidelines. Darken the text or lighten the background so the label is easy to read.", category: "Accessibility", priority: "High", status: "Open", x: 72, y: 75, author: "Jamie D.", createdAt: timestamp, comments: [{ id: "comment-1", text: "I measured 3.2:1 here. The target is at least 4.5:1 for this text size.", author: "Alex M.", createdAt: timestamp }] },
      { id: "issue-heading", pageId: "home", title: "Heading wraps differently", description: "The H1 wraps one line earlier than the design reference at this viewport. Check the max-width and font metrics before reducing the type size.", category: "Visual", priority: "Medium", status: "Open", x: 36, y: 42, author: "Jamie D.", createdAt: timestamp, comments: [] },
      { id: "issue-alt", pageId: "home", title: "Missing image alt text", description: "Add a concise description for the product image so screen-reader users know what is shown.", category: "Accessibility", priority: "Low", status: "Resolved", x: 69, y: 47, author: "Alex M.", createdAt: timestamp, comments: [] },
      { id: "issue-price", pageId: "product", title: "Sale price needs a label", description: "Add a screen-reader label so the discounted price is announced clearly.", category: "Accessibility", priority: "Medium", status: "Open", x: 57, y: 57, author: "Jamie D.", createdAt: timestamp, comments: [] },
    ],
    checklist: [
      { id: "check-contrast", label: "Check color contrast on key actions", complete: false },
      { id: "check-mobile", label: "Review navigation at mobile widths", complete: true },
      { id: "check-keyboard", label: "Verify keyboard focus order", complete: false },
      { id: "check-images", label: "Confirm every image has useful alt text", complete: true },
      { id: "check-copy", label: "Proofread page titles and headings", complete: false },
      { id: "check-links", label: "Check links and buttons have clear names", complete: false },
    ],
  };
}

export function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)}`;
}

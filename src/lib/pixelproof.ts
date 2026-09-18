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

function isWebUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

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

export function validateBackup(value: unknown): ReviewProject[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error("The backup must contain at least one project.");
  const projectIds = new Set<string>();

  for (const project of value) {
    if (!project || typeof project.id !== "string" || typeof project.name !== "string" || typeof project.client !== "string" || typeof project.url !== "string" || !isWebUrl(project.url) || typeof project.updatedAt !== "string" || !Array.isArray(project.pages) || project.pages.length === 0 || !Array.isArray(project.issues) || !Array.isArray(project.checklist)) {
      throw new Error("This file does not look like a Pixelproof project backup.");
    }

    if (projectIds.has(project.id)) throw new Error("Project IDs must be unique in a backup.");
    projectIds.add(project.id);

    const pageIds = new Set<string>();
    const invalidPage = project.pages.some((page: unknown) => {
      if (!page || typeof page !== "object") return true;
      const candidate = page as ReviewPage;
      if (typeof candidate.id !== "string" || typeof candidate.name !== "string" || typeof candidate.path !== "string" || typeof candidate.url !== "string" || !isWebUrl(candidate.url) || typeof candidate.reviewed !== "boolean" || pageIds.has(candidate.id)) return true;
      pageIds.add(candidate.id);
      return false;
    });
    if (invalidPage) {
      throw new Error("A project in this backup has an invalid page entry.");
    }

    const issueIds = new Set<string>();
    const invalidIssue = project.issues.some((issue: unknown) => {
      if (!issue || typeof issue !== "object") return true;
      const candidate = issue as ReviewIssue;
      const invalidComments = !Array.isArray(candidate.comments) || candidate.comments.some((comment) => !comment || typeof comment.id !== "string" || typeof comment.text !== "string" || typeof comment.author !== "string" || typeof comment.createdAt !== "string");
      const invalidFields = typeof candidate.id !== "string" || typeof candidate.pageId !== "string" || !pageIds.has(candidate.pageId) || typeof candidate.title !== "string" || typeof candidate.description !== "string" || typeof candidate.author !== "string" || typeof candidate.createdAt !== "string" || !["Visual", "Accessibility", "Content", "Interaction"].includes(candidate.category) || !["High", "Medium", "Low"].includes(candidate.priority) || !["Open", "Resolved"].includes(candidate.status) || !Number.isFinite(candidate.x) || candidate.x < 0 || candidate.x > 100 || !Number.isFinite(candidate.y) || candidate.y < 0 || candidate.y > 100 || invalidComments || issueIds.has(candidate.id);
      if (typeof candidate.id === "string") issueIds.add(candidate.id);
      return invalidFields;
    });
    if (invalidIssue) {
      throw new Error("A project in this backup has an invalid feedback entry.");
    }
    if (project.checklist.some((item: unknown) => !item || typeof item !== "object" || typeof (item as ChecklistItem).id !== "string" || typeof (item as ChecklistItem).label !== "string" || typeof (item as ChecklistItem).complete !== "boolean")) {
      throw new Error("A project in this backup has an invalid checklist entry.");
    }
  }
  return value as ReviewProject[];
}

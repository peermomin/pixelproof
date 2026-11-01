"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import {
  Activity, ArrowDownToLine, ArrowUpRight, Check, CheckCheck,
  ChevronDown, ChevronRight, CircleHelp, CirclePlus, ClipboardCheck, Copy, ExternalLink,
  Eye, FileCode2, FolderKanban, LayoutDashboard, MessageCircle,
  Monitor, Plus, Search, Settings2, ShieldCheck, Smartphone, Sparkles,
  Upload,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  createDemoProject, createId, validateBackup, type ChecklistItem, type IssueCategory,
  type IssuePriority, type ReviewIssue, type ReviewPage, type ReviewProject,
} from "@/lib/pixelproof";
import { safeUrl } from "@/lib/format";
import { ChecklistView } from "@/components/checklist";
import { IssueDetail } from "@/components/issue-detail";
import { IssueRow } from "@/components/issue-list";
import { Preview } from "@/components/preview";
import { Field, Metric, Modal, ModalActions, RailButton } from "@/components/ui";

type ModalKind = "issue" | "edit" | "page" | "project" | "share" | "delete" | "import" | null;
type Section = "Review" | "Checklist";

const categoryOptions: IssueCategory[] = ["Visual", "Accessibility", "Content", "Interaction"];
const priorityOptions: IssuePriority[] = ["High", "Medium", "Low"];


export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <div className="grid min-h-screen place-items-center bg-[#0c0e12] text-sm text-[#aab0bb]">Loading Pixelproof…</div>;
  if (!session) return <AuthScreen />;
  return <Dashboard user={session.user} />;
}

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) setError(result.error.message ?? "Could not authenticate.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not authenticate."); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[#0c0e12] px-4 text-[#e9ebef]"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#292d36] bg-[#11141a] p-7 shadow-2xl"><div className="mb-6 grid h-10 w-10 place-items-center rounded-xl bg-[#c4f36b] text-[#10140c]"><Eye size={20}/></div><p className="text-xs font-medium uppercase tracking-[.18em] text-[#c4f36b]">Pixelproof</p><h1 className="mt-2 text-2xl font-semibold">{mode === "signup" ? "Create your workspace" : "Welcome back"}</h1><p className="mt-2 text-sm text-[#858c99]">Visual QA reviews, shared securely with your team.</p><div className="mt-6 space-y-3">{mode === "signup" && <Field label="Your name"><input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="form-input"/></Field>}<Field label="Email"><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-input"/></Field><Field label="Password (12+ characters)"><input required minLength={12} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} className="form-input"/></Field></div>{error && <p role="alert" className="mt-3 text-xs text-[#ef827a]">{error}</p>}<button disabled={busy} className="mt-5 h-11 w-full rounded-lg bg-[#c4f36b] text-sm font-semibold text-[#171b11] disabled:opacity-60">{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button><button type="button" onClick={()=>setMode(mode === "signup" ? "signin" : "signup")} className="mt-4 w-full text-xs text-[#aab0bb] hover:text-white">{mode === "signup" ? "Already have an account? Sign in" : "New to Pixelproof? Create an account"}</button><p className="mt-5 border-t border-[#292d36] pt-4 text-[10px] leading-relaxed text-[#777f8e]">Your account and review data are stored on the Pixelproof server. Ask your workspace owner for the invite link to join their reviews.</p></form></main>;
}

function Dashboard({ user }: { user: { id: string; name: string; email: string } }) {
  const [projects, setProjects] = useState<ReviewProject[]>([]);
  const projectsRef = useRef<ReviewProject[]>([]);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [loaded, setLoaded] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string; role: string }[]>([]);
  const [projectId, setProjectId] = useState("");
  const [pageId, setPageId] = useState("home");
  const [selectedId, setSelectedId] = useState("");
  const [section, setSection] = useState<Section>("Review");
  const [panelTab, setPanelTab] = useState<"Issues" | "Files">("Issues");
  const [filter, setFilter] = useState("All issues");
  const [query, setQuery] = useState("");
  const [viewport, setViewport] = useState<"Desktop" | "Mobile">("Desktop");
  const [modal, setModal] = useState<ModalKind>(null);
  const [anchor, setAnchor] = useState({ x: 50, y: 50 });
  const [toast, setToast] = useState("");
  const [comment, setComment] = useState("");
  const [projectMenu, setProjectMenu] = useState(false);
  const [importDraft, setImportDraft] = useState<ReviewProject[] | null>(null);
  const [draft, setDraft] = useState({ title: "", description: "", category: "Visual" as IssueCategory, priority: "Medium" as IssuePriority });
  const [pageDraft, setPageDraft] = useState({ name: "", path: "/new-page" });
  const [projectDraft, setProjectDraft] = useState({ name: "", client: "", url: "https://" });
  const [checklistDraft, setChecklistDraft] = useState("");
  const [newChecklist, setNewChecklist] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("invite");
        let invitedWorkspaceId = "";
        if (token) {
          const invite = await fetch("/api/invitations/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
          const result = await invite.json();
          if (!invite.ok) throw new Error(result.error ?? "Could not accept invite.");
          invitedWorkspaceId = result.workspaceId;
          window.localStorage.setItem("pixelproof.workspace", invitedWorkspaceId);
          url.searchParams.delete("invite"); window.history.replaceState({}, "", url);
        }
        const selectedWorkspace = invitedWorkspaceId || window.localStorage.getItem("pixelproof.workspace") || "";
        const endpoint = selectedWorkspace ? `/api/projects?workspaceId=${encodeURIComponent(selectedWorkspace)}` : "/api/projects";
        const response = await fetch(endpoint, { cache: "no-store" });
        const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not load your workspace.");
        projectsRef.current = data.projects; setProjects(data.projects); setWorkspaces(data.workspaces); setWorkspaceId(data.workspace.id); window.localStorage.setItem("pixelproof.workspace", data.workspace.id); setProjectId(data.projects[0]?.id ?? ""); setLoaded(true);
      } catch (error) { setToast(error instanceof Error ? error.message : "Could not load your workspace"); setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/projects?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || data.workspace.id !== workspaceId) return;
        const current = new Map((projectsRef.current).map(item => [item.id, item.revision]));
        const changed = data.projects.some((item: ReviewProject) => current.get(item.id) !== item.revision) || data.projects.length !== projectsRef.current.length;
        if (changed) { projectsRef.current = data.projects; setProjects(data.projects); }
      } catch { /* Keep the current workspace available during brief network interruptions. */ }
    };
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [workspaceId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setModal(null);
        setProjectMenu(false);
        setSelectedId("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const project = projects.find((item) => item.id === projectId) ?? projects[0] ?? createDemoProject();
  const page = project.pages.find((item) => item.id === pageId) ?? project.pages[0];
  const pageIssues = useMemo(() => project.issues.filter((item) => item.pageId === page.id), [page.id, project.issues]);
  const selectedIssue = pageIssues.find((item) => item.id === selectedId);
  const openCount = project.issues.filter((item) => item.status === "Open").length;
  const resolvedCount = project.issues.filter((item) => item.status === "Resolved").length;
  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return pageIssues.filter((item) => {
      const matchesFilter = filter === "All issues" || (filter === "Open" && item.status === "Open") || (filter === "Resolved" && item.status === "Resolved") || item.category === filter || (filter === "High priority" && item.priority === "High");
      const matchesQuery = !normalizedQuery || `${item.title} ${item.description} ${item.category} ${item.author}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    }).sort((a, b) => (a.status === b.status ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : a.status === "Open" ? -1 : 1));
  }, [filter, pageIssues, query]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function updateProject(change: (current: ReviewProject) => ReviewProject) {
    saveQueue.current = saveQueue.current.then(async () => {
      const current = projectsRef.current.find(item => item.id === project.id);
      if (!current) return;
      const next = { ...change(current), updatedAt: new Date().toISOString() };
      const response = await fetch(`/api/projects/${current.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: current.revision, project: next }) });
      const data = await response.json();
      if (!response.ok) {
        if (data.project) { projectsRef.current = projectsRef.current.map(item => item.id === current.id ? data.project : item); setProjects(projectsRef.current); }
        throw new Error(data.error ?? "Could not save project.");
      }
      projectsRef.current = projectsRef.current.map(item => item.id === current.id ? data.project : item);
      setProjects(projectsRef.current);
    }).catch(error => { notify(error instanceof Error ? error.message : "Could not save project"); });
  }

  function openIssueModal(position = { x: 50, y: 50 }) {
    setAnchor(position);
    setDraft({ title: "", description: "", category: "Visual", priority: "Medium" });
    setModal("issue");
  }

  function openIssueEdit() {
    if (!selectedIssue) return;
    setDraft({ title: selectedIssue.title, description: selectedIssue.description, category: selectedIssue.category, priority: selectedIssue.priority });
    setModal("edit");
  }

  function addIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    const next: ReviewIssue = { id: createId("issue"), pageId: page.id, title, description: draft.description.trim(), category: draft.category, priority: draft.priority, status: "Open", x: anchor.x, y: anchor.y, author: user.name, createdAt: new Date().toISOString(), comments: [] };
    updateProject((current) => ({ ...current, issues: [next, ...current.issues] }));
    setSelectedId(next.id);
    setModal(null);
    notify("Feedback added to the review");
  }

  function saveIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedIssue || !draft.title.trim()) return;
    updateProject((current) => ({
      ...current,
      issues: current.issues.map((item) => item.id === selectedIssue.id
        ? { ...item, title: draft.title.trim(), description: draft.description.trim(), category: draft.category, priority: draft.priority }
        : item),
    }));
    setModal(null);
    notify("Feedback updated");
  }

  function toggleResolved(issue: ReviewIssue) {
    updateProject((current) => ({ ...current, issues: current.issues.map((item) => item.id === issue.id ? { ...item, status: item.status === "Open" ? "Resolved" : "Open" } : item) }));
    notify(issue.status === "Open" ? "Issue marked as resolved" : "Issue reopened");
  }

  function deleteIssue() {
    if (!selectedIssue) return;
    updateProject((current) => ({ ...current, issues: current.issues.filter((item) => item.id !== selectedIssue.id) }));
    setSelectedId("");
    setModal(null);
    notify("Feedback removed");
  }

  function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedIssue || !comment.trim()) return;
    const text = comment.trim();
    updateProject((current) => ({ ...current, issues: current.issues.map((item) => item.id === selectedIssue.id ? { ...item, comments: [...item.comments, { id: createId("comment"), text, author: user.name, createdAt: new Date().toISOString() }] } : item) }));
    setComment("");
    notify("Comment added");
  }

  async function copyText(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      notify(message);
    } catch {
      notify("Clipboard access was blocked by this browser");
    }
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchorEl = document.createElement("a");
    anchorEl.hidden = true;
    anchorEl.href = url;
    anchorEl.download = `pixelproof-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchorEl);
    anchorEl.click();
    anchorEl.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Project backup downloaded");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = validateBackup(JSON.parse(await file.text()));
      setImportDraft(parsed);
      setModal("import");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not import this backup");
    }
    event.target.value = "";
  }

  async function confirmImport() {
    if (!importDraft) return;
    try {
      const imported = importDraft.map(source => ({ ...source, id: createId("project"), revision: 1, updatedAt: new Date().toISOString(), pages: source.pages.map(({ screenshotAssetId: _asset, ...page }) => page) }));
      const response = await fetch("/api/projects/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, projects: imported }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Import failed.");
      const created = result.projects as ReviewProject[];
      projectsRef.current = [...created, ...projectsRef.current]; setProjects(projectsRef.current); setProjectId(created[0].id); setPageId(created[0].pages[0].id); setSelectedId(""); setImportDraft(null); setModal(null); notify(`${created.length} project${created.length === 1 ? "" : "s"} imported`);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not import backup"); }
  }

  function addPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = pageDraft.name.trim();
    if (!name) return;
    const path = `/${pageDraft.path.trim().replace(/^\/+/, "")}`;
    const next: ReviewPage = { id: createId("page"), name, path, url: `${project.url.replace(/\/$/, "")}${path}`, reviewed: false };
    updateProject((current) => ({ ...current, pages: [...current.pages, next] }));
    setPageId(next.id);
    setPageDraft({ name: "", path: "/new-page" });
    setModal(null);
    notify("Page added to the review");
  }

  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = projectDraft.name.trim();
    const url = safeUrl(projectDraft.url);
    if (!name || !url) return;
    const id = createId("project");
    const next: ReviewProject = { id, name, client: projectDraft.client.trim() || "My workspace", url: url.replace(/\/$/, ""), updatedAt: new Date().toISOString(), revision: 1, pages: [{ id: "home", name: "Home", path: "/", url, reviewed: false }], issues: [], checklist: [...createDemoProject().checklist.map((item) => ({ ...item, complete: false }))] };
    void fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, project: next }) }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); projectsRef.current = [...projectsRef.current, data.project]; setProjects(projectsRef.current); setProjectId(id); setPageId("home"); setSelectedId(""); setProjectDraft({ name: "", client: "", url: "https://" }); setModal(null); notify("Project created"); }).catch(error => notify(error.message ?? "Could not create project"));
  }

  function toggleChecklist(item: ChecklistItem) {
    updateProject((current) => ({ ...current, checklist: current.checklist.map((entry) => entry.id === item.id ? { ...entry, complete: !entry.complete } : entry) }));
  }

  async function uploadScreenshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const form = new FormData(); form.set("file", file); form.set("pageId", page.id); setUploading(true);
    try { const response = await fetch(`/api/projects/${project.id}/assets`, { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Upload failed."); projectsRef.current = projectsRef.current.map(item => item.id === project.id ? data.project : item); setProjects(projectsRef.current); notify("Screenshot uploaded to the workspace"); }
    catch (error) { notify(error instanceof Error ? error.message : "Upload failed"); } finally { setUploading(false); }
  }

  async function createInvite() {
    try { const response = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setInviteUrl(data.url); await copyText(data.url, "Seven-day invite link copied"); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not create invite"); }
  }

  async function switchWorkspace(id: string) {
    try { const response = await fetch(`/api/projects?workspaceId=${encodeURIComponent(id)}`, { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not switch workspace."); projectsRef.current = data.projects; setProjects(data.projects); setWorkspaces(data.workspaces); setWorkspaceId(data.workspace.id); window.localStorage.setItem("pixelproof.workspace", data.workspace.id); setProjectId(data.projects[0]?.id ?? ""); setPageId(data.projects[0]?.pages[0]?.id ?? "home"); setSelectedId(""); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not switch workspace"); }
  }

  function removeChecklistItem(id: string) {
    const item = project.checklist.find((entry) => entry.id === id);
    if (!item || !window.confirm(`Remove “${item.label}” from the release checklist?`)) return;
    updateProject((current) => ({ ...current, checklist: current.checklist.filter((item) => item.id !== id) }));
  }

  function addChecklistItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checklistDraft.trim()) return;
    const next = { id: createId("check"), label: checklistDraft.trim(), complete: false };
    updateProject((current) => ({ ...current, checklist: [...current.checklist, next] }));
    setChecklistDraft("");
    setNewChecklist(false);
  }

  function handlePreviewClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchor({ x: Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100)), y: Math.max(6, Math.min(94, ((event.clientY - rect.top) / rect.height) * 100)) });
    setDraft({ title: "", description: "", category: "Visual", priority: "Medium" });
    setModal("issue");
  }

  const checklistDone = project.checklist.filter((item) => item.complete).length;
  const pagesReviewed = project.pages.filter((item) => item.reviewed).length;
  const isReadyToShip = openCount === 0 && checklistDone === project.checklist.length && pagesReviewed === project.pages.length;
  const pageName = page?.name ?? "Home";

  if (!loaded) return <div className="grid min-h-screen place-items-center bg-[#0c0e12] text-sm text-[#aab0bb]">Loading your workspace…</div>;
  if (projects.length === 0) return <main className="grid min-h-screen place-items-center bg-[#0c0e12] px-4 text-center text-[#e9ebef]"><div><h1 className="text-xl font-semibold">Could not load your workspace</h1><p className="mt-2 text-sm text-[#858c99]">Check the server connection, then try again.</p><button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-[#c4f36b] px-4 py-2 text-sm font-semibold text-[#171b11]">Try again</button><button onClick={() => authClient.signOut()} className="ml-2 rounded-lg border border-[#343944] px-4 py-2 text-sm text-[#d4d6dc]">Sign out</button></div></main>;

  return (
    <main className="min-h-screen bg-[#0c0e12] text-[#e9ebef]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[68px] flex-col items-center border-r border-[#242832] bg-[#0e1015] py-5 md:flex">
        <button aria-label="Pixelproof home" onClick={() => setSection("Review")} className="mb-9 grid h-9 w-9 place-items-center rounded-xl bg-[#c4f36b] text-[#10140c]"><Eye size={19} strokeWidth={2.4} /></button>
        <nav aria-label="Main navigation" className="flex flex-col gap-2 text-[#777f8e]">
          <RailButton label="Review" active={section === "Review"} onClick={() => setSection("Review")}><LayoutDashboard size={18} /></RailButton>
          <RailButton label="Checklist" active={section === "Checklist"} onClick={() => setSection("Checklist")}><ClipboardCheck size={18} /></RailButton>
          <RailButton label="Projects" active={projectMenu} onClick={() => setProjectMenu((value) => !value)}><FolderKanban size={18} /></RailButton>
        </nav>
        <div className="mt-auto flex flex-col gap-2 text-[#777f8e]">
          <button aria-label="Export project backup" title="Export project backup" onClick={exportBackup} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#20242c]"><ArrowDownToLine size={17} /></button>
          <button aria-label="Import project backup" title="Import project backup" onClick={() => importRef.current?.click()} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#20242c]"><Upload size={17} /></button>
          <button aria-label="Help" onClick={() => setModal("share")} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#20242c]"><CircleHelp size={18} /></button>
          <button aria-label="Sign out" title={`Sign out ${user.email}`} onClick={() => authClient.signOut()} className="grid h-10 w-10 place-items-center rounded-xl border border-[#323742] bg-[#20242c] text-xs font-semibold text-white">{user.name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase()}</button>
        </div>
      </aside>

      <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={importBackup} />
      <input ref={screenshotRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadScreenshot} />
      <section className="md:pl-[68px]">
        <header className="relative z-20 flex h-[66px] items-center justify-between border-b border-[#242832] px-4 md:px-8">
          <div className="relative flex min-w-0 items-center gap-2 text-[13px] md:gap-3">
            <button onClick={() => setProjectMenu((value) => !value)} className="flex min-w-0 items-center gap-2 text-[#969daa] hover:text-white"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#20242c] text-[10px] font-bold text-white">{project.client.slice(0, 1).toUpperCase()}</span><span className="hidden sm:inline">{project.client}</span><ChevronDown size={13} /></button>
            <ChevronRight size={14} className="shrink-0 text-[#555b66]" />
            <button onClick={() => setProjectMenu((value) => !value)} className="flex min-w-0 items-center gap-1.5 font-medium text-[#e7e9ed] hover:text-white"><span className="truncate">{project.name}</span><ChevronDown size={14} className="shrink-0" /></button>
            {projectMenu && <div className="absolute left-0 top-10 z-40 w-[min(320px,85vw)] rounded-xl border border-[#343944] bg-[#171a20] p-2 shadow-2xl">
              <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#777f8e]">Your projects</p>
              {projects.map((item) => <button key={item.id} onClick={() => { setProjectId(item.id); setPageId(item.pages[0]?.id ?? ""); setSelectedId(""); setProjectMenu(false); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-[#242832] ${item.id === project.id ? "text-[#c4f36b]" : "text-[#c9ccd3]"}`}><FolderKanban size={14} />{item.name}<span className="ml-auto text-[10px] text-[#777f8e]">{item.issues.filter((issue) => issue.status === "Open").length} open</span></button>)}
              <button onClick={() => { setProjectMenu(false); setModal("project"); }} className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-[#292d36] px-2 py-2.5 text-left text-xs text-[#c4f36b] hover:bg-[#242832]"><Plus size={14} /> Create a project</button>
            </div>}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            {workspaces.length > 1 && <select aria-label="Switch workspace" value={workspaceId} onChange={event => void switchWorkspace(event.target.value)} className="max-w-24 rounded-lg border border-[#30343e] bg-[#11141a] px-1.5 py-2 text-[9px] text-[#c9ccd3] outline-none sm:max-w-36 sm:px-2 sm:text-[10px]">{workspaces.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>}
            <span className="hidden items-center gap-1.5 rounded-full border border-[#28342a] bg-[#172019] px-2.5 py-1 text-[10px] font-medium text-[#b8e881] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#b8e881]" /> Saved to server</span>
            <button aria-label="Export backup" title="Export backup" onClick={exportBackup} className="grid h-9 w-9 place-items-center rounded-lg text-[#838a97] hover:bg-[#1b1e25] hover:text-white"><ArrowDownToLine size={16} /></button>
            <button onClick={() => setModal("share")} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#c4f36b] px-2.5 text-[11px] font-semibold text-[#171b11] hover:bg-[#d1f98b] md:px-3.5 md:text-xs"><ArrowUpRight size={14} /> Share</button>
          </div>
        </header>

        <div className="mx-auto max-w-[1510px] px-3 pb-20 pt-6 sm:px-5 md:px-8 md:pb-8 md:pt-9">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><div className="mb-2 flex items-center gap-2 text-xs text-[#858c99]"><span>Reviews</span><ChevronRight size={13} /><span>{project.name}</span></div><h1 className="text-[26px] font-semibold tracking-[-0.04em] md:text-[30px]">{section === "Review" ? "Visual review" : "Review checklist"}</h1><p className="mt-1.5 text-[12px] text-[#858c99] md:text-[13px]">{section === "Review" ? "Compare your build, catch the small things, ship the good stuff." : "A thoughtful pass before your next release."}</p></div>
            <div className="flex items-center gap-2">
              {section === "Review" && <a href={page?.url ?? project.url} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 rounded-lg border border-[#30343e] px-3 text-xs font-medium text-[#d4d6dc] hover:bg-[#1b1e25]"><ExternalLink size={14} /> Open page</a>}
              <button onClick={() => setModal("share")} className="flex h-9 items-center gap-2 rounded-lg bg-[#c4f36b] px-3.5 text-xs font-semibold text-[#171b11] hover:bg-[#d1f98b]"><ArrowUpRight size={15} /> Share review</button>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 md:gap-3">
            <Metric icon={Activity} label="Review status" value={isReadyToShip ? "Ready to ship" : "In progress"} meta="Workspace data syncs to server" accent="text-[#c4f36b]" />
            <Metric icon={MessageCircle} label="Open issues" value={String(openCount).padStart(2, "0")} meta={`${resolvedCount} resolved · ${project.issues.filter((issue) => issue.status === "Open" && issue.priority === "High").length} high priority`} accent="text-[#e4b568]" />
            <Metric icon={Eye} label="Pages reviewed" value={`${pagesReviewed} / ${project.pages.length}`} meta={`${project.pages.length - pagesReviewed} pages left to check`} accent="text-[#9daafc]" />
            <Metric icon={ShieldCheck} label="Checklist" value={`${checklistDone} / ${project.checklist.length}`} meta="Pre-release checks complete" accent="text-[#87d6a0]" />
          </div>

          {section === "Review" ? (
            <div className="grid min-h-[610px] grid-cols-1 overflow-hidden rounded-xl border border-[#242832] bg-[#11141a] xl:grid-cols-[minmax(0,1fr)_345px]">
              <section className="min-w-0 border-b border-[#242832] xl:border-b-0 xl:border-r">
                <div className="flex h-[55px] items-center justify-between border-b border-[#242832] px-3.5 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2 text-xs font-medium"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#20242c] text-[#c4f36b]"><Sparkles size={13} /></span><select aria-label="Choose page" value={page.id} onChange={(event) => { setPageId(event.target.value); setSelectedId(""); }} className="max-w-[120px] truncate bg-transparent text-[#e3e5e9] outline-none sm:max-w-[180px]">{project.pages.map((item) => <option key={item.id} value={item.id} className="bg-[#171a20]">{item.name}</option>)}</select><span className="hidden truncate text-[10px] text-[#737a87] sm:inline">{page.path}</span><span className="rounded bg-[#1d2027] px-1.5 py-0.5 text-[9px] text-[#969daa]">Preview</span></div>
                  <div className="flex shrink-0 items-center gap-1"><button aria-label="Desktop viewport" title="Desktop viewport" onClick={() => setViewport("Desktop")} className={`grid h-8 w-8 place-items-center rounded-md ${viewport === "Desktop" ? "bg-[#292d36] text-white" : "text-[#777f8e] hover:bg-[#20242c]"}`}><Monitor size={15} /></button><button aria-label="Mobile viewport" title="Mobile viewport" onClick={() => setViewport("Mobile")} className={`grid h-8 w-8 place-items-center rounded-md ${viewport === "Mobile" ? "bg-[#292d36] text-white" : "text-[#777f8e] hover:bg-[#20242c]"}`}><Smartphone size={15} /></button><span className="mx-1 h-4 w-px bg-[#30343e]" /><button onClick={() => notify(`Viewing ${viewport.toLowerCase()} width`)} className="hidden h-8 items-center gap-1 rounded-md px-2 text-[10px] text-[#939aa6] hover:bg-[#20242c] sm:flex">{viewport === "Desktop" ? "1440px" : "390px"} <ChevronDown size={12} /></button><button aria-label="Refresh preview" title="Refresh preview" onClick={() => notify("Preview is up to date")} className="grid h-8 w-8 place-items-center rounded-md text-[#777f8e] hover:bg-[#20242c]"><Activity size={15} /></button></div>
                </div>
                <div className="flex justify-end border-b border-[#242832] px-3 py-2"><button onClick={() => screenshotRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 rounded-md border border-[#343944] px-2.5 py-1.5 text-[10px] text-[#c8cbd1] hover:bg-[#20242c] disabled:opacity-50"><Upload size={12}/>{uploading ? "Uploading…" : page.screenshotAssetId ? "Replace screenshot" : "Upload screenshot"}</button></div>
                <Preview pageId={page.id} pageName={pageName} pageUrl={page.url} viewport={viewport} issues={pageIssues} selectedId={selectedId} onSelect={setSelectedId} onAdd={handlePreviewClick} screenshotAssetId={page.screenshotAssetId} />
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#242832] px-3.5 py-3 sm:px-5"><div className="flex items-center gap-2 text-[10px] text-[#858c99]"><span className="h-1.5 w-1.5 rounded-full bg-[#85d39b]" /> Click anywhere on the page to pin feedback <span className="hidden text-[#424752] sm:inline">·</span><span className="hidden sm:inline">Saved to your workspace</span></div><div className="flex gap-2"><button onClick={() => { updateProject((current) => ({ ...current, pages: current.pages.map((item) => item.id === page.id ? { ...item, reviewed: !item.reviewed } : item) })); notify(page.reviewed ? "Page marked as needing another look" : "Page marked reviewed"); }} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#343944] px-2.5 text-[10px] font-medium text-[#c8cbd1] hover:bg-[#20242c]">{page.reviewed ? <><Check size={13} /> Reviewed</> : <><CheckCheck size={13} /> Mark reviewed</>}</button><button onClick={() => openIssueModal()} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#343944] px-2.5 text-[11px] font-medium text-[#d4d6dc] hover:bg-[#20242c]"><Plus size={14} /> Add feedback</button></div></div>
              </section>

              <aside className="flex min-h-[500px] flex-col">
                <div className="flex h-[55px] items-center justify-between border-b border-[#242832] px-4"><div className="flex gap-4"><button onClick={() => setPanelTab("Issues")} className={`relative h-[55px] text-xs font-medium ${panelTab === "Issues" ? "text-white" : "text-[#797f8b]"}`}>Issues<span className="ml-1.5 rounded bg-[#292d36] px-1.5 py-0.5 text-[9px] text-[#bfc3ca]">{pageIssues.length}</span>{panelTab === "Issues" && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#c4f36b]" />}</button><button onClick={() => setPanelTab("Files")} className={`relative h-[55px] text-xs font-medium ${panelTab === "Files" ? "text-white" : "text-[#797f8b]"}`}>Files{panelTab === "Files" && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#c4f36b]" />}</button></div><button aria-label="Add review page" title="Add review page" onClick={() => setModal("page")} className="grid h-8 w-8 place-items-center rounded-md text-[#7e8592] hover:bg-[#20242c]"><CirclePlus size={16} /></button></div>
                {panelTab === "Issues" ? <>
                  <div className="flex items-center gap-2 border-b border-[#242832] px-3 py-2.5"><label className="relative min-w-0 flex-1"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#747b88]" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search feedback…" className="h-8 w-full rounded-md border border-[#30343e] bg-[#11141a] pl-8 pr-9 text-[10px] text-[#d8dbe1] outline-none placeholder:text-[#686f7b] focus:border-[#667849]" /><kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#30343e] px-1 py-0.5 text-[8px] text-[#747b88]">⌘K</kbd></label><select aria-label="Filter feedback" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 max-w-[118px] rounded-md border border-[#30343e] bg-[#11141a] px-1.5 text-[9px] text-[#c9ccd3] outline-none focus:border-[#667849] sm:max-w-none sm:px-2"><option>All issues</option><option>Open</option><option>Resolved</option><option>High priority</option>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="flex-1 overflow-y-auto">{filteredIssues.length === 0 ? <div className="px-4 py-10 text-center"><div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-[#20242c] text-[#9299a5]"><CheckCheck size={17} /></div><p className="text-xs font-medium text-[#d2d5dc]">Nothing here</p><p className="mt-1 text-[10px] text-[#797f8b]">Try another filter or add feedback.</p><button onClick={() => { setFilter("All issues"); setQuery(""); openIssueModal(); }} className="mt-3 text-[10px] text-[#c4f36b]">Add feedback</button></div> : filteredIssues.map((item) => <IssueRow key={item.id} issue={item} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} />)}</div>
                  <div className="border-t border-[#242832] p-4"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-medium text-[#999faa]">Review progress</span><span className="text-[10px] text-[#c4f36b]">{pagesReviewed} of {project.pages.length} pages</span></div><div className="mb-3 h-1 overflow-hidden rounded-full bg-[#282c34]"><div style={{ width: `${pagesReviewed / project.pages.length * 100}%` }} className="h-full rounded-full bg-[#c4f36b]" /></div><div className="flex items-center justify-between"><span className="text-[9px] text-[#777e89]">Shared with your workspace</span><button aria-label="Invite a reviewer" onClick={() => setModal("share")} className="grid h-6 w-6 place-items-center rounded-full border border-[#343944] bg-[#252932] text-[#aab0bb]"><Plus size={11} /></button></div></div>
                </> : <div className="flex-1 p-3">{page.screenshotAssetId ? <a href={`/api/assets/${page.screenshotAssetId}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-[#292d36] bg-[#15181f] p-3 text-[10px] text-[#c4f36b]"><Eye size={14}/> Open page screenshot <ArrowUpRight size={12} className="ml-auto"/></a> : <div className="rounded-lg border border-dashed border-[#343944] p-5 text-center"><FileCode2 size={18} className="mx-auto text-[#777f8e]"/><p className="mt-2 text-[10px] text-[#aab0bb]">No screenshot yet</p><button onClick={() => screenshotRef.current?.click()} className="mt-2 text-[10px] text-[#c4f36b]">Upload a page capture</button></div>}<p className="mt-3 text-[10px] leading-relaxed text-[#858c99]">Screenshots are stored on your server and shared with workspace members.</p></div>}
              </aside>
            </div>
          ) : <ChecklistView items={project.checklist} done={checklistDone} draft={checklistDraft} setDraft={setChecklistDraft} adding={newChecklist} setAdding={setNewChecklist} onToggle={toggleChecklist} onRemove={removeChecklistItem} onAdd={addChecklistItem} />}

          <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pt-4 text-[10px] text-[#686f7b]"><span>Built for better details <span className="text-[#c4f36b]">✳</span></span><div className="flex items-center gap-4"><span className="inline-flex items-center gap-1"><span className="rounded border border-[#30343e] px-1">⌘</span> K <span className="ml-1">Search feedback</span></span><button onClick={exportBackup} className="inline-flex items-center gap-1 hover:text-[#c2c6ce]"><Settings2 size={12} /> Backup</button></div></footer>
        </div>
        <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#292d36] bg-[#0e1015]/95 px-3 py-2 backdrop-blur md:hidden">
          <button onClick={() => setSection("Review")} className={`flex flex-1 flex-col items-center gap-1 py-1 text-[9px] ${section === "Review" ? "text-[#c4f36b]" : "text-[#858c99]"}`}><LayoutDashboard size={17} />Review</button>
          <button onClick={() => setSection("Checklist")} className={`flex flex-1 flex-col items-center gap-1 py-1 text-[9px] ${section === "Checklist" ? "text-[#c4f36b]" : "text-[#858c99]"}`}><ClipboardCheck size={17} />Checklist</button>
          <button onClick={() => setProjectMenu((value) => !value)} className="flex flex-1 flex-col items-center gap-1 py-1 text-[9px] text-[#858c99]"><FolderKanban size={17} />Projects</button>
        </nav>
      </section>

      {modal && <Modal onClose={() => setModal(null)} title={modal === "issue" ? "Add feedback" : modal === "edit" ? "Edit feedback" : modal === "page" ? "Add a page" : modal === "project" ? "Create a project" : modal === "delete" ? "Remove this feedback?" : modal === "import" ? "Import project backup" : "Share this review"} subtitle={modal === "issue" || modal === "edit" ? "Leave a clear, actionable note for the next pass." : modal === "share" ? "Invite teammates or back up this review." : undefined}>
        {(modal === "issue" || modal === "edit") && <form onSubmit={modal === "issue" ? addIssue : saveIssue} className="space-y-3"><Field label="Short title"><input autoFocus required maxLength={90} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs attention?" className="form-input" /></Field><Field label="Details"><textarea maxLength={600} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add context or a suggested fix…" className="form-input resize-y" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Category"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as IssueCategory })} className="form-input">{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Priority"><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as IssuePriority })} className="form-input">{priorityOptions.map((item) => <option key={item}>{item}</option>)}</select></Field></div><ModalActions onCancel={() => setModal(null)} submit={modal === "issue" ? "Pin feedback" : "Save changes"} /></form>}
        {modal === "page" && <form onSubmit={addPage} className="space-y-3"><Field label="Page name"><input autoFocus required value={pageDraft.name} onChange={(event) => setPageDraft({ ...pageDraft, name: event.target.value })} placeholder="Pricing page" className="form-input" /></Field><Field label="Path"><input required value={pageDraft.path} onChange={(event) => setPageDraft({ ...pageDraft, path: event.target.value })} placeholder="/pricing" className="form-input" /></Field><p className="text-[10px] text-[#777f8e]">This page will be added to the review list. The preview uses the included sample artwork.</p><ModalActions onCancel={() => setModal(null)} submit="Add page" /></form>}
        {modal === "project" && <form onSubmit={addProject} className="space-y-3"><Field label="Project name"><input autoFocus required value={projectDraft.name} onChange={(event) => setProjectDraft({ ...projectDraft, name: event.target.value })} placeholder="Acme — website refresh" className="form-input" /></Field><Field label="Team or client"><input value={projectDraft.client} onChange={(event) => setProjectDraft({ ...projectDraft, client: event.target.value })} placeholder="Your studio" className="form-input" /></Field><Field label="Website address"><input required type="url" value={projectDraft.url} onChange={(event) => setProjectDraft({ ...projectDraft, url: event.target.value })} placeholder="https://example.com" className="form-input" /></Field><p className="text-[10px] text-[#777f8e]">Adds a review workspace and a link to open the site. Most websites block being embedded in the preview.</p><ModalActions onCancel={() => setModal(null)} submit="Create project" /></form>}
        {modal === "share" && <div className="space-y-4"><div className="rounded-lg border border-[#30343e] bg-[#101218] p-3"><p className="text-xs font-medium text-[#e2e5eb]">{project.name}</p><p className="mt-1 truncate text-[10px] text-[#858c99]">{page?.url ?? project.url}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => copyText(`${project.name} · ${page?.name ?? "Review"}\n${openCount} open issue${openCount === 1 ? "" : "s"}\n${page?.url ?? project.url}`, "Review summary copied")} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#343944] px-2.5 text-[10px] text-[#d4d6dc] hover:bg-[#20242c]"><Copy size={13} /> Copy summary</button><button onClick={() => copyText(page?.url ?? project.url, "Page URL copied")} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#343944] px-2.5 text-[10px] text-[#d4d6dc] hover:bg-[#20242c]"><ExternalLink size={13} /> Copy website URL</button><button onClick={createInvite} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#c4f36b] px-2.5 text-[10px] font-semibold text-[#171b11]"><Plus size={13}/> Invite teammate</button></div>{inviteUrl && <p className="mt-2 break-all text-[10px] text-[#aab0bb]">{inviteUrl}</p>}</div><p className="text-[10px] leading-relaxed text-[#858c99]">Workspace members see the same reviews and screenshots. Invite links expire after seven days and can be used once. Website links open the site; they do not expose review data.</p><div className="flex flex-wrap justify-between gap-2"><button onClick={exportBackup} className="flex h-9 items-center gap-2 rounded-lg border border-[#343944] px-3 text-xs text-[#d4d6dc] hover:bg-[#20242c]"><ArrowDownToLine size={14} /> Export backup</button><button onClick={() => { setModal(null); importRef.current?.click(); }} className="flex h-9 items-center gap-2 rounded-lg border border-[#343944] px-3 text-xs text-[#d4d6dc] hover:bg-[#20242c]"><Upload size={14} /> Import backup</button></div><div className="flex justify-end border-t border-[#292d36] pt-3"><button onClick={() => setModal(null)} className="rounded-lg px-3 py-2 text-xs text-[#aab0bb] hover:bg-[#242832]">Done</button></div></div>}
        {modal === "delete" && <div><p className="text-xs leading-relaxed text-[#aab0bb]">“{selectedIssue?.title}” and its comments will be removed from this project.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setModal(null)} className="rounded-lg px-3 py-2 text-xs text-[#aab0bb] hover:bg-[#242832]">Keep feedback</button><button onClick={deleteIssue} className="rounded-lg bg-[#ef827a] px-3 py-2 text-xs font-semibold text-[#231211]">Remove feedback</button></div></div>}
        {modal === "import" && <div><p className="text-xs leading-relaxed text-[#aab0bb]">Importing {importDraft?.length ?? 0} project(s) adds new copies to this workspace. Screenshot files are not included in JSON backups and can be uploaded again after import.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => { setImportDraft(null); setModal(null); }} className="rounded-lg px-3 py-2 text-xs text-[#aab0bb] hover:bg-[#242832]">Cancel</button><button onClick={confirmImport} className="rounded-lg bg-[#c4f36b] px-3 py-2 text-xs font-semibold text-[#171b11]">Import copies</button></div></div>}
      </Modal>}

      {section === "Review" && selectedIssue && <IssueDetail issue={selectedIssue} close={() => setSelectedId("")} onEdit={openIssueEdit} onToggle={() => toggleResolved(selectedIssue)} onDelete={() => setModal("delete")} comment={comment} setComment={setComment} onComment={addComment} />}
      {toast && <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-lg border border-[#343944] bg-[#1b1e25] px-4 py-2.5 text-xs text-[#e2e5eb] shadow-xl">{toast}</div>}
      <div className="sr-only" aria-live="polite">{loaded ? "Project data loaded" : "Loading saved project"}</div>
    </main>
  );
}

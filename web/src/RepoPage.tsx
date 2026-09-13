import { useEffect, useRef, useState, type RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  Copy,
  ExternalLink,
  FileCode2,
  Folder,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  Inbox,
  Menu,
  Network,
  Plus,
  Search,
  Server,
  Settings2,
  Shield,
  Star,
  TerminalSquare,
  X,
} from "lucide-react";

type Transport = "https" | "ssh";

type FileEntry = {
  name: string;
  kind: "folder" | "file";
  message: string;
  time: string;
};

const fileEntries: FileEntry[] = [
  { name: "candidate_ranker", kind: "folder", message: "Add MODEL-006 candidate observation signals", time: "4 months ago" },
  { name: "cli", kind: "folder", message: "Add clarification outcome records", time: "4 months ago" },
  { name: "docs", kind: "folder", message: "Record TRANS-017 evidence", time: "4 months ago" },
  { name: "evaluation", kind: "folder", message: "Document shadow evaluation loop", time: "4 months ago" },
  { name: "examples", kind: "folder", message: "Expand GreenShot matrix subset", time: "4 months ago" },
  { name: "j3", kind: "folder", message: "Restore AttributeError advice hint parity", time: "4 months ago" },
  { name: "plans", kind: "folder", message: "Look for new repos to learn from", time: "4 months ago" },
  { name: "repair", kind: "folder", message: "Restore dictionary value rank priority", time: "4 months ago" },
  { name: "tests", kind: "folder", message: "Restore AttributeError advice hint parity", time: "4 months ago" },
  { name: "tools/prompts", kind: "folder", message: "Add prompt corpus schema validation", time: "4 months ago" },
];

const navItems: { label: string; icon: LucideIcon; count?: string }[] = [
  { label: "Code", icon: Code2 },
  { label: "Issues", icon: CircleDot },
  { label: "Pull requests", icon: GitFork },
  { label: "Actions", icon: Activity },
  { label: "Projects", icon: Archive },
  { label: "Wiki", icon: BookOpen },
  { label: "Security", icon: Shield },
  { label: "Insights", icon: Network },
  { label: "Settings", icon: Settings2 },
];

function RepoPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [transport, setTransport] = useState<Transport>("ssh");
  const [notice, setNotice] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("Code");
  const createRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const cloneInputRef = useRef<HTMLInputElement>(null);

  const cloneAddress = transport === "ssh" ? "git@localhost:test/repo.git" : "http://localhost:8080/test/repo.git";

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!createRef.current?.contains(target)) setCreateOpen(false);
      if (!cloneRef.current?.contains(target)) setCloneOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCreateOpen(false);
        setCloneOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const selectNav = (label: string) => {
    if (label !== "Code") {
      setNotice(`${label} will be available when repository metadata is connected.`);
      return;
    }
    setActiveNav(label);
  };

  const copyCloneAddress = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(cloneAddress);
      setNotice(`${transport.toUpperCase()} clone address copied.`);
    } catch {
      cloneInputRef.current?.select();
      setNotice("Copy is unavailable here. Select the address and copy it manually.");
    }
  };

  return (
    <div className="repo-page">
      <header className="repo-header">
        <div className="repo-global-bar">
          <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={() => setNotice("Repository navigation is available in the tabs below.")}><Menu size={20} /></button>
          <a className="brand" href="/" aria-label="Forkalope home"><img src="/logo.png" alt="" /><span>Forkalope</span></a>
          <span className="repo-header-divider" aria-hidden="true" />
          <div className="repo-context"><span>alex</span><b>/</b><strong>test/repo</strong><ChevronDown size={15} /></div>

          <div className="repo-global-actions">
            <label className="global-search repo-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search Forkalope</span>
              <input placeholder="Search or jump to..." />
              <kbd>/</kbd>
            </label>
            <div className="create-wrap" ref={createRef}>
              <button className="repo-labeled-action create-labeled" type="button" aria-label="Open create menu" aria-expanded={createOpen} aria-haspopup="menu" onClick={() => setCreateOpen((open) => !open)}><Plus size={19} /><span>Create</span><ChevronDown size={13} /></button>
              {createOpen && <div className="popover repo-create-menu" role="menu" aria-label="Create"><p className="popover-heading">Create in Forkalope</p><RepoCreateItem icon={CircleDot} label="New issue" onClick={() => setNotice("Issue tracking is planned for the next backend milestone.")} /><RepoCreateItem icon={Archive} label="New repository" onClick={() => setNotice("Repository creation is planned for the next backend milestone.")} /><RepoCreateItem icon={Inbox} label="Import repository" onClick={() => setNotice("Repository import is not connected yet.")} /></div>}
            </div>
            <button className="repo-labeled-action inbox-labeled" type="button" onClick={() => setNotice("Your inbox is clear.")}><Inbox size={18} /><span>Inbox</span></button>
            <button className="account-button" type="button" aria-label="Open account menu" onClick={() => setNotice("Account settings are coming soon.")}>AK</button>
          </div>
        </div>
      </header>

      <main className="repo-main">
        <section className="repo-identity">
          <div className="repo-title-mark"><GitBranch size={22} /></div>
          <div className="repo-identity-main">
            <div className="repo-title-lockup"><h1>test/repo</h1><span className="repo-visibility">Public</span></div>
            <div className="repo-summary-line"><p className="repo-description">A small repository fixture for testing Forkalope's local-first forge workflow.</p><div className="repo-topics"><span>local-first</span><span>git</span><span>react</span></div></div>
          </div>
          <div className="repo-actions"><RepoAction icon={GitBranch} label="Watch" onClick={() => setNotice("Watch subscriptions will be available with notifications.")} /><RepoAction icon={GitFork} label="Fork" onClick={() => setNotice("Forking is planned for the next repository milestone.")} /><RepoAction icon={Star} label="Star" onClick={() => setNotice("Stars will be available when repository metadata is connected.")} /></div>
        </section>

        <div className="repo-workspace">
          <aside className="repo-section-sidebar">
            <p className="repo-section-label">Repository</p>
            <nav className="repo-nav" aria-label="Repository sections">
              {navItems.map(({ label, icon: Icon, count }) => <button className={activeNav === label ? "repo-nav-link active" : "repo-nav-link"} type="button" aria-current={activeNav === label ? "page" : undefined} key={label} onClick={() => selectNav(label)}><Icon size={18} /><span>{label}</span>{count && <b>{count}</b>}</button>)}
            </nav>
          </aside>

          <section className="repo-primary">
            <div className="repo-toolbar">
              <div className="branch-controls"><button className="branch-button" type="button" onClick={() => setNotice("Branch selection is planned for the repository browser.")}><GitBranch size={18} /> main <ChevronDown size={14} /></button><span className="count-control"><GitBranch size={18} /> 1 Branch</span><span className="count-control"><Archive size={18} /> 0 Tags</span></div>
              <div className="repo-tool-actions"><button className="repo-tool-button" type="button" onClick={() => setNotice("File search is planned for the repository browser.")}><Search size={17} /> Go to file <kbd>T</kbd></button><button className="repo-tool-button" type="button" onClick={() => setNotice("File creation is planned for the next repository milestone.")}><FileCode2 size={17} /> Add file <ChevronDown size={14} /></button><div className="clone-wrap" ref={cloneRef}><button className={cloneOpen ? "clone-trigger open" : "clone-trigger"} type="button" aria-expanded={cloneOpen} aria-haspopup="dialog" onClick={() => setCloneOpen((open) => !open)}><TerminalSquare size={18} /> Clone <ChevronDown size={14} /></button>{cloneOpen && <ClonePanel transport={transport} setTransport={setTransport} cloneAddress={cloneAddress} inputRef={cloneInputRef} onCopy={copyCloneAddress} onNotice={setNotice} />}</div></div>
            </div>

            <section className="commit-panel" aria-label="Latest commit"><div className="commit-summary"><div className="commit-avatar">AK</div><strong>alex</strong><span>look for new repos to learn from</span><span className="commit-ref">a4c3f7 · 4 months ago</span><span className="commit-count"><GitCommitHorizontal size={17} /> 749 Commits</span></div></section>
            <section className="file-card" aria-label="Repository files"><div className="file-list-heading"><span>Name</span><span>Latest change</span><span>Updated</span></div><div className="file-list">{fileEntries.map((entry) => <button className="file-row" type="button" key={entry.name} onClick={() => setNotice(`${entry.name} is selected.`)}><span className="file-icon">{entry.kind === "folder" ? <Folder size={21} /> : <FileCode2 size={20} />}</span><strong>{entry.name}</strong><span className="file-message">{entry.message}</span><time>{entry.time}</time></button>)}</div></section>
          </section>

          <aside className="repo-sidebar">
            <section className="about-section">
              <div className="about-heading"><div><span>Repository</span><h2>Details</h2></div><button className="about-settings" type="button" aria-label="Edit repository details" onClick={() => setNotice("Repository details editing is coming soon.")}><Settings2 size={18} /></button></div>
              <button className="about-link" type="button" onClick={() => setNotice("Repository documentation browsing is planned.")}><BookOpen size={18} /><span>docs/architecture.md</span><ExternalLink size={14} /></button>
              <div className="about-facts"><button type="button" onClick={() => setNotice("README view is planned.")}><BookOpen size={18} /> README</button><button type="button" onClick={() => setNotice("License metadata is planned.")}><Shield size={18} /> License</button><button type="button" onClick={() => setNotice("Activity history is planned.")}><Activity size={18} /> Activity</button></div>
              <div className="repo-stat-line"><span><Star size={16} /> 0 stars</span><span><Bell size={16} /> 0 watching</span><span><GitFork size={16} /> 0 forks</span></div>
              <div className="release-summary"><div><span>Releases</span><strong>None published</strong></div><button type="button" onClick={() => setNotice("Release publishing is planned.")}>Create</button></div>
            </section>
          </aside>
        </div>
      </main>
      {notice && <div className="toast" role="status"><ShieldCheckIcon /><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={16} /></button></div>}
    </div>
  );
}

function RepoCreateItem({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button className="menu-action" type="button" role="menuitem" onClick={onClick}><Icon size={17} /><span>{label}</span><span className="menu-soon">Soon</span></button>;
}

function RepoAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button className="repo-action" type="button" onClick={onClick}><Icon size={18} /> {label} <ChevronDown size={14} /></button>;
}

function ClonePanel({ transport, setTransport, cloneAddress, inputRef, onCopy, onNotice }: { transport: Transport; setTransport: (transport: Transport) => void; cloneAddress: string; inputRef: RefObject<HTMLInputElement | null>; onCopy: () => void; onNotice: (notice: string) => void }) {
  return <section className="clone-panel" aria-labelledby="clone-title" role="dialog"><div className="clone-tabs"><button className="clone-tab active" type="button">Local</button><button className="clone-tab" type="button" onClick={() => onNotice("Remote workspace integrations are not connected yet.")}>Integrations</button></div><div className="clone-content"><div className="clone-heading"><div><TerminalSquare size={20} /><h2 id="clone-title">Clone</h2></div><button type="button" aria-label="Clone help" onClick={() => onNotice("Clone transports will use the configured Forkalope node.")}><span>?</span></button></div><div className="transport-tabs" role="tablist" aria-label="Clone transport"><button className={transport === "https" ? "transport-tab active" : "transport-tab"} type="button" role="tab" aria-selected={transport === "https"} onClick={() => setTransport("https")}>HTTPS</button><button className={transport === "ssh" ? "transport-tab active" : "transport-tab"} type="button" role="tab" aria-selected={transport === "ssh"} onClick={() => setTransport("ssh")}>SSH</button></div><div className="clone-address"><input ref={inputRef} value={cloneAddress} readOnly aria-label="Clone address" /><button type="button" aria-label="Copy clone address" onClick={onCopy}><Copy size={19} /></button></div><p className="clone-note">Fixture address for this test repository. Repository endpoints are not connected yet.</p><div className="clone-actions"><button type="button" onClick={() => onNotice("Forkalope Studio is not connected yet.")}><SparkIcon /> Open in Forkalope Studio</button><button type="button" onClick={() => onNotice("Download ZIP is planned for the repository browser.")}><Archive size={18} /> Download ZIP</button></div></div></section>;
}

function ShieldCheckIcon() {
  return <span className="toast-icon"><Check size={16} /></span>;
}

function SparkIcon() {
  return <span className="spark-icon">✦</span>;
}

export default RepoPage;

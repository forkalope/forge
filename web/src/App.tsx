import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  FilePlus2,
  FolderGit2,
  GitBranch,
  Inbox,
  LayoutGrid,
  Menu,
  Network,
  Plus,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
} from "lucide-react";

type ApiHealth = {
  status: string;
  storage: string;
  blob_store: string;
  replication: string;
};

type Repository = {
  name: string;
  owner: string;
  kind: "personal" | "team";
  color: string;
};

const repositories: Repository[] = [
  { name: "forge", owner: "alex", kind: "personal", color: "coral" },
  { name: "node-protocol", owner: "alex", kind: "personal", color: "sky" },
  { name: "desktop-client", owner: "alex", kind: "personal", color: "mint" },
  { name: "web-docs", owner: "forkalope", kind: "team", color: "violet" },
  { name: "storage-adapter", owner: "forkalope", kind: "team", color: "amber" },
  { name: "design-notes", owner: "alex", kind: "personal", color: "slate" },
];

const activityItems = [
  {
    icon: Sparkles,
    label: "Forkalope web",
    title: "The new home workspace is ready to explore",
    detail: "Local development build · TypeScript client",
    time: "Just now",
    accent: "coral",
  },
  {
    icon: Server,
    label: "Local node",
    title: "Storage health endpoint responded successfully",
    detail: "The node is available at your current instance",
    time: "4 hours ago",
    accent: "mint",
  },
  {
    icon: BookOpen,
    label: "Forkalope notes",
    title: "Architecture notes were refreshed",
    detail: "Go monolith · local content-addressed storage",
    time: "Yesterday",
    accent: "violet",
  },
];

function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [healthState, setHealthState] = useState<"loading" | "ready" | "error">("loading");
  const [repoQuery, setRepoQuery] = useState("");
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/health")
      .then((response) => {
        if (!response.ok) throw new Error("Health request failed");
        return response.json() as Promise<ApiHealth>;
      })
      .then((value) => {
        setHealth(value);
        setHealthState("ready");
      })
      .catch(() => setHealthState("error"));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        document.getElementById("workspace-search")?.focus();
      }
      if (event.key === "Escape") {
        setCreateOpen(false);
        setFilterOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!createRef.current?.contains(target)) setCreateOpen(false);
      if (!filterRef.current?.contains(target)) setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const visibleRepositories = repositories.filter((repository) =>
    `${repository.owner}/${repository.name}`.toLowerCase().includes(repoQuery.toLowerCase()),
  );

  const searchWorkspace = () => {
    const query = workspaceQuery.trim();
    if (!query) {
      setNotice("Type a repository or task to search the workspace.");
      return;
    }
    setRepoQuery(query);
    setNotice(`Showing workspace matches for “${query}”.`);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen((open) => !open)}>
            <Menu size={20} />
          </button>
          <a className="brand" href="/" aria-label="Forkalope home">
            <img src="/logo.png" alt="" />
            <span>Forkalope</span>
          </a>
          <span className="brand-divider" aria-hidden="true" />
          <span className="page-context">Home</span>
        </div>

        <div className="topbar-actions">
          <label className="global-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search Forkalope</span>
            <input value={workspaceQuery} onChange={(event) => setWorkspaceQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchWorkspace()} placeholder="Search" />
            <kbd>/</kbd>
          </label>
          <div className="create-wrap" ref={createRef}>
            <button className="topbar-action create-action" type="button" aria-expanded={createOpen} aria-haspopup="menu" onClick={() => setCreateOpen((open) => !open)}>
              <Plus size={18} />
              <span>Create</span>
              <ChevronDown size={14} />
            </button>
            {createOpen && (
              <div className="popover create-menu" role="menu" aria-label="Create">
                <p className="popover-heading">Create in Forkalope</p>
                <MenuAction icon={<FolderGit2 size={16} />} label="New repository" onClick={() => setNotice("Repository creation is planned for the next backend milestone.")} />
                <MenuAction icon={<CircleDot size={16} />} label="New issue" onClick={() => setNotice("Issue tracking is planned for the next backend milestone.")} />
                <MenuAction icon={<FilePlus2 size={16} />} label="Import repository" onClick={() => setNotice("Repository import is not connected yet.")} />
              </div>
            )}
          </div>
          <button className="topbar-action inbox-action" type="button" onClick={() => setNotice("Your inbox is clear.")}>
            <Inbox size={18} />
            <span>Inbox</span>
          </button>
          <button className="account-button" type="button" aria-label="Open account menu" onClick={() => setNotice("Account settings are coming soon.")}>AK</button>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className={sidebarOpen ? "sidebar sidebar-open" : "sidebar"}>
          <div className="sidebar-profile">
            <div className="profile-avatar">AK</div>
            <div>
              <strong>alex</strong>
              <span>personal workspace</span>
            </div>
            <ChevronDown size={16} aria-hidden="true" />
          </div>

          <div className="sidebar-heading">
            <h2>Your repositories</h2>
            <button className="new-repository" type="button" onClick={() => setNotice("Repository creation is planned for the next backend milestone.")}><Plus size={15} /> New</button>
          </div>
          <label className="repository-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Filter repositories</span>
            <input value={repoQuery} onChange={(event) => setRepoQuery(event.target.value)} placeholder="Find a repository..." />
          </label>

          <nav className="repository-list" aria-label="Repositories">
            {visibleRepositories.map((repository) => (
              <button className="repository-link" type="button" key={`${repository.owner}/${repository.name}`} onClick={() => setNotice(`${repository.owner}/${repository.name} is selected.`)}>
                <span className={`repo-mark ${repository.color}`} aria-hidden="true"><GitBranch size={14} /></span>
                <span className="repository-name"><b>{repository.owner}/</b>{repository.name}</span>
              </button>
            ))}
            {visibleRepositories.length === 0 && <p className="sidebar-empty">No repositories match “{repoQuery}”.</p>}
          </nav>

          <button className="show-more" type="button" onClick={() => setNotice("All repositories will be available when repository persistence lands.")}>Show more <ChevronDown size={14} /></button>

          <div className="sidebar-footer">
            <button className="sidebar-footer-link" type="button" onClick={() => setNotice("Node administration is coming soon.")}><Settings2 size={17} /> Settings</button>
            <div className="node-mini-status"><span className={healthState === "ready" ? "status-dot" : "status-dot status-dot-muted"} />{healthState === "ready" ? "Local node connected" : healthState === "loading" ? "Connecting to node" : "Node unavailable"}</div>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-grid">
            <div className="primary-column">
              <section className="page-heading">
                <div>
                  <p className="section-kicker">Personal workspace</p>
                  <h1>Home</h1>
                </div>
                <button className="outline-button" type="button" onClick={() => setNotice("Repository creation is planned for the next backend milestone.")}><Plus size={16} /> New repository</button>
              </section>

              <section className="workspace-launcher" aria-labelledby="launcher-title">
                <div className="launcher-topline">
                  <div className="launcher-icon"><TerminalSquare size={20} /></div>
                  <div>
                    <h2 id="launcher-title">Find your next starting point</h2>
                    <p>Search repositories and workspace tasks from one place.</p>
                  </div>
                </div>
                <div className="launcher-controls">
                  <div className="launcher-input-wrap">
                    <Search size={18} aria-hidden="true" />
                    <label className="sr-only" htmlFor="workspace-search">Search workspace</label>
                    <input id="workspace-search" value={workspaceQuery} onChange={(event) => setWorkspaceQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchWorkspace()} placeholder="Search a repository or task" />
                  </div>
                  <button className="scope-button" type="button" onClick={() => setNotice("Searching all repositories.")}>All repositories <ChevronDown size={15} /></button>
                  <button className="submit-search" type="button" aria-label="Search workspace" onClick={searchWorkspace}><Search size={17} /></button>
                </div>
              </section>

              <div className="quick-actions" aria-label="Workspace shortcuts">
                <QuickAction icon={<Code2 size={17} />} label="Browse code" onClick={() => setNotice("Choose a repository from the navigation rail to browse code.")} />
                <QuickAction icon={<GitBranch size={17} />} label="Branches" onClick={() => setNotice("Branch views will be available with repository persistence.")} />
                <QuickAction icon={<CircleDot size={17} />} label="Issues" onClick={() => setNotice("Issue tracking is planned for the next backend milestone.")} />
                <QuickAction icon={<Network size={17} />} label="Node health" onClick={() => document.getElementById("node-health")?.scrollIntoView({ behavior: "smooth", block: "center" })} />
              </div>

              <section className="feed-section" aria-labelledby="activity-title">
                <div className="section-heading-row">
                  <div>
                    <p className="section-kicker">Workspace pulse</p>
                    <h2 id="activity-title">Recent activity</h2>
                  </div>
                  <div className="filter-wrap" ref={filterRef}>
                    <button className="filter-button" type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}><LayoutGrid size={16} /> Filter <ChevronDown size={14} /></button>
                    {filterOpen && <div className="popover filter-menu" role="menu" aria-label="Activity filter"><p className="popover-heading">Show activity</p><button className="filter-option selected" type="button" role="menuitem" onClick={() => setFilterOpen(false)}>All activity <Check size={15} /></button><button className="filter-option" type="button" role="menuitem" onClick={() => { setFilterOpen(false); setNotice("Release activity filter is ready when repository data is connected."); }}>Releases</button><button className="filter-option" type="button" role="menuitem" onClick={() => { setFilterOpen(false); setNotice("Review activity filter is ready when pull requests are connected."); }}>Reviews</button></div>}
                  </div>
                </div>

                <div className="activity-feed">
                  {activityItems.map((item) => <ActivityItem key={item.title} {...item} />)}
                </div>
              </section>
            </div>

            <aside className="secondary-column">
              <section className="side-panel" id="node-health" aria-labelledby="node-title">
                <div className="side-panel-heading"><div><p className="section-kicker">This instance</p><h2 id="node-title">Node status</h2></div><span className="node-symbol"><Server size={18} /></span></div>
                <div className={`health-summary ${healthState}`}>
                  <span className="health-indicator" aria-hidden="true" />
                  <div><strong>{healthState === "ready" ? "Local node is ready" : healthState === "loading" ? "Connecting to local node" : "Node status unavailable"}</strong><span>{healthState === "ready" ? "Health endpoint responded just now" : healthState === "loading" ? "Checking /api/v1/health" : "Start the Go API to check status"}</span></div>
                </div>
                <div className="health-details">
                  <HealthRow label="Blob store" value={health?.blob_store ?? (healthState === "loading" ? "Checking" : "Unknown")} tone={health?.blob_store === "ready" ? "positive" : "muted"} />
                  <HealthRow label="Storage" value={health?.storage ?? (healthState === "loading" ? "Checking" : "Unknown")} tone={health?.storage === "local" ? "positive" : "muted"} />
                  <HealthRow label="Replication" value={health?.replication ?? "Planned"} tone="muted" />
                </div>
                <button className="text-button" type="button" onClick={() => setNotice("Node administration is coming soon.")}>Open node settings <span>→</span></button>
              </section>

              <section className="side-panel changelog-panel" aria-labelledby="changelog-title">
                <div className="side-panel-heading"><div><p className="section-kicker">Product updates</p><h2 id="changelog-title">Latest notes</h2></div><Bell size={18} className="quiet-icon" /></div>
                <div className="changelog-list">
                  <ChangelogItem time="Today" title="Home workspace shell refreshed" />
                  <ChangelogItem time="Yesterday" title="Local health reporting added" />
                  <ChangelogItem time="Sep 10" title="Architecture notes published" />
                </div>
                <button className="text-button" type="button" onClick={() => setNotice("The full changelog will be available soon.")}>View all notes <span>→</span></button>
              </section>
            </aside>
          </div>

          <footer className="footer"><span>Forkalope <b>0.1.0-dev</b></span><span className="footer-status"><i className={healthState === "ready" ? "status-dot" : "status-dot status-dot-muted"} /> {health?.storage === "local" ? "Local storage" : healthState === "loading" ? "Checking node" : "Node disconnected"}</span><span>Open-source forge for the distributed web</span></footer>
        </main>
      </div>
      {notice && <div className="toast" role="status"><ShieldCheck size={17} /><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={16} /></button></div>}
    </div>
  );
}

function MenuAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button className="menu-action" type="button" role="menuitem" onClick={onClick}>{icon}<span>{label}</span><span className="menu-soon">Soon</span></button>;
}

function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button className="quick-action" type="button" onClick={onClick}>{icon}<span>{label}</span><ChevronDown size={13} className="quick-chevron" /></button>;
}

function HealthRow({ label, value, tone }: { label: string; value: string; tone: "positive" | "muted" }) {
  return <div className="health-row"><span>{label}</span><strong className={tone}>{value}</strong></div>;
}

function ActivityItem({ icon: Icon, label, title, detail, time, accent }: { icon: typeof Sparkles; label: string; title: string; detail: string; time: string; accent: string }) {
  return <article className="activity-item"><div className={`activity-icon ${accent}`}><Icon size={18} /></div><div className="activity-copy"><div className="activity-meta"><span>{label}</span><time>{time}</time></div><h3>{title}</h3><p>{detail}</p></div><button type="button" className="more-button" aria-label={`More options for ${title}`}><span /><span /><span /></button></article>;
}

function ChangelogItem({ time, title }: { time: string; title: string }) {
  return <article className="changelog-item"><span className="timeline-dot" aria-hidden="true" /><div><time>{time}</time><h3>{title}</h3></div></article>;
}

export default App;

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  CircleDot,
  ChevronDown,
  Database,
  GitBranch,
  GitFork,
  HardDrive,
  HeartPulse,
  Inbox,
  Menu,
  Monitor,
  Network,
  Package,
  Plus,
  Search,
  Server,
  Settings,
  ShieldCheck,
  UsersRound,
  Users,
} from "lucide-react";

type ApiHealth = {
  status: string;
  storage: string;
  replication: string;
};

const nav = [
  { label: "Overview", icon: Activity, active: true },
  { label: "Repositories", icon: GitBranch },
  { label: "Issues", icon: Package, count: 8 },
  { label: "Pull requests", icon: ArrowUpRight, count: 3 },
];

const repos = [
  { name: "forge", description: "The Forkalope forge itself", language: "Go", color: "#6db33f", updated: "12 min ago" },
  { name: "node-protocol", description: "Peer discovery and replication", language: "Go", color: "#00add8", updated: "2 hours ago" },
  { name: "desktop-client", description: "A native client for your node", language: "TypeScript", color: "#3178c6", updated: "Yesterday" },
];

function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null);

  useEffect(() => {
    fetch("/api/v1/health")
      .then((response) => (response.ok ? response.json() : null))
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-button" aria-label="Open navigation"><Menu size={22} /></button>
          <img className="topbar-logo" src="/logo.png" alt="Forkalope" />
        </div>
        <div className="top-actions">
          <button className="search-button"><Search size={20} /><span>Type <kbd>/</kbd> to search</span></button>
          <button className="top-icon-button top-icon-with-chevron" aria-label="Organizations"><UsersRound size={20} /><ChevronDown size={15} /></button>
          <span className="topbar-divider" />
          <button className="top-icon-button top-icon-with-chevron" aria-label="Create new"><Plus size={21} /><ChevronDown size={15} /></button>
          <button className="top-icon-button" aria-label="Issues"><CircleDot size={21} /></button>
          <button className="top-icon-button" aria-label="Pull requests"><GitFork size={21} /></button>
          <button className="top-icon-button" aria-label="Projects"><Monitor size={21} /></button>
          <button className="top-icon-button notification-button" aria-label="Notifications"><Inbox size={21} /><i /></button>
          <button className="avatar" aria-label="Account">AK</button>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className="sidebar">
        <div className="node-card">
          <div className="node-icon"><Server size={17} /></div>
          <div><strong>home node</strong><span>lax-01 · online</span></div>
          <span className="online-dot" />
        </div>
        <nav className="main-nav">
          <p className="eyebrow">Workspace</p>
          {nav.map(({ label, icon: Icon, active, count }) => <a className={active ? "nav-link active" : "nav-link"} href="#" key={label}><Icon size={18} /><span>{label}</span>{count && <small>{count}</small>}</a>)}
          <p className="eyebrow section-label">Network</p>
          <a className="nav-link" href="#"><Network size={18} /><span>Nodes</span></a>
          <a className="nav-link" href="#"><HardDrive size={18} /><span>Storage</span></a>
          <a className="nav-link" href="#"><ShieldCheck size={18} /><span>Co-sysops</span></a>
        </nav>
        <div className="sidebar-bottom"><a className="nav-link" href="#"><Users size={18} /><span>Team</span></a><a className="nav-link" href="#"><Settings size={18} /><span>Settings</span></a></div>
        </aside>

        <main className="main-content">
        <div className="content-wrap">
          <section className="hero"><div><p className="eyebrow">Saturday, September 13, 2026</p><h1>Good morning, Alex.</h1><p className="hero-copy">Your forge is healthy. Here’s what’s happening across your workspace.</p></div><button className="primary-button"><Plus size={17} /> New repository</button></section>

          <section className="stat-grid">
            <Stat icon={<GitBranch size={18} />} label="Repositories" value="24" detail="+3 this month" positive />
            <Stat icon={<ArrowUpRight size={18} />} label="Open pull requests" value="3" detail="2 need review" />
            <Stat icon={<HardDrive size={18} />} label="Storage used" value="3.4 TB" detail="of 5 TB capacity" />
            <Stat icon={<Network size={18} />} label="Network health" value="98.7%" detail={health ? "All systems operational" : "Connect API to check"} positive />
          </section>

          <div className="dashboard-grid">
            <section className="panel repositories-panel"><div className="panel-heading"><div><p className="eyebrow">Your work</p><h2>Recent repositories</h2></div><a href="#">View all <ArrowUpRight size={14} /></a></div><div className="repo-list">{repos.map((repo) => <article className="repo-row" key={repo.name}><div className="repo-icon"><GitBranch size={18} /></div><div className="repo-main"><div className="repo-title"><strong>{repo.name}</strong><span className="visibility">Private</span></div><p>{repo.description}</p><div className="repo-meta"><span><i style={{ background: repo.color }} />{repo.language}</span><span>Updated {repo.updated}</span></div></div><ArrowUpRight className="row-arrow" size={17} /></article>)}</div></section>
            <section className="panel node-panel"><div className="panel-heading"><div><p className="eyebrow">Infrastructure</p><h2>Node health</h2></div><button className="icon-button"><Settings size={16} /></button></div><div className="health-status"><div className="health-orb"><HeartPulse size={24} /></div><div><strong>Everything is running</strong><span>Last checked just now</span></div></div><div className="capacity"><div className="capacity-label"><span>Disk capacity</span><strong>68%</strong></div><div className="capacity-track"><div className="capacity-fill" /></div><div className="capacity-detail"><span>3.4 TB used</span><span>1.6 TB free</span></div></div><div className="node-details"><div><span>Node</span><strong>lax-01</strong></div><div><span>Uptime</span><strong>14d 06h</strong></div><div><span>Protected objects</span><strong>1.8m</strong></div></div></section>
          </div>

          <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Across your workspace</p><h2>Recent activity</h2></div><a href="#">Activity log <ArrowUpRight size={14} /></a></div><div className="activity-list"><ActivityItem initials="MC" color="orange" text={<><strong>Maya Chen</strong> opened pull request <em>#42 Improve peer discovery</em></>} time="18 minutes ago" /><ActivityItem initials="AK" color="green" text={<><strong>You</strong> merged pull request <em>#39 Add blob integrity checks</em></>} time="2 hours ago" /><ActivityItem initials="JB" color="purple" text={<><strong>Jordan Bell</strong> pushed 4 commits to <em>node-protocol/main</em></>} time="Yesterday" /></div></section>
        </div>
        <footer className="footer"><span>Forkalope <b>0.1.0-dev</b></span><span className="footer-status"><i /> Local node connected · {health?.storage ?? "local storage"}</span><span>Built for the distributed web</span></footer>
        </main>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, detail, positive }: { icon: ReactNode; label: string; value: string; detail: string; positive?: boolean }) {
  return <article className="stat-card"><div className="stat-icon">{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className={positive ? "stat-detail positive" : "stat-detail"}>{positive && <span>↗</span>} {detail}</span></article>;
}

function ActivityItem({ initials, color, text, time }: { initials: string; color: string; text: ReactNode; time: string }) {
  return <div className="activity-item"><div className={`activity-avatar ${color}`}>{initials}</div><div className="activity-copy"><p>{text}</p><span>{time}</span></div></div>;
}

export default App;

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  Cable,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDot,
  Clock3,
  Code2,
  Database,
  Gauge,
  Globe2,
  GitBranch,
  GitCommitHorizontal,
  HardDrive,
  History,
  Home,
  Info,
  Layers3,
  LifeBuoy,
  ListChecks,
  Menu,
  Network,
  PauseCircle,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  UserRound,
  Users,
  Wrench,
  X,
  Workflow,
  Zap,
} from "lucide-react";

type ForkliftView =
  | "overview"
  | "incidents"
  | "repositories"
  | "actions"
  | "runners"
  | "storage"
  | "databases"
  | "networking"
  | "observability"
  | "runbooks"
  | "change-log"
  | "settings"
  | "git-push"
  | "incident-detail";

type Icon = ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;

const primaryNav: Array<{ label: string; view: ForkliftView; icon: Icon; badge?: string }> = [
  { label: "Overview", view: "overview", icon: Home },
  { label: "Incidents", view: "incidents", icon: TriangleAlert, badge: "2" },
  { label: "Repositories", view: "repositories", icon: Archive },
  { label: "Actions", view: "actions", icon: Play },
  { label: "Runners", view: "runners", icon: Gauge },
  { label: "Storage", view: "storage", icon: HardDrive },
  { label: "Databases", view: "databases", icon: Database },
  { label: "Networking", view: "networking", icon: Network },
];

const secondaryNav: Array<{ label: string; view: ForkliftView; icon: Icon }> = [
  { label: "Observability", view: "observability", icon: BarChart3 },
  { label: "Runbooks", view: "runbooks", icon: LifeBuoy },
  { label: "Change Log", view: "change-log", icon: History },
  { label: "Settings", view: "settings", icon: Settings },
];

// Keep the richer operator surfaces in the source while the live control
// plane is still being built. Re-enable these views as their APIs become real.
const SHOW_UNWIRED_SURFACES = false;

const metrics = [
  { label: "Affected services", value: "4", suffix: "/ 12", note: "3 degraded · 1 partial outage", tone: "danger", icon: Layers3 },
  { label: "Open incidents", value: "2", suffix: "", note: "1 SEV-1 · 1 SEV-3", tone: "danger", icon: CircleAlert },
  { label: "Queued workflows", value: "48,732", suffix: "", note: "↑ 312% vs. 6h ago", tone: "danger", icon: Workflow },
  { label: "p95 API latency", value: "842", suffix: "ms", note: "↑ 320% · normal < 250 ms", tone: "danger", icon: Activity },
  { label: "Git push failure rate", value: "2.8", suffix: "%", note: "↑ 2.4% · normal < 0.1%", tone: "danger", icon: GitBranch },
  { label: "Blob-store error rate", value: "1.2", suffix: "%", note: "↑ 1.0% · normal < 0.1%", tone: "danger", icon: Database },
  { label: "Regions impacted", value: "2", suffix: "/ 6", note: "us-east major · eu-west minor", tone: "warning", icon: Globe2 },
];

const serviceRows = [
  ["Actions (CI/CD)", "degraded", "healthy", "degraded", "healthy", "Degraded"],
  ["Git (Smart HTTP)", "degraded", "healthy", "healthy", "healthy", "Degraded"],
  ["Git (SSH)", "degraded", "healthy", "healthy", "healthy", "Degraded"],
  ["Packages", "healthy", "healthy", "healthy", "healthy", "Healthy"],
  ["Container Registry", "healthy", "healthy", "healthy", "healthy", "Healthy"],
  ["Pages", "healthy", "healthy", "healthy", "healthy", "Healthy"],
  ["Blob Storage", "degraded", "healthy", "healthy", "healthy", "Degraded"],
  ["Metadata DB", "healthy", "healthy", "healthy", "healthy", "Healthy"],
];

const timeline = [
  ["15:52", "Mitigation in progress", "Auto-scaling policy updated. New runners provisioning (target +50%).", "SRE Platform", "blue"],
  ["15:48", "Elevated Git push failure rate detected", "Failure rate 2.8% (normal < 0.1%). Primarily affecting us-east.", "Monitoring", "red"],
  ["15:41", "Workflow queue length crossed 40,000", "Queue time p95 > 25 minutes in us-east.", "Alerting", "yellow"],
  ["15:37", "Runner assignment latency increasing", "Runner assignment p95 at 842 ms (normal < 1 s).", "Monitoring", "yellow"],
  ["15:28", "Incident declared SEV-1", "Multiple signals indicating broad impact to Actions and Git.", "Incident Commander", "red"],
  ["15:26", "Investigating elevated workflow queue times", "Initial reports from us-east. Correlating with runner fleet metrics.", "SRE Platform", "slate"],
];

const runnerRows = [
  ["hosted-linux-large", "us-east", "412 / 600", "92%", "12,482", "1.8 s", "4.1%", "Degraded"],
  ["hosted-linux-standard", "us-east", "231 / 400", "89%", "18,213", "2.4 s", "3.8%", "Degraded"],
  ["hosted-windows", "us-west", "188 / 300", "67%", "4,921", "3.1 s", "1.2%", "Healthy"],
  ["macos", "us-west", "96 / 150", "58%", "1,103", "6.7 s", "0.9%", "Healthy"],
  ["self-hosted-enterprise", "eu-west", "142 / 200", "74%", "2,341", "4.3 s", "1.6%", "Healthy"],
  ["gpu-builders", "us-east", "48 / 80", "96%", "3,842", "12.6 s", "5.8%", "Degraded"],
  ["arm-builders", "ap-southeast", "73 / 120", "61%", "1,296", "5.1 s", "1.1%", "Healthy"],
];

const traceRows = [
  ["16:27:44", "4f2a7c9e3b1d…", "acme/platform", "acme", "us-east", "2.41 s", "Blob Store (timeout)", "Failed"],
  ["16:26:18", "8c1d2e5f9a7b…", "starlight/web", "starlight", "us-east", "1.32 s", "Git Smart HTTP (500)", "Failed"],
  ["16:24:03", "d9e7b1c3a4f0…", "orbit/api", "orbit", "us-east", "892 ms", "Auth Service (401)", "Failed"],
  ["16:22:11", "a3c9e0f1b6d4…", "acme/mobile", "acme", "us-east", "3.12 s", "Blob Store (timeout)", "Failed"],
  ["16:20:55", "f7b2d8e4c1a9…", "nova/infra", "nova", "us-east", "1.87 s", "Metadata DB (timeout)", "Failed"],
  ["16:19:21", "c4e6b9d2a8f1…", "lumen/docs", "lumen", "us-east", "1.21 s", "Git Smart HTTP (503)", "Failed"],
];

const incidentTimeline = [
  ["17:40", "Update", "Blob Store write latency returning to normal in us-east-1", "Error rate down to 0.8% (from 12.4%). Monitoring for stability.", "Taylor Kim", "blue"],
  ["17:32", "Mitigation", "Scaled Actions runner pool in us-east-1", "Increased capacity by 50%. New runners coming online.", "Marcus Lee", "green"],
  ["17:24", "Finding", "Identified elevated API latency in us-east-1", "p95 latency 842ms (normal < 250ms). Correlated with storage backend.", "Priya Shah", "red"],
  ["17:18", "Alert", "Git push failure rate detected", "Failure rate 2.8% (normal < 0.1%) in us-east-1.", "Monitoring", "yellow"],
  ["17:03", "Customer Impact", "Multiple customer reports in support", "Reports of failed workflow runs and push timeouts.", "", "red"],
  ["16:47", "Update", "Expanded investigation to Blob Store and Packages", "Similar error patterns detected in storage layer.", "Daniel Park", "green"],
  ["16:32", "Mitigation", "Rerouted non-critical Actions workloads", "Shifted new workflow runs to us-west-2.", "Marcus Lee", "green"],
  ["15:48", "Alert", "Actions workflow failure rate elevated", "Failure rate 8.3% (normal < 0.5%) in us-east-1.", "", "red"],
  ["15:26", "Incident Opened", "Incident #INC-2024-1187 created", "Automated detection via error budget burn rate.", "Jordan Diaz", "blue"],
];

function ForkliftPage() {
  const [view, setView] = useState<ForkliftView>("networking");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [timeRange, setTimeRange] = useState("Last 6 hours");
  const [region, setRegion] = useState("All regions");
  const [systemFilter, setSystemFilter] = useState("All systems");

  const availablePrimaryNav = SHOW_UNWIRED_SURFACES ? primaryNav : primaryNav.filter((item) => item.view === "networking");
  const availableSecondaryNav = SHOW_UNWIRED_SURFACES ? secondaryNav : [];
  const searchableNav = useMemo(() => [...availablePrimaryNav, ...availableSecondaryNav].filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [availablePrimaryNav, availableSecondaryNav, query]);

  const selectView = (nextView: ForkliftView) => {
    setView(nextView);
    setMobileNavOpen(false);
  };

  const showNotice = (message: string) => setNotice(message);

  return (
    <div className={`forklift-shell${sidebarCollapsed ? " forklift-shell-collapsed" : ""}`}>
      <header className="forklift-topbar">
        <div className="forklift-brand-row">
          <button className="forklift-menu-toggle" type="button" aria-label="Open admin navigation" onClick={() => setMobileNavOpen((open) => !open)}><Menu size={20} /></button>
          <a className="forklift-brand" href="/forklift" aria-label="Forkalope Forklift admin center"><img src="/logo.png" alt="" /><span>Forkalope</span></a>
          <span className="forklift-brand-divider" aria-hidden="true" />
          <span className="forklift-product-name">Forklift</span>
        </div>

        {SHOW_UNWIRED_SURFACES && <label className="forklift-global-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search services, repositories, incidents, or runbooks</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services, repositories, incidents, runbooks…" />
          <kbd>⌘ K</kbd>
        </label>}

        <div className="forklift-top-actions">
          {SHOW_UNWIRED_SURFACES && <><label className="forklift-select"><Globe2 size={15} aria-hidden="true" /><span className="sr-only">Environment</span><select defaultValue="Training lab"><option>Production</option><option>Training lab</option><option>Local node</option></select><ChevronDown size={13} aria-hidden="true" /></label>
          {view !== "networking" && <label className="forklift-select forklift-time-select"><CalendarDays size={15} aria-hidden="true" /><span className="sr-only">Time range</span><select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}><option>Last 6 hours</option><option>Last 24 hours</option><option>Last 7 days</option></select><ChevronDown size={13} aria-hidden="true" /></label>}
          {view !== "networking" && <label className="forklift-select forklift-system-select"><span className="health-dot healthy" aria-hidden="true" /><span className="sr-only">System filter</span><select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)}><option>All systems</option><option>Healthy only</option><option>Degraded only</option></select><ChevronDown size={13} aria-hidden="true" /></label>}
          <button className="forklift-icon-button forklift-notification-button" type="button" aria-label="Open notifications" onClick={() => showNotice("3 unread operational notifications.")}><Bell size={18} /><span>3</span></button>
          <button className="forklift-user-button" type="button" aria-label="Open Jordan Diaz account menu" onClick={() => showNotice("Account menu is available in the connected admin shell.")}><span className="forklift-avatar">JD</span><span className="forklift-user-copy"><strong>Jordan Diaz</strong><small>SRE</small></span><ChevronDown size={13} /></button></>}
        </div>
      </header>

      <div className="forklift-body">
        <aside className={`forklift-sidebar${mobileNavOpen ? " forklift-sidebar-mobile-open" : ""}`} aria-label="Forklift navigation">
          <div className="forklift-sidebar-scroll">
            <p className="forklift-sidebar-heading">Control plane</p>
            <nav className="forklift-nav" aria-label="Control plane">
              {availablePrimaryNav.map((item) => <ForkliftNavItem key={item.view} item={item} active={view === item.view || (item.view === "incidents" && view === "incident-detail")} onClick={() => selectView(item.view)} />)}
            </nav>
            {availableSecondaryNav.length > 0 && <><p className="forklift-sidebar-heading forklift-sidebar-heading-spaced">Operations</p><nav className="forklift-nav" aria-label="Operations">{availableSecondaryNav.map((item) => <ForkliftNavItem key={item.view} item={item} active={view === item.view} onClick={() => selectView(item.view)} />)}</nav></>}
          </div>
          <button className="forklift-collapse-button" type="button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}><ChevronLeft size={17} className={sidebarCollapsed ? "rotate-chevron" : ""} /><span>{sidebarCollapsed ? "Expand" : "Collapse"}</span></button>
        </aside>

        <main className="forklift-main">
          <div className="forklift-main-inner">
            {view !== "incident-detail" && view !== "networking" && <IncidentStrip onClick={() => selectView("incident-detail")} />}
            {view === "incident-detail" ? <IncidentPage onNotice={showNotice} onBack={() => selectView("overview")} /> : view === "actions" || view === "runners" ? <RunnersPage timeRange={timeRange} region={region} setRegion={setRegion} onNotice={showNotice} /> : view === "git-push" ? <GitPushPage timeRange={timeRange} region={region} setRegion={setRegion} onNotice={showNotice} /> : view === "overview" ? <OverviewPage onNavigate={selectView} onNotice={showNotice} /> : view === "networking" ? <NetworkingPage onNotice={showNotice} /> : <UtilityPage view={view} query={query} visibleNavCount={searchableNav.length} onNotice={showNotice} />}
            {view !== "incident-detail" && view === "overview" && <p className="forklift-fixture-note"><Info size={14} /> Forklift is showing deterministic training fixtures. Live metrics, logs, and controls will connect through the SRE admin API.</p>}
          </div>
        </main>
      </div>

      {notice && <div className="forklift-toast" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={16} /></button></div>}
    </div>
  );
}

function ForkliftNavItem({ item, active, onClick }: { item: { label: string; icon: Icon; badge?: string }; active: boolean; onClick: () => void }) {
  const IconComponent = item.icon;
  return <button className={`forklift-nav-item${active ? " is-active" : ""}`} type="button" onClick={onClick} aria-current={active ? "page" : undefined} title={item.label}><IconComponent size={18} /><span>{item.label}</span>{item.badge && <b>{item.badge}</b>}</button>;
}

function IncidentStrip({ onClick }: { onClick: () => void }) {
  return <button className="forklift-incident-strip" type="button" onClick={onClick}><span className="forklift-incident-icon"><TriangleAlert size={23} /></span><span className="forklift-severity">SEV-1</span><span className="forklift-incident-copy"><strong>Queued workflows rising in us-east; runner assignment degraded.</strong><small>Workflow run queue times are increasing in us-east. Runner assignment is degraded and some Git operations are experiencing elevated failure rates.</small></span><span className="forklift-incident-meta"><span>Incident #INC-2024-1187</span><span>Opened 47 minutes ago</span><span>Updated 5 minutes ago</span></span><span className="forklift-more-dots" aria-hidden="true">⋮</span></button>;
}

function OverviewPage({ onNavigate, onNotice }: { onNavigate: (view: ForkliftView) => void; onNotice: (message: string) => void }) {
  return <>
    <div className="forklift-page-heading"><div><p className="forklift-eyebrow">Production · All regions</p><h1>Overview</h1><p>Operational health across the Forkalope service and training node.</p></div><button className="forklift-outline-button" type="button" onClick={() => onNotice("Overview filters are pinned to the fixture time window.")}><SlidersHorizontal size={15} /> Customize</button></div>
    <div className="forklift-metric-grid">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} onClick={() => onNotice(`${metric.label} is using deterministic fixture data.`)} />)}</div>
    <div className="forklift-overview-grid">
      <section className="forklift-panel forklift-chart-panel"><PanelHeading title="Workflow Queue Length & Runner Availability" icon={Activity} action={<SelectButton label="Last 6 hours" onClick={() => onNotice("Time range is controlled from the top bar.")} />} /><QueueChart /></section>
      <section className="forklift-panel forklift-service-panel"><PanelHeading title="Services & Regional Impact" icon={Server} action={<button className="forklift-panel-link" type="button" onClick={() => onNavigate("git-push")}>View service dashboard <ArrowUpRight size={14} /></button>} /><ServiceTable /></section>
    </div>
    <div className="forklift-bottom-grid">
      <section className="forklift-panel forklift-events-panel"><PanelHeading title="Recent Events" icon={ListChecks} action={<SelectButton label="All events" onClick={() => onNotice("All recent events are shown.")} />} /><Timeline /></section>
      <section className="forklift-panel forklift-mitigation-panel"><PanelHeading title="Current Mitigations" icon={Wrench} action={undefined} /><MitigationList onNotice={onNotice} /><div className="forklift-panel-divider" /><PanelHeading title="Incident Owners" icon={Users} action={undefined} /><OwnerList /></section>
      <section className="forklift-panel forklift-resources-panel"><PanelHeading title="Resources" icon={Cable} action={undefined} /><ResourceList onNotice={onNotice} /><div className="forklift-note-composer"><input aria-label="Add an incident note" placeholder="Add an incident note…" /><small>Markdown supported</small><button type="button" onClick={() => onNotice("Notes are not connected to an incident store yet.")}>Add Note</button></div></section>
    </div>
  </>;
}

function MetricCard({ label, value, suffix, note, tone, icon: IconComponent, onClick }: { label: string; value: string; suffix: string; note: string; tone: string; icon: Icon; onClick: () => void }) {
  return <button className="forklift-metric-card" type="button" onClick={onClick}><span className={`forklift-metric-icon ${tone}`}><IconComponent size={18} /></span><span className="forklift-metric-label">{label}</span><span className="forklift-metric-value">{value}<small>{suffix}</small></span><span className={`forklift-metric-note ${tone}`}>{note}</span></button>;
}

function PanelHeading({ title, icon: IconComponent, action }: { title: string; icon: Icon; action?: ReactNode }) {
  return <div className="forklift-panel-heading"><div><IconComponent size={17} /><h2>{title}</h2></div>{action}</div>;
}

function SelectButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="forklift-small-select" type="button" onClick={onClick}>{label}<ChevronDown size={13} /></button>;
}

function QueueChart() {
  return <div className="forklift-chart-wrap"><svg className="forklift-chart" viewBox="0 0 720 260" role="img" aria-label="Queue length rising while runner availability falls over the last six hours"><defs><linearGradient id="queue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff6b57" stopOpacity=".42" /><stop offset="1" stopColor="#ff6b57" stopOpacity=".02" /></linearGradient></defs><g className="chart-grid-lines"><line x1="48" y1="26" x2="684" y2="26" /><line x1="48" y1="76" x2="684" y2="76" /><line x1="48" y1="126" x2="684" y2="126" /><line x1="48" y1="176" x2="684" y2="176" /><line x1="48" y1="226" x2="684" y2="226" /><line x1="48" y1="26" x2="48" y2="226" /><line x1="154" y1="26" x2="154" y2="226" /><line x1="260" y1="26" x2="260" y2="226" /><line x1="366" y1="26" x2="366" y2="226" /><line x1="472" y1="26" x2="472" y2="226" /><line x1="578" y1="26" x2="578" y2="226" /><line x1="684" y1="26" x2="684" y2="226" /></g><path className="queue-area" d="M48 216 C105 212 120 216 154 209 S212 212 260 196 S320 183 366 162 S425 126 472 107 S524 96 578 78 S635 62 684 34 L684 226 L48 226 Z" /><path className="queue-line" d="M48 216 C105 212 120 216 154 209 S212 212 260 196 S320 183 366 162 S425 126 472 107 S524 96 578 78 S635 62 684 34" /><path className="runner-line" d="M48 57 C105 54 122 62 154 58 S212 65 260 78 S320 70 366 92 S421 112 472 127 S532 142 578 159 S632 168 684 191" /><g className="chart-axis-labels"><text x="10" y="30">80K</text><text x="13" y="130">40K</text><text x="27" y="230">0</text><text x="54" y="248">10:00</text><text x="160" y="248">11:00</text><text x="266" y="248">12:00</text><text x="372" y="248">13:00</text><text x="478" y="248">14:00</text><text x="584" y="248">15:00</text><text x="664" y="248">16:00</text></g></svg><div className="forklift-chart-legend"><span><i className="legend-swatch queue" />Queued workflows</span><span><i className="legend-swatch runners" />Runner availability %</span></div></div>;
}

function ServiceTable() {
  return <div className="forklift-table-scroll"><table className="forklift-table service-table"><thead><tr><th>Service</th><th>us-east</th><th>us-west</th><th>eu-west</th><th>ap-southeast</th><th>Status</th></tr></thead><tbody>{serviceRows.map((row) => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1, 5).map((status, index) => <td key={`${row[0]}-${index}`}><StatusDot status={status} /></td>)}<td><StatusPill status={row[5]} /></td></tr>)}</tbody></table></div>;
}

function StatusDot({ status }: { status: string }) {
  const icon = status === "healthy" ? <Check size={11} /> : status === "degraded" ? <CircleAlert size={11} /> : <TriangleAlert size={11} />;
  return <span className={`forklift-status-dot ${status}`} title={status}>{icon}<span>{status}</span></span>;
}

function StatusPill({ status }: { status: string }) {
  return <span className={`forklift-status-pill ${status.toLowerCase()}`}>{status}</span>;
}

function Timeline() {
  return <div className="forklift-timeline">{timeline.map(([time, title, detail, owner, tone]) => <article className="forklift-timeline-item" key={`${time}-${title}`}><span className={`timeline-marker ${tone}`} /><time>{time}</time><div><strong>{title}</strong><p>{detail}</p></div><span className="timeline-owner">{owner}</span></article>)}</div>;
}

function MitigationList({ onNotice }: { onNotice: (message: string) => void }) {
  const items = [["Scale runner pool in us-east-1", "In progress"], ["Shift new workflow capacity to us-west", "In progress"], ["Increase Git front-end capacity", "Planned"], ["Monitor blob-store error rate", "Active"], ["Communicate status to customers", "Active"]];
  return <div className="forklift-check-list">{items.map(([label, status]) => <button type="button" key={label} onClick={() => onNotice(`${label}: ${status.toLowerCase()}.`)}><CheckSquare checked={status !== "Planned"} /><span>{label}</span><em className={status.toLowerCase().replace(" ", "-")}>{status}</em></button>)}</div>;
}

function CheckSquare({ checked }: { checked: boolean }) {
  return <span className={`forklift-check-square${checked ? " checked" : ""}`} aria-hidden="true">{checked && <Check size={11} />}</span>;
}

function OwnerList() {
  return <div className="forklift-owner-list">{[["Incident Commander", "Taylor Kim"], ["Actions Service", "Priya Shah"], ["Git Service", "Marcus Lee"], ["Infrastructure", "Daniel Park"], ["Communications", "Elena Rossi"]].map(([role, name]) => <div key={role}><UserRound size={15} /><span>{role}</span><i /><strong>{name}</strong></div>)}</div>;
}

function ResourceList({ onNotice }: { onNotice: (message: string) => void }) {
  const resources = [["Live Logs", "View logs", Activity], ["Distributed Traces", "Open in Jaeger", Cable], ["Metrics Dashboard", "View in Grafana", BarChart3], ["Service Dashboard", "Open", Server], ["Runbook", "actions/runner-degradation", LifeBuoy], ["Status Page", "View public status", Globe2]] as const;
  return <div className="forklift-resource-list">{resources.map(([label, action, IconComponent]) => <button type="button" key={label} onClick={() => onNotice(`${label} is not connected in this fixture environment.`)}><IconComponent size={15} /><span>{label}</span><b>{action} <ArrowUpRight size={13} /></b></button>)}</div>;
}

function RunnersPage({ timeRange, region, setRegion, onNotice }: { timeRange: string; region: string; setRegion: (value: string) => void; onNotice: (message: string) => void }) {
  return <>
    <div className="forklift-page-heading"><div><p className="forklift-eyebrow">Actions · {timeRange}</p><h1>Runner Fleet</h1><p>Monitor runner capacity, assignment latency, and execution health across all regions.</p></div><label className="forklift-region-switcher"><span>Region</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option><option>us-east</option><option>us-west</option><option>eu-west</option></select><ChevronDown size={13} /></label></div>
    <div className="forklift-metric-grid forklift-runner-metrics">{[["Queued workflow runs", "48,732", "↑ 312%", "danger", Workflow], ["Runner assignment latency (p95)", "842 ms", "↑ 320%", "danger", Clock3], ["Healthy runner capacity", "1,284 / 1,620", "79%", "positive", Users], ["Failed job start rate", "2.8%", "↑ 2.4%", "danger", CircleAlert], ["Artifact upload delay (p95)", "12.4 s", "↑ 180%", "danger", Archive], ["Autoscaling actions", "47", "↑ 250%", "info", Zap]].map(([label, value, note, tone, icon]) => <MetricCard key={label as string} label={label as string} value={value as string} suffix="" note={note as string} tone={tone as string} icon={icon as Icon} onClick={() => onNotice(`${label} detail view is planned for the Actions API.`)} />)}</div>
    <div className="forklift-overview-grid forklift-runner-grid"><section className="forklift-panel forklift-chart-panel"><PanelHeading title="Queue Length vs Healthy Runners" icon={Activity} action={<SelectButton label={timeRange} onClick={() => onNotice("Time range is controlled from the top bar.")} />} /><QueueChart /></section><section className="forklift-panel forklift-runner-table-panel"><PanelHeading title="Runner Groups" icon={Users} action={undefined} /><RunnerTable /></section></div>
    <div className="forklift-bottom-grid forklift-runner-bottom"><section className="forklift-panel forklift-events-panel"><PanelHeading title="Recent scheduler events" icon={ListChecks} action={<SelectButton label="All events" onClick={() => onNotice("All scheduler events are shown.")} />} /><SchedulerEvents /></section><section className="forklift-panel forklift-mitigation-panel"><PanelHeading title="Mitigations in progress" icon={Wrench} action={undefined} /><MitigationList onNotice={onNotice} /></section><section className="forklift-panel forklift-resources-panel"><PanelHeading title="Resources" icon={Cable} action={undefined} /><ResourceList onNotice={onNotice} /></section></div>
  </>;
}

function RunnerTable() {
  return <div className="forklift-table-scroll"><table className="forklift-table runner-table"><thead><tr><th>Group</th><th>Region</th><th>Online</th><th>Busy %</th><th>Queue depth</th><th>Startup</th><th>Failure rate</th><th>Status</th></tr></thead><tbody>{runnerRows.map((row) => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1, 7).map((cell, index) => <td className={index === 2 || index === 4 || index === 6 ? "emphasis-cell" : ""} key={`${row[0]}-${index}`}>{cell}</td>)}<td><StatusPill status={row[7]} /></td></tr>)}</tbody></table></div>;
}

function SchedulerEvents() {
  return <div className="forklift-timeline"><article className="forklift-timeline-item"><span className="timeline-marker red" /><time>16:02</time><div><strong>Runner assignment latency threshold breached</strong><p>p95 842 ms in us-east (normal &lt; 250 ms)</p></div></article><article className="forklift-timeline-item"><span className="timeline-marker blue" /><time>15:48</time><div><strong>Autoscaling increased us-east linux-large pool</strong><p>Scaled from 400 to 600 runners</p></div></article><article className="forklift-timeline-item"><span className="timeline-marker yellow" /><time>15:41</time><div><strong>Runner pool capacity drain initiated</strong><p>Draining 22 unhealthy runners from us-east-1</p></div></article><article className="forklift-timeline-item"><span className="timeline-marker red" /><time>15:37</time><div><strong>High queue depth detected</strong><p>Queue depth 18,213 for hosted-linux-standard</p></div></article></div>;
}

function GitPushPage({ timeRange, region, setRegion, onNotice }: { timeRange: string; region: string; setRegion: (value: string) => void; onNotice: (message: string) => void }) {
  return <>
    <div className="forklift-page-heading forklift-push-heading"><div><p className="forklift-eyebrow">Observability · Git Smart HTTP</p><h1>Git Push Path</h1><p>Trace and analyze Git push requests across services.</p></div><div className="forklift-filter-row"><label>Time range<SelectButton label={timeRange} onClick={() => onNotice("Time range is controlled from the top bar.")} /></label><label>Region<SelectButton label={region} onClick={() => setRegion(region === "us-east" ? "All regions" : "us-east")} /></label><label>Repository<SelectButton label="All repositories" onClick={() => onNotice("Repository filtering will use repository telemetry when connected.")} /></label></div></div>
    <div className="forklift-metric-grid forklift-push-metrics">{[["Push success rate", "94.2%", "↓ 5.6%", "danger", GitBranch], ["p95 push latency", "842 ms", "↑ 320%", "danger", Clock3], ["Authentication errors", "1.8%", "↑ 240%", "danger", ShieldCheck], ["DB write latency", "46 ms", "↓ 85%", "positive", Database], ["Blob store write failures", "0.7%", "↑ 180%", "danger", HardDrive], ["Affected repositories", "17 / 1,284", "↑ 240%", "danger", Archive]].map(([label, value, note, tone, icon]) => <MetricCard key={label as string} label={label as string} value={value as string} suffix="" note={note as string} tone={tone as string} icon={icon as Icon} onClick={() => onNotice(`${label} detail view is planned for trace storage.`)} />)}</div>
    <section className="forklift-panel forklift-flow-panel"><PanelHeading title="Request Flow - Git Push" icon={GitCommitHorizontal} action={<SelectButton label="Show error rates" onClick={() => onNotice("Error-rate view is selected.")} />} /><div className="forklift-flow-map">{[["Client", "12 ms", "healthy", UserRound], ["Edge / LB", "18 ms", "healthy", Network], ["API Gateway", "25 ms", "healthy", Boxes], ["Auth Service", "42 ms", "degraded", ShieldCheck], ["Git Smart HTTP", "380 ms", "unhealthy", GitBranch], ["Metadata DB", "46 ms", "degraded", Database], ["Blob Store", "120 ms", "unhealthy", HardDrive], ["Background Jobs", "210 ms", "degraded", Settings], ["Webhooks", "95 ms", "healthy", Cable]].map(([label, latency, status, icon], index) => { const IconComponent = icon as Icon; return <div className="flow-node-wrap" key={label as string}><div className={`flow-node ${status as string}`}><span><IconComponent size={17} /></span><strong>{label as string}</strong><small><i className={`health-dot ${status === "healthy" ? "healthy" : status === "degraded" ? "warning" : "danger"}`} />{latency as string}</small><small>{status === "healthy" ? "0 errors" : status === "degraded" ? "3 errors" : "427 errors"}</small></div>{index < 8 && <ChevronRight className="flow-arrow" size={17} />}</div>; })}</div></section>
    <div className="forklift-trace-grid"><section className="forklift-panel forklift-trace-table-panel"><PanelHeading title="Recent Git Push Traces" icon={Activity} action={<label className="forklift-inline-search"><Search size={13} /><input aria-label="Filter traces" placeholder="Filter traces, repositories, or request IDs…" /></label>} /><TraceTable /></section><section className="forklift-panel forklift-trace-detail"><PanelHeading title="Trace Details" icon={Search} action={<button className="forklift-panel-link" type="button" onClick={() => onNotice("Full trace view is not connected yet.")}>View full trace</button>} /><TraceDetail onNotice={onNotice} /></section></div>
  </>;
}

function TraceTable() {
  return <div className="forklift-table-scroll"><table className="forklift-table trace-table"><thead><tr><th>Time</th><th>Trace ID</th><th>Repository</th><th>Tenant</th><th>Region</th><th>Duration</th><th>Failure point</th><th>Status</th></tr></thead><tbody>{traceRows.map((row) => <tr key={row[1]}><td><span className="trace-fail-icon"><CircleAlert size={12} /></span>{row[0]}</td>{row.slice(1, 7).map((cell) => <td key={`${row[1]}-${cell}`}>{cell}</td>)}<td><StatusPill status={row[7]} /></td></tr>)}</tbody></table></div>;
}

function TraceDetail({ onNotice }: { onNotice: (message: string) => void }) {
  return <div className="trace-detail-body"><div className="trace-detail-summary"><span className="trace-fail-icon large"><CircleAlert size={16} /></span><div><strong>Trace 4f2a7c9e3b1d4f8a9c0e2d7b6a1f3e9c</strong><small>Mar 8, 2024 16:27:44 · 2.41 s · acme/platform · us-east</small></div><StatusPill status="Failed" /></div><div className="trace-tabs"><button className="active" type="button">Span Timeline</button><button type="button" onClick={() => onNotice("Trace logs are not connected in the fixture environment.")}>Logs</button><button type="button" onClick={() => onNotice("Trace attributes are not connected in the fixture environment.")}>Attributes</button></div><div className="span-list">{[["Client", "12 ms", "green", "0ms"], ["Edge / LB", "18 ms", "green", "12ms"], ["API Gateway", "25 ms", "green", "30ms"], ["Auth Service", "42 ms", "yellow", "55ms"], ["Git Smart HTTP", "380 ms", "red", "97ms"], ["Metadata DB", "46 ms", "yellow", "480ms"], ["Blob Store", "1.92 s", "red", "526ms"]].map(([label, duration, tone, start]) => <div className="span-row" key={label}><span className={`span-dot ${tone}`} /><strong>{label}</strong><small>{duration}</small><div className="span-track"><i className={tone} style={{ left: `${start}`, width: label === "Blob Store" ? "58%" : label === "Git Smart HTTP" ? "28%" : "5%" }} /></div></div>)}</div><div className="trace-error-box"><CircleAlert size={17} /><strong>ERROR</strong><span>Blob store write failed</span><small>context deadline exceeded after 2.0s</small><button type="button" onClick={() => onNotice("Logs are not connected in the fixture environment.")}>View logs <ArrowUpRight size={13} /></button></div></div>;
}

function IncidentPage({ onNotice, onBack }: { onNotice: (message: string) => void; onBack: () => void }) {
  return <div className="forklift-incident-page"><div className="forklift-breadcrumbs"><button type="button" onClick={onBack}>Incidents</button><ChevronRight size={14} /> <span>INC-2024-1187</span></div><div className="forklift-incident-header"><div className="forklift-incident-title"><Layers3 size={25} /><div><h1>Incident #INC-2024-1187</h1><span className="forklift-severity">SEV-1</span></div></div><div className="incident-header-facts"><span><small>State</small><strong><i className="health-dot danger" /> Investigating <ChevronDown size={13} /></strong></span><span><small>Started</small><strong>Today 15:26 UTC <em>2h 16m elapsed</em></strong></span><span><small>Affected regions</small><strong>us-east-1 <em>Partial impact</em></strong></span><span><small>Incident Commander</small><strong><span className="forklift-avatar small">TK</span> Taylor Kim <i className="health-dot healthy" /></strong></span></div></div><div className="forklift-incident-alert"><TriangleAlert size={24} /><div><strong>Workflow execution degraded; some Git operations failing in us-east</strong><small>Elevated failure rates for Actions workflows and Git operations in us-east. Users may experience workflow failures, push/pull errors, and timeouts.</small></div></div><div className="forklift-incident-tabs"><button className="active" type="button">Overview</button><button type="button" onClick={() => onNotice("Incident timeline is shown in the Overview tab.")}>Timeline</button><button type="button" onClick={() => onNotice("6 mitigation actions are currently tracked.")}>Mitigations <b>6</b></button><button type="button" onClick={() => onNotice("Customer impact is fixture data for this incident.")}>Customer Impact</button><button type="button" onClick={() => onNotice("3 incident notes are available.")}>Notes <b>3</b></button><div className="incident-tab-actions"><button type="button" onClick={() => onNotice("Incident link copied to clipboard in the connected admin API.")}>Share</button><button type="button" onClick={() => onNotice("Escalation workflow is not connected yet.")}>Escalate <ChevronDown size={13} /></button><button className="end-incident" type="button" onClick={() => onNotice("Ending incidents requires a connected admin API.")}>End Incident</button></div></div><div className="incident-content-grid"><section className="forklift-panel incident-timeline-panel"><PanelHeading title="Incident Timeline" icon={History} action={<div className="incident-live-controls"><SelectButton label="All events" onClick={() => onNotice("All incident events are shown.")} /><span><i className="health-dot healthy" /> Live</span></div>} /><div className="forklift-incident-timeline">{incidentTimeline.map(([time, kind, title, detail, owner, tone]) => <article key={`${time}-${kind}`}><span className={`incident-marker ${tone}`} /><time>{time}</time><div><b className={tone}>{kind}</b><strong>{title}</strong><p>{detail}</p></div><small>{owner}</small></article>)}</div></section><section className="incident-column"><CustomerImpact /><MitigationActions onNotice={onNotice} /><section className="forklift-panel incident-hypotheses"><PanelHeading title="Open Hypotheses / Next Steps" icon={Sparkles} action={<button className="forklift-panel-link" type="button" onClick={() => onNotice("Hypothesis creation is not connected yet.")}>Add Hypothesis</button>} /><div className="hypothesis-row"><b>H1</b><span>Storage backend entering elevated latency</span><StatusPill status="Likely" /></div><div className="hypothesis-row"><b>H2</b><span>Network degradation in us-east-1</span><StatusPill status="Possible" /></div></section></section><section className="incident-column"><IncidentTeam /><Communications onNotice={onNotice} /><IncidentNotes onNotice={onNotice} /></section></div></div>;
}

function CustomerImpact() {
  return <section className="forklift-panel customer-impact"><PanelHeading title="Customer Impact" icon={Users} action={<SelectButton label="Last 6 hours" onClick={() => undefined} />} /><div className="impact-stats"><span><strong>2,847</strong><small>Affected tenants</small><em>12,493 (22.8%)</em></span><span><strong>48,732</strong><small>Failed workflow runs</small><em>+31% vs. baseline</em></span><span><strong>6,421</strong><small>Failed Git operations</small><em>+18% vs. baseline</em></span><span><strong>99</strong><small>Support tickets</small><em>+340% vs. baseline</em></span></div><div className="impact-list">{[["Actions (CI/CD)", "High", "2,341 tenants", "8.3%", "Degraded"], ["Git (Smart HTTP)", "High", "1,892 tenants", "2.8%", "Degraded"], ["Blob Store", "Medium", "623 tenants", "1.2%", "Degraded"], ["Packages", "Low", "214 tenants", "0.6%", "Monitoring"]].map((row) => <div key={row[0]}><span>{row[0]}</span><b className={row[1].toLowerCase()}>{row[1]}</b><span>{row[2]}</span><strong>{row[3]}</strong><StatusPill status={row[4]} /></div>)}</div></section>;
}

function MitigationActions({ onNotice }: { onNotice: (message: string) => void }) {
  return <section className="forklift-panel mitigation-actions"><PanelHeading title="Mitigation Actions" icon={Wrench} action={<button className="forklift-panel-link" type="button" onClick={() => onNotice("New mitigation actions require a connected incident API.")}>Add Action</button>} /><div className="action-chips"><span>6 open</span><span>3 in progress</span><span className="green">4 completed</span></div>{[["A1", "Scale runner pool in us-east-1", "Marcus Lee", "Completed", "17:32"], ["A2", "Reroute non-critical workloads to us-west-2", "Daniel Park", "Completed", "16:47"], ["A3", "Investigate storage backend latency", "Marcus Chen", "In progress", "18:00"], ["A4", "Validate database health and replication", "Jordan Diaz", "In progress", "18:15"], ["A5", "Gradually re-enable workflow queue", "Taylor Kim", "Pending", "—"]].map(([id, title, owner, status, eta]) => <button className="mitigation-row" type="button" key={id} onClick={() => onNotice(`${id}: ${status}.`)}><CheckSquare checked={status === "Completed"} /><b>{id}</b><span>{title}</span><small>{owner}</small><StatusPill status={status} /><time>{eta}</time></button>)}</section>;
}

function IncidentTeam() {
  return <section className="forklift-panel incident-team"><PanelHeading title="Incident Team" icon={Users} action={<button className="forklift-panel-link" type="button">Add People</button>} />{[["Incident Commander", "TK", "Taylor Kim"], ["Communications Lead", "PS", "Priya Shah"], ["Infrastructure Lead", "ML", "Marcus Lee"], ["Actions Service Lead", "DP", "Daniel Park"], ["Git Service Lead", "ER", "Elena Rossi"], ["Storage Service Lead", "MC", "Marcus Chen"], ["Status Page Owner", "JD", "Jordan Diaz"]].map(([role, initials, name]) => <div className="team-row" key={role}><span>{role}</span><strong><span className="forklift-avatar tiny">{initials}</span>{name}</strong><i className="health-dot healthy" />In call</div>)}</section>;
}

function Communications({ onNotice }: { onNotice: (message: string) => void }) {
  return <section className="forklift-panel communications"><div className="communication-tabs"><button className="active" type="button">Customer Update</button><button type="button" onClick={() => onNotice("Internal communications are not connected yet.")}>Internal</button><button type="button" onClick={() => onNotice("Status page publishing is not connected yet.")}>Status Page</button></div><div className="communication-editor"><span>Draft · Not published</span><button type="button" onClick={() => onNotice("Draft saved to the fixture state.")}>Save Draft</button><p>We are currently investigating elevated failure rates for Actions workflows and Git operations in us-east. Our team has identified the issue and is working on a fix. We will provide another update in 30 minutes.</p><small>Last updated 6 minutes ago by Priya Shah</small><button className="publish-button" type="button" onClick={() => onNotice("Publishing requires a connected status page integration.")}>Publish Update</button></div></section>;
}

function IncidentNotes({ onNotice }: { onNotice: (message: string) => void }) {
  return <section className="forklift-panel incident-notes"><PanelHeading title="Incident Notes" icon={Archive} action={<button className="forklift-panel-link" type="button" onClick={() => onNotice("Note creation is not connected yet.")}>Add Note</button>} /><div className="note-row"><time>17:36</time><div><strong>Priya Shah</strong><p>Customer comms drafted, waiting for next update window.</p></div><b>···</b></div><div className="note-row"><time>17:20</time><div><strong>Taylor Kim</strong><p>Seeing improvement in blob store metrics. Continuing to monitor.</p></div><b>···</b></div></section>;
}

type FabricNode = {
  id: string;
  name: string;
  role: string;
  region: string;
  version: string;
  api_address: string;
  fabric_addresses: string[];
  started_at: string;
  last_seen: string;
  state: "online" | "unavailable";
};

type FabricSnapshot = {
  cluster_id: string;
  local_node_id: string;
  observed_at: string;
  nodes: FabricNode[];
};

type FederationStep = {
  key: string;
  label: string;
  state: "complete" | "pending";
  detail: string;
};

type FederationManifest = {
  franchise_id: string;
  name: string;
  endpoint: string;
  fingerprint: string;
};

type FederationContract = {
  id: string;
  remote_manifest: FederationManifest;
  proposal_sent: boolean;
  proposal_received: boolean;
  local_approved: boolean;
  remote_approved: boolean;
  gateway_reachable: boolean;
  state: string;
  last_error?: string;
};

type FederationStatus = {
  local: FederationManifest;
  peer_configured: boolean;
  peer_url?: string;
  peer_franchise?: string;
  contract?: FederationContract;
  steps: FederationStep[];
};

function NetworkingPage({ onNotice }: { onNotice: (message: string) => void }) {
  const [snapshot, setSnapshot] = useState<FabricSnapshot | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [federation, setFederation] = useState<FederationStatus | null>(null);
  const [federationState, setFederationState] = useState<"loading" | "ready" | "error">("loading");
  const [federationRefreshKey, setFederationRefreshKey] = useState(0);
  const [federationAction, setFederationAction] = useState<string | null>(null);
  const [federationError, setFederationError] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/v1/fabric/nodes", { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error(`Node inventory returned ${response.status}`);
          return response.json() as Promise<FabricSnapshot>;
        })
        .then((value) => {
          if (!active) return;
          setSnapshot(value);
          setLoadState("ready");
        })
        .catch(() => active && setLoadState("error"));
    };
    load();
    const interval = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/v1/federation/status", { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error(`Federation status returned ${response.status}`);
          return response.json() as Promise<FederationStatus>;
        })
        .then((value) => {
          if (!active) return;
          setFederation(value);
          setFederationState("ready");
          setFederationError(null);
        })
        .catch(() => active && setFederationState("error"));
    };
    load();
    const interval = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [federationRefreshKey]);

  const runFederationAction = (path: string, label: string) => {
    setFederationAction(label);
    setFederationError(null);
    fetch(path, { method: "POST", headers: { Accept: "application/json" } })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as FederationStatus | { error?: string } | null;
        if (!response.ok) throw new Error(body && "error" in body && body.error ? body.error : `Action returned ${response.status}`);
        return body as FederationStatus;
      })
      .then((value) => {
        setFederation(value);
        setFederationState("ready");
      })
      .catch((error: Error) => setFederationError(error.message))
      .finally(() => setFederationAction(null));
  };

  const online = snapshot?.nodes.filter((node) => node.state === "online").length ?? 0;
  const unavailable = (snapshot?.nodes.length ?? 0) - online;
  const setupMode = Boolean(snapshot && snapshot.nodes.length < 3);

  useEffect(() => {
    if (!snapshot) return;
    setSetupComplete(window.sessionStorage.getItem(`forkalope.setup.v2.complete.${snapshot.cluster_id}`) === "1");
  }, [snapshot?.cluster_id]);

  const startOver = () => {
    if (!window.confirm("Start over? This clears Forkalope setup progress in this browser. Running containers and node data will not be deleted.")) return;
    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith("forkalope.setup."))
      .forEach((key) => window.sessionStorage.removeItem(key));
    setSetupComplete(false);
    onNotice("Setup progress cleared. Starting over.");
  };

  if (snapshot && setupMode && !setupComplete) {
    return <section className="forklift-network-page forklift-network-page-setup">
      <SetupWizard clusterID={snapshot.cluster_id} onNotice={onNotice} onComplete={() => setSetupComplete(true)} />
    </section>;
  }

  return <section className="forklift-network-page">
    <div className="forklift-page-heading">
      <div><p className="forklift-eyebrow">{snapshot?.cluster_id ?? "Forkalope fabric"}</p><h1>Nodes</h1><p>Live membership as observed by the Forge node serving this page.</p></div>
      <div className="forklift-network-heading-actions">
        {setupMode && setupComplete ? <button className="forklift-danger-button" type="button" onClick={startOver}><RefreshCw size={14} /> Start over</button> : null}
        <button className="forklift-outline-button" type="button" onClick={() => { setLoadState("loading"); setRefreshKey((value) => value + 1); }} disabled={loadState === "loading"}><RefreshCw size={15} className={loadState === "loading" ? "is-spinning" : ""} /> Refresh</button>
      </div>
    </div>

    {loadState === "error" && !snapshot ? <div className="forklift-network-message" role="alert"><AlertCircle size={18} /><div><strong>Node inventory unavailable</strong><p>The Forge API did not answer at <code>/api/v1/fabric/nodes</code>.</p></div><button type="button" onClick={() => setRefreshKey((value) => value + 1)}>Try again</button></div> : null}
    {loadState === "loading" && !snapshot ? <div className="forklift-network-message" aria-live="polite"><RefreshCw className="is-spinning" size={18} /><div><strong>Discovering nodes</strong><p>Reading this node’s current fabric membership view.</p></div></div> : null}

    {federationState === "error" ? <div className="forklift-network-message" role="alert"><AlertCircle size={18} /><div><strong>Federation status unavailable</strong><p>The local node did not answer at <code>/api/v1/federation/status</code>; the checklist may be stale.</p></div><button type="button" onClick={() => setFederationRefreshKey((value) => value + 1)}>Try again</button></div> : null}
    {federationState === "loading" && !federation ? <div className="forklift-network-message" aria-live="polite"><RefreshCw className="is-spinning" size={18} /><div><strong>Reading federation state</strong><p>Checking identity, peer configuration, approvals, and gateway reachability.</p></div></div> : null}
    {federation ? <FederationPanel status={federation} action={federationAction} error={federationError} onAction={runFederationAction} /> : null}

    {snapshot ? <>
      <div className="forklift-network-summary" aria-label="Fabric summary">
        <div><span className="health-dot healthy" aria-hidden="true" /><strong>{online}</strong><span>online</span></div>
        <div className={unavailable > 0 ? "has-warning" : ""}><span className="health-dot" aria-hidden="true" /><strong>{unavailable}</strong><span>unavailable</span></div>
        <div><Server size={15} aria-hidden="true" /><strong>{snapshot.nodes.find((node) => node.id === snapshot.local_node_id)?.name ?? snapshot.local_node_id}</strong><span>serving this page</span></div>
        <p role="status">Updated {formatNodeAge(snapshot.observed_at)}</p>
      </div>

      <div className="forklift-panel forklift-node-inventory">
        <div className="forklift-panel-heading"><div><Network size={17} /><h2>Fabric membership</h2></div><div className="forklift-node-actions"><button type="button" onClick={() => onNotice("Node provisioning will use the approved lab defaults in the next setup step.")}><span aria-hidden="true">+</span> Add node</button><button type="button" onClick={() => onNotice("A new franchise machine requires a separate enrollment flow.")}><span aria-hidden="true">+</span> Add machine</button><span>Anti-entropy gossip · 15s expiry</span></div></div>
        <div className="forklift-table-scroll">
          <table className="forklift-table forklift-node-table">
            <thead><tr><th scope="col">Node</th><th scope="col">State</th><th scope="col">Role</th><th scope="col">Region</th><th scope="col">Fabric addresses</th><th scope="col">API address</th><th scope="col">Last seen</th></tr></thead>
            <tbody>{snapshot.nodes.map((node) => <tr key={node.id}>
              <th scope="row"><span className="forklift-node-name"><Server size={15} /><span><strong>{node.name}</strong><small>{node.id === snapshot.local_node_id ? "This node" : node.id}</small></span></span></th>
              <td><span className={`forklift-node-state ${node.state}`}><CircleDot size={13} />{node.state}</span></td>
              <td>{node.role}</td>
              <td>{node.region}</td>
              <td><span className="forklift-address-list">{node.fabric_addresses.length ? node.fabric_addresses.map((address) => <code key={address}>{address}</code>) : <span>Not advertised</span>}</span></td>
              <td><code>{displayAPIAddress(node.api_address)}</code></td>
              <td>{node.id === snapshot.local_node_id ? "now" : formatNodeAge(node.last_seen)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="forklift-membership-note"><Info size={14} /> This is an eventually consistent operational view. Node presence is not write authority, replica freshness, or proof of data durability.</p>
      </div>
    </> : null}
  </section>;
}

function SetupWizard({ clusterID, onNotice, onComplete }: { clusterID: string; onNotice: (message: string) => void; onComplete: () => void }) {
  const storageKey = `forkalope.setup.v2.step.${clusterID}`;
  const [step, setStep] = useState(() => Math.max(0, Math.min(2, Number(window.sessionStorage.getItem(storageKey) ?? "0") || 0)));
  const advance = () => {
    const next = Math.min(step + 1, 2);
    setStep(next);
    window.sessionStorage.setItem(storageKey, String(next));
    if (next === 1) onNotice("Launch plan approved. The next deployment uses the default three-node lab.");
  };
  const finish = () => {
    window.sessionStorage.setItem(`forkalope.setup.v2.complete.${clusterID}`, "1");
    onComplete();
  };
  const steps = ["Machine", "Plan", "Finish"];
  const content = [
    { title: "Your machine is ready", detail: "Forkalope found one machine to work with.", status: "Machine detected", action: "Continue" },
    { title: "Approve the default plan", detail: "We will launch the standard three-node lab.", status: "No choices required", action: "Approve plan" },
    { title: "Setup is complete", detail: "You can now see and manage this franchise.", status: "Ready to enter Forklift", action: "Open Forklift" },
  ][step];
  return <section className="forklift-setup-wizard" aria-labelledby="setup-heading">
    <div className="forklift-setup-progress"><span>Setup</span><ol aria-label="Setup progress">{steps.map((label, index) => <li className={index <= step ? "is-active" : ""} key={label}><span>{index + 1}</span><small>{label}</small></li>)}</ol><strong>{step + 1} <small>/ 3</small></strong></div>
    <div className="forklift-setup-content">
      <p className="forklift-setup-kicker">Forkalope</p>
      <h1 id="setup-heading">{content.title}</h1>
      <p className="forklift-setup-detail">{content.detail}</p>
      <div className="forklift-setup-status"><CircleCheck size={16} /><span>{content.status}</span></div>
      <button className="forklift-setup-next" type="button" onClick={step < 2 ? advance : finish}>{content.action}<ArrowRightIcon /></button>
    </div>
  </section>;
}

function ArrowRightIcon() {
  return <ArrowUpRight size={15} aria-hidden="true" />;
}

function FederationPanel({ status, action, error, onAction }: { status: FederationStatus; action: string | null; error: string | null; onAction: (path: string, label: string) => void }) {
  const contract = status.contract;
  const actionPath = !status.peer_configured ? null : !contract ? "/api/v1/federation/propose" : !contract.local_approved ? "/api/v1/federation/approve" : contract.remote_approved && !contract.gateway_reachable ? "/api/v1/federation/probe" : null;
  const actionLabel = !contract ? "Send proposal" : !contract.local_approved ? "Approve proposal" : "Probe gateway";
  const actionDescription = !status.peer_configured ? "Configure a peer endpoint on this node before proposing." : !contract ? `Ask ${status.peer_franchise} to review a signed node-observation contract.` : !contract.local_approved ? "Review the peer identity and record this franchise's approval." : !contract.remote_approved ? "Local approval is recorded; waiting for the peer operator's approval." : !contract.gateway_reachable ? "Both sides have approved. Verify the peer gateway from this node." : "Federation is active for the node-observation scope.";

  return <section className="forklift-panel forklift-federation-panel" aria-labelledby="federation-heading">
    <div className="forklift-panel-heading"><div><Cable size={17} /><h2 id="federation-heading">Franchise federation</h2></div><span>{status.local.name} · signed identity</span></div>
    <div className="forklift-federation-meta">
      <span><small>Local franchise</small><strong>{status.local.franchise_id}</strong><code>{status.local.fingerprint}</code></span>
      <span><small>Peer</small><strong>{status.peer_franchise ?? "Not configured"}</strong><code>{status.peer_url ?? "Add a federation endpoint"}</code></span>
      <span><small>Contract</small><strong>{contract ? contract.state : "Not started"}</strong><code>{contract?.id ?? "—"}</code></span>
    </div>
    <div className="forklift-federation-action"><div><strong>{actionDescription}</strong>{error ? <p className="forklift-federation-error" role="alert"><AlertCircle size={13} />{error}</p> : null}</div>{actionPath ? <button className="forklift-outline-button" type="button" onClick={() => onAction(actionPath, actionLabel)} disabled={Boolean(action)}>{action ? <RefreshCw size={14} className="is-spinning" /> : <ArrowUpRight size={14} />}{action === actionLabel ? "Working…" : actionLabel}</button> : contract?.gateway_reachable ? <span className="forklift-federation-active"><CircleCheck size={14} /> Active</span> : <span className="forklift-federation-waiting"><Clock3 size={14} /> Waiting</span>}</div>
    <ol className="forklift-federation-steps">{status.steps.map((step) => <li className={`forklift-federation-step ${step.state}`} key={step.key}><span className="forklift-federation-step-icon">{step.state === "complete" ? <CircleCheck size={15} /> : <Clock3 size={15} />}</span><span><strong>{step.label}</strong><small>{step.detail}</small></span></li>)}</ol>
    {contract?.remote_manifest?.fingerprint ? <p className="forklift-federation-note"><ShieldCheck size={14} /> Peer signing key verified: <code>{contract.remote_manifest.fingerprint}</code>. Approval is bilateral; either franchise can decline before the gateway opens.</p> : null}
  </section>;
}

function formatNodeAge(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  if (elapsed < 1500) return "just now";
  if (elapsed < 60_000) return `${Math.floor(elapsed / 1000)}s ago`;
  return `${Math.floor(elapsed / 60_000)}m ago`;
}

function displayAPIAddress(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return value || "Not advertised";
  }
}

function UtilityPage({ view, query, visibleNavCount, onNotice }: { view: ForkliftView; query: string; visibleNavCount: number; onNotice: (message: string) => void }) {
  const data = utilityContent(view);
  const IconComponent = data.icon;
  return <section className="forklift-utility-page"><div className="forklift-page-heading"><div><p className="forklift-eyebrow">Forklift admin center</p><h1>{data.title}</h1><p>{data.description}</p></div><button className="forklift-outline-button" type="button" onClick={() => onNotice(`${data.title} is ready for the connected admin API.`)}><ArrowDownToLine size={15} /> Export view</button></div><div className="forklift-utility-hero"><span><IconComponent size={24} /></span><div><strong>{data.status}</strong><p>{data.detail}</p></div><StatusPill status="Planned" /></div><div className="forklift-utility-grid">{data.cards.map((card) => <button type="button" key={card.label} onClick={() => onNotice(`${card.label} has no connected data source yet.`)}><span><card.icon size={17} /></span><div><strong>{card.label}</strong><small>{card.value}</small><p>{card.note}</p></div><ChevronRight size={16} /></button>)}</div>{query && <p className="forklift-search-result"><Search size={14} /> Searching for “{query}” across the control plane · {visibleNavCount} matching navigation areas</p>}</section>;
}

function utilityContent(view: ForkliftView): { title: string; description: string; status: string; detail: string; icon: Icon; cards: Array<{ label: string; value: string; note: string; icon: Icon }> } {
  const map: Record<string, { title: string; description: string; status: string; detail: string; icon: Icon; cards: Array<{ label: string; value: string; note: string; icon: Icon }> }> = {
    incidents: { title: "Incidents", description: "Coordinate active investigations and preserve operational evidence.", status: "2 active incidents", detail: "Incident records will be loaded from the admin API.", icon: TriangleAlert, cards: [{ label: "Open incidents", value: "2", note: "1 SEV-1 · 1 SEV-3", icon: CircleAlert }, { label: "Unassigned alerts", value: "6", note: "Awaiting an incident owner", icon: Bell }, { label: "Postmortems", value: "Unavailable", note: "No incident store connected", icon: Archive }] },
    repositories: { title: "Repositories", description: "Inspect repository health, Git operations, and storage impact.", status: "1,284 repositories", detail: "Repository inventory is planned for the SRE admin API.", icon: Archive, cards: [{ label: "Git push success", value: "94.2%", note: "Fixture window · us-east degraded", icon: GitBranch }, { label: "Integrity checks", value: "Unknown", note: "No worker results connected", icon: ShieldCheck }, { label: "Largest repositories", value: "Unavailable", note: "Requires storage telemetry", icon: HardDrive }] },
    storage: { title: "Storage", description: "Watch blob capacity, write health, and recovery evidence.", status: "Blob store degraded", detail: "Storage readiness will be backed by actual capacity and write checks.", icon: HardDrive, cards: [{ label: "Blob-store error rate", value: "1.2%", note: "Normal < 0.1%", icon: Database }, { label: "Disk capacity", value: "Unknown", note: "Capacity telemetry not connected", icon: Gauge }, { label: "Last verified backup", value: "Unavailable", note: "Backup records not connected", icon: Archive }] },
    databases: { title: "Databases", description: "Understand metadata health, latency, and replication state.", status: "Metadata DB healthy", detail: "Database telemetry remains unavailable until the admin API is connected.", icon: Database, cards: [{ label: "Write latency", value: "46 ms", note: "Fixture window · normal < 25 ms", icon: Activity }, { label: "Connections", value: "Unknown", note: "No database metrics connected", icon: Cable }, { label: "Replication", value: "Planned", note: "Single-node mode is active", icon: Network }] },
    networking: { title: "Networking", description: "Trace service-to-service reachability and regional impact.", status: "us-east partial impact", detail: "Network checks will use liveness and request evidence.", icon: Network, cards: [{ label: "Regions", value: "6", note: "2 impacted in fixture data", icon: Globe2 }, { label: "Ingress", value: "Healthy", note: "No current evidence of edge failure", icon: ArrowUpRight }, { label: "Peer links", value: "Planned", note: "Replication network is not active", icon: Cable }] },
    observability: { title: "Observability", description: "Connect logs, metrics, traces, and health evidence in one place.", status: "Fixture telemetry active", detail: "Live observability integrations are not connected to this build.", icon: BarChart3, cards: [{ label: "Metrics", value: "Fixture only", note: "Deterministic training values", icon: Activity }, { label: "Logs", value: "Not connected", note: "Request log stream is unavailable", icon: ListChecks }, { label: "Traces", value: "Not connected", note: "Trace storage is unavailable", icon: Cable }] },
    runbooks: { title: "Runbooks", description: "Keep recovery procedures close to the signals they explain.", status: "1 draft runbook", detail: "The first training runbook is “Node unavailable during a push.”", icon: LifeBuoy, cards: [{ label: "Push failure recovery", value: "Draft", note: "Pause writers · inspect · recover · verify", icon: GitBranch }, { label: "Backup and restore", value: "Planned", note: "Maintenance-window procedure", icon: Archive }, { label: "Replica promotion", value: "Planned", note: "Manual authority transition", icon: Network }] },
    "change-log": { title: "Change Log", description: "Review changes that could affect availability or recovery.", status: "Audit trail unavailable", detail: "Change events require the structured audit log from the backend.", icon: History, cards: [{ label: "Recent deploys", value: "Unknown", note: "No deployment source connected", icon: ArrowUpRight }, { label: "Config changes", value: "Unknown", note: "No audit stream connected", icon: Settings }, { label: "Schema migrations", value: "Planned", note: "Migration history will be visible here", icon: Database }] },
    settings: { title: "Settings", description: "Configure the node identity, environment, and admin integrations.", status: "Local node", detail: "Settings are read-only in this fixture until authenticated admin writes exist.", icon: Settings, cards: [{ label: "Environment", value: "Production", note: "Fixture environment label", icon: Globe2 }, { label: "Node identity", value: "Unknown", note: "Node ID is not loaded", icon: Server }, { label: "Admin access", value: "Planned", note: "Permission model is being built", icon: ShieldCheck }] },
  };
  return map[view] ?? map.observability;
}

export default ForkliftPage;

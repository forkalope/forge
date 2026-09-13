const socialLinks = [
  { label: "YouTube", href: "https://www.youtube.com/@forkalope" },
  { label: "Instagram", href: "https://www.instagram.com/forkalope/" },
  { label: "Reddit", href: "https://www.reddit.com/r/forkalope/" },
  { label: "TikTok", href: "https://www.tiktok.com/@forkalope" },
  { label: "GitHub", href: "https://github.com/forkalope" },
  { label: "X", href: "https://x.com/forkalope" },
  { label: "Discord", href: "https://discord.gg/forkalope" },
];

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <a className="site-footer-logo" href="/" aria-label="Forkalope home">
            <img src="/logo.png" alt="" />
            <span>Forkalope</span>
          </a>
          <p>Open-source forge for the distributed web.</p>
          <span className="site-footer-copyright">© 2026 Forkalope</span>
        </div>

        <nav className="site-footer-links" aria-label="Legal">
          <span className="site-footer-label" aria-hidden="true">Legal</span>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </nav>

        <nav className="site-footer-links site-footer-social" aria-label="Social links">
          <span className="site-footer-label" aria-hidden="true">Follow</span>
          <div className="site-footer-social-grid">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
}

export default SiteFooter;

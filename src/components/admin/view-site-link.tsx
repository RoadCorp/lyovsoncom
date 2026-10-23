import "./view-site-link.css";

// Uses Payload's own nav link classes so it matches the links above it.
export default function ViewSiteLink() {
  return (
    <div className="nav__link-wrapper view-site-link">
      <a className="nav__link" href="/" rel="noopener" target="_blank">
        <span className="nav__link-label">View site</span>
        <svg
          aria-hidden="true"
          className="view-site-link__external"
          fill="none"
          height="12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 12 12"
          width="12"
        >
          <path d="M3.5 3h5.5v5.5M9 3L3 9" />
        </svg>
      </a>
    </div>
  );
}

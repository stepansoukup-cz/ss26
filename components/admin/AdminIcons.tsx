type IconProps = {
  className?: string;
};

export function AdminNavIcon({
  name,
  className = "h-4 w-4 shrink-0",
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "articles":
      return <IconArticles className={className} />;
    case "settings":
      return <IconSettings className={className} />;
    case "profile":
      return <IconProfile className={className} />;
    case "tags":
      return <IconTags className={className} />;
    case "comments":
      return <IconComments className={className} />;
    case "messages":
      return <IconMessages className={className} />;
    case "pages":
      return <IconPages className={className} />;
    default:
      return <IconDot className={className} />;
  }
}

function IconArticles({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 2.5h7l3 3V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M10 2.5V5.5H13" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M12.5 9.2a1 1 0 0 0 .2 1.1l.03.03a1.2 1.2 0 1 1-1.7 1.7l-.03-.03a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V13a1 1 0 0 1-2 0v-.04a1 1 0 0 0-.65-.94 1 1 0 0 0-1.1.2l-.03.03a1.2 1.2 0 1 1-1.7-1.7l.03-.03a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3a1 1 0 0 1 0-2h.04a1 1 0 0 0 .94-.65 1 1 0 0 0-.2-1.1l-.03-.03a1.2 1.2 0 1 1 1.7-1.7l.03.03a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V3a1 1 0 0 1 2 0v.04a1 1 0 0 0 .65.94 1 1 0 0 0 1.1-.2l.03-.03a1.2 1.2 0 1 1 1.7 1.7l-.03.03a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H13a1 1 0 0 1 0 2h-.04a1 1 0 0 0-.94.65 1 1 0 0 0 .2 1.1Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfile({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M3.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTags({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 3h5.2L13 7.8v5.2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconComments({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6l-3 2.5V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M5.5 7h5M5.5 9h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconMessages({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2 5l6 3.5L14 5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function IconPages({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.5" y="3" width="11" height="10" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2.5 5.75h11" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 8.5h6M5 10.75h3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconDot({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

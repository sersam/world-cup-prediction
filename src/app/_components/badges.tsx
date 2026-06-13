import type { Badge } from "@/lib/badges";

function BadgeSvg({ icon }: { icon: Badge["icon"] }) {
  if (icon === "bolt") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />
      </svg>
    );
  }

  if (icon === "target") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
    );
  }

  if (icon === "flame") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13 2s1 4-2 7c-2 2-4 4-4 7a5 5 0 0 0 10 0c0-2-1-4-3-6 0 3-2 4-2 4s-1-2 1-5c1-2 1-5 0-7Z" />
      </svg>
    );
  }

  if (icon === "checklist") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M8 6h12" />
        <path d="M8 12h12" />
        <path d="M8 18h12" />
        <path d="m3 6 1 1 2-3" />
        <path d="m3 12 1 1 2-3" />
        <path d="m3 18 1 1 2-3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 20 4-1 11-11a2.8 2.8 0 0 0-4-4L4 15l-1 4a1 1 0 0 0 1 1Z" />
      <path d="m13 6 5 5" />
    </svg>
  );
}

export function BadgePill({ badge, compact = false }: { badge: Badge; compact?: boolean }) {
  const tooltip = `${badge.label}: ${badge.description}`;

  return (
    <button
      aria-label={tooltip}
      className={`badge-chip badge-chip-${badge.tone} ${compact ? "badge-chip-compact" : ""}`}
      type="button"
    >
      <BadgeSvg icon={badge.icon} />
      <span className="badge-tooltip" role="tooltip">
        <strong>{badge.label}</strong>
        <span>{badge.description}</span>
      </span>
    </button>
  );
}

export function BadgeList({
  badges,
  compact = false,
  limit,
}: {
  badges: Badge[];
  compact?: boolean;
  limit?: number;
}) {
  const visibleBadges = typeof limit === "number" ? badges.slice(0, limit) : badges;

  if (visibleBadges.length === 0) {
    return <p className="text-sm text-[#5d615f]">Todavia no hay insignias.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleBadges.map((badge) => (
        <BadgePill badge={badge} compact={compact} key={badge.id} />
      ))}
    </div>
  );
}

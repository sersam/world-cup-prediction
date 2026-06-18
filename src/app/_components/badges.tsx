import type { Badge } from "@/lib/badges";

function BadgeSvg({ icon }: { icon: Badge["icon"] }) {
  if (icon === "bolt") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />
      </svg>
    );
  }

  if (icon === "target" || icon === "target3" || icon === "target5" || icon === "target10") {
    const exactNumber = icon === "target" ? null : icon.replace("target", "");

    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        {exactNumber ? (
          <text className="badge-exact-number" x="12" y="14.5">
            {exactNumber}
          </text>
        ) : (
          <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        )}
      </svg>
    );
  }

  if (icon === "flame3" || icon === "flame5" || icon === "flame10") {
    const streakNumber = icon.replace("flame", "");
    const flamePath =
      icon === "flame10"
        ? "M12 1.5c3.5 3.8 6.2 7.2 6.2 12.1a6.2 6.2 0 0 1-12.4 0c0-3.1 1.8-5.5 4.2-7.8 1.7-1.6 2.4-3 2-4.3Z"
        : icon === "flame5"
          ? "M12.7 2.6c2.4 3 4.5 5.6 4.5 9.5a5.2 5.2 0 0 1-10.4 0c0-2.6 1.5-4.7 3.5-6.5 1.3-1.3 2-2.3 2.4-3Z"
          : "M12.6 3.6c2 2.4 3.8 4.8 3.8 8.1a4.5 4.5 0 0 1-9 0c0-2.2 1.3-4 3-5.6 1.1-1 1.7-1.9 2.2-2.5Z";
    const innerFlamePath =
      icon === "flame10"
        ? "M13.9 9.5c.6 2.4-1.5 3.7-1.5 3.7s-1-1.5.3-3.8c-2.1 1.5-3.2 3.1-3.2 5.4a2.7 2.7 0 0 0 5.4 0c0-1.8-.5-3.4-1-5.3Z"
        : icon === "flame5"
          ? "M13.4 10.2c.3 1.9-1.2 2.9-1.2 2.9s-.8-1.2.2-3c-1.5 1.2-2.3 2.4-2.3 4.1a2.1 2.1 0 0 0 4.2 0c0-1.4-.4-2.6-.9-4Z"
          : "M13 10.8c.2 1.5-1 2.3-1 2.3s-.6-1 .2-2.4c-1.2 1-1.9 2-1.9 3.3a1.8 1.8 0 0 0 3.6 0c0-1.1-.3-2.1-.9-3.2Z";

    return (
      <svg
        aria-hidden="true"
        className={`badge-streak-icon badge-streak-${streakNumber}`}
        viewBox="0 0 24 24"
      >
        <path d={flamePath} />
        <path className="badge-streak-inner" d={innerFlamePath} />
      </svg>
    );
  }
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

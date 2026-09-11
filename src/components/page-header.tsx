/**
 * Shared page header for portal pages.
 *
 * Renders a consistent title row: heading + optional subtitle on the left,
 * an optional action slot (button / dialog trigger) on the right.
 *
 * Design tokens: heading is 17px/700, subtitle is 13px muted.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // action slot (right side)
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[17px] font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-[var(--mut)]">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

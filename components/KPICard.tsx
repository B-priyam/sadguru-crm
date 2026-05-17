import React from "react";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtitle,
  icon,
  onClick,
}) => (
  <div
    className="rounded-xl bg-card p-3 sm:p-4 card-shadow transition-all duration-200 ease-snap hover:card-shadow-hover"
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium truncate">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-foreground mt-0.5 sm:mt-1 tabular-nums truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

export default KPICard;

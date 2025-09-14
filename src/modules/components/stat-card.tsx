import * as React from 'react';
import { Link } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '../../components/card';
import { Skeleton } from '../../components/skeleton';
import { cn } from '../../lib/utils';

type StatCardProps = {
  title: string;
  value?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
  to?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  isLoading,
  isError,
  to,
  className,
}: StatCardProps) {
  const CardInner = (
    <Card
      className={cn(
        'rounded-2xl shadow-sm transition-colors',
        to && 'hover:bg-accent/40 cursor-pointer',
        className
      )}
    >
      <CardHeader className="px-6 pb-0">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        {icon && <CardAction className="col-auto row-auto">{icon}</CardAction>}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-40 mt-2" />
          </>
        ) : isError ? (
          <>
            <div className="text-2xl font-semibold">—</div>
            {subtitle && (
              <CardDescription className="mt-2">{subtitle}</CardDescription>
            )}
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold leading-none tracking-tight tabular-nums">
              {value?.toLocaleString() ?? 0}
            </div>
            {subtitle && (
              <CardDescription className="mt-2">{subtitle}</CardDescription>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return to ? (
    <Link
      to={to}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      {CardInner}
    </Link>
  ) : (
    CardInner
  );
}

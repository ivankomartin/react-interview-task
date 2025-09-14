import * as React from 'react';
import { Link } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/card';
import { Separator } from '../../components/separator';
import { Button } from '../../components/button';

type Action = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>['variant'];
};

type QuickActionsProps = {
  title?: string;
  actions: Action[];
  className?: string;
};

export function QuickActions({
  title = 'Quick actions',
  actions,
  className,
}: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader className="px-6">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>

      <Separator className="my-1" />

      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <Button key={a.label} variant={a.variant ?? 'outline'} asChild>
              <Link to={a.to} className="inline-flex items-center gap-2">
                {a.icon}
                <span>{a.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

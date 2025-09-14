interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <header>
      <div className="flex flex-row items-center gap-1 mb-2 ">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">{title}</h2>
        {icon}
      </div>

      <p className="text-muted-foreground text-lg mb-8">{description}</p>
    </header>
  );
}

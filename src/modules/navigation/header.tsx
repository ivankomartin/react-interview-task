import { Logo } from './logo';
import { TopMenu } from './top-menu';
import { ThemeToggle } from '../theme/theme-toggle';

export function Header() {
  return (
    <div className="flex flex-row items-center w-full h-16 border-b shadow-sm bg-background border-border">
      <div className="flex flex-row items-center gap-2 max-w-[1400px] mx-auto w-full px-2 lg:px-4">
        <Logo />
        <div className="flex-1">
          <TopMenu />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

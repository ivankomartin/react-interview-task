import { Logo } from "./logo";
import { TopMenu } from "./top-menu";

export function Header() {
  return (
    <div className="flex flex-row items-center w-full h-16 border-b border-gray-100 shadow-sm bg-white">
      <div className="flex flex-row max-w-[1400px] mx-auto w-full px-2 lg:px-4">
        <Logo />
        <TopMenu />
      </div>
    </div>
  );
}

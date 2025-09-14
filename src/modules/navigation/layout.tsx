import { Outlet } from "react-router";

import { Header } from "./header";

export function Layout() {
  return (
    <div className="w-full h-screen bg-gray-50">
      <Header />

      <div className="max-w-[1400px] mx-auto mt-8 px-2 lg:px-4">
        <Outlet />
      </div>
    </div>
  );
}

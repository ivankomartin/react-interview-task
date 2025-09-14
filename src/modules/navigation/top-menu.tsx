import { Link, useLocation } from "react-router";
import { House, Milk } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../components/navigation-menu";

export function TopMenu() {
  const location = useLocation();

  return (
    <NavigationMenu className="w-full">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger data-state={location.pathname === "/" ? "open" : "closed"}>
            <NavigationMenuLink asChild data-active={location.pathname === "/"}>
              <Link to="/" className="flex flex-row items-center">
                <House className="mr-1" /> Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuTrigger>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger data-state={location.pathname === "/products" ? "open" : "closed"}>
            <NavigationMenuLink asChild data-active={location.pathname === "/products"}>
              <Link to="/products" className="flex flex-row items-center">
                <Milk className="mr-1" /> Products
              </Link>
            </NavigationMenuLink>
          </NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

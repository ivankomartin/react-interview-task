import { Package } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-row items-center justify-center h-14 mr-8 text-2xl font-bold text-gray-900">
      <Package className="mr-2 text-blue-500 size-7" />
      DepositManager
    </div>
  );
}

import { Package } from 'lucide-react';
import { Link } from 'react-router';

export function Logo() {
  return (
    <Link
      to="/"
      className="flex flex-row items-center justify-center h-14 mr-8 text-2xl font-bold
                 text-gray-900 dark:text-white transition-colors duration-200"
      aria-label="DepositManager – Home"
    >
      <Package className="mr-2 size-7 text-blue-600 dark:text-white" />
      <span>DepositManager</span>
    </Link>
  );
}

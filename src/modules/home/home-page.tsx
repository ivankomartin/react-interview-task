import { Package } from "lucide-react";

import { PageHeader } from "../../components/page-header";

export function HomePage() {
  return (
    <div>
      <PageHeader
        title="Deposit management dashboard"
        description="Welcome to your deposit management system. Monitor and manage your products, companies, and users."
        icon={<Package size={28} />}
      />
    </div>
  );
}

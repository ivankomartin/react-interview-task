import { Milk } from "lucide-react";

import { PageHeader } from "../../components/page-header";

export function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Registered products"
        description="View and manage your registered products."
        icon={<Milk size={28} />}
      />
    </div>
  );
}

import { Package, Milk, Building2, Users, Clock, Plus } from 'lucide-react';
import { PageHeader } from '../../components/page-header';
import { StatCard } from '../components/stat-card';
import {
  useActiveProductsCount,
  usePendingProductsCount,
  useCompaniesCount,
  useUsersCount,
} from './queries';
import { QuickActions } from '../components/quick-actions';
import { RecentProductsCard } from '../components/recent-products-card';

export function HomePage() {
  const active = useActiveProductsCount();
  const pending = usePendingProductsCount();
  const companies = useCompaniesCount();
  const users = useUsersCount();

  const stats = [
    {
      title: 'Active products',
      value: active.data,
      isLoading: active.isLoading,
      isError: active.isError,
      subtitle: 'Active products in system',
      icon: <Milk className="h-5 w-5" />,
      to: '/products?status=active',
    },
    {
      title: 'Pending products',
      value: pending.data,
      isLoading: pending.isLoading,
      isError: pending.isError,
      subtitle: 'Waiting for approval',
      icon: <Clock className="h-5 w-5" />,
      to: '/products?status=inactive',
    },
    {
      title: 'Companies',
      value: companies.data,
      isLoading: companies.isLoading,
      isError: companies.isError,
      subtitle: 'Registered companies',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: 'Users',
      value: users.data,
      isLoading: users.isLoading,
      isError: users.isError,
      subtitle: 'Active system users',
      icon: <Users className="h-5 w-5" />,
    },
  ] as const;

  return (
    <div className="pb-8">
      <PageHeader
        title="Deposit management dashboard"
        description="Welcome to your deposit management system. Monitor and manage your products, companies, and users."
        icon={<Package size={28} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            subtitle={s.subtitle}
            icon={s.icon}
            isLoading={s.isLoading}
            isError={s.isError}
            to={s.to}
          />
        ))}
      </div>
      <div className="mt-6">
        <QuickActions
          actions={[
            {
              label: 'View all products',
              to: '/products',
              icon: <Plus className="h-4 w-4" />,
              variant: 'outline',
            },
            {
              label: 'Add new product',
              to: '/products/new',
              icon: <Plus className="h-4 w-4" />,
              variant: 'default',
            },
          ]}
        />
      </div>
      <div className="mt-6">
        <RecentProductsCard />
      </div>
    </div>
  );
}

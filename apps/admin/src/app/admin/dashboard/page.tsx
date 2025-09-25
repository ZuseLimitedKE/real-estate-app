import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PropertyModel } from '@/lib/db/models/Property';
import { UserModel } from '@/lib/db/models/User';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import QuickActions from '@/components/dashboard/QuickActions';

/**
 * Renders the admin dashboard page and redirects unauthenticated users to /login.
 *
 * Fetches agency statistics, property statistics, and the five most recent properties,
 * then renders DashboardStats (with agencyStats and propertyStats), QuickActions,
 * and RecentActivities (with the fetched recent properties).
 *
 * @returns The JSX element for the dashboard page.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch real data from database
  const [agencyStats, propertyStats, recentProperties] = await Promise.all([
    UserModel.getAgencyStats(),
    PropertyModel.getPropertyStats(),
    PropertyModel.getRecentProperties(5)
  ]);

  return (
    <div className="space-y-6">

      <DashboardStats 
        agencyStats={agencyStats} 
        propertyStats={propertyStats} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        <div className="lg:col-span-2">
          <RecentActivities properties={recentProperties} />
        </div>
      </div>
    </div>
  );
}
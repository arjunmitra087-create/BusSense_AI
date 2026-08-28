import { useState } from 'react';
import type { PageKey } from '@/types';
import { Sidebar, TopBar } from '@/components/Layout';
import { OverviewPage } from '@/pages/OverviewPage';
import { LivePage } from '@/pages/LivePage';
import { DefectsPage } from '@/pages/DefectsPage';
import { MapPage } from '@/pages/MapPage';
import { BusesPage } from '@/pages/BusesPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { RepairsPage } from '@/pages/RepairsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  const [page, setPage] = useState<PageKey>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const render = () => {
    switch (page) {
      case 'overview': return <OverviewPage setPage={setPage} />;
      case 'live': return <LivePage />;
      case 'defects': return <DefectsPage searchQuery={search} />;
      case 'map': return <MapPage />;
      case 'buses': return <BusesPage />;
      case 'incidents': return <IncidentsPage />;
      case 'repairs': return <RepairsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'reports': return <ReportsPage />;
      case 'alerts': return <AlertsPage />;
      case 'settings': return <SettingsPage />;
      default: return <OverviewPage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="lg:pl-64">
        <TopBar setMobileOpen={setMobileOpen} onSearch={setSearch} />
        <main className="mx-auto max-w-[1600px] p-4 lg:p-6">{render()}</main>
      </div>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AgenciesFiltersProps {
  currentStatus: string;
  searchQuery: string;
}

export default function AgenciesFilters({ currentStatus, searchQuery }: AgenciesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  const updateFilters = (updates: { status?: string; search?: string; page?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/agencies?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search, page: '1' });
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/admin/agencies');
  };

  const statusFilters = [
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'approved', label: 'Approved', count: 0 },
    { value: 'rejected', label: 'Rejected', count: 0 },
    { value: 'all', label: 'All Agencies', count: 0 },
  ];

  return (
    <div className="flex items-center space-x-4">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Search agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-secondary-400" />
        <select
          value={currentStatus}
          onChange={(e) => updateFilters({ status: e.target.value, page: '1' })}
          className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="flex items-center space-x-2"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Reset</span>
      </Button>
    </div>
  );
}
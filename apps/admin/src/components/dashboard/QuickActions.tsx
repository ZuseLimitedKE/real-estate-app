import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Download,
  Plus
} from 'lucide-react';

/**
 * Render a "Quick Actions" card with links for common admin tasks.
 *
 * @returns A JSX element containing a card with three action rows: reviewing agencies, reviewing properties, and generating a platform report.
 */
export default function QuickActions() {
  const actions = [
    {
      title: 'Review Agencies',
      description: 'Approve or reject pending agency applications',
      icon: CheckCircle,
      href: '/admin/agencies?filter=pending',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Review Properties',
      description: 'Approve or reject property listings',
      icon: XCircle,
      href: '/admin/properties?filter=pending',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Generate Report',
      description: 'Download comprehensive platform report',
      icon: Download,
      href: '/admin/reports',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Plus className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href} >
            <div className="flex items-center p-3 rounded-lg border border-secondary-200 hover:border-primary-300 transition-colors cursor-pointer">
              <div className={`flex-shrink-0 p-2 rounded-md ${action.bgColor}`}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">{action.title}</p>
                <p className="text-xs text-secondary-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
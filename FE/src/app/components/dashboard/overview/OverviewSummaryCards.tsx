import { Card, CardContent } from '@/app/components/ui/card';
import { FileText, Languages, Brain, Database } from 'lucide-react';

const widgets = [
  { title: 'Total Documents', value: '12,450', icon: FileText, color: 'blue' },
  { title: 'Total Chunks', value: '48,320', icon: FileText, color: 'green' },
  { title: 'Total QA Pairs', value: '3,842', icon: FileText, color: 'purple' },
  { title: 'Languages Supported', value: '12', icon: Languages, color: 'orange' },
  { title: 'Models Tested', value: '8', icon: Brain, color: 'pink' },
  { title: 'Vector Databases', value: '4', icon: Database, color: 'cyan' },
];

export default function OverviewSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {widgets.map((widget, idx) => {
        const Icon = widget.icon;
        return (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{widget.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{widget.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${widget.color}-100 dark:bg-${widget.color}-900`}>
                  <Icon className={`w-6 h-6 text-${widget.color}-600 dark:text-${widget.color}-300`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

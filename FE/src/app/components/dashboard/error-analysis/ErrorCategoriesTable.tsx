import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { ErrorCategory } from './errorAnalysisData';

interface ErrorCategoriesTableProps {
  categories: ErrorCategory[];
}

export default function ErrorCategoriesTable({ categories }: ErrorCategoriesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((error) => (
              <TableRow key={error.category}>
                <TableCell className="font-medium">{error.category}</TableCell>
                <TableCell className="text-right">{error.count}</TableCell>
                <TableCell className="text-right">{error.percentage.toFixed(1)}%</TableCell>
                <TableCell>
                  <Badge 
                    variant={error.severity === 'High' ? 'destructive' : error.severity === 'Medium' ? 'default' : 'secondary'}
                  >
                    {error.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        error.severity === 'High' ? 'bg-red-600' : 
                        error.severity === 'Medium' ? 'bg-orange-600' : 
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${error.percentage}%` }}
                    ></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

interface EmbeddingDetail {
  model: string;
  dimension: number;
  corpus: string;
  languages: string;
  avgSimilarity: number;
}

interface EmbeddingDetailsTableProps {
  embeddingDetails: EmbeddingDetail[];
}

export default function EmbeddingDetailsTable({ embeddingDetails }: EmbeddingDetailsTableProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Embedding Model Details</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Dimension</TableHead>
              <TableHead>Training Corpus</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead className="text-right">Avg Similarity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {embeddingDetails.map((model) => (
              <TableRow key={model.model}>
                <TableCell className="font-medium">{model.model}</TableCell>
                <TableCell className="text-right font-mono">{model.dimension}</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{model.corpus}</TableCell>
                <TableCell>{model.languages}</TableCell>
                <TableCell className="text-right">{model.avgSimilarity.toFixed(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

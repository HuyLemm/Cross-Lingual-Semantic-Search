import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

type Row = {
  dataset: string;
  tau: number | null;
  model: string;
  language: 'EN' | 'VI';
  datasetSize: number;
  top1: number;
  top3: number;
  top5: number;
  top10: number;
};

type ApiPayload = {
  ok: boolean;
  rows: Row[];
  options: {
    datasets: string[];
    taus: number[];
    languages: Array<'ALL' | 'EN' | 'VI'>;
    models: string[];
  };
};

type Props = {
  title?: string;
  endpoint?: string;
};

function labelClass() {
  return 'text-[11px] text-gray-500 dark:text-slate-400';
}

function formatTau(tau: number | null) {
  if (tau == null) return '—';
  return String(tau);
}

function modelBadge(model: string) {
  const isMiniLM = /minilm/i.test(model);
  const isBGE = /bge/i.test(model);

  if (isMiniLM)
    return (
      <Badge className="bg-blue-600 text-white font-semibold">
        {model}
      </Badge>
    );

  if (isBGE)
    return (
      <Badge className="bg-purple-600 text-white font-semibold">
        {model}
      </Badge>
    );

  return <Badge variant="secondary">{model}</Badge>;
}

export default function MetricsTable({
  title = 'Merged Results Table (DeepSeek/Gemini × τ)',
  endpoint = 'http://localhost:4000/model/model-comparison/raw',
}: Props) {
  const [data, setData] = useState<ApiPayload | null>(null);

  const [dataset, setDataset] = useState<string>('all');
  const [tau, setTau] = useState<string>('all');
  const [lang, setLang] = useState<'ALL' | 'EN' | 'VI'>('ALL');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch(endpoint);
        const json = (await res.json()) as ApiPayload;

        if (!alive) return;

        if (res.ok && json?.ok) setData(json);
        else setData(null);
      } catch {
        if (!alive) return;
        setData(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [endpoint]);

  const datasetOptions = useMemo(() => {
    const list = data?.ok ? data.options.datasets : [];
    return ['all', ...list];
  }, [data]);

  const tauOptions = useMemo(() => {
    const list = data?.ok ? data.options.taus.map(String) : [];
    return ['all', ...list];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data?.ok) return [];

    const rows = data.rows.filter((r) => {
      if (dataset !== 'all' && r.dataset !== dataset) return false;

      if (tau !== 'all') {
        if (r.tau == null) return false;
        if (String(r.tau) !== tau) return false;
      }

      if (lang !== 'ALL' && r.language !== lang) return false;

      return true;
    });

    return rows.sort((a, b) => {
      if (a.dataset !== b.dataset) return a.dataset.localeCompare(b.dataset);

      if (a.tau !== b.tau) return (a.tau ?? 0) - (b.tau ?? 0);

      if (a.language !== b.language) return a.language.localeCompare(b.language);

      if (/minilm/i.test(a.model)) return -1;
      if (/minilm/i.test(b.model)) return 1;

      return 0;
    });
  }, [data, dataset, tau, lang]);

  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">

      <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-3">
        <CardTitle className="text-sm uppercase tracking-wide text-gray-700 dark:text-slate-300">
          {title}
        </CardTitle>

        {/* Filters */}
        <div className="flex items-end gap-3 shrink-0">

          <div className="flex flex-col gap-1">
            <span className={labelClass()}>Dataset</span>
            <Select value={dataset} onValueChange={setDataset}>
              <SelectTrigger className="h-9 w-[180px] rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <SelectValue placeholder="Dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasetOptions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'all' ? 'All datasets' : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass()}>τ (threshold)</span>
            <Select value={tau} onValueChange={setTau}>
              <SelectTrigger className="h-9 w-[120px] rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <SelectValue placeholder="τ" />
              </SelectTrigger>
              <SelectContent>
                {tauOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === 'all' ? 'All τ' : `τ = ${t}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelClass()}>Language</span>
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger className="h-9 w-[120px] rounded-full border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="EN">EN</SelectItem>
                <SelectItem value="VI">VI</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </CardHeader>

      <CardContent>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Dataset</th>
                <th className="text-center py-3 px-4 font-semibold">τ</th>
                <th className="text-left py-3 px-4 font-semibold">Model</th>
                <th className="text-center py-3 px-4 font-semibold">Lang</th>
                <th className="text-center py-3 px-4 font-semibold">Size</th>
                <th className="text-center py-3 px-4 font-semibold">Top-1</th>
                <th className="text-center py-3 px-4 font-semibold">Top-3</th>
                <th className="text-center py-3 px-4 font-semibold">Top-5</th>
                <th className="text-center py-3 px-4 font-semibold">Top-10</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((r, idx) => (
                <tr
                  key={`${r.dataset}-${r.tau}-${r.model}-${r.language}-${idx}`}
                  className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                >

                  <td className="py-3 px-4 font-medium">
                    {r.dataset}
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    {formatTau(r.tau)}
                  </td>

                  <td className="py-3 px-4">
                    {modelBadge(r.model)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant="secondary" className="font-mono">
                      {r.language}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    {r.datasetSize.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-600">
                    {r.top1.toFixed(4)}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-teal-500">
                    {r.top3.toFixed(4)}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-cyan-500">
                    {r.top5.toFixed(4)}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-sky-500">
                    {r.top10.toFixed(4)}
                  </td>

                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-sm text-gray-500 dark:text-slate-400"
                  >
                    No rows (check endpoint / filters)
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </CardContent>
    </Card>
  );
}
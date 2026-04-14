import type { ReactNode } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import type { BackendResult } from "./types";
import { Search, Loader2, Inbox, FileText } from "lucide-react";

// -------- Helpers: parse [TITLE] / [CONTENT] --------
function parseTaggedText(input?: string) {
  const s = (input || "").trim();
  if (!s) return { title: "", content: "" };

  const titleMatch = s.match(/\[TITLE\]\s*([\s\S]*?)(?=\s*\[CONTENT\]|\s*$)/i);
  const contentMatch = s.match(/\[CONTENT\]\s*([\s\S]*)/i);

  const title = (titleMatch?.[1] || "").trim();
  const content = (contentMatch?.[1] || "").trim();

  if (title || content) return { title, content };
  return { title: "", content: s };
}

function cleanTitle(t?: string) {
  return (t || "").replace(/\s+/g, " ").trim();
}

function fileBasename(path?: string) {
  const s = (path || "").trim();
  if (!s) return "";
  const parts = s.split(/[/\\]/);
  return parts[parts.length - 1] || s;
}

function scoreTone(score: number) {
  if (score >= 0.82)
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60";
  if (score >= 0.72)
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900/60";
  if (score >= 0.62)
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/60";
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700";
}

function rankStripe(idx: number) {
  if (idx === 0) return "bg-emerald-500";
  if (idx === 1) return "bg-sky-500";
  if (idx === 2) return "bg-amber-500";
  return "bg-slate-300 dark:bg-slate-700";
}

function stripEdgePunct(s: string) {
  return s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function tokenizeKeepOrder(text: string) {
  return (text || "").split(/\s+/).filter(Boolean);
}

// -------- Keywords badge logic --------
function keywordsForCardAsReceived(
  title: string,
  content: string,
  keywords: string[],
) {
  const received = (keywords || []).filter((k) => (k || "").trim().length > 0);
  if (received.length === 0) return [];

  const allText = `${title} ${content}`;
  const tokens = tokenizeKeepOrder(allText)
    .map((t) => stripEdgePunct(t).toLowerCase())
    .filter(Boolean);

  const tokenSet = new Set(tokens);

  const out: string[] = [];
  const seen = new Set<string>();

  for (const kw of received) {
    const raw = kw;
    const core = stripEdgePunct(raw.trim()).toLowerCase();
    if (!core) continue;

    if (tokenSet.has(core) && !seen.has(raw)) {
      seen.add(raw);
      out.push(raw);
    }
  }

  return out;
}

// -------- Highlight logic --------
function highlightKeywordsWithPhrasePriority(
  text: string,
  keywords: string[],
  wordCls: string,
  phraseCls: string,
): ReactNode {
  const s = (text || "").toString();
  const kws = (keywords || [])
    .map((k) => stripEdgePunct((k || "").trim()).toLowerCase())
    .filter(Boolean);

  if (!s || kws.length === 0) return s;

  const kwSet = new Set(kws);
  const parts = s.split(/(\s+)/);

  const tokenIsKeyword = (part: string) => {
    if (!part || /^\s+$/.test(part)) return false;
    const core = stripEdgePunct(part).toLowerCase();
    return core.length > 0 && kwSet.has(core);
  };

  const out: ReactNode[] = [];

  let buf = "";
  let runLen = 0;
  let inRun = false;

  const flushRun = () => {
    if (!buf) return;
    const cls = runLen >= 2 ? phraseCls : wordCls;
    out.push(
      <span key={`hl-${out.length}`} className={cls}>
        {buf}
      </span>,
    );
    buf = "";
    runLen = 0;
    inRun = false;
  };

  for (const p of parts) {
    if (tokenIsKeyword(p)) {
      inRun = true;
      runLen += 1;
      buf += p;
      continue;
    }

    if (inRun) {
      if (/^\s+$/.test(p)) {
        buf += p;
        continue;
      }
      flushRun();
      out.push(<span key={`t-${out.length}`}>{p}</span>);
      continue;
    }

    out.push(<span key={`t-${out.length}`}>{p}</span>);
  }

  if (inRun) flushRun();

  return out;
}

export default function MiddleBottom({
  results,
  queryUsed,
  query,
  keywords,
  running,
  hasSearched,
  onOpenPdf,
}: {
  results: BackendResult[];
  queryUsed: string;
  query: string;
  keywords: string[];
  running: boolean;
  hasSearched: boolean;
  onOpenPdf: (r: BackendResult) => void;
}) {
  const isInitial = !hasSearched && !running && results.length === 0;
  const isNoResults = hasSearched && !running && results.length === 0;
  const isLoading = running && results.length === 0;

  // ✅ CHỈ LẤY queryUsed từ backend
  const usedQuery = (queryUsed || "").trim();
  const hasKeywords = Array.isArray(keywords) && keywords.length > 0;

  // ✅ Chỉ show meta box sau khi search xong
  const showMeta = hasSearched && !running && (!!usedQuery || hasKeywords);

  const PHRASE_HL = "rounded px-1 py-0.5 bg-amber-200/80 dark:bg-amber-500/30";
  const WORD_HL = "rounded px-1 py-0.5 bg-sky-200/80 dark:bg-sky-500/25";

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Retrieved Results{" "}
            <span className="text-slate-400">({results.length})</span>
          </h3>

          {showMeta && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-4 space-y-3 shadow-sm">
              {usedQuery && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Query Used
                  </span>

                  <span className="font-mono text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm">
                    {usedQuery}
                  </span>
                </div>
              )}

              {hasKeywords && (
                <div className="flex flex-wrap items-start gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">
                    Backend Keywords
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                      <span
                        key={`${kw}-${i}`}
                        className="text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 border border-sky-200 dark:border-sky-800 font-medium shadow-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {running && (
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching...
          </div>
        )}
      </div>

      {/* CASE 1: initial */}
      {isInitial && (
        <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40">
          <CardContent className="p-10">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center mb-4 shadow-sm">
                <Inbox className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Ready to run
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                Enter a query on the left and click{" "}
                <span className="font-semibold">Run Experiment</span>. Retrieved
                chunks will show here with rank and score.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CASE 2: loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card
              key={i}
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900/40"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-6 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mb-2" />
                <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse mb-2" />
                <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CASE 3: no results */}
      {isNoResults && (
        <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40">
          <CardContent className="p-10">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center mb-4 shadow-sm">
                <Search className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                No matches found
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                We ran the search, but nothing matched. Try rephrasing the query
                or increasing Top-K.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RESULTS */}
      {!isInitial && !isLoading && !isNoResults && (
        <div className="space-y-4">
          {results.map((result, idx) => {
            const tagged = parseTaggedText(
              result.raw_text || result.text || "",
            );
            const title = cleanTitle(result.title || tagged.title);
            const content = tagged.content || result.text || "";
            const score = Number(result.score ?? 0);
            const fileName = fileBasename(result.file);

            // (1) badges: keep keyword string as received, only if it appears in THIS card
            const cardKeywords = hasKeywords
              ? keywordsForCardAsReceived(title, content, keywords)
              : [];

            // (2) highlight: blue for single keyword, yellow for consecutive keyword phrases
            const renderTitle = highlightKeywordsWithPhrasePriority(
              title,
              keywords,
              WORD_HL,
              PHRASE_HL,
            );

            const renderContent = highlightKeywordsWithPhrasePriority(
              content,
              keywords,
              WORD_HL,
              PHRASE_HL,
            );

            return (
              <div
                key={`${result.file || ""}|${result.title || ""}|${result.score}|${idx}`}
              >
                <Card
                  className={[
                    "relative overflow-hidden border border-slate-200 dark:border-slate-700",
                    "bg-white dark:bg-slate-900/40",
                    "shadow-sm hover:shadow-md transition-shadow",
                    "hover:border-slate-300 dark:hover:border-slate-600",
                  ].join(" ")}
                >
                  <div
                    className={`absolute left-0 top-0 h-full w-1.5 ${rankStripe(
                      idx,
                    )}`}
                  />

                  <CardContent className="p-5 pl-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Rank {idx + 1}
                        </span>

                        <span
                          className={[
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            scoreTone(score),
                          ].join(" ")}
                          title="Similarity score"
                        >
                          {Number.isFinite(score) ? score.toFixed(3) : "0.000"}
                        </span>

                        {fileName && (
                          <button
                            type="button"
                            onClick={() => onOpenPdf(result)}
                            className="group"
                            title={result.file || fileName}
                          >
                            <Badge
                              className="
                                flex items-center gap-2
                                bg-blue-50 text-blue-700
                                dark:bg-blue-900/30 dark:text-blue-300
                                hover:bg-blue-100 dark:hover:bg-blue-900/50
                                cursor-pointer
                                transition
                                px-3 py-2
                                text-xs
                                font-medium
                                max-w-[420px]
                              "
                            >
                              <FileText className="!w-4 !h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                              <span className="truncate group-hover:underline">
                                {fileName}
                              </span>
                            </Badge>
                          </button>
                        )}
                      </div>
                    </div>

                    {title && (
                      <div className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100 break-words">
                        {renderTitle}
                      </div>
                    )}

                    <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                      {renderContent}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-[12px] text-slate-500 dark:text-slate-400 font-mono">
                        Keywords:
                      </span>

                      {cardKeywords.length > 0 ? (
                        cardKeywords.map((k, i) => (
                          <Badge
                            key={`${k}-${i}`}
                            variant="outline"
                            className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-900/30"
                          >
                            {k}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          (none)
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

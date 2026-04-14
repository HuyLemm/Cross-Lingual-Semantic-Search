import React from "react";
import type {
  EmbedModel,
  VectorIndex,
  RetrievalEngine,
  RerankerMethod,
  RankingMethod,
  LanguageCode,
} from "./types";

// ---------- Labels ----------
export const labelEmbedModel = (v: EmbedModel) => (v === "minilm" ? "MiniLM" : "BGE-M3");

export const labelVectorIndex = (v: VectorIndex) =>
  v === "flatip_cpu" ? "FAISS IndexFlatIP (CPU)" : "FAISS IndexFlatIP (72 threads)";

export const labelRetrieval = (v: RetrievalEngine) =>
  v === "faiss_cpu" ? "FAISS CPU" : "FAISS CPU (72 threads)";

export const labelReranker = (v: RerankerMethod) =>
  v === "hybrid" ? "Hybrid Scoring (cosine + keyword + fact)" : "BGE Reranker v2 m3";

export const labelRanking = (v: RankingMethod) =>
  v === "heuristic" ? "Heuristic Score" : "Cross-Encoder Score";

export const labelLanguage = (v: LanguageCode) => v.toUpperCase();

// ---------- Highlight ----------
export function highlightMatches(text: string, query: string): React.ReactNode {
  const stopWords = new Set([
    "how","does","the","is","in","a","an","and","or","but",
    "what","when","where","why","who","which","that","this","these","those",
  ]);

  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const phrases: { text: string; length: number }[] = [];

  for (let i = 0; i <= queryTokens.length - 4; i++) {
    const phrase = queryTokens.slice(i, i + 4);
    if (phrase.some((w) => !stopWords.has(w) && w.length > 3)) {
      phrases.push({ text: phrase.join(" "), length: 4 });
    }
  }
  for (let i = 0; i <= queryTokens.length - 3; i++) {
    const phrase = queryTokens.slice(i, i + 3);
    if (phrase.some((w) => !stopWords.has(w) && w.length > 3)) {
      phrases.push({ text: phrase.join(" "), length: 3 });
    }
  }
  for (let i = 0; i <= queryTokens.length - 2; i++) {
    const phrase = queryTokens.slice(i, i + 2);
    if (phrase.some((w) => !stopWords.has(w) && w.length > 3)) {
      phrases.push({ text: phrase.join(" "), length: 2 });
    }
  }

  const keywords = queryTokens
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .map((word) => ({ text: word, length: 1 }));

  phrases.push(...keywords);

  if (phrases.length === 0) return text;

  const highlights: { start: number; end: number; text: string; type: "phrase" | "keyword" }[] = [];
  const lowerText = text.toLowerCase();

  phrases
    .sort((a, b) => b.length - a.length)
    .forEach((phrase) => {
      const searchText = phrase.text;
      let startPos = 0;

      while (true) {
        const index = lowerText.indexOf(searchText, startPos);
        if (index === -1) break;

        const end = index + searchText.length;

        const overlaps = highlights.some(
          (h) =>
            (index >= h.start && index < h.end) ||
            (end > h.start && end <= h.end) ||
            (index <= h.start && end >= h.end),
        );

        if (!overlaps) {
          const beforeOk = index === 0 || /\s/.test(text[index - 1]);
          const afterOk = end === text.length || /\s/.test(text[end]);

          if (beforeOk && afterOk) {
            highlights.push({
              start: index,
              end,
              text: text.substring(index, end),
              type: phrase.length > 1 ? "phrase" : "keyword",
            });
          }
        }

        startPos = index + 1;
      }
    });

  highlights.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  highlights.forEach((h, idx) => {
    if (h.start > lastIndex) parts.push(text.substring(lastIndex, h.start));

    parts.push(
      <mark
        key={`${h.type}-${idx}`}
        className={
          h.type === "phrase"
            ? "bg-amber-100 dark:bg-amber-900/40 text-gray-900 dark:text-amber-100 px-1 rounded font-semibold border-b-2 border-amber-400 dark:border-amber-600"
            : "bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-1 rounded font-medium"
        }
      >
        {h.text}
      </mark>,
    );

    lastIndex = h.end;
  });

  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
  return parts.length > 0 ? <>{parts}</> : text;
}
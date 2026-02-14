import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../ui/sheet";

import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import type { QAPair } from "./datasetGroundTruthData";

/* =========================
   MULTI KEYWORD HIGHLIGHT
========================= */
function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, keyword: string) {
  if (!keyword) return text;

  const words = keyword
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp);

  if (words.length === 0) return text;

  const regex = new RegExp(`(${words.join("|")})`, "gi");

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(regex, (match, _p1, offset) => {
    if (offset > lastIndex) {
      result.push(text.slice(lastIndex, offset));
    }

    result.push(
      <mark
        key={offset}
        className="bg-yellow-200 dark:bg-yellow-600 px-[2px] rounded"
      >
        {match}
      </mark>,
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

interface SourceViewSheetProps {
  qa: QAPair | null;
  isOpen: boolean;
  onClose: () => void;
  threshold: number;
  searchQuery: string;
}

export default function SourceViewSheet({
  qa,
  isOpen,
  onClose,
  threshold,
  searchQuery,
}: SourceViewSheetProps) {
  if (!qa) return null;

  const bi = Number(qa.sim_qc ?? 0);
  const ce = Number(qa.ce_multi_prob ?? 0);

  const biPass = bi >= threshold;
  const cePass = ce >= threshold;
  const verified = biPass && cePass;

  /* ================= Highlight context:
     - Answer grounding
     - Search query
  ================= */
  const renderContext = () => {
    let ctx: React.ReactNode = qa.context ?? "";

    // highlight answer phrase
    if (qa.answer) {
      const phrase = qa.answer.slice(0, 120);
      const idx = (qa.context ?? "")
        .toLowerCase()
        .indexOf(phrase.toLowerCase());

      if (idx !== -1) {
        const before = qa.context.slice(0, idx);
        const mid = qa.context.slice(idx, idx + phrase.length);
        const after = qa.context.slice(idx + phrase.length);

        ctx = (
          <>
            {before}
            <mark className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
              {mid}
            </mark>
            {after}
          </>
        );
      }
    }

    // apply search highlight over result
    if (searchQuery) {
      const text =
        typeof ctx === "string"
          ? ctx
          : (qa.context ?? "");

      return highlight(text, searchQuery);
    }

    return ctx;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[550px] min-w-[450px] max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle>QA Source Traceability</SheetTitle>
          <SheetDescription>
            Inspect semantic grounding and validation of this QA pair
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-4">

          {/* QA ID */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">QA ID</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {qa.id}
            </Badge>
          </div>

          {/* Question */}
          <div>
            <p className="text-xs font-semibold mb-1">Question</p>
            <div className="p-3 rounded-lg bg-blue-50 border">
              {highlight(qa.question ?? "", searchQuery)}
            </div>
          </div>

          {/* Answer */}
          <div>
            <p className="text-xs font-semibold mb-1">Ground Truth Answer</p>
            <div className="p-3 rounded-lg bg-green-50 border">
              {highlight(qa.answer ?? "", searchQuery)}
            </div>
          </div>

          <Separator />

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">

            <div className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs text-muted-foreground">Bi-Encoder</p>
              <p
                className={`text-lg font-bold ${
                  biPass ? "text-green-600" : "text-red-500"
                }`}
              >
                {bi.toFixed(3)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs text-muted-foreground">Cross-Encoder</p>
              <p
                className={`text-lg font-bold ${
                  cePass ? "text-green-600" : "text-red-500"
                }`}
              >
                {ce.toFixed(3)}
              </p>
            </div>
          </div>

          {/* Status */}
          <div
            className={`p-3 rounded-lg border ${
              verified
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <Badge
              className={
                verified ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }
            >
              {verified ? "Verified" : "Not Verified"}
            </Badge>

            <p className="text-xs mt-2 text-gray-600">
              {verified
                ? "Both Bi-Encoder and Cross-Encoder pass threshold."
                : "One or more validation scores below threshold."}
            </p>
          </div>

          {/* Source */}
          <div className="p-3 rounded-lg bg-gray-50 border">
            <p className="text-xs text-muted-foreground">Source File</p>
            <p className="text-sm font-medium">{highlight(qa.sourceDocument ?? "", searchQuery)}</p>

            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{qa.language}</Badge>
              <Badge variant="secondary">{qa.model}</Badge>
            </div>
          </div>

          {/* Context */}
          <div>
            <p className="text-xs font-semibold mb-2">Source Context</p>

            <div className="p-4 rounded-lg bg-purple-50 border whitespace-pre-wrap leading-relaxed">
              {renderContext()}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Highlight shows grounding + search match
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

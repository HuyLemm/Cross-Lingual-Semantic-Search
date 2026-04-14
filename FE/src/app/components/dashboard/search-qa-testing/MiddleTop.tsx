export default function MiddleTop() {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-slate-700 space-y-4">

      {/* ===== Page Intro ===== */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-black dark:text-slate-500">
          Experiment Overview
        </p>

        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">
          Configure, execute, and evaluate a single semantic search experiment against ground truth.
        </p>
      </div>
    </div>
  );
}
import {
  loadTotalQAs,
  dedupeContent,
  normalizeModel,
  normalizeLang,
} from "../utils/utils.js";

const METRICS_CACHE = new Map();

function cacheKey(q) {
  return `${q.dataset}|${q.model}|${q.experiment}|${q.language}|${q.verification}`;
}

/* map model name cho FE */
function mapModelName(m) {
  if (m === "gpt") return "GPT-5.2";
  if (m === "gemini") return "Gemini 2.5 Flash";
  if (m === "deepseek") return "DeepSeek R1T2";
  return m;
}

export function buildDatasetEvalMetrics(query) {
  const {
    dataset = "all",
    model = "all",
    experiment = "all",
    language = "all",
    verification = "both",
  } = query;

  const key = cacheKey({ dataset, model, experiment, language, verification });
  if (METRICS_CACHE.has(key)) return METRICS_CACHE.get(key);

  /* LOAD JSON FROM exp/* */
  let qas = loadTotalQAs({ dataset, model, experiment });
  qas = dedupeContent(qas);

  /* FILTER language */
  if (language !== "all") {
    const lang = language.toLowerCase();
    qas = qas.filter((q) => normalizeLang(q.language) === lang);
  }

  const originalQAs = qas;

  /* FILTER verification */
  if (verification !== "all") {
    qas = qas.filter((q) => {
      if (verification === "both")
        return q.verified === true && q.verified_step2 === true;
      if (verification === "bi") return q.verified === true;
      if (verification === "cross") return q.verified_step2 === true;
      return true;
    });
  }

  /* GROUP BY (language + model) */
  const groups = new Map();

  for (const q of qas) {
    const lang = normalizeLang(q.language).toUpperCase();
    const mdl = normalizeModel(q.model);
    const gKey = `${lang}|${mdl}`;
    if (!groups.has(gKey)) groups.set(gKey, []);
    groups.get(gKey).push(q);
  }

  const items = [];

  for (const [gKey, arr] of groups.entries()) {
    const [lang, mdl] = gKey.split("|");

    let sumBi = 0,
      sumCE = 0,
      biN = 0,
      ceN = 0;

    for (const q of arr) {
      if (typeof q.sim_qc === "number") {
        sumBi += q.sim_qc;
        biN++;
      }
      if (typeof q.ce_multi_prob === "number") {
        sumCE += q.ce_multi_prob;
        ceN++;
      }
    }

    /* VERIFIED RATIO trên dataset gốc */
    const originalGroup = originalQAs.filter(
      (q) =>
        normalizeLang(q.language).toUpperCase() === lang &&
        normalizeModel(q.model) === mdl,
    );

    const both = originalGroup.filter(
      (q) => q.verified === true && q.verified_step2 === true,
    ).length;

    const verifiedRatio =
      originalGroup.length === 0
        ? 0
        : Number((both / originalGroup.length).toFixed(3));

    items.push({
      language: lang,
      model: mapModelName(mdl),
      verification,
      qaCount: arr.length,
      avgSimilarity: biN ? Number((sumBi / biN).toFixed(3)) : 0,
      avgEntailment: ceN ? Number((sumCE / ceN).toFixed(3)) : 0,
      verifiedRatio,
    });
  }

  const result = { items };
  METRICS_CACHE.set(key, result);
  return result;
}

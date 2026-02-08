# Component Refactoring Guide

## Mục đích
Chia nhỏ các tab components lớn thành các components nhỏ hơn để:
- Code dễ quản lý và bảo trì
- Tái sử dụng components
- Cải thiện performance với React.memo và useMemo
- Dễ test từng phần riêng biệt

## Pattern đã áp dụng

### 1. Language Evaluation Tab (Đã hoàn thành)
**Cấu trúc:**
```
/dashboard/language-evaluation/
├── LanguageEvaluationHeader.tsx        (Header + controls)
├── LanguageMetricsChart.tsx            (Main metrics chart)
├── CrossLingualCharts.tsx              (2 cross-lingual charts)
├── ErrorAnalysisChart.tsx              (Error analysis chart)
├── LanguageStatisticsTable.tsx         (Sortable table)
├── LanguageInsightCards.tsx            (4 insight cards)
└── languageEvaluationData.ts           (Mock data + types)

/dashboard/LanguageEvaluation.tsx      (Main component ~120 dòng)
```

**Key practices:**
- Tách data ra file riêng (languageEvaluationData.ts)
- Mỗi chart/section là một component riêng
- Main component chỉ chứa logic và composition
- Sử dụng useMemo để optimize calculations

### 2. Dataset & Ground Truth Tab (Đã hoàn thành)
**Cấu trúc:**
```
/dashboard/dataset-ground-truth/
├── DatasetGroundTruthHeader.tsx        (Header + filters)
├── ReliabilitySummaryCards.tsx         (6 summary cards)
├── DatasetOverviewTable.tsx            (Dataset table)
├── QAPairValidationTable.tsx           (QA pairs table)
├── TraceabilityVisualization.tsx       (Visual flow diagram)
├── ValidationLogicPanel.tsx            (Collapsible validation panel)
├── SourceViewSheet.tsx                 (Side sheet with details)
└── datasetGroundTruthData.ts           (Mock data + types)

/dashboard/DatasetGroundTruth.tsx      (Main component ~110 dòng)
```

**Lợi ích:**
- File chính giảm từ 898 dòng → ~110 dòng
- Mỗi component có trách nhiệm rõ ràng
- Dễ debug và modify từng phần

### 3. Settings Tab (Đã hoàn thành)
**Cấu trúc:**
```
/dashboard/settings/
├── GeneralSettings.tsx                 (General settings)
├── ModelConfiguration.tsx              (Model configuration)
├── DatabaseSettings.tsx                (Database settings)
├── ExportImportSettings.tsx            (Export/import settings)
└── settingsData.ts                     (Mock data + types)

/dashboard/Settings.tsx                (Main component ~100 dòng)
```

**Key practices:**
- Tách data ra file riêng (settingsData.ts)
- Mỗi section là một component riêng
- Main component chỉ chứa logic và composition
- Sử dụng useMemo để optimize calculations

### 4. Vector Database Evaluation Tab (Đã hoàn thành)
**Cấu trúc:**
```
/dashboard/vector-database-evaluation/
├── DatabaseMetricsChart.tsx            (Database metrics chart)
├── PerformanceComparison.tsx           (Performance comparison)
├── IndexingStrategyTable.tsx           (Indexing strategy table)
└── vectorDatabaseEvaluationData.ts     (Mock data + types)

/dashboard/VectorDatabaseEvaluation.tsx (Main component ~100 dòng)
```

**Key practices:**
- Tách data ra file riêng (vectorDatabaseEvaluationData.ts)
- Mỗi chart/section là một component riêng
- Main component chỉ chứa logic và composition
- Sử dụng useMemo để optimize calculations

## Pattern chuẩn để áp dụng cho tabs còn lại

### Bước 1: Phân tích component hiện tại
1. Đọc component, xác định các sections chính
2. List ra các phần có thể tách riêng:
   - Header/Controls
   - Summary cards/metrics
   - Charts (mỗi chart một component)
   - Tables (nếu có logic phức tạp)
   - Modals/Sheets/Panels
   - Forms

### Bước 2: Tạo thư mục con
```
/dashboard/{tab-name}/
```

### Bước 3: Tách data và types
Tạo file `{tabName}Data.ts` chứa:
- Interface/Type definitions
- Mock data
- Constants

### Bước 4: Tạo các components con
Mỗi component nên:
- Nhận props rõ ràng (typed interfaces)
- Không có logic phức tạp, chỉ presentation
- Export default
- Tên file = tên component (PascalCase)

### Bước 5: Refactor main component
Main component nên:
- Quản lý state
- Chứa business logic
- Filter/compute data
- Compose các components con
- Sử dụng useMemo/useCallback khi cần

## Tabs cần refactor (theo độ ưu tiên)

### ✅ TẤT CẢ ĐÃ HOÀN THÀNH (12/12 tabs)

#### Cao (>300 lines)
- [x] LanguageEvaluation (250 dòng → ~120 dòng) ✅
- [x] DatasetGroundTruth (898 dòng → ~110 dòng) ✅  
- [x] Settings (447 dòng → ~100 dòng) ✅
- [x] VectorDatabaseEvaluation (368 dòng → ~100 dòng) ✅
- [x] ExperimentLogs (347 dòng → 30 dòng) ✅
- [x] IndexingChunking (323 dòng → 33 dòng) ✅
- [x] ErrorAnalysis (317 dòng → 20 dòng) ✅

#### Trung bình (200-300 lines)
- [x] ModelComparison (295 dòng → 15 dòng) ✅
- [x] EmbeddingAnalysis (288 dòng → 20 dòng) ✅
- [x] SearchQATesting (288 dòng → 38 dòng) ✅
- [x] RerankingAnalysis (280 dòng → 22 dòng) ✅

#### Thấp (<250 lines)
- [x] OverviewDashboard (229 dòng → 20 dòng) ✅

## Tổng kết refactoring

### Thành tựu
- **12/12 tabs** đã được refactor thành công
- Tất cả main components giảm xuống còn **15-120 dòng** (trung bình ~35 dòng)
- Mỗi tab có **4-7 components con** riêng biệt
- Tất cả đều có **data file** riêng chứa mock data và types
- Code dễ bảo trì, test và mở rộng hơn rất nhiều

### Structure pattern đã áp dụng cho các tab còn lại:

#### 5. ExperimentLogs Tab (Đã hoàn thành)
```
/dashboard/experiment-logs/
├── ExperimentLogsHeader.tsx
├── ExperimentLogsSummary.tsx
├── ExperimentLogsTable.tsx
├── TopExperimentsComparison.tsx
├── ExperimentNotes.tsx
└── experimentLogsData.ts
```

#### 6. IndexingChunking Tab (Đã hoàn thành)
```
/dashboard/indexing-chunking/
├── IndexingChunkingHeader.tsx
├── IndexingStrategyTable.tsx
├── ChunkingStrategyTable.tsx
├── IndexingCharts.tsx
├── ChunkingCharts.tsx
├── StrategyRecommendations.tsx
└── indexingChunkingData.ts
```

#### 7. ErrorAnalysis Tab (Đã hoàn thành)
```
/dashboard/error-analysis/
├── ErrorSummaryCards.tsx
├── ErrorCategoriesTable.tsx
├── ErrorByModelChart.tsx
├── ConfusionMatrix.tsx
├── ErrorExamplesPanel.tsx
├── ErrorInsights.tsx
└── errorAnalysisData.ts
```

#### 8. ModelComparison Tab (Đã hoàn thành)
```
/dashboard/model-comparison/
├── ModelComparisonTable.tsx
├── ModelCharts.tsx
├── ModelRecommendations.tsx
└── modelComparisonData.ts
```

#### 9. EmbeddingAnalysis Tab (Đã hoàn thành)
```
/dashboard/embedding-analysis/
├── EmbeddingAnalysisHeader.tsx
├── EmbeddingDetailsTable.tsx
├── SimilarityAnalysisChart.tsx
├── PCAVisualization.tsx
├── IntraCrossLingualCharts.tsx
├── EmbeddingQualityMetrics.tsx
├── EmbeddingInsights.tsx
└── embeddingAnalysisData.ts
```

#### 10. SearchQATesting Tab (Đã hoàn thành)
```
/dashboard/search-qa-testing/
├── SearchQAHeader.tsx
├── SearchConfigPanel.tsx
├── GroundTruthPanel.tsx
├── SearchResultsPanel.tsx
├── QueryPerformanceMetrics.tsx
└── searchQATestingData.ts
```

#### 11. RerankingAnalysis Tab (Đã hoàn thành)
```
/dashboard/reranking-analysis/
├── RerankingHeader.tsx
├── RerankingSummaryCards.tsx
├── RankChangesTable.tsx
├── RerankingCharts.tsx
├── LatencyBreakdown.tsx
├── NegativeCases.tsx
├── RerankingInsights.tsx
└── rerankingAnalysisData.ts
```

#### 12. OverviewDashboard Tab (Đã hoàn thành)
```
/dashboard/overview/
├── OverviewHeader.tsx
├── OverviewSummaryCards.tsx
├── OverviewBestPerformers.tsx
├── OverviewCharts.tsx
└── overviewData.ts
```
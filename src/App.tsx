import React, { useState } from 'react';
import {
  BarChart3,
  Sliders,
  Database,
  Flame,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  DatasetStats,
  FileMetadata,
  QueryState,
  SelectedColumn,
  SQLDialect,
  SparkConfig,
} from './types';
import {
  parseCsvContent,
  parseExcelBuffer,
  parseJsonContent,
  parseUploadedFile,
} from './utils/fileParser';
import { computeDatasetStats } from './utils/statistics';
import { SAMPLE_DATASETS, SampleDataset } from './utils/sampleData';
import { Navbar } from './components/Navbar';
import { FileUploader } from './components/FileUploader';
import { StatsDashboard } from './components/StatsDashboard';
import { QueryBuilder } from './components/QueryBuilder';
import { SQLViewer } from './components/SQLViewer';
import { PySparkViewer } from './components/PySparkViewer';

type ActiveTab = 'stats' | 'query' | 'sql' | 'pyspark';

export function App() {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stats');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawWorkbookBuffer, setRawWorkbookBuffer] = useState<ArrayBuffer | null>(null);

  // Query state
  const [queryState, setQueryState] = useState<QueryState>({
    selectedColumns: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    limit: 50,
    tableName: 'dataset',
    dialect: 'ansi',
    sparkConfig: {
      appName: 'DataTransformationJob',
      inputPath: './data/dataset.csv',
      mode: 'dataframe',
      outputAction: 'show',
      outputPath: './output/transformed_data.parquet',
    },
  });

  const initializeDataset = (
    newHeaders: string[],
    newRows: Record<string, any>[],
    newMeta: FileMetadata
  ) => {
    const computedStats = computeDatasetStats(newHeaders, newRows);
    setHeaders(newHeaders);
    setRows(newRows);
    setStats(computedStats);
    setMetadata(newMeta);

    // Default table name
    const sanitizedTableName = newMeta.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    // Default select first 6 columns
    const initialSelected: SelectedColumn[] = newHeaders.slice(0, 8).map((col, idx) => ({
      id: `col-init-${idx}`,
      column: col,
      alias: '',
      aggregation: 'NONE',
    }));

    setQueryState({
      selectedColumns: initialSelected,
      filters: [],
      groupBy: [],
      orderBy: [],
      limit: 50,
      tableName: sanitizedTableName || 'dataset',
      dialect: 'ansi',
      sparkConfig: {
        appName: `${sanitizedTableName || 'Data'}Pipeline`,
        inputPath: `./data/${newMeta.name}`,
        mode: 'dataframe',
        outputAction: 'show',
        outputPath: `./output/${sanitizedTableName || 'data'}_processed.parquet`,
      },
    });

    setActiveTab('stats');
  };

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        setRawWorkbookBuffer(buffer);
        const result = parseExcelBuffer(buffer, file.name);
        initializeDataset(result.headers, result.rows, result.metadata);
      } else {
        setRawWorkbookBuffer(null);
        const result = await parseUploadedFile(file);
        initializeDataset(result.headers, result.rows, result.metadata);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while parsing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelected = (sample: SampleDataset) => {
    setIsLoading(true);
    setError(null);
    setRawWorkbookBuffer(null);

    try {
      if (sample.type === 'csv') {
        parseCsvContent(sample.rawContent, sample.filename).then((res) => {
          initializeDataset(res.headers, res.rows, res.metadata);
        });
      } else {
        const res = parseJsonContent(sample.rawContent, sample.filename);
        initializeDataset(res.headers, res.rows, res.metadata);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading sample dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (!rawWorkbookBuffer || !metadata) return;
    try {
      const result = parseExcelBuffer(rawWorkbookBuffer, metadata.name, sheetName);
      initializeDataset(result.headers, result.rows, result.metadata);
    } catch (err: any) {
      setError(`Failed to switch to sheet "${sheetName}": ${err.message}`);
    }
  };

  const handleReset = () => {
    setMetadata(null);
    setStats(null);
    setHeaders([]);
    setRows([]);
    setError(null);
    setRawWorkbookBuffer(null);
  };

  // Toggle single column in query
  const handleToggleColumn = (colName: string) => {
    const exists = queryState.selectedColumns.some((sc) => sc.column === colName);
    if (exists) {
      setQueryState({
        ...queryState,
        selectedColumns: queryState.selectedColumns.filter((sc) => sc.column !== colName),
      });
    } else {
      const newCol: SelectedColumn = {
        id: `col-${Date.now()}`,
        column: colName,
        alias: '',
        aggregation: 'NONE',
      };
      setQueryState({
        ...queryState,
        selectedColumns: [...queryState.selectedColumns, newCol],
      });
    }
  };

  const handleSelectAllColumns = (selectAll: boolean) => {
    if (selectAll) {
      const allSelected: SelectedColumn[] = headers.map((col, idx) => ({
        id: `col-all-${idx}`,
        column: col,
        alias: '',
        aggregation: 'NONE',
      }));
      setQueryState({ ...queryState, selectedColumns: allSelected });
    } else {
      setQueryState({ ...queryState, selectedColumns: [] });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        metadata={metadata}
        stats={stats}
        onReset={handleReset}
        onLoadSample={(sampleId) => {
          const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId);
          if (sample) handleSampleSelected(sample);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {!metadata || !stats ? (
          <FileUploader
            onFileSelected={handleFileSelected}
            onSampleSelected={handleSampleSelected}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <div className="space-y-6">
            {/* File Info Bar with Sheet Selector (if Excel) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{metadata.name}</span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                      {metadata.type}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {metadata.rowCount.toLocaleString()} rows • {metadata.columnCount} columns •{' '}
                    {(metadata.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Multi-sheet selector for Excel */}
              {metadata.sheetNames && metadata.sheetNames.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-400">Sheet:</span>
                  <select
                    value={metadata.activeSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                  >
                    {metadata.sheetNames.map((sheet) => (
                      <option key={sheet} value={sheet} className="bg-slate-900">
                        {sheet}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('stats')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'stats'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>1. Data Profiler & Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('query')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'query'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>2. AI Query Builder</span>
                {queryState.selectedColumns.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
                    {queryState.selectedColumns.length} cols
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('sql')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'sql'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>3. Generated SQL</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                  {queryState.dialect}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pyspark')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'pyspark'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>4. Generated PySpark</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                  {queryState.sparkConfig.mode === 'dataframe' ? 'DataFrame API' : 'Spark SQL'}
                </span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'stats' && (
              <StatsDashboard
                stats={stats}
                metadata={metadata}
                rows={rows}
                headers={headers}
                selectedColumns={queryState.selectedColumns}
                onToggleColumn={handleToggleColumn}
                onSelectAllColumns={handleSelectAllColumns}
              />
            )}

            {activeTab === 'query' && (
              <QueryBuilder
                columns={stats.columns}
                queryState={queryState}
                onChange={setQueryState}
              />
            )}

            {activeTab === 'sql' && (
              <SQLViewer
                queryState={queryState}
                columns={stats.columns}
                onDialectChange={(dialect: SQLDialect) =>
                  setQueryState({ ...queryState, dialect })
                }
              />
            )}

            {activeTab === 'pyspark' && (
              <PySparkViewer
                queryState={queryState}
                columns={stats.columns}
                metadata={metadata}
                onChangeSparkConfig={(sparkConfig: SparkConfig) =>
                  setQueryState({ ...queryState, sparkConfig })
                }
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DataInsight Studio • 100% Client-Side Private • Hosted on GitHub Pages</span>
          <span className="flex items-center gap-1 text-slate-400">
            Powered by Offline Smart AI Parser, PapaParse & SheetJS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

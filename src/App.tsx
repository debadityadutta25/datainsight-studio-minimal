import React, { useState } from 'react';
import {
  BarChart3,
  Database,
  Flame,
  FileSpreadsheet,
  Layers,
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
import { SQLViewer } from './components/SQLViewer';
import { PySparkViewer } from './components/PySparkViewer';

type ActiveTab = 'stats' | 'sql' | 'pyspark';

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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <FileSpreadsheet className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2.5">
                    <span>{metadata.name}</span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono border border-zinc-800">
                      {metadata.type}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {metadata.rowCount.toLocaleString()} rows • {metadata.columnCount} columns •{' '}
                    {(metadata.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Multi-sheet selector for Excel */}
              {metadata.sheetNames && metadata.sheetNames.length > 1 && (
                <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-xs sm:text-sm font-mono">
                  <Layers className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="text-zinc-400">Sheet:</span>
                  <select
                    value={metadata.activeSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    {metadata.sheetNames.map((sheet) => (
                      <option key={sheet} value={sheet} className="bg-black">
                        {sheet}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Minimalist Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-2.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('stats')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-mono transition ${
                  activeTab === 'stats'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                }`}
              >
                <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
                <span>1. Profiler & Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('sql')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-mono transition ${
                  activeTab === 'sql'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                }`}
              >
                <Database className="w-4 h-4" strokeWidth={1.5} />
                <span>2. SQL Query</span>
                {queryState.selectedColumns.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs ${
                      activeTab === 'sql'
                        ? 'bg-black/10 text-black font-bold'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {queryState.selectedColumns.length} cols
                  </span>
                )}
                <span
                  className={`text-xs uppercase px-1.5 py-0.5 rounded ${
                    activeTab === 'sql'
                      ? 'bg-black/10 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {queryState.dialect}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pyspark')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-mono transition ${
                  activeTab === 'pyspark'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                }`}
              >
                <Flame className="w-4 h-4" strokeWidth={1.5} />
                <span>3. PySpark Code</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    activeTab === 'pyspark'
                      ? 'bg-black/10 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {queryState.sparkConfig.mode === 'dataframe' ? 'API' : 'SQL'}
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
                onNavigateTab={setActiveTab}
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

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-900 py-3.5 px-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DataInsight Studio • 100% Client-Side Private</span>
          <span>Offline Profiler & Query Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

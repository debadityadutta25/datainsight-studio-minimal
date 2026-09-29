import React from 'react';
import { Database, Sparkles, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
import { FileMetadata, DatasetStats } from '../types';

interface NavbarProps {
  metadata: FileMetadata | null;
  stats: DatasetStats | null;
  onReset: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ metadata, stats, onReset, onLoadSample }) => {
  const exportReport = () => {
    if (!metadata || !stats) return;

    const report = {
      app: 'DataInsight Studio (Offline AI Data Profiler)',
      timestamp: new Date().toISOString(),
      file: metadata,
      overallStats: {
        totalRows: stats.totalRows,
        totalColumns: stats.totalColumns,
        totalCells: stats.totalCells,
        totalNullCells: stats.totalNullCells,
        nullRatePercent: stats.nullRate,
        duplicateRows: stats.duplicateRowsCount,
      },
      columns: stats.columns.map((c) => ({
        name: c.name,
        type: c.type,
        nullCount: c.nullCount,
        nullPercent: c.nullPercentage,
        uniqueCount: c.uniqueCount,
        uniquePercent: c.uniquePercentage,
        min: c.min,
        max: c.max,
        mean: c.mean,
        median: c.median,
        stdDev: c.stdDev,
        topValues: c.topValues,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.name.replace(/\.[^/.]+$/, '')}_profile_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 flex items-center justify-center">
            <Database className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg text-zinc-100 tracking-tight">DataInsight Studio</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-zinc-400" strokeWidth={1.5} /> offline
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block font-normal">
              In-Browser Data Profiler, SQL & PySpark Engine
            </p>
          </div>
        </div>

        {/* Status badges & Action buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>100% private</span>
          </div>

          {metadata ? (
            <>
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium transition border border-zinc-800"
                title="Export statistical profile as JSON"
              >
                <Download className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                <span>Export Report</span>
              </button>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs sm:text-sm font-medium transition border border-zinc-800"
                title="Upload another file"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                <span>Change File</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400 hidden lg:inline font-mono">Samples:</span>
              <button
                onClick={() => onLoadSample('ecommerce')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-zinc-200 text-xs sm:text-sm font-medium transition border border-zinc-800"
              >
                <FileSpreadsheet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                <span>Sales CSV</span>
              </button>
              <button
                onClick={() => onLoadSample('employees')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-zinc-200 text-xs sm:text-sm font-medium transition border border-zinc-800"
              >
                <span>Staff JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

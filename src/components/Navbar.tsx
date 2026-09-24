import React from 'react';
import { Database, ShieldCheck, Sparkles, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">DataInsight Studio</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 mr-1" /> Offline AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              In-Browser Data Profiler, SQL & PySpark Code Generator
            </p>
          </div>
        </div>

        {/* Status badges & Action buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Offline & Private</span>
          </div>

          {metadata ? (
            <>
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
                title="Export statistical profile as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-medium transition border border-slate-700 hover:border-rose-800/60"
                title="Upload another file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change File</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden lg:inline">Try samples:</span>
              <button
                onClick={() => onLoadSample('ecommerce')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-300 text-xs font-medium transition border border-slate-700"
              >
                <FileSpreadsheet className="w-3 h-3 text-indigo-400" />
                <span>Sales CSV</span>
              </button>
              <button
                onClick={() => onLoadSample('employees')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-300 text-xs font-medium transition border border-slate-700"
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

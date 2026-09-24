import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, FileCode2, Layers, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_DATASETS, SampleDataset } from '../utils/sampleData';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sample: SampleDataset) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  onSampleSelected,
  isLoading,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Server Uploads • 100% Client-Side Private</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Profile Data & Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">SQL & PySpark</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Drop any CSV, Excel, or JSON file to compute statistical distributions, missing values, and generate schema-aware queries and transformation code.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Failed to parse file</p>
            <p className="text-rose-300/80 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/20 shadow-xl shadow-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300 mb-4 shadow-inner">
            {isLoading ? (
              <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-200 mb-1">
            {isLoading ? 'Processing and Profiling Dataset...' : 'Choose a file or drag & drop here'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Supports CSV, Excel (.xlsx, .xls) and JSON. Runs entirely in your browser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              .CSV
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              .XLSX / .XLS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              .JSON
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Datasets Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or test with instant pre-loaded sample datasets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="text-left p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition duration-200 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition">
                  {sample.name}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {sample.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Full Statistical Profiling</h4>
            <p className="text-xs text-slate-400 mt-1">
              Computes missingness, unique counts, distributions, mean, median, IQR, and histogram sparklines.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Smart Natural Query AI</h4>
            <p className="text-xs text-slate-400 mt-1">
              Type plain English questions like "top 10 by revenue" to auto-configure queries instantly.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Multi-Dialect SQL & PySpark</h4>
            <p className="text-xs text-slate-400 mt-1">
              Ready-to-run ANSI, Postgres, BigQuery, Snowflake SQL, plus full PySpark DataFrame code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-xs font-mono mb-4">
          <Sparkles className="w-3 h-3 text-zinc-300" strokeWidth={1.5} />
          <span>100% Client-Side • Zero Data Uploaded</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
          Offline Data Profiler & Code Generator
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto font-normal leading-relaxed">
          Drop any CSV, Excel, or JSON file to profile statistical distributions, detect missing values, and generate SQL and PySpark code.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-zinc-950 border border-red-900/60 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-red-200">Unable to parse file</p>
            <p className="text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Minimalist Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border border-dashed rounded-xl p-10 sm:p-14 text-center transition-colors duration-200 ${
          isDragOver
            ? 'border-zinc-500 bg-zinc-950/90'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80'
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
          <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-zinc-300 mb-4 transition-transform group-hover:scale-105">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
            )}
          </div>

          <h3 className="text-sm font-medium text-zinc-200 mb-1">
            {isLoading ? 'Processing dataset...' : 'Choose a file or drag and drop here'}
          </h3>
          <p className="text-xs text-zinc-500 mb-6 font-normal">
            CSV, Excel (.xlsx, .xls) or JSON processed strictly in-browser
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px]">
              <FileSpreadsheet className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
              .CSV
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px]">
              <FileSpreadsheet className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
              .XLSX / .XLS
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px]">
              <FileCode2 className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
              .JSON
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Datasets Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Or try with sample datasets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="text-left p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition duration-150 group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs text-zinc-200 group-hover:text-white transition">
                  {sample.name}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                  {sample.type}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-12 pt-8 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-200">Statistical Profiling</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              Null distributions, cardinality ratios, quartiles, IQR, and distribution histograms.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-200">Natural Query AI</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              Ask in plain English to auto-structure queries based on column schemas.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <FileCode2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-200">SQL & PySpark Output</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              Generate ANSI/Postgres/BigQuery SQL alongside PySpark DataFrame scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

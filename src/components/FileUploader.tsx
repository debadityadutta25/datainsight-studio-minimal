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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-mono mb-4">
          <Sparkles className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
          <span>100% Client-Side • Zero Data Uploaded</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
          Offline Data Profiler & Code Generator
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
          Drop any CSV, Excel, or JSON file to profile statistical distributions, detect missing values, and generate SQL and PySpark code.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-950 border border-red-900/60 flex items-start gap-3.5 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-red-200">Unable to parse file</p>
            <p className="text-red-400/90 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Minimalist Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border border-dashed rounded-2xl p-12 sm:p-16 text-center transition-colors duration-200 ${
          isDragOver
            ? 'border-zinc-500 bg-zinc-950'
            : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-950'
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
          <div className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-200 mb-4 transition-transform group-hover:scale-105 shadow-sm">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7 text-zinc-300" strokeWidth={1.5} />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mb-1">
            {isLoading ? 'Processing dataset...' : 'Choose a file or drag and drop here'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6 font-normal">
            CSV, Excel (.xlsx, .xls) or JSON processed strictly in your browser
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs sm:text-sm font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              .CSV
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              .XLSX / .XLS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
              <FileCode2 className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              .JSON
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Datasets Section */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Or try with sample datasets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="text-left p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition duration-150 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-zinc-200 group-hover:text-white transition">
                  {sample.name}
                </span>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {sample.type}
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-12 pt-8 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 flex-shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">Statistical Profiling</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Null distributions, cardinality ratios, quartiles, IQR, and distribution histograms.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">Natural Query AI</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Ask in plain English to auto-structure queries based on column schemas.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 flex-shrink-0">
            <FileCode2 className="w-4.5 h-4.5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">SQL & PySpark Output</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Generate ANSI/Postgres/BigQuery SQL alongside PySpark DataFrame scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

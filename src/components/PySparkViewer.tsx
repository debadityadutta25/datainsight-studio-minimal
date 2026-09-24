import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Flame, Code2, Settings2, Info } from 'lucide-react';
import { ColumnStats, FileMetadata, QueryState, SparkConfig } from '../types';
import { generatePySparkCode } from '../utils/pysparkGenerator';

interface PySparkViewerProps {
  queryState: QueryState;
  columns: ColumnStats[];
  metadata: FileMetadata;
  onChangeSparkConfig: (config: SparkConfig) => void;
}

export const PySparkViewer: React.FC<PySparkViewerProps> = ({
  queryState,
  columns,
  metadata,
  onChangeSparkConfig,
}) => {
  const [copied, setCopied] = useState(false);

  const pysparkCode = generatePySparkCode(
    queryState,
    columns,
    metadata.type,
    metadata.name
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(pysparkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pysparkCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${queryState.sparkConfig.appName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_pyspark.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle & Configuration Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() =>
                onChangeSparkConfig({ ...queryState.sparkConfig, mode: 'dataframe' })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                queryState.sparkConfig.mode === 'dataframe'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DataFrame API</span>
            </button>
            <button
              onClick={() =>
                onChangeSparkConfig({ ...queryState.sparkConfig, mode: 'spark_sql' })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                queryState.sparkConfig.mode === 'spark_sql'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Spark SQL (`spark.sql`)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy PySpark</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-md shadow-amber-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Config Options Bar */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Spark App Name</label>
            <input
              type="text"
              value={queryState.sparkConfig.appName}
              onChange={(e) =>
                onChangeSparkConfig({ ...queryState.sparkConfig, appName: e.target.value })
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Input File Path</label>
            <input
              type="text"
              value={queryState.sparkConfig.inputPath}
              onChange={(e) =>
                onChangeSparkConfig({ ...queryState.sparkConfig, inputPath: e.target.value })
              }
              placeholder="./data/filename.csv"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Output Action / Sink</label>
            <select
              value={queryState.sparkConfig.outputAction}
              onChange={(e) =>
                onChangeSparkConfig({
                  ...queryState.sparkConfig,
                  outputAction: e.target.value as any,
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="show">df.show() (Display in console)</option>
              <option value="parquet">Write to Parquet (.parquet)</option>
              <option value="csv">Write to CSV (.csv)</option>
              <option value="toPandas">Convert to pandas DataFrame</option>
            </select>
          </div>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>pipeline.py</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
              {queryState.sparkConfig.mode}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {pysparkCode.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto text-slate-200 bg-slate-950/90">
          <pre className="selection:bg-amber-600 selection:text-white">
            <code>{pysparkCode}</code>
          </pre>
        </div>
      </div>

      {/* PySpark Execution Notes */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">How to execute this script:</p>
          <p className="font-mono text-slate-300">
            spark-submit --master local[*] {queryState.sparkConfig.appName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_pyspark.py
          </p>
          <p className="text-[11px]">
            This script can also be copied directly into Databricks Notebooks, AWS EMR, Google Cloud Dataproc, or Jupyter with `pyspark` installed.
          </p>
        </div>
      </div>
    </div>
  );
};

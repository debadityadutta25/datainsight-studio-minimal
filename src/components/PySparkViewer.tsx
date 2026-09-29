import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Flame, Code2, Info } from 'lucide-react';
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
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs sm:text-sm font-mono">
            <button
              onClick={() =>
                onChangeSparkConfig({ ...queryState.sparkConfig, mode: 'dataframe' })
              }
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                queryState.sparkConfig.mode === 'dataframe'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-4 h-4" strokeWidth={1.5} />
              <span>DataFrame API</span>
            </button>
            <button
              onClick={() =>
                onChangeSparkConfig({ ...queryState.sparkConfig, mode: 'spark_sql' })
              }
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                queryState.sparkConfig.mode === 'spark_sql'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-4 h-4" strokeWidth={1.5} />
              <span>Spark SQL</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-800 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-zinc-200" strokeWidth={1.5} />
                  <span className="text-zinc-200">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span>Copy PySpark</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-medium transition"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Config Options Bar */}
        <div className="pt-3 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-mono">
          <div>
            <label className="block text-zinc-400 mb-1.5 text-xs font-mono">Spark App Name</label>
            <input
              type="text"
              value={queryState.sparkConfig.appName}
              onChange={(e) =>
                onChangeSparkConfig({ ...queryState.sparkConfig, appName: e.target.value })
              }
              className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 text-xs font-mono">Input File Path</label>
            <input
              type="text"
              value={queryState.sparkConfig.inputPath}
              onChange={(e) =>
                onChangeSparkConfig({ ...queryState.sparkConfig, inputPath: e.target.value })
              }
              placeholder="./data/filename.csv"
              className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 text-xs font-mono">Output Action</label>
            <select
              value={queryState.sparkConfig.outputAction}
              onChange={(e) =>
                onChangeSparkConfig({
                  ...queryState.sparkConfig,
                  outputAction: e.target.value as any,
                })
              }
              className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-600 cursor-pointer"
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
      <div className="rounded-xl bg-black border border-zinc-800/90 overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between text-xs sm:text-sm font-mono text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <span className="text-zinc-200 font-medium">pipeline.py</span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase border border-zinc-800">
              {queryState.sparkConfig.mode}
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            {pysparkCode.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-zinc-200 bg-black">
          <pre className="selection:bg-zinc-800 selection:text-white">
            <code>{pysparkCode}</code>
          </pre>
        </div>
      </div>

      {/* PySpark Execution Notes */}
      <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs sm:text-sm font-mono text-zinc-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-zinc-200 font-medium mb-1">Execution:</p>
          <p className="font-mono text-zinc-300 text-xs sm:text-sm">
            spark-submit --master local[*] {queryState.sparkConfig.appName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_pyspark.py
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Works with Databricks, AWS EMR, Google Cloud Dataproc, or local Jupyter.
          </p>
        </div>
      </div>
    </div>
  );
};

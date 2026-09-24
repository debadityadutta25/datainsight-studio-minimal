import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Database, Sparkles, Info } from 'lucide-react';
import { ColumnStats, QueryState, SQLDialect } from '../types';
import { generateSQL } from '../utils/sqlGenerator';

interface SQLViewerProps {
  queryState: QueryState;
  columns: ColumnStats[];
  onDialectChange: (dialect: SQLDialect) => void;
}

const DIALECTS: { id: SQLDialect; label: string; iconLabel: string }[] = [
  { id: 'ansi', label: 'Standard ANSI', iconLabel: 'ANSI' },
  { id: 'postgres', label: 'PostgreSQL', iconLabel: 'PG' },
  { id: 'bigquery', label: 'Google BigQuery', iconLabel: 'BQ' },
  { id: 'snowflake', label: 'Snowflake', iconLabel: 'SF' },
  { id: 'mysql', label: 'MySQL', iconLabel: 'SQL' },
  { id: 'sqlite', label: 'SQLite / DuckDB', iconLabel: 'LITE' },
];

export const SQLViewer: React.FC<SQLViewerProps> = ({ queryState, columns, onDialectChange }) => {
  const [copied, setCopied] = useState(false);

  const sqlCode = generateSQL(queryState, columns);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${queryState.tableName || 'query'}_${queryState.dialect}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Dialect Selector & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        {/* Dialect Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-indigo-400" /> Dialect:
          </span>
          {DIALECTS.map((d) => (
            <button
              key={d.id}
              onClick={() => onDialectChange(d.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                queryState.dialect === d.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {d.label}
            </button>
          ))}
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
                <span>Copy SQL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{queryState.tableName || 'dataset'}.sql</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
              {queryState.dialect}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {sqlCode.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto text-slate-200 bg-slate-950/90">
          <pre className="selection:bg-indigo-600 selection:text-white">
            <code>{sqlCode}</code>
          </pre>
        </div>
      </div>

      {/* Dialect Execution Tips */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">Quick Execution Guide:</p>
          <p>
            {queryState.dialect === 'bigquery' &&
              'In BigQuery, replace the table name with your `project_id.dataset.table_name` destination.'}
            {queryState.dialect === 'snowflake' &&
              'In Snowflake, run this inside Snowsight or an active warehouse session.'}
            {queryState.dialect === 'sqlite' &&
              'You can run this query directly in DuckDB CLI against your file: `duckdb -c "SELECT ... FROM read_csv_auto(\'file.csv\')"`'}
            {(queryState.dialect === 'ansi' || queryState.dialect === 'postgres' || queryState.dialect === 'mysql') &&
              'Compatible with all relational database engines and query editors (DBeaver, DataGrip, VS Code SQLTools).'}
          </p>
        </div>
      </div>
    </div>
  );
};

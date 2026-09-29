import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Database, Info } from 'lucide-react';
import { ColumnStats, QueryState, SQLDialect } from '../types';
import { generateSQL } from '../utils/sqlGenerator';

interface SQLViewerProps {
  queryState: QueryState;
  columns: ColumnStats[];
  onDialectChange: (dialect: SQLDialect) => void;
}

const DIALECTS: { id: SQLDialect; label: string }[] = [
  { id: 'ansi', label: 'ANSI SQL' },
  { id: 'postgres', label: 'PostgreSQL' },
  { id: 'bigquery', label: 'BigQuery' },
  { id: 'snowflake', label: 'Snowflake' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'sqlite', label: 'SQLite / DuckDB' },
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90">
        {/* Dialect Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-mono text-zinc-500 mr-1 flex items-center gap-1">
            <Database className="w-3 h-3 text-zinc-400" strokeWidth={1.5} /> Dialect:
          </span>
          {DIALECTS.map((d) => (
            <button
              key={d.id}
              onClick={() => onDialectChange(d.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                queryState.dialect === d.id
                  ? 'bg-white text-black font-medium'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-medium border border-zinc-800 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-zinc-200" strokeWidth={1.5} />
                <span className="text-zinc-200">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                <span>Copy SQL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-black text-xs font-medium transition"
          >
            <Download className="w-3 h-3" strokeWidth={1.5} />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="rounded-xl bg-black border border-zinc-800/90 overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-3.5 py-2 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
            <span className="text-zinc-300">{queryState.tableName || 'dataset'}.sql</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-500 uppercase border border-zinc-800">
              {queryState.dialect}
            </span>
          </div>
          <span className="text-[11px] text-zinc-600">
            {sqlCode.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-200 bg-black">
          <pre className="selection:bg-zinc-800 selection:text-white">
            <code>{sqlCode}</code>
          </pre>
        </div>
      </div>

      {/* Dialect Execution Tips */}
      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-xs font-mono text-zinc-500 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-zinc-400 font-medium mb-0.5">Execution Guide:</p>
          <p className="text-[11px] text-zinc-500">
            {queryState.dialect === 'bigquery' &&
              'In BigQuery, replace the table name with your `project_id.dataset.table_name`.'}
            {queryState.dialect === 'snowflake' &&
              'In Snowflake, run this inside Snowsight or an active warehouse session.'}
            {queryState.dialect === 'sqlite' &&
              'Run directly in DuckDB CLI against your file: duckdb -c "SELECT ... FROM read_csv_auto(\'file.csv\')".'}
            {(queryState.dialect === 'ansi' || queryState.dialect === 'postgres' || queryState.dialect === 'mysql') &&
              'Compatible with all SQL database engines and query editors.'}
          </p>
        </div>
      </div>
    </div>
  );
};

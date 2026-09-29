import React, { useState, useMemo } from 'react';
import {
  Table,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Copy,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react';
import { DatasetStats, DataType, FileMetadata, SelectedColumn } from '../types';

interface StatsDashboardProps {
  stats: DatasetStats;
  metadata: FileMetadata;
  rows: Record<string, any>[];
  headers: string[];
  selectedColumns: SelectedColumn[];
  onToggleColumn: (columnName: string) => void;
  onSelectAllColumns: (selectAll: boolean) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  metadata,
  rows,
  headers,
  selectedColumns,
  onToggleColumn,
  onSelectAllColumns,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [previewPageSize, setPreviewPageSize] = useState<number>(10);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [copiedCol, setCopiedCol] = useState<string | null>(null);

  // Filter columns based on search and type
  const filteredColumns = useMemo(() => {
    return stats.columns.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [stats.columns, searchTerm, typeFilter]);

  // Filter raw rows for preview
  const filteredRows = useMemo(() => {
    if (!previewSearch.trim()) return rows;
    const term = previewSearch.toLowerCase();
    return rows.filter((r) =>
      headers.some((h) => String(r[h] ?? '').toLowerCase().includes(term))
    );
  }, [rows, headers, previewSearch]);

  const totalPages = Math.ceil(filteredRows.length / previewPageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (previewPage - 1) * previewPageSize;
    return filteredRows.slice(start, start + previewPageSize);
  }, [filteredRows, previewPage, previewPageSize]);

  const copyColumnName = (colName: string) => {
    navigator.clipboard.writeText(colName);
    setCopiedCol(colName);
    setTimeout(() => setCopiedCol(null), 1500);
  };

  const isColSelected = (colName: string) => {
    return selectedColumns.some((sc) => sc.column === colName);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getTypeBadge = (type: DataType) => {
    switch (type) {
      case 'number':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
            <Hash className="w-2.5 h-2.5 text-zinc-400" strokeWidth={1.5} /> num
          </span>
        );
      case 'string':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
            <Type className="w-2.5 h-2.5 text-zinc-400" strokeWidth={1.5} /> text
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
            <Calendar className="w-2.5 h-2.5 text-zinc-400" strokeWidth={1.5} /> date
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
            <ToggleLeft className="w-2.5 h-2.5 text-zinc-400" strokeWidth={1.5} /> bool
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary KPI Cards - Minimalist Black */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Total Rows</p>
          <p className="text-xl font-semibold text-white mt-1">
            {stats.totalRows.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            {stats.duplicateRowsCount > 0 ? `${stats.duplicateRowsCount} dupes` : '0 duplicates'}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Columns</p>
          <p className="text-xl font-semibold text-white mt-1">
            {stats.totalColumns}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
            {selectedColumns.length} in query
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Completeness</p>
          <p className="text-xl font-semibold text-zinc-100 mt-1">
            {(100 - stats.nullRate).toFixed(1)}%
          </p>
          <div className="w-full bg-zinc-900 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-zinc-300 h-1 rounded-full transition-all"
              style={{ width: `${Math.max(0, 100 - stats.nullRate)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Null Cells</p>
          <p className="text-xl font-semibold text-zinc-300 mt-1">
            {stats.totalNullCells.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            {stats.nullRate}% of total
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">File Size</p>
          <p className="text-xl font-semibold text-white mt-1">
            {formatFileSize(metadata.size)}
          </p>
          <p className="text-[11px] text-zinc-500 uppercase font-mono mt-0.5">
            {metadata.type} {metadata.activeSheet ? `• ${metadata.activeSheet}` : ''}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Schema Breakdown</p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-2 font-mono">
            <span className="text-zinc-200">{stats.columns.filter((c) => c.type === 'number').length} #</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200">{stats.columns.filter((c) => c.type === 'string').length} Aa</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200">{stats.columns.filter((c) => c.type === 'date').length} 📅</span>
          </div>
        </div>
      </div>

      {/* Column Profiler Table Card */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3.5 border-b border-zinc-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Filter columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>

            {/* Type filter pills */}
            <div className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-md border border-zinc-800 text-xs">
              {['all', 'number', 'string', 'date', 'boolean'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition ${
                    typeFilter === t
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onSelectAllColumns(selectedColumns.length !== headers.length)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-mono"
            >
              {selectedColumns.length === headers.length ? (
                <>
                  <Square className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3 h-3 text-zinc-300" strokeWidth={1.5} />
                  <span>Select All ({headers.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Columns Profile List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-zinc-500 border-b border-zinc-800 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">Use</th>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Missing / Nulls</th>
                <th className="py-2.5 px-3">Distinct Values</th>
                <th className="py-2.5 px-3">Distribution / Sample Values</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredColumns.map((col) => {
                const isSelected = isColSelected(col.name);
                const isExpanded = expandedColumn === col.name;

                return (
                  <React.Fragment key={col.name}>
                    <tr
                      className={`hover:bg-zinc-900/40 transition-colors ${
                        isSelected ? 'bg-zinc-900/30' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onToggleColumn(col.name)}
                          className="text-zinc-500 hover:text-zinc-200 transition"
                          title={isSelected ? 'Remove from query' : 'Add to query'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-zinc-100" strokeWidth={1.5} />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-zinc-700 hover:text-zinc-400" strokeWidth={1.5} />
                          )}
                        </button>
                      </td>

                      {/* Column Name */}
                      <td className="py-2.5 px-3 font-mono font-medium text-zinc-200">
                        <div className="flex items-center gap-1.5 group">
                          <span>{col.name}</span>
                          <button
                            onClick={() => copyColumnName(col.name)}
                            className="opacity-0 group-hover:opacity-100 transition text-zinc-500 hover:text-zinc-300"
                            title="Copy column name"
                          >
                            {copiedCol === col.name ? (
                              <Check className="w-3 h-3 text-zinc-300" strokeWidth={1.5} />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-2.5 px-3">{getTypeBadge(col.type)}</td>

                      {/* Nulls */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-zinc-900 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-1 bg-zinc-400 rounded-full"
                              style={{ width: `${Math.min(100, col.nullPercentage)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-zinc-400">
                            {col.nullPercentage}% ({col.nullCount})
                          </span>
                        </div>
                      </td>

                      {/* Distinct Values */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className="text-zinc-300">
                          {col.uniqueCount.toLocaleString()}
                        </span>
                        <span className="text-zinc-600 text-[10px] ml-1">
                          ({col.uniquePercentage}%)
                        </span>
                      </td>

                      {/* Sample or Distribution Preview */}
                      <td className="py-2.5 px-3 max-w-xs">
                        {col.type === 'number' && col.histogram ? (
                          <div className="flex items-end gap-0.5 h-4 w-28 py-0.5">
                            {col.histogram.map((b, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-zinc-600 hover:bg-zinc-300 transition-all rounded-xs"
                                style={{ height: `${Math.max(15, b.percent)}%` }}
                                title={`${b.bucket}: ${b.count} (${b.percent}%)`}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 overflow-hidden truncate text-zinc-400">
                            {col.sampleValues.slice(0, 3).map((v, i) => (
                              <span
                                key={i}
                                className="px-1 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300 border border-zinc-800 font-mono truncate"
                              >
                                {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Expand Button */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setExpandedColumn(isExpanded ? null : col.name)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px] font-mono border border-zinc-800"
                        >
                          <BarChart2 className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                          <span>{isExpanded ? 'Hide' : 'Stats'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" strokeWidth={1.5} />
                          ) : (
                            <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Detailed Profile Drawer */}
                    {isExpanded && (
                      <tr className="bg-black border-b border-zinc-850">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="rounded-lg bg-zinc-950 border border-zinc-800/90 p-4">
                            <h4 className="text-xs font-mono text-zinc-300 mb-3 flex items-center gap-2">
                              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Profile:</span>
                              <span className="text-white font-medium">{col.name}</span>
                            </h4>

                            {/* Numeric Deep Dive */}
                            {col.type === 'number' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center font-mono">
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Min</p>
                                    <p className="text-xs font-semibold text-white mt-0.5">{col.min}</p>
                                  </div>
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Mean (Avg)</p>
                                    <p className="text-xs font-semibold text-zinc-200 mt-0.5">{col.mean}</p>
                                  </div>
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Median</p>
                                    <p className="text-xs font-semibold text-white mt-0.5">{col.median}</p>
                                  </div>
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Max</p>
                                    <p className="text-xs font-semibold text-white mt-0.5">{col.max}</p>
                                  </div>
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">StdDev</p>
                                    <p className="text-xs font-semibold text-zinc-300 mt-0.5">{col.stdDev}</p>
                                  </div>
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Q1 / Q3</p>
                                    <p className="text-xs font-semibold text-zinc-300 mt-0.5">
                                      {col.q25} / {col.q75}
                                    </p>
                                  </div>
                                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Sum</p>
                                    <p className="text-xs font-semibold text-white mt-0.5">{col.sum?.toLocaleString()}</p>
                                  </div>
                                </div>

                                {col.histogram && col.histogram.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-zinc-900">
                                    <p className="text-[11px] font-mono text-zinc-400 mb-2">
                                      Histogram Distribution
                                    </p>
                                    <div className="space-y-1">
                                      {col.histogram.map((bucket, bIdx) => (
                                        <div key={bIdx} className="flex items-center gap-3 text-xs font-mono">
                                          <span className="w-32 text-zinc-500 text-[10px] truncate">
                                            {bucket.bucket}
                                          </span>
                                          <div className="flex-1 bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                            <div
                                              className="bg-zinc-400 h-1.5 rounded-full transition-all duration-300"
                                              style={{ width: `${bucket.percent}%` }}
                                            />
                                          </div>
                                          <span className="w-16 text-right text-[11px] text-zinc-400">
                                            {bucket.count} ({bucket.percent}%)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Categorical Deep Dive */}
                            {col.type === 'string' && col.topValues && (
                              <div>
                                <p className="text-[11px] font-mono text-zinc-400 mb-2">
                                  Top Frequent Values
                                </p>
                                <div className="space-y-1">
                                  {col.topValues.map((tv, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                                      <span className="w-40 text-zinc-300 text-[11px] truncate" title={tv.value}>
                                        {tv.value || '<Empty>'}
                                      </span>
                                      <div className="flex-1 bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="bg-zinc-400 h-1.5 rounded-full transition-all"
                                          style={{ width: `${tv.percent}%` }}
                                        />
                                      </div>
                                      <span className="w-20 text-right text-[11px] text-zinc-500">
                                        {tv.count} ({tv.percent}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2.5 flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                                  <span>Min len: {col.minLength}</span>
                                  <span>•</span>
                                  <span>Avg len: {col.avgLength}</span>
                                  <span>•</span>
                                  <span>Max len: {col.maxLength}</span>
                                </div>
                              </div>
                            )}

                            {/* Date Deep Dive */}
                            {col.type === 'date' && (
                              <div className="grid grid-cols-2 gap-3 font-mono">
                                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                                  <p className="text-[10px] text-zinc-500 uppercase">Earliest Date</p>
                                  <p className="text-xs text-zinc-200 font-semibold mt-1">
                                    {col.minDate || 'N/A'}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                                  <p className="text-[10px] text-zinc-500 uppercase">Latest Date</p>
                                  <p className="text-xs text-zinc-200 font-semibold mt-1">
                                    {col.maxDate || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Boolean Deep Dive */}
                            {col.type === 'boolean' && (
                              <div className="grid grid-cols-2 gap-3 font-mono">
                                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                                  <p className="text-[10px] text-zinc-500 uppercase">True Count</p>
                                  <p className="text-xs font-semibold text-zinc-200 mt-1">
                                    {col.trueCount || 0} ({(((col.trueCount || 0) / (col.totalCount || 1)) * 100).toFixed(1)}%)
                                  </p>
                                </div>
                                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                                  <p className="text-[10px] text-zinc-500 uppercase">False Count</p>
                                  <p className="text-xs font-semibold text-zinc-400 mt-1">
                                    {col.falseCount || 0} ({(((col.falseCount || 0) / (col.totalCount || 1)) * 100).toFixed(1)}%)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Preview Table */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
        <div className="p-3.5 border-b border-zinc-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950">
          <div className="flex items-center gap-2">
            <Table className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold text-zinc-200">Raw Data Explorer</h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              ({filteredRows.length} rows)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search raw values..."
                value={previewSearch}
                onChange={(e) => {
                  setPreviewSearch(e.target.value);
                  setPreviewPage(1);
                }}
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>

            <select
              value={previewPageSize}
              onChange={(e) => {
                setPreviewPageSize(Number(e.target.value));
                setPreviewPage(1);
              }}
              className="px-2 py-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono focus:outline-none"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="sticky top-0 bg-black text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="py-2 px-3 w-10 text-zinc-700 text-center font-normal">#</th>
                {headers.map((h) => (
                  <th key={h} className="py-2 px-3 text-zinc-400 font-medium whitespace-nowrap text-[11px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {paginatedRows.map((row, idx) => {
                const rowNum = (previewPage - 1) * previewPageSize + idx + 1;
                return (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2 px-3 text-zinc-700 text-center">{rowNum}</td>
                    {headers.map((h) => {
                      const val = row[h];
                      const isNull = val === null || val === undefined || val === '';
                      return (
                        <td
                          key={h}
                          className={`py-2 px-3 whitespace-nowrap ${
                            isNull ? 'text-zinc-700 italic' : 'text-zinc-300'
                          }`}
                        >
                          {isNull ? 'null' : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-2.5 border-t border-zinc-800/90 flex items-center justify-between text-xs text-zinc-500 font-mono bg-zinc-950">
          <span>
            Page {previewPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
              disabled={previewPage <= 1}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 border border-zinc-800"
            >
              Prev
            </button>
            <button
              onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
              disabled={previewPage >= totalPages}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 border border-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

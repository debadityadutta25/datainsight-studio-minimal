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
  FileText,
  Copy,
  Check,
  Eye,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ColumnStats, DatasetStats, DataType, FileMetadata, SelectedColumn } from '../types';

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Hash className="w-3 h-3" /> Number
          </span>
        );
      case 'string':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Type className="w-3 h-3" /> Text
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar className="w-3 h-3" /> Date
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ToggleLeft className="w-3 h-3" /> Boolean
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Rows</p>
          <p className="text-2xl font-bold text-white mt-1">
            {stats.totalRows.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.duplicateRowsCount > 0 ? `${stats.duplicateRowsCount} duplicate rows` : 'No duplicate rows'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Columns</p>
          <p className="text-2xl font-bold text-white mt-1">
            {stats.totalColumns}
          </p>
          <p className="text-[11px] text-indigo-400 mt-0.5">
            {selectedColumns.length} selected for query
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completeness</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {(100 - stats.nullRate).toFixed(1)}%
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.max(0, 100 - stats.nullRate)}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Null / Empty Cells</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {stats.totalNullCells.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.nullRate}% of {stats.totalCells.toLocaleString()} cells
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">File Size</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatFileSize(metadata.size)}
          </p>
          <p className="text-[11px] text-slate-500 uppercase mt-0.5">
            {metadata.type} {metadata.activeSheet ? `• ${metadata.activeSheet}` : ''}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Column Types</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2 flex-wrap">
            <span className="text-emerald-400 font-semibold">{stats.columns.filter((c) => c.type === 'number').length} #</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{stats.columns.filter((c) => c.type === 'string').length} Aa</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{stats.columns.filter((c) => c.type === 'date').length} 📅</span>
          </div>
        </div>
      </div>

      {/* Column Profiler Table Card */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Type filter pills */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              {['all', 'number', 'string', 'date', 'boolean'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition ${
                    typeFilter === t
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {selectedColumns.length === headers.length ? (
                <>
                  <Square className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
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
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Use</th>
                <th className="py-3 px-4">Column</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Missing / Nulls</th>
                <th className="py-3 px-4">Distinct Values</th>
                <th className="py-3 px-4">Distribution / Sample Values</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredColumns.map((col) => {
                const isSelected = isColSelected(col.name);
                const isExpanded = expandedColumn === col.name;

                return (
                  <React.Fragment key={col.name}>
                    <tr
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleColumn(col.name)}
                          className="text-slate-400 hover:text-indigo-400 transition"
                          title={isSelected ? 'Remove from query' : 'Add to query'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Column Name */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        <div className="flex items-center gap-1.5 group">
                          <span>{col.name}</span>
                          <button
                            onClick={() => copyColumnName(col.name)}
                            className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-slate-300"
                            title="Copy column name"
                          >
                            {copiedCol === col.name ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">{getTypeBadge(col.type)}</td>

                      {/* Nulls */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                col.nullPercentage > 20
                                  ? 'bg-rose-500'
                                  : col.nullPercentage > 0
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, col.nullPercentage)}%` }}
                            />
                          </div>
                          <span
                            className={
                              col.nullCount > 0 ? 'text-amber-400 font-medium' : 'text-slate-400'
                            }
                          >
                            {col.nullPercentage}% ({col.nullCount})
                          </span>
                        </div>
                      </td>

                      {/* Distinct Values */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-300">
                          {col.uniqueCount.toLocaleString()}
                        </span>
                        <span className="text-slate-500 text-[10px] ml-1">
                          ({col.uniquePercentage}%)
                        </span>
                      </td>

                      {/* Sample or Distribution Preview */}
                      <td className="py-3 px-4 max-w-xs">
                        {col.type === 'number' && col.histogram ? (
                          <div className="flex items-end gap-1 h-5 w-32 py-0.5">
                            {col.histogram.map((b, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-indigo-500/70 hover:bg-indigo-400 transition-all rounded-xs"
                                style={{ height: `${Math.max(15, b.percent)}%` }}
                                title={`${b.bucket}: ${b.count} (${b.percent}%)`}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 overflow-hidden truncate text-slate-400">
                            {col.sampleValues.slice(0, 3).map((v, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-300 border border-slate-700/60 truncate"
                              >
                                {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Expand Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setExpandedColumn(isExpanded ? null : col.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
                        >
                          <BarChart2 className="w-3 h-3 text-indigo-400" />
                          <span>{isExpanded ? 'Collapse' : 'Stats'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Detailed Profile Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70 border-b border-slate-800">
                        <td colSpan={7} className="p-4 sm:p-6">
                          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                              <span>In-Depth Statistics for</span>
                              <code className="text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                                {col.name}
                              </code>
                            </h4>

                            {/* Numeric Deep Dive */}
                            {col.type === 'number' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Min</p>
                                    <p className="text-sm font-bold text-white mt-0.5">{col.min}</p>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Mean (Avg)</p>
                                    <p className="text-sm font-bold text-indigo-400 mt-0.5">{col.mean}</p>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Median</p>
                                    <p className="text-sm font-bold text-white mt-0.5">{col.median}</p>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Max</p>
                                    <p className="text-sm font-bold text-white mt-0.5">{col.max}</p>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Std Deviation</p>
                                    <p className="text-sm font-bold text-white mt-0.5">{col.stdDev}</p>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Q1 (25%) / Q3 (75%)</p>
                                    <p className="text-sm font-bold text-slate-300 mt-0.5">
                                      {col.q25} / {col.q75}
                                    </p>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-[10px] text-slate-400 uppercase">Sum</p>
                                    <p className="text-sm font-bold text-white mt-0.5">{col.sum?.toLocaleString()}</p>
                                  </div>
                                </div>

                                {col.histogram && col.histogram.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-slate-800">
                                    <p className="text-xs font-semibold text-slate-300 mb-2">
                                      Frequency Distribution Histogram
                                    </p>
                                    <div className="space-y-1.5">
                                      {col.histogram.map((bucket, bIdx) => (
                                        <div key={bIdx} className="flex items-center gap-3 text-xs">
                                          <span className="w-36 font-mono text-slate-400 text-[11px] truncate">
                                            {bucket.bucket}
                                          </span>
                                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                              style={{ width: `${bucket.percent}%` }}
                                            />
                                          </div>
                                          <span className="w-20 text-right font-medium text-slate-300">
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
                                <p className="text-xs font-semibold text-slate-300 mb-2">
                                  Top Frequent Categories / Values
                                </p>
                                <div className="space-y-1.5">
                                  {col.topValues.map((tv, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-xs">
                                      <span className="w-44 font-mono text-slate-300 truncate" title={tv.value}>
                                        {tv.value || '<Empty String>'}
                                      </span>
                                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-blue-500 h-2 rounded-full transition-all"
                                          style={{ width: `${tv.percent}%` }}
                                        />
                                      </div>
                                      <span className="w-24 text-right font-medium text-slate-400">
                                        {tv.count} rows ({tv.percent}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                                  <span>Min length: {col.minLength} chars</span>
                                  <span>•</span>
                                  <span>Avg length: {col.avgLength} chars</span>
                                  <span>•</span>
                                  <span>Max length: {col.maxLength} chars</span>
                                </div>
                              </div>
                            )}

                            {/* Date Deep Dive */}
                            {col.type === 'date' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                  <p className="text-[10px] text-slate-400 uppercase">Earliest Date</p>
                                  <p className="text-sm font-mono text-amber-400 font-bold mt-1">
                                    {col.minDate || 'N/A'}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                  <p className="text-[10px] text-slate-400 uppercase">Latest Date</p>
                                  <p className="text-sm font-mono text-amber-400 font-bold mt-1">
                                    {col.maxDate || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Boolean Deep Dive */}
                            {col.type === 'boolean' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                  <p className="text-[10px] text-slate-400 uppercase">True Count</p>
                                  <p className="text-base font-bold text-emerald-400 mt-1">
                                    {col.trueCount || 0} ({(((col.trueCount || 0) / (col.totalCount || 1)) * 100).toFixed(1)}%)
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                                  <p className="text-[10px] text-slate-400 uppercase">False Count</p>
                                  <p className="text-base font-bold text-rose-400 mt-1">
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
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Raw Data Explorer</h3>
            <span className="text-xs text-slate-500">
              ({filteredRows.length} {filteredRows.length === 1 ? 'row' : 'rows'})
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search raw values..."
                value={previewSearch}
                onChange={(e) => {
                  setPreviewSearch(e.target.value);
                  setPreviewPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={previewPageSize}
              onChange={(e) => {
                setPreviewPageSize(Number(e.target.value));
                setPreviewPage(1);
              }}
              className="px-2 py-1 text-xs rounded-md bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none"
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
            <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3 w-12 text-slate-600 text-center font-normal">#</th>
                {headers.map((h) => (
                  <th key={h} className="py-2 px-3 text-slate-300 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRows.map((row, idx) => {
                const rowNum = (previewPage - 1) * previewPageSize + idx + 1;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-600 text-center">{rowNum}</td>
                    {headers.map((h) => {
                      const val = row[h];
                      const isNull = val === null || val === undefined || val === '';
                      return (
                        <td
                          key={h}
                          className={`py-2 px-3 whitespace-nowrap ${
                            isNull ? 'text-slate-600 italic' : 'text-slate-300'
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
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/90">
          <span>
            Page {previewPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
              disabled={previewPage <= 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700"
            >
              Prev
            </button>
            <button
              onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
              disabled={previewPage >= totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

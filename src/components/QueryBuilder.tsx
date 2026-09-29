import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Filter,
  Columns,
  Layers,
  ArrowUpDown,
  Settings,
  Lightbulb,
} from 'lucide-react';
import {
  AggregationFunction,
  ColumnStats,
  FilterCondition,
  FilterOperator,
  OrderByRule,
  QueryState,
  SelectedColumn,
} from '../types';
import { parseNaturalLanguageQuery, generateSmartSuggestions } from '../utils/aiQueryEngine';

interface QueryBuilderProps {
  columns: ColumnStats[];
  queryState: QueryState;
  onChange: (newState: QueryState) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ columns, queryState, onChange }) => {
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const suggestions = generateSmartSuggestions(columns);

  const handleApplyNaturalQuery = (promptText?: string) => {
    const text = promptText || naturalPrompt;
    if (!text.trim()) return;

    const parsed = parseNaturalLanguageQuery(text, columns);
    setAiExplanation(parsed.explanation);

    // Map to selected columns with UUIDs
    const newSelected: SelectedColumn[] = parsed.selectedColumns.map((sc, i) => ({
      id: `col-${Date.now()}-${i}`,
      column: sc.column,
      alias: sc.alias || '',
      aggregation: sc.aggregation || 'NONE',
    }));

    // Map filters
    const newFilters: FilterCondition[] = parsed.filters.map((f, i) => ({
      id: `filt-${Date.now()}-${i}`,
      column: f.column,
      operator: f.operator,
      value: f.value,
      combinator: f.combinator,
    }));

    // Map order by
    const newOrderBy: OrderByRule[] = parsed.orderBy.map((o, i) => ({
      id: `ord-${Date.now()}-${i}`,
      column: o.column,
      direction: o.direction,
    }));

    onChange({
      ...queryState,
      selectedColumns: newSelected.length > 0 ? newSelected : queryState.selectedColumns,
      filters: newFilters,
      groupBy: parsed.groupBy,
      orderBy: newOrderBy,
      limit: parsed.limit || queryState.limit,
    });
  };

  // Add column
  const handleAddColumn = (columnName: string) => {
    if (queryState.selectedColumns.some((sc) => sc.column === columnName)) return;
    const newCol: SelectedColumn = {
      id: `col-${Date.now()}`,
      column: columnName,
      alias: '',
      aggregation: 'NONE',
    };
    onChange({
      ...queryState,
      selectedColumns: [...queryState.selectedColumns, newCol],
    });
  };

  const handleRemoveColumn = (id: string) => {
    onChange({
      ...queryState,
      selectedColumns: queryState.selectedColumns.filter((sc) => sc.id !== id),
    });
  };

  const handleUpdateColumnAgg = (id: string, aggregation: AggregationFunction) => {
    onChange({
      ...queryState,
      selectedColumns: queryState.selectedColumns.map((sc) =>
        sc.id === id ? { ...sc, aggregation } : sc
      ),
    });
  };

  const handleUpdateColumnAlias = (id: string, alias: string) => {
    onChange({
      ...queryState,
      selectedColumns: queryState.selectedColumns.map((sc) =>
        sc.id === id ? { ...sc, alias } : sc
      ),
    });
  };

  // Filter actions
  const handleAddFilter = () => {
    const firstCol = columns[0]?.name || 'id';
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      column: firstCol,
      operator: '=',
      value: '',
      combinator: queryState.filters.length === 0 ? 'AND' : 'AND',
    };
    onChange({
      ...queryState,
      filters: [...queryState.filters, newFilter],
    });
  };

  const handleUpdateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onChange({
      ...queryState,
      filters: queryState.filters.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const handleRemoveFilter = (id: string) => {
    onChange({
      ...queryState,
      filters: queryState.filters.filter((f) => f.id !== id),
    });
  };

  // Order By actions
  const handleAddOrderBy = () => {
    const firstCol = columns[0]?.name || 'id';
    const newOrder: OrderByRule = {
      id: `order-${Date.now()}`,
      column: firstCol,
      direction: 'ASC',
    };
    onChange({
      ...queryState,
      orderBy: [...queryState.orderBy, newOrder],
    });
  };

  const handleUpdateOrderBy = (id: string, updates: Partial<OrderByRule>) => {
    onChange({
      ...queryState,
      orderBy: queryState.orderBy.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    });
  };

  const handleRemoveOrderBy = (id: string) => {
    onChange({
      ...queryState,
      orderBy: queryState.orderBy.filter((o) => o.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Deterministic AI Assistant Bar */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800/90 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5 text-zinc-300">
          <Sparkles className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">
            Natural Query Assistant
          </span>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            • 100% offline schema parsing
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g., 'show top 10 records by revenue' or 'average salary grouped by department'..."
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyNaturalQuery();
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-600 transition"
            />
          </div>
          <button
            onClick={() => handleApplyNaturalQuery()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition duration-150"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            <span>Generate Query</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="mt-3.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
              <Lightbulb className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Suggestions:
            </span>
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setNaturalPrompt(sug);
                  handleApplyNaturalQuery(sug);
                }}
                className="text-xs font-mono px-3 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* AI Intent Explanation Feedback */}
        {aiExplanation && (
          <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs sm:text-sm text-zinc-200 flex items-start gap-2.5 font-mono">
            <Sparkles className="w-4 h-4 mt-0.5 text-zinc-300 flex-shrink-0" strokeWidth={1.5} />
            <span>
              <strong className="text-white">Parsed intent:</strong> {aiExplanation}
            </span>
          </div>
        )}
      </div>

      {/* Visual Interactive Query Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selected Columns & Aggregations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Columns Section */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-zinc-100">Selected Projections</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono border border-zinc-800">
                  {queryState.selectedColumns.length}
                </span>
              </div>

              {/* Column picker dropdown */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleAddColumn(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-xs sm:text-sm text-zinc-200 border border-zinc-800 hover:border-zinc-700 focus:outline-none cursor-pointer font-mono"
                >
                  <option value="" disabled>
                    + Add Column
                  </option>
                  {columns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {queryState.selectedColumns.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-zinc-850 rounded-xl text-zinc-500 text-sm font-mono">
                No specific columns selected. Will output (<code>*</code>).
              </div>
            ) : (
              <div className="space-y-2">
                {queryState.selectedColumns.map((sc) => {
                  const colStat = columns.find((c) => c.name === sc.column);
                  return (
                    <div
                      key={sc.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm"
                    >
                      <span className="font-mono text-zinc-200 flex-1 truncate text-sm">
                        {sc.column}
                        <span className="text-zinc-500 text-xs ml-2">({colStat?.type})</span>
                      </span>

                      {/* Aggregation Selector */}
                      <select
                        value={sc.aggregation}
                        onChange={(e) =>
                          handleUpdateColumnAgg(sc.id, e.target.value as AggregationFunction)
                        }
                        className="px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none"
                      >
                        <option value="NONE">No Aggregation</option>
                        <option value="COUNT">COUNT()</option>
                        <option value="COUNT_DISTINCT">COUNT(DISTINCT)</option>
                        <option value="SUM">SUM()</option>
                        <option value="AVG">AVG()</option>
                        <option value="MIN">MIN()</option>
                        <option value="MAX">MAX()</option>
                      </select>

                      {/* Custom Alias Input */}
                      <input
                        type="text"
                        placeholder="Alias (optional)"
                        value={sc.alias}
                        onChange={(e) => handleUpdateColumnAlias(sc.id, e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                      />

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveColumn(sc.id)}
                        className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 transition"
                        title="Remove column"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filters / WHERE Section */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-zinc-100">Filters (WHERE Conditions)</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono border border-zinc-800">
                  {queryState.filters.length}
                </span>
              </div>

              <button
                onClick={handleAddFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs sm:text-sm text-zinc-200 border border-zinc-800 transition font-mono"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Add Filter</span>
              </button>
            </div>

            {queryState.filters.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-zinc-850 rounded-xl text-zinc-500 text-sm font-mono">
                No filter conditions applied. All rows included.
              </div>
            ) : (
              <div className="space-y-2">
                {queryState.filters.map((filt, idx) => (
                  <div
                    key={filt.id}
                    className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm"
                  >
                    {/* Combinator (AND/OR) if not the first */}
                    {idx > 0 && (
                      <select
                        value={filt.combinator}
                        onChange={(e) =>
                          handleUpdateFilter(filt.id, {
                            combinator: e.target.value as 'AND' | 'OR',
                          })
                        }
                        className="px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 font-mono text-xs font-semibold"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    )}

                    {/* Column */}
                    <select
                      value={filt.column}
                      onChange={(e) => handleUpdateFilter(filt.id, { column: e.target.value })}
                      className="px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none"
                    >
                      {columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    {/* Operator */}
                    <select
                      value={filt.operator}
                      onChange={(e) =>
                        handleUpdateFilter(filt.id, { operator: e.target.value as FilterOperator })
                      }
                      className="px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none"
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="CONTAINS">CONTAINS</option>
                      <option value="STARTS_WITH">STARTS WITH</option>
                      <option value="ENDS_WITH">ENDS WITH</option>
                      <option value="IN">IN (list)</option>
                      <option value="IS NULL">IS NULL</option>
                      <option value="IS NOT NULL">IS NOT NULL</option>
                    </select>

                    {/* Value Input */}
                    {filt.operator !== 'IS NULL' && filt.operator !== 'IS NOT NULL' && (
                      <input
                        type="text"
                        placeholder="Value..."
                        value={filt.value}
                        onChange={(e) => handleUpdateFilter(filt.id, { value: e.target.value })}
                        className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-600"
                      />
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleRemoveFilter(filt.id)}
                      className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 transition"
                      title="Remove filter"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Group By, Order By & Query Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Group By Section */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-100">Group By</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Auto-grouped when aggregate expressions exist.
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {columns.map((c) => {
                const isGrouped = queryState.groupBy.includes(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      const newGroup = isGrouped
                        ? queryState.groupBy.filter((g) => g !== c.name)
                        : [...queryState.groupBy, c.name];
                      onChange({ ...queryState, groupBy: newGroup });
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition border ${
                      isGrouped
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order By Section */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-zinc-100">Order By / Sort</h3>
              </div>
              <button
                onClick={handleAddOrderBy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs sm:text-sm text-zinc-200 border border-zinc-800 transition font-mono"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Add Sort</span>
              </button>
            </div>

            {queryState.orderBy.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">No sorting applied.</p>
            ) : (
              <div className="space-y-2">
                {queryState.orderBy.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm"
                  >
                    <select
                      value={ord.column}
                      onChange={(e) => handleUpdateOrderBy(ord.id, { column: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono"
                    >
                      {columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={ord.direction}
                      onChange={(e) =>
                        handleUpdateOrderBy(ord.id, {
                          direction: e.target.value as 'ASC' | 'DESC',
                        })
                      }
                      className="px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono"
                    >
                      <option value="ASC">ASC</option>
                      <option value="DESC">DESC</option>
                    </select>

                    <button
                      onClick={() => handleRemoveOrderBy(ord.id)}
                      className="p-1.5 rounded text-zinc-500 hover:text-zinc-200"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table Settings & Limits */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3.5">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-100">Execution Parameters</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono text-xs">Table / View</label>
                <input
                  type="text"
                  value={queryState.tableName}
                  onChange={(e) => onChange({ ...queryState, tableName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono text-xs">Limit Rows</label>
                <input
                  type="number"
                  min={1}
                  max={1000000}
                  value={queryState.limit || ''}
                  onChange={(e) =>
                    onChange({
                      ...queryState,
                      limit: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

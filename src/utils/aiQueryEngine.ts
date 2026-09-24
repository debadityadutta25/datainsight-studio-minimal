import { AggregationFunction, AIParsedIntent, ColumnStats, FilterOperator } from '../types';

export function parseNaturalLanguageQuery(prompt: string, columns: ColumnStats[]): AIParsedIntent {
  const p = prompt.trim().toLowerCase();
  const selectedColumns: AIParsedIntent['selectedColumns'] = [];
  const filters: AIParsedIntent['filters'] = [];
  const groupBy: string[] = [];
  const orderBy: AIParsedIntent['orderBy'] = [];
  let limit: number | undefined = undefined;

  const colNames = columns.map((c) => c.name);
  const colMap = new Map<string, ColumnStats>(columns.map((c) => [c.name.toLowerCase(), c]));

  // Helper to find closest column name
  const findColumn = (phrase: string): string | null => {
    const clean = phrase.toLowerCase().replace(/[^a-z0-9_]/g, '');
    for (const c of colNames) {
      const lower = c.toLowerCase();
      if (lower === clean || lower === phrase.toLowerCase()) return c;
      if (lower.replace(/[^a-z0-9_]/g, '') === clean) return c;
    }
    // Partial substring match
    for (const c of colNames) {
      if (phrase.length > 2 && c.toLowerCase().includes(clean)) return c;
      if (clean.length > 2 && clean.includes(c.toLowerCase())) return c;
    }
    return null;
  };

  // 1. Detect Limit and Top/Bottom intents
  const topMatch = p.match(/\b(?:top|first|limit)\s+(\d+)\b/i);
  const bottomMatch = p.match(/\b(?:bottom|lowest|worst)\s+(\d+)\b/i);

  if (topMatch) {
    limit = parseInt(topMatch[1], 10);
  } else if (bottomMatch) {
    limit = parseInt(bottomMatch[1], 10);
  } else {
    const genericLimit = p.match(/\blimit\s+(\d+)\b/i);
    if (genericLimit) limit = parseInt(genericLimit[1], 10);
  }

  // 2. Detect Group By intents ("by [col]", "per [col]", "grouped by [col]")
  const groupByPatterns = [
    /\b(?:group(?:ed)?\s+by|per|broken?\s+down\s+by|for\s+each)\s+([a-z0-9_,\s]+?)(?:\s+(?:where|order|having|limit|sort)|$)/i,
    /\bby\s+([a-z0-9_,\s]+?)(?:\s+(?:where|order|having|limit|sort)|$)/i,
  ];

  for (const regex of groupByPatterns) {
    const match = p.match(regex);
    if (match && match[1]) {
      const potentialCols = match[1].split(/,|and|\s+/).filter(Boolean);
      for (const token of potentialCols) {
        const found = findColumn(token);
        if (found && !groupBy.includes(found)) {
          groupBy.push(found);
        }
      }
    }
  }

  // 3. Detect Aggregations ("avg of salary", "average age", "sum of revenue", "total sales", "count of employees")
  const aggKeywords: { keyword: RegExp; agg: AggregationFunction }[] = [
    { keyword: /\b(?:avg|average|mean)\s+(?:of\s+)?([a-z0-9_]+)\b/i, agg: 'AVG' },
    { keyword: /\b(?:sum|total)\s+(?:of\s+)?([a-z0-9_]+)\b/i, agg: 'SUM' },
    { keyword: /\b(?:count|number\s+of|how\s+many)\s+(?:of\s+)?([a-z0-9_]+)\b/i, agg: 'COUNT' },
    { keyword: /\b(?:distinct\s+count|unique\s+count|count\s+distinct)\s+(?:of\s+)?([a-z0-9_]+)\b/i, agg: 'COUNT_DISTINCT' },
    { keyword: /\b(?:max|maximum|highest|peak)\s+(?:of\s+)?([a-z0-9_]+)\b/i, agg: 'MAX' },
    { keyword: /\b(?:min|minimum|lowest)\s+(?:of\s+)?([a-z0-9_]+)\b/i, agg: 'MIN' },
  ];

  for (const item of aggKeywords) {
    const match = p.match(item.keyword);
    if (match && match[1]) {
      const foundCol = findColumn(match[1]);
      if (foundCol) {
        selectedColumns.push({
          column: foundCol,
          aggregation: item.agg,
          alias: `${item.agg.toLowerCase()}_${foundCol}`,
        });
      }
    }
  }

  // If "count" was requested without specific column or "count all"
  if (p.includes('count') && selectedColumns.every((c) => c.aggregation !== 'COUNT')) {
    const anyCol = columns[0]?.name || 'id';
    selectedColumns.push({
      column: anyCol,
      aggregation: 'COUNT',
      alias: 'total_count',
    });
  }

  // 4. Detect Explicit Column Selections ("show name, email", "select id, price", etc.)
  const selectMatch = p.match(/\b(?:show|select|display|list|get)\s+([a-z0-9_,\s]+?)(?:\s+(?:where|from|order|by|group|limit)|$)/i);
  if (selectMatch && selectMatch[1]) {
    const rawTokens = selectMatch[1].split(/,|and|\s+/).filter(Boolean);
    for (const token of rawTokens) {
      if (['the', 'all', 'rows', 'records', 'data', 'me', 'top', 'bottom'].includes(token.toLowerCase())) continue;
      const foundCol = findColumn(token);
      if (foundCol && !selectedColumns.some((sc) => sc.column === foundCol)) {
        selectedColumns.push({
          column: foundCol,
          aggregation: 'NONE',
        });
      }
    }
  }

  // 5. Detect Filters ("where [col] > 100", "[col] is active", "[col] contains test")
  // Check conditions
  for (const c of columns) {
    const colNameLower = c.name.toLowerCase();
    if (!p.includes(colNameLower)) continue;

    // Pattern: colName > 50 or colName = 'test'
    const numericOpRegex = new RegExp(
      `${colNameLower}\\s*(>=|<=|>|<|=|!=)\\s*([0-9.]+)`,
      'i'
    );
    const numMatch = p.match(numericOpRegex);
    if (numMatch) {
      filters.push({
        column: c.name,
        operator: numMatch[1] as FilterOperator,
        value: numMatch[2],
        combinator: 'AND',
      });
      continue;
    }

    // Pattern: greater than / less than
    const wordsOpRegex = new RegExp(
      `${colNameLower}\\s+(?:is\\s+)?(greater\\s+than(?:\\s+or\\s+equal)?|more\\s+than|above|less\\s+than(?:\\s+or\\s+equal)?|below|under|equal\\s+to|equals|is)\\s+([0-9a-z_.-]+)`,
      'i'
    );
    const wordsMatch = p.match(wordsOpRegex);
    if (wordsMatch) {
      const opWord = wordsMatch[1].toLowerCase();
      let operator: FilterOperator = '=';
      if (opWord.includes('greater than or equal')) operator = '>=';
      else if (opWord.includes('greater') || opWord.includes('more') || opWord.includes('above')) operator = '>';
      else if (opWord.includes('less than or equal')) operator = '<=';
      else if (opWord.includes('less') || opWord.includes('below') || opWord.includes('under')) operator = '<';
      else if (opWord.includes('equal') || opWord === 'is') operator = '=';

      filters.push({
        column: c.name,
        operator,
        value: wordsMatch[2],
        combinator: 'AND',
      });
      continue;
    }

    // Pattern: contains / like
    const containsRegex = new RegExp(`${colNameLower}\\s+(?:contains|like|includes)\\s+['"]?([a-z0-9_-]+)['"]?`, 'i');
    const contMatch = p.match(containsRegex);
    if (contMatch) {
      filters.push({
        column: c.name,
        operator: 'CONTAINS',
        value: contMatch[1],
        combinator: 'AND',
      });
      continue;
    }

    // Pattern: is null / is not null
    if (new RegExp(`${colNameLower}\\s+(?:is\\s+null|is\\s+empty|is\\s+missing)`, 'i').test(p)) {
      filters.push({
        column: c.name,
        operator: 'IS NULL',
        value: '',
        combinator: 'AND',
      });
    } else if (new RegExp(`${colNameLower}\\s+(?:is\\s+not\\s+null|is\\s+not\\s+empty|exists)`, 'i').test(p)) {
      filters.push({
        column: c.name,
        operator: 'IS NOT NULL',
        value: '',
        combinator: 'AND',
      });
    }
  }

  // 6. Detect Sorting / Order By
  const orderRegex = /\b(?:order(?:ed)?|sort(?:ed)?)\s+by\s+([a-z0-9_]+)(?:\s+(asc|desc|ascending|descending))?/i;
  const orderMatch = p.match(orderRegex);
  if (orderMatch && orderMatch[1]) {
    const foundCol = findColumn(orderMatch[1]);
    if (foundCol) {
      const dirStr = (orderMatch[2] || '').toLowerCase();
      const direction = dirStr.includes('desc') ? 'DESC' : 'ASC';
      orderBy.push({ column: foundCol, direction });
    }
  } else if (topMatch) {
    // Top N usually implies sorting by the first numeric column or aggregated column desc
    const numCol =
      selectedColumns.find((sc) => sc.aggregation && sc.aggregation !== 'NONE')?.column ||
      columns.find((c) => c.type === 'number')?.name;
    if (numCol && orderBy.length === 0) {
      orderBy.push({ column: numCol, direction: 'DESC' });
    }
  } else if (bottomMatch) {
    const numCol =
      selectedColumns.find((sc) => sc.aggregation && sc.aggregation !== 'NONE')?.column ||
      columns.find((c) => c.type === 'number')?.name;
    if (numCol && orderBy.length === 0) {
      orderBy.push({ column: numCol, direction: 'ASC' });
    }
  }

  // If no columns were explicitly picked, add all columns or grouped columns
  if (selectedColumns.length === 0) {
    if (groupBy.length > 0) {
      groupBy.forEach((g) => selectedColumns.push({ column: g, aggregation: 'NONE' }));
      const numCol = columns.find((c) => c.type === 'number');
      if (numCol) {
        selectedColumns.push({
          column: numCol.name,
          aggregation: 'SUM',
          alias: `total_${numCol.name}`,
        });
      }
    } else {
      // Pick first 5-8 columns
      columns.slice(0, 6).forEach((c) => {
        selectedColumns.push({ column: c.name, aggregation: 'NONE' });
      });
    }
  }

  // Generate explanation
  const colDesc = selectedColumns.map((sc) => (sc.aggregation !== 'NONE' ? `${sc.aggregation}(${sc.column})` : sc.column)).join(', ');
  const filterDesc = filters.length > 0 ? ` filtered by ${filters.map((f) => `${f.column} ${f.operator} ${f.value}`).join(' AND ')}` : '';
  const groupDesc = groupBy.length > 0 ? ` grouped by ${groupBy.join(', ')}` : '';
  const orderDesc = orderBy.length > 0 ? ` ordered by ${orderBy.map((o) => `${o.column} ${o.direction}`).join(', ')}` : '';
  const limitDesc = limit ? ` limited to ${limit} rows` : '';

  const explanation = `Selecting [${colDesc}]${filterDesc}${groupDesc}${orderDesc}${limitDesc}.`;

  return {
    explanation,
    selectedColumns,
    filters,
    groupBy,
    orderBy,
    limit: limit || (p.includes('top') || p.includes('limit') ? 10 : 25),
    confidence: 0.95,
  };
}

export function generateSmartSuggestions(columns: ColumnStats[]): string[] {
  const numericCols = columns.filter((c) => c.type === 'number').map((c) => c.name);
  const categoricalCols = columns.filter((c) => c.type === 'string' && c.uniqueCount <= 50).map((c) => c.name);
  const dateCols = columns.filter((c) => c.type === 'date').map((c) => c.name);

  const suggestions: string[] = [];

  if (numericCols.length > 0) {
    suggestions.push(`Show top 10 records by ${numericCols[0]}`);
  }

  if (categoricalCols.length > 0 && numericCols.length > 0) {
    suggestions.push(`Calculate average ${numericCols[0]} grouped by ${categoricalCols[0]}`);
  } else if (categoricalCols.length > 0) {
    suggestions.push(`Count records grouped by ${categoricalCols[0]}`);
  }

  if (numericCols.length >= 2) {
    suggestions.push(`Total ${numericCols[0]} and max ${numericCols[1]} by ${categoricalCols[0] || columns[0].name}`);
  }

  if (categoricalCols.length > 0) {
    const colStat = columns.find((c) => c.name === categoricalCols[0]);
    const topVal = colStat?.topValues?.[0]?.value || 'active';
    suggestions.push(`Filter records where ${categoricalCols[0]} equals '${topVal}'`);
  }

  if (dateCols.length > 0) {
    suggestions.push(`Show records ordered by ${dateCols[0]} desc limit 20`);
  }

  return suggestions.slice(0, 4);
}

import { ColumnStats, FilterCondition, QueryState, SQLDialect } from '../types';

function quoteIdentifier(identifier: string, dialect: SQLDialect): string {
  // If the identifier is standard snake_case or alphanumeric without spaces, usually no quotes needed
  const isSimple = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  if (isSimple) {
    return identifier;
  }

  switch (dialect) {
    case 'mysql':
    case 'bigquery':
      return `\`${identifier}\``;
    case 'postgres':
    case 'sqlite':
    case 'snowflake':
    case 'ansi':
    default:
      return `"${identifier}"`;
  }
}

function formatFilterValue(condition: FilterCondition, columnStatsMap: Map<string, ColumnStats>): string {
  const colStat = columnStatsMap.get(condition.column);
  const isNumeric = colStat?.type === 'number';
  const val = condition.value.trim();

  if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
    return '';
  }

  if (condition.operator === 'CONTAINS') {
    return `LIKE '%${val.replace(/'/g, "''")}%'`;
  }

  if (condition.operator === 'STARTS_WITH') {
    return `LIKE '${val.replace(/'/g, "''")}%'`;
  }

  if (condition.operator === 'ENDS_WITH') {
    return `LIKE '%${val.replace(/'/g, "''")}'`;
  }

  if (condition.operator === 'IN') {
    const items = val
      .split(',')
      .map((item) => item.trim())
      .map((item) => (isNumeric && !isNaN(Number(item)) ? item : `'${item.replace(/'/g, "''")}'`))
      .join(', ');
    return `IN (${items})`;
  }

  if (isNumeric && !isNaN(Number(val))) {
    return `${condition.operator} ${val}`;
  }

  return `${condition.operator} '${val.replace(/'/g, "''")}'`;
}

export function generateSQL(queryState: QueryState, allColumnStats: ColumnStats[]): string {
  const { selectedColumns, filters, groupBy, orderBy, limit, tableName, dialect } = queryState;
  const colStatsMap = new Map<string, ColumnStats>(allColumnStats.map((c) => [c.name, c]));

  const cleanTableName = (tableName || 'my_table').trim().replace(/[^a-zA-Z0-9_]/g, '_');
  const tableRef = quoteIdentifier(cleanTableName, dialect);

  // 1. SELECT clause
  const selectParts: string[] = [];
  let hasAggregations = false;
  const nonAggCols: string[] = [];

  if (selectedColumns.length === 0) {
    selectParts.push('    *');
  } else {
    for (const sc of selectedColumns) {
      const colRef = quoteIdentifier(sc.column, dialect);
      let expr = colRef;

      if (sc.aggregation && sc.aggregation !== 'NONE') {
        hasAggregations = true;
        if (sc.aggregation === 'COUNT_DISTINCT') {
          expr = `COUNT(DISTINCT ${colRef})`;
        } else {
          expr = `${sc.aggregation}(${colRef})`;
        }
      } else {
        nonAggCols.push(sc.column);
      }

      if (sc.alias && sc.alias.trim()) {
        const aliasRef = quoteIdentifier(sc.alias.trim(), dialect);
        expr = `${expr} AS ${aliasRef}`;
      }

      selectParts.push(`    ${expr}`);
    }
  }

  let sql = `SELECT\n${selectParts.join(',\n')}\nFROM\n    ${tableRef}`;

  // 2. WHERE clause
  if (filters.length > 0) {
    const whereConditions: string[] = [];
    filters.forEach((f, idx) => {
      const colRef = quoteIdentifier(f.column, dialect);
      const formattedVal = formatFilterValue(f, colStatsMap);
      const conditionStr =
        f.operator === 'IS NULL' || f.operator === 'IS NOT NULL'
          ? `${colRef} ${f.operator}`
          : `${colRef} ${formattedVal}`;

      if (idx === 0) {
        whereConditions.push(`    ${conditionStr}`);
      } else {
        whereConditions.push(`    ${f.combinator} ${conditionStr}`);
      }
    });

    sql += `\nWHERE\n${whereConditions.join('\n')}`;
  }

  // 3. GROUP BY clause
  const finalGroupBy = Array.from(new Set([...groupBy, ...(hasAggregations ? nonAggCols : [])]));
  if (finalGroupBy.length > 0 && hasAggregations) {
    const groupParts = finalGroupBy.map((g) => quoteIdentifier(g, dialect)).join(', ');
    sql += `\nGROUP BY\n    ${groupParts}`;
  }

  // 4. ORDER BY clause
  if (orderBy.length > 0) {
    const orderParts = orderBy
      .map((o) => `${quoteIdentifier(o.column, dialect)} ${o.direction}`)
      .join(', ');
    sql += `\nORDER BY\n    ${orderParts}`;
  }

  // 5. LIMIT clause
  if (limit && limit > 0) {
    if (dialect === 'snowflake' || dialect === 'postgres' || dialect === 'mysql' || dialect === 'sqlite' || dialect === 'bigquery') {
      sql += `\nLIMIT ${limit}`;
    } else {
      sql += `\nFETCH FIRST ${limit} ROWS ONLY`;
    }
  }

  sql += ';';
  return sql;
}

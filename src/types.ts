export type DataType = 'number' | 'string' | 'boolean' | 'date';

export type FileType = 'csv' | 'xlsx' | 'xls' | 'json';

export interface FileMetadata {
  name: string;
  size: number;
  type: FileType;
  sheetNames?: string[];
  activeSheet?: string;
  rowCount: number;
  columnCount: number;
}

export interface HistogramBucket {
  bucket: string;
  min: number;
  max: number;
  count: number;
  percent: number;
}

export interface ValueFrequency {
  value: string;
  count: number;
  percent: number;
}

export interface ColumnStats {
  name: string;
  type: DataType;
  totalCount: number;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniquePercentage: number;
  sampleValues: any[];
  
  // Numeric Stats
  min?: number;
  max?: number;
  sum?: number;
  mean?: number;
  median?: number;
  q25?: number;
  q75?: number;
  stdDev?: number;
  variance?: number;
  zerosCount?: number;
  negativeCount?: number;
  histogram?: HistogramBucket[];

  // Categorical / String Stats
  topValues?: ValueFrequency[];
  minLength?: number;
  maxLength?: number;
  avgLength?: number;

  // Date Stats
  minDate?: string;
  maxDate?: string;

  // Boolean Stats
  trueCount?: number;
  falseCount?: number;
}

export interface DatasetStats {
  totalRows: number;
  totalColumns: number;
  totalCells: number;
  totalNullCells: number;
  nullRate: number;
  duplicateRowsCount: number;
  columns: ColumnStats[];
}

export type AggregationFunction = 'NONE' | 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';

export interface SelectedColumn {
  id: string;
  column: string;
  alias: string;
  aggregation: AggregationFunction;
}

export type FilterOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'IN';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
  combinator: 'AND' | 'OR';
}

export interface OrderByRule {
  id: string;
  column: string;
  direction: 'ASC' | 'DESC';
}

export type SQLDialect = 'ansi' | 'postgres' | 'mysql' | 'bigquery' | 'snowflake' | 'sqlite';

export interface SparkConfig {
  appName: string;
  inputPath: string;
  mode: 'dataframe' | 'spark_sql';
  outputAction: 'show' | 'parquet' | 'csv' | 'toPandas';
  outputPath: string;
}

export interface QueryState {
  selectedColumns: SelectedColumn[];
  filters: FilterCondition[];
  groupBy: string[];
  orderBy: OrderByRule[];
  limit: number;
  tableName: string;
  dialect: SQLDialect;
  sparkConfig: SparkConfig;
}

export interface AIParsedIntent {
  explanation: string;
  selectedColumns: { column: string; alias?: string; aggregation?: AggregationFunction }[];
  filters: { column: string; operator: FilterOperator; value: string; combinator: 'AND' | 'OR' }[];
  groupBy: string[];
  orderBy: { column: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  confidence: number;
}

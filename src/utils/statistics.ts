import { ColumnStats, DatasetStats, DataType, HistogramBucket, ValueFrequency } from '../types';

export function isNullOrEmpty(val: any): boolean {
  return val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val));
}

export function detectColumnType(values: any[]): DataType {
  let numberCount = 0;
  let booleanCount = 0;
  let dateCount = 0;
  let nonNullCount = 0;

  for (const v of values) {
    if (isNullOrEmpty(v)) continue;
    nonNullCount++;

    const str = String(v).trim().toLowerCase();

    // Boolean check
    if (typeof v === 'boolean' || str === 'true' || str === 'false') {
      booleanCount++;
      continue;
    }

    // Number check
    // Ensure it's not a pure date string or empty string
    const num = Number(str.replace(/,/g, ''));
    if (!isNaN(num) && str !== '' && !str.includes('/') && !str.includes('-')) {
      numberCount++;
      continue;
    }

    // Date check (YYYY-MM-DD or standard ISO / date formats)
    if (str.length >= 8 && (str.includes('-') || str.includes('/'))) {
      const parsedDate = Date.parse(str);
      if (!isNaN(parsedDate)) {
        dateCount++;
        continue;
      }
    }
  }

  if (nonNullCount === 0) return 'string';

  const threshold = 0.8; // 80% dominant type
  if (booleanCount / nonNullCount >= threshold) return 'boolean';
  if (numberCount / nonNullCount >= threshold) return 'number';
  if (dateCount / nonNullCount >= threshold) return 'date';

  return 'string';
}

function calculatePercentiles(sortedNumbers: number[], p: number): number {
  if (sortedNumbers.length === 0) return 0;
  const index = (sortedNumbers.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedNumbers[lower] * (1 - weight) + sortedNumbers[upper] * weight;
}

function buildHistogram(numbers: number[], min: number, max: number, numBuckets = 7): HistogramBucket[] {
  if (numbers.length === 0) return [];
  if (min === max) {
    return [
      {
        bucket: `${min}`,
        min,
        max,
        count: numbers.length,
        percent: 100,
      },
    ];
  }

  const range = max - min;
  const bucketSize = range / numBuckets;
  const buckets: HistogramBucket[] = [];

  for (let i = 0; i < numBuckets; i++) {
    const bMin = min + i * bucketSize;
    const bMax = i === numBuckets - 1 ? max : min + (i + 1) * bucketSize;
    const label = `${bMin >= 1000 ? (bMin / 1000).toFixed(1) + 'k' : bMin.toFixed(1)} - ${
      bMax >= 1000 ? (bMax / 1000).toFixed(1) + 'k' : bMax.toFixed(1)
    }`;

    buckets.push({
      bucket: label,
      min: bMin,
      max: bMax,
      count: 0,
      percent: 0,
    });
  }

  for (const n of numbers) {
    let placed = false;
    for (let i = 0; i < numBuckets; i++) {
      const isLast = i === numBuckets - 1;
      if (isLast ? n >= buckets[i].min && n <= buckets[i].max : n >= buckets[i].min && n < buckets[i].max) {
        buckets[i].count++;
        placed = true;
        break;
      }
    }
    if (!placed && buckets.length > 0) {
      // Edge precision fallback
      buckets[buckets.length - 1].count++;
    }
  }

  for (const b of buckets) {
    b.percent = Number(((b.count / numbers.length) * 100).toFixed(1));
  }

  return buckets;
}

export function computeDatasetStats(headers: string[], rows: Record<string, any>[]): DatasetStats {
  const totalRows = rows.length;
  const totalColumns = headers.length;
  const totalCells = totalRows * totalColumns;
  let totalNullCells = 0;

  // Duplicate rows check
  const rowHash = new Set<string>();
  let duplicateRowsCount = 0;

  for (const r of rows) {
    const hash = JSON.stringify(r);
    if (rowHash.has(hash)) {
      duplicateRowsCount++;
    } else {
      rowHash.add(hash);
    }
  }

  const columns: ColumnStats[] = headers.map((colName) => {
    const rawValues = rows.map((r) => r[colName]);
    const detectedType = detectColumnType(rawValues);

    let nullCount = 0;
    const nonNullValues: any[] = [];
    const frequencyMap = new Map<string, number>();

    for (const v of rawValues) {
      if (isNullOrEmpty(v)) {
        nullCount++;
        totalNullCells++;
      } else {
        nonNullValues.push(v);
        const strVal = String(v).trim();
        frequencyMap.set(strVal, (frequencyMap.get(strVal) || 0) + 1);
      }
    }

    const nullPercentage = totalRows > 0 ? Number(((nullCount / totalRows) * 100).toFixed(1)) : 0;
    const uniqueCount = frequencyMap.size;
    const uniquePercentage =
      nonNullValues.length > 0 ? Number(((uniqueCount / nonNullValues.length) * 100).toFixed(1)) : 0;

    const sampleValues = Array.from(frequencyMap.keys()).slice(0, 5);

    const stats: ColumnStats = {
      name: colName,
      type: detectedType,
      totalCount: totalRows,
      nullCount,
      nullPercentage,
      uniqueCount,
      uniquePercentage,
      sampleValues,
    };

    // Numeric Profiling
    if (detectedType === 'number') {
      const numbers: number[] = [];
      let sum = 0;
      let zerosCount = 0;
      let negativeCount = 0;

      for (const v of nonNullValues) {
        const num = Number(String(v).replace(/,/g, ''));
        if (!isNaN(num)) {
          numbers.push(num);
          sum += num;
          if (num === 0) zerosCount++;
          if (num < 0) negativeCount++;
        }
      }

      if (numbers.length > 0) {
        numbers.sort((a, b) => a - b);
        const min = numbers[0];
        const max = numbers[numbers.length - 1];
        const mean = sum / numbers.length;
        const median = calculatePercentiles(numbers, 0.5);
        const q25 = calculatePercentiles(numbers, 0.25);
        const q75 = calculatePercentiles(numbers, 0.75);

        // Standard Deviation
        const variance =
          numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (numbers.length || 1);
        const stdDev = Math.sqrt(variance);

        stats.min = Number(min.toFixed(2));
        stats.max = Number(max.toFixed(2));
        stats.sum = Number(sum.toFixed(2));
        stats.mean = Number(mean.toFixed(2));
        stats.median = Number(median.toFixed(2));
        stats.q25 = Number(q25.toFixed(2));
        stats.q75 = Number(q75.toFixed(2));
        stats.stdDev = Number(stdDev.toFixed(2));
        stats.variance = Number(variance.toFixed(2));
        stats.zerosCount = zerosCount;
        stats.negativeCount = negativeCount;
        stats.histogram = buildHistogram(numbers, min, max, 7);
      }
    }

    // String / Categorical Profiling
    if (detectedType === 'string') {
      const sortedFreq = Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      const topValues: ValueFrequency[] = sortedFreq.map(([value, count]) => ({
        value,
        count,
        percent: nonNullValues.length > 0 ? Number(((count / nonNullValues.length) * 100).toFixed(1)) : 0,
      }));

      let minLength = Infinity;
      let maxLength = 0;
      let totalLength = 0;

      for (const v of nonNullValues) {
        const len = String(v).length;
        if (len < minLength) minLength = len;
        if (len > maxLength) maxLength = len;
        totalLength += len;
      }

      stats.topValues = topValues;
      stats.minLength = minLength === Infinity ? 0 : minLength;
      stats.maxLength = maxLength;
      stats.avgLength = nonNullValues.length > 0 ? Number((totalLength / nonNullValues.length).toFixed(1)) : 0;
    }

    // Boolean Profiling
    if (detectedType === 'boolean') {
      let trueCount = 0;
      let falseCount = 0;
      for (const v of nonNullValues) {
        const str = String(v).trim().toLowerCase();
        if (str === 'true' || str === '1') trueCount++;
        else falseCount++;
      }
      stats.trueCount = trueCount;
      stats.falseCount = falseCount;
    }

    // Date Profiling
    if (detectedType === 'date') {
      const timestamps = nonNullValues
        .map((v) => Date.parse(String(v)))
        .filter((t) => !isNaN(t))
        .sort((a, b) => a - b);

      if (timestamps.length > 0) {
        stats.minDate = new Date(timestamps[0]).toISOString().split('T')[0];
        stats.maxDate = new Date(timestamps[timestamps.length - 1]).toISOString().split('T')[0];
      }
    }

    return stats;
  });

  return {
    totalRows,
    totalColumns,
    totalCells,
    totalNullCells,
    nullRate: totalCells > 0 ? Number(((totalNullCells / totalCells) * 100).toFixed(1)) : 0,
    duplicateRowsCount,
    columns,
  };
}

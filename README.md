# DataInsight Studio 🚀
### 100% Offline AI Data Profiler, SQL & PySpark Code Generator

> **Zero Cloud Uploads • 100% Client-Side Private • Deployable to GitHub Pages**

A fast, responsive web application built with **React**, **TypeScript**, and **Tailwind CSS**. It runs completely in the user's browser with no server-side backend. You can drop any **CSV**, **Excel (.xlsx / .xls)**, or **JSON** file to instantly:
1. **Analyze Full Dataset Statistics**: Row/column counts, completeness, missingness, duplicate detection, and per-column profiling (distributions, histograms, mean, median, IQR, top frequencies).
2. **Translate Natural Language to Queries**: Deterministic offline schema-aware AI assistant parses natural language requests ("show top 10 by revenue", "average salary by department") with zero API keys or model downloads.
3. **Generate Production SQL**: Generates ANSI SQL, PostgreSQL, MySQL, Google BigQuery, Snowflake, and SQLite/DuckDB queries with interactive projections, aggregations, WHERE conditions, and GROUP BY.
4. **Generate Ready-to-Run PySpark Code**: Generates complete, executable Python scripts with SparkSession setup, type-safe filters, aggregations, and customizable output sinks (Parquet, CSV, `df.show()`, or pandas).

---

## 🛠️ Features

- 📁 **Universal Ingestion**:
  - **CSV**: Auto-detects delimiters (`,`, `;`, `\t`, `|`), handles quoted multi-line values.
  - **Excel**: Reads `.xlsx` and `.xls` files with support for multi-sheet workbooks.
  - **JSON**: Parses arrays of objects, nested JSON payloads, or JSON Lines (NDJSON).
  - **Sample Datasets Included**: 1-click test with E-Commerce Sales, Tech Workforce, or SaaS MRR data.
- 📊 **Deep Statistical Profiling**:
  - Null/missingness rate and counts per column.
  - Distinct cardinality and unique ratio.
  - Numeric metrics: Min, Max, Range, Mean, Median, Standard Deviation, Variance, Q1/Q3, IQR.
  - Visual histogram distribution sparklines.
  - Categorical metrics: Top 8 frequency distribution bars, string length stats.
  - Interactive Raw Data Explorer with pagination and global search.
- 🧠 **Offline Smart AI Query Assistant**:
  - Type queries in plain English.
  - Schema-grounded fuzzy token matching against actual column names.
  - Contextual suggestions dynamically generated from your uploaded file's schema.
- 🗄️ **Multi-Dialect SQL Generator**:
  - Supports ANSI, PostgreSQL, MySQL, BigQuery, Snowflake, and SQLite.
  - Type-aware literal formatting (numeric, quoted string, boolean, date).
  - One-click copy or `.sql` file download.
- ⚡ **Production PySpark Generator**:
  - Choice between **DataFrame API** (fluent chains: `.filter()`, `.groupBy().agg()`, `.select()`) and **Spark SQL** (`spark.sql(...)`).
  - Configurable Spark App Name, Input Path, and Sinks (Parquet, CSV, pandas).
  - One-click copy or `.py` script download.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

### Method 1: Automated GitHub Actions (Recommended)
This repository already includes the `.github/workflows/deploy.yml` workflow file!

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of DataInsight Studio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Every push to `main` will automatically build the app and deploy it to `https://<your-username>.github.io/<your-repo-name>/`.

### Method 2: Manual / Direct Branch Deployment
```bash
# Build the project
npm run build

# Push the 'dist' folder to the 'gh-pages' branch
npx gh-pages -d dist
```

---

## 🔒 Privacy & Offline Guarantee
- All calculations, statistics, and parsing happen inside your browser using Web Workers / JavaScript.
- No network requests are made with your file data.
- Works 100% offline (once loaded or installed as PWA / local static file).

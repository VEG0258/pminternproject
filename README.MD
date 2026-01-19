# Feedback Aggregation Dashboard

A Cloudflare Workers-based prototype for aggregating and analyzing customer feedback from multiple sources. Built for the Cloudflare Product Manager Intern Assignment.

## 🏗️ Architecture

This prototype uses the following Cloudflare products:

1. **Cloudflare Workers** - Main application server handling API routes and dashboard
2. **D1 Database** - Serverless SQL database for storing feedback entries
3. **Workers AI** - AI-powered categorization, sentiment analysis, and report generation
4. **Queues** - Asynchronous processing of feedback entries
5. **KV** - Key-value storage for storing generated reports

## 📋 Features

- **Mock Feedback Streaming**: Simulates receiving feedback from multiple sources (GitHub, Discord, Twitter, etc.)
- **AI-Powered Processing**: Automatically categorizes feedback (error, documentation, UI, etc.), analyzes sentiment, and assigns priority
- **Real-time Dashboard**: Beautiful Alpine.js-powered dashboard with charts showing feedback statistics
- **Daily/Weekly Reports**: AI-generated summaries of feedback trends and insights
- **Queue-based Processing**: Asynchronous processing pipeline for handling high volumes of feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Cloudflare account with Workers enabled
- Wrangler CLI installed globally: `npm install -g wrangler`

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

3. **Create D1 Database:**
   ```bash
   npm run db:create
   ```
   Copy the database ID from the output and update `wrangler.toml` with the `database_id`.

4. **Create KV Namespace:**
   ```bash
   npx wrangler kv:namespace create "SUMMARIES"
   ```
   Update `wrangler.toml` with the returned namespace IDs.

5. **Create Queue:**
   ```bash
   npx wrangler queues create feedback-queue
   ```
   The queue binding should already be configured in `wrangler.toml`.

6. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

### Development

Run locally:
```bash
npm run dev
```

### Deployment

Deploy to Cloudflare:
```bash
npm run deploy
```

After deployment, visit your worker URL (e.g., `https://feedback-aggregator.your-account.workers.dev`)

## 📖 Usage

1. **Stream Mock Feedback**: Click "Stream Mock Feedback" button to generate and queue sample feedback entries
2. **View Dashboard**: The dashboard automatically loads and displays:
   - Total feedback count
   - Breakdown by category, sentiment, and source
   - Recent feedback entries with tags
3. **Generate Reports**: Click "Generate Daily Report" or "Generate Weekly Report" to create AI-powered summaries

## 🔧 API Endpoints

- `GET /` - Dashboard UI
- `GET /api/stats?days=7` - Get dashboard statistics
- `POST /api/stream-feedback?count=10` - Stream mock feedback entries
- `GET /api/report/daily` - Generate daily report
- `GET /api/report/weekly` - Generate weekly report
- `GET /api/health` - Health check

## 🎨 Tech Stack

- **Runtime**: Cloudflare Workers (Edge Computing)
- **Database**: D1 (SQLite-based serverless database)
- **AI**: Workers AI (Llama 3.1 8B Instruct)
- **Frontend**: Alpine.js, Chart.js
- **Language**: TypeScript

## 📝 Notes

- Mock data is used for demonstration purposes
- AI processing uses heuristic fallbacks if Workers AI is unavailable
- Reports are stored in KV for later retrieval
- Queue processing happens asynchronously for better performance

## 🐛 Troubleshooting

- If AI responses fail, the system falls back to heuristic-based categorization
- Ensure all bindings are correctly configured in `wrangler.toml`
- Check Cloudflare dashboard for queue and database status

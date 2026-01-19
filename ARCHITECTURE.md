# Architecture Overview

## System Design

This prototype implements a feedback aggregation and analysis system using Cloudflare's edge computing platform. The system processes feedback from multiple sources, categorizes it using AI, and provides insights through a dashboard and automated reports.

## Cloudflare Products Used

### 1. Cloudflare Workers (Primary Platform)
- **Purpose**: Edge computing runtime for all application logic
- **Location**: `src/index.ts`, `src/queue.ts`
- **Why**: Provides global edge distribution, fast response times, and serverless execution

### 2. D1 Database (SQL Database)
- **Purpose**: Persistent storage for feedback entries
- **Schema**: `schema.sql`
- **Location**: `src/database.ts`
- **Why**: Serverless SQL database that scales automatically, perfect for structured feedback data

### 3. Workers AI (AI/ML Inference)
- **Purpose**: 
  - Categorize feedback (error, documentation, UI, etc.)
  - Analyze sentiment (positive, negative, neutral)
  - Generate daily/weekly report summaries
- **Model**: Llama 3.1 8B Instruct (`@cf/meta/llama-3.1-8b-instruct`)
- **Location**: `src/ai-processor.ts`, `src/reports.ts`
- **Why**: Edge-deployed AI models provide fast inference without external API dependencies

### 4. Queues (Message Queue)
- **Purpose**: Asynchronous processing pipeline
- **Queue Name**: `feedback-queue`
- **Location**: `src/queue.ts`
- **Why**: Handles high-volume feedback processing without blocking API requests, provides retry logic and dead-letter queue support

### 5. KV (Key-Value Storage)
- **Purpose**: Store generated reports for later retrieval
- **Namespace**: `SUMMARIES`
- **Location**: `src/index.ts` (report storage/retrieval)
- **Why**: Fast, eventually consistent storage perfect for report caching

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     FEEDBACK INGESTION                       │
│                                                              │
│  Mock Sources: GitHub, Discord, Twitter, Support, etc.      │
│  → /api/stream-feedback                                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   QUEUE PROCESSING                           │
│                                                              │
│  feedback-queue → queue.ts                                  │
│  ├─ Filter bad data (spam, too short, etc.)                │
│  ├─ AI categorization (Workers AI)                          │
│  ├─ Sentiment analysis (Workers AI)                         │
│  └─ Priority assignment (Workers AI)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                            │
│                                                              │
│  D1 Database: feedback_entries table                        │
│  └─ Stores: content, category, sentiment, priority, source │
└───────────────────────────┬─────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌─────────────────────┐         ┌─────────────────────┐
│    DASHBOARD        │         │   AI REPORTS        │
│                     │         │                     │
│  Alpine.js UI       │         │  Workers AI         │
│  Chart.js           │         │  Daily/Weekly       │
│  Real-time stats    │         │  Summaries          │
│  Recent feedback    │         │  Stored in KV       │
└─────────────────────┘         └─────────────────────┘
```

## Key Components

### 1. Mock Data Streaming (`src/mock-streaming.ts`)
- Generates realistic feedback from multiple sources
- Includes categories: error, documentation, UI, feature_request, bug, performance, security
- Simulates different sources: GitHub, Discord, Twitter, Support, etc.

### 2. AI Processing (`src/ai-processor.ts`)
- **Categorization**: Maps feedback to one of 8 categories
- **Sentiment Analysis**: Determines positive/negative/neutral sentiment
- **Priority Assignment**: Assigns high/medium/low priority
- **Fallback Heuristics**: If AI fails, uses keyword-based classification

### 3. Queue Consumer (`src/queue.ts`)
- Processes messages from `feedback-queue`
- Filters out spam/low-quality data
- Calls AI processing
- Stores processed feedback in D1

### 4. Database Layer (`src/database.ts`)
- `insertFeedback()`: Stores processed feedback
- `getDashboardStats()`: Aggregates statistics for dashboard
- Indexed queries for fast retrieval

### 5. Report Generation (`src/reports.ts`)
- Uses Workers AI to generate insights
- Creates daily and weekly summaries
- Includes key insights, top categories, recommendations
- Stores reports in KV for later access

### 6. Dashboard (`src/dashboard.ts`)
- Alpine.js for reactive UI
- Chart.js for data visualization
- Real-time statistics display
- Feedback listing with filters

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Dashboard UI |
| `/api/stats?days=7` | GET | Get aggregated statistics |
| `/api/stream-feedback?count=10` | GET | Generate and queue mock feedback |
| `/api/report/daily` | GET | Generate daily AI report |
| `/api/report/weekly` | GET | Generate weekly AI report |
| `/api/report/{type}?date=YYYY-MM-DD` | GET | Retrieve stored report |
| `/api/health` | GET | Health check |

## Database Schema

```sql
feedback_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,              -- error, documentation, ui, etc.
  sentiment TEXT,             -- positive, negative, neutral
  priority TEXT,              -- high, medium, low
  created_at INTEGER,
  processed_at INTEGER,
  metadata TEXT               -- JSON string
)

Indexes:
- idx_category
- idx_sentiment
- idx_created_at
- idx_source
```

## Configuration Files

### `wrangler.toml`
- Worker configuration
- D1 database binding
- Workers AI binding
- Queue producer/consumer configuration
- KV namespace binding

### `schema.sql`
- Database table definitions
- Indexes for performance

### `package.json`
- Dependencies: TypeScript, Wrangler, Workers types
- Scripts: dev, deploy, db commands

## Scalability Considerations

1. **Queue Processing**: Handles bursts of feedback asynchronously
2. **D1 Database**: Scales automatically with usage
3. **Workers AI**: Edge-deployed models reduce latency
4. **KV Storage**: Fast retrieval of cached reports
5. **Edge Distribution**: Global deployment reduces latency

## Future Enhancements (Not Implemented)

- Real API integrations (GitHub, Discord, Twitter)
- Email sending for reports (Cloudflare Email Workers)
- Webhook endpoints for external feedback sources
- User authentication and multi-tenant support
- Advanced filtering and search
- Real-time updates via WebSockets/SSE
- Custom AI model fine-tuning

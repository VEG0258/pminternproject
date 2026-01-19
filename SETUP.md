# Setup Guide for Feedback Aggregation Dashboard

## Quick Start with Vibe Coding (Cursor/Claude)

This guide will help you get started building and deploying this Cloudflare Workers project using AI coding assistants.

## Prerequisites

1. **Install Node.js** (v18 or higher)
2. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 3. Create D1 Database

```bash
npm run db:create
```

**Important**: Copy the `database_id` from the output. It will look like:
```
✅ Successfully created DB 'feedback-db'!

Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "feedback-db"
database_id = "abc123xyz456..."  <-- COPY THIS
```

Update `wrangler.toml` line 10 with this ID:
```toml
database_id = "abc123xyz456..."  # Replace with your actual ID
```

### 4. Create KV Namespace

```bash
npx wrangler kv:namespace create "SUMMARIES"
```

You'll get output like:
```
🌀  Creating namespace with title "feedback-aggregator-SUMMARIES"
✨  Successfully created namespace
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SUMMARIES", id = "abc123xyz789" }  <-- COPY THIS
```

Update `wrangler.toml` lines 29-30:
```toml
id = "abc123xyz789"  # Replace with your actual ID
preview_id = "your-preview-kv-id"  # You can leave this or create preview namespace
```

For preview namespace:
```bash
npx wrangler kv:namespace create "SUMMARIES" --preview
```

### 5. Create Queue

```bash
npx wrangler queues create feedback-queue
```

The queue should be automatically configured. If you need to verify, check the Cloudflare dashboard.

### 6. Run Database Migrations

For local development:
```bash
npm run db:local
```

For production (after you've updated database_id):
```bash
npm run db:migrate
```

### 7. Test Locally

```bash
npm run dev
```

This starts a local development server. Visit the URL shown (usually `http://localhost:8787`)

### 8. Deploy to Cloudflare

```bash
npm run deploy
```

After deployment, you'll get a URL like:
```
https://feedback-aggregator.your-account.workers.dev
```

## Using with Cursor/Claude Code

### Recommended Prompts for AI Assistant

1. **When setting up**:
   - "Help me configure the Cloudflare Workers bindings for D1, KV, and Queues"
   - "Generate mock feedback data that looks realistic from GitHub, Discord, and Twitter"
   - "Debug why my queue consumer isn't processing messages"

2. **When developing features**:
   - "Add a filter to the dashboard to show only high-priority feedback"
   - "Implement real-time updates using Server-Sent Events"
   - "Add email sending functionality for daily reports using Cloudflare Email Workers"

3. **When debugging**:
   - "Check why Workers AI isn't responding correctly"
   - "Fix TypeScript errors in the queue consumer"
   - "Optimize database queries for better performance"

### Cloudflare Docs MCP Server

If using Cursor/Windsurf with MCP:
- Connect to Cloudflare Docs MCP server to get real-time documentation
- Ask: "What's the correct way to use Workers AI for text classification?"
- Reference: https://developers.cloudflare.com/workers-ai/

## Project Structure

```
├── src/
│   ├── index.ts          # Main worker with API routes
│   ├── queue.ts          # Queue consumer for processing feedback
│   ├── database.ts       # D1 database operations
│   ├── ai-processor.ts   # Workers AI integration
│   ├── mock-streaming.ts # Mock data generation
│   ├── reports.ts        # Report generation logic
│   ├── types.ts          # TypeScript types
│   └── dashboard.ts      # Dashboard HTML template
├── schema.sql            # D1 database schema
├── wrangler.toml         # Cloudflare Workers configuration
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Testing the Application

1. **Visit the dashboard**: Open your deployed worker URL
2. **Stream mock feedback**: Click "Stream Mock Feedback" button
3. **Wait a few seconds**: Queue processing happens asynchronously
4. **Refresh dashboard**: Click "Refresh Dashboard" to see processed feedback
5. **Generate report**: Click "Generate Daily Report" to see AI-generated summary

## Troubleshooting

### Queue not processing
- Check queue exists: `npx wrangler queues list`
- Verify queue binding in `wrangler.toml`
- Check worker logs: `npx wrangler tail`

### Workers AI not working
- Verify AI binding in `wrangler.toml`
- Check if Workers AI is enabled in your account
- The code includes fallback heuristics if AI fails

### Database errors
- Ensure migrations ran: `npm run db:migrate`
- Check database_id is correct in `wrangler.toml`
- Verify D1 is enabled in your Cloudflare account

### Deployment issues
- Run `npx wrangler whoami` to verify authentication
- Check account has Workers paid plan (for some features)
- Review `wrangler.toml` for any configuration errors

## Next Steps

- Customize the mock data sources in `src/mock-streaming.ts`
- Adjust AI prompts in `src/ai-processor.ts` and `src/reports.ts`
- Enhance dashboard styling in `src/dashboard.ts`
- Add more categories or sources
- Integrate real APIs (GitHub, Discord, etc.)

# Quick Start Guide

## Getting Started with Vibe Coding (Cursor/Claude)

### 1. Initial Setup Commands

Run these commands in order:

```bash
# Install dependencies
npm install

# Login to Cloudflare (opens browser)
npx wrangler login

# Create D1 database
npm run db:create
# → Copy the database_id and update wrangler.toml line 10

# Create KV namespace  
npx wrangler kv:namespace create "SUMMARIES"
# → Copy the id and update wrangler.toml lines 29-30

# Create preview KV namespace (optional but recommended)
npx wrangler kv:namespace create "SUMMARIES" --preview
# → Copy the preview_id and update wrangler.toml line 30

# Create queue
npx wrangler queues create feedback-queue

# Run database migrations
npm run db:migrate

# Test locally
npm run dev
```

### 2. Update wrangler.toml

After running the commands above, you need to update `wrangler.toml` with the IDs you received:

1. **Line 10**: Replace `your-database-id` with the D1 database ID
2. **Line 29**: Replace `your-kv-namespace-id` with the KV namespace ID  
3. **Line 30**: Replace `your-preview-kv-id` with the preview KV namespace ID (if created)

### 3. Deploy

```bash
npm run deploy
```

Visit the URL shown in the output to see your dashboard!

## Using AI Coding Assistants

### In Cursor/Claude Code:

**Prompt templates to use:**

1. **For setup help:**
   ```
   "Help me configure Cloudflare Workers bindings. I need to:
   - Set up D1 database connection
   - Configure Workers AI for sentiment analysis
   - Set up a queue for processing feedback"
   ```

2. **For debugging:**
   ```
   "The queue consumer isn't processing messages. Check the queue.ts file 
   and help me debug why messages aren't being processed."
   ```

3. **For feature additions:**
   ```
   "Add a feature to filter feedback by date range in the dashboard. 
   Update both the API endpoint and the Alpine.js frontend."
   ```

4. **For documentation:**
   ```
   "Explain how the feedback processing pipeline works: from streaming 
   mock data, through the queue, AI processing, to database storage."
   ```

### Cloudflare Documentation Access

If you're using Cursor with MCP (Model Context Protocol):
- Connect to the Cloudflare Docs MCP server
- Ask questions like: "What Workers AI models are available for text classification?"
- Reference: https://developers.cloudflare.com/workers-ai/

## Architecture Overview

```
┌─────────────────┐
│  Mock Feedback  │ (Simulates GitHub, Discord, Twitter, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoint   │ (/api/stream-feedback)
│  (index.ts)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Queue       │ (Asynchronous processing)
│ (feedback-queue)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Queue Consumer │ (queue.ts)
│  - Filter spam  │
│  - AI categorize│
│  - AI sentiment │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   D1 Database   │ (Store processed feedback)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Dashboard    │ (Alpine.js + Chart.js)
│  - View stats   │
│  - Charts       │
│  - Recent items │
└─────────────────┘

┌─────────────────┐
│  AI Reports     │ (Workers AI)
│  - Daily summary│
│  - Weekly trend │
└─────────────────┘
```

## Cloudflare Products Used

1. **Workers** - Edge computing platform (main application)
2. **D1** - Serverless SQL database (feedback storage)
3. **Workers AI** - AI/ML inference (categorization, sentiment, reports)
4. **Queues** - Asynchronous message processing
5. **KV** - Key-value storage (report storage)

## Testing Workflow

1. **Visit dashboard**: `https://your-worker.workers.dev`
2. **Click "Stream Mock Feedback"** - Adds 10 sample entries
3. **Wait 2-3 seconds** - Queue processes asynchronously
4. **Click "Refresh Dashboard"** - See processed feedback
5. **Click "Generate Daily Report"** - Get AI summary
6. **Repeat** to build up data for better insights

## Common Issues

### Queue not processing?
- Run `npx wrangler tail` to see logs
- Check queue exists: `npx wrangler queues list`
- Verify bindings in `wrangler.toml`

### AI not working?
- Code has fallback heuristics - it will still work
- Check Workers AI is enabled in Cloudflare dashboard
- Verify AI binding in `wrangler.toml`

### Database empty?
- Ensure migrations ran: `npm run db:migrate`
- Check database_id is correct
- Verify D1 is enabled in account

## Next Steps

1. ✅ Complete setup (you are here)
2. Customize mock data sources
3. Enhance AI prompts for better categorization
4. Add more dashboard features
5. Integrate real APIs (optional)
6. Document friction points for Part 2 of assignment

## Helpful Commands

```bash
# View logs
npx wrangler tail

# List queues
npx wrangler queues list

# List D1 databases  
npx wrangler d1 list

# Test database query
npx wrangler d1 execute feedback-db --command "SELECT COUNT(*) FROM feedback_entries"

# View KV entries
npx wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
```

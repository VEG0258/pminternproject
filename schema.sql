-- Feedback entries table
CREATE TABLE IF NOT EXISTS feedback_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    sentiment TEXT,
    priority TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    processed_at INTEGER,
    metadata TEXT -- JSON string for additional data
);

-- Categories: error, documentation, ui, feature_request, bug, other
-- Sentiment: positive, negative, neutral
-- Priority: high, medium, low

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_category ON feedback_entries(category);
CREATE INDEX IF NOT EXISTS idx_sentiment ON feedback_entries(sentiment);
CREATE INDEX IF NOT EXISTS idx_created_at ON feedback_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_source ON feedback_entries(source);

export const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Aggregation Dashboard</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #1a202c;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: #718096;
            font-size: 14px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        .stat-label {
            color: #718096;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .chart-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .chart-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 16px;
        }
        
        .actions {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 12px;
            margin-bottom: 8px;
            transition: background 0.2s;
        }
        
        .btn:hover {
            background: #5568d3;
        }
        
        .btn-secondary {
            background: #48bb78;
        }
        
        .btn-secondary:hover {
            background: #38a169;
        }
        
        .btn-warning {
            background: #ed8936;
        }
        
        .btn-warning:hover {
            background: #dd6b20;
        }
        
        .feedback-list {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .feedback-item {
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .feedback-item:last-child {
            border-bottom: none;
        }
        
        .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .feedback-source {
            font-weight: 600;
            color: #667eea;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 8px;
        }
        
        .badge-category {
            background: #edf2f7;
            color: #2d3748;
        }
        
        .badge-sentiment-positive {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .badge-sentiment-negative {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .badge-sentiment-neutral {
            background: #feebc8;
            color: #7c2d12;
        }
        
        .badge-priority-high {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .badge-priority-medium {
            background: #feebc8;
            color: #7c2d12;
        }
        
        .badge-priority-low {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #718096;
        }
        
        .report-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-top: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .report-content {
            background: #f7fafc;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container" x-data="dashboard()" x-init="loadStats()">
        <div class="header">
            <h1>📊 Feedback Aggregation Dashboard</h1>
            <p class="subtitle">Real-time insights from customer feedback across all platforms</p>
        </div>
        
        <div class="actions">
            <button class="btn" @click="streamFeedback()">📥 Stream Mock Feedback</button>
            <button class="btn btn-secondary" @click="generateDailyReport()">📅 Generate Daily Report</button>
            <button class="btn btn-warning" @click="generateWeeklyReport()">📆 Generate Weekly Report</button>
            <button class="btn" @click="loadStats()">🔄 Refresh Dashboard</button>
        </div>
        
        <div x-show="loading" class="loading">Loading dashboard data...</div>
        
        <div x-show="!loading && stats">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" x-text="stats.totalFeedback || 0">0</div>
                    <div class="stat-label">Total Feedback</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" x-text="Object.keys(stats.byCategory || {}).length">0</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" x-text="Object.keys(stats.bySource || {}).length">0</div>
                    <div class="stat-label">Sources</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" x-text="stats.recentFeedback?.length || 0">0</div>
                    <div class="stat-label">Recent Entries</div>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-title">Feedback by Category</div>
                    <canvas x-ref="categoryChart"></canvas>
                </div>
                <div class="chart-card">
                    <div class="chart-title">Feedback by Sentiment</div>
                    <canvas x-ref="sentimentChart"></canvas>
                </div>
                <div class="chart-card">
                    <div class="chart-title">Feedback by Source</div>
                    <canvas x-ref="sourceChart"></canvas>
                </div>
            </div>
            
            <div class="feedback-list">
                <h2 style="margin-bottom: 16px; color: #1a202c;">Recent Feedback</h2>
                <template x-for="feedback in stats.recentFeedback || []" :key="feedback.id">
                    <div class="feedback-item">
                        <div class="feedback-header">
                            <span class="feedback-source" x-text="feedback.source"></span>
                            <div>
                                <span class="badge badge-category" x-text="feedback.category || 'uncategorized'"></span>
                                <span class="badge" :class="'badge-sentiment-' + (feedback.sentiment || 'neutral')" x-text="feedback.sentiment || 'neutral'"></span>
                                <span class="badge" :class="'badge-priority-' + (feedback.priority || 'medium')" x-text="feedback.priority || 'medium'"></span>
                            </div>
                        </div>
                        <p style="color: #4a5568; margin-top: 8px;" x-text="feedback.content"></p>
                    </div>
                </template>
                <div x-show="!stats.recentFeedback || stats.recentFeedback.length === 0" class="loading">
                    No feedback entries yet. Click "Stream Mock Feedback" to add some!
                </div>
            </div>
        </div>
        
        <div x-show="report" class="report-section">
            <h2 style="margin-bottom: 16px; color: #1a202c;">AI Generated Report</h2>
            <div class="report-content" x-text="report"></div>
        </div>
    </div>
    
    <script>
        function dashboard() {
            return {
                stats: null,
                loading: true,
                report: null,
                categoryChart: null,
                sentimentChart: null,
                sourceChart: null,
                
                async loadStats() {
                    this.loading = true;
                    try {
                        const response = await fetch('/api/stats?days=7');
                        this.stats = await response.json();
                        this.$nextTick(() => {
                            this.renderCharts();
                        });
                    } catch (error) {
                        console.error('Error loading stats:', error);
                    } finally {
                        this.loading = false;
                    }
                },
                
                renderCharts() {
                    if (!this.stats) return;
                    
                    // Category chart
                    const categoryCtx = this.$refs.categoryChart?.getContext('2d');
                    if (categoryCtx && this.categoryChart) this.categoryChart.destroy();
                    if (categoryCtx) {
                        this.categoryChart = new Chart(categoryCtx, {
                            type: 'bar',
                            data: {
                                labels: Object.keys(this.stats.byCategory || {}),
                                datasets: [{
                                    label: 'Feedback Count',
                                    data: Object.values(this.stats.byCategory || {}),
                                    backgroundColor: '#667eea',
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: { display: false }
                                }
                            }
                        });
                    }
                    
                    // Sentiment chart
                    const sentimentCtx = this.$refs.sentimentChart?.getContext('2d');
                    if (sentimentCtx && this.sentimentChart) this.sentimentChart.destroy();
                    if (sentimentCtx) {
                        this.sentimentChart = new Chart(sentimentCtx, {
                            type: 'doughnut',
                            data: {
                                labels: Object.keys(this.stats.bySentiment || {}),
                                datasets: [{
                                    data: Object.values(this.stats.bySentiment || {}),
                                    backgroundColor: ['#48bb78', '#f56565', '#ed8936'],
                                }]
                            },
                            options: { responsive: true }
                        });
                    }
                    
                    // Source chart
                    const sourceCtx = this.$refs.sourceChart?.getContext('2d');
                    if (sourceCtx && this.sourceChart) this.sourceChart.destroy();
                    if (sourceCtx) {
                        this.sourceChart = new Chart(sourceCtx, {
                            type: 'pie',
                            data: {
                                labels: Object.keys(this.stats.bySource || {}),
                                datasets: [{
                                    data: Object.values(this.stats.bySource || {}),
                                    backgroundColor: [
                                        '#667eea', '#48bb78', '#ed8936', '#f56565',
                                        '#9f7aea', '#38b2ac', '#f6ad55'
                                    ],
                                }]
                            },
                            options: { responsive: true }
                        });
                    }
                },
                
                async streamFeedback() {
                    try {
                        const response = await fetch('/api/stream-feedback?count=10');
                        const result = await response.json();
                        alert(`Queued ${result.entries.length} feedback entries! Processing...`);
                        setTimeout(() => this.loadStats(), 2000);
                    } catch (error) {
                        console.error('Error streaming feedback:', error);
                        alert('Error streaming feedback');
                    }
                },
                
                async generateDailyReport() {
                    try {
                        const response = await fetch('/api/report/daily');
                        const data = await response.json();
                        this.report = data.emailText || 'No report available';
                    } catch (error) {
                        console.error('Error generating report:', error);
                        alert('Error generating daily report');
                    }
                },
                
                async generateWeeklyReport() {
                    try {
                        const response = await fetch('/api/report/weekly');
                        const data = await response.json();
                        this.report = data.emailText || 'No report available';
                    } catch (error) {
                        console.error('Error generating report:', error);
                        alert('Error generating weekly report');
                    }
                }
            }
        }
    </script>
</body>
</html>
`;

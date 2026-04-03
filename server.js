require('dotenv').config();
const express = require('express');
const path = require('path');
const { fetchDashboardData } = require('./dataService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dashboard', async (req, res) => {
  try {
    const data = await fetchDashboardData();
    res.json(data);
  } catch (err) {
    console.error('Dashboard API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`라운지 모니터링 대시보드 실행 중 → http://localhost:${PORT}`);
});

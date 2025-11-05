// backend/index.js
const express = require('express');
const cors = require('cors');
const Sentiment = require('sentiment');

const app = express();
app.use(cors()); // allow all origins (fine for local dev)
app.use(express.json());

const sentiment = new Sentiment();

app.post('/analyze', (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  // accept single string or array of strings
  if (Array.isArray(text)) {
    const scores = text.map(t => sentiment.analyze(t).score);
    return res.json({ scores });
  }

  const result = sentiment.analyze(text);
  return res.json({ score: result.score });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));

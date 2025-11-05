// frontend/src/App.jsx
import React, { useState } from 'react';
import { scoreToColor } from './utils/sentiment';

function textColorForBg(hex){
  // compute simple luminance to choose white vs maroon-like text
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16) / 255;
  const g = parseInt(h.slice(2,4),16) / 255;
  const b = parseInt(h.slice(4,6),16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.6 ? 'text-maroon-800' : 'text-white';
}

export default function App(){
  const [textBlock, setTextBlock] = useState(`I love this\nThis is okay\nI hate it\nSo happy\nSo sad`);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  async function analyze(){
    const lines = textBlock.split('\n').map(s => s.trim()).filter(Boolean);
    if(lines.length === 0) return setScores([]);
    setLoading(true);
    try{
      const res = await fetch('http://localhost:4000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lines })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data?.error || 'analyze failed');
      setScores(data.scores || []);
    }catch(err){
      console.error(err);
      alert('Error analyzing. See console.');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sentiment Heatmap</h1>

      <div className="flex gap-4">
        <textarea
          className="flex-1 min-h-[180px] p-3 rounded-md bg-slate-800 text-white placeholder-slate-400"
          value={textBlock}
          onChange={(e) => setTextBlock(e.target.value)}
          rows={8}
        />
        <div className="w-40">
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full py-3 rounded-md bg-maroon hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {scores.length === 0 ? (
          <div className="text-slate-300">Press Analyze to make the heatmap (each line → one cell)</div>
        ) : (
          <div
            className="grid gap-3 mt-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(8,scores.length)}, minmax(0,1fr))` }}
          >
            {scores.map((s,i) => {
              const bg = scoreToColor(s);
              const textClass = textColorForBg(bg);
              return (
                <div
                  key={i}
                  title={`score: ${s}`}
                  className={`h-16 rounded-md flex items-center justify-center font-semibold ${textClass}`}
                  style={{ backgroundColor: bg }}
                >
                  <div>{s}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

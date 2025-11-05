// frontend/src/App.jsx
import React, { useState, useRef } from "react";

/* --- Color mapping: positive -> brand green, neutral -> light, negative -> white --- */
function mapScoreToColor(score) {
  const brand = { r: 15, g: 157, b: 88 }; // #0f9d58
  if (score <= -1) return "#ffffff";
  if (score > -1 && score <= 1) return "#f8fafc";
  const min = 1, max = 10;
  const t = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const r = Math.round(255 + (brand.r - 255) * t);
  const g = Math.round(255 + (brand.g - 255) * t);
  const b = Math.round(255 + (brand.b - 255) * t);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
function textColorForBg(hex) {
  if (!hex || hex[0] !== "#") return { color: "#000" };
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.68 ? { color: "#064c36" } : { color: "#ffffff" };
}

/* ---------- App ---------- */
export default function App() {
  const [textBlock, setTextBlock] = useState(
    `I love this\nThis is okay\nI hate it\nSo happy\nSo sad`
  );
  const [scores, setScores] = useState([]); // [{score, text}, ...]
  const [loading, setLoading] = useState(false);

  // UI helpers
  const [showSimple, setShowSimple] = useState(false);
  const suggestions = [
    "I absolutely love this product.",
    "This is fine, not great.",
    "I am very disappointed with this.",
    "Best experience ever, highly recommend!",
    "It didn't work as I expected."
  ];
  const textareaRef = useRef(null);

  /* Insert a suggestion into the textarea (appends as a new line) */
  function insertSuggestion(s) {
    const lines = textBlock.split("\n").map((l) => l.trim()).filter(Boolean);
    lines.push(s);
    setTextBlock(lines.join("\n"));
    // focus textarea
    textareaRef.current?.focus();
  }

  async function analyze() {
    const lines = textBlock.split("\n").map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0) {
      setScores([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "analyze failed");

      const arr = data.scores || (data.score !== undefined ? [data.score] : []);
      const items = lines.map((t, i) => ({ text: t, score: arr[i] ?? 0 }));
      setScores(items);
    } catch (err) {
      console.error(err);
      setScores([]);
    } finally {
      setLoading(false);
    }
  }

  /* Flip-friendly explanations */
  const detailedExplanation = `This app converts each line of text into a sentiment score (using a simple sentiment analyzer). Scores > 1 are positive, near 0 are neutral, and negative numbers indicate negative sentiment. The heatmap colors positive lines green (more intense for stronger positive), neutral lines a very light color, and negative lines white.`;
  const simpleExplanation = `Paste lines. Green = good, light = meh, white = bad. Press Analyze.`;

  /* Responsive grid columns for heatmap */
  const heatmapGridStyle = {
    gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg,#12b86b,#0f9d58)",
              boxShadow: "0 10px 30px rgba(15,157,88,0.12)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 12c0 3.3137 2.6863 6 6 6s6-2.6863 6-6-2.6863-6-6-6-6 2.6863-6 6z" fill="#fff" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sentiment Heatmap</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Visualize tone quickly — each line becomes a heatmap cell.
            </p>
          </div>
        </header>

        {/* Top area: left = editor+explain, right = suggestions + actions */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
          {/* Left column */}
          <section className="bg-white/95 rounded-2xl p-5 shadow-glass border" style={{ borderColor: "rgba(15,157,88,0.06)" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">Input</h2>
                  <span className="text-sm text-slate-500">One sentence per line</span>
                </div>

                {/* Explanation + flip */}
                <div className="mt-3 mb-4 p-3 rounded-md bg-slate-50 border border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm text-slate-700">
                      {showSimple ? simpleExplanation : detailedExplanation}
                    </div>
                    <button
                      onClick={() => setShowSimple((s) => !s)}
                      className="ml-4 text-sm text-slate-600 bg-white/60 px-2 py-1 rounded-md border hover:brightness-95"
                    >
                      {showSimple ? "Show detailed" : "Show simple"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Large textarea */}
            <div>
              <textarea
                ref={textareaRef}
                value={textBlock}
                onChange={(e) => setTextBlock(e.target.value)}
                className="w-full min-h-[220px] p-4 rounded-xl border border-gray-100 bg-white text-slate-900 resize-vertical focus:ring-2 focus:ring-brand-400 focus:outline-none text-sm"
                placeholder="Type or paste lines of text here. Each non-empty line will become a heatmap cell."
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <div>{textBlock.split("\n").map(s => s.trim()).filter(Boolean).length} line(s)</div>
                <div>{textBlock.length} chars</div>
              </div>
            </div>
          </section>

          {/* Right column: suggestions (non-editable), analyze, legend */}
          <aside className="flex flex-col gap-4">
            <div className="bg-white/95 rounded-xl p-4 shadow-glass border" style={{ borderColor: "rgba(15,157,88,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-900">One-line Prompts</h3>
                <div className="text-xs text-slate-500">Tap to add</div>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-slate-700">{s}</div>
                    <button
                      onClick={() => insertSuggestion(s)}
                      className="text-sm text-white px-3 py-1 rounded-md"
                      style={{ background: "linear-gradient(180deg,#12b86b,#0f9d58)" }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/95 rounded-xl p-4 shadow-glass border flex flex-col gap-3 items-stretch" style={{ borderColor: "rgba(15,157,88,0.06)" }}>
              <button
                onClick={analyze}
                disabled={loading}
                className="py-3 px-4 rounded-xl font-semibold text-white shadow"
                style={{ background: "linear-gradient(180deg,#12b86b,#0f9d58)", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>

              <div className="text-sm text-slate-600">Legend</div>
              <div className="w-full h-8 rounded-full overflow-hidden border border-gray-100" style={{ background: "linear-gradient(90deg,#ffffff,#f8fafc,#0f9d58)" }} />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>

            <div className="hidden md:block text-xs text-slate-500">
              Tip: Use suggestions to bootstrap content. The suggestion box is read-only (you cannot erase it from there), but you can remove lines in the editor.
            </div>
          </aside>
        </div>

        {/* Heatmap area */}
        <div className="mt-6">
          <h3 className="text-sm text-slate-700 mb-3">Heatmap</h3>

          {scores.length === 0 ? (
            <div className="rounded-xl p-6 bg-white/90 border border-gray-100 text-slate-500">
              No results yet — press Analyze to generate the heatmap.
            </div>
          ) : (
            <div className="grid gap-4" style={heatmapGridStyle}>
              {scores.map((item, i) => {
                const bg = mapScoreToColor(item.score);
                const textStyle = textColorForBg(bg);
                return (
                  <div
                    key={i}
                    title={`${item.text} — score: ${item.score}`}
                    className="rounded-xl p-3 h-28 flex flex-col justify-center items-start gap-2 transform transition hover:scale-[1.02]"
                    style={{
                      backgroundColor: bg,
                      ...textStyle,
                      boxShadow: "0 8px 24px rgba(7,12,17,0.06)",
                      border: "1px solid rgba(0,0,0,0.03)",
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-sm font-semibold" style={textStyle}>{item.score}</div>
                      <div className="text-xs text-slate-800/60" style={textStyle}>{/* spacer to align */}</div>
                    </div>
                    <div className="text-sm" style={{ ...textStyle, opacity: 0.95 }}>
                      {item.text.length > 80 ? item.text.slice(0, 80) + "…" : item.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-400">
          Built with Express • Frontend: Vite + React + Tailwind • Tests: Jest & Playwright
        </footer>
      </div>
    </div>
  );
}

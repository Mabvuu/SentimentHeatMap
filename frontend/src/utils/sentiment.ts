// frontend/src/utils/sentiment.ts
export function hexToRgb(hex: string): number[] {
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
export function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('');
}
export function lerp(a:number,b:number,t:number){ return Math.round(a + (b-a)*t); }

export function scoreToColor(score:number){
  const min = -10, max = 10;
  const t = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const white = hexToRgb('#ffffff');
  const maroon = hexToRgb('#800000');
  const r = lerp(white[0], maroon[0], t);
  const g = lerp(white[1], maroon[1], t);
  const b = lerp(white[2], maroon[2], t);
  return rgbToHex([r,g,b]);
}

// frontend/src/__tests__/sentiment.test.ts
import { scoreToColor } from '../utils/sentiment';

describe('scoreToColor', () => {
  test('returns maroon-ish for high positive scores', () => {
    expect(scoreToColor(10).toLowerCase()).toMatch(/^#80/); // maroon starts with 80...
  });

  test('returns white-ish for very negative', () => {
    expect(scoreToColor(-10).toLowerCase()).toBe('#ffffff');
  });

  test('returns intermediate color for zero', () => {
    const c = scoreToColor(0);
    expect(typeof c).toBe('string');
    expect(c.startsWith('#')).toBe(true);
  });
});

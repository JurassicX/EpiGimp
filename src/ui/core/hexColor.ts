export function hexColor(c: number) {
  return c.toString(16).padStart(2, "0");
}

export function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  ) as [number, number, number];
}

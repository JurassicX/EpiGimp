export function hexColor(c: number) {
    if (c < 256) {
      return Math.abs(c).toString(16);
    }
    return 0;
}
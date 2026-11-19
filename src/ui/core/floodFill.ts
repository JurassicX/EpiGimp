export function floodFill(
  image: ImageData,
  startX: number,
  startY: number,
  tolerance: number,
): Uint8Array {
  const { width, height, data } = image;
  const filled = new Uint8Array(width * height);
  const start = (startY * width + startX) * 4;
  const target = data.slice(start, start + 4);

  function matches(index: number) {
    if (filled[index]) return false;
    const offset = index * 4;
    for (let channel = 0; channel < 4; channel++) {
      if (Math.abs(data[offset + channel] - target[channel]) > tolerance)
        return false;
    }
    return true;
  }

  function pushRuns(y: number, left: number, right: number) {
    if (y < 0 || y >= height) return;
    let inRun = false;
    for (let x = left; x <= right; x++) {
      if (matches(y * width + x)) {
        if (!inRun) stack.push(x, y);
        inRun = true;
      } else {
        inRun = false;
      }
    }
  }

  const stack = [startX, startY];

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const row = y * width;
    if (!matches(row + x)) continue;

    let left = x;
    while (left > 0 && matches(row + left - 1)) left--;
    let right = x;
    while (right < width - 1 && matches(row + right + 1)) right++;

    filled.fill(1, row + left, row + right + 1);
    pushRuns(y - 1, left, right);
    pushRuns(y + 1, left, right);
  }

  return filled;
}

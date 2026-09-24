export interface MousePos {
    x: number
    y: number
}

export function getMousePos(canvas: HTMLCanvasElement, ev: MouseEvent | React.MouseEvent): MousePos {
    const rect = canvas.getBoundingClientRect()

    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
    }
}

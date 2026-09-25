export interface MousePos {
    x: number
    y: number
    pressure: number
}

export function getMousePos(canvas: HTMLCanvasElement, ev: React.PointerEvent): MousePos {
    const rect = canvas.getBoundingClientRect()

    return {
        x: (ev.clientX - rect.left) * (canvas.width / rect.width),
        y: (ev.clientY - rect.top) * (canvas.height / rect.height),
        pressure: ev.pointerType === 'pen' && ev.pressure > 0 ? ev.pressure : 1,
    }
}

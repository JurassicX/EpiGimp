import type { PanelVisibility } from '../core/panels'

interface TopBarProps {
  panels: PanelVisibility
  onTogglePanel: (name: keyof PanelVisibility) => void
}

const MENU: { name: keyof PanelVisibility, label: string }[] = [
  { name: 'file', label: 'File' },
  { name: 'edit', label: 'Edit' },
  { name: 'image', label: 'Image' },
  { name: 'filters', label: 'Filters' },
]

export function TopBar({ panels, onTogglePanel }: TopBarProps) {
  return (
    <header className="topbar">
      <span className="brand">EpiGimp</span>
      <nav className="menu">
        {MENU.map((item) => (
          <button
            key={item.name}
            className={panels[item.name] ? 'menu-item active' : 'menu-item'}
            onClick={() => onTogglePanel(item.name)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

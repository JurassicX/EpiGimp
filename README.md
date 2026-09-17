# EpiGimp

A simple image editor inspired by GIMP, built as a desktop app with **Electron**, **React** and **TypeScript**.

## Requirements

- [Node.js](https://nodejs.org/) **20.19+** or **22.12+**
- npm (comes with Node.js)

Check your version with:

```bash
node -v
```

## Install

```bash
git clone <repository-url>
cd EpiGimp
npm install
```

## Run the app

```bash
npm run dev
```

This opens the EpiGimp window. When you save a file in `src/ui/`, the window updates by itself.

> The dev server uses port **5123**. If the app does not start, make sure nothing else is using that port.

## Build the app

To create an installable version of the app, run the command for your system:

| System  | Command              | Result              |
| ------- | -------------------- | ------------------- |
| Linux   | `npm run dist:linux` | `.AppImage`         |
| Windows | `npm run dist:win`   | `.exe` and `.msi`   |
| macOS   | `npm run dist:mac`   | `.dmg` (Apple chip) |

The files are created in the `dist/` folder.

## Other commands

| Command        | What it does                        |
| -------------- | ----------------------------------- |
| `npm run lint` | Checks the code for common mistakes |

## Project structure

```
EpiGimp/
├── index.html         # Page loaded by the app (you don't need to edit it)
├── src/
│   ├── electron/      # Desktop window code (Electron)
│   ├── ui/            # The app interface (React)
│   │   ├── main.tsx   # Starts React
│   │   └── App.tsx    # Main layout of the app
│   └── img/           # App icon
└── Docs/              # Project subject
```

# Pinpoint

Browser extension to annotate your local dev UI and export context-rich feedback for AI agents.

Click any element, leave a note, and export everything—selector, styles, animation state—as a prompt for your AI coding agent.

## Features

- **Element picker** - Click any element on localhost to select it
- **Quick annotations** - Add notes like "make this snappier" or "too much padding"
- **Context capture** - Automatically captures selector, styles, animations, and position
- **Prompt generation** - Export all annotations as a formatted prompt for AI agents
- **History** - View and re-copy past generated prompts (last 50)

## Tech Stack

- TypeScript
- React
- Vite
- Chrome Extension Manifest V3

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Build the extension:

```bash
npm run build
```

3. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

4. For development with auto-rebuild:

```bash
npm run dev
```

Then reload the extension in Chrome after changes.

## Usage

1. Navigate to any `localhost` page
2. Click the Pinpoint extension icon
3. Click "Start Picking"
4. Hover over elements to see the dashed highlight
5. Click an element to select it
6. Enter your annotation (e.g., "Make this animation faster")
7. Click "Save" - you can continue annotating more elements
8. When done, click the extension icon and "Export to Clipboard"
9. Paste the generated prompt into Claude Code or your AI agent

## Example Output

```markdown
## UI Feedback for http://localhost:3000/

### Annotation 1
**Note:** "Make this animation snappier"
**Element:** `div.hero > button.cta`
**Styles:** padding: 24px, transition: all 0.3s ease
**Animation:** fade-in at 45% (300ms, running)
**Position:** 200x48 at (320, 150)

---

### Annotation 2
**Note:** "Too much padding here"
**Element:** `section.features > div.card:nth-child(2)`
**Styles:** padding: 48px, border-radius: 12px
**Position:** 320x240 at (400, 600)
```

## Project Structure

```
pinpoint/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── background/        # Service worker
│   ├── content/           # Content script (React overlay)
│   │   ├── components/
│   │   └── hooks/
│   ├── popup/             # Extension popup (React)
│   ├── types/             # TypeScript types
│   └── utils/             # Shared utilities
└── vite.config.ts
```

## License

MIT

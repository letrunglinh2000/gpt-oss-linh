# LM Studio React Chat

A modern, feature-rich chat application built with React, TypeScript, and TailwindCSS for interacting with LM Studio's OpenAI-compatible API.

## Features

### 🎨 Enhanced Answer Display
- **Syntax-highlighted code blocks** with copy/download functionality using Shiki
- **Interactive data tables** with pagination, sorting, filtering, and CSV export
- **Rich markdown rendering** with support for all common elements
- **Responsive design** that works on desktop and mobile
- **Dark/light theme** support with system preference detection

### 💬 Chat Interface
- **Multiple conversations** with sidebar navigation
- **Real-time streaming** responses with fallback to non-streaming
- **Persistent chat history** stored in localStorage
- **Export/import** chat data as JSON
- **Configurable settings** (model, temperature, system prompt)

### 🚀 Developer Experience
- **TypeScript** for type safety
- **TailwindCSS** for modern styling
- **Modular components** for easy customization
- **Accessible** with proper ARIA labels and keyboard navigation

## Quick Start

### 1. Install Dependencies
```bash
cd react-chat
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

### 3. Configure LM Studio
1. Open LM Studio
2. Go to "Local Server" tab
3. Start the server (default port 1234)
4. Load your model and copy its exact name
5. In the chat app, paste the model name in the "Model" field

## Components

### `<AnswerBox>`
Main container for assistant responses with:
- Collapsible/expandable content
- Drag-to-resize on desktop
- Header with optional title/subtitle
- Footer with action buttons

### `<CodeBlock>`
Enhanced code display with:
- Syntax highlighting using Shiki
- Copy to clipboard functionality
- Download as file
- Line wrapping toggle
- Expand/collapse for long code
- Line numbers and diff styling support

### `<DataTable>`
Interactive table component featuring:
- Client-side search and filtering
- Multi-column sorting
- Pagination with configurable page sizes
- Row selection
- CSV export
- Empty state handling
- Virtualized rendering for large datasets

### `<MarkdownRenderer>`
Custom markdown renderer that:
- Converts code fences to `<CodeBlock>` components
- Renders tables as `<DataTable>` components
- Supports all standard markdown features
- Maintains security with safe HTML rendering

## Configuration

### API Settings
The app connects to LM Studio's API at `http://127.0.0.1:1234/v1` by default. You can modify this in `src/services/api.ts`:

```typescript
constructor(baseURL = 'http://127.0.0.1:1234/v1') {
  this.baseURL = baseURL;
}
```

### Styling
All styles use TailwindCSS with CSS variables for theming. Main theme variables are defined in `src/index.css`:

```css
:root {
  --color-primary: 37 99 235;
  --color-bg: 248 250 252;
  /* ... other variables ... */
}
```

### Code Highlighting
Shiki is configured with multiple themes and languages in `src/components/CodeBlock.tsx`. Add more languages as needed:

```typescript
const highlighter = await getHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: ['javascript', 'typescript', 'python', 'json', 'bash', 'html', 'css', 'sql', 'markdown'],
});
```

## Building for Production

```bash
npm run build
```

Built files will be in the `dist` directory. Serve with any static file server:

```bash
npm run preview
```

## Troubleshooting

### Connection Issues
- Ensure LM Studio server is running
- Check the correct port (usually 1234)
- Try both `localhost` and `127.0.0.1`
- Verify the model is loaded in LM Studio

### Performance
- For large datasets, the DataTable uses virtualization
- Code blocks automatically collapse when >20 lines
- Chat history is paginated in the sidebar

### Browser Compatibility
- Requires modern browser with ES6+ support
- Uses `fetch()` API and `ReadableStream` for streaming
- No external dependencies needed after build

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AnswerBox.tsx
│   ├── CodeBlock.tsx
│   ├── DataTable.tsx
│   └── MarkdownRenderer.tsx
├── services/           # API and storage services
│   ├── api.ts
│   └── storage.ts
├── types.ts           # TypeScript type definitions
├── App.tsx           # Main application component
└── main.tsx         # Application entry point
```

### Adding New Features
1. Create new components in `src/components/`
2. Add types to `src/types.ts`
3. Update the main `App.tsx` as needed
4. Add any new services to `src/services/`

### Customizing Themes
Modify the CSS variables in `src/index.css` and TailwindCSS configuration in `tailwind.config.js`.

## License

MIT License - feel free to use and modify as needed.

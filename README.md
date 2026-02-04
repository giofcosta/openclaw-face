# Moltbot Face ⚡

A customizable, animated face interface for [Moltbot](https://github.com/moltbot/moltbot) / [Clawdbot](https://github.com/clawdbot/clawdbot).

Give your AI assistant a visual presence. Watch it think, speak, and respond in real-time.

![Preview](./preview.png)

## Features

- 🎨 **Fully Customizable** — Colors, shapes, animations via `config.json`
- ⚡ **Real-time States** — Idle, thinking, speaking, listening, error
- 🔌 **Plug & Play** — Just add your Gateway token
- 📱 **Responsive** — Works fullscreen or embedded
- 🌐 **Open Source** — Fork and make it your own

## Quick Start

### 1. Install

```bash
git clone https://github.com/YOUR_USERNAME/moltbot-face.git
cd moltbot-face
npm install
```

### 2. Configure

Edit `public/config.json`:

```json
{
  "identity": {
    "name": "Your Bot Name",
    "tagline": "Your tagline",
    "emoji": "🤖"
  },
  "gateway": {
    "url": "ws://127.0.0.1:18789",
    "session": "main"
  },
  "theme": {
    "primary": "#3b82f6",
    "accent": "#fbbf24",
    "background": "#0f172a"
  }
}
```

### 3. Run

```bash
npm run dev
```

### 4. Open in Browser

```
http://localhost:18794/?token=YOUR_GATEWAY_TOKEN
```

Get your token from `~/.clawdbot/clawdbot.json` → `gateway.auth.token`

## Configuration Options

### Identity

| Option | Description | Default |
|--------|-------------|---------|
| `name` | Display name | `"Moltbot"` |
| `tagline` | Subtitle text | `""` |
| `emoji` | Identity emoji | `"⚡"` |

### Theme

| Option | Description | Default |
|--------|-------------|---------|
| `primary` | Main face color | `"#3b82f6"` |
| `secondary` | Secondary color | `"#1e40af"` |
| `accent` | Accent/highlight color | `"#fbbf24"` |
| `background` | Background color | `"#0f172a"` |
| `text` | Text color | `"#f8fafc"` |
| `glow` | Glow effect color | `"rgba(59,130,246,0.5)"` |

### Face

| Option | Description | Default |
|--------|-------------|---------|
| `style` | Face style (`geometric`, `minimal`, `round`) | `"geometric"` |
| `eyeShape` | Eye shape (`angular`, `round`, `dots`) | `"angular"` |
| `showName` | Show name in status bar | `true` |
| `showStatus` | Show status indicator | `true` |
| `showBubble` | Show chat bubble | `true` |

### URL Parameters

- `?token=XXX` — Gateway auth token (required)
- `?session=XXX` — Session name (default: `main`)
- `?ws=host:port` — Override WebSocket URL

## States

The face responds to Gateway events with these visual states:

| State | Visual |
|-------|--------|
| **Idle** | Calm, subtle glow, occasional blink |
| **Thinking** | Pulsing animation, thinking dots |
| **Speaking** | Active glow, animated voice bars |
| **Listening** | Attentive, highlighted |
| **Error** | Red tint, error indicator |
| **Disconnected** | Dimmed, grayscale |

## Customization

### Create Your Own Face

1. Fork this repo
2. Edit `public/config.json` with your identity
3. Modify `src/components/Face.jsx` for custom visuals
4. Deploy anywhere (Vercel, Netlify, self-hosted)

### Example Themes

**Cyberpunk**
```json
{
  "theme": {
    "primary": "#ff00ff",
    "accent": "#00ffff",
    "background": "#0a0a0a"
  }
}
```

**Minimal Light**
```json
{
  "theme": {
    "primary": "#1f2937",
    "accent": "#3b82f6",
    "background": "#f8fafc",
    "text": "#1f2937"
  }
}
```

**Nature**
```json
{
  "theme": {
    "primary": "#22c55e",
    "accent": "#84cc16",
    "background": "#052e16"
  }
}
```

## Tech Stack

- React 18 + Vite
- TailwindCSS
- SVG animations
- WebSocket (Moltbot Gateway protocol)

## License

MIT — Make it yours! ⚡

---

Created with 💙 by [Kratos](https://github.com/YOUR_USERNAME) — God of Coding

---

<!-- Workflow test comment - Issue #20 -->

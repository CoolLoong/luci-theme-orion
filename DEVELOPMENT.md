# Development Guide

A comprehensive guide for developing, debugging, and building the Orion theme.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Development Mode (HMR)](#development-mode-hmr)
- [Build Process](#build-process)
- [Debugging](#debugging)
- [OpenWrt Packaging](#openwrt-packaging)
- [Troubleshooting](#troubleshooting)

---

## Project Structure

```
luci-theme-orion/
├── src/                        # Source files
│   ├── main.css               # Main CSS (TailwindCSS + custom styles)
│   ├── menu-orion.js          # Menu JavaScript
│   └── orion.js               # Core theme JavaScript
│
├── public/                     # Static assets (copied as-is)
│   ├── images/                # Images
│   ├── fonts/                 # Font files
│   └── icons/                 # Icon files
│
├── ucode/                      # ucode templates (server-side)
│   ├── template/themes/orion/ # Theme templates
│   └── view/orion/            # Configuration views
│
├── root/                       # System files
│   ├── etc/config/orion       # UCI configuration
│   └── usr/share/luci/menu.d/ # Menu definitions
│
├── htdocs/                     # Build output (generated)
│   └── luci-static/
│       ├── orion/             # Theme files
│       │   ├── orion.css      # Built CSS
│       │   └── resources/     # Static assets
│       └── resources/         # Shared LuCI resources
│           └── menu-orion.js  # Built menu JS
│
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # TailwindCSS configuration
└── package.json               # Dependencies & scripts
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- Bun (recommended for local development) or npm
- Access to an OpenWrt device running LuCI
- Basic knowledge of HTML, CSS, and JavaScript

### Installation

**Local development (with Bun - faster)**:
```bash
# Install Bun if you haven't
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Set up environment variables (optional)
cp .env.example .env
# Edit .env to set your OpenWrt device IP
```

### Environment Variables

Create a `.env` file:

```env
VITE_OPENWRT_HOST=http://192.168.1.1
VITE_DEV_HOST=127.0.0.1
VITE_DEV_PORT=5173
```

---

## Development Mode (HMR)

### Starting the Dev Server

**With Bun (recommended)**:
```bash
bun dev
```

Then visit `http://localhost:5173` in your browser.

### HMR Support Matrix

| File Type | HMR Support | Refresh Required | Location |
|-----------|-------------|------------------|----------|
| CSS | ✅ Full | No | `src/main.css` |
| JavaScript | ✅ Partial | Yes | `src/*.js` |
| Images/Fonts | ✅ Yes | Yes | `public/*` |
| ucode Templates | ❌ No | Server restart | `ucode/template/*` |

### How It Works

#### 1. CSS - Full Hot Reload 🔥

**Location**: `src/main.css`

```
Edit main.css
    ↓
Vite detects change
    ↓
WebSocket notifies browser
    ↓
Browser hot-swaps CSS (no page reload)
```

**Proxy Configuration**:
```typescript
"/luci-static/orion/orion.css" → "/src/main.css"
```

**Testing**:
1. Start dev server: `bun dev`
2. Open browser: `http://localhost:5173`
3. Edit `src/main.css`
4. See changes instantly without refresh

#### 2. JavaScript - Refresh Required 🔄

**Location**: `src/menu-orion.js`, `src/orion.js`

```
Edit JS file
    ↓
Vite serves updated version
    ↓
Refresh browser (F5)
    ↓
New JS takes effect
```

**Proxy Configuration**:
```typescript
"/luci-static/resources/menu-orion.js" → "/src/menu-orion.js"
"/luci-static/orion/resources/js/orion.js" → "/src/orion.js"
```

**Why refresh?**
- LuCI JS runs at page load
- Hot-swapping JS may cause state inconsistencies
- Full page reload ensures clean initialization

#### 3. Static Assets - Refresh Required 🖼️

**Location**: `public/`

```
Browser requests: /luci-static/orion/resources/images/logo.png
    ↓
Vite intercepts request
    ↓
Rewrites to: /public/images/logo.png
    ↓
Returns: public/images/logo.png
```

**Supported Types**:
- Images: `.png`, `.jpg`, `.svg`, `.gif`
- Fonts: `.ttf`, `.woff`, `.woff2`
- Icons: `.svg`, `.ico`

#### 4. ucode Templates - No HMR ❌

**Location**: `ucode/template/`

**Why no HMR?**
- Server-side rendered by LuCI
- Not controlled by Vite
- Requires LuCI service restart

**How to test template changes**:
```bash
# Build and deploy
bun build
scp -r htdocs/luci-static/orion root@192.168.1.1:/www/luci-static/
scp -r ucode root@192.168.1.1:/usr/share/ucode/luci/

# Restart LuCI
ssh root@192.168.1.1 '/etc/init.d/uhttpd restart'
```

---

## Build

**Local development**:
```bash
# Clean + Build
bun build
# Clean only
bun clean
```

### Build Output
```
htdocs/luci-static/
├── orion/
│   ├── orion.css              # Minified CSS
│   └── resources/
│       ├── js/
│       │   └── orion.js       # Minified JS
│       ├── images/            # Copied from public/
│       ├── fonts/             # Copied from public/
│       └── icons/             # Copied from public/
└── resources/
    └── menu-orion.js          # Minified JS
```

### Build Pipeline

```
bun run build  (or npm run build)
    ↓
1. Clean (scripts/clean.js)
   └─ Remove htdocs/ directory
    ↓
2. Vite Build
   ├─ CSS: src/main.css → htdocs/luci-static/orion/orion.css
   ├─ Process TailwindCSS + PostCSS
   └─ Minify with lightningcss
    ↓
3. JS Compress Plugin
   ├─ src/menu-orion.js → htdocs/luci-static/resources/menu-orion.js
   └─ src/orion.js → htdocs/luci-static/orion/resources/js/orion.js
    ↓
4. Static Assets Copy Plugin
   └─ public/* → htdocs/luci-static/orion/resources/*
```

### Vite Configuration

Key plugins in `vite.config.ts`:

1. **TailwindCSS Plugin** - Processes Tailwind directives
2. **JS Compress Plugin** - Minifies JavaScript with Terser
3. **Static Assets Copy Plugin** - Copies public/ to build output
4. **Redirect Plugin** - Dev mode: redirects `/` to `/cgi-bin/luci`

---

## OpenWrt Packaging
### Makefile Build Process

```
make package/luci-theme-orion/compile
    ↓
1. Build/Prepare
   └─ Copy source files to build directory
    ↓
2. Build/Compile
   ├─ npm install --production=false
   └─ npm run build
    ↓
3. Package/Install
   ├─ Install to /www/luci-static/orion/
   ├─ Install to /usr/share/ucode/luci/
   └─ Install to /etc/config/, /etc/uci-defaults/
```

### Files Copied to Build
| Source | Target on OpenWrt |
|--------|-------------------|
| `htdocs/luci-static/orion/*` | `/www/luci-static/orion/` |
| `htdocs/luci-static/resources/*` | `/www/luci-static/resources/` |
| `ucode/view/*` | `/usr/share/rpcd/ucode/luci/` |
| `ucode/template/*` | `/usr/share/ucode/luci/template/` |
| `root/*` | `/` (system root) |

### Manual Installation

**deployment**:
```bash
sshpass -p 'YOUR_PASSWORD' scp -o StrictHostKeyChecking=no luci-theme-orion_0.0.1-r1_all.ipk root@192.168.4.1:/root && sshpass -p 'YOUR_PASSWORD' ssh -o StrictHostKeyChecking=no root@192.168.4.1 'cd /root && opkg install --force-reinstall luci-theme-orion_0.0.1-r1_all.ipk && /etc/init.d/uhttpd restart'
```

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [LuCI Development Guide](https://openwrt.org/docs/guide-developer/luci)
- [ucode Template Syntax](https://ucode.mein.io/)

---
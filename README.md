# Luci Theme Orion - Development Guide

This directory contains the Vite-based development environment for luci-theme-orion with Hot Module Replacement (HMR) support.

## Features

- ✨ **Vite Dev Server** - Fast development with HMR
- 🔥 **Hot Reload** - CSS changes reflect instantly without page reload
- 🎨 **TailwindCSS 4.x** - Latest Tailwind with Vite plugin
- 🔧 **Proxy Server** - Proxies requests to your OpenWrt device
- 📦 **Build Optimization** - Minified CSS and JS for production
- 🧹 **Auto Clean** - Cleans build output before each build

## Prerequisites

- Node.js >= 18.0.0
- Bun >= 1.0.0 (recommended package manager)
- Access to an OpenWrt device running LuCI

## Quick Start

### 1. Install Dependencies

```bash
cd .dev
bun install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your OpenWrt device:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your OpenWrt device IP address
VITE_OPENWRT_HOST=http://192.168.1.1

# Development server host (usually localhost)
VITE_DEV_HOST=127.0.0.1

# Development server port
VITE_DEV_PORT=5173
```

### 3. Start Development Server

```bash
bun dev
```

This will:
- Start Vite dev server at `http://127.0.0.1:5173`
- Enable HMR for CSS files
- Proxy `/cgi-bin` and `/luci-static` requests to your OpenWrt device
- Redirect `/` to `/cgi-bin/luci`

### 4. Access the Development UI

Open your browser and navigate to:

```
http://127.0.0.1:5173
```

You'll be redirected to `/cgi-bin/luci` which will be proxied to your OpenWrt device.

## How It Works

### HMR (Hot Module Replacement)

The development server uses Vite's HMR to instantly reflect CSS changes:

1. Edit any CSS file in `src/media/main.css`
2. Save the file
3. Changes appear instantly in the browser without page reload

### Proxy Configuration

The Vite proxy is configured to:

- Intercept requests to `/luci-static/orion/orion.css`
- Serve the live CSS from `src/media/main.css`
- Proxy all other `/luci-static` and `/cgi-bin` requests to OpenWrt

This allows you to develop the theme while using the actual OpenWrt backend.

## Project Structure

```
.dev/
├── src/
│   ├── media/          # CSS source files
│   │   └── main.css    # Main TailwindCSS file
│   ├── resource/       # JavaScript files
│   │   └── menu-orion.js
│   └── assets/         # Static assets
├── scripts/
│   └── clean.js        # Build cleanup script
├── public/             # Public static files
├── vite.config.ts      # Vite configuration
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## Build for Production

To build optimized assets for production:

```bash
bun build
```

This will:
1. Clean previous build output
2. Build and minify CSS with Lightning CSS
3. Compress JavaScript files with Terser
4. Output files to `../htdocs/luci-static/`

Output structure:
```
../htdocs/luci-static/
├── orion/
│   └── main.css        # Minified CSS
└── resources/
    └── menu-orion.js   # Compressed JS
```

## Scripts

- `bun dev` - Start development server with HMR
- `bun build` - Build for production
- `bun clean` - Clean build output

## Development Tips

### CSS Development

- Edit `src/media/main.css` for all styles
- Use TailwindCSS utility classes
- Custom CSS can be added in the same file
- Changes are reflected instantly via HMR

### JavaScript Development

- Place JS files in `src/resource/`
- Files are automatically compressed during build
- Use ES6+ syntax

### Testing Changes

1. Make changes to CSS/JS files
2. Check browser (CSS changes apply instantly)
3. For JS changes, refresh the page
4. Test on actual OpenWrt device after building

### Troubleshooting

**HMR not working:**
- Check that dev server is running
- Verify `.env` configuration
- Check browser console for errors

**Proxy errors:**
- Ensure `VITE_OPENWRT_HOST` is correct
- Check OpenWrt device is accessible
- Verify firewall allows connections

**Build errors:**
- Run `bun clean` first
- Check file permissions
- Ensure all dependencies are installed

## Template System

The theme uses ucode templates (`.ut` files) located in:

```
../ucode/template/themes/orion/
├── header.ut      # Page header
├── footer.ut      # Page footer
└── sysauth.ut     # Login page
```

Templates use ucode syntax (similar to Jinja2/Twig):
- `{{ variable }}` - Output variable
- `{% if condition %}...{% endif %}` - Conditionals
- `{% for item in items %}...{% endfor %}` - Loops
- `{# comment #}` - Comments

## Contributing

When making changes:

1. Test in development mode first
2. Verify HMR works correctly
3. Build for production and test
4. Check both desktop and mobile layouts
5. Ensure compatibility with OpenWrt LuCI

## License

Apache License 2.0 - See LICENSE file for details
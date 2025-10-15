# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Grand Magus Alistair's Digital Grimoire" is a humorous single-page website featuring a medieval wizard whose "magical" feats are actually mundane modern activities. The site is a self-contained HTML file with embedded CSS and JavaScript, focusing on interactive storytelling through animations, sound effects, and visual effects.

## Development Commands

### Running Locally
```bash
# Start a local server (Python 3)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

Alternatively, simply open `index.html` directly in a web browser for basic testing.

## Architecture & Key Patterns

### Single-File Architecture
The entire application lives in `index.html` (555 lines) with:
- Inline `<style>` block (lines 12-223) containing all CSS
- Inline `<script>` block (lines 328-553) containing all JavaScript
- No build process, bundler, or external dependencies beyond CDN resources

### State Management Pattern
The app uses a simple event-driven model with closures:
- `hasBeenUnsealed` boolean controls the seal reveal animation (line 333)
- `musicPlaying` boolean tracks background music state (line 352)
- No state management library; all state is local variables in the DOMContentLoaded handler

### Key Interactive Features

**Seal Animation System** (lines 389-414):
- Click event on seal triggers a cascading sequence
- Visual animations start immediately (don't wait for audio)
- Audio plays asynchronously with proper error handling
- Uses `Tone.js` for synthesized sound effects

**Typing Effect with Voice Narration** (lines 417-524):
- Queries all `.typing-effect` elements and reveals them sequentially
- Uses Web Speech API for text-to-speech narration
- Critical: Voice loading has complex timing issues - uses promises with 2s timeout
- Falls back gracefully if speech synthesis unavailable
- Staggered 1000ms delay between element reveals

**Accordion Components** (lines 527-550):
- Toggle via dynamic `maxHeight` calculation (not fixed heights)
- Sound effects only play if `Tone.context.state === 'running'`
- Different note sequences for open (C4 → E4) vs close (F3)

### Audio Architecture
Three separate audio systems:
1. **Background Music**: Native HTML5 Audio element with looping MP3 (lines 349-366)
2. **Synthesized Sounds**: Tone.js MembraneSynth and Synth for UI interactions (lines 369-385)
3. **Sampled Audio**: Tone.js Player for parchment unrolling effect (lines 370-374)

All audio requires user interaction to start due to browser autoplay policies. The seal click handler calls `Tone.start()` to initialize audio context.

### CSS Custom Properties
Defined in `:root` (lines 13-18):
- `--parchment`, `--ink`, `--ornament`, `--border-gold`
- Used throughout for consistent theming

### Visual Effects System
**Particle Animation** (lines 157-190):
- 25 fixed-position particles created dynamically (lines 336-346)
- Pure CSS animations with staggered durations/delays
- Particles use `nth-child` selectors for variation

**Parallax Scrolling** (lines 130-139):
- `background-attachment: fixed` on `.hero-banner`
- Creates depth effect during scroll

## Important Implementation Details

### Image Handling
- Local images in `/images/` directory for main content
- External Imgur URLs for wizard card portraits (lines 270, 276, 282, 288)
- All images have `onerror` fallbacks to placeholder services

### Browser Compatibility Considerations
- Speech Synthesis API availability check: `'speechSynthesis' in window` (line 423)
- Tone.js context state checks before playing sounds
- Audio play wrapped in try-catch blocks
- Extensive console logging for debugging voice/audio issues

### Responsive Design
- Tailwind CSS via CDN for utility classes
- Mobile-first approach with breakpoints at 768px (lines 66-69)
- Container with `max-w-4xl` constrains content width

## Theming & Styling Conventions

- Medieval aesthetic with parchment texture overlay (line 23)
- Custom cursor using SVG data URI (line 27) - quill pen design
- Border colors consistently use `var(--border-gold)`
- All interactive elements have hover states with transform/shadow effects
- Transitions use cubic-bezier for more natural "medieval" feel (line 41)

## Content Structure

The grimoire content follows this hierarchy:
1. Hero banner with title and tagline
2. Biography section (Alistair's introduction)
3. First accordion: "A Word On My 'Peers'" - 4 wizard cards in 2x2 grid
4. Second accordion: "Chronicles from 1337" - blog-style entries
5. Footer with copyright notice

## Tech Stack Notes

- **Tailwind CSS**: Via CDN (v3), only used for layout utilities (grid, flexbox, spacing)
- **Tone.js**: v14.7.77 for Web Audio API abstraction
- **MedievalSharp Font**: Google Fonts, defines entire typography
- No transpilation, polyfills, or build tools required

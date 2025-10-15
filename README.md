# Grand Magus Alistair's Digital Grimoire

A humorous medieval wizard-themed website featuring Grand Magus Alistair, who claims to be one of the five most powerful wizards but whose "magical" adventures are really just mundane modern activities.

## Features

### Interactive Elements
- **Seal Animation**: Click the Seal of Alistair to reveal the grimoire content
- **Typing Animation**: Text appears with a typewriter effect
- **Voice Narration**: Web Speech API narration (when available in browser)
- **Accordion Sections**: Collapsible sections for wizard stories and peer reviews

### Visual Effects
- **Parchment Theme**: Beige/brown/gold medieval aesthetic
- **Parallax Scrolling**: Fixed background creates depth effect
- **Particle Effects**: 25 floating golden sparkles for magical atmosphere
- **Custom Cursor**: Medieval quill pen-style cursor
- **Smooth Transitions**: Enhanced hover effects and animations

### Audio Features
- **Background Music**: Toggle medieval ambient music
- **Sound Effects**:
  - Seal click sound (two-note chime)
  - Accordion open/close sounds
  - Parchment unrolling effect

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [Tone.js](https://tonejs.github.io/) for audio synthesis
- [MedievalSharp](https://fonts.google.com/specimen/MedievalSharp) font from Google Fonts

## Project Structure

```
wizard-grimoire/
├── index.html          # Main HTML file with embedded CSS/JS
└── images/
    ├── wizard-tower-new.jpg    # Hero background image
    ├── old-books-new.jpg       # Ancient grimoire image
    └── mystical-new.jpg        # Mystical artifacts image
```

## Local Development

Simply open `index.html` in a web browser, or use a local server:

```bash
# Python 3
python3 -m http.server 8000

# Then visit http://localhost:8000
```

## The Humor

The site parodies fantasy wizard tropes by revealing that Alistair's "grand magical feats" are actually:
- **Hydro-mancy**: Using a power washer
- **Percolation spell**: Making coffee
- **Scrying mirror**: A cell phone
- **Iron Beast**: His Honda
- **Quest for mystic herbs**: Shopping at "Shop & Save"

His fellow wizards are equally mundane:
- Bartholomew the Beast-Talker (leaves peanuts for squirrels)
- Seraphina the Shadow (wears a ghillie suit)
- Finneas the Flood-Caller (pressure washing service)
- Ignatius the Inferno (lighter fluid enthusiast)

## License

MIT License - Feel free to use and modify as you wish.

# Solve-to-Scroll 🚀
> *Earn your scroll.*

**Solve-to-Scroll** is a premium Chrome extension (Manifest V3) that blocks distracting websites (Instagram, YouTube, Reddit, X/Twitter, etc.) and requires you to answer short, high-yield Data Structures & Algorithms (DSA) concept questions before unlocking access for a timed session.

100% offline. No accounts, no network calls, zero tracking.

---

## ⚡ Key Highlights
- **Tactile, Aesthetic UI**: Deep dark canvas (`#0A0A12`), glowing purple-pink-amber gradient borders, ambient drifting glow, soft noise texture, and 60fps spring feedback.
- **6 Diverse Question Formats**:
  1. `mcq`: Multiple choice concept questions.
  2. `code_output`: Code snippets with line numbers & syntax highlighting (C++, Python, Java, JS).
  3. `spot_bug`: Locate algorithmic and boundary bugs.
  4. `complexity`: Big-O time and space complexity evaluations.
  5. `visual_mcq`: Graphic diagram-based questions (LCA in trees, connected components).
  6. `hotspot`: Interactive SVG diagrams where you tap the flawed node or broken pointer.
- **Adaptive Difficulty Engine**:
  - Baseline level (Beginner / Intermediate / Expert).
  - Real-time difficulty tuning per topic (2 correct in a row levels up; 1 wrong levels down).
  - Topic weights prioritize weaker areas.
  - Spaced repetition queue re-surfaces missed questions until mastered.
- **DeclarativeNetRequest MV3 Blocking**:
  - Main-frame dynamic redirect rules redirect blocked sites to `blocked.html`.
  - Timer alarms (`chrome.alarms`) re-lock sites and redirect active tabs when the timer expires.
  - Full wake-reconciliation handles browser restarts and service worker sleep seamlessly.

---

## 🛠️ Project Structure
```
solve-to-scroll/
├── dist/                     # Production build ready to load in Chrome
│   ├── manifest.json
│   ├── background.js
│   ├── blocked.html
│   ├── onboarding.html
│   ├── popup.html
│   ├── dashboard.html
│   ├── icons/
│   ├── fonts/
│   └── assets/
├── public/
│   ├── icons/                # High-res icons (16, 32, 48, 128)
│   ├── fonts/                # Local bundled Plus Jakarta Sans & JetBrains Mono
│   └── manifest.json
├── src/
│   ├── background/
│   │   └── background.ts     # Service worker: DNR rules, alarms, tab redirects
│   ├── components/
│   │   ├── CodePanel.tsx     # Window dots, line numbers, syntax highlighting
│   │   ├── OptionTile.tsx    # 2x2 tactile tiles with keyboard shortcuts (1-4, Enter)
│   │   ├── HotspotDiagram.tsx# Interactive SVG diagrams with tap targets
│   │   ├── VisualDiagram.tsx # SVG visualizations for diagrams
│   │   ├── ExplanationSheet.tsx # Slide-up explanations
│   │   ├── StreakFlame.tsx   # Glowing flame streak counter
│   │   ├── TimerRing.tsx     # Circular countdown ring
│   │   ├── LevelCard.tsx     # Level selector
│   │   └── Confetti.ts       # Canvas confetti celebrations
│   ├── engine/
│   │   ├── adaptive.ts       # Level mixes & difficulty boundaries
│   │   ├── scoring.ts        # Option shuffling & evaluation
│   │   └── selectQuestion.ts # Topic weighting & spaced repetition
│   ├── data/
│   │   └── questions.json    # Verified DSA question bank
│   ├── lib/
│   │   ├── storage.ts        # Typed chrome.storage wrapper & fallback
│   │   ├── sites.ts          # Preset websites & host permission handler
│   │   ├── SoundEffects.ts   # Web Audio API offline sound synthesizer
│   │   └── shareCard.ts      # Canvas PNG social share card generator
│   ├── pages/
│   │   ├── blocked/          # Core quiz screen
│   │   ├── onboarding/       # 4-step first run wizard
│   │   ├── popup/            # Quick toolbar controls
│   │   └── dashboard/        # Heatmap, mastery bars, settings
│   └── styles/
│       └── tokens.css        # Design tokens, keyframes, typography
├── scripts/
│   ├── generate-icons.js     # Native PNG icon builder
│   └── package.js            # Zip packager
├── solve-to-scroll.zip       # Packaged extension archive
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📦 How to Install in Chrome

1. Open Google Chrome.
2. In the URL bar, navigate to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the **`dist`** folder inside:
   ```
   C:\Users\Dhiti\.gemini\antigravity\scratch\solve-to-scroll\dist
   ```
   *(Alternatively, unzip `solve-to-scroll.zip` into any folder and load that folder)*.
6. The extension is now active! The onboarding setup page will automatically open on first install.

---

## 🎮 How to Test

1. **Onboarding**:
   - Walk through the 4 steps: Welcome → Focus Topics → Level & 3-Question Placement → Blocked Sites & Timer.
2. **Try Navigating to a Blocked Site**:
   - Open a new tab and go to `https://www.instagram.com` or `https://www.youtube.com`.
   - You will immediately land on `blocked.html` with your DSA question challenge!
3. **Solve the Question**:
   - Use your mouse or press `1`, `2`, `3`, or `4` on your keyboard, then press `Enter`.
   - For hotspot questions, tap the erroneous node or broken pointer.
   - For code output, review the highlighted snippet in the dark macOS code window.
4. **Unlock & Scroll**:
   - When solved, enjoy the confetti and click **"Take me to {Site}"**.
   - Your site is now unlocked for your chosen duration (e.g. 10 minutes).
5. **Popup & Dashboard**:
   - Click the extension icon in Chrome's toolbar to see remaining unlock time or lock now.
   - Click **"Open Dashboard"** to view your GitHub-style activity heatmap, mastery bars, weak spots, and download your canvas share card.

---

## 💡 Adding More Questions
All questions live in [`src/data/questions.json`](src/data/questions.json). You can add more questions at any time without touching TypeScript code:

```json
{
  "id": "arr-100",
  "topic": "arrays",
  "level": "intermediate",
  "difficulty": "medium",
  "type": "code_output",
  "prompt": "What is the output of this operation?",
  "language": "python",
  "code": "nums = [1, 2, 3]\nprint(nums * 2)",
  "options": ["[2, 4, 6]", "[1, 2, 3, 1, 2, 3]", "Error", "[[1, 2, 3], [1, 2, 3]]"],
  "answer": 1,
  "explanation": "Multiplying a Python list by an integer concatenates it that many times.",
  "tags": ["python", "basics"]
}
```

Then simply rebuild with `npm run build`.

#  Solve-to-Scroll
<p align="center">
  <strong>Earn your scroll. Transform doomscrolling into daily algorithmic mastery.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-7C5CFF?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Privacy-100%25_Offline-3DDC97?style=for-the-badge&logo=shield&logoColor=white" alt="Offline" />
</p>

---

##  The Premise

Every time you open **Instagram**, **YouTube**, **X/Twitter**, or **Reddit**, you lose 30+ minutes down an algorithmic rabbit hole.

**Solve-to-Scroll breaks the dopamine loop:**
Instead of brute-force willpower, it places a lightweight, beautifully designed gatekeeper in front of distracting sites. To unlock **10 minutes** of browsing, you must solve **1 to 3 quick DSA concept questions**.

>  **Each unlock takes ~20 seconds.** You learn something new, protect your focus, and build an unbreakable daily streak.

---

##  The 3-Step Core Loop

```
  ┌───────────────────┐       ┌───────────────────────┐       ┌───────────────────┐
  │   1. Attempt to   │  ──▶  │   2. Solve 1-3 Quick  │  ──▶  │   3. Enjoy Timed  │
  │   Open Instagram  │       │     DSA Questions     │       │    Scroll Session │
  └───────────────────┘       └───────────────────────┘       └───────────────────┘
                                   • Hotspot taps                  • 10:00 Timer Ring
                                   • Code output                   • Confetti Burst
                                   • Complexity / MCQ              • Auto-relocks on expiry
```

---

##  Features That Set It Apart

###  1. Dark, Glowing, Tactile Interface
- Designed with a bespoke **midnight palette** (`#0A0A12`), glowing purple-pink-amber gradient accents, and subtle animated background blobs.
- **Synthesized Web Audio**: Crisp, tactile audio chimes (built directly with Web Audio API—no audio files, 100% offline).
- **Keyboard-First Navigation**: Press `1`–`4` to pick options and `Enter` to submit.

###  2. Six High-Yield Question Formats
No dry LeetCode text dumps. Every question tests fundamental computer science intuition:
1. **Interactive Hotspot Diagrams**: Tap directly on an SVG node or pointer (e.g., tap the broken pointer in a linked list deletion or the node violating BST properties).
2. **Code Output**: Syntax-highlighted code blocks with line numbers in a dark macOS window.
3. **Spot the Bug**: Identify boundary errors and missing pointer updates.
4. **Time & Space Complexity**: Big-O analysis and Master Theorem evaluations.
5. **Visual Diagrams**: Tree Lowest Common Ancestor (LCA) and graph connectivity questions.
6. **Multiple Choice (MCQ)**: Core conceptual fundamentals.

###  3. Smart Adaptive Difficulty Engine
- **Profile Baselines**: Pick **Beginner**, **Intermediate**, or **Expert** at onboarding (with an optional 3-question placement check).
- **Dynamic Tuning**: 2 correct answers in a row levels a topic up; 1 wrong answer moves it down.
- **Topic Weighting**: Spends more time on your weakest areas.
- **Spaced Repetition (`wrongQueue`)**: Re-surfaces missed questions until mastered.

###  4. 100% Private & Fully Offline
- Zero external network requests.
- No accounts, no sign-ups, and no analytics tracking.
- Everything runs strictly within `chrome.storage.local` and your browser's background service worker.

---

##  Analytics & Social Share Card

- **16-Week GitHub Heatmap**: Visualizes your daily solved question count.
- **Topic Mastery Bars**: Tracks accuracy and current difficulty level across Arrays, Linked Lists, Trees, Stacks, Queues, Sorting, and Big-O.
- **One-Click PNG Share Card**: Automatically generates a high-resolution 1200×630 shareable graphic directly on an HTML5 canvas to showcase your streak on LinkedIn or X/Twitter.

---

##  Quickstart Installation (Load in 30 Seconds)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/solve-to-scroll.git
   ```
2. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer mode** (toggle in the upper-right corner).
4. Click **Load unpacked** (top-left button).
5. Select the **`dist`** folder inside this repository:
   ```
   Solve-to-Scroll/dist
   ```
6. The onboarding setup will automatically launch. Set your preferences and start scrolling smarter!

---

##  Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Extension Standard** | Chrome Manifest V3 (MV3), Service Worker |
| **Traffic Interception** | `chrome.declarativeNetRequest` dynamic rules & `chrome.alarms` |
| **Frontend Framework** | React 18, TypeScript, Tailwind CSS |
| **Build Tooling** | Vite (Multi-page HTML entry architecture) |
| **Visuals & Polish** | Lucide Icons, Canvas Confetti, JetBrains Mono & Plus Jakarta Sans |
| **Sound System** | Pure Web Audio API Synthesizer (0 external audio dependencies) |

---

##  Adding New Questions

All questions are decoupled from code and stored in [`src/data/questions.json`](src/data/questions.json). To add a new question:

```json
{
  "id": "arr-101",
  "topic": "arrays",
  "level": "intermediate",
  "difficulty": "medium",
  "type": "code_output",
  "prompt": "What does this snippet print?",
  "language": "python",
  "code": "nums = [1, 2, 3]\nprint(nums * 2)",
  "options": ["[2, 4, 6]", "[1, 2, 3, 1, 2, 3]", "Error", "[[1, 2, 3], [1, 2, 3]]"],
  "answer": 1,
  "explanation": "Multiplying a list by an integer duplicates its elements.",
  "tags": ["python", "arrays"]
}
```

Run `npm run build` to package the updated question bank.

---

<p align="center">
  Made with  to help engineers master algorithms and conquer screen time.
</p>

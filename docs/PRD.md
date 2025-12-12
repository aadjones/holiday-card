# **PRD: Interactive Holiday Card — “The Cats Keep Interrupting”**

## **Overview**

Build a lightweight, mobile-friendly, single-page interactive holiday card presented as a vertical scroll-snap experience. The card summarizes major milestones from our year in a warm, sincere tone, while our two cats periodically interrupt the presentation in cute, low-chaos ways (walking across the screen, blocking content, sleeping on UI elements, etc.).

The experience should feel:

* cozy

* legible

* gently funny

* intentionally imperfect

This is **not** an art installation or a game. It is a holiday card with personality.

---

## **Goals**

* Create a sharable URL that works well on mobile and desktop

* Tell a coherent year-in-review story in \~8 scroll-snap sections

* Use simple, illusion-based “animations” (movement, scale, layering)

* Keep scope small and execution reliable

* Finish and ship

---

## **Non-Goals**

* No realistic animation (no moving legs, physics, or rigging)

* No heavy JS frameworks or animation libraries

* No complex interactivity or branching logic

* No audio autoplay with sound on (must be polite)

* No performance-heavy effects or generative visuals

---

## **Technical Constraints**

* Single-page site

* Vertical scroll with CSS `scroll-snap`

* Full viewport-height sections

* Minimal JavaScript (class toggles, scroll triggers)

* Assets are static images (PNG/JPG) and optional short MP4 loops

* All animations must work with still images only

---

## **Page Structure**

### **Global Layout**

* `body` with vertical scroll

* Each section is `100vh`

* `scroll-snap-type: y mandatory`

* Each section: `scroll-snap-align: start`

---

## **Sections (Scroll-Snap Pages)**

### **1\. Intro**

**Title:** “How was our 2025?”

* Warm, centered photo of us \+ cats

* Gentle intro text

* Cat enters late and walks across the bottom of the screen

**Cat Interaction:**  
 Cat image translates horizontally across the viewport, briefly obscuring text.

---

### **2\. Big Change**

**Title:** “We quit some jobs.”

* Simple text \+ minimal visual

* Calm, honest tone

**Cat Interaction:**  
 Cat nudges or misaligns one key word (e.g. “scary”) slightly off-center.

---

### **3\. Travel**

**Title:** “We went places.”

* 1–2 travel photos

* No locations listed

**Cat Interaction:**  
 Cat sits on top of the photo (layered above it), partially blocking it like a warm laptop.

---

### **4\. Learning**

**Title:** “We did some school.”

* Visual: notebook, screen, or class-related image

**Cat Interaction:**  
 Sudden zoom-in to an extreme close-up of a cat face (nose/eye fills the screen), then snap back.

---

### **5\. Making**

**Title:** “We built things.”

* Screenshots, sketches, or project visuals

**Cat Interaction:**  
 Cat “helps” by slightly rotating or misaligning a visual or caption.

---

### **6\. Music**

**Title:** “We made music.”

* Visual: piano, waveform, or short silent video clip

**Cat Interaction:**  
 Cat blocks the most important UI element (e.g. play button, caption, waveform).

---

### **7\. Home**

**Title:** “We spent a lot of time at home.”

* Cozy domestic image

**Cat Interaction:**  
 Cat curls up and “falls asleep” on top of the text or image. Subtle breathing effect via slow scale animation.

---

### **8\. Closing**

**Title:** None (just text)

Text:

“We’re grateful for this year, and for you.”

**Final Cat Interaction:**  
 Tiny final interference:

* a tail flick

* a word gently nudged

* optional text change: “grateful” → “grateful (and fed)”

End cleanly. No extra jokes.

---

## **Cat Interaction Rules**

* **One cat action per section, max**

* Cats never fully “break” the page

* Card always regains composure

* Cats are not aware of the viewer or the card

* All motion is slow, minimal, and deliberate

---

## **Animation Guidelines**

Allowed techniques:

* `transform: translate / scale / rotate`

* opacity changes

* z-index layering

* CSS keyframes or transitions

* small delays via JS

Disallowed:

* character animation

* physics engines

* fast or chaotic motion

* loud glitch effects

Rule of thumb:

If it feels like a sticker being politely dragged across the page, it’s correct.

---

## **Assets Required**

### **Required**

* 1 intro photo (us \+ cats)

* 3–5 cat images (PNG or sticker-style preferred)

* 4–6 milestone images

* Web-safe fonts

* Optional ambient audio loop (off by default)

### **Optional**

* 1–2 short looping MP4 clips

* Subtle shadow assets

---

## **Accessibility & UX**

* Works with mouse, trackpad, and touch

* No required clicks to progress

* Scroll is the only navigation

* Text always readable (cats may obscure briefly, never permanently)

* No instructions or “scroll” labels

---

## **Success Criteria**

* Loads quickly

* Scroll-snap feels natural, not aggressive

* Each section reads clearly in isolation

* Cat interactions land as “cute interruptions,” not bugs

* Someone can watch half of it and still enjoy it

---

## **Shipping Criteria**

* All 8 sections implemented

* At least one cat interaction fully working

* No console errors

* Deployed to a stable URL


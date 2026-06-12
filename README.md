# sprout-game 🌱

A small shape-matching game I built for kids around 3–5 years old.

## What's the idea

Each round a different animal shows up and it "loves" one particular shape. The child has to find it from a shuffled grid of 5. Tap the right one — stars fly, the animal bounces, a little sound plays. Tap the wrong one — the button shakes a bit, try again, no score penalty.

5 rounds total. Score screen at the end with a play again button.

## Why I built it this way

Kept it to a single screen on purpose. No routing, no state library, nothing extra. Sounds use the Web Audio API so there's no audio file to load — just generates a tone on the fly. Animations are all CSS keyframes.

Wanted it to feel snappy even on a mid-range Android, so nothing is blocking the main thread.

## Stack

- React
- Web Audio API
- CSS animations
- GitHub Pages

## Run locally

```bash
npm install
npm start
```

## Live

https://swatantra-srivastav.github.io/sprout-game/

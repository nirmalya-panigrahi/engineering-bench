# Engineering Benches

![Status](https://img.shields.io/badge/status-active-1F4E79)
![HTML5](https://img.shields.io/badge/HTML5-self--contained-8A5A2B)
![Zero%20Frameworks](https://img.shields.io/badge/frameworks-none-3B3A38)
![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20JSDOM-1F4E79)
![Deployment](https://img.shields.io/badge/deploy-GitHub%20Pages-B5543C)

An antique engineer's drawing folio category landing page introducing four browser-based engineering workbenches. Built as a single self-contained HTML file with inline CSS, inline SVG technical drawings, and lightweight vanilla JavaScript.

## Included Workbenches

| Plate | Tool | Description | Live Bench |
| :--- | :--- | :--- | :--- |
| **Plate I** | Structural Engineering Bench | Structural engineering analysis workbench. | [Open Bench](https://nirmalya-panigrahi.github.io/Structural-Engineering-Bench/) |
| **Plate II** | Process Engineering Bench | Process engineering calculation workbench. | [Open Bench](https://nirmalya-panigrahi.github.io/Process-Engineering-Bench/) |
| **Plate III** | Control Engg Bench | Control systems engineering workbench. | [Open Bench](https://nirmalya-panigrahi.github.io/Control-Engg-Bench/) |
| **Plate IV** | Circuit Bench Lab | Electronic and electrical circuit lab. | [Open Bench](https://nirmalya-panigrahi.github.io/Circuit-Bench-Lab/) |

## Architecture

```mermaid
flowchart TB
    A[index.html Self-Contained Folio] --> B[Title Block Header & Theme Switch]
    A --> C[Hero Drafting Instruments SVG]
    A --> D[Index of Plates with Dotted Leaders]
    D -->|Anchor Jump| E[2x2 Drafting Plates Grid]
    E --> P1[Plate I: Structural Truss SVG]
    E --> P2[Plate II: Process Vessel & Valves SVG]
    E --> P3[Plate III: Control Loop & Flyball Governor SVG]
    E --> P4[Plate IV: RLC Circuit & Trace SVG]
    P1 -->|External Link| L1[Structural-Engineering-Bench]
    P2 -->|External Link| L2[Process-Engineering-Bench]
    P3 -->|External Link| L3[Control-Engg-Bench]
    P4 -->|External Link| L4[Circuit-Bench-Lab]
    A --> V[Vanilla JS Progressive Enhancement]
    V --> V1[IntersectionObserver Stroke Reveal]
    V --> V2[Lamplit / Daylight Theme Persistence]
```

## Local Setup & Verification

```bash
# Install dev/build dependencies
npm install --legacy-peer-deps

# Start local dev server on port 3000
npm run dev

# Run automated unit & DOM integration tests
npm test

# Build static production output into dist/
npm run build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm test` and `npm run build` on Node.js 22 and publishes `dist/` to GitHub Pages.

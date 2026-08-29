---
type: "query"
date: "2026-08-26T17:38:54.113638+00:00"
question: "Why does E4 Control-Room Dashboard bridge five separate communities?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["E4 Control-Room Dashboard", "F4.10 Road Connectivity Graph", "F4.2 MapLibre Hazard Map", "F4.15 Mode Switch LIVE/BACKTEST/SIM"]
---

# Q: Why does E4 Control-Room Dashboard bridge five separate communities?

## Answer

Expanded from original query via vocab: [control, room, dashboard]. Then traversed neighbors of docs_features_e4_dashboard (degree 17, community 1). All 17 edges are EXTRACTED 'implements' relations from FEATURES.md to its constituent F4.x features. The bridging is structural, not ambiguous: E4's 17 children are topically scattered across 6 communities because community detection clusters by subject matter, not by epic membership — F4.10 (Road Connectivity Graph) clusters with Roads/Villages/Connectivity (comm 12), F4.2 (MapLibre Hazard Map) clusters with Terrain Data (comm 11), F4.15 (Mode Switch) clusters with Backtest & Scenario Simulation (comm 5), F4.13 (Scar Detection Viewer) clusters with Field App Features (comm 9), and F4.12/F4.17 (Field Report Stream, Ask SANKET) cluster with Dashboard UI & PharmaBoard Reuse (comm 0). The remaining 11 children stay in E4's own community (comm 1, Dashboard Widgets & Live API). This reflects that the dashboard is the single screen where every other subsystem (connectivity, CV, backtesting, terrain, reuse) becomes visible to the user — not a graph extraction error.

## Outcome

- Signal: useful

## Source Nodes

- E4 Control-Room Dashboard
- F4.10 Road Connectivity Graph
- F4.2 MapLibre Hazard Map
- F4.15 Mode Switch LIVE/BACKTEST/SIM
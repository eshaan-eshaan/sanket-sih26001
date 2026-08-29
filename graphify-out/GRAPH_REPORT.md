# Graph Report - SANKET-SIH26001  (2026-08-26)

## Corpus Check
- Corpus is ~35,767 words - fits in a single context window. You may not need a graph.

## Summary
- 245 nodes · 285 edges · 44 communities (16 shown, 28 thin omitted)
- Extraction: 88% EXTRACTED · 11% INFERRED · 1% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.88)
- Token cost: 298,106 input · 0 output

## Community Hubs (Navigation)
- Dashboard UI & PharmaBoard Reuse
- Dashboard Widgets & Live API
- External Data Sources & Alerts
- Prediction Engine & Rainfall Threshold
- Data Ingestion Pipeline
- Backtest & Scenario Simulation
- Computer Vision Field Modules
- CV-2 Satellite Scar Segmentation
- Hazard Fusion & Safety Boundaries
- Field App Features & Cut List
- Project Documents
- Terrain Data & Hazard Map
- Roads, Villages & Connectivity
- Architecture Decisions Registry
- Field User Journey
- Faculty Dataset Questions
- CV Confidence Gate Loop
- Regional Threshold Conflicts
- Risks & Limitations
- Team Timeline Revision
- Docker Deployment
- Dashboard Build Order
- Hazard Colour Scale
- Language Priority Order
- CAS Landslide Dataset
- Census Population Data
- Sentinel-2 Imagery Source
- Darjeeling Threshold Study
- ERA5 Weather Archive
- Kalimpong Threshold Study
- OSM Road Network Data
- Blocked Inputs List
- Not-Done Status List
- Open-Meteo Access Assumption
- Sentinel-2 Access Assumption
- PRD Open Questions
- Reactive Response Problem
- v1.0 Release Scope
- PRD Risk Table
- State DMA Persona
- Demo Script Structure
- Focus District Selection
- PS Requirement Traceability
- Scaling Story

## God Nodes (most connected - your core abstractions)
1. `PharmaBoard/DoneHai Reuse Audit` - 19 edges
2. `E4 Control-Room Dashboard` - 17 edges
3. `SANKET (Landslide Early Warning System)` - 11 edges
4. `Stage A Static Susceptibility` - 10 edges
5. `Success Metrics Table` - 9 edges
6. `E1 Data Ingestion & Geospatial Foundation` - 8 edges
7. `E2 AI/ML Prediction Engine` - 8 edges
8. `Feature Cut List (Ordered)` - 8 edges
9. `SANKET Project Handoff` - 7 edges
10. `CV-1 Field-Report Triage` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Noney 2022 Backtest` --semantically_similar_to--> `Spatial Cross-Validation (verde.BlockKFold)`  [INFERRED] [semantically similar]
  README.md → docs/ml-research.md
- `Severity Estimation (Ordinal Classification)` --semantically_similar_to--> `CV-3 Road-Blockage & Connectivity Assessment`  [INFERRED] [semantically similar]
  docs/ml-research.md → README.md
- `CLIP Zero-Shot + Linear Probe Approach` --references--> `CV-1 Field-Report Triage`  [EXTRACTED]
  docs/ml-research.md → README.md
- `G3 Citizen Photos to Triaged Intelligence` --references--> `CV-1 Field-Report Triage`  [INFERRED]
  docs/PRD.md → README.md
- `Stage A Static Susceptibility` --references--> `GSI Bhukosh + NLSM`  [EXTRACTED]
  README.md → docs/data-sources.md

## Hyperedges (group relationships)
- **Computer Vision Mandatory Pillar (CV-1..CV-4)** — readme_cv1_field_report_triage, readme_cv2_satellite_scar_segmentation, readme_cv3_road_blockage, readme_cv4_crack_progression [EXTRACTED 1.00]
- **LIVE/BACKTEST/SIM Mode-Switch Pattern** — docs_dashboard_spec_mode_switch, docs_architecture_shadow_table, readme_backtest_noney_2022, readme_scenario_mode [INFERRED 0.85]
- **Closed CV Learning Loop (Signature Feature)** — readme_cv2_satellite_scar_segmentation, docs_features_f3_4, readme_stage_a_susceptibility, docs_architecture_confidence_gate, docs_architecture_learning_loop [EXTRACTED 1.00]

## Communities (44 total, 28 thin omitted)

### Community 0 - "Dashboard UI & PharmaBoard Reuse"
Cohesion: 0.08
Nodes (28): POST /ask, AiCustomWidget.jsx, Control Room View (/), Field View Offline Mechanics, Widget: Ask SANKET, Widget: Field Report Stream, Widget: Road Connectivity Graph, F4.12 Field Report Stream (+20 more)

### Community 1 - "Dashboard Widgets & Live API"
Cohesion: 0.08
Nodes (27): GET /zones/{id}/explain, WS /live, AnomalyBar.jsx, KPICard.jsx, Widget: Alert Log / CAP Feed, Widget: 5-Day Risk Forecast, Widget: KPI Row, Widget: Rainfall vs I-D Threshold (+19 more)

### Community 2 - "External Data Sources & Alerts"
Cohesion: 0.09
Nodes (24): alerts table, Bhashini, ISRO Bhuvan CartoDEM, Blockers Ranked by Risk, Copernicus DEM GLO-30, Google Earth Engine, GSI Bhukosh + NLSM, IMD (India Meteorological Department) (+16 more)

### Community 3 - "Prediction Engine & Rainfall Threshold"
Cohesion: 0.12
Nodes (23): Calibrated NE Himalaya I-D Threshold, Shadow Table Pattern (BACKTEST/SIM Isolation), zones table, Guwahati Threshold (I=5.9*D^-0.479), NE Himalaya I-D Threshold (I=5.8294*D^-0.4141), E2 AI/ML Prediction Engine, F2.1 Stage A Susceptibility Model, F2.2 Spatial Cross-Validation + Honest Metrics (+15 more)

### Community 4 - "Data Ingestion Pipeline"
Cohesion: 0.10
Nodes (21): Ingestion Adapters Layer (Layer 2), landslide_inventory table, moisture_obs table, weather_obs table, NASA GPM IMERG, NASA SMAP L3/L4, Open-Meteo, E1 Data Ingestion & Geospatial Foundation (+13 more)

### Community 5 - "Backtest & Scenario Simulation"
Cohesion: 0.15
Nodes (14): GET /backtest, POST /scenario, Mode Switch (LIVE/BACKTEST/SIM), Widget: Scenario Panel, E7 Scenario, Validation & Trust, F4.15 Mode Switch LIVE/BACKTEST/SIM, F7.1 Backtest Harness, F7.2 Scenario Simulator (+6 more)

### Community 6 - "Computer Vision Field Modules"
Cohesion: 0.21
Nodes (14): field_reports table, E3 Computer Vision (Mandatory Pillar), F3.1 CV-1 Field-Report Classifier, F3.2 CV-1b Report Integrity, F3.5 CV-3 Road Blockage Detection, F3.6 CV-4 Crack Progression, Severity Estimation (Ordinal Classification), G3 Citizen Photos to Triaged Intelligence (+6 more)

### Community 7 - "CV-2 Satellite Scar Segmentation"
Cohesion: 0.20
Nodes (12): Landslide4Sense 2022 Dataset, F3.3 CV-2 Satellite Scar Segmentation, ML/CV Go/No-Go Table, CLIP Zero-Shot + Linear Probe Approach, CV-2 Training Recipe (U-Net++/ResNet-50), Landslide4Sense Competition Results, BCE(pos_weight=25)+Dice Loss, Official Per-Band Normalisation Constants (+4 more)

### Community 8 - "Hazard Fusion & Safety Boundaries"
Cohesion: 0.22
Nodes (11): Hazard Computation Formula (H = S·f(E) + w1M + w2C), Hysteresis on Hazard Transitions, Never Auto-Evacuate Safety Boundary, NASA LHASA, F5.3 Offline Queue (IndexedDB + Background Sync), NASA LHASA Benchmark (Handoff ref), Hazard Fusion Lookup Matrix, LHASA Decision-Tree Recipe (+3 more)

### Community 9 - "Field App Features & Cut List"
Cohesion: 0.22
Nodes (10): Widget: Scar Detection Viewer, Feature Cut List (Ordered), E5 Field App, F2.8 Nightly Retraining Pipeline, F4.13 Scar Detection Before/After Viewer, F5.1 Risk Banner, F5.2 Photo Report Capture, F5.4 Cached Basemap Tiles (+2 more)

### Community 10 - "Project Documents"
Cohesion: 0.57
Nodes (8): SANKET Architecture Doc, SANKET Dashboard Specification, SANKET Data Source Availability Report, SANKET Feature Catalogue, SANKET Project Handoff, SANKET ML/CV Research, SANKET PRD, SANKET README

### Community 11 - "Terrain Data & Hazard Map"
Cohesion: 0.29
Nodes (7): terrain_features table, GET /zones, Widget: Hazard Map, F1.1 Terrain Derivative Pipeline, F4.2 MapLibre Hazard Map, Critical Path, WhiteboxTools

### Community 12 - "Roads, Villages & Connectivity"
Cohesion: 0.40
Nodes (5): roads table, villages table, F1.7 Exposure Layers, F4.10 Road Connectivity Graph, G4 Show Connectivity Impact

### Community 13 - "Architecture Decisions Registry"
Cohesion: 0.67
Nodes (3): Architecture Decisions Log, Six-Layer System Architecture, Locked Decisions Registry

### Community 14 - "Field User Journey"
Cohesion: 0.67
Nodes (3): Field View (/field), J5 Am I Safe, U3 Field Officer / Village Volunteer

### Community 15 - "Faculty Dataset Questions"
Cohesion: 0.67
Nodes (3): Open Questions (Today), Faculty Dataset Request Checklist, A1 Faculty Dataset Arrives by D2

## Ambiguous Edges - Review These
- `Landslide4Sense 2022 Dataset` → `Landslide4Sense Competition Results`  [AMBIGUOUS]
  docs/ml-research.md · relation: conceptually_related_to
- `Sikkim Regional Threshold` → `Lanta Khola Threshold (Conflicting)`  [AMBIGUOUS]
  docs/data-sources.md · relation: conceptually_related_to

## Knowledge Gaps
- **88 isolated node(s):** `SANKET ML/CV Research`, `Focus Districts: Noney/Tamenglong & Aizawl`, `notifications.py (Alert Engine)`, `db.py (3-tier DB Privilege Separation)`, `useWidgetData.js (Batch-Fetch Coalescer)` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Landslide4Sense 2022 Dataset` and `Landslide4Sense Competition Results`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Sikkim Regional Threshold` and `Lanta Khola Threshold (Conflicting)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `E4 Control-Room Dashboard` connect `Dashboard Widgets & Live API` to `Dashboard UI & PharmaBoard Reuse`, `Backtest & Scenario Simulation`, `Field App Features & Cut List`, `Terrain Data & Hazard Map`, `Roads, Villages & Connectivity`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `Critical Path` connect `Terrain Data & Hazard Map` to `Dashboard UI & PharmaBoard Reuse`, `Prediction Engine & Rainfall Threshold`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `Feature Cut List (Ordered)` connect `Field App Features & Cut List` to `Dashboard UI & PharmaBoard Reuse`, `External Data Sources & Alerts`, `Computer Vision Field Modules`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **What connects `SANKET ML/CV Research`, `Focus Districts: Noney/Tamenglong & Aizawl`, `notifications.py (Alert Engine)` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard UI & PharmaBoard Reuse` be split into smaller, more focused modules?**
  _Cohesion score 0.07936507936507936 - nodes in this community are weakly interconnected._
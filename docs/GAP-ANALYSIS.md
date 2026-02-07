# PRD Gap Analysis

This document identifies the gaps between the original PRD designs (`@prds`) and the current implementation of the TimePlan Craft Kit.

## 1. Gantt & Project Core (PRD 01)
| Feature | PRD Requirement | Current Status | Gap / Notes |
|---------|-----------------|----------------|-------------|
| **Time Shift** | Batch moving all tasks by X days | ❌ Missing | Not found in toolbar or context menu. |
| **Project Templates** | Pre-populated datasets | ❌ Missing | "Select template" exists in UI but logic is missing. |
| **Soft Delete** | Trash bin for projects | ❌ Missing | Deletion is currently permanent. |
| **Markdown Editor** | Rich text for notes | 🟡 Basic | Schema supported, UI is basic textarea. |

## 2. Iteration Planning (PRD 02)
| Feature | PRD Requirement | Current Status | Gap / Notes |
|---------|-----------------|----------------|-------------|
| **Product Switching** | Dropdown to filter by Product Line | ❌ Missing | Tab exists but no product filter implemented. |
| **MR Adding** | 3-level Tree Selection (Feature → SSTS → MR) | ❌ Missing | Tasks are simple "Line" nodes in the kit. |
| **Drag & Drop** | Move MRs between iteration cells | ❌ Missing | Integrated view is static list within cards. |
| **Dependency Lines** | Visual arrows between MR cards | ❌ Missing | Only visible in Gantt view. |
| **Conflict Detection** | Warning when MR violates dependencies | ❌ Missing | Logic for iteration boundaries is not implemented. |

## 3. Data Management & Collaboration (PRD 03)
| Feature | PRD Requirement | Current Status | Gap / Notes |
|---------|-----------------|----------------|-------------|
| **Data Import** | JSON/CSV/Excel Import | ❌ Missing | Only Export is current implemented. |
| **Import Modes** | Merge vs. Replace | ❌ Missing | |
| **Excel Export** | Formatted .xlsx report | ❌ Missing | Only JSON export verified. |
| **CSV Export** | 14-field delimited file | ❌ Missing | Only JSON export verified. |
| **Version History** | Timeline of changes with rollback | ❌ Missing | Undo/Redo is session-only. |
| **Collaboration** | Real-time multi-user editing | ❌ Missing | P3: Future requirement. |
| **Comments** | Task-level discussion thread | ❌ Missing | P3: Future requirement. |

## 4. Technical Gaps
| Category | Requirement | Current Status | Gap / Notes |
|----------|-------------|----------------|-------------|
| **Backend Integration** | Database + Auth | ❌ Missing | Frontend is pure client-side (LocalStorage). |
| **Optimization** | Virtual Scrolling for 1k+ nodes | ❌ Missing | Large datasets may lag in Gantt/Matrix. |
| **Testing** | 80%+ Unit test coverage | 🟡 Partially | Many components lack detailed unit tests. |

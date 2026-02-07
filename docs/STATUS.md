# Project Implementation Status

This document summarizes the currently implemented pages and features of the TimePlan Craft Kit.

## 1. Pages & Navigation
- **Project List (`/`)**: 
    - Full CRUD for projects (Create, Edit, Delete).
    - Search and filter projects.
    - Status badges and progress tracking.
- **Project Detail (`/:id`)**:
    - Unified project container with multi-view support.
    - Integrated toolbar for all management actions.
- **Component Demo (`/demo/components`)**:
    - Showcase for UI components like `TimelineToolbar`, `ViewSwitcher`, etc.

## 2. Core Features (Gantt View)
- **Timeline Management**: 
    - Create/Edit/Delete timelines.
    - Drag-and-drop sorting of timelines.
    - Custom background colors for timelines.
- **Node (Task) Management**:
    - **Bar (Task Bar)**: Full duration management, progress tracking.
    - **Milestone**: Single-point delivery tracking.
    - **Gateway**: Decision point marker.
    - Drag-and-drop to move/resize tasks.
- **Dependency Management**:
    - Support for 4 types: FS, SS, FF, SF.
    - SVG-based visualization between nodes.
    - Critical Path Analysis (automatic calculation and highlighting).
- **Undo/Redo**: 
    - State-based history management (up to 50 steps).
    - Persisted state in LocalStorage (except history stack).

## 3. Data Views
- **Gantt View**: Main editing interface with full drag-and-drop support.
- **Table View**: Detailed list of all tasks with filtering and search.
- **Matrix View**: Cross-team view grouping tasks by Timeline and Product Line.
- **Iteration View**: Grouping tasks into 14-day iteration buckets.

## 4. System Features
- **Data Persistence**: LocalStorage with version-aware migration.
- **Schema Engine**: Schema-based data model (V2) supporting dynamic attributes.
- **Export**: JSON export (100% data integrity).
- **Styling**: Fully themed using Ant Design (v5) design tokens.

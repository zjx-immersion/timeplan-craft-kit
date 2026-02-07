# Developer Reference Guide

This document provides a consolidated reference for the technical architecture and component mapping used in the TimePlan Craft Kit.

## 1. Technical Stack
- **Framework**: React 18 (Vite)
- **UI Library**: Ant Design (v5)
- **State Management**: Zustand (with Persistence)
- **Data Model**: Schema-based (V2)
- **Styling**: Vanilla CSS + Ant Design Tokens

## 2. Store Architecture
The application uses a unified store strategy to ensure data consistency across all views.
- **Store**: `useTimePlanStoreWithHistory`
- **LocalStorage Key**: `timeplan-craft-storage-with-history`
- **Key Features**: 
    - Undo/Redo support.
    - Automatic persistence of plans and current selection.
    - Versioned data migration.

## 3. UI Component Mapping
Formerly managed in Shadcn/ui, the project now uses Ant Design.

| Original Concept | Ant Design Component | Integration Note |
|------------------|----------------------|------------------|
| **Button** | `Button` | Standard usage. |
| **Dialog** | `Modal` | API differs; use `open` & `onCancel`. |
| **Form** | `Form` | Use `Form.useForm()` for control. |
| **Toast** | `message` | Imperative API: `message.success()`. |
| **Dropdown** | `Dropdown` | Map items to a `menu` prop array. |
| **Tabs** | `Tabs` | Map items to an `items` prop array. |

## 4. Key Components
- **`UnifiedTimelinePanelV2`**: Core container for all multi-view logic.
- **`TimelineToolbar`**: Unified action bar for projects.
- **`TimeAxisScaler`**: Logic for managing zoom and scale (Month, Week, Day).
- **`RelationRenderer`**: SVG-based drawing engine for task dependencies.

## 5. View Logic
Views are dynamically switched based on the `view` state in `UnifiedTimelinePanelV2`:
- `Gantt`: Main timeline rendering.
- `Table`: Ant Design `Table` based task list.
- `Matrix`: Iterative grouping by timeline/product.
- `Iteration`: Sprint-based task grouping.

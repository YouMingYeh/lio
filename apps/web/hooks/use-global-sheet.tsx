"use client";

import * as React from "react";

/**
 * Defines the properties for an individual sheet instance.
 */
type SheetProps = {
  /** Unique identifier for the sheet. */
  id: string;
  /** Whether the sheet is open (visible) or closed. */
  open: boolean;
  /** An optional title for the sheet. */
  title?: string;
  /** An optional description for the sheet. */
  description?: string;
  /** The React node content to render inside the sheet. */
  content: React.ReactNode;
  /**
   * A callback invoked when the open state changes. If `open` becomes `false`,
   * the sheet will be dismissed.
   */
  onOpenChange?: (open: boolean) => void;
};

const SHEET_LIMIT = 1; // Maximum number of sheets that can be displayed at once
const SHEET_REMOVE_DELAY = 1000; // Time (ms) to wait before removing a sheet from state after dismissal

/**
 * All action types for the sheet state reducer.
 */
const sheetActionTypes = {
  ADD_SHEET: "ADD_SHEET",
  UPDATE_SHEET: "UPDATE_SHEET",
  DISMISS_SHEET: "DISMISS_SHEET",
  REMOVE_SHEET: "REMOVE_SHEET",
} as const;

/**
 * A counter used to generate unique IDs for each sheet.
 */
let sheetCount = 0;

/**
 * Generates a unique ID for a new sheet, cycling through Number.MAX_SAFE_INTEGER.
 */
function genSheetId() {
  sheetCount = (sheetCount + 1) % Number.MAX_SAFE_INTEGER;
  return sheetCount.toString();
}

type SheetActionType = typeof sheetActionTypes;

/**
 * Describes all actions that can be dispatched to the sheet state reducer.
 */
type SheetAction =
  | {
      type: SheetActionType["ADD_SHEET"];
      sheet: SheetProps;
    }
  | {
      type: SheetActionType["UPDATE_SHEET"];
      sheet: Partial<SheetProps> & { id: string };
    }
  | {
      type: SheetActionType["DISMISS_SHEET"];
      sheetId?: string;
    }
  | {
      type: SheetActionType["REMOVE_SHEET"];
      sheetId?: string;
    };

/**
 * The top-level sheet state, which holds an array of SheetProps.
 */
interface SheetState {
  sheets: SheetProps[];
}

/**
 * A global map of timeouts used to remove dismissed sheets after a delay.
 * The key is the sheet's ID.
 */
const sheetTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Queues a sheet for removal after a delay. If already queued, does nothing.
 */
const addSheetToRemoveQueue = (sheetId: string) => {
  if (sheetTimeouts.has(sheetId)) {
    return;
  }

  const timeout = setTimeout(() => {
    sheetTimeouts.delete(sheetId);
    sheetDispatch({
      type: "REMOVE_SHEET",
      sheetId,
    });
  }, SHEET_REMOVE_DELAY);

  sheetTimeouts.set(sheetId, timeout);
};

/**
 * The reducer for managing sheet state.
 */
const sheetReducer = (state: SheetState, action: SheetAction): SheetState => {
  switch (action.type) {
    case "ADD_SHEET":
      return {
        ...state,
        sheets: [action.sheet, ...state.sheets].slice(0, SHEET_LIMIT),
      };
    case "UPDATE_SHEET":
      return {
        ...state,
        sheets: state.sheets.map((s) =>
          s.id === action.sheet.id ? { ...s, ...action.sheet } : s,
        ),
      };
    case "DISMISS_SHEET": {
      const { sheetId } = action;

      if (sheetId) {
        addSheetToRemoveQueue(sheetId);
      } else {
        // If no ID is specified, dismiss all sheets
        state.sheets.forEach((sheet) => {
          addSheetToRemoveQueue(sheet.id);
        });
      }

      return {
        ...state,
        sheets: state.sheets.map((s) =>
          s.id === sheetId || sheetId === undefined ? { ...s, open: false } : s,
        ),
      };
    }
    case "REMOVE_SHEET":
      if (action.sheetId === undefined) {
        // If no ID is specified, remove all sheets
        return {
          ...state,
          sheets: [],
        };
      }
      return {
        ...state,
        sheets: state.sheets.filter((s) => s.id !== action.sheetId),
      };
    default:
      return state;
  }
};

/**
 * A collection of listeners (setState functions) that are notified whenever
 * the global sheet state changes.
 */
const sheetListeners: Array<(state: SheetState) => void> = [];

/**
 * The in-memory "single source of truth" for the sheet state.
 */
let sheetMemoryState: SheetState = { sheets: [] };

/**
 * Dispatches an action to update the global sheet state, notifying all subscribed listeners.
 */
const sheetDispatch = (action: SheetAction) => {
  sheetMemoryState = sheetReducer(sheetMemoryState, action);
  sheetListeners.forEach((listener) => {
    listener(sheetMemoryState);
  });
};

/**
 * Represents the arguments used to open a new sheet.
 */
type SheetArgs = {
  title?: string;
  description?: string;
  content: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Opens a new sheet with the specified attributes, returning controls to update or dismiss it.
 *
 * @param {SheetArgs} args - The sheet properties.
 * @returns An object containing the sheet ID and functions to `dismiss` or `update` the sheet.
 *
 * @example
 * ```ts
 * const mySheet = openSheet({
 *   title: "My Sheet Title",
 *   content: <MySheetContent />,
 * });
 *
 * // To update:
 * mySheet.update({ title: "Updated Sheet Title" });
 *
 * // To dismiss:
 * mySheet.dismiss();
 * ```
 */
function openSheet({ title, description, content, onOpenChange }: SheetArgs) {
  const id = genSheetId();

  const update = (sheet: Partial<SheetProps>) =>
    sheetDispatch({
      type: "UPDATE_SHEET",
      sheet: { ...sheet, id },
    });

  const dismiss = () => sheetDispatch({ type: "DISMISS_SHEET", sheetId: id });

  sheetDispatch({
    type: "ADD_SHEET",
    sheet: {
      id,
      open: true,
      title,
      description,
      content,
      onOpenChange: (open) => {
        if (!open) dismiss();
        onOpenChange?.(open);
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

/**
 * A React hook that provides global sheet state (i.e., a list of sheets)
 * and functions for opening and dismissing sheets.
 *
 * @returns An object containing `sheets`, `openSheet`, and `dismiss` methods.
 *
 * @example
 * ```tsx
 * function MySheetComponent() {
 *   const { sheets, openSheet, dismiss } = useGlobalSheet();
 *
 *   const showSheet = () => {
 *     const { id } = openSheet({
 *       title: "Sheet Title",
 *       content: <p>Some content in the sheet</p>,
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={showSheet}>Open Sheet</button>
 *       {sheets.map(sheet => (
 *         <SomeSheetComponent
 *           key={sheet.id}
 *           {...sheet}
 *           onOpenChange={(open) => {
 *             if (!open) dismiss(sheet.id);
 *           }}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
function useGlobalSheet() {
  const [state, setState] = React.useState<SheetState>(sheetMemoryState);

  React.useEffect(() => {
    sheetListeners.push(setState);
    return () => {
      const index = sheetListeners.indexOf(setState);
      if (index > -1) {
        sheetListeners.splice(index, 1);
      }
    };
  }, []);

  return {
    sheets: state.sheets,
    openSheet,
    dismiss: (sheetId?: string) =>
      sheetDispatch({ type: "DISMISS_SHEET", sheetId }),
  };
}

export { useGlobalSheet, openSheet };

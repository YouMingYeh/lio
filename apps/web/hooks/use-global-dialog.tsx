"use client";

import * as React from "react";

/**
 * Defines the properties for an individual dialog instance.
 */
type DialogProps = {
  /** Unique identifier for the dialog. */
  id: string;
  /** Whether the dialog is open (visible) or closed. */
  open: boolean;
  /** An optional title for the dialog. */
  title?: string;
  /** An optional description for the dialog. */
  description?: string;
  /** The React node content to render inside the dialog. */
  content: React.ReactNode;
  /**
   * A callback invoked when the open state changes. If `open` becomes `false`,
   * the dialog will be dismissed.
   */
  onOpenChange?: (open: boolean) => void;
};

const DIALOG_LIMIT = 1; // Maximum number of dialogs that can be displayed at once
const DIALOG_REMOVE_DELAY = 1000; // Time (ms) to wait before removing a dialog from state after dismissal

/**
 * All action types for the dialog state reducer.
 */
const actionTypes = {
  ADD_DIALOG: "ADD_DIALOG",
  UPDATE_DIALOG: "UPDATE_DIALOG",
  DISMISS_DIALOG: "DISMISS_DIALOG",
  REMOVE_DIALOG: "REMOVE_DIALOG",
} as const;

/**
 * A counter used to generate unique IDs for each dialog.
 */
let dialogCount = 0;

/**
 * Generates a unique ID for a new dialog, cycling through Number.MAX_SAFE_INTEGER.
 */
function genDialogId() {
  dialogCount = (dialogCount + 1) % Number.MAX_SAFE_INTEGER;
  return dialogCount.toString();
}

type ActionType = typeof actionTypes;

/**
 * Describes all actions that can be dispatched to the dialog state reducer.
 */
type DialogAction =
  | {
      type: ActionType["ADD_DIALOG"];
      dialog: DialogProps;
    }
  | {
      type: ActionType["UPDATE_DIALOG"];
      dialog: Partial<DialogProps> & { id: string };
    }
  | {
      type: ActionType["DISMISS_DIALOG"];
      dialogId?: string;
    }
  | {
      type: ActionType["REMOVE_DIALOG"];
      dialogId?: string;
    };

/**
 * The top-level dialog state, which holds an array of DialogProps.
 */
interface DialogState {
  dialogs: DialogProps[];
}

/**
 * A global map of timeouts used to remove dismissed dialogs after a delay.
 * The key is the dialog's ID.
 */
const dialogTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Queues a dialog for removal after a delay. If already queued, does nothing.
 */
const addDialogToRemoveQueue = (dialogId: string) => {
  if (dialogTimeouts.has(dialogId)) {
    return;
  }

  const timeout = setTimeout(() => {
    dialogTimeouts.delete(dialogId);
    dialogDispatch({
      type: "REMOVE_DIALOG",
      dialogId,
    });
  }, DIALOG_REMOVE_DELAY);

  dialogTimeouts.set(dialogId, timeout);
};

/**
 * The reducer for managing dialog state.
 */
const dialogReducer = (
  state: DialogState,
  action: DialogAction,
): DialogState => {
  switch (action.type) {
    case "ADD_DIALOG":
      return {
        ...state,
        dialogs: [action.dialog, ...state.dialogs].slice(0, DIALOG_LIMIT),
      };
    case "UPDATE_DIALOG":
      return {
        ...state,
        dialogs: state.dialogs.map((d) =>
          d.id === action.dialog.id ? { ...d, ...action.dialog } : d,
        ),
      };
    case "DISMISS_DIALOG": {
      const { dialogId } = action;

      if (dialogId) {
        addDialogToRemoveQueue(dialogId);
      } else {
        // If no ID is specified, dismiss all dialogs
        state.dialogs.forEach((dialog) => {
          addDialogToRemoveQueue(dialog.id);
        });
      }

      return {
        ...state,
        dialogs: state.dialogs.map((d) =>
          d.id === dialogId || dialogId === undefined
            ? { ...d, open: false }
            : d,
        ),
      };
    }
    case "REMOVE_DIALOG":
      if (action.dialogId === undefined) {
        // If no ID is specified, remove all dialogs
        return {
          ...state,
          dialogs: [],
        };
      }
      return {
        ...state,
        dialogs: state.dialogs.filter((d) => d.id !== action.dialogId),
      };
    default:
      return state;
  }
};

/**
 * A collection of listeners (setState functions) that are notified whenever
 * the global dialog state changes.
 */
const dialogListeners: Array<(state: DialogState) => void> = [];

/**
 * The in-memory "single source of truth" for the dialog state.
 */
let dialogMemoryState: DialogState = { dialogs: [] };

/**
 * Dispatches an action to update the global dialog state, notifying all subscribed listeners.
 */
const dialogDispatch = (action: DialogAction) => {
  dialogMemoryState = dialogReducer(dialogMemoryState, action);
  dialogListeners.forEach((listener) => {
    listener(dialogMemoryState);
  });
};

/**
 * Represents the arguments used to open a new dialog.
 */
type DialogArgs = {
  title?: string;
  description?: string;
  content: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Opens a new dialog with the specified attributes, returning controls to update or dismiss it.
 *
 * @param {DialogArgs} args - The dialog properties.
 * @returns An object containing the dialog ID and functions to `dismiss` or `update` the dialog.
 *
 * @example
 * ```ts
 * const myDialog = openDialog({
 *   title: "My Dialog Title",
 *   description: "Additional description...",
 *   content: <MyDialogContent />,
 * });
 *
 * // To update:
 * myDialog.update({ title: "Updated Title" });
 *
 * // To dismiss:
 * myDialog.dismiss();
 * ```
 */
function openDialog({ title, description, content, onOpenChange }: DialogArgs) {
  const id = genDialogId();

  const update = (dialog: Partial<DialogProps>) =>
    dialogDispatch({
      type: "UPDATE_DIALOG",
      dialog: { ...dialog, id },
    });

  const dismiss = () =>
    dialogDispatch({ type: "DISMISS_DIALOG", dialogId: id });

  dialogDispatch({
    type: "ADD_DIALOG",
    dialog: {
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
 * A React hook that provides global dialog state (i.e., a list of dialogs)
 * and functions for opening and dismissing dialogs.
 *
 * @returns An object containing `dialogs`, `openDialog`, and `dismiss` methods.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { dialogs, openDialog, dismiss } = useGlobalDialog();
 *
 *   const showDialog = () => {
 *     const { id } = openDialog({
 *       title: "Hello!",
 *       content: <p>This is a global dialog</p>,
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={showDialog}>Open Dialog</button>
 *       {dialogs.map(dialog => (
 *         <SomeDialogComponent
 *           key={dialog.id}
 *           {...dialog}
 *           onOpenChange={(open) => {
 *             if (!open) dismiss(dialog.id);
 *           }}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
function useGlobalDialog() {
  const [state, setState] = React.useState<DialogState>(dialogMemoryState);

  React.useEffect(() => {
    dialogListeners.push(setState);
    return () => {
      const index = dialogListeners.indexOf(setState);
      if (index > -1) {
        dialogListeners.splice(index, 1);
      }
    };
  }, []);

  return {
    dialogs: state.dialogs,
    openDialog,
    dismiss: (dialogId?: string) =>
      dialogDispatch({ type: "DISMISS_DIALOG", dialogId }),
  };
}

export { useGlobalDialog, openDialog };

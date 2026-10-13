"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CloudItem } from "./types";

interface UseFileSelectionOptions {
  items: CloudItem[];
  isModalOpen?: boolean;
  onBulkDeleteRequest?: () => void;
}

export function useFileSelection({
  items,
  isModalOpen = false,
  onBulkDeleteRequest,
}: UseFileSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const explorerContainerRef = useRef<HTMLDivElement>(null);

  // Marquee (Block / Lasso) Selection State
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeRect, setMarqueeRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const marqueeInitialSelectionRef = useRef<Set<string>>(new Set());
  const isDraggingBlockRef = useRef(false);

  const registerItemRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Long-press (tekan tahan) selection state & timer
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef<boolean>(false);

  const handleItemPointerDown = useCallback(
    (item: CloudItem, e: React.PointerEvent) => {
      // Primary left pointer / touch only
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (
        target.closest("button:not([data-select-checkbox])") ||
        target.closest("a") ||
        target.closest("[role='menuitem']") ||
        target.closest("[data-prevent-select]")
      ) {
        return;
      }

      // If directly clicking checkbox, handle in click immediately
      if (target.closest("[data-select-checkbox]")) {
        return;
      }

      const startX = e.clientX;
      const startY = e.clientY;
      longPressTriggeredRef.current = false;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      const cleanupWindowListeners = () => {
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);
      };

      const onWindowPointerMove = (ev: PointerEvent) => {
        const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
        if (dist > 10) {
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          cleanupWindowListeners();
        }
      };

      const onWindowPointerUp = () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        cleanupWindowListeners();
      };

      window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerUp);

      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(item.id)) {
            next.delete(item.id);
          } else {
            next.add(item.id);
          }
          return next;
        });

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(50);
          } catch {}
        }
        cleanupWindowListeners();
      }, 450);
    },
    []
  );

  const handleItemClick = useCallback(
    (
      item: CloudItem,
      index: number,
      e: React.MouseEvent,
      onOpen?: (item: CloudItem) => void
    ) => {
      const target = e.target as HTMLElement;
      // Prevent selecting when clicking inner interactive controls
      if (
        target.closest("button:not([data-select-checkbox])") ||
        target.closest("a") ||
        target.closest("[role='menuitem']") ||
        target.closest("[data-prevent-select]")
      ) {
        return;
      }

      // If this click was triggered right after a long-press, consume it and don't open
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return;
      }

      const isCheckboxClick = Boolean(target.closest("[data-select-checkbox]"));

      if (e.ctrlKey || e.metaKey || isCheckboxClick) {
        // Ctrl/Cmd + Click or Checkbox click: Toggle individual item
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(item.id)) {
            next.delete(item.id);
          } else {
            next.add(item.id);
          }
          return next;
        });
        setLastSelectedIndex(index);
      } else if (e.shiftKey && lastSelectedIndex !== null) {
        // Shift + Click: Range block selection
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = items.slice(start, end + 1).map((i) => i.id);

        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((id) => next.add(id));
          return next;
        });
      } else if (selectedIds.size > 0) {
        // When selection mode is active (one or more items are selected):
        // Clicking on an item toggles its selection
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(item.id)) {
            next.delete(item.id);
          } else {
            next.add(item.id);
          }
          return next;
        });
        setLastSelectedIndex(index);
      } else {
        // Normal mode (selectedIds.size === 0):
        // Clicking does NOT select! It OPENS the file or folder!
        if (onOpen) {
          onOpen(item);
        }
      }
    },
    [items, lastSelectedIndex, selectedIds.size]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [items, selectedIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Primary left click only
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("a") ||
        target.closest("[role='dialog']") ||
        target.closest("[role='menu']") ||
        target.closest("[role='menuitem']")
      ) {
        return;
      }

      // If clicked on an unselected card, don't prevent block selection start
      const clickedCard = target.closest("[data-item-card]");
      if (clickedCard) {
        // If clicking on an already-selected card with left click, keep selection for dragging
        return;
      }

      // Clear selection when clicking empty canvas without modifiers
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setSelectedIds(new Set());
        setLastSelectedIndex(null);
      }

      marqueeStartRef.current = { x: e.clientX, y: e.clientY };
      marqueeInitialSelectionRef.current =
        e.ctrlKey || e.metaKey || e.shiftKey ? new Set(selectedIds) : new Set();
      isDraggingBlockRef.current = true;
    },
    [selectedIds]
  );

  // Marquee mouse move / up tracking for Block Selection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingBlockRef.current || !marqueeStartRef.current) return;

      const startX = marqueeStartRef.current.x;
      const startY = marqueeStartRef.current.y;
      const currentX = e.clientX;
      const currentY = e.clientY;

      const distance = Math.hypot(currentX - startX, currentY - startY);
      // Minimum drag threshold to distinguish click from block drag
      if (distance < 4 && !isMarqueeActive) {
        return;
      }

      if (!isMarqueeActive) {
        setIsMarqueeActive(true);
        document.body.style.userSelect = "none";
      }

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      setMarqueeRect({ x, y, width, height });

      // Hit-testing / Bounding-box collision detection
      const newSelected = new Set(marqueeInitialSelectionRef.current);
      itemRefs.current.forEach((el, id) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const overlaps = !(
          rect.right < x ||
          rect.left > x + width ||
          rect.bottom < y ||
          rect.top > y + height
        );
        if (overlaps) {
          if (e.ctrlKey || e.metaKey) {
            // Invert in toggle mode
            if (marqueeInitialSelectionRef.current.has(id)) {
              newSelected.delete(id);
            } else {
              newSelected.add(id);
            }
          } else {
            newSelected.add(id);
          }
        }
      });

      setSelectedIds(newSelected);
    };

    const handleMouseUp = () => {
      if (isDraggingBlockRef.current) {
        isDraggingBlockRef.current = false;
        setIsMarqueeActive(false);
        setMarqueeRect(null);
        marqueeStartRef.current = null;
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMarqueeActive]);

  // Global Keyboard Shortcuts (Ctrl+A, Escape, Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.tagName === "SELECT" ||
        activeEl?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (isModalOpen) return;

      // Ctrl+A / Cmd+A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(new Set(items.map((i) => i.id)));
      }

      // Escape: Deselect all
      if (e.key === "Escape" && selectedIds.size > 0) {
        setSelectedIds(new Set());
        setLastSelectedIndex(null);
      }

      // Delete / Backspace: Request Bulk Delete
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0) {
        e.preventDefault();
        onBulkDeleteRequest?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIds.size, isModalOpen, onBulkDeleteRequest]);

  return {
    selectedIds,
    setSelectedIds,
    selectedItems: items.filter((i) => selectedIds.has(i.id)),
    explorerContainerRef,
    isMarqueeActive,
    marqueeRect,
    registerItemRef,
    handleItemClick,
    handleItemPointerDown,
    isSelectionMode: selectedIds.size > 0,
    handleSelectAll,
    handleClearSelection,
    handleContainerMouseDown,
  };
}

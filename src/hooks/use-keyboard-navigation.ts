"use client";

import { useEffect, useCallback, useRef } from 'react';
import { getPlatform } from '@/lib/platform-utils';

export interface KeyboardNavigationOptions {
  /** Enable global keyboard shortcuts (j/k for navigation) */
  enableGlobalShortcuts?: boolean;
  /** Enable arrow key navigation */
  enableArrowKeys?: boolean;
  /** Callback when navigating to next stage */
  onNextStage?: () => void;
  /** Callback when navigating to previous stage */
  onPreviousStage?: () => void;
  /** Callback when triggering primary action */
  onPrimaryAction?: () => void;
  /** Callback when triggering secondary action */
  onSecondaryAction?: () => void;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Disable keyboard navigation when true */
  disabled?: boolean;
}

export interface KeyboardNavigationHook {
  /** Focus the next focusable element */
  focusNext: () => void;
  /** Focus the previous focusable element */
  focusPrevious: () => void;
  /** Focus a specific element by ID */
  focusElement: (elementId: string) => void;
  /** Get all focusable elements in the current context */
  getFocusableElements: () => HTMLElement[];
}

/**
 * Hook for managing keyboard navigation in the wizard interface
 * Provides global keyboard shortcuts and focus management
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}): KeyboardNavigationHook {
  const {
    enableGlobalShortcuts = true,
    enableArrowKeys = true,
    onNextStage,
    onPreviousStage,
    onPrimaryAction,
    onSecondaryAction,
    onEscape,
    disabled = false,
  } = options;

  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(', '))) as HTMLElement[];
    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
  }, []);

  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex].focus();
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[previousIndex].focus();
  }, [getFocusableElements]);

  const focusElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      lastFocusedElementRef.current = element;
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const target = event.target as HTMLElement;
    const platform = getPlatform();
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';

    // Don't interfere with typing in input fields unless it's a specific shortcut
    if (isInputField && !event.ctrlKey && !event.metaKey && !event.altKey) {
      return;
    }

    switch (event.key) {
      case 'j':
      case 'J':
        if (enableGlobalShortcuts && !isInputField) {
          event.preventDefault();
          onNextStage?.();
        }
        break;

      case 'k':
      case 'K':
        if (enableGlobalShortcuts && !isInputField) {
          event.preventDefault();
          onPreviousStage?.();
        }
        break;

      case 'ArrowDown':
        if (enableArrowKeys && !isInputField) {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'ArrowUp':
        if (enableArrowKeys && !isInputField) {
          event.preventDefault();
          focusPrevious();
        }
        break;

      case 'Enter':
        // Handle Cmd+Enter or Ctrl+Enter for primary actions
        if ((platform === 'mac' && event.metaKey) || (platform !== 'mac' && event.ctrlKey)) {
          event.preventDefault();
          onPrimaryAction?.();
        }
        break;

      case 'e':
      case 'E':
        // 'e' for Edit when not in input field
        if (!isInputField && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          onSecondaryAction?.();
        }
        break;

      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      case 'Tab':
        // Let default tab behavior work but track focus
        setTimeout(() => {
          if (document.activeElement instanceof HTMLElement) {
            lastFocusedElementRef.current = document.activeElement;
          }
        }, 0);
        break;
    }
  }, [
    disabled,
    enableGlobalShortcuts,
    enableArrowKeys,
    onNextStage,
    onPreviousStage,
    onPrimaryAction,
    onSecondaryAction,
    onEscape,
    focusNext,
    focusPrevious,
  ]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, disabled]);

  // Focus management utilities
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) {
        lastFocusedElementRef.current = event.target;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  return {
    focusNext,
    focusPrevious,
    focusElement,
    getFocusableElements,
  };
}

/**
 * Hook for managing focus within a specific container
 * Useful for modal dialogs, forms, and other focused areas
 */
export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', trapFocus);
    return () => container.removeEventListener('keydown', trapFocus);
  }, [trapFocus, containerRef]);

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    const firstFocusable = containerRef.current.querySelector(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, [containerRef]);

  return { focusFirst };
}

/**
 * Helper function to add visual focus indicators
 * Adds a class to indicate keyboard focus vs mouse focus
 */
export function useVisualFocusIndicators() {
  useEffect(() => {
    let isUsingKeyboard = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}
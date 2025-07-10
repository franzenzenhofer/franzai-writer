"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, X, HelpCircle } from 'lucide-react';
import { getSubmitShortcutKey } from '@/lib/platform-utils';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  key: string;
  description: string;
  context?: string;
}

interface KeyboardNavigationHelpProps {
  className?: string;
  showAsPopup?: boolean;
  autoShow?: boolean;
}

export function KeyboardNavigationHelp({ 
  className, 
  showAsPopup = false, 
  autoShow = false 
}: KeyboardNavigationHelpProps) {
  const [isVisible, setIsVisible] = useState(!showAsPopup || autoShow);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const submitKey = getSubmitShortcutKey();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
        if (autoShow && showAsPopup) {
          setIsVisible(true);
        }
      }
      
      // Toggle help with '?' key
      if (event.key === '?' && !isInputField(event.target)) {
        event.preventDefault();
        setIsVisible(!isVisible);
      }

      // Close help with Escape key
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      if (autoShow && showAsPopup) {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isVisible, autoShow, showAsPopup]);

  const isInputField = (target: EventTarget | null): boolean => {
    if (!target) return false;
    const element = target as HTMLElement;
    return element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' || 
           element.contentEditable === 'true';
  };

  const shortcuts: KeyboardShortcut[] = [
    { key: 'j', description: 'Next stage', context: 'Global' },
    { key: 'k', description: 'Previous stage', context: 'Global' },
    { key: '↓', description: 'Next element', context: 'Global' },
    { key: '↑', description: 'Previous element', context: 'Global' },
    { key: 'Tab', description: 'Next focusable element', context: 'Global' },
    { key: 'Shift+Tab', description: 'Previous focusable element', context: 'Global' },
    { key: submitKey ? `${submitKey}+Enter` : 'Enter', description: 'Primary action', context: 'Forms' },
    { key: 'e', description: 'Edit current stage', context: 'Stages' },
    { key: 'Enter', description: 'Activate button/link', context: 'Buttons' },
    { key: 'Space', description: 'Activate button/checkbox', context: 'Buttons' },
    { key: 'Escape', description: 'Cancel/close', context: 'Dialogs' },
    { key: '?', description: 'Show/hide shortcuts', context: 'Help' },
  ];

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const context = shortcut.context || 'Other';
    if (!acc[context]) acc[context] = [];
    acc[context].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  if (showAsPopup && !isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 rounded-full shadow-lg z-50"
        title="Show keyboard shortcuts (?)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
    );
  }

  if (!isVisible) return null;

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Keyboard Shortcuts</h3>
        </div>
        {showAsPopup && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(groupedShortcuts).map(([context, shortcuts]) => (
          <div key={context} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{context}</h4>
            <div className="space-y-1">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground">
        <p>Press <Badge variant="outline" className="font-mono">?</Badge> to toggle this help</p>
      </div>
    </div>
  );

  if (showAsPopup) {
    return (
      <Card className={cn(
        "fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] shadow-lg z-50",
        isKeyboardUser ? "animate-in slide-in-from-bottom-2" : "",
        className
      )}>
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Keyboard Navigation
        </CardTitle>
        <CardDescription>
          Use these shortcuts to navigate the wizard interface efficiently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

/**
 * Floating keyboard shortcuts indicator
 * Shows only when keyboard navigation is being used
 */
export function KeyboardNavigationIndicator() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
        setShow(true);
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
      setShow(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="keyboard-hints">
      <h4>Quick Keys</h4>
      <ul>
        <li>
          <span>Next stage</span>
          <kbd>j</kbd>
        </li>
        <li>
          <span>Previous stage</span>
          <kbd>k</kbd>
        </li>
        <li>
          <span>Edit</span>
          <kbd>e</kbd>
        </li>
        <li>
          <span>Help</span>
          <kbd>?</kbd>
        </li>
      </ul>
    </div>
  );
}
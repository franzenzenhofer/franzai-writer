import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useToast, toast as globalToast, reducer, Action, State, ActionType } from './use-toast' // Import necessary types
import { ToastProps } from '@/components/ui/toast' // For variant checks

// Mock the internal dispatch function to spy on actions
// Need to figure out how to properly mock/spy on module-internal functions or state.
// For now, we'll test the reducer directly and the public interface (useToast, globalToast).

const initialMemoryState: State = { toasts: [] }
let memoryState = { ...initialMemoryState }
const listeners: Array<(state: State) => void> = []

// Mocked dispatch to allow spying and state manipulation for tests
const mockDispatch = (action: Action) => {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => listener(memoryState))
}

// Mocking variables and functions for test control
let testIdCounter = 0;
const testGenId = () => (++testIdCounter).toString();

// Replace actual dispatch and toast with mocks for testing purposes
vi.mock('./use-toast', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('./use-toast')>();

  // This is the toast function that will be exported by the mock.
  // It uses the test's mockDispatch and thus the test's memoryState.
  const mockedGlobalToast = (props: import('./use-toast').Toast) => {
    const id = testGenId(); // Use test-controlled ID generator

    const update = (updateProps: import('./use-toast').ToasterToast) =>
      mockDispatch({
        type: "UPDATE_TOAST",
        toast: { ...updateProps, id },
      });
    const dismiss = () => mockDispatch({ type: "DISMISS_TOAST", toastId: id });

    mockDispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss();
        },
      } as import('./use-toast').ToasterToast,
    });

    return { id, dismiss, update };
  };

  return {
    ...originalModule, // Spread original exports
    toast: mockedGlobalToast, // Override the 'toast' export
    dispatch: (action: Action) => mockDispatch(action), // Override 'dispatch'
    // Note: useToast from originalModule will still initialize with its own memoryState.
    // The dispatch it calls should be the mocked one.
  };
})



describe('useToast Hook and toast function', () => {
  beforeEach(async () => {
    // Reset state, listeners, and ID counter before each test
    memoryState = { toasts: [] };
    listeners.length = 0;
    testIdCounter = 0; // Reset test ID counter
    mockDispatch({ type: 'REMOVE_TOAST' });
    vi.clearAllMocks();
  })

  describe('toast function (globalToast)', () => {
    it('should add a toast with default variant and return id, dismiss, update', () => {
      const result = globalToast({ title: 'Test Toast' })
      expect(result.id).toBeDefined()
      expect(typeof result.dismiss).toBe('function')
      expect(typeof result.update).toBe('function')

      expect(memoryState.toasts.length).toBe(1)
      const addedToast = memoryState.toasts[0]
      expect(addedToast.title).toBe('Test Toast')
      expect(addedToast.variant).toBeUndefined() // Default variant
      expect(addedToast.open).toBe(true)
    })

    it('should add a toast with a specific variant', () => {
      globalToast({ title: 'Destructive Toast', variant: 'destructive' })
      expect(memoryState.toasts.length).toBe(1)
      expect(memoryState.toasts[0].variant).toBe('destructive')
    })

    it('onOpenChange(false) should trigger dismiss for the toast', () => {
      const { id } = globalToast({ title: 'Dismiss Test' })
      const toastToDismiss = memoryState.toasts.find(t => t.id === id)

      expect(toastToDismiss?.open).toBe(true)
      act(() => {
        toastToDismiss?.onOpenChange?.(false)
      })

      // Check if it's marked for removal (open: false)
      const dismissedToast = memoryState.toasts.find(t => t.id === id)
      expect(dismissedToast?.open).toBe(false)
    })
  })

  describe('useToast hook', () => {
    it('should return current toasts and toast function', () => {
      const { result } = renderHook(() => useToast())
      expect(result.current.toasts).toEqual([])
      expect(typeof result.current.toast).toBe('function')
      expect(typeof result.current.dismiss).toBe('function')
    })

    it('toast function from hook should add a toast', () => {
      const { result } = renderHook(() => useToast())
      act(() => {
        result.current.toast({ title: 'Hook Toast' })
      })
      expect(memoryState.toasts.length).toBe(1)
      expect(memoryState.toasts[0].title).toBe('Hook Toast')
    })

    it('dismiss function from hook should dismiss a specific toast by id', () => {
      const { result } = renderHook(() => useToast())
      let toastId = ''
      act(() => {
        const { id } = result.current.toast({ title: 'To Dismiss' })
        toastId = id
      })
      expect(memoryState.toasts.find(t => t.id === toastId)?.open).toBe(true)
      act(() => {
        result.current.dismiss(toastId)
      })
      expect(memoryState.toasts.find(t => t.id === toastId)?.open).toBe(false)
    })

    it('dismiss function from hook should dismiss all toasts if no id is provided', () => {
      const { result } = renderHook(() => useToast())
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })
      expect(memoryState.toasts.length).toBe(2)
      expect(memoryState.toasts.every(t => t.open)).toBe(true)
      act(() => {
        result.current.dismiss()
      })
      expect(memoryState.toasts.every(t => !t.open)).toBe(true)
    })
  })

  describe('reducer logic (direct test)', () => {
    it('ADD_TOAST should add a toast and respect TOAST_LIMIT', () => {
      let state: State = { toasts: [] }
      for (let i = 0; i < 5; i++) { // TOAST_LIMIT is 1 in the code
        state = reducer(state, {
          type: 'ADD_TOAST',
          toast: { id: `${i}`, title: `Toast ${i}` } as ToastProps & { id: string }
        })
      }
      expect(state.toasts.length).toBe(1) // TOAST_LIMIT
      expect(state.toasts[0].title).toBe('Toast 4')
    })

    it('UPDATE_TOAST should update an existing toast', () => {
      let state: State = { toasts: [{ id: '1', title: 'Initial Title' } as ToastProps & { id: string }] }
      state = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'Updated Title' }})
      expect(state.toasts[0].title).toBe('Updated Title')
    })

    it('DISMISS_TOAST should mark a specific toast as not open', () => {
      let state: State = { toasts: [{ id: '1', open: true } as ToastProps & { id: string }] }
      state = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' })
      expect(state.toasts[0].open).toBe(false)
    })

    it('DISMISS_TOAST without id should mark all toasts as not open', () => {
      let state: State = { toasts: [
        { id: '1', open: true },
        { id: '2', open: true }
      ] as Array<ToastProps & { id: string }> }
      state = reducer(state, { type: 'DISMISS_TOAST' })
      expect(state.toasts.every(t => !t.open)).toBe(true)
    })

    it('REMOVE_TOAST should remove a specific toast', () => {
      let state: State = { toasts: [{ id: '1' }, { id: '2' }] as Array<ToastProps & { id: string }> }
      state = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' })
      expect(state.toasts.length).toBe(1)
      expect(state.toasts.find(t => t.id === '1')).toBeUndefined()
    })

    it('REMOVE_TOAST without id should remove all toasts', () => {
      let state: State = { toasts: [{ id: '1' }, { id: '2' }] as Array<ToastProps & { id: string }> }
      state = reducer(state, { type: 'REMOVE_TOAST' })
      expect(state.toasts.length).toBe(0)
    })
  })
})

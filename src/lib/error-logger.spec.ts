import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { errorLogger } from './error-logger'

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('errorLogger.logError', () => {
  beforeEach(() => {
    // Reset the spy and localStorage before each test
    consoleErrorSpy.mockClear()
    localStorage.clear()
    // Set NODE_ENV to development to ensure console.error is called
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    // Restore NODE_ENV if it was changed
    delete process.env.NODE_ENV
  })

  it('should call console.error with the error and context', () => {
    const testError = new Error('Test error message')
    const testContext = { component: 'TestComponent', userId: 'testUser123' }

    errorLogger.logError(testError, testContext)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const consoleCallArg = consoleErrorSpy.mock.calls[0][1]

    expect(consoleCallArg.message).toBe('Test error message')
    expect(consoleCallArg.stack).toBe(testError.stack)
    expect(consoleCallArg.component).toBe('TestComponent')
    expect(consoleCallArg.userId).toBe('testUser123')
    expect(consoleCallArg.timestamp).toBeDefined()
  })

  it('should handle errors that are strings', () => {
    // Type casting to Error as the function expects an Error object
    const stringError = 'Just a string error' as unknown as Error
    // In a real scenario, you might wrap string errors: new Error(stringError)
    // However, to test robustness, we pass it as is, assuming it might happen.
    // The current implementation will take .message from it, which will be undefined.

    errorLogger.logError(stringError)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const consoleCallArg = consoleErrorSpy.mock.calls[0][1]

    // Given current implementation, message would be undefined if error.message doesn't exist
    expect(consoleCallArg.message).toBeUndefined()
    expect(consoleCallArg.stack).toBeUndefined() // Similarly, stack would be undefined
    expect(consoleCallArg.timestamp).toBeDefined()
  })

  it('should handle Error objects without a stack', () => {
    const noStackError = new Error('No stack here')
    delete noStackError.stack // Remove stack to simulate this scenario

    errorLogger.logError(noStackError)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const consoleCallArg = consoleErrorSpy.mock.calls[0][1]

    expect(consoleCallArg.message).toBe('No stack here')
    expect(consoleCallArg.stack).toBeUndefined()
    expect(consoleCallArg.timestamp).toBeDefined()
  })

  it('should work without additional context', () => {
    const testError = new Error('Error without context')

    errorLogger.logError(testError)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const consoleCallArg = consoleErrorSpy.mock.calls[0][1]

    expect(consoleCallArg.message).toBe('Error without context')
    expect(consoleCallArg.stack).toBe(testError.stack)
    expect(consoleCallArg.component).toBeUndefined()
    expect(consoleCallArg.userId).toBeUndefined()
    expect(consoleCallArg.timestamp).toBeDefined()
  })

  it('should include metadata if provided in context', () => {
    const testError = new Error('Error with metadata')
    const testContext = { metadata: { customInfo: 'details' } }

    errorLogger.logError(testError, testContext)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const consoleCallArg = consoleErrorSpy.mock.calls[0][1]

    expect(consoleCallArg.message).toBe('Error with metadata')
    expect(consoleCallArg.metadata).toEqual({ customInfo: 'details' })
  })

  it('should store errors in localStorage (up to 50)', () => {
    for (let i = 0; i < 55; i++) {
      errorLogger.logError(new Error(`Error ${i + 1}`))
    }

    const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
    expect(storedErrors.length).toBe(50)
    expect(storedErrors[0].message).toBe('Error 6') // Oldest error should be Error 6
    expect(storedErrors[49].message).toBe('Error 55') // Newest error
  })

  it('should not call console.error if NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production'
    const testError = new Error('Production error')

    errorLogger.logError(testError)

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    // Still should be stored in localStorage
    const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
    expect(storedErrors.length).toBe(1)
    expect(storedErrors[0].message).toBe('Production error')
  })

  // Tests for getStoredErrors and clearStoredErrors
  describe('getStoredErrors', () => {
    it('should retrieve stored errors from localStorage', () => {
      const testError = new Error('Stored error test')
      errorLogger.logError(testError)

      const errors = errorLogger.getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].message).toBe('Stored error test')
    })

    it('should return an empty array if no errors are stored', () => {
      const errors = errorLogger.getStoredErrors()
      expect(errors).toEqual([])
    })
  })

  describe('clearStoredErrors', () => {
    it('should remove errors from localStorage', () => {
      errorLogger.logError(new Error('Error to be cleared'))
      expect(JSON.parse(localStorage.getItem('app_errors') || '[]').length).toBe(1)

      errorLogger.clearStoredErrors()
      expect(localStorage.getItem('app_errors')).toBeNull()
    })
  })
})

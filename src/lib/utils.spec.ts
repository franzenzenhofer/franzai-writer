import { describe, it, expect } from 'vitest'
import { cn, generateUniqueId } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should handle conditional class names', () => {
    expect(cn('bg-red-500', { 'text-white': true, 'font-bold': false })).toBe('bg-red-500 text-white')
    expect(cn('bg-red-500', { 'text-white': false, 'font-bold': true })).toBe('bg-red-500 font-bold')
  })

  it('should handle falsy values', () => {
    expect(cn('bg-red-500', null, undefined, false, '')).toBe('bg-red-500')
    expect(cn(null, undefined, false, '', 'text-white')).toBe('text-white')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('p-4 p-2')).toBe('p-2')
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500')
  })
})

describe('generateUniqueId', () => {
  it('should generate an ID in the correct format', () => {
    const id = generateUniqueId()
    // Regex to check for base36timestamp + 'w' + 6 random base36 chars
    expect(id).toMatch(/^[a-z0-9]+w[a-z0-9]{6}$/)
  })

  it('should generate unique IDs', () => {
    const id1 = generateUniqueId()
    const id2 = generateUniqueId()
    expect(id1).not.toBe(id2)
  })

  it('should generate multiple unique IDs consistently', () => {
    const ids = new Set()
    for (let i = 0; i < 100; i++) {
      ids.add(generateUniqueId())
    }
    expect(ids.size).toBe(100)
  })
})

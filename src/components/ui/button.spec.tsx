import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest' // Added for Jest DOM matchers
import { Button } from './button'

describe('Button', () => {
  afterEach(() => {
    cleanup() // Clean up DOM after each test
  })

  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveClass('bg-primary text-primary-foreground')
  })

  it('renders children correctly', () => {
    render(<Button><span>Child Span</span></Button>)
    const buttonElement = screen.getByRole('button')
    expect(screen.getByText('Child Span')).toBeInTheDocument()
    expect(buttonElement).toContainHTML('<span>Child Span</span>')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(buttonElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Destructive</Button>)
    const buttonElement = screen.getByRole('button', { name: /destructive/i })
    expect(buttonElement).toHaveClass('bg-destructive text-destructive-foreground')
  })

  it('applies size classes correctly', () => {
    render(<Button size="sm">Small</Button>)
    const buttonElement = screen.getByRole('button', { name: /small/i })
    expect(buttonElement).toHaveClass('h-9 rounded-md px-3')
  })

  it('renders as child when asChild prop is true', () => {
    render(<Button asChild><a href="#">Link</a></Button>) // Added href="#"
    const linkElement = screen.getByRole('link', { name: /link/i })
    expect(linkElement).toBeInTheDocument()
    // Check if the button classes are applied to the child element
    expect(linkElement).toHaveClass('bg-primary text-primary-foreground')
  })
})

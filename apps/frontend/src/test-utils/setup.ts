import '@testing-library/jest-dom'

// Radix UI primitives (Select, etc.) rely on Pointer Capture and scrollIntoView,
// which jsdom does not implement. Stub them so component tests can drive them.
if (typeof window !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
}

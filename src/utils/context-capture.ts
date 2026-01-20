import type { ElementContext, AnimationInfo } from '../types';
import { getUniqueSelector } from './selector';

/**
 * Relevant CSS properties to capture for AI context
 */
const RELEVANT_STYLES = [
  'display',
  'position',
  'width',
  'height',
  'padding',
  'margin',
  'color',
  'backgroundColor',
  'fontSize',
  'fontWeight',
  'border',
  'borderRadius',
  'opacity',
  'transform',
  'transition',
  'animation',
  'boxShadow',
  'gap',
  'flexDirection',
  'justifyContent',
  'alignItems',
];

/**
 * Utility classes to skip when creating simplified selectors
 */
const UTILITY_CLASS_PATTERNS = [
  /^(flex|grid|block|inline|hidden)$/,
  /^(m|p|mt|mr|mb|ml|mx|my|pt|pr|pb|pl|px|py)-/,
  /^(w|h|min-w|min-h|max-w|max-h)-/,
  /^(text|font|leading|tracking)-/,
  /^(bg|border|rounded|shadow)-/,
  /^(absolute|relative|fixed|sticky)$/,
  /^(top|right|bottom|left)-/,
  /^(z)-/,
  /^(gap|space)-/,
  /^(items|justify|content|self)-/,
  /^(overflow|cursor|pointer-events)-/,
  /^(opacity|transition|transform|animate)-/,
  /^(sm|md|lg|xl|2xl):/,
];

/**
 * Capture full context for an element
 */
export function captureElementContext(element: HTMLElement): ElementContext {
  const rect = element.getBoundingClientRect();
  const computedStyles = window.getComputedStyle(element);

  // Extract relevant styles
  const styles: Record<string, string> = {};
  for (const prop of RELEVANT_STYLES) {
    const value = computedStyles.getPropertyValue(
      prop.replace(/([A-Z])/g, '-$1').toLowerCase()
    );
    if (value && value !== 'none' && value !== 'normal' && value !== '0px') {
      styles[prop] = value;
    }
  }

  // Capture animations
  const animations = captureAnimations(element);

  // Capture data attributes
  const attributes: Record<string, string> = {};
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-') || attr.name === 'class' || attr.name === 'id') {
      attributes[attr.name] = attr.value;
    }
  }

  return {
    selector: getUniqueSelector(element),
    tagName: element.tagName.toLowerCase(),
    componentName: getReactComponentName(element) || getSimplifiedSelector(element),
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    styles,
    animations,
    attributes,
    timestamp: Date.now(),
  };
}

/**
 * Capture animation state for an element
 */
function captureAnimations(element: HTMLElement): AnimationInfo[] {
  const animations = element.getAnimations();

  return animations.map(anim => {
    const effect = anim.effect as KeyframeEffect | null;
    const timing = effect?.getTiming();

    return {
      name: anim.id || (effect?.target as HTMLElement)?.style.animationName || 'unnamed',
      currentTime: anim.currentTime,
      duration: typeof timing?.duration === 'number' ? timing.duration : 0,
      playState: anim.playState,
    };
  });
}

/**
 * Extract React component name from element's fiber data
 */
function getReactComponentName(element: HTMLElement): string | null {
  // React 16+ stores fiber in __reactFiber$ or __reactInternalInstance$ prefixed keys
  const fiberKey = Object.keys(element).find(key =>
    key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
  );

  if (!fiberKey) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fiber = (element as any)[fiberKey];

  // Walk up fiber tree to find a named component (skip DOM elements like 'div', 'span')
  let current = fiber;
  while (current) {
    const type = current.type;
    if (type && typeof type !== 'string') {
      const name = type.displayName || type.name;
      if (name && !name.startsWith('_')) {
        return name;
      }
    }
    current = current.return;
  }

  return null;
}

/**
 * Check if a class name is a utility class (Tailwind, etc.)
 */
function isUtilityClass(className: string): boolean {
  return UTILITY_CLASS_PATTERNS.some(pattern => pattern.test(className));
}

/**
 * Create a simplified selector for the element
 */
function getSimplifiedSelector(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();

  // Check for id first
  if (element.id) {
    return `${tag}#${element.id}`;
  }

  // Find the most meaningful class (skip utility classes)
  const meaningfulClass = Array.from(element.classList).find(c => !isUtilityClass(c));

  if (meaningfulClass) {
    return `${tag}.${meaningfulClass}`;
  }

  // Fall back to tag name
  return tag;
}

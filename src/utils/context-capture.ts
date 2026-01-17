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
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
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

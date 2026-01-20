/**
 * Animation control utilities for pausing/resuming page animations
 */

let pausedAnimations: Animation[] = [];

/**
 * Pause all animations on the page
 */
export function pauseAllAnimations(): void {
  pausedAnimations = document.getAnimations();
  pausedAnimations.forEach(anim => anim.pause());
}

/**
 * Resume all previously paused animations
 */
export function resumeAllAnimations(): void {
  pausedAnimations.forEach(anim => anim.play());
  pausedAnimations = [];
}

/**
 * Check if animations are currently paused
 */
export function hasAnimationsPaused(): boolean {
  return pausedAnimations.length > 0;
}

import type { Annotation, GeneratedPrompt } from '../types';

/**
 * Generate a formatted prompt from annotations
 */
export function generatePrompt(annotations: Annotation[], url: string): GeneratedPrompt {
  const sections = annotations.map((annotation, index) => {
    return formatAnnotation(annotation, index + 1);
  });

  const prompt = `## UI Feedback for ${url}

${sections.join('\n\n---\n\n')}
`;

  return {
    id: crypto.randomUUID(),
    url,
    prompt,
    annotationCount: annotations.length,
    createdAt: Date.now(),
  };
}

/**
 * Format a single annotation as markdown
 */
function formatAnnotation(annotation: Annotation, index: number): string {
  const { note, context } = annotation;
  const lines: string[] = [];

  lines.push(`### Annotation ${index}`);
  lines.push('');
  lines.push(`**Note:** "${note}"`);
  lines.push('');
  lines.push(`**Element:** \`${context.selector}\``);

  // Add relevant styles
  const styleEntries = Object.entries(context.styles);
  if (styleEntries.length > 0) {
    const styleStr = styleEntries
      .slice(0, 6) // Limit to most important
      .map(([key, value]) => `${formatStyleKey(key)}: ${value}`)
      .join(', ');
    lines.push(`**Styles:** ${styleStr}`);
  }

  // Add animation info if present
  if (context.animations.length > 0) {
    const anim = context.animations[0];
    const progress = anim.currentTime && anim.duration
      ? Math.round((anim.currentTime / anim.duration) * 100)
      : null;

    lines.push(
      `**Animation:** ${anim.name}${progress !== null ? ` at ${progress}%` : ''} (${anim.duration}ms, ${anim.playState})`
    );
  }

  // Add position info
  lines.push(
    `**Position:** ${Math.round(context.rect.width)}x${Math.round(context.rect.height)} at (${Math.round(context.rect.left)}, ${Math.round(context.rect.top)})`
  );

  return lines.join('\n');
}

/**
 * Convert camelCase to kebab-case for display
 */
function formatStyleKey(key: string): string {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

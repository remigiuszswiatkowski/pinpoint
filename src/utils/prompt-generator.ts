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

  // Element - component name or simplified selector
  lines.push(`**Element:** ${context.componentName || context.tagName}`);

  // Position as percentage of viewport
  const posX = Math.round((context.rect.left / context.viewport.width) * 100);
  const posY = Math.round((context.rect.top / context.viewport.height) * 100);
  lines.push(`**Position:** ${posX}%, ${posY}%`);

  // Feedback (renamed from Note)
  lines.push(`**Feedback:** ${note}`);

  lines.push('');

  // Guidelines section
  lines.push('**Guidelines:**');
  lines.push('- preserve existing interaction patterns');
  lines.push('- maintain current animation logic unless specified');
  lines.push('- keep accessibility (aria labels, keyboard nav)');

  lines.push('');

  // Constraints section
  lines.push('**Constraints:**');
  lines.push('- mobile viewport must work');
  lines.push('- loading states must remain intact');

  return lines.join('\n');
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

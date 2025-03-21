import sanitizeHtml from 'sanitize-html';

export { sanitizeHtml };

export function extractTextFromHtml(html: string): string {
  // Primero sanitizamos el HTML para asegurarnos de que es seguro
  const cleanHtml = sanitizeHtml(html, {
    allowedTags: [], // No permitir ningún tag
    allowedAttributes: {}, // No permitir ningún atributo
  });

  // Reemplazar múltiples espacios en blanco con uno solo
  return cleanHtml
    .replace(/\s+/g, ' ')
    .trim();
} 
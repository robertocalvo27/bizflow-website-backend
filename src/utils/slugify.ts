/**
 * Convierte un string en un slug amigable para URLs.
 * @param text Texto a convertir en slug
 * @returns El slug generado
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
} 
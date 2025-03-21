/**
 * Convierte un string en un slug amigable para URLs.
 * @param text Texto a convertir en slug
 * @returns El slug generado
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '') // Elimina caracteres no alfanuméricos
    .replace(/\-\-+/g, '-') // Reemplaza múltiples guiones con uno solo
    .replace(/^-+/, '') // Elimina guiones del principio
    .replace(/-+$/, ''); // Elimina guiones del final
}; 
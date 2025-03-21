import { AutomatedContentInput } from '../types/automation.types';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
}

export interface ContentMetrics {
  wordCount: number;
  readingTime: number;
  headingsCount: number;
  imageCount: number;
  linkCount: number;
  keywordDensity: { [key: string]: number };
}

export function analyzeContent(content: string): ContentMetrics {
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Asumiendo 200 palabras por minuto
  const headingsCount = (content.match(/<h[1-6][^>]*>/g) || []).length;
  const imageCount = (content.match(/<img[^>]*>/g) || []).length;
  const linkCount = (content.match(/<a[^>]*>/g) || []).length;

  // Análisis básico de densidad de palabras clave
  const words = content.toLowerCase().split(/\s+/);
  const keywordDensity: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 3) { // Ignorar palabras muy cortas
      keywordDensity[word] = (keywordDensity[word] || 0) + 1;
    }
  });

  return {
    wordCount,
    readingTime,
    headingsCount,
    imageCount,
    linkCount,
    keywordDensity
  };
}

export async function validateAutomatedContent(input: AutomatedContentInput): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100; // Comenzamos con puntuación perfecta y restamos según problemas

  // 1. Validaciones básicas
  if (!input.title || input.title.length < 10) {
    errors.push('El título debe tener al menos 10 caracteres');
    score -= 20;
  }
  if (input.title && input.title.length > 100) {
    warnings.push('El título podría ser demasiado largo');
    score -= 5;
  }

  if (!input.content || input.content.length < 300) {
    errors.push('El contenido debe tener al menos 300 caracteres');
    score -= 30;
  }

  // 2. Análisis de métricas del contenido
  const metrics = analyzeContent(input.content);
  
  // Validar longitud del contenido
  if (metrics.wordCount < 500) {
    warnings.push('El contenido podría ser demasiado corto para un artículo completo');
    score -= 10;
  }

  // Validar estructura
  if (metrics.headingsCount < 2) {
    warnings.push('Se recomienda usar más encabezados para mejorar la estructura');
    score -= 5;
  }

  // Validar uso de imágenes
  if (metrics.imageCount === 0) {
    warnings.push('Se recomienda incluir al menos una imagen');
    score -= 5;
  }

  // Validar tiempo de lectura
  if (metrics.readingTime < 3) {
    warnings.push('El contenido podría ser demasiado corto para proporcionar valor significativo');
    score -= 5;
  }

  // 3. Validación SEO
  if (input.seoMetadata) {
    const seoScore = validateSEO(input.seoMetadata, input.title, input.content);
    score = Math.min(score, score * (seoScore / 100));
  }

  // 4. Validación de fuente
  if (!validateSource(input.source)) {
    errors.push('La fuente del contenido no es válida o confiable');
    score -= 20;
  }

  // 5. Validación de tags
  if (!input.tags || input.tags.length === 0) {
    warnings.push('Se recomienda incluir al menos un tag');
    score -= 5;
  } else if (input.tags.length > 10) {
    warnings.push('Demasiados tags pueden diluir la relevancia');
    score -= 5;
  }

  // Normalizar score
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0 && score >= 60,
    score,
    errors,
    warnings
  };
}

function validateSEO(seoMetadata: any, title: string, content: string): number {
  let seoScore = 100;

  // Validar meta título
  if (!seoMetadata.metaTitle) {
    seoScore -= 20;
  } else if (seoMetadata.metaTitle.length < 30 || seoMetadata.metaTitle.length > 60) {
    seoScore -= 10;
  }

  // Validar meta descripción
  if (!seoMetadata.metaDescription) {
    seoScore -= 20;
  } else if (seoMetadata.metaDescription.length < 120 || seoMetadata.metaDescription.length > 160) {
    seoScore -= 10;
  }

  // Validar keywords
  if (!seoMetadata.keywords || seoMetadata.keywords.length === 0) {
    seoScore -= 10;
  } else if (seoMetadata.keywords.length > 10) {
    seoScore -= 5;
  }

  return Math.max(0, seoScore);
}

function validateSource(source: any): boolean {
  if (!source.type) return false;

  // Validar según el tipo de fuente
  switch (source.type) {
    case 'rss':
      return !!source.rssSource && isValidUrl(source.rssSource);
    case 'url':
      return !!source.originalUrl && isValidUrl(source.originalUrl);
    case 'ai':
      return source.confidence !== undefined && source.confidence >= 0.7;
    default:
      return false;
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 
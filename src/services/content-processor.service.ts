import { Service } from 'typedi';
import { AutomatedContentInput } from '../types/automation.types';
import { ContentMetrics, analyzeContent } from '../utils/validation';
import { sanitizeHtml, extractTextFromHtml } from '../utils/html-utils';

export interface ProcessedContent {
  content: string;
  excerpt: string;
  readabilityScore: number;
  metrics: ContentMetrics;
  suggestedTags: string[];
}

@Service()
export class ContentProcessorService {
  async processContent(input: AutomatedContentInput): Promise<ProcessedContent> {
    // 1. Sanitizar el contenido HTML
    const sanitizedContent = await this.sanitizeContent(input.content);

    // 2. Generar excerpt si no existe
    const excerpt = input.excerpt || await this.generateExcerpt(sanitizedContent);

    // 3. Analizar métricas del contenido
    const metrics = await this.analyzeContent(sanitizedContent);

    // 4. Calcular score de legibilidad
    const readabilityScore = await this.calculateReadabilityScore(sanitizedContent);

    // 5. Sugerir tags basados en el contenido
    const suggestedTags = await this.suggestTags(sanitizedContent, input.tags || []);

    return {
      content: sanitizedContent,
      excerpt,
      readabilityScore,
      metrics,
      suggestedTags
    };
  }

  private async sanitizeContent(content: string): Promise<string> {
    // Sanitizar HTML manteniendo estructura válida y eliminando scripts maliciosos
    return sanitizeHtml(content, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'img', 'ul', 'ol', 'li',
        'blockquote', 'em', 'strong', 'br'
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        'img': ['src', 'alt', 'title']
      },
      allowedSchemes: ['http', 'https', 'mailto']
    });
  }

  private async generateExcerpt(content: string): Promise<string> {
    const plainText = extractTextFromHtml(content);
    const words = plainText.split(/\s+/);
    const excerpt = words.slice(0, 50).join(' ');
    return excerpt.length < plainText.length ? `${excerpt}...` : excerpt;
  }

  private async analyzeContent(content: string): Promise<ContentMetrics> {
    return analyzeContent(content);
  }

  private async calculateReadabilityScore(content: string): Promise<number> {
    const text = extractTextFromHtml(content);
    
    // Implementar algoritmo de Flesch-Kincaid
    const sentences = text.split(/[.!?]+/);
    const words = text.split(/\s+/);
    const syllables = this.countSyllables(text);

    const averageWordsPerSentence = words.length / sentences.length;
    const averageSyllablesPerWord = syllables / words.length;

    // Fórmula Flesch-Kincaid
    const score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);

    // Normalizar score a 0-100
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(text: string): number {
    // Implementación básica de conteo de sílabas
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((count, word) => {
      return count + this.countWordSyllables(word);
    }, 0);
  }

  private countWordSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    // Reglas básicas para contar sílabas en español
    const vowels = 'aeiouáéíóúü';
    let count = 0;
    let prevIsVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevIsVowel) {
        count++;
      }
      prevIsVowel = isVowel;
    }

    return count || 1;
  }

  private async suggestTags(content: string, existingTags: string[]): Promise<string[]> {
    const text = extractTextFromHtml(content);
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq: { [key: string]: number } = {};

    // Contar frecuencia de palabras
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Ordenar por frecuencia y filtrar palabras comunes
    const commonWords = new Set(['para', 'como', 'este', 'esta', 'pero', 'más', 'cuando']);
    const suggestedTags = Object.entries(wordFreq)
      .filter(([word]) => !commonWords.has(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Combinar con tags existentes y eliminar duplicados
    return [...new Set([...existingTags, ...suggestedTags])];
  }
} 
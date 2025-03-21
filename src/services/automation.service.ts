import { Service } from 'typedi';
import { AutomatedContent, AutomatedContentInput, PublishStatus } from '../types/automation.types';
import { prisma } from '../database/prisma';
import { validateAutomatedContent } from '../utils/validation';
import { ContentProcessorService } from './content-processor.service';

@Service()
export class AutomationService {
  constructor(
    private readonly contentProcessor: ContentProcessorService
  ) {}

  async createContent(input: AutomatedContentInput): Promise<AutomatedContent> {
    // Procesar el contenido
    const processedContent = await this.contentProcessor.processContent(input);

    // Crear el contenido con los datos procesados
    const content = await prisma.automatedContent.create({
      data: {
        title: input.title,
        content: processedContent.content,
        excerpt: processedContent.excerpt,
        featuredImage: input.featuredImage,
        tags: processedContent.suggestedTags.join(','), // Convertir array a string
        seoMetadata: {
          ...input.seoMetadata,
          readabilityScore: processedContent.readabilityScore,
          contentMetrics: processedContent.metrics
        },
        status: PublishStatus.PUBLISHED,
        source: {
          ...input.source,
          processedAt: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Convertir el string de tags de vuelta a array para la respuesta
    return {
      ...content,
      tags: content.tags.split(','),
      warnings: [],
    };
  }

  async updateContent(id: string, input: AutomatedContentInput): Promise<AutomatedContent> {
    // Procesar el contenido actualizado
    const processedContent = await this.contentProcessor.processContent(input);

    // Actualizar el contenido con los datos procesados
    const content = await prisma.automatedContent.update({
      where: { id },
      data: {
        title: input.title,
        content: processedContent.content,
        excerpt: processedContent.excerpt,
        featuredImage: input.featuredImage,
        tags: processedContent.suggestedTags.join(','),
        seoMetadata: {
          ...input.seoMetadata,
          readabilityScore: processedContent.readabilityScore,
          contentMetrics: processedContent.metrics
        },
        source: {
          ...input.source,
          processedAt: new Date().toISOString()
        },
        updatedAt: new Date(),
      },
    });

    return {
      ...content,
      tags: content.tags.split(','),
      warnings: [],
    };
  }

  async getContent(id: string): Promise<AutomatedContent | null> {
    const content = await prisma.automatedContent.findUnique({
      where: { id },
    });

    if (!content) return null;

    return {
      ...content,
      tags: content.tags.split(','),
    };
  }

  async listContent(status?: PublishStatus): Promise<AutomatedContent[]> {
    const contents = await prisma.automatedContent.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return contents.map(content => ({
      ...content,
      tags: content.tags.split(','),
    }));
  }
} 
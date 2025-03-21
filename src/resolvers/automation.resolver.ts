import { Resolver, Mutation, Arg, Query, UseMiddleware } from 'type-graphql';
import { AutomatedContent, AutomatedContentInput, AutomationResponse, PublishStatus } from '../types/automation.types';
import { isAuthenticated, isServiceAccount } from '../middleware/auth.middleware';
import { validateAutomatedContent } from '../utils/validation';
import { AutomationService } from '../services/automation.service';

@Resolver()
export class AutomationResolver {
  constructor(
    private readonly automationService: AutomationService
  ) {}

  @Mutation(() => AutomationResponse)
  @UseMiddleware(isAuthenticated, isServiceAccount)
  async createAutomatedContent(
    @Arg('input') input: AutomatedContentInput
  ): Promise<AutomationResponse> {
    try {
      // Validar el contenido antes de procesarlo
      const validationResult = await validateAutomatedContent(input);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          status: 'validation_failed',
          errors: validationResult.errors
        };
      }

      // Procesar y guardar el contenido
      const result = await this.automationService.createContent(input);
      
      return {
        success: true,
        postId: result.id,
        status: 'published',
        warnings: result.warnings
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        errors: [error.message]
      };
    }
  }

  @Mutation(() => AutomationResponse)
  @UseMiddleware(isAuthenticated, isServiceAccount)
  async updateAutomatedContent(
    @Arg('id') id: string,
    @Arg('input') input: AutomatedContentInput
  ): Promise<AutomationResponse> {
    try {
      const result = await this.automationService.updateContent(id, input);
      
      return {
        success: true,
        postId: result.id,
        status: 'updated',
        warnings: result.warnings
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        errors: [error.message]
      };
    }
  }

  @Query(() => AutomatedContent, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async getAutomatedContent(
    @Arg('id') id: string
  ): Promise<AutomatedContent | null> {
    return this.automationService.getContent(id);
  }

  @Query(() => [AutomatedContent])
  @UseMiddleware(isAuthenticated)
  async listAutomatedContent(
    @Arg('status', { nullable: true }) status?: PublishStatus
  ): Promise<AutomatedContent[]> {
    return this.automationService.listContent(status);
  }
} 
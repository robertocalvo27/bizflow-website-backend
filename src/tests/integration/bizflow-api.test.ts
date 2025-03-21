import { BizflowApiClient } from '../../clients/bizflow-api.client';
import { 
  AutomatedContentDTO, 
  CreateAutomatedContentDTO, 
  UpdateAutomatedContentDTO,
  ValidateContentDTO,
  ProcessContentDTO
} from '../../types/dtos/automated-content.dto';

describe('BizflowApiClient Integration Tests', () => {
  let client: BizflowApiClient;
  let testContentId: string;

  beforeAll(() => {
    client = new BizflowApiClient(process.env.BIZFLOW_API_URL || 'http://localhost:4000');
  });

  beforeEach(async () => {
    // Autenticar antes de cada test
    try {
      await client.authenticate({
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'testpass123'
      });
    } catch (error) {
      console.error('Error en la autenticación:', error);
      throw error;
    }
  });

  describe('Automated Content Operations', () => {
    const testContent: CreateAutomatedContentDTO = {
      title: 'Test Content',
      content: 'This is a test content for integration testing.',
      type: 'blog',
      metadata: {
        keywords: ['test', 'integration'],
        category: 'testing'
      }
    };

    it('should create automated content', async () => {
      const result = await client.createAutomatedContent(testContent);
      expect(result).toBeDefined();
      expect(result.title).toBe(testContent.title);
      expect(result.content).toBe(testContent.content);
      testContentId = result.id;
    });

    it('should get automated content by id', async () => {
      const result = await client.getAutomatedContent(testContentId);
      expect(result).toBeDefined();
      expect(result.id).toBe(testContentId);
      expect(result.title).toBe(testContent.title);
    });

    it('should list automated content', async () => {
      const result = await client.listAutomatedContent({
        page: 1,
        limit: 10
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should update automated content', async () => {
      const updateData: UpdateAutomatedContentDTO = {
        title: 'Updated Test Content',
        metadata: {
          keywords: ['test', 'integration', 'updated'],
          category: 'testing'
        }
      };

      const result = await client.updateAutomatedContent(testContentId, updateData);
      expect(result).toBeDefined();
      expect(result.title).toBe(updateData.title);
      expect(result.metadata.keywords).toContain('updated');
    });

    it('should validate content', async () => {
      const validateData: ValidateContentDTO = {
        title: 'Test Content for Validation',
        content: 'This is a test content that needs to be validated.',
        type: 'blog'
      };

      const result = await client.validateContent(validateData);
      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should process content', async () => {
      const processData: ProcessContentDTO = {
        content: '# Test Content\n\nThis is a test content that needs to be processed.',
        options: {
          generateExcerpt: true,
          calculateReadability: true,
          suggestTags: true
        }
      };

      const result = await client.processContent(processData);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.excerpt).toBeDefined();
      expect(result.readabilityScore).toBeDefined();
      expect(Array.isArray(result.suggestedTags)).toBe(true);
    });

    it('should delete automated content', async () => {
      const result = await client.deleteAutomatedContent(testContentId);
      expect(result).toBeDefined();

      // Verificar que el contenido fue eliminado
      await expect(client.getAutomatedContent(testContentId)).rejects.toThrow();
    });
  });

  describe('Monitoring Operations', () => {
    it('should get system status', async () => {
      const result = await client.getSystemStatus();
      expect(result).toBeDefined();
      expect(result.system).toBeDefined();
      expect(result.process).toBeDefined();
    });

    it('should get metrics', async () => {
      const result = await client.getMetrics({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      expect(result).toBeDefined();
    });
  });
}); 
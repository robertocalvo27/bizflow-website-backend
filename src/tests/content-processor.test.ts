import { ContentProcessorService } from '../services/content-processor.service';
import { AutomatedContentInput } from '../types/automation.types';

describe('ContentProcessorService', () => {
  let service: ContentProcessorService;

  beforeEach(() => {
    service = new ContentProcessorService();
  });

  describe('processContent', () => {
    it('should process content successfully', async () => {
      const input: AutomatedContentInput = {
        title: 'Test Article',
        content: '<h1>Test</h1><p>This is a test article with some content.</p><img src="test.jpg" alt="test">',
        tags: ['test'],
        source: {
          type: 'test',
          confidence: 0.9
        }
      };

      const result = await service.processContent(input);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.excerpt).toBeDefined();
      expect(result.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.readabilityScore).toBeLessThanOrEqual(100);
      expect(result.metrics).toBeDefined();
      expect(result.suggestedTags).toBeDefined();
    });

    it('should sanitize HTML content', async () => {
      const input: AutomatedContentInput = {
        title: 'Test Article',
        content: '<h1>Test</h1><script>alert("malicious")</script><p>Safe content</p>',
        tags: ['test'],
        source: {
          type: 'test',
          confidence: 0.9
        }
      };

      const result = await service.processContent(input);

      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('<h1>');
      expect(result.content).toContain('<p>');
    });

    it('should generate excerpt when not provided', async () => {
      const input: AutomatedContentInput = {
        title: 'Test Article',
        content: '<p>' + 'Long content. '.repeat(100) + '</p>',
        tags: ['test'],
        source: {
          type: 'test',
          confidence: 0.9
        }
      };

      const result = await service.processContent(input);

      expect(result.excerpt).toBeDefined();
      expect(result.excerpt.length).toBeLessThan(input.content.length);
      expect(result.excerpt).toContain('...');
    });

    it('should calculate readability score', async () => {
      const input: AutomatedContentInput = {
        title: 'Test Article',
        content: '<p>' + 'Simple test content with basic sentences. '.repeat(10) + '</p>',
        tags: ['test'],
        source: {
          type: 'test',
          confidence: 0.9
        }
      };

      const result = await service.processContent(input);

      expect(result.readabilityScore).toBeGreaterThan(0);
      expect(result.readabilityScore).toBeLessThanOrEqual(100);
    });

    it('should suggest relevant tags', async () => {
      const input: AutomatedContentInput = {
        title: 'Test Article about Technology',
        content: '<p>This is an article about artificial intelligence and machine learning.</p>',
        tags: ['tech'],
        source: {
          type: 'test',
          confidence: 0.9
        }
      };

      const result = await service.processContent(input);

      expect(result.suggestedTags).toContain('tech');
      expect(result.suggestedTags.some(tag => 
        tag.includes('artificial') || 
        tag.includes('intelligence') || 
        tag.includes('machine') || 
        tag.includes('learning')
      )).toBeTruthy();
    });
  });
}); 
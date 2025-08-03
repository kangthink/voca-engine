import { VocaEngine } from '../VocaEngine';
import { MockLLMProvider } from '../../providers';
import { InputType } from '../../types';

describe('VocaEngine', () => {
  let engine: VocaEngine;
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
    engine = new VocaEngine({
      llmProvider: mockProvider,
      defaultSuggestionCount: 5
    });
  });

  describe('addInput', () => {
    it('should add an expression input', async () => {
      const content = '노래 소리가 잔잔하게 들린다';
      const input = await engine.addInput(InputType.Expression, content);
      
      expect(input.type).toBe(InputType.Expression);
      expect(input.content).toBe(content);
      expect(input.id).toBeDefined();
    });

    it('should throw error for empty content', async () => {
      await expect(engine.addInput(InputType.Expression, ''))
        .rejects.toThrow('Input content cannot be empty');
    });

    it('should trim whitespace from content', async () => {
      const input = await engine.addInput(InputType.Expression, '  test  ');
      expect(input.content).toBe('test');
    });
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions for an input', async () => {
      const input = await engine.addInput(InputType.Expression, '잔잔하게');
      const suggestion = await engine.generateSuggestions(input.id);
      
      expect(suggestion.inputId).toBe(input.id);
      expect(suggestion.candidates).toBeDefined();
      expect(suggestion.candidates.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent input', async () => {
      await expect(engine.generateSuggestions('non-existent-id'))
        .rejects.toThrow('Input with id non-existent-id not found');
    });
  });

  describe('createCollection', () => {
    it('should create a collection', async () => {
      const name = '일상 표현 모음';
      const collection = await engine.createCollection(name);
      
      expect(collection.name).toBe(name);
      expect(collection.id).toBeDefined();
      expect(collection.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for empty name', async () => {
      await expect(engine.createCollection(''))
        .rejects.toThrow('Collection name cannot be empty');
    });

    it('should trim whitespace from name', async () => {
      const collection = await engine.createCollection('  test  ');
      expect(collection.name).toBe('test');
    });
  });

  describe('saveEntry', () => {
    it('should save an entry to a collection', async () => {
      // Setup
      const input = await engine.addInput(InputType.Expression, '테스트');
      const suggestion = await engine.generateSuggestions(input.id);
      const collection = await engine.createCollection('테스트 컬렉션');
      
      // Save entry
      const entry = await engine.saveEntry(
        input.id, 
        suggestion.id, 
        collection.id, 
        ['tag1', 'tag2']
      );
      
      expect(entry.input.id).toBe(input.id);
      expect(entry.suggestion.id).toBe(suggestion.id);
      expect(entry.collectionId).toBe(collection.id);
      expect(entry.tags).toEqual(['tag1', 'tag2']);
    });

    it('should validate that suggestion belongs to input', async () => {
      const input1 = await engine.addInput(InputType.Expression, '테스트1');
      const input2 = await engine.addInput(InputType.Expression, '테스트2');
      const suggestion1 = await engine.generateSuggestions(input1.id);
      const collection = await engine.createCollection('테스트');
      
      await expect(engine.saveEntry(input2.id, suggestion1.id, collection.id))
        .rejects.toThrow('Suggestion does not belong to the specified input');
    });
  });

  describe('searchEntries', () => {
    it('should search entries by content', async () => {
      // Setup
      const input = await engine.addInput(InputType.Expression, '노래 소리');
      const suggestion = await engine.generateSuggestions(input.id);
      const collection = await engine.createCollection('테스트');
      await engine.saveEntry(input.id, suggestion.id, collection.id);
      
      // Search
      const results = await engine.searchEntries(collection.id, '노래');
      expect(results).toHaveLength(1);
      expect(results[0].input.content).toContain('노래');
    });

    it('should return all entries for empty query', async () => {
      const input = await engine.addInput(InputType.Expression, '테스트');
      const suggestion = await engine.generateSuggestions(input.id);
      const collection = await engine.createCollection('테스트');
      await engine.saveEntry(input.id, suggestion.id, collection.id);
      
      const allEntries = await engine.listEntries(collection.id);
      const searchResults = await engine.searchEntries(collection.id, '');
      
      expect(searchResults).toEqual(allEntries);
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', async () => {
      // Create some test data
      const collection = await engine.createCollection('테스트');
      const input = await engine.addInput(InputType.Expression, '테스트');
      const suggestion = await engine.generateSuggestions(input.id);
      await engine.saveEntry(input.id, suggestion.id, collection.id);
      
      const stats = await engine.getStats();
      
      expect(stats.collections).toBe(1);
      expect(stats.entries).toBe(1);
      expect(stats.totalSuggestions).toBeGreaterThan(0);
    });
  });
});
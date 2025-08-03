import { 
  VocaEngineOperations, 
  VocaEngineConfig, 
  LLMProvider, 
  StorageProvider, 
  InputType,
  ExpressionInput as IExpressionInput,
  Suggestion as ISuggestion,
  Collection as ICollection,
  Entry as IEntry
} from '../types';

import { ExpressionInput, Suggestion, Collection, Entry } from '../models';
import { InMemoryStorage } from '../utils/InMemoryStorage';

export class VocaEngine implements VocaEngineOperations {
  private llmProvider: LLMProvider;
  private storage: StorageProvider;
  private config: {
    defaultSuggestionCount: number;
  };

  constructor(config: VocaEngineConfig) {
    this.llmProvider = config.llmProvider;
    this.storage = config.storage || new InMemoryStorage();
    this.config = {
      defaultSuggestionCount: config.defaultSuggestionCount || 5
    };
  }

  async addInput(type: InputType, content: string): Promise<IExpressionInput> {
    if (!content || content.trim().length === 0) {
      throw new Error('Input content cannot be empty');
    }

    const input = new ExpressionInput(type, content.trim());
    return await this.storage.saveInput(input);
  }

  async generateSuggestions(inputId: string): Promise<ISuggestion> {
    const input = await this.storage.getInput(inputId);
    if (!input) {
      throw new Error(`Input with id ${inputId} not found`);
    }

    try {
      const candidates = await this.llmProvider.generateVocabularySuggestions(input);
      
      if (!candidates || candidates.length === 0) {
        throw new Error('No suggestions generated');
      }

      const suggestion = new Suggestion(inputId, candidates);
      return await this.storage.saveSuggestion(suggestion);
    } catch (error) {
      throw new Error(`Failed to generate suggestions: ${error}`);
    }
  }

  async createCollection(name: string): Promise<ICollection> {
    if (!name || name.trim().length === 0) {
      throw new Error('Collection name cannot be empty');
    }

    const collection = new Collection(name.trim());
    return await this.storage.saveCollection(collection);
  }

  async listCollections(): Promise<ICollection[]> {
    return await this.storage.listCollections();
  }

  async saveEntry(
    inputId: string, 
    suggestionId: string, 
    collectionId: string, 
    tags?: string[]
  ): Promise<IEntry> {
    // Validate all required entities exist
    const input = await this.storage.getInput(inputId);
    if (!input) {
      throw new Error(`Input with id ${inputId} not found`);
    }

    const suggestion = await this.storage.getSuggestion(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion with id ${suggestionId} not found`);
    }

    const collection = await this.storage.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    // Validate that the suggestion belongs to the input
    if (suggestion.inputId !== inputId) {
      throw new Error('Suggestion does not belong to the specified input');
    }

    // Clean and validate tags
    const cleanTags = tags ? 
      tags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      : [];

    const entry = new Entry(input, suggestion, collectionId, cleanTags);
    return await this.storage.saveEntry(entry);
  }

  async listEntries(collectionId: string): Promise<IEntry[]> {
    const collection = await this.storage.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    return await this.storage.listEntries(collectionId);
  }

  async deleteEntry(entryId: string): Promise<void> {
    const entry = await this.storage.getEntry(entryId);
    if (!entry) {
      throw new Error(`Entry with id ${entryId} not found`);
    }

    await this.storage.deleteEntry(entryId);
  }

  async searchEntries(collectionId: string, query: string): Promise<IEntry[]> {
    if (!query || query.trim().length === 0) {
      return await this.listEntries(collectionId);
    }

    const collection = await this.storage.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    return await this.storage.searchEntries({
      collectionId,
      query: query.trim()
    });
  }

  async renameCollection(collectionId: string, newName: string): Promise<ICollection> {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Collection name cannot be empty');
    }

    const collection = await this.storage.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    return await this.storage.updateCollection(collectionId, { 
      name: newName.trim() 
    });
  }

  // Additional utility methods
  async getInputById(id: string): Promise<IExpressionInput | null> {
    return await this.storage.getInput(id);
  }

  async getSuggestionById(id: string): Promise<ISuggestion | null> {
    return await this.storage.getSuggestion(id);
  }

  async getCollectionById(id: string): Promise<ICollection | null> {
    return await this.storage.getCollection(id);
  }

  async getEntryById(id: string): Promise<IEntry | null> {
    return await this.storage.getEntry(id);
  }

  async updateEntryTags(entryId: string, tags: string[]): Promise<IEntry> {
    const entry = await this.storage.getEntry(entryId);
    if (!entry) {
      throw new Error(`Entry with id ${entryId} not found`);
    }

    // Clean tags
    const cleanTags = tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

    const updatedEntry = new Entry(
      entry.input,
      entry.suggestion,
      entry.collectionId,
      cleanTags,
      entry.id
    );

    return await this.storage.saveEntry(updatedEntry);
  }

  async searchAllEntries(query: string, options?: { tags?: string[]; limit?: number }): Promise<IEntry[]> {
    return await this.storage.searchEntries({
      query: query.trim(),
      tags: options?.tags,
      limit: options?.limit
    });
  }

  // Configuration methods
  configureLLMProvider(config: Record<string, any>): void {
    this.llmProvider.configure(config);
  }

  setDefaultSuggestionCount(count: number): void {
    this.config.defaultSuggestionCount = Math.max(1, Math.min(10, count));
  }

  getDefaultSuggestionCount(): number {
    return this.config.defaultSuggestionCount;
  }

  // Export/Import functionality for data persistence
  async exportData(): Promise<Record<string, any>> {
    if (this.storage instanceof InMemoryStorage) {
      return this.storage.exportData();
    }
    
    // For other storage providers, we'd need to implement export logic
    throw new Error('Export not supported for this storage provider');
  }

  async importData(data: Record<string, any>): Promise<void> {
    if (this.storage instanceof InMemoryStorage) {
      this.storage.importData(data);
      return;
    }
    
    // For other storage providers, we'd need to implement import logic
    throw new Error('Import not supported for this storage provider');
  }

  // Statistics and debugging
  async getStats(): Promise<{ collections: number; entries: number; totalSuggestions: number }> {
    const collections = await this.listCollections();
    let totalEntries = 0;
    let totalSuggestions = 0;

    for (const collection of collections) {
      const entries = await this.listEntries(collection.id);
      totalEntries += entries.length;
      totalSuggestions += entries.reduce((sum, entry) => sum + entry.suggestion.candidates.length, 0);
    }

    return {
      collections: collections.length,
      entries: totalEntries,
      totalSuggestions
    };
  }
}
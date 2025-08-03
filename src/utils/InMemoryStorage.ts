import { 
  StorageProvider, 
  ExpressionInput, 
  Suggestion, 
  Collection, 
  Entry, 
  SearchOptions 
} from '../types';

export class InMemoryStorage implements StorageProvider {
  private inputs: Map<string, ExpressionInput> = new Map();
  private suggestions: Map<string, Suggestion> = new Map();
  private collections: Map<string, Collection> = new Map();
  private entries: Map<string, Entry> = new Map();

  async saveInput(input: ExpressionInput): Promise<ExpressionInput> {
    this.inputs.set(input.id, input);
    return input;
  }

  async getInput(id: string): Promise<ExpressionInput | null> {
    return this.inputs.get(id) || null;
  }

  async saveSuggestion(suggestion: Suggestion): Promise<Suggestion> {
    this.suggestions.set(suggestion.id, suggestion);
    return suggestion;
  }

  async getSuggestion(id: string): Promise<Suggestion | null> {
    return this.suggestions.get(id) || null;
  }

  async saveCollection(collection: Collection): Promise<Collection> {
    this.collections.set(collection.id, collection);
    return collection;
  }

  async getCollection(id: string): Promise<Collection | null> {
    return this.collections.get(id) || null;
  }

  async listCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async saveEntry(entry: Entry): Promise<Entry> {
    this.entries.set(entry.id, entry);
    return entry;
  }

  async getEntry(id: string): Promise<Entry | null> {
    return this.entries.get(id) || null;
  }

  async listEntries(collectionId: string): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.collectionId === collectionId)
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime()); // Most recent first
  }

  async deleteEntry(entryId: string): Promise<void> {
    this.entries.delete(entryId);
  }

  async searchEntries(options: SearchOptions): Promise<Entry[]> {
    let results = Array.from(this.entries.values());

    // Filter by collection if specified
    if (options.collectionId) {
      results = results.filter(entry => entry.collectionId === options.collectionId);
    }

    // Filter by query
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(entry => {
        // Search in input content
        if (entry.input.content.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in suggestion candidates
        if (entry.suggestion.candidates.some(candidate => 
          candidate.toLowerCase().includes(query)
        )) {
          return true;
        }
        
        // Search in tags
        if (entry.tags.some(tag => tag.toLowerCase().includes(query))) {
          return true;
        }
        
        return false;
      });
    }

    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      results = results.filter(entry => 
        options.tags!.every(tag => entry.tags.includes(tag))
      );
    }

    // Sort by most recent first
    results.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || results.length;
    
    return results.slice(offset, offset + limit);
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    const existing = this.collections.get(id);
    if (!existing) {
      throw new Error(`Collection with id ${id} not found`);
    }

    const updated: Collection = {
      ...existing,
      ...updates,
      id: existing.id, // Ensure ID cannot be changed
      createdAt: existing.createdAt // Ensure createdAt cannot be changed
    };

    this.collections.set(id, updated);
    return updated;
  }

  // Utility methods for testing and debugging
  clear(): void {
    this.inputs.clear();
    this.suggestions.clear();
    this.collections.clear();
    this.entries.clear();
  }

  getStats(): { inputs: number; suggestions: number; collections: number; entries: number } {
    return {
      inputs: this.inputs.size,
      suggestions: this.suggestions.size,
      collections: this.collections.size,
      entries: this.entries.size
    };
  }

  exportData(): Record<string, any> {
    return {
      inputs: Array.from(this.inputs.values()),
      suggestions: Array.from(this.suggestions.values()),
      collections: Array.from(this.collections.values()),
      entries: Array.from(this.entries.values())
    };
  }

  importData(data: Record<string, any>): void {
    this.clear();
    
    if (data.inputs) {
      data.inputs.forEach((input: ExpressionInput) => this.inputs.set(input.id, input));
    }
    
    if (data.suggestions) {
      data.suggestions.forEach((suggestion: Suggestion) => this.suggestions.set(suggestion.id, suggestion));
    }
    
    if (data.collections) {
      data.collections.forEach((collection: Collection) => this.collections.set(collection.id, collection));
    }
    
    if (data.entries) {
      data.entries.forEach((entry: Entry) => this.entries.set(entry.id, entry));
    }
  }
}
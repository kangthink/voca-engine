/**
 * Core type definitions for VocaEngine
 * Based on the DSL specification in spec.md
 */

export enum InputType {
  Expression = 'expression',
  Explanation = 'explanation',
  Image = 'image'
}

export interface ExpressionInput {
  id: string;
  type: InputType;
  content: string;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  inputId: string;
  candidates: string[];
  generatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Entry {
  id: string;
  input: ExpressionInput;
  suggestion: Suggestion;
  collectionId: string;
  tags: string[];
  savedAt: Date;
}

// Operation types for engine interface
export interface VocaEngineOperations {
  addInput(type: InputType, content: string): Promise<ExpressionInput>;
  generateSuggestions(inputId: string): Promise<Suggestion>;
  createCollection(name: string): Promise<Collection>;
  listCollections(): Promise<Collection[]>;
  saveEntry(inputId: string, suggestionId: string, collectionId: string, tags?: string[]): Promise<Entry>;
  listEntries(collectionId: string): Promise<Entry[]>;
  deleteEntry(entryId: string): Promise<void>;
  searchEntries(collectionId: string, query: string): Promise<Entry[]>;
  renameCollection(collectionId: string, newName: string): Promise<Collection>;
}

// LLM Provider interface
export interface LLMProvider {
  generateVocabularySuggestions(input: ExpressionInput): Promise<string[]>;
  configure(config: Record<string, any>): void;
}

// Context for suggestion generation
export interface SuggestionContext {
  inputType: InputType;
  content: string;
  previousSuggestions?: string[];
  tags?: string[];
}

// Search options
export interface SearchOptions {
  query: string;
  collectionId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// Configuration options for VocaEngine
export interface VocaEngineConfig {
  llmProvider: LLMProvider;
  storage?: StorageProvider;
  defaultSuggestionCount?: number;
}

// Storage provider interface for data persistence
export interface StorageProvider {
  saveInput(input: ExpressionInput): Promise<ExpressionInput>;
  getInput(id: string): Promise<ExpressionInput | null>;
  saveSuggestion(suggestion: Suggestion): Promise<Suggestion>;
  getSuggestion(id: string): Promise<Suggestion | null>;
  saveCollection(collection: Collection): Promise<Collection>;
  getCollection(id: string): Promise<Collection | null>;
  listCollections(): Promise<Collection[]>;
  saveEntry(entry: Entry): Promise<Entry>;
  getEntry(id: string): Promise<Entry | null>;
  listEntries(collectionId: string): Promise<Entry[]>;
  deleteEntry(entryId: string): Promise<void>;
  searchEntries(options: SearchOptions): Promise<Entry[]>;
  updateCollection(id: string, updates: Partial<Collection>): Promise<Collection>;
}

// CLI-specific types
export interface CLIOptions {
  input?: string;
  type?: string;
  collection?: string;
  tags?: string;
  output?: string;
  apiKey?: string;
  verbose?: boolean;
}

export interface CLIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}
// Browser-compatible entry point for VocaEngine
// Excludes CLI and Node.js specific functionality

export { VocaEngine } from './engine';
export { MockLLMProvider } from './providers';
export { InMemoryStorage } from './utils';
export { 
  ExpressionInput, 
  Suggestion, 
  Collection, 
  Entry 
} from './models';

// Export types but not OpenAIProvider for browser compatibility
export type {
  InputType,
  ExpressionInput as IExpressionInput,
  Suggestion as ISuggestion,
  Collection as ICollection,
  Entry as IEntry,
  VocaEngineOperations,
  LLMProvider,
  SuggestionContext,
  SearchOptions,
  VocaEngineConfig,
  StorageProvider
} from './types';
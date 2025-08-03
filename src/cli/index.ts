#!/usr/bin/env node

import { Command } from 'commander';
import { VocaEngine } from '../engine';
import { OpenAIProvider, MockLLMProvider } from '../providers';
import { InputType } from '../types';

const program = new Command();

// Global engine instance
let engine: VocaEngine | null = null;

// Initialize engine with appropriate provider
function initializeEngine(useMock: boolean = false): VocaEngine {
  if (!engine) {
    const provider = useMock 
      ? new MockLLMProvider()
      : new OpenAIProvider(process.env.OPENAI_API_KEY);
    
    engine = new VocaEngine({
      llmProvider: provider,
      defaultSuggestionCount: 5
    });
  }
  return engine;
}

// Helper function to output JSON response
function outputJSON(data: any, success: boolean = true, error?: string) {
  const response = {
    success,
    data: success ? data : undefined,
    error: error || undefined,
    timestamp: new Date()
  };
  console.log(JSON.stringify(response, null, 2));
}

// Helper function to parse input type
function parseInputType(type: string): InputType {
  switch (type.toLowerCase()) {
    case 'expression':
    case 'expr':
      return InputType.Expression;
    case 'explanation':
    case 'explain':
      return InputType.Explanation;
    case 'image':
    case 'img':
      return InputType.Image;
    default:
      throw new Error(`Invalid input type: ${type}. Use 'expression', 'explanation', or 'image'`);
  }
}

// Helper function to parse tags
function parseTags(tagsString?: string): string[] {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

program
  .name('voca-engine')
  .description('Vocabulary enhancement assistant CLI')
  .version('1.0.0');

// Add input command
program
  .command('add-input')
  .description('Add a new input (expression, explanation, or image)')
  .requiredOption('-t, --type <type>', 'Input type: expression, explanation, or image')
  .requiredOption('-c, --content <content>', 'Input content')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const inputType = parseInputType(options.type);
      const input = await vocaEngine.addInput(inputType, options.content);
      outputJSON(input);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Generate suggestions command
program
  .command('generate')
  .description('Generate vocabulary suggestions for an input')
  .requiredOption('-i, --input-id <id>', 'Input ID to generate suggestions for')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const suggestion = await vocaEngine.generateSuggestions(options.inputId);
      outputJSON(suggestion);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Create collection command
program
  .command('create-collection')
  .description('Create a new collection')
  .requiredOption('-n, --name <name>', 'Collection name')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const collection = await vocaEngine.createCollection(options.name);
      outputJSON(collection);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// List collections command
program
  .command('list-collections')
  .description('List all collections')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const collections = await vocaEngine.listCollections();
      outputJSON(collections);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Save entry command
program
  .command('save-entry')
  .description('Save an entry to a collection')
  .requiredOption('-i, --input-id <id>', 'Input ID')
  .requiredOption('-s, --suggestion-id <id>', 'Suggestion ID')
  .requiredOption('-c, --collection-id <id>', 'Collection ID')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const tags = parseTags(options.tags);
      const entry = await vocaEngine.saveEntry(
        options.inputId,
        options.suggestionId,
        options.collectionId,
        tags
      );
      outputJSON(entry);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// List entries command
program
  .command('list-entries')
  .description('List entries in a collection')
  .requiredOption('-c, --collection-id <id>', 'Collection ID')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const entries = await vocaEngine.listEntries(options.collectionId);
      outputJSON(entries);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Search entries command
program
  .command('search')
  .description('Search entries in a collection')
  .requiredOption('-c, --collection-id <id>', 'Collection ID')
  .requiredOption('-q, --query <query>', 'Search query')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const entries = await vocaEngine.searchEntries(options.collectionId, options.query);
      outputJSON(entries);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Delete entry command
program
  .command('delete-entry')
  .description('Delete an entry')
  .requiredOption('-e, --entry-id <id>', 'Entry ID to delete')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      await vocaEngine.deleteEntry(options.entryId);
      outputJSON({ message: 'Entry deleted successfully' });
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Rename collection command
program
  .command('rename-collection')
  .description('Rename a collection')
  .requiredOption('-c, --collection-id <id>', 'Collection ID')
  .requiredOption('-n, --new-name <name>', 'New collection name')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const collection = await vocaEngine.renameCollection(options.collectionId, options.newName);
      outputJSON(collection);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Quick workflow command
program
  .command('quick')
  .description('Quick workflow: add input, generate suggestions, and display results')
  .requiredOption('-t, --type <type>', 'Input type: expression, explanation, or image')
  .requiredOption('-c, --content <content>', 'Input content')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      
      // Add input
      const inputType = parseInputType(options.type);
      const input = await vocaEngine.addInput(inputType, options.content);
      
      // Generate suggestions
      const suggestion = await vocaEngine.generateSuggestions(input.id);
      
      // Output combined result
      outputJSON({
        input,
        suggestion
      });
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show engine statistics')
  .option('--mock', 'Use mock LLM provider for testing')
  .action(async (options) => {
    try {
      const vocaEngine = initializeEngine(options.mock);
      const stats = await vocaEngine.getStats();
      outputJSON(stats);
    } catch (error) {
      outputJSON(null, false, (error as Error).message);
      process.exit(1);
    }
  });

// Example commands
program
  .command('examples')
  .description('Show example usage commands')
  .action(() => {
    const examples = [
      '# Add an expression input',
      'voca-engine add-input -t expression -c "노래 소리가 잔잔하게 들린다"',
      '',
      '# Generate suggestions for an input (use the ID from previous command)',
      'voca-engine generate -i <input-id>',
      '',
      '# Quick workflow (add input and generate suggestions in one command)',
      'voca-engine quick -t expression -c "노래 소리가 잔잔하게 들린다"',
      '',
      '# Create a collection',
      'voca-engine create-collection -n "일상 표현 모음"',
      '',
      '# Save entry to collection',
      'voca-engine save-entry -i <input-id> -s <suggestion-id> -c <collection-id> -t "카페,감성"',
      '',
      '# List all collections',
      'voca-engine list-collections',
      '',
      '# List entries in a collection',
      'voca-engine list-entries -c <collection-id>',
      '',
      '# Search entries',
      'voca-engine search -c <collection-id> -q "노래"',
      '',
      '# Use mock provider for testing (add --mock to any command)',
      'voca-engine quick -t expression -c "테스트 표현" --mock',
      '',
      '# Show statistics',
      'voca-engine stats'
    ];
    
    console.log(examples.join('\n'));
  });

// Configure command for API key
program
  .command('config')
  .description('Configure OpenAI API key')
  .option('--show', 'Show current API key status')
  .action((options) => {
    if (options.show) {
      const hasKey = !!process.env.OPENAI_API_KEY;
      outputJSON({
        hasApiKey: hasKey,
        message: hasKey 
          ? 'OpenAI API key is configured' 
          : 'OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.'
      });
    } else {
      console.log('To configure OpenAI API key, set the OPENAI_API_KEY environment variable:');
      console.log('export OPENAI_API_KEY=your-api-key-here');
      console.log('');
      console.log('Or use --mock flag to use the mock provider for testing.');
    }
  });

// Parse command line arguments
program.parse();
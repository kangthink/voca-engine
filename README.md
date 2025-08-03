# VocaEngine

A vocabulary enhancement assistant that helps users collect, manage, and reuse vocabulary suggestions through AI-powered generation and organized collections.

## Features

- **Multiple Input Types**: Support for expressions, explanations, and images
- **AI-Powered Suggestions**: Generate vocabulary alternatives using OpenAI or mock providers
- **Collection Management**: Organize vocabulary entries into named collections
- **Tagging System**: Add tags to entries for better organization and searchability
- **Search Functionality**: Find entries by content, suggestions, or tags
- **CLI Interface**: Complete command-line interface for all operations
- **TypeScript Support**: Full TypeScript support with type definitions
- **Cross-Platform**: Works in Node.js and browser environments

## Installation

```bash
npm install voca-engine
```

## Quick Start

### Using the CLI

```bash
# Install globally for CLI access
npm install -g voca-engine

# Quick workflow: add input and generate suggestions
voca-engine quick -t expression -c "노래 소리가 잔잔하게 들린다"

# Create a collection
voca-engine create-collection -n "일상 표현 모음"

# Use mock provider for testing
voca-engine quick -t expression -c "테스트 표현" --mock
```

### Using as a Library

```typescript
import { VocaEngine, OpenAIProvider, InputType } from 'voca-engine';

// Initialize with OpenAI provider
const provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
const engine = new VocaEngine({
  llmProvider: provider,
  defaultSuggestionCount: 5
});

// Add input and generate suggestions
const input = await engine.addInput(InputType.Expression, "노래 소리가 잔잔하게 들린다");
const suggestions = await engine.generateSuggestions(input.id);

// Create collection and save entry
const collection = await engine.createCollection("일상 표현 모음");
const entry = await engine.saveEntry(
  input.id, 
  suggestions.id, 
  collection.id, 
  ["카페", "감성"]
);
```

## API Reference

### Core Operations

#### `addInput(type, content)`
Add a new input for vocabulary generation.

```typescript
const input = await engine.addInput(InputType.Expression, "잔잔하게 들린다");
```

#### `generateSuggestions(inputId)`
Generate vocabulary suggestions for an input.

```typescript
const suggestions = await engine.generateSuggestions(input.id);
```

#### `createCollection(name)`
Create a new collection for organizing entries.

```typescript
const collection = await engine.createCollection("감성 표현");
```

#### `saveEntry(inputId, suggestionId, collectionId, tags?)`
Save an entry (input + suggestion) to a collection.

```typescript
const entry = await engine.saveEntry(input.id, suggestion.id, collection.id, ["태그1", "태그2"]);
```

#### `searchEntries(collectionId, query)`
Search entries within a collection.

```typescript
const results = await engine.searchEntries(collection.id, "노래");
```

### Data Types

#### InputType
```typescript
enum InputType {
  Expression = 'expression',    // 표현
  Explanation = 'explanation',  // 설명
  Image = 'image'              // 이미지
}
```

#### ExpressionInput
```typescript
interface ExpressionInput {
  id: string;
  type: InputType;
  content: string;
  createdAt: Date;
}
```

#### Suggestion
```typescript
interface Suggestion {
  id: string;
  inputId: string;
  candidates: string[];
  generatedAt: Date;
}
```

#### Collection
```typescript
interface Collection {
  id: string;
  name: string;
  createdAt: Date;
}
```

#### Entry
```typescript
interface Entry {
  id: string;
  input: ExpressionInput;
  suggestion: Suggestion;
  collectionId: string;
  tags: string[];
  savedAt: Date;
}
```

## CLI Commands

### Basic Operations

```bash
# Add input
voca-engine add-input -t expression -c "노래 소리가 잔잔하게 들린다"

# Generate suggestions
voca-engine generate -i <input-id>

# Quick workflow (add input + generate suggestions)
voca-engine quick -t expression -c "잔잔한 소리"
```

### Collection Management

```bash
# Create collection
voca-engine create-collection -n "일상 표현 모음"

# List collections
voca-engine list-collections

# Rename collection
voca-engine rename-collection -c <collection-id> -n "새로운 이름"
```

### Entry Management

```bash
# Save entry to collection
voca-engine save-entry -i <input-id> -s <suggestion-id> -c <collection-id> -t "tag1,tag2"

# List entries in collection
voca-engine list-entries -c <collection-id>

# Search entries
voca-engine search -c <collection-id> -q "검색어"

# Delete entry
voca-engine delete-entry -e <entry-id>
```

### Utility Commands

```bash
# Show statistics
voca-engine stats

# Show examples
voca-engine examples

# Configure API key
voca-engine config

# Use mock provider for testing
voca-engine quick -t expression -c "테스트" --mock
```

## Configuration

### OpenAI API Key

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=your-api-key-here
```

### Mock Provider

For testing without an API key, use the `--mock` flag:

```bash
voca-engine quick -t expression -c "테스트 표현" --mock
```

## Examples

### Example Workflow

```bash
# 1. Add an expression input
voca-engine add-input -t expression -c "노래 소리가 잔잔하게 들린다"
# Output: {"success": true, "data": {"id": "abc123", ...}}

# 2. Generate suggestions
voca-engine generate -i abc123
# Output: {"success": true, "data": {"id": "def456", "candidates": ["부드럽게", "조용히", ...]}}

# 3. Create a collection
voca-engine create-collection -n "일상 표현 모음"
# Output: {"success": true, "data": {"id": "ghi789", ...}}

# 4. Save entry to collection
voca-engine save-entry -i abc123 -s def456 -c ghi789 -t "카페,감성"
# Output: {"success": true, "data": {"id": "jkl012", ...}}

# 5. Search entries
voca-engine search -c ghi789 -q "노래"
# Output: {"success": true, "data": [{"id": "jkl012", ...}]}
```

### Programmatic Usage

```typescript
import { VocaEngine, MockLLMProvider, InputType } from 'voca-engine';

// Use mock provider for testing
const engine = new VocaEngine({
  llmProvider: new MockLLMProvider(),
  defaultSuggestionCount: 5
});

async function example() {
  // Add different types of inputs
  const expression = await engine.addInput(
    InputType.Expression, 
    "노래 소리가 잔잔하게 들린다"
  );
  
  const explanation = await engine.addInput(
    InputType.Explanation,
    "카페에서 노래를 들으며 창을 바라보는 상황"
  );
  
  // Generate suggestions
  const suggestions1 = await engine.generateSuggestions(expression.id);
  const suggestions2 = await engine.generateSuggestions(explanation.id);
  
  // Create collections
  const dailyExpressions = await engine.createCollection("일상 표현");
  const situationalExpressions = await engine.createCollection("상황별 표현");
  
  // Save entries with tags
  await engine.saveEntry(
    expression.id, 
    suggestions1.id, 
    dailyExpressions.id, 
    ["음악", "감성"]
  );
  
  await engine.saveEntry(
    explanation.id, 
    suggestions2.id, 
    situationalExpressions.id, 
    ["카페", "분위기"]
  );
  
  // Search across all entries
  const musicEntries = await engine.searchAllEntries("음악");
  const cafeEntries = await engine.searchEntries(situationalExpressions.id, "카페");
  
  // Get statistics
  const stats = await engine.getStats();
  console.log(`Total collections: ${stats.collections}`);
  console.log(`Total entries: ${stats.entries}`);
  console.log(`Total suggestions: ${stats.totalSuggestions}`);
}
```

## Browser Usage

```typescript
import { VocaEngine, MockLLMProvider } from 'voca-engine/browser';

// Browser environment only supports MockLLMProvider
const engine = new VocaEngine({
  llmProvider: new MockLLMProvider()
});

// Same API as Node.js version
const input = await engine.addInput(InputType.Expression, "테스트");
const suggestions = await engine.generateSuggestions(input.id);
```

## Development

### Setup

```bash
git clone <repository>
cd voca-engine
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### CLI Development

```bash
npm run dev  # Watch mode for development
npm run cli  # Run CLI in development mode
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
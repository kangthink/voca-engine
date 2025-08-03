import { v4 as uuidv4 } from 'uuid';
import { Entry as IEntry, ExpressionInput, Suggestion } from '../types';

export class Entry implements IEntry {
  public readonly id: string;
  public readonly input: ExpressionInput;
  public readonly suggestion: Suggestion;
  public readonly collectionId: string;
  public readonly tags: string[];
  public readonly savedAt: Date;

  constructor(
    input: ExpressionInput,
    suggestion: Suggestion,
    collectionId: string,
    tags: string[] = [],
    id?: string
  ) {
    this.id = id || uuidv4();
    this.input = input;
    this.suggestion = suggestion;
    this.collectionId = collectionId;
    this.tags = [...tags]; // Create a copy to prevent mutations
    this.savedAt = new Date();
  }

  static create(
    input: ExpressionInput,
    suggestion: Suggestion,
    collectionId: string,
    tags?: string[]
  ): Entry {
    return new Entry(input, suggestion, collectionId, tags);
  }

  static fromJSON(data: any): Entry {
    const entry = new Entry(
      data.input,
      data.suggestion,
      data.collectionId,
      data.tags,
      data.id
    );
    (entry as any).savedAt = new Date(data.savedAt);
    return entry;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      input: this.input,
      suggestion: this.suggestion,
      collectionId: this.collectionId,
      tags: [...this.tags],
      savedAt: this.savedAt.toISOString()
    };
  }

  getTags(): string[] {
    return [...this.tags];
  }

  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  hasTags(tags: string[]): boolean {
    return tags.every(tag => this.hasTag(tag));
  }

  addTag(tag: string): Entry {
    if (this.hasTag(tag)) {
      return this;
    }
    return new Entry(
      this.input,
      this.suggestion,
      this.collectionId,
      [...this.tags, tag],
      this.id
    );
  }

  removeTag(tag: string): Entry {
    const newTags = this.tags.filter(t => t !== tag);
    return new Entry(
      this.input,
      this.suggestion,
      this.collectionId,
      newTags,
      this.id
    );
  }

  updateTags(tags: string[]): Entry {
    return new Entry(
      this.input,
      this.suggestion,
      this.collectionId,
      [...tags],
      this.id
    );
  }

  matchesQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    
    // Search in input content
    if (this.input.content.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in suggestion candidates
    if (this.suggestion.candidates.some(candidate => 
      candidate.toLowerCase().includes(lowerQuery)
    )) {
      return true;
    }
    
    // Search in tags
    if (this.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    return false;
  }

  getInputType(): string {
    return this.input.type;
  }

  getCandidateCount(): number {
    return this.suggestion.candidates.length;
  }
}
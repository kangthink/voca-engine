import { v4 as uuidv4 } from 'uuid';
import { Suggestion as ISuggestion } from '../types';

export class Suggestion implements ISuggestion {
  public readonly id: string;
  public readonly inputId: string;
  public readonly candidates: string[];
  public readonly generatedAt: Date;

  constructor(inputId: string, candidates: string[], id?: string) {
    this.id = id || uuidv4();
    this.inputId = inputId;
    this.candidates = [...candidates]; // Create a copy to prevent mutations
    this.generatedAt = new Date();
  }

  static create(inputId: string, candidates: string[]): Suggestion {
    return new Suggestion(inputId, candidates);
  }

  static fromJSON(data: any): Suggestion {
    const suggestion = new Suggestion(data.inputId, data.candidates, data.id);
    (suggestion as any).generatedAt = new Date(data.generatedAt);
    return suggestion;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      inputId: this.inputId,
      candidates: [...this.candidates],
      generatedAt: this.generatedAt.toISOString()
    };
  }

  getCandidates(): string[] {
    return [...this.candidates];
  }

  getCandidateCount(): number {
    return this.candidates.length;
  }

  hasCandidates(): boolean {
    return this.candidates.length > 0;
  }

  addCandidate(candidate: string): Suggestion {
    return new Suggestion(this.inputId, [...this.candidates, candidate], this.id);
  }

  filterCandidates(predicate: (candidate: string) => boolean): Suggestion {
    const filteredCandidates = this.candidates.filter(predicate);
    return new Suggestion(this.inputId, filteredCandidates, this.id);
  }
}
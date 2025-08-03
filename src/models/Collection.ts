import { v4 as uuidv4 } from 'uuid';
import { Collection as ICollection } from '../types';

export class Collection implements ICollection {
  public readonly id: string;
  public readonly name: string;
  public readonly createdAt: Date;

  constructor(name: string, id?: string) {
    this.id = id || uuidv4();
    this.name = name;
    this.createdAt = new Date();
  }

  static create(name: string): Collection {
    return new Collection(name);
  }

  static fromJSON(data: any): Collection {
    const collection = new Collection(data.name, data.id);
    (collection as any).createdAt = new Date(data.createdAt);
    return collection;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt.toISOString()
    };
  }

  rename(newName: string): Collection {
    return new Collection(newName, this.id);
  }

  isValidName(): boolean {
    return this.name.trim().length > 0;
  }

  getDisplayName(): string {
    return this.name.trim();
  }
}
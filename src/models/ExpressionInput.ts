import { v4 as uuidv4 } from 'uuid';
import { InputType, ExpressionInput as IExpressionInput } from '../types';

export class ExpressionInput implements IExpressionInput {
  public readonly id: string;
  public readonly type: InputType;
  public readonly content: string;
  public readonly createdAt: Date;

  constructor(type: InputType, content: string, id?: string) {
    this.id = id || uuidv4();
    this.type = type;
    this.content = content;
    this.createdAt = new Date();
  }

  static createExpression(content: string): ExpressionInput {
    return new ExpressionInput(InputType.Expression, content);
  }

  static createExplanation(content: string): ExpressionInput {
    return new ExpressionInput(InputType.Explanation, content);
  }

  static createImage(content: string): ExpressionInput {
    return new ExpressionInput(InputType.Image, content);
  }

  static fromJSON(data: any): ExpressionInput {
    const input = new ExpressionInput(data.type, data.content, data.id);
    (input as any).createdAt = new Date(data.createdAt);
    return input;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      createdAt: this.createdAt.toISOString()
    };
  }

  isExpression(): boolean {
    return this.type === InputType.Expression;
  }

  isExplanation(): boolean {
    return this.type === InputType.Explanation;
  }

  isImage(): boolean {
    return this.type === InputType.Image;
  }
}
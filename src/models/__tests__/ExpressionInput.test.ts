import { ExpressionInput } from '../ExpressionInput';
import { InputType } from '../../types';

describe('ExpressionInput', () => {
  it('should create an expression input', () => {
    const content = '노래 소리가 잔잔하게 들린다';
    const input = ExpressionInput.createExpression(content);
    
    expect(input.type).toBe(InputType.Expression);
    expect(input.content).toBe(content);
    expect(input.id).toBeDefined();
    expect(input.createdAt).toBeInstanceOf(Date);
  });

  it('should create an explanation input', () => {
    const content = '카페에서 노래를 들으며 창을 바라보는 상황';
    const input = ExpressionInput.createExplanation(content);
    
    expect(input.type).toBe(InputType.Explanation);
    expect(input.content).toBe(content);
  });

  it('should create an image input', () => {
    const content = 'https://example.com/image.jpg';
    const input = ExpressionInput.createImage(content);
    
    expect(input.type).toBe(InputType.Image);
    expect(input.content).toBe(content);
  });

  it('should serialize to and from JSON', () => {
    const original = ExpressionInput.createExpression('테스트');
    const json = original.toJSON();
    const restored = ExpressionInput.fromJSON(json);
    
    expect(restored.id).toBe(original.id);
    expect(restored.type).toBe(original.type);
    expect(restored.content).toBe(original.content);
    expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
  });

  it('should have type checking methods', () => {
    const expression = ExpressionInput.createExpression('test');
    const explanation = ExpressionInput.createExplanation('test');
    const image = ExpressionInput.createImage('test');
    
    expect(expression.isExpression()).toBe(true);
    expect(expression.isExplanation()).toBe(false);
    expect(expression.isImage()).toBe(false);
    
    expect(explanation.isExpression()).toBe(false);
    expect(explanation.isExplanation()).toBe(true);
    expect(explanation.isImage()).toBe(false);
    
    expect(image.isExpression()).toBe(false);
    expect(image.isExplanation()).toBe(false);
    expect(image.isImage()).toBe(true);
  });
});
import { OpenAI } from 'openai';
import { LLMProvider, ExpressionInput, InputType } from '../types';

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;
  private config: Record<string, any>;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    
    this.config = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 150,
      suggestionCount: 5
    };
  }

  configure(config: Record<string, any>): void {
    this.config = { ...this.config, ...config };
    
    if (config.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.apiKey
      });
    }
  }

  async generateVocabularySuggestions(input: ExpressionInput): Promise<string[]> {
    try {
      const prompt = this.buildPrompt(input);
      
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: '당신은 한국어 어휘 향상을 돕는 전문가입니다. 사용자의 입력에 대해 더 다양하고 풍부한 어휘 표현을 제안해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseSuggestions(content);
    } catch (error) {
      console.error('Error generating suggestions with OpenAI:', error);
      throw new Error(`Failed to generate vocabulary suggestions: ${error}`);
    }
  }

  private buildPrompt(input: ExpressionInput): string {
    const baseInstruction = `다음 ${this.getInputTypeDescription(input.type)}에 대해 ${this.config.suggestionCount}개의 어휘 대안을 제안해주세요.`;
    
    switch (input.type) {
      case InputType.Expression:
        return `${baseInstruction}

표현: "${input.content}"

위 표현을 더 풍부하고 다양하게 표현할 수 있는 어휘나 구문을 제안해주세요. 각 제안은 한 줄씩 번호 없이 나열해주세요.`;

      case InputType.Explanation:
        return `${baseInstruction}

상황 설명: "${input.content}"

위 상황을 표현할 때 사용할 수 있는 감각적이고 생동감 있는 어휘나 표현을 제안해주세요. 각 제안은 한 줄씩 번호 없이 나열해주세요.`;

      case InputType.Image:
        return `${baseInstruction}

이미지 정보: "${input.content}"

위 이미지를 묘사할 때 사용할 수 있는 시각적이고 표현력이 풍부한 어휘나 구문을 제안해주세요. 각 제안은 한 줄씩 번호 없이 나열해주세요.`;

      default:
        return `${baseInstruction}

내용: "${input.content}"

위 내용과 관련된 다양한 어휘 표현을 제안해주세요. 각 제안은 한 줄씩 번호 없이 나열해주세요.`;
    }
  }

  private getInputTypeDescription(type: InputType): string {
    switch (type) {
      case InputType.Expression:
        return '표현';
      case InputType.Explanation:
        return '상황 설명';
      case InputType.Image:
        return '이미지';
      default:
        return '입력';
    }
  }

  private parseSuggestions(content: string): string[] {
    // Split by lines and clean up
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.match(/^\d+\./)) // Remove numbered lists
      .filter(line => !line.includes(':')) // Remove lines with colons (likely headers)
      .slice(0, this.config.suggestionCount);

    // If we got fewer suggestions than expected, pad with generic ones
    while (lines.length < this.config.suggestionCount && lines.length < 5) {
      lines.push(`대안 표현 ${lines.length + 1}`);
    }

    return lines;
  }

  // Utility methods
  getModel(): string {
    return this.config.model;
  }

  setModel(model: string): void {
    this.config.model = model;
  }

  setTemperature(temperature: number): void {
    this.config.temperature = Math.max(0, Math.min(2, temperature));
  }

  setSuggestionCount(count: number): void {
    this.config.suggestionCount = Math.max(1, Math.min(10, count));
  }
}
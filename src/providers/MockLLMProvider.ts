import { LLMProvider, ExpressionInput, InputType } from '../types';

export class MockLLMProvider implements LLMProvider {
  private config: Record<string, any> = {};

  configure(config: Record<string, any>): void {
    this.config = { ...this.config, ...config };
  }

  async generateVocabularySuggestions(input: ExpressionInput): Promise<string[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock suggestions based on input type and content
    switch (input.type) {
      case InputType.Expression:
        return this.generateExpressionSuggestions(input.content);
      
      case InputType.Explanation:
        return this.generateExplanationSuggestions(input.content);
      
      case InputType.Image:
        return this.generateImageSuggestions(input.content);
      
      default:
        return ['제안1', '제안2', '제안3'];
    }
  }

  private generateExpressionSuggestions(content: string): string[] {
    const suggestions: Record<string, string[]> = {
      '잔잔하게': ['부드럽게', '조용히', '평온하게', '고요하게', '은은하게'],
      '들린다': ['울려 퍼진다', '들려온다', '스며든다', '전해진다', '흘러나온다'],
      '노래': ['멜로디', '선율', '가락', '음성', '하모니'],
      '소리': ['음향', '울림', '반향', '목소리', '음성']
    };

    // Find matching keywords and return suggestions
    for (const [keyword, words] of Object.entries(suggestions)) {
      if (content.includes(keyword)) {
        return words;
      }
    }

    // Default suggestions for expressions
    return [
      '아름답게 표현된',
      '감성적인',
      '서정적인',
      '운율이 있는',
      '정감이 넘치는'
    ];
  }

  private generateExplanationSuggestions(content: string): string[] {
    if (content.includes('카페')) {
      return [
        '아늑한 분위기',
        '따뜻한 공간',
        '여유로운 시간',
        '감성적인 순간',
        '일상의 쉼표'
      ];
    }

    if (content.includes('창')) {
      return [
        '바깥 풍경',
        '시야에 들어오는',
        '창밖의 세상',
        '유리창 너머',
        '투명한 경계'
      ];
    }

    // Default suggestions for explanations
    return [
      '상황적 맥락',
      '분위기 있는',
      '감정이 담긴',
      '순간적인',
      '인상적인'
    ];
  }

  private generateImageSuggestions(content: string): string[] {
    if (content.includes('풍경') || content.includes('landscape')) {
      return [
        '파노라마',
        '장관',
        '경치',
        '전망',
        '비스타'
      ];
    }

    // Default suggestions for images
    return [
      '시각적 표현',
      '이미지로 담긴',
      '화면 속의',
      '포착된 순간',
      '그림 같은'
    ];
  }

  // Additional utility methods for testing
  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  setDelay(ms: number): void {
    this.config.delay = ms;
  }

  addCustomSuggestions(keyword: string, suggestions: string[]): void {
    if (!this.config.customSuggestions) {
      this.config.customSuggestions = {};
    }
    this.config.customSuggestions[keyword] = suggestions;
  }
}
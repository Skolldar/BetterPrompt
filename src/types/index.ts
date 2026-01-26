
export interface AIService {
    generatePrompt: (prompt: string) => AsyncIterable<string>;
}

export type AIState = {
    generatedPrompt: string;
    isGenerating: boolean;
    generatePrompt: (prompt: string) => Promise<void>;
}
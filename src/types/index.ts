
export interface AIService {
    generatePrompt: (prompt: string, style?: "professional" | "simple", humanize?: boolean) => AsyncIterable<string>;
}

export type AIState = {
    generatedPrompt: string;
    isGenerating: boolean;
    generatePrompt: (prompt: string, style?: "professional" | "simple", humanize?: boolean) => Promise<void>;
}
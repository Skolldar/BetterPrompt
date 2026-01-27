import { create } from "zustand";
import type { AIState } from "../types";
import aiService from "../services/AIService";  

const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog: number[] = [];

const enforceRateLimit = () => {
    const now = Date.now();
    // Drop old entries
    while (requestLog.length && now - requestLog[0] > REQUEST_WINDOW_MS) {
        requestLog.shift();
    }

    if (requestLog.length >= MAX_REQUESTS_PER_WINDOW) {
        throw new Error("Rate limit reached. Please wait a moment before trying again.");
    }

    requestLog.push(now);
};

const validateImprovedPrompt = (text: string) => {
    const normalized = text.trim();

    if (!normalized) {
        throw new Error("The model returned an empty response. Please try again.");
    }

    if (normalized.length < 20) {
        throw new Error("The improved prompt is too short. Please provide a clearer prompt and try again.");
    }

    const hasInstruction = /(write|create|generate|draft|compose|summarize|produce)/i.test(normalized);
    if (!hasInstruction) {
        throw new Error("The response does not look like a prompt. Please try again with a clearer request.");
    }

    const looksLikeAnswer = /(here's your answer|as an ai language model|sure, i can)/i.test(normalized);
    if (looksLikeAnswer) {
        throw new Error("The response looks like an answer, not a refined prompt. Please try again.");
    }

    return normalized;
};

const useAIState = create<AIState>((set) => ({
    generatedPrompt: "",
    isGenerating: false,
    generatePrompt: async (userGoal: string) => {
        set({ isGenerating: true, generatedPrompt: "" });

        try {
            enforceRateLimit();
            const data = aiService.generatePrompt(userGoal);

            let fullResponse = "";
            for await (const textPart of data) {
                fullResponse += textPart;
                set((state) => ({
                    generatedPrompt: state.generatedPrompt + textPart,
                }));
            }

            const validated = validateImprovedPrompt(fullResponse);
            set({ generatedPrompt: validated, isGenerating: false });
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Unable to generate prompt.";
            set({ isGenerating: false, generatedPrompt: message });
            throw error;
        }
    },
}));

export default useAIState;
import { create } from "zustand";
import type { AIState } from "../types";
import aiService from "../services/AIService";  

const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog: number[] = [];

const enforceRateLimit = () => {
    const now = Date.now();
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

    return normalized;
};

const getStoredPrompt = () => {
    try {
        return localStorage.getItem("prompt_generatedPrompt") || "";
    } catch {
        return "";
    }
};

const savePromptToStorage = (prompt: string) => {
    try {
        localStorage.setItem("prompt_generatedPrompt", prompt);
    } catch {
        console.warn("Failed to save prompt to localStorage");
    }
};

const useAIState = create<AIState>((set) => ({
    generatedPrompt: getStoredPrompt(),
    isGenerating: false,
    generatePrompt: async (userGoal: string, style: "professional" | "simple" = "professional", humanize: boolean = false) => {
        set({ isGenerating: true, generatedPrompt: "" });

        try {
            enforceRateLimit();
            const data = aiService.generatePrompt(userGoal, style, humanize);

            let fullResponse = "";
            for await (const textPart of data) {
                fullResponse += textPart;
                set((state) => ({
                    generatedPrompt: state.generatedPrompt + textPart,
                }));
            }

            const validated = validateImprovedPrompt(fullResponse);
            set({ generatedPrompt: validated, isGenerating: false });
            savePromptToStorage(validated);
        } catch (error) {
            console.error(error);
            set({ isGenerating: false, generatedPrompt: "" });
            throw error;
        }
    },
}));

export default useAIState;
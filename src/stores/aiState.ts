import { create } from "zustand";
import type { AIState } from "../types";
import aiService from "../services/AIService";  

const useAIState = create<AIState>((set) => ({
    generatedPrompt: "",
    isGenerating: false,
    generatePrompt: async (userGoal: string) => {
        set({ isGenerating: true, generatedPrompt: "" });
        const data = aiService.generatePrompt(userGoal);

        for await (const textPart of data) {
            set((state) => ({
                generatedPrompt: state.generatedPrompt + textPart,
            }));
        }

        set({ isGenerating: false });
    },
}));

export default useAIState;
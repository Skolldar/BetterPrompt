import { create } from "zustand";
import AIService from "../services/AIService";

export type AIState = {
    generatedPrompt: string;
    isGenerating: boolean;
    generatePrompt: (prompt: string) => Promise<void>;
};

const useAIState = create<AIState>((set) => ({
    generatedPrompt: "",
    isGenerating: false,
    generatePrompt: async (userGoal: string) => {
        set({ isGenerating: true, generatedPrompt: "" });
        const data = await AIService.generatePrompt(userGoal);

        for await (const textPart of data) {
            set((state) => ({
                generatedPrompt: state.generatedPrompt + textPart,
            }));
        }

        set({ isGenerating: false });
    },
}));

export default useAIState;
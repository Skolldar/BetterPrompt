import { streamText } from "ai";
import { openRouter } from "../lib/ai";
import type { AIService } from "../types";

const aiService: AIService = {
    generatePrompt(userGoal: string) {
        const result = streamText({
            model: openRouter("liquid/lfm-2.5-1.2b-instruct:free"),
            prompt: `Your only task is to improve the following text so it becomes a clear, detailed, and effective prompt for an AI. Do not answer questions, do not perform any other task, and do not return anything except the improved prompt. This service is strictly for prompt enhancement to help users communicate with other AIs. Input: ${userGoal}`,
            system: "You are an expert prompt generator. You must not answer questions, perform any other task, or return anything except the improved prompt. Only enhance the text for prompt generation. This service is strictly for prompt improvement to help users communicate with other AIs.",
        });
        return result.textStream;
    },
};

export default aiService;
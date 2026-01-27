import { streamText } from "ai";
import { openRouter } from "../lib/ai";
import type { AIService } from "../types";

// Basic guardrails to ensure we only accept prompt-improvement use cases
const questionLikeRegex = /^(who|what|where|when|why|how|is|are|can)\b/i;
const forbiddenPhrases = [
    "ignore previous instructions",
    "system prompt",
    "jailbreak",
    "prompt injection",
];

const validateUserGoal = (userGoal: string) => {
    const trimmed = userGoal.trim();

    if (!trimmed) {
        throw new Error("Please provide a prompt to improve.");
    }

    if (trimmed.length < 10) {
        throw new Error("Please provide a bit more detail so we can improve your prompt.");
    }

    if (trimmed.length > 500) {
        throw new Error("Prompt is too long. Please keep it under 500 characters.");
    }

    if (questionLikeRegex.test(trimmed) && !/prompt|improve|rewrite|refine/i.test(trimmed)) {
        throw new Error("This tool only improves prompts. Describe the prompt you want refined.");
    }

    if (forbiddenPhrases.some((phrase) => trimmed.toLowerCase().includes(phrase))) {
        throw new Error("Unsafe or out-of-scope request. Please stick to prompt improvement.");
    }

    return trimmed;
};

const aiService: AIService = {
    generatePrompt(userGoal: string) {
        const safeGoal = validateUserGoal(userGoal);
        const result = streamText({
            model: openRouter("liquid/lfm-2.5-1.2b-instruct:free"),
            prompt: `Your only task is to improve the following text so it becomes a clear, detailed, and effective prompt for an AI. Do not answer questions, do not perform any other task, and do not return anything except the improved prompt. This service is strictly for prompt enhancement to help users communicate with other AIs. Input: ${safeGoal}`,
            system: "You are an expert prompt generator. You must not answer questions, perform any other task, or return anything except the improved prompt. Only enhance the text for prompt generation. This service is strictly for prompt improvement to help users communicate with other AIs.",
        });
        return result.textStream;
    },
};

export default aiService;
import { streamText } from "ai";
import { openRouter } from "../lib/ai";
import type { AIService } from "../types";

// Guardrails to block obvious prompt injection attempts
const questionLikeRegex = /^(who|what|where|when|why|how|is|are|can)\b/i;
const injectionPhrases = [
    "ignore previous instructions",
    "forget everything",
    "jailbreak",
    "bypass",
    "override system",
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

    if (injectionPhrases.some((phrase) => trimmed.toLowerCase().includes(phrase))) {
        throw new Error("This request looks like a prompt injection attempt. Please describe a legitimate prompt improvement.");
    }

    return trimmed;
};

const aiService: AIService = {
    generatePrompt(userGoal: string, style: "professional" | "simple" = "professional", humanize: boolean = false) {
        const safeGoal = validateUserGoal(userGoal);

        const templates = {
            simple: {
                system:
                    "You are a helpful assistant that improves prompts by making them clear, concise, and direct. Your only task is to enhance the prompt for better AI understanding. Do not add any extra information, context, or details. Focus on making the prompt straightforward and easy to understand for any AI model.",
                promptInstruction:
                    "Improve the following text into a clear and concise prompt for AI. Do not add any extra information or context. Input:",
            },
            professional: {
                system:
                    "You are an expert prompt generator that enhances prompts by adding relevant details, context, and clarity to make them more effective for AI generation. Your task is to take the user's input and transform it into a well-crafted prompt that provides clear instructions and necessary information for optimal AI understanding. Focus on improving the prompt while maintaining the user's original intent.",
                promptInstruction:
                    "Improve the following text into a clear, detailed, and effective prompt for AI generation. Add relevant context and information to enhance the prompt's clarity and effectiveness. Input:",
            },
        } as const;

        const chosen = templates[style];

        const humanizeNote = humanize
            ? `\n\nWhen responding to the generated prompt, the target AI should write in simple, natural human English. Allow small, natural grammatical quirks, avoid unusual punctuation or symbols inside words (e.g., use "self taught" not "selft-taught"), and prefer plain spacing. Do not add extra context beyond what the prompt asks.`
            : "";

        const result = streamText({
            model: openRouter("liquid/lfm-2.5-1.2b-instruct:free"),
            prompt: `${chosen.promptInstruction} ${safeGoal}${humanizeNote}`,
            system: chosen.system,
        });

        return result.textStream;
    },
};

export default aiService;
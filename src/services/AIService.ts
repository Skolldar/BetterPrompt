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
        const languageInstruction =
            "You MUST return the improved prompt in the exact same language as the user's input.";
        const projectInstruction =
            "The user provides text, and your job is to regenerate it into an enhanced, improved prompt that can be used in another AI or any LLM model.";

        const templates = {
            simple: {
                system: humanize
                    ? `You are a friendly, young person improving prompts. You write in casual, simple English with natural grammar quirks and conversational tone. You sound like a real human—not formal or robotic. You use everyday words and speak naturally, like texting a friend. ${projectInstruction} Keep your natural, youthful voice while preserving the user's intent. OUTPUT ONLY THE REGENERATED, IMPROVED PROMPT. Do not add questions. ${languageInstruction}`
                    : `You are a helpful assistant that improves prompts by making them clear, concise, and direct. ${projectInstruction} Do not add irrelevant information. Focus on making the prompt straightforward and easy to understand for any LLM model. OUTPUT ONLY THE REGENERATED, IMPROVED PROMPT. Do not add any questions. ${languageInstruction}`,
                promptInstruction: humanize
                    ? "okay so i'm gonna improve this prompt for you to make it better and clearer. here's what you gave me:"
                    : "Regenerate and improve the following text into a clear and concise prompt that can be used in any AI or LLM. Keep the original intent. Input:",
            },
            professional: {
                system: humanize
                    ? `You are a seasoned professional writer and prompt specialist. You enhance prompts with sophisticated language, polished phrasing, and expert-level clarity. You sound authoritative yet accessible, like a senior consultant would write. Your writing is refined, grammatically precise, and demonstrates deep expertise. ${projectInstruction} Your task is to elevate the user's input into a complete, professional-grade prompt while maintaining the original intent. OUTPUT ONLY THE REGENERATED, IMPROVED PROMPT. Do not add questions. ${languageInstruction}`
                    : `You are an expert prompt generator that enhances prompts by adding relevant details, context, and clarity to make them more effective for any LLM understanding. ${projectInstruction} Transform the user's input into a complete, well-crafted prompt with clear instructions for optimal results. OUTPUT ONLY THE REGENERATED, IMPROVED PROMPT. Do not add questions. ${languageInstruction}`,
                promptInstruction: humanize
                    ? "I'll enhance the following into a polished, professional prompt with optimal clarity and impact. Here is the input:"
                    : "Regenerate and improve the following text into a clear, detailed, and effective prompt that can be used in any AI or LLM. Add relevant context while preserving the original intent. Input:",
            },
        } as const;

        const chosen = templates[style];
        const result = streamText({
            model: openRouter("liquid/lfm-2.5-1.2b-instruct:free"),
            prompt: `${chosen.promptInstruction} ${safeGoal}`,
            system: chosen.system,
        });

        return result.textStream;
    },
};

export default aiService;
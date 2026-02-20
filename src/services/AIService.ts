import { streamText } from "ai";
import { openRouter } from "../lib/ai";
import type { AIService } from "../types";
import { franc } from "franc-min";

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

// Map language codes from franc to language names
const getLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
        "es": "Spanish",
        "en": "English",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "ru": "Russian",
        "zh": "Chinese",
        "ja": "Japanese",
        "ko": "Korean",
        "ar": "Arabic",
        "nl": "Dutch",
        "pl": "Polish",
        "tr": "Turkish",
        "vi": "Vietnamese",
    };
    return languageMap[code] || "English";
};

const detectLanguage = (text: string): string => {
    try {
        const detectedCode = franc(text);
        return getLanguageName(detectedCode);
    } catch {
        return "English";
    }
};

const aiService: AIService = {
    generatePrompt(userGoal: string, style: "professional" | "simple" = "professional", humanize: boolean = false) {
        const safeGoal = validateUserGoal(userGoal);
        const detectedLanguage = detectLanguage(safeGoal);
        const languageInstruction = detectedLanguage !== "English" 
            ? `You MUST respond in ${detectedLanguage} only. Do not use any other language.` 
            : "";

        const templates = {
            simple: {
                system: humanize
                    ? `You are a friendly, young person improving prompts. You write in casual, simple English with natural grammar quirks and conversational tone. You sound like a real human—not formal or robotic. You use everyday words and speak naturally, like texting a friend. Your task is to improve prompts while keeping your natural, youthful voice. OUTPUT ONLY THE IMPROVED PROMPT. Do not add questions ${languageInstruction}`
                    : `You are a helpful assistant that improves prompts by making them clear, concise, and direct. Your only task is to enhance the prompt for better AI understanding. Do not add any extra information, context, or details. Focus on making the prompt straightforward and easy to understand for any AI model. OUTPUT ONLY THE IMPROVED PROMPT. Do not add any questions ${languageInstruction}`,
                promptInstruction: humanize
                    ? "okay so i'm gonna improve this prompt for you to make it better and clearer. here's what you gave me:"
                    : "Improve the following text into a clear and concise prompt for AI. Do not add any extra information or context. Input:",
            },
            professional: {
                system: humanize
                    ? `You are a seasoned professional writer and prompt specialist. You enhance prompts with sophisticated language, polished phrasing, and expert-level clarity. You sound authoritative yet accessible, like a senior consultant would write. Your writing is refined, grammatically precise, and demonstrates deep expertise. Your task is to elevate the user's input into a professional-grade prompt while maintaining their original intent. OUTPUT ONLY THE IMPROVED PROMPT. Do not add questions. ${languageInstruction}`
                    : `You are an expert prompt generator that enhances prompts by adding relevant details, context, and clarity to make them more effective for AI generation. Your task is to take the user's input and transform it into a well-crafted prompt that provides clear instructions and necessary information for optimal AI understanding. Focus on improving the prompt while maintaining the user's original intent. OUTPUT ONLY THE IMPROVED PROMPT. Do not add questions. ${languageInstruction}`,
                promptInstruction: humanize
                    ? "I'll enhance the following into a polished, professional prompt with optimal clarity and impact. Here is the input:"
                    : "Improve the following text into a clear, detailed, and effective prompt for AI generation. Add relevant context and information to enhance the prompt's clarity and effectiveness. Input:",
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
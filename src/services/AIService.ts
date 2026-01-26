import { streamText } from "ai";
import { openRouter } from "../lib/ai";

export default {
    async generatePrompt(userGoal: string) {
        const result = streamText({
            model: openRouter("liquid/lfm-2.5-1.2b-instruct:free"),
            prompt: `Generate a detailed and effective prompt to help achieve the following goal: ${userGoal}`,
            system: "You are an expert prompt generator.",
        });
        return result.textStream;
    }
}
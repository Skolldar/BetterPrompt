import useAIState from '../stores/aiState';

const generatePromptMock = jest.fn<AsyncIterable<string>, [string, "professional" | "simple" | undefined, boolean | undefined]>();

jest.mock("../services/AIService", () => ({
  __esModule: true,
  default: {
    generatePrompt: (...args: [string, "professional" | "simple" | undefined, boolean | undefined]) =>
      generatePromptMock(...args),
  },
}));

describe("AI State Store", () => {
  beforeEach(() => {
    generatePromptMock.mockReset();
    useAIState.setState((state) => ({
      ...state,
      generatedPrompt: "",
      isGenerating: false,
    }));
  });

  test("initial state", () => {
    const state = useAIState.getState();
    expect(state.generatedPrompt).toBe("");
    expect(state.isGenerating).toBe(false);
    expect(typeof state.generatePrompt).toBe("function");
  });

  test("generatePrompt streams and updates state", async () => {
    async function* stream() {
      yield "Create a clear prompt to draft ";
      yield "a product summary for a new laptop with key specs.";
    }

    generatePromptMock.mockReturnValue(stream());

    await useAIState.getState().generatePrompt("Make my prompt better");

    const state = useAIState.getState();
    expect(state.isGenerating).toBe(false);
    expect(state.generatedPrompt).toBe(
      "Create a clear prompt to draft a product summary for a new laptop with key specs."
    );
    expect(generatePromptMock).toHaveBeenCalledTimes(1);
  });
});

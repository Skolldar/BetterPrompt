import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAIState from "./stores/aiState";
import ReactMarkdown from "react-markdown";

function App() {
  const [userGoal, setUserGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromptSection, setShowPromptSection] = useState(false);
  const generatedPrompt = useAIState((state) => state.generatedPrompt);
  const isGenerating = useAIState((state) => state.isGenerating);
  const generatePrompt = useAIState((state) => state.generatePrompt);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setShowPromptSection(true);

    const form = new FormData(e.currentTarget);
    const userGoal = form.get("goalInput") as string;

    if (!userGoal) {
      toast.error("Please enter what you want to achieve.");
      setLoading(false);
      setShowPromptSection(false);
      return;
    }
    await generatePrompt(userGoal);
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      console.log("Copied to clipboard:", generatedPrompt);
      toast.success("Prompt copied to clipboard!");
    } catch {
      toast.error("Failed to copy prompt.");
    }
  };

  return (
    <>
    <ToastContainer
      position="top-center"
      autoClose={5000}
      theme="colored"
      closeOnClick={true}
    />
    <header className="p-10 bg-gray-800 text-white">
      <div className="container mx-auto">
        <a href="/">
          <h1 className="cursor-pointer lg:text-6xl font-bold text-3xl">Better Prompt!</h1>
        </a>
      </div>
    </header>

    <main className="container mx-auto my-8 p-4">
      <h2 className="text-4xl text-center">
      </h2>
      <section>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-xl font-medium text-gray-700">
            Describe what you want to achieve:
          </label>
          <textarea
            id="goalInput"
            name="goalInput"
            className={`w-full p-4 border border-gray-300 rounded-md ${(loading || isGenerating) ? 'bg-gray-100' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="E.g. Summarize a news article, write a poem, etc."
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            maxLength={500}
            rows={4}
            disabled={loading || isGenerating}
          />
          <div className="text-sm text-gray-500 mt-1">
            {userGoal.length}/500 characters
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className={`px-5 py-2 bg-blue-500 text-white cursor-pointer rounded-md hover:bg-blue-600 ${(loading || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || isGenerating}
            >
              Generate Prompt
            </button>
          </div>
        </form>
      </section>


      {/* Section: Show generated prompt text*/}
      {showPromptSection && (
        <section className="my-8">
          <h3 className="mb-2 block text-xl font-medium text-gray-700">AI-Generated Prompt:</h3>
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
            {isGenerating || loading ? (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="h-4 w-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" aria-hidden />
                <p>Generating prompt...</p>
              </div>
            ) : (
              <div>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {
                    generatedPrompt ? <ReactMarkdown>{generatedPrompt}</ReactMarkdown>
                    : "An error occurred, please try again."
                  }
                </div>
                {generatedPrompt && (
                  <button
                    className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 shrink-0"
                    onClick={handleCopy}
                    type="button"
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
    
    <footer className="p-4 bg-gray-200 text-center flex justify-center items-center fixed bottom-0 left-0 w-full">
      <p className="text-sm text-gray-600">© 2024 Better Prompt. All rights reserved.</p>
    </footer>
      
    </>
  )
}

export default App

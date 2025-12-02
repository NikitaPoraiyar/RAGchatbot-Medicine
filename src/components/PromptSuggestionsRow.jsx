import PromptSuggestionButton from "./PromptSuggestionButton.jsx";

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "What are common symptoms of the flu?",
        "How can I maintain a healthy immune system?",
        "How does sleep affect overall health?",
        "What are good ways to reduce stress and anxiety?"
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => <PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onClick={() => onPromptClick(prompt)} />)}
        </div>
    )
}

export default PromptSuggestionsRow;
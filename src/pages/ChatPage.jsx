import { useState } from "react";
import Bubble from "../components/Bubble.jsx";
import LoadingBubble from "../components/LoadingBubble.jsx";
import PromptSuggestionsRow from "../components/PromptSuggestionsRow.jsx";
import { sendChatMessage } from "../services/api.js";



const Home = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const noMessages = messages.length === 0;

    const handlePrompt = async (promptText) => {
        const userMessage = {
            role: "user",
            parts: [{ type: "text", text: promptText }],
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            const data = await sendChatMessage(updatedMessages); 
            const assistantMessage = {
                role: "assistant",
                parts: [{ type: "text", text: data.reply }],
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } 
        catch (err) {
            console.error("Chat error:", err);
            const errorMessage = {
                role: "assistant",
                parts: [
                {
                    type: "text",
                    text: "Sorry, something went wrong talking to the server.",
                },
                ],
            };
            setMessages((prev) => [...prev, errorMessage]);
        } 
        finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            role: "user",
            parts: [{ type: "text", text: input }],
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const data = await sendChatMessage(updatedMessages); // { reply }
            const assistantMessage = {
                role: "assistant",
                parts: [{ type: "text", text: data.reply }],
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage = {
                role: "assistant",
                parts: [
                {
                    type: "text",
                    text: "Sorry, something went wrong talking to the server.",
                },
                ],
            };
            setMessages((prev) => [...prev, errorMessage]);
        } 
        finally {
            setIsLoading(false);
        }
    };

    return(
        <main>
            <img src="/medical_logo.png" alt="MedicalGPT Logo" width={200} height={150} />
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                <>
                    <p className="starter-text">
                        Welcome to MedicalGPT — your trusted companion for exploring the
                        world of health and medicine. Ask anything about medical
                        conditions, symptoms, treatments, wellness, or healthcare topics,
                        and get clear, helpful, up-to-date information. We're here to
                        support learning and understanding — always remember to consult a
                        licensed medical professional for personal advice. Stay healthy!
                    </p>
                    <br />
                    <PromptSuggestionsRow onPromptClick={handlePrompt} />
                </>
                ) : (
                <>
                    {messages.map((message, index) => (
                        <Bubble key={`message-${index}`} message={message} />
                    ))}
                    {isLoading && <LoadingBubble />}
                </>
                )}
            </section>
            <form onSubmit={onSubmit}>
                <input className="question-box" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me something..." />
                <input type="submit" value="Send" />
            </form>
        </main>
    )
}

export default Home;

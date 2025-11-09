"use client";
import { useState, useRef, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa6";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Image from 'next/image';

export default function ChatPage() {
  const [history, setHistory] = useState([])
  const [sidebar, setSidebar] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previousChats, setPreviousChats] = useState(history);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setInput(e.target.value);

  const toggleSidebar = () => setSidebar((prev) => !prev);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleQuery = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to fetch response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the assistant message progressively
        setMessages((prevMessages) =>
          prevMessages.map((m, i) =>
            i === prevMessages.length - 1 && m.role === "assistant"
              ? { ...m, content: assistantMessage }
              : m
          )
        );
      }

      // Add final assistant message after streaming
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      document.body.classList.toggle("dark", newTheme);
      return newTheme;
    });
  };

  const handleNewChat = () => {
    setPreviousChats([...previousChats, messages]);
    setMessages([]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen text-regular-light dark:text-regular-dark">
      {/* <Sidebar sidebar={sidebar} toggleSidebar={toggleSidebar} handleNewChat={handleNewChat} previousChats={previousChats} /> */}

      <div className="flex-1 flex flex-col bg-primary-light dark:bg-primary-dark transition-all duration-300 ease-in-out">
        <Header sidebar={sidebar} toggleSidebar={toggleSidebar} handleNewChat={handleNewChat} isDarkMode={isDarkMode} toggleTheme={toggleTheme}/>
        <main className="mt-5 flex-1 flex justify-center overflow-y-auto space-y-4">
          <div className="w-3/4">
            {messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full gap-6">
                  <Image
                    src="/images/theatre.jpg" 
                    alt="Home Theatre Icon"
                    width={250}
                    height={250}
                    priority 
                  />
                <p className="text-regular-light dark:text-regular-dark text-center text-xl font-semibold">
                  Start your home theatre experience now!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 w-full flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative px-6 py-1.5 rounded-md border-t border-l border-b overflow-hidden ${
                      message.role === 'user'
                        ? "border-tertiary-light max-w-[80%] dark:border-tertiary-dark text-regular-light dark:text-regular-dark"
                        : "border-transparent text-regular-light dark:text-regular-dark w-full"
                    }`}
                  >
                    {message.content}
                    {message.role === 'user' && (
                      <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-accent-light to-accent-dark rounded-r-md" />
                    )}
                  </div>
                </div>


                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <footer className="flex justify-center items-center my-6">
            <div className="p-2 bg-tertiary-light dark:bg-tertiary-dark rounded-lg w-3/4 flex flex-col justify-center items-end">
            <textarea
              className="w-full p-2  bg-transparent text-regular-light dark:text-regular-dark focus:outline-none resize-none"
              placeholder="Ask Lumina"
              value={input}
              rows="3"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  e.preventDefault();
                  handleQuery();
                }
              }}
            />
              <button
                className="ml-4 w-10 h-10 bg-gradient-to-r from-accent-light to-accent-dark rounded-full flex justify-center items-center"
                disabled={loading}
                onClick={() => handleQuery()}
              >
                <FaArrowUp className="text-white" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    );
}

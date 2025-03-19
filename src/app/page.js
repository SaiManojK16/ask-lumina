"use client";
import { useState, useRef, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa6";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Image from 'next/image';
import TypingAnimation from '@/components/TypingAnimation';

export default function Home() {
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

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Add an empty assistant message that we'll update
      const assistantMessage = { role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        currentContent += chunk;

        // Update the last message with the accumulated content
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: currentContent
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again."
      }]);
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
      <Sidebar sidebar={sidebar} toggleSidebar={toggleSidebar} handleNewChat={handleNewChat} previousChats={previousChats} />

      <div className="flex-1 flex flex-col bg-primary-light dark:bg-primary-dark transition-all duration-300 ease-in-out">
        <Header sidebar={sidebar} toggleSidebar={toggleSidebar} handleNewChat={handleNewChat} isDarkMode={isDarkMode} toggleTheme={toggleTheme}/>
        <main className="mt-5 flex-1 flex justify-center overflow-y-auto space-y-4">
          <div className="w-full md:w-11/12 lg:w-3/4">
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
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 w-full flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative px-6 py-1.5 rounded-md border-t border-l border-b overflow-hidden ${
                        message.role === 'user'
                          ? "border-tertiary-light mr-4 max-w-[80%] dark:border-tertiary-dark text-regular-light dark:text-regular-dark"
                          : "border-transparent text-regular-light dark:text-regular-dark w-full"
                      }`}
                    >
                      {loading && message.role === "assistant" && message.content === "" ? (
                        <TypingAnimation />
                      ) : message.role === "assistant" ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          className="prose dark:prose-invert max-w-none"
                          components={{
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600" />
                            ),
                            p: ({ node, ...props }) => (
                              <p {...props} className="mb-4 last:mb-0" />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul {...props} className="list-disc pl-4 mb-4" />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol {...props} className="list-decimal pl-4 mb-4" />
                            ),
                            li: ({ node, ...props }) => (
                              <li {...props} className="mb-1" />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong {...props} className="font-bold" />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1 {...props} className="text-2xl font-bold mb-4" />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 {...props} className="text-xl font-bold mb-3" />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 {...props} className="text-lg font-bold mb-2" />
                            ),
                            code: ({ node, ...props }) => (
                              <code {...props} className="bg-gray-100 dark:bg-gray-800 rounded px-1" />
                            ),
                            pre: ({ node, ...props }) => (
                              <pre {...props} className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto mb-4" />
                            )
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      {message.role === 'user' && (
                        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-accent-light to-accent-dark rounded-r-md" />
                      )}
                    </div>
                  </div>
                ))}
                {loading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start w-full">
                    <div className="relative px-6 py-1.5 rounded-md border-transparent text-regular-light dark:text-regular-dark w-full">
                      <TypingAnimation />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="flex justify-center items-center my-6">
          <div className="w-11/12 lg:w-3/4 p-2 bg-tertiary-light dark:bg-tertiary-dark rounded-lg flex flex-col justify-center items-end">
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
              onClick={handleQuery}
            >
              <FaArrowUp className="text-white" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

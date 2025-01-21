"use client";
import { useState, useRef, useEffect } from "react";
import { MdOutlineCreate } from "react-icons/md";
import { PiSidebarFill } from "react-icons/pi";
import { FaArrowUp } from "react-icons/fa6";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

export default function ChatPage() {
  const [sidebar, setSidebar] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [ready, setReady] = useState(false);
  const messagesEndRef = useRef(null);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const toggleSidebar = () => {
    setSidebar((prev) => !prev);
  };

  const handleQuery = () => {
    if (input) {
      setMessages([...messages, { text: input, isUser: true }]);
      simulateBotResponse();
      setInput("");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      document.body.classList.toggle("dark", newTheme);
      return newTheme;
    });
  };

  const simulateBotResponse = () => {
    const botResponse =
      "This is a sample response created to show how the UI would look like. The UI is not yet connected to ChatGPT. This is how it is going to behave when the response is generated.";
    const words = botResponse.split(" ");
    let index = 0;

    const newMessage = { text: "", isUser: false, typing: false };
    setMessages((prev) => [...prev, newMessage]);

    const streamingInterval = setInterval(() => {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (index < words.length) {
          lastMessage.text += (lastMessage.text ? " " : "") + words.slice(index, index + 3).join(" ");
          index += 3;
        } else {
          clearInterval(streamingInterval);
        }

        return updatedMessages;
      });

      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.body.classList.add("dark");
    setReady(true);
  }, []);

  if (ready)
    return (
      <div className="flex h-screen text-regular-light dark:text-regular-dark">
        <aside
          className={`bg-secondary-light dark:bg-secondary-dark flex flex-col transition-all duration-300 ease-in-out ${sidebar ? 'w-72 p-4' : 'w-0 p-0'} overflow-hidden`}
        >
          <div className="flex items-center justify-between mb-4">
            <div onClick={toggleSidebar}>
              <PiSidebarFill className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark" />
            </div>
            <div>
              <MdOutlineCreate onClick={() => setMessages([])} className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark" />
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-3 mt-5">
            <p className="text-xs text-regular-light dark:text-regular-dark mb-2">Today</p>
            <button className="w-full text-sm p-1.5 bg-primary-light dark:bg-primary-dark rounded-md flex items-center justify-between hover:bg-primary-light dark:hover:bg-primary-dark">
              This is sample chat
            </button>
            <button className="w-full text-sm p-1.5 bg-transparent rounded-md flex items-center justify-between hover:bg-primary-light dark:hover:bg-primary-dark">
              Not connected to DB
            </button>
            <button className="w-full text-sm p-1.5 bg-transparent rounded-md flex items-center justify-between hover:bg-primary-light dark:hover:bg-primary-dark">
              Multiple chats will appear here
            </button>
          </nav>
          <div className="flex items-center space-x-4 border-t border-primary-light dark:border-primary-dark pt-4">
            <div className="p-2 rounded-full bg-accent-light dark:bg-accent-dark flex justify-center items-center">MS</div>
            <div className="text-sm">
              <p className="font-bold">Muskaan Shaikh</p>
              <p className="text-muted-dark">muskaan.mysa@gmail.com</p>
            </div>
          </div>
        </aside>

        <div className={`flex-1 flex flex-col bg-primary-light dark:bg-primary-dark transition-all duration-300 ease-in-out`}>
          <header className="p-4 flex items-center justify-between">
            <div className="flex space-x-3 items-center">
              {!sidebar && (
                <>
                <div onClick={toggleSidebar}>
                  <PiSidebarFill className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark" />
                </div>
                <MdOutlineCreate onClick={() => setMessages([])} className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark" />
                </>
              )}
              <h1 className="text-xl font-bold">Lumina Bot</h1>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <div className={`w-16 h-8 rounded-full shadow-inner transition duration-300 ease-in-out ${isDarkMode ? 'bg-regular-dark' : 'bg-regular-light'}`}>
                  <span
                    className={`dot absolute w-8 h-8 bg-transparent rounded-full shadow transition-transform duration-300 ease-in-out ${isDarkMode ? "translate-x-8" : ""}`}
                  >
                    {isDarkMode ? (
                      <MdOutlineDarkMode className="text-secondary-dark w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2" />
                    ) : (
                      <MdOutlineLightMode className="text-secondary-light w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2" />
                    )}
                  </span>
                </div>
              </label>
            </div>
          </header>

          <main className="mt-5 flex-1 flex justify-center overflow-y-auto space-y-4">
            <div className="w-3/4">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-regular-light dark:text-regular-dark text-center">
                    Start a conversation to see messages here!
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`mb-4 w-full flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`${
                        message.isUser
                          ? "bg-accent-light dark:bg-accent-dark text-regular-light dark:text-regular-dark w-3/4"
                          : "bg-transparent text-regular-light dark:text-regular-dark w-full"
                      } px-4 py-2 rounded-xl`}
                    >
                      {message.typing ? 'Typing...' : message.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <footer className="flex justify-center items-center mb-6">
            <div className="p-2 bg-tertiary-light dark:bg-tertiary-dark rounded-lg w-3/4">
              <input
                type="text"
                placeholder="Ask Lumina"
                value={input}
                onChange={handleChange}
                className="flex-1 px-4 py-2 bg-transparent text-regular-light dark:text-regular-dark focus:outline-none focus:transparent w-[90%]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleQuery();
                  }
                }}
              />
              <div className="p-4 w-[100%] flex justify-end items-center">
                <button
                  className="w-8 h-8 bg-regular-light dark:bg-regular-dark rounded-full flex justify-center items-center"
                  onClick={handleQuery}
                >
                  <FaArrowUp className="text-regular-dark dark:text-regular-light" />
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
}

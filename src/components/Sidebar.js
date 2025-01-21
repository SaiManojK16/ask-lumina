import React from 'react'
import { MdOutlineCreate } from 'react-icons/md';
import { PiSidebarFill } from 'react-icons/pi';

export default function Sidebar({sidebar, toggleSidebar, handleNewChat, previousChats}) {
  return (
    <aside
        className={`bg-secondary-light dark:bg-secondary-dark flex flex-col transition-all duration-300 ease-in-out ${
        sidebar ? "w-72 p-4" : "w-0 p-0"
        } overflow-hidden`}
    >
        <div className="flex items-center justify-between mb-4">
        {sidebar && (
            <>
            <div onClick={toggleSidebar}>
                <PiSidebarFill className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark" />
            </div>
            <MdOutlineCreate
                onClick={handleNewChat}
                className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark"
            />
            </>
        )}
        </div>

        <nav className="flex-1 overflow-y-auto space-y-3 mt-5">
        <p className="text-xs text-regular-light dark:text-regular-dark mb-2">Previous Chats</p>
        {
        previousChats.length > 0 ? (
            previousChats.map((chat, index) => (
            <button
                key={index}
                className={`w-full text-sm p-1.5 rounded-md flex items-center justify-between hover:bg-accent-light dark:hover:bg-accent-dark ${
                JSON.stringify(messages) === JSON.stringify(chat.messages)
                    ? "bg-accent-light text-regular-dark dark:bg-accent-dark dark:text-regular-dark"
                    : ""
                }`}
                onClick={() => {
                setMessages(chat.messages); // Set the selected chat's messages as active
                }}
            >
                Chat {index + 1}
            </button>
            ))
        ) : (
            <p className="text-sm text-regular-light dark:text-regular-dark">
            No previous chats
            </p>
        )
        }
        </nav>

        <div className="flex items-center space-x-4 border-t border-primary-light dark:border-primary-dark pt-4">
        <div className="p-2 rounded-full bg-accent-light dark:bg-accent-dark flex justify-center items-center text-regular-dark">MS</div>
        <div className="text-sm">
            <p className="font-bold">Muskaan Shaikh</p>
            <p className="text-muted-dark">muskaan.mysa@gmail.com</p>
        </div>
        </div>
    </aside> 
  )
}

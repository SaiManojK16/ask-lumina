import React from 'react'
import { MdOutlineCreate, MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { PiSidebarFill } from 'react-icons/pi';
export default function Header({sidebar, toggleSidebar, handleNewChat, isDarkMode, toggleTheme}) {
  return (
    <header className="p-4 flex items-center justify-between">
        <div className="flex space-x-6 items-center">
            {/* {!sidebar && (
            <>
                <div onClick={toggleSidebar}>
                <PiSidebarFill className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark" />
                </div>
                <MdOutlineCreate
                onClick={handleNewChat}
                className="w-6 h-6 cursor-pointer text-regular-light dark:text-regular-dark"
                />
            </>
            )} */}
            <img src="https://luminascreens.com/wp-content/uploads/2023/05/canva-photo-editor-52-2.webp"/>
            {/* <h1 className="text-2xl font-bold">Lumina Chat</h1> */}
        </div>

        <div className="flex items-center">
            {!isDarkMode ? (
            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center">
                <MdOutlineLightMode
                className="w-6 h-6 cursor-pointer text-secondary-dark"
                onClick={toggleTheme}
                />
            </div>
            ) : (
            <div className="w-10 h-10 border border-gray-500 rounded-full flex items-center justify-center">
                <MdOutlineDarkMode
                className="w-6 h-6 cursor-pointer text-secondary-light"
                onClick={toggleTheme}
                />
                </div>
            )}
        </div>
        </header>
  )
}

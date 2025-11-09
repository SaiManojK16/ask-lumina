'use client';

import React from 'react'
import { MdOutlineCreate, MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { PiSidebarFill } from 'react-icons/pi';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';

export default function Header({sidebar, toggleSidebar, handleNewChat, isDarkMode, toggleTheme}) {
  const pathname = usePathname();
  const isAdminRoute = typeof pathname === 'string' && pathname.startsWith('/admin');

  return (
    <header className="p-6 flex items-center justify-between">
      <Link href="/" aria-label="Go to home" className="z-10 flex space-x-6 items-center cursor-pointer">
        <Image 
          src="https://luminascreens.com/wp-content/uploads/2023/05/canva-photo-editor-52-2.webp"
          alt="Lumina Logo"
          width={200}
          height={200}
          priority
        />
      </Link>

      <div className="flex items-center space-x-4">
        {/* Hide theme toggle in admin console */}
        {!isAdminRoute && (
          <div className="w-10 h-10 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center">
            {!isDarkMode ? (
              <MdOutlineLightMode
                className="w-6 h-6 cursor-pointer text-secondary-dark"
                onClick={toggleTheme}
              />
            ) : (
              <MdOutlineDarkMode
                className="w-6 h-6 cursor-pointer text-secondary-light"
                onClick={toggleTheme}
              />
            )}
          </div>
        )}
        <ProfileDropdown />
      </div>
    </header>
  )
}

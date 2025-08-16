import { UserButton } from '@clerk/nextjs'
import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white px-6 py-4 flex justify-between items-center shadow-lg backdrop-blur-md sticky top-0 z-50">
      {/* Left Section: Logo / App Name */}
      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded-full font-semibold text-sm transition duration-300 shadow-md">
          Made with Gemini
        </div>
        <span className="text-gray-400">|</span>
        <span className="text-lg font-semibold hover:text-gray-300 transition duration-300 cursor-pointer">
          AI RAG Chat with PDF
        </span>
      </div>

      {/* Right Section: Clerk User Button */}
      <div className="flex items-center border border-white rounded-full p-1">
        <UserButton />
      </div>
    </nav>
  )
}

export default Navbar

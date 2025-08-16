import ChatArea from '@/components/ChatArea'
import FileUpload from '@/components/FileUpload'
import React from 'react'

const page = () => {
  return (
   <div className="grid grid-cols-[30%_70%] min-h-[60vh] bg-gray-100">
  {/* Left Section - File Upload */}
  <div className="p-4 border-r border-gray-300 bg-white shadow-sm">
    <FileUpload />
  </div>

  {/* Right Section - Chat Area */}
  <div className="p-1 bg-gray-50 overflow-y-auto">
    <ChatArea />
  </div>
</div>


  )
}

export default page
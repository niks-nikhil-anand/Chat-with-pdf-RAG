import ChatArea from '@/components/ChatArea'
import FileUpload from '@/components/FileUpload'
import React from 'react'

const page = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Sidebar - File Upload */}
      <div className="hidden md:block w-[350px] border-r border-border bg-card/50 backdrop-blur-sm p-4 h-full relative z-10">
        <FileUpload />
      </div>

      {/* Main Content - Chat Area */}
      <div className="flex-1 h-full relative flex flex-col items-center justify-center bg-background/50">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
        <ChatArea />
      </div>
    </div>
  )
}

export default page
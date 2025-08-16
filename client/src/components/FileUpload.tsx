"use client";
import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUploadButton = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", async () => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          setSelectedFile(file);
          const formData = new FormData();
          formData.append("pdf", file);
          await fetch("http://localhost:8000/upload/pdf", {
            method: "POST",
            body: formData,
          });
          console.log("File Uploaded");
        }
      }
    });
    el.click();
  };

  return (
    <div className=" w-full flex flex-col items-center justify-center gap-8 bg-white border-r border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center shadow-md">
          <UploadCloud className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Chat with PDF</h3>
        <p className="text-sm text-gray-500 max-w-[80%]">
          Upload your PDF and start asking questions about its content
          instantly.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className="w-full border-2 border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gray-400 transition"
        role="button"
        onClick={handleFileUploadButton}
      >
        <UploadCloud className="w-10 h-10 text-gray-500" />
        <p className="text-sm text-gray-700 font-medium">Drop your PDF here</p>
        <p className="text-xs text-gray-500">or click to browse files</p>
      </div>

      {/* Show selected file info */}
      {selectedFile && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md w-full">
          <p className="font-medium">{selectedFile.name}</p>
          <p className="text-xs text-gray-500">
            {selectedFile.size < 1024 * 1024
              ? `${(selectedFile.size / 1024).toFixed(2)} KB`
              : `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}{" "}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full">
        <button
          className="bg-gray-900 text-white py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 transition"
          type="button"
          onClick={handleFileUploadButton}
        >
          Browse files
        </button>
        <button
          className="border border-gray-300 rounded-md text-sm text-gray-600 py-2 hover:bg-gray-50 transition"
          type="button"
        >
          Use Example PDF
        </button>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 text-center max-w-[80%]">
        Tip: After uploading, we’ll process your PDF so you can chat with it in
        real-time.
      </p>
    </div>
  );
};

export default FileUpload;

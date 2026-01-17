"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    // Simulate upload delay for better UX (or actual upload time)
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("PDF uploaded successfully!");
        console.log("File Uploaded");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload PDF.");
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    toast.info("File removed");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center shadow-xl shadow-gray-900/10">
          <UploadCloud className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          Upload PDF
        </h3>
        <p className="text-sm text-muted-foreground max-w-[90%] bg-muted/30 px-3 py-1 rounded-full border border-border/50">
          Drag & drop or Click to browse
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={cn(
          "w-full aspect-square max-h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group relative overflow-hidden",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          selectedFile ? "border-solid border-green-500/50 bg-green-50/50 dark:bg-green-900/10" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
              {uploading ? (
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <p className="font-semibold text-foreground max-w-[200px] truncate px-4">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              onClick={removeFile}
              className="mt-4 px-4 py-2 bg-white dark:bg-black/20 border border-border/50 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-muted rounded-full group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-foreground">
                Drop your PDF here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PDF up to 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Info/Tip */}
      {selectedFile ? (
        <div className="text-center space-y-2 animate-in slide-in-from-bottom-5">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Ready to chat!
          </p>
          <p className="text-xs text-muted-foreground">
            Ask any question about {selectedFile.name}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="p-3 rounded-lg border border-border/50 bg-card/30 text-center">
            <FileText className="w-5 h-5 mx-auto text-blue-500 mb-2" />
            <p className="text-[10px] font-medium text-foreground">Parse Text</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-card/30 text-center">
            <div className="w-5 h-5 mx-auto text-purple-500 mb-2 font-bold flex items-center justify-center border-2 border-purple-500 rounded-md text-[9px] leading-none">
              AI
            </div>
            <p className="text-[10px] font-medium text-foreground">Smart Chat</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

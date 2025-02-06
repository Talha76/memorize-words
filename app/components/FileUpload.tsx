import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  error: string | null;
}

export function FileUpload({ onFileUpload, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await onFileUpload(file);
    }
  };

  return (
    <Card className="p-8 max-w-md w-full space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Upload Text File</h1>
        <p className="text-muted-foreground">
          Please upload a text file with word pairs in the format:<br/>
          <code className="text-sm bg-muted p-1 rounded">[correct,wrong] বাংলা = العربية</code>
        </p>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 w-full text-center transition-colors duration-200 ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className={`mx-auto h-12 w-12 transition-colors duration-200 ${
              isDragging ? "text-primary" : "text-muted-foreground/50"
            }`} />
            <span className="mt-2 block text-sm text-muted-foreground">
              Click to upload or drag and drop a .txt file with format:<br/>
              <code className="text-sm bg-muted p-1 rounded">[correct,wrong] বাংলা = العربية</code>
            </span>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onFileUpload(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
        {error && (
          <div className="text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}
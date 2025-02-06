import React from "react";
import { Plus, Trash2, Download, RefreshCw, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WordPair } from "../types";

interface AddWordsProps {
  addedPairs: WordPair[];
  error: string | null;
  onAddPair: (e: React.FormEvent) => void;
  onDeletePair: (pair: WordPair) => void;
  onDownload: () => void;
  onStartNewSession: () => void;
  onUploadNew: () => void;
  newPair: string;
  onNewPairChange: (value: string) => void;
}

export function AddWords({
  addedPairs,
  error,
  onAddPair,
  onDeletePair,
  onDownload,
  onStartNewSession,
  onUploadNew,
  newPair,
  onNewPairChange
}: AddWordsProps) {
  return (
    <Card className="p-8 max-w-md w-full space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Add New Word Pairs</h1>
        <p className="text-muted-foreground">
          Add new word pairs in the format: <code className="text-sm bg-muted p-1 rounded">বাংলা = العربية</code>
        </p>
      </div>
      
      <form onSubmit={onAddPair} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newPair}
            onChange={(e) => onNewPairChange(e.target.value)}
            placeholder="বাংলা = العربية"
            className="flex-1"
          />
          <Button type="submit" disabled={!newPair.includes('=')}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </form>

      {error && (
        <div className="text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {addedPairs.length > 0 && (
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Added Pairs ({addedPairs.length})</h2>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {addedPairs.map((pair, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted rounded-md text-xl flex justify-between items-center"
                >
                  <span>{pair.bengali} = {pair.arabic}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeletePair(pair)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Button 
          variant="outline" 
          onClick={onDownload}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Word List
        </Button>
        <Button 
          onClick={onStartNewSession}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Start New Session
        </Button>
        <Button 
          variant="outline"
          onClick={onUploadNew}
          className="w-full"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Upload New File
        </Button>
      </div>
    </Card>
  );
}
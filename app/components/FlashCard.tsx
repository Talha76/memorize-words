import React, { useEffect } from "react";
import { Eye, CheckCircle2, XCircle, FileUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WordPair } from "../types";

interface FlashCardProps {
  wordPair: WordPair;
  totalPairs: number;
  currentIndex: number;
  onReveal: () => void;
  onAnswer: (isCorrect: boolean) => void;
  onUploadNew: () => void;
  onAddMore: () => void;
  isLastPair: boolean;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function FlashCard({
  wordPair,
  totalPairs,
  currentIndex,
  onReveal,
  onAnswer,
  onUploadNew,
  onAddMore,
  isLastPair,
  onNavigate
}: FlashCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReveal();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        onNavigate('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        onNavigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  return (
    <Card 
      className="p-8 max-w-2xl w-full min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleClick}
    >
      <div className="text-center space-y-4 w-full">
        <div className="space-y-6">
          <p className="text-4xl font-bold">{wordPair.bengali}</p>
          <div 
            className={`transition-all duration-200 ${
              wordPair.revealed 
                ? "opacity-100 transform translate-y-0" 
                : "opacity-0 transform translate-y-4"
            }`}
          >
            <p className="text-4xl font-bold" dir="rtl">
              {wordPair.revealed ? wordPair.arabic : "＊＊＊"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onReveal();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {wordPair.revealed ? "Hide" : "Reveal"}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            className={`${
              wordPair.sessionAnswer === 'correct'
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-green-500/10 hover:bg-green-500/20"
            } transition-colors duration-200`}
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(true);
            }}
          >
            <CheckCircle2 className={`h-4 w-4 mr-2 ${
              wordPair.sessionAnswer === 'correct' ? 'text-white' : 'text-green-500'
            }`} />
            Correct ({wordPair.correctCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              wordPair.sessionAnswer === 'wrong'
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-red-500/10 hover:bg-red-500/20"
            } transition-colors duration-200`}
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(false);
            }}
          >
            <XCircle className={`h-4 w-4 mr-2 ${
              wordPair.sessionAnswer === 'wrong' ? 'text-white' : 'text-red-500'
            }`} />
            Wrong ({wordPair.wrongCount})
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('prev');
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('next');
            }}
            disabled={currentIndex === totalPairs - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <p className="text-muted-foreground mt-4">
          Pair {currentIndex + 1} of {totalPairs}
        </p>

        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUploadNew();
            }}
            className="w-full"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Upload New File
          </Button>
        </div>
        {isLastPair && (
          <div className="space-y-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddMore();
              }}
              className="w-full"
            >
              Add More Words
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
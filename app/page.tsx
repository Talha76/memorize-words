"use client";

import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { FlashCard } from "./components/FlashCard";
import { AddWords } from "./components/AddWords";
import { WordPair } from "./types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [remainingPairs, setRemainingPairs] = useState<WordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [newPair, setNewPair] = useState("");
  const [isAddingWords, setIsAddingWords] = useState(false);
  const [addedPairs, setAddedPairs] = useState<WordPair[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showingLowScorePairs, setShowingLowScorePairs] = useState(true);
  const [showRemainingPrompt, setShowRemainingPrompt] = useState(false);
  const [lowHighSwapped, setLowHighSwap] = useState(false);

  const calculateCorrectPercentage = (pair: WordPair) => {
    const total = pair.correctCount + pair.wrongCount;
    return total === 0 ? 0 : (pair.correctCount / total) * 100;
  };

  const sortAndFilterPairs = (pairs: WordPair[]) => {
    const sortedPairs = [...pairs].sort((a, b) => {
      const percentageA = calculateCorrectPercentage(a);
      const percentageB = calculateCorrectPercentage(b);
      return percentageA - percentageB;
    });

    const lowScorePairs = sortedPairs.filter(pair => calculateCorrectPercentage(pair) < 80 || pair.correctCount + pair.wrongCount < 10);
    const highScorePairs = sortedPairs.filter(pair => calculateCorrectPercentage(pair) >= 80 && pair.correctCount + pair.wrongCount >= 10);

    // Randomize low score pairs
    const shuffledLowScorePairs = [...lowScorePairs].sort(() => Math.random() - 0.5);
    const shuffledHighScorePairs = [...highScorePairs].sort(() => Math.random() - 0.5);

    return {
      lowScorePairs: shuffledLowScorePairs,
      highScorePairs: shuffledHighScorePairs
    };
  };

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      if (!file) {
        setError("No file selected");
        return;
      }

      if (file.type !== "text/plain") {
        setError("Please upload a text file (.txt)");
        return;
      }

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        setError("The file is empty or contains no valid word pairs");
        // setIsAddingWords(true);
        // setShowingLowScorePairs(false);
        return;
      }

      const pairs = lines.map(line => {
        const statsMatch = line.match(/\[(\d+),(\d+)\]/);
        const cleanLine = line.replace(/\[\d+,\d+\]\s*/, '');
        const [bengali, arabic] = cleanLine.split('=').map(part => part.trim());
        
        return {
          bengali,
          arabic,
          revealed: false,
          correctCount: statsMatch ? parseInt(statsMatch[1]) : 0,
          wrongCount: statsMatch ? parseInt(statsMatch[2]) : 0,
          sessionAnswer: null
        };
      });

      if (pairs.some(pair => !pair.bengali || !pair.arabic)) {
        setError("Invalid format. Each line must be in the format: '[correct,wrong] বাংলা = العربية'");
        return;
      }
      
      const { lowScorePairs, highScorePairs } = sortAndFilterPairs(pairs);

      console.trace(lowScorePairs, highScorePairs);

      setWordPairs(lowScorePairs);
      setRemainingPairs(highScorePairs);
      setAddedPairs([]);
      setIsFileUploaded(true);
      setCurrentIndex(0);
      setIsAddingWords(false);
      setShowingLowScorePairs(true);
    } catch (err) {
      setError("Error reading file: " + (err instanceof Error ? err.message : "Unknown error"));
      console.error("File upload error:", err);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setWordPairs(prev => prev.map((pair, idx) => {
      if (idx === currentIndex) {
        // If already answered in this session, undo the previous answer
        if (pair.sessionAnswer === (isCorrect ? 'correct' : 'wrong')) {
          return {
            ...pair,
            correctCount: isCorrect ? pair.correctCount - 1 : pair.correctCount,
            wrongCount: isCorrect ? pair.wrongCount : pair.wrongCount - 1,
            sessionAnswer: null
          };
        }
        // If answered differently in this session, update both counts
        else if (pair.sessionAnswer !== null) {
          return {
            ...pair,
            correctCount: isCorrect ? pair.correctCount + 1 : pair.correctCount - 1,
            wrongCount: isCorrect ? pair.wrongCount - 1 : pair.wrongCount + 1,
            sessionAnswer: isCorrect ? 'correct' : 'wrong'
          };
        }
        // First answer in this session
        else {
          return {
            ...pair,
            correctCount: isCorrect ? pair.correctCount + 1 : pair.correctCount,
            wrongCount: isCorrect ? pair.wrongCount : pair.wrongCount + 1,
            sessionAnswer: isCorrect ? 'correct' : 'wrong'
          };
        }
      }
      return pair;
    }));

    // Only move to next pair if this was the first answer in the session
    if (wordPairs[currentIndex].sessionAnswer === null && currentIndex < wordPairs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setWordPairs(prev => prev.map((pair, idx) => ({
        ...pair,
        revealed: idx === currentIndex + 1 ? false : pair.revealed
      })));
    }
  };

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPair.trim()) {
      const [bengali, arabic] = newPair.split('=').map(part => part.trim());
      if (bengali && arabic) {
        const pair = {
          bengali,
          arabic,
          revealed: false,
          correctCount: 0,
          wrongCount: 0,
          sessionAnswer: null
        };
        setWordPairs(prev => [...prev, pair]);
        setAddedPairs(prev => [...prev, pair]);
        setNewPair("");
      } else {
        setError("Invalid format. Please use: 'বাংলা = العربية'");
      }
    }
  };

  const handleDeletePair = (pairToDelete: WordPair) => {
    setWordPairs(prev => prev.filter(pair => 
      pair.bengali !== pairToDelete.bengali || pair.arabic !== pairToDelete.arabic
    ));
    setAddedPairs(prev => prev.filter(pair => 
      pair.bengali !== pairToDelete.bengali || pair.arabic !== pairToDelete.arabic
    ));
  };

  const handleDownload = () => {
    const content = [...wordPairs, ...remainingPairs].map(pair => 
      `[${pair.correctCount},${pair.wrongCount}] ${pair.bengali} = ${pair.arabic}`
    ).join('\n');

    console.trace(content);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word_pairs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startNewSession = () => {
    const { lowScorePairs, highScorePairs } = sortAndFilterPairs([...wordPairs, ...remainingPairs]);
    setWordPairs(lowScorePairs.map(pair => ({ ...pair, revealed: false, sessionAnswer: null })));
    setRemainingPairs(highScorePairs.map(pair => ({ ...pair, revealed: false, sessionAnswer: null })));
    setCurrentIndex(0);
    setIsAddingWords(false);
    setShowingLowScorePairs(true);
    setShowRemainingPrompt(false);
    setLowHighSwap(false);
  };

  const uploadNewFile = () => {
    setIsFileUploaded(false);
    setWordPairs([]);
    setCurrentIndex(0);
    setAddedPairs([]);
    setError(null);
    setShowingLowScorePairs(true);
    setShowRemainingPrompt(false);
  };

  const toggleReveal = () => {
    setWordPairs(prev => prev.map((pair, idx) => ({
      ...pair,
      revealed: idx === currentIndex ? !pair.revealed : pair.revealed
    })));
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentIndex < wordPairs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setWordPairs(prev => prev.map((pair, idx) => ({
        ...pair,
        revealed: idx === currentIndex + 1 ? false : pair.revealed
      })));
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setWordPairs(prev => prev.map((pair, idx) => ({
        ...pair,
        revealed: idx === currentIndex - 1 ? false : pair.revealed
      })));
    }
  };

  const showRemainingWords = () => {
    const [tempWordPairs, tempRemainingPairs] = lowHighSwapped ? [wordPairs, remainingPairs] : [remainingPairs, wordPairs];
    
    setWordPairs(tempWordPairs);
    setRemainingPairs(tempRemainingPairs);
    setLowHighSwap(true);
    setCurrentIndex(0);
    setShowingLowScorePairs(false);
    remainingPairs.length > 0 ? setShowRemainingPrompt(false) : setIsAddingWords(true);
  };

  const handleLastPair = () => {
    if (showingLowScorePairs) {
      setShowRemainingPrompt(true);
    } else {
      setIsAddingWords(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      {!isFileUploaded ? (
        <FileUpload onFileUpload={handleFileUpload} error={error} />
      ) : isAddingWords ? (
        <AddWords
          addedPairs={addedPairs}
          error={error}
          onAddPair={handleAddPair}
          onDeletePair={handleDeletePair}
          onDownload={handleDownload}
          onStartNewSession={startNewSession}
          onUploadNew={uploadNewFile}
          newPair={newPair}
          onNewPairChange={(value) => setNewPair(value)}
        />
      ) : showRemainingPrompt ? (
        <Card className="p-8 max-w-md w-full space-y-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">You've completed all low score words!</h2>
            <p className="text-muted-foreground">
              Would you like to practice the remaining words or add new ones?
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={showRemainingWords}>
                Practice Remaining Words
              </Button>
              <Button variant="outline" onClick={() => setIsAddingWords(true)}>
                Add New Words
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        wordPairs.length > 0 && (
          <FlashCard
            wordPair={wordPairs[currentIndex]}
            totalPairs={wordPairs.length}
            currentIndex={currentIndex}
            onReveal={toggleReveal}
            onAnswer={handleAnswer}
            onUploadNew={uploadNewFile}
            onAddMore={handleLastPair}
            isLastPair={currentIndex === wordPairs.length - 1}
            onNavigate={handleNavigate}
          />
        )
      )}
    </div>
  );
}
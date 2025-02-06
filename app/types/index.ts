export interface WordPair {
  bengali: string;
  arabic: string;
  revealed: boolean;
  correctCount: number;
  wrongCount: number;
  sessionAnswer: 'correct' | 'wrong' | null;
}
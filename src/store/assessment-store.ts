import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Answer, CompanyInfo, ScoreValue } from '@/types/assessment';
import { ALL_QUESTIONS } from '@/data/assessment-data';

interface AssessmentState {
  company: CompanyInfo | null;
  answers: Record<string, Answer>;
  currentQuestionIndex: number;
  isComplete: boolean;

  setCompany: (info: CompanyInfo) => void;
  setAnswer: (questionId: string, score: ScoreValue, comment: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeAssessment: () => void;
  reset: () => void;

}

const TOTAL_QUESTIONS = ALL_QUESTIONS.length; // 8

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      company: null,
      answers: {},
      currentQuestionIndex: 0,
      isComplete: false,

      setCompany: (info) => set({ company: info }),

      setAnswer: (questionId, score, comment) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: { questionId, score, comment },
          },
        })),

      goToQuestion: (index) => {
        if (index < 0 || index >= TOTAL_QUESTIONS) return;
        set({ currentQuestionIndex: index });
      },

      nextQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      completeAssessment: () => set({ isComplete: true }),

      reset: () => set({
        company: null,
        answers: {},
        currentQuestionIndex: 0,
        isComplete: false,
      }),

    }),
    {
      name: 'iagentics-assessment-v3',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({
        company: state.company,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        isComplete: state.isComplete,
      }),
    },
  ),
);

export const TOTAL_ASSESSMENT_QUESTIONS = TOTAL_QUESTIONS;

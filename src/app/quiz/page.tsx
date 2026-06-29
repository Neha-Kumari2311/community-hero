'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiZap, FiCheck, FiX, FiRefreshCw, FiAward } from 'react-icons/fi';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: string;
  allAnswers: string[];
}

export default function QuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    fetchQuestions();
  }, [status]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Fetch AI-generated questions from our Gemini-powered API
      const res = await fetch('/api/quiz');
      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        const formatted = data.questions.map((q: any) => {
          const allAnswers = [...q.incorrect_answers, q.correct_answer]
            .sort(() => Math.random() - 0.5);
          return { ...q, allAnswers };
        });
        setQuestions(formatted);
      } else {
        toast.error('No questions received. Try again!');
      }
    } catch (error) {
      toast.error('Failed to load quiz. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answer);
    const correct = answer === questions[currentIndex].correct_answer;
    setIsCorrect(correct);

    if (correct) {
      const points = streak >= 3 ? 3 : streak >= 1 ? 2 : 1; // Streak bonus
      setScore(score + points);
      setStreak(streak + 1);
      toast.success(`✅ Correct! +${points} pts${streak >= 2 ? ' 🔥 Streak!' : ''}`);
    } else {
      setStreak(0);
      toast.error('❌ Wrong answer!');
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuizComplete(false);
    setStreak(0);
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const maxPoints = questions.length * 3;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
            <FiAward className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete! 🎉</h1>
          <p className="text-gray-600 mb-6">Great job testing your knowledge!</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-xs text-gray-500">Points Earned</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{questions.length}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              {percentage >= 80
                ? '🌟 Outstanding! You\'re a true community knowledge champion!'
                : percentage >= 50
                ? '👍 Good job! Keep learning about your environment!'
                : '💪 Keep trying! Every quiz makes you more aware!'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={restartQuiz}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => router.push('/challenges')}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiZap className="text-purple-600" />
            Eco & Community Quiz
          </h1>
          <p className="text-sm text-gray-500">General Knowledge • Fun & easy questions!</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Score</div>
          <div className="text-2xl font-bold text-purple-600">{score}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          {streak >= 2 && <span className="text-orange-600 font-medium">🔥 {streak} Streak!</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {currentQ.category}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
            {currentQ.difficulty}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {currentQ.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {currentQ.allAnswers.map((answer, i) => {
          const isSelected = selectedAnswer === answer;
          const isCorrectAnswer = answer === currentQ.correct_answer;
          let bgClass = 'bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50';

          if (selectedAnswer) {
            if (isCorrectAnswer) {
              bgClass = 'bg-green-50 border-green-500 text-green-800';
            } else if (isSelected && !isCorrect) {
              bgClass = 'bg-red-50 border-red-500 text-red-800';
            } else {
              bgClass = 'bg-gray-50 border-gray-200 opacity-50';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(answer)}
              disabled={!!selectedAnswer}
              className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${bgClass} ${
                !selectedAnswer ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{answer}</span>
                {selectedAnswer && isCorrectAnswer && (
                  <FiCheck className="w-5 h-5 text-green-600" />
                )}
                {selectedAnswer && isSelected && !isCorrect && (
                  <FiX className="w-5 h-5 text-red-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {selectedAnswer && (
        <button
          onClick={nextQuestion}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors text-lg"
        >
          {currentIndex + 1 >= questions.length ? '🏁 See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}

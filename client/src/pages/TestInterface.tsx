import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ArrowLeft, ArrowRight, Eye, Clock, CheckCircle, User, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@/lib/utils";
import Swal from 'sweetalert2';

import TestResultModal from "@/components/TestResultModal";

interface TestAnswer {
  questionId: number;
  answer: string;
  correct: boolean;
}

interface IshiharaQuestion {
  id: number;
  imageUrl: string;
  correctAnswer: string;
  options: string[];
}

export default function TestInterface() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [testStartTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get student data from query params or storage with fallback
  const [studentData, setStudentData] = useState(() => {
    try {
      const stored = localStorage.getItem('currentStudent');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that we have the required fields
        if (parsed && parsed.id && parsed.name) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error parsing student data:', error);
    }
    return null;
  });

  const { data: questions = [] } = useQuery<IshiharaQuestion[]>({
    queryKey: ['/api/test/questions'],
  });

  // Monitor localStorage changes
  useEffect(() => {
    const checkStudentData = () => {
      try {
        const stored = localStorage.getItem('currentStudent');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.name && !studentData) {
            setStudentData(parsed);
          }
        }
      } catch (error) {
        console.error('Error checking student data:', error);
      }
    };

    checkStudentData();

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', checkStudentData);
    return () => window.removeEventListener('storage', checkStudentData);
  }, [studentData]);

  const submitTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to submit test');
      }
      return response.json();
    },
    onSuccess: (result) => {
      setTestResult(result);
      setShowResult(true);
      // Don't remove student data immediately, let modal handle it
      queryClient.invalidateQueries({ queryKey: ['/api/teacher'] });
    },
    onError: (error) => {
      console.error('Test submission error:', error);
      alert('Terjadi kesalahan saat menyimpan hasil test. Silakan coba lagi.');
    }
  });

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - testStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [testStartTime]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleTextSubmit = () => {
    if (!textAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      answer: textAnswer.trim(),
      correct: textAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase(),
    };

    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);

    if (existingIndex !== -1) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }

    setAnswers(updatedAnswers);

    // Auto-advance to next question
    setTimeout(() => {
      setTextAnswer("");
      setIsSubmitting(false);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmitTest(updatedAnswers);
      }
    }, 800);
  };

  const handleSubmitTest = (finalAnswers: TestAnswer[]) => {
    const testDuration = Math.floor((Date.now() - testStartTime) / 1000);

    submitTestMutation.mutate({
      studentId: studentData.id,
      teacherId: user?.id,
      answers: finalAnswers,
      testDuration,
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && !isSubmitting) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTextAnswer("");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1 && !isSubmitting) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTextAnswer("");
    }
  };

  const handleExitTest = async () => {
    const result = await Swal.fire({
      title: 'Keluar dari Test?',
      text: 'Apakah Anda yakin ingin keluar? Semua data akan hilang.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (!result.isConfirmed) return;

    const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');

    try {
      await fetch(`/api/test/student/${student.id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error("Gagal menghapus data test di server:", err);

      await Swal.fire('Gagal', 'Tidak bisa menghapus data test.', 'error');
    }

    localStorage.removeItem('currentStudent');
    setLocation('/');

    await Swal.fire('Keluar', 'Anda telah keluar dari test.', 'success');
  };


  if (!studentData || !studentData?.id || !studentData?.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Data Siswa Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-6">Silakan kembali ke dashboard dan masukkan data siswa terlebih dahulu.</p>
            <Button onClick={() => setLocation('/')} className="w-full">
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat soal test...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-50">
      <div className="h-full flex flex-col">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Test Buta Warna Ishihara
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{studentData.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatDuration(timer)}</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <div className="relative w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full enhanced-progress rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitTest}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 px-4 py-3 relative">
          <div className="flex justify-between items-center">
            {/* Tombol Exit di kanan */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitTest}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo ditengah absolut */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Soal {currentQuestionIndex + 1}</span>
              </div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Angka atau huruf apa yang Anda lihat?
              </h3>
              <p className="text-gray-600 text-lg">
                Ketik jawaban yang sesuai dengan apa yang Anda lihat pada gambar di bawah ini.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Ishihara Test Plate */}
              <div className="flex justify-center">
                <div className="relative group animate-bounce-in">
                  <div className="test-plate absolute -inset-4 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform transition-all duration-500 group-hover:scale-105 animate-float">
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={currentQuestion.imageUrl}
                        alt={`Ishihara test plate ${currentQuestionIndex + 1}`}
                        className="w-80 h-80 object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-glow"></div>
                </div>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Masukkan jawaban Anda:</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                    placeholder="Ketik angka atau huruf yang Anda lihat..."
                    disabled={isSubmitting}
                    className="w-full h-16 text-xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textAnswer.trim() || isSubmitting}
                    className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Memproses..." : "Submit Jawaban"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex justify-between items-center mt-12">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                variant="outline"
                className="flex items-center space-x-2 px-6 py-3 transform hover:scale-105 transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </Button>

              <div className="flex items-center space-x-3 text-sm text-gray-600 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Progress:</span>
                <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
                <div className="flex space-x-1">
                  {Array.from({ length: questions.length }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i < currentQuestionIndex
                        ? 'bg-green-500'
                        : i === currentQuestionIndex
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}
                variant="outline"
                className="flex items-center space-x-2 px-6 py-3 transform hover:scale-105 transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden flex-1 flex flex-col h-full overflow-y-auto px-4 py-6 space-y-6">
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">Soal {currentQuestionIndex + 1}</span>
              </div>

              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Angka atau huruf apa yang Anda lihat?
              </h3>
              <p className="text-gray-600 text-sm">
                Ketik jawaban yang sesuai dengan gambar di bawah ini.
              </p>
            </div>

            {/* Mobile Ishihara Test Plate */}
            <div className="flex justify-center mb-6">
              <div className="relative bg-white rounded-xl shadow-xl p-4">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={currentQuestion.imageUrl}
                    alt={`Ishihara test plate ${currentQuestionIndex + 1}`}
                    className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Answer Input */}
            <div className="space-y-3 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 text-center">Masukkan jawaban Anda:</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder="Ketik jawaban..."
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 px-4"
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textAnswer.trim() || isSubmitting}
                  className="w-full h-10 text-base font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Memproses..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Progress and Timer (moved below answers) */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20 sticky bottom-0">
            <div className="space-y-3 pb-3">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatDuration(timer)}</span>
                </div>
                <span className="font-medium">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="flex justify-center space-x-1">
                {Array.from({ length: questions.length }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i < currentQuestionIndex
                      ? 'bg-green-500'
                      : i === currentQuestionIndex
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResult && testResult && (
        <TestResultModal
          open={showResult}
          onOpenChange={setShowResult}
          result={testResult}
        />
      )}

      <style jsx>{`
        .enhanced-progress {
          background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);
          background-size: 200% 100%;
          animation: gradient-shift 2s ease-in-out infinite;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        .test-plate {
          background: linear-gradient(45deg, #3b82f6, #6366f1, #8b5cf6, #ec4899);
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
      `}</style>
    </div>
  );
}
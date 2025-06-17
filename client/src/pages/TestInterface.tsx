import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ArrowLeft, ArrowRight, Eye, Clock, CheckCircle, User, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@/lib/utils";

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
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  
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

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      answer,
      correct: answer === currentQuestion.correctAnswer,
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
      setSelectedAnswer("");
      setIsAnswered(false);
      
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
    if (currentQuestionIndex > 0 && !isAnswered) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer("");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1 && !isAnswered) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
    }
  };

  const handleExitTest = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari test? Data akan hilang.')) {
      localStorage.removeItem('currentStudent');
      setLocation('/');
    }
  };

  if (!studentData || !studentData?.id || !studentData?.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
        {/* Modern Test Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 px-6 py-4">
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

        {/* Enhanced Test Content */}
        <div className="flex-1 flex items-center justify-center p-8">
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
                Pilih jawaban yang paling sesuai dengan apa yang Anda lihat pada gambar di bawah ini.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Enhanced Ishihara Test Plate */}
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

              {/* Enhanced Answer Options */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Pilih jawaban Anda:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => !isAnswered && handleAnswerSelect(option)}
                      disabled={isAnswered}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      className={`
                        h-16 text-xl font-bold transition-all duration-300 transform hover:scale-105
                        relative overflow-hidden group
                        ${selectedAnswer === option 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25' 
                          : 'bg-white hover:bg-blue-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:text-blue-700'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {option}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Navigation */}
            <div className="flex justify-between items-center mt-12">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || isAnswered}
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
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < currentQuestionIndex 
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
                disabled={currentQuestionIndex === questions.length - 1 || isAnswered}
                variant="outline"
                className="flex items-center space-x-2 px-6 py-3 transform hover:scale-105 transition-all duration-200 bg-white/80 backdrop-blur-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
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
    </div>
  );
}
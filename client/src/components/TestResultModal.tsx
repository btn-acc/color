import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lightbulb, Download, Home } from "lucide-react";
import { calculateAge, formatDuration, formatDate, getStatusColor } from "@/lib/utils";
import { useLocation } from "wouter";

interface TestResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any;
}

export default function TestResultModal({ open, onOpenChange, result }: TestResultModalProps) {
  const [, setLocation] = useLocation();
  
  if (!result) return null;

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/results/${result.id}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-result-${result.student.name}-${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const handleBackToDashboard = () => {
    localStorage.removeItem('currentStudent');
    onOpenChange(false);
    window.location.href = '/';
  };

  const isNormal = result.diagnosis.includes('Normal');
  const age = calculateAge(result.student.birthDate);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
    if (!isOpen) {
      handleBackToDashboard();
    }
    }}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto animate-slide-up">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Hasil Test Buta Warna</DialogTitle>
          <p className="text-gray-600">Siswa: {result.student.name}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center bg-gray-50 rounded-xl p-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-1">
              {result.percentage}%
            </div>
            <div className="text-sm text-gray-600">Akurasi Test</div>
          </div>

          {/* Diagnosis */}
          <div className={`border rounded-xl p-4 ${
            isNormal 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              isNormal ? 'text-green-800' : 'text-yellow-800'
            }`}>
              <CheckCircle className="inline mr-2 h-5 w-5" />
              Diagnosa: {result.diagnosis}
            </h4>
            <p className={`text-sm ${
              isNormal ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {result.recommendations.split('.')[0]}.
            </p>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              <Lightbulb className="inline mr-2 h-5 w-5" />
              Rekomendasi Jurusan
            </h4>
            <div className="text-blue-700 text-sm">
              {result.recommendations.split('.').slice(1).join('.').trim()}
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Detail Hasil Test</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Jawaban Benar:</span>
                <span className="font-semibold text-green-600 ml-2">{result.score}</span>
              </div>
              <div>
                <span className="text-gray-600">Jawaban Salah:</span>
                <span className="font-semibold text-red-600 ml-2">
                  {result.totalQuestions - result.score}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Waktu Test:</span>
                <span className="font-semibold text-gray-800 ml-2">
                  {formatDuration(result.testDuration)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Tanggal Test:</span>
                <span className="font-semibold text-gray-800 ml-2">
                  {formatDate(result.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Umur:</span>
                <span className="font-semibold text-gray-800 ml-2">{age} tahun</span>
              </div>
              <div>
                <span className="text-gray-600">Jurusan:</span>
                <span className="font-semibold text-gray-800 ml-2">
                  {result.student.major || 'Belum dipilih'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Hasil Test
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleBackToDashboard}
            >
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

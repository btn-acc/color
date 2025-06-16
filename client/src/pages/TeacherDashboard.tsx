import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import StudentDataModal from "@/components/StudentDataModal";
import TestResultModal from "@/components/TestResultModal";
import { useAuth } from "@/lib/auth";
import { Users, CheckCircle, TrendingUp, Download, Eye, Play } from "lucide-react";
import { calculateAge, formatDate, getStatusColor } from "@/lib/utils";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats } = useQuery({
    queryKey: [`/api/teacher/${user?.id}/stats`],
    enabled: !!user?.id,
  });

  const { data: results = [] } = useQuery({
    queryKey: [`/api/teacher/${user?.id}/results`],
    enabled: !!user?.id,
  });

  const filteredResults = results.filter((result: any) =>
    result.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewResult = (result: any) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handleDownloadPDF = async (resultId: number) => {
    try {
      const response = await fetch(`/api/results/${resultId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-result-${resultId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="gradient-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Platform Test Buta Warna
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Sistem testing menggunakan metode Ishihara untuk calon siswa SMK. 
              Akurat, mudah digunakan, dan hasil dapat diunduh dalam format PDF.
            </p>
            <Button
              className="bg-white text-primary hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              onClick={() => setShowStudentModal(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Mulai Test Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="test-card bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="text-blue-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Siswa Tested</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="test-card bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="text-green-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Test Minggu Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.weeklyTests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="test-card bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <TrendingUp className="text-purple-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Akurasi Rata-rata</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.accuracy || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Card className="bg-white rounded-xl shadow-md overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-900">Test Terbaru</CardTitle>
              <div className="flex space-x-2">
                <Input
                  placeholder="Cari siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {/* <Button 
                  variant="outline"
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button> */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurusan</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasil</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result: any) => (
                    <TableRow key={result.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                            {result.student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{result.student.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(result.student.birthDate)} tahun
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.student.major || '-'}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.score}/{result.totalQuestions} ({result.percentage}%)
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.diagnosis)}`}>
                          {result.diagnosis}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-indigo-900"
                            onClick={() => handleViewResult(result)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleDownloadPDF(result.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentDataModal
        open={showStudentModal}
        onOpenChange={setShowStudentModal}
      />

      <TestResultModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        result={selectedResult}
      />
    </div>
  );
}

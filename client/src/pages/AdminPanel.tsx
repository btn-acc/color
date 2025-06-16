import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import CreateTeacherModal from "@/components/CreateTeacherModal";
import TestResultModal from "@/components/TestResultModal";
import { Users, GraduationCap, ClipboardList, TriangleAlert, Plus, Edit, Trash2, Download, Eye } from "lucide-react";
import { calculateAge, formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/admin/teachers'],
  });

  const { data: allResults = [] } = useQuery({
    queryKey: ['/api/admin/all-results'],
  });

  const filteredResults = selectedTeacher === "all" 
    ? allResults 
    : allResults.filter((result: any) => result.teacher.id.toString() === selectedTeacher);

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan guru ini?')) return;
    
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete teacher');
      
      toast({
        title: "Berhasil",
        description: "Guru berhasil dinonaktifkan",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menonaktifkan guru",
      });
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h2>
          <p className="text-gray-600">Kelola akun guru dan pantau laporan test siswa</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="text-blue-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Guru</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.teachers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <GraduationCap className="text-green-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.students || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <ClipboardList className="text-purple-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Test Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.monthlyTests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <TriangleAlert className="text-red-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Buta Warna</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.colorBlind || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Management */}
        <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <CardHeader>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-900">Manajemen Akun Guru</CardTitle>
              <Button 
                className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowCreateTeacher(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Buat Akun Guru
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Dilakukan</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {teachers.map((teacher: any) => (
                    <TableRow key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                            {teacher.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-sm text-gray-500">NIP: {teacher.nip}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.email}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.subject}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${teacher.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {teacher.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.testsCount || 0} test</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* All Student Reports */}
        <Card className="bg-white rounded-xl shadow-md overflow-hidden">
          <CardHeader>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-900">Laporan Semua Siswa</CardTitle>
              <div className="flex space-x-2">
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Pilih guru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Guru</SelectItem>
                    {teachers.map((teacher: any) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* <Button 
                  variant="outline"
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export Semua
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
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru Penguji</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurusan</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasil</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosa</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result: any) => (
                    <TableRow key={result.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{result.student.name}</div>
                          <div className="text-sm text-gray-500">{calculateAge(result.student.birthDate)} tahun</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.teacher.name}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student.major || '-'}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.score}/{result.totalQuestions} ({result.percentage}%)</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.diagnosis)}`}>
                          {result.diagnosis}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(result.createdAt)}</TableCell>
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

      <CreateTeacherModal
        open={showCreateTeacher}
        onOpenChange={setShowCreateTeacher}
      />

      <TestResultModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        result={selectedResult}
      />
    </div>
  );
}

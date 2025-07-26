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
import EditTeacherModal from "@/components/EditTeacherModal";
import TestResultModal from "@/components/TestResultModal";
import { Users, GraduationCap, ClipboardList, TriangleAlert, Plus, Edit, Trash2, Download, Eye } from "lucide-react";
import { calculateAge, formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import Swal from 'sweetalert2';

export default function AdminPanel() {
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showEditTeacher, setShowEditTeacher] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const { toast } = useToast();

  type Stats = {
    teachers: number;
    students: number;
    monthlyTests: number;
    colorBlind: number;
  };

  type Teacher = {
    id: number;
    name: string;
    email: string;
    nip: string;
    subject: string;
    testsCount: number;
  }

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
  });
  const { data: teachers = [] } = useQuery<Teacher>({
    queryKey: ['/api/admin/teachers'],
  });

  const { data: allResults = [] } = useQuery({
    queryKey: ['/api/admin/all-results'],
  });

  const [searchAdminQuery, setSearchAdminQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = allResults.filter((result: any) => {
    const matchTeacher =
      selectedTeacher === "all" ||
      result.teacher.id.toString() === selectedTeacher;
    const matchName = result.student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchTeacher && matchName;
  });

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher);
    setShowEditTeacher(true);
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Admin akan dinonaktifkan dan tidak dapat login!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, nonaktifkan!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete teacher');

      toast({
        title: "Berhasil",
        description: "Guru berhasil dinonaktifkan",
      });

      // Optionally show success SweetAlert
      await Swal.fire('Dinonaktifkan!', 'Guru telah dinonaktifkan.', 'success');

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menonaktifkan guru",
      });

      await Swal.fire('Gagal!', 'Terjadi kesalahan saat menonaktifkan.', 'error');
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

  // Pagination tabel siswa
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Pagination tabel admin
  const [adminPage, setAdminPage] = useState(1);
  const adminsPerPage = 5;
  const filteredAdmins = teachers.filter((teacher: any) =>
    teacher.name.toLowerCase().includes(searchAdminQuery.toLowerCase())
  );
  const totalAdminPages = Math.ceil(filteredAdmins.length / adminsPerPage);
  const indexLastAdmin = adminPage * adminsPerPage;
  const indexFirstAdmin = indexLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexFirstAdmin, indexLastAdmin);

  const goToAdminPage = (page: number) => {
    if (page >= 1 && page <= totalAdminPages) {
      setAdminPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Panel</h2>
          <p className="text-gray-600">Kelola akun admin dan pantau laporan test siswa</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Guru Aktif</p>
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

        {/* Admin Management */}
        <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <CardHeader>
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <CardTitle className="text-lg font-semibold text-gray-900">Manajemen Akun Admin</CardTitle>
              <div className="flex flex-col sm:flex-row sm:space-x-2 w-full sm:w-auto gap-2">
                <Input
                  type="text"
                  placeholder="Cari nama admin..."
                  value={searchAdminQuery}
                  onChange={(e) => setSearchAdminQuery(e.target.value)}
                  className="text-sm w-full sm:w-64"
                />
                <Button
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setShowCreateTeacher(true)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Buat Akun Admin
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Dilakukan</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="bg-white divide-y divide-gray-200">
                  {currentAdmins.map((teacher: any) => (
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
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.testsCount ?? 0} test</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-indigo-900"
                            onClick={() => handleEditTeacher(teacher)}
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

                  {/* Jika hasil pencarian kosong */}
                  {filteredAdmins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                        Data Admin tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center p-4 space-x-2">
                <button
                  onClick={() => goToAdminPage(adminPage - 1)}
                  disabled={adminPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToAdminPage(page)}
                    className={`px-3 py-1 text-sm border rounded ${adminPage === page ? 'bg-indigo-500 text-white' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToAdminPage(adminPage + 1)}
                  disabled={adminPage === totalAdminPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Student Reports */}
        <Card className="bg-white rounded-xl shadow-md overflow-hidden">
          <CardHeader>
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Laporan Semua Siswa</CardTitle>
              <div className="flex flex-col sm:flex-row sm:space-x-2 w-full sm:w-auto gap-2">
                <Input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 text-sm"
                />
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Pilih guru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua admin</SelectItem>
                    {teachers.map((teacher: any) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <Button 
                  variant="outline"
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export Semua
                </Button> */}

          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
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
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        Data Siswa tidak ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentResults.map((result: any) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center p-4 space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 text-sm border rounded ${currentPage === page ? 'bg-indigo-500 text-white' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateTeacherModal
        open={showCreateTeacher}
        onOpenChange={setShowCreateTeacher}
      />

      <EditTeacherModal
        open={showEditTeacher}
        onOpenChange={setShowEditTeacher}
        teacher={editingTeacher}
      />

      <TestResultModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        result={selectedResult}
      />
    </div>
  );
}
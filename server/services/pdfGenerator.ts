import PDFDocument from 'pdfkit';

interface TestResultWithRelations {
  id: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  diagnosis: string;
  recommendations: string;
  testDuration: number;
  createdAt: Date;
  student: {
    name: string;
    birthDate: string;
    major: string | null;
  };
  teacher: {
    name: string;
    nip: string | null;
  };
}

export async function generatePDF(result: TestResultWithRelations): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Calculate age
      const birthDate = new Date(result.student.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Header
      doc.fontSize(20).text('HASIL TEST BUTA WARNA', { align: 'center' });
      doc.fontSize(16).text('Metode Ishihara', { align: 'center' });
      doc.moveDown(2);

      // Student Information
      doc.fontSize(14).text('INFORMASI SISWA', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Nama: ${result.student.name}`);
      doc.text(`Umur: ${age} tahun`);
      doc.text(`Tanggal Lahir: ${new Date(result.student.birthDate).toLocaleDateString('id-ID')}`);
      if (result.student.major) {
        doc.text(`Jurusan: ${result.student.major}`);
      }
      doc.text(`Guru Penguji: ${result.teacher.name}${result.teacher.nip ? ` (${result.teacher.nip})` : ''}`);
      doc.text(`Tanggal Test: ${result.createdAt.toLocaleDateString('id-ID')}`);
      doc.moveDown(1);

      // Test Results
      doc.fontSize(14).text('HASIL TEST', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Skor: ${result.score}/${result.totalQuestions} (${result.percentage}%)`);
      doc.text(`Waktu Test: ${Math.floor(result.testDuration / 60)}:${(result.testDuration % 60).toString().padStart(2, '0')}`);
      doc.moveDown(1);

      // Diagnosis
      doc.fontSize(14).text('DIAGNOSA', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(result.diagnosis);
      doc.moveDown(1);

      // Recommendations
      doc.fontSize(14).text('REKOMENDASI', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(result.recommendations, { width: 500 });
      doc.moveDown(2);

      // Footer
      doc.fontSize(10);
      doc.text('Platform Test Buta Warna SMK - IshiTest', { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')} at ${new Date().toLocaleTimeString('id-ID')}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

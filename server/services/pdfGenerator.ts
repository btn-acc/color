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
    gender: string;
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
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const marginLeft = 80;
      const labelOffset = 100;
      const valueOffset = 120;
      const lineHeight = 18;

      // Hitung umur
      const birthDate = new Date(result.student.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const docNumber = `SKD/${String(result.id).padStart(3, '0')}/VIII/${result.createdAt.getFullYear()}`;
      const tanggalUjian = result.createdAt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Header dokumen
      doc.font('Helvetica-Bold').fontSize(16).text('PLATFORM PEMERIKSAAN KESEHATAN DIGITAL', { align: 'center' });
      doc.fontSize(16).text('WARNALYZE', { align: 'center' });
      doc.font('Helvetica').fontSize(12).text('Sistem Pemeriksaan Buta Warna Digital', { align: 'center' });

      const pageWidth = doc.page.width;
      const horizontalMargin = doc.page.margins.left;
      doc.moveTo(horizontalMargin, doc.y + 10).lineTo(pageWidth - horizontalMargin, doc.y + 10).lineWidth(2).stroke();

      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(16).text('LAPORAN PEMERIKSAAN BUTA WARNA', { align: 'center' });

      doc.moveDown(2);
      doc.font('Helvetica')
        .fontSize(11)
        .text(
          'Berdasarkan hasil tes buta warna yang dilakukan melalui platform Warnalyze, berikut ini adalah ringkasan hasil pemeriksaan pengguna:',
          marginLeft,
          doc.y,
          { align: 'justify' }
        );

      doc.moveDown(1.5);

      // Data siswa
      const infoPasien = [
        ['Nama', result.student.name.toUpperCase()],
        ['Tempat/Tgl Lahir', birthDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
        ['Jenis Kelamin', result.student.gender],
        ['Umur', `${age} Tahun`],
        ['Jurusan', result.student.major || '-']
      ];

      doc.fontSize(11);
      let currentY = doc.y;
      infoPasien.forEach(([label, value], index) => {
        const y = currentY + index * lineHeight;
        doc.text(label, marginLeft, y);
        doc.text(':', marginLeft + labelOffset, y);
        doc.text(value, marginLeft + valueOffset, y);
      });
      doc.y = currentY + infoPasien.length * lineHeight + 20;

      // Pernyataan diagnosis
      doc.text(
        `Berdasarkan hasil pemeriksaan Sistem pada tanggal ${tanggalUjian}, ternyata yang bersangkutan dinyatakan:`,
        marginLeft, doc.y, { align: 'justify' }
      );

      doc.moveDown(2);

      doc.font('Helvetica-Bold').fontSize(14).text(
        result.diagnosis.toUpperCase(),
        marginLeft, doc.y, { align: 'center' }
      );

      doc.moveDown(1.5);
      doc.font('Helvetica').fontSize(11).text(
        'Dipergunakan untuk: Persyaratan Melengkapi Berkas Masuk Jurusan/Program Studi',
        marginLeft, doc.y, { align: 'justify' }
      );

      doc.moveDown(0.5);
      doc.text(
        'Demikian surat keterangan ini diberikan untuk dapat dipergunakan sebagaimana perlunya.',
        marginLeft, doc.y, { align: 'justify' }
      );

      doc.moveDown(2);

      // Detail pemeriksaan
      doc.font('Helvetica-Bold').fontSize(12).text('DETAIL HASIL PEMERIKSAAN:', marginLeft, doc.y, { underline: true });
      doc.moveDown(0.5);

      const testDetails = [
        `Metode Pemeriksaan: Ishihara Color Vision Test`,
        `Skor Pencapaian: ${result.score} dari ${result.totalQuestions} soal (${result.percentage}%)`,
        `Durasi Pemeriksaan: ${Math.floor(result.testDuration / 60)} menit ${result.testDuration % 60} detik`,
        `Tanggal Pemeriksaan: ${tanggalUjian}`
      ];

      doc.font('Helvetica').fontSize(11);
      testDetails.forEach(line => {
        doc.text(`• ${line}`, marginLeft);
      });

      doc.moveDown(1.5);

      // Catatan & Rekomendasi
      if (result.recommendations.trim() !== '') {
        doc.font('Helvetica-Bold').fontSize(12).text('CATATAN DAN REKOMENDASI:', marginLeft, doc.y, { underline: true });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(
          result.recommendations,
          marginLeft, doc.y,
          {
            align: 'justify',
            width: doc.page.width - marginLeft - doc.page.margins.right
          }
        );
        doc.moveDown(2);
      }
      // Footer
      doc.moveDown(8);
      doc.font('Helvetica').fontSize(8).text('-'.repeat(80), { align: 'center' });
      doc.text('Dokumen ini dihasilkan secara elektronik melalui Sistem Warnalyze', { align: 'center' });
      doc.text(`Dicetak pada: ${today.toLocaleDateString('id-ID')} pukul ${today.toLocaleTimeString('id-ID')}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

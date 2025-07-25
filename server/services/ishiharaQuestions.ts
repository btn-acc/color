import { storage } from "../storage";

// Ishihara test questions with correct answers
const ISHIHARA_QUESTIONS = [
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/0.png",
    correctAnswer: "12",
    description: "Plate 0 - Normal vision should see 12"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/1.jpg",
    correctAnswer: "8",
    protanAnswer: "3",
    colorBlinfAnswer: "x",
    description: "Plate 1 - Normal vision should see 8"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/2.jpg",
    correctAnswer: "6",
    protanAnswer: "5",
    colorBlinfAnswer: "x",
    description: "Plate 2 - Normal vision should see 6"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/3.jpg",
    correctAnswer: "29",
    protanAnswer: "70",
    colorBlinfAnswer: "x",
    description: "Plate 3 - Normal vision should see 29"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/4.jpg",
    correctAnswer: "57",
    protanAnswer: "35",
    colorBlinfAnswer: "x",
    description: "Plate 4 - Normal vision should see 57"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/5.png",
    correctAnswer: "5",
    protanAnswer: "2",
    description: "Plate 5 - Normal vision should see 5"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/6.png",
    correctAnswer: "3",
    protanAnswer: "5",
    description: "Plate 6 - Normal vision should see 3"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/7.png",
    correctAnswer: "15",
    protanAnswer: "17",
    description: "Plate 7 - Normal vision should see 15"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/8.png",
    correctAnswer: "74",
    protanAnswer: "21",
    description: "Plate 8 - Normal vision should see 74"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/9.jpg",
    correctAnswer: "2",
    protanAnswer: "x",
    description: "Plate 9 - Normal vision should see 5"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/10.jpg",
    correctAnswer: "45",
    protanAnswer: "x",
    description: "Plate 10 - Normal vision should see 15"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/11.jpg",
    correctAnswer: "6",
    protanAnswer: "x",
    description: "Plate 11 - Normal vision should see 74"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/12.jpg",
    correctAnswer: "97",
    protanAnswer: "x",
    description: "Plate 12 - Normal vision should see 73"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/13.jpg",
    correctAnswer: "73",
    protanAnswer: "x",
    description: "Plate 13 - Normal vision should see 29"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/14.jpg",
    correctAnswer: "5",
    protanAnswer: "x",
    description: "Plate 14 - Normal vision should see 45"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/15.jpg",
    correctAnswer: "7",
    protanAnswer: "x",
    description: "Plate 15 - Normal vision should see 26"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/16.jpg",
    correctAnswer: "16",
    protanAnswer: "x",
    description: "Plate 16 - Normal vision should see 42"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/17.jpg",
    correctAnswer: "96",
    protanAnswer: "6",
    deutanAnswer: "9",
    colorBlinfAnswer: "x",
    description: "Plate 17 - Normal vision should see 35"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/18.jpg",
    correctAnswer: "26",
    protanAnswer: "6",
    deutanAnswer: "2",
    colorBlinfAnswer: "x",
    description: "Plate 18 - Normal vision should see 96"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/19.jpg",
    correctAnswer: "42",
    protanAnswer: "2",
    deutanAnswer: "4",
    colorBlinfAnswer: "x",
    description: "Plate 19 - For red-green blindness, no visible number"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/20.jpg",
    correctAnswer: "35",
    protanAnswer: "5",
    deutanAnswer: "3",
    colorBlinfAnswer: "x",
    description: "Plate 20 - For red-green blindness, no visible number"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/21.png",
    correctAnswer: "73",
    protanAnswer: "x",
    description: "Plate 21 - For red-green blindness, no visible number"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/22.png",
    correctAnswer: "16",
    protanAnswer: "x",
    description: "Plate 22 - For red-green blindness, no visible number"
  },
  {
    imageUrl: "https://raw.githubusercontent.com/0xcu8e5p4c3/S-P/main/imgcolor/23.png",
    correctAnswer: "7",
    protanAnswer: "x",
    description: "Plate 23 - For red-green blindness, no visible number"
  }
];


export async function getRandomizedQuestions() {
  // Shuffle the questions
  const shuffled = [...ISHIHARA_QUESTIONS].sort(() => Math.random() - 0.5);
  
  // Return shuffled questions with IDs
  return shuffled.map((question, index) => ({
    id: index + 1,
    ...question
  }));
}

export function calculateDiagnosis(score: number, totalQuestions: number) {
  const percentage = (score / totalQuestions) * 100;

  if (percentage >= 90) {
    return {
      diagnosis: "Penglihatan Warna Normal (Normal Trichromacy)",
      recommendations:
        "Hasil menunjukkan bahwa Anda memiliki penglihatan warna yang normal, tanpa indikasi gangguan persepsi warna. Tidak diperlukan pemeriksaan lanjutan atau tindakan medis. Anda dapat membedakan warna secara akurat dalam berbagai situasi pencahayaan, dan aman untuk menjalani aktivitas sehari-hari maupun pekerjaan yang membutuhkan kepekaan warna tinggi seperti mengemudi, pengamatan laboratorium, identifikasi peta, atau pekerjaan visual detail lainnya."
    };
  } else if (percentage >= 75) {
    return {
      diagnosis: "Deuteranomaly Ringan (Gangguan Persepsi Hijau Ringan)",
      recommendations:
        "Anda memiliki gangguan ringan dalam membedakan warna hijau terhadap merah. Meskipun penglihatan warna Anda hampir normal, Anda mungkin mengalami kebingungan warna dalam pencahayaan tertentu atau pada peta warna samar. Tidak diperlukan terapi atau pengobatan khusus, tetapi disarankan melakukan pemeriksaan berkala. Bila diperlukan, Anda bisa menggunakan bantuan visual seperti simbol tambahan atau label teks pada alat/perangkat berwarna agar tidak tertukar. Tidak ada hambatan signifikan dalam kehidupan sehari-hari."
    };
  } else if (percentage >= 60) {
    return {
      diagnosis: "Protanomaly / Deuteranomaly Sedang (Gangguan Warna Merah–Hijau Sedang)",
      recommendations:
        "Ditemukan tingkat kesulitan sedang dalam membedakan warna merah dan hijau, yang umum pada individu dengan protanomaly (merah) atau deuteranomaly (hijau). Gangguan ini biasanya bersifat genetik (bawaan). Sebaiknya lakukan konsultasi dengan dokter spesialis mata untuk memastikan jenis dan derajat buta warna secara detail menggunakan tes lanjutan seperti Farnsworth D-15 atau Anomaloscope. Dalam aktivitas sehari-hari, disarankan menghindari kebergantungan mutlak pada warna (misal: lampu sinyal, kabel listrik warna, bahan kimia berlabel warna), serta gunakan bantuan simbol atau bentuk jika memungkinkan."
    };
  } else {
    return {
      diagnosis: "Buta Warna Merah–Hijau (Protanopia / Deuteranopia)",
      recommendations:
        "Hasil menunjukkan kemungkinan tinggi Anda mengalami buta warna tipe protanopia (tidak dapat melihat merah) atau deuteranopia (tidak dapat melihat hijau). Gangguan ini bersifat bawaan dan umumnya diturunkan secara genetik melalui kromosom X. Disarankan melakukan pemeriksaan lengkap di klinik mata atau dokter spesialis mata untuk diagnosis pasti. Meskipun tidak berbahaya, kondisi ini dapat memengaruhi aktivitas tertentu seperti membaca peta, mengenali lampu lalu lintas, atau bekerja dengan sinyal berwarna. Anda dapat menggunakan alat bantu visual seperti lensa filter warna (EnChroma, Pilestone), atau mengganti identifikasi warna dengan label simbol/teks dalam kehidupan dan pekerjaan."
    };
  }
}


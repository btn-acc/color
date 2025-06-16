import { storage } from "../storage";

// Ishihara test questions with correct answers
const ISHIHARA_QUESTIONS = [
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ishihara_9.png",
    correctAnswer: "74",
    options: ["74", "21", "71", "Tidak Ada"],
    description: "Test plate 1 - Should see 74"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Ishihara_3.png", 
    correctAnswer: "8",
    options: ["8", "3", "5", "Tidak Ada"],
    description: "Test plate 2 - Should see 8"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ishihara_5.png",
    correctAnswer: "5",
    options: ["5", "2", "3", "Tidak Ada"],
    description: "Test plate 3 - Should see 5"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Ishihara_6.png",
    correctAnswer: "Tidak Ada",
    options: ["6", "9", "5", "Tidak Ada"],
    description: "Test plate 4 - Color blind see nothing"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/Ishihara_7.png",
    correctAnswer: "Tidak Ada",
    options: ["7", "2", "1", "Tidak Ada"],
    description: "Test plate 5 - Color blind see nothing"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Ishihara_8.png",
    correctAnswer: "6",
    options: ["6", "9", "8", "Tidak Ada"],
    description: "Test plate 6 - Should see 6"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Ishihara_10.png",
    correctAnswer: "12",
    options: ["12", "17", "21", "Tidak Ada"],
    description: "Test plate 7 - Should see 12"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ishihara_11.png",
    correctAnswer: "13",
    options: ["13", "18", "B", "Tidak Ada"],
    description: "Test plate 8 - Should see 13"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Ishihara_12.png",
    correctAnswer: "16",
    options: ["16", "18", "10", "Tidak Ada"],
    description: "Test plate 9 - Should see 16"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ishihara_13.png",
    correctAnswer: "73",
    options: ["73", "23", "78", "Tidak Ada"],
    description: "Test plate 10 - Should see 73"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Ishihara_14.png",
    correctAnswer: "Tidak Ada",
    options: ["45", "25", "2", "Tidak Ada"],
    description: "Test plate 11 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Ishihara_15.png",
    correctAnswer: "26",
    options: ["26", "6", "29", "Tidak Ada"],
    description: "Test plate 12 - Should see 26"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Ishihara_16.png",
    correctAnswer: "42",
    options: ["42", "24", "2", "Tidak Ada"],
    description: "Test plate 13 - Should see 42"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/52/Ishihara_17.png",
    correctAnswer: "35",
    options: ["35", "5", "3", "Tidak Ada"],
    description: "Test plate 14 - Should see 35"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Ishihara_18.png",
    correctAnswer: "96",
    options: ["96", "6", "9", "Tidak Ada"],
    description: "Test plate 15 - Should see 96"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/09/Ishihara_19.png",
    correctAnswer: "Tidak Ada",
    options: ["45", "15", "5", "Tidak Ada"],
    description: "Test plate 16 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Ishihara_20.png",
    correctAnswer: "Tidak Ada",
    options: ["73", "3", "7", "Tidak Ada"],
    description: "Test plate 17 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Ishihara_21.png",
    correctAnswer: "Tidak Ada",
    options: ["26", "6", "2", "Tidak Ada"],
    description: "Test plate 18 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ishihara_22.png",
    correctAnswer: "Tidak Ada",
    options: ["42", "2", "4", "Tidak Ada"],
    description: "Test plate 19 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/27/Ishihara_23.png",
    correctAnswer: "Tidak Ada",
    options: ["35", "3", "5", "Tidak Ada"],
    description: "Test plate 20 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Ishihara_24.png",
    correctAnswer: "Tidak Ada",
    options: ["96", "6", "9", "Tidak Ada"],
    description: "Test plate 21 - Color blind may see number"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Ishihara_25.png",
    correctAnswer: "29",
    options: ["29", "20", "9", "Tidak Ada"],
    description: "Test plate 22 - Should see 29"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Ishihara_26.png",
    correctAnswer: "70",
    options: ["70", "0", "7", "Tidak Ada"],
    description: "Test plate 23 - Should see 70"
  },
  {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Ishihara_27.png",
    correctAnswer: "5",
    options: ["5", "S", "2", "Tidak Ada"],
    description: "Test plate 24 - Should see 5"
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
      diagnosis: "Penglihatan Warna Normal",
      recommendations: "Siswa memiliki kemampuan penglihatan warna yang normal dan dapat membedakan warna dengan baik. Semua jurusan tersedia untuk dipilih. Sangat cocok untuk jurusan yang memerlukan penglihatan warna akurat seperti Teknik Grafis, Desain, dan jurusan visual lainnya."
    };
  } else if (percentage >= 75) {
    return {
      diagnosis: "Deuteranomaly Ringan",
      recommendations: "Siswa memiliki sedikit kesulitan dalam membedakan warna hijau-merah. Masih dapat mengikuti sebagian besar jurusan dengan sedikit adaptasi. Hindari jurusan yang sangat bergantung pada penglihatan warna seperti desain grafis atau teknik kelistrikan."
    };
  } else if (percentage >= 60) {
    return {
      diagnosis: "Protanomaly/Deuteranomaly Sedang",
      recommendations: "Siswa memiliki kesulitan yang cukup signifikan dalam membedakan warna. Disarankan memilih jurusan yang tidak terlalu bergantung pada penglihatan warna seperti Akuntansi, Administrasi Perkantoran, atau Teknik Mesin."
    };
  } else {
    return {
      diagnosis: "Buta Warna Deutan/Protan",
      recommendations: "Siswa memiliki kesulitan serius dalam membedakan warna merah-hijau. Sangat disarankan memilih jurusan yang tidak memerlukan penglihatan warna seperti Akuntansi, Administrasi Perkantoran, atau bidang yang tidak terkait dengan identifikasi warna."
    };
  }
}

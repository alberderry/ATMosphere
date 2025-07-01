// src/utils/relocationUtils.js

// Fungsi untuk menghitung jarak antara dua koordinat (rumus Haversine)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radius Bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fungsi untuk mendapatkan skema warna berdasarkan potensi
export const getColorScheme = (potential) => {
  switch (potential) {
    case "Berpotensi":
      return "green"
    case "Perlu Diperhitungkan":
      return "yellow"
    case "Rentan":
      return "red"
    default:
      return "gray"
  }
}

// Fungsi untuk mendapatkan warna tier
export const getTierColor = (tier) => {
  switch (tier) {
    case "TIER 1":
      return "green"
    case "TIER 2":
      return "yellow"
    case "TIER 3":
      return "red"
    default:
      return "gray"
  }
}

// Fungsi untuk mendapatkan ikon tipe cabang
// src/utils/relocationUtils.js
// ... (fungsi lain di atas) ...

// Fungsi untuk mendapatkan ikon tipe cabang
export const getBranchTypeIcon = (types) => {
  // Pastikan 'types' adalah array. Jika tidak, anggap kosong.
  if (!Array.isArray(types)) {
    // Berdasarkan respons API, branch tidak memiliki 'types' field,
    // tapi NearbyBranchesCard memanggilnya dengan branch.types.
    // Jika branch.name memiliki "ATM" atau "KCP", kita bisa menggunakannya.
    // Misal: Anda bisa pass branch.name ke sini dan menguraikannya.
    // Namun, berdasarkan respons, nearest_branches tidak punya 'types'.
    // nearest_atms juga tidak punya 'types', hanya 'name'.
    // Jadi, kita harus mengubah cara pemanggilan getBranchTypeIcon di NearbyBranchesCard
    // ATAU mengubah getBranchTypeIcon untuk mengambil 'name' properti.
    // Untuk saat ini, asumsikan 'types' adalah array seperti ['atm'] atau ['bank'].
    return "🏢"; // Ikon default jika types tidak valid
  }

  // Menggunakan .some() karena types adalah array, dan kita mencari setidaknya satu kecocokan
  if (types.some(type => type.toLowerCase().includes("atm"))) return "🏧";
  if (types.some(type => type.toLowerCase().includes("bank") || type.toLowerCase().includes("kcp"))) return "🏦";
  return "🏢";
};

// Fungsi untuk mendapatkan ikon lokasi umum
export const getCommonPlaceIcon = (types) => {
  // Pastikan 'types' adalah array. Jika tidak, anggap kosong.
  if (!Array.isArray(types)) {
    return "📍"; // Ikon default jika types tidak valid
  }

  // Menggunakan .some() dan toLowerCase() untuk pencocokan yang lebih fleksibel
  if (types.some(type => type.toLowerCase().includes("school"))) return "🏫";
  if (types.some(type => type.toLowerCase().includes("university"))) return "🎓";
  if (types.some(type => type.toLowerCase().includes("supermarket"))) return "🛒";
  if (types.some(type => type.toLowerCase().includes("market"))) return "🍎";
  if (types.some(type => type.toLowerCase().includes("hotel") || type.toLowerCase().includes("lodging"))) return "🏨";
  if (types.some(type => type.toLowerCase().includes("health") || type.toLowerCase().includes("hospital") || type.toLowerCase().includes("clinic"))) return "🏥";
  if (types.some(type => type.toLowerCase().includes("housing_complex") || type.toLowerCase().includes("residential") || type.toLowerCase().includes("neighborhood"))) return "🏘️";
  if (types.some(type => type.toLowerCase().includes("restaurant") || type.toLowerCase().includes("cafe"))) return "🍽️";
  if (types.some(type => type.toLowerCase().includes("mall") || type.toLowerCase().includes("shopping_mall"))) return "🛍️";

  return "📍";
};
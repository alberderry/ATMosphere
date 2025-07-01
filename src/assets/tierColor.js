// src/constants/tierColors.js

export const tierStyles = {
    'TIER 1': { // Hijau
        cardBg: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
        textColor: "white", // Teks putih untuk background gelap
        iconBg: "white",
        iconColor: "#4CAF50",
        glowColor: '#8BC34A',
    },
    'TIER 2': { // Biru
        cardBg: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
        textColor: "white",
        iconBg: "white",
        iconColor: "#2196F3",
        glowColor: '#64B5F6',
    },
    'TIER 3': { // Kuning
        cardBg: "linear-gradient(135deg, #FFC107 0%, #FFEB3B 100%)",
        textColor: "gray.800", // Teks gelap untuk background cerah
        iconBg: "white",
        iconColor: "#FFC107",
        glowColor: '#FFEB3B',
    },
    'TIER 4': { // Merah
        cardBg: "linear-gradient(135deg, #F44336 0%, #EF9A9A 100%)",
        textColor: "white",
        iconBg: "white",
        iconColor: "#F44336",
        glowColor: '#EF9A9A',
    },
    'TIDAK DIHITUNG': { // Abu-abu
        cardBg: "linear-gradient(135deg, #78909C 0%, #B0BEC5 100%)",
        textColor: "white",
        iconBg: "white",
        iconColor: "#78909C",
        glowColor: '#CFD8DC',
    },
    // Default jika tier tidak ada atau tidak dikenali
    'default': {
        cardBg: "linear-gradient(135deg, #A0AEC0 0%, #CBD5E0 100%)", // Abu-abu default
        textColor: "white",
        iconBg: "white",
        iconColor: "#718096",
        glowColor: '#CFD8DC',
    }
};

// Fungsi pembantu yang diperbarui untuk menangani angka dan string
export const getTierStyles = (tierValue) => {
    let effectiveTierKey = 'default';

    if (typeof tierValue === 'number') {
        // Jika tierValue adalah 0, anggap 'TIDAK DIHITUNG'
        if (tierValue === 0) {
            effectiveTierKey = 'TIDAK DIHITUNG';
        } else {
            effectiveTierKey = `TIER ${tierValue}`;
        }
    } else if (typeof tierValue === 'string') {
        // Normalisasi string jika ada perbedaan kapitalisasi atau spasi
        const normalizedTier = tierValue.toUpperCase().trim();
        if (tierStyles[normalizedTier]) {
            effectiveTierKey = normalizedTier;
        } else if (normalizedTier.includes('TIDAK DIHITUNG')) { // Tangani variasi 'TIDAK DIHITUNG'
            effectiveTierKey = 'TIDAK DIHITUNG';
        }
    }

    // Pastikan kunci yang dihasilkan ada di tierStyles, jika tidak pakai 'default'
    if (!tierStyles[effectiveTierKey]) {
        effectiveTierKey = 'default';
    }

    return tierStyles[effectiveTierKey];
};
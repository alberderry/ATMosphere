// components/RelocationUtils.jsx
export const getVolumeTier = (volume) => {
    if (volume > 3600) return { tier: '1', gradient: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)' }; // Blue for Tier 1
    if (volume > 2000 && volume <= 3600) return { tier: '2', gradient: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' }; // Green for Tier 2
    if (volume > 1000 && volume <= 2000) return { tier: '3', gradient: 'linear-gradient(135deg, #ECC94B 0%, #D69E2E 100%)' }; // Yellow for Tier 3
    return { tier: '4', gradient: 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)' }; // Red for Tier 4
};

export const getCardBackgroundGradient = (status) => {
    switch (status) {
        case 'rejected':
            return 'linear-gradient(90deg, rgba(244, 102, 102, 0.74) 0%, rgba(235, 28, 28, 0.59) 100%)'; // Merah gradien
        case 'approved':
            return 'linear-gradient(90deg, rgba(144, 238, 144, 0.2) 0%, rgba(144, 238, 144, 0.5) 100%)'; // Hijau gradien
        case 'in_progress':
            return 'linear-gradient(90deg, rgba(255, 255, 0, 0.2) 0%, rgba(255, 255, 0, 0.5) 100%)'; // Kuning gradien
        default:
            return 'white'; // Default jika status tidak dikenali
    }
};
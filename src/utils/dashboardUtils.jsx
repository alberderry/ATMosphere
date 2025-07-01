// src/utils/helpers.js

export const formatPercentageChange = (currentValue, previousValue) => {
  if (previousValue === 0 || previousValue === undefined || previousValue === null) {
    if (currentValue > 0) {
      return { growth: '+Inf%', color: 'green' };
    } else if (currentValue < 0) {
      return { growth: '-Inf%', color: 'red' };
    } else {
      return { growth: '0.0%', color: 'gray' };
    }
  }

  const change = currentValue - previousValue;
  const percentage = (change / previousValue) * 100;
  const sign = percentage >= 0 ? '+' : '';
  const color = percentage >= 0 ? 'green' : 'red';

  return {
    growth: `${sign}${percentage.toFixed(1)}%`,
    color: color,
  };
};

export const getPeriodId = (periodString) => {
  switch (periodString) {
    case "Juli - September, 2024": return 1;
    case "Oktober - Desember, 2024": return 2;
    case "Januari - Maret, 2025": return 3;
    case "April - Juni, 2025": return 4;
    default: return 1; // Default ke Q1 2024 jika tidak ada yang cocok
  }
};
export const getTierColor = (tierValue) => {
  switch (tierValue) {
    case 1: return '#28a745'; // green.400
    case 2: return '#007bff'; // blue.400
    case 3: return '#ffc107'; // yellow.400
    case 4: return '#dc3545'; // red.500
    case 0: return '#6c757d'; // gray.400 (untuk TIDAK DIHITUNG)
    default: return '#6c757d'; // Default gray
  }
};

export const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};
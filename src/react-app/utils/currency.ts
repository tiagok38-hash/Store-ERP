// Utilidades para formatação de moeda brasileira

// Formatar número para formato brasileiro (1.234,56)
export const formatCurrencyBR = (value: number): string => {
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Formatar valor para exibição com R$
export const formatCurrencyDisplay = (value: number): string => {
  return `R$ ${formatCurrencyBR(value)}`;
};

// Formatar entrada de campo de texto para padrão brasileiro
export const formatCurrencyInput = (value: string): string => {
  // 1. Remove all non-digit and non-comma characters
  let cleanValue = value.replace(/[^0-9,]/g, '');

  // 2. Handle empty string
  if (!cleanValue) return '';

  // 3. Split into integer and decimal parts
  const parts = cleanValue.split(',');
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? parts[1] : '';

  // 4. Remove leading zeros from integer part, unless it's just "0"
  if (integerPart.length > 1 && integerPart.startsWith('0')) {
    integerPart = integerPart.replace(/^0+/, '');
    if (integerPart === '') integerPart = '0'; // If all zeros removed, keep one '0'
  } else if (integerPart === '') {
    integerPart = '0'; // If user types ",50", integer part is initially empty
  }

  // 5. Limit decimal part to 2 digits
  decimalPart = decimalPart.slice(0, 2);

  // 6. Add thousands separator to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // 7. Reconstruct the formatted string
  if (parts.length > 1) { // If there was a comma in the original cleanValue
    return `${formattedInteger},${decimalPart}`;
  } else { // No comma, just integer part
    return formattedInteger;
  }
};

// Converter entrada brasileira (1.234,56) para número
export const parseCurrencyBR = (value: string): number => {
  if (!value) return 0;
  // Remove pontos (separadores de milhares) e converte vírgula em ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

// Validar se o valor é um valor monetário válido
export const isValidCurrency = (value: string): boolean => {
  const parsed = parseCurrencyBR(value);
  return !isNaN(parsed) && parsed >= 0;
};

// Hook para campos de entrada de moeda
export const useCurrencyInput = (initialValue: number = 0) => {
  const formatValue = (num: number): string => {
    return formatCurrencyBR(num);
  };

  const handleChange = (inputValue: string): { formatted: string; numeric: number } => {
    const formatted = formatCurrencyInput(inputValue);
    const numeric = parseCurrencyBR(formatted);
    
    return { formatted, numeric };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setValue: (value: string) => void) => {
    const { formatted } = handleChange(e.target.value);
    setValue(formatted);
  };

  return {
    formatValue,
    handleChange,
    handleInputChange,
    parseCurrencyBR,
    formatCurrencyInput
  };
};
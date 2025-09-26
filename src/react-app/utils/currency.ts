// Utilidades para formatação de moeda brasileira

// Formatar número para formato brasileiro (1.234,56)
export const formatCurrencyBR = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '0,00'; // Retorna '0,00' se o valor for nulo ou indefinido
  }
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Formatar valor para exibição com R$
export const formatCurrencyDisplay = (value: number | null | undefined): string => {
  return `R$ ${formatCurrencyBR(value)}`;
};

// Formatar entrada de campo de texto para padrão brasileiro
export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não for dígito ou vírgula
  let cleanValue = value.replace(/[^0-9,]/g, '');

  // Garante que haja apenas uma vírgula
  const commaCount = (cleanValue.match(/,/g) || []).length;
  if (commaCount > 1) {
    const firstCommaIndex = cleanValue.indexOf(',');
    cleanValue = cleanValue.substring(0, firstCommaIndex + 1) + cleanValue.substring(firstCommaIndex + 1).replace(/,/g, '');
  }

  // Se a string estiver vazia, retorna vazio
  if (!cleanValue) return '';

  // Se a vírgula for o último caractere, mantém
  if (cleanValue.endsWith(',')) {
    const integerPart = cleanValue.split(',')[0].replace(/^0+/, '') || '0'; // Remove zeros à esquerda para a parte inteira
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},`;
  }

  // Se não houver vírgula, formata como inteiro
  if (!cleanValue.includes(',')) {
    const integerPart = cleanValue.replace(/^0+/, '') || '0'; // Remove zeros à esquerda
    return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Se houver vírgula e parte decimal
  const [integerPartRaw, decimalPartRaw] = cleanValue.split(',');
  const integerPart = integerPartRaw.replace(/^0+/, '') || '0'; // Remove zeros à esquerda
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedDecimal = decimalPartRaw.slice(0, 2); // Limita a 2 casas decimais

  return `${formattedInteger},${formattedDecimal}`;
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
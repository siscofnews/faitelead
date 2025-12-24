/**
 * Serviço de validação de documentos internacionais
 * Suporta: CPF (Brasil), NIF (Portugal), NIR (França)
 */

export type DocumentType = 'CPF' | 'NIF' | 'NIR';
export type Country = 'Brasil' | 'Portugal' | 'França';

// ============================================
// BRASIL - CPF
// ============================================

export function validateCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;

    // Validar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) return false;

    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    digit1 = digit1 >= 10 ? 0 : digit1;

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    digit2 = digit2 >= 10 ? 0 : digit2;

    return (
        parseInt(cleaned[9]) === digit1 &&
        parseInt(cleaned[10]) === digit2
    );
}

export function formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskCPF(value: string): string {
    const cleaned = value.replace(/\D/g, '').substring(0, 11);
    return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ============================================
// PORTUGAL - NIF
// ============================================

export function validateNIF(nif: string): boolean {
    const cleaned = nif.replace(/\D/g, '');

    if (cleaned.length !== 9) return false;

    // Primeiro dígito deve ser válido (1, 2, 3, 5, 6, 8 ou 9)
    const firstDigit = parseInt(cleaned[0]);
    if (![1, 2, 3, 5, 6, 8, 9].includes(firstDigit)) return false;

    // Calcular dígito verificador
    let sum = 0;
    for (let i = 0; i < 8; i++) {
        sum += parseInt(cleaned[i]) * (9 - i);
    }

    const checkDigit = 11 - (sum % 11);
    const expectedDigit = checkDigit >= 10 ? 0 : checkDigit;

    return parseInt(cleaned[8]) === expectedDigit;
}

export function formatNIF(nif: string): string {
    const cleaned = nif.replace(/\D/g, '');
    if (cleaned.length !== 9) return nif;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
}

export function maskNIF(value: string): string {
    const cleaned = value.replace(/\D/g, '').substring(0, 9);
    return cleaned.replace(/(\d{3})(\d{1,3})?(\d{1,3})?/, (_, a, b, c) => {
        let result = a;
        if (b) result += ' ' + b;
        if (c) result += ' ' + c;
        return result;
    });
}

// ============================================
// FRANÇA - NIR (Numéro de Sécurité Sociale)
// ============================================

export function validateNIR(nir: string): boolean {
    const cleaned = nir.replace(/\D/g, '');

    if (cleaned.length !== 15) return false;

    // Validar sexo (1=homem, 2=mulher, 3/4=outros casos)
    const sex = parseInt(cleaned[0]);
    if (![1, 2, 3, 4, 7, 8].includes(sex)) return false;

    // Validar ano (00-99)
    const year = parseInt(cleaned.substring(1, 3));
    if (year < 0 || year > 99) return false;

    // Validar mês (01-12 ou 20 para desconhecido)
    const month = parseInt(cleaned.substring(3, 5));
    if ((month < 1 || month > 12) && month !== 20 && month !== 30 && month !== 40 && month !== 50) {
        return false;
    }

    // Validação básica de estrutura (validação completa requer módulo 97)
    return true;
}

export function formatNIR(nir: string): string {
    const cleaned = nir.replace(/\D/g, '');
    if (cleaned.length !== 15) return nir;
    return cleaned.replace(
        /(\d{1})(\d{2})(\d{2})(\d{2})(\d{3})(\d{3})(\d{2})/,
        '$1 $2 $3 $4 $5 $6 $7'
    );
}

export function maskNIR(value: string): string {
    const cleaned = value.replace(/\D/g, '').substring(0, 15);
    const parts: string[] = [];

    if (cleaned.length > 0) parts.push(cleaned.substring(0, 1));
    if (cleaned.length > 1) parts.push(cleaned.substring(1, 3));
    if (cleaned.length > 3) parts.push(cleaned.substring(3, 5));
    if (cleaned.length > 5) parts.push(cleaned.substring(5, 7));
    if (cleaned.length > 7) parts.push(cleaned.substring(7, 10));
    if (cleaned.length > 10) parts.push(cleaned.substring(10, 13));
    if (cleaned.length > 13) parts.push(cleaned.substring(13, 15));

    return parts.join(' ');
}

// ============================================
// FUNÇÕES GENÉRICAS
// ============================================

export function getDocumentTypeForCountry(country: Country): DocumentType {
    switch (country) {
        case 'Brasil': return 'CPF';
        case 'Portugal': return 'NIF';
        case 'França': return 'NIR';
    }
}

export function validateDocument(type: DocumentType, number: string): boolean {
    switch (type) {
        case 'CPF': return validateCPF(number);
        case 'NIF': return validateNIF(number);
        case 'NIR': return validateNIR(number);
        default: return false;
    }
}

export function formatDocument(type: DocumentType, number: string): string {
    switch (type) {
        case 'CPF': return formatCPF(number);
        case 'NIF': return formatNIF(number);
        case 'NIR': return formatNIR(number);
        default: return number;
    }
}

export function maskDocument(type: DocumentType, value: string): string {
    switch (type) {
        case 'CPF': return maskCPF(value);
        case 'NIF': return maskNIF(value);
        case 'NIR': return maskNIR(value);
        default: return value;
    }
}

export function getDocumentPlaceholder(type: DocumentType): string {
    switch (type) {
        case 'CPF': return '000.000.000-00';
        case 'NIF': return '000 000 000';
        case 'NIR': return '0 00 00 00 000 000 00';
        default: return '';
    }
}

export function getDocumentMaxLength(type: DocumentType): number {
    switch (type) {
        case 'CPF': return 14; // com formatação
        case 'NIF': return 11; // com formatação
        case 'NIR': return 21; // com formatação
        default: return 20;
    }
}

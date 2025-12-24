/**
 * Serviço de integração com ViaCEP para busca automática de endereços
 */

export interface CEPAddress {
    cep: string;
    street: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
}

export interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 * @param cep CEP para buscar (com ou sem formatação)
 * @returns Dados do endereço ou erro
 */
export async function fetchAddressByCEP(cep: string): Promise<CEPAddress> {
    // Remover formatação (deixar apenas números)
    const cleanCEP = cep.replace(/\D/g, '');

    // Validar comprimento
    if (cleanCEP.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);

        if (!response.ok) {
            throw new Error('Erro ao consultar CEP');
        }

        const data: ViaCEPResponse = await response.json();

        // ViaCEP retorna erro: true quando CEP não existe
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }

        // Mapear resposta para nosso formato
        return {
            cep: data.cep,
            street: data.logradouro || '',
            complement: data.complemento || '',
            neighborhood: data.bairro || '',
            city: data.localidade,
            state: data.uf,
            country: 'Brasil',
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erro ao buscar CEP');
    }
}

/**
 * Formata CEP para exibição (12345-678)
 */
export function formatCEP(cep: string): string {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return cep;
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

/**
 * Valida se CEP tem formato válido
 */
export function isValidCEP(cep: string): boolean {
    const clean = cep.replace(/\D/g, '');
    return clean.length === 8;
}

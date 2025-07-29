export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    status: string;
    moradorId: number | null;
    moradorNome: string | null;
    token: string;
}

// --- MORADOR ---
export interface Morador {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string;
    celular: string;
    email: string;
    contatosFamilia: string;
    senha?: string;
}

export interface MoradorDTO extends Omit<Morador, 'id'> {}


// --- TIPO DE CONTA ---
export interface TipoConta {
    id: number;
    descricao: string;
    observacao: string;
}

export type TipoContaDTO = Omit<TipoConta, 'id'>;


// --- CONTA ---
// Esta interface Rateio é para quando recebemos o objeto Conta expandido do backend.
// Ela já tem moradorId e moradorNome, o que é consistente com o RateioDTO do backend.
export interface Rateio {
    id?: number;
    moradorId: number;
    moradorNome: string;
    valor: number;
    status: string;
}

// CORREÇÃO CRUCIAL AQUI: Interface Conta no frontend para RECEBER dados do backend
// Ela deve refletir o ContaDTO que o backend está ENVIANDO.
export interface Conta { // Renomeada para ContaRecebida ou algo assim se preferir, mas vamos manter 'Conta'
    id: number;
    observacao: string;
    valor: number;
    dataVencimento: string;
    
    // ATENÇÃO: Estes agora são IDs e Strings simples, como o backend ContaDTO envia
    responsavelId: number;   // <--- CORRIGIDO: Era 'responsavel: Morador'
    responsavelNome: string; // <--- NOVO: Adicionado o nome do responsável
    tipoContaId: number;     // <--- CORRIGIDO: Era 'tipoConta: TipoConta'
    tipoContaDescricao: string; // <--- NOVO: Adicionado a descrição do tipo de conta
    
    rateios: Rateio[];       // Lista de Rateio (como já está na sua definição)
    situacao: string;
}

// DTO para ENVIAR dados ao backend ao criar/atualizar uma conta.
// Esta interface JÁ ESTAVA CORRETA para o envio.
export interface ContaDTO {
    observacao: string;
    valor: number;
    dataVencimento: string; // Formato YYYY-MM-DD
    responsavel: { id: number };
    tipoConta: { id: number };
    rateios: {
        morador: { id: number };
        valor: number;
        status: string;
    }[];
}


// --- DADOS ADICIONAIS ---
export interface GastoPorTipo {
    tipoDescricao: string;
    total: number;
}

export interface Historico {
    id: number;
    conta: { id: number };
    morador: { id: number };
    acao: string;
    timestamp: string;
}

export interface SaldoMoradorDTO {
    moradorId: number;
    nome: string;
    saldoDevedor: number;
}
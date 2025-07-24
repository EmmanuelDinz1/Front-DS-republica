export interface LoginRequest {
    email: string;
    senha: string; // Ou 'password' se o backend esperar 'password'
}

export type LoginResponse = {
    token: string,
    name: string
}

// Arquivo: src/app/types/models.ts

// --- MORADOR ---
export interface Morador {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string; // Manter como string no formato ISO ou YYYY-MM-DD
    celular: string;
    email: string;
    contatosFamilia: string;
    senha?: string; // Adicionado: Campo opcional para envio de senha no DTO de criação, se necessário.
                    // A entidade Morador do backend tem senha, e o service de cadastro usa.
                    // Para o MoradorDTO de cadastro/atualização, é importante ter.
}

// DTO (Data Transfer Object) para criar/atualizar um morador
// Incluímos a senha aqui, pois o backend espera ela no cadastro.
// Para atualização, pode ser opcional.
export interface MoradorDTO {
    nome: string;
    cpf: string;
    dataNascimento: string;
    celular: string;
    email: string;
    contatosFamilia: string;
    senha?: string; // Adicionado explicitamente para o DTO de criação/atualização
}

// --- TIPO DE CONTA ---
export interface TipoConta {
    id: number;
    descricao: string;
    observacao: string;
}

// Omitimos o 'id' para quando for criar/atualizar um TipoConta, já que o ID é gerado pelo backend.
export type TipoContaDTO = Omit<TipoConta, 'id'>;


// --- CONTA ---
// Ajustado para refletir o que o backend provavelmente retorna para Rateio dentro de ContaDTO (moradorId, moradorNome, status)
// Se o backend realmente retornar o objeto Morador completo dentro do Rateio, volte para `morador: Morador;`
export interface Rateio {
    id?: number; // Opcional para criação, pode vir do backend na resposta
    moradorId: number; // ID do morador para o rateio
    moradorNome: string; // Nome do morador para exibição
    valor: number;
    status: string; // Ex: "PAGO", "EM_ABERTO"
}

export interface Conta {
    id: number;
    observacao: string;
    valor: number;
    dataVencimento: string;
    responsavel: Morador; // O backend expande o responsável ao retornar a ContaDTO
    tipoConta: TipoConta; // O backend expande o tipo de conta ao retornar a ContaDTO
    rateios: Rateio[]; // Ajustado para a nova interface Rateio mais consistente
    situacao: string; // CORRIGIDO: Era 'paga: boolean', agora 'situacao: string' para ser consistente com o backend
}

// DTO para enviar dados ao backend ao criar/atualizar uma conta.
// Note que para os objetos aninhados, enviamos apenas o 'id'.
export interface ContaDTO {
    observacao: string;
    valor: number;
    dataVencimento: string; // Formato YYYY-MM-DD
    responsavel: { id: number };
    tipoConta: { id: number };
    rateios: {
        morador: { id: number }; // Envia apenas o ID do morador para o rateio
        valor: number;
        status: string; // <--- AJUSTADO: Agora é OBRIGATÓRIO, pois o formulário sempre o envia
    }[];
}

// --- DADOS ADICIONAIS ---
// CORRIGIDO: Nomes dos campos para corresponderem ao GastosTipoDTO do backend
export interface GastoPorTipo {
    tipoDescricao: string; // Era 'tipoConta__descricao'
    total: number;         // Era 'total_gasto'
}

export interface Historico {
    id: number;
    conta: { id: number };
    morador: { id: number };
    acao: string;
    timestamp: string;
}

// Novo DTO para o saldo do morador, alinhado com o backend
export interface SaldoMoradorDTO {
    moradorId: number;
    nome: string;
    saldoDevedor: number;
}
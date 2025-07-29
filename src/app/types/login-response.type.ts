// src/app/types/models.ts
export interface LoginResponse {
    status: string;
    moradorId: number | null;
    moradorNome: string | null;
    token: string; // <--- PRECISA DESTE CAMPO
}
// ─── Enums ───────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'operador' | 'apresentador' | 'viewer'
export type FaseStatus = 'pendente' | 'aberta' | 'encerrada'
export type FaseNumero = 1 | 2 | 3 | 4

// ─── Database row types ───────────────────────────────────────────────────────
export interface Equipe {
  id: string
  nome: string
  escola: string
  logo_url: string | null
  cor_primaria: string
  ativa: boolean
  created_at: string
}

export interface Membro {
  id: string
  equipe_id: string
  nome: string
  antiguidade: number
  escola: string | null
}

export interface Fase {
  id: string
  numero: FaseNumero
  nome: string
  status: FaseStatus
  created_at: string
}

export interface Pontuacao {
  id: string
  equipe_id: string
  fase_id: string
  pontos: number
  descricao: string | null
  operador_id: string | null
  anulado: boolean
  created_at: string
}

export interface Penalidade {
  id: string
  equipe_id: string
  fase_id: string
  motivo: string
  pontos_descontados: number
  created_at: string
}

export interface Questao {
  id: string
  fase_id: string
  enunciado: string | null
  total_respostas: number
  total_acertos: number
  created_at: string
}

// ─── View types ───────────────────────────────────────────────────────────────
export interface RankingRow {
  id: string
  nome: string
  escola: string
  logo_url: string | null
  cor_primaria: string
  total: number
  pontos_fase1: number
  pontos_fase2: number
  pontos_fase3: number
  pontos_fase4: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

// ─── Realtime events ─────────────────────────────────────────────────────────
export interface RevealEvent {
  action: 'start_reveal' | 'reset'
  speed: 'suspense' | 'rapido'
  timestamp: string
}

// ─── Supabase Database type map ───────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      equipes: { Row: Equipe; Insert: Omit<Equipe, 'id' | 'created_at'>; Update: Partial<Omit<Equipe, 'id'>> }
      membros: { Row: Membro; Insert: Omit<Membro, 'id'>; Update: Partial<Omit<Membro, 'id'>> }
      fases:   { Row: Fase;   Insert: Omit<Fase, 'id' | 'created_at'>; Update: Partial<Omit<Fase, 'id'>> }
      pontuacao:  { Row: Pontuacao; Insert: Omit<Pontuacao, 'id' | 'created_at'>; Update: Partial<Omit<Pontuacao, 'id'>> }
      penalidades: { Row: Penalidade; Insert: Omit<Penalidade, 'id' | 'created_at'>; Update: Partial<Omit<Penalidade, 'id'>> }
      questoes: { Row: Questao; Insert: Omit<Questao, 'id' | 'created_at'>; Update: Partial<Omit<Questao, 'id'>> }
    }
    Views: {
      ranking: { Row: RankingRow }
    }
  }
}

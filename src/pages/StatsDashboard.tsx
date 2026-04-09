import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import type { RankingRow, Penalidade, Questao, Fase } from '@/types'

export default function StatsDashboard() {
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [penalidades, setPenalidades] = useState<(Penalidade & { equipe_nome?: string; fase_nome?: string })[]>([])
  const [questoes, setQuestoes] = useState<(Questao & { fase_nome?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: r }, { data: pen }, { data: q }, { data: f }] = await Promise.all([
        supabase.from('ranking').select('*'),
        supabase.from('penalidades').select('*'),
        supabase.from('questoes').select('*'),
        supabase.from('fases').select('*'),
      ])

      const fasesMap = Object.fromEntries((f ?? []).map((fase: Fase) => [fase.id, fase.nome]))

      setRanking((r as RankingRow[]) ?? [])
      setPenalidades((pen ?? []).map((p: Penalidade) => ({ ...p, fase_nome: fasesMap[p.fase_id] ?? '—' })))
      setQuestoes((q ?? []).map((questao: Questao) => ({ ...questao, fase_nome: fasesMap[questao.fase_id] ?? '—' })))
      setLoading(false)
    }
    load()
  }, [])

  // Chart data
  const chartData = ranking.map((e) => ({
    name: e.nome.split(' ')[0],
    'Fase I': e.pontos_fase1,
    'Fase II': e.pontos_fase2,
    'Fase III': e.pontos_fase3,
    'Fase IV': e.pontos_fase4,
    Total: e.total,
  }))

  const lineData = [1, 2, 3, 4].map((fase) => {
    const obj: Record<string, number | string> = { fase: `Fase ${fase}` }
    ranking.forEach((e) => {
      const key = `pontos_fase${fase}` as keyof RankingRow
      obj[e.nome.split(' ')[0]] = e[key] as number
    })
    return obj
  })

  const COLORS = ['#D4AF37', '#A8861E', '#7A6015', '#C0C0C0', '#4A7A35', '#CD7F32']

  if (loading) return (
    <div style={{ ...centerStyle }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ohma-gold)', letterSpacing: '0.1em' }}>
        CARREGANDO ESTATÍSTICAS...
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ohma-bg)', padding: '32px 40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', color: 'var(--color-ohma-gold)', letterSpacing: '0.1em', marginBottom: '4px' }}>
            DASHBOARD DE ESTATÍSTICAS
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-ohma-text-muted)', letterSpacing: '0.1em' }}>
            OHMA — Análise de desempenho por fase e equipe
          </p>
        </motion.div>

        {/* Pontuação por fase */}
        <Section title="PONTUAÇÃO POR FASE">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9A9690', fontFamily: 'Barlow Condensed', fontSize: 13 }} />
              <YAxis tick={{ fill: '#9A9690', fontFamily: 'Barlow Condensed', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111418', border: '1px solid #2A2C30', fontFamily: 'Barlow Condensed' }} />
              <Legend wrapperStyle={{ fontFamily: 'Barlow Condensed', color: '#9A9690' }} />
              <Bar dataKey="Fase I" fill="#D4AF37" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fase II" fill="#A8861E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fase III" fill="#7A6015" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fase IV" fill="#4A3A0A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Evolução do ranking */}
        <Section title="EVOLUÇÃO DO RANKING POR FASE">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="fase" tick={{ fill: '#9A9690', fontFamily: 'Barlow Condensed', fontSize: 13 }} />
              <YAxis tick={{ fill: '#9A9690', fontFamily: 'Barlow Condensed', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111418', border: '1px solid #2A2C30', fontFamily: 'Barlow Condensed' }} />
              <Legend wrapperStyle={{ fontFamily: 'Barlow Condensed', color: '#9A9690' }} />
              {ranking.map((e, i) => (
                <Line
                  key={e.id}
                  type="monotone"
                  dataKey={e.nome.split(' ')[0]}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Section>

        {/* Questões */}
        {questoes.length > 0 && (
          <Section title="DESEMPENHO POR QUESTÃO">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {questoes.map((q) => {
                const pct = q.total_respostas > 0 ? (q.total_acertos / q.total_respostas) * 100 : 0
                return (
                  <div key={q.id} style={{
                    background: 'var(--color-ohma-surface-2)',
                    border: '1px solid var(--color-ohma-border)',
                    borderRadius: '8px',
                    padding: '16px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-ohma-text-muted)', marginBottom: '8px' }}>
                      {q.fase_nome}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ohma-text)', marginBottom: '12px', lineHeight: 1.4 }}>
                      {q.enunciado ?? '—'}
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct > 50 ? '#4ADE80' : '#EF4444', borderRadius: '3px', transition: 'width 0.8s' }} />
                    </div>
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
                      <span style={{ color: '#4ADE80' }}>✓ {q.total_acertos}</span>
                      <span style={{ color: '#EF4444' }}>✗ {q.total_respostas - q.total_acertos}</span>
                      <span style={{ color: 'var(--color-ohma-gold)' }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* Penalidades */}
        {penalidades.length > 0 && (
          <Section title="PENALIDADES APLICADAS">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-ohma-border)' }}>
                  {['Equipe', 'Fase', 'Motivo', 'Pontos Descontados', 'Data'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-ohma-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penalidades.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={tdStyle}>{p.equipe_nome ?? '—'}</td>
                    <td style={tdStyle}>{p.fase_nome}</td>
                    <td style={tdStyle}>{p.motivo}</td>
                    <td style={{ ...tdStyle, color: '#EF4444' }}>-{p.pontos_descontados}</td>
                    <td style={tdStyle}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-ohma-surface)',
        border: '1px solid var(--color-ohma-border)',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        color: 'var(--color-ohma-gold)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--color-ohma-border)',
      }}>
        {title}
      </h2>
      {children}
    </motion.div>
  )
}

const centerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-ohma-bg)',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-ohma-text)',
}

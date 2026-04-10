import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Equipe, Fase, Pontuacao, Penalidade, Membro } from '@/types'
import AdminHeader from '@/components/AdminHeader'

type Tab = 'equipes' | 'pontuacao' | 'fases' | 'penalidades' | 'usuarios'

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('equipes')
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [fases, setFases] = useState<Fase[]>([])
  const [pontuacoes, setPontuacoes] = useState<(Pontuacao & { equipe_nome?: string; fase_nome?: string })[]>([])
  const [penalidades, setPenalidades] = useState<(Penalidade & { equipe_nome?: string; fase_nome?: string })[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Form states
  const [newEquipe, setNewEquipe] = useState({ nome: '', escola: '', cor_primaria: '#D4AF37' })
  const [newPontuacao, setNewPontuacao] = useState({ equipe_id: '', fase_id: '', pontos: '', descricao: '' })
  const [newFase, setNewFase] = useState({ numero: '', nome: '' })
  const [newPenalidade, setNewPenalidade] = useState({ equipe_id: '', fase_id: '', motivo: '', pontos_descontados: '' })
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'operador' })

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadAll() {
    setLoading(true)
    const [{ data: e }, { data: f }, { data: p }, { data: pen }, { data: m }] = await Promise.all([
      supabase.from('equipes').select('*').order('nome'),
      supabase.from('fases').select('*').order('numero'),
      supabase.from('pontuacao').select('*').order('created_at', { ascending: false }),
      supabase.from('penalidades').select('*').order('created_at', { ascending: false }),
      supabase.from('membros').select('*'),
    ])
    const eMap = Object.fromEntries((e ?? []).map((eq: Equipe) => [eq.id, eq.nome]))
    const fMap = Object.fromEntries((f ?? []).map((fa: Fase) => [fa.id, fa.nome]))
    setEquipes((e as Equipe[]) ?? [])
    setFases((f as Fase[]) ?? [])
    setPontuacoes(((p ?? []) as Pontuacao[]).map((pt) => ({ ...pt, equipe_nome: eMap[pt.equipe_id], fase_nome: fMap[pt.fase_id] })))
    setPenalidades(((pen ?? []) as Penalidade[]).map((pe) => ({ ...pe, equipe_nome: eMap[pe.equipe_id], fase_nome: fMap[pe.fase_id] })))
    setMembros((m as Membro[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  // ─── Actions ───
  async function addEquipe(e: React.FormEvent) {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('equipes') as any).insert({ ...newEquipe, ativa: true })
    if (error) showToast((error as Error).message, 'err')
    else { showToast('Equipe cadastrada!'); setNewEquipe({ nome: '', escola: '', cor_primaria: '#D4AF37' }); loadAll() }
  }

  async function toggleEquipe(id: string, ativa: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('equipes') as any).update({ ativa: !ativa }).eq('id', id)
    loadAll()
  }

  async function addPontuacao(e: React.FormEvent) {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('pontuacao') as any).insert({
      equipe_id: newPontuacao.equipe_id,
      fase_id: newPontuacao.fase_id,
      pontos: parseFloat(newPontuacao.pontos),
      descricao: newPontuacao.descricao || null,
      anulado: false,
    })
    if (error) showToast((error as Error).message, 'err')
    else { showToast('Pontuação lançada!'); setNewPontuacao({ equipe_id: '', fase_id: '', pontos: '', descricao: '' }); loadAll() }
  }

  async function anularPontuacao(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('pontuacao') as any).update({ anulado: true }).eq('id', id)
    showToast('Lançamento anulado.')
    loadAll()
  }

  async function addFase(e: React.FormEvent) {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('fases') as any).insert({
      numero: parseInt(newFase.numero),
      nome: newFase.nome,
      status: 'pendente',
    })
    if (error) showToast((error as Error).message, 'err')
    else { showToast('Fase criada!'); setNewFase({ numero: '', nome: '' }); loadAll() }
  }

  async function setFaseStatus(id: string, status: 'pendente' | 'aberta' | 'encerrada') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('fases') as any).update({ status }).eq('id', id)
    loadAll()
  }

  async function addPenalidade(e: React.FormEvent) {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('penalidades') as any).insert({
      equipe_id: newPenalidade.equipe_id,
      fase_id: newPenalidade.fase_id,
      motivo: newPenalidade.motivo,
      pontos_descontados: parseFloat(newPenalidade.pontos_descontados),
    })
    if (error) showToast((error as Error).message, 'err')
    else { showToast('Penalidade aplicada!'); setNewPenalidade({ equipe_id: '', fase_id: '', motivo: '', pontos_descontados: '' }); loadAll() }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'equipes', label: 'Equipes' },
    { key: 'pontuacao', label: 'Pontuação' },
    { key: 'fases', label: 'Fases' },
    { key: 'penalidades', label: 'Penalidades' },
    { key: 'usuarios', label: 'Usuários' },
  ]

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      showToast('Sessão expirada', 'err')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newUser)
      })

      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Erro ao criar usuário', 'err')
      } else {
        showToast('Usuário criado com sucesso!')
        setNewUser({ email: '', password: '', role: 'operador' })
      }
    } catch (err: any) {
      showToast(err.message, 'err')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ohma-bg)' }}>
      {/* Topbar navigations */}
      <AdminHeader />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid var(--color-ohma-border)', paddingBottom: '0' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 24px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                letterSpacing: '0.06em',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid var(--color-ohma-gold)' : '2px solid transparent',
                color: tab === t.key ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text-muted)',
                cursor: 'pointer',
                transition: 'color 0.2s',
                marginBottom: '-1px',
              }}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-display)', color: 'var(--color-ohma-gold)', fontSize: '20px' }}>
            CARREGANDO...
          </div>
        ) : (
          <>
            {/* ── EQUIPES ── */}
            {tab === 'equipes' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Form */}
                <AdminCard title="Nova Equipe">
                  <form onSubmit={addEquipe} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AdminInput label="Nome da Equipe" value={newEquipe.nome} onChange={(v) => setNewEquipe({ ...newEquipe, nome: v })} required />
                    <AdminInput label="Escola / Turma" value={newEquipe.escola} onChange={(v) => setNewEquipe({ ...newEquipe, escola: v })} required />
                    <div>
                      <label style={adminLabelStyle}>Cor Primária</label>
                      <input type="color" value={newEquipe.cor_primaria} onChange={(e) => setNewEquipe({ ...newEquipe, cor_primaria: e.target.value })} style={{ width: '100%', height: '40px', background: 'none', border: '1px solid var(--color-ohma-border)', borderRadius: '6px', cursor: 'pointer' }} />
                    </div>
                    <button type="submit" style={goldBtnStyle}>Cadastrar Equipe</button>
                  </form>
                </AdminCard>

                {/* Lista */}
                <AdminCard title={`Equipes (${equipes.length})`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                    {equipes.map((eq) => (
                      <div key={eq.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--color-ohma-surface-2)',
                        borderRadius: '6px',
                        border: `1px solid ${eq.cor_primaria}33`,
                        opacity: eq.ativa ? 1 : 0.5,
                      }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: eq.cor_primaria }}>{eq.nome}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-ohma-text-muted)' }}>
                            {eq.escola} · {membros.filter((m) => m.equipe_id === eq.id).length} membros
                          </div>
                        </div>
                        <button
                          onClick={() => toggleEquipe(eq.id, eq.ativa)}
                          style={{ ...ghostBtnStyle, fontSize: '12px' }}
                        >
                          {eq.ativa ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              </div>
            )}

            {/* ── PONTUAÇÃO ── */}
            {tab === 'pontuacao' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
                <AdminCard title="Lançar Pontuação">
                  <form onSubmit={addPontuacao} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AdminSelect label="Equipe" value={newPontuacao.equipe_id} onChange={(v) => setNewPontuacao({ ...newPontuacao, equipe_id: v })} options={equipes.map((e) => ({ value: e.id, label: e.nome }))} required />
                    <AdminSelect label="Fase" value={newPontuacao.fase_id} onChange={(v) => setNewPontuacao({ ...newPontuacao, fase_id: v })} options={fases.map((f) => ({ value: f.id, label: `Fase ${f.numero} — ${f.nome}` }))} required />
                    <AdminInput label="Pontos" type="number" step="0.1" value={newPontuacao.pontos} onChange={(v) => setNewPontuacao({ ...newPontuacao, pontos: v })} required />
                    <AdminInput label="Descrição (opcional)" value={newPontuacao.descricao} onChange={(v) => setNewPontuacao({ ...newPontuacao, descricao: v })} />
                    <button type="submit" style={goldBtnStyle}>Lançar</button>
                  </form>
                </AdminCard>

                <AdminCard title="Histórico de Lançamentos">
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Equipe', 'Fase', 'Pts', 'Status', ''].map((h) => (
                            <th key={h} style={{ ...thStyle }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pontuacoes.slice(0, 50).map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: p.anulado ? 0.4 : 1 }}>
                            <td style={tdStyleAdmin}>{p.equipe_nome}</td>
                            <td style={tdStyleAdmin}>{p.fase_nome}</td>
                            <td style={{ ...tdStyleAdmin, color: 'var(--color-ohma-gold)' }}>{p.pontos}</td>
                            <td style={tdStyleAdmin}>{p.anulado ? <span style={{ color: '#EF4444' }}>Anulado</span> : <span style={{ color: '#4ADE80' }}>Válido</span>}</td>
                            <td style={tdStyleAdmin}>
                              {!p.anulado && (
                                <button onClick={() => anularPontuacao(p.id)} style={{ ...ghostBtnStyle, fontSize: '11px', padding: '4px 8px', color: '#EF4444', borderColor: '#EF4444' }}>
                                  Anular
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AdminCard>
              </div>
            )}

            {/* ── FASES ── */}
            {tab === 'fases' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                <AdminCard title="Nova Fase">
                  <form onSubmit={addFase} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AdminSelect label="Número" value={newFase.numero} onChange={(v) => setNewFase({ ...newFase, numero: v })} options={[1,2,3,4].map((n) => ({ value: String(n), label: `Fase ${n}` }))} required />
                    <AdminInput label="Nome da Fase" value={newFase.nome} onChange={(v) => setNewFase({ ...newFase, nome: v })} required />
                    <button type="submit" style={goldBtnStyle}>Criar Fase</button>
                  </form>
                </AdminCard>

                <AdminCard title="Gestão das Fases">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {fases.map((f) => (
                      <div key={f.id} style={{
                        background: 'var(--color-ohma-surface-2)',
                        border: '1px solid var(--color-ohma-border)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ohma-gold)' }}>Fase {f.numero} — {f.nome}</div>
                          <div style={{
                            fontFamily: 'var(--font-body)', fontSize: '12px',
                            color: f.status === 'aberta' ? '#4ADE80' : f.status === 'encerrada' ? '#EF4444' : 'var(--color-ohma-text-muted)',
                          }}>
                            {f.status.toUpperCase()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(['pendente', 'aberta', 'encerrada'] as const).map((s) => (
                            <button key={s} onClick={() => setFaseStatus(f.id, s)} style={{
                              ...ghostBtnStyle,
                              fontSize: '11px',
                              padding: '4px 10px',
                              background: f.status === s ? 'rgba(212,175,55,0.15)' : 'transparent',
                              color: f.status === s ? 'var(--color-ohma-gold)' : 'var(--color-ohma-text-muted)',
                            }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              </div>
            )}

            {/* ── PENALIDADES ── */}
            {tab === 'penalidades' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
                <AdminCard title="Aplicar Penalidade">
                  <form onSubmit={addPenalidade} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AdminSelect label="Equipe" value={newPenalidade.equipe_id} onChange={(v) => setNewPenalidade({ ...newPenalidade, equipe_id: v })} options={equipes.map((e) => ({ value: e.id, label: e.nome }))} required />
                    <AdminSelect label="Fase" value={newPenalidade.fase_id} onChange={(v) => setNewPenalidade({ ...newPenalidade, fase_id: v })} options={fases.map((f) => ({ value: f.id, label: `Fase ${f.numero} — ${f.nome}` }))} required />
                    <AdminInput label="Motivo" value={newPenalidade.motivo} onChange={(v) => setNewPenalidade({ ...newPenalidade, motivo: v })} required />
                    <AdminInput label="Pontos Descontados" type="number" step="0.1" value={newPenalidade.pontos_descontados} onChange={(v) => setNewPenalidade({ ...newPenalidade, pontos_descontados: v })} required />
                    <button type="submit" style={{ ...goldBtnStyle, background: 'linear-gradient(135deg, #8B1A1A, #5A0A0A)', color: '#FFD0D0' }}>Aplicar Penalidade</button>
                  </form>
                </AdminCard>

                <AdminCard title="Penalidades Aplicadas">
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Equipe', 'Fase', 'Motivo', 'Pts'].map((h) => (
                            <th key={h} style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {penalidades.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={tdStyleAdmin}>{p.equipe_nome}</td>
                            <td style={tdStyleAdmin}>{p.fase_nome}</td>
                            <td style={tdStyleAdmin}>{p.motivo}</td>
                            <td style={{ ...tdStyleAdmin, color: '#EF4444' }}>-{p.pontos_descontados}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AdminCard>
              </div>
            )}

            {/* ── USUÁRIOS ── */}
            {tab === 'usuarios' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
                <AdminCard title="Novo Usuário do Sistema">
                  <form onSubmit={addUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AdminInput label="E-mail" type="email" value={newUser.email} onChange={(v) => setNewUser({ ...newUser, email: v })} required />
                    <AdminInput label="Senha" type="password" value={newUser.password} onChange={(v) => setNewUser({ ...newUser, password: v })} required />
                    <AdminSelect label="Permissão" value={newUser.role} onChange={(v) => setNewUser({ ...newUser, role: v })} required options={[
                      { value: 'operador', label: 'Operador (Lança pontos)' },
                      { value: 'apresentador', label: 'Apresentador (Apenas Tela de Revelação)' },
                      { value: 'admin', label: 'Administrador (Acesso Total)' },
                    ]} />
                    <button type="submit" style={goldBtnStyle}>Cadastrar Usuário</button>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ohma-text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                      Nota: Este processo envia um e-mail de confirmação usando os limites de SMTP do Supabase, o usuário só ativa após checar o e-mail (se *Confirm Email* estiver ativado lá no Supabase). Requer as credenciais secretas do back-end setadas na nuvem (Vercel).
                    </div>
                  </form>
                </AdminCard>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: toast.type === 'ok' ? 'rgba(45,74,34,0.95)' : 'rgba(139,26,26,0.95)',
              border: `1px solid ${toast.type === 'ok' ? '#4A7A35' : '#8B1A1A'}`,
              borderRadius: '8px',
              padding: '14px 20px',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--color-ohma-text)',
              zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-ohma-surface)',
        border: '1px solid var(--color-ohma-border)',
        borderRadius: '10px',
        padding: '24px',
      }}
    >
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ohma-gold)', letterSpacing: '0.08em', marginBottom: '18px', paddingBottom: '10px', borderBottom: '1px solid var(--color-ohma-border)' }}>
        {title.toUpperCase()}
      </h2>
      {children}
    </motion.div>
  )
}

function AdminInput({
  label, value, onChange, type = 'text', required, step, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; step?: string; placeholder?: string
}) {
  return (
    <div>
      <label style={adminLabelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step={step}
        placeholder={placeholder}
        style={adminInputStyle}
      />
    </div>
  )
}

function AdminSelect({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; required?: boolean
}) {
  return (
    <div>
      <label style={adminLabelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} style={adminInputStyle}>
        <option value="">— Selecione —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const adminLabelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px',
  color: 'var(--color-ohma-text-muted)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: '5px',
}
const adminInputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'var(--color-ohma-surface-2)',
  border: '1px solid var(--color-ohma-border)',
  borderRadius: '6px',
  fontFamily: 'var(--font-body)', fontSize: '15px',
  color: 'var(--color-ohma-text)',
  outline: 'none',
}
const goldBtnStyle: React.CSSProperties = {
  padding: '12px',
  background: 'linear-gradient(135deg, #D4AF37, #A8861E)',
  border: 'none', borderRadius: '8px',
  fontFamily: 'var(--font-display)', fontSize: '18px',
  letterSpacing: '0.06em', color: '#0A0C0F', cursor: 'pointer',
}
const ghostBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: 'transparent',
  border: '1px solid var(--color-ohma-border)',
  borderRadius: '6px',
  fontFamily: 'var(--font-body)', fontSize: '13px',
  color: 'var(--color-ohma-text-muted)', cursor: 'pointer',
}
const thStyle: React.CSSProperties = {
  padding: '8px 10px', textAlign: 'left',
  fontFamily: 'var(--font-body)', fontSize: '11px',
  color: 'var(--color-ohma-text-muted)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  borderBottom: '1px solid var(--color-ohma-border)',
}
const tdStyleAdmin: React.CSSProperties = {
  padding: '10px 10px',
  fontFamily: 'var(--font-body)', fontSize: '14px',
  color: 'var(--color-ohma-text)',
}

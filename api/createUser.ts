import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password, role } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado: token ausente' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Erro de ambiente: Falta SUPABASE_SERVICE_ROLE_KEY ou URL.' })
  }

  // Verifica se o chamador é realmente admin lendo seu token na API pública
  const supabaseAuth = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || 'dummy_key', {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }

  const isCallerAdmin = user.app_metadata?.role === 'admin'
  if (!isCallerAdmin) {
    return res.status(403).json({ error: 'Apenas administradores podem criar usuários.' })
  }

  // Cria um Admin Client com a service_role key para inserir o novo usuário e forçar as claims
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Já confirma o email imediatamente
    app_metadata: { role: role || 'operador' }
  })

  if (createError) {
    return res.status(400).json({ error: createError.message })
  }

  return res.status(200).json({ message: 'Usuário cadastrado com sucesso!', user: newUser.user })
}

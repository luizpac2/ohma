-- ============================================================
--  OHMA — Script completo de banco de dados (Supabase/PostgreSQL)
--  Execute este script no SQL Editor do Supabase
-- ============================================================

-- ── 1. TABELAS ───────────────────────────────────────────────

-- Equipes
create table if not exists equipes (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  escola text not null,
  logo_url text,
  cor_primaria text default '#D4AF37',
  ativa boolean default true,
  created_at timestamptz default now()
);

-- Fases
create table if not exists fases (
  id uuid primary key default gen_random_uuid(),
  numero smallint not null unique check (numero between 1 and 4),
  nome text not null,
  status text default 'pendente' check (status in ('pendente','aberta','encerrada')),
  created_at timestamptz default now()
);

-- Membros das equipes
create table if not exists membros (
  id uuid primary key default gen_random_uuid(),
  equipe_id uuid references equipes(id) on delete cascade,
  nome text not null,
  antiguidade smallint not null,
  escola text
);

-- Pontuação por lançamento
create table if not exists pontuacao (
  id uuid primary key default gen_random_uuid(),
  equipe_id uuid references equipes(id) on delete cascade,
  fase_id uuid references fases(id) on delete cascade,
  pontos numeric not null,
  descricao text,
  operador_id uuid references auth.users(id),
  anulado boolean default false,
  created_at timestamptz default now()
);

-- Penalidades (3ª e 4ª fase)
create table if not exists penalidades (
  id uuid primary key default gen_random_uuid(),
  equipe_id uuid references equipes(id) on delete cascade,
  fase_id uuid references fases(id) on delete cascade,
  motivo text not null,
  pontos_descontados numeric not null,
  created_at timestamptz default now()
);

-- Questões (para o dashboard de stats)
create table if not exists questoes (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid references fases(id) on delete cascade,
  enunciado text,
  total_respostas integer default 0,
  total_acertos integer default 0,
  created_at timestamptz default now()
);

-- ── 2. VIEW DE RANKING CUMULATIVO ───────────────────────────

create or replace view ranking as
select
  e.id,
  e.nome,
  e.escola,
  e.logo_url,
  e.cor_primaria,
  coalesce(sum(p.pontos) filter (where not p.anulado), 0) as total,
  coalesce(sum(p.pontos) filter (where f.numero = 1 and not p.anulado), 0) as pontos_fase1,
  coalesce(sum(p.pontos) filter (where f.numero = 2 and not p.anulado), 0) as pontos_fase2,
  coalesce(sum(p.pontos) filter (where f.numero = 3 and not p.anulado), 0) as pontos_fase3,
  coalesce(sum(p.pontos) filter (where f.numero = 4 and not p.anulado), 0) as pontos_fase4
from equipes e
left join pontuacao p on p.equipe_id = e.id
left join fases f on f.id = p.fase_id
where e.ativa = true
group by e.id, e.nome, e.escola, e.logo_url, e.cor_primaria
order by total desc, pontos_fase1 desc;

-- ── 3. ROW LEVEL SECURITY ───────────────────────────────────

alter table equipes   enable row level security;
alter table fases     enable row level security;
alter table membros   enable row level security;
alter table pontuacao enable row level security;
alter table penalidades enable row level security;
alter table questoes  enable row level security;

-- Leitura pública (viewer, sem login)
create policy "leitura publica equipes"
  on equipes for select using (true);

create policy "leitura publica fases"
  on fases for select using (true);

create policy "leitura publica membros"
  on membros for select using (true);

create policy "leitura publica pontuacao"
  on pontuacao for select using (true);

create policy "leitura publica penalidades"
  on penalidades for select using (true);

create policy "leitura publica questoes"
  on questoes for select using (true);

-- Admin: acesso total a equipes
create policy "admin gerencia equipes"
  on equipes for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- Admin: acesso total a fases
create policy "admin gerencia fases"
  on fases for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- Admin: acesso total a membros
create policy "admin gerencia membros"
  on membros for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- Operador e admin: inserem pontuação
create policy "operador insere pontuacao"
  on pontuacao for insert
  with check ((auth.jwt() ->> 'role') in ('admin', 'operador'));

-- Admin: anula pontuação (update)
create policy "admin anula pontuacao"
  on pontuacao for update
  using ((auth.jwt() ->> 'role') = 'admin');

-- Admin: exclui pontuação
create policy "admin deleta pontuacao"
  on pontuacao for delete
  using ((auth.jwt() ->> 'role') = 'admin');

-- Admin e operador: inserem penalidades
create policy "operador insere penalidades"
  on penalidades for insert
  with check ((auth.jwt() ->> 'role') in ('admin', 'operador'));

-- Admin: gerencia penalidades
create policy "admin gerencia penalidades"
  on penalidades for all
  using ((auth.jwt() ->> 'role') = 'admin');

-- Admin: gerencia questões
create policy "admin gerencia questoes"
  on questoes for all
  using ((auth.jwt() ->> 'role') = 'admin');

-- ── 4. DADOS INICIAIS DAS FASES ──────────────────────────────

insert into fases (numero, nome, status) values
  (1, 'Prova Individual', 'pendente'),
  (2, 'Quiz Oral/Visual', 'pendente'),
  (3, 'Apresentação de Tema', 'pendente'),
  (4, 'Questões ao Vivo', 'pendente')
on conflict (numero) do nothing;

-- ── 5. REALTIME ─────────────────────────────────────────────
-- Habilite Realtime nas tabelas via Dashboard do Supabase:
-- Database > Replication > Supabase Realtime
-- Adicione: pontuacao, penalidades, equipes, fases

-- Ou via SQL:
alter publication supabase_realtime add table pontuacao;
alter publication supabase_realtime add table penalidades;
alter publication supabase_realtime add table equipes;
alter publication supabase_realtime add table fases;

-- ── 6. FUNÇÃO DE CUSTOM CLAIM (role no JWT) ──────────────────
-- Para definir o role de um usuário, use o Supabase Dashboard:
-- Authentication > Users > selecione o usuário > Edit > app_metadata
-- Adicione: {"role": "admin"} ou {"role": "operador"} etc.
--
-- Ou via SQL (substitua USER_ID pelo UUID do usuário):
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- where id = 'USER_ID';

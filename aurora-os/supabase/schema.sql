-- ============================================================================
-- AURORA OS — Schema do banco de dados (Supabase / PostgreSQL)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- Cada tabela tem Row Level Security (RLS) ativado: cada usuário só
-- consegue ler/editar os próprios dados.
-- ============================================================================

-- ---------- util: coluna updated_at automática ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- PERFIL / PLANO DE VIDA
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

create table if not exists public.life_plan (
  user_id uuid primary key references auth.users(id) on delete cascade,
  quem_eu_sou text default '',
  visao_futuro text default '',
  carta_para_mim text default '',
  updated_at timestamptz default now()
);

-- ============================================================================
-- OBJETIVOS
-- ============================================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('foco','2026','2027','antes_30','sonhos')),
  title text not null,
  done boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

-- ============================================================================
-- PROJETOS (plano de ação flexível: fases -> itens)
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  icon text default '🚀',
  description text default '',
  active boolean default true,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  goal text default '',
  position int default 0
);

create table if not exists public.project_items (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.project_phases(id) on delete cascade,
  title text not null,
  done boolean default false,
  position int default 0
);

-- ============================================================================
-- HÁBITOS / TAREFAS (rastreador de rotina diária + progresso mensal)
-- ============================================================================
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text default '✅',
  active boolean default true,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  done boolean default false,
  unique (habit_id, log_date)
);

create table if not exists public.habit_monthly_targets (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, -- formato 'YYYY-MM'
  target int default 0,
  unique (habit_id, month)
);

-- ============================================================================
-- FOCO DO DIA ("Hoje eu vou")
-- ============================================================================
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_date date not null default current_date,
  title text not null,
  done boolean default false,
  position int default 0
);

-- ============================================================================
-- PLANEJAMENTO (mensal e semanal)
-- ============================================================================
create table if not exists public.monthly_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  priorities text[] default '{}',
  compromissos text default '',
  eventos text default '',
  unique (user_id, month)
);

create table if not exists public.weekly_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  projeto_principal text default '',
  objetivo_semana text default '',
  nao_pode_esperar text default '',
  routine jsonb default '{}', -- { "segunda": "...", "terca": "...", ... }
  o_que_fiz_bem text default '',
  o_que_posso_melhorar text default '',
  foco_proxima_semana text default '',
  checklist jsonb default '[]', -- lista de {label, done}
  unique (user_id, week_start)
);

-- ============================================================================
-- SAÚDE
-- ============================================================================
create table if not exists public.health_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weight_current numeric,
  weight_goal numeric,
  height numeric,
  goals text[] default '{}',
  gym_split jsonb default '{}',
  gym_records jsonb default '[]', -- [{exercicio, peso_atual, melhor_marca}]
  running jsonb default '{}', -- {ultima_distancia, maior_distancia, ultimo_tempo}
  updated_at timestamptz default now()
);

create table if not exists public.health_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  weight numeric,
  waist numeric,
  hip numeric,
  arm numeric,
  thigh numeric,
  calf numeric,
  notes text default ''
);

create table if not exists public.health_wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================================
-- FINANÇAS (por mês)
-- ============================================================================
create table if not exists public.finance_month (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  renda numeric default 0,
  saldo_disponivel numeric default 0,
  reserva_meta numeric default 0,
  reserva_atual numeric default 0,
  gastos_fixos jsonb default '[]',     -- [{nome, valor, vencimento, pago}]
  gastos_variaveis jsonb default '[]', -- [{categoria, valor}]
  dividas jsonb default '[]',          -- [{nome, valor_total, parcela, status}]
  patrimonio jsonb default '[]',       -- [{bem, valor}]
  objetivos text[] default '{}',
  conquistas text[] default '{}',
  unique (user_id, month)
);

-- ============================================================================
-- VIDA
-- ============================================================================
create table if not exists public.life_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  o_que_faz_bem text[] default '{}',
  experiencias_quero_viver jsonb default '[]', -- [{title, done}]
  hobbies text[] default '{}',
  pequenas_alegrias text[] default '{}',
  momentos_especiais text[] default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================================
-- CULTURA (livros / filmes & séries / música)
-- ============================================================================
create table if not exists public.culture_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text default '',
  opinion text default '',
  rating int check (rating between 0 and 5) default 0,
  status text default 'Quero ler',
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.culture_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text default 'Filme',
  opinion text default '',
  rating int check (rating between 0 and 5) default 0,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.culture_music (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  artist text default '',
  opinion text default '',
  rating int check (rating between 0 and 5) default 0,
  discovered_date date,
  created_at timestamptz default now()
);

-- ============================================================================
-- EXPERIÊNCIAS
-- ============================================================================
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text default '',
  opinion text default '',
  rating int check (rating between 0 and 5) default 0,
  local text default '',
  exp_date date,
  created_at timestamptz default now()
);

-- ============================================================================
-- CAIXA DE ENTRADA
-- ============================================================================
create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  done boolean default false,
  created_at timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY — ativa em todas as tabelas
-- ============================================================================
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','life_plan','goals','projects','project_phases','project_items',
      'habits','habit_logs','habit_monthly_targets','daily_tasks','monthly_plan','weekly_plan',
      'health_profile','health_measurements','health_wins','finance_month',
      'life_notes','gratitude_entries','culture_books','culture_movies',
      'culture_music','experiences','inbox_items'
    ])
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Tabelas com user_id direto: política padrão "dono do registro"
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'goals','projects','habits','habit_logs','habit_monthly_targets','daily_tasks',
      'monthly_plan','weekly_plan','health_measurements','health_wins',
      'finance_month','gratitude_entries','culture_books','culture_movies',
      'culture_music','experiences','inbox_items'
    ])
  loop
    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id);', t);
    execute format('create policy "delete_own" on public.%I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- Tabelas com PK = user_id (perfil único por usuário)
do $$
declare
  t text;
begin
  for t in select unnest(array['life_plan','health_profile','life_notes'])
  loop
    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- profiles: PK = id
create policy "select_own_profile" on public.profiles for select using (auth.uid() = id);
create policy "insert_own_profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update_own_profile" on public.profiles for update using (auth.uid() = id);

-- project_phases / project_items: dono via join com projects
create policy "select_own_phases" on public.project_phases for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "insert_own_phases" on public.project_phases for insert
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "update_own_phases" on public.project_phases for update
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "delete_own_phases" on public.project_phases for delete
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "select_own_items" on public.project_items for select
  using (exists (select 1 from public.project_phases ph join public.projects p on p.id = ph.project_id where ph.id = phase_id and p.user_id = auth.uid()));
create policy "insert_own_items" on public.project_items for insert
  with check (exists (select 1 from public.project_phases ph join public.projects p on p.id = ph.project_id where ph.id = phase_id and p.user_id = auth.uid()));
create policy "update_own_items" on public.project_items for update
  using (exists (select 1 from public.project_phases ph join public.projects p on p.id = ph.project_id where ph.id = phase_id and p.user_id = auth.uid()));
create policy "delete_own_items" on public.project_items for delete
  using (exists (select 1 from public.project_phases ph join public.projects p on p.id = ph.project_id where ph.id = phase_id and p.user_id = auth.uid()));

-- ============================================================================
-- Trigger: cria profile + life_plan + health_profile + life_notes automaticamente
-- quando um novo usuário se cadastra
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  insert into public.life_plan (user_id) values (new.id);
  insert into public.health_profile (user_id) values (new.id);
  insert into public.life_notes (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

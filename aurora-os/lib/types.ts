export type Goal = {
  id: string;
  user_id: string;
  category: "foco" | "2026" | "2027" | "antes_30" | "sonhos";
  title: string;
  done: boolean;
  position: number;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  description: string;
  active: boolean;
  position: number;
};

export type ProjectPhase = {
  id: string;
  project_id: string;
  title: string;
  goal: string;
  position: number;
};

export type ProjectItem = {
  id: string;
  phase_id: string;
  title: string;
  done: boolean;
  position: number;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  active: boolean;
  position: number;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  done: boolean;
};

export type HabitMonthlyTarget = {
  id: string;
  habit_id: string;
  user_id: string;
  month: string;
  target: number;
};

export type MonthlyPlan = {
  id: string;
  user_id: string;
  month: string;
  priorities: string[];
  compromissos: string;
  eventos: string;
};

export type WeeklyChecklistItem = { label: string; done: boolean };

export type WeeklyPlan = {
  id: string;
  user_id: string;
  week_start: string;
  projeto_principal: string;
  objetivo_semana: string;
  nao_pode_esperar: string;
  routine: Record<string, string>;
  o_que_fiz_bem: string;
  o_que_posso_melhorar: string;
  foco_proxima_semana: string;
  checklist: WeeklyChecklistItem[];
};

export type HealthProfile = {
  user_id: string;
  weight_current: number | null;
  weight_goal: number | null;
  height: number | null;
  goals: string[];
  gym_split: Record<string, string>;
  gym_records: { exercicio: string; peso_atual: string; melhor_marca: string }[];
  running: { ultima_distancia?: string; maior_distancia?: string; ultimo_tempo?: string };
};

export type HealthMeasurement = {
  id: string;
  user_id: string;
  measured_at: string;
  weight: number | null;
  waist: number | null;
  hip: number | null;
  arm: number | null;
  thigh: number | null;
  calf: number | null;
  notes: string;
};

export type FinanceMonth = {
  id: string;
  user_id: string;
  month: string;
  renda: number;
  saldo_disponivel: number;
  reserva_meta: number;
  reserva_atual: number;
  gastos_fixos: { nome: string; valor: number; vencimento: string; pago: boolean }[];
  gastos_variaveis: { categoria: string; valor: number }[];
  dividas: { nome: string; valor_total: number; parcela: number; status: string }[];
  patrimonio: { bem: string; valor: number }[];
  objetivos: string[];
  conquistas: string[];
};

export type LifeNotes = {
  user_id: string;
  o_que_faz_bem: string[];
  experiencias_quero_viver: { title: string; done: boolean }[];
  hobbies: string[];
  pequenas_alegrias: string[];
  momentos_especiais: string[];
};

export type CultureBook = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  opinion: string;
  rating: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
};

export type CultureMovie = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  opinion: string;
  rating: number;
  start_date: string | null;
  end_date: string | null;
};

export type CultureMusic = {
  id: string;
  user_id: string;
  name: string;
  artist: string;
  opinion: string;
  rating: number;
  discovered_date: string | null;
};

export type ExperienceEntry = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  opinion: string;
  rating: number;
  local: string;
  exp_date: string | null;
};

export type InboxItem = {
  id: string;
  user_id: string;
  content: string;
  done: boolean;
  created_at: string;
};

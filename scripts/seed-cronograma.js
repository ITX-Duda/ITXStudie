#!/usr/bin/env node
/**
 * seed-cronograma.js
 * Cadastra os blocos de estudo da semana 16-21/06/2026 no ITXStudie via API REST.
 *
 * Cada "Circle" representa um bloco de 2h com:
 *   - 1 fase de estudo de 50 min
 *   - 1 fase de pausa de 10 min
 *   - 1 fase de estudo de 50 min
 *   - 1 fase de pausa de 10 min (opcional, no final do bloco)
 * 
 * Total por bloco: 50+10+50+10 = 120 min = 2h ✓
 *
 * Uso: node scripts/seed-cronograma.js
 */

const API_BASE = 'http://localhost:3001';
const USER_ID = 'user-001'; // ID do mock user usado pelo frontend (useUserStore)

// ─── Definição dos círculos ────────────────────────────────────────────────────
const CIRCLES = [
  // ── TERÇA 16/06 ────────────────────────────────────────────────────────────
  {
    name: '📚 Terça 16/06 — Bloco 1: IEDO',
    description:
      '16/06/2026 | Bloco 1 (2h) — IEDO: Estudar a teoria da Semana 1 sobre Equações Separáveis e resolver a Lista 0 e a Lista 1.',
    phases: buildStudyBlock(
      'IEDO — Sem. 1: Equações Separáveis (parte 1)',
      'IEDO — Sem. 1: Equações Separáveis (parte 2) + Lista 0 & Lista 1',
    ),
  },
  {
    name: '⚡ Terça 16/06 — Bloco 2: Circuitos Elétricos I',
    description:
      '16/06/2026 | Bloco 2 (2h) — Circuitos Elétricos I: Estudar as Aulas 01 e 02 sobre Introdução aos Circuitos e Leis de Kirchhoff, e iniciar a Lista 1.',
    phases: buildStudyBlock(
      'Circ. I — Aula 01: Introdução aos Circuitos',
      'Circ. I — Aula 02: Leis de Kirchhoff + início Lista 1',
    ),
  },

  // ── QUARTA 17/06 ───────────────────────────────────────────────────────────
  {
    name: '🔢 Quarta 17/06 — Bloco 1: Matemática Discreta',
    description:
      '17/06/2026 | Bloco 1 (2h) — Matemática Discreta: Estudar o conteúdo da Semana 1 sobre Lógica de Primeira Ordem e resolver a Lista 0.',
    phases: buildStudyBlock(
      'Mat. Discreta — Sem. 1: Lógica de Primeira Ordem (teoria)',
      'Mat. Discreta — Sem. 1: Lógica de Primeira Ordem + Lista 0',
    ),
  },
  {
    name: '📚 Quarta 17/06 — Bloco 2: IEDO',
    description:
      '17/06/2026 | Bloco 2 (2h) — IEDO: Estudar a teoria da Semana 2 sobre EDOs Lineares de Primeira Ordem e Fator Integrante, e resolver a Lista 2 e a Lista 3.',
    phases: buildStudyBlock(
      'IEDO — Sem. 2: EDOs Lineares & Fator Integrante (teoria)',
      'IEDO — Sem. 2: Fator Integrante + Lista 2 & Lista 3',
    ),
  },

  // ── QUINTA 18/06 ───────────────────────────────────────────────────────────
  {
    name: '⚡ Quinta 18/06 — Bloco 1: Circuitos Elétricos I',
    description:
      '18/06/2026 | Bloco 1 (2h) — Circuitos Elétricos I: Estudar a Aula 03 sobre Associação de bipolos, divisores de corrente/tensão e fazer os exercícios correspondentes da Lista 1.',
    phases: buildStudyBlock(
      'Circ. I — Aula 03: Associação de bipolos & divisores (teoria)',
      'Circ. I — Aula 03: Divisores + exercícios Lista 1',
    ),
  },
  {
    name: '🔢 Quinta 18/06 — Bloco 2: Matemática Discreta',
    description:
      '18/06/2026 | Bloco 2 (2h) — Matemática Discreta: Estudar o conteúdo da Semana 2 sobre Demonstrações e resolver a Lista 1.',
    phases: buildStudyBlock(
      'Mat. Discreta — Sem. 2: Demonstrações (teoria)',
      'Mat. Discreta — Sem. 2: Demonstrações + Lista 1',
    ),
  },

  // ── SEXTA 19/06 ────────────────────────────────────────────────────────────
  {
    name: '📚 Sexta 19/06 — Bloco 1: IEDO',
    description:
      '19/06/2026 | Bloco 1 (2h) — IEDO: Estudar a teoria da Semana 3 sobre PVI, Equação Homogênea e Equação de Bernoulli, e finalizar a Lista 4.',
    phases: buildStudyBlock(
      'IEDO — Sem. 3: PVI, Equação Homogênea (teoria)',
      'IEDO — Sem. 3: Equação de Bernoulli + finalizar Lista 4',
    ),
  },
  {
    name: '⚡ Sexta 19/06 — Bloco 2: Circuitos Elétricos I',
    description:
      '19/06/2026 | Bloco 2 (2h) — Circuitos Elétricos I: Estudar a Aula 04 sobre Análise de malha e análise nodal, resolvendo os exercícios equivalentes da Lista 1.',
    phases: buildStudyBlock(
      'Circ. I — Aula 04: Análise de malha (teoria)',
      'Circ. I — Aula 04: Análise nodal + exercícios Lista 1',
    ),
  },

  // ── SÁBADO 20/06 ───────────────────────────────────────────────────────────
  {
    name: '🔢 Sábado 20/06 — Bloco 1: Matemática Discreta',
    description:
      '20/06/2026 | Bloco 1 (2h) — Matemática Discreta: Estudar o conteúdo da Semana 3 sobre Indução e Boa Ordem nos Naturais e resolver a Lista 2.',
    phases: buildStudyBlock(
      'Mat. Discreta — Sem. 3: Indução & Boa Ordem (teoria)',
      'Mat. Discreta — Sem. 3: Indução + Lista 2',
    ),
  },
  {
    name: '🔄 Sábado 20/06 — Bloco 2: Revisão / Flexível',
    description:
      '20/06/2026 | Bloco 2 (2h) — Bloco livre: terminar exercícios pendentes da Lista 1 de Circuitos Elétricos I ou adiantar matérias.',
    phases: buildStudyBlock(
      'Revisão — Pendências Lista 1 Circuitos / adiantar conteúdo (parte 1)',
      'Revisão — Pendências Lista 1 Circuitos / adiantar conteúdo (parte 2)',
    ),
  },

  // ── DOMINGO 21/06 ──────────────────────────────────────────────────────────
  {
    name: '⚡ Domingo 21/06 — Bloco 1: Circuitos Elétricos I',
    description:
      '21/06/2026 | Bloco 1 (2h) — Circuitos Elétricos I: Estudar a Aula 05 sobre Teoremas de Thevénin e Norton, e finalizar a Lista 1.',
    phases: buildStudyBlock(
      'Circ. I — Aula 05: Teorema de Thevénin (teoria)',
      'Circ. I — Aula 05: Teorema de Norton + finalizar Lista 1',
    ),
  },
  {
    name: '🔢 Domingo 21/06 — Bloco 2: Matemática Discreta',
    description:
      '21/06/2026 | Bloco 2 (2h) — Matemática Discreta: Estudar o conteúdo da Semana 4 sobre Conjuntos, Relações e Funções e finalizar a Lista 3.',
    phases: buildStudyBlock(
      'Mat. Discreta — Sem. 4: Conjuntos & Relações (teoria)',
      'Mat. Discreta — Sem. 4: Funções + finalizar Lista 3',
    ),
  },
];

// ─── Helper: monta as 4 fases de um bloco de 2h ──────────────────────────────
// Estrutura: Estudo 50min → Pausa 10min → Estudo 50min → Pausa 10min
// Lembrete de pausa a cada 50 minutos, conforme solicitado.
function buildStudyBlock(label1, label2) {
  return [
    { order: 1, type: 'study', durationMins: 50, label: label1 },
    { order: 2, type: 'break', durationMins: 10, label: '☕ Pausa — levante, respire, hidrate!' },
    { order: 3, type: 'study', durationMins: 50, label: label2 },
    { order: 4, type: 'break', durationMins: 10, label: '☕ Pausa final — descanse antes do próximo bloco' },
  ];
}

// ─── Função para criar um círculo via API ────────────────────────────────────
async function createCircle(circle) {
  const res = await fetch(`${API_BASE}/circles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: USER_ID, ...circle }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 ITXStudie — Seeding cronograma da semana 16-21/06/2026\n');
  console.log(`📡 API: ${API_BASE}`);
  console.log(`👤 User: ${USER_ID}\n`);
  console.log('─'.repeat(60));

  const results = [];
  let success = 0;
  let failed = 0;

  for (const circle of CIRCLES) {
    process.stdout.write(`  ➤  ${circle.name} ... `);
    try {
      const data = await createCircle(circle);
      console.log(`✅  (id: ${data.id})`);
      results.push({ name: circle.name, id: data.id, status: 'ok' });
      success++;
    } catch (err) {
      console.log(`❌  ERRO: ${err.message}`);
      results.push({ name: circle.name, status: 'error', error: err.message });
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅  Criados com sucesso: ${success}/${CIRCLES.length}`);
  if (failed > 0) {
    console.log(`❌  Falhas: ${failed}`);
  }

  console.log('\n📋 Resumo do cronograma cadastrado:');
  results.forEach((r, i) => {
    const status = r.status === 'ok' ? '✅' : '❌';
    console.log(`  ${status}  [${i + 1}] ${r.name}`);
    if (r.id) console.log(`       ID: ${r.id}`);
  });

  console.log('\n🎓 Cada bloco tem 4 fases: Estudo 50min → ☕ Pausa 10min → Estudo 50min → ☕ Pausa 10min');
  console.log('💡 Acesse http://localhost:3000/circles para iniciar seus estudos!\n');
}

main().catch((err) => {
  console.error('\n💥 Erro fatal:', err.message);
  process.exit(1);
});

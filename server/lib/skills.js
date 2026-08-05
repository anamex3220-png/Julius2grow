// Catálogo de skills/posiciones evaluables. Cada entrada define un reto de
// 15 minutos usando uno de tres motores genéricos (`type`):
//
//   - "code": arreglar una función con bugs, calificada contra pruebas ocultas.
//   - "diagnosis": encontrar la línea de una tabla que no coincide con su
//     fórmula, y dar el valor correcto.
//   - "scenario": responder (1 o varios turnos) a una persona simulada,
//     calificado con una rúbrica de palabras clave por dimensión.
//
// Agregar una posición nueva es agregar una entrada aquí — el cliente y el
// motor de calificación no conocen "developer" ni "paid_media" por nombre,
// solo el `type`. `build()` separa lo que ve el candidato (`public`) de la
// clave de calificación (`secret`), que nunca se envía al cliente.
//
// Todo el contenido de `public` (título, prompt, tablas, mensajes de chat) y
// las palabras clave de las rúbricas están en inglés a propósito: es lo que
// termina en el link que recibe el candidato, y ese link debe estar 100% en
// inglés. `label` (español) es solo para las pantallas del reclutador
// (catálogo, "Mis retos", resultados); `candidateLabel` (inglés) es lo que
// ve el candidato en `CandidateStart.jsx`.

const TIME_LIMIT_SECONDS = 15 * 60;

export const CATEGORY_LABELS = {
  marketing: 'Marketing',
  tech: 'Tecnología y Operaciones',
};

function buildDeveloperChallenge() {
  return {
    public: {
      title: 'Fix the shopping cart',
      prompt:
        'The function calculateCartTotal should sum price * quantity for each ' +
        'item and apply a 10% discount when the total exceeds $100. It has ' +
        'bugs: fix it so it passes all the tests.',
      language: 'javascript',
      functionName: 'calculateCartTotal',
      starterCode: `function calculateCartTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  if (total > 100) {
    total = total - 0.10;
  }
  return total;
}`,
    },
    secret: {
      functionName: 'calculateCartTotal',
      tests: [
        { args: [[{ price: 10, quantity: 2 }]], expected: 20 },
        { args: [[{ price: 50, quantity: 3 }]], expected: 135 },
        { args: [[]], expected: 0 },
        { args: [[{ price: 100, quantity: 1 }]], expected: 100 },
        {
          args: [
            [
              { price: 20, quantity: 3 },
              { price: 15, quantity: 4 },
            ],
          ],
          expected: 108,
        },
      ],
    },
  };
}

function buildCrmChallenge() {
  return {
    public: {
      title: 'Fix the VIP segmentation rule',
      prompt:
        'isVipCustomer should mark as VIP only customers who meet BOTH ' +
        'conditions: total spend of at least $1000 AND at least 5 purchases ' +
        'in the last 12 months. It has a logic bug: fix it.',
      language: 'javascript',
      functionName: 'isVipCustomer',
      starterCode: `function isVipCustomer(customer) {
  if (customer.totalSpend > 1000 || customer.purchasesLast12Months >= 5) {
    return true;
  }
  return false;
}`,
    },
    secret: {
      functionName: 'isVipCustomer',
      tests: [
        { args: [{ totalSpend: 1000, purchasesLast12Months: 5 }], expected: true },
        { args: [{ totalSpend: 1500, purchasesLast12Months: 2 }], expected: false },
        { args: [{ totalSpend: 200, purchasesLast12Months: 10 }], expected: false },
        { args: [{ totalSpend: 2000, purchasesLast12Months: 8 }], expected: true },
        { args: [{ totalSpend: 500, purchasesLast12Months: 1 }], expected: false },
      ],
    },
  };
}

function buildAutomationChallenge() {
  return {
    public: {
      title: 'Fix the abandoned cart trigger',
      prompt:
        'shouldSendAbandonedCartEmail should send the email only if the cart ' +
        'has items, at least 1 hour has passed since it was abandoned, and it ' +
        "hasn't already been sent. Right now it fires in cases it shouldn't: " +
        'fix it.',
      language: 'javascript',
      functionName: 'shouldSendAbandonedCartEmail',
      starterCode: `function shouldSendAbandonedCartEmail(cart) {
  if (cart.hoursSinceAbandoned >= 1) {
    return true;
  }
  return false;
}`,
    },
    secret: {
      functionName: 'shouldSendAbandonedCartEmail',
      tests: [
        { args: [{ items: [{ id: 1 }], hoursSinceAbandoned: 2, alreadySent: false }], expected: true },
        { args: [{ items: [], hoursSinceAbandoned: 5, alreadySent: false }], expected: false },
        { args: [{ items: [{ id: 1 }], hoursSinceAbandoned: 0.5, alreadySent: false }], expected: false },
        { args: [{ items: [{ id: 1 }], hoursSinceAbandoned: 3, alreadySent: true }], expected: false },
        {
          args: [{ items: [{ id: 1 }, { id: 2 }], hoursSinceAbandoned: 1, alreadySent: false }],
          expected: true,
        },
      ],
    },
  };
}

function buildAccountingChallenge() {
  const lineItems = [
    { id: 'cash', label: 'Cash', group: 'Assets', value: 50000 },
    { id: 'accounts_receivable', label: 'Accounts Receivable', group: 'Assets', value: 30000 },
    { id: 'inventory', label: 'Inventory', group: 'Assets', value: 40000 },
    // Real sum of assets = 120000, but the total shown is wrong.
    { id: 'total_assets', label: 'Total Assets', group: 'Assets', value: 130000, isTotal: true },
    { id: 'accounts_payable', label: 'Accounts Payable', group: 'Liabilities', value: 25000 },
    { id: 'bank_loan', label: 'Bank Loan', group: 'Liabilities', value: 35000 },
    { id: 'total_liabilities', label: 'Total Liabilities', group: 'Liabilities', value: 60000, isTotal: true },
    { id: 'share_capital', label: 'Share Capital', group: 'Equity', value: 60000 },
    { id: 'total_equity', label: 'Total Equity', group: 'Equity', value: 60000, isTotal: true },
  ];

  return {
    public: {
      title: 'Find the error in the balance sheet',
      prompt:
        "This balance sheet has an error: one figure doesn't match the sum " +
        'of its components. Identify the incorrect line and write the ' +
        'correct value.',
      lineItems,
    },
    secret: {
      correctLineId: 'total_assets',
      correctValue: 120000,
    },
  };
}

function buildPaidMediaChallenge() {
  const lineItems = [
    { id: 'search_spend', label: 'Spend', group: 'Brand Search', value: 2000, format: 'currency' },
    { id: 'search_revenue', label: 'Revenue', group: 'Brand Search', value: 8000, format: 'currency' },
    { id: 'search_roas', label: 'ROAS', group: 'Brand Search', value: 4.0, format: 'ratio', isTotal: true },

    { id: 'prospecting_spend', label: 'Spend', group: 'Meta Prospecting', value: 5000, format: 'currency' },
    { id: 'prospecting_revenue', label: 'Revenue', group: 'Meta Prospecting', value: 6000, format: 'currency' },
    { id: 'prospecting_roas', label: 'ROAS', group: 'Meta Prospecting', value: 1.2, format: 'ratio', isTotal: true },

    { id: 'retargeting_spend', label: 'Spend', group: 'Retargeting', value: 1000, format: 'currency' },
    { id: 'retargeting_revenue', label: 'Revenue', group: 'Retargeting', value: 9000, format: 'currency' },
    { id: 'retargeting_roas', label: 'ROAS', group: 'Retargeting', value: 9.0, format: 'ratio', isTotal: true },

    // Bug: 3600 / 3000 = 1.2, not 2.2.
    { id: 'display_spend', label: 'Spend', group: 'Display', value: 3000, format: 'currency' },
    { id: 'display_revenue', label: 'Revenue', group: 'Display', value: 3600, format: 'currency' },
    { id: 'display_roas', label: 'ROAS', group: 'Display', value: 2.2, format: 'ratio', isTotal: true },
  ];

  return {
    public: {
      title: 'Audit the ROAS of these campaigns',
      prompt:
        'This table shows spend, revenue, and ROAS (revenue ÷ spend) for 4 ' +
        "active campaigns. One campaign's ROAS doesn't match its formula. " +
        'Find it and give the correct value.',
      correctionHint: 'Write the ROAS as a decimal, e.g. 1.2',
      lineItems,
    },
    secret: {
      correctLineId: 'display_roas',
      correctValue: 1.2,
    },
  };
}

function buildSeoChallenge() {
  const lineItems = [
    { id: 'kw1_previous', label: 'Position 30 days ago', group: 'running shoes', value: 15, format: 'number' },
    { id: 'kw1_current', label: 'Current position', group: 'running shoes', value: 8, format: 'number' },
    { id: 'kw1_change', label: 'Change', group: 'running shoes', value: 7, format: 'signed', isTotal: true },

    { id: 'kw2_previous', label: 'Position 30 days ago', group: "women's running shoes", value: 22, format: 'number' },
    { id: 'kw2_current', label: 'Current position', group: "women's running shoes", value: 19, format: 'number' },
    { id: 'kw2_change', label: 'Change', group: "women's running shoes", value: 3, format: 'signed', isTotal: true },

    // Bug: 10 -> 14 got worse, the real change is -4, not +4.
    { id: 'kw3_previous', label: 'Position 30 days ago', group: 'buy sneakers online', value: 10, format: 'number' },
    { id: 'kw3_current', label: 'Current position', group: 'buy sneakers online', value: 14, format: 'number' },
    { id: 'kw3_change', label: 'Change', group: 'buy sneakers online', value: 4, format: 'signed', isTotal: true },

    { id: 'kw4_previous', label: 'Position 30 days ago', group: 'best athletic shoes', value: 30, format: 'number' },
    { id: 'kw4_current', label: 'Current position', group: 'best athletic shoes', value: 12, format: 'number' },
    { id: 'kw4_change', label: 'Change', group: 'best athletic shoes', value: 18, format: 'signed', isTotal: true },
  ];

  return {
    public: {
      title: 'Find the error in the keyword tracking',
      prompt:
        'This position tracking table shows the change for each keyword ' +
        '(previous position − current position; positive = improved, ' +
        'negative = worsened). One row has the change calculated wrong. ' +
        'Find it and give the correct value.',
      correctionHint: 'It can be negative if the position got worse, e.g. -4',
      lineItems,
    },
    secret: {
      correctLineId: 'kw3_change',
      correctValue: -4,
    },
  };
}

const SUPPORT_OPENING =
  "I've been waiting THREE days for my order and no one is responding! I " +
  'paid for express shipping and this is unacceptable. I want my money back NOW!';

function buildSupportChallenge() {
  return {
    public: {
      title: 'Angry customer: lost order',
      prompt:
        "You're playing a support agent. The customer is very upset because " +
        "their order didn't arrive. Reply with empathy and offer a concrete " +
        'solution. The conversation has 2 turns.',
      opening: SUPPORT_OPENING,
      totalTurns: 2,
    },
    secret: {
      openingMessage: SUPPORT_OPENING,
      branches: [
        {
          turnIndex: 0,
          rules: [
            {
              requireGroups: ['empathy', 'resolution'],
              reply: "Well... at least you're giving me a solution. How long is it going to take?",
            },
            {
              requireGroups: ['resolution'],
              reply: "And when is that going to happen? I still don't have my order or an apology!",
            },
          ],
          fallbackReply: "That doesn't solve anything! What are you going to do about my order RIGHT NOW?",
        },
      ],
      rubric: {
        dimensions: [
          {
            key: 'empathy',
            label: 'Empathy',
            weight: 0.5,
            hitValue: 50,
            words: ['understand', 'sorry', 'apolog', 'frustrat', "you're right", 'you are right', 'i realize'],
          },
          {
            key: 'resolution',
            label: 'Resolution',
            weight: 0.5,
            hitValue: 50,
            words: [
              'refund',
              'replace',
              'resend',
              'reship',
              'return',
              'solution',
              'resolve',
              'compensat',
              'discount',
              'escalat',
              'follow up',
              'track',
            ],
          },
        ],
        negativeWords: ["can't help you", 'not my problem', 'not my fault', 'calm down', "that's not true", 'impossible'],
        negativePenalty: 40,
        minWordsPerMessage: 4,
        shortMessagePenalty: 20,
        passThreshold: 60,
      },
    },
  };
}

function buildContentChallenge() {
  const opening =
    'Client brief: "The current ad says: \'Running shoes, made with the ' +
    "best materials.' It feels flat, has no hook, and doesn't say what to " +
    'do next. I need a version that converts."';

  return {
    public: {
      title: 'Rewrite this ad',
      prompt:
        "You're a copywriter for a running shoe brand. The client rejected " +
        'the current Meta Ads ad because it has no call to action. Rewrite ' +
        'it in 125 characters or less: it must mention a product benefit ' +
        '(comfort, lightness, performance...) and end with a clear call to action.',
      opening,
      totalTurns: 1,
    },
    secret: {
      openingMessage: opening,
      branches: [],
      rubric: {
        dimensions: [
          {
            key: 'benefit',
            label: 'Mentions a benefit',
            weight: 0.5,
            hitValue: 100,
            words: ['comfort', 'light', 'performance', 'cushion', 'breathable', 'durab', 'stab'],
          },
          {
            key: 'cta',
            label: 'Call to action',
            weight: 0.5,
            hitValue: 100,
            words: ['buy', 'sign up', 'discover', 'get', 'take advantage', 'book', 'try', 'shop', 'order', 'grab'],
          },
        ],
        negativeWords: ['free!!!', 'urgent', 'click now', '100% guaranteed'],
        negativePenalty: 30,
        maxCharsPerMessage: 125,
        lengthPenalty: 25,
        minWordsPerMessage: 5,
        shortMessagePenalty: 15,
        passThreshold: 60,
      },
    },
  };
}

export const SKILLS = {
  developer: {
    id: 'developer',
    label: 'Programador/a',
    candidateLabel: 'Developer',
    icon: '💻',
    description: 'Arreglar un código roto contra pruebas ocultas.',
    category: 'tech',
    type: 'code',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildDeveloperChallenge,
  },
  support: {
    id: 'support',
    label: 'Atención al cliente',
    candidateLabel: 'Customer Support',
    icon: '🎧',
    description: 'Calmar y resolver el caso de un cliente furioso simulado.',
    category: 'tech',
    type: 'scenario',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildSupportChallenge,
  },
  accounting: {
    id: 'accounting',
    label: 'Contabilidad',
    candidateLabel: 'Accounting',
    icon: '📊',
    description: 'Detectar el error en un balance general.',
    category: 'tech',
    type: 'diagnosis',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildAccountingChallenge,
  },
  paid_media: {
    id: 'paid_media',
    label: 'Paid Media',
    candidateLabel: 'Paid Media',
    icon: '📈',
    description: 'Auditar el ROAS de una tabla de campañas y encontrar el error.',
    category: 'marketing',
    type: 'diagnosis',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildPaidMediaChallenge,
  },
  seo: {
    id: 'seo',
    label: 'SEO',
    candidateLabel: 'SEO',
    icon: '🔍',
    description: 'Encontrar el error en un tracking de posiciones de keywords.',
    category: 'marketing',
    type: 'diagnosis',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildSeoChallenge,
  },
  content: {
    id: 'content',
    label: 'Content',
    candidateLabel: 'Content',
    icon: '✍️',
    description: 'Reescribir un anuncio sin gancho ni llamado a la acción.',
    category: 'marketing',
    type: 'scenario',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildContentChallenge,
  },
  crm: {
    id: 'crm',
    label: 'CRM',
    candidateLabel: 'CRM',
    icon: '📇',
    description: 'Arreglar una regla de segmentación de clientes VIP.',
    category: 'marketing',
    type: 'code',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildCrmChallenge,
  },
  automation: {
    id: 'automation',
    label: 'Automation',
    candidateLabel: 'Automation',
    icon: '⚙️',
    description: 'Arreglar el trigger de un flujo de correo automatizado.',
    category: 'marketing',
    type: 'code',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildAutomationChallenge,
  },
};

export function nextScenarioMessage(secret, turnIndex, candidateMessage) {
  const branch = (secret.branches || []).find((b) => b.turnIndex === turnIndex);
  if (!branch) return null;

  const text = candidateMessage.toLowerCase();
  const dimensionsByKey = Object.fromEntries(secret.rubric.dimensions.map((d) => [d.key, d]));

  for (const rule of branch.rules) {
    const matches = rule.requireGroups.every((key) => {
      const dim = dimensionsByKey[key];
      return dim && dim.words.some((w) => text.includes(w));
    });
    if (matches) return rule.reply;
  }
  return branch.fallbackReply;
}

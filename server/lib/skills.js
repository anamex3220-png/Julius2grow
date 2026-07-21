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

const TIME_LIMIT_SECONDS = 15 * 60;

export const CATEGORY_LABELS = {
  marketing: 'Marketing',
  tech: 'Tecnología y Operaciones',
};

function buildDeveloperChallenge() {
  return {
    public: {
      title: 'Arregla el carrito de compras',
      prompt:
        'La función calcularTotalCarrito debe sumar precio * cantidad de cada ' +
        'artículo y aplicar 10% de descuento cuando el total supera $100. ' +
        'Tiene errores: corrígela para que pase todas las pruebas.',
      language: 'javascript',
      functionName: 'calcularTotalCarrito',
      starterCode: `function calcularTotalCarrito(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].precio * items[i].cantidad;
  }
  if (total > 100) {
    total = total - 0.10;
  }
  return total;
}`,
    },
    secret: {
      functionName: 'calcularTotalCarrito',
      tests: [
        { args: [[{ precio: 10, cantidad: 2 }]], expected: 20 },
        { args: [[{ precio: 50, cantidad: 3 }]], expected: 135 },
        { args: [[]], expected: 0 },
        { args: [[{ precio: 100, cantidad: 1 }]], expected: 100 },
        {
          args: [
            [
              { precio: 20, cantidad: 3 },
              { precio: 15, cantidad: 4 },
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
      title: 'Arregla la regla de segmentación VIP',
      prompt:
        'esClienteVIP debe marcar como VIP solo a clientes que cumplen AMBAS ' +
        'condiciones: gasto total de al menos $1000 Y al menos 5 compras en ' +
        'los últimos 12 meses. Tiene un bug de lógica: corrígela.',
      language: 'javascript',
      functionName: 'esClienteVIP',
      starterCode: `function esClienteVIP(cliente) {
  if (cliente.gastoTotal > 1000 || cliente.comprasUltimos12Meses >= 5) {
    return true;
  }
  return false;
}`,
    },
    secret: {
      functionName: 'esClienteVIP',
      tests: [
        { args: [{ gastoTotal: 1000, comprasUltimos12Meses: 5 }], expected: true },
        { args: [{ gastoTotal: 1500, comprasUltimos12Meses: 2 }], expected: false },
        { args: [{ gastoTotal: 200, comprasUltimos12Meses: 10 }], expected: false },
        { args: [{ gastoTotal: 2000, comprasUltimos12Meses: 8 }], expected: true },
        { args: [{ gastoTotal: 500, comprasUltimos12Meses: 1 }], expected: false },
      ],
    },
  };
}

function buildAutomationChallenge() {
  return {
    public: {
      title: 'Arregla el trigger de carrito abandonado',
      prompt:
        'debeEnviarCorreoCarritoAbandonado debe enviar el correo solo si el ' +
        'carrito tiene artículos, pasó al menos 1 hora desde el abandono, y no ' +
        'se ha enviado ya. Hoy dispara en casos que no debería: corrígela.',
      language: 'javascript',
      functionName: 'debeEnviarCorreoCarritoAbandonado',
      starterCode: `function debeEnviarCorreoCarritoAbandonado(carrito) {
  if (carrito.horasDesdeAbandono >= 1) {
    return true;
  }
  return false;
}`,
    },
    secret: {
      functionName: 'debeEnviarCorreoCarritoAbandonado',
      tests: [
        { args: [{ items: [{ id: 1 }], horasDesdeAbandono: 2, yaEnviado: false }], expected: true },
        { args: [{ items: [], horasDesdeAbandono: 5, yaEnviado: false }], expected: false },
        { args: [{ items: [{ id: 1 }], horasDesdeAbandono: 0.5, yaEnviado: false }], expected: false },
        { args: [{ items: [{ id: 1 }], horasDesdeAbandono: 3, yaEnviado: true }], expected: false },
        {
          args: [{ items: [{ id: 1 }, { id: 2 }], horasDesdeAbandono: 1, yaEnviado: false }],
          expected: true,
        },
      ],
    },
  };
}

function buildAccountingChallenge() {
  const lineItems = [
    { id: 'efectivo', label: 'Efectivo', group: 'Activos', value: 50000 },
    { id: 'cxc', label: 'Cuentas por cobrar', group: 'Activos', value: 30000 },
    { id: 'inventario', label: 'Inventario', group: 'Activos', value: 40000 },
    // Suma real de activos = 120000, pero el total mostrado está mal.
    { id: 'total_activos', label: 'Total Activos', group: 'Activos', value: 130000, isTotal: true },
    { id: 'cxp', label: 'Cuentas por pagar', group: 'Pasivos', value: 25000 },
    { id: 'prestamo', label: 'Préstamo bancario', group: 'Pasivos', value: 35000 },
    { id: 'total_pasivos', label: 'Total Pasivos', group: 'Pasivos', value: 60000, isTotal: true },
    { id: 'capital', label: 'Capital social', group: 'Patrimonio', value: 60000 },
    { id: 'total_patrimonio', label: 'Total Patrimonio', group: 'Patrimonio', value: 60000, isTotal: true },
  ];

  return {
    public: {
      title: 'Encuentra el error en el balance',
      prompt:
        'Este balance general tiene un error: alguna cifra no coincide con la ' +
        'suma de sus componentes. Identifica la línea incorrecta y escribe el ' +
        'valor correcto.',
      lineItems,
    },
    secret: {
      correctLineId: 'total_activos',
      correctValue: 120000,
    },
  };
}

function buildPaidMediaChallenge() {
  const lineItems = [
    { id: 'busqueda_gasto', label: 'Gasto', group: 'Búsqueda de Marca', value: 2000, format: 'currency' },
    { id: 'busqueda_ingresos', label: 'Ingresos', group: 'Búsqueda de Marca', value: 8000, format: 'currency' },
    { id: 'busqueda_roas', label: 'ROAS', group: 'Búsqueda de Marca', value: 4.0, format: 'ratio', isTotal: true },

    { id: 'prospecting_gasto', label: 'Gasto', group: 'Prospecting Meta', value: 5000, format: 'currency' },
    { id: 'prospecting_ingresos', label: 'Ingresos', group: 'Prospecting Meta', value: 6000, format: 'currency' },
    { id: 'prospecting_roas', label: 'ROAS', group: 'Prospecting Meta', value: 1.2, format: 'ratio', isTotal: true },

    { id: 'retargeting_gasto', label: 'Gasto', group: 'Retargeting', value: 1000, format: 'currency' },
    { id: 'retargeting_ingresos', label: 'Ingresos', group: 'Retargeting', value: 9000, format: 'currency' },
    { id: 'retargeting_roas', label: 'ROAS', group: 'Retargeting', value: 9.0, format: 'ratio', isTotal: true },

    // Bug: 3600 / 3000 = 1.2, no 2.2.
    { id: 'display_gasto', label: 'Gasto', group: 'Display', value: 3000, format: 'currency' },
    { id: 'display_ingresos', label: 'Ingresos', group: 'Display', value: 3600, format: 'currency' },
    { id: 'display_roas', label: 'ROAS', group: 'Display', value: 2.2, format: 'ratio', isTotal: true },
  ];

  return {
    public: {
      title: 'Audita el ROAS de estas campañas',
      prompt:
        'Esta tabla muestra gasto, ingresos y ROAS (ingresos ÷ gasto) de 4 ' +
        'campañas activas. El ROAS de una campaña no coincide con su fórmula. ' +
        'Encuéntrala y da el valor correcto.',
      correctionHint: 'Escribe el ROAS como decimal, ej. 1.2',
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
    { id: 'kw1_anterior', label: 'Posición hace 30 días', group: 'zapatos para correr', value: 15, format: 'number' },
    { id: 'kw1_actual', label: 'Posición actual', group: 'zapatos para correr', value: 8, format: 'number' },
    { id: 'kw1_cambio', label: 'Cambio', group: 'zapatos para correr', value: 7, format: 'signed', isTotal: true },

    { id: 'kw2_anterior', label: 'Posición hace 30 días', group: 'tenis running mujer', value: 22, format: 'number' },
    { id: 'kw2_actual', label: 'Posición actual', group: 'tenis running mujer', value: 19, format: 'number' },
    { id: 'kw2_cambio', label: 'Cambio', group: 'tenis running mujer', value: 3, format: 'signed', isTotal: true },

    // Bug: 10 -> 14 empeoró, el cambio real es -4, no +4.
    { id: 'kw3_anterior', label: 'Posición hace 30 días', group: 'comprar tenis online', value: 10, format: 'number' },
    { id: 'kw3_actual', label: 'Posición actual', group: 'comprar tenis online', value: 14, format: 'number' },
    { id: 'kw3_cambio', label: 'Cambio', group: 'comprar tenis online', value: 4, format: 'signed', isTotal: true },

    { id: 'kw4_anterior', label: 'Posición hace 30 días', group: 'mejores zapatillas deportivas', value: 30, format: 'number' },
    { id: 'kw4_actual', label: 'Posición actual', group: 'mejores zapatillas deportivas', value: 12, format: 'number' },
    { id: 'kw4_cambio', label: 'Cambio', group: 'mejores zapatillas deportivas', value: 18, format: 'signed', isTotal: true },
  ];

  return {
    public: {
      title: 'Encuentra el error en el tracking de keywords',
      prompt:
        'Esta tabla de posiciones muestra el cambio de cada keyword (posición ' +
        'anterior − posición actual; positivo = mejoró, negativo = empeoró). ' +
        'Una fila tiene el cambio calculado mal. Encuéntrala y da el valor correcto.',
      correctionHint: 'Puede ser negativo si la posición empeoró, ej. -4',
      lineItems,
    },
    secret: {
      correctLineId: 'kw3_cambio',
      correctValue: -4,
    },
  };
}

const SUPPORT_OPENING =
  '¡Llevo TRES días esperando mi pedido y nadie me responde! Pagué el envío ' +
  'exprés y esto es inaceptable. ¡Quiero mi dinero de vuelta AHORA!';

function buildSupportChallenge() {
  return {
    public: {
      title: 'Cliente furioso: pedido perdido',
      prompt:
        'Simulas a un agente de soporte. El cliente está muy molesto porque su ' +
        'pedido no llegó. Respóndele con empatía y ofrece una solución concreta. ' +
        'La conversación tiene 2 turnos.',
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
              reply: 'Bueno... al menos me estás dando una solución. ¿Cuánto tiempo va a tardar?',
            },
            {
              requireGroups: ['resolution'],
              reply: '¿Y eso cuándo va a pasar? ¡Sigo sin mi pedido y sin una disculpa!',
            },
          ],
          fallbackReply: '¡Eso no resuelve nada! ¿Qué van a hacer con mi pedido AHORA MISMO?',
        },
      ],
      rubric: {
        dimensions: [
          {
            key: 'empathy',
            label: 'Empatía',
            weight: 0.5,
            hitValue: 50,
            words: ['entiendo', 'lamento', 'disculp', 'comprendo', 'siento mucho', 'tiene razón', 'tienes razón'],
          },
          {
            key: 'resolution',
            label: 'Resolución',
            weight: 0.5,
            hitValue: 50,
            words: [
              'reembolso',
              'reemplazo',
              'reenv',
              'devolución',
              'devolver',
              'solución',
              'resolver',
              'compensa',
              'descuento',
              'escalar',
              'seguimiento',
              'rastre',
            ],
          },
        ],
        negativeWords: ['no puedo ayudarte', 'no es mi problema', 'no es mi culpa', 'cálmate', 'cálmese', 'eso no es cierto', 'imposible'],
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
    'Brief del cliente: "El anuncio actual dice: \'Tenis para correr, hechos ' +
    'con los mejores materiales.\' Se ve plano, no tiene gancho ni dice qué ' +
    'hacer después. Necesito una versión que convierta."';

  return {
    public: {
      title: 'Reescribe este anuncio',
      prompt:
        'Eres copywriter de una marca de tenis para correr. El cliente rechazó ' +
        'el anuncio actual de Meta Ads porque no tiene llamado a la acción. ' +
        'Reescríbelo en máximo 125 caracteres: debe mencionar un beneficio del ' +
        'producto (comodidad, ligereza, rendimiento...) y terminar con un ' +
        'llamado a la acción claro.',
      opening,
      totalTurns: 1,
    },
    secret: {
      openingMessage: opening,
      branches: [],
      rubric: {
        dimensions: [
          {
            key: 'beneficio',
            label: 'Menciona un beneficio',
            weight: 0.5,
            hitValue: 100,
            words: ['comod', 'ligerez', 'rendimiento', 'amortigua', 'transpirable', 'durabilidad', 'estabilidad'],
          },
          {
            key: 'cta',
            label: 'Llamado a la acción',
            weight: 0.5,
            hitValue: 100,
            words: ['compra', 'regístrate', 'descubre', 'consigue', 'aprovecha', 'agenda', 'prueba', 'obtén', 'ordena', 'pide', 'cómpra'],
          },
        ],
        negativeWords: ['gratis!!!', 'urgente', 'haz click ya', '100% garantizado'],
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

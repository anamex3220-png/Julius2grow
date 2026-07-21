// Cada rol define su propio reto de 15 minutos. `build()` separa lo que ve
// el candidato (`public`) de la clave de calificación (`secret`), que nunca
// se envía al cliente.

const TIME_LIMIT_SECONDS = 15 * 60;

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

const SUPPORT_OPENING =
  '¡Llevo TRES días esperando mi pedido y nadie me responde! Pagué el envío ' +
  'exprés y esto es inaceptable. ¡Quiero mi dinero de vuelta AHORA!';

const EMPATHY_WORDS = [
  'entiendo',
  'lamento',
  'disculp',
  'comprendo',
  'siento mucho',
  'tiene razón',
  'tienes razón',
];
const RESOLUTION_WORDS = [
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
];
const NEGATIVE_WORDS = [
  'no puedo ayudarte',
  'no es mi problema',
  'no es mi culpa',
  'cálmate',
  'cálmese',
  'eso no es cierto',
  'imposible',
];

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
    },
  };
}

function nextSupportCustomerMessage(turnIndex, candidateMessage) {
  const text = candidateMessage.toLowerCase();
  const hasEmpathy = EMPATHY_WORDS.some((w) => text.includes(w));
  const hasResolution = RESOLUTION_WORDS.some((w) => text.includes(w));

  if (turnIndex === 0) {
    if (hasEmpathy && hasResolution) {
      return 'Bueno... al menos me estás dando una solución. ¿Cuánto tiempo va a tardar?';
    }
    if (hasResolution) {
      return '¿Y eso cuándo va a pasar? ¡Sigo sin mi pedido y sin una disculpa!';
    }
    return '¡Eso no resuelve nada! ¿Qué van a hacer con mi pedido AHORA MISMO?';
  }
  return null;
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

export const ROLES = {
  developer: {
    label: 'Programador/a',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildDeveloperChallenge,
  },
  support: {
    label: 'Atención al cliente',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildSupportChallenge,
  },
  accounting: {
    label: 'Contabilidad',
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    build: buildAccountingChallenge,
  },
};

export { nextSupportCustomerMessage, EMPATHY_WORDS, RESOLUTION_WORDS, NEGATIVE_WORDS };

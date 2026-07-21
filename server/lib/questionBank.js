// Banco de preguntas situacionales para el constructor de retos. Cada una
// mide un criterio (lógica aplicada, conocimiento aplicado, o soft skill)
// para un área de marketing. `suggestedKeywords`, cuando existe, es lo que
// se precarga como rúbrica sugerida — el reclutador puede borrarla si
// prefiere calificar la respuesta a mano.

export const AREA_LABELS = {
  paid_media: 'Paid Media',
  seo: 'SEO',
  content: 'Content',
  crm: 'CRM',
  automation: 'Automation',
};

export const QUESTION_BANK = [
  {
    id: 'pm-logica-1',
    area: 'paid_media',
    criterion: 'logica',
    text:
      'Tienes $10,000 de presupuesto mensual repartido en 3 campañas: Búsqueda de marca (ROAS 4.2), ' +
      'Prospecting (ROAS 1.1) y Retargeting (ROAS 6.5). Tu jefe pide subir el presupuesto total 30% para ' +
      'el próximo mes. ¿Cómo redistribuirías el presupuesto entre las 3 campañas y por qué?',
    suggestedKeywords: [],
  },
  {
    id: 'pm-conocimiento-1',
    area: 'paid_media',
    criterion: 'conocimiento',
    text:
      'Una campaña de Meta Ads lleva 5 días con el CPM subiendo 40% y el CTR bajando a la mitad, pero la ' +
      'audiencia y el presupuesto no cambiaron. ¿Qué 3 causas investigarías primero, en qué orden, y qué ' +
      'harías con cada una?',
    suggestedKeywords: ['fatiga', 'audiencia', 'creativo', 'frecuencia', 'competencia'],
  },
  {
    id: 'pm-soft-1',
    area: 'paid_media',
    criterion: 'soft_skill',
    text:
      'El dueño de una cuenta te escribe furioso porque bajaron las ventas esta semana, aunque tú sabes que ' +
      'fue por un problema de inventario del cliente, no de la campaña. ¿Cómo le respondes?',
    suggestedKeywords: [],
  },
  {
    id: 'seo-logica-1',
    area: 'seo',
    criterion: 'logica',
    text:
      'El tráfico orgánico de un blog cayó 35% en 2 semanas, pero las posiciones de las keywords principales ' +
      'no cambiaron. ¿Qué hipótesis investigarías, en qué orden, y por qué ese orden?',
    suggestedKeywords: [],
  },
  {
    id: 'seo-conocimiento-1',
    area: 'seo',
    criterion: 'conocimiento',
    text:
      'Un cliente quiere que todas las páginas de categoría tengan el mismo meta title "para mantener ' +
      'consistencia de marca". ¿Qué le explicarías sobre por qué esto es un error y qué alternativa propondrías?',
    suggestedKeywords: ['duplicado', 'canibalización', 'único', 'palabra clave'],
  },
  {
    id: 'seo-soft-1',
    area: 'seo',
    criterion: 'soft_skill',
    text:
      'Llevas 3 meses de estrategia SEO sin resultados grandes y el cliente amenaza con cancelar el ' +
      'contrato, aunque tú sabes que SEO toma tiempo. ¿Cómo manejarías esa conversación?',
    suggestedKeywords: [],
  },
  {
    id: 'content-logica-1',
    area: 'content',
    criterion: 'logica',
    text:
      'Tienes 3 piezas de contenido sobre el mismo tema pero en distinto formato (blog, video corto, ' +
      'infografía) y solo puedes promocionar una con el presupuesto de paid que te dieron. ¿Cómo decides ' +
      'cuál, y qué datos usarías para decidir?',
    suggestedKeywords: [],
  },
  {
    id: 'content-conocimiento-1',
    area: 'content',
    criterion: 'conocimiento',
    text:
      'Te piden escribir contenido para la misma audiencia en LinkedIn y en TikTok con el mismo mensaje ' +
      'central. ¿Qué cambiarías entre ambos formatos y por qué?',
    suggestedKeywords: ['tono', 'formato', 'duración', 'audiencia', 'llamado a la acción'],
  },
  {
    id: 'content-soft-1',
    area: 'content',
    criterion: 'soft_skill',
    text:
      'Un diseñador rechaza tus ediciones a un copy porque dice que "rompen el diseño", pero tú sabes que ' +
      'el copy actual no está convirtiendo. ¿Cómo resuelves el desacuerdo?',
    suggestedKeywords: [],
  },
  {
    id: 'crm-logica-1',
    area: 'crm',
    criterion: 'logica',
    text:
      'Tienes 3 segmentos: clientes activos de alto valor, clientes inactivos de alto valor histórico, y ' +
      'clientes nuevos de bajo valor. Solo puedes lanzar 1 campaña de reactivación este mes. ¿A cuál ' +
      'segmento le apuntas y por qué?',
    suggestedKeywords: [],
  },
  {
    id: 'crm-conocimiento-1',
    area: 'crm',
    criterion: 'conocimiento',
    text:
      'La tasa de apertura de tu newsletter bajó de 35% a 12% en un mes, sin cambios en el contenido. ' +
      '¿Qué revisarías primero?',
    suggestedKeywords: ['deliverability', 'spam', 'lista', 'remitente', 'asunto'],
  },
  {
    id: 'crm-soft-1',
    area: 'crm',
    criterion: 'soft_skill',
    text:
      'Ventas te pide enviar una promoción agresiva a toda la base, pero tú sabes que eso va a disparar el ' +
      'unsubscribe rate de tu segmento VIP. ¿Cómo lo planteas?',
    suggestedKeywords: [],
  },
  {
    id: 'automation-logica-1',
    area: 'automation',
    criterion: 'logica',
    text:
      'Diseña, en texto, el flujo de automatización para un carrito abandonado: ¿qué condiciones deben ' +
      'cumplirse para disparar el primer correo, y qué debe pasar si el usuario compra a la mitad del flujo?',
    suggestedKeywords: [],
  },
  {
    id: 'automation-conocimiento-1',
    area: 'automation',
    criterion: 'conocimiento',
    text:
      'Un flujo de bienvenida por correo tiene una tasa de conversión mucho más baja que el promedio de la ' +
      'industria. ¿Qué 3 cosas del flujo revisarías primero?',
    suggestedKeywords: ['timing', 'segmentación', 'oferta', 'asunto'],
  },
  {
    id: 'automation-soft-1',
    area: 'automation',
    criterion: 'soft_skill',
    text:
      'Marketing quiere lanzar una automatización nueva mañana, pero tú ves que no está probada y podría ' +
      'enviar correos duplicados a miles de personas. ¿Cómo comunicas el riesgo sin sonar como que estás ' +
      'bloqueando el lanzamiento?',
    suggestedKeywords: [],
  },
];

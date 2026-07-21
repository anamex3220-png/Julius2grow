// Banco de preguntas situacionales para el constructor de retos. Máximo 5
// por área. Cada pregunta es deliberadamente "integral": en una sola
// respuesta el candidato tiene que aplicar conocimiento técnico de su
// especialización, razonar con lógica sobre el problema, y demostrar cómo
// manejaría a las personas involucradas (soft skill) — no se separan en
// preguntas distintas por criterio.
//
// Regla de diseño: el enunciado presenta hechos y una tensión (presupuesto,
// tiempo, un stakeholder pidiendo algo), pero nunca adelanta cuál es el
// diagnóstico o la decisión correcta — eso es justo lo que se está
// evaluando. `suggestedKeywords` se deja vacío a propósito: son respuestas
// de juicio situacional, calificarlas por coincidencia de palabras las
// trivializaría, así que quedan para que el reclutador las lea y califique.

export const AREA_LABELS = {
  paid_media: 'Paid Media',
  seo: 'SEO',
  content: 'Content',
  crm: 'CRM',
  automation: 'Automation',
};

export const QUESTION_BANK = [
  // --- Paid Media ---
  {
    id: 'pm-1',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'Manejas $18,000 mensuales repartidos en 4 campañas de Meta Ads con resultados distintos entre sí. ' +
      'Tu director comercial te pide, a media semana, mover todo el presupuesto a la campaña con mejor ' +
      'desempeño histórico para "asegurar resultados" antes de fin de mes. Explica cómo evaluarías esa ' +
      'petición, qué factores técnicos considerarías antes de decidir, y cómo le responderías a tu director ' +
      'si tu análisis sugiere no hacer ese cambio.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-2',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'Una cuenta que manejas lleva 4 días con el costo por conversión duplicado, sin que hayas hecho ' +
      'cambios en las campañas. El cliente te escribe pidiendo una explicación inmediata. Describe tu ' +
      'proceso para investigar qué pudo causar el cambio, qué harías mientras tanto, y cómo estructurarías ' +
      'tu respuesta al cliente sin tener aún una causa confirmada.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-3',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'Tienes un presupuesto fijo de $5,000 para lanzar un producto nuevo y debes decidir entre invertirlo ' +
      'todo en un solo canal de alta intención de búsqueda, o repartirlo entre ese canal y uno de mayor ' +
      'alcance pero menor intención inmediata. Argumenta cómo tomarías esta decisión, qué datos necesitarías ' +
      'antes de decidir, y cómo se lo explicarías a alguien del equipo que no tiene experiencia en medios pagados.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-4',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'Una campaña de prospecting que venía funcionando bien empieza a perder eficiencia después de 3 ' +
      'semanas corriendo con el mismo set de anuncios, justo cuando se acerca una fecha comercial importante ' +
      'para el cliente. Explica qué revisarías técnicamente para entender qué está pasando, y cómo manejarías ' +
      'la conversación con el cliente si la solución requiere más tiempo del que queda antes de la fecha clave.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-5',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'El equipo de ventas insiste en que subas el presupuesto de una campaña porque genera muchos leads, ' +
      'pero tus datos muestran que esos leads cierran muy por debajo del promedio de otras campañas. ' +
      'Describe cómo analizarías la situación con datos, y cómo abordarías la conversación con el equipo de ' +
      'ventas para llegar a una decisión conjunta.',
    suggestedKeywords: [],
  },

  // --- SEO ---
  {
    id: 'seo-1',
    area: 'seo',
    criterion: 'integral',
    text:
      'El tráfico orgánico de un sitio bajó 30% en tres semanas, sin cambios recientes en el contenido ni ' +
      'penalizaciones visibles en las herramientas de monitoreo. El cliente, que no tiene conocimientos ' +
      'técnicos, te pide una explicación urgente. Describe cómo estructurarías tu investigación paso a paso, ' +
      'y cómo le explicarías la situación (sin tener aún la causa confirmada) de forma que entienda sin sentirse abrumado.',
    suggestedKeywords: [],
  },
  {
    id: 'seo-2',
    area: 'seo',
    criterion: 'integral',
    text:
      'Un cliente te pide que todas las páginas de categoría de su tienda en línea usen el mismo título y ' +
      'la misma descripción, para mantener consistencia de marca en todo el sitio. Explica cómo evaluarías ' +
      'esa petición desde el punto de vista técnico, qué le explicarías sobre las implicaciones de esa ' +
      'decisión, y cómo plantearías una alternativa si consideras que no le conviene.',
    suggestedKeywords: [],
  },
  {
    id: 'seo-3',
    area: 'seo',
    criterion: 'integral',
    text:
      'El equipo de producto planea rediseñar y migrar el sitio a una nueva plataforma en 3 semanas, sin ' +
      'haber consultado al equipo de SEO. Te enteras apenas ahora. Describe qué revisarías de inmediato, ' +
      'cómo priorizarías qué comunicar primero, y cómo abordarías la conversación con el equipo de producto ' +
      'dado el poco tiempo que queda.',
    suggestedKeywords: [],
  },
  {
    id: 'seo-4',
    area: 'seo',
    criterion: 'integral',
    text:
      'Tienes recursos para trabajar solo en una de estas dos cosas este mes: mejorar la velocidad de carga ' +
      'del sitio (que afecta a todas las páginas) o crear contenido nuevo para varias palabras clave de alto ' +
      'valor. Explica cómo decidirías cuál priorizar, qué datos usarías para sustentar tu decisión, y cómo ' +
      'se lo explicarías a un cliente que quiere ambas cosas ya.',
    suggestedKeywords: [],
  },
  {
    id: 'seo-5',
    area: 'seo',
    criterion: 'integral',
    text:
      'Llevas 10 semanas de estrategia SEO con mejoras técnicas ya implementadas, pero el tráfico todavía ' +
      'no refleja un cambio grande, y el cliente amenaza con cancelar el contrato este mes. Describe cómo ' +
      'evaluarías si la estrategia va bien o necesita ajustes, y cómo manejarías esa conversación con el cliente.',
    suggestedKeywords: [],
  },

  // --- Content ---
  {
    id: 'content-1',
    area: 'content',
    criterion: 'integral',
    text:
      'Te entregan un brief de campaña con objetivos de negocio claros, pero sin ninguna guía sobre tono, ' +
      'audiencia o formato, y la entrega es en 2 días. Describe cómo interpretarías el brief para definir ' +
      'la estrategia de contenido, qué preguntas harías si tuvieras tiempo de una sola llamada corta, y cómo ' +
      'tomarías decisiones donde no tengas toda la información.',
    suggestedKeywords: [],
  },
  {
    id: 'content-2',
    area: 'content',
    criterion: 'integral',
    text:
      'Publicaste una pieza de contenido que generó buen alcance pero varios comentarios señalando que el ' +
      'tono no encajaba con la marca. El cliente te escribe preocupado. Describe cómo evaluarías si el ' +
      'problema es real o una reacción aislada, y cómo estructurarías tu respuesta al cliente.',
    suggestedKeywords: [],
  },
  {
    id: 'content-3',
    area: 'content',
    criterion: 'integral',
    text:
      'Necesitas adaptar el mismo mensaje central de una campaña para tres formatos muy distintos (un ' +
      'artículo largo, un video corto y un carrusel de redes) con el mismo tiempo que antes usabas para uno ' +
      'solo. Explica cómo priorizarías el esfuerzo entre los tres formatos y qué cambiarías del mensaje en cada uno.',
    suggestedKeywords: [],
  },
  {
    id: 'content-4',
    area: 'content',
    criterion: 'integral',
    text:
      'Un diseñador rechaza cambios que hiciste a una pieza porque, según él, rompen la estética original, ' +
      'pero tus datos de campañas anteriores muestran que ese tipo de cambios suele convertir mejor. Describe ' +
      'cómo resolverías el desacuerdo con el diseñador, y qué harías si no llegan a un acuerdo antes de la ' +
      'fecha de entrega.',
    suggestedKeywords: [],
  },
  {
    id: 'content-5',
    area: 'content',
    criterion: 'integral',
    text:
      'Te piden escribir contenido educativo sobre un tema técnico de la industria del cliente que tú no ' +
      'dominas a profundidad, con entrega en 3 días. Explica cómo abordarías la investigación y validación ' +
      'del contenido para que sea preciso, sin tener tiempo de convertirte en experto en el tema.',
    suggestedKeywords: [],
  },

  // --- CRM ---
  {
    id: 'crm-1',
    area: 'crm',
    criterion: 'integral',
    text:
      'Tienes 3 segmentos de clientes con comportamientos muy distintos, pero solo puedes lanzar una ' +
      'campaña de reactivación este mes por restricciones de presupuesto y de tiempo del equipo. Describe ' +
      'cómo decidirías a cuál segmento dirigirte, qué datos usarías para sustentar la decisión, y cómo le ' +
      'explicarías esa priorización a alguien que esperaba que se atendieran los tres.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-2',
    area: 'crm',
    criterion: 'integral',
    text:
      'La tasa de apertura de tu newsletter cayó de forma importante en el último mes, sin cambios evidentes ' +
      'en el contenido ni en la frecuencia de envío. Describe tu proceso para investigar posibles causas y ' +
      'cómo comunicarías el hallazgo — o la falta de uno todavía — al resto del equipo.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-3',
    area: 'crm',
    criterion: 'integral',
    text:
      'El equipo de ventas te pide enviar una promoción a toda la base de clientes esta semana para cerrar ' +
      'el mes con buenos números. Describe cómo evaluarías esa petición antes de ejecutarla, qué información ' +
      'necesitarías del historial de la base, y cómo conversarías el tema con el equipo de ventas si tu ' +
      'análisis apunta a hacerlo distinto a como lo piden.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-4',
    area: 'crm',
    criterion: 'integral',
    text:
      'Vas a diseñar un nuevo flujo de fidelización para clientes recurrentes, pero tienes datos incompletos ' +
      'sobre el historial de compras de una parte importante de la base. Describe cómo diseñarías el flujo ' +
      'considerando esa limitación, y qué le comunicarías al equipo sobre los riesgos de lanzar así.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-5',
    area: 'crm',
    criterion: 'integral',
    text:
      'Un cliente importante se queja de que ha recibido demasiados correos en la última semana, aunque cada ' +
      'uno vino de una automatización distinta y nadie se había dado cuenta del traslape. Describe cómo ' +
      'investigarías qué pasó, cómo lo resolverías a nivel de sistema, y qué le dirías al cliente.',
    suggestedKeywords: [],
  },

  // --- Automation ---
  {
    id: 'automation-1',
    area: 'automation',
    criterion: 'integral',
    text:
      'Diseñaste un flujo de automatización para carritos abandonados, pero un mes después de lanzarlo ' +
      'notas que la tasa de conversión es mucho más baja de lo esperado, sin haber cambiado nada del flujo. ' +
      'Describe cómo investigarías las posibles causas, y cómo estructurarías la conversación con tu equipo ' +
      'si el problema termina siendo un error en la configuración.',
    suggestedKeywords: [],
  },
  {
    id: 'automation-2',
    area: 'automation',
    criterion: 'integral',
    text:
      'El equipo de marketing quiere lanzar mañana una automatización nueva que aún no ha sido probada por ' +
      'completo, para aprovechar una fecha comercial. Describe qué revisarías técnicamente antes del ' +
      'lanzamiento, y cómo comunicarías tu recomendación sin sonar como que estás bloqueando el lanzamiento.',
    suggestedKeywords: [],
  },
  {
    id: 'automation-3',
    area: 'automation',
    criterion: 'integral',
    text:
      'Tienes que diseñar un flujo de bienvenida para nuevos usuarios que se registran desde tres fuentes ' +
      'distintas, cada una con expectativas distintas del usuario. Describe cómo estructurarías la lógica ' +
      'del flujo para que se sienta relevante en los tres casos, y qué le explicarías al equipo sobre las ' +
      'decisiones que tomaste.',
    suggestedKeywords: [],
  },
  {
    id: 'automation-4',
    area: 'automation',
    criterion: 'integral',
    text:
      'Detectas que una automatización que lleva meses corriendo está enviando correos duplicados a un ' +
      'pequeño porcentaje de usuarios, aunque nadie se había quejado todavía. Describe cómo priorizarías ' +
      'investigar y corregir esto frente a otras tareas pendientes, y cómo decidirías si vale la pena ' +
      'comunicarlo proactivamente a los usuarios afectados.',
    suggestedKeywords: [],
  },
  {
    id: 'automation-5',
    area: 'automation',
    criterion: 'integral',
    text:
      'Te piden integrar una nueva herramienta de automatización con el sistema de CRM actual, pero la ' +
      'documentación técnica de la herramienta está incompleta y el proveedor tarda en responder tus dudas. ' +
      'Describe cómo avanzarías con el proyecto bajo esa incertidumbre, y qué le comunicarías a tu equipo ' +
      'sobre los riesgos y tiempos.',
    suggestedKeywords: [],
  },
];

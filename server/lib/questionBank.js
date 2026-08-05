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
//
// `text` está en inglés a propósito: si el reclutador inserta una de estas
// preguntas en un reto personalizado, termina en el link que recibe el
// candidato, y ese link debe estar 100% en inglés (ver skills.js).

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
      "You manage $18,000 a month across 4 Meta Ads campaigns with very different results from each " +
      'other. Midweek, your commercial director asks you to move the entire budget to the campaign with ' +
      'the best historical performance to "lock in results" before month end. Explain how you would ' +
      "evaluate that request, what technical factors you'd consider before deciding, and how you would " +
      "respond to your director if your analysis suggests not making that change.",
    suggestedKeywords: [],
  },
  {
    id: 'pm-2',
    area: 'paid_media',
    criterion: 'integral',
    text:
      "An account you manage has had double the cost per conversion for 4 days straight, without you " +
      'having made any changes to the campaigns. The client emails asking for an immediate explanation. ' +
      'Describe your process for investigating what could have caused the change, what you would do in ' +
      'the meantime, and how you would structure your reply to the client without yet having a confirmed cause.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-3',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'You have a fixed budget of $5,000 to launch a new product and must decide between putting it all ' +
      'into a single high-intent search channel, or splitting it between that channel and a wider-reach, ' +
      'lower-immediate-intent one. Argue how you would make this decision, what data you would need before ' +
      'deciding, and how you would explain it to someone on the team with no paid media experience.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-4',
    area: 'paid_media',
    criterion: 'integral',
    text:
      'A prospecting campaign that had been performing well starts losing efficiency after 3 weeks running ' +
      'the same ad set, right as an important commercial date for the client approaches. Explain what ' +
      "you'd review technically to understand what's happening, and how you would handle the conversation " +
      'with the client if the fix needs more time than is left before the key date.',
    suggestedKeywords: [],
  },
  {
    id: 'pm-5',
    area: 'paid_media',
    criterion: 'integral',
    text:
      "The sales team insists you increase the budget of a campaign because it generates a lot of leads, " +
      "but your data shows those leads close well below the average of other campaigns. Describe how " +
      "you'd analyze the situation with data, and how you would approach the conversation with the sales " +
      'team to reach a joint decision.',
    suggestedKeywords: [],
  },

  // --- SEO ---
  {
    id: 'seo-1',
    area: 'seo',
    criterion: 'integral',
    text:
      "A site's organic traffic dropped 30% over three weeks, with no recent content changes and no " +
      "visible penalties in the monitoring tools. The client, who isn't technical, asks you for an urgent " +
      "explanation. Describe how you'd structure your investigation step by step, and how you would " +
      'explain the situation (without yet having a confirmed cause) so they understand without feeling overwhelmed.',
    suggestedKeywords: [],
  },
  {
    id: 'seo-2',
    area: 'seo',
    criterion: 'integral',
    text:
      "A client asks you to make every category page on their online store use the same title and " +
      'description, to keep brand consistency across the whole site. Explain how you would evaluate that ' +
      "request from a technical standpoint, what you'd explain about the implications of that decision, " +
      "and how you'd propose an alternative if you think it doesn't serve them well.",
    suggestedKeywords: [],
  },
  {
    id: 'seo-3',
    area: 'seo',
    criterion: 'integral',
    text:
      'The product team is planning to redesign and migrate the site to a new platform in 3 weeks, without ' +
      "having consulted the SEO team. You only find out now. Describe what you'd check right away, how " +
      "you'd prioritize what to communicate first, and how you would approach the conversation with the " +
      'product team given how little time is left.',
    suggestedKeywords: [],
  },
  {
    id: 'seo-4',
    area: 'seo',
    criterion: 'integral',
    text:
      'You have resources to work on only one of these two things this month: improving the site\'s ' +
      "loading speed (which affects every page) or creating new content for several high-value keywords. " +
      "Explain how you'd decide which to prioritize, what data you'd use to support your decision, and how " +
      "you'd explain it to a client who wants both done now.",
    suggestedKeywords: [],
  },
  {
    id: 'seo-5',
    area: 'seo',
    criterion: 'integral',
    text:
      "You're 10 weeks into an SEO strategy with technical improvements already implemented, but traffic " +
      "still doesn't reflect a big change, and the client is threatening to cancel the contract this month. " +
      "Describe how you'd evaluate whether the strategy is on track or needs adjustments, and how you would " +
      'handle that conversation with the client.',
    suggestedKeywords: [],
  },

  // --- Content ---
  {
    id: 'content-1',
    area: 'content',
    criterion: 'integral',
    text:
      "You're handed a campaign brief with clear business goals, but no guidance at all on tone, audience, " +
      "or format, and the deadline is in 2 days. Describe how you'd interpret the brief to define the " +
      "content strategy, what questions you'd ask if you had time for a single short call, and how you'd " +
      'make decisions where you lack full information.',
    suggestedKeywords: [],
  },
  {
    id: 'content-2',
    area: 'content',
    criterion: 'integral',
    text:
      "You published a piece of content that got good reach but several comments pointing out the tone " +
      "didn't fit the brand. The client emails you worried. Describe how you'd evaluate whether the issue " +
      "is real or an isolated reaction, and how you would structure your reply to the client.",
    suggestedKeywords: [],
  },
  {
    id: 'content-3',
    area: 'content',
    criterion: 'integral',
    text:
      "You need to adapt the same core campaign message into three very different formats (a long article, " +
      'a short video, and a social carousel) with the same amount of time you used to spend on just one. ' +
      "Explain how you'd prioritize your effort across the three formats and what you'd change about the " +
      'message in each.',
    suggestedKeywords: [],
  },
  {
    id: 'content-4',
    area: 'content',
    criterion: 'integral',
    text:
      'A designer rejects changes you made to a piece because, in their view, they break the original ' +
      'aesthetic, but your data from past campaigns shows that kind of change tends to convert better. ' +
      "Describe how you'd resolve the disagreement with the designer, and what you'd do if you can't reach " +
      'an agreement before the deadline.',
    suggestedKeywords: [],
  },
  {
    id: 'content-5',
    area: 'content',
    criterion: 'integral',
    text:
      "You're asked to write educational content about a technical topic in the client's industry that you " +
      "don't know deeply, due in 3 days. Explain how you'd approach researching and validating the content " +
      "so it's accurate, without having time to become an expert on the topic.",
    suggestedKeywords: [],
  },

  // --- CRM ---
  {
    id: 'crm-1',
    area: 'crm',
    criterion: 'integral',
    text:
      'You have 3 customer segments with very different behaviors, but can only launch one reactivation ' +
      "campaign this month due to budget and team time constraints. Describe how you'd decide which " +
      "segment to target, what data you'd use to support the decision, and how you'd explain that " +
      'prioritization to someone who expected all three to be addressed.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-2',
    area: 'crm',
    criterion: 'integral',
    text:
      "Your newsletter's open rate dropped significantly last month, with no obvious changes in content or " +
      "send frequency. Describe your process for investigating possible causes, and how you'd communicate " +
      'the finding — or the lack of one so far — to the rest of the team.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-3',
    area: 'crm',
    criterion: 'integral',
    text:
      "The sales team asks you to send a promotion to the entire customer base this week to close out the " +
      "month with good numbers. Describe how you'd evaluate that request before executing it, what " +
      "information you'd need from the base's history, and how you'd discuss it with the sales team if your " +
      'analysis points to doing it differently than requested.',
    suggestedKeywords: [],
  },
  {
    id: 'crm-4',
    area: 'crm',
    criterion: 'integral',
    text:
      "You're going to design a new loyalty flow for repeat customers, but you have incomplete purchase " +
      "history data for a significant part of the base. Describe how you'd design the flow given that " +
      "limitation, and what you'd communicate to the team about the risks of launching it that way.",
    suggestedKeywords: [],
  },
  {
    id: 'crm-5',
    area: 'crm',
    criterion: 'integral',
    text:
      'An important client complains about receiving too many emails in the last week, even though each ' +
      "one came from a different automation and no one had noticed the overlap. Describe how you'd " +
      "investigate what happened, how you'd fix it at a systems level, and what you'd tell the client.",
    suggestedKeywords: [],
  },

  // --- Automation ---
  {
    id: 'automation-1',
    area: 'automation',
    criterion: 'integral',
    text:
      'You designed an abandoned cart automation flow, but a month after launch you notice the conversion ' +
      "rate is much lower than expected, without having changed anything in the flow. Describe how you'd " +
      "investigate the possible causes, and how you'd structure the conversation with your team if the " +
      'issue turns out to be a configuration error.',
    suggestedKeywords: [],
  },
  {
    id: 'automation-2',
    area: 'automation',
    criterion: 'integral',
    text:
      'The marketing team wants to launch a new automation tomorrow that hasn\'t been fully tested yet, to ' +
      "take advantage of a commercial date. Describe what you'd check technically before launch, and how " +
      "you'd communicate your recommendation without sounding like you're blocking the launch.",
    suggestedKeywords: [],
  },
  {
    id: 'automation-3',
    area: 'automation',
    criterion: 'integral',
    text:
      'You have to design a welcome flow for new users who sign up from three different sources, each with ' +
      "different user expectations. Describe how you'd structure the flow's logic so it feels relevant in " +
      "all three cases, and what you'd explain to the team about the decisions you made.",
    suggestedKeywords: [],
  },
  {
    id: 'automation-4',
    area: 'automation',
    criterion: 'integral',
    text:
      'You discover that an automation that has been running for months is sending duplicate emails to a ' +
      "small percentage of users, even though no one had complained yet. Describe how you'd prioritize " +
      "investigating and fixing this against other pending tasks, and how you'd decide whether it's worth " +
      'proactively communicating it to the affected users.',
    suggestedKeywords: [],
  },
  {
    id: 'automation-5',
    area: 'automation',
    criterion: 'integral',
    text:
      "You're asked to integrate a new automation tool with the current CRM system, but the tool's " +
      "technical documentation is incomplete and the vendor is slow to answer your questions. Describe how " +
      "you'd move the project forward under that uncertainty, and what you'd communicate to your team about " +
      'the risks and timeline.',
    suggestedKeywords: [],
  },
];

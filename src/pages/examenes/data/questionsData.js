export const allExams = {
  "master-full-examen-final": {
    title: "Examen Final de Master Full - Appointment Setting",
    description:
      "Este examen evalúa tus conocimientos fundamentales en el rol de Appointment Setter, desde la prospección hasta la mentalidad necesaria para el éxito.", 
    rules: [
      "Tienes 60 minutos para completar el examen.",
      "No puedes usar calculadora.",
      "Responde todas las preguntas.",
      "Una vez que avanzas a la siguiente pregunta, no puedes cambiar tu respuesta anterior.",
    ],
    imageUrl: "/images/setters.jpg",
    questions: [
  
      {
        id: 1,
        questionText: "¿Cuál es la función principal de un Setter Digital?",
        options: [
          { id: "a", text: "Cerrar ventas directamente" },
          { id: "b", text: "Generar leads y agendar reuniones calificadas" },
          { id: "c", text: "Realizar campañas de marketing digital" },
          { id: "d", text: "Crear contenido para redes sociales" },
        ],
        correctAnswerId: "b",
        explanation:
          "La función principal de un Setter Digital es cualificar prospectos y agendar reuniones con potenciales clientes para el equipo comercial, no cerrar la venta directamente.",
      },
      {
        id: 2,
        questionText:
          "¿Qué aspectos debe evaluar un Setter Digital antes de trabajar con una empresa?",
        options: [
          { id: "a", text: "El color del logo y el diseño web" },
          {
            id: "b",
            text: "La rentabilidad del servicio y el posicionamiento de la marca",
          },
          { id: "c", text: "La cantidad de seguidores en redes sociales" },
          { id: "d", text: "Las preferencias personales del CEO" },
        ],
        correctAnswerId: "b",
        explanation:
          "Un Setter Digital debe evaluar la rentabilidad del servicio ofrecido por la empresa y su posicionamiento en el mercado para asegurar que haya una base sólida para la prospección.",
      },

      {
        id: 3,
        questionText:
          "Verdadero o Falso: Un Setter Digital trabaja completamente solo y no necesita de un equipo comercial para cerrar ventas.",
        options: [
          { id: "a", text: "Verdadero" },
          { id: "b", text: "Falso" },
        ],
        correctAnswerId: "b",
        explanation:
          "Falso. El Setter Digital trabaja en colaboración con el equipo comercial (Closers) para calificar prospectos y agendar reuniones, facilitando el cierre de ventas.",
      },
      {
        id: 4,
        questionText:
          "¿Por qué es importante conocer la trayectoria de una empresa antes de trabajar con ella?",
        options: [
          { id: "a", text: "Para saber si sus empleados son amables" },
          {
            id: "b",
            text: "Para asegurar que tiene una trayectoria mínima y casos de éxito",
          },
          { id: "c", text: "Para saber cuánto tiempo llevan en el mercado" },
          { id: "d", text: "Para revisar sus redes sociales" },
        ],
        correctAnswerId: "b",
        explanation:
          "Es importante conocer la trayectoria para asegurar que la empresa tiene experiencia y casos de éxito que te ayuden a generar confianza y demostrar resultados a los prospectos.",
      },
      {
        id: 5,
        questionText:
          "¿Qué aspectos debes analizar para identificar a tu Buyer Persona?",
        options: [
          { id: "a", text: "Sus gustos musicales y hobbies" },
          {
            id: "b",
            text: "Datos demográficos, problemas, objetivos y motivaciones",
          },
          { id: "c", text: "Su historial de compras online" },
          { id: "d", text: "El tamaño de su equipo de trabajo" },
        ],
        correctAnswerId: "b",
        explanation:
          "Para identificar al Buyer Persona, se deben analizar datos demográficos, sus problemas o puntos de dolor, sus objetivos y sus motivaciones, para poder ofrecer soluciones personalizadas.",
      },
      {
        id: 6,
        questionText:
          "¿Cuál de estas NO es una estrategia efectiva de prospección para un Setter Digital?",
        options: [
          { id: "a", text: "Marketing de contenido" },
          { id: "b", text: "Publicidad en televisión" },
          { id: "c", text: "Alcance directo (outbound)" },
          { id: "d", text: "Participación en eventos de networking" },
        ],
        correctAnswerId: "b",
        explanation:
          "La publicidad en televisión generalmente no es una estrategia de prospección directa para un Setter Digital, que se enfoca más en el alcance digital y directo.",
      },
      {
        id: 7,
        questionText:
          "Verdadero o Falso: LinkedIn es una plataforma ideal para encontrar tomadores de decisiones, pero la versión gratuita tiene limitaciones en el número de mensajes que puedes enviar.",
        options: [
          { id: "a", text: "Verdadero" },
          { id: "b", text: "Falso" },
        ],
        correctAnswerId: "a",
        explanation:
          "Verdadero. LinkedIn es excelente para conectar con profesionales y tomadores de decisiones, pero su versión gratuita tiene restricciones en la mensajería y la visibilidad de perfiles.",
      },
      {
        id: 8,
        questionText:
          "¿Por qué es importante analizar datos en el proceso de prospección?",
        options: [
          { id: "a", text: "Para saber cuántas personas visitan tu perfil" },
          {
            id: "b",
            text: "Para optimizar las estrategias y mejorar la efectividad",
          },
          { id: "c", text: "Para comparar con la competencia" },
          { id: "d", text: "Para tener información de relleno" },
        ],
        correctAnswerId: "b",
        explanation:
          "El análisis de datos es crucial para entender qué estrategias funcionan, identificar patrones, optimizar el enfoque y mejorar continuamente la efectividad de la prospección.",
      },
      {
        id: 9,
        questionText:
          "¿Qué factores hacen que un servicio sea rentable para una empresa?",
        options: [
          { id: "a", text: "Que sea muy barato de producir" },
          {
            id: "b",
            text: "Que resuelva un problema real y tenga demanda en el mercado",
          },
          { id: "c", text: "Que sea novedoso y poco conocido" },
          {
            id: "d",
            text: "Que tenga una gran cantidad de clientes, sin importar su calidad",
          },
        ],
        correctAnswerId: "b",
        explanation:
          "Un servicio es rentable cuando resuelve un problema significativo para un segmento de mercado y existe suficiente demanda para él, lo que permite obtener ingresos superiores a los costos.",
      },
      {
        id: 10,
        questionText:
          "Verdadero o Falso: La comunicación efectiva en la prospección incluye entender las necesidades del prospecto y plantear soluciones que resuelvan sus problemas.",
        options: [
          { id: "a", text: "Verdadero" },
          { id: "b", text: "Falso" },
        ],
        correctAnswerId: "a",
        explanation:
          "Verdadero. La comunicación efectiva en prospección se centra en escuchar al prospecto, comprender sus puntos de dolor y presentar tu solución como la respuesta a esos problemas específicos.",
      },
      {
        id: 11,
        questionText:
          "¿Qué factor NO es clave al buscar la empresa ideal como Setter?",
        options: [
          { id: "a", text: "Que tenga un nicho de mercado claro" },
          { id: "b", text: "Que su CEO sea famoso en redes sociales" },
          {
            id: "c",
            text: "Que sus servicios sean rentables y con casos de éxito",
          },
          { id: "d", text: "Que tenga un buen equipo de Closers" },
        ],
        correctAnswerId: "b",
        explanation:
          "La fama del CEO en redes sociales no es un factor clave para la rentabilidad y el éxito de un Setter; lo son el nicho, la rentabilidad de servicios y la calidad del equipo comercial.",
      },
      {
        id: 12,
        questionText:
          "¿Cuál es una señal de que una empresa tiene buena reputación?",
        options: [
          { id: "a", text: "Tiene muchos anuncios en TV" },
          {
            id: "b",
            text: "Posee testimonios positivos y casos de éxito verificables",
          },
          { id: "c", text: "Vende productos a bajo precio" },
          { id: "d", text: "Tiene una oficina muy grande" },
        ],
        correctAnswerId: "b",
        explanation:
          "Los testimonios y casos de éxito reales son indicadores sólidos de una buena reputación y la capacidad de la empresa para cumplir sus promesas.",
      },
      {
        id: 13,
        questionText:
          "¿Qué debe tener una empresa para que sus servicios se consideren rentables para un Setter?",
        options: [
          { id: "a", text: "Un producto físico" },
          {
            id: "b",
            text: "Que sean servicios de alto valor y con un ticket promedio elevado",
          },
          { id: "c", text: "Que sean gratuitos para los clientes" },
          { id: "d", text: "Que sean muy populares y conocidos por todos" },
        ],
        correctAnswerId: "b",
        explanation:
          "Para un Setter, los servicios más rentables son aquellos de alto valor o ticket alto, ya que las comisiones por cada venta cerrada son significativamente mayores.",
      },
      {
        id: 14,
        questionText:
          "¿Cuál de las siguientes opciones representa mejor a un Buyer Persona?",
        options: [
          { id: "a", text: "Un cliente genérico al que le vendemos algo" },
          {
            id: "b",
            text: "Una representación semi-ficticia de tu cliente ideal",
          },
          { id: "c", text: "Un grupo de personas que compran tu producto" },
          { id: "d", text: "La persona más importante de tu empresa" },
        ],
        correctAnswerId: "b",
        explanation:
          "Un Buyer Persona es una representación detallada y semi-ficticia de tu cliente ideal, basada en datos reales e inferencias sobre demografía, comportamiento, motivaciones y objetivos.",
      },
      {
        id: 15,
        questionText:
          "¿Cuál es la ventaja principal de usar Google como estrategia de atracción?",
        options: [
          { id: "a", text: "Es una red social" },
          {
            id: "b",
            text: "Permite encontrar prospectos con intención de compra activa",
          },
          { id: "c", text: "Solo muestra empresas grandes" },
          { id: "d", text: "Es útil para buscar imágenes" },
        ],
        correctAnswerId: "b",
        explanation:
          "Google es una excelente herramienta para encontrar prospectos que ya están buscando soluciones activamente, lo que indica una alta intención de compra.",
      },
      {
        id: 16,
        questionText:
          "¿Cuál es una limitación importante al usar LinkedIn en versión gratuita?",
        options: [
          { id: "a", text: "No se puede buscar personas" },
          {
            id: "b",
            text: "Limitaciones en la cantidad de mensajes y visibilidad de perfiles",
          },
          { id: "c", text: "No permite ver los perfiles completos" },
          { id: "d", text: "Solo se pueden conectar con 5 personas" },
        ],
        correctAnswerId: "b",
        explanation:
          "La versión gratuita de LinkedIn restringe la cantidad de mensajes directos (InMails) que puedes enviar y la visibilidad de perfiles, lo que puede limitar la prospección a gran escala.",
      },
      {
        id: 17,
        questionText:
          "¿Qué es lo primero que se hace en la estrategia general del Appointment Setting?",
        options: [
          { id: "a", text: "Realizar la venta" },
          { id: "b", text: "Investigar y calificar al cliente ideal" },
          { id: "c", text: "Enviar mensajes masivos" },
          { id: "d", text: "Agendar la reunión de inmediato" },
        ],
        correctAnswerId: "b",
        explanation:
          "Lo primero es investigar y calificar al cliente ideal (Buyer Persona) para asegurar que se está prospectando a la persona correcta.",
      },
      {
        id: 18,
        questionText:
          "¿Por qué es importante evaluar los casos de éxito de una empresa antes de aplicar?",
        options: [
          { id: "a", text: "Para ver qué tan grande es la empresa" },
          {
            id: "b",
            text: "Para saber si el servicio tiene demanda y si el equipo es competente",
          },
          { id: "c", text: "Para copiar sus estrategias" },
          { id: "d", text: "Para conocer a sus clientes" },
        ],
        correctAnswerId: "b",
        explanation:
          "Evaluar los casos de éxito confirma que el servicio es efectivo, tiene demanda y que el equipo de Closers es capaz de cerrar ventas, lo que impacta directamente en las comisiones del Setter.",
      },
      {
        id: 19,
        questionText:
          "¿Cuál es el mito que se busca desmentir al inicio de la charla sobre los setters exitosos?",
        options: [
          { id: "a", text: "Que los setters son solo personas extrovertidas" },
          {
            id: "b",
            text: "Que necesitas tener un producto físico para ser un setter exitoso",
          },
          { id: "c", text: "Que el Appointment Setting es un trabajo pasivo" },
          {
            id: "d",
            text: "Que ser un setter exitoso depende de la suerte o talento innato",
          },
        ],
        correctAnswerId: "d",
        explanation:
          "Se busca desmentir el mito de que el éxito en el Appointment Setting es solo cuestión de suerte o talento innato, resaltando la importancia del proceso, la estrategia y la mentalidad.",
      },
      {
        id: 20,
        questionText:
          "¿Qué se debe hacer con el miedo al rechazo según la masterclass?",
        options: [
          { id: "a", text: "Evitarlo a toda costa" },
          { id: "b", text: "Ignorarlo y seguir adelante" },
          { id: "c", text: "Abrazarlo y aprender a manejarlo" },
          { id: "d", text: "Dejar que te detenga" },
        ],
        correctAnswerId: "c",
        explanation:
          "La masterclass sugiere abrazar el miedo al rechazo como una parte natural del proceso y desarrollar estrategias para manejarlo, convirtiéndolo en un motor de crecimiento.",
      },
      {
        id: 21,
        questionText:
          "¿Qué papel juega el cerebro en nuestra percepción del rechazo?",
        options: [
          {
            id: "a",
            text: "Nos protege del dolor, interpretando el rechazo como amenaza",
          },
          { id: "b", text: "Nos impulsa a buscar más rechazos" },
          { id: "c", text: "Nos hace sentir indiferentes al rechazo" },
          { id: "d", text: "Nos ayuda a olvidar rápidamente el rechazo" },
        ],
        correctAnswerId: "a",
        explanation:
          "El cerebro, en su función de protección, interpreta el rechazo social como una amenaza o dolor, similar al dolor físico, activando mecanismos de defensa.",
      },
      {
        id: 22,
        questionText:
          "¿Qué se busca desarrollar con la “resistencia emocional”?",
        options: [
          { id: "a", text: "Volverse insensible a las emociones" },
          {
            id: "b",
            text: "La capacidad de mantener la calma y el enfoque a pesar de los desafíos",
          },
          { id: "c", text: "Ser más agresivo en la prospección" },
          { id: "d", text: "No sentir nada al recibir un 'no'" },
        ],
        correctAnswerId: "b",
        explanation:
          "La resistencia emocional es la capacidad de un Setter para mantenerse resiliente, positivo y enfocado frente a la adversidad y los rechazos, sin que afecten su rendimiento.",
      },
      {
        id: 23,
        questionText:
          "¿Qué hábitos ayudan a evitar la procrastinación y el autosabotaje según el reto #3?",
        options: [
          { id: "a", text: "Dormir más y ver series todo el día" },
          {
            id: "b",
            text: "Establecer rutinas, planificar tareas y practicar la autodisciplina",
          },
          { id: "c", text: "Esperar a que llegue la inspiración" },
          { id: "d", text: "Hacer muchas cosas a la vez sin un orden" },
        ],
        correctAnswerId: "b",
        explanation:
          "Hábitos como establecer rutinas claras, planificar las actividades y cultivar la autodisciplina son fundamentales para superar la procrastinación y el autosabotaje.",
      },
      {
        id: 24,
        questionText:
          "¿Cuál es la diferencia entre una persona con mentalidad fija y una con mentalidad de crecimiento?",
        options: [
          {
            id: "a",
            text: "La mentalidad fija cree que las habilidades son innatas, la de crecimiento que se desarrollan",
          },
          {
            id: "b",
            text: "La mentalidad fija no aprende, la de crecimiento sí",
          },
          {
            id: "c",
            text: "La mentalidad fija es negativa, la de crecimiento es positiva",
          },
          { id: "d", text: "No hay diferencia real entre ellas" },
        ],
        correctAnswerId: "a",
        explanation:
          "La mentalidad fija cree que las habilidades son inmutables (innatas), mientras que la mentalidad de crecimiento cree que las habilidades pueden desarrollarse y mejorarse con esfuerzo y aprendizaje.",
      },
      {
        id: 25,
        questionText:
          "¿Por qué es importante tener una rutina diaria como setter?",
        options: [
          { id: "a", text: "Para no aburrirse" },
          {
            id: "b",
            text: "Para aumentar la productividad, disciplina y evitar la procrastinación",
          },
          { id: "c", text: "Para seguir las reglas" },
          { id: "d", text: "Para tener más tiempo libre" },
        ],
        correctAnswerId: "b",
        explanation:
          "Una rutina diaria estructurada mejora la productividad, fomenta la disciplina y reduce la procrastinación, permitiendo al Setter ser más consistente en sus tareas de prospección.",
      },
      {
        id: 26,
        questionText:
          "¿Qué actitud debe tener un setter frente a un “no” o una respuesta negativa?",
        options: [
          { id: "a", text: "Desanimarse y abandonar" },
          {
            id: "b",
            text: "Tomarlo como retroalimentación para mejorar y seguir adelante",
          },
          { id: "c", text: "Discutir con el prospecto" },
          { id: "d", text: "Bloquear al prospecto" },
        ],
        correctAnswerId: "b",
        explanation:
          "Un Setter exitoso ve un 'no' no como un fracaso personal, sino como una oportunidad de aprendizaje y una señal para ajustar su enfoque y seguir buscando al prospecto adecuado.",
      },
      {
        id: 27,
        questionText: "¿Qué significa tener una mentalidad inquebrantable?",
        options: [
          { id: "a", text: "Ser terco y no cambiar de opinión" },
          {
            id: "b",
            text: "Mantenerse firme, resiliente y enfocado a pesar de los obstáculos",
          },
          { id: "c", text: "No sentir emociones" },
          { id: "d", text: "Ser siempre positivo sin importar la realidad" },
        ],
        correctAnswerId: "b",
        explanation:
          "Una mentalidad inquebrantable es la capacidad de mantener la perseverancia, la resiliencia y el enfoque en los objetivos, sin dejarse abatir por los desafíos o el rechazo.",
      },
      {
        id: 28,
        questionText:
          "¿Qué estás dispuesto a hacer hoy para avanzar hacia tu mejor versión como setter?",
        options: [
          { id: "a", text: "No hacer nada y esperar resultados" },
          {
            id: "b",
            text: "Comprometerse con la acción y el aprendizaje continuo",
          },
          { id: "c", text: "Que otros hagan el trabajo por ti" },
          { id: "d", text: "Dudar de tus capacidades" },
        ],
        correctAnswerId: "b",
        explanation:
          "El progreso hacia la mejor versión de un Setter requiere un compromiso activo con la acción diaria, el aprendizaje continuo y la adaptación constante.",
      },

      // Preguntas de Respuesta Larga (convertidas a Múltiple Opción para el componente actual)
      {
        id: 29,
        questionText:
          "¿Cuál es el objetivo principal de la segmentación detallada en el método Gooseek?",
        options: [
          { id: "a", text: "Aumentar el número total de contactos" },
          {
            id: "b",
            text: "Identificar y clasificar el Buyer Persona más cualificado para la oferta",
          },
          { id: "c", text: "Crear listas de emails masivas" },
          { id: "d", text: "Saber de qué país son los prospectos" },
        ],
        correctAnswerId: "b",
        explanation:
          "El objetivo principal de la segmentación detallada es refinar la búsqueda para identificar con precisión el Buyer Persona que mejor se alinea con la oferta, maximizando la efectividad de la prospección.",
      },
      {
        id: 30,
        questionText:
          "¿Cuál de las siguientes NO forma parte de los niveles de segmentación detallada?",
        options: [
          { id: "a", text: "Segmentación por país" },
          { id: "b", text: "Segmentación por nicho" },
          { id: "c", text: "Segmentación por tamaño de empresa" },
          { id: "d", text: "Segmentación por color de ojos" },
        ],
        correctAnswerId: "d",
        explanation:
          "La segmentación por color de ojos no es un nivel relevante para la identificación de un Buyer Persona en un contexto de Appointment Setting.",
      },
      {
        id: 31,
        questionText:
          "¿Cuál es la fórmula sugerida para buscar oportunidades en Google?",
        options: [
          { id: "a", text: "'Netflix' + 'películas'" },
          {
            id: "b",
            text: "Palabra Clave + Nicho + Ciudad/País + Servicio Específico",
          },
          { id: "c", text: "'Recetas' + 'cocina'" },
          { id: "d", text: "'Noticias' + 'hoy'" },
        ],
        correctAnswerId: "b",
        explanation:
          "La fórmula sugerida para buscar oportunidades en Google es una combinación de Palabras Clave relevantes, el Nicho de mercado, la Ubicación (Ciudad/País) y el Servicio Específico que se busca, para refinar los resultados.",
      },
      {
        id: 32,
        questionText:
          "¿Cuál es un requisito mínimo para considerar que un negocio puede ser prospectado?",
        options: [
          { id: "a", text: "Que tenga una página de Facebook" },
          { id: "b", text: "Que genere más de $1 millón al año" },
          {
            id: "c",
            text: "Que tenga al menos un problema que nuestro servicio pueda resolver",
          },
          { id: "d", text: "Que haya respondido a un anuncio previo" },
        ],
        correctAnswerId: "c",
        explanation:
          "Un requisito mínimo fundamental es que el negocio tenga un problema identificable que el servicio o producto ofrecido pueda resolver, de lo contrario, no hay necesidad ni potencial de venta.",
      },
      {
        id: 33,
        questionText:
          "¿Qué herramienta se menciona como apoyo para evaluar la actividad en redes sociales?",
        options: [
          { id: "a", text: "Calculadora" },
          {
            id: "b",
            text: "Facebook Graph Search (o herramientas similares de análisis de actividad pública)",
          },
          { id: "c", text: "Microsoft Word" },
          { id: "d", text: "Un mapa" },
        ],
        correctAnswerId: "b",
        explanation:
          "Se menciona la utilidad de herramientas como Facebook Graph Search (o alternativas actuales) para evaluar la actividad y el compromiso de un negocio en redes sociales.",
      },
      {
        id: 34,
        questionText: "¿Qué debe incluirse al obtener los datos de la marca?",
        options: [
          { id: "a", text: "El número de teléfono del CEO" },
          {
            id: "b",
            text: "Información sobre su presencia online, tráfico web, y casos de éxito",
          },
          { id: "c", text: "Los nombres de todos sus empleados" },
          { id: "d", text: "La lista de sus proveedores" },
        ],
        correctAnswerId: "b",
        explanation:
          "Al obtener datos de la marca, es crucial recolectar información sobre su presencia online (sitio web, redes sociales), el tráfico que manejan (si es visible), y los casos de éxito, para evaluar su potencial.",
      },
      {
        id: 35,
        questionText:
          "¿Qué tipo de datos se deben recolectar del tomador de decisión (T.D.)?",
        options: [
          { id: "a", text: "Su dirección personal y fecha de cumpleaños" },
          {
            id: "b",
            text: "Su nombre, cargo, intereses profesionales y problemas relevantes",
          },
          { id: "c", text: "Su número de tarjeta de crédito" },
          { id: "d", text: "Su historial médico" },
        ],
        correctAnswerId: "b",
        explanation:
          "Del tomador de decisión (TD) se deben recolectar datos profesionales como su nombre, cargo, sus intereses laborales y, crucialmente, los problemas o desafíos que enfrenta en su rol, a los que tu servicio puede dar solución.",
      },
      {
        id: 36,
        questionText:
          "¿Qué estrategia adicional se brindó para encontrar al T.D. desde Google?",
        options: [
          { id: "a", text: "Buscar su horóscopo" },
          {
            id: "b",
            text: "Usar comandos de búsqueda avanzados (ej. 'site:' o 'intitle:')",
          },
          { id: "c", text: "Revisar solo la primera página de resultados" },
          { id: "d", text: "Preguntar a sus empleados por email" },
        ],
        correctAnswerId: "b",
        explanation:
          "Se sugieren comandos de búsqueda avanzados de Google (como `site:` para buscar dentro de un dominio específico o `intitle:` para buscar palabras clave en el título de la página) para localizar al Tomador de Decisión.",
      },
      {
        id: 37,
        questionText:
          "¿Por qué es obligatorio realizar una interacción previa antes de enviar el primer mensaje?",
        options: [
          { id: "a", text: "Para demostrar que eres activo en redes" },
          {
            id: "b",
            text: "Para construir una relación y aumentar la tasa de respuesta",
          },
          { id: "c", text: "Para que te vean como un amigo" },
          { id: "d", text: "Para agendar la reunión de inmediato" },
        ],
        correctAnswerId: "b",
        explanation:
          "Una interacción previa (ej. dar 'me gusta', comentar) ayuda a romper el hielo, crea una primera impresión positiva y aumenta significativamente las probabilidades de que tu primer mensaje sea abierto y respondido.",
      },
      {
        id: 38,
        questionText: "¿Cuál es el objetivo del mensaje 2 en la secuencia?",
        options: [
          { id: "a", text: "Vender directamente" },
          {
            id: "b",
            text: "Recordar la interacción y plantear una pregunta abierta sobre su problema",
          },
          { id: "c", text: "Pedir sus datos personales" },
          { id: "d", text: "Enviar un video de presentación" },
        ],
        correctAnswerId: "b",
        explanation:
          "El Mensaje 2 busca recordar al prospecto la interacción previa y, de manera sutil, introducir una pregunta abierta sobre un problema común que tu servicio puede resolver, invitando a la conversación.",
      },
      {
        id: 39,
        questionText:
          "¿Qué buscamos con el mensaje 3 en la secuencia de acercamiento?",
        options: [
          { id: "a", text: "Ofrecer un descuento" },
          {
            id: "b",
            text: "Presentar un caso de éxito relevante y una llamada a la acción suave",
          },
          { id: "c", text: "Pedir una reunión inmediatamente" },
          { id: "d", text: "Disculparnos por el mensaje anterior" },
        ],
        correctAnswerId: "b",
        explanation:
          "El Mensaje 3 tiene como objetivo mostrar un caso de éxito o un beneficio tangible que la empresa ha logrado para un cliente similar, seguido de una llamada a la acción suave (ej. ¿Te gustaría saber cómo? o ¿Qué te parece?).",
      },
      {
        id: 40,
        questionText: "¿Qué debe hacerse en el mensaje 4 para ser efectivo?",
        options: [
          { id: "a", text: "Amenazar al prospecto" },
          {
            id: "b",
            text: "Ofrecer valor adicional y ser un 'experto resolviendo problemas'",
          },
          { id: "c", text: "Enviar memes" },
          { id: "d", text: "Ignorar su respuesta" },
        ],
        correctAnswerId: "b",
        explanation:
          "El Mensaje 4 debe consolidar tu posición como un experto que puede resolver el problema del prospecto, ofreciendo valor adicional (ej. un recurso, un tip) que demuestre tu conocimiento sin pedir nada a cambio aún.",
      },
      {
        id: 41,
        questionText: "¿Qué incluye el mensaje 5 de la secuencia?",
        options: [
          { id: "a", text: "Un ultimátum para agendar" },
          {
            id: "b",
            text: "Una propuesta de valor clara y un cierre para la reunión",
          },
          { id: "c", text: "Un saludo sin propósito" },
          { id: "d", text: "Una lista de precios completa" },
        ],
        correctAnswerId: "b",
        explanation:
          "El Mensaje 5 es el punto culminante, donde se presenta una propuesta de valor concisa y se hace la invitación directa a la reunión, enfocándose en el beneficio que obtendrá el prospecto.",
      },
      {
        id: 42,
        questionText: "¿Cuál es el propósito del mensaje 6 en la secuencia?",
        options: [
          { id: "a", text: "Despedirse del prospecto" },
          {
            id: "b",
            text: "Un recordatorio suave y una última oportunidad para agendar",
          },
          { id: "c", text: "Enviar publicidad" },
          { id: "d", text: "Pedir disculpas por insistir" },
        ],
        correctAnswerId: "b",
        explanation:
          "El Mensaje 6 es un seguimiento final, un recordatorio amable que ofrece una última oportunidad para agendar la reunión, antes de considerar el lead como no interesado por el momento.",
      },
      {
        id: 43,
        questionText:
          "¿Qué estrategia emocional se utiliza para agendar la reunión con mayor efectividad?",
        options: [
          { id: "a", text: "Presión y urgencia" },
          {
            id: "b",
            text: "Empatía, comprensión del problema y oferta de solución",
          },
          { id: "c", text: "Miedo a perder la oportunidad" },
          { id: "d", text: "Manipulación de emociones" },
        ],
        correctAnswerId: "b",
        explanation:
          "La estrategia emocional efectiva para agendar reuniones se basa en la empatía, demostrando que comprendes el problema del prospecto y que tu servicio es una solución genuina para sus necesidades.",
      },
      {
        id: 44, // Ajusta este ID al siguiente disponible
        questionText:
          "¿Cuál es la importancia de la 'escucha activa' en el proceso de prospección?",
        options: [
          {
            id: "a",
            text: "Para saber si el prospecto tiene una buena dicción",
          },
          {
            id: "b",
            text: "Para identificar con precisión los puntos de dolor y necesidades del prospecto",
          },
          {
            id: "c",
            text: "Para controlar la conversación y dirigirla a la venta",
          },
          {
            id: "d",
            text: "Para que el prospecto sienta que estás prestando atención superficial",
          },
        ],
        correctAnswerId: "b",
        explanation:
          "La escucha activa es fundamental para entender a fondo lo que el prospecto realmente necesita y poder ofrecer una solución relevante, construyendo confianza y rapport.",
      },
      {
        id: 45, // Ajusta este ID
        questionText:
          "¿Qué es el 'valor percibido' en el contexto del Appointment Setting?",
        options: [
          { id: "a", text: "El precio real del servicio" },
          {
            id: "b",
            text: "La estimación subjetiva que tiene el prospecto sobre los beneficios de un servicio",
          },
          { id: "c", text: "El costo de producción del servicio" },
          { id: "d", text: "El valor que la empresa le asigna internamente" },
        ],
        correctAnswerId: "b",
        explanation:
          "El valor percibido es cómo el prospecto valora los beneficios de un servicio en su mente, no su costo monetario. Un alto valor percibido facilita la agendación de la reunión.",
      },
      {
        id: 46, // Ajusta este ID
        questionText:
          "¿Por qué es crucial la velocidad de respuesta al contactar a un prospecto calificado?",
        options: [
          { id: "a", text: "Para terminar rápido la jornada laboral" },
          {
            id: "b",
            text: "Porque el interés del prospecto disminuye rápidamente con el tiempo",
          },
          { id: "c", text: "Para demostrar que siempre estás disponible" },
          { id: "d", text: "Para superar a otros setters" },
        ],
        correctAnswerId: "b",
        explanation:
          "La rapidez en la respuesta es vital porque el interés de un prospecto cualificado suele ser alto inmediatamente después de su 'punto de dolor'. Demorarse puede hacer que pierda interés o encuentre otra solución.",
      },
      {
        id: 47, // Ajusta este ID
        questionText:
          "¿Qué tipo de preguntas son más efectivas en la etapa de cualificación para un Setter?",
        options: [
          { id: "a", text: "Preguntas cerradas (sí/no)" },
          { id: "b", text: "Preguntas personales sobre su vida privada" },
          {
            id: "c",
            text: "Preguntas abiertas que inviten a la reflexión y detalles",
          },
          { id: "d", text: "Preguntas sobre el precio del servicio" },
        ],
        correctAnswerId: "c",
        explanation:
          "Las preguntas abiertas (que requieren más que un 'sí' o 'no') son más efectivas porque permiten al prospecto compartir más información sobre sus desafíos, necesidades y aspiraciones, facilitando una cualificación profunda.",
      },
      {
        id: 48, // Ajusta este ID
        questionText:
          "¿Cuál es el propósito de un 'lead magnet' en una estrategia de atracción de prospectos?",
        options: [
          { id: "a", text: "Vender un producto de bajo costo" },
          {
            id: "b",
            text: "Ofrecer contenido de valor a cambio de información de contacto del prospecto",
          },
          { id: "c", text: "Generar ingresos pasivos" },
          { id: "d", text: "Promocionar un evento en vivo" },
        ],
        correctAnswerId: "b",
        explanation:
          "Un lead magnet (como un ebook, webinar gratuito o checklist) es un incentivo de valor que se ofrece al prospecto a cambio de su información de contacto, con el fin de iniciar una relación de prospección.",
      },
      {
        id: 49, // Ajusta este ID
        questionText:
          "¿Qué significa 'cualificar' un prospecto en Appointment Setting?",
        options: [
          { id: "a", text: "Solo obtener su número de teléfono" },
          {
            id: "b",
            text: "Determinar si el prospecto cumple con los criterios para ser un cliente potencial y si tiene una necesidad real",
          },
          { id: "c", text: "Convencerlo de comprar inmediatamente" },
          { id: "d", text: "Enviarles todos los detalles del servicio" },
        ],
        correctAnswerId: "b",
        explanation:
          "Cualificar un prospecto implica evaluar si encaja con el perfil del cliente ideal (Buyer Persona) y si tiene un problema o necesidad que el servicio de la empresa puede resolver, asegurando la calidad de la reunión agendada.",
      },
      {
        id: 50, // Ajusta este ID
        questionText:
          "¿Por qué es importante tener un 'elevator pitch' como Setter?",
        options: [
          { id: "a", text: "Para impresionar a tus amigos" },
          {
            id: "b",
            text: "Para presentar de forma concisa y persuasiva el valor del servicio en poco tiempo",
          },
          { id: "c", text: "Para usarlo solo en ascensores" },
          { id: "d", text: "Para recordar los nombres de los prospectos" },
        ],
        correctAnswerId: "b",
        explanation:
          "Un elevator pitch es una descripción breve y convincente del servicio o propuesta de valor, diseñada para ser comunicada en el tiempo que dura un viaje en ascensor (aproximadamente 30-60 segundos), ideal para captar el interés rápidamente.",
      },
    ],
  },

  // --- Examen: Matemáticas Básicas ---
  "matematicas-basicas": {
    title: "Examen de Matemáticas Básicas",
    questions: [
      {
        id: 101,
        questionText: "¿Cuánto es 5 + 7?",
        options: [
          { id: "a", text: "10" },
          { id: "b", text: "12" },
          { id: "c", text: "14" },
          { id: "d", text: "15" },
        ],
        correctAnswerId: "b",
        explanation:
          "La suma de 5 y 7 es 12. Es una operación aritmética fundamental.",
      },
      {
        id: 102,
        questionText: "¿Cuánto es 8 * 3?",
        options: [
          { id: "a", text: "20" },
          { id: "b", text: "24" },
          { id: "c", text: "27" },
          { id: "d", text: "32" },
        ],
        correctAnswerId: "b",
        explanation:
          "La multiplicación de 8 por 3 es 24. Esto se puede ver como la suma de 8 tres veces (8+8+8).",
      },
    ],
  },
};

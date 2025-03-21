import { AppDataSource } from './data-source';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Post } from '../models/Post';
import { slugify } from '../utils/slugify';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida para el seed');

    // Repositorios
    const userRepository = AppDataSource.getRepository(User);
    const categoryRepository = AppDataSource.getRepository(Category);
    const postRepository = AppDataSource.getRepository(Post);

    // Verificar si ya hay datos
    const userCount = await userRepository.count();
    if (userCount > 0) {
      console.log('La base de datos ya contiene datos. Saltando seed...');
      await AppDataSource.destroy();
      return;
    }

    // Crear usuarios
    console.log('Creando usuarios...');
    const admin = userRepository.create({
      name: 'Administrador',
      email: 'admin@bizflow.com',
      password: 'admin123',
      role: 'admin',
      position: 'Director de Tecnología',
      bio: 'Administrador del blog de Bizflow con amplia experiencia en tecnologías industriales.'
    });
    await userRepository.save(admin);

    const author1 = userRepository.create({
      name: 'Carlos Rodríguez',
      email: 'carlos@bizflow.com',
      password: 'carlos123',
      role: 'author',
      position: 'Director de Transformación Digital',
      bio: 'Experto en transformación digital y procesos industriales.'
    });
    await userRepository.save(author1);

    const author2 = userRepository.create({
      name: 'María González',
      email: 'maria@bizflow.com',
      password: 'maria123',
      role: 'author',
      position: 'Especialista en IoT Industrial',
      bio: 'Especialista en implementación de soluciones IoT para entornos industriales.'
    });
    await userRepository.save(author2);

    // Crear categorías
    console.log('Creando categorías...');
    const categories = [
      { 
        name: 'Transformación Digital', 
        description: 'Artículos sobre transformación digital en la industria',
        metaTitle: 'Transformación Digital Industrial | Bizflow',
        metaDescription: 'Descubra las últimas tendencias en transformación digital para la industria 4.0 y los procesos industriales modernos.',
        metaKeywords: 'transformación digital, industria 4.0, digitalización industrial',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/categorias/transformacion-digital',
        socialImageUrl: '/images/og/transformacion-digital.jpg'
      },
      { 
        name: 'IoT Industrial', 
        description: 'Todo sobre Internet de las Cosas en entornos industriales',
        metaTitle: 'IoT Industrial y Conectividad | Bizflow',
        metaDescription: 'Aprenda sobre implementación de Internet de las Cosas en entornos industriales y mejore la conectividad de sus procesos.',
        metaKeywords: 'IoT industrial, internet de las cosas, sensores industriales, conectividad',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/categorias/iot-industrial',
        socialImageUrl: '/images/og/iot-industrial.jpg'
      },
      { 
        name: 'Mantenimiento', 
        description: 'Estrategias de mantenimiento predictivo y preventivo',
        metaTitle: 'Mantenimiento Predictivo y Preventivo | Bizflow',
        metaDescription: 'Estrategias avanzadas de mantenimiento predictivo y preventivo para optimizar sus operaciones industriales.',
        metaKeywords: 'mantenimiento predictivo, mantenimiento preventivo, optimización operativa',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/categorias/mantenimiento',
        socialImageUrl: '/images/og/mantenimiento.jpg'
      },
      { 
        name: 'Automatización', 
        description: 'Procesos de automatización industrial',
        metaTitle: 'Automatización de Procesos Industriales | Bizflow',
        metaDescription: 'Soluciones de automatización para procesos industriales que aumentan la eficiencia y reducen los costos operativos.',
        metaKeywords: 'automatización industrial, robótica, procesos automatizados',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/categorias/automatizacion',
        socialImageUrl: '/images/og/automatizacion.jpg'
      },
      { 
        name: 'Ciberseguridad', 
        description: 'Seguridad en entornos industriales',
        metaTitle: 'Ciberseguridad Industrial | Bizflow',
        metaDescription: 'Proteja sus activos industriales con estrategias avanzadas de ciberseguridad para la industria 4.0.',
        metaKeywords: 'ciberseguridad industrial, seguridad OT, protección industrial',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/categorias/ciberseguridad',
        socialImageUrl: '/images/og/ciberseguridad.jpg'
      },
      { 
        name: 'Analítica', 
        description: 'Análisis de datos y Business Intelligence',
        metaTitle: 'Analítica Industrial y Business Intelligence | Bizflow',
        metaDescription: 'Transforme sus datos industriales en insights accionables con soluciones avanzadas de analítica y BI.',
        metaKeywords: 'analítica industrial, business intelligence, big data, insights',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/categorias/analitica',
        socialImageUrl: '/images/og/analitica.jpg'
      }
    ];

    const savedCategories: Category[] = [];

    for (const cat of categories) {
      const category = categoryRepository.create({
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        metaKeywords: cat.metaKeywords,
        indexable: cat.indexable,
        canonicalUrl: cat.canonicalUrl,
        socialImageUrl: cat.socialImageUrl
      });
      const savedCategory = await categoryRepository.save(category);
      savedCategories.push(savedCategory);
    }

    // Crear posts
    console.log('Creando posts...');
    const posts = [
      {
        title: 'Transformación Digital en la Industria 4.0',
        excerpt: 'Descubra cómo la transformación digital está revolucionando los procesos industriales y mejorando la eficiencia operativa.',
        content: `
          <p>La transformación digital en la industria 4.0 representa un cambio fundamental en la forma en que las empresas manufactureras operan y entregan valor a sus clientes. Esta revolución industrial, impulsada por tecnologías como la inteligencia artificial, el Internet de las Cosas (IoT), la computación en la nube y los sistemas ciberfísicos, está redefiniendo los procesos de producción y las cadenas de suministro en todo el mundo.</p>
          
          <h2>¿Qué es la Industria 4.0?</h2>
          
          <p>La Industria 4.0, también conocida como la cuarta revolución industrial, se refiere a la tendencia actual de automatización e intercambio de datos en tecnologías de fabricación. Incluye sistemas ciberfísicos, Internet de las Cosas, computación en la nube y computación cognitiva, creando lo que se ha llamado una "fábrica inteligente".</p>
          
          <p>En el núcleo de la Industria 4.0 está la idea de que las máquinas y los sistemas pueden comunicarse entre sí y con los humanos en tiempo real, permitiendo una toma de decisiones más informada y eficiente.</p>
          
          <h2>Beneficios de la Transformación Digital en la Industria</h2>
          
          <p>La implementación de tecnologías digitales en entornos industriales ofrece numerosos beneficios:</p>
          
          <ul>
            <li><strong>Mayor eficiencia operativa:</strong> La automatización y optimización de procesos reduce los tiempos de inactividad y aumenta la productividad.</li>
            <li><strong>Mejora de la calidad:</strong> Los sistemas de control de calidad basados en datos pueden identificar y corregir problemas antes de que afecten al producto final.</li>
            <li><strong>Reducción de costos:</strong> La optimización de recursos y la prevención de fallos conducen a importantes ahorros de costos.</li>
            <li><strong>Mayor flexibilidad:</strong> Las fábricas inteligentes pueden adaptarse rápidamente a cambios en la demanda o en las especificaciones del producto.</li>
            <li><strong>Sostenibilidad mejorada:</strong> La optimización de procesos conduce a un menor consumo de energía y recursos.</li>
          </ul>
        `,
        status: 'published',
        publishedAt: new Date('2023-03-15'),
        featuredImageUrl: '/images/blog/digital-transformation.svg',
        categoryId: savedCategories[0].id,
        authorId: author1.id,
        metaTitle: 'Transformación Digital en la Industria 4.0: Guía Completa',
        metaDescription: 'Aprenda cómo implementar la transformación digital en su empresa industrial. Beneficios, pasos y casos de éxito en la industria 4.0.',
        metaKeywords: 'transformación digital, industria 4.0, digitalización, eficiencia operativa',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/blog/transformacion-digital-industria-4-0',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": "Transformación Digital en la Industria 4.0",
          "datePublished": "2023-03-15",
          "author": {
            "@type": "Person",
            "name": "Carlos Rodríguez"
          }
        },
        socialImageUrl: '/images/og/transformacion-digital-industria-4-0.jpg'
      },
      {
        title: 'Implementación de IoT en Entornos Industriales',
        excerpt: 'Estrategias efectivas para implementar soluciones IoT que optimicen sus operaciones y reduzcan costos operativos.',
        content: `
          <p>El Internet de las Cosas (IoT) está transformando radicalmente los entornos industriales, permitiendo la conexión de máquinas, dispositivos y sistemas para obtener datos en tiempo real y mejorar la toma de decisiones.</p>
          
          <h2>Beneficios del IoT Industrial</h2>
          
          <p>La implementación de IoT en entornos industriales ofrece numerosos beneficios:</p>
          
          <ul>
            <li><strong>Monitoreo en tiempo real:</strong> Supervise el rendimiento de equipos y procesos en tiempo real.</li>
            <li><strong>Mantenimiento predictivo:</strong> Anticipe fallos en equipos antes de que ocurran, reduciendo el tiempo de inactividad.</li>
            <li><strong>Optimización de procesos:</strong> Identifique cuellos de botella y áreas de mejora en sus procesos de producción.</li>
            <li><strong>Eficiencia energética:</strong> Reduzca el consumo de energía mediante el monitoreo y la optimización.</li>
            <li><strong>Mejora de la calidad:</strong> Detecte desviaciones en la calidad del producto en tiempo real.</li>
          </ul>
          
          <h2>Pasos para una Implementación Exitosa</h2>
          
          <p>Para implementar IoT de manera efectiva en su entorno industrial, siga estos pasos clave:</p>
          
          <ol>
            <li><strong>Defina objetivos claros:</strong> Identifique qué problemas específicos desea resolver con IoT.</li>
            <li><strong>Seleccione los sensores adecuados:</strong> Elija sensores que puedan capturar los datos necesarios para sus objetivos.</li>
            <li><strong>Implemente una plataforma de gestión de datos:</strong> Necesitará una plataforma para recopilar, procesar y analizar los datos de los sensores.</li>
            <li><strong>Asegure su red:</strong> Implemente medidas de seguridad robustas para proteger sus dispositivos y datos IoT.</li>
            <li><strong>Comience con un proyecto piloto:</strong> Pruebe su solución IoT en un área pequeña antes de escalar.</li>
          </ol>
        `,
        status: 'published',
        publishedAt: new Date('2023-02-28'),
        featuredImageUrl: '/images/blog/industrial-iot.svg',
        categoryId: savedCategories[1].id,
        authorId: author2.id,
        metaTitle: 'Implementación de IoT Industrial: Estrategias y Beneficios',
        metaDescription: 'Guía práctica para implementar Internet de las Cosas en entornos industriales. Descubra los beneficios y mejores prácticas para su empresa.',
        metaKeywords: 'IoT industrial, internet de las cosas, sensores, monitoreo en tiempo real',
        indexable: true,
        canonicalUrl: 'https://bizflow.com/blog/implementacion-iot-entornos-industriales',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": "Implementación de IoT en Entornos Industriales",
          "datePublished": "2023-02-28",
          "author": {
            "@type": "Person",
            "name": "María González"
          }
        },
        socialImageUrl: '/images/og/implementacion-iot-industrial.jpg'
      },
      {
        title: 'Mantenimiento Predictivo: El Futuro de la Industria',
        excerpt: 'Cómo el mantenimiento predictivo basado en datos está transformando la gestión de activos industriales.',
        content: `
          <p>El mantenimiento predictivo representa un cambio de paradigma en la gestión de activos industriales, permitiendo a las empresas predecir cuándo ocurrirán fallos en los equipos y tomar medidas preventivas antes de que sucedan.</p>
          
          <h2>¿Qué es el Mantenimiento Predictivo?</h2>
          
          <p>El mantenimiento predictivo utiliza datos y análisis avanzados para monitorear el estado de los equipos y predecir cuándo podría producirse un fallo. A diferencia del mantenimiento preventivo tradicional, que se basa en intervalos de tiempo fijos, el mantenimiento predictivo se basa en el estado real del equipo.</p>
          
          <h2>Tecnologías Clave</h2>
          
          <p>Varias tecnologías están impulsando la revolución del mantenimiento predictivo:</p>
          
          <ul>
            <li><strong>Sensores IoT:</strong> Monitorizan parámetros como vibración, temperatura, presión y consumo de energía.</li>
            <li><strong>Analítica avanzada:</strong> Algoritmos que analizan datos históricos y en tiempo real para identificar patrones y predecir fallos.</li>
            <li><strong>Machine Learning:</strong> Modelos que mejoran continuamente su precisión a medida que reciben más datos.</li>
            <li><strong>Gemelos digitales:</strong> Réplicas virtuales de equipos físicos que permiten simulaciones y análisis detallados.</li>
          </ul>
        `,
        status: 'published',
        publishedAt: new Date('2023-02-10'),
        featuredImageUrl: '/images/blog/predictive-maintenance.svg',
        categoryId: savedCategories[2].id,
        authorId: author1.id
      },
      {
        title: 'Automatización de Procesos Industriales',
        excerpt: 'Guía completa para implementar soluciones de automatización que mejoren la productividad y reduzcan errores.',
        content: `
          <p>La automatización de procesos industriales es una estrategia fundamental para mejorar la eficiencia, reducir errores y aumentar la capacidad de producción. Esta guía le ayudará a implementar soluciones de automatización efectivas en su entorno industrial.</p>
          
          <h2>Beneficios de la Automatización Industrial</h2>
          
          <p>La automatización ofrece numerosas ventajas para las operaciones industriales:</p>
          
          <ul>
            <li><strong>Mayor productividad:</strong> Las máquinas pueden trabajar continuamente sin fatiga.</li>
            <li><strong>Mejor calidad:</strong> Reduce la variabilidad y los errores humanos.</li>
            <li><strong>Mayor seguridad:</strong> Las máquinas pueden realizar tareas peligrosas en lugar de los humanos.</li>
            <li><strong>Reducción de costos:</strong> A largo plazo, la automatización reduce los costos operativos.</li>
            <li><strong>Flexibilidad mejorada:</strong> Los sistemas modernos pueden reconfigurarse rápidamente para diferentes productos.</li>
          </ul>
          
          <h2>Pasos para una Implementación Exitosa</h2>
          
          <p>Para implementar la automatización de manera efectiva, siga estos pasos clave:</p>
          
          <ol>
            <li><strong>Evalúe sus procesos actuales:</strong> Identifique áreas donde la automatización tendría mayor impacto.</li>
            <li><strong>Establezca objetivos claros:</strong> Defina qué espera lograr con la automatización.</li>
            <li><strong>Seleccione las tecnologías adecuadas:</strong> Considere PLC, robots, sistemas SCADA, etc.</li>
            <li><strong>Implemente gradualmente:</strong> Comience con proyectos piloto y amplíe gradualmente.</li>
            <li><strong>Capacite a su personal:</strong> Asegúrese de que sus empleados estén preparados para trabajar con los nuevos sistemas.</li>
          </ol>
        `,
        status: 'published',
        publishedAt: new Date('2023-02-05'),
        featuredImageUrl: '/images/blog/automation.svg',
        categoryId: savedCategories[3].id,
        authorId: author2.id
      },
      {
        title: 'Ciberseguridad en Entornos Industriales',
        excerpt: 'Proteja sus operaciones industriales contra amenazas cibernéticas con estas estrategias efectivas.',
        content: `
          <p>La ciberseguridad se ha convertido en una preocupación crítica para los entornos industriales, especialmente con la creciente interconexión de sistemas y la adopción de tecnologías IoT. Este artículo presenta estrategias efectivas para proteger sus operaciones industriales contra amenazas cibernéticas.</p>
          
          <h2>Desafíos Únicos de la Ciberseguridad Industrial</h2>
          
          <p>Los entornos industriales enfrentan desafíos de seguridad específicos:</p>
          
          <ul>
            <li><strong>Sistemas heredados:</strong> Muchos equipos industriales utilizan sistemas operativos obsoletos.</li>
            <li><strong>Disponibilidad constante:</strong> Los sistemas industriales a menudo no pueden permitirse tiempo de inactividad para actualizaciones.</li>
            <li><strong>Convergencia IT/OT:</strong> La integración de tecnologías de información y operaciones crea nuevas vulnerabilidades.</li>
            <li><strong>Consecuencias físicas:</strong> Un ataque puede resultar en daños físicos o riesgos de seguridad.</li>
          </ul>
          
          <h2>Estrategias de Protección</h2>
          
          <p>Para fortalecer la seguridad en entornos industriales, considere estas estrategias:</p>
          
          <ol>
            <li><strong>Segmentación de red:</strong> Aísle los sistemas críticos en zonas de red separadas.</li>
            <li><strong>Monitoreo continuo:</strong> Implemente sistemas de detección de intrusiones especializados para entornos industriales.</li>
            <li><strong>Evaluaciones regulares:</strong> Realice evaluaciones de vulnerabilidad específicas para sistemas industriales.</li>
            <li><strong>Actualizaciones seguras:</strong> Establezca procesos para actualizar sistemas de manera segura sin interrumpir operaciones.</li>
            <li><strong>Capacitación del personal:</strong> Eduque a los empleados sobre amenazas específicas para entornos industriales.</li>
          </ol>
        `,
        status: 'published',
        publishedAt: new Date('2023-01-20'),
        featuredImageUrl: '/images/blog/cybersecurity.svg',
        categoryId: savedCategories[4].id,
        authorId: author1.id
      },
      {
        title: 'Analítica de Datos para Optimizar Operaciones',
        excerpt: 'Cómo utilizar la analítica de datos para identificar oportunidades de mejora en sus procesos industriales.',
        content: `
          <p>La analítica de datos se ha convertido en una herramienta indispensable para optimizar operaciones industriales. Este artículo explora cómo puede utilizar la analítica para identificar oportunidades de mejora y tomar decisiones basadas en datos.</p>
          
          <h2>El Poder de los Datos en la Industria</h2>
          
          <p>Las plantas industriales modernas generan cantidades enormes de datos que, cuando se analizan adecuadamente, pueden proporcionar información valiosa para:</p>
          
          <ul>
            <li><strong>Identificar ineficiencias:</strong> Detecte cuellos de botella y procesos subóptimos.</li>
            <li><strong>Predecir mantenimiento:</strong> Anticipe fallos de equipos antes de que ocurran.</li>
            <li><strong>Optimizar consumo energético:</strong> Identifique oportunidades para reducir el consumo de energía.</li>
            <li><strong>Mejorar la calidad:</strong> Correlacione parámetros de proceso con resultados de calidad.</li>
            <li><strong>Reducir desperdicios:</strong> Minimice el desperdicio de material y recursos.</li>
          </ul>
          
          <h2>Implementando Analítica Industrial</h2>
          
          <p>Para implementar analítica de datos de manera efectiva en su entorno industrial, siga estos pasos:</p>
          
          <ol>
            <li><strong>Defina objetivos claros:</strong> Identifique qué problemas específicos quiere resolver con analítica.</li>
            <li><strong>Recopile los datos correctos:</strong> Asegúrese de capturar datos relevantes para sus objetivos.</li>
            <li><strong>Implemente la infraestructura adecuada:</strong> Utilice plataformas que puedan manejar datos industriales a escala.</li>
            <li><strong>Aplique técnicas analíticas apropiadas:</strong> Desde estadísticas básicas hasta machine learning avanzado.</li>
            <li><strong>Actúe sobre los insights:</strong> Implementar cambios basados en los hallazgos analíticos.</li>
          </ol>
        `,
        status: 'published',
        publishedAt: new Date('2023-01-10'),
        featuredImageUrl: '/images/blog/data-analytics.svg',
        categoryId: savedCategories[5].id,
        authorId: author2.id
      }
    ];

    const savedPosts: Post[] = [];

    for (const postData of posts) {
      const post = postRepository.create({
        ...postData,
        slug: slugify(postData.title)
      });
      const savedPost = await postRepository.save(post);
      savedPosts.push(savedPost);
    }

    // Establecer posts relacionados
    // Para el primer post, relacionarlo con posts 2, 4 y 6
    savedPosts[0].relatedPosts = [savedPosts[1], savedPosts[3], savedPosts[5]];
    await postRepository.save(savedPosts[0]);

    // Para el segundo post, relacionarlo con posts 1, 3 y 5
    savedPosts[1].relatedPosts = [savedPosts[0], savedPosts[2], savedPosts[4]];
    await postRepository.save(savedPosts[1]);

    console.log('✅ Datos de prueba creados exitosamente');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error);
    throw error;
  }
};

// Ejecutar la función si este archivo se ejecuta directamente
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error durante el seed:', error);
      process.exit(1);
    });
} 
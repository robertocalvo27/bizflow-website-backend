import promClient from 'prom-client';
import logger from './logger';

// Crear el registro de métricas
const register = new promClient.Registry();

// Añadir métricas por defecto
promClient.collectDefaultMetrics({ register });

// Contador de solicitudes GraphQL por operación
const graphqlOperations = new promClient.Counter({
  name: 'graphql_operations_total',
  help: 'Total number of GraphQL operations',
  labelNames: ['operation', 'type'],
  registers: [register],
});

// Histograma de tiempos de respuesta GraphQL
const graphqlResponseTime = new promClient.Histogram({
  name: 'graphql_response_time_seconds',
  help: 'GraphQL operation response time in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

// Contador de errores
const errorCounter = new promClient.Counter({
  name: 'error_total',
  help: 'Total number of errors',
  labelNames: ['type'],
  registers: [register],
});

// Medidor de contenido automatizado
const automatedContentGauge = new promClient.Gauge({
  name: 'automated_content_total',
  help: 'Total number of automated content pieces',
  registers: [register],
});

// Histograma de puntuaciones de contenido
const contentScoreHistogram = new promClient.Histogram({
  name: 'content_score',
  help: 'Distribution of content scores',
  buckets: [0.2, 0.4, 0.6, 0.8, 1.0],
  registers: [register],
});

// Middleware para métricas de GraphQL
export const graphqlMetricsMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
  const start = Date.now();
  const operationName = info.operation.name?.value || 'anonymous';
  const operationType = info.operation.operation;

  try {
    // Incrementar contador de operaciones
    graphqlOperations.inc({ operation: operationName, type: operationType });

    // Resolver la operación
    const result = await resolve(root, args, context, info);

    // Registrar tiempo de respuesta
    const responseTime = (Date.now() - start) / 1000;
    graphqlResponseTime.observe({ operation: operationName }, responseTime);

    return result;
  } catch (error) {
    // Incrementar contador de errores
    errorCounter.inc({ type: 'graphql' });
    logger.error(`GraphQL Error in ${operationName}:`, error);
    throw error;
  }
};

export const metrics = {
  register,
  graphqlOperations,
  graphqlResponseTime,
  errorCounter,
  automatedContentGauge,
  contentScoreHistogram,
}; 
#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado. Por favor, instale Docker antes de continuar."
    exit 1
fi

# Iniciar servicios de Docker
log_info "Iniciando servicios de Docker (PostgreSQL + pgAdmin)..."
docker-compose up -d
if [ $? -ne 0 ]; then
    log_error "Error al iniciar los servicios de Docker. Verifique el archivo docker-compose.yml."
    exit 1
fi
log_success "Servicios de Docker iniciados correctamente."

# Esperar a que PostgreSQL esté listo (máximo 30 segundos)
log_info "Esperando a que PostgreSQL esté listo para aceptar conexiones..."
for i in {1..30}; do
    if docker exec -i $(docker ps -q -f name=postgres) pg_isready -U postgres > /dev/null 2>&1; then
        log_success "PostgreSQL está listo."
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Tiempo de espera agotado para PostgreSQL. Verifique el contenedor."
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Ejecutar migraciones y seed (si es necesario)
log_info "Verificando si es necesario ejecutar migraciones y seed..."
npm run setup
if [ $? -ne 0 ]; then
    log_warning "Ocurrió un problema durante la configuración inicial, pero continuaremos de todos modos."
fi

# Iniciar servidor API
log_info "Iniciando servidor API en modo desarrollo..."
npm run dev 
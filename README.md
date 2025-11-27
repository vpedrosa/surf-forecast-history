# Swell History

Aplicación web para consultar el historial de condiciones de surf de playas alrededor del mundo.

## Tecnologías

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Datos**: Procesamiento en memoria de archivos JSON
- **Mapas**: Leaflet + OpenStreetMap
- **Gestión de estado**: Zustand
- **Validación**: Zod
- **Testing**: Cypress (E2E)

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── beaches/           # Páginas de playas
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes de shadcn/ui
│   └── beaches/          # Componentes de playas
├── lib/                  # Utilidades y configuración
│   └── data-loader.ts    # Carga de datos JSON en memoria
├── stores/               # Stores de Zustand
└── types/                # Tipos TypeScript

data/
├── beaches.json                # 962 playas con coordenadas
├── wave-source-points.json     # Boyas de medición
└── {ID}-{TYPE}.json            # Datos de olas (height, period, direction)

cypress/
├── e2e/                  # Tests E2E
└── support/              # Configuración de Cypress
```

## Características

- **Búsqueda de playas**: Busca playas por nombre entre 962 playas disponibles
- **Listado completo**: Visualiza todas las playas con coordenadas y orientación
- **Mapa interactivo**: Ubicación de la playa en OpenStreetMap
- **Boya más cercana**: Encuentra automáticamente la boya de medición más cercana usando el algoritmo Haversine
- **Datos semanales**: Visualiza altura, período y dirección de olas organizados por semanas
- **Datos en tiempo real**: Procesa los datos directamente desde archivos JSON sin base de datos

## Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install --legacy-peer-deps
```

3. Ejecuta la aplicación:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm run format` - Formatea el código con Prettier
- `npm run format:check` - Verifica el formato del código
- `npm run cypress:open` - Abre Cypress en modo interactivo
- `npm run cypress:run` - Ejecuta tests de Cypress en modo headless
- `npm run test:e2e` - Ejecuta tests E2E completos

## Fuentes de Datos

### beaches.json
- 962 playas con coordenadas GPS y orientación
- Campos: name, latitude, longitude, orientation

### wave-source-points.json
- Boyas de medición de oleaje
- Información completa de cada boya incluyendo ubicación, profundidad, tipo de sensor

### Archivos de datos de olas
- Formato: `{ID}-{TYPE}.json` donde TYPE puede ser:
  - `height`: Altura de olas en metros
  - `period`: Período de olas en segundos
  - `direction`: Dirección de olas en grados
- Datos horarios con timestamps

## Algoritmos

### Haversine
Calcula la distancia entre dos puntos en una esfera (la Tierra) usando sus coordenadas de latitud y longitud. Se usa para encontrar la boya más cercana a cada playa.

### Agrupación Semanal
Los datos se agrupan por semanas (lunes a domingo) comenzando desde la semana actual, combinando información de altura, período y dirección de olas.

## Testing

Los tests E2E se ejecutan con Cypress y cubren:
- Navegación entre páginas
- Búsqueda de playas
- Visualización de datos
- Interacciones de usuario

## CI/CD

GitHub Actions ejecuta automáticamente:
- Linting (ESLint)
- Formato (Prettier)
- Build de la aplicación
- Tests E2E con Cypress

## Licencia

Ver archivo LICENSE

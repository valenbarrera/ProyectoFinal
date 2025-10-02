# Mapsur Panel

Frontend panel for Mapsur built with Node 10.23.0 (npm 6).

## Requisitos

- Node.js 10.23.0
- npm 6.x (incluido con Node 10)

## Instalación

```bash
cd mapsur_panel
npm ci   # o: npm install
```

## Desarrollo

- Iniciar en modo desarrollo con hot reload:
```bash
npm run start
```

- Acceder en el navegador a `http://localhost:8080` (o el puerto configurado por `webpack-dev-server`).

## Build de producción

```bash
npm run build
```
Los archivos generados se ubican en `build/`.

## Variables de entorno

- Ajusta endpoints y configuraciones en `src/` según corresponda.

## Versiones

- Node: 10.23.0
- npm: 6.x
- Dependencias: ver `package.json`


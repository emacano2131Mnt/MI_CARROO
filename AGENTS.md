# MiCarro

- Aplicación móvil React Native con Expo SDK 57, Expo Router y TypeScript estricto.
- Las rutas están en `src/app/`; conservar el enrutamiento generado por Expo.
- La persistencia de negocio usa SQLite mediante `expo-sqlite` y el módulo central `src/database/database.ts`.
- Interfaz y mensajes en español; mantener las validaciones de negocio en la capa de datos o utilidades compartidas.
- No introducir `any`, `@ts-ignore`, persistencia en memoria como fuente principal ni datos de demostración silenciosos.
- Antes de cambios grandes, inspeccionar la estructura actual. No borrar archivos de usuario o configuración sin motivo técnico.
- Si el prompt de inicio del proyecto está guardado dentro del repositorio, leerlo antes de continuar. El prompt original de esta tarea fue adjuntado fuera del repositorio.

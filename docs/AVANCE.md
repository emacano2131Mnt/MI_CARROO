# Avance MiCarro

## Base del proyecto

Aplicación móvil inicializada en la raíz con la plantilla oficial Expo `default@sdk-57`, que incluye Expo Router y TypeScript. Las rutas están en `src/app/` siguiendo la estructura de la plantilla. La persistencia se implementa con SQLite (`expo-sqlite`), base local `micarro.db`.

## Funcionalidades implementadas

- Inicio: total de vehículos activos, actividades con estado calculado desde fecha y odómetro, y cinco servicios recientes con costo; estado vacío con acceso al registro del primer vehículo.
- Vehículos: crear, consultar, editar, normalizar placa para impedir duplicados, seleccionar principal, archivar/reactivar conservando el historial. Campos opcionales: color, VIN, combustible y cilindraje.
- Kilometraje: guardar lecturas fechadas, consultar historial y confirmar explícitamente una lectura inferior a la anterior. La lectura actualiza el odómetro usado por los estados.
- Mantenimiento: crear y editar actividades por fecha y/o kilometraje, categorías sugeridas editables, márgenes de anticipación, periodicidad, estados Al día/Próxima/Vencida/Sin programación y pausa/reactivación.
- Historial: registrar servicio preventivo o correctivo con fecha, kilometraje, descripción, responsable opcional y desglose de costos. Calcula el total, rechaza fecha futura y costos negativos; completar una actividad periódica calcula el siguiente vencimiento desde el servicio real.
- Los cambios se guardan en SQLite y las pantallas recargan sus datos al enfocarse.

## Ejecución

```sh
npm start
npm run android
npm run ios
npx expo-doctor
npx tsc --noEmit
npm run lint
npm test
```

Escanea el QR de Expo con Expo Go compatible con SDK 57 o abre un emulador Android. iOS requiere macOS para ejecutar un simulador local.

## Verificación

- `npx expo-doctor`: 21/21 comprobaciones pasaron.
- `npx tsc --noEmit`: pasó.
- `npm run lint`: pasó.
- `npx expo start --localhost`: Metro inició; el bundle nativo Android de `expo-router/entry` respondió 200 (1.340 módulos).
- `npm test`: 4 pruebas unitarias pasaron para estados de actividades, anticipación, periodicidad, suma/rechazo de costos y fechas de servicio.
- No se ejecutó un emulador/dispositivo. Por eso quedan pendientes las operaciones manuales y comprobar persistencia tras cerrar y reabrir la app.
- La primera solicitud accidental al bundle web no pudo resolver el módulo WASM de SQLite. El objetivo y la verificación de este avance son móviles; no se afirma que la variante web funcione.
- npm reportó 21 vulnerabilidades transitivas al instalar dependencias (3 moderadas y 18 altas). No se ejecutó `npm audit fix` porque no se evaluó la compatibilidad de cambios automáticos con Expo SDK.

## Pendiente

- Comprobar el flujo completo en Expo Go o emulador, incluida persistencia entre aperturas.
- Añadir pruebas de integración para los repositorios SQLite; las reglas de negocio ya cuentan con pruebas unitarias.
- Permitir configuración de categorías desde una pantalla propia y más filtros del historial.
- Requisitos RF-01 a RF-40 fuera de las cinco áreas de este avance.
- Revisar los avisos de seguridad reportados por npm durante la instalación antes de preparar una entrega final.

## Actualización — operaciones de mantenimiento e historial

- El plan permite eliminar una actividad con confirmación cuando no tiene servicios vinculados. La capa SQLite comprueba el historial dentro de una transacción y rechaza el borrado si hay registros asociados.
- El historial permite seleccionar vehículos activos y archivados, consultar solo sus servicios en orden cronológico, editar un registro sin duplicarlo y eliminarlo con confirmación.
- Las operaciones de servicios guardan trazabilidad de cómo el servicio actualizó el odómetro y los próximos vencimientos. Al editar o eliminar un servicio nuevo, recalculan esos datos en una transacción y mantienen la integridad referencial.
- Se agregó migración aditiva para guardar esa trazabilidad. Los registros previos a la migración que no tienen procedencia reconstruible quedan protegidos: el sistema bloquea su borrado y los cambios de odómetro/vínculo que podrían alterar datos existentes. Las actividades con servicios no permiten editar fecha/km/periodicidad; sus campos descriptivos permanecen editables.
- No hay sistema de notificaciones locales/remotas en el proyecto, así que no existe una notificación pendiente de cancelar al borrar actividad.
- `tests/database-operations.test.ts` prueba con SQLite en memoria la eliminación permitida/rechazada de actividades, edición sin duplicados, eliminación y recálculo, filtrado/orden del historial, inclusión de vehículos archivados y bloqueo seguro de datos antiguos.
- Verificación de esta entrega: `npm test` (9/9), `npx tsc --noEmit`, `npm run lint` y `npx expo-doctor`. Las pruebas de interfaz de confirmación y selección en un dispositivo siguen pendientes.

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

## Actualización — formulario y validaciones de vehículos

- El formulario usa selectores locales para subtipo, marca y modelo. Las marcas se filtran por clase general (carro/motocicleta); los modelos se filtran por marca y subtipo y pueden buscarse. Tipo, marca y modelo no aceptan texto libre. La línea/versión se conserva como campo separado.
- El catálogo está en `src/constants/vehicle-catalog.ts`, funciona sin red y contiene una selección curada/no exhaustiva de modelos consultados en sitios oficiales e importadores. Las fuentes, fecha de consulta y límites históricos están en `docs/FUENTES_CATALOGO_VEHICULOS.md`.
- Kilometraje inicial y lecturas aceptan enteros de 0 a 9.999.999; el cilindraje es opcional y acepta enteros positivos hasta 99.999 cc. Los campos filtran pegados y caracteres inválidos; la capa SQLite vuelve a validar.
- La placa se normaliza a mayúsculas y sin espacios; carro usa 3 letras + 3 números y moto 3 letras + 2 números, con una letra final adicional conforme a la Resolución 4923 de 1994 cuando aplique. La consulta normativa y sus fuentes se documentan junto al catálogo. SQLite conserva la unicidad al crear y editar.
- La migración añade clase general/subtipo e identificadores de catálogo sin cambiar campos de identidad existentes. Los datos antiguos fuera del catálogo permanecen visibles y pueden guardarse sin alterar tipo, marca, modelo o placa. Se muestran como referencias históricas y no se ofrecen para nuevos registros.
- El tema central ahora usa texto principal y secundario de alto contraste en ambos modos, superficies de selector adaptadas al tema y colores legibles para campos, error, selección y navegación. La preferencia claro/oscuro/automático sigue almacenándose en el proveedor existente.
- Navegación móvil y web muestran emojis centrados encima de las etiquetas y conservan las seis rutas existentes.
- `tests/vehicle-rules.test.ts` cubre límites numéricos, catálogos/compatibilidad, placas, datos antiguos, migración SQLite, contraste de paletas y metadatos/rutas de navegación.
- Verificación de esta entrega: `npm test` (23/23), `npx tsc --noEmit`, `npm run lint` y `npx expo-doctor` (resultado registrado al finalizar). No se ejecutó en Expo Go, emulador o dispositivo; por ello siguen pendientes las comprobaciones visuales/táctiles descritas abajo.

### Comprobación manual pendiente

En Expo Go abre **Vehículos** con el tema claro y luego con el oscuro. Abre cada selector y cancélalo para confirmar que no cambia el formulario; busca marcas/modelos y cambia tipo y marca para verificar que se limpia un modelo incompatible. Pega un kilometraje de 8 dígitos, un cilindraje de 6 dígitos y placas con letras/números en posiciones incorrectas: los valores deben cortarse, mostrar el error y no guardarse hasta corregirlos. Prueba `ABC123`, `ABC12` y `ABC12D`, además de intentar repetir la placa de otro vehículo y editar el propio sin duplicarlo. Edita un registro antiguo fuera del catálogo sin cambiar su identidad y confirma que sigue mostrándose. Verifica que emojis estén encima de etiquetas en las seis pestañas, que éstas no se recorten y que Ajustes conserve el tema elegido tras cerrar y reabrir la app.

## Actualización — operaciones de mantenimiento e historial

- El plan permite eliminar una actividad con confirmación cuando no tiene servicios vinculados. La capa SQLite comprueba el historial dentro de una transacción y rechaza el borrado si hay registros asociados.
- El historial permite seleccionar vehículos activos y archivados, consultar solo sus servicios en orden cronológico, editar un registro sin duplicarlo y eliminarlo con confirmación.
- Las operaciones de servicios guardan trazabilidad de cómo el servicio actualizó el odómetro y los próximos vencimientos. Al editar o eliminar un servicio nuevo, recalculan esos datos en una transacción y mantienen la integridad referencial.
- Se agregó migración aditiva para guardar esa trazabilidad. Los registros previos a la migración que no tienen procedencia reconstruible quedan protegidos: el sistema bloquea su borrado y los cambios de odómetro/vínculo que podrían alterar datos existentes. Las actividades con servicios no permiten editar fecha/km/periodicidad; sus campos descriptivos permanecen editables.
- No hay sistema de notificaciones locales/remotas en el proyecto, así que no existe una notificación pendiente de cancelar al borrar actividad.
- `tests/database-operations.test.ts` prueba con SQLite en memoria la eliminación permitida/rechazada de actividades, edición sin duplicados, eliminación y recálculo, filtrado/orden del historial, inclusión de vehículos archivados y bloqueo seguro de datos antiguos.
- Verificación de esta entrega: `npm test` (9/9), `npx tsc --noEmit`, `npm run lint` y `npx expo-doctor`. Las pruebas de interfaz de confirmación y selección en un dispositivo siguen pendientes.

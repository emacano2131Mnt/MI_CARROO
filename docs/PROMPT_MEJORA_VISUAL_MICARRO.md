# PROMPT PARA MEJORAR EL DISEÑO VISUAL DE MICARRO

## Objetivo

Mejora el diseño visual de la aplicación móvil **MiCarro** para que tenga una apariencia moderna, profesional, coherente y atractiva para una presentación académica. La aplicación ya tiene avances funcionales: primero inspecciona el código existente y luego mejora la interfaz sin romper ni sustituir las funciones que ya funcionan.

El proyecto está desarrollado con **React Native, TypeScript y Expo** en Visual Studio Code. Sigue las instrucciones del archivo `AGENTS.md` y respeta la estructura y las tecnologías que ya existen en el proyecto.

**La tarea de esta fase es mejorar la presentación visual y la experiencia de usuario. No reconstruyas el proyecto desde cero, no elimines funcionalidades existentes y no reemplaces lógica real por datos ficticios.**

## 1. Antes de modificar

1. Inspecciona las pantallas, componentes, rutas y estilos actuales.
2. Comprueba cómo está implementada la navegación inferior y cómo se relaciona con Expo Router.
3. Identifica los módulos que ya funcionan y conserva sus formularios, validaciones, almacenamiento, consultas y acciones.
4. Revisa las dependencias existentes. No instales una biblioteca de interfaz o iconos si puedes resolverlo de forma sencilla con los componentes y estilos actuales.
5. Crea un resumen breve de los cambios visuales que planeas realizar y después implementa los cambios directamente en el código. No te limites a dar instrucciones.

## 2. Dirección visual

Dale a MiCarro una identidad visual de aplicación automotriz moderna. Usa una interfaz clara, ordenada y de buena calidad, sin recargarla con demasiados colores ni efectos.

### Paleta sugerida

- Fondo general: gris muy claro, por ejemplo `#F4F6FA`.
- Superficies y tarjetas: blanco, por ejemplo `#FFFFFF`.
- Color principal: azul oscuro, por ejemplo `#17324D`.
- Color de acción: azul vivo, por ejemplo `#3478F6`.
- Color complementario: verde azulado, por ejemplo `#16A6A1`.
- Estado correcto: verde.
- Próximo vencimiento: ámbar.
- Vencido o error: rojo.
- Texto principal: gris oscuro; texto secundario: gris medio.

Centraliza los colores y estilos reutilizables en un tema o archivo de constantes existente. No repitas valores de color sin necesidad. Si ya existe un tema funcional, mejóralo en lugar de duplicarlo.

### Estilo general

- Utiliza tarjetas con bordes redondeados moderados, sombras muy sutiles y buen espacio interior.
- Mantén márgenes y espaciados consistentes.
- Establece jerarquía visual clara entre título de pantalla, subtítulo, métricas, secciones y acciones.
- Utiliza tamaños de texto legibles y pesos tipográficos coherentes.
- Los botones principales deben distinguirse claramente de las acciones secundarias.
- Los campos de formulario deben tener etiquetas visibles, bordes consistentes y mensajes de validación comprensibles.
- Los estados deben distinguirse por color y también por texto, no solo por color.
- Evita pantallas saturadas, demasiadas tarjetas pequeñas, degradados innecesarios, animaciones excesivas y elementos decorativos que dificulten el uso.
- La interfaz debe adaptarse a diferentes tamaños de pantalla y no mostrar texto cortado ni controles superpuestos.

## 3. Mejorar la pantalla de inicio

Transforma el inicio en un tablero visual útil, basado en los datos reales guardados por la aplicación.

Cuando haya información disponible, prioriza:

- Saludo o encabezado con el nombre **MiCarro** y una frase breve, como “Todo el mantenimiento bajo control”.
- Resumen de vehículos registrados.
- Cantidad de mantenimientos próximos y vencidos.
- Resumen de gastos recientes o del periodo que la aplicación ya soporte.
- Una sección de próximos mantenimientos.
- Una sección de actividad reciente.
- Acciones rápidas para registrar un vehículo, actualizar kilometraje y registrar un mantenimiento.

Utiliza tarjetas visualmente diferenciadas y una distribución fácil de leer.

No inventes cifras ni muestres valores ficticios como si fueran reales. Si todavía no hay datos, presenta un estado vacío atractivo, con una breve explicación y un botón funcional para empezar a registrar un vehículo.

Las métricas deben actualizarse al crear, editar o eliminar datos. No dupliques las reglas de negocio dentro de la pantalla: utiliza la lógica y los repositorios existentes.

## 4. Navegación inferior con emojis

**Implementa o mejora una barra de navegación inferior visible y fija, con emojis en las opciones de navegación**, integrada con el sistema de rutas real del proyecto.

Utiliza etiquetas claras y emojis como estos, adaptando los nombres a las pantallas que realmente existan:

- `🏠 Inicio`
- `🚗 Vehículos`
- `🛠️ Mantenimiento`
- `📋 Historial`
- `⚙️ Ajustes` (solo si existe esa pantalla o se implementa una pantalla funcional de ajustes).

Si el proyecto ya tiene una navegación inferior, modifícala en lugar de crear una segunda barra.

Requisitos de la barra:

1. Debe permanecer en la zona inferior de la aplicación, respetando las áreas seguras del dispositivo.
2. Cada opción debe navegar a una pantalla real mediante la configuración actual de Expo Router.
3. La opción seleccionada debe distinguirse visualmente mediante color, fondo o indicador activo.
4. Debe mostrar emoji y texto de forma legible; el emoji no debe sustituir una etiqueta comprensible.
5. No incluyas opciones que no funcionen. Si alguna pantalla todavía no existe, implementa una vista funcional mínima o no agregues esa opción hasta que esté lista.
6. La barra no debe tapar botones, formularios, listas ni contenido cuando se desplaza la pantalla.
7. Debe funcionar correctamente al abrir formularios, mostrar el teclado y cambiar entre pestañas.
8. Comprueba la navegación real de cada opción y conserva el historial o estado que deba persistir conforme al funcionamiento actual.
9. Utiliza emojis Unicode directamente en los rótulos. No instales una biblioteca de iconos únicamente para mostrar estos emojis.
10. Si Expo Router utiliza grupos de pestañas, respeta su estructura y las convenciones de `Tabs` que ya estén implementadas.

No uses enlaces ficticios, `onPress` vacíos ni botones que parezcan navegar pero no hagan nada.

## 5. Mejoras visuales por módulo

### Vehículos

- Mostrar cada vehículo en una tarjeta clara con placa destacada, marca, línea, modelo, año y kilometraje disponible.
- Diferenciar el vehículo principal con una etiqueta visible.
- Proporcionar acciones comprensibles para ver, editar, archivar o reactivar.
- Si no hay vehículos, mostrar un estado vacío con el botón funcional “Registrar vehículo”.
- Mantener las validaciones actuales, incluida la prevención de placas duplicadas.

### Kilometraje

- Mostrar el kilometraje actual de manera destacada.
- Presentar el historial de lecturas en una lista cronológica clara.
- Facilitar la identificación de la fecha y el valor de cada lectura.
- Conservar la advertencia cuando se ingresa un kilometraje inferior al registrado anteriormente.

### Plan de mantenimiento

- Utilizar tarjetas o filas legibles para cada actividad.
- Mostrar categoría, vehículo, vencimiento por fecha o kilometraje y estado.
- Distinguir “Al día”, “Próximo”, “Vencido” y “Sin programación” con etiquetas de color y texto.
- Mantener operativas las opciones existentes para crear, editar, pausar, reactivar y consultar actividades.

### Servicios e historial

- Mostrar fecha, tipo de servicio, vehículo, taller y costo total cuando esos datos existan.
- Organizar los registros cronológicamente.
- Presentar los costos con formato monetario coherente y legible.
- Facilitar el acceso a los detalles del servicio sin perder la asociación con el vehículo.

### Formularios y diálogos

- Organizar los campos por secciones si el formulario es largo.
- Usar etiquetas visibles, ayudas cortas y mensajes de error junto al campo correspondiente.
- Marcar de manera clara los campos obligatorios.
- Mantener los valores ingresados cuando haya un error de validación, siempre que sea seguro.
- Pedir confirmación antes de eliminar registros o realizar acciones irreversibles.
- Evitar diálogos innecesarios para acciones simples.

## 6. Componentes visuales reutilizables

Aprovecha los componentes existentes o crea componentes compartidos solo cuando sean útiles, por ejemplo:

- Encabezado de pantalla.
- Tarjeta de vehículo.
- Tarjeta de métrica.
- Etiqueta de estado.
- Botón principal y botón secundario.
- Campo de formulario.
- Estado vacío.
- Indicador de carga y mensaje de error.

No crees una gran biblioteca interna innecesaria. Mantén el código fácil de comprender y editar para estudiantes de quinto semestre.

## 7. Accesibilidad y experiencia de usuario

- Mantén contraste suficiente entre texto y fondo.
- Usa objetivos táctiles de tamaño cómodo.
- No dependas únicamente del color para informar estados.
- Proporciona etiquetas accesibles para controles interactivos.
- Conserva tamaños de texto legibles y la compatibilidad con lectores de pantalla.
- Evita que el teclado o la barra inferior cubran campos y botones importantes.
- Muestra mensajes claros para errores, cargas, listas vacías y operaciones completadas.
- Evita animaciones que ralenticen la aplicación o distraigan de las tareas principales.

## 8. Restricciones para proteger el proyecto

- No reconstruyas el proyecto desde cero.
- No cambies React Native, TypeScript, Expo ni Expo Router por otras tecnologías.
- No elimines archivos funcionales ni cambies la base de datos de forma incompatible.
- No modifiques las reglas de negocio para hacer más fácil la interfaz.
- No sustituyas información real por datos de prueba permanentes.
- No agregues pestañas que no naveguen a destinos reales.
- No hagas refactorizaciones grandes que no sean necesarias para el rediseño.
- No instales dependencias innecesarias. Si necesitas instalar alguna, explica por qué y comprueba que sea compatible con la versión actual de Expo.
- Mantén el diseño visual separado de la lógica de negocio cuando sea posible.
- Si una función está incompleta, no afirmes que está terminada por haber mejorado su apariencia.

## 9. Comprobaciones obligatorias

Después de los cambios:

1. Ejecuta `npx tsc --noEmit`.
2. Ejecuta `npx expo-doctor`.
3. Ejecuta las pruebas y el lint disponibles en `package.json`, si están configurados.
4. Arranca la aplicación y verifica las pantallas y la navegación cuando el entorno lo permita.
5. Comprueba que los formularios siguen guardando datos reales y que SQLite continúa funcionando.
6. Prueba cada opción de la barra inferior y confirma que abre la pantalla correspondiente.
7. Revisa que la barra inferior no tape el contenido en pantallas pequeñas ni cuando aparece el teclado.
8. Corrige los errores introducidos por los cambios visuales antes de finalizar.

No afirmes que una comprobación fue exitosa si no la ejecutaste. Si el entorno no permite probar algo, explica la limitación.

## 10. Entrega final

Trabaja directamente en los archivos del proyecto. No te limites a dar instrucciones o fragmentos de código.

Al finalizar, informa en español:

- Qué pantallas y componentes visuales mejoraste.
- Cómo quedó la navegación inferior y qué emojis utiliza.
- Qué archivos creaste o modificaste.
- Qué dependencias instalaste, si hubo alguna.
- Qué comprobaciones y pruebas ejecutaste y sus resultados.
- Qué aspectos visuales o funcionales siguen pendientes.
- Cómo ejecutar la aplicación para revisar los cambios.

**Prioridad final:** conservar todas las funciones existentes y elevar notablemente la calidad visual de MiCarro, con una interfaz moderna, organizada, coherente y presentable, y una barra inferior con emojis que permita navegar realmente entre las pantallas.

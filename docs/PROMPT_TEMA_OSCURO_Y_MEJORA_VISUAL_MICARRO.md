# PROMPT PARA CODEX — TEMA OSCURO Y REDISEÑO VISUAL DE MICARRO

## Contexto del proyecto

Estamos desarrollando **MiCarro**, una aplicación móvil para controlar vehículos y su mantenimiento, como proyecto final de estudiantes de quinto semestre de Ingeniería Informática. El proyecto utiliza React Native, TypeScript y Expo, y se trabaja desde Visual Studio Code.

Lee primero `AGENTS.md` y cualquier instrucción específica del proyecto. Después inspecciona el código actual, la navegación, los componentes visuales, las pantallas y el almacenamiento existente. Esta solicitud es una **mejora incremental de la interfaz**, no una reconstrucción del proyecto.

## Objetivo principal

Mejorar notablemente la apariencia de MiCarro para que se vea moderna, atractiva, coherente y profesional durante una demostración académica. Incorporar:

1. Un tema claro y un tema oscuro que el usuario pueda cambiar desde Ajustes.
2. Una identidad visual con más color, jerarquía visual y variedad de componentes.
3. Descripciones más claras y útiles en el inicio y en los módulos.
4. Una navegación inferior con emojis, nombres legibles y estado seleccionado bien visible.
5. Una experiencia consistente en todas las pantallas, conservando las funcionalidades existentes.

**No conviertas la aplicación en una maqueta.** No reemplaces datos reales por datos de ejemplo, no simules acciones y no elimines lógica funcional para facilitar el rediseño.

---

## 1. Antes de cambiar el código

1. Revisa la estructura real del proyecto y lee `package.json`, la configuración de Expo y TypeScript, la navegación y el tema actual.
2. Identifica las pantallas existentes y qué funciones ya están conectadas con la lógica y el almacenamiento.
3. Revisa los componentes y estilos reutilizables antes de crear otros nuevos.
4. Comprueba si ya existe un sistema de tema, una preferencia de apariencia o una biblioteca de iconos. Reutiliza lo que sirva.
5. No sobrescribas archivos completos sin necesidad. Mantén los cambios acotados y compatibles con la versión de Expo instalada.
6. No instales dependencias visuales nuevas sin justificar su necesidad y confirmar que sean compatibles con el proyecto actual.
7. Antes de finalizar, ejecuta las comprobaciones disponibles y corrige los errores introducidos por los cambios.

Si alguna pantalla todavía no está implementada, no inventes una funcionalidad completa solo para llenar espacio. Mejora la interfaz existente y deja claramente identificada cualquier función que siga pendiente.

## 2. Estilo visual general

Adopta una estética de **panel automotriz moderno, amigable y vibrante**. MiCarro debe sentirse como una aplicación real de gestión vehicular, no como el ejemplo predeterminado de Expo.

### Dirección de diseño

- Utiliza una jerarquía clara entre títulos, subtítulos, contenido y acciones.
- Aumenta la calidad visual mediante tarjetas, secciones, chips de estado, iconos o emojis pertinentes, separaciones y fondos diferenciados.
- Usa más color que en una interfaz básica, pero conserva el orden visual. No pintes todos los componentes con colores fuertes ni uses colores aleatorios.
- Emplea una paleta consistente con un color principal azul profundo o azul eléctrico, un acento turquesa/verde para acciones positivas, y colores ámbar y coral para próximos vencimientos y alertas. Puedes ajustar los tonos si el proyecto ya tiene una identidad visual coherente.
- Reserva el rojo/coral para errores o elementos urgentes; el ámbar para avisos; el verde/turquesa para estados favorables; y el azul para navegación y acciones principales.
- Usa bordes redondeados consistentes, sombras sutiles donde funcionen bien y suficiente espacio entre secciones.
- Evita saturar la interfaz con gradientes, sombras exageradas, animaciones o elementos decorativos sin propósito.
- Usa una tipografía legible, tamaños consistentes y buen contraste.
- Respeta áreas seguras del dispositivo, tamaños táctiles cómodos, pantallas pequeñas y la navegación del sistema.

No necesitas crear imágenes decorativas externas ni logos complejos. Prioriza que los componentes sean nativos, ligeros y funcionales.

## 3. Sistema de colores y temas

Crea o refactoriza un sistema centralizado de tokens de diseño para evitar colores escritos de forma diferente en cada pantalla. Usa la estructura de carpetas que ya exista; si es adecuado, organiza los tokens y la lógica del tema en un módulo reutilizable, por ejemplo:

- `src/constants/theme.ts` o el archivo de tema que ya tenga el proyecto.
- Un proveedor/contexto de tema compartido, si la arquitectura lo necesita.
- Hooks o utilidades tipadas para consultar los colores actuales.

No dupliques el sistema si ya existe una implementación equivalente.

Define como mínimo tokens para:

- Fondo general.
- Superficie de tarjetas y formularios.
- Superficie secundaria.
- Texto principal y secundario.
- Bordes y separadores.
- Color principal y sus variaciones.
- Acento positivo.
- Aviso, error y éxito.
- Fondo y texto de chips de estado.
- Barra de navegación inferior.
- Campo de formulario, placeholder y foco.

Todos los elementos visuales deben consultar estos tokens: pantalla de inicio, pantallas secundarias, tarjetas, formularios, modal, alertas, barra inferior, estados vacíos y mensajes de error.

### Tema claro

Debe tener fondos luminosos y superficies bien separadas, texto oscuro legible, tarjetas de contraste suave y acentos de color definidos.

### Tema oscuro

Debe tener fondos oscuros cómodos para la vista, superficies elevadas diferenciables, texto claro legible, bordes visibles sin exceso de brillo y los mismos colores semánticos adaptados para conservar contraste.

No te limites a cambiar el fondo y el color del texto. Cambia apropiadamente las superficies, campos, tarjetas, iconos, chips, separadores, barra inferior, modales y estados de cada pantalla.

### Accesibilidad del color

- Mantén contraste suficiente para el texto y los controles, idealmente equivalente a WCAG AA.
- No utilices únicamente el color para comunicar un estado: acompáñalo con texto y, cuando sea útil, un emoji o icono.
- Comprueba especialmente los placeholders, texto deshabilitado, etiquetas seleccionadas y avisos en tema oscuro.

## 4. Selector funcional de apariencia en Ajustes

Agrega a Ajustes una sección llamada **Apariencia** con tres opciones:

- **Claro** ☀️
- **Oscuro** 🌙
- **Automático del dispositivo** 📱

El modo automático debe respetar la preferencia de apariencia del sistema operativo. Claro y Oscuro deben forzar el tema elegido.

Requisitos de comportamiento:

1. El cambio de tema debe reflejarse inmediatamente en toda la aplicación, sin tener que cerrar y volver a abrir pantallas.
2. La elección debe guardarse de manera persistente y mantenerse después de cerrar y abrir la aplicación.
3. Al instalar por primera vez, usa el tema del dispositivo como valor inicial, salvo que el proyecto ya tenga una decisión coherente documentada.
4. Si el proyecto ya posee almacenamiento de preferencias, reutilízalo. Si no, elige una opción local compatible con la configuración real de Expo; no uses una variable temporal como única forma de persistencia.
5. Evita mantener estados de tema independientes en varias pantallas.
6. Los componentes nuevos y existentes deben consumir el mismo tema compartido.
7. Si se utiliza un proveedor/contexto, colócalo en el nivel apropiado de la aplicación para que abarque las rutas de Expo Router.
8. No cambies la lógica de negocio ni el contenido almacenado por cambiar de tema.

La sección de Ajustes debe explicar de manera breve: “Personaliza la apariencia de MiCarro. El modo automático sigue la configuración de tu dispositivo”.

## 5. Mejorar la pantalla de inicio

Convierte el inicio en un panel informativo claro y visualmente atractivo, utilizando datos reales disponibles en el almacenamiento.

### Encabezado principal

Incluye el nombre **MiCarro**, un título útil, por ejemplo:

**“Todo el cuidado de tu vehículo, en un solo lugar.”**

Descripción propuesta:

“Organiza tus mantenimientos, controla el kilometraje y consulta los gastos de tus vehículos para tener todo al día.”

La descripción debe ser legible, breve y adaptarse al ancho del dispositivo.

### Tarjetas de resumen

Cuando los datos estén disponibles, presenta tarjetas que resumen:

- Vehículos registrados.
- Mantenimientos próximos.
- Mantenimientos vencidos.
- Gastos recientes del periodo disponible.

Usa un detalle de color o un icono/emojis pertinente por tarjeta. Los números deben calcularse usando los datos reales; no inventes cifras para que la pantalla parezca llena.

### Secciones del inicio

- **Próximos mantenimientos:** muestra actividad, vehículo y fecha o kilometraje del vencimiento.
- **Alertas importantes:** presenta los vencimientos que requieren atención, con etiquetas claras.
- **Actividad reciente:** muestra los últimos servicios reales, cuando existan.
- **Accesos rápidos:** botones para agregar vehículo, registrar kilometraje y crear un mantenimiento, pero solo si conducen a formularios que funcionen.

Si no hay datos, utiliza estados vacíos diseñados con icono/emojis, explicación breve y una acción útil. Ejemplo para vehículos vacíos: “Todavía no has agregado vehículos. Registra el primero para comenzar a organizar su mantenimiento”. El botón debe abrir el formulario real de registro.

Si la base de datos no está disponible temporalmente, presenta un mensaje claro y no reemplaces el contenido con estadísticas falsas.

## 6. Mejorar las tarjetas de vehículos

Cada tarjeta de vehículo debería mostrar de manera ordenada, según los datos existentes:

- Marca y línea.
- Placa con buena legibilidad.
- Modelo o año.
- Kilometraje actual.
- Estado general de los mantenimientos, si se puede calcular con datos reales.
- Indicador visual de vehículo principal, cuando corresponda.
- Acciones claras para consultar o editar.

Utiliza una franja de color, avatar con emoji de automóvil/motocicleta o un icono temático para diferenciar el tipo de vehículo. Evita utilizar fotografías ficticias como si pertenecieran al usuario.

Los botones de registrar, editar, archivar, reactivar y seleccionar como principal deben seguir ejecutando las funciones reales existentes. Las acciones destructivas deben solicitar confirmación.

Mejora el formulario para que las etiquetas estén claramente visibles, los campos opcionales estén diferenciados y los errores de validación se muestren junto al campo correspondiente o en un mensaje comprensible.

## 7. Mejorar la interfaz de mantenimientos y kilometraje

### Plan de mantenimiento

- Distingue visualmente los estados **Al día**, **Próximo**, **Vencido** y **Sin programación** con chips de color y texto.
- Muestra la causa del vencimiento: fecha, kilometraje o ambos, según corresponda.
- Organiza actividades en tarjetas fáciles de revisar.
- Incluye un botón visible para crear una actividad cuando esa función esté implementada.
- Explica brevemente qué debe registrar el usuario, sin repetir párrafos largos en cada pantalla.

Descripción sugerida:

“Programa los servicios de tu vehículo por fecha o kilometraje y consulta qué debes atender próximamente”.

### Kilometraje

- Presenta el último valor registrado de manera destacada.
- Muestra fecha y valor de las lecturas anteriores.
- Explica que registrar nuevas lecturas ayuda a recalcular los mantenimientos programados.
- Destaca las advertencias por lecturas inferiores sin utilizar mensajes alarmistas.

Descripción sugerida:

“Lleva el registro del odómetro para conservar un historial de uso y actualizar los vencimientos basados en kilometraje”.

## 8. Mejorar servicios, costos e historial

### Registro de servicios

Organiza el formulario en secciones fáciles de entender: información del servicio, taller, kilometraje y fecha, costos, repuestos y evidencias, según las funciones que realmente estén disponibles.

Muestra el total de costos en un área destacada, con una explicación de cómo se calcula. Los montos deben provenir del formulario y de la lógica existente.

### Historial

- Utiliza una lista cronológica con jerarquía visual.
- Separa claramente fecha, vehículo, tipo de servicio, descripción y costo.
- Cuando haya datos, permite identificar el taller y los repuestos asociados.
- Presenta un estado vacío útil si todavía no hay servicios registrados.
- Conserva búsqueda y filtros existentes, si están implementados.

Descripción sugerida:

“Consulta los trabajos realizados y revisa las fechas, los repuestos y los gastos asociados a cada vehículo”.

No inventes registros para completar la interfaz.

## 9. Mejorar la barra de navegación inferior con emojis

Inspecciona la navegación existente antes de modificarla. Conserva Expo Router y su configuración actual. No crees un segundo sistema de navegación si ya existe uno.

Si la navegación inferior ya tiene cinco destinos funcionales, utiliza etiquetas como estas:

- `🏠 Inicio`
- `🚗 Vehículos`
- `🛠️ Mantenimiento`
- `📋 Historial`
- `⚙️ Ajustes`

Si alguno de esos destinos todavía no está implementado, no lo conectes a una pantalla vacía que parezca terminada. Ajusta la navegación a los destinos reales y documenta lo pendiente.

Requisitos visuales:

- La pestaña activa debe distinguirse claramente mediante color, peso tipográfico, fondo o indicador; no solamente por el emoji.
- Las pestañas inactivas deben ser visibles, pero menos prominentes.
- Mantén un tamaño táctil cómodo, espacio entre icono/emoji y etiqueta, y soporte para distintos anchos de pantalla.
- Evita que las etiquetas se corten o se superpongan.
- Adapta el fondo, los bordes, el indicador activo y los textos al tema claro u oscuro.
- Respeta las áreas seguras en la parte inferior y no tapes el contenido desplazable.
- Conserva la navegación funcional con el sistema actual.
- Mantén etiquetas accesibles para lectores de pantalla; el emoji no debe sustituir el nombre textual del destino.

Si ya existe una biblioteca de iconos en el proyecto, puedes combinar un icono sencillo con el emoji solo cuando aporte valor. No agregues una biblioteca completa únicamente para este cambio.

## 10. Componentes reutilizables

Siempre que sea apropiado, crea o mejora componentes comunes para evitar estilos duplicados, por ejemplo:

- Tarjeta de resumen.
- Tarjeta de vehículo.
- Chip de estado.
- Botón principal y secundario.
- Campo de formulario.
- Estado vacío.
- Aviso de error, advertencia y éxito.
- Encabezado de sección.
- Selector de tema.

Usa el sistema de componentes que ya exista y evita crear múltiples componentes casi idénticos. Tipar las propiedades con TypeScript y definir variantes de forma clara.

## 11. Microtextos y descripciones

Revisa todos los textos visibles y mejora su claridad en español. Conserva los términos del proyecto y evita tecnicismos innecesarios para el usuario final.

Cada pantalla principal debería tener:

- Un título breve y específico.
- Una descripción de una o dos frases sobre su utilidad.
- Etiquetas claras en formularios.
- Instrucciones concisas donde haya una decisión que el usuario deba entender.
- Mensajes de éxito, error, confirmación y estado vacío cuando sean necesarios.

Evita descripciones genéricas como “Aquí puedes ver tus datos”. Indica qué datos se muestran y qué puede hacer el usuario. No sobrecargues las pantallas con largos bloques de texto.

Toda la interfaz debe permanecer en español y los textos deben seguir utilizando los recursos de texto del proyecto si ya existen.

## 12. Comportamiento y seguridad de los cambios

- Conserva la funcionalidad existente y los datos almacenados.
- No borres ni recrees la base de datos para aplicar el nuevo diseño.
- No reemplaces datos reales por información ficticia.
- No conviertas acciones reales en botones decorativos.
- No elimines rutas ni pantallas funcionales.
- Evita instalar dependencias innecesarias.
- No introduzcas errores de TypeScript ni problemas de navegación.
- Mantén la aplicación usable en pantallas móviles pequeñas.
- Si una función visual requiere una función de negocio que todavía no existe, no la simules: identifica la dependencia y déjala documentada.

## 13. Pruebas obligatorias después del rediseño

Realiza las verificaciones que el proyecto permita y reporta resultados reales:

1. Ejecuta el chequeo de TypeScript definido por el proyecto, por ejemplo `npx tsc --noEmit`, si corresponde a su configuración actual.
2. Ejecuta el diagnóstico de Expo con `npx expo-doctor`.
3. Corrige errores introducidos por los cambios.
4. Comprueba que cambiar entre Claro, Oscuro y Automático actualice todas las pantallas.
5. Cierra y vuelve a abrir la aplicación y verifica que la preferencia de tema permanezca guardada.
6. Prueba que cada destino de navegación abra la pantalla correspondiente.
7. Comprueba los botones principales y los formularios que hayan sido modificados.
8. Revisa la legibilidad y el contraste en ambos temas.
9. Verifica que el contenido pueda desplazarse y que la barra inferior no tape botones ni formularios.
10. No declares una prueba como exitosa si no la ejecutaste.

## 14. Informe final

Al terminar, responde en español con:

1. Resumen de los cambios visuales realizados.
2. Archivos creados o modificados.
3. Cómo funciona el selector de temas y dónde se guarda la preferencia.
4. Qué mejoras se hicieron en la navegación inferior.
5. Qué componentes, tarjetas, descripciones y estados vacíos se mejoraron.
6. Pruebas ejecutadas y resultados reales.
7. Errores restantes y limitaciones conocidas.
8. Funciones que no se tocaron para proteger la lógica existente.

Trabaja directamente sobre el proyecto actual. **No te limites a dar instrucciones o fragmentos para copiar manualmente: realiza los cambios en los archivos**, comprueba los resultados disponibles y explica lo realizado de forma comprensible para estudiantes de quinto semestre de Ingeniería Informática.

El resultado esperado es una MiCarro más atractiva, colorida, clara y consistente, con tema claro/oscuro funcional, navegación inferior con emojis y descripciones útiles, sin comprometer los módulos que ya funcionan.

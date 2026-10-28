# Fuentes y alcance del catálogo de vehículos

**Fecha de consulta:** 27 de octubre de 2026.  
**Archivo de datos:** `src/constants/vehicle-catalog.ts`.  
**Ejecución:** catálogo guardado localmente; el formulario no consulta Internet.

## Fuentes consultadas

### Carros y vehículos livianos

| Marca | Fuente oficial consultada | Uso |
|---|---|---|
| Chevrolet | [Vehículos nuevos Chevrolet Colombia](https://www.chevrolet.com.co/) y [fichas técnicas](https://www.chevrolet.com.co/fichas-tecnicas) | Onix, Spark EUV, Tracker, Captiva, Colorado, Montana, N400 y otros modelos listados por Chevrolet Colombia. |
| Kia | [Kia Colombia](https://kia.com.co/) | Picanto, Soluto, K3, K4, Cross, Stonic, Sonet, Seltos, Sportage, Sorento, Niro y Tasman visibles en su catálogo. |
| Toyota | [Vehículos Toyota Colombia](https://www.toyota.com.co/cotiza-tu-toyota/vehiculos-nuevos) | Yaris, Corolla, Corolla Cross, RAV4, Fortuner, Hilux, Prado, entre otros. |
| Volkswagen | [Modelos Volkswagen Colombia](https://www.volkswagen.co/modelos/nuestros-modelos) | Polo, Virtus, Tera, T-Cross, Tiguan, Nivus, Saveiro, Amarok, entre otros. |
| Renault | [Vehículos personales Renault Colombia](https://www.renault.com.co/vehiculos.html?version1=150) y [comunicación de Renault-Sofasa sobre modelos producidos localmente](https://cdn-prensa.renault.com.co/wp-content/uploads/2025/05/26104511/INICIA-LA-COMERCIALIZACION-EN-COLOMBIA-DEL-RENAULT-KWID.pdf) | Kwid, Logan, Duster, Kardian y referencias locales como Sandero y Stepway. |

### Motocicletas

| Marca | Fuente oficial o representante consultado | Uso |
|---|---|---|
| AKT | [AKT Motos Colombia](https://aktmotos.com/) | NKD, CR4, TTR, TT200 y referencias del catálogo nacional. |
| Bajaj | [Bajaj Colombia](https://www.bajajauto.com/es-co) | Boxer, Pulsar, Discover y Dominar listadas para Colombia. |
| Honda | [Portafolio Honda Motos Colombia, distribuidor oficial](https://hondamotos-colombia.com/portafolio) | CB, Dio, Navi, Wave, CG, XR y CBR presentes en el portafolio consultado. |
| Suzuki | [Motocicletas Suzuki Motor de Colombia](https://www.suzuki.com.co/motocicletas/lista) | GN, Burgman, DR, Viva y GSX listadas para el mercado local. |
| Yamaha | [Motocicletas Incolmotos Yamaha Colombia](https://www.incolmotos-yamaha.com.co/vehiculos/) | FZ, MT, NMAX, XTZ y Ténéré del catálogo del distribuidor oficial. |

## Criterio para placas colombianas

- Para automóviles y carros particulares se valida la serie usual de **tres letras y tres números** (`ABC123`). El Ministerio de Transporte recoge que la Resolución 10815 de 1988 estableció esa nomenclatura para automotores; véase su [concepto oficial de 7 de febrero de 2025](https://mintransporte.gov.co/info/mintransporte/media/anexos/gp3UTfp7.pdf), respuestas 3 y 4.
- Para motocicletas se admite la serie ordinaria **tres letras y dos números** (`ABC12`). La **Resolución 4923 del 27 de octubre de 1994** agregó, para rangos de organismos de tránsito agotados, una letra al final (`ABC12D`). El mismo concepto del Ministerio reproduce la regla y el patrón en su respuesta 1; la [Ley 769 de 2002, artículos 44–45](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5557) sitúa las reglas generales de placas bajo competencia del Ministerio.
- No se acepta el patrón de cuatro letras y dos números para moto.
- La validación de MiCarro comprueba la forma alfanumérica solicitada por el formulario; no sustituye la consulta de la licencia de tránsito ni comprueba por sí sola el servicio, color u otras series especiales.

## Alcance y limitaciones

El catálogo es **curado y no exhaustivo**. Incluye una selección de marcas y nombres de modelos publicados por fabricantes o representantes consultados en Colombia a la fecha indicada. Las páginas suelen destacar la oferta actual y no son catálogos históricos completos; no se afirma que todos los años o versiones antiguas estén cubiertos. El año se ingresa aparte y no se filtra por disponibilidad anual para no impedir vehículos antiguos razonables.

No se incluyen modelos cuya comercialización local no se pudo verificar en las fuentes consultadas. Para añadir o retirar una referencia se actualiza el módulo estructurado, se revisa la fuente oficial/importador y se registra la consulta en este documento; la app seguirá funcionando desconectada hasta que se distribuya la nueva versión.

Los vehículos existentes conservan sus valores originales en SQLite. La migración nueva agrega columnas para clase/subtipo e identificadores de catálogo, sin reescribir placa, marca, línea, modelo, kilometraje ni cilindraje. Sus valores se muestran en la lista y al editar; un valor histórico que no esté en el catálogo se presenta como guardado previamente y se permite guardar otros cambios si no se altera esa identidad. Para cambiar tipo, marca o modelo a otro valor, se elige una combinación del catálogo.

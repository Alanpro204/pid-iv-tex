# Informe técnico PID IV — Sistema de microtransacciones mediante plataformas de pago nacionales

Informe técnico de la asignatura **Proyecto Investigación y Desarrollo IV** (Disciplina: Práctica Profesional), Facultad de Tecnologías Interactivas, UCI.

- **Autor:** Alain Torres Rodríguez
- **Tutora:** MsC. Yadira Ramírez Rodríguez
- **Fecha:** La Habana, octubre de 2026

Este repositorio contiene el informe escrito en LaTeX, junto con un pequeño conjunto de macros propias (el "pseudo framework") que reproducen fielmente el formato del documento Word original y permiten generar tablas y diagramas a partir de archivos de datos.

---

## 1. Propósito de la tesis

### Problema

En Cuba existen plataformas de pago digitales (**Transfermóvil** y **EnZona**), pero los desarrolladores de aplicaciones y sitios web tienen grandes dificultades para integrarlas:

- Trámites burocráticos que pueden tardar semanas.
- Documentación pública escasa o deficiente y poca comunicación con la comunidad de desarrolladores.
- Restricción de las direcciones IP con acceso al servicio.
- Cada plataforma funciona de forma distinta, por lo que hay que implementar dos integraciones.

Como consecuencia, muchas ventas se cierran por WhatsApp, Telegram o Messenger, con pagos a cuentas personales no vinculadas a un TCP o a una empresa. Esto resta confianza al cliente y hace perder tiempo al vendedor.

### Objetivo general

> Brindar a los desarrolladores de software cubanos una plataforma segura, y con todas las características necesarias, para vender sus productos y/o servicios desde sus propias aplicaciones o sitios web.

### Hipótesis

Un sistema que integre las plataformas de pago nacionales, genere enlaces de pago y notifique la confirmación de las transacciones facilita la incorporación de microtransacciones en aplicaciones y sitios web cubanos.

### Solución propuesta

Un sistema web que actúa como **capa intermedia**. La aplicación del desarrollador se comunica con una única API común, y el sistema gestiona la operación con la plataforma de pago correspondiente y comunica el resultado.

Flujo de cobro:

1. La aplicación del desarrollador solicita al sistema, mediante su API, un **enlace de pago** para un producto registrado.
2. El cliente final abre el enlace y paga a través de la plataforma nacional elegida.
3. El sistema **confirma el resultado** con información validada de la plataforma y actualiza el estado de la transacción.
4. El sistema **notifica por webhook** a la aplicación, que entrega el producto o servicio. Las notificaciones incluyen autenticidad, reintentos y procesamiento idempotente (sin entregas duplicadas).

Actores del sistema: desarrollador, administrador, cliente final, aplicación del desarrollador (vía API) y el propio sistema. Se especifican **45 requisitos funcionales** (`tables/requisitos-funcionales.csv`).

### Tecnologías previstas

| Tecnología | Uso |
|---|---|
| Next.js | Interfaz y API en un mismo proyecto |
| PostgreSQL | Base de datos relacional, con integridad transaccional |
| Prisma ORM | Acceso tipado a datos y migraciones |
| Zod | Validación de entradas de la API y los webhooks |
| MinIO | Almacenamiento de objetos compatible con S3, autoalojable |

Arquitectura: patrón **Modelo-Vista-Controlador (MVC)**. El diagrama de paquetes está en `diagramas/mvc-paquetes.excalidraw`.

### Metodología

Enfoque iterativo e incremental. Métodos: analítico-sintético, modelación, revisión documental, entrevistas semiestructuradas y pruebas de software con matriz de casos de prueba.

### Estructura del informe

| Sección | Estado |
|---|---|
| Portada, Resumen, Abstract, Índice | Completo |
| Introducción | Completo |
| Capítulo I: Marco teórico y diagnóstico | Completo |
| Capítulo II: Necesidades del cliente y propuesta técnica | En curso (2.1 a 2.4 escritos; falta el resto del diseño de arquitectura) |
| Capítulo III: Base de datos, prototipos y codificación | Solo estructura |
| Conclusiones, Recomendaciones, Referencias, Anexos | Pendientes (texto de plantilla) |

---

## 2. El "pseudo framework" LaTeX

Todo vive en el preámbulo de `main.tex`. Su finalidad es doble: **replicar con exactitud el formato del `.docx` original** (medidas, interlineado, saltos de línea) y **separar el contenido de su maquetación** para tablas y diagramas.

### 2.1 Fidelidad con Word

- Papel Carta, márgenes laterales de 2 cm, interlineado 1,5 al estilo de Word (`1,5 × 1,15 × tamaño`).
- Fuente Arial. Con pdfLaTeX se usa Helvetica, que tiene las mismas métricas, y con LuaLaTeX/XeLaTeX se usa Arial real.
- Sin división silábica, y espacios justificados con el mismo límite de compresión que Word.
- Cada sección de Word tiene sus propios márgenes y encabezados, y se reproduce con `\seccion`.

### 2.2 Macros

| Macro | Descripción |
|---|---|
| `\seccion{sup}{sep.enc}{inf}{sep.pie}{primera línea}` | Equivale a una sección de Word: cambia márgenes superior/inferior, separación de encabezado y pie, y `\topskip`. |
| `\tituloI{Texto}` | Estilo *Título 1*: Arial 14 negrita en versalitas, siempre en página nueva y añadido al índice. `\tituloI*{...}` desactiva las versalitas y `\tituloI[sangría]{...}` aplica una sangría (la usa "Anexos"). |
| `\tituloII{Texto}` | Estilo *Título 2*: Arial 12 negrita, añadido al índice como subapartado. |
| `\vacio` | Párrafo vacío de Word (una línea en blanco). |
| `\versalitas{texto}` | Versalitas sintéticas como las genera Word (minúsculas al 80 %). |
| `\diagrama{nombre}{Título}` | Inserta `diagramas/dist/nombre.png` con numeración "Figura N." y etiqueta `fig:nombre`. |
| `\tabla{nombre}{Título}{anchos}` | Genera una tabla desde `tables/nombre.csv`, con numeración "Tabla N." y etiqueta `tab:nombre`. |
| `\indiceGeneral` | Imprime el índice con los estilos *TDC 1* y *TDC 2* de Word. |

Estilos de página: `informe` (encabezado con el título de la sección y pie con el número de página) y `portada` (sin encabezado ni pie). El texto del encabezado se cambia con `\renewcommand\textoEncabezado{...}`.

### 2.3 Tablas desde CSV

Las tablas se definen en `tables/*.csv` y se insertan con una sola línea:

```latex
\tabla{requisitos-funcionales}{Requisitos funcionales del sistema.}{1.35cm,3.4cm,2.3cm,6.8cm,1.5cm}
```

Reglas:

- Separador: **punto y coma** (`;`).
- La primera fila es el encabezado, que se repite en cada página (usa `longtable`).
- Los anchos son una dimensión por columna, separadas por comas.
- Se cita con `Tabla~\ref{tab:nombre}`.
- Evitar en las celdas `% & _ \ $` y el punto y coma.

Requiere el paquete `csvsimple-l3`.

### 2.4 Diagramas con Excalidraw

Los diagramas se dibujan en [Excalidraw](https://excalidraw.com), se guardan en `diagramas/nombre.excalidraw` y se exportan a PNG en `diagramas/dist/nombre.png`. Después se insertan en el documento:

```latex
\diagrama{mvc-paquetes}{Diagrama de paquetes de la arquitectura MVC del sistema.}
% referencia: Figura~\ref{fig:mvc-paquetes}
```

`package.json` define el script `npm run diagramas` para regenerar los PNG (dependencias: `@excalidraw/utils`, `@resvg/resvg-js` y `jsdom`). **Nota:** el script apunta a `diagramas/compilar.mjs`, que actualmente **no está en el repositorio**. Hasta que se añada, `diagramas/dist/mvc-paquetes.png` es el único PNG disponible y hay que exportarlo a mano desde Excalidraw si se modifica el diagrama.

---

## 3. Compilación

Requisitos: una distribución TeX con `latexmk`, `babel` (español), `csvsimple-l3`, `longtable`, `fancyhdr`, `enumitem`, `hyperref` y demás paquetes del preámbulo. Para instalar las dependencias de los diagramas hace falta Node.js.

```bash
# pdfLaTeX (usa Helvetica, mismas métricas que Arial)
latexmk -pdf main.tex

# LuaLaTeX (usa Arial y Times New Roman del sistema)
latexmk -lualatex main.tex

# Dependencias de los diagramas
npm install
```

El índice y las referencias cruzadas necesitan al menos dos pasadas, que `latexmk` hace automáticamente. El resultado es `main.pdf`.

## 4. Estructura del repositorio

```
.
├── main.tex                  # Documento completo: preámbulo (macros) + contenido
├── tables/
│   └── requisitos-funcionales.csv
├── diagramas/
│   ├── mvc-paquetes.excalidraw
│   └── dist/                 # PNG generados
├── imagenes/
│   └── logo.jpg              # Logotipo de la portada
├── Informe técnico PID IV Alain Torres Rodríguez.docx   # Documento Word original
├── package.json              # Script y dependencias de los diagramas
└── main.pdf                  # Salida compilada
```

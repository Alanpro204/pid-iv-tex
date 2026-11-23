// Convierte cada diagramas/*.excalidraw en diagramas/dist/*.png.
//
//   npm run diagramas                 -> todos los diagramas
//   npm run diagramas -- mvc-paquetes -> solo los indicados (sin extensión)
//
// Excalidraw genera un SVG (necesita un DOM, que aporta jsdom) y resvg lo
// rasteriza. Los PNG se insertan en main.tex con \diagrama{nombre}{Título}.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Resvg } from "@resvg/resvg-js";

// Anchura del PNG final en píxeles (a 17,6 cm de texto útil son ~455 ppp).
const ANCHO_PNG = 3150;
// Margen alrededor del dibujo, en unidades de Excalidraw.
const MARGEN = 20;

const carpeta = dirname(fileURLToPath(import.meta.url));
const salida = join(carpeta, "dist");

// exportToSvg usa document/window/DOMParser al ejecutarse, así que el DOM
// debe existir antes de importar la biblioteca.
const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
});
for (const clave of ["window", "document", "DOMParser", "XMLSerializer"]) {
  Object.defineProperty(globalThis, clave, {
    value: clave === "window" ? window : window[clave],
    configurable: true,
    writable: true,
  });
}
if (!globalThis.devicePixelRatio) globalThis.devicePixelRatio = 1;

const { exportScene } = await import("@excalidraw/utils");

async function compilar(nombre) {
  const origen = join(carpeta, `${nombre}.excalidraw`);
  const escena = JSON.parse(await readFile(origen, "utf8"));

  const svg = await exportScene({
    type: "svg",
    data: {
      elements: (escena.elements ?? []).filter((e) => !e.isDeleted),
      appState: {
        viewBackgroundColor: escena.appState?.viewBackgroundColor ?? "#ffffff",
      },
      files: escena.files ?? {},
    },
    config: {
      padding: MARGEN,
      canvasBackgroundColor: "#ffffff",
      // No se incrustan fuentes: resvg usa las del sistema.
      skipInliningFonts: true,
      environment: { document: window.document },
    },
  });

  const png = new Resvg(svg.outerHTML, {
    fitTo: { mode: "width", value: ANCHO_PNG },
    background: "#ffffff",
    font: {
      loadSystemFonts: true,
      // Excalidraw usa "Helvetica" (fontFamily 2); se sustituye por Arial.
      defaultFontFamily: "Arial",
      sansSerifFamily: "Arial",
    },
  })
    .render()
    .asPng();

  await mkdir(salida, { recursive: true });
  await writeFile(join(salida, `${nombre}.png`), png);
  console.log(`✔ diagramas/dist/${nombre}.png`);
}

const pedidos = process.argv.slice(2).map((a) => basename(a, ".excalidraw"));
const nombres = pedidos.length
  ? pedidos
  : (await readdir(carpeta))
      .filter((f) => f.endsWith(".excalidraw"))
      .map((f) => basename(f, ".excalidraw"));

if (!nombres.length) {
  console.error("No hay archivos .excalidraw en diagramas/");
  process.exit(1);
}

let fallos = 0;
for (const nombre of nombres) {
  try {
    await compilar(nombre);
  } catch (error) {
    fallos++;
    console.error(`✘ ${nombre}: ${error.message}`);
  }
}
process.exit(fallos ? 1 : 0);

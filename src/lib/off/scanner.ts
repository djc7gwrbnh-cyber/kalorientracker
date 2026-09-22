export interface DetectedBarcode {
  rawValue: string;
}

export interface BarcodeReader {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

/** Barcodes, die auf Lebensmittelverpackungen vorkommen. */
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] as const;

let pending: Promise<BarcodeReader> | null = null;

/**
 * Laedt den Barcode-Leser erst beim ersten Scan. Safari kennt die
 * BarcodeDetector-API nicht, dort kommt eine WebAssembly-Variante zum
 * Einsatz – aus dem eigenen Verzeichnis, nicht von einem fremden CDN.
 */
export function loadBarcodeReader(): Promise<BarcodeReader> {
  pending ??= create();
  return pending;
}

async function create(): Promise<BarcodeReader> {
  const native = (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector as
    | (new (options: { formats: string[] }) => BarcodeReader)
    | undefined;

  if (native) {
    try {
      return new native({ formats: [...FORMATS] });
    } catch {
      // Kennt das Geraet die Formate nicht, geht es unten weiter.
    }
  }

  const [ponyfill, wasm] = await Promise.all([
    import('barcode-detector/ponyfill'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ]);

  ponyfill.setZXingModuleOverrides({ locateFile: () => wasm.default });
  return new ponyfill.BarcodeDetector({ formats: [...FORMATS] });
}

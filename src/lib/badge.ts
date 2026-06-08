/* ═══════════════════════════════════════════
   Insignia de Progreso — generador de tarjeta SVG
   Estilo Apple Passbook / tarjeta VIP premium.
   Genera un SVG autocontenido (foto embebida + gráfica
   de descenso de peso cruzada con ganancia muscular)
   y lo descarga como imagen.
   ═══════════════════════════════════════════ */

interface WeightPoint {
  date: string;
  weight: number;
}

export interface BadgeData {
  name: string;
  photoUrl?: string;
  currentWeight: number;
  startWeight: number;
  streak: number;
  height?: number;
  bodyFat?: number;
  stage: string;
  weightHistory: WeightPoint[];
}

const W = 1000;
const H = 600;

async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function buildCurves(history: WeightPoint[]) {
  // Zona de gráfica
  const gx = 360;
  const gy = 250;
  const gw = 560;
  const gh = 230;

  const pts = history.length >= 2 ? history : [{ date: "", weight: 0 }, { date: "", weight: 0 }];
  const weights = pts.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const weightLine = pts
    .map((p, i) => {
      const x = gx + (i / (pts.length - 1)) * gw;
      const y = gy + gh - ((p.weight - min) / range) * gh;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Curva de masa muscular (modelo: inversa del peso, suavizada — ilustrativa)
  const muscleLine = pts
    .map((_, i) => {
      const x = gx + (i / (pts.length - 1)) * gw;
      const t = i / (pts.length - 1);
      const y = gy + gh - (0.2 + 0.65 * t) * gh;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return { weightLine, muscleLine, gx, gy, gw, gh };
}

function svgEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildBadgeSvg(data: BadgeData, photoDataUrl: string | null): string {
  const diff = data.currentWeight - data.startWeight;
  const diffStr = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`;
  const { weightLine, muscleLine, gx, gy, gw } = buildCurves(data.weightHistory);

  const photo = photoDataUrl
    ? `<clipPath id="pc"><rect x="56" y="180" width="240" height="300" rx="24"/></clipPath>
       <image href="${photoDataUrl}" x="56" y="180" width="240" height="300" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc)"/>
       <rect x="56" y="180" width="240" height="300" rx="24" fill="none" stroke="rgba(255,255,255,0.12)"/>`
    : `<rect x="56" y="180" width="240" height="300" rx="24" fill="#1C1C1E" stroke="rgba(255,255,255,0.10)"/>
       <text x="176" y="340" text-anchor="middle" font-size="20" fill="#8E8E93" font-family="-apple-system,Helvetica,Arial">Sin foto</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0C"/>
      <stop offset="100%" stop-color="#161618"/>
    </linearGradient>
    <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="40" fill="url(#bg)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="39" fill="none" stroke="rgba(255,255,255,0.06)"/>

  <!-- Marca -->
  <text x="56" y="84" font-size="22" letter-spacing="6" font-weight="600" fill="#FFFFFF">MYCOACH</text>
  <text x="56" y="116" font-size="15" letter-spacing="2" fill="#8E8E93">INSIGNIA DE PROGRESO</text>
  <text x="${W - 56}" y="92" text-anchor="end" font-size="16" fill="#E5E5EA">${svgEscape(data.stage)}</text>

  <!-- Foto -->
  ${photo}
  <text x="176" y="520" text-anchor="middle" font-size="22" font-weight="600" fill="#FFFFFF">${svgEscape(
    data.name.split(" ").slice(0, 2).join(" ")
  )}</text>

  <!-- Dato clave: peso -->
  <text x="360" y="180" font-size="16" letter-spacing="2" fill="#8E8E93">PESO ACTUAL</text>
  <text x="360" y="240" font-size="72" font-weight="700" fill="#FFFFFF">${data.currentWeight.toFixed(1)}<tspan font-size="28" fill="#8E8E93"> kg</tspan></text>
  <text x="360" y="240" dx="220" font-size="26" font-weight="600" fill="${diff <= 0 ? "#34C759" : "#0A84FF"}">${diffStr}</text>

  <!-- Gráfica -->
  <polygon points="${gx},${gy + 230} ${weightLine} ${gx + gw},${gy + 230}" fill="url(#wfill)"/>
  <polyline points="${weightLine}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="${muscleLine}" fill="none" stroke="#34C759" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>

  <!-- Leyenda -->
  <circle cx="${gx}" cy="510" r="5" fill="#FFFFFF"/><text x="${gx + 14}" y="515" font-size="15" fill="#E5E5EA">Peso</text>
  <circle cx="${gx + 120}" cy="510" r="5" fill="#34C759"/><text x="${gx + 134}" y="515" font-size="15" fill="#E5E5EA">Masa muscular</text>

  <!-- Métricas secundarias -->
  <g>
    <text x="${W - 56}" y="300" text-anchor="end" font-size="15" fill="#8E8E93">RACHA</text>
    <text x="${W - 56}" y="338" text-anchor="end" font-size="34" font-weight="700" fill="#FFFFFF">${data.streak}<tspan font-size="16" fill="#8E8E93"> días</tspan></text>

    <text x="${W - 56}" y="392" text-anchor="end" font-size="15" fill="#8E8E93">ESTATURA</text>
    <text x="${W - 56}" y="430" text-anchor="end" font-size="34" font-weight="700" fill="#FFFFFF">${
      data.height ?? "—"
    }<tspan font-size="16" fill="#8E8E93"> cm</tspan></text>

    <text x="${W - 56}" y="484" text-anchor="end" font-size="15" fill="#8E8E93">% GRASA</text>
    <text x="${W - 56}" y="522" text-anchor="end" font-size="34" font-weight="700" fill="#FFFFFF">${
      data.bodyFat ?? "—"
    }<tspan font-size="16" fill="#8E8E93"> %</tspan></text>
  </g>
</svg>`;
}

/** Genera y descarga la insignia como PNG (rasterizada desde el SVG). */
export async function downloadBadge(data: BadgeData) {
  const photoDataUrl = data.photoUrl ? await imageToDataUrl(data.photoUrl) : null;
  const svg = buildBadgeSvg(data, photoDataUrl);

  // Rasterizar a PNG vía canvas para máxima compatibilidad
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const filename = `insignia-${data.name.toLowerCase().replace(/\s+/g, "-")}`;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

    if (loaded) {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, W, H);
        const pngUrl = canvas.toDataURL("image/png");
        triggerDownload(pngUrl, `${filename}.png`);
        URL.revokeObjectURL(url);
        return;
      }
    }
  } catch {
    /* cae al SVG */
  }

  // Fallback: descargar el SVG vectorial
  triggerDownload(url, `${filename}.svg`, true);
}

function triggerDownload(href: string, filename: string, revoke = false) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1000);
}

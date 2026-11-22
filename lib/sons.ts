/**
 * Sons do quiz Kids gerados pelo próprio navegador (Web Audio API): não há arquivos
 * de áudio nem direitos autorais envolvidos.
 */

let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Classe) return null;
  contexto ??= new Classe();
  if (contexto.state === "suspended") void contexto.resume();
  return contexto;
}

function nota(ctx: AudioContext, frequencia: number, inicio: number, duracao: number, tipo: OscillatorType, volume = 0.18) {
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();
  osc.type = tipo;
  osc.frequency.value = frequencia;
  ganho.gain.setValueAtTime(0.0001, inicio);
  ganho.gain.exponentialRampToValueAtTime(volume, inicio + 0.02);
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  osc.connect(ganho).connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracao + 0.05);
}

/** Uma "palma": rajada curta de ruído filtrado. */
function palma(ctx: AudioContext, inicio: number) {
  const tamanho = Math.floor(ctx.sampleRate * 0.12);
  const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < tamanho; i++) dados[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tamanho, 3);
  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.frequency.value = 1400 + Math.random() * 600;
  filtro.Q.value = 0.9;
  const ganho = ctx.createGain();
  ganho.gain.value = 0.55;
  fonte.connect(filtro).connect(ganho).connect(ctx.destination);
  fonte.start(inicio);
}

/** Acerto: musiquinha alegre (dó–mi–sol–dó) seguida de palmas. */
export function tocarAcerto(): void {
  const ctx = obterContexto();
  if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(ctx, f, t + i * 0.11, 0.25, "triangle"));
  for (let i = 0; i < 8; i++) palma(ctx, t + 0.55 + i * 0.13 + Math.random() * 0.03);
}

/** Erro: som suave descendente ("ô-ôu"), sem ser assustador. */
export function tocarErro(): void {
  const ctx = obterContexto();
  if (!ctx) return;
  const t = ctx.currentTime;
  nota(ctx, 392, t, 0.22, "sine", 0.16);
  nota(ctx, 311.13, t + 0.2, 0.35, "sine", 0.16);
}

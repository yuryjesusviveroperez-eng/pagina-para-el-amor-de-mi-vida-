/* =========================================================
   NUESTRO UNIVERSO ❤️ — script.js
   Para Scarleth Rassel
   Organizado en módulos pequeños, sin lógica duplicada.
========================================================= */

'use strict';

/* =========================================================
   1. CONFIGURACIÓN Y ESTADO
========================================================= */
const CONFIG = {
  fechaInicio: new Date('2026-03-11T00:00:00'),
  storageKey: 'universo-scarleth-v1',
  version: '2026.08-mesversario',
  totalEstrellas: 260,
  intervaloFrase: 11000,
  intervaloEstrellaFugaz: 4500,
  clicksSecretosLuna: [3, 7, 13, 21, 34, 55, 89, 144, 233],
  hitosDias: [7, 30, 50, 100, 200, 365, 500, 730, 1000],
};

/* =========================================================
   CHAT EN VIVO — configuración de Firebase
   ---------------------------------------------------------
   El chat usa Firebase Firestore para sincronizar mensajes
   entre los dos dispositivos en tiempo real. Es gratis y toma
   unos 5 minutos de configuración:

   1. Entra a https://console.firebase.google.com y crea un
      proyecto nuevo (gratis, plan "Spark").
   2. Dentro del proyecto: "Compilación" → "Firestore Database"
      → "Crear base de datos" → modo producción (cualquier
      ubicación cercana está bien).
   3. En "Reglas" de Firestore, pega el contenido del archivo
      firestore.rules que viene con este proyecto y publícalo.
      NO uses "allow read, write: if true": eso deja el chat
      abierto a cualquiera que conozca el ID del proyecto.
      Las reglas nuevas solo aceptan mensajes con el formato
      correcto y tamaños razonables, no permiten editar ni
      borrar mensajes, y bloquean cualquier otra colección.
      Limitación honesta: sin inicio de sesión, lo que protege
      la sala es su código de 6 caracteres. Guárdalo en privado.

   4. En el ícono de engranaje → "Configuración del proyecto" →
      baja hasta "Tus apps" → ícono "</>" (web) → regístrala →
      copia el objeto firebaseConfig que te muestra.
   5. Pega esos valores aquí abajo, reemplazando los de ejemplo.

   Mientras esto no esté configurado, la sección de Chat muestra
   un aviso amable en vez de romperse.
========================================================= */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAJdtdxOpqS547YYFfloQHkLH5vaQeItpk',
  authDomain: 'chat-22212.firebaseapp.com',
  projectId: 'chat-22212',
  storageBucket: 'chat-22212.firebasestorage.app',
  messagingSenderId: '741791837961',
  appId: '1:741791837961:web:6980e99957fe790c022dd8',
};

const CANCIONES = [
  { fuentes: ['only.mp3', 'Only.mp3', 'only.m4a'], nombre: 'Only', autor: 'Lee Hi' },
  { fuentes: ['count-on-me.mp3', 'Count-On-Me.mp3', 'count-on-me.m4a'], nombre: 'Count On Me', autor: 'Bruno Mars' },
  { fuentes: ['its-you.mp3', 'Its-You.mp3', 'its-you.m4a'], nombre: "It's You", autor: 'Ali Gatie' },
  { fuentes: ['Amtrak.mp3', 'amtrak.mp3', 'amtrak.m4a'], nombre: 'Amtrak', autor: '—' },
];

/* ---------------------------------------------------------
   Búsqueda automática de archivos de audio
   Para agregar una canción nueva basta con una línea en
   CANCIONES usando el nombre base del archivo, por ejemplo:
     { base: 'mi-cancion', nombre: 'Mi canción', autor: 'Artista' }
   Se prueban solas las variantes de mayúsculas, guiones,
   espacios y extensiones (mp3, m4a, wav, ogg). Las entradas
   existentes no cambian: sus nombres exactos se prueban primero.
--------------------------------------------------------- */
const EXTENSIONES_AUDIO = ['mp3', 'm4a', 'wav', 'ogg'];

function variantesDeNombre(base) {
  const limpio = base.replace(/\.[a-z0-9]+$/i, '').trim();
  const palabras = limpio.toLowerCase().split(/[-_\s]+/).filter(Boolean);
  const capitalizadas = palabras.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  const formas = new Set([limpio]);
  ['-', '_', ' ', ''].forEach(sep => {
    formas.add(palabras.join(sep));
    formas.add(palabras.map(p => p.toUpperCase()).join(sep));
    formas.add(capitalizadas.join(sep));
  });
  return [...formas];
}

// Devuelve la lista de rutas a probar para una canción (en orden).
function fuentesDeCancion(c) {
  if (c.src) return [c.src]; // canción subida desde el dispositivo
  if (c._todas) return c._todas;
  const explicitas = c.fuentes || [];
  const base = c.base || explicitas[0] || '';
  const generadas = variantesDeNombre(base).flatMap(n => EXTENSIONES_AUDIO.map(e => `${n}.${e}`));
  c._todas = [...new Set([...explicitas, ...generadas])];
  return c._todas;
}

const defaultState = () => ({
  tema: 'universo',
  juegosGanados: { memoria: 0, atrapa: 0, aventura: 0, quien: 0, historia: 0 },
  records: {},
  aventura: { sala: 'sala', inventario: [], hallados: [], finalizada: false },
  preguntasQuien: null,
  sobresAbiertos: 0,
  recuerdosCalendario: [],
  lugares: [],
  citasGuardadas: [],
  cofreAbiertos: [],
  temasProbados: [],
  coralineBotones: [],
  coralinePuertaAbierta: false,
  amor: 0,
  retosNotificados: [],
  logrosDesbloqueados: [],
  cancionActual: 0,
  volumen: 70,
  lunaClicks: 0,
  secretosLunaVistos: [],
  constelacionesHechas: 0,
  modoDia: false,
  cartaAbierta: false,
  albumAbierto: false,
  historiaAbierta: false,
  cancionesEscuchadas: [],
  morseUsado: false,
  morseSecretoEncontrado: false,
  capsulas: [],
  rachaDias: 0,
  ultimaVisita: null,
  diaSorpresaVista: null,
  quizJugado: false,
  quizMejorPuntaje: 0,
  chatUsado: false,
  notasUsado: false,
  notas: [],
  gustosUsado: false,
  gustos: { ella: [], el: [] },
  claveCorazonEncontrada: false,
  curiosidadesLunaVistas: [],
  mesesCelebrados: [],
  estadisticoCurioso: false,
  ruletaUsada: false,
  piropos: [],
  animos: {},
  fotos: [],
  timelinePersonal: [],
  versionVista: '',
  reproductorAleatorio: false,
  reproductorRepetir: false,
  hitosCelebrados: [],
  cartaSecretaEncontrada: false,
  corazonSecretoClicks: 0,
  lluviaSecretaVista: false,
  sacudidaSecretaVista: false,
  rachaMaxima: 0,
});

let state = defaultState();

/* Guardado diferido: agrupa escrituras en localStorage (evita bloquear el
   hilo principal cuando hay eventos muy frecuentes, como arrastrar el
   volumen o tocar el botón de amor muchas veces seguidas). */
const Storage = {
  _pendiente: null,
  intentarGuardarInmediato() {
    if (this._pendiente) { clearTimeout(this._pendiente); this._pendiente = null; }
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
      return true;
    } catch (e) {
      return false; // por lo general, almacenamiento lleno
    }
  },
  guardarInmediato() {
    this.intentarGuardarInmediato();
  },
  guardar() {
    if (this._pendiente) clearTimeout(this._pendiente);
    this._pendiente = setTimeout(() => this.guardarInmediato(), 400);
  },
  cargar() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) state = Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { state = defaultState(); }
  },
};

/* Pausa efectos decorativos cuando la pestaña no es visible o cuando el
   sistema pide menos movimiento (ahorra batería y CPU). */
let pestanaOculta = false;
const prefiereMovimientoReducido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

document.addEventListener('visibilitychange', () => {
  pestanaOculta = document.hidden;
  if (pestanaOculta) Storage.guardarInmediato();
});
window.addEventListener('pagehide', () => Storage.guardarInmediato());

/* Botón de instalación (Android/desktop Chrome usa el prompt nativo;
   iOS no tiene ese evento, así que ahí mostramos instrucciones manuales). */
function esIOS() {
  return /iP(hone|od|ad)/.test(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
}
function esStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
}
window.promptInstalacionDiferido = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.promptInstalacionDiferido = e;
  const btn = document.getElementById('btn-instalar');
  if (btn) btn.classList.remove('oculto');
});
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('btn-instalar');
  if (btn) btn.classList.add('oculto');
  window.promptInstalacionDiferido = null;
});

function debounce(fn, espera) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

/* =========================================================
   2. FRASES ROMÁNTICAS
========================================================= */
const FRASES = [
  'Scarleth Rassel, eres mi lugar favorito.',
  'Cada día contigo vale la pena.',
  'Gracias por existir.',
  'Tu sonrisa ilumina mi universo entero.',
  'Nuestro amor hace que todo sea mejor.',
  'Si pudiera elegir otra vez, te elegiría a ti.',
  'Cada segundo contigo es un regalo.',
  'Te amo muchísimo.',
  'Contigo hasta lo simple se siente enorme.',
  'Eres la razón de mis mejores días.',
  'No necesito un cielo distinto si te tengo a ti.',
  'Cada estrella de este cielo tiene tu nombre.',
  'Eres mi calma y mi aventura al mismo tiempo.',
  'Contigo el tiempo se siente diferente, más bonito.',
  'Quiero construir contigo todos los días que faltan.',
  'Tu risa es mi sonido favorito del mundo.',
  'Eres la persona con la que quiero envejecer.',
  'Cada recuerdo contigo se vuelve especial.',
  'No hay universo lo bastante grande para todo lo que siento.',
  'Gracias por elegirme, todos los días.',
  'Eres mi hogar, sin importar el lugar.',
  'Te miro y se me olvida todo lo demás.',
  'Contigo hasta las noches difíciles se sienten más ligeras.',
  'Eres mi persona favorita, sin competencia.',
  'Amarte se siente como respirar: natural y necesario.',
  'Quiero ser tu lugar seguro siempre.',
  'Eres la mejor parte de mi historia.',
  'Contigo aprendí que el amor también es calma.',
  'Nunca pensé que alguien pudiera hacerme tan feliz.',
  'Tu forma de amar me inspira cada día.',
  'Quiero llenarte de motivos para sonreír.',
  'Eres mi razón favorita para creer en el amor.',
  'Contigo todo pesa menos y brilla más.',
  'Nada se compara con la paz que siento a tu lado.',
  'Eres poesía sin intentarlo.',
  'Quiero ser tu equipo en todo, siempre.',
  'Tu amor me hace mejor persona.',
  'Contigo cada plan pequeño se vuelve mi favorito.',
  'Eres la sorpresa más bonita que me dio la vida.',
  'Amo cómo se siente construir contigo.',
  'Te elijo hoy, mañana y todos los días después.',
  'Contigo aprendí el verdadero significado de "para siempre".',
  'Eres mi versión favorita de la felicidad.',
  'Cada detalle tuyo se volvió mi favorito.',
  'Quiero ser el motivo de tu sonrisa más bonita.',
  'Tu voz es mi refugio en cualquier día difícil.',
  'Contigo el amor se siente fácil y honesto.',
  'Eres el "sí" más bonito que me dio la vida.',
  'Nunca me cansaré de elegirte.',
  'Contigo hasta el silencio se siente cómodo.',
  'Eres mi persona favorita para hablar de todo y de nada.',
  'Amarte es la decisión más fácil que he tomado.',
  'Quiero acompañarte en cada capítulo que viene.',
  'Tu forma de ser me enamora un poco más cada día.',
  'Contigo cada "buenos días" se siente especial.',
  'Eres el motivo por el que creo en las cosas bonitas.',
  'Nada se siente tan bien como tu abrazo.',
  'Quiero seguir escribiendo esta historia contigo.',
  'Eres mi calma en medio de cualquier tormenta.',
  'Contigo todo se siente posible.',
  'Amo la forma en la que me miras.',
  'Eres la mejor parte de mis días, sin excepción.',
  'Quiero seguir sumando momentos contigo.',
  'Tu amor me sostiene incluso en los días grises.',
  'Contigo aprendí que el amor también se construye despacio.',
  'Eres mi persona, sin importar la distancia o el tiempo.',
  'Amo todo lo que somos cuando estamos juntos.',
  'Quiero seguir siendo tu razón para sonreír.',
  'Contigo cada día se siente como un buen comienzo.',
  'Eres la persona que hace que todo tenga sentido.',
  'Nunca dejaré de agradecer haberte encontrado.',
  'Contigo el amor no se siente complicado, se siente real.',
  'Eres mi lugar favorito para volver siempre.',
  'Amo pensar en todo lo que nos falta por vivir.',
  'Quiero seguir aprendiendo a amarte mejor cada día.',
  'Contigo todo lo cotidiano se vuelve bonito.',
  'Eres el motivo por el que este universo existe.',
  'Nada me hace más feliz que verte feliz.',
  'Contigo aprendí a creer en los "para siempre".',
  'Eres mi historia favorita, aún sin terminar.',
  'Amo cada versión de ti que he conocido.',
  'Quiero seguir sorprendiéndote toda la vida.',
  'Contigo el futuro no da miedo, da ilusión.',
  'Eres la persona con la que todo encaja.',
  'Amo lo simple que se siente quererte.',
  'Quiero ser tu compañero en cada meta que sueñes.',
  'Contigo cada "te amo" se siente nuevo.',
  'Eres el motivo por el que sonrío sin razón aparente.',
  'Nada compite con la paz de tenerte cerca.',
  'Contigo aprendí que el amor bonito sí existe.',
  'Eres mi persona favorita del universo entero.',
  'Amo todo lo que hemos construido hasta hoy.',
  'Quiero seguir escribiendo capítulos bonitos contigo.',
  'Contigo el amor se siente como llegar a casa.',
  'Eres la razón por la que este pequeño universo existe.',
  'Nunca voy a dejar de elegirte, Scarleth Rassel.',
  'Amo la manera en la que iluminas todo lo que tocas.',
  'Quiero seguir creciendo a tu lado, siempre.',
  'Contigo cada día se siente un poco más mágico.',
  'Eres, sin duda, mi persona favorita para siempre.',
  'Amarte es de las cosas más bonitas que me han pasado.',
  'Quiero seguir sumando estrellas a este cielo por ti.',
  'Contigo todo brilla un poco más.',
  'Eres mi razón favorita para creer en las cosas bonitas.',
  'Nunca me voy a cansar de decirte cuánto te amo.',
  'Contigo aprendí que el amor también es paciencia y calma.',
  'Eres mi persona, mi calma, mi lugar favorito.',
  'Amo todo lo que somos y todo lo que seremos.',
  'Quiero seguir construyendo este universo, contigo dentro.',
  'Contigo el amor se siente eterno.',
  'Eres el motivo más bonito de mis días.',
  'Nunca dejaré de agradecer que existas.',
  'Contigo todo tiene un poco más de magia.',
  'Eres mi persona favorita, hoy y siempre, Scarleth Rassel.',
];

let ultimaFraseIndex = -1;

/* =========================================================
   3. RETOS (100 metas de corazones)
========================================================= */
function generarRetos() {
  const retos = [];
  let valor = 1;
  while (retos.length < 100) {
    retos.push(valor);
    if (valor < 20) valor += 1;
    else if (valor < 100) valor += 5;
    else if (valor < 500) valor += 25;
    else if (valor < 2000) valor += 100;
    else if (valor < 10000) valor += 500;
    else valor += 2500;
  }
  return retos;
}
const RETOS = generarRetos();

/* =========================================================
   4. LOGROS
========================================================= */
const LOGROS = [
  { id: 'primer-corazon', icono: '❤️', nombre: 'Primer corazón', desc: 'Sumaste tu primer corazón.', check: s => s.amor >= 1 },
  { id: 'cien-corazones', icono: '💗', nombre: '100 corazones', desc: 'Ya son 100 razones para amarte.', check: s => s.amor >= 100 },
  { id: 'mil-corazones', icono: '💖', nombre: '1000 corazones', desc: 'Mil latidos guardados aquí.', check: s => s.amor >= 1000 },
  { id: 'diez-mil-corazones', icono: '👑', nombre: '10 000 corazones', desc: 'Un amor casi infinito.', check: s => s.amor >= 10000 },
  { id: 'primera-carta', icono: '💌', nombre: 'Primera carta', desc: 'Leíste la carta completa.', check: s => s.cartaAbierta },
  { id: 'primer-secreto', icono: '🌙', nombre: 'Primer secreto', desc: 'Descubriste un secreto de la luna.', check: s => s.secretosLunaVistos.length >= 1 },
  { id: 'luna-llena', icono: '🌕', nombre: 'Luna llena', desc: 'Encontraste todos los secretos de la luna.', check: s => s.secretosLunaVistos.length >= CONFIG.clicksSecretosLuna.length },
  { id: 'mitad-retos', icono: '🥈', nombre: 'A mitad de camino', desc: 'Cumpliste 50 de los 100 retos.', check: s => s.retosNotificados.length >= 50 },
  { id: 'todos-retos', icono: '🏆', nombre: 'Los 100 retos', desc: 'Completaste los 100 retos.', check: s => s.retosNotificados.length >= 100 },
  { id: 'constelacion', icono: '✨', nombre: 'Constelación propia', desc: 'Dibujaste una constelación tocando estrellas.', check: s => s.constelacionesHechas >= 1 },
  { id: 'dj-personal', icono: '🎧', nombre: 'DJ del universo', desc: 'Escuchaste completas las 4 canciones.', check: s => new Set(s.cancionesEscuchadas.filter(i => CANCIONES[i] && !CANCIONES[i].temporal)).size >= CANCIONES.filter(c => !c.temporal).length },
  { id: 'amanecer', icono: '🌅', nombre: 'Otro cielo', desc: 'Cambiaste el universo a modo día.', check: s => s.modoDia === true },
  { id: 'album-explorador', icono: '📸', nombre: 'Coleccionista', desc: 'Abriste nuestro álbum de recuerdos.', check: s => s.albumAbierto },
  { id: 'historia-conocida', icono: '📖', nombre: 'Nuestra historia', desc: 'Leíste nuestra línea del tiempo.', check: s => s.historiaAbierta },
  { id: 'amor-verdadero', icono: '💞', nombre: 'Amor verdadero', desc: 'Llegaste a 500 corazones.', check: s => s.amor >= 500 },
  { id: 'traductor-morse', icono: '🔤', nombre: 'Mensajero en morse', desc: 'Tradujiste tu primer mensaje en código morse.', check: s => s.morseUsado },
  { id: 'morse-secreto', icono: '💓', nombre: 'Mensaje descifrado', desc: 'Escribiste nuestro mensaje secreto en morse.', check: s => s.morseSecretoEncontrado },
  { id: 'primera-capsula', icono: '⏳', nombre: 'Mensajera del futuro', desc: 'Sellaste tu primera cápsula del tiempo.', check: s => s.capsulas.length >= 1 },
  { id: 'capsula-abierta', icono: '📬', nombre: 'Carta desde el pasado', desc: 'Abriste una cápsula del tiempo.', check: s => s.capsulas.some(c => c.abierta) },
  { id: 'racha-3', icono: '🔥', nombre: 'Costumbre bonita', desc: 'Volviste 3 días seguidos.', check: s => s.rachaDias >= 3 },
  { id: 'racha-7', icono: '🌠', nombre: 'Una semana entera', desc: 'Volviste 7 días seguidos.', check: s => s.rachaDias >= 7 },
  { id: 'quiz-jugado', icono: '🧠', nombre: 'Pusiste a prueba la memoria', desc: 'Jugaste el quiz de nosotros.', check: s => s.quizJugado },
  { id: 'quiz-perfecto', icono: '🥇', nombre: 'Nos conoces de memoria', desc: 'Respondiste todo el quiz sin fallar.', check: s => s.quizMejorPuntaje >= QUIZ_PREGUNTAS.length && QUIZ_PREGUNTAS.length > 0 },
  { id: 'primer-mensaje', icono: '💬', nombre: 'Primer mensaje', desc: 'Enviaste tu primer mensaje en el chat.', check: s => s.chatUsado },
  { id: 'primera-nota', icono: '📝', nombre: 'Primera nota', desc: 'Guardaron su primera nota juntos.', check: s => s.notasUsado },
  { id: 'nos-conocemos', icono: '💗', nombre: 'Nos conocemos', desc: 'Agregaron algo a la lista de gustos de cada uno.', check: s => s.gustosUsado },
  { id: 'clave-corazon', icono: '🔐', nombre: 'La clave del corazón', desc: 'Tocaste tres veces el corazón del título.', check: s => s.claveCorazonEncontrada },
  { id: 'curiosidad-luna', icono: '🌘', nombre: 'Más allá de la luna', desc: 'Mantuviste presionada la luna y encontraste algo más.', check: s => s.curiosidadesLunaVistas.length >= 1 },
  { id: 'estadistico-curioso', icono: '🧮', nombre: 'Estadístico curioso', desc: 'Descubriste cuántos latidos han pasado juntos.', check: s => s.estadisticoCurioso },
  { id: 'ruleta-girada', icono: '🎡', nombre: 'Indecisos resueltos', desc: 'Giraron la ruleta de citas por primera vez.', check: s => s.ruletaUsada },
  { id: 'frasco-piropos', icono: '🫙', nombre: 'El frasco de los piropos', desc: 'Guardaron su primer piropo en el frasco.', check: s => s.piropos.length >= 1 },
  { id: 'animo-registrado', icono: '🌈', nombre: '¿Cómo te sientes?', desc: 'Registraron su primer estado de ánimo.', check: s => Object.keys(s.animos).length >= 1 },
  { id: 'album-real', icono: '📷', nombre: 'Primer recuerdo guardado', desc: 'Subieron su primera foto real al álbum.', check: s => s.fotos.length >= 1 },
  { id: 'historia-ampliada', icono: '📖', nombre: 'Su propia historia', desc: 'Agregaron un momento propio a la línea de tiempo.', check: s => s.timelinePersonal.length >= 1 },
  { id: 'hito-100-dias', icono: '📅', nombre: '100 días juntos', desc: 'Llegaron a los 100 días desde el 11 de marzo.', check: s => s.hitosCelebrados.includes(100) },
  { id: 'hito-365-dias', icono: '🎂', nombre: 'Un año entero', desc: 'Un año completo construyendo este universo.', check: s => s.hitosCelebrados.includes(365) },
  { id: 'carta-secreta', icono: '💍', nombre: 'El secreto mejor guardado', desc: 'Encontraste la carta escondida en el corazón del final.', check: s => s.cartaSecretaEncontrada },
  { id: 'lluvia-secreta', icono: '🌠', nombre: 'Magia en tus manos', desc: 'Despertaste una lluvia de estrellas tocando la pantalla.', check: s => s.lluviaSecretaVista },
  { id: 'sacudida-secreta', icono: '📳', nombre: 'Sacúdelo un poco', desc: 'Descubriste qué pasa si agitas el teléfono.', check: s => s.sacudidaSecretaVista },

  { id: 'explorador-cielos', icono: '🎨', nombre: 'Explorador de cielos', desc: 'Probaste 2 temas visuales.', check: s => s.temasProbados.length >= 2 },
  { id: 'todos-los-cielos', icono: '🌈', nombre: 'Todos los cielos', desc: 'Probaste los 6 temas visuales.', check: s => s.temasProbados.length >= Object.keys(TEMAS).length },
  { id: 'costurera', icono: '🪡', nombre: 'Costurera de botones', desc: 'Encontraste 3 botones cosidos.', check: s => s.coralineBotones.length >= CORALINE_BOTONES_PARA_PUERTA },
  { id: 'al-otro-lado', icono: '🚪', nombre: 'Al otro lado', desc: 'Abriste la puerta pequeña.', check: s => s.coralinePuertaAbierta === true },
  { id: 'primer-juego', icono: '🕹️', nombre: 'Primera partida', desc: 'Terminaste tu primer juego del arcade.', check: s => Object.values(s.juegosGanados).some(v => v > 0) },
  { id: 'memoria-completa', icono: '🃏', nombre: 'Parejas completas', desc: 'Encontraste todas las parejas de la memoria.', check: s => s.juegosGanados.memoria >= 1 },
  { id: 'atrapa-100', icono: '💘', nombre: 'Cazadora de corazones', desc: 'Llegaste a 100 puntos atrapando corazones.', check: s => (s.records.atrapa || 0) >= 100 },
  { id: 'aventura-completa', icono: '🗝️', nombre: 'Del otro lado de la puerta', desc: 'Terminaste la puerta misteriosa.', check: s => s.juegosGanados.aventura >= 1 },
  { id: 'quien-conoce', icono: '🧠', nombre: 'Nos conocemos', desc: 'Terminaste el juego de preguntas.', check: s => s.juegosGanados.quien >= 1 },
  { id: 'historia-ordenada', icono: '📜', nombre: 'Historia en orden', desc: 'Ordenaste nuestra historia sin perderte.', check: s => s.juegosGanados.historia >= 1 },
  { id: 'primer-sobre', icono: '✉️', nombre: 'Carta sin prisa', desc: 'Abriste el sobre misterioso.', check: s => s.sobresAbiertos >= 1 },
  { id: 'calendario-3', icono: '🗓️', nombre: 'Días con historia', desc: 'Guardaste 3 recuerdos en el calendario.', check: s => s.recuerdosCalendario.length >= 3 },
  { id: 'mapa-3', icono: '🗺️', nombre: 'Viajeros del recuerdo', desc: 'Marcaste 3 lugares en nuestro mapa.', check: s => s.lugares.length >= 3 },
  { id: 'galeria-5', icono: '📷', nombre: 'Álbum que crece', desc: 'Subiste 5 fotos a la galería.', check: s => s.fotos.length >= 5 },
  { id: 'primera-cita', icono: '💫', nombre: 'Primera cita guardada', desc: 'Guardaste una cita para hacer juntos.', check: s => s.citasGuardadas.length >= 1 },
  { id: 'cofre-abierto', icono: '🧰', nombre: 'Cofre abierto', desc: 'Abriste tu primera recompensa del cofre.', check: s => s.cofreAbiertos.length >= 1 },
];

/* =========================================================
   5. REGALOS SECRETOS
========================================================= */
const REGALOS = [
  { id: 'regalo-1', titulo: 'Una promesa', requiere: s => s.amor >= 200,
    texto: 'Prometo seguir eligiéndote incluso en los días donde nada sale como esperamos. Este es solo el inicio.' },
  { id: 'regalo-2', titulo: 'Mitad del camino', requiere: s => s.retosNotificados.length >= 50,
    texto: 'Llegar hasta aquí ya dice mucho de lo que somos. Gracias por sumar cada corazón conmigo.' },
  { id: 'regalo-3', titulo: 'Estrellas con tu nombre', requiere: s => s.constelacionesHechas >= 1,
    texto: 'Ahora hay una constelación en este cielo que solo existe porque tú la tocaste. Es tuya.' },
  { id: 'regalo-final', titulo: 'El regalo final', requiere: s => s.retosNotificados.length >= 100,
    texto: 'Completaste los 100 retos. Este universo entero, con todo lo que tiene, es un pequeño reflejo de lo mucho que te amo, Scarleth Rassel.' },
  { id: 'regalo-morse', titulo: 'Nuestro código', requiere: s => s.morseSecretoEncontrado,
    texto: 'Ahora conoces nuestro pequeño código secreto. Úsalo cuando quieras decirme algo sin decirlo en voz alta.' },
  { id: 'regalo-racha', titulo: 'Siete días', requiere: s => s.rachaDias >= 7,
    texto: 'Volviste siete días seguidos a este pequeño universo. Eso también es una forma bonita de decir "te quiero".' },
  { id: 'regalo-clave', titulo: 'La clave del corazón', requiere: s => s.claveCorazonEncontrada,
    texto: 'Encontraste la clave escondida en el título. Este universo entero está lleno de detalles como este, esperando a que los descubras.' },
  { id: 'regalo-carta-secreta', titulo: 'Lo que estaba escondido', requiere: s => s.cartaSecretaEncontrada,
    texto: 'Encontraste la carta que escondí en el corazón de este pequeño universo. Ya sabes lo que significa. Revisa mi bolsillo ;)' },

  { id: 'regalo-coraline', titulo: 'Lo que hay al otro lado', requiere: s => s.coralinePuertaAbierta === true,
    texto: 'Al otro lado de la puerta pequeña siempre hay un jardín esperándote, con la luz encendida. Gracias por buscar cada botón.' },
  { id: 'regalo-arcade', titulo: 'Campeonas del arcade', requiere: s => Object.values(s.juegosGanados).reduce((a, b) => a + b, 0) >= 5,
    texto: 'Terminaste cinco partidas en nuestro arcade. Eres la mejor jugadora que conozco, y aún no perdemos nada.' },
];

/* =========================================================
   6. SECRETOS DE LA LUNA
========================================================= */
const SECRETOS_LUNA = [
  'Secreto 1: la primera vez que pensé en ti no pude dejar de sonreír.',
  'Secreto 2: guardo cada pequeño detalle que compartimos.',
  'Secreto 3: contigo hasta los días comunes se sienten especiales.',
  'Secreto 4: este universo tardó horas en construirse, pensando en ti todo el tiempo.',
  'Secreto 5: no existe una versión de mi futuro donde tú no estés.',
  'Secreto 6: eres, sin duda, el secreto mejor guardado de mi vida.',
  'Secreto 7: a veces reviso nuestras fotos solo para sonreír un rato.',
  'Secreto 8: cada vez que algo bueno me pasa, quiero contártelo a ti primero.',
  'Secreto 9: este pequeño universo va a seguir creciendo mientras tú quieras seguir aquí.',
];

/* Secreto extra: mantener presionada la luna (en vez de solo tocarla)
   revela una de estas curiosidades al azar, una por una. */
const CURIOSIDADES_LUNA = [
  '🌘 Curiosidad: probé cada botón de este sitio más de una vez para asegurarme de que todo te funcionara bien.',
  '🌘 Curiosidad: elegí cada canción de la playlist pensando en un momento distinto contigo.',
  '🌘 Curiosidad: este universo sigue creciendo — de vez en cuando le agrego algo nuevo, solo para ti.',
];

/* Ideas para la Ruleta de Citas */
const IDEAS_RULETA = [
  { icono: '🌅', texto: 'Vean juntos el amanecer o el atardecer desde algún lugar alto.' },
  { icono: '🍳', texto: 'Cocinen un platillo nuevo que ninguno de los dos haya probado hacer.' },
  { icono: '🎬', texto: 'Maratón de películas de su infancia, con snacks incluidos.' },
  { icono: '🚶', texto: 'Caminen sin rumbo fijo y dejen que el camino decida.' },
  { icono: '🎨', texto: 'Pinten o dibujen algo juntos, sin importar qué tan bien les quede.' },
  { icono: '📸', texto: 'Recreen la primera foto que se tomaron juntos.' },
  { icono: '🌌', texto: 'Salgan a ver las estrellas y busquen una constelación inventada por ustedes.' },
  { icono: '🎲', texto: 'Noche de juegos de mesa o cartas: el que pierda hace el desayuno.' },
  { icono: '📖', texto: 'Léanse un cuento en voz alta, cada uno con una voz distinta.' },
  { icono: '🍿', texto: 'Vean una película que el otro ama pero tú nunca has visto.' },
  { icono: '🚲', texto: 'Paseen por un lugar que nunca han visitado juntos.' },
  { icono: '💌', texto: 'Escríbanse una carta cada uno y ábranlas juntos al final del día.' },
  { icono: '🎧', texto: 'Hagan una playlist nueva: cada uno agrega 5 canciones sin decirle al otro cuáles.' },
  { icono: '🕯️', texto: 'Cena a la luz de las velas, aunque sea en casa.' },
];

/* =========================================================
   7. TIMELINE (edítalo con sus fechas reales)
========================================================= */
const TIMELINE = [
  { fecha: '11 de marzo', texto: 'Cuando todo comenzó.' },
  { fecha: 'Hoy', texto: 'Amándote más que ayer.' },
  { fecha: 'Futuro', texto: 'Todo lo que nos falta por vivir.' },
  // Agrega aquí más eventos importantes de su historia:
  // { fecha: '', texto: '' },
];

/* =========================================================
   8. FECHAS ESPECIALES (edítalas con fechas reales — mes es 1-12)
========================================================= */
const FECHAS_ESPECIALES = [
  { nombre: 'Nuestro aniversario', mes: 3, dia: 11, icono: '💞' },
  // Agrega cumpleaños u otras fechas importantes, por ejemplo:
  // { nombre: 'Cumpleaños de Scarleth', mes: 0, dia: 0, icono: '🎂' },
];

/* =========================================================
   9. SORPRESAS DIARIAS (una se muestra cada día distinto)
========================================================= */
const SORPRESAS_DIARIAS = [
  { icono: '☀️', texto: 'Hoy el universo amaneció un poco más bonito porque volviste.' },
  { icono: '🎁', texto: 'Sorpresa de hoy: un corazón extra, de regalo, sin que lo pidieras.' },
  { icono: '🌟', texto: 'De todas las personas del mundo, me alegra que sigas siendo tú la que vuelve aquí.' },
  { icono: '📻', texto: 'Dato del día: nuestra playlist suena mejor cuando tú la escuchas.' },
  { icono: '🌙', texto: 'La luna preguntó por ti otra vez. Le dije que ibas a venir hoy.' },
  { icono: '🍃', texto: 'Un pétalo más cayó hoy en este universo, solo para darte la bienvenida.' },
  { icono: '💌', texto: 'Si hoy necesitas una razón para sonreír, aquí tienes una: te amo.' },
  { icono: '✨', texto: 'Cada vez que vuelves, este pequeño universo se siente un poco más real.' },
  { icono: '🎶', texto: 'Hoy es buen día para escuchar una canción nuestra otra vez.' },
  { icono: '🔥', texto: 'Racha de días viéndonos aquí: sigue así, se siente bonito contarlos.' },
  { icono: '💫', texto: 'Gracias por convertir en costumbre algo que para mí es un regalo.' },
  { icono: '🕯️', texto: 'Hoy también cuenta. Cada día contigo, aunque sea aquí, cuenta.' },
];

/* =========================================================
   10. QUIZ "¿CUÁNTO SABES DE NOSOTROS?" (contenido editable)
========================================================= */
const QUIZ_PREGUNTAS = [
  {
    pregunta: '¿Cuántos corazones tiene el reto más grande del Medidor de Amor?',
    opciones: ['1 000', '5 000', '10 000'],
    correcta: 2,
  },
  {
    pregunta: '¿Cuántas canciones tiene nuestra playlist?',
    opciones: ['3', '4', '5'],
    correcta: 1,
  },
  {
    pregunta: '¿En qué fecha comenzó nuestra historia en este universo?',
    opciones: ['10 de marzo', '11 de marzo', '21 de marzo'],
    correcta: 1,
  },
  // Edita las siguientes con datos reales de su historia:
  {
    pregunta: '¿Cuál es nuestra canción favorita?',
    opciones: ['Only', 'Count On Me', "It's You"],
    correcta: 0,
  },
  {
    pregunta: '¿Cuántos secretos tiene la luna en total?',
    opciones: ['4', '6', '8'],
    correcta: 1,
  },
  // Agrega más preguntas personalizadas aquí:
  // { pregunta: '', opciones: ['', '', ''], correcta: 0 },
];

/* =========================================================
   11. CÓDIGO MORSE (texto ↔ morse, con luz y sonido)
========================================================= */
const MORSE_MAPA = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
};
const MORSE_INVERSA = Object.fromEntries(Object.entries(MORSE_MAPA).map(([letra, codigo]) => [codigo, letra]));
const FRASES_SECRETAS_MORSE = ['TE AMO', 'TEAMO', 'SCARLETH', 'SCARLETH RASSEL'];

function normalizarTexto(t) {
  return t.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function textoAMorse(texto) {
  return normalizarTexto(texto).split(' ').filter(Boolean).map(palabra =>
    [...palabra].map(letra => MORSE_MAPA[letra] || '').filter(Boolean).join(' ')
  ).join(' / ');
}

function morseATexto(morse) {
  return morse.trim().split(/\s*\/\s*/).filter(Boolean).map(palabra =>
    palabra.trim().split(/\s+/).map(codigo => MORSE_INVERSA[codigo] || '').join('')
  ).join(' ');
}

const Morse = {
  modo: 'texto',
  reproduciendo: false,
  audioCtx: null,

  init() {
    this.entrada = $('morse-entrada');
    this.salida = $('morse-salida');
    this.luz = $('morse-luz');
    this.btnPlay = $('morse-play');
    this.btnTexto = $('morse-modo-texto');
    this.btnInverso = $('morse-modo-inverso');
    if (!this.entrada) return;

    this.entrada.addEventListener('input', () => this.actualizar());
    this.btnTexto.addEventListener('click', () => this.cambiarModo('texto'));
    this.btnInverso.addEventListener('click', () => this.cambiarModo('inverso'));
    this.btnPlay.addEventListener('click', () => this.reproducir());

    document.querySelectorAll('.morse-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.entrada.value = chip.dataset.frase;
        this.actualizar();
      });
    });
  },

  cambiarModo(modo) {
    this.modo = modo;
    this.btnTexto.classList.toggle('activo', modo === 'texto');
    this.btnInverso.classList.toggle('activo', modo === 'inverso');
    this.entrada.placeholder = modo === 'texto'
      ? 'Escribe algo, por ejemplo TE AMO'
      : 'Escribe en morse, ej: - . / .- -- ---';
    this.actualizar();
  },

  actualizar() {
    const valor = this.entrada.value;
    if (!valor.trim()) { this.salida.textContent = ''; return; }

    this.salida.textContent = this.modo === 'texto' ? textoAMorse(valor) : morseATexto(valor);

    if (!state.morseUsado) {
      state.morseUsado = true;
      Storage.guardar();
      Logros.revisar();
    }
    this.revisarSecreto(valor);
  },

  revisarSecreto(valorOriginal) {
    const textoPlano = this.modo === 'texto' ? valorOriginal : morseATexto(valorOriginal);
    const normalizado = normalizarTexto(textoPlano).replace(/\s+/g, ' ');
    const coincide = FRASES_SECRETAS_MORSE.some(f => normalizado === f);
    if (coincide && !state.morseSecretoEncontrado) {
      state.morseSecretoEncontrado = true;
      Storage.guardar();
      Logros.revisar();
      Regalos.revisar();
      mostrarToast('💓 Descifraste nuestro mensaje secreto');
      Efectos.fuegosArtificiales();
    }
  },

  reproducir() {
    if (this.reproduciendo || !this.salida.textContent) return;
    const codigo = this.modo === 'texto' ? this.salida.textContent : normalizarTexto(this.entrada.value);
    const palabras = codigo.trim().split(/\s*\/\s*/).filter(Boolean)
      .map(p => p.trim().split(/\s+/).filter(Boolean));
    if (!palabras.length) return;

    this.reproduciendo = true;
    this.asegurarAudio();

    const UNIDAD = 130;
    let t = 0;
    const programarLuz = (duracionMs) => {
      const inicio = t;
      setTimeout(() => this.luz.classList.add('encendida'), inicio);
      setTimeout(() => this.luz.classList.remove('encendida'), inicio + duracionMs);
      setTimeout(() => this.pitido(duracionMs), inicio);
      t += duracionMs + UNIDAD;
    };

    palabras.forEach((letras, iPalabra) => {
      letras.forEach((letra, iLetra) => {
        [...letra].forEach(simbolo => programarLuz(simbolo === '-' ? UNIDAD * 3 : UNIDAD));
        if (iLetra < letras.length - 1) t += UNIDAD * 2; // total 3 unidades entre letras
      });
      if (iPalabra < palabras.length - 1) t += UNIDAD * 6; // total 7 unidades entre palabras
    });

    setTimeout(() => { this.reproduciendo = false; }, t + 150);
  },

  asegurarAudio() {
    if (this.audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
    } catch (e) { this.audioCtx = null; }
  },

  pitido(duracionMs) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.frequency.value = 600;
    osc.type = 'sine';
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duracionMs / 1000);
  },
};

/* =========================================================
   12. UTILIDADES
========================================================= */
const $ = id => document.getElementById(id);

function formatTiempo(segundos) {
  const s = Math.floor(segundos % 60);
  const m = Math.floor((segundos / 60) % 60);
  const h = Math.floor(segundos / 3600);
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function mostrarToast(texto) {
  let cont = $('toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-container';
    cont.style.cssText = 'position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
    document.body.appendChild(cont);
  }
  const toast = document.createElement('div');
  toast.textContent = texto;
  toast.style.cssText = 'background:rgba(20,14,40,.95);border:1px solid rgba(255,45,117,.5);color:#fff;padding:12px 22px;border-radius:30px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);opacity:0;transform:translateY(10px);transition:opacity .4s ease, transform .4s ease;max-width:88vw;text-align:center;';
  cont.appendChild(toast);
  // Como máximo dos notificaciones a la vez, para no tapar la pantalla en el móvil
  while (cont.children.length > 2) cont.firstChild.remove();
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 500);
  }, 3200);
}

function abrirModal(modal) { modal.classList.add('abierto'); }
function cerrarModal(modal) {
  modal.classList.remove('abierto');
  // Libera la imagen ampliada de memoria al cerrar el visor.
  if (modal.id === 'modal-visor') {
    const img = $('visor-imagen');
    if (img) img.src = '';
  }
  // Deja de escuchar el chat en tiempo real mientras el modal está cerrado
  // (ahorra lecturas de Firestore y batería).
  if (modal.id === 'modal-chat' && typeof Chat !== 'undefined') Chat.detenerEscucha();
}

function generarId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Fecha local (no UTC) en formato YYYY-MM-DD; evita que la racha diaria
// cambie de día a una hora distinta a la del huso horario de la persona.
function fechaLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function formatFecha(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return `${d} de ${NOMBRES_MES[m - 1]} de ${y}`;
}

// Escapa HTML antes de insertar texto escrito por la persona (cápsulas del
// tiempo) con innerHTML, para que nada de lo que escriba rompa la página.
function escaparHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* =========================================================
   13. CÁPSULA DEL TIEMPO (mensajes que se abren en una fecha futura)
========================================================= */
const Capsulas = {
  init() {
    this.form = $('capsula-form');
    this.textoInput = $('capsula-texto');
    this.fechaInput = $('capsula-fecha');
    this.lista = $('capsulas-lista');
    this.error = $('capsula-error');
    if (!this.form) return;

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.fechaInput.min = fechaLocalISO(manana);

    this.form.addEventListener('submit', e => {
      e.preventDefault();
      this.sellar();
    });

    this.render();
  },

  sellar() {
    const texto = this.textoInput.value.trim();
    const fecha = this.fechaInput.value;
    this.error.textContent = '';

    if (!texto) { this.error.textContent = 'Escribe un mensaje antes de sellar la cápsula.'; return; }
    if (texto.length > 600) { this.error.textContent = 'Ese mensaje es un poco largo; intenta resumirlo un poco.'; return; }
    if (!fecha) { this.error.textContent = 'Elige una fecha de apertura.'; return; }
    if (fecha < this.fechaInput.min) { this.error.textContent = 'Elige una fecha futura, para que valga la pena esperar.'; return; }

    state.capsulas.push({
      id: generarId(),
      mensaje: texto,
      fechaApertura: fecha,
      abierta: false,
    });
    Storage.guardar();
    Logros.revisar();

    this.textoInput.value = '';
    this.fechaInput.value = '';
    mostrarToast('⏳ Cápsula sellada para el ' + formatFecha(fecha));
    this.render();
  },

  abrir(id) {
    const capsula = state.capsulas.find(c => c.id === id);
    if (!capsula) return;
    capsula.abierta = true;
    Storage.guardar();
    Logros.revisar();
    Efectos.fuegosArtificiales();
    this.render();
  },

  render() {
    if (!this.lista) return;
    this.lista.innerHTML = '';

    if (!state.capsulas.length) {
      this.lista.innerHTML = '<p class="capsula-vacio">Todavía no has sellado ninguna cápsula. Escribe la primera arriba ⬆️</p>';
      return;
    }

    const hoy = fechaLocalISO(new Date());
    const ordenadas = [...state.capsulas].sort((a, b) => a.fechaApertura.localeCompare(b.fechaApertura));

    ordenadas.forEach(c => {
      const disponible = c.fechaApertura <= hoy;
      const div = document.createElement('div');
      div.className = 'capsula' + (c.abierta ? ' abierta' : disponible ? ' lista' : ' bloqueada');

      if (c.abierta) {
        div.innerHTML = `<span class="capsula-fecha">✉️ escrita para el ${formatFecha(c.fechaApertura)}</span><p class="capsula-texto">${escaparHtml(c.mensaje)}</p>`;
      } else if (disponible) {
        div.innerHTML = `<span class="capsula-fecha">📬 lista para abrir</span><button class="capsula-abrir-btn" type="button">Abrir cápsula</button>`;
        div.querySelector('.capsula-abrir-btn').addEventListener('click', () => this.abrir(c.id));
      } else {
        const dias = Math.round((new Date(c.fechaApertura + 'T00:00:00') - new Date(hoy + 'T00:00:00')) / 86400000);
        div.innerHTML = `<span class="capsula-fecha">🔒 se abre el ${formatFecha(c.fechaApertura)}</span><p class="capsula-cuenta">falta${dias === 1 ? '' : 'n'} ${dias} día${dias === 1 ? '' : 's'}</p>`;
      }
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   14. RACHA DIARIA Y SORPRESA DEL DÍA
========================================================= */
const Racha = {
  badge: null,
  sorpresaPendiente: null,

  init() {
    this.badge = $('racha-badge');
    if (state.rachaDias > state.rachaMaxima) state.rachaMaxima = state.rachaDias;
    this.procesarVisitaDeHoy();
    this.actualizarBadge();
  },

  procesarVisitaDeHoy() {
    const hoy = fechaLocalISO(new Date());

    if (state.ultimaVisita !== hoy) {
      const ayer = fechaLocalISO(new Date(Date.now() - 86400000));
      state.rachaDias = (state.ultimaVisita === ayer) ? state.rachaDias + 1 : 1;
      state.ultimaVisita = hoy;
      if (state.rachaDias > state.rachaMaxima) state.rachaMaxima = state.rachaDias;
      Logros.revisar();
    }

    if (state.diaSorpresaVista !== hoy && SORPRESAS_DIARIAS.length) {
      const inicioAnio = new Date(hoy.slice(0, 4) + '-01-01T00:00:00');
      const diaDelAnio = Math.floor((new Date(hoy + 'T00:00:00') - inicioAnio) / 86400000);
      const indice = ((diaDelAnio % SORPRESAS_DIARIAS.length) + SORPRESAS_DIARIAS.length) % SORPRESAS_DIARIAS.length;
      this.sorpresaPendiente = SORPRESAS_DIARIAS[indice];
      state.diaSorpresaVista = hoy;
    }

    Storage.guardar();
  },

  mostrarSorpresaSiPendiente() {
    if (!this.sorpresaPendiente) return;
    const sorpresa = this.sorpresaPendiente;
    this.sorpresaPendiente = null;
    App.agregarAmor(1, {});
    mostrarToast(sorpresa.icono + ' ' + sorpresa.texto);
    this.actualizarBadge();
  },

  actualizarBadge() {
    if (!this.badge) return;
    if (state.rachaDias >= 2) {
      this.badge.textContent = `🔥 Racha de ${state.rachaDias} días`;
      this.badge.hidden = false;
    } else {
      this.badge.hidden = true;
    }
  },
};

/* =========================================================
   15. FECHAS ESPECIALES (cuenta regresiva)
========================================================= */
const FechasEspeciales = {
  init() {
    this.contenedor = $('fechas-especiales-lista');
    if (!this.contenedor) return;
    this.render();
  },

  proximaOcurrencia(mes, dia) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const anio = hoy.getFullYear();
    let fecha = new Date(anio, mes - 1, dia);
    if (fecha < hoy) fecha = new Date(anio + 1, mes - 1, dia);
    return fecha;
  },

  proximoMesversario(hoy) {
    let objetivo = new Date(hoy.getFullYear(), hoy.getMonth(), 11);
    if (objetivo < hoy) objetivo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 11);
    const dias = Math.round((objetivo - hoy) / 86400000);
    const n = (objetivo.getFullYear() - CONFIG.fechaInicio.getFullYear()) * 12
      + (objetivo.getMonth() - CONFIG.fechaInicio.getMonth());
    if (n <= 0) return null;
    const esAnio = n % 12 === 0;
    return {
      nombre: esAnio ? `${n / 12}º año juntos` : `${n}º mes juntos`,
      icono: esAnio ? '🎂' : '💌',
      dias,
    };
  },

  render() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const items = FECHAS_ESPECIALES.map(f => {
      const fecha = this.proximaOcurrencia(f.mes, f.dia);
      const dias = Math.round((fecha - hoy) / 86400000);
      return { ...f, dias };
    });

    const mesversario = this.proximoMesversario(hoy);
    if (mesversario) items.push(mesversario);

    if (!items.length) {
      const tarjeta = document.querySelector('.card-fechas');
      if (tarjeta) tarjeta.remove();
      return;
    }

    items.sort((a, b) => a.dias - b.dias);

    this.contenedor.innerHTML = items.map(f => `
      <div class="fecha-especial">
        <span class="fecha-especial-icono">${f.icono || '📅'}</span>
        <div>
          <p class="fecha-especial-nombre">${f.nombre}</p>
          <p class="fecha-especial-cuenta">${f.dias === 0 ? '¡Es hoy!' : `falta${f.dias === 1 ? '' : 'n'} ${f.dias} día${f.dias === 1 ? '' : 's'}`}</p>
        </div>
      </div>
    `).join('');
  },
};

/* =========================================================
   16. QUIZ (lógica e interacción)
========================================================= */
const Quiz = {
  indice: 0,
  puntaje: 0,
  respondida: false,

  init() {
    this.contenedor = $('quiz-contenedor');
    this.resultado = $('quiz-resultado');
  },

  reiniciar() {
    if (!this.contenedor) return;
    this.indice = 0;
    this.puntaje = 0;
    this.resultado.hidden = true;
    this.contenedor.hidden = false;
    this.renderPregunta();
  },

  renderPregunta() {
    if (!QUIZ_PREGUNTAS.length) {
      this.contenedor.innerHTML = '<p>Agrega preguntas en QUIZ_PREGUNTAS dentro de script.js para activar el quiz.</p>';
      return;
    }
    const p = QUIZ_PREGUNTAS[this.indice];
    this.respondida = false;
    this.contenedor.innerHTML = `
      <p class="quiz-progreso">Pregunta ${this.indice + 1} / ${QUIZ_PREGUNTAS.length}</p>
      <p class="quiz-pregunta">${p.pregunta}</p>
      <div class="quiz-opciones">
        ${p.opciones.map((op, i) => `<button type="button" class="quiz-opcion" data-i="${i}">${op}</button>`).join('')}
      </div>
    `;
    this.contenedor.querySelectorAll('.quiz-opcion').forEach(btn => {
      btn.addEventListener('click', () => this.responder(Number(btn.dataset.i), btn));
    });
  },

  responder(i, btnElegido) {
    if (this.respondida) return;
    this.respondida = true;
    const p = QUIZ_PREGUNTAS[this.indice];
    if (i === p.correcta) this.puntaje++;

    this.contenedor.querySelectorAll('.quiz-opcion').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === p.correcta) btn.classList.add('correcta');
      else if (btn === btnElegido) btn.classList.add('incorrecta');
    });

    setTimeout(() => {
      this.indice++;
      if (this.indice < QUIZ_PREGUNTAS.length) this.renderPregunta();
      else this.mostrarResultado();
    }, 900);
  },

  mostrarResultado() {
    this.contenedor.hidden = true;
    this.resultado.hidden = false;

    state.quizJugado = true;
    if (this.puntaje > state.quizMejorPuntaje) state.quizMejorPuntaje = this.puntaje;
    Storage.guardar();
    Logros.revisar();

    const total = QUIZ_PREGUNTAS.length;
    const mensaje = this.puntaje === total
      ? '🏆 Puntaje perfecto. Nos conoces de memoria.'
      : this.puntaje >= total / 2
        ? '💗 Nada mal. Y lo que no sabías, ahora ya lo sabemos juntos.'
        : '🌱 No importa el puntaje: lo bonito es que seguimos sumando historia juntos.';

    this.resultado.innerHTML = `
      <p class="quiz-puntaje">${this.puntaje} / ${total}</p>
      <p class="quiz-mensaje">${mensaje}</p>
      <button id="quiz-reintentar" class="menu-btn" type="button">🔁 Jugar de nuevo</button>
    `;
    $('quiz-reintentar').addEventListener('click', () => this.reiniciar());
  },
};

/* =========================================================
   17. EFECTOS VISUALES (estrellas, pétalos, corazones, fuegos)
========================================================= */
const Efectos = {
  contenedorEstrellas: null,
  canvasFuegos: null,
  ctxFuegos: null,
  totalEstrellas: CONFIG.totalEstrellas,

  init() {
    this.contenedorEstrellas = $('stars');
    this.canvasFuegos = $('fireworks');
    this.ctxFuegos = this.canvasFuegos.getContext('2d');
    this.totalEstrellas = this.calcularTotalEstrellas();
    this.ajustarCanvas();
    window.addEventListener('resize', debounce(() => this.ajustarCanvas(), 150));
    this.crearEstrellas();
    // Un solo listener para las ~200 estrellas en vez de uno por elemento.
    this.contenedorEstrellas.addEventListener('click', e => {
      const estrella = e.target.closest('.star');
      if (estrella) Constelaciones.alternarEstrella(estrella);
    });
  },

  calcularTotalEstrellas() {
    if (prefiereMovimientoReducido) return 70;
    const ancho = window.innerWidth;
    if (ancho < 480) return 130;
    if (ancho < 900) return 190;
    return CONFIG.totalEstrellas;
  },

  ajustarCanvas() {
    this.canvasFuegos.width = window.innerWidth;
    this.canvasFuegos.height = window.innerHeight;
    Constelaciones.ajustarCanvas();
  },

  crearEstrellas() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.totalEstrellas; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2.6 + 1;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 3 + 's';
      frag.appendChild(s);
    }
    this.contenedorEstrellas.appendChild(frag);
  },

  crearEstrellaFugaz() {
    if (pestanaOculta || prefiereMovimientoReducido) return;
    const cont = $('shooting-stars');
    const e = document.createElement('div');
    e.className = 'shooting-star';
    e.style.left = Math.random() * window.innerWidth + 'px';
    e.style.top = Math.random() * (window.innerHeight * 0.5) + 'px';
    cont.appendChild(e);
    setTimeout(() => e.remove(), 1700);
  },

  lloverPetalos() {
    setInterval(() => {
      if (pestanaOculta || prefiereMovimientoReducido) return;
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = (6 + Math.random() * 5) + 's, ' + (2 + Math.random() * 2) + 's';
      $('petals-container').appendChild(p);
      setTimeout(() => p.remove(), 11500);
    }, 550);
  },

  crearCorazon() {
    const h = document.createElement('div');
    h.className = 'heart-flotante';
    h.textContent = '❤️';
    const dx = (Math.random() * 160 - 80) + 'px';
    const rot = (Math.random() * 60 - 30) + 'deg';
    h.style.left = Math.random() * 90 + 5 + 'vw';
    h.style.bottom = '0px';
    h.style.fontSize = (22 + Math.random() * 28) + 'px';
    h.style.setProperty('--dx', dx);
    h.style.setProperty('--rot', rot);
    h.style.animationDuration = (2.2 + Math.random()) + 's';
    $('hearts-layer').appendChild(h);
    setTimeout(() => h.remove(), 3400);
  },

  fuegosArtificiales(x, y) {
    const ctx = this.ctxFuegos;
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2.6;
    const colores = ['#ff2d75', '#ffd77a', '#ff86b7', '#6c5ce7', '#ffffff'];
    const particulas = [];
    const total = 60;
    for (let i = 0; i < total; i++) {
      const angulo = (Math.PI * 2 * i) / total;
      const velocidad = 2 + Math.random() * 3.5;
      particulas.push({
        x: cx, y: cy,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        vida: 1,
        color: colores[Math.floor(Math.random() * colores.length)],
      });
    }
    let frames = 0;
    const anim = () => {
      ctx.clearRect(0, 0, this.canvasFuegos.width, this.canvasFuegos.height);
      frames++;
      let activas = false;
      particulas.forEach(p => {
        if (p.vida <= 0) return;
        activas = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vida -= 0.014;
        ctx.globalAlpha = Math.max(p.vida, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (activas && frames < 160) requestAnimationFrame(anim);
      else ctx.clearRect(0, 0, this.canvasFuegos.width, this.canvasFuegos.height);
    };
    anim();
  },
};

/* =========================================================
   18. CONSTELACIONES
========================================================= */
const Constelaciones = {
  seleccionadas: [],
  canvas: null,
  ctx: null,

  init() {
    this.canvas = $('constelacion-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ajustarCanvas();
  },

  ajustarCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.redibujar();
  },

  alternarEstrella(el) {
    const idx = this.seleccionadas.indexOf(el);
    if (idx >= 0) {
      this.seleccionadas.splice(idx, 1);
      el.classList.remove('seleccionada');
    } else {
      this.seleccionadas.push(el);
      el.classList.add('seleccionada');
    }
    this.redibujar();

    if (this.seleccionadas.length === 3) {
      state.constelacionesHechas += 1;
      Storage.guardar();
      Logros.revisar();
      Regalos.revisar();
      mostrarToast('✨ Formaste una constelación en nuestro cielo');
      const rect = el.getBoundingClientRect();
      Efectos.fuegosArtificiales(rect.left, rect.top);
    }
    if (this.seleccionadas.length > 9) {
      const primera = this.seleccionadas.shift();
      primera.classList.remove('seleccionada');
    }
  },

  redibujar() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.seleccionadas.length < 2) return;
    this.ctx.strokeStyle = 'rgba(255,215,122,.75)';
    this.ctx.lineWidth = 1.4;
    this.ctx.beginPath();
    this.seleccionadas.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.stroke();
  },
};

/* =========================================================
   19. REPRODUCTOR DE MÚSICA
========================================================= */
const Reproductor = {
  audio: null,
  audioCtx: null,
  analizador: null,
  fuenteConectada: false,
  reproduciendo: false,
  indiceFuente: 0,

  init() {
    this.audio = $('audio-player');
    this.listaEl = $('lista-canciones');
    this.discoEl = $('disco');
    this.tituloEl = $('cancion-titulo');
    this.autorEl = $('cancion-autor');
    this.playBtn = $('btn-play');
    this.progresoBarra = $('progreso-barra');
    this.progresoFill = $('progreso-fill');
    this.progresoHandle = $('progreso-handle');
    this.tiempoActualEl = $('tiempo-actual');
    this.tiempoTotalEl = $('tiempo-total');
    this.volumenInput = $('volumen');
    this.visualizadorCanvas = $('visualizador');

    this.renderLista();
    if (state.cancionActual >= CANCIONES.length) state.cancionActual = 0;
    this.cargarCancion(state.cancionActual, false);
    this.volumenInput.value = state.volumen;
    this.audio.volume = state.volumen / 100;

    this.playBtn.addEventListener('click', () => this.alternarPlay());
    $('btn-siguiente').addEventListener('click', () => this.siguiente());
    $('btn-anterior').addEventListener('click', () => this.anterior());
    this.btnAleatorio = $('btn-aleatorio');
    this.btnRepetir = $('btn-repetir');
    this.btnAleatorio.setAttribute('aria-pressed', String(state.reproductorAleatorio));
    this.btnRepetir.setAttribute('aria-pressed', String(state.reproductorRepetir));
    this.btnAleatorio.addEventListener('click', () => {
      state.reproductorAleatorio = !state.reproductorAleatorio;
      this.btnAleatorio.setAttribute('aria-pressed', String(state.reproductorAleatorio));
      Storage.guardar();
      mostrarToast(state.reproductorAleatorio ? '🔀 Reproducción aleatoria activada' : '🔀 Reproducción aleatoria desactivada');
    });
    this.btnRepetir.addEventListener('click', () => {
      state.reproductorRepetir = !state.reproductorRepetir;
      this.btnRepetir.setAttribute('aria-pressed', String(state.reproductorRepetir));
      Storage.guardar();
      mostrarToast(state.reproductorRepetir ? '🔁 Repetir canción activado' : '🔁 Repetir canción desactivado');
    });
    this.volumenInput.addEventListener('input', e => {
      const v = Number(e.target.value);
      this.audio.volume = v / 100;
      state.volumen = v;
      Storage.guardar();
    });
    this.configurarArrastreProgreso();

    const inputSubir = $('subir-cancion');
    if (inputSubir) inputSubir.addEventListener('change', e => {
      this.subirDesdeDispositivo(e.target.files[0]);
      e.target.value = '';
    });

    this.audio.addEventListener('timeupdate', () => this.actualizarProgreso());
    this.audio.addEventListener('loadedmetadata', () => this.actualizarProgreso());
    this.audio.addEventListener('play', () => this.marcarReproduciendo(true));
    this.audio.addEventListener('pause', () => this.marcarReproduciendo(false));
    this.audio.addEventListener('ended', () => this.alTerminar());
    this.audio.addEventListener('error', () => { if (this.audio.error) this.alFallar(); });
    this.audio.addEventListener('canplay', () => {
      const c = CANCIONES[state.cancionActual];
      if (c && !c.src) c._indiceOk = this.indiceFuente;
    });
  },

  renderLista() {
    this.listaEl.innerHTML = '';
    CANCIONES.forEach((c, i) => {
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.innerHTML = `
        <span class="num">${i + 1}</span>
        <span class="nombre">${c.nombre} · ${c.autor}</span>
        <span class="eq"><span></span><span></span><span></span></span>
      `;
      li.addEventListener('click', () => this.cargarCancion(i, true));
      this.listaEl.appendChild(li);
    });
    this.marcarActiva();
  },

  marcarActiva() {
    [...this.listaEl.children].forEach((li, i) => {
      li.classList.toggle('activa', i === state.cancionActual);
    });
  },

  cargarCancion(indice, autoplay) {
    state.cancionActual = indice;
    const c = CANCIONES[indice];
    this.fuentesActuales = fuentesDeCancion(c);
    this.indiceFuente = Math.min(c._indiceOk || 0, this.fuentesActuales.length - 1);
    this.audio.src = this.fuentesActuales[this.indiceFuente];
    this.tituloEl.textContent = c.nombre;
    this.autorEl.textContent = c.autor;
    this.marcarActiva();
    Storage.guardar();
    if (autoplay) this.play();
  },

  play() {
    this.intentoReproducir = true;
    this.iniciarVisualizador();
    const p = this.audio.play();
    if (p && p.catch) p.catch(err => this.alErrorDePlay(err));
  },

  alternarPlay() {
    if (this.audio.paused) this.play();
    else this.audio.pause();
  },

  marcarReproduciendo(activo) {
    this.reproduciendo = activo;
    this.playBtn.textContent = activo ? '⏸' : '▶';
    this.discoEl.classList.toggle('reproduciendo', activo);
    if (activo) this.dibujarVisualizador();
  },

  siguienteIndice() {
    if (state.reproductorAleatorio && CANCIONES.length > 1) {
      let i;
      do { i = Math.floor(Math.random() * CANCIONES.length); } while (i === state.cancionActual);
      return i;
    }
    return (state.cancionActual + 1) % CANCIONES.length;
  },

  siguiente() {
    this.cargarCancion(this.siguienteIndice(), this.reproduciendo);
  },

  anterior() {
    const i = (state.cancionActual - 1 + CANCIONES.length) % CANCIONES.length;
    this.cargarCancion(i, this.reproduciendo);
  },

  actualizarProgreso() {
    if (this.arrastrandoProgreso) return;
    const { currentTime, duration } = this.audio;
    const pct = duration ? (currentTime / duration) * 100 : 0;
    this.progresoFill.style.width = pct + '%';
    this.progresoHandle.style.left = pct + '%';
    this.tiempoActualEl.textContent = formatTiempo(currentTime || 0);
    this.tiempoTotalEl.textContent = duration ? formatTiempo(duration) : '0:00';
  },

  configurarArrastreProgreso() {
    this.arrastrandoProgreso = false;

    const pctDesdeEvento = e => {
      const rect = this.progresoBarra.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    };

    const previsualizar = pct => {
      this.progresoFill.style.width = (pct * 100) + '%';
      this.progresoHandle.style.left = (pct * 100) + '%';
      if (this.audio.duration) this.tiempoActualEl.textContent = formatTiempo(pct * this.audio.duration);
    };

    const iniciar = e => {
      this.arrastrandoProgreso = true;
      previsualizar(pctDesdeEvento(e));
    };
    const mover = e => {
      if (!this.arrastrandoProgreso) return;
      previsualizar(pctDesdeEvento(e));
    };
    const soltar = e => {
      if (!this.arrastrandoProgreso) return;
      this.arrastrandoProgreso = false;
      if (this.audio.duration) this.audio.currentTime = pctDesdeEvento(e) * this.audio.duration;
    };

    this.progresoBarra.addEventListener('mousedown', iniciar);
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);

    this.progresoBarra.addEventListener('touchstart', iniciar, { passive: true });
    window.addEventListener('touchmove', mover, { passive: true });
    window.addEventListener('touchend', soltar);
  },

  alTerminar() {
    if (!state.cancionesEscuchadas.includes(state.cancionActual)) {
      state.cancionesEscuchadas.push(state.cancionActual);
      Storage.guardar();
      Logros.revisar();
    }
    if (state.reproductorRepetir) {
      this.audio.currentTime = 0;
      this.play();
      return;
    }
    this.siguiente();
  },

  alFallar() {
    const c = CANCIONES[state.cancionActual];
    const fuentes = this.fuentesActuales || fuentesDeCancion(c);
    this.indiceFuente += 1;
    if (this.indiceFuente < fuentes.length) {
      this.audio.src = fuentes[this.indiceFuente];
      this.audio.load();
      if (this.intentoReproducir) this.play();
      return;
    }
    this.intentoReproducir = false;
    this.tituloEl.textContent = c.nombre;
    this.autorEl.textContent = c.src
      ? 'No se pudo abrir este archivo'
      : `No encontré el archivo "${c.base || fuentes[0]}". Revisa que esté junto a index.html.`;
    this.marcarReproduciendo(false);
  },

  // Solo se trata como archivo dañado si el propio <audio> lo confirma.
  alErrorDePlay(err) {
    if (err && err.name === 'NotAllowedError') {
      // El navegador exige un toque para empezar (política de autoplay).
      this.intentoReproducir = false;
      this.marcarReproduciendo(false);
      mostrarToast('▶ Toca play para empezar a escuchar');
      return;
    }
    if (err && err.name === 'AbortError') return; // se cambió de fuente a mitad de carga
    if (this.audio.error) this.alFallar();
  },

  subirDesdeDispositivo(archivo) {
    if (!archivo) return;
    const esAudio = archivo.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(archivo.name);
    if (!esAudio) { mostrarToast('Elige un archivo de audio (mp3, m4a, wav u ogg)'); return; }
    const nombre = archivo.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
    CANCIONES.push({ src: URL.createObjectURL(archivo), nombre, autor: 'De tu dispositivo', temporal: true });
    this.renderLista();
    this.cargarCancion(CANCIONES.length - 1, true);
    mostrarToast('🎵 Sonando desde tu dispositivo (solo en esta sesión)');
  },

  iniciarVisualizador() {
    if (this.fuenteConectada) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
      const fuente = this.audioCtx.createMediaElementSource(this.audio);
      this.analizador = this.audioCtx.createAnalyser();
      this.analizador.fftSize = 64;
      fuente.connect(this.analizador);
      this.analizador.connect(this.audioCtx.destination);
      this.fuenteConectada = true;
    } catch (e) { /* visualizador no disponible en este navegador */ }
  },

  dibujarVisualizador() {
    if (!this.analizador || !this.reproduciendo || this.bucleVisualizadorActivo) return;
    this.bucleVisualizadorActivo = true;
    const ctx = this.visualizadorCanvas.getContext('2d');
    const datos = new Uint8Array(this.analizador.frequencyBinCount);
    const ancho = this.visualizadorCanvas.width;
    const alto = this.visualizadorCanvas.height;

    const render = () => {
      if (!this.reproduciendo) { this.bucleVisualizadorActivo = false; return; }
      this.analizador.getByteFrequencyData(datos);
      ctx.clearRect(0, 0, ancho, alto);
      const barW = ancho / datos.length;
      datos.forEach((v, i) => {
        const h = (v / 255) * alto;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,45,117,.8)' : 'rgba(255,215,122,.8)';
        ctx.fillRect(i * barW, alto - h, barW - 2, h);
      });
      requestAnimationFrame(render);
    };
    render();
  },
};

/* =========================================================
   20. LOGROS (render + revisión)
========================================================= */
const Logros = {
  init() {
    this.grid = $('logros-grid');
    this.progresoEl = $('logros-progreso');
    this.render();
  },
  revisar() {
    let nuevos = false;
    LOGROS.forEach(l => {
      const yaDesbloqueado = state.logrosDesbloqueados.includes(l.id);
      if (!yaDesbloqueado && l.check(state)) {
        state.logrosDesbloqueados.push(l.id);
        nuevos = true;
        mostrarToast('🎖️ Logro desbloqueado: ' + l.nombre);
      }
    });
    if (nuevos) { Storage.guardar(); this.render(); }
  },
  render() {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    LOGROS.forEach(l => {
      const desbloqueado = state.logrosDesbloqueados.includes(l.id);
      const div = document.createElement('div');
      div.className = 'logro' + (desbloqueado ? ' desbloqueado' : '');
      div.innerHTML = `
        <span class="logro-icono">${l.icono}</span>
        <div class="logro-nombre">${l.nombre}</div>
        <div class="logro-desc">${desbloqueado ? l.desc : '???'}</div>
      `;
      this.grid.appendChild(div);
    });
    this.progresoEl.textContent = `${state.logrosDesbloqueados.length} / ${LOGROS.length} desbloqueados`;
  },
};

/* =========================================================
   21. REGALOS SECRETOS
========================================================= */
const Regalos = {
  init() {
    this.lista = $('regalos-lista');
    this.boton = $('btn-regalos');
    this.revisar();
  },
  revisar() {
    const algunoDesbloqueado = REGALOS.some(r => r.requiere(state));
    this.boton.classList.toggle('oculto', !algunoDesbloqueado);
  },
  render() {
    this.lista.innerHTML = '';
    REGALOS.forEach(r => {
      const desbloqueado = r.requiere(state);
      const div = document.createElement('div');
      div.className = 'regalo' + (desbloqueado ? '' : ' bloqueado');
      div.innerHTML = desbloqueado
        ? `<h3>🎁 ${r.titulo}</h3><p>${r.texto}</p>`
        : `<h3>🔒 Regalo bloqueado</h3><p>Sigue explorando el universo para desbloquearlo.</p>`;
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   22. RETOS (render)
========================================================= */
const Retos = {
  init() {
    this.lista = $('lista-retos');
    this.progresoEl = $('retos-progreso');
  },
  revisarNuevos() {
    let cambios = false;
    RETOS.forEach(meta => {
      if (state.amor >= meta && !state.retosNotificados.includes(meta)) {
        state.retosNotificados.push(meta);
        cambios = true;
      }
    });
    if (cambios) {
      Storage.guardar();
      const ultimo = state.retosNotificados[state.retosNotificados.length - 1];
      mostrarToast(`🏆 Reto cumplido: ${ultimo} corazones`);
      Efectos.fuegosArtificiales();
      Logros.revisar();
      Regalos.revisar();
    }
  },
  render() {
    this.lista.innerHTML = '';
    RETOS.forEach(meta => {
      const cumplido = state.amor >= meta;
      const li = document.createElement('li');
      li.className = cumplido ? 'hecho' : 'bloqueado';
      li.innerHTML = `<span class="icono">${cumplido ? '✅' : '🔒'}</span> ${meta} corazones`;
      this.lista.appendChild(li);
    });
    this.progresoEl.textContent = `${state.retosNotificados.length} / 100 desbloqueados`;
  },
};

/* =========================================================
   23. LUNA Y SECRETOS
========================================================= */
const Luna = {
  init() {
    this.boton = $('moon');
    this.titulo = $('luna-titulo');
    this.lista = $('luna-lista');
    this.boton.addEventListener('click', () => {
      if (this._pulsacionLarga) { this._pulsacionLarga = false; return; }
      this.tocar();
    });
    this.boton.addEventListener('pointerdown', () => {
      this._temporizadorLargo = setTimeout(() => {
        this._pulsacionLarga = true;
        this.tocarLargo();
      }, 850);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
      this.boton.addEventListener(ev, () => {
        if (this._temporizadorLargo) clearTimeout(this._temporizadorLargo);
      });
    });
  },
  tocar() {
    state.lunaClicks += 1;
    const nuevoIndice = CONFIG.clicksSecretosLuna.indexOf(state.lunaClicks);
    if (nuevoIndice >= 0 && !state.secretosLunaVistos.includes(nuevoIndice)) {
      state.secretosLunaVistos.push(nuevoIndice);
      Storage.guardar();
      mostrarToast('🌙 Descubriste un secreto de la luna');
      Efectos.fuegosArtificiales();
      Logros.revisar();
      this.render();
      abrirModal($('modal-luna'));
    } else {
      Storage.guardar();
    }
  },
  tocarLargo() {
    const disponibles = CURIOSIDADES_LUNA.map((_, i) => i).filter(i => !state.curiosidadesLunaVistas.includes(i));
    if (!disponibles.length) {
      mostrarToast('🌘 Ya encontraste todas las curiosidades escondidas aquí.');
      return;
    }
    const idx = disponibles[Math.floor(Math.random() * disponibles.length)];
    state.curiosidadesLunaVistas.push(idx);
    Storage.guardar();
    mostrarToast(CURIOSIDADES_LUNA[idx]);
    Efectos.fuegosArtificiales();
    Logros.revisar();
    Regalos.revisar();
  },
  render() {
    this.lista.innerHTML = '';
    const total = CONFIG.clicksSecretosLuna.length;
    this.titulo.textContent = `${state.secretosLunaVistos.length} / ${total} secretos encontrados`;
    SECRETOS_LUNA.forEach((texto, i) => {
      const visto = state.secretosLunaVistos.includes(i);
      const div = document.createElement('div');
      div.className = 'secreto' + (visto ? '' : ' bloqueado');
      div.textContent = visto ? texto : `🔒 Toca la luna ${CONFIG.clicksSecretosLuna[i]} veces para descubrir este secreto.`;
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   23b. SECRETOS EXTRA
========================================================= */

/* Toca 3 veces seguidas el corazón del título para revelar una clave. */
const ClaveCorazon = {
  clicks: 0,
  init() {
    this.el = document.querySelector('.app-header .heart-ico');
    if (!this.el) return;
    this.el.style.cursor = 'pointer';
    this.el.addEventListener('click', () => this.tocar());
  },
  tocar() {
    if (state.claveCorazonEncontrada) return;
    this.clicks += 1;
    clearTimeout(this._temporizador);
    this._temporizador = setTimeout(() => { this.clicks = 0; }, 900);
    if (this.clicks >= 3) {
      this.clicks = 0;
      state.claveCorazonEncontrada = true;
      Storage.guardar();
      mostrarToast('🔐 Encontraste la clave escondida en el título');
      Efectos.fuegosArtificiales();
      Logros.revisar();
      Regalos.revisar();
    }
  },
};

/* Doble toque en el contador de "tiempo juntos" muestra una curiosidad numérica. */
const CuriosidadTiempo = {
  init() {
    this.el = $('contador');
    if (!this.el) return;
    this.el.addEventListener('dblclick', () => this.mostrar());
    let ultimoToque = 0;
    this.el.addEventListener('touchend', () => {
      const ahora = Date.now();
      if (ahora - ultimoToque < 350) this.mostrar();
      ultimoToque = ahora;
    });
  },
  mostrar() {
    const ms = Date.now() - CONFIG.fechaInicio.getTime();
    if (ms < 0) return;
    const minutos = Math.floor(ms / 60000);
    const horas = Math.floor(minutos / 60);
    const latidos = Math.floor(minutos * 70); // ~70 latidos por minuto, solo por diversión
    mostrarToast(`💗 Eso son ${horas.toLocaleString('es')} horas juntos — unos ${latidos.toLocaleString('es')} latidos de tu corazón.`);
    Efectos.fuegosArtificiales();
    if (!state.estadisticoCurioso) { state.estadisticoCurioso = true; Storage.guardar(); Logros.revisar(); }
  },
};

/* Cada 11 del mes (el día de su aniversario), una pequeña celebración extra. */
function revisarAniversarioMensual() {
  const hoy = new Date();
  if (hoy.getDate() !== 11) return;
  const clave = `${hoy.getFullYear()}-${hoy.getMonth() + 1}`;
  if (state.mesesCelebrados.includes(clave)) return;
  state.mesesCelebrados.push(clave);
  Storage.guardar();
  setTimeout(() => {
    mostrarToast('💞 Hoy se cumple un mes más desde el 11 de marzo.');
    Efectos.fuegosArtificiales();
  }, 2200);
}

/* =========================================================
   23b-2. LA CARTA ESCONDIDA
   ---------------------------------------------------------
   Mantén presionado el corazón del pie de página ("hecho con
   ❤️ para Scarleth Rassel") para revelarla. A propósito no
   tiene ninguna pista visual — es el secreto más escondido
   de todo el sitio.
========================================================= */
const CartaSecreta = {
  init() {
    this.el = $('corazon-secreto');
    this.contenedor = $('carta-secreta-texto');
    if (!this.el || !this.contenedor) return;
    this.el.addEventListener('click', () => this.tocar());
  },

  tocar() {
    if (state.cartaSecretaEncontrada) { this.revelar(); return; }
    state.corazonSecretoClicks = (state.corazonSecretoClicks || 0) + 1;
    if (state.corazonSecretoClicks >= 11) {
      this.revelar();
    } else {
      Storage.guardar();
    }
  },

  revelar() {
    if (!this.escrita) this.render();
    abrirModal($('modal-carta-secreta'));
    Efectos.fuegosArtificiales();
    if (!state.cartaSecretaEncontrada) {
      state.cartaSecretaEncontrada = true;
      Storage.guardar();
      Logros.revisar();
      Regalos.revisar();
    }
  },

  render() {
    const parrafos = [
      'Amor, sé que te mostraré esto en algún momento de el domingo y sé que te encantará, por eso antes de que empieces a leer esta hermosa carta quiero pedirte las gracias por ser la gran mujer y hermosa que eres, todos los días me muestras algo diferente y sin duda alguna me haces feliz sin pedirme nada o sin despreciarme… y eso es clave para mí ❤️,',
      'amor, el primer momento en que te vi mi cabeza hizo boom… fue como el big bang pero perfecto, algo así como si hubieses explotado mi cabeza, ya que no había visto a alguien tan hermosa como vos..',
      'posterior a eso me fui enamorando más de ti por cómo te conocía y sobre todo que siempre me escuchabas y estabas para mí en los momentos que más te necesito… si alguien me ha salvado más veces, eres tú, porque en mis peores momentos pienso en ti… en cómo llegas a ser parte de mí y de mi sentimiento.',
      'Pensando que antes éramos solo amigos y pasamos a ser almas gemelas… es simplemente increíble, pero si algo quiero recalcar es el gran avance que ha pasado en ti amor, pasaste de hablarme un poco superficial a contarme tu día a día, abrazarme, decirme que me quieres y me amas muchísimo y sobre todo volverte la máxima influencia en mi vida… es algo increíble y que demuestra la única razón por la que aún creo en el ser humano, y es que tengo fe en que la humanidad puede cambiar, porque si la mujer que amo lo hizo… todos pueden hacerlo.',
      'Además amor, entrando en detalles sentimentales me has hecho tan feliz que mi mente solo piensa en ti y cada vez que puedo te menciono, cuando me dicen que me quieren presentar a alguien o algo así, mil veces digo: tengo novia y la amo demasiado (no lo digo porque sea un impedimento ni nada de eso) es que directamente para mí sí existen las almas gemelas.. y tú eres la mía, así que yo no te traicionaré ni en este universo ni en 1000000000000000.000.0000, ya que mujeres como tú no hay y sin ti no pienso vivir, así que arriesgar por nada no vale la pena…',
      'Eres lo único que quiero en este universo, amor.',
      'Feliz aniversario, gracias por este quinto aniversario y por el aniversario de un año que viene próximo… sé que vendrán muchísimos más hasta que nos vayamos de este mundo, así que todo esto me pone feliz… espero que este regalo te guste mucho. Revisa mi bolsillo ;3)',
    ];
    this.contenedor.innerHTML = '';
    parrafos.forEach(texto => {
      const p = document.createElement('p');
      p.textContent = texto;
      this.contenedor.appendChild(p);
    });
    this.escrita = true;
  },
};

/* =========================================================
   23b-3. TOCA LA PANTALLA
   ---------------------------------------------------------
   Toca 6 veces seguidas (rápido) en cualquier zona vacía de
   la pantalla — no en botones ni tarjetas — para despertar
   una lluvia de estrellas y corazones.
========================================================= */
function esZonaVacia(el) {
  return !el.closest('button, a, input, textarea, select, summary, .modal, .card, .app-header, .app-footer, label, form, #moon');
}

const TocarPantalla = {
  clicks: 0,
  init() {
    const main = $('main');
    if (!main) return;
    main.addEventListener('click', e => {
      if (!esZonaVacia(e.target)) { this.clicks = 0; return; }
      this.clicks += 1;
      clearTimeout(this._t);
      this._t = setTimeout(() => { this.clicks = 0; }, 1600);
      if (this.clicks >= 6) {
        this.clicks = 0;
        this.activar();
      }
    });
  },
  activar() {
    mostrarToast('✨ Despertaste una lluvia de estrellas');
    let n = 0;
    const iv = setInterval(() => {
      Efectos.crearEstrellaFugaz();
      if (Math.random() > 0.45) Efectos.crearCorazon();
      n += 1;
      if (n >= 16) clearInterval(iv);
    }, 110);
    if (!state.lluviaSecretaVista) {
      state.lluviaSecretaVista = true;
      Storage.guardar();
      Logros.revisar();
    }
  },
};

/* =========================================================
   23b-4. SACUDE EL TELÉFONO
   ---------------------------------------------------------
   En dispositivos con acelerómetro, agitar el teléfono
   despierta una pequeña sorpresa. El permiso de movimiento
   (necesario en iPhone) se pide al tocar "Entrar al Universo".
========================================================= */
const SORPRESAS_SACUDIDA = [
  '📳 Detecté ese temblor... ¿nervios o emoción? De cualquier forma, te amo.',
  '📳 Hasta este universo se mueve cuando tú lo agitas. Como mi corazón cuando te veo.',
  '📳 Sacudida recibida. Aquí va un poco más de amor, de regalo.',
];

const Sacudir = {
  ultimo: null,
  ultimaActivacion: 0,
  init() {
    if (typeof window.DeviceMotionEvent === 'undefined') return;
    window.addEventListener('devicemotion', e => this.manejar(e));
  },
  manejar(e) {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x === null || a.x === undefined) return;
    if (this.ultimo) {
      const delta = Math.abs(a.x - this.ultimo.x) + Math.abs(a.y - this.ultimo.y) + Math.abs(a.z - this.ultimo.z);
      const ahora = Date.now();
      if (delta > 32 && ahora - this.ultimaActivacion > 4000) {
        this.ultimaActivacion = ahora;
        this.activar();
      }
    }
    this.ultimo = { x: a.x, y: a.y, z: a.z };
  },
  activar() {
    const mensaje = SORPRESAS_SACUDIDA[Math.floor(Math.random() * SORPRESAS_SACUDIDA.length)];
    mostrarToast(mensaje);
    if (navigator.vibrate) navigator.vibrate([30, 40, 30, 40, 30]);
    let n = 0;
    const iv = setInterval(() => {
      Efectos.fuegosArtificiales(
        window.innerWidth * (0.25 + Math.random() * 0.5),
        window.innerHeight * (0.25 + Math.random() * 0.35)
      );
      Efectos.crearCorazon();
      n += 1;
      if (n >= 6) clearInterval(iv);
    }, 260);
    if (!state.sacudidaSecretaVista) {
      state.sacudidaSecretaVista = true;
      Storage.guardar();
      Logros.revisar();
    }
  },
};

/* =========================================================
   23c. RULETA DE CITAS
========================================================= */
const Ruleta = {
  girando: false,
  init() {
    this.tarjeta = $('ruleta-tarjeta');
    this.icono = $('ruleta-icono');
    this.texto = $('ruleta-texto');
    this.boton = $('ruleta-girar');
    if (!this.boton) return;
    this.boton.addEventListener('click', () => this.girar());
  },
  girar() {
    if (this.girando) return;
    this.girando = true;
    this.tarjeta.classList.remove('revelada');
    this.icono.classList.add('girando');
    this.boton.disabled = true;

    let vueltas = 0;
    const totalVueltas = 14;
    const intervalo = setInterval(() => {
      const idea = IDEAS_RULETA[Math.floor(Math.random() * IDEAS_RULETA.length)];
      this.icono.textContent = idea.icono;
      this.texto.textContent = idea.texto;
      vueltas += 1;
      if (vueltas >= totalVueltas) {
        clearInterval(intervalo);
        this.icono.classList.remove('girando');
        this.tarjeta.classList.add('revelada');
        this.girando = false;
        this.boton.disabled = false;
        if (!state.ruletaUsada) { state.ruletaUsada = true; Storage.guardar(); Logros.revisar(); }
      }
    }, 90);
  },
};

/* =========================================================
   23d. FRASCO DE PIROPOS
========================================================= */
const Frasco = {
  init() {
    this.form = $('frasco-form');
    if (!this.form) return;
    this.textoInput = $('frasco-texto');
    this.contador = $('frasco-contador');
    this.tarjeta = $('frasco-tarjeta');
    this.icono = $('frasco-icono');
    this.textoSacado = $('frasco-texto-sacado');
    this.form.addEventListener('submit', e => { e.preventDefault(); this.agregar(); });
    $('frasco-sacar').addEventListener('click', () => this.sacar());
    $('frasco-vaciar').addEventListener('click', () => this.vaciar());
  },
  agregar() {
    const texto = this.textoInput.value.trim();
    if (!texto) return;
    state.piropos.push({ id: generarId(), texto });
    Storage.guardar();
    Logros.revisar();
    this.textoInput.value = '';
    mostrarToast('🫙 Piropo guardado en el frasco');
    this.render();
  },
  sacar() {
    if (!state.piropos.length) {
      mostrarToast('El frasco todavía está vacío. ¡Agreguen el primer piropo!');
      return;
    }
    const elegido = state.piropos[Math.floor(Math.random() * state.piropos.length)];
    this.icono.textContent = '💌';
    this.textoSacado.textContent = elegido.texto;
    this.tarjeta.classList.remove('revelada');
    void this.tarjeta.offsetWidth; // fuerza el reinicio de la animación
    this.tarjeta.classList.add('revelada');
  },
  vaciar() {
    if (!state.piropos.length) return;
    state.piropos = [];
    Storage.guardar();
    this.icono.textContent = '🫙';
    this.textoSacado.textContent = 'El frasco está esperando su primer piropo.';
    this.tarjeta.classList.remove('revelada');
    this.render();
  },
  render() {
    if (!this.contador) return;
    this.contador.textContent = state.piropos.length
      ? `El frasco tiene ${state.piropos.length} piropo${state.piropos.length === 1 ? '' : 's'} guardado${state.piropos.length === 1 ? '' : 's'}.`
      : 'El frasco todavía está vacío.';
  },
};

/* =========================================================
   23e. ESTADO DE ÁNIMO DEL DÍA
========================================================= */
const ANIMO_OPCIONES = ['🥰', '😄', '🙂', '😐', '😔', '😴', '😤', '🤒'];

const Animo = {
  init() {
    this.contenedor = $('animo-opciones');
    if (!this.contenedor) return;
    this.guardadoEl = $('animo-guardado');
    this.tira = $('animo-tira');
    this.contenedor.innerHTML = '';
    ANIMO_OPCIONES.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'animo-btn';
      btn.textContent = emoji;
      btn.setAttribute('aria-label', 'Registrar ánimo ' + emoji);
      btn.addEventListener('click', () => this.registrar(emoji));
      this.contenedor.appendChild(btn);
    });
  },
  registrar(emoji) {
    const hoy = fechaLocalISO(new Date());
    state.animos[hoy] = emoji;
    Storage.guardar();
    Logros.revisar();
    this.render();
  },
  render() {
    if (!this.contenedor) return;
    const hoy = fechaLocalISO(new Date());
    this.contenedor.querySelectorAll('.animo-btn').forEach(btn => {
      btn.classList.toggle('activo', state.animos[hoy] === btn.textContent);
    });
    if (state.animos[hoy]) {
      this.guardadoEl.hidden = false;
      this.guardadoEl.textContent = `Guardado como el ánimo de hoy: ${state.animos[hoy]}`;
    } else {
      this.guardadoEl.hidden = true;
    }

    this.tira.innerHTML = '';
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const clave = fechaLocalISO(d);
      const emoji = state.animos[clave];
      const div = document.createElement('div');
      div.className = 'animo-dia' + (emoji ? '' : ' vacio');
      div.textContent = emoji || '·';
      div.title = clave;
      this.tira.appendChild(div);
    }
  },
};

/* =========================================================
   23f. ÁLBUM (fotos reales, guardadas en este dispositivo)
   ---------------------------------------------------------
   Las fotos se comprimen en el navegador antes de guardarse
   (máx. ~900px, calidad ~72%) para que quepan más en el espacio
   disponible. Todo queda en este dispositivo — no se sube a
   ningún servidor.
========================================================= */
const ALBUM_CATEGORIAS = ['Viajes', 'Momentos', 'Cotidiano', 'Especiales'];

const Album = {
  filtro: 'Todas',
  actual: 0,

  init() {
    this.grid = $('album-grid');
    if (!this.grid) return;
    this.input = $('album-input');
    this.ayuda = $('album-ayuda');
    this.input.addEventListener('change', () => {
      const archivos = [...(this.input.files || [])];
      this.input.value = '';
      archivos.forEach(a => this.manejarArchivo(a));
    });
    this.grid.onclick = e => this.alTocarGrid(e);
    this.render();
  },

  // Reduce la foto (máx. 900 px, JPEG 72 %) para que quepan más en este dispositivo
  comprimir(file) {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();
      lector.onerror = rechazar;
      lector.onload = e => {
        const img = new Image();
        img.onload = () => {
          const MAX = 900;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolver(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = rechazar;
        img.src = e.target.result;
      };
      lector.readAsDataURL(file);
    });
  },

  manejarArchivo(file) {
    if (!file.type || !file.type.startsWith('image/')) {
      mostrarToast('Ese archivo no parece una imagen.');
      return;
    }
    this.comprimir(file)
      .then(src => this.agregarFoto(src))
      .catch(() => mostrarToast('No se pudo leer esa imagen.'));
  },

  // extra permite fijar categoría, descripción o fecha (lo usa el calendario)
  agregarFoto(dataUrl, extra = {}) {
    const foto = {
      id: generarId(),
      src: dataUrl,
      fecha: fechaLocalISO(new Date()),
      categoria: this.filtro === 'Todas' ? 'Momentos' : this.filtro,
      descripcion: '',
      ...extra,
    };
    state.fotos.push(foto);
    if (!Storage.intentarGuardarInmediato()) {
      state.fotos.pop();
      mostrarToast('📷 No queda espacio en este dispositivo para más fotos. Borra alguna para agregar otra.');
      return null;
    }
    Logros.revisar();
    this.render();
    mostrarToast('📷 Foto guardada');
    return foto.id;
  },

  eliminar(id) {
    state.fotos = state.fotos.filter(f => f.id !== id);
    Storage.guardar();
    this.render();
  },

  render() {
    if (!this.grid) return;
    const visibles = state.fotos.map((f, i) => ({ ...f, i }))
      .filter(f => this.filtro === 'Todas' || (f.categoria || 'Momentos') === this.filtro);
    this.grid.innerHTML = `
      <div class="arcade-chips album-chips">
        ${['Todas', ...ALBUM_CATEGORIAS].map(c =>
          `<button type="button" class="arcade-chip${c === this.filtro ? ' activo' : ''}" data-cat="${c}">${c}</button>`).join('')}
      </div>
      ${visibles.map(f => `
        <div class="foto-real" data-ver="${f.i}">
          <img src="${f.src}" alt="Recuerdo" loading="lazy" decoding="async">
          <span class="foto-etiqueta">${escaparHtml(f.categoria || 'Momentos')}</span>
          <button type="button" class="foto-borrar" data-borrar="${f.id}" aria-label="Eliminar foto">✕</button>
        </div>`).join('')}
      <button type="button" class="foto-agregar" data-agregar>
        <span>➕</span><span class="foto-agregar-texto">Agregar foto</span>
      </button>`;
    if (this.ayuda) {
      const n = state.fotos.length;
      this.ayuda.textContent = n
        ? `${n} foto${n === 1 ? '' : 's'} guardada${n === 1 ? '' : 's'} en este dispositivo.`
        : 'Toca "Agregar foto" para empezar a guardar sus recuerdos aquí.';
    }
  },

  alTocarGrid(e) {
    const cat = e.target.closest('[data-cat]');
    if (cat) { this.filtro = cat.dataset.cat; this.render(); return; }
    const borrar = e.target.closest('[data-borrar]');
    if (borrar) { e.stopPropagation(); this.eliminar(borrar.dataset.borrar); return; }
    if (e.target.closest('[data-agregar]')) { this.input.click(); return; }
    const ver = e.target.closest('[data-ver]');
    if (ver) this.abrirVisor(Number(ver.dataset.ver));
  },

  abrirVisor(i) {
    this.actual = i;
    this.dibujarVisor();
    abrirModal($('modal-galeria-visor'));
  },

  dibujarVisor() {
    const f = state.fotos[this.actual];
    if (!f) { cerrarModal($('modal-galeria-visor')); this.render(); return; }
    const cont = $('galeria-visor-cuerpo');
    cont.innerHTML = `
      <div class="visor-escena"><img class="visor-img" src="${f.src}" alt="Recuerdo ampliado"></div>
      <div class="visor-nav">
        <button type="button" class="menu-btn" data-nav="-1">‹ Anterior</button>
        <span>${this.actual + 1} / ${state.fotos.length}</span>
        <button type="button" class="menu-btn" data-nav="1">Siguiente ›</button>
      </div>
      <form class="quien-form" id="visor-form">
        <select id="visor-cat">${ALBUM_CATEGORIAS.map(c => `<option${c === (f.categoria || 'Momentos') ? ' selected' : ''}>${c}</option>`).join('')}</select>
        <input id="visor-fecha" type="date" value="${f.fecha || ''}">
        <textarea id="visor-desc" rows="2" maxlength="300" placeholder="Describe este momento">${escaparHtml(f.descripcion || '')}</textarea>
        <div class="aventura-salidas">
          <button type="submit" class="menu-btn">💾 Guardar cambios</button>
          <button type="button" class="menu-btn" data-borrar-foto>🗑️ Eliminar</button>
        </div>
      </form>`;
    cont.onclick = e => {
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        const total = state.fotos.length;
        this.actual = (this.actual + Number(nav.dataset.nav) + total) % total;
        this.dibujarVisor();
        return;
      }
      if (e.target.closest('[data-borrar-foto]')) {
        const id = state.fotos[this.actual].id;
        this.eliminar(id);
        this.actual = Math.max(0, Math.min(this.actual, state.fotos.length - 1));
        this.dibujarVisor();
      }
    };
    cont.querySelector('#visor-form').onsubmit = e => {
      e.preventDefault();
      state.fotos[this.actual] = {
        ...state.fotos[this.actual],
        categoria: cont.querySelector('#visor-cat').value,
        fecha: cont.querySelector('#visor-fecha').value,
        descripcion: cont.querySelector('#visor-desc').value.trim(),
      };
      Storage.guardar();
      this.render();
      mostrarToast('💾 Cambios guardados');
    };
  },
};

/* =========================================================
   AVISO DE NOVEDADES
   Cada vez que CONFIG.version cambia, la próxima vez que se
   abra la página se muestra un aviso una sola vez.
========================================================= */
function revisarNovedades() {
  if (state.versionVista === CONFIG.version) return;
  const tieneUsoPrevio = state.amor > 0 || state.logrosDesbloqueados.length > 0 || state.lunaClicks > 0;
  state.versionVista = CONFIG.version;
  Storage.guardar();
  if (!tieneUsoPrevio) return; // primera visita de todas: no hay "novedades" que anunciar todavía
  setTimeout(() => {
    mostrarToast('✨ Actualizamos el universo: ahora hay un conteo para el próximo aniversario mensual y un panel de estadísticas nuestras.');
  }, 2600);
}

/* =========================================================
   23g. NUESTRAS ESTADÍSTICAS
========================================================= */
const Stats = {
  init() {
    this.grid = $('stats-grid');
  },
  render() {
    if (!this.grid) return;
    const dias = App.calcularDiasJuntos();
    const tiles = [
      [dias.toLocaleString('es'), 'días juntos'],
      [state.amor.toLocaleString('es'), 'corazones tocados'],
      [`${state.retosNotificados.length}/100`, 'retos cumplidos'],
      [`${state.logrosDesbloqueados.length}/${LOGROS.length}`, 'logros'],
      [`${state.secretosLunaVistos.length}/${CONFIG.clicksSecretosLuna.length}`, 'secretos de la luna'],
      [`${state.cancionesEscuchadas.length}/${CANCIONES.length}`, 'canciones escuchadas'],
      [state.constelacionesHechas, 'constelaciones'],
      [state.fotos.length, 'fotos guardadas'],
      [state.notas.length, 'notas guardadas'],
      [state.gustos.ella.length + state.gustos.el.length, 'gustos anotados'],
      [state.capsulas.length, 'cápsulas selladas'],
      [`${state.rachaDias} 🔥`, 'racha actual'],
      [`${state.rachaMaxima} 🔥`, 'racha más larga'],
      [state.hitosCelebrados.length, 'hitos celebrados'],
    ];
    this.grid.innerHTML = tiles.map(([n, e]) => `
      <div class="stat-tile"><span class="stat-numero">${n}</span><span class="stat-etiqueta">${e}</span></div>
    `).join('');
  },
};

/* =========================================================
   24. CHAT (vinculado por código, vía Firebase Firestore)
   ---------------------------------------------------------
   Uno de los dos genera un código de sala; el otro lo usa para
   unirse. Desde ahí, los mensajes se sincronizan en tiempo real
   y sin límite mientras el proyecto de Firebase esté activo.
   Ver FIREBASE_CONFIG al inicio de este archivo para activarlo.
========================================================= */
const Chat = {
  storageKey: 'universo-scarleth-chat',
  db: null,
  unsub: null,
  primeraCarga: false,
  datos: null, // { roomCode, nombre, deviceId }

  init() {
    this.panelVinculacion = $('chat-vinculacion');
    this.panelActivo = $('chat-activo');
    this.errorVinculacion = $('chat-vinculacion-error');
    this.nombreInput = $('chat-nombre-input');
    this.codigoInput = $('chat-codigo-input');
    this.codigoValorEl = $('chat-codigo-actual-valor');
    this.mensajesEl = $('chat-mensajes');
    this.indicadorEscribiendo = $('chat-escribiendo');
    this.form = $('chat-form');
    this.input = $('chat-input');
    if (!this.panelVinculacion) return;

    this.cargarDatosLocales();
    this.inicializarFirebase();

    $('chat-crear').addEventListener('click', () => this.crear());
    $('chat-unirse').addEventListener('click', () => this.unirse());
    this.codigoInput.addEventListener('input', () => {
      const pos = this.codigoInput.selectionStart;
      this.codigoInput.value = this.codigoInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      this.codigoInput.setSelectionRange(pos, pos);
    });
    $('chat-copiar-codigo').addEventListener('click', () => this.copiarCodigo());
    $('chat-desvincular').addEventListener('click', () => this.desvincular());
    this.form.addEventListener('submit', e => { e.preventDefault(); this.enviar(); });
    this.input.addEventListener('input', () => this.marcarEscribiendo());
  },

  inicializarFirebase() {
    if (typeof firebase === 'undefined') return;
    if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === 'TU_API_KEY') return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      this.db = firebase.firestore();
    } catch (e) { this.db = null; }
  },

  cargarDatosLocales() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.datos = raw ? JSON.parse(raw) : null;
      if (this.datos && this.datos.nombre) this.nombreInput.value = this.datos.nombre;
    } catch (e) { this.datos = null; }
  },

  guardarDatosLocales() {
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.datos)); } catch (e) { /* almacenamiento no disponible */ }
  },

  render() {
    if (!this.panelVinculacion) return;

    if (!this.db) {
      this.panelVinculacion.hidden = false;
      this.panelActivo.hidden = true;
      this.errorVinculacion.textContent = typeof firebase === 'undefined'
        ? '⚠️ El chat necesita conexión a internet para cargar.'
        : '⚠️ El chat todavía no está activado. Sigue las instrucciones dentro de script.js (busca FIREBASE_CONFIG) para activarlo gratis en unos minutos.';
      return;
    }

    if (this.datos && this.datos.roomCode) {
      this.panelVinculacion.hidden = true;
      this.panelActivo.hidden = false;
      this.codigoValorEl.textContent = this.datos.roomCode;
      this.escucharMensajes();
      this.escucharEscribiendo();
    } else {
      this.panelVinculacion.hidden = false;
      this.panelActivo.hidden = true;
      this.errorVinculacion.textContent = '';
    }
  },

  nombreValido() {
    const nombre = this.nombreInput.value.trim();
    if (!nombre) { this.errorVinculacion.textContent = 'Escribe tu nombre antes de continuar.'; return null; }
    return nombre;
  },

  crear() {
    const nombre = this.nombreValido();
    if (!nombre) return;
    const codigo = this.generarCodigo();
    this.vincular(codigo, nombre);
    mostrarToast('✨ Código creado: ' + codigo);
  },

  unirse() {
    const nombre = this.nombreValido();
    if (!nombre) return;
    const codigo = this.codigoInput.value.trim().toUpperCase();
    if (codigo.length < 4) { this.errorVinculacion.textContent = 'Escribe un código válido.'; return; }
    this.vincular(codigo, nombre);
  },

  vincular(codigo, nombre) {
    this.datos = { roomCode: codigo, nombre, deviceId: generarId() };
    this.guardarDatosLocales();
    this.errorVinculacion.textContent = '';
    this.render();
  },

  generarCodigo() {
    const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I/L, para evitar confusiones al leerlo
    let cod = '';
    for (let i = 0; i < 6; i++) cod += alfabeto[Math.floor(Math.random() * alfabeto.length)];
    return cod;
  },

  copiarCodigo() {
    if (!this.datos) return;
    const codigo = this.datos.roomCode;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codigo).then(() => mostrarToast('📋 Código copiado')).catch(() => mostrarToast('Código: ' + codigo));
    } else {
      mostrarToast('Código: ' + codigo);
    }
  },

  desvincular() {
    this.detenerEscucha();
    this.datos = null;
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* almacenamiento no disponible */ }
    if (this.mensajesEl) this.mensajesEl.innerHTML = '';
    this.render();
  },

  coleccion() {
    return this.db.collection('salas').doc(this.datos.roomCode).collection('mensajes');
  },

  escucharMensajes() {
    if (!this.db || !this.datos || this.unsub) return;
    this.mensajesEl.innerHTML = '<p class="chat-vacio">Cargando mensajes...</p>';
    this.primeraCarga = true;
    this.unsub = this.coleccion().orderBy('ts', 'asc').limitToLast(300).onSnapshot(
      snap => {
        this.renderMensajes(snap.docs.map(d => d.data()));
        this.primeraCarga = false;
      },
      () => { this.mensajesEl.innerHTML = '<p class="chat-vacio">No se pudieron cargar los mensajes. Revisa tu conexión.</p>'; }
    );
  },

  detenerEscucha() {
    if (this.unsub) { this.unsub(); this.unsub = null; }
    if (this.unsubEscribiendo) { this.unsubEscribiendo(); this.unsubEscribiendo = null; }
    if (this._intervaloEscribiendo) { clearInterval(this._intervaloEscribiendo); this._intervaloEscribiendo = null; }
    this._escribiendoDatos = {};
    if (this.datos) this.escribiendoRef().delete().catch(() => {});
  },

  // --- Indicador "está escribiendo..." ---
  escribiendoRef() {
    return this.db.collection('salas').doc(this.datos.roomCode).collection('escribiendo').doc(this.datos.deviceId);
  },

  marcarEscribiendo() {
    if (!this.db || !this.datos) return;
    const ahora = Date.now();
    if (this._ultimoAvisoEscribiendo && ahora - this._ultimoAvisoEscribiendo < 1500) return;
    this._ultimoAvisoEscribiendo = ahora;
    this.escribiendoRef().set({ nombre: this.datos.nombre, ts: ahora }).catch(() => {});
  },

  escucharEscribiendo() {
    if (!this.db || !this.datos || this.unsubEscribiendo) return;
    this._escribiendoDatos = {};
    this.unsubEscribiendo = this.db.collection('salas').doc(this.datos.roomCode).collection('escribiendo')
      .onSnapshot(snap => {
        this._escribiendoDatos = {};
        snap.docs.forEach(d => { if (d.id !== this.datos.deviceId) this._escribiendoDatos[d.id] = d.data(); });
        this.actualizarIndicadorEscribiendo();
      }, () => { /* si falla, simplemente no mostramos el indicador */ });
    this._intervaloEscribiendo = setInterval(() => this.actualizarIndicadorEscribiendo(), 1000);
  },

  actualizarIndicadorEscribiendo() {
    if (!this.indicadorEscribiendo) return;
    const ahora = Date.now();
    const activos = Object.values(this._escribiendoDatos || {}).filter(d => d.ts && ahora - d.ts < 3500);
    if (activos.length) {
      this.indicadorEscribiendo.textContent = `💬 ${activos[0].nombre || 'Está'} escribiendo…`;
      this.indicadorEscribiendo.hidden = false;
    } else {
      this.indicadorEscribiendo.hidden = true;
    }
  },

  renderMensajes(mensajes) {
    if (!mensajes.length) {
      this.mensajesEl.innerHTML = '<p class="chat-vacio">Todavía no hay mensajes. Escribe el primero 💌</p>';
      return;
    }
    const estabaAlFinal = this.primeraCarga
      || (this.mensajesEl.scrollTop + this.mensajesEl.clientHeight >= this.mensajesEl.scrollHeight - 40);

    this.mensajesEl.innerHTML = mensajes.map(m => {
      const mia = m.deviceId === this.datos.deviceId;
      const hora = m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      return `
        <div class="chat-burbuja ${mia ? 'mia' : 'otra'}">
          ${mia ? '' : `<span class="chat-autor">${escaparHtml(m.autor || '')}</span>`}
          <span class="chat-texto">${escaparHtml(m.texto || '')}</span>
          <span class="chat-hora">${hora}</span>
        </div>`;
    }).join('');

    if (estabaAlFinal) this.mensajesEl.scrollTop = this.mensajesEl.scrollHeight;
  },

  enviar() {
    const texto = this.input.value.trim();
    if (!texto || !this.db || !this.datos) return;
    this.input.value = '';
    this._ultimoAvisoEscribiendo = 0;
    this.escribiendoRef().delete().catch(() => {});
    this.coleccion().add({
      texto,
      autor: this.datos.nombre,
      deviceId: this.datos.deviceId,
      ts: Date.now(),
    }).then(() => {
      if (!state.chatUsado) { state.chatUsado = true; Storage.guardar(); Logros.revisar(); }
    }).catch(() => mostrarToast('No se pudo enviar el mensaje. Revisa tu conexión.'));
  },
};

/* =========================================================
   25. NOTAS / PENSAMIENTOS
   ---------------------------------------------------------
   Un espacio para guardar pensamientos sueltos, canciones,
   películas o cualquier cosa que quieran recordar juntos.
   Se guarda localmente, igual que el resto del progreso.
========================================================= */
const NOTAS_CATEGORIAS = {
  pensamiento: { icono: '💭', nombre: 'Pensamiento' },
  cancion: { icono: '🎵', nombre: 'Canción' },
  pelicula: { icono: '🎬', nombre: 'Película' },
  otro: { icono: '✨', nombre: 'Otro' },
};

const Notas = {
  categoriaActual: 'pensamiento',
  editandoId: null,

  init() {
    this.form = $('notas-form');
    this.textoInput = $('notas-texto');
    this.error = $('notas-error');
    this.lista = $('notas-lista');
    this.guardarBtn = $('notas-guardar-btn');
    this.chips = $('notas-categorias');
    if (!this.form) return;

    this.chips.querySelectorAll('.notas-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.categoriaActual = chip.dataset.cat;
        this.chips.querySelectorAll('.notas-chip').forEach(c => c.classList.toggle('activo', c === chip));
      });
    });

    this.form.addEventListener('submit', e => { e.preventDefault(); this.guardar(); });
    this.render();
  },

  guardar() {
    const texto = this.textoInput.value.trim();
    this.error.textContent = '';
    if (!texto) { this.error.textContent = 'Escribe algo antes de guardar.'; return; }

    if (this.editandoId) {
      const nota = state.notas.find(n => n.id === this.editandoId);
      if (nota) { nota.texto = texto; nota.categoria = this.categoriaActual; }
      this.cancelarEdicion();
    } else {
      state.notas.unshift({ id: generarId(), texto, categoria: this.categoriaActual, fecha: fechaLocalISO(new Date()) });
      if (!state.notasUsado) { state.notasUsado = true; Logros.revisar(); }
    }
    Storage.guardar();
    this.textoInput.value = '';
    this.render();
  },

  cancelarEdicion() {
    this.editandoId = null;
    this.guardarBtn.textContent = '💾 Guardar nota';
  },

  editar(id) {
    const nota = state.notas.find(n => n.id === id);
    if (!nota) return;
    this.textoInput.value = nota.texto;
    this.categoriaActual = nota.categoria;
    this.chips.querySelectorAll('.notas-chip').forEach(c => c.classList.toggle('activo', c.dataset.cat === nota.categoria));
    this.editandoId = id;
    this.guardarBtn.textContent = '💾 Guardar cambios';
    this.textoInput.focus();
  },

  eliminar(id) {
    state.notas = state.notas.filter(n => n.id !== id);
    if (this.editandoId === id) { this.cancelarEdicion(); this.textoInput.value = ''; }
    Storage.guardar();
    this.render();
  },

  render() {
    if (!this.lista) return;
    if (!state.notas.length) {
      this.lista.innerHTML = '<p class="capsula-vacio">Todavía no han guardado ninguna nota. Escriban la primera arriba ⬆️</p>';
      return;
    }
    this.lista.innerHTML = '';
    state.notas.forEach(n => {
      const cat = NOTAS_CATEGORIAS[n.categoria] || NOTAS_CATEGORIAS.otro;
      const div = document.createElement('div');
      div.className = 'nota';
      div.innerHTML = `
        <div class="nota-cabeza">
          <span class="nota-categoria">${cat.icono} ${cat.nombre}</span>
          <span class="nota-fecha">${formatFecha(n.fecha)}</span>
        </div>
        <p class="nota-texto">${escaparHtml(n.texto)}</p>
        <div class="nota-acciones">
          <button class="nota-editar" type="button" aria-label="Editar nota">✏️</button>
          <button class="nota-eliminar" type="button" aria-label="Eliminar nota">🗑️</button>
        </div>
      `;
      div.querySelector('.nota-editar').addEventListener('click', () => this.editar(n.id));
      div.querySelector('.nota-eliminar').addEventListener('click', () => this.eliminar(n.id));
      this.lista.appendChild(div);
    });
  },
};

/* =========================================================
   26. GUSTOS (qué le gusta a cada uno — editable)
========================================================= */
const Gustos = {
  init() {
    this.formularios = document.querySelectorAll('.gustos-form');
    if (!this.formularios.length) return;
    this.formularios.forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('.gustos-input');
        this.agregar(form.dataset.quien, input.value);
        input.value = '';
        input.focus();
      });
    });
    this.render();
  },

  agregar(quien, texto) {
    texto = texto.trim();
    if (!texto) return;
    if (!state.gustos[quien]) state.gustos[quien] = [];
    state.gustos[quien].push({ id: generarId(), texto });
    if (!state.gustosUsado) { state.gustosUsado = true; Logros.revisar(); }
    Storage.guardar();
    this.render();
  },

  editarTexto(quien, id, nuevoTexto) {
    const item = (state.gustos[quien] || []).find(g => g.id === id);
    if (!item) return;
    const limpio = nuevoTexto.trim();
    if (!limpio || limpio === item.texto) return;
    item.texto = limpio;
    Storage.guardar();
  },

  eliminar(quien, id) {
    state.gustos[quien] = (state.gustos[quien] || []).filter(g => g.id !== id);
    Storage.guardar();
    this.render();
  },

  render() {
    ['ella', 'el'].forEach(quien => {
      const ul = $('gustos-lista-' + quien);
      if (!ul) return;
      ul.innerHTML = '';
      const items = state.gustos[quien] || [];
      if (!items.length) {
        ul.innerHTML = '<li class="gustos-vacio">Nada agregado todavía.</li>';
        return;
      }
      items.forEach(g => {
        const li = document.createElement('li');
        li.className = 'gustos-item';
        li.innerHTML = `<span class="gustos-texto" contenteditable="true" spellcheck="false">${escaparHtml(g.texto)}</span><button class="gustos-eliminar" type="button" aria-label="Eliminar">✕</button>`;

        const span = li.querySelector('.gustos-texto');
        span.addEventListener('blur', () => {
          if (!span.textContent.trim()) { span.textContent = g.texto; return; }
          this.editarTexto(quien, g.id, span.textContent);
        });
        span.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
        });

        li.querySelector('.gustos-eliminar').addEventListener('click', () => this.eliminar(quien, g.id));
        ul.appendChild(li);
      });
    });
  },
};

/* =========================================================
   26. TEMAS VISUALES (6 cielos) Y AMBIENTE
   Cada tema solo cambia variables CSS y decoración; el contenido
   es el mismo. Las fuentes extra se cargan solo al elegir el tema.
========================================================= */
const TEMAS = {
  universo: { nombre: 'Nuestro Universo', desc: 'El cielo original, con aurora y estrellas.', swatch: 'linear-gradient(160deg,#020111,#191970 60%,#ff2d75)', ambiente: null },
  coraline: { nombre: 'Coraline', desc: 'Azul profundo, amarillo y violeta. Hay una puerta pequeña.', swatch: 'linear-gradient(160deg,#050c24,#1b1150 60%,#f4d35e)', ambiente: 'coraline' },
  pixel: { nombre: 'Pixel Love', desc: 'Estética de videojuego retro, con corazones de píxeles.', swatch: 'linear-gradient(160deg,#1a1033,#2b1a4f 60%,#ff4f9a)', ambiente: 'pixel', fuente: 'Press Start 2P' },
  jardin: { nombre: 'Jardín Mágico', desc: 'Flores de noche y luciérnagas.', swatch: 'linear-gradient(160deg,#0c2a1c,#2f6b3f 60%,#ffe66d)', ambiente: 'luciernagas' },
  atardecer: { nombre: 'Atardecer', desc: 'Colores cálidos, rosados y naranjas.', swatch: 'linear-gradient(160deg,#2a1747,#f0655a 60%,#ffb36b)', ambiente: 'polvo' },
  medianoche: { nombre: 'Medianoche', desc: 'Oscuro y elegante, con luna de cristal.', swatch: 'linear-gradient(160deg,#000005,#070a1f 60%,#9aa7ff)', ambiente: 'brillo' },
};

// max: partículas a la vez · cada: ms entre apariciones · vida: [mín, máx] ms
const AMBIENTES = {
  luciernagas: { max: 16, cada: 1100, clase: 'luciernaga', vida: [7000, 11000], vuelo: true },
  polvo:       { max: 22, cada: 650,  clase: 'polvo', vida: [9000, 13000], vuelo: true },
  pixel:       { max: 14, cada: 800,  clase: 'pixel-corazon', vida: [8000, 10000] },
  coraline:    { max: 20, cada: 600,  clase: 'coraline-particula', vida: [9000, 13000], vuelo: true },
  brillo:      { max: 10, cada: 1600, clase: 'brillo-suave', vida: [9000, 12000] },
};

const Temas = {
  actual: 'universo',
  timerAmbiente: null,

  init() {
    this.grid = $('temas-grid');
    this.capa = $('transicion-tema');
    this.ambienteEl = $('ambiente');
    const inicial = TEMAS[state.tema] ? state.tema : 'universo';
    this.aplicar(inicial, { animar: false, silencioso: true });
  },

  aplicar(id, { animar = true, silencioso = false } = {}) {
    if (!TEMAS[id]) id = 'universo';
    const cambiar = () => {
      this.actual = id;
      state.tema = id;
      document.body.dataset.tema = id;
      this.cargarFuente(TEMAS[id].fuente);
      this.iniciarAmbiente(TEMAS[id].ambiente);
      if (!state.temasProbados.includes(id)) state.temasProbados.push(id);
      Storage.guardar();
      this.marcarGrid();
      if (typeof Coraline !== 'undefined' && Coraline.puerta) Coraline.actualizarTextos();
      if (!silencioso) Logros.revisar();
    };
    // Transición: cortina que cubre, cambia el tema y se retira
    if (!animar || prefiereMovimientoReducido || !this.capa) { cambiar(); return; }
    this.capa.classList.add('activa');
    setTimeout(() => {
      cambiar();
      setTimeout(() => this.capa.classList.remove('activa'), 60);
    }, 380);
  },

  cargarFuente(familia) {
    if (!familia) return;
    const id = 'fuente-' + familia.toLowerCase().replace(/\s+/g, '-');
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(familia).replace(/%20/g, '+') + '&display=swap';
    document.head.appendChild(link);
  },

  // Un solo temporizador a la vez: al cambiar de tema se limpia el anterior
  iniciarAmbiente(tipo) {
    clearInterval(this.timerAmbiente);
    this.timerAmbiente = null;
    this.ambienteEl.innerHTML = '';
    if (!tipo || prefiereMovimientoReducido) return;

    const cfg = AMBIENTES[tipo];
    let vivos = 0;
    const crear = () => {
      if (pestanaOculta || vivos >= cfg.max) return;
      const p = document.createElement('span');
      p.className = 'ambiente-part ' + cfg.clase;
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = tipo === 'pixel' ? '-20px' : (Math.random() * 100) + '%';
      if (cfg.vuelo) {
        p.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
        p.style.setProperty('--y', (Math.random() * 160 - 100) + 'px');
      }
      const vida = cfg.vida[0] + Math.random() * (cfg.vida[1] - cfg.vida[0]);
      p.style.animationDuration = (vida / 1000) + 's';
      this.ambienteEl.appendChild(p);
      vivos++;
      setTimeout(() => { p.remove(); vivos--; }, vida);
    };
    for (let i = 0; i < Math.ceil(cfg.max / 2); i++) crear();
    this.timerAmbiente = setInterval(crear, cfg.cada);
  },

  renderGrid() {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    Object.entries(TEMAS).forEach(([id, t]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tema-card';
      btn.dataset.tema = id;
      btn.innerHTML = `<span class="tema-swatch" style="background:${t.swatch}"></span>
        <span class="tema-nombre">${t.nombre}</span>
        <span class="tema-desc">${t.desc}</span>`;
      btn.addEventListener('click', () => {
        cerrarModal($('modal-temas'));
        this.aplicar(id);
      });
      this.grid.appendChild(btn);
    });
    this.marcarGrid();
  },

  marcarGrid() {
    if (!this.grid) return;
    this.grid.querySelectorAll('.tema-card').forEach(b => {
      const activo = b.dataset.tema === this.actual;
      b.classList.toggle('activo', activo);
      b.setAttribute('aria-pressed', String(activo));
    });
  },
};

/* =========================================================
   26b. CORALINE: puerta pequeña, botones cosidos y mensajes
   Inspirado en el ambiente de fantasía oscura; contenido original.
========================================================= */
const CORALINE_BOTONES = [
  { id: 'b1', mensaje: 'Un botón cosido a mano: aquí empieza nuestro hilo.' },
  { id: 'b2', mensaje: 'Este botón guarda cada vez que me haces reír sin querer.' },
  { id: 'b3', mensaje: 'Con paciencia, puntada a puntada, así es como te quiero.' },
  { id: 'b4', mensaje: 'Si algún día te pierdes, busca donde brilla: ahí estaré.' },
  { id: 'b5', mensaje: 'El último botón es para ti: te quiero, Scarleth Rassel.' },
];
const CORALINE_BOTONES_PARA_PUERTA = 3;

const Coraline = {
  init() {
    this.puerta = $('puerta');
    this.pista = $('puerta-pista');
    this.contadorEl = $('botones-contador');
    this.decor = $('coraline-decor');
    this.lista = $('coraline-lista');
    if (!this.puerta) return;

    this.puerta.addEventListener('click', () => this.tocarPuerta());
    this.puerta.addEventListener('animationend', () => this.puerta.classList.remove('sacudir'));
    this.decor.addEventListener('click', e => {
      const boton = e.target.closest('.boton-cosido');
      if (boton) this.encontrarBoton(boton);
    });
    $('coraline-volver').addEventListener('click', () => cerrarModal($('modal-coraline-secreto')));

    if (state.coralinePuertaAbierta) this.puerta.classList.add('abierta');
    this.actualizarTextos();
  },

  actualizarTextos() {
    const n = state.coralineBotones.length;
    if (this.contadorEl) this.contadorEl.textContent = n;
    if (this.decor) {
      this.decor.querySelectorAll('.boton-cosido').forEach(b => {
        b.classList.toggle('encontrado', state.coralineBotones.includes(b.dataset.id));
      });
    }
    if (this.pista && !this.puerta.classList.contains('abierta')) {
      this.pista.textContent = n >= CORALINE_BOTONES_PARA_PUERTA
        ? 'La puerta ya te reconoce. Tócala.'
        : `Busca los botones cosidos escondidos en el universo. Llevas ${n} de ${CORALINE_BOTONES_PARA_PUERTA}.`;
    }
  },

  encontrarBoton(el) {
    const id = el.dataset.id;
    const info = CORALINE_BOTONES.find(b => b.id === id);
    if (!info) return;
    if (state.coralineBotones.includes(id)) { mostrarToast('🪡 Ya tienes este botón'); return; }

    state.coralineBotones.push(id);
    Storage.guardar();
    const r = el.getBoundingClientRect();
    Efectos.fuegosArtificiales(r.left + r.width / 2, r.top + r.height / 2);
    mostrarToast('🪡 ' + info.mensaje);
    this.actualizarTextos();
    Logros.revisar();
    Regalos.revisar();
  },

  tocarPuerta() {
    if (this.puerta.classList.contains('abierta')) { this.abrirSecreto(); return; }

    const n = state.coralineBotones.length;
    if (n < CORALINE_BOTONES_PARA_PUERTA) {
      this.puerta.classList.remove('sacudir');
      void this.puerta.offsetWidth; // reinicia la animación
      this.puerta.classList.add('sacudir');
      this.pista.textContent = `La puerta pide ${CORALINE_BOTONES_PARA_PUERTA} botones cosidos. Llevas ${n}.`;
      return;
    }

    this.puerta.classList.add('abierta');
    state.coralinePuertaAbierta = true;
    Storage.guardar();
    Logros.revisar();
    Regalos.revisar();
    Efectos.fuegosArtificiales();
    setTimeout(() => this.abrirSecreto(), 1100);
  },

  abrirSecreto() {
    this.renderLista();
    abrirModal($('modal-coraline-secreto'));
  },

  renderLista() {
    if (!this.lista) return;
    this.lista.innerHTML = '';
    CORALINE_BOTONES.forEach(b => {
      const hallado = state.coralineBotones.includes(b.id);
      const li = document.createElement('li');
      if (!hallado) li.className = 'bloqueado';
      li.textContent = hallado ? '🪡 ' + b.mensaje : '🔒 Botón sin encontrar';
      this.lista.appendChild(li);
    });
  },
};

/* =========================================================
   27. ARCADE DE NUESTRO UNIVERSO
========================================================= */
function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function recordDe(clave) { return state.records[clave] ?? null; }

// Guarda el valor solo si mejora el récord anterior. Devuelve true si es nuevo récord.
function registrarRecord(clave, valor, mayorEsMejor = true) {
  const actual = state.records[clave];
  const mejora = actual === undefined || (mayorEsMejor ? valor > actual : valor < actual);
  if (mejora) { state.records[clave] = valor; Storage.guardar(); }
  return mejora;
}

function ganarJuego(id) {
  state.juegosGanados[id] = (state.juegosGanados[id] || 0) + 1;
  Storage.guardar();
  Logros.revisar();
  Regalos.revisar();
}

function sumarContador(clave) {
  state[clave] = (state[clave] || 0) + 1;
  Storage.guardar();
  Logros.revisar();
}

const JUEGOS = [
  { id: 'memoria', icono: '🃏', nombre: 'Memoria de dos', desc: 'Encuentra las parejas, en tres niveles.' },
  { id: 'atrapa', icono: '💗', nombre: 'Atrapa los corazones', desc: '30 segundos para tocar corazones.' },
  { id: 'aventura', icono: '🚪', nombre: 'La puerta misteriosa', desc: 'Salas, objetos ocultos y acertijos.' },
  { id: 'quien', icono: '🧠', nombre: '¿Quién conoce mejor a quién?', desc: 'Preguntas que puedes editar tú.' },
  { id: 'historia', icono: '📜', nombre: 'Construye nuestra historia', desc: 'Ordena los recuerdos en su orden.' },
];

const Arcade = {
  timers: [],

  init() {
    const modal = $('modal-arcade');
    // Al cerrar la ventana se detienen todos los temporizadores del juego activo
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('.close')) this.limpiarTimers();
    });
  },

  limpiarTimers() {
    this.timers.forEach(id => { clearInterval(id); clearTimeout(id); });
    this.timers = [];
  },

  intervalo(fn, ms) {
    const id = setInterval(fn, ms);
    this.timers.push(id);
    return id;
  },

  // Espera que se borra sola de la lista al cumplirse (no acumula memoria)
  espera(fn, ms) {
    let id;
    id = setTimeout(() => { this.timers = this.timers.filter(t => t !== id); fn(); }, ms);
    this.timers.push(id);
    return id;
  },

  menu() {
    this.limpiarTimers();
    const cont = $('arcade-cuerpo');
    cont.innerHTML = `
      <p class="arcade-intro">Elige un juego. Récords y logros se guardan solos.</p>
      <div class="arcade-menu">
        ${JUEGOS.map(j => `
          <button type="button" class="arcade-juego" data-juego="${j.id}">
            <span class="arcade-icono">${j.icono}</span>
            <span class="arcade-nombre">${j.nombre}</span>
            <span class="arcade-desc">${j.desc}</span>
          </button>`).join('')}
      </div>`;
    cont.querySelectorAll('[data-juego]').forEach(b => b.addEventListener('click', () => this.abrir(b.dataset.juego)));
  },

  abrir(id) {
    this.limpiarTimers();
    const juego = JUEGOS.find(j => j.id === id);
    const cont = $('arcade-cuerpo');
    cont.innerHTML = `
      <div class="arcade-barra">
        <button type="button" class="menu-btn arcade-volver">← Volver</button>
        <span class="arcade-titulo">${juego.icono} ${juego.nombre}</span>
      </div>
      <div id="arcade-juego"></div>`;
    cont.querySelector('.arcade-volver').addEventListener('click', () => this.menu());
    const motores = { memoria: Memoria, atrapa: Atrapa, aventura: Aventura, quien: QuienConoce, historia: Historia };
    motores[id].iniciar(cont.querySelector('#arcade-juego'));
  },
};

/* ---------- Memoria de dos ---------- */
const MEMORIA_SIMBOLOS = ['❤️', '🌙', '⭐', '🌸', '🦋', '🍓', '🎵', '🔥', '🌈', '🍀', '🕯️', '💌'];
const MEMORIA_NIVELES = {
  facil: { nombre: 'Fácil', cols: 4, pares: 6 },
  medio: { nombre: 'Medio', cols: 4, pares: 8 },
  dificil: { nombre: 'Difícil', cols: 4, pares: 12 },
};

const Memoria = {
  iniciar(area, nivel = 'facil') {
    this.area = area;
    this.nivel = nivel;
    this.reiniciar();
  },

  reiniciar() {
    Arcade.limpiarTimers();
    const cfg = MEMORIA_NIVELES[this.nivel];
    const simbolos = barajar(MEMORIA_SIMBOLOS).slice(0, cfg.pares);
    this.cartas = barajar([...simbolos, ...simbolos]).map((s, id) => ({ id, s, visible: false, pareja: false }));
    Object.assign(this, { abiertas: [], movimientos: 0, inicio: null, segundos: 0, encontradas: 0, bloqueado: false, terminado: false });
    this.dibujar();
    Arcade.intervalo(() => this.tick(), 1000);
  },

  dibujar() {
    const cfg = MEMORIA_NIVELES[this.nivel];
    const record = recordDe('memoria-' + this.nivel);
    this.area.innerHTML = `
      <div class="arcade-stats">
        <span>Movimientos <b id="mem-mov">${this.movimientos}</b></span>
        <span>Tiempo <b id="mem-t">${this.segundos}s</b></span>
        <span>Récord <b>${record ?? '—'}</b></span>
      </div>
      <div class="arcade-chips">
        ${Object.entries(MEMORIA_NIVELES).map(([k, v]) =>
          `<button type="button" class="arcade-chip${k === this.nivel ? ' activo' : ''}" data-nivel="${k}">${v.nombre}</button>`).join('')}
      </div>
      <div class="memoria-tablero" style="grid-template-columns:repeat(${cfg.cols},1fr)">
        ${this.cartas.map(c => `
          <button type="button" class="memoria-carta${c.visible ? ' girada' : ''}${c.pareja ? ' pareja' : ''}" data-id="${c.id}" aria-label="Carta">
            <span class="memoria-cara frente">♡</span>
            <span class="memoria-cara dorso">${c.s}</span>
          </button>`).join('')}
      </div>
      <p class="arcade-mensaje" id="mem-msg"></p>
      <button type="button" class="menu-btn" id="mem-reiniciar">🔁 Empezar de nuevo</button>`;
    this.area.onclick = e => this.alTocar(e);
  },

  alTocar(e) {
    const nivel = e.target.closest('[data-nivel]');
    if (nivel) { this.nivel = nivel.dataset.nivel; this.reiniciar(); return; }
    if (e.target.closest('#mem-reiniciar')) { this.reiniciar(); return; }
    const carta = e.target.closest('.memoria-carta');
    if (carta) this.voltear(Number(carta.dataset.id));
  },

  voltear(id) {
    const c = this.cartas[id];
    if (this.bloqueado || this.terminado || c.visible || c.pareja) return;
    if (!this.inicio) this.inicio = Date.now();
    c.visible = true;
    this.abiertas.push(c);
    this.marcar(c);
    if (this.abiertas.length < 2) return;

    this.movimientos++;
    const [a, b] = this.abiertas;
    this.abiertas = [];
    this.actualizarStats();
    if (a.s === b.s) {
      a.pareja = b.pareja = true;
      this.marcar(a);
      this.marcar(b);
      this.encontradas++;
      this.mensaje('✨ ¡Pareja encontrada!');
      if (this.encontradas === this.cartas.length / 2) this.ganar();
    } else {
      this.bloqueado = true;
      Arcade.espera(() => {
        a.visible = b.visible = false;
        this.marcar(a);
        this.marcar(b);
        this.bloqueado = false;
      }, 800);
    }
  },

  marcar(c) {
    const el = this.area.querySelector(`.memoria-carta[data-id="${c.id}"]`);
    if (!el) return;
    el.classList.toggle('girada', c.visible);
    el.classList.toggle('pareja', c.pareja);
  },

  mensaje(t) {
    const m = this.area.querySelector('#mem-msg');
    if (m) m.textContent = t;
  },

  actualizarStats() {
    const mov = this.area.querySelector('#mem-mov');
    if (mov) mov.textContent = this.movimientos;
    const t = this.area.querySelector('#mem-t');
    if (t) t.textContent = this.segundos + 's';
  },

  tick() {
    if (!this.inicio || this.terminado) return;
    this.segundos = Math.floor((Date.now() - this.inicio) / 1000);
    this.actualizarStats();
  },

  ganar() {
    this.terminado = true;
    this.segundos = Math.floor((Date.now() - this.inicio) / 1000);
    const puntaje = Math.max(50, 1000 - this.movimientos * 12 - this.segundos * 3);
    const nuevo = registrarRecord('memoria-' + this.nivel, puntaje, true);
    ganarJuego('memoria');
    this.mensaje(`🎉 ¡Todas las parejas! Puntaje ${puntaje}${nuevo ? ' · ¡nuevo récord!' : ''}`);
    this.actualizarStats();
    Efectos.fuegosArtificiales();
  },
};

/* ---------- Atrapa los corazones ---------- */
const Atrapa = {
  DURACION: 30,

  iniciar(area) {
    this.area = area;
    this.dibujar();
  },

  dibujar() {
    this.area.innerHTML = `
      <div class="arcade-stats">
        <span>Puntos <b id="atr-pts">0</b></span>
        <span>Tiempo <b id="atr-t">${this.DURACION}</b></span>
        <span>Récord <b id="atr-rec">${recordDe('atrapa') ?? '—'}</b></span>
      </div>
      <div class="atrapa-campo" id="atr-campo">
        <p class="atrapa-aviso">Toca “Empezar” y atrapa los corazones 💗</p>
      </div>
      <button type="button" class="menu-btn" id="atr-empezar">▶ Empezar</button>`;
    this.campo = this.area.querySelector('#atr-campo');
    this.area.querySelector('#atr-empezar').addEventListener('click', () => this.empezar());
  },

  empezar() {
    Arcade.limpiarTimers();
    this.puntos = 0;
    this.nivel = 1;
    this.activo = true;
    this.campo.innerHTML = '';
    const btn = this.area.querySelector('#atr-empezar');
    btn.hidden = true;
    this.area.querySelector('#atr-pts').textContent = '0';

    const inicio = Date.now();
    Arcade.intervalo(() => {
      const transcurrido = (Date.now() - inicio) / 1000;
      const restante = Math.max(0, this.DURACION - transcurrido);
      this.nivel = Math.floor(transcurrido / 6) + 1; // sube de nivel cada 6 segundos
      this.area.querySelector('#atr-t').textContent = Math.ceil(restante);
      if (restante <= 0) this.terminar();
    }, 200);

    const siguiente = () => {
      if (!this.activo) return;
      this.soltar();
      Arcade.espera(siguiente, Math.max(380, 950 - this.nivel * 80));
    };
    siguiente();
  },

  soltar() {
    const dorado = Math.random() < 0.12;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'atrapa-corazon' + (dorado ? ' dorado' : '');
    el.textContent = dorado ? '💛' : '💗';
    el.setAttribute('aria-label', 'Corazón');
    el.style.left = (6 + Math.random() * 82) + '%';
    el.style.top = (8 + Math.random() * 74) + '%';
    const puntos = dorado ? 30 : 10;
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!this.activo || el.dataset.cogido) return;
      el.dataset.cogido = '1';
      this.puntos += puntos;
      this.area.querySelector('#atr-pts').textContent = this.puntos;
      el.classList.add('cogido');
      Arcade.espera(() => el.remove(), 220);
    });
    this.campo.appendChild(el);
    Arcade.espera(() => el.remove(), Math.max(700, 1700 - this.nivel * 120));
  },

  terminar() {
    this.activo = false;
    Arcade.limpiarTimers();
    this.campo.querySelectorAll('.atrapa-corazon').forEach(h => { h.disabled = true; });
    const nuevo = registrarRecord('atrapa', this.puntos, true);
    if (this.puntos >= 100) ganarJuego('atrapa');
    const p = document.createElement('p');
    p.className = 'atrapa-aviso';
    p.textContent = `¡Tiempo! Puntos: ${this.puntos}${nuevo ? ' · 🏆 ¡Nuevo récord!' : ''}`;
    this.campo.appendChild(p);
    this.area.querySelector('#atr-rec').textContent = recordDe('atrapa');
    const btn = this.area.querySelector('#atr-empezar');
    btn.hidden = false;
    btn.textContent = '🔁 Jugar otra vez';
  },
};

/* ---------- La puerta misteriosa (aventura) ---------- */
const AVENTURA_OBJETOS = {
  llave: 'llave pequeña',
  farol: 'farol encendido',
  'llave-biblioteca': 'llave de la biblioteca',
  nota: 'nota doblada',
  carta: 'carta escondida',
};

const AVENTURA_SALAS = {
  sala: {
    titulo: 'La sala de estar',
    texto: 'Una lámpara tibia y un sillón que siempre guarda el mejor lugar para ti.',
    objetos: [
      { id: 'cojin', icono: '🛋️', nombre: 'el cojín', texto: 'Debajo del cojín hay una llave pequeña.', da: 'llave' },
      { id: 'cuadro', icono: '🖼️', nombre: 'el cuadro', texto: 'En el cuadro aparecemos tú y yo, en un día de sol.' },
    ],
    salidas: [{ a: 'pasillo', texto: 'Ir al pasillo', requiere: 'llave' }],
  },
  pasillo: {
    titulo: 'El pasillo largo',
    texto: 'Las paredes tienen espacio para fotos que todavía no tomamos.',
    acertijo: {
      id: 'acert-pasillo',
      pregunta: 'Mientras más te doy, más cerca estás de mí. ¿Qué soy?',
      respuestas: ['ABRAZO', 'UN ABRAZO'],
      pista: 'Piensa en algo que se da con los brazos.',
      da: 'farol',
    },
    salidas: [{ a: 'jardin', texto: 'Ir al jardín', requiere: 'farol' }],
  },
  jardin: {
    titulo: 'El jardín de noche',
    texto: 'Hay un farol encendido y un banco que espera compañía.',
    objetos: [
      { id: 'banco', icono: '🪑', nombre: 'el banco', texto: 'Bajo el banco encontraste una nota doblada.', da: 'nota' },
    ],
    acertijo: {
      id: 'acert-jardin',
      pregunta: 'Tengo teclas, pero no abro puertas; tengo voz, pero no hablo. ¿Qué soy?',
      respuestas: ['PIANO', 'UN PIANO'],
      pista: 'Se toca con las manos y suena muy bonito.',
      da: 'llave-biblioteca',
    },
    salidas: [{ a: 'biblioteca', texto: 'Entrar a la biblioteca', requiere: 'llave-biblioteca' }],
  },
  biblioteca: {
    titulo: 'La biblioteca',
    texto: 'Libros con cosas que nos pasaron y otras que todavía vendrán.',
    objetos: [
      { id: 'libro', icono: '📕', nombre: 'el libro rojo', texto: 'Entre sus páginas hay una carta para ti.', da: 'carta' },
    ],
    salidas: [{ a: 'final', texto: 'Abrir la puerta final', requiere: 'carta' }],
  },
  final: { titulo: 'La puerta final', texto: '', final: true },
};

const Aventura = {
  iniciar(area) {
    this.area = area;
    this.dibujar();
  },

  dibujar() {
    const { sala, inventario, hallados } = state.aventura;
    const s = AVENTURA_SALAS[sala];
    if (s.final) { this.final(); return; }

    const objetos = (s.objetos || []).map(o => {
      const hallado = hallados.includes(o.id);
      return `<button type="button" class="aventura-objeto${hallado ? ' hallado' : ''}" data-objeto="${o.id}" ${hallado ? 'disabled' : ''}>
        <span>${o.icono}</span> ${hallado ? '✓ ' + o.nombre : 'Mirar ' + o.nombre}</button>`;
    }).join('');

    const pistas = (s.objetos || []).filter(o => hallados.includes(o.id))
      .map(o => `<li>${o.texto}</li>`).join('');

    let acertijo = '';
    if (s.acertijo) {
      acertijo = hallados.includes(s.acertijo.id)
        ? '<p class="aventura-resuelto">✓ Acertijo resuelto</p>'
        : `<div class="aventura-acertijo">
            <p>${s.acertijo.pregunta}</p>
            <div class="aventura-respuesta">
              <input id="av-respuesta" maxlength="40" placeholder="Tu respuesta" autocomplete="off">
              <button type="button" class="menu-btn" id="av-responder">Responder</button>
            </div>
          </div>`;
    }

    const salidas = s.salidas.map(x => {
      const abierta = inventario.includes(x.requiere);
      return abierta
        ? `<button type="button" class="menu-btn" data-salida="${x.a}">${x.texto}</button>`
        : `<button type="button" class="menu-btn" disabled>${x.texto} · necesitas: ${AVENTURA_OBJETOS[x.requiere]}</button>`;
    }).join('');

    this.area.innerHTML = `
      <p class="aventura-sala">${s.titulo}</p>
      <p class="aventura-texto">${s.texto}</p>
      <div class="aventura-objetos">${objetos}</div>
      ${pistas ? `<ul class="aventura-pistas">${pistas}</ul>` : ''}
      ${acertijo}
      <div class="aventura-salidas">${salidas}</div>
      <p class="aventura-inv"><b>Inventario:</b> ${inventario.length ? inventario.map(i => AVENTURA_OBJETOS[i]).join(' · ') : 'vacío'}</p>
      <p class="arcade-mensaje" id="av-msg"></p>
      <button type="button" class="menu-btn" id="av-reiniciar">🔁 Empezar la aventura de nuevo</button>`;
    this.area.onclick = e => this.alTocar(e);
  },

  alTocar(e) {
    if (e.target.closest('#av-reiniciar')) {
      state.aventura = { sala: 'sala', inventario: [], hallados: [], finalizada: false };
      Storage.guardar();
      this.dibujar();
      return;
    }
    const objeto = e.target.closest('[data-objeto]');
    if (objeto) { this.mirar(objeto.dataset.objeto); return; }
    const salida = e.target.closest('[data-salida]');
    if (salida) {
      state.aventura.sala = salida.dataset.salida;
      Storage.guardar();
      this.dibujar();
      return;
    }
    if (e.target.closest('#av-responder')) this.responder();
  },

  mirar(id) {
    const o = AVENTURA_SALAS[state.aventura.sala].objetos.find(x => x.id === id);
    state.aventura.hallados.push(id);
    if (o.da) state.aventura.inventario.push(o.da);
    Storage.guardar();
    this.dibujar();
  },

  responder() {
    const s = AVENTURA_SALAS[state.aventura.sala];
    const r = normalizarRespuesta(this.area.querySelector('#av-respuesta').value);
    const ok = s.acertijo.respuestas.map(normalizarRespuesta).includes(r);
    if (!ok) {
      this.area.querySelector('#av-msg').textContent = '🤔 Aún no... ' + s.acertijo.pista;
      return;
    }
    state.aventura.hallados.push(s.acertijo.id);
    state.aventura.inventario.push(s.acertijo.da);
    Storage.guardar();
    mostrarToast('🗝️ ¡Respuesta correcta!');
    this.dibujar();
  },

  final() {
    if (!state.aventura.finalizada) {
      state.aventura.finalizada = true;
      Storage.guardar();
      ganarJuego('aventura');
      Efectos.fuegosArtificiales();
    }
    this.area.innerHTML = `
      <p class="quiz-puntaje">💞</p>
      <p class="quiz-mensaje">Llegaste hasta el final de la puerta. Lo que hay aquí es sencillo: te quiero, Scarleth Rassel. Gracias por cada pista y cada acertijo.</p>
      <button type="button" class="menu-btn" id="av-reiniciar">🔁 Volver a empezar la aventura</button>`;
    this.area.onclick = e => this.alTocar(e);
  },
};

function normalizarRespuesta(t) {
  return normalizarTexto(t || '').replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

/* ---------- ¿Quién conoce mejor a quién? ---------- */
const PREGUNTAS_QUIEN_BASE = [
  { pregunta: 'Cuando algo me preocupa, ¿qué suelo hacer?', opciones: ['Me lo guardo', 'Lo hablo contigo', 'Me pongo a limpiar'], correcta: 1 },
  { pregunta: 'Si tuviéramos una tarde libre, ¿qué elegiría?', opciones: ['Cine', 'Caminar sin rumbo', 'Dormir todo el día'], correcta: 1 },
  { pregunta: '¿Qué es lo que más me hace reír?', opciones: ['Los memes', 'Tus ocurrencias', 'Las películas de terror'], correcta: 1 },
];

const QuienConoce = {
  iniciar(area) {
    this.area = area;
    this.menu();
  },

  lista() { return state.preguntasQuien ?? PREGUNTAS_QUIEN_BASE; },

  menu() {
    const n = this.lista().length;
    this.area.innerHTML = `
      <p class="arcade-intro">Responde lo que crees que yo elegiría. Puedes cambiar las preguntas cuando quieras.</p>
      <div class="arcade-stats"><span>Preguntas guardadas <b>${n}</b></span><span>Récord <b>${recordDe('quien') ?? '—'}</b></span></div>
      <div class="aventura-salidas">
        <button type="button" class="menu-btn" data-accion="jugar" ${n ? '' : 'disabled'}>▶ Jugar</button>
        <button type="button" class="menu-btn" data-accion="editar">✏️ Editar preguntas</button>
      </div>`;
    this.area.onclick = e => {
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      if (a.dataset.accion === 'jugar') this.jugar();
      if (a.dataset.accion === 'editar') this.editar();
    };
  },

  jugar() {
    this.q = barajar(this.lista()).slice(0, 10);
    this.i = 0;
    this.puntos = 0;
    this.bloqueado = false;
    this.mostrarPregunta();
  },

  mostrarPregunta() {
    const p = this.q[this.i];
    this.area.innerHTML = `
      <div class="arcade-stats"><span>Pregunta ${this.i + 1} / ${this.q.length}</span><span>Puntos <b>${this.puntos}</b></span></div>
      <p class="quiz-pregunta">${escaparHtml(p.pregunta)}</p>
      <div class="quiz-opciones">
        ${p.opciones.map((o, idx) => `<button type="button" class="quiz-opcion" data-i="${idx}">${escaparHtml(o)}</button>`).join('')}
      </div>`;
    this.area.onclick = e => {
      const b = e.target.closest('.quiz-opcion');
      if (b) this.responder(Number(b.dataset.i));
    };
  },

  responder(i) {
    if (this.bloqueado) return;
    this.bloqueado = true;
    const p = this.q[this.i];
    this.area.querySelectorAll('.quiz-opcion').forEach((b, idx) => {
      b.disabled = true;
      if (idx === p.correcta) b.classList.add('correcta');
      else if (idx === i) b.classList.add('incorrecta');
    });
    if (i === p.correcta) this.puntos++;
    Arcade.espera(() => {
      this.bloqueado = false;
      this.i++;
      if (this.i < this.q.length) this.mostrarPregunta();
      else this.fin();
    }, 900);
  },

  fin() {
    const total = this.q.length;
    const nuevo = registrarRecord('quien', this.puntos, true);
    ganarJuego('quien');
    const pct = this.puntos / total;
    const msg = pct === 1 ? '🏆 Puntaje perfecto: nos conocemos de verdad.'
      : pct >= 0.6 ? '💗 Muy bien. Lo que falló, lo platicamos.'
      : '🌱 No pasa nada: esta es la parte bonita de conocerse.';
    this.area.innerHTML = `
      <p class="quiz-puntaje">${this.puntos} / ${total}</p>
      <p class="quiz-mensaje">${msg}${nuevo ? ' · ¡Nuevo récord!' : ''}</p>
      <div class="aventura-salidas">
        <button type="button" class="menu-btn" data-accion="jugar">🔁 Jugar otra vez</button>
        <button type="button" class="menu-btn" data-accion="editar">✏️ Editar preguntas</button>
      </div>`;
    this.area.onclick = e => {
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      if (a.dataset.accion === 'jugar') this.jugar();
      if (a.dataset.accion === 'editar') this.editar();
    };
  },

  editar() {
    const filas = this.lista().map((p, idx) => `
      <li class="quien-fila"><span>${escaparHtml(p.pregunta)}</span>
        <button type="button" class="quien-borrar" data-borrar="${idx}" aria-label="Borrar pregunta">🗑️</button></li>`).join('');
    this.area.innerHTML = `
      <form id="qq-form" class="quien-form">
        <input id="qq-pregunta" placeholder="Escribe la pregunta" maxlength="160" autocomplete="off">
        <input class="qq-op" placeholder="Opción 1" maxlength="60" autocomplete="off">
        <input class="qq-op" placeholder="Opción 2" maxlength="60" autocomplete="off">
        <input class="qq-op" placeholder="Opción 3" maxlength="60" autocomplete="off">
        <label class="quien-correcta">Respuesta correcta:
          <select id="qq-correcta"><option value="0">Opción 1</option><option value="1">Opción 2</option><option value="2">Opción 3</option></select>
        </label>
        <button type="submit" class="menu-btn">➕ Agregar pregunta</button>
        <p id="qq-error" class="capsula-error" aria-live="polite"></p>
      </form>
      <ul class="quien-lista">${filas || '<li class="bloqueado">No hay preguntas. Agrega una arriba.</li>'}</ul>
      <button type="button" class="menu-btn" data-accion="menu">← Volver</button>`;

    this.area.onsubmit = e => {
      e.preventDefault();
      const pregunta = this.area.querySelector('#qq-pregunta').value.trim();
      const opciones = [...this.area.querySelectorAll('.qq-op')].map(x => x.value.trim());
      const error = this.area.querySelector('#qq-error');
      if (!pregunta || opciones.some(o => !o)) { error.textContent = 'Completa la pregunta y las tres opciones.'; return; }
      if (new Set(opciones).size < 3) { error.textContent = 'Las tres opciones deben ser distintas.'; return; }
      const correcta = Number(this.area.querySelector('#qq-correcta').value);
      state.preguntasQuien = [...this.lista(), { pregunta, opciones, correcta }];
      Storage.guardar();
      this.editar();
    };
    this.area.onclick = e => {
      const borrar = e.target.closest('[data-borrar]');
      if (borrar) {
        const lista = [...this.lista()];
        lista.splice(Number(borrar.dataset.borrar), 1);
        state.preguntasQuien = lista;
        Storage.guardar();
        this.editar();
        return;
      }
      if (e.target.closest('[data-accion="menu"]')) this.menu();
    };
  },
};

/* ---------- Construye nuestra historia ---------- */
const MEMORIAS_ORDEN = [
  { orden: 1, texto: 'Nuestro primer mensaje' },
  { orden: 2, texto: 'La primera vez que nos vimos sin prisa' },
  { orden: 3, texto: 'Ese día que la lluvia nos atrapó' },
  { orden: 4, texto: 'El primer “te quiero”' },
  { orden: 5, texto: 'La primera canción que compartimos' },
  { orden: 6, texto: 'Hoy: estos recuerdos, juntos' },
];

const Historia = {
  iniciar(area) {
    this.area = area;
    this.reiniciar();
  },

  reiniciar() {
    this.tarjetas = barajar(MEMORIAS_ORDEN);
    this.siguiente = 1;
    this.errores = 0;
    this.dibujar();
  },

  dibujar() {
    const colocadas = MEMORIAS_ORDEN.filter(m => m.orden < this.siguiente).sort((a, b) => a.orden - b.orden);
    const pendientes = this.tarjetas.filter(m => m.orden >= this.siguiente);
    this.area.innerHTML = `
      <p class="arcade-intro">Toca los recuerdos en el orden en que pasaron.</p>
      <div class="arcade-stats"><span>Errores <b>${this.errores}</b></span><span>Siguiente: <b>${this.siguiente}</b></span></div>
      <ol class="historia-linea">${colocadas.map(m => `<li>${m.texto}</li>`).join('') || '<li class="bloqueado">Aún no hay recuerdos colocados</li>'}</ol>
      <div class="historia-tarjetas">
        ${pendientes.map(m => `<button type="button" class="historia-tarjeta" data-orden="${m.orden}">${m.texto}</button>`).join('')}
      </div>
      <p class="arcade-mensaje" id="hi-msg"></p>
      <button type="button" class="menu-btn" data-accion="reiniciar">🔁 Reiniciar</button>`;
    this.area.onclick = e => this.alTocar(e);
  },

  alTocar(e) {
    if (e.target.closest('[data-accion="reiniciar"]')) { this.reiniciar(); return; }
    const t = e.target.closest('.historia-tarjeta');
    if (!t) return;
    if (Number(t.dataset.orden) === this.siguiente) {
      this.siguiente++;
      if (this.siguiente > MEMORIAS_ORDEN.length) this.completar();
      else this.dibujar();
    } else {
      this.errores++;
      t.classList.add('sacudir');
      this.area.querySelector('.arcade-stats b').textContent = this.errores;
      this.area.querySelector('#hi-msg').textContent = 'Ese recuerdo va más adelante. ¡Tú puedes!';
    }
  },

  completar() {
    registrarRecord('historia', this.errores, false);
    ganarJuego('historia');
    const sinErrores = this.errores === 0;
    App.agregarAmor(5, {});
    this.area.innerHTML = `
      <p class="quiz-puntaje">💞</p>
      <p class="quiz-mensaje">Ordenaste toda nuestra historia${sinErrores ? ' sin un solo error' : ''}. Recompensa: 5 corazones extra en el medidor.</p>
      <ol class="historia-linea">${MEMORIAS_ORDEN.map(m => `<li>${m.texto}</li>`).join('')}</ol>
      <button type="button" class="menu-btn" data-accion="reiniciar">🔁 Jugar otra vez</button>`;
    this.area.onclick = e => { if (e.target.closest('[data-accion="reiniciar"]')) this.reiniciar(); };
    Efectos.fuegosArtificiales();
  },
};

/* =========================================================
   28. SORPRESAS ROMÁNTICAS
========================================================= */

/* ---------- A. Máquina de mensajes ---------- */
const MENSAJES_MAQUINA = [
  'Hay días en los que pienso en ti sin razón, y me parece la mejor razón del mundo.',
  'Si el universo tuviera un solo lugar cálido, sería a tu lado.',
  'Me gusta cómo suena tu nombre cuando lo digo despacio.',
  'Gracias por ser la persona con la que quiero compartir las cosas pequeñas.',
  'Mi parte favorita del día es cuando sé que vas a escribirme.',
  'No necesito un plan perfecto; me basta con estar contigo.',
  'Te elegiría en cada versión posible de esta historia.',
  'Eres mi calma cuando todo se mueve muy rápido.',
  'Cada vez que te veo, me acuerdo de por qué creo en el amor.',
  'Quiero hacerte reír hasta que se nos olvide qué nos tenía tristes.',
  'Tu forma de cuidar a las personas me enamora todos los días.',
  'Si pudiera guardar un momento en un frasco, sería cualquiera contigo.',
  'Eres la razón por la que mis mañanas empiezan mejor.',
  'Me encanta que seamos equipo, incluso cuando discutimos por tonterías.',
  'Hoy te pienso con una sonrisa que no puedo esconder.',
  'Eres mi lugar seguro, mi risa favorita y mi casa.',
  'Contigo aprendí que la paciencia también puede ser romántica.',
  'Ojalá sepas cuánto significas para mí, aunque no lo diga tan seguido.',
  'Si la vida fuera una canción, tu voz sería el coro que nunca cansa.',
  'Quiero seguir construyendo recuerdos contigo, uno por uno.',
  'Gracias por las veces que me escuchas sin querer arreglar nada.',
  'Eres bonita por dentro y por fuera, y eso me vuelve loco de la mejor manera.',
  'Te quiero más que ayer y menos que mañana.',
  'Cuando dudo de algo, tu sonrisa me lo aclara todo.',
  'Mi mejor plan para cualquier día es el que hacemos juntos.',
  'Eres la mejor decisión que tomé sin pensarlo demasiado.',
  'Te mando un abrazo largo, de los que no se terminan rápido.',
  'Me gusta imaginarnos viejitos, riéndonos de las mismas cosas.',
  'Hay amores que se buscan, y otros que se reconocen. Tú fuiste de los segundos.',
  'No hay día en el que no tenga algo bonito que contarte.',
  'Eres mi persona favorita para compartir el silencio.',
];

const Maquina = {
  render() {
    const cont = $('maquina-cuerpo');
    cont.innerHTML = `
      <div class="maquina-pantalla"><p id="maq-texto" class="maquina-texto" aria-live="polite"></p><span class="maquina-cursor">▍</span></div>
      <button type="button" class="btn-primario" id="maq-btn"><span>Dame otro mensaje</span></button>`;
    this.texto = cont.querySelector('#maq-texto');
    this.recientes = [];
    cont.querySelector('#maq-btn').addEventListener('click', () => this.nuevo());
    this.nuevo();
  },

  nuevo() {
    // Evita repetir los últimos mensajes mostrados
    const disponibles = MENSAJES_MAQUINA.map((_, i) => i).filter(i => !this.recientes.includes(i));
    const i = disponibles[Math.floor(Math.random() * disponibles.length)];
    this.recientes.push(i);
    if (this.recientes.length > 6) this.recientes.shift();
    this.escribir(MENSAJES_MAQUINA[i]);
  },

  escribir(txt) {
    this.token = (this.token || 0) + 1;
    const token = this.token;
    let k = 0;
    this.texto.textContent = '';
    const paso = () => {
      if (token !== this.token || !this.texto.isConnected) return;
      if (k < txt.length) {
        this.texto.textContent += txt[k++];
        setTimeout(paso, 28);
      }
    };
    paso();
  },
};

/* ---------- B. Sobre misterioso ---------- */
const CARTAS_SOBRE = [
  'Primera carta: si algún día dudas de cuánto te quiero, mira cuántas veces volviste aquí. Esa es mi respuesta.',
  'Segunda carta: te escribo esto con calma porque quiero que lo leas sin prisa, como lo siento yo.',
  'Tercera carta: no tengo un plan perfecto para nosotros, pero sí muchas ganas de vivirlo contigo.',
  'Cuarta carta: gracias por esa forma tuya de hacer que cualquier día normal se sienta especial.',
  'Quinta carta: por ahora esta es la última, pero puedes volver al sobre cuando quieras. Te quiero.',
];

const Sobre = {
  render() {
    const cont = $('sobre-cuerpo');
    cont.innerHTML = `
      <div class="sobre-escena">
        <div class="sobre" id="sobre" role="button" tabindex="0" aria-label="Abrir sobre">
          <div class="sobre-carta"><p id="sobre-texto"></p></div>
          <div class="sobre-tapa"></div>
          <div class="sobre-cuerpo"></div>
          <div class="sobre-sello">♥</div>
        </div>
      </div>
      <p class="arcade-desc" id="sobre-info">Toca el sobre para abrirlo.</p>
      <button type="button" class="menu-btn" id="sobre-cerrar" hidden>✉️ Guardar y cerrar</button>`;
    this.sobre = cont.querySelector('#sobre');
    this.textoEl = cont.querySelector('#sobre-texto');
    this.info = cont.querySelector('#sobre-info');
    this.btn = cont.querySelector('#sobre-cerrar');
    this.abierto = false;
    this.indice = 0;
    this.sobre.addEventListener('click', () => this.abrir());
    this.btn.addEventListener('click', () => this.cerrar());
  },

  abrir() {
    if (this.abierto) return;
    this.abierto = true;
    this.textoEl.textContent = CARTAS_SOBRE[this.indice % CARTAS_SOBRE.length];
    this.indice++;
    this.sobre.classList.add('abierto');
    this.info.textContent = `Carta ${((this.indice - 1) % CARTAS_SOBRE.length) + 1} de ${CARTAS_SOBRE.length}`;
    this.btn.hidden = false;
    sumarContador('sobresAbiertos');
  },

  cerrar() {
    this.abierto = false;
    this.sobre.classList.remove('abierto');
    this.btn.hidden = true;
    this.info.textContent = 'Toca el sobre para abrir otra carta.';
    setTimeout(() => { this.textoEl.textContent = ''; }, 600);
  },
};

/* ---------- C. Calendario de recuerdos ---------- */
const Calendario = {
  mes: null,
  dia: null,

  render() {
    if (!this.mes) { const hoy = new Date(); this.mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1); }
    this.dibujar();
  },

  dibujar() {
    const cont = $('calendario-cuerpo');
    const y = this.mes.getFullYear();
    const m = this.mes.getMonth();
    const primerDia = (new Date(y, m, 1).getDay() + 6) % 7; // semana empieza en lunes
    const dias = new Date(y, m + 1, 0).getDate();
    const hoyISO = fechaLocalISO(new Date());

    let celdas = '';
    for (let i = 0; i < primerDia; i++) celdas += '<span class="cal-vacio"></span>';
    for (let d = 1; d <= dias; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tiene = state.recuerdosCalendario.some(r => r.fecha === iso);
      celdas += `<button type="button" class="cal-dia${iso === hoyISO ? ' hoy' : ''}${iso === this.dia ? ' sel' : ''}${tiene ? ' con-recuerdo' : ''}" data-fecha="${iso}">${d}</button>`;
    }

    const nombreMes = NOMBRES_MES[m].charAt(0).toUpperCase() + NOMBRES_MES[m].slice(1);
    cont.innerHTML = `
      <div class="cal-cabecera">
        <button type="button" class="cal-nav" data-mes="-1" aria-label="Mes anterior">‹</button>
        <b>${nombreMes} ${y}</b>
        <button type="button" class="cal-nav" data-mes="1" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-semana"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
      <div class="cal-grid">${celdas}</div>
      <div class="cal-panel">${this.panel()}</div>`;
    cont.onclick = e => this.alTocar(e);
    cont.onsubmit = e => { e.preventDefault(); this.guardar(e.target); };
  },

  panel() {
    if (!this.dia) return '<p class="arcade-desc">Toca un día para ver o agregar recuerdos 💭</p>';
    const lista = state.recuerdosCalendario.filter(r => r.fecha === this.dia);
    const filas = lista.map(r => `
      <li class="cal-recuerdo">
        <span>${escaparHtml(r.texto)}${r.fotoId ? ' 📷' : ''}</span>
        <button type="button" class="quien-borrar" data-borrar="${r.id}" aria-label="Borrar recuerdo">🗑️</button>
      </li>`).join('');
    return `
      <h3 class="cal-fecha">${formatFecha(this.dia)}</h3>
      <ul class="coraline-lista">${filas || '<li class="bloqueado">Aún no hay recuerdos este día.</li>'}</ul>
      <form class="quien-form">
        <textarea id="cal-texto" rows="2" maxlength="300" placeholder="¿Qué pasó este día?"></textarea>
        <label class="galeria-subir cal-foto">📷 Añadir foto (opcional)<input type="file" id="cal-foto" accept="image/*" hidden></label>
        <button type="submit" class="menu-btn">💾 Guardar recuerdo</button>
      </form>`;
  },

  alTocar(e) {
    const nav = e.target.closest('[data-mes]');
    if (nav) {
      this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() + Number(nav.dataset.mes), 1);
      this.dibujar();
      return;
    }
    const dia = e.target.closest('[data-fecha]');
    if (dia) { this.dia = dia.dataset.fecha; this.dibujar(); return; }
    const borrar = e.target.closest('[data-borrar]');
    if (borrar) this.borrar(borrar.dataset.borrar);
  },

  async guardar(form) {
    const texto = form.querySelector('#cal-texto').value.trim();
    if (!texto) { mostrarToast('Escribe algo para recordar 💭'); return; }
    const recuerdo = { id: generarId(), fecha: this.dia, texto };
    const archivo = form.querySelector('#cal-foto').files[0];
    if (archivo) {
      try {
        const src = await Album.comprimir(archivo);
        const fotoId = Album.agregarFoto(src, { categoria: 'Especiales', descripcion: texto, fecha: this.dia });
        if (fotoId) recuerdo.fotoId = fotoId;
      } catch (err) {
        mostrarToast('No pude leer esa foto; el recuerdo sí se guardó.');
      }
    }
    state.recuerdosCalendario.push(recuerdo);
    Storage.guardar();
    Logros.revisar();
    this.dibujar();
  },

  borrar(id) {
    state.recuerdosCalendario = state.recuerdosCalendario.filter(r => r.id !== id);
    Storage.guardar();
    this.dibujar();
  },
};

/* ---------- D. Generador de citas ---------- */
const TIPOS_CITA = { todas: 'Todas', casa: 'En casa', aire: 'Al aire libre', economico: 'Económicas', romantico: 'Románticas', creativo: 'Creativas' };
const CITAS_BANCO = [
  { texto: 'Pícnic en el parque: cada uno lleva una sorpresa pequeña.', tipos: ['aire', 'economico', 'romantico'] },
  { texto: 'Noche de película con palomitas hechas en casa.', tipos: ['casa', 'economico'] },
  { texto: 'Mirar las estrellas desde un lugar sin luces de la ciudad.', tipos: ['aire', 'romantico'] },
  { texto: 'Escribirnos una carta de tres líneas y leerla en voz alta.', tipos: ['casa', 'creativo', 'economico'] },
  { texto: 'Cocinar algo improvisado con lo que haya en la alacena.', tipos: ['casa', 'creativo', 'economico'] },
  { texto: 'Ir a un mirador a ver el atardecer.', tipos: ['aire', 'romantico'] },
  { texto: 'Caminata sin destino, con una foto cada diez minutos.', tipos: ['aire', 'creativo', 'economico'] },
  { texto: 'Cena a la luz de velas en la sala.', tipos: ['casa', 'romantico', 'economico'] },
  { texto: 'Dibujarnos mutuamente un retrato a propósito muy malo.', tipos: ['casa', 'creativo', 'economico'] },
  { texto: 'Helado de tarde en un lugar que todavía no conozcamos.', tipos: ['aire', 'economico'] },
  { texto: 'Noche de juegos de mesa con premio para el ganador.', tipos: ['casa', 'economico'] },
  { texto: 'Elegir una canción para cada uno y bailarlas en la sala.', tipos: ['casa', 'romantico'] },
  { texto: 'Visitar una librería y elegirnos un libro mutuamente.', tipos: ['aire', 'creativo', 'romantico'] },
  { texto: 'Tarde de mantas, té y nuestra playlist de fondo.', tipos: ['casa', 'romantico', 'economico'] },
  { texto: 'Pasear de noche por una calle que no conozcamos.', tipos: ['aire', 'romantico', 'creativo'] },
  { texto: 'Desayuno en la cama con mensajes escondidos en la servilleta.', tipos: ['casa', 'romantico'] },
];

const Citas = {
  filtro: 'todas',
  actual: null,

  render() {
    this.dibujar();
  },

  dibujar() {
    const cont = $('citas-cuerpo');
    const guardadas = state.citasGuardadas.map((c, i) => `
      <li>${escaparHtml(c.texto)}
        <button type="button" class="quien-borrar" data-borrar-cita="${i}" aria-label="Quitar cita">🗑️</button></li>`).join('');
    cont.innerHTML = `
      <div class="arcade-chips">
        ${Object.entries(TIPOS_CITA).map(([k, v]) =>
          `<button type="button" class="arcade-chip${k === this.filtro ? ' activo' : ''}" data-tipo="${k}">${v}</button>`).join('')}
      </div>
      <div class="cita-tarjeta"><p class="cita-texto">${this.actual ? escaparHtml(this.actual.texto) : 'Elige un tipo de cita y pide una idea 💫'}</p></div>
      <div class="aventura-salidas">
        <button type="button" class="btn-primario" data-accion="dar"><span>Dame una cita</span></button>
        <button type="button" class="menu-btn" data-accion="guardar" ${this.actual ? '' : 'disabled'}>💾 Guardar</button>
      </div>
      <h3 class="coraline-subtitulo">Nuestras citas guardadas</h3>
      <ul class="coraline-lista">${guardadas || '<li class="bloqueado">Aún no guardas ninguna.</li>'}</ul>`;
    cont.onclick = e => this.alTocar(e);
  },

  alTocar(e) {
    const tipo = e.target.closest('[data-tipo]');
    if (tipo) { this.filtro = tipo.dataset.tipo; this.actual = null; this.dibujar(); return; }
    const accion = e.target.closest('[data-accion]');
    if (accion && accion.dataset.accion === 'dar') this.dar();
    if (accion && accion.dataset.accion === 'guardar') this.guardar();
    const borrar = e.target.closest('[data-borrar-cita]');
    if (borrar) {
      state.citasGuardadas.splice(Number(borrar.dataset.borrarCita), 1);
      Storage.guardar();
      this.dibujar();
    }
  },

  dar() {
    const pool = CITAS_BANCO.filter(c => this.filtro === 'todas' || c.tipos.includes(this.filtro));
    if (!pool.length) return;
    let elegida = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && this.actual) {
      while (elegida.texto === this.actual.texto) elegida = pool[Math.floor(Math.random() * pool.length)];
    }
    this.actual = elegida;
    this.dibujar();
  },

  guardar() {
    if (!this.actual) return;
    if (state.citasGuardadas.some(c => c.texto === this.actual.texto)) { mostrarToast('Esa cita ya está guardada 💗'); return; }
    state.citasGuardadas.push({ texto: this.actual.texto });
    Storage.guardar();
    Logros.revisar();
    mostrarToast('💾 Cita guardada para cuando quieran');
    this.dibujar();
  },
};

/* ---------- E. Nuestro mapa de recuerdos ---------- */
const Mapa = {
  pendiente: null,   // { x, y } donde se va a marcar un lugar nuevo
  seleccion: null,   // id del lugar que se está viendo

  render() {
    $('mapa-cuerpo').innerHTML = `
      <p class="arcade-desc">Toca el mapa estrellado para marcar un lugar que nos importa.</p>
      <div class="mapa-lienzo" id="mapa-lienzo" aria-label="Mapa de recuerdos"></div>
      <div class="mapa-panel" id="mapa-panel"></div>`;
    this.pendiente = null;
    this.seleccion = null;
    this.dibujar();
  },

  dibujar() {
    const cont = $('mapa-cuerpo');
    const lienzo = cont.querySelector('#mapa-lienzo');
    lienzo.innerHTML = state.lugares.map(l => `
      <button type="button" class="mapa-pin${l.id === this.seleccion ? ' activo' : ''}" data-pin="${l.id}" style="left:${l.x}%;top:${l.y}%" aria-label="${escaparHtml(l.nombre)}">📍</button>`).join('');
    lienzo.onclick = e => {
      const pin = e.target.closest('[data-pin]');
      if (pin) { this.seleccion = pin.dataset.pin; this.pendiente = null; this.dibujar(); return; }
      const r = lienzo.getBoundingClientRect();
      this.pendiente = {
        x: Math.round(((e.clientX - r.left) / r.width) * 100),
        y: Math.round(((e.clientY - r.top) / r.height) * 100),
      };
      this.seleccion = null;
      this.dibujar();
    };
    this.dibujarPanel();
  },

  dibujarPanel() {
    const panel = $('mapa-panel');
    if (this.pendiente) {
      panel.innerHTML = `
        <form class="quien-form" id="mapa-form">
          <input id="mapa-nombre" maxlength="60" placeholder="Nombre del lugar (ej. el café de la esquina)" autocomplete="off">
          <textarea id="mapa-recuerdo" rows="2" maxlength="300" placeholder="¿Qué pasó aquí?"></textarea>
          <button type="submit" class="menu-btn">📍 Guardar lugar</button>
        </form>`;
      panel.querySelector('#mapa-form').onsubmit = e => {
        e.preventDefault();
        const nombre = panel.querySelector('#mapa-nombre').value.trim();
        if (!nombre) { mostrarToast('Ponle un nombre al lugar'); return; }
        const lugar = { id: generarId(), x: this.pendiente.x, y: this.pendiente.y, nombre, recuerdo: panel.querySelector('#mapa-recuerdo').value.trim(), fecha: fechaLocalISO(new Date()) };
        state.lugares.push(lugar);
        Storage.guardar();
        Logros.revisar();
        this.pendiente = null;
        this.seleccion = lugar.id;
        this.dibujar();
      };
      return;
    }
    const lugar = state.lugares.find(l => l.id === this.seleccion);
    if (lugar) {
      const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lugar.nombre);
      panel.innerHTML = `
        <h3 class="cal-fecha">📍 ${escaparHtml(lugar.nombre)}</h3>
        <p class="coraline-poema">${escaparHtml(lugar.recuerdo || 'Sin recuerdo escrito todavía.')}</p>
        <div class="aventura-salidas">
          <a class="menu-btn" href="${mapsUrl}" target="_blank" rel="noopener">🗺️ Ver en Google Maps</a>
          <button type="button" class="menu-btn" id="mapa-borrar">🗑️ Quitar lugar</button>
        </div>`;
      panel.querySelector('#mapa-borrar').onclick = () => {
        state.lugares = state.lugares.filter(l => l.id !== lugar.id);
        Storage.guardar();
        this.seleccion = null;
        this.dibujar();
      };
      return;
    }
    panel.innerHTML = `<p class="arcade-desc">${state.lugares.length ? 'Toca un 📍 para ver su recuerdo.' : 'Aún no hay lugares marcados.'}</p>`;
  },
};

/* ---------- G. Cofre de secretos ---------- */
const COFRE_RECOMPENSAS = [
  { id: 'c1', logros: 3, titulo: 'Carta del cofre', texto: 'Lo que más me gusta de ti es lo fácil que haces que me sienta en casa.' },
  { id: 'c2', logros: 6, titulo: 'Lluvia de corazones', efecto: 'corazones', texto: 'Te mando una lluvia de corazones por cada día que me haces sonreír.' },
  { id: 'c3', logros: 9, titulo: 'Mensaje secreto', texto: 'Hay cosas que no digo tan seguido: me pones los nervios de punta de la forma más bonita.' },
  { id: 'c4', logros: 12, titulo: 'Un abrazo pendiente', texto: 'Este abrazo lo guardé para cuando llegues. Úsalo cuando lo necesites.' },
  { id: 'c5', logros: 15, titulo: 'Fuegos del cofre', efecto: 'fuegos', texto: 'Hay celebraciones que no necesitan fecha. Esta es una.' },
  { id: 'c6', logros: 20, titulo: 'La última llave', texto: 'Esta es la última llave del cofre: te elegiría otra vez, en cualquier universo posible.' },
];

const Cofre = {
  render() {
    const cont = $('cofre-cuerpo');
    const n = state.logrosDesbloqueados.length;
    cont.innerHTML = `
      <div class="cofre-escena"><div class="cofre" id="cofre-icono"><div class="cofre-tapa"></div><div class="cofre-base"></div></div></div>
      <p class="arcade-desc">Tienes ${n} logros. Cada logro abre un poco más el cofre.</p>
      <div class="cofre-lista">
        ${COFRE_RECOMPENSAS.map(r => {
          const abierto = state.cofreAbiertos.includes(r.id);
          const listo = n >= r.logros;
          const estado = abierto ? 'abierto' : listo ? 'listo' : 'bloqueado';
          const titulo = abierto ? '🎁 ' + r.titulo : listo ? '🎁 Lista para abrir' : `🔒 Se abre con ${r.logros} logros`;
          const accion = !abierto && listo ? `<button type="button" class="menu-btn" data-abrir="${r.id}">Abrir</button>` : '';
          const texto = abierto ? `<p class="cofre-texto">${r.texto}</p>` : '';
          return `<div class="cofre-item ${estado}"><span class="cofre-titulo">${titulo}</span>${texto}${accion}</div>`;
        }).join('')}
      </div>`;
    cont.onclick = e => {
      const b = e.target.closest('[data-abrir]');
      if (b) this.abrir(b.dataset.abrir);
    };
  },

  abrir(id) {
    const r = COFRE_RECOMPENSAS.find(x => x.id === id);
    if (!r || state.cofreAbiertos.includes(id)) return;
    state.cofreAbiertos.push(id);
    Storage.guardar();
    Logros.revisar();
    const icono = $('cofre-icono');
    if (icono) icono.classList.add('abriendo');
    if (r.efecto === 'corazones') {
      for (let k = 0; k < 12; k++) setTimeout(() => Efectos.crearCorazon(), k * 120);
    }
    if (r.efecto === 'fuegos') Efectos.fuegosArtificiales();
    setTimeout(() => this.render(), 900);
  },
};

/* =========================================================
   27. UI PRINCIPAL / APP
========================================================= */
const NIVELES_AMOR = [
  [50, '🤍 Comenzando nuestra historia'],
  [100, '💗 Enamorándose'],
  [500, '❤️ Amor verdadero'],
  [1000, '💖 Alma gemela'],
  [10000, '👑 Reina de mi corazón'],
  [Infinity, '🌌 Diosa de mi universo'],
];

const App = {
  init() {
    Storage.cargar();
    Temas.init();
    this.elementos();
    Efectos.init();
    Constelaciones.init();
    this.actualizarTiempo();
    this.cargarNivel();
    this.iniciarFrase();
    this.renderTimeline();
    const formTimeline = $('timeline-form');
    if (formTimeline) {
      formTimeline.addEventListener('submit', e => {
        e.preventDefault();
        this.agregarEventoHistoria($('timeline-fecha').value, $('timeline-texto').value);
        $('timeline-fecha').value = '';
        $('timeline-texto').value = '';
      });
    }
    Retos.init(); Retos.render();
    Logros.init();
    Regalos.init();
    Luna.init(); Luna.render();
    Reproductor.init();
    Morse.init();
    Coraline.init();
    Arcade.init();
    Capsulas.init();
    Racha.init();
    FechasEspeciales.init();
    Quiz.init();
    Chat.init();
    Notas.init();
    Gustos.init();
    ClaveCorazon.init();
    CuriosidadTiempo.init();
    Ruleta.init();
    Frasco.init();
    Animo.init();
    Album.init();
    CartaSecreta.init();
    TocarPantalla.init();
    Sacudir.init();
    Stats.init();
    revisarAniversarioMensual();
    revisarNovedades();
    this.aplicarModo();
    this.eventos();
    this.registrarServiceWorker();

    // Relojes y frases solo se actualizan con la pestaña visible (ahorra CPU y batería)
    setInterval(() => { if (!pestanaOculta) this.actualizarTiempo(); }, 1000);
    setInterval(() => { if (!pestanaOculta) this.cambiarFrase(); }, CONFIG.intervaloFrase);
    setInterval(() => Efectos.crearEstrellaFugaz(), CONFIG.intervaloEstrellaFugaz);
  },

  registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    // Recarga una sola vez cuando la nueva versión toma el control
    let recargando = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (recargando) return;
      recargando = true;
      window.location.reload();
    });

    // La nueva versión NO se activa sola: el usuario decide con este botón
    const ofrecerActualizacion = worker => {
      if (document.getElementById('aviso-actualizar')) return;
      const btn = document.createElement('button');
      btn.id = 'aviso-actualizar';
      btn.type = 'button';
      btn.className = 'menu-btn aviso-actualizar';
      btn.textContent = '✨ Hay una versión nueva · Actualizar';
      btn.addEventListener('click', () => worker.postMessage({ tipo: 'SKIP_WAITING' }));
      document.body.appendChild(btn);
    };

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(reg => {
        if (reg.waiting && navigator.serviceWorker.controller) ofrecerActualizacion(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const nuevo = reg.installing;
          if (!nuevo) return;
          nuevo.addEventListener('statechange', () => {
            if (nuevo.state === 'installed' && navigator.serviceWorker.controller) ofrecerActualizacion(nuevo);
          });
        });
      }).catch(() => { /* sin soporte offline: la app sigue funcionando en línea */ });
    });
  },

  elementos() {
    this.welcome = $('welcome');
    this.main = $('main');
    this.enterBtn = $('enter');
    this.contador = $('contador');
    this.loveBtn = $('loveButton');
    this.loveCounter = $('loveCounter');
    this.nivelEl = $('level');
    this.barraNivel = $('barra-nivel-fill');
    this.fraseEl = $('frase-romantica');
    this.textoCarta = $('texto-maquina');
  },

  eventos() {
    this.enterBtn.addEventListener('click', () => this.entrarAlUniverso());
    this.loveBtn.addEventListener('click', () => this.sumarAmor());
    $('toggle-modo').addEventListener('click', () => this.alternarModo());
    $('btn-compartir').addEventListener('click', () => this.compartirResumen());

    this.configurarModal('btn-carta', 'modal-carta', () => this.escribirCarta());
    this.configurarModal('btn-chat', 'modal-chat', () => Chat.render());
    this.configurarModal('btn-notas', 'modal-notas', () => Notas.render());
    this.configurarModal('btn-gustos', 'modal-gustos', () => Gustos.render());
    this.configurarModal('btn-retos', 'modal-retos', () => Retos.render());
    this.configurarModal('btn-album', 'modal-album', () => { state.albumAbierto = true; Storage.guardar(); Logros.revisar(); });
    this.configurarModal('btn-linea', 'modal-linea', () => { state.historiaAbierta = true; Storage.guardar(); Logros.revisar(); });
    this.configurarModal('btn-logros', 'modal-logros', () => Logros.render());
    this.configurarModal('btn-regalos', 'modal-regalos', () => Regalos.render());
    this.configurarModal('btn-morse', 'modal-morse');
    this.configurarModal('btn-temas', 'modal-temas', () => Temas.renderGrid());
    this.configurarModal('btn-arcade', 'modal-arcade', () => Arcade.menu());
    this.configurarModal('btn-maquina', 'modal-maquina', () => Maquina.render());
    this.configurarModal('btn-sobre', 'modal-sobre', () => Sobre.render());
    this.configurarModal('btn-calendario', 'modal-calendario', () => Calendario.render());
    this.configurarModal('btn-citas', 'modal-citas', () => Citas.render());
    this.configurarModal('btn-mapa', 'modal-mapa', () => Mapa.render());
    this.configurarModal('btn-cofre', 'modal-cofre', () => Cofre.render());
    this.configurarModal('btn-capsula', 'modal-capsula', () => Capsulas.render());
    this.configurarModal('btn-quiz', 'modal-quiz', () => Quiz.reiniciar());
    this.configurarModal('btn-ruleta', 'modal-ruleta');
    this.configurarModal('btn-frasco', 'modal-frasco', () => Frasco.render());
    this.configurarModal('btn-animo', 'modal-animo', () => Animo.render());
    this.configurarModal('btn-stats', 'modal-stats', () => Stats.render());

    const btnInstalar = $('btn-instalar');
    if (btnInstalar) {
      if (esIOS() && !esStandalone()) btnInstalar.classList.remove('oculto');
      btnInstalar.addEventListener('click', async () => {
        if (window.promptInstalacionDiferido) {
          window.promptInstalacionDiferido.prompt();
          await window.promptInstalacionDiferido.userChoice;
          window.promptInstalacionDiferido = null;
          btnInstalar.classList.add('oculto');
        } else if (esIOS()) {
          abrirModal($('modal-instalar')); // iOS no tiene prompt nativo: mostramos los pasos manuales
        }
      });
    }

    document.querySelectorAll('.modal .close').forEach(btn => {
      btn.addEventListener('click', () => cerrarModal(btn.closest('.modal')));
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(modal); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal.abierto').forEach(cerrarModal);
    });
  },

  configurarModal(btnId, modalId, alAbrir) {
    const btn = $(btnId);
    const modal = $(modalId);
    if (!btn || !modal) return;
    btn.addEventListener('click', () => {
      abrirModal(modal);
      if (alAbrir) alAbrir();
    });
  },

  entrarAlUniverso() {
    if (typeof window.DeviceMotionEvent !== 'undefined' && typeof window.DeviceMotionEvent.requestPermission === 'function') {
      window.DeviceMotionEvent.requestPermission().catch(() => { /* si lo rechaza, el resto de la app sigue igual */ });
    }
    this.welcome.classList.add('saliendo');
    setTimeout(() => {
      this.welcome.hidden = true;
      this.main.hidden = false;
      Efectos.lloverPetalos();
      setTimeout(() => Racha.mostrarSorpresaSiPendiente(), 1600);
    }, 800);
  },

  actualizarTiempo() {
    const ahora = new Date();
    const diff = ahora - CONFIG.fechaInicio;
    if (diff < 0) {
      this.contador.innerHTML = '<p>Nuestra historia comienza el 11 de marzo ❤️</p>';
      return;
    }
    let seg = Math.floor(diff / 1000);
    const dias = Math.floor(seg / 86400); seg %= 86400;
    const horas = Math.floor(seg / 3600); seg %= 3600;
    const minutos = Math.floor(seg / 60); seg %= 60;
    const unidades = [
      [dias, 'Días'], [horas, 'Horas'], [minutos, 'Minutos'], [seg, 'Segundos'],
    ];
    this.contador.innerHTML = unidades.map(([valor, etiqueta]) => `
      <div class="unidad"><span class="numero">${valor}</span><span class="etiqueta">${etiqueta}</span></div>
    `).join('');
    this.revisarHitosDias(dias);
  },

  revisarHitosDias(dias) {
    const nuevos = CONFIG.hitosDias.filter(h => dias >= h && !state.hitosCelebrados.includes(h));
    if (!nuevos.length) return;
    nuevos.forEach(h => state.hitosCelebrados.push(h));
    Storage.guardar();
    Logros.revisar();
    const hito = nuevos[nuevos.length - 1];
    setTimeout(() => {
      mostrarToast(`🎉 ¡Ya llevamos ${hito.toLocaleString('es')} días juntos!`);
      Efectos.fuegosArtificiales();
    }, 600);
  },

  calcularDiasJuntos() {
    const diff = new Date() - CONFIG.fechaInicio;
    return diff < 0 ? 0 : Math.floor(diff / 86400000);
  },

  async compartirResumen() {
    const dias = this.calcularDiasJuntos();
    const retosCumplidos = state.retosNotificados.length;
    const secretosLuna = state.secretosLunaVistos.length;
    const logrosCount = state.logrosDesbloqueados.length;

    const texto = [
      '✨ Nuestro Universo ✨',
      `💗 ${dias.toLocaleString('es')} días juntos`,
      `❤️ ${state.amor.toLocaleString('es')} corazones tocados`,
      `🏆 ${retosCumplidos}/100 retos cumplidos`,
      `🌙 ${secretosLuna}/${CONFIG.clicksSecretosLuna.length} secretos de la luna encontrados`,
      `🎖️ ${logrosCount}/${LOGROS.length} logros desbloqueados`,
      '',
      'hecho con ❤️ para Scarleth Rassel',
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nuestro Universo ❤️', text: texto });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // cerró el diálogo de compartir: nada que hacer
        // si falla por otra razón, seguimos al plan B (portapapeles)
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(texto);
        mostrarToast('📋 Resumen copiado — pégalo donde quieras');
        return;
      } catch (e) { /* seguimos al último recurso */ }
    }
    mostrarToast('No se pudo compartir automáticamente en este navegador.');
  },

  cargarNivel() {
    this.loveCounter.textContent = state.amor;
    this.actualizarNivel();
  },

  sumarAmor() {
    this.agregarAmor(1, { vibrar: true, corazonVisual: true });
  },

  // Único punto donde el contador de amor cambia: lo reutiliza el botón
  // manual y el bono automático por visitar cada día (evita duplicar lógica).
  agregarAmor(cantidad, { vibrar = false, corazonVisual = false } = {}) {
    state.amor += cantidad;
    this.loveCounter.textContent = state.amor;
    Storage.guardar();
    this.actualizarNivel();
    Retos.revisarNuevos();
    Logros.revisar();
    if (corazonVisual) Efectos.crearCorazon();
    if (vibrar && navigator.vibrate) navigator.vibrate(18);
  },

  actualizarNivel() {
    const nivel = NIVELES_AMOR.find(([tope]) => state.amor < tope) || NIVELES_AMOR[NIVELES_AMOR.length - 1];
    this.nivelEl.textContent = nivel[1];

    const [tope] = nivel;
    const anteriorTope = NIVELES_AMOR[NIVELES_AMOR.indexOf(nivel) - 1]?.[0] ?? 0;
    const rango = tope === Infinity ? 1 : tope - anteriorTope;
    const avance = tope === Infinity ? 1 : (state.amor - anteriorTope) / rango;
    this.barraNivel.style.width = Math.min(100, Math.max(4, avance * 100)) + '%';
  },

  iniciarFrase() { this.cambiarFrase(); },

  cambiarFrase() {
    if (!this.fraseEl) return;
    let n;
    do { n = Math.floor(Math.random() * FRASES.length); } while (n === ultimaFraseIndex && FRASES.length > 1);
    ultimaFraseIndex = n;
    this.fraseEl.style.animation = 'none';
    void this.fraseEl.offsetWidth;
    this.fraseEl.style.animation = '';
    this.fraseEl.textContent = FRASES[n];
  },

  renderTimeline() {
    const cont = $('timeline');
    cont.innerHTML = '';
    TIMELINE.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'evento';
      const p = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = ev.fecha + ': ';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(ev.texto));
      div.appendChild(p);
      cont.appendChild(div);
    });
    state.timelinePersonal.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'evento';
      const p = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = (ev.fecha || 'Un día especial') + ': ';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(ev.texto));
      div.appendChild(p);
      const btn = document.createElement('button');
      btn.className = 'evento-borrar';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Eliminar evento');
      btn.textContent = '✕';
      btn.addEventListener('click', () => this.eliminarEventoHistoria(ev.id));
      div.appendChild(btn);
      cont.appendChild(div);
    });
  },

  agregarEventoHistoria(fecha, texto) {
    const limpio = (texto || '').trim();
    if (!limpio) return;
    state.timelinePersonal.push({ id: generarId(), fecha: (fecha || '').trim(), texto: limpio });
    Storage.guardar();
    Logros.revisar();
    this.renderTimeline();
  },

  eliminarEventoHistoria(id) {
    state.timelinePersonal = state.timelinePersonal.filter(ev => ev.id !== id);
    Storage.guardar();
    this.renderTimeline();
  },

  escribirCarta() {
    if (this.cartaEscribiendo) return;
    const texto = `Hola, mi niña hermosa.

Scarleth Rassel, este pequeño universo digital fue hecho especialmente para ti.

Cada estrella representa un momento contigo.
Cada corazón representa lo mucho que te amo.
Y cada segundo que pasa me recuerda lo afortunado que soy de tenerte en mi vida.

Gracias por existir.
Te amo muchísimo.`;

    this.textoCarta.textContent = '';
    this.cartaEscribiendo = true;
    let i = 0;
    const escribir = () => {
      if (i < texto.length) {
        this.textoCarta.textContent += texto[i];
        i++;
        setTimeout(escribir, 22);
      } else {
        this.cartaEscribiendo = false;
        if (!state.cartaAbierta) {
          state.cartaAbierta = true;
          Storage.guardar();
          Logros.revisar();
        }
      }
    };
    escribir();
  },

  alternarModo() {
    state.modoDia = !state.modoDia;
    Storage.guardar();
    this.aplicarModo();
    Logros.revisar();
  },

  aplicarModo() {
    document.body.classList.toggle('modo-dia', state.modoDia);
    $('icono-modo').textContent = state.modoDia ? '☀️' : '🌙';
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

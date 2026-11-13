// ===================== Constantes =====================
const API = '/api/puzzle';
const IMAGEN_DEFECTO = '/imagenes_lab09_pruebas/imagenes_lab09_pruebas/Bulbasaur.png';
const SIMBOLOS = '123456789ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz'; // sin la X
const VACIO = 'X';

// Única secuencia de 8 pasos (movimientos de la casilla vacía) para desordenar:
// desde 12345678X deja 13652847X
const SECUENCIA_DESORDEN = ['L', 'L', 'U', 'R', 'U', 'R', 'D', 'D'];

const DIM_MIN = 3;
const DIM_MAX = 6;

// ===================== Estado =====================
let n = 0;
let fichas = [];
let imagen = null;
let jugando = false;
let cola = Promise.resolve();

const $ = id => document.getElementById(id);

// ===================== Lógica del puzzle =====================
function resuelto(dim) {
    return SIMBOLOS.substring(0, dim * dim - 1) + VACIO;
}

function moverVacio(arr, dim, dir) {
    const v = arr.indexOf(VACIO);
    let f = Math.floor(v / dim);
    let c = v % dim;
    if (dir === 'U') f--;
    if (dir === 'D') f++;
    if (dir === 'L') c--;
    if (dir === 'R') c++;
    if (f < 0 || f >= dim || c < 0 || c >= dim) return false;
    const j = f * dim + c;
    [arr[v], arr[j]] = [arr[j], arr[v]];
    return true;
}

function desordenar(dim) {
    const arr = resuelto(dim).split('');
    SECUENCIA_DESORDEN.forEach(d => moverVacio(arr, dim, d));
    return arr.join('');
}

function esAdyacente(i, v, dim) {
    const fi = Math.floor(i / dim), ci = i % dim;
    const fv = Math.floor(v / dim), cv = v % dim;
    return (fi === fv && Math.abs(ci - cv) === 1) || (ci === cv && Math.abs(fi - fv) === 1);
}

function validarDimension(texto) {
    const m = /^(\d+)x(\d+)$/i.exec(texto.trim());
    if (!m || m[1] !== m[2]) return 0;
    const dim = parseInt(m[1], 10);
    return (dim >= DIM_MIN && dim <= DIM_MAX) ? dim : 0;
}

function dimensionDeEstructura(est) {
    if (!est) return 0;
    const dim = Math.round(Math.sqrt(est.length));
    if (dim < DIM_MIN || dim > DIM_MAX || dim * dim !== est.length) return 0;
    const ordenada = est.split('').sort().join('');
    const esperada = resuelto(dim).split('').sort().join('');
    return ordenada === esperada ? dim : 0;
}

// ===================== Web Services =====================
async function api(ruta, metodo, cuerpo) {
    const r = await fetch(API + ruta, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    return r.json();
}

function guardarEstructura(est) {
    cola = cola.then(() => api('/estructura', 'POST', { stfGameBoardStructure: est })).catch(() => {});
    return cola;
}

function reiniciarBD() {
    cola = cola.then(() => api('/reiniciar', 'PUT')).catch(() => {});
    return cola;
}

// ===================== Imágenes =====================
function leerArchivo(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

function cargarImagen(src) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
    });
}

function aCuadradoJpeg(img, lado = 600) {
    const canvas = document.createElement('canvas');
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, lado, lado);
    const s = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, lado, lado);
    return canvas.toDataURL('image/jpeg', 0.85);
}

async function usarImagenPorDefecto() {
    imagen = aCuadradoJpeg(await cargarImagen(IMAGEN_DEFECTO));
    await api('/imagen', 'PUT', { image: imagen });
}

// ===================== Dibujo del tablero =====================
function dibujar() {
    const tab = $('tablero');
    const color = $('colorTablero').value;
    tab.innerHTML = '';
    tab.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    tab.style.gridTemplateRows = `repeat(${n}, 1fr)`;
    tab.style.backgroundColor = color;

    fichas.forEach((ch, i) => {
        const div = document.createElement('div');
        div.className = 'ficha';
        if (ch === VACIO) {
            div.classList.add('vacia');
            div.style.backgroundColor = color;
        } else {
            const idx = SIMBOLOS.indexOf(ch);
            const fila = Math.floor(idx / n);
            const col = idx % n;
            div.style.backgroundImage = `url("${imagen}")`;
            div.style.backgroundSize = `${n * 100}% ${n * 100}%`;
            div.style.backgroundPosition = `${col * 100 / (n - 1)}% ${fila * 100 / (n - 1)}%`;
        }
        div.addEventListener('click', () => clickFicha(i));
        tab.appendChild(div);
    });
}

// ===================== Flujo del juego =====================
async function iniciarJuego() {
    const dim = validarDimension($('txtDimension').value);
    if (!dim) return;
    n = dim;

    if (!imagen) await usarImagenPorDefecto();

    fichas = desordenar(n).split('');
    jugando = true;
    $('panelConfig').hidden = true;
    $('mensaje').textContent = '';
    dibujar();
    await guardarEstructura(fichas.join(''));
}

async function clickFicha(i) {
    if (!jugando) return;
    const v = fichas.indexOf(VACIO);
    if (!esAdyacente(i, v, n)) return;

    [fichas[i], fichas[v]] = [fichas[v], fichas[i]];
    dibujar();

    const est = fichas.join('');
    const gano = est === resuelto(n);
    if (gano) jugando = false;

    await guardarEstructura(est);
    if (gano) terminarJuego();
}

async function terminarJuego() {
    $('mensaje').textContent = 'Juego terminado !';
    await reiniciarBD();
    setTimeout(nuevoJuegoFrontend, 3000);
}

function nuevoJuegoFrontend() {
    n = 0;
    fichas = [];
    imagen = null;
    jugando = false;
    $('tablero').innerHTML = '';
    $('mensaje').textContent = '';
    $('imgPrevia').src = IMAGEN_DEFECTO;
    $('txtDimension').value = '';
    $('errDimension').textContent = '';
    $('btnIniciar').hidden = true;
    $('panelConfig').hidden = false;
}

// ===================== Eventos =====================
$('btnSeleccionar').addEventListener('click', () => $('fileImagen').click());

$('fileImagen').addEventListener('change', async () => {
    const file = $('fileImagen').files[0];
    if (!file) return;

    const esJpg = /\.jpe?g$/i.test(file.name) && file.type === 'image/jpeg';
    if (!esJpg) {
        alert('Solo se permite subir imagenes en formato jpg');
        $('fileImagen').value = '';
        return;
    }

    const img = await cargarImagen(await leerArchivo(file));
    imagen = aCuadradoJpeg(img);
    $('imgPrevia').src = imagen;
    $('fileImagen').value = '';
    await api('/imagen', 'PUT', { image: imagen });
});

$('txtDimension').addEventListener('input', () => {
    const texto = $('txtDimension').value;
    const ok = validarDimension(texto) > 0;
    $('btnIniciar').hidden = !ok;
    $('errDimension').textContent = (ok || texto.trim() === '')
        ? '' : `Formato invalido. Use NxN, por ejemplo 3x3 (de ${DIM_MIN}x${DIM_MIN} a ${DIM_MAX}x${DIM_MAX})`;
});

$('btnIniciar').addEventListener('click', iniciarJuego);

// ===================== Retomar el juego al abrir la página =====================
async function cargarEstado() {
    try {
        const r = await api('', 'GET');
        const p = r.puzzle;
        if (!p) return;

        if (p.image) {
            imagen = p.image;
            $('imgPrevia').src = imagen;
        }

        const dim = dimensionDeEstructura(p.stfGameBoardStructure);
        if (dim && p.stfGameBoardStructure !== resuelto(dim)) {
            if (!imagen) await usarImagenPorDefecto();
            n = dim;
            fichas = p.stfGameBoardStructure.split('');
            jugando = true;
            $('panelConfig').hidden = true;
            dibujar();
        } else if (p.stfGameBoardStructure) {
            await reiniciarBD();
            nuevoJuegoFrontend();
        }
    } catch (e) {
        console.error('No se pudo cargar el estado', e);
    }
}

cargarEstado();
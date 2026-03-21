/**
 * Archivo Principal Admin: main.js
 * Objetivo: Controlar el módulo de administración de usuarios.
 *           Maneja eventos, estado y conecta con servicios y UI.
 */
import {
    cargarTodosLosUsuarios,
    procesarCreacionUsuario,
    procesarActualizacionUsuario,
    procesarEliminacionUsuario,
    obtenerTodosLosUsuarios
} from '../../services/index.js';
import { armarListaUsuarios, notificarError, notificarInfo } from '../../ui/index.js';

// ==========================================
// REFERENCIAS AL DOM
// ==========================================
const formulario = document.getElementById('userForm');
const inputNombre = document.getElementById('userName');
const inputUsername = document.getElementById('userUsername');
const inputEmail = document.getElementById('userEmail');
const inputPhone = document.getElementById('userPhone');
const inputWebsite = document.getElementById('userWebsite');
const btnSubmit = document.getElementById('submitUserBtn');
const btnCancelar = document.getElementById('cancelEditBtn');
const formTitulo = document.getElementById('formTitle');
const contenedorUsuarios = document.getElementById('usersContainer');
const inputBusqueda = document.getElementById('searchUser');
const btnCargar = document.getElementById('loadUsersBtn');
const totalBadge = document.getElementById('totalBadge');

// ==========================================
// ESTADO LOCAL
// ==========================================
let modoEdicion = false;
let usuarioActualId = null;

// ==========================================
// FUNCIÓN CENTRAL: RENDERIZAR LISTA
// ==========================================
function renderUsuarios(lista) {
    const usuarios = lista ?? obtenerTodosLosUsuarios();
    armarListaUsuarios(contenedorUsuarios, usuarios);
    actualizarTotal(usuarios.length);
}

function actualizarTotal(cantidad) {
    if (!totalBadge) return;
    totalBadge.textContent = `${cantidad} usuario${cantidad !== 1 ? 's' : ''} en total`;
}

// ==========================================
// EVENTO 1: CARGAR TODOS LOS USUARIOS
// ==========================================
btnCargar.addEventListener('click', async () => {
    await cargarTodosLosUsuarios(contenedorUsuarios, () => renderUsuarios());
});

// ==========================================
// EVENTO 2: BUSCAR USUARIO EN TIEMPO REAL
// ==========================================
inputBusqueda.addEventListener('input', () => {
    const termino = inputBusqueda.value.trim().toLowerCase();
    const todos = obtenerTodosLosUsuarios();
    const filtrados = todos.filter(u =>
        u.name.toLowerCase().includes(termino) ||
        u.username.toLowerCase().includes(termino) ||
        u.email.toLowerCase().includes(termino)
    );
    renderUsuarios(filtrados);
});

// ==========================================
// EVENTO 3: CREAR O ACTUALIZAR USUARIO
// ==========================================
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const datos = {
        name: inputNombre.value.trim(),
        username: inputUsername.value.trim(),
        email: inputEmail.value.trim(),
        phone: inputPhone.value.trim(),
        website: inputWebsite.value.trim(),
    };

    if (!datos.name || !datos.username || !datos.email) {
        notificarError('Nombre, usuario y email son obligatorios');
        return;
    }

    if (modoEdicion) {
        // --------- MODO EDICIÓN ---------
        const helpers = {
            actualizarTarjetaEnDOM,
            resetearFormulario,
            renderFn: () => renderUsuarios(),
        };
        await procesarActualizacionUsuario(usuarioActualId, datos, helpers);

    } else {
        // --------- MODO CREACIÓN ---------
        await procesarCreacionUsuario(datos, formulario, () => renderUsuarios());
    }
});

// ==========================================
// EVENTO 4: CLICK EN LA LISTA (editar/eliminar)
// ==========================================
contenedorUsuarios.addEventListener('click', async (evento) => {
    const id = evento.target.getAttribute('data-id');
    if (!id) return;

    // -------- ELIMINAR --------
    if (evento.target.classList.contains('btn-eliminar-usuario')) {
        const tarjeta = evento.target.closest('.user-card');
        await procesarEliminacionUsuario(id, tarjeta, () => renderUsuarios());
    }

    // -------- EDITAR --------
    if (evento.target.classList.contains('btn-editar-usuario')) {
        const tarjeta = evento.target.closest('.user-card');

        const nombre = tarjeta.querySelector('.message-author')?.textContent ?? '';
        const username = tarjeta.querySelector('.user-username')?.textContent.replace(/.*:\s*/, '') ?? '';
        const email = tarjeta.querySelector('.user-email')?.textContent.replace(/.*:\s*/, '') ?? '';
        const phone = tarjeta.querySelector('.user-phone')?.textContent.replace(/.*:\s*/, '') ?? '';
        const website = tarjeta.querySelector('.user-website')?.textContent.replace(/.*:\s*/, '') ?? '';

        modoEdicion = true;
        usuarioActualId = id;

        inputNombre.value = nombre;
        inputUsername.value = username;
        inputEmail.value = email;
        inputPhone.value = phone;
        inputWebsite.value = website;

        formTitulo.textContent = 'Editar Usuario';
        btnSubmit.querySelector('.btn__text').textContent = 'Actualizar Usuario';
        btnCancelar.classList.remove('hidden');

        document.getElementById('userFormSection').scrollIntoView({ behavior: 'smooth' });
    }
});

// ==========================================
// EVENTO 5: CANCELAR EDICIÓN
// ==========================================
btnCancelar.addEventListener('click', resetearFormulario);

// ==========================================
// HELPERS
// ==========================================

/**
 * Actualiza los datos visibles en una tarjeta del DOM sin re-renderizar todo.
 */
function actualizarTarjetaEnDOM(id, datos) {
    const tarjeta = document.querySelector(`.user-card[data-id="${id}"]`);
    if (!tarjeta) return;

    const upd = (clase, valor) => {
        const el = tarjeta.querySelector(`.${clase}`);
        // En lugar de reemplazo innerHTML, asumimos que la estructura es texto simple o usamos textContent
        if (el && valor) {
            const currentText = el.textContent || "";
            el.textContent = currentText.replace(/:\s.*/, `: ${valor}`);
        }
    };

    tarjeta.querySelector('.message-author').textContent = datos.name;
    upd('user-username', datos.username);
    upd('user-email', datos.email);
    upd('user-phone', datos.phone);
    upd('user-website', datos.website);
}

/**
 * Resetea el formulario al modo de creación.
 */
function resetearFormulario() {
    modoEdicion = false;
    usuarioActualId = null;
    formulario.reset();
    formTitulo.textContent = 'Registrar Nuevo Usuario';
    btnSubmit.querySelector('.btn__text').textContent = 'Registrar Usuario';
    btnCancelar.classList.add('hidden');
}

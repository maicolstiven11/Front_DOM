/**
 * Archivo Principal: script.js
 * Objetivo: Controlar la lógica de la aplicación, manejar eventos y conectar con la API.
 */
import { armarUsuario, armarTareas } from "./ui/index.js";
import { getUserById, getTareasByUserId, createTarea, deleteTarea, updateTarea } from "./use-case/index.js";

// ==========================================
// REFERENCIAS AL DOM (HTML)
// ==========================================
const formularioBusqueda = document.getElementById("searchForm");
const entradaIdUsuario = document.getElementById("userId");
const errorIdUsuario = document.getElementById("userIdError");

// Secciones que mostramos u ocultamos
const seccionInfoUsuario = document.getElementById("userInfoSection");
const contenedorInfoUsuario = document.getElementById("userInfoContainer");

const seccionFormularioTarea = document.getElementById("taskFormSection");
const formularioTarea = document.getElementById("taskForm");

const seccionListaTareas = document.getElementById("tasksListSection");
const contenedorTareas = document.getElementById("tasksContainer");

// ==========================================
// VARIABLES DE ESTADO
// ==========================================
let usuarioActual = null; // Guarda el objeto del usuario logueado actualmente
let modoEdicion = false; // Bandera: true=editando tarea, false=creando tarea nueva
let tareaActualId = null; // Guarda el ID de la tarea que se está editando

// ==========================================
// EVENTO 1: BUSCAR USUARIO
// ==========================================
formularioBusqueda.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const idUsuario = entradaIdUsuario.value;

    if (idUsuario === "") {
        mostrarError("Por favor ingresa un número de ID");
        return;
    }

    try {
        // Uso del USE-CASE para obtener el usuario
        usuarioActual = await getUserById(idUsuario);

        // --- MANIPULACIÓN DEL DOM ---
        armarUsuario(contenedorInfoUsuario, usuarioActual);

        seccionInfoUsuario.classList.remove("hidden");
        seccionFormularioTarea.classList.remove("hidden");
        seccionListaTareas.classList.remove("hidden");

        errorIdUsuario.textContent = "";

        // Cargar las tareas usando otro USE-CASE
        cargarTareasDelUsuario(idUsuario);

    } catch (error) {
        console.error(error);
        mostrarError("Usuario no encontrado en el sistema");
        ocultarSecciones();
    }
});

// ==========================================
// EVENTO 2: AGREGAR NUEVA TAREA O EDITAR EXISTENTE
// ==========================================
formularioTarea.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // Evita que la página se recargue al enviar el formulario

    // Verificamos que haya un usuario logueado antes de continuar
    if (usuarioActual === null) {
        return; // Si no hay usuario, no hacemos nada
    }

    // Extraemos los valores de los campos del formulario
    const titulo = document.getElementById("taskTitle").value; // Valor del input de título
    const descripcion = document.getElementById("taskBody").value; // Valor del textarea de descripción
    const estadoSeleccionado = document.getElementById("taskCompleted").value; // Valor del select (true/false)

    // Convertimos el string del select a booleano
    let estaCompletada = (estadoSeleccionado === "true"); // true si seleccionó "Completada"

    // Validación: el título es obligatorio
    if (titulo === "") {
        alert("El título es obligatorio"); // Mostramos alerta si el título está vacío
        return; // Detenemos la ejecución
    }

    // VERIFICAMOS EN QUÉ MODO ESTAMOS (CREAR O EDITAR)
    if (modoEdicion) {
        // ==================== MODO EDICIÓN ====================
        // Estamos actualizando una tarea existente
        
        // Creamos objeto con los datos actualizados
        const datosActualizados = {
            title: titulo, // Nuevo título (puede ser el mismo o modificado)
            body: descripcion, // Nueva descripción (puede ser la misma o modificada)
            completed: estaCompletada // Nuevo estado (puede ser el mismo o modificado)
        };

        try {
            // Llamamos a la API para actualizar la tarea usando su ID
            const tareaActualizada = await updateTarea(tareaActualId, datosActualizados);
            
            // Actualizamos visualmente solo la tarjeta específica en el DOM
            // Esto evita recargar toda la lista de tareas
            actualizarTarjetaEnDOM(tareaActualId, tareaActualizada);
            
            // Resetear el formulario para que vuelva al modo de creación
            resetearFormularioAModoCrear();
            
        } catch (error) {
            console.error("Error actualizando tarea:", error); // Log del error para debugging
            alert("Hubo un error al actualizar la tarea"); // Mensaje amigable para el usuario
        }
    } else {
        // ==================== MODO CREACIÓN ====================
        // Estamos creando una tarea nueva
        
        // Creamos el objeto con los datos de la nueva tarea
        const nuevaTarea = {
            title: titulo, // Título de la nueva tarea
            body: descripcion, // Descripción de la nueva tarea
            completed: estaCompletada, // Estado inicial de la nueva tarea
            userId: usuarioActual.id // ID del usuario que la crea
        };

        try {
            // Llamamos a la API para crear la nueva tarea
            const tareaCreada = await createTarea(nuevaTarea);
            console.log("Tarea creada con éxito (simulado):", tareaCreada); // Log para debugging

            // Agregamos la nueva tarea a la interfaz sin recargar todo
            const listaParaAgregar = [tareaCreada]; // Array con solo la nueva tarea
            armarTareas(contenedorTareas, listaParaAgregar); // Función que crea la tarjeta en el DOM

            // Limpiamos el formulario para poder crear otra tarea
            formularioTarea.reset();

        } catch (error) {
            console.error("Error al crear tarea:", error); // Log del error para debugging
            alert("Hubo un error al guardar la tarea"); // Mensaje amigable para el usuario
        }
    }
});

// ==========================================
// FUNCIÓN 3: CARGAR TAREAS EXISTENTES
// ==========================================
async function cargarTareasDelUsuario(idUsuario) {
    contenedorTareas.innerHTML = '';
    try {
        // Uso del USE-CASE para traer las tareas
        const primerasTareas = await getTareasByUserId(idUsuario);
        armarTareas(contenedorTareas, primerasTareas);
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}

// ==========================================
// FUNCIONES DE APOYO (HELPERS)
// ==========================================

/**
 * Llena el formulario con los datos de una tarea existente para editar
 * @param {Object} tarea - Objeto con los datos de la tarea (id, title, body, completed)
 */
function llenarFormularioConTarea(tarea) {
    // PASO 1: Llenar el campo de título con el título actual
    document.getElementById("taskTitle").value = tarea.title;
    
    // PASO 2: Llenar el campo de descripción (usamos || '' por si es null/undefined)
    document.getElementById("taskBody").value = tarea.body || '';
    
    // PASO 3: Llenar el select de estado según el booleano completed
    // Si completed es true, selecciona 'true', si no, selecciona 'false'
    document.getElementById("taskCompleted").value = tarea.completed ? 'true' : 'false';
    
    // PASO 4: Cambiar el texto visual del formulario para indicar modo edición
    // Cambiamos el título del card de "Nueva Tarea" a "Editar Tarea"
    document.querySelector("#taskFormSection .card__title").textContent = "Editar Tarea";
    
    // Cambiamos el texto del botón de "Agregar Tarea" a "Actualizar Tarea"
    document.getElementById("addTaskBtn").querySelector(".btn__text").textContent = "Actualizar Tarea";
}

/**
 * Actualiza una tarjeta específica en el DOM con los nuevos datos de la tarea
 * Esta función evita recargar toda la lista de tareas, solo actualiza la tarjeta modificada
 * @param {string} tareaId - ID de la tarea que se debe actualizar en el DOM
 * @param {Object} tareaActualizada - Objeto con los datos nuevos de la tarea
 */
function actualizarTarjetaEnDOM(tareaId, tareaActualizada) {
    // PASO 1: Buscar la tarjeta específica usando el atributo data-id del botón
    // El selector busca cualquier elemento con data-id igual al ID de la tarea
    // Luego .closest(".message-card") sube hasta encontrar el contenedor principal de la tarjeta
    const tarjeta = document.querySelector(`[data-id="${tareaId}"]`).closest(".message-card");
    
    // PASO 2: Si encontramos la tarjeta, actualizamos sus elementos
    if (tarjeta) {
        // Actualizar el título: buscamos el h3 con clase .message-author y cambiamos su texto
        tarjeta.querySelector(".message-author").textContent = tareaActualizada.title;
        
        // Actualizar la descripción: buscamos el párrafo con clase .message-text
        const parrafoDescripcion = tarjeta.querySelector(".message-text");
        // Si no hay descripción, mostramos el texto por defecto
        parrafoDescripcion.textContent = tareaActualizada.body || 'Sin descripción disponible';
        
        // Actualizar el estado visual (color y texto)
        const spanEstado = tarjeta.querySelector(".status-completed, .status-pending");
        if (tareaActualizada.completed) {
            // Si está completada: clase "status-completed", texto "Completada", color verde
            spanEstado.className = 'status-completed';
            spanEstado.textContent = 'Completada';
            spanEstado.style.color = 'green';
        } else {
            // Si está pendiente: clase "status-pending", texto "Pendiente", color naranja
            spanEstado.className = 'status-pending';
            spanEstado.textContent = 'Pendiente';
            spanEstado.style.color = 'orange';
        }
    }
}

/**
 * Resetea el formulario al modo de creación después de editar una tarea
 * Esta función se llama después de una edición exitosa para volver al estado inicial
 */
function resetearFormularioAModoCrear() {
    // PASO 1: Resetear las variables de estado global
    modoEdicion = false; // Volvemos al modo de creación
    tareaActualId = null; // Limpiamos el ID de la tarea que se estaba editando
    
    // PASO 2: Limpiar todos los campos del formulario
    formularioTarea.reset(); // .reset() limpia todos los inputs, textareas y selects
    
    // PASO 3: Restaurar el texto visual original del formulario
    // Cambiamos el título del card de "Editar Tarea" a "Nueva Tarea"
    document.querySelector("#taskFormSection .card__title").textContent = "Nueva Tarea";
    
    // Cambiamos el texto del botón de "Actualizar Tarea" a "Agregar Tarea"
    document.getElementById("addTaskBtn").querySelector(".btn__text").textContent = "Agregar Tarea";
}

function mostrarError(mensaje) {
    errorIdUsuario.textContent = mensaje;
    ocultarSecciones();
}

function ocultarSecciones() {
    seccionInfoUsuario.classList.add("hidden");
    seccionFormularioTarea.classList.add("hidden");
    seccionListaTareas.classList.add("hidden");

    contenedorInfoUsuario.innerHTML = "";
    contenedorTareas.innerHTML = "";

    usuarioActual = null;
}

// ==========================================
// EVENTO 3: EDITAR O ELIMINAR TAREA
// ==========================================
contenedorTareas.addEventListener("click", async (evento) => {

    const idTarea = evento.target.getAttribute("data-id");

    if (!idTarea) return;

    // -------- ELIMINAR --------
    if (evento.target.classList.contains("btn-eliminar-tarea")) {

        const confirmar = confirm("¿Estás segura de que deseas eliminar esta tarea?");

        if (!confirmar) return;

        try {
            const eliminado = await deleteTarea(idTarea);

            if (eliminado) {
                evento.target.closest(".message-card").remove();
            } else {
                alert("No se pudo eliminar la tarea");
            }

        } catch (error) {
            console.error("Error eliminando tarea:", error);
            alert("Ocurrió un error al eliminar la tarea");
        }
    }

    // -------- EDITAR --------
    if (evento.target.classList.contains("btn-editar-tarea")) {
        // PASO 1: Obtener referencia a la tarjeta completa donde se hizo clic
        // closest(".message-card") sube desde el botón hasta encontrar el contenedor principal
        const tarjeta = evento.target.closest(".message-card");
        
        // PASO 2: Extraer el título actual de la tarea
        // querySelector(".message-author") busca el elemento h3 con el título
        const tituloActual = tarjeta.querySelector(".message-author").textContent;
        
        // PASO 3: Extraer la descripción actual de la tarea
        // querySelector(".message-text") busca el párrafo con la descripción
        const descripcionActual = tarjeta.querySelector(".message-text").textContent;
        
        // PASO 4: Extraer el elemento span que contiene el estado (Completada/Pendiente)
        // Busca un elemento que tenga cualquiera de las dos clases de estado
        const spanEstado = tarjeta.querySelector(".status-completed, .status-pending");
        
        // PASO 5: Determinar si la tarea está completada o no
        // contains("status-completed") devuelve true si tiene la clase "completed"
        const estadoActual = spanEstado.classList.contains("status-completed");

        // PASO 6: Crear un objeto con todos los datos actuales de la tarea
        // Este objeto se usará para llenar el formulario de edición
        const tareaActual = {
            id: idTarea, // ID que viene del atributo data-id del botón
            title: tituloActual, // Título extraído de la tarjeta
            // Si la descripción es "Sin descripción disponible", guardamos string vacío
            body: descripcionActual === 'Sin descripción disponible' ? '' : descripcionActual,
            completed: estadoActual // Booleano: true si está completada
        };

        // PASO 7: Activar el modo edición en las variables de estado global
        modoEdicion = true; // Le dice al formulario que debe actualizar, no crear
        tareaActualId = idTarea; // Guardamos qué tarea estamos editando

        // PASO 8: Llenar el formulario con los datos extraídos
        // Esta función pone los valores en los campos input/textarea/select
        llenarFormularioConTarea(tareaActual);

        // PASO 9: Hacer scroll suave hacia el formulario para mejor experiencia de usuario
        // behavior: 'smooth' hace un desplazamiento animado en lugar de instantáneo
        document.getElementById("taskFormSection").scrollIntoView({ behavior: 'smooth' });
    }
});
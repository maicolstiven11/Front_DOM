import { BASE_URL } from '../config.js';

export const deleteTarea = async (tareaId) => {
    try {
        const respuesta = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
            method: 'DELETE',
        });
        
        if (respuesta.ok) {
            return true;
        } else {
            console.error("Error al eliminar la tarea en el servidor");
            return false;
        }
    } catch (error) {
        console.error("Error de red al eliminar la tarea:", error);
        return false;
    }
};

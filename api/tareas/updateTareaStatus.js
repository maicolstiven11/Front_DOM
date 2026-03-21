import { BASE_URL } from '../config.js';

export const updateTareaStatus = async (id, status) => {
    // Mapeo de estados entre frontend (Inglés) y backend (Español)
    const mapping = {
        'completed': 'completada',
        'pending': 'pendiente',
        'in-progress': 'en proceso'
    };
    
    const estadoBackend = mapping[status] || status;

    try {
        const respuesta = await fetch(`${BASE_URL}/tareas/${id}`, {
            method: 'PUT', // Usamos PUT ya que el backend original lo requiere
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: estadoBackend })
        });
        
        if (respuesta.ok) {
            const json = await respuesta.json();
            const t = json.data;
            const backToFront = {
                'completada': 'completed',
                'pendiente': 'pending',
                'en proceso': 'in-progress'
            };
            // Mapeamos de vuelta para que el frontend siga funcionando igual
            return {
                ...t,
                title: t.titulo,
                body: t.descripcion,
                status: backToFront[t.estado] || t.estado,
                completed: t.estado === 'completada'
            };
        } else {
            throw new Error('Error al actualizar el estado de la tarea en el servidor');
        }
    } catch (error) {
        console.error("Error en la petición de cambio de estado:", error);
        throw error;
    }
};

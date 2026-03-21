import { BASE_URL } from '../config.js';

export const getAllTareas = async () => {
    const respuesta = await fetch(`${BASE_URL}/tareas`);
    if (respuesta.ok) {
        const json = await respuesta.json();
        const backToFront = {
            'completada': 'completed',
            'pendiente': 'pending',
            'en proceso': 'in-progress'
        };
        // Mapeo de campos para compatibilidad con el front original
        return json.data.map(t => ({
            ...t,
            title: t.titulo,
            body: t.descripcion,
            status: backToFront[t.estado] || t.estado,
            completed: t.estado === 'completada'
        }));
    } else {
        throw new Error('No se pudieron cargar las tareas');
    }
};

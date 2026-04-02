import { BASE_URL } from '../config.js';

export const deleteUsuario = async (usuarioId) => {
    const respuesta = await fetch(`${BASE_URL}/usuarios/${usuarioId}`, {
        method: 'DELETE',
    });
    if (respuesta.ok) {
        return true;
    } else {
        return false;
    }
};

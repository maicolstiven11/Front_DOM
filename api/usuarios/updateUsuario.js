import { BASE_URL } from '../config.js';

export const updateUsuario = async (usuarioId, datos) => {
    const respuesta = await fetch(`${BASE_URL}/usuarios/${usuarioId}`, {
        method: 'PUT',
        body: JSON.stringify({ id: usuarioId, ...datos }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });
    if (respuesta.ok) {
        const json = await respuesta.json();
        return json.data;
    } else {
        throw new Error('Hubo un error al actualizar el usuario');
    }
};

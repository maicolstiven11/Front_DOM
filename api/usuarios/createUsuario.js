import { BASE_URL } from '../config.js';

export const createUsuario = async (nuevoUsuario) => {
    const respuesta = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        body: JSON.stringify(nuevoUsuario),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });
    if (respuesta.ok) {
        const json = await respuesta.json();
        return json.data;
    } else {
        throw new Error('Hubo un error al registrar el usuario');
    }
};

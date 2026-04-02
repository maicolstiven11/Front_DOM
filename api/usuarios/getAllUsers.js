import { BASE_URL } from '../config.js';

export const getAllUsers = async () => {
    const respuesta = await fetch(`${BASE_URL}/usuarios`);
    if (respuesta.ok) {
        const json = await respuesta.json();
        return json.data;
    } else {
        throw new Error('No se pudieron cargar los usuarios');
    }
};

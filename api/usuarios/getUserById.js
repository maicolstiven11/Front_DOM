import { BASE_URL } from '../config.js';

export const getUserById = async (idUsuario) => {
    const respuesta = await fetch(`${BASE_URL}/usuarios/${idUsuario}`);
    if (respuesta.ok) {
        const json = await respuesta.json();
        return json.data;
    } else {
        throw new Error("Usuario no encontrado");
    }
}

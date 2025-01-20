import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Cambia a faPlus para crear

const CrearCanal = ({ nuevoCanal, setNuevoCanal, handleCreateChannel }) => {
    return (
        <div className="crear-canal">
            <h4>Crear Canal</h4>
            <input
                type="text"
                placeholder="Nombre del canal"
                value={nuevoCanal.nombre}
                onChange={(e) => setNuevoCanal({ ...nuevoCanal, nombre: e.target.value })}
            />
            <select
                value={nuevoCanal.tipo}
                onChange={(e) => setNuevoCanal({ ...nuevoCanal, tipo: e.target.value })}
            >
                <option value="texto">Texto</option>
                <option value="voz">Voz</option>
            </select>
            <button onClick={handleCreateChannel}>
                <FontAwesomeIcon icon={faPlus} /> {/* Cambia a ícono de más */}
            </button>
        </div>
    );
};

export default CrearCanal;

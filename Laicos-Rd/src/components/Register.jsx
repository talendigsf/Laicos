import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importa SweetAlert
import "../css/registro.css";
import { useNavigate } from 'react-router-dom';
import { TiArrowBack } from "react-icons/ti";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SplashScreen from '../components/SplashScreen';

const Register = () => {
  const [name, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [sexo, setSexo] = useState('Seleccionar');
  const [celular, setCelular] = useState('');
  const [fechaN, setFechaN] = useState('');
  const [esMiembro, setEsMiembro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para manejar la visibilidad de la contraseña
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_DOMINIO;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (!isValidPhone(celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El número de teléfono no tiene un formato válido.'
      });
      setLoading(false);
      return;
    }

    if (!isAdult(fechaN)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes tener al menos 18 años.'
      });
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${URL}/api/administradores/`, {
        nombre: name,
        apellido,
        email,
        password,
        sexo,
        celular,
        nacimiento: fechaN,
        esMiembro
      })

      // Limpiar los campos
      setName('');
      setApellido('');
      setEmail('');
      setPassword('');
      setSexo('Seleccionar');
      setCelular('');
      setFechaN('');
      setEsMiembro(false);

      // Navegar a la página de login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setLoading(false);

      // Manejar el error y mostrarlo en un SweetAlert
      const errorMessage = error.response?.data?.errmsg || 'Error al registrar. Verifica los datos e intenta nuevamente.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
      console.error('Error al registrar:', error);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }
  const isValidPhone = (phone) => {
    const phonePattern = /^[0-9]{10}$/; // Formato: 10 dígitos
    return phonePattern.test(phone);
  };

  const isAdult = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Verifica si es mayor de 18 años
    return age > 18 || (age === 18 && monthDifference > 0) || (age === 18 && monthDifference === 0 && today.getDate() >= birthDate.getDate());
  };

  return (
    <section className="container-principal-registro d-flex align-items-center justify-content-center">

      <form className="formulario-registro rounded-3 d-flex flex-column px-4 pb-3 mx-3 mb-5 mt-4 shadow" onSubmit={handleRegister}>

        <a href="/login" className='text-dark back'><TiArrowBack className='text-white' /></a>
        <h1 className="my-0">Registro</h1>
        <p className="mb-4">Crea una nueva cuenta para comenzar</p>

        <div className="elementos-centrales d-flex gap-3">
          <div className="d-flex flex-column w-100">
            <label htmlFor="nombre">Nombre</label>
            <input
              className="rounded-3"
              id="nombre"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required />
          </div>

          <div className="d-flex flex-column w-100">
            <label htmlFor="apellido">Apellido</label>
            <input
              className="rounded-3"
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required />
          </div>
        </div>

        <label htmlFor="genero">Género</label>
        <select className='rounded-3' id="genero" value={sexo} onChange={(e) => setSexo(e.target.value)} required>
          <option value="Seleccionar" disabled>Seleccionar</option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
        </select>

        <label htmlFor="email">Email</label>
        <input
          className="rounded-3 "
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />

        <label htmlFor="">Contraseña</label>
        <div>
          <input
            className="rounded-3 "
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
          <span className="text-dark FaEye-icon btx" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <label htmlFor="celular">Celular</label>
        <input
          className="rounded-3"
          id="celular"
          type="tel"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          required />

        <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
        <input
          className="rounded-3"
          id="fechaNacimiento"
          type="date"
          value={fechaN}
          onChange={(e) => setFechaN(e.target.value)}
          required />

        {/* <div className={`custom-checkbox ${esMiembro ? 'checked' : ''}`}>
          <input
            id='check'
            type="checkbox"
            checked={esMiembro}
            onChange={(e) => setEsMiembro(e.target.checked)}
          />
          <label htmlFor='check'>¿Eres miembro de la iglesia?</label>
        </div>
        <p className='label-miembro text-center'>{esMiembro ? 'Sí, soy miembro de la iglesia.' : 'No, no soy miembro de la iglesia.'}</p> */}

        <button
          type="submit"
          className='btn w-100 my-2'
          disabled={loading}>
          {loading ? '' : 'Registrarse'}
        </button>
      </form>
    </section>
  );
};

export default Register;

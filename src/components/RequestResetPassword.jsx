import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import  '../css/RequestResetPassword.css';

const RequestResetPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_DOMINIO;

  const handleRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${URL}/api/administradores/request-reset-password`, { email });
      setSuccess('Se ha enviado un correo con instrucciones para restablecer la contraseña.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar el restablecimiento de contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="request-reset-container">
      <div className="request-reset-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className="request-reset-title">Restablecer Contraseña</h2>
        <form className="request-reset-form" onSubmit={handleRequest}>
          <div className="input-group">
            <input 
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="request-reset-input"
            />
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
          </div>
          <button 
            type="submit" 
            className="request-reset-button"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Correo'}
          </button>
          {error && <p className="request-reset-error">{error}</p>}
          {success && <p className="request-reset-success">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default RequestResetPassword;
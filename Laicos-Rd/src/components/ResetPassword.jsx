import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/ResetPassword.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const URL = process.env.REACT_APP_DOMINIO;
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = window.location.pathname.split('/').pop();
    setToken(tokenFromUrl);
  }, []);

  const checkPasswordStrength = (password) => {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    if (strongRegex.test(password)) {
      setPasswordStrength('fuerte');
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('media');
    } else {
      setPasswordStrength('débil');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (passwordStrength !== 'fuerte') {
      setError('La contraseña debe ser fuerte. Incluya mayúsculas, minúsculas, números y caracteres especiales.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${URL}/api/administradores/reset-password/${token}`, { newPassword });
      setSuccess('La contraseña ha sido restablecida correctamente.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al restablecer la contraseña. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              required
              className="reset-password-input"
            />
            {passwordStrength && (
              <div className={`password-strength ${passwordStrength}`}>
                Fortaleza de la contraseña: {passwordStrength}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="reset-password-input"
            />
          </div>
          <button type="submit" className="reset-password-button" disabled={isLoading}>
            {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
          {error && <p className="reset-password-error">{error}</p>}
          {success && <p className="reset-password-success">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
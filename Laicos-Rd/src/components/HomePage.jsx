import React from "react";
import '../css/HomePage.css';
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login"); // Redirige al usuario a la página de login
  };
  return (
    <div className="home-page">
      <header className="header">
        <h1 className="title">Bienvenidos a LaicosRD</h1>
        <p className="subtitle">Una comunidad de fe y servicio</p>
        <button className="btn-login" onClick={handleLoginClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Iniciar sesión
    </button>

      </header>

      <section className="about-us">
        <h2 className="subtitulo">¿Quiénes Somos?</h2>
        <p>
          Somos una comunidad católica comprometida con el servicio y la
          evangelización, fomentando valores cristianos y fortaleciendo la fe a
          través de actividades y programas dirigidos a todos los laicos.
        </p>
      </section>

      <section className="mission-vision">
        <div className="mission">
          <h2 className="subtitulo">Misión</h2>
          <p>
            Promover el crecimiento espiritual y la participación activa de los
            laicos en la misión de la Iglesia, siendo testigos de Cristo en la
            sociedad.
          </p>
        </div>
        <div className="vision">
          <h2 className="subtitulo">Visión</h2>
          <p>
            Ser una comunidad referente en la formación y acción pastoral, que
            inspire a otros a vivir una vida cristiana auténtica.
          </p>
        </div>
      </section>

      <section className="contact">
        <h2 ssName="subtitulo">Contáctanos</h2>
        <form className="contact-form">
          <input
            type="text"
            placeholder="Nombre"
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="input-field"
            required
          />
          <textarea
            placeholder="Mensaje"
            className="textarea-field"
            required
          ></textarea>
          <button type="submit" className="submit-button">
            Enviar
          </button>
        </form>
      </section>

      <section className="social-media">
        <h2 ssName="subtitulo">Síguenos en redes sociales</h2>
        <div className="social-links">
          <a href="#" className="social-icon facebook">
            Facebook
          </a>
          <a href="#" className="social-icon twitter">
            Twitter
          </a>
          <a href="#" className="social-icon instagram">
            Instagram
          </a>
        </div>
      </section>
      <footer className="footer">
        <p>© {new Date().getFullYear()} LaicosRD - Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default HomePage;

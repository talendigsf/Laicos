const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const comunidadController = require('../controllers/comunidad.controller');

// Crear una comunidad (solo administradores autenticados)
router.post('/', auth, comunidadController.crearComunidad);

// Añadir un miembro a la comunidad (solo administradores autenticados)
router.post('/agregar-miembro', auth, comunidadController.agregarMiembro);

// Listar comunidades
router.get('/comunidades', auth, comunidadController.listarComunidades);

// Ruta para actualizar comunidad
router.put('/:comunidadId', auth, comunidadController.actualizarComunidad);

// Ruta para eliminar comunidad
router.delete('/:comunidadId', auth, comunidadController.eliminarComunidad);
router.get('/canales/:comunidadId', auth, comunidadController.listarCanales);
router.get('/:id', comunidadController.obtenerComunidadPorId);
// Crear canal
router.post('/canales', auth,  comunidadController.crearCanal);

// Actualizar canal
router.put('/canales/:canalId', auth, comunidadController.actualizarCanal);

// Eliminar canal
router.delete('/canales/:canalId', auth, comunidadController.eliminarCanal);

router.post('/canales/:canalId/mensajes', comunidadController.enviarMensaje);

// Obtener todos los mensajes de un canal
router.get('/canales/:canalId/mensajes', comunidadController.obtenerMensajes);

module.exports = router;

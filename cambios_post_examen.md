# Cambios post examen

## Pedidos por el profesor
- Arreglo del fallo del SQL
- Botones para reportar y eliminar menasje más visibles
- Botones en crearEvento para que añadir variable y añadir etiqueta sea mas intuitivo
- named querys divididas para que el código sea más legible
- Aparece el dinero apostado a fabor y en contra de cada formula (no cuanto ganarías para no saturar la interfaz pero se puede calcular con la cuota y el dinero apostado)
- La imagen de perfil se sube al servidor al ser seleccionada (antes era al darle al boton de guardar)
- Añado recursos utilizados al README

## Ejercicios del examen (Casi igual que en la entrega del examen)

- Aparece el dinero que ganarias entre parentesis en el historico de apuestas (igual que lo entregado en el examen)
- No se puede ver la contraseña de nadie nisiquiera la tuya y la contraseña se envia por separado nada más ser seleccionada.(Cambiado respecto a la entrega del examen).Cambios en el controlador de usuario user/id/password y en perfil.js (he movido cosas de interaciones.js a perfil.js para hacer el código más legible)
- Boton de guardar mas visible y cambio del contenedor a d-flex para que no se corte el perfil a mitad de pagina.
- Un administrador no se puede expulsar a si mismo (igual que en la entrega del examen)
- Poner un ejemplo de formula al crear una apuesta (igual que en el examen)
- Tipo de variable booleana para los eventos (añado el tipo en el .sql para los eventos anteriores lo demás es igual que en el examen)

## Cambios extra

- Los botones de iniciar sesion rapidamente (a,b) desaparecen cuando la aplicación no está en modo debug.
- WS en admin/usuarios al añadir un usuario
- WS en admin/reportes al añadir un reporte
- WS en admin/Eventos al añadir un evento
- Organización del código y eliminacion de código que no se usaba para nada
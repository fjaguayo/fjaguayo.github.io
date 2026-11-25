/** Datos de contacto de la Oficina de Correos. */
export const EMAIL = 'javiaguayo98@gmail.com'
export const SUBJECT = 'Contacto desde tu portfolio'
export const SUBJECT_EN = 'Contact from your portfolio'

/**
 * Id del formulario de Formspree (https://formspree.io), p. ej. 'xyzabcde'.
 * Vacío: el botón "Enviar postal" abre el correo del visitante con el mensaje ya escrito.
 * Con id: la postal se envía desde la web y te llega a tu Gmail sin salir de ella.
 */
export const FORMSPREE_ID = 'maeodqdy'

export const gmailUrl = (body = '', subject = SUBJECT) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ''
  }`

export const mailtoUrl = (body = '', subject = SUBJECT) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`

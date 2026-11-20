import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { assetUrl } from '../../data/buildings'
import { EMAIL, FORMSPREE_ID, gmailUrl, mailtoUrl } from '../../data/contacto'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

// Sellos para elegir: edificios de la propia ciudad.
const STAMPS = [
  { id: 'cine', color: '#ee4266' },
  { id: 'aeropuerto', color: '#4d9de0' },
  { id: 'universidad', color: '#3bceac' },
  { id: 'parque', color: '#ffd23f' },
] as const

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Oficina de Correos: una postal para escribir a Javier, más atajos para usar tu propio correo. */
export default function CorreosInterior({ onExit }: Props) {
  const [stamp, setStamp] = useState<(typeof STAMPS)[number]['id']>('cine')
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const body = form.message ? `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}` : ''

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!FORMSPREE_ID) {
      // sin servicio de envío: se abre el correo del visitante con la postal ya escrita
      window.location.href = mailtoUrl(body)
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: `Postal de ${form.name} desde FJAH City`, sello: stamp }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* sin permiso para el portapapeles: no pasa nada */
    }
  }

  const field =
    'w-full rounded-lg border-[3px] border-ink bg-white px-3 py-2 text-[15px] text-ink outline-none placeholder:text-ink/40 focus-visible:border-sky'

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 pt-20 pb-4">
      <button
        type="button"
        aria-label="Cerrar Correos"
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label="Oficina de Correos: escríbele a Javier"
        initial={{ y: 40, rotate: -2, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative w-[min(980px,94vw)]"
      >
        {/* la postal */}
        <form
          onSubmit={submit}
          className="relative grid grid-cols-[1.25fr_1fr] overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)]"
        >
          {/* franja de correo aéreo */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-3"
            style={{ background: 'repeating-linear-gradient(135deg,#ee4266 0 18px,#fff6e3 18px 30px,#4d9de0 30px 48px,#fff6e3 48px 60px)' }}
          />

          {/* lado izquierdo: el mensaje */}
          <div className="flex flex-col gap-3 border-r-[3px] border-dashed border-ink/40 p-6 pt-8">
            <h2 className="m-0 font-display text-3xl uppercase leading-none tracking-wide text-ink">¡Escríbeme!</h2>
            <label className="sr-only" htmlFor="postal-mensaje">
              Mensaje
            </label>
            <textarea
              id="postal-mensaje"
              required
              rows={9}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Hola Javier, te escribo porque…"
              className="w-full flex-1 resize-none rounded-lg border-0 bg-transparent px-1 text-[17px] leading-[32px] text-ink outline-none placeholder:text-ink/40 focus-visible:bg-white/50"
              // renglones de papel de carta
              style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 31px, #1b1b2f22 31px 32px)', backgroundAttachment: 'local' }}
            />
          </div>

          {/* lado derecho: sello, remitente y destinatario */}
          <div className="flex flex-col gap-4 p-6 pt-8">
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 text-sm font-bold text-ink">Elige un sello</legend>
              <div className="flex gap-2">
                {STAMPS.map((s) => (
                  <label key={s.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="sello"
                      value={s.id}
                      checked={stamp === s.id}
                      onChange={() => setStamp(s.id)}
                      className="peer sr-only"
                    />
                    <span
                      className="block h-16 w-14 rounded-sm border-[3px] border-dashed border-white p-1 transition-transform peer-checked:-translate-y-1 peer-checked:-rotate-3 peer-checked:shadow-[3px_3px_0_var(--color-ink)] peer-focus-visible:outline-3 peer-focus-visible:outline-sky"
                      style={{ background: s.color, outline: stamp === s.id ? '3px solid #1b1b2f' : undefined }}
                    >
                      <img src={assetUrl(s.id)} alt={s.id} draggable={false} className="h-full w-full object-contain" />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-ink" htmlFor="postal-nombre">
                De
              </label>
              <input
                id="postal-nombre"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre"
                className={field}
              />
              <label className="sr-only" htmlFor="postal-email">
                Tu email
              </label>
              <input
                id="postal-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Tu email, para que pueda responderte"
                className={field}
              />
            </div>

            <div className="text-ink">
              <p className="m-0 text-sm font-bold">Para</p>
              <p className="m-0 border-b-2 border-ink/30 py-1 font-display text-xl uppercase tracking-wide">Javier Aguayo</p>
              <p className="m-0 border-b-2 border-ink/30 py-1 text-[15px] font-semibold">Oficina de Correos, FJAH City</p>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-auto cursor-pointer rounded-xl border-4 border-ink bg-berry px-4 py-3 font-display text-xl uppercase tracking-wide text-white shadow-[4px_4px_0_var(--color-ink)] transition-transform outline-none hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun disabled:opacity-70"
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar postal'}
            </button>
            {status === 'error' && (
              <p role="alert" className="m-0 text-sm font-semibold text-berry">
                No se ha podido enviar. Prueba con uno de los botones de abajo.
              </p>
            )}
          </div>

          {/* matasellos al enviar */}
          <AnimatePresence>
            {status === 'sent' && (
              <motion.div
                role="status"
                className="absolute inset-0 z-10 flex items-center justify-center bg-cream/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  initial={{ scale: 2.4, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: -12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="flex h-56 w-56 flex-col items-center justify-center rounded-full border-[10px] border-double border-berry text-center text-berry"
                >
                  <span className="font-display text-5xl leading-none uppercase">Enviado</span>
                  <span className="mt-2 text-sm font-bold uppercase tracking-widest">FJAH City</span>
                  <span className="text-sm font-bold">{new Date().toLocaleDateString('es-ES')}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* atajos para escribir con tu propio correo */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-semibold text-cream">¿Prefieres tu correo?</span>
          <a
            href={gmailUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border-[3px] border-ink bg-cream px-3 py-1.5 text-sm font-bold text-ink no-underline shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun"
          >
            Escribir con Gmail
          </a>
          <a
            href={mailtoUrl()}
            className="rounded-lg border-[3px] border-ink bg-cream px-3 py-1.5 text-sm font-bold text-ink no-underline shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun"
          >
            Abrir mi app de correo
          </a>
          <button
            type="button"
            onClick={copy}
            className="cursor-pointer rounded-lg border-[3px] border-ink bg-cream px-3 py-1.5 text-sm font-bold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun"
          >
            <span aria-live="polite">{copied ? '¡Copiada!' : 'Copiar dirección'}</span>
          </button>
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}

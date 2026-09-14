import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Aduana — nada cruza sin revisión',
  description: 'Revisión adversarial de pagadores y rutas para pilotos de navegación de pacientes en México. Crystal Ball Studio, semana 5.',
}

const NAV = [['/canal', 'Pagador'], ['/comparar', 'Comparar'], ['/ruta', 'Ruta'], ['/reglas', 'Reglas']]

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-800">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
            <Link href="/" className="mr-auto font-bold tracking-tight text-cyan-300">🛃 Aduana</Link>
            {NAV.map(([h, t]) => <Link key={h} href={h} className="text-neutral-300 hover:text-white">{t}</Link>)}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-xs leading-relaxed text-neutral-500">
          Ejemplos inventados · nada se guarda · no es asesoría legal ni médica · proyecto de curso de Andrés Álvarez Morphy (Crystal Ball Studio, semana 5).
        </footer>
      </body>
    </html>
  )
}

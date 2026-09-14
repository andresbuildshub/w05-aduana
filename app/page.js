import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-cyan-300">Para pilotos de navegación de pacientes</p>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Aduana: antes de firmar con un pagador, y antes de mandar a una paciente a una ventanilla</h1>
        <p className="max-w-2xl text-lg text-neutral-300">
          Una señora con un resultado anormal de diabetes necesita llegar a su siguiente consulta. El programa que la acompaña puede fallarle dos veces antes de empezar:
          si acepta dinero de quien le vende medicinas o seguros, o si la manda a la ventanilla equivocada sin los papeles correctos. Aduana revisa las dos cosas.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/canal" className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 hover:border-cyan-300">
          <h2 className="text-xl font-semibold">Soy coordinadora → revisar a un pagador</h2>
          <p className="mt-2 text-neutral-400">Usa un ejemplo o llena los términos. Recibes un veredicto con reglas públicas, quién ve qué dato, y una lectura del contrato hecha por IA en la que cada cita se comprueba contra el texto.</p>
        </Link>
        <Link href="/ruta" className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 hover:border-cyan-300">
          <h2 className="text-xl font-semibold">Soy navegadora → revisar la ruta de un caso</h2>
          <p className="mt-2 text-neutral-400">Con un caso inventado: a qué ventanilla ir, cuánto cuesta, qué papeles faltan y la tarjeta de traspaso con dueña, fecha límite y cuándo interviene una persona.</p>
        </Link>
      </section>

      <Link href="/comparar" className="block rounded-2xl border border-cyan-300/30 bg-cyan-300/5 p-6 hover:border-cyan-300">
        <h2 className="font-semibold text-cyan-200">Farmacia contra remesa, lado a lado →</h2>
        <p className="mt-2 text-neutral-300">Cinco pagadores de ejemplo contra las mismas reglas. Spoiler: ninguno cruza como suele ofrecerse, y los que cruzan lo hacen con las mismas cláusulas.</p>
      </Link>

      <section className="grid gap-6 text-sm text-neutral-300 sm:grid-cols-3">
        <div><h3 className="font-semibold text-neutral-100">Lo que nunca hace</h3><p className="mt-1">Calcular riesgo o diagnosticar. Dejar que la IA decida un veredicto o le escriba a una paciente. Guardar datos. Prometer citas o cobertura.</p></div>
        <div><h3 className="font-semibold text-neutral-100">De dónde salen las reglas</h3><p className="mt-1">De las 6 condiciones del Blueprint del equipo T2 y de fuentes públicas (LFPDPPP 2025, CONDUSEF, IMSS, CMS). Todas están en <Link href="/reglas" className="underline">/reglas</Link>, con versión.</p></div>
        <div><h3 className="font-semibold text-neutral-100">Qué espera elimina</h3><p className="mt-1">El viaje perdido: semanas entre "tiene un resultado anormal" y "llegó a la ventanilla correcta con los papeles correctos". Y los meses entre firmar un mal acuerdo y descubrirlo en el daño.</p></div>
      </section>

      <p className="text-sm text-neutral-400">¿Quién hace esto? Andrés Álvarez Morphy, estudiante. Proyecto de curso (Crystal Ball Studio, semana 5) construido sobre el Blueprint del equipo T2. Todo lo que ves es inventado. Dudas: andres.builder@gmail.com</p>
    </div>
  )
}

# PERSONA TEST — Week 5 · w05-aduana · Andrés Álvarez Morphy Namnum (ADVERSARY, T2)

URL: https://w05-aduana.vercel.app · repo: https://github.com/andresbuildshub/w05-aduana

## Quién fue el usuario sintético

**Lupita Méndez**, 38, enfermera general. Coordina un piloto de navegación de pacientes (personas con tamizaje anormal de diabetes tipo 2) en una farmacia de Tuxtla Gutiérrez, Chiapas. Lee contratos en el celular entre turnos, nunca ha usado IA para trabajar, desconfía de la letra chiquita pero se cansa con textos largos, y si no entiende un término lo ignora en silencio. Construida desde el Blueprint T2: el piloto de 30 días en una farmacia es el asiento del Operator, el pagador propuesto es una organización de farmacias, y mi disidencia es la remesa. Sus 3 tareas: (1) ¿firmo con la Farmacia B y qué les pido que cambien?, (2) ¿me conviene la farmacia o la remesadora?, (3) ¿a dónde mando a una paciente, con qué papeles y qué sigue?

## Método

Dos pases, los dos sobre la URL viva.
1. **Mecánico:** el plan de prueba del packet (a–j), con `node --test` (14 pruebas) sobre `lib/` y `curl` + Playwright contra producción.
2. **Persona:** un agente nuevo, sin contexto del build, con el prompt de persona (en `docs/PROMPTS.md`). Recorrió 21 capturas de iPhone (390 px) en el orden en que ella las vería: inicio → /canal → lectura del contrato → /comparar → /ruta. Instrucción: narrar en primera persona, anotar cada palabra que no entiende y dónde se rendiría. Capturas del deploy #2. Después, re-prueba del mismo agente sobre capturas del deploy #4.

## Pase 1 · Prueba mecánica

| Prueba del packet | Resultado |
|---|---|
| a) Farmacia A, comisión por receta → NO CRUZA con R01 | OK (unitaria) |
| b) Farmacia B, tarifa fija (el pagador del Blueprint) → CRUZA CON CONDICIONES, solo por verificar | OK: R19 y R20 |
| c) Remesadora, como la ofrecen → NO CRUZA | OK: R04, R08, R11 |
| d) Hijo migrante → NO CRUZA; pagador y familiar ven el resultado = violación | OK |
| e) Texto con datos personales → 400 | CURP y correo OK en unitarias. **En producción, un teléfono al final de una oración pasó con HTTP 200 → BUG 1** |
| f) Texto de más de 4,000 caracteres / campo extra / opción inventada → 400 | OK en producción (los tres) |
| g) Cita inventada por el modelo → se descarta | OK (unitaria) |
| h) Gateway con 403 → modo SIMULADO etiquetado, HTTP 200 | OK en producción (razón real: el equipo class19 no tiene tarjeta) |
| i) /ruta: Chiapas → IMSS-Bienestar; Jalisco → servicios estatales; 2 intentos → revisión humana; costo → barrera financiera; Seguro Familia "no para esta acción" | OK en unitarias. **En la captura de producción, la fecha límite salía un día después → BUG 2** |
| j) 390 px sin scroll horizontal | OK en las 5 páginas (scrollWidth 390 = innerWidth) |
| Rutas 200, ruta inexistente 404, sin errores de consola | OK |

**BUG 1 (seguridad / Condición 6).** `curl` a producción con "Contacto de la paciente: 961 123 4567." devolvió 200: el teléfono llegaba al lector. La expresión regular excluía un punto después del número. Se corrigió, se agregaron dos pruebas de regresión, se redesplegó (deploy #3) y el mismo `curl` ahora devuelve 400: "El texto parece contener datos personales (teléfono)".

**BUG 2 (Condición 2: fecha límite).** La tarjeta de traspaso decía "28 sep" en vez de 27 y mostraba la fecha en formato ISO dentro de la oración. La suma de días usaba UTC, y después de las 18:00 en la CDMX ya es "mañana" en UTC. Se corrigió a fecha local, con prueba de regresión a las 23:30, y "hoy" se calcula en el teléfono y no en el build. Verificado en producción: "antes del 27 de septiembre".

## Pase 2 · Persona sobre el deploy #2: resultado

**No completó ninguna de sus 3 tareas.** 47 confusiones: **3 BLOQUEAN LA TAREA**, 24 frenan, 20 menores.
- Tarea 1 (¿firmo?): a medias, y en "¿firmo?" **NO**. El cuadro amarillo "CRUZA CON CONDICIONES · 0 bloquean" salía **antes** de leer el contrato y lo tomó como un sí. Más abajo la lectura descubría que el contrato manda la lista de pacientes con teléfono a la farmacia, pero el veredicto de arriba nunca cambiaba: "¿Y el cuadro amarillo de arriba qué?". Terminó con dos respuestas contradictorias.
- Tarea 2 (¿farmacia o remesa?): **no**. No había respuesta en palabras simples, la tabla escondía a la remesadora a la derecha, y "Yo defendí la remesa" le sonó a opinión. "Me voy sin saber cuál me conviene."
- Tarea 3 (ruta): a medias. Ventanilla y fecha claras; no le decía qué papeles le faltaban a su paciente; el formulario estaba cuatro pantallas abajo; "transporte (modificable por coordinación)" sin acción concreta.

## Lo que se corrigió (deploy #4)

1. **La peor (dos respuestas opuestas en /canal).** El veredicto espera al contrato: antes de revisarlo dice "Todavía no revisas el contrato". Si el contrato contradice lo prometido, dice **NO FIRMES TODAVÍA**, y cada diferencia trae el botón **"Usar lo que dice el contrato"**. La IA solo propone el valor, la coordinadora confirma con un toque y **las reglas recalculan**: Farmacia B pasa a **NO LO FIRMES ASÍ**. Así se respeta el muro de carga del charter: la IA nunca decide el veredicto. Se agregó la lista **"Qué pedirles"** con el botón **Copiar lista para WhatsApp**. Prueba unitaria nueva: aplicar las dos correcciones lleva a "NO LO FIRMES ASÍ". Verificado en producción con Playwright (antes de revisar → NO FIRMES TODAVÍA → NO LO FIRMES ASÍ → portapapeles con 2 cambios y 2 verificaciones).
2. **Palabras llanas.** "Cruza" se volvió "Se puede firmar / No lo firmes así". "Cifras agregadas" se volvió "números totales, sin nombres". Las condiciones tienen nombres de a pie. Los códigos R/C y las fuentes quedaron detrás de "Regla y fuente". El aviso SIMULADO ya no dice "no pagaron", y el pie de página repetido se redujo a una línea.
3. **La tabla "Quién ve qué" se volvió tarjetas**: la columna del pagador quedaba cortada en el teléfono.
4. **/comparar responde primero.** "Respuesta corta: con las mismas cuatro condiciones, cualquiera sirve; así como se ofrecen, ninguna" + qué vigilar con cada una (farmacia: a dónde mandan a la paciente; remesadora: quién más ve los datos; hijo: quiere ver). Se quitó "Yo defendí la remesa" y la tabla regla por regla quedó detrás de "Ver regla por regla".
5. **Hueco de reglas que destapó el recorrido:** el packet prometía "el pagador sugiere sus sucursales = RIESGO", pero ninguna regla lo hacía. Se agregó R25 (reglas v0.1.1).

## Re-prueba · el mismo agente sobre el deploy #4

Capturas nuevas de /canal (antes de revisar → después de revisar → después de corregir) y de /comparar. Resultado: **0 confusiones BLOQUEAN LA TAREA** (antes 3), 8 frenan, 11 menores.
- **Tarea 1: SÍ, con tropiezos.** "Ya hay una respuesta clara y sin contradicción dentro de /canal": NO FIRMES TODAVÍA → NO LO FIRMES ASÍ + lista para WhatsApp.
- **Tarea 2: a medias (casi sí).** Entiende "así como vienen, ninguna; con las mismas condiciones, cualquiera; con la farmacia cuido a dónde mando a las pacientes, con la remesadora quién ve los datos". Le falta un desempate y cuánto dinero da cada una.

**Lo que la re-prueba destapó y se corrigió de inmediato (deploy #5):**
1. El botón "Usar lo que dice el contrato: Nombre y teléfono de cada paciente" sonaba a **aceptar** darle los teléfonos a la farmacia ("Me da miedo picarle"). Ahora dice **"Corregir: el contrato dice «Nombre y teléfono de cada paciente»"**.
2. "0 bloquean · 2 de riesgo" cuando la farmacia recibe nombres y teléfonos de un programa de diabetes: "ya sabe que mis señoras salieron mal de azúcar". Tiene razón, y el Blueprint solo permite números totales al patrocinador. **R05 sube de RIESGO a BLOQUEA** (reglas v0.1.2), y su cura ahora nombra la cláusula: "Quitar del contrato la cláusula que entrega el listado de pacientes con su teléfono. Para pagar, basta el número de pacientes atendidas, sin nombres".
3. En /comparar, la tarjeta de Farmacia B decía "SE PUEDE FIRMAR" justo después de que /canal dijo lo contrario. Ahora la tarjeta avisa: "⚠ Pero su contrato dice otra cosa: al revisarlo termina en NO LO FIRMES ASÍ".

Verificado en producción después del deploy #5 con el mismo recorrido automatizado (Playwright, 390 px).

## Lo que NO se corrigió, y por qué

- **/ruta con el formulario primero, "qué papeles le faltan" para el registro, una acción concreta para la barrera de transporte** (confusiones #34, #36, #40, #46). Todas frenan, ninguna bloquea: la persona sí obtuvo la ventanilla y la fecha correctas. Quedan como el primer movimiento de la siguiente sesión en `docs/DECISIONS.md`.
- **"Todo es inventado / proyecto de curso"** (#6). Es deliberado: el piso de seguridad exige datos inventados y etiquetados, y el producto no es asesoría legal.
- **"Todas las ventanillas por verificar"** (#39). Es la Condición 4 (acceso honesto: no prometer citas ni cobertura). Se mantiene.
- **Subir el contrato en PDF desde WhatsApp, o contratos de más de 4,000 letras** (#15 y re-prueba #2). Fuera de alcance esta semana: nada se guarda y el límite protege el costo del modelo. La re-prueba tiene razón en que solo se probó con el contrato de ejemplo.
- **"¿Cuál conviene MÁS?", con montos** (re-prueba #18). Los pagadores son arquetipos inventados y el Blueprint dice "no payer willingness is proven": inventar montos sería fabricar evidencia. El desempate honesto ("qué es más fácil de vigilar") queda para cuando haya dos ofertas reales.
- **La lista "Qué pedirles" solo aparece después de corregir las diferencias** (re-prueba #6). Es deliberado: una lista calculada sobre términos que el contrato contradice sería la misma contradicción que bloqueó la tarea 1. Con el botón ya reescrito, el miedo a picarle debería bajar; queda por re-probar.

---

# Log completo del persona sobre el deploy #2 (sin editar)

# Prueba con usuaria sintética: Lupita Méndez en "Aduana"

## Quién es
Lupita Méndez, 38 años, enfermera general. Coordina un piloto de navegación de pacientes con diabetes tipo 2 en una farmacia de Tuxtla Gutiérrez, Chiapas.
Lee contratos en el celular entre turnos y nunca ha usado IA para trabajar. Desconfía de la letra chiquita pero se cansa rápido; si no entiende una palabra, la brinca callada o se va.

---

## Recorrido narrado

### home-1.png
A ver, me pasaron este link. "Aduana"... ¿como la de la frontera? Bueno. "Antes de firmar con un pagador": pagador es el que pone el dinero, eso sí lo entiendo.
Lo de la señora con resultado anormal de diabetes me suena a mis pacientes y eso me engancha. Pero el título está larguísimo, ya se comió media pantalla.
"Soy coordinadora → revisar a un pagador": yo coordino el piloto, así que esto es lo mío.
"una lectura del contrato hecha por IA en la que cada cita se comprueba contra el texto"... ¿cita? ¿Cita de consulta? No sé qué tiene que ver. Lo dejo pasar.
Antes de picarle, bajo a ver qué más hay.

### home-2.png
"Soy navegadora → revisar la ruta de un caso": también soy yo, en el piloto hago de las dos. "tarjeta de traspaso con dueña"... traspaso suena a traspasar un local. Ni idea.
"Farmacia contra remesa, lado a lado": ¡esa es mi segunda pregunta! "Spoiler: ninguno cruza como suele ofrecerse"... ¿cruza qué? ¿La aduana? ¿Quiere decir que no firme con nadie? Me asusta.
"Blueprint del equipo T2", "LFPDPPP 2025, CONDUSEF, IMSS, CMS", "/reglas": sopa de letras, me la salto.
"Qué espera elimina"... ¿le falta una palabra? Se lee raro.

### home-3.png
"¿Quién hace esto? Andrés Álvarez Morphy, estudiante... Todo lo que ves es inventado." Ay, chin. ¿Entonces es tarea de la escuela? ¿Me sirve para mi contrato de verdad o no?
Abajo, en gris: "LLM real vía Vercel AI Gateway... simulación etiquetada". No entendí nada de esa frase.
Solo me quedo con "No es asesoría legal ni médica". Ya me bajó la confianza, pero la farmacia está esperando mi respuesta, así que me regreso y le pico a lo del pagador.

### canal-1.png
"Revisar a un pagador". Ya viene seleccionada "Cadena farmacéutica B: tarifa fija (el pagador del Blueprint)". Esa es la que me ofrecieron, qué bueno. ¿Blueprint? Otra vez.
"Remesadora... con cortafuegos": ¿cortafuegos como los de las computadoras?
"EJEMPLO FICTICIO. Los términos declarados se ven limpios; lee el texto": no le entendí, lo brinco.
Luego viene el cuadrote amarillo: "CRUZA CON CONDICIONES. 0 bloquean · 0 de riesgo · 2 por verificar". Yo leo que sí se puede firmar, con condiciones, y que nada es grave.
Si tuviera prisa entre turnos, aquí me quedo: "sí firmo, nomás hay que verificar dos cosas".

### canal-2.png
"El pagador vende lo que la navegación puede terminar recetando": que la farmacia vende las medicinas a las que yo termino mandando. Sí, ya lo había pensado.
"la sucursal está a un paso y la opción pública a un camión": eso es bien cierto aquí en Tuxtla. "R19 · Condición 5: Operación financiada y medible": números de regla, ni caso.
"Qué lo cura: Reporte agregado del destino de las referencias"... ¿agregado a qué? ¿Referencias como las de un trabajo? No sé qué pedir con eso.
"Contrato firmado y primer pago recibido antes de abrir la inscripción": ¡esto sí lo entiendo y lo apunto!
"Quién ve qué dato. La cláusula sombra... cifras agregadas": ¿sombra? ¿Algo escondido? En la tabla veo Paciente "sí" y Navegadora "sí", y en la orilla una "C" mocha. Pensé que era un error de la página, no que había más columnas.

### canal-3.png
La tabla sigue con puros "sí" verdes. ¿Y la farmacia qué ve? No aparece por ningún lado.
"Leer el texto del acuerdo como adversario"... ¿adversario? ¿Me voy a pelear? Pero "Los términos de arriba son lo que te dijeron. El texto es lo que vas a firmar" es la frase más clara de toda la página. Debería ir hasta arriba.
Ahí ya hay un convenio escrito ("borrador ficticio"). ¿Es el mío? No. El mío lo tengo en PDF en el WhatsApp. ¿Cómo lo copio desde el celular? No veo botón para subirlo ni para borrar el ejemplo. "877/4000"... ¿y si mi contrato es más largo?
El botón "Leer el texto": pensé que me lo iba a leer en voz alta.
Hasta abajo, "Ver o cambiar los 14 términos declarados" está cerrado. Catorce cosas me dan flojera, ni lo abro.

### canal-4.png
Ya se acabó la página. "Compáralos lado a lado", "Reglas y fuentes": luego.
Otra vez el párrafo gris del LLM y Vercel, igualito que en la pantalla de inicio.
Me regreso y le pico a "Leer el texto" a ver qué pasa; total, ya hay algo escrito.

### canal-lectura-1.png
"SIMULADO: esta lectura la hizo un buscador de palabras clave, no una IA. El equipo de Vercel todavía no tiene tarjeta registrada..." ¿Perdón? ¿No pagaron? ¿Entonces lo que sigue no sirve? Casi cierro aquí.
Sigo nomás por curiosidad. "Lo declarado no coincide con el texto (2)". "Qué datos recibe el pagador: declaraste Solo cifras agregadas"... ¡yo no declaré nada, ya venía así!
Pero la frase del contrato la entiendo perfecto: "el Programa enviará a la Farmacia el listado de pacientes atendidos con su número telefónico". ¡Ah, caray! ¿Les voy a pasar el teléfono de mis señoras a la farmacia? Eso no.
Lo del laboratorio también está chueco: "se sugerirá el de la Farmacia". "Cláusulas a pelear (3)" me gusta, así se habla.
Pero, ¿y el cuadro amarillo de arriba que decía "0 bloquean"? No me dice si ahora ya no lo firmo.

### canal-lectura-2.png
"cita comprobada ✓", otra vez "cita". Ahora creo que es "lo que dice el papel", pero me costó. Y la misma frase de los teléfonos sale otra vez. ¿Se repitió por error?
Lo bueno: "Pregúntale al pagador: ¿Qué dato exacto recibe y para qué? ¿Aceptaría solo cifras agregadas?" Esto es lo que buscaba. Pero si el gerente me pregunta qué son "cifras agregadas", no sé explicarle.
"¿La navegadora puede referir primero a la opción gratuita, aunque no sea suya?" y "¿Cuándo se firma el contrato y llega el primer pago?": clarísimas.
Pero son preguntas, no me dice "pide que borren la cláusula tercera". Y "lo que lo cura" estaba arriba, en otra parte. Voy a tener que tomar captura de tres pedazos.

### canal-lectura-3.png
Y ya. Se acabó y nunca me dijo con letras grandes si firmo o no.
Arriba dice "cruza con condiciones · 0 bloquean". Abajo dice que mandan la lista con teléfonos a la farmacia.
Si alguien me pregunta, le digo: "creo que así no lo firmo, pero la página dice que sí se puede". Me quedo con la duda.

### comparar-1.png
Ahora, ¿me conviene la farmacia o la remesadora? "En el equipo, el pagador propuesto fue una organización de farmacias... Yo defendí la remesa". ¿Quién es "yo"? ¿El estudiante? Entonces esto es su opinión, no algo parejo.
"Ni la farmacia ni la remesa cruzan como suelen ofrecerse, y las dos cruzan con las mismas cláusulas": lo leí dos veces. ¿O sea que da igual? "grupos de 11 o más"... ¿11 qué?
"(R19)", "(R08, R23)": ya ni los veo. Lo que entendí a medias es que la remesadora es de un grupo que vende seguros y créditos, y le interesa saber quién salió mal de diabetes. Eso me da mala espina.
"Es la sombra del capítulo"... ¿qué capítulo? ¿De qué libro?

### comparar-2.png
Cinco cuadros de colores. Farmacia A: NO CRUZA. Farmacia B: CRUZA CON CONDICIONES... ¡pero arriba decía que ni la farmacia ni la remesa cruzan como se ofrecen! ¿La mía es la A o la B? La mía es de tarifa fija, o sea la B, y aquí sale amarilla. Y la lectura de hace rato decía que manda teléfonos. Ya no sé a quién creerle.
"4 bloquean · 10 en total"... ¿10 qué?
Remesadora "como la ofrecen" en rojo y "con cortafuegos" en amarillo. ¿Cuál me están ofreciendo a mí? No sé si la mía trae "cortafuegos".
"Desliza la tabla hacia los lados": con el dedo, en el celular, entre turnos... no, gracias.

### comparar-3.png
Una tabla larguísima. "R04 · C6 El pagador ve señales de salud de cada paciente": BLOQUEA en Farmacia A y una rayita en Farmacia B.
¿La rayita es buena, quiere decir "no aplica" o "no sé"? Si es buena, no cuadra con lo de los teléfonos que acabo de ver.
Las columnas de la remesadora ni las veo, están escondidas a la derecha. Solo veo Farmacia A contra Farmacia B, que no es lo que quiero comparar.
Voy bajando nomás por bajar.

### comparar-4.png
"R24 · Paga la familia: ¿por qué seguiría pagando sin ver nada?": buena pregunta, pero no es la mía. "Cortafuegos prometido: ¿quién lo audita?": otra vez cortafuegos.
Hasta el final: "C = condición del Blueprint: 1 Frontera clínica · 2 Traspaso con dueña...". ¡Ahora me explican qué era la C, después de catorce renglones! Y la R nunca me la explicaron.
Aquí me rendí con la tabla.

### comparar-5.png
El párrafo gris de siempre.
Me voy sin saber cuál me conviene. Nunca me dijo cuánto dinero da cada uno ni "si te dan a escoger, escoge esta".
Lo que me llevo es que con las mismas cláusulas las dos quedan igual. Pues... ¿entonces para qué las comparo?

### ruta-1.png
Ahora sí, lo de mi paciente, que es lo que más me urge. "El resultado ya lo dio el clínico del proveedor"... ¿qué proveedor? ¿El laboratorio?
"ABIERTO — BARRERA POR RESOLVER": claro. "Tarjeta de traspaso": otra vez traspaso.
Pero "Acudir a: IMSS-Bienestar, con la orden del clínico, antes del 2026-09-28" es justo lo que necesito.
"Dueña: Rosa (navegadora ficticia)"... ¿Rosa? Yo todavía no he escrito nada. ¿Esto es de otra señora? ¿Dónde pongo a mi paciente?
"Barrera: Transporte (modificable por coordinación)"... ¿modificable? ¿O sea que yo le consigo el transporte? ¿Cómo?

### ruta-2.png
"Escalamiento: Después de 2 intentos automáticos fallidos... se detiene la automatización". ¿Quién hace intentos automáticos? ¿Un robot le llama a mi paciente? Nosotras le llamamos a mano.
"Cómo contactarla: Llamada y SMS" y "No se contacta a familiares": bien.
La letra gris chiquita dice "opt-out informado, o aceptación humana explícita... NO RESUELTO". No le entendí, me la salto.
"Ventanillas posibles (todas por verificar)"... ¿todas? ¿Entonces nada es seguro? IMSS-Bienestar, "MX$0 para personas sin seguridad social": ¡perfecto!
Papeles: CURP, identificación, comprobante de domicilio, foto, teléfono o correo... "para el registro en línea". Mi señora tiene celular básico, no tiene internet ni correo. ¿Y cuáles le faltan a ella? No me lo dice.

### ruta-3.png
"Seguro de Salud para la Familia, MX$14,850 al año" con la etiqueta "NO PARA ESTA ACCIÓN". ¿Entonces por qué me lo enseñan tan grande?
"Nunca se oculta un resultado para entrar"... ¿quién iba a ocultar? Yo no. "Fuente: El Siglo de Torreón"... ¿un periódico de Torreón para una regla del IMSS?
"Incorporación voluntaria... MX$20,538.59" con su lista de enfermedades. Ya me cansé; esto no le sirve a una señora informal que no tiene ni para el camión.
HbA1c de $145 a $280: eso sí lo conozco, es la hemoglobina glucosilada. Qué bueno que venga el precio.

### ruta-4.png
"Si el costo la detiene, el estado es NO RESUELTO — BARRERA FINANCIERA, no 'no quiso'". Eso me gustó, porque siempre ponen que la paciente "no quiso".
"Fuente: Brief de Andrés"... ¿el estudiante es la fuente del precio? Bueno.
¡Y hasta acá abajo, "Datos del caso"! Cuatro pantallas después. Por aquí tenía que empezar. "Navegadora dueña del caso (nombre ficticio)": ¿me invento un nombre?
Chiapas, Ninguna, Informal, 50 a 59, CURP palomeada... ¡es igualita a mi señora! Entonces lo de arriba sí era mi caso. Qué suerte, porque si no, ni me doy cuenta.

### ruta-5.png
Número de Seguridad Social no, orden del proveedor sí. Celular básico, 14 días, transporte.
"Intentos automáticos fallidos sobre esta misma acción: Ninguno": no sé qué poner, lo dejo así.
"¿Dio consentimiento expreso?" ya viene con "Sí, por escrito", pero yo no le he hecho firmar nada. ¿Tengo que tener un papel? ¿Cuál?
Y ya: no hay botón de "Listo" ni de "Ver resultado". Si le cambio algo, ¿dónde veo qué pasó? Tendría que subir cuatro pantallas. Si mi paciente fuera distinta del ejemplo, aquí me pierdo.

### ruta-6.png
Fin de la página.
Me llevo esto: IMSS-Bienestar, gratis, antes del 28 de septiembre, con la orden, CURP, identificación, comprobante de domicilio y foto.
Lo del transporte no me lo resolvió, y lo que sigue después estaba en la letra gris que no entendí. Tampoco encontré cómo pasarme la tarjeta en limpio para tenerla a la mano.

---

## Bitácora de confusiones

| # | Pantalla | Qué intentaba | Qué no entendió / dónde se atoró | Sus palabras exactas | Gravedad |
|---|---|---|---|---|---|
| 1 | home-1 | Entender qué hace la app | "cada cita se comprueba contra el texto": cree que "cita" es una cita médica | "¿Cita? ¿Cita de consulta? No sé qué tiene que ver." | MENOR |
| 2 | home-2 | Elegir por dónde empezar | "tarjeta de traspaso con dueña" | "Traspaso suena a traspasar un local. Ni idea." | MENOR |
| 3 | home-2 | Entender qué significa el veredicto | La metáfora "cruza / no cruza" nunca se explica y es la palabra central de todos los veredictos | "¿Cruza qué? ¿Quiere decir que no firme con nadie?" | FRENA |
| 4 | home-2 | Saber si confiar en las reglas | "Blueprint del equipo T2, LFPDPPP 2025, CONDUSEF, CMS, /reglas" | "Sopa de letras, me la salto." | MENOR |
| 5 | home-2 | Leer para qué sirve | "Qué espera elimina" se lee como frase rota | "¿Le falta una palabra? Se lee raro." | MENOR |
| 6 | home-3 | Decidir si le sirve para su contrato real | "estudiante", "Todo lo que ves es inventado", "LLM real vía Vercel AI Gateway" | "¿Entonces es tarea de la escuela? ¿Me sirve para mi contrato de verdad o no?" | FRENA |
| 7 | canal-1 | Encontrar su oferta | "(el pagador del Blueprint)", "cortafuegos" | "¿Cortafuegos como los de las computadoras?" | MENOR |
| 8 | canal-1 | Leer la advertencia | La advertencia clave ("Los términos declarados se ven limpios; lee el texto") viene en jerga y en gris | "No le entendí, lo brinco." | FRENA |
| 9 | canal-1 | Saber si firma | El cuadro amarillo grande "CRUZA CON CONDICIONES · 0 bloquean · 0 de riesgo" sale ANTES de revisar el contrato y lo toma como un sí | "Se puede firmar, con condiciones, y nada es grave." | BLOQUEA TAREA |
| 10 | canal-2 | Entender el porqué | Códigos "R19 · Condición 5: Operación financiada y medible", "Fuente: Blueprint T2, Condiciones 4 y 5" | "Números de regla, ni caso." | MENOR |
| 11 | canal-2 | Saber qué pedir que cambien | "Qué lo cura: Reporte agregado del destino de las referencias" | "¿Agregado a qué? ¿Referencias como las de un trabajo? No sé qué pedir con eso." | FRENA |
| 12 | canal-2 | Entender quién ve los datos | "cláusula sombra", "cifras agregadas" | "¿Sombra? ¿Algo escondido?" | FRENA |
| 13 | canal-2/3 | Ver qué datos recibe la farmacia | La tabla corta a la derecha la columna del pagador (una "C" mocha) y no avisa que se desliza; solo ve los "sí" de Paciente y Navegadora | "¿Y la farmacia qué ve? No aparece por ningún lado." | FRENA |
| 14 | canal-3 | Revisar su contrato | "Leer el texto del acuerdo como adversario" | "¿Adversario? ¿Me voy a pelear?" | MENOR |
| 15 | canal-3 | Pegar SU contrato | La caja ya viene llena con un convenio ficticio; no hay botón de borrar ni de subir PDF; "877/4000" sin explicar | "El mío lo tengo en PDF en el WhatsApp. ¿Cómo lo copio desde el celular? ¿Y si es más largo?" | FRENA |
| 16 | canal-3 | Saber qué hace el botón | "Leer el texto" | "Pensé que me lo iba a leer en voz alta." | MENOR |
| 17 | canal-3 | Poner los términos de su oferta | "Ver o cambiar los 14 términos declarados": cerrado, al fondo y en jerga. Nunca captura lo que le prometieron | "Catorce cosas me dan flojera, ni lo abro." | FRENA |
| 18 | canal-lectura-1 | Confiar en la lectura | Aviso "SIMULADO... El equipo de Vercel todavía no tiene tarjeta registrada" | "¿No pagaron? ¿Entonces lo que sigue no sirve? Casi cierro aquí." | FRENA |
| 19 | canal-lectura-1 | Entender la contradicción | "declaraste: Solo cifras agregadas", aunque ella no llenó nada | "¡Yo no declaré nada, ya venía así!" | FRENA |
| 20 | canal-lectura-1 | Saber si ahora firma | Descubre que mandan la lista de pacientes con teléfono a la farmacia, pero el veredicto de arriba sigue en "CRUZA CON CONDICIONES · 0 bloquean". No aparece un veredicto nuevo | "¿Y el cuadro amarillo de arriba que decía 0 bloquean? No me dice si ahora ya no lo firmo." | BLOQUEA TAREA |
| 21 | canal-lectura-1/2 | Leer los hallazgos | "cita comprobada ✓" | "Otra vez 'cita'. Me costó." | MENOR |
| 22 | canal-lectura-2 | Leer los hallazgos | La misma frase de los teléfonos sale dos veces (en "no coincide" y en "cláusulas a pelear") | "¿Se repitió por error?" | MENOR |
| 23 | canal-lectura-2 | Armar la lista de cambios para la farmacia | Lo que hay que pedir está regado en 5 lugares ("Qué lo cura" ×2, "Pregúntale" ×3), en forma de preguntas y no de cambios; no hay botón para copiar ni compartir | "Voy a tener que tomar captura de tres pedazos." | FRENA |
| 24 | canal-lectura-2 | Hablar con el gerente | "¿Aceptaría solo cifras agregadas?": no puede explicarle el término a la farmacia | "Si me pregunta qué son 'cifras agregadas', no sé explicarle." | FRENA |
| 25 | comparar-1 | Comparar sin sesgo | "Yo defendí la remesa" | "¿Quién es 'yo'? Entonces esto es su opinión, no algo parejo." | FRENA |
| 26 | comparar-1 | Entender la diferencia | "(R08, R23)", "grupos de 11 o más", "la sombra del capítulo". La idea útil (la remesadora es de un grupo que vende seguros y créditos) queda enterrada | "¿Qué capítulo? ¿De qué libro?" | FRENA |
| 27 | comparar-1/2 | Saber cuál es su farmacia | La viñeta dice "ni la farmacia ni la remesa cruzan como suelen ofrecerse", pero la tarjeta de Farmacia B (tarifa fija, la suya) sale amarilla, "CRUZA" | "¿La mía es la A o la B? Ya no sé a quién creerle." | FRENA |
| 28 | comparar-2 | Leer los resultados | "4 bloquean · 10 en total" | "¿10 qué?" | MENOR |
| 29 | comparar-2 | Ubicar su remesadora | "como la ofrecen" vs "con cortafuegos" | "¿Cuál me están ofreciendo a mí? No sé si la mía trae cortafuegos." | FRENA |
| 30 | comparar-2 a 5 | Saber cuál le conviene | No hay recomendación en palabras simples ni comparación de dinero; la conclusión es "empate con las mismas cláusulas" | "Me voy sin saber cuál me conviene." | BLOQUEA TAREA |
| 31 | comparar-2/3 | Ver farmacia vs remesa en la tabla | Las columnas de la remesadora quedan escondidas a la derecha; son 14 renglones largos y solo alcanza a ver A contra B | "Solo veo Farmacia A contra Farmacia B, que no es lo que quiero comparar." | FRENA |
| 32 | comparar-3 | Leer la tabla | La "—" es ambigua. En Farmacia B sale "—" en "El pagador recibe la lista de nombres", aunque su contrato manda teléfonos | "¿La rayita es buena, quiere decir 'no aplica' o 'no sé'?" | FRENA |
| 33 | comparar-4 | Descifrar la C y la R | La leyenda de C1–C6 está hasta el final; la R nunca se explica | "¡Ahora me explican qué era la C, después de catorce renglones!" | MENOR |
| 34 | ruta-1 | Meter a su paciente | El resultado sale primero con un caso de ejemplo ("Rosa") y el formulario está cuatro pantallas abajo | "¿Rosa? Yo todavía no he escrito nada. ¿Esto es de otra señora?" | FRENA |
| 35 | ruta-1 | Entender el encabezado | "clínico del proveedor", "Tarjeta de traspaso", "Dueña" | "¿Qué proveedor? ¿El laboratorio?" | MENOR |
| 36 | ruta-1 | Resolver el transporte | "Transporte (modificable por coordinación)" sin ninguna acción concreta | "¿O sea que yo le consigo el transporte? ¿Cómo?" | FRENA |
| 37 | ruta-2 | Entender el seguimiento | "intentos automáticos fallidos", "automatización", "(Condición 3)" | "¿Un robot le llama a mi paciente? Nosotras le llamamos a mano." | MENOR |
| 38 | ruta-2 | Saber cuándo se cierra el caso (qué sigue) | Letra gris chiquita: "opt-out informado, o aceptación humana explícita" | "No le entendí, me la salto." | FRENA |
| 39 | ruta-2 | Confiar en la ventanilla | "(todas por verificar)", "PRINCIPAL — POR VERIFICAR" | "¿Todas? ¿Entonces nada es seguro?" | MENOR |
| 40 | ruta-2 | Saber qué papeles lleva | Da los requisitos "para el registro en línea" (correo, foto) a una paciente con celular básico, y no dice cuáles le faltan aunque abajo ya están marcados CURP y orden | "¿Y cuáles le faltan a ella? No me lo dice." | FRENA |
| 41 | ruta-3 | Llegar al final | Dos tarjetas largas de opciones que NO aplican (Seguro de Salud para la Familia, Incorporación voluntaria) antes del formulario | "Ya me cansé; esto no le sirve a una señora que no tiene ni para el camión." | FRENA |
| 42 | ruta-3/4 | Confiar en las fuentes | "El Siglo de Torreón", "Brief de Andrés" | "¿Un periódico de Torreón para una regla del IMSS?" | MENOR |
| 43 | ruta-4 | Llenar a la dueña del caso | "(nombre ficticio)" | "¿Me invento un nombre?" | MENOR |
| 44 | ruta-5 | Llenar el caso | "Intentos automáticos fallidos sobre esta misma acción" | "No sé qué poner, lo dejo así." | MENOR |
| 45 | ruta-5 | Llenar el consentimiento | Viene precargado "Sí, por escrito" y no sabe qué papel cuenta | "Yo no le he hecho firmar nada. ¿Tengo que tener un papel? ¿Cuál?" | MENOR |
| 46 | ruta-5 | Ver el resultado de su caso | No hay botón de "Ver resultado"; los cambios se actualizan cuatro pantallas arriba, sin aviso | "Si le cambio algo, ¿dónde veo qué pasó?" | FRENA |
| 47 | todas | Terminar de leer | El mismo párrafo gris de "LLM / Vercel AI Gateway / simulación etiquetada" en cada pantalla | "Otra vez el párrafo gris, igualito." | MENOR |

**Conteo:** 3 BLOQUEA TAREA · 24 FRENA · 20 MENOR (47 en total).

---

## ¿Completó sus 3 tareas?

**1. "¿Lo firmo o no, y qué les pido que cambien?" → A medias (y en "¿lo firmo?", NO).**
Si se queda en el cuadro amarillo (canal-1), se va con la conclusión equivocada: "sí firmo con condiciones, nada bloquea". Si llega a la lectura del contrato, sí descubre lo grave (lista de pacientes con teléfono para la farmacia, el laboratorio de la farmacia sugerido primero, el documento que no obliga a nada). Pero el veredicto de arriba nunca cambia, así que termina con dos respuestas contradictorias. Lo que tiene que pedir sí aparece (tres "Pregúntale al pagador" y dos "Qué lo cura"), pero regado, en forma de preguntas y con "cifras agregadas" sin traducir. Se lleva capturas de pantalla, no una lista para mandar.

**2. "¿Me conviene más la farmacia o la remesadora?" → No.**
La página responde "ninguna así como se ofrece; las dos pasan con las mismas cláusulas; cambia dónde vive el conflicto". Para ella eso es "da igual", sin recomendación ni montos. Además, la viñeta contradice la tarjeta amarilla de Farmacia B, las columnas de la remesadora quedan escondidas en una tabla que hay que deslizar de lado, y "Yo defendí la remesa" le hace pensar que es una opinión. La única idea que se lleva (el grupo de la remesadora vende seguros y créditos) está enterrada entre códigos.

**3. "¿A dónde la mando, qué papeles lleva y qué sigue?" → A medias.**
- **A dónde:** sí. IMSS-Bienestar, $0, antes del 28 de septiembre, con la orden. Está arriba y es claro.
- **Qué papeles:** a medias. Ve lo que piden "para el registro en línea", pero no le dice cuáles le faltan a su paciente (identificación y comprobante de domicilio), aunque el formulario ya lo sabe; y habla de correo y registro en línea a una señora con celular básico.
- **Qué sigue:** a medias. La barrera de transporte queda en "modificable por coordinación" sin acción concreta, y cómo se cierra el caso está en letra gris con "opt-out".
- **Suerte:** el ejemplo coincidía con su paciente. Con otra paciente, el formulario al fondo y sin botón de resultado la habría perdido.

---

## Las 3 correcciones más importantes

### 1. Que el veredicto cambie con lo que dice el contrato y termine en una lista de cambios lista para mandar (pantalla /canal)
Arregla los atorones #9, #20, #23, #15 y #17, y resuelve la tarea 1.
- **Orden de la pantalla:** el paso 1 es la caja del contrato: "1. Pega aquí el contrato que te mandaron", con botón "Borrar ejemplo" y una nota "Si está en PDF: ábrelo, mantén el dedo sobre el texto, Seleccionar todo → Copiar". El veredicto va después.
- **Antes de revisar el contrato**, el cuadro no dice "CRUZA CON CONDICIONES" en amarillo. Dice, en gris: **"Con lo que te prometieron, se podría. OJO: todavía no revisas el contrato."**
- **Después de revisarlo** (el botón pasa a llamarse **"Buscar la letra chiquita"**), el cuadro de arriba se reemplaza por algo como:
  > **Con lo que dice el contrato: NO LO FIRMES ASÍ.**
  > Pídeles que cambien estas 3 cosas:
  > 1. Cláusula TERCERA: la farmacia NO recibe lista de pacientes ni teléfonos. Solo números totales, sin nombres, y nunca de grupos de menos de 11 personas.
  > 2. Quitar "se sugerirá el laboratorio de la Farmacia": nosotras mandamos primero a la opción gratuita.
  > 3. Firmar el contrato y pagar el primer mes antes de inscribir pacientes.
  >
  > [Copiar para WhatsApp]
- **Sin que la IA decida:** para respetar "la IA no decide el veredicto", el cambio de términos lo confirma ella con un toque: "El contrato dice que la farmacia recibe teléfonos. ¿Corregir lo prometido y volver a calcular? [Sí]". Así las reglas públicas recalculan con términos que ella confirmó.
- **Duda pendiente:** no sé si esa confirmación cabe en el diseño del equipo (que un hallazgo del texto cambie un término). Hay que validarlo con el Blueprint.

### 2. Pasar todo a palabras de enfermera y esconder los códigos y las tripas técnicas (todas las pantallas)
Arregla los atorones #3, #8, #10–12, #14, #18, #19, #21, #24, #26, #33, #35, #37, #38 y #47.
- **Reemplazos directos:**
  - CRUZA → **"Sí se puede"**
  - CRUZA CON CONDICIONES → **"Solo si cambian esto"**
  - NO CRUZA → **"Así no"**
  - cifras agregadas → **"solo números totales, sin nombres"**
  - cláusula sombra → **"letra chiquita sobre quién ve los datos"**
  - términos declarados → **"lo que te prometieron"**
  - cortafuegos → **"con candado: el banco no ve datos de salud"**
  - cita comprobada ✓ → **"frase copiada tal cual del contrato ✓"**
  - tarjeta de traspaso → **"Qué sigue"**
  - escalamiento → **"cuándo lo revisa una persona"**
  - opt-out informado → **"ella dijo que ya no quiere seguir"**
- **Códigos y fuentes:** R19, C5, "Blueprint T2" y las fuentes van detrás de un enlace pequeño "¿De dónde sale esto?", nunca en la línea principal.
- **Aviso SIMULADO:** cambiarlo por "Revisión básica: busca frases conocidas y puede fallar. Lee tú también el contrato." Sin mencionar Vercel, tarjetas ni "no es una IA".
- **Tabla "Quién ve qué dato":** cambiarla por tres tarjetas apiladas que no se cortan: "**La farmacia ve:** …", "**Tú ves:** …", "**La paciente ve:** …". Lo primero debe ser lo que ve la farmacia.
- **Pie de página:** el párrafo gris va una sola vez, en la pantalla de inicio.

### 3. Que Comparar dé la respuesta en la primera pantalla, con solo dos columnas (pantalla /comparar)
Arregla los atorones #25, #27, #29, #30, #31 y #32, y resuelve la tarea 2.
- **Primera tarjeta:**
  > **¿Cuál te conviene?** Si las dos aceptan las mismas 4 condiciones, cualquiera sirve. Cambia qué tienes que vigilar:
  > - **Farmacia:** a dónde mandas a las pacientes, que no terminen todas en su sucursal.
  > - **Remesadora:** quién ve los datos. Su grupo vende seguros y créditos, y un resultado de diabetes les sirve para negar o cobrar más.

  Si hay montos, agregar un renglón "Cuánto da cada uno".
- **Tabla:** quitar los 5 cuadros y la tabla que se desliza de lado. Poner una lista vertical **"Farmacia B (la que te ofrecieron) vs. Remesadora"** solo con las reglas donde son distintas, usando ✓ "sin problema" / ✗ "así no" / ? "pregúntales" en lugar de "—".
- **Textos:** borrar "Yo defendí la remesa" y "la sombra del capítulo". Corregir la viñeta que contradice las tarjetas: "Farmacia con comisión y remesadora como la ofrecen: así no. Farmacia de tarifa fija y remesadora con candado: solo si cambian estas cosas."

**Justo después (4.º):** en /ruta, poner el formulario primero ("1. Cuéntame de tu paciente") con un botón "Ver a dónde mandarla" que baje al resultado. Agregar el renglón **"Le faltan: identificación oficial y comprobante de domicilio"**, una acción concreta para el transporte, y mandar las ventanillas que no aplican a un desplegable "Otras opciones que hoy NO le sirven (2)".

---

# Log completo de la re-prueba sobre el deploy #4 (sin editar)

## Re-prueba (deploy #4)

Lupita Méndez vuelve a la misma app. Solo tareas 1 (¿firmo y qué pido?) y 2 (¿farmacia o remesadora?).

### antes-1.png
Ahora arriba dice clarito: "pega el contrato que te mandaron y toca Revisar el contrato". Eso sí lo entiendo, ya sé qué hacer.
Pero los botones de ejemplo siguen diciendo "Blueprint" y "cortafuegos", y "Los términos declarados se ven limpios; lee el texto" sigue sin decirme nada.
"1 · El contrato... hasta 4,000 letras": mi contrato de verdad son como tres hojas y está en PDF en el WhatsApp. ¿Cómo lo copio, y qué hago con lo que no cabe? Por hoy uso el que ya viene escrito.

### antes-veredicto-1.png
"2 · ¿Lo firmo? Todavía no revisas el contrato." Bueno, ya no me dice que sí de entrada, y el cuadro es gris, no amarillo.
Aunque entre comillas dice «se puede firmar, después de verificar». Si leo rápido, me quedo con eso.
Los "Qué pedir" ya se entienden: un reporte de cuántas pacientes fueron a la sucursal y cuántas a lo gratuito, y que firmen y paguen antes de empezar. Eso sí se lo puedo decir al gerente.

### leido-1.png
Le piqué a Revisar. Cuadro rojo: "NO FIRMES TODAVÍA. El contrato no dice lo mismo que te dijeron." ¡Eso es lo que quería oír!
"Te dijeron: Solo números totales, sin nombres. El contrato dice: ...el listado de pacientes atendidos con su número telefónico." Ya lo entendí sin diccionario.
Pero el botón amarillo dice "Usar lo que dice el contrato: Nombre y teléfono de cada paciente". ¿Si le pico estoy aceptando darles los teléfonos? Me da miedo. Le pico nomás porque el cuadro rojo me dice que le pique.

### leido-2.png
"Frases del contrato para pelear (1)": lo de que el papel "no obliga a las partes" y "Pregúntales: ¿Cuándo se firma el contrato y llega el primer pago?". Clarito.
Abajo, en gris y suelto, "Dinero sin conflicto, y medible". ¿Eso qué es, un título?
Luego otra vez "Por qué dicen eso las reglas", con las mismas dos tarjetas que ya leí arriba. Ya me estoy cansando de bajar.

### leido-3.png
"Quién ve qué dato" ya viene en tarjetitas y se ve completo. Ahora sí aparece el Pagador.
Pero en Pagador pone una rayita, no un "no". ¿La rayita es no?
Y son cinco tarjetas de cinco renglones cada una... esto ya no lo leo entre turnos.

### corregido-1.png
Ya le piqué a los dos botones y arriba cambió: "NO LO FIRMES ASÍ. Primero pide los cambios de la lista." Perfecto. Y aparece "3 · Qué pedirles" con botón de WhatsApp. ¡Esto es lo que necesitaba!
Pero "1. Eliminar la lista. La conciliación de pagos se hace con conteos"... ¿cuál lista? ¿Conciliación? Si se lo mando así al gerente, me va a preguntar cuál cláusula.
Y en gris dice "0 bloquean · 2 de riesgo". ¿Pasarle a la farmacia el nombre y teléfono de mis señoras del programa de diabetes no bloquea? Si están en esa lista, ya saben que salieron mal de azúcar.

### corregido-2.png
Abajo, en cada diferencia, ahora dice "✓ La respuesta de arriba ya usa lo que dice el contrato".
Ah, entonces el botón no era para aceptar, era para que la página hiciera la cuenta con lo del papel. Me tranquilizó, pero me enteré después de picarle.
Y todo lo demás se repite otra vez hacia abajo.

### comparar-1.png
"¿Farmacia o remesadora?": ¡por fin la pregunta con mis palabras! "Si aceptan las mismas cuatro condiciones, cualquiera de las dos sirve... Así como suelen ofrecerse, ninguna." Eso lo entiendo.
Lo que hay que vigilar también está clarísimo: con la farmacia, a dónde mandan a la paciente; con la remesadora, quién ve los datos, porque su grupo vende seguros y préstamos.
Pero yo pregunté cuál me conviene MÁS, y me contesta "cualquiera". ¿Y cuánto da cada una? Pienso yo solita que a dónde mando a mis pacientes lo controlo yo, y lo que haga un banco con los datos no lo puedo vigilar desde Tuxtla. Eso lo pensé yo; la página no me lo dijo.

### comparar-respuesta-1.png
Bajo tantito y aparece "Farmacia B · pago fijo: SE PUEDE FIRMAR, DESPUÉS DE VERIFICAR", en amarillo y grandote. ¡Pero si hace rato me dijo NO LO FIRMES ASÍ!
Ya vi que abajo, chiquito, dice "según lo que promete", y arriba está el "Ojo". Pero si le tomo captura a esto para mi jefa, lo que se lee es que sí se puede firmar.
"4 reglas bloquean" en la Farmacia A. ¿Cuáles cuatro?

---

## Confusiones que siguen o que aparecieron

| # | Pantalla | Qué no entendió | Sus palabras | Gravedad |
|---|---|---|---|---|
| 1 | antes-1 | Siguen "(el pagador del Blueprint)", "con cortafuegos" y "Los términos declarados se ven limpios; lee el texto" (sigue del deploy anterior) | "¿Blueprint? ¿Cortafuegos? Eso sigue igual." | MENOR |
| 2 | antes-1 | Cómo meter SU contrato: no hay instrucción para copiar desde un PDF en el celular, y el límite de "hasta 4,000 letras" no alcanza para un contrato real de varias hojas. La caja ya trae el ejemplo; en la captura no se alcanza a ver un botón para borrarlo, quizá está debajo (sigue) | "Mi contrato son tres hojas. ¿Qué hago con lo que no cabe?" | FRENA |
| 3 | antes-1 / leido-1 | "Te dijeron: Solo números totales, sin nombres" sale del ejemplo preseleccionado, no de lo que le prometió SU farmacia, y no ve dónde capturar eso (nuevo en forma: antes era "declaraste") | "¿Quién me dijo? Yo no le conté a la página qué me prometieron." | FRENA |
| 4 | antes-veredicto-1 | «se puede firmar, después de verificar» va entre comillas dentro del cuadro gris; leyendo rápido se queda con eso (nuevo) | "Ah, se puede firmar... ah, no, dice que lo revise." | MENOR |
| 5 | leido-1 | El botón amarillo "Usar lo que dice el contrato: Nombre y teléfono de cada paciente" suena a ACEPTAR darle los teléfonos a la farmacia (nuevo) | "¿Si le pico estoy aceptando darles los teléfonos? Me da miedo picarle." | FRENA |
| 6 | leido-1/2 | La lista "3 · Qué pedirles" solo aparece después de picar los dos botones; si no pica por el miedo del #5, se queda sin lista y sin botón de WhatsApp (nuevo) | "¿Y la lista de qué pedir, dónde está?" | FRENA |
| 7 | leido-1 | "Revisión SIMULADA (sin IA por ahora)": mejoró mucho, pero sigue sembrando duda (sigue, más leve) | "¿Sin IA? ¿Entonces qué tanto le creo?" | MENOR |
| 8 | leido-2 | Etiqueta gris suelta "Dinero sin conflicto, y medible" (nuevo) | "¿Eso qué es, un título?" | MENOR |
| 9 | leido-2/3 | "Por qué dicen eso las reglas" repite las mismas tarjetas que ya leyó antes de revisar; la página sigue muy larga (sigue) | "Esto ya lo leí. ¿Dónde se acaba?" | MENOR |
| 10 | leido-3 | En las tarjetas de "Quién ve qué dato", el Pagador sale con "—" en vez de "no" (sigue) | "¿La rayita es no?" | MENOR |
| 11 | corregido-1 | Bajo "NO LO FIRMES ASÍ" dice en gris "0 bloquean · 2 de riesgo": que la farmacia reciba nombre y teléfono de cada paciente de un programa de diabetes cuenta solo como "riesgo" (nuevo) | "Si la farmacia tiene la lista de mi programa, ya sabe que mis señoras salieron mal de azúcar. ¿Cómo que no bloquea?" | FRENA |
| 12 | corregido-1 | "1. Eliminar la lista. La conciliación de pagos se hace con conteos." No dice qué cláusula ni qué lista, y "conciliación de pagos" es jerga. Mandado por WhatsApp, fuera de contexto, no se entiende (nuevo) | "¿Cuál lista? Si le mando esto al gerente, me va a preguntar cuál." | FRENA |
| 13 | corregido-1 | "2. Cláusula: la navegadora ofrece primero la opción gratuita..." El "Cláusula:" suelto no dice si hay que agregarla o cambiar una que ya existe (nuevo) | "¿Cláusula qué? ¿La agregan o la cambian?" | MENOR |
| 14 | corregido-1 | "Lo que falta verificar" mezcla algo que hay que PEDIR (el reporte mensual, que antes decía "Qué pedir") con algo que ella tiene que revisar (nuevo) | "¿Esto lo pido o lo reviso yo?" | MENOR |
| 15 | corregido-1 | "Reglas v0.1.1 · 13-sep-2026 · La IA no decide esta respuesta: la deciden las reglas" (sigue) | "Números de versión, ni caso." | MENOR |
| 16 | corregido-1 vs comparar-1 | Comparar habla de "cuatro condiciones" (incluye permiso por escrito y prohibido usar los datos para vender), pero en su lista de Farmacia B vienen 2 cambios y 2 por verificar que no coinciden (nuevo) | "¿Y lo del permiso por escrito? En mi lista no viene." | MENOR |
| 17 | comparar-respuesta-1 | Tarjeta amarilla grande "Farmacia B · SE PUEDE FIRMAR, DESPUÉS DE VERIFICAR", cuando en /canal su contrato dio "NO LO FIRMES ASÍ". El "según lo que promete" es gris y chiquito (sigue la contradicción, suavizada por el "Ojo") | "¡Allá me dijo que no lo firme y aquí, en grandote, que sí se puede! ¿A cuál le creo?" | FRENA |
| 18 | comparar-1 | "¿Me conviene MÁS?" se contesta con "cualquiera de las dos sirve": no hay desempate (qué es más fácil de vigilar para una navegadora) ni cuánto dinero da cada una (sigue, más leve) | "Ok, cualquiera... pero ¿cuál agarro? ¿Cuál da más?" | FRENA |
| 19 | comparar-respuesta-1 | "4 reglas bloquean", sin decir cuáles (sigue) | "¿Cuáles cuatro?" | MENOR |

**Conteo:** 0 BLOQUEA TAREA · 8 FRENA · 11 MENOR (19 en total). En la prueba anterior fueron 3 · 24 · 20, contando todas las pantallas.

---

## ¿Completa las tareas 1 y 2 ahora?

**1. "¿Lo firmo o no, y qué les pido que cambien?" → Sí, con tropiezos.**
- **¿Lo firmo?** Ya hay una respuesta clara y sin contradicción dentro de /canal. Antes de revisar el contrato no dice "sí"; después dice "NO FIRMES TODAVÍA" y, al final, "NO LO FIRMES ASÍ". Los dos bloqueos de la prueba anterior se resolvieron.
- **¿Qué pido?** Se lleva la lista "3 · Qué pedirles" con botón de WhatsApp.
- **Tropiezo 1:** para que salga la lista tiene que picar un botón que suena a aceptar darle los teléfonos a la farmacia (#5, #6).
- **Tropiezo 2:** el primer cambio, "Eliminar la lista... conciliación de pagos", no le sirve mandado tal cual al gerente (#12).
- **Tropiezo 3:** el "0 bloquean" en gris le quita fuerza al "no firmes" y le hace dudar de las reglas (#11).
- **Reserva:** esto funcionó con el contrato de ejemplo. Con su contrato real (PDF, más de 4,000 letras, promesas que la página toma del ejemplo) no está probado que llegue al mismo resultado (#2, #3).

**2. "¿Me conviene más la farmacia o la remesadora?" → A medias (casi sí).**
- **Lo que ya entiende:** "Así como vienen, ninguna; con las mismas cuatro condiciones, cualquiera. Con la farmacia cuido a dónde mando a las pacientes; con la remesadora, quién ve los datos." Es un avance enorme respecto a la prueba anterior, que era un "no".
- **Por qué no es un sí completo:** la pregunta era cuál conviene MÁS, y la página contesta "cualquiera", sin desempate ni montos. El desempate lo tuvo que razonar ella sola (#18).
- **La contradicción sigue:** en la misma página, la tarjeta grande de Farmacia B dice "SE PUEDE FIRMAR" justo después de que /canal le dijo "NO LO FIRMES ASÍ" (#17).

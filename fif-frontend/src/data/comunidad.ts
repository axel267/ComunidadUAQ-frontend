export type FiltroComunidad = "para-ti" | "carrera" | "tendencias" | "dudas";

export const FILTROS_COMUNIDAD: { id: FiltroComunidad; label: string }[] = [
  { id: "para-ti", label: "Para ti" },
  { id: "carrera", label: "Mi Carrera (Ingeniería)" },
  { id: "tendencias", label: "Tendencias" },
  { id: "dudas", label: "Preguntas / Dudas" },
];

export type MotivoReporte =
  | "Conducta inapropiada / Acoso"
  | "Incita al odio o discriminación"
  | "Cuenta falsa o Spam comercial"
  | "Contenido no apto o engañoso";

export const MOTIVOS_REPORTE: {
  id: MotivoReporte;
  icono: "block" | "warning" | "bot" | "campaign";
  colorClase: string;
}[] = [
  { id: "Conducta inapropiada / Acoso", icono: "block", colorClase: "text-error" },
  { id: "Incita al odio o discriminación", icono: "warning", colorClase: "text-error" },
  { id: "Cuenta falsa o Spam comercial", icono: "bot", colorClase: "text-secondary" },
  { id: "Contenido no apto o engañoso", icono: "campaign", colorClase: "text-tertiary" },
];

export interface RespuestaComentario {
  id: string;
  autor: string;
  siglas: string;
  avatarClases: string;
  facultad?: string;
  esAutorPost?: boolean;
  esPropio?: boolean;
  verificado?: boolean;
  tiempo: string;
  creadoEn: number;
  mencion?: string;
  texto: string;
  likes: number;
  liked?: boolean;
}

export interface ComentarioComunidad {
  id: string;
  autor: string;
  siglas: string;
  avatarUrl?: string;
  avatarClases: string;
  verificado?: boolean;
  insignia?: string;
  insigniaClases?: string;
  esPropio?: boolean;
  editado?: boolean;
  recienPublicado?: boolean;
  tiempo: string;
  creadoEn: number;
  ubicacion?: string;
  texto: string;
  likes: number;
  liked?: boolean;
  respuestas: RespuestaComentario[];
}

export interface ImagenGaleria {
  url: string;
  alt: string;
}

export interface PostComunidad {
  id: string;
  tipo: "galeria" | "pregunta" | "convocatoria" | "debate";
  categoriasFiltro: FiltroComunidad[];
  autor: {
    nombre: string;
    siglas: string;
    avatarUrl?: string;
    avatarClases: string;
    facultad: string;
    facultadClases: string;
    verificado?: boolean;
  };
  subtituloTiempo: string;
  etiquetaDestacada?: string;
  texto: string;
  textoSecundario?: string;
  galeria?: {
    principal: ImagenGaleria;
    secundariaSuperior: ImagenGaleria;
    secundariaInferior: ImagenGaleria & { extraCount: number };
  };
  eventoConvocatoria?: {
    imagenUrl: string;
    imagenAlt: string;
    torneoPill: string;
    titulo: string;
    fecha: string;
    lugar: string;
    cierre: string;
    ctaLabel: string;
    inscrito?: boolean;
  };
  fuegos: number;
  fuegoActivo?: boolean;
  comentariosLista: ComentarioComunidad[];
}

const AHORA = Date.now();
const min = (n: number) => AHORA - n * 60_000;

// Contenido tomado de las pantallas de Stitch "Comunidad Universitaria" y "Comentarios de la Publicación".
// TODO: reemplazar por la API cuando el backend exponga el feed comunitario.
export const POSTS_COMUNIDAD_INICIALES: PostComunidad[] = [
  {
    id: "post-taller-ms",
    tipo: "galeria",
    categoriasFiltro: ["para-ti", "tendencias"],
    autor: {
      nombre: "Mateo Silva",
      siglas: "MS",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAgmsB1y-KbSF9aD8JxhwaujLTSo9t9ZKVX8Xgmh-Beax9B-fdKFT9SEDvcxxnhmbB6aRnq9GV3Qat0QJOiJvZ3Sy7xw7ptIKz08xFISIo1h9J8XZ-DCV40sbHBNmQ8Z7N894Xqk4fG5e8PulbJhab2tkKQIowY_d1PluCERmqlFGYnlfzV0I1JkT-z7_PaBH7ROjOaUAjyMYEA5DZMVDBOBMiIhBp4vdfP8aT4bw3LijObF-kLyyjwsQ",
      avatarClases: "bg-primary-fixed text-on-primary-fixed",
      facultad: "Arquitectura",
      facultadClases: "bg-primary-fixed text-on-primary-fixed",
      verificado: true,
    },
    subtituloTiempo: "Hace 28 min • Taller Central",
    texto:
      "¡Sobrevivimos a la entrega final de Taller VIII! 🎉 Tras tres noches en vela y litros de café, la maqueta del Centro Cultural Metropolitano quedó lista. Gracias a todo el equipo por aguantar la presión. 🏛️✨",
    galeria: {
      principal: {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBc4Pth2OClPlAROyab522t6Co_bL7MXlRs_nTmhMfD0BQJsNW89A90oyi7ikMxPoCMkihwK1alZsPDhUdg6OTxnx8Pcg-KVKoaHLnSv0hcHiS1gCOYDR2jnBgPEOc_Nqaj9qiy2HYYyyGjXYz1-AommJVW-0x7pqkTeIC-93K3RtMSTFRa_gutqxh94G1sUqF9Vprb6AUTsvnZkAn3Nn4G01ZpH4uTxDeb7o4mZv9MvMxlvAMXuMLTPA",
        alt: "Maqueta arquitectónica del Centro Cultural Metropolitano en madera balsa",
      },
      secundariaSuperior: {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkywIPbH--bNNkzk4Y1z9u72xULj3WZMyltc1zdQTcy5tj0AhSTLz5DKld963dK6RmgFTGSThh594-YkOcUzXdfSq7JBNj1R_cVaBpsxrllsycLqNNKv5Fcq5vdtXoo7gKSaK3hJHLP6DxPxyYWPfENaAOka5vS7xTFRPo-99azFlzAfxfzB9nDAbo75_5kumXfx2etS31iYQgVyHMGgBwPNe72QBXBGkR8bbEN-pa0bahY5lJKCYd8A",
        alt: "Mesa de trabajo de arquitectura con escalímetros, planos y café",
      },
      secundariaInferior: {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS0Nfy3H4xklLY2H3rIMTUmc07RiWxu9_5W8guiIWhGqlbOFOUJyUtifCPyydRRPNP0NFgM6nrUOwNRnt7nXGi1eqq4uPWB6CN20Znv9JzhLNXgWWEWcQMBWA8X3SK1b9_U4LiO5vKDWcUi3LsriUXkz1K5UZz9AJBHn_fQeouunErXfH8ZrCSKrNilsMROt95aUh3zYEiJKb-M2TXkq3UaSQBAtYlv878PQLqnyPobLD2HzrkNvm_Qg",
        alt: "Equipo de estudiantes de arquitectura celebrando en el taller",
        extraCount: 3,
      },
    },
    fuegos: 142,
    fuegoActivo: true,
    comentariosLista: [
      {
        id: "com-ms-1",
        autor: "Fernanda Solís",
        siglas: "FS",
        avatarClases: "bg-secondary-fixed text-on-secondary-fixed",
        insignia: "Diseño",
        tiempo: "hace 20 min",
        creadoEn: min(20),
        ubicacion: "Centro Universitario",
        texto: "¡Qué nivel de detalle en las celosías del pabellón! Mucho éxito con los sinodales 👏",
        likes: 9,
        respuestas: [
          {
            id: "resp-ms-1",
            autor: "Mateo Silva",
            siglas: "MS",
            avatarClases: "bg-primary text-on-primary",
            esAutorPost: true,
            verificado: true,
            tiempo: "hace 12 min",
            creadoEn: min(12),
            mencion: "Fernanda Solís",
            texto: "¡Mil gracias Fer! El corte láser nos salvó la vida a las 3 AM.",
            likes: 4,
            liked: true,
          },
        ],
      },
    ],
  },
  {
    id: "post-pregunta-cr",
    tipo: "pregunta",
    categoriasFiltro: ["para-ti", "carrera", "dudas"],
    autor: {
      nombre: "Camila R.",
      siglas: "CR",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCE3RniBKdU-fEd00TU3kEdiqUiMdyPsJhoyu5ox3jak0Co3wV-8SV6PwEFA3GQ8ySOkujZJeC1DUZngT2cRrcZiv_2ZiDXJN8nRafzNJto2NQimbmWQKV3faVXDdQfNGa1IalRgdfAOdSmCkKP5RmJilwqMDJjRc1vQS-DsZU00OjBEe-K9tItvt4Fqd0bcL511IuBuEmufNp57E3n9Z4kiWBhpgcz0lPXcb8Nkh79qVwLA5hFwf6NZQ",
      avatarClases: "bg-surface-container-high text-on-surface-variant",
      facultad: "Ciencias",
      facultadClases: "bg-surface-container-high text-on-surface-variant",
    },
    subtituloTiempo: "Hace 8 min",
    etiquetaDestacada: "Pregunta al instante",
    texto: "¿Alguien en la cafetería central sabe si hay mucha fila para almorzar? 🍲",
    textoSecundario:
      "También quisiera confirmar si el Lab 4 de redes de Ingeniería está abierto hoy en la tarde. ¡Gracias!",
    fuegos: 19,
    // En las preguntas, la tarjeta muestra los últimos comentarios como "respuestas en tiempo real".
    comentariosLista: [
      {
        id: "com-cr-1",
        autor: "Diego A. (Sistemas)",
        siglas: "DA",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDKfDHxCEx7ioRI6ajZK6FMCq7fRYRpxzWT1zCqqz9PrCkexnCpop73qAmm83BD670JAt8SBH5Vx0Kkl07NXMTxh0j4blcklNrgdIw8wsVoK9GZ1tyURsYVMyXqAiPpNc7nl0qNN2rR0g-HZJdBdz5q-02SCyx4qD8r31xfYXEvdSGvZgwr-agYcJoDqZSAqnor5jIQidNYpiZ04hN0AcXmVRqDKGKsTBc_28p9FLTM2BmteNv9Xtknaw",
        avatarClases: "bg-secondary-fixed text-on-secondary-fixed",
        tiempo: "hace 4 min",
        creadoEn: min(4),
        ubicacion: "Cafetería Central",
        texto: "Fila súper rápida hoy, tardas como 5 minutos nomás. Los especiales de pasta siguen disponibles 🙌",
        likes: 6,
        respuestas: [],
      },
      {
        id: "com-cr-2",
        autor: "Valeria (Monitora Lab)",
        siglas: "VL",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAvUT6sbwEUuaXXDqwFCPpCwgxwbB5FQmj0BFRAfAb8KW7sk74HA5f4dBp65hHUegZIC03cjX7c6Y9GThR-bJM3VHCR4p4xy0arrvPvJH9JUbTDoPNenl3_12pdrnOazPasaS26qC08V7-DFczBiDKM0bXTBsPzcoZZSTlHo9N3BvdSqqBQdENpOM33JaHx3n8F9y2ng7D149dTGzk1MeppMgslKGlYk2eRU2OXfyEGV9BV2dUfMNCnCg",
        avatarClases: "bg-primary-fixed text-on-primary-fixed",
        verificado: true,
        insignia: "Monitora Lab",
        insigniaClases: "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant",
        tiempo: "hace 2 min",
        creadoEn: min(2),
        ubicacion: "Lab 4 Redes",
        texto: "¡Hola Cami! Lab 4 abierto corrido hasta las 7:00 PM. Hay puestos con routers libres ahora mismo.",
        likes: 11,
        respuestas: [],
      },
    ],
  },
  {
    id: "post-hackathon-rl",
    tipo: "debate",
    categoriasFiltro: ["para-ti", "carrera", "tendencias"],
    autor: {
      nombre: "Rodrigo Luna",
      siglas: "RL",
      avatarClases: "bg-primary-fixed text-on-primary-fixed",
      facultad: "FIF UAQ",
      facultadClases: "bg-primary/10 text-primary",
      verificado: true,
    },
    subtituloTiempo: "hace 2 horas • Campus Juriquilla",
    etiquetaDestacada: "Hackathon 2025",
    texto:
      "¡Excelente hackathon interfacultades! Convocatoria abierta para el equipo de desarrollo móvil en Campus Juriquilla. ¿Alguien con experiencia en Flutter o Kotlin? 🚀💻",
    fuegos: 24,
    fuegoActivo: true,
    comentariosLista: [
      {
        id: "com-rl-1",
        autor: "Diego Camacho",
        siglas: "DC",
        avatarClases: "bg-secondary-fixed text-on-secondary-fixed",
        insignia: "FI",
        tiempo: "hace 1 hora",
        creadoEn: min(60),
        ubicacion: "Campus Juriquilla",
        texto:
          "¡Yo le entro! Llevo dos semestres trabajando con Flutter y Riverpod para State Management. Mándame DM para coordinar.",
        likes: 2,
        respuestas: [
          {
            id: "resp-rl-1",
            autor: "Rodrigo Luna",
            siglas: "RL",
            avatarClases: "bg-primary text-on-primary",
            esAutorPost: true,
            verificado: true,
            tiempo: "hace 35 min",
            creadoEn: min(35),
            mencion: "Diego Camacho",
            texto: "¡Va que va! Te escribo en Discord para pasarte los accesos del repo.",
            likes: 1,
          },
        ],
      },
      {
        id: "com-rl-user",
        autor: "Sofía M.",
        siglas: "SM",
        avatarClases: "bg-primary text-on-primary",
        esPropio: true,
        editado: true,
        tiempo: "hace 45 min",
        creadoEn: min(45),
        texto:
          "Cuento con experiencia en Kotlin Multiplatform y Jetpack Compose. Justo estoy libre las tardes de jueves y viernes para las sesiones de diseño de arquitectura.",
        likes: 8,
        liked: true,
        respuestas: [
          {
            id: "resp-rl-2",
            autor: "Rodrigo Luna",
            siglas: "RL",
            avatarClases: "bg-primary-container text-on-primary-container",
            esAutorPost: true,
            verificado: true,
            tiempo: "hace 30 min",
            creadoEn: min(30),
            texto:
              "¡Perfecto Sofía! Te mandé el link del Discord de desarrollo para agregarte a la sesión de arquitectura técnica.",
            likes: 3,
          },
        ],
      },
      {
        id: "com-rl-3",
        autor: "Mateo Rios",
        siglas: "MR",
        avatarClases: "bg-tertiary-fixed-dim text-on-tertiary-fixed",
        insignia: "Club GDG",
        insigniaClases: "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant",
        tiempo: "hace 18 min",
        creadoEn: min(18),
        ubicacion: "Campus Aeropuerto",
        texto:
          "Podemos prestar los kits de prueba y sensores de IoT si los necesitan en el laboratorio de cómputo avanzado de Campus Aeropuerto.",
        likes: 5,
        respuestas: [
          {
            id: "resp-rl-3",
            autor: "Diego Camacho",
            siglas: "DC",
            avatarClases: "bg-secondary-fixed text-on-secondary-fixed",
            facultad: "FI",
            tiempo: "hace 10 min",
            creadoEn: min(10),
            mencion: "Mateo Rios",
            texto: "¡Genial Mateo! Nos vemos el martes en el lab de Aeropuerto para checar compatibilidad.",
            likes: 2,
          },
        ],
      },
    ],
  },
  {
    id: "post-torneo-voleibol",
    tipo: "convocatoria",
    categoriasFiltro: ["para-ti", "tendencias"],
    autor: {
      nombre: "Consejo de Deportes",
      siglas: "CD",
      avatarClases: "bg-primary-container text-on-primary",
      facultad: "Oficial",
      facultadClases: "bg-tertiary-fixed text-on-tertiary-fixed font-bold",
    },
    subtituloTiempo: "Convocatoria Semestral • Abierta",
    texto:
      "Arma tu sexteto mixto (mínimo 2 integrantes de diferente facultad por equipo). Premios en efectivo para el podio y cupos para el torneo interuniversitario regional.",
    eventoConvocatoria: {
      imagenUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_wALijrsSYibuIb3KlObQs8Yb7M-9d9qQfjX-cKQ-SvGO-jEL1PXGMjElP0yVRtyioaDyBYmplHngFjRAx1XQnQHVeLUn4wBeAmWnxDZayhrOIl6tt-S5k3Pu-7HvC_fgJRSvJoX4Vfeob2QAuILreGiLa9s2SCENP9oBhLNFVQOAJuNMM1nWsV7rdwjjAa7p5jqSAv7sU2GIi31f1C__zNiovN6NxE3SgrEZPEh4xLZLwpROxhoa5w",
      imagenAlt: "Estudiantes jugando un partido de voleibol mixto en el polideportivo",
      torneoPill: "Torneo Relámpago 2025",
      titulo: "Voleibol Mixto Interfacultades",
      fecha: "Viernes 28 de Marzo",
      lugar: "Polideportivo Central",
      cierre: "Cierre: Mañana 11:59 PM",
      ctaLabel: "Inscribir mi equipo",
    },
    fuegos: 87,
    comentariosLista: [
      {
        id: "com-vb-1",
        autor: "Alejandro Torres",
        siglas: "AT",
        avatarClases: "bg-secondary-fixed text-on-secondary-fixed",
        insignia: "FCA",
        tiempo: "hace 35 min",
        creadoEn: min(35),
        ubicacion: "Polideportivo Central",
        texto: "Nos faltan 2 integrantes de Informática o Ingeniería para completar el sexteto mixto. ¿Quién se anima? 🏐",
        likes: 7,
        respuestas: [],
      },
    ],
  },
];

export function contarComentarios(post: PostComunidad): number {
  return post.comentariosLista.reduce((total, c) => total + 1 + c.respuestas.length, 0);
}

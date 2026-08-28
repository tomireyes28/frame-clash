---
name: frame-clash
description: Guía arquitectónica integral, reglas del juego, economía TCG, mecánicas de modos de juego, contratos de API/WebSockets y esquemas de base de datos para Frame Clash (Plataforma de Trivia de Cine y TCG Coleccionable).
---

# Frame Clash — Manual Arquitectónico & Motor del Juego (Skill)

Frame Clash es una plataforma de **Trivia de Cine combinada con TCG (Trading Card Game)**, donde los jugadores coleccionan cartas de películas reales (vía TMDB), equipan habilidades estratégicas (*Power-Ups*), superan campañas temáticas y compiten en modos multijugador asincrónicos y en tiempo real.

---

## 🏗️ 1. Stack Tecnológico & Puertos

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS + Framer Motion + Web Audio API + Socket.io-client (`http://localhost:3001`).
- **Backend**: NestJS 11 + Prisma ORM + Passport JWT + WebSockets (`http://localhost:3000`).
- **Base de Datos**: PostgreSQL (`localhost:8432`) en Docker + Redis (`localhost:6379`).

---

## 🎨 2. Las 5 Rarezas Oficiales & Colores Exactos

En Frame Clash existen **únicamente 5 rarezas** oficiales:

| Rareza | Nombre | Color Primario | Estilo Tailwind | Drop Rate (Tienda) |
| :--- | :--- | :--- | :--- | :---: |
| `COMMON` | **Común** | Gris | `border-zinc-500 text-zinc-300 bg-zinc-800` | 60% |
| `UNCOMMON` | **Inusual** | Verde | `border-emerald-500 text-emerald-300 bg-emerald-950` | 25% |
| `RARE` | **Rara** | Celeste | `border-sky-400 text-sky-300 bg-sky-950` | 10% |
| `EPIC` | **Épica** | Violeta | `border-purple-500 text-purple-300 bg-purple-950` | 4% |
| `LEGENDARY` | **Legendaria** | Dorado / Naranja | `border-amber-400 text-amber-300 bg-amber-950 ring-1 ring-amber-300` | 1% |

---

## 🎭 3. Las 31 Categorías Oficiales

El catálogo se clasifica exactamente en 31 categorías:
- **14 Géneros**: Acción (`ACTION`), Aventura (`ADVENTURE`), Animación (`ANIMATION`), Comedia (`COMEDY`), Crimen (`CRIME`), Documental (`DOCUMENTARY`), Drama (`DRAMA`), Familiar (`FAMILY`), Fantasía (`FANTASY`), Historia (`HISTORY`), Terror (`HORROR`), Música (`MUSIC`), Romance (`ROMANCE`), Ciencia Ficción (`SCI_FI`).
- **6 Décadas**: Años 70 (`ERA_70S`), Años 80 (`ERA_80S`), Años 90 (`ERA_90S`), Años 2000 (`ERA_2000S`), Años 2010 (`ERA_2010S`), Años 2020 (`ERA_2020S`).
- **11 Temáticas**: Blockbusters (`ERA_BLOCKBUSTER_POP`), Cine de Autor (`THEME_AUTEUR`), Ganadoras del Oscar (`THEME_OSCAR_WINNERS`), Superhéroes (`THEME_SUPERHEROES`), Distopías (`THEME_DYSTOPIAS`), Culto (`THEME_CULT_CLASSICS`), Trilogías/Sagas (`THEME_SAGAS`), Hechos Reales (`THEME_TRUE_STORY`), Plot Twists (`THEME_PLOT_TWISTS`), Directores Legendarios (`THEME_LEGENDARY_DIRECTORS`), Cyberpunk (`THEME_CYBERPUNK`).

---

## 🧠 4. Motor de Preguntas & Puntuación

### 24 Tipos de Preguntas en 5 Bloques:
1. **Bloque 1 — Elenco & Dirección** (Director, Actor principal, Co-estrellas, Caméos).
2. **Bloque 2 — Cronología & Fechas** (Año de estreno, Década, Orden de sagas).
3. **Bloque 3 — Economía & Taquilla** (Presupuesto vs Recaudación, Taquillazo del año, Estudio).
4. **Bloque 4 — Cinéfilo / Trivia Profunda** (Premios Oscar, Frases icónicas, Duración, Rodaje).
5. **Bloque 5 — Visual** (Identificar fotograma, Póster ciego con título oculto).

### Sistema de Puntuación al Milisegundo:
- **Base por Acierto**: 10.000 puntos.
- **Puntuación Final**:
  $$\text{Puntos} = \max(1.000, 10.000 - \text{msTranscurridos})$$
- **Seguridad Anti-Cheat**: La respuesta correcta se almacena en el backend con hash SHA-256 (`hashAnswer(correctAnswer, questionId)`). El frontend nunca recibe la respuesta correcta en texto plano hasta haber respondido.
- **Auditoría de Tiempo**: Se rechazan respuestas con tiempo $< 300\text{ ms}$ (tiempo de reacción infrahumano).

---

## 💎 5. Economía TCG & Progresión de Cartas

- **Duplicados & Niveles**:
  - Copia 1: Desbloquea la carta (Nivel 1).
  - Copia 2: Sube a Nivel 2 (+1 uso de Power-Up en la partida).
  - Copia 3: Sube a Nivel 3 (+2 usos de Power-Up en la partida).
  - Copia 4+: Se convierte automáticamente en **Polvo Estelar ✨**:
    - Común: +5 ✨ | Inusual: +15 ✨ | Rara: +35 ✨ | Épica: +80 ✨ | Legendaria: +200 ✨.
- **5 Tiers de Sobres en Tienda (`/shop`)**:
  - 🟤 **Bronce** (100🪙): 3 Cartas (Común/Inusual).
  - ⚪ **Plata** (250🪙): 4 Cartas (1 Inusual garantizada).
  - 🟡 **Oro** (500🪙): 5 Cartas (1 Rara garantizada).
  - 💎 **Platino** (1.000🪙): 5 Cartas (1 Épica garantizada).
  - 👑 **Diamante** (2.500🪙): 5 Cartas (Alta probabilidad de Legendaria).

---

## 🎮 6. Especificación de los 7 Modos de Juego

### 1. 🔥 Modo Roguelike Infinito (`/play/roguelite`)
- Rondas infinitas con puntaje mínimo requerido creciente.
- Draft de 3 categorías al inicio de cada ronda.
- Selección previa de cartas de Power-Up.
- Cofre acumulativo de botín con sobres (Bronce, Plata, Oro, Platino, Diamante).

### 2. 👑 Modo Dominio (`/play/domination`)
- 31 Campañas independientes de 10 Fases/Nodos.
- Desbloqueo progresivo permanente (se requiere $\ge 1$ estrella previa).
- Límite estricto de **máximo 2 power-ups** por fase.
- Recompensa de Maestría (+50 ✨) al dominar el Boss de la Fase 10.

### 3. 🎲 Modo Draft (`/play/draft`)
- Selección de **5 power-ups** en 5 tandas de cartas.
- **3 Rondas** de trivia con categorías aleatorias sorpresa.
- **Recarga completa al 100% de los 5 power-ups** al inicio de cada ronda.
- 3 Niveles de premios según ronda máxima alcanzada.

### 4. 🎮 Trivia Clásica (`/play`)
- Partida rápida de 10 preguntas con selector de categorías por pestañas y 3 estrellas.

### 5. ⚔️ PvP Asíncrono 1v1 (`/play/pvp-async`)
- Duelos por turnos con sistema ELO ($K=32$):
  $$R_{new} = R_{old} + 32 \cdot (S - E)$$
- Categoría a elección (o mixta) y hasta 2 cartas equipadas.
- Matchmaking contra otros jugadores o retos abiertos en lista de espera.

### 6. ⚡ PvP en Vivo 1v1 WebSockets (`/play/pvp-live`)
- Combate simultáneo en tiempo real conectado al namespace `/pvp-live`.
- Cronómetro compartido de 10 segundos y feedback en directo (`⚡ ¡Rival respondió!`).
- Revelación sincrónica de respuestas y resolución de ELO en base de datos.

### 7. 👑 Battle Royale de 10 Jugadores (`/play/battle-royale`)
- Sala de 10 jugadores en tiempo real (`/battle-royale`).
- 5 Rondas con eliminación directa de los **2 peores puntajes de cada ronda**:
  - Ronda 1: 10 $\to$ 8 | Ronda 2: 8 $\to$ 6 | Ronda 3: 6 $\to$ 4 | Ronda 4 (Semi): 4 $\to$ 2 | Ronda 5 (Gran Final 1v1).
- Sidebar con tabla de puntuación en vivo y **Zona Roja de Eliminación 💀**.
- Podio de recompensas para el Top 4.

---

## 🏛️ 7. Meta-Juego & Herramientas Administrativas

- **Sets Temáticos (`/collections`)**: Álbum con cartas conseguidas vs siluetas oscuras 🔒 y reclamo de recompensas por set completo.
- **Panel Creador de Sets (`/admin/collections`)**: Herramienta admin para crear y gestionar sets temáticos.
- **La Forja de Cartas TMDB (`/admin`)**: Buscador en TMDB para forjar cartas asignando rareza oficial y habilidades de power-up.
- **La Bóveda de Curación (`/admin/vault`)**: Panel analítico con la distribución de rarezas en base de datos y edición en caliente.
- **Perfil & 10 Logros (`/profile`)**: Estadísticas por modo, barra de XP y títulos equipables.
- **Salón de la Fama (`/leaderboard`)**: Clasificación por Récord de Puntos, Roguelike, Dominio y Colección con podio Top 3.

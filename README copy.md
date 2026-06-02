
# Pokémon JS: lógica del juego

Este proyecto es un juego de aventuras Pokémon construido con HTML, CSS y JavaScript.

En lugar de una batalla tradicional, el juego propone una aventura con escenas, elecciones y recolección de Pokémon. La lógica principal está en `pokemon.js`.

## Cómo funciona el juego

El jugador avanza por cuatro escenas principales:

1. **Pueblo Paleta**
   - Aquí eliges uno de tres Pokémon iniciales: Bulbasaur, Charmander o Squirtle.
   - Al seleccionar tu inicial obtienes puntos y monedas.
   - El inicial elegido se añade automáticamente a tu colección.

2. **Bosque**
   - En el bosque puedes buscar un Pokémon salvaje.
   - Al encontrar uno, decides si intentas capturarlo o huyes.
   - La captura tiene una probabilidad fija de éxito (`CAPTURE_CHANCE`).
   - Si capturas el Pokémon, ganas puntos y monedas.

3. **Ciudad**   >
   - En Ciudad puedes comprar pociones con monedas.
   - Usar una poción otorga puntos adicionales.
   - Desde aquí puedes avanzar hacia la cueva final.

4. **Cueva final**
   - La cueva muestra un resultado basado en tu puntaje total y cantidad de Pokémon capturados.
   - Dependiendo de tu progreso, el juego presenta un final mejor o un final bueno.
   - También puedes reiniciar la partida desde esta escena.

## Lógica principal en JavaScript

La aplicación usa un estado central en `pokemon.js`:

- `gameState.scene`: escena actual (`pueblo`, `bosque`, `ciudad`, `cueva`)
- `gameState.points`: puntos del jugador
- `gameState.coins`: monedas para comprar pociones
- `gameState.potions`: pociones disponibles
- `gameState.starter`: el Pokémon inicial elegido
- `gameState.capturedPokemon`: lista de Pokémon capturados
- `gameState.wildEncounter`: el encuentro salvaje actual

La lógica se organiza en funciones que renderizan cada escena:

- `renderStarterOptions()` muestra las cartas de los iniciales.
- `renderWildEncounter()` controla el estado del bosque y las opciones de batalla/captura.
- `renderCityActions()` crea los botones para comprar y usar pociones.
- `renderCave()` muestra el resultado final de la aventura.

### Captura de Pokémon salvajes

Cuando buscas un Pokémon salvaje:

- se invoca `fetchRandomPokemon()`
- se obtiene un Pokémon aleatorio de la PokéAPI (ID entre 1 y 151)
- se muestra el Pokémon y sus datos en el bosque
- al intentar capturarlo, `attemptCatch()` decide si la captura fue exitosa
- si tiene éxito, el Pokémon se añade a `capturedPokemon`

### Búsqueda en la Pokédex

También hay una búsqueda manual con PokéAPI:

- ingresas el nombre o número de un Pokémon en `search-input`
- `searchPokemon()` consulta la PokéAPI
- si se encuentra el Pokémon, puedes añadirlo a tu colección
- añadirlo otorga puntos extra

## Persistencia con localStorage

El juego guarda el estado automáticamente en `localStorage` usando:

- `saveGame()` para escribir el estado
- `loadGame()` para cargarlo al iniciar

Esto permite continuar la partida aunque cierres la página.

## Animaciones y feedback visual

El juego incluye animaciones y mensajes para hacer la experiencia más dinámica:

- se usa una animación de Pokébola (`pokeball-animate`) al capturar un Pokémon o usar una poción
- `setMessage()` actualiza el texto de estado en la interfaz
- la barra superior muestra `Puntos`, `Monedas` y `Pociones`

## Reiniciar la partida

El botón `Reiniciar` en la interfaz ejecuta `resetGame()`:

- limpia `localStorage`
- reinicia los valores de `gameState`
- vuelve a la escena inicial `pueblo`
- restablece la colección de Pokémon capturados

## Estructura del proyecto

- `pokemon.html`: interfaz y estructura de escenas
- `pokemon.css`: estilos, diseño y animaciones
- `pokemon.js`: la lógica del juego, estados y llamadas a la PokéAPI

## Resumen

El juego combina exploración, decisiones y colección de Pokémon.

- Elige tu inicial.
- Atrapa Pokémon en el bosque.
- Compra y usa pociones en Ciudad.
- Busca Pokémon por nombre o ID con la Pokédex.
- Avanza a la cueva para descubrir tu final.

Toda la lógica del juego está centralizada en `pokemon.js` y usa `localStorage` para mantener el progreso entre sesiones.
  bottom: 10px;
  width: 160px;
}
```



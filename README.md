# PSYCHOSIS — Videojuego de terror psicológico 2D
# Instituto Tecnológico de Pachuca  
## Ingeniería en Sistemas Computacionales
## Graficación  
**Autora:** Itzel Mendoza Sánchez  
**Fecha:** 21 de octubre de 2026

## 1. Contexto

PSYCHOSIS es un videojuego web en dos dimensiones (2D) que pertenece al género de terror psicológico, misterio y suspenso. El juego se desarrolla en un entorno oscuro inspirado en los pasillos de un hospital abandonado, donde el jugador debe enfrentarse a diferentes entidades representadas mediante imágenes.

El videojuego presenta una atmósfera de tensión mediante escenarios oscuros, iluminación tenue, efectos visuales, animaciones y sonidos ambientales. El jugador debe observar el movimiento de los enemigos y apuntar con precisión a sus cabezas para eliminarlos antes de que termine el tiempo disponible.

El proyecto fue desarrollado como parte de las actividades de evaluación de la materia de Graficación, con el propósito de aplicar los conceptos de programación gráfica mediante HTML5 Canvas 2D, JavaScript, CSS y Bootstrap.

## 2. Objetivo

Desarrollar una aplicación web interactiva que funcione como un videojuego de terror en 2D, utilizando la API Canvas de HTML5 para representar objetos gráficos en movimiento y permitir la interacción del usuario mediante el mouse.

El videojuego busca implementar los siguientes elementos:

- Representar 25 entidades gráficas utilizando imágenes relacionadas con la temática de terror.
- Aplicar diferentes patrones de movimiento: vertical ascendente, vertical descendente, diagonal y circular.
- Asignar velocidades variables a las entidades para generar un comportamiento dinámico.
- Detectar colisiones entre objetos y aplicar cambios en su movimiento, acompañados de efectos visuales breves.
- Permitir que el jugador elimine temporalmente una entidad mediante un clic en su cabeza y que esta reaparezca en otra zona del escenario.
- Incorporar un contador de puntuación y un cronómetro para controlar la duración de la partida.
- Guardar el récord del jugador en el almacenamiento local del navegador.
- Integrar imágenes de fondo, música ambiental, efectos de disparo, un cursor personalizado y un icono favicon.
- Diseñar una interfaz adaptable mediante Bootstrap, con pantalla de carga, menú principal, instrucciones, configuración y pantalla de resultados.

## 3. Justificación

El desarrollo de PSYCHOSIS permite aplicar de manera práctica los conocimientos adquiridos en la materia de Graficación, especialmente aquellos relacionados con la representación de imágenes, la animación de objetos, el movimiento en un espacio bidimensional y la interacción mediante dispositivos de entrada.

La utilización de HTML5 Canvas facilita la representación y actualización continua de los elementos gráficos del videojuego. Por medio de JavaScript se implementan los movimientos, la detección de colisiones, el control del tiempo, la puntuación y la interacción con las entidades.

Asimismo, el uso de Bootstrap permite organizar los elementos de la interfaz y mejorar su adaptación a diferentes tamaños de pantalla. Los recursos audiovisuales contribuyen a crear una experiencia inmersiva acorde con el género de terror psicológico.

La elección de una mecánica basada en la precisión al apuntar a la cabeza de los zombis permite combinar los principios de graficación con una dinámica de juego sencilla, interactiva y comprensible para el usuario.

Por estas razones, el proyecto representa una oportunidad para integrar programación, diseño de interfaces y recursos multimedia en una aplicación web funcional.

## 4. Operación del videojuego

### 4.1. Inicio de la aplicación

Al abrir el sitio web, se presenta una pantalla de carga con el nombre PSYCHOSIS, una imagen de fondo y una barra de progreso acompañada de un porcentaje. Cuando la carga termina, se muestra el menú principal.

### 4.2. Menú principal

El menú principal contiene las siguientes opciones:

- **Iniciar partida:** permite acceder al escenario de juego.
- **Instrucciones:** muestra las reglas y los controles necesarios para jugar.
- **Configuración:** permite ajustar el volumen del sonido y seleccionar la duración de la partida.
- **Salir:** muestra un mensaje de desconexión para indicar que el usuario puede cerrar la pestaña.

### 4.3. Desarrollo de la partida

Al iniciar una partida, aparece el escenario de un pasillo hospitalario oscuro que funciona como fondo del área de juego. Sobre este escenario se representan 25 zombis que se desplazan continuamente.

Las entidades utilizan cuatro patrones de movimiento: ascendente, descendente, diagonal y circular. Cada objeto cuenta con una velocidad y características de movimiento variables para evitar que todos se desplacen de la misma manera.

Cuando dos entidades colisionan, se modifica su movimiento para simular un rebote y se pueden generar partículas que representan visualmente el impacto.

### 4.4. Interacción con el mouse

El jugador utiliza una mira personalizada para apuntar a los enemigos. Para conseguir una eliminación, debe hacer clic en la región correspondiente a la cabeza de un zombi.

Cuando el disparo acierta, se incrementa la puntuación, se reproduce un efecto de sonido y el zombi aparece nuevamente en una posición aleatoria del escenario. De esta manera, se mantiene una cantidad constante de 25 entidades durante la partida.

Si el jugador hace clic fuera de la zona de la cabeza, el disparo no suma puntos y se muestra un pequeño efecto visual.

### 4.5. Cronómetro y puntuación

La partida comienza con una duración predeterminada de 60 segundos, aunque el usuario puede seleccionar 90 o 120 segundos desde la configuración.

El cronómetro disminuye mientras la partida está activa. Cuando quedan 10 segundos o menos, el indicador del tiempo cambia a color rojo para advertir al jugador que el tiempo está por agotarse.

Cada eliminación aumenta la puntuación. Al terminar la partida, se presenta una pantalla de resultados con la cantidad de objetivos eliminados y el récord registrado.

El récord se almacena mediante `localStorage`, por lo que permanece disponible en el mismo navegador mientras no se borren los datos correspondientes del sitio.

### 4.6. Sonido y efectos visuales

El videojuego incluye audio ambiental en bucle para reforzar la atmósfera de suspenso y un efecto de sonido que se reproduce al disparar. El usuario puede activar o desactivar el sonido desde el encabezado y modificar el volumen ambiental en la configuración.

También se incorporan animaciones en los botones, efectos visuales de disparo, partículas de impacto y una mira personalizada para mejorar la respuesta visual durante la partida.

### 4.7. Pausa y reinicio

Durante la partida, el usuario puede pausarla y reanudarla mediante el botón correspondiente. También puede reiniciar la partida o regresar al menú principal.

Al finalizar el tiempo disponible, el videojuego detiene la partida y muestra los resultados obtenidos.

## 5. Conclusiones

El desarrollo de PSYCHOSIS permitió integrar distintos conceptos de graficación y programación web en un videojuego interactivo de terror psicológico. Mediante HTML5 Canvas 2D y JavaScript se implementaron la representación de imágenes, la animación de entidades, los patrones de movimiento, la detección de colisiones y la interacción con el mouse.

La incorporación de 25 zombis en movimiento, la mecánica de apuntar a la cabeza y la reaparición de los objetivos permitió crear una dinámica de juego que requiere atención y precisión por parte del usuario. Asimismo, el cronómetro, la puntuación y el almacenamiento del récord aportan elementos adicionales para controlar y evaluar el desempeño durante las partidas.

Por otra parte, el uso de Bootstrap, CSS, imágenes, sonidos y animaciones permitió construir una interfaz organizada y acorde con la temática seleccionada. La pantalla de carga, el menú principal, las instrucciones, la configuración y la pantalla de resultados complementan la experiencia del jugador.

En conclusión, PSYCHOSIS representa una aplicación práctica de los conocimientos adquiridos en la materia de Graficación, ya que combina elementos gráficos, movimiento, interacción y recursos multimedia en un entorno web. El proyecto también permitió comprender la importancia de organizar los archivos, documentar el funcionamiento de una aplicación y preparar su publicación mediante herramientas de control de versiones como Git y GitHub.

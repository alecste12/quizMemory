import * as THREE from 'three';
import Cube from './cube.js';
import { caricaDomanda } from './quiz.js';
import { TextMesh } from './text.js';
import { isPenalty } from './quiz.js';
//esporto la scena e la camera così sono accessibili ovunque
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export let cube;

let penalty=10;    //penalità di 10secondi se si sbaglia la domanda
let provaAncora;
let time;
let timerInterval;

let count = 0;
let flippedCount = 0;
let gamePaused = false;
let cubeRolled = false;     
let secondChance = true;//se si vuole si può togliere per aumentare difficoltà
let flippedCards = []; // array per memorizzare le 2 carte girate

function init() {
    
    
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    //evento che ascolta il messaggio inviato dallo quiz.js ogni volta che si sbaglia la domanda per fare ripartire il dado
    window.addEventListener('message', function(event) {
        if (event.data.type === 'rollDice') {
            cube.roll();
        }
    });
    //evento che ascolta il messaggio che viene inviato dallo quiz.js quando si ha fatto giusto il quiz
    // e cambia lo stato da false a true del gamePaused
    window.addEventListener('message', function(event) {
        if (event.data.type == 'changeGamePaused') {
            
            gamePaused = event.data.value;
            toggleClickListener(gamePaused);
        }
    });

    


    //creazione dado
    cube = new Cube(showQuestion);  
    //funzione per fare girare il dado 
    function rollCube() {
        if (!gamePaused&&!cubeRolled) {
            cube.roll();
            //cuberolled = true per non farlo girare all'infinito mentre si selezionano le carte
            cubeRolled = true;
            //gamepaused = true per fermare il gioco 
            gamePaused=true;
        }
        
    }

    

    //creazione delle carte
    const cardsGrid = new THREE.Group();

    const cardSize = 2;
    const gap = 0.2;
    const rows = 4;
    const cols = 4;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const geometry = new THREE.BoxGeometry(cardSize, cardSize, 0.1);

            const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Colore bianco

            const card = new THREE.Mesh(geometry, material);
            card.position.x = (j - (cols - 1) / 2) * (cardSize + gap);
            card.position.y = (i - (rows - 1) / 2) * (cardSize + gap);

            card.userData.originalMaterial = material;

            cardsGrid.add(card);
        }
    }
    scene.add(cardsGrid);
    shuffle();// Mescola le carte in modo casuale
    hide(); // Nasconde le carte all'inizio

    //nasconde le carte con la texture di un gatto
    function hide() {
        const textureLoader = new THREE.TextureLoader();
        const coverTexture = textureLoader.load('./assets/Designer.png');

        //applica la covertexture ad ogni carta
        cardsGrid.children.forEach(card => {
            card.material.map = coverTexture;
            card.material.needsUpdate = true;
        });
    }
    
    
    
    
    //mescola le carte
    function shuffle() {
        //array di texture casuali 
        const shuffledTextures = shuffleTextures();

        // assegna le texture mescolate alle carte
        cardsGrid.children.forEach((card, index) => {
            const texture = shuffledTextures[index];
            card.userData.texture = texture; // Memorizza la texture della carta
        });
    }
    //funzione usata per mescolare le texture e creare le coppie
    function shuffleTextures() {
        const texturePaths = [
            './assets/1.png',
            './assets/2.png',
            './assets/3.png',
            './assets/4.png',
            './assets/5.png',
            './assets/6.png',
            './assets/7.png',
            './assets/8.png'
        ];

        // duplica i percorsi delle texture per creare le coppie
        const textures = texturePaths.concat(texturePaths);

        // mescola l'array delle texture
        for (let i = textures.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [textures[i], textures[j]] = [textures[j], textures[i]];
        }

        // carica le texture mescolate
        const shuffledTextures = textures.map(texture => {
            
            return new THREE.TextureLoader().load(texture);
        });

        return shuffledTextures;
    }

    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // listener per il click del mouse sulle carte
    function onMouseClick(event) {
        //se il gioco non è in pausa si possono selezionare le carte 
        if(!gamePaused){
        // calcola la posizione del mouse
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // aggiorna il raycaster
        raycaster.setFromCamera(mouse, camera);

        // trova gli oggetti intersecati
        const intersects = raycaster.intersectObjects(cardsGrid.children);
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            //se la carta non è già stata selezionata una volta e la lunghezza dell'array è minore di 2 gira la carta
            if (!flippedCards.includes(selectedObject) && flippedCards.length < 2) {
                flipCard(selectedObject);
                flippedCards.push(selectedObject); //aggiunge la carta selezionata all'array di carte girate
                
                // se sono state girate due carte, controlla se sono uguali
                if (flippedCards.length == 2) {
                    checkMatching();
                }
            }
        }
        }

    }

    // funzione per girare una carta
    function flipCard(card) {
        card.material.map = card.userData.texture; // Mostra la texture della carta cliccata
    }

    // funzione per controllare se le carte girate sono uguali
    function checkMatching() {
        // se le carte hanno la stessa texture, rimangono girate
        if (flippedCards[0].userData.texture.image.src == flippedCards[1].userData.texture.image.src) {
            
            
            flippedCount += 2; //viene aumentato il numero di carte girate 
            
            //se le carte sono uguali rimuove la scritta prova ancora
            if (provaAncora) {
                provaAncora.removeText();
            }
            
            // controlla se tutte le carte sono state girate e se sì ha vinto il giocatore
            if (flippedCount == cardsGrid.children.length) {
                handleVictory();
            }

            flippedCards = [];  //svuota l'array per dare la possibilità di fare una nuova selezione
        } else {
            
            // se i percorsi delle texture non corrispondono, nasconde le carte di nuovo dopo un breve ritardo
            setTimeout(() => {
                flippedCards.forEach(card => {
                    //riassegna a tutte le carte dell'array selezionate la cover del gatto
                    card.material.map = new THREE.TextureLoader().load('./assets/Designer.png');
                });
                flippedCards = [];
            }, 1000);
            
            //se non si ha una seconda chance viene tolta la scritta provaAncora se esiste 
            //e viene impostato il cubeRolled a false così può ricominciare a girare
            if(!secondChance){
                if (provaAncora) { // Assicurati che provaAncora sia definito prima di chiamare removeText()
                    provaAncora.removeText();
                }
                cubeRolled=false;
                secondChance = true;
            }else{
                //viene aggiunta la scritta prova ancora e viene impostata a false la seconda chance
                provaAncora=new TextMesh("Prova ancora", new THREE.Vector3(-8, 7, 0), 2,0xff0000);
                secondChance=false;
            }
        }
    }

    //funzione in caso di vittoria, scrive hai vinto e blocca il tempo
    function handleVictory(){
        new TextMesh("Hai vinto!!!", new THREE.Vector3(-5, 7, 0), 2,0xff0000);
        stopTimer()        
    }
    //aggiunge il listener per il click del mouse sulle carte
    window.addEventListener('click', onMouseClick, false);

    camera.position.z = 5;
    camera.position.y = -6;

    camera.lookAt(0, 0, 0);

    //cambia lo stato del gioco 
    function toggleClickListener(paused) {
        if (paused) {
            window.removeEventListener('click', onMouseClick, false);
        } else {
            window.addEventListener('click', onMouseClick, false);
        }
    }
    
    //carica la domanda e ferma il gioco cioè non si può cliccare sulle carte e il cubo è fermo e viene chiamata
    //dalla classe del cubo dopo che ha finito di ruotare
    function showQuestion() {
        gamePaused = true;
        toggleClickListener(gamePaused);
        
        caricaDomanda();
    }

   
function animate() {
    requestAnimationFrame(animate);
    
    
    
    
    rollCube();
    
    
    
    renderer.render(scene, camera);
    
    
}


 //memorizza l'ultimo aggiornamento del timer
 let lastUpdateTime = Date.now();

 //memorizza il tempo trascorso per il timer
 let tempoTrascorso = 0;
 
 // funzione per aggiornare il timer
 function updateTimer() {
     const now = Date.now();
     const deltaTime = now - lastUpdateTime; // calcola la differenza di tempo dall'ultimo aggiornamento
     lastUpdateTime = now; 
     
     // aggiorna il tempo trascorso
     tempoTrascorso += deltaTime / 1000; // converte da millisecondi a secondi
     
     // se è passato un secondo, aggiorna il testo del timer
     if (tempoTrascorso >= 1) {
         tempoTrascorso -= 1; // Riporta il tempo trascorso a 0

         if (time) {
             time.removeText(); //rimuove il testo del timer creato precedentemente 
         }
         //aggiorna il testo del time

         if(isPenalty){
             //aggiunge 10s se c'è stata una penalità
             count+=penalty;
             
             time = new TextMesh("Tempo: "+count +"s", new THREE.Vector3(5, 2, 0), 1, 0xff0000);
         }else{
         
             time = new TextMesh("Tempo: "+count +"s", new THREE.Vector3(5, 2, 0), 1, 0xffffff);
         } 
         count++;
     }
 }
 
 //ferma il timer
 function stopTimer() {
     clearInterval(timerInterval);   
     time.setColor(0x008f39);    //imposta il colore del testo time a verde scuro
     
 }
 
//funzione per far partire il timer
 function startTimer() {
     timerInterval = setInterval(updateTimer, 1000); //aggiorna il timer ogni secondo
 }

 //fa partire il timer al caricamento della pagina
 startTimer();

    animate(); 
}

window.onload = init;

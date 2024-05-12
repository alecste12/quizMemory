import * as THREE from 'three';
import { TextMesh } from './text.js';
import { camera, scene } from './game.js';

export let nCategory;

export default class Cube {
    constructor(showQuestionFunction) {
        if(showQuestionFunction!=null){
            this.scene = scene;
            this.camera = camera;
            this.showQuestionFunction = showQuestionFunction;
            this.mesh = this.createCube();
            this.text=null;
        }else{
            this.scene = scene;
            this.camera = camera;
            this.text=null;
        }
    }
    //crea il cubo
    createCube() {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const materials = colors.map(color => new THREE.MeshBasicMaterial({ color }));
        const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(), materials);
        cubeMesh.position.set(-7, 0, 2);
        this.scene.add(cubeMesh);
        return cubeMesh;
    }
    //metodo per fare ruotare il dado
    roll() {
        if (!this.isRolling) {
            this.isRolling = true;
    
            // durata del movimento
            const duration = 2;
            const fps = 60;
            const totalFrames = duration * fps;
            const totalRotation = Math.PI * 2;
            const deltaRotation = totalRotation / totalFrames;
    
            //funzione per aggiornare la rotazione del cubo ad ogni frame
            const updateRotation = (frame) => {
                if (frame < totalFrames) {
                    this.mesh.rotation.x += deltaRotation;
                    this.mesh.rotation.y += deltaRotation;
                    this.mesh.rotation.z += deltaRotation;
    
                    // aggiorna la scena dopo ogni frame
                    requestAnimationFrame(() => updateRotation(frame + 1));
                } else {
                    this.isRolling = false;
                    
                    // mischia i colori
                    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
                    const randomColorIndices = [];

                    while (randomColorIndices.length < 6) {
                        const index = Math.floor(Math.random() * 6);
                        if (!randomColorIndices.includes(index)) {
                            randomColorIndices.push(index);
                        }
                        
                    }
                    //assegna un numero alla categoria in base al colore randomico che si trova nell'array alla posizione 4
                    switch(randomColorIndices[4]){          //posizione 4 dell'array perchè viene posto sopra nella scena a fine rotazione
                        case 0:
                            nCategory = 0;//animali rosso
                            break;
                        case 1:
                            nCategory = 1;//storia verde
                            break;
                        case 2:
                            nCategory = 2;//scienze blu
                            break;
                        case 3:
                            nCategory = 3;//film giallo
                            break;
                        case 4:
                            nCategory = 4;//videogames fucsia
                            break;
                        case 5:
                            nCategory = 5;//manga azzurro
                            break;


                    }
                    
                    
                    this.mesh.material.forEach((material, index) => {
                        
                        material.color.setHex(colors[randomColorIndices[index]]);
                    });
                    
                    
                    let categoryNames = ["ANIMALI","STORIA","SCIENZE","FILM","VIDEOGAMES","MANGA"];
                    
                    //scrive il testo a schermo
                    if(categoryNames[nCategory].length<=7){
                         this.text = new TextMesh("Categoria: " + categoryNames[nCategory], new THREE.Vector3(-12, 7, 0), 2,colors[nCategory]);
                    }
                    else{
                         this.text = new TextMesh("Categoria: " + categoryNames[nCategory], new THREE.Vector3(-15, 7, 0),2,colors[nCategory]);
                         
                    }
                    

                    this.showQuestionFunction();
                    
                    
                }
            };
    
            
            updateRotation(0);
        }
        
    }
    //rimuove il testo (es. toglie la scritta 'categoria: animali')
    removeText(){
        
        if (this.text != null) {
           this.text.removeText();
        
        }
       
        
    }
    
}

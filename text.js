import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { camera, scene } from "./game.js";

export class TextMesh {
    constructor(text, position, size, color) {
        
        const loader = new FontLoader();
        loader.load('./assets/font.json', (font) => {
            const geometry = new TextGeometry(text, {
                font: font,
                size: size,
                depth: 0.1, 
                curveSegments: 12,
                bevelEnabled: false
            });
        
            const material = new THREE.MeshBasicMaterial({ color: color });
            this.textMesh = new THREE.Mesh(geometry, material);
            this.textMesh.position.copy(position);
        
            this.textMesh.lookAt(this.textMesh.position.clone().add(camera.position));
            scene.add(this.textMesh);
        });
    }
    setColor(color){
        this.textMesh.material=new THREE.MeshBasicMaterial({ color: color });
    }
    removeText() {
       
        scene.remove(this.textMesh);
    }
}

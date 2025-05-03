import * as THREE from 'three';

export class ViewManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.currentView = 'floor-plan';
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Listen for view change events
        document.addEventListener('changeView', (event) => {
            this.changeView(event.detail.view);
        });
        
        // Listen for zoom events
        document.addEventListener('zoomView', (event) => {
            this.zoom(event.detail.direction);
        });
    }
    
    changeView(viewType) {
        this.currentView = viewType;
        
        switch (viewType) {
            case 'floor-plan':
                this.setTopView();
                break;
            case '3d-view':
                this.set3DView();
                break;
            case 'elevation':
                this.setElevationView();
                break;
            case 'section':
                this.setSectionView();
                break;
            default:
                this.set3DView();
        }
    }
    
    setTopView() {
        // Set camera to top-down view for floor plan
        this.sceneManager.camera.position.set(0, 20, 0);
        this.sceneManager.camera.lookAt(0, 0, 0);
        this.sceneManager.camera.up.set(0, 0, -1); // Set up direction to -Z for proper orientation
    }
    
    set3DView() {
        // Set camera to isometric-like view
        this.sceneManager.camera.position.set(15, 15, 15);
        this.sceneManager.camera.lookAt(0, 0, 0);
        this.sceneManager.camera.up.set(0, 1, 0); // Reset up direction to Y
    }
    
    setElevationView() {
        // Set camera to front elevation view
        this.sceneManager.camera.position.set(0, 5, 20);
        this.sceneManager.camera.lookAt(0, 5, 0);
        this.sceneManager.camera.up.set(0, 1, 0);
    }
    
    setSectionView() {
        // Set camera to side section view
        this.sceneManager.camera.position.set(20, 5, 0);
        this.sceneManager.camera.lookAt(0, 5, 0);
        this.sceneManager.camera.up.set(0, 1, 0);
    }
    
    zoom(direction) {
        // Zoom in or out by adjusting camera position
        const zoomFactor = direction === 'in' ? 0.9 : 1.1;
        const cameraDirection = new THREE.Vector3();
        this.sceneManager.camera.getWorldDirection(cameraDirection);
        
        // Move camera along its direction vector
        this.sceneManager.camera.position.addScaledVector(cameraDirection, -5 * (zoomFactor - 1));
    }
}
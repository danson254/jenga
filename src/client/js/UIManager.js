import * as THREE from 'three';

export class UIManager {
    constructor(objectManager, viewManager, libraryManager) {
        this.objectManager = objectManager;
        this.viewManager = viewManager;
        this.libraryManager = libraryManager;
        
        this.mousePosition = new THREE.Vector3();
        this.isDragging = false;
        this.dragStartPosition = new THREE.Vector2();
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Listen for mouse move events
        const canvas = document.getElementById('canvas-container');
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Listen for mouse down events
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        
        // Listen for mouse up events
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Listen for toggle grid event
        document.addEventListener('toggleGrid', this.toggleGrid.bind(this));
        
        // Listen for new project event
        document.addEventListener('newProject', this.newProject.bind(this));
    }
    
    handleMouseMove(event) {
        // Get mouse position
        const canvas = document.getElementById('canvas-container');
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
        
        // Update mouse position for raycasting
        const sceneManager = this.objectManager.sceneManager;
        sceneManager.mouse.x = mouseX;
        sceneManager.mouse.y = mouseY;
        
        // Get intersection point with ground plane
        const intersectionPoint = sceneManager.getIntersectionPoint();
        this.mousePosition.copy(intersectionPoint);
        
        // Handle dragging if active
        if (this.isDragging && this.objectManager.selectedObject && this.objectManager.activeTool === 'move') {
            this.objectManager.selectedObject.position.copy(intersectionPoint);
            
            // Update properties panel
            this.objectManager.updatePropertiesPanel();
        }
    }
    
    handleMouseDown(event) {
        // Start dragging
        this.isDragging = true;
        
        // Store drag start position
        const canvas = document.getElementById('canvas-container');
        const rect = canvas.getBoundingClientRect();
        this.dragStartPosition.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        this.dragStartPosition.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    }
    
    handleMouseUp(event) {
        // End dragging
        this.isDragging = false;
    }
    
    toggleGrid() {
        // Toggle grid visibility
        const sceneManager = this.objectManager.sceneManager;
        if (sceneManager.grid) {
            sceneManager.grid.visible = !sceneManager.grid.visible;
        }
    }
    
    newProject() {
        // Clear all objects from the scene
        const sceneManager = this.objectManager.sceneManager;
        
        // Remove all objects except grid and lights
        this.objectManager.objects.forEach(object => {
            sceneManager.remove(object);
        });
        
        // Clear objects array
        this.objectManager.objects = [];
        
        // Clear selection
        this.objectManager.selectedObject = null;
        
        // Reset properties panel
        document.getElementById('object-properties').innerHTML = '<p>Select an object to view properties</p>';
        
        console.log('New project created');
    }
}
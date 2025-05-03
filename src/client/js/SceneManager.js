import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to DOM
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Create raycaster for object selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Handle mouse move for raycasting
        const container = document.getElementById('canvas-container');
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        });
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    raycast(objects) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        return this.raycaster.intersectObjects(objects, true);
    }
    
    getIntersectionPoint(plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const ray = this.raycaster.ray;
        const intersectionPoint = new THREE.Vector3();
        ray.intersectPlane(plane, intersectionPoint);
        return intersectionPoint;
    }
    
    createScreenshot() {
        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Get the image data
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        
        return dataURL;
    }
}
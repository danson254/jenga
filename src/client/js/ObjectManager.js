import * as THREE from 'three';

export class ObjectManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.objects = [];
        this.selectedObject = null;
        this.activeTool = 'select';
        this.activeLayer = 'Walls';
        this.activeStory = 'Ground Floor';
        
        // Default properties for different object types
        this.defaultProperties = {
            wall: {
                height: 2.7,
                thickness: 0.2,
                material: 'brick'
            },
            door: {
                width: 0.9,
                height: 2.1,
                thickness: 0.05,
                material: 'wood'
            },
            window: {
                width: 1.2,
                height: 1.2,
                thickness: 0.05,
                sillHeight: 0.9,
                material: 'glass'
            },
            column: {
                width: 0.3,
                height: 2.7,
                depth: 0.3,
                material: 'concrete'
            },
            beam: {
                width: 0.3,
                height: 0.4,
                length: 3,
                material: 'concrete'
            },
            slab: {
                thickness: 0.2,
                material: 'concrete'
            },
            stair: {
                width: 1.2,
                riserHeight: 0.175,
                treadDepth: 0.28,
                numberOfSteps: 10,
                material: 'concrete'
            },
            roof: {
                pitch: 30,
                thickness: 0.2,
                overhang: 0.5,
                material: 'tile'
            }
        };
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Listen for tool change events
        document.addEventListener('changeTool', (event) => {
            this.setActiveTool(event.detail.tool);
        });
        
        // Listen for layer change events
        document.addEventListener('selectLayer', (event) => {
            this.setActiveLayer(event.detail.layer);
        });
        
        // Listen for story change events
        document.addEventListener('selectStory', (event) => {
            this.setActiveStory(event.detail.story);
        });
        
        // Listen for library object add events
        document.addEventListener('addLibraryObject', (event) => {
            this.addLibraryObject(event.detail.object, event.detail.position);
        });
        
        // Add click event for object selection
        const canvas = document.getElementById('canvas-container');
        canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    }
    
    setActiveTool(tool) {
        this.activeTool = tool;
        console.log(`Active tool set to: ${tool}`);
        
        // Update cursor based on active tool
        const canvas = document.getElementById('canvas-container');
        
        switch(tool) {
            case 'select':
                canvas.style.cursor = 'default';
                break;
            case 'move':
                canvas.style.cursor = 'move';
                break;
            case 'rotate':
                canvas.style.cursor = 'alias';
                break;
            case 'scale':
                canvas.style.cursor = 'nwse-resize';
                break;
            case 'wall':
            case 'door':
            case 'window':
            case 'column':
            case 'beam':
            case 'slab':
            case 'stair':
            case 'roof':
                canvas.style.cursor = 'crosshair';
                break;
            default:
                canvas.style.cursor = 'default';
        }
    }
    
    setActiveLayer(layer) {
        this.activeLayer = layer;
        console.log(`Active layer set to: ${layer}`);
    }
    
    setActiveStory(story) {
        this.activeStory = story;
        console.log(`Active story set to: ${story}`);
    }
    
    handleCanvasClick(event) {
        // Handle different tools
        switch(this.activeTool) {
            case 'select':
                this.selectObject(event);
                break;
            case 'wall':
                this.createWall(event);
                break;
            case 'door':
                this.createDoor(event);
                break;
            case 'window':
                this.createWindow(event);
                break;
            case 'column':
                this.createColumn(event);
                break;
            case 'beam':
                this.createBeam(event);
                break;
            case 'slab':
                this.createSlab(event);
                break;
            case 'stair':
                this.createStair(event);
                break;
            case 'roof':
                this.createRoof(event);
                break;
        }
    }
    
    selectObject(event) {
        // Get mouse position
        const canvas = document.getElementById('canvas-container');
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
        
        // Update raycaster
        this.sceneManager.mouse.x = mouseX;
        this.sceneManager.mouse.y = mouseY;
        
        // Get all objects in the scene that can be selected
        const selectableObjects = [];
        this.sceneManager.scene.traverse(object => {
            if (object.isMesh || object.isGroup) {
                selectableObjects.push(object);
            }
        });
        
        // Perform raycasting
        const intersects = this.sceneManager.raycast(selectableObjects);
        
        // Clear previous selection
        if (this.selectedObject) {
            this.highlightObject(this.selectedObject, false);
        }
        
        // If we hit something, select it
        if (intersects.length > 0) {
            // Get the top level parent that has a name
            let selectedObject = intersects[0].object;
            while (selectedObject.parent && selectedObject.parent !== this.sceneManager.scene && !selectedObject.name) {
                selectedObject = selectedObject.parent;
            }
            
            this.selectedObject = selectedObject;
            this.highlightObject(this.selectedObject, true);
            
            // Update properties panel
            this.updatePropertiesPanel();
        } else {
            this.selectedObject = null;
            document.getElementById('object-properties').innerHTML = '<p>Select an object to view properties</p>';
        }
    }
    
    highlightObject(object, highlight) {
        // Add or remove highlight effect
        if (highlight) {
            object.traverse(child => {
                if (child.isMesh) {
                    child.userData.originalMaterial = child.material;
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffff00,
                        wireframe: true,
                        transparent: true,
                        opacity: 0.5
                    });
                }
            });
        } else {
            object.traverse(child => {
                if (child.isMesh && child.userData.originalMaterial) {
                    child.material = child.userData.originalMaterial;
                }
            });
        }
    }
    
    updatePropertiesPanel() {
        if (!this.selectedObject) return;
        
        const propertiesPanel = document.getElementById('object-properties');
        const objectType = this.selectedObject.userData.type || this.selectedObject.name;
        
        let html = `
            <div class="property-group">
                <h4>General</h4>
                <div class="property">
                    <label>Name:</label>
                    <input type="text" id="object-name" value="${this.selectedObject.name || ''}">
                </div>
                <div class="property">
                    <label>Type:</label>
                    <input type="text" id="object-type" value="${objectType || ''}" disabled>
                </div>
            </div>
            
            <div class="property-group">
                <h4>Transform</h4>
                <div class="property">
                    <label>Position X:</label>
                    <input type="number" id="position-x" value="${this.selectedObject.position.x.toFixed(2)}" step="0.1">
                </div>
                <div class="property">
                    <label>Position Y:</label>
                    <input type="number" id="position-y" value="${this.selectedObject.position.y.toFixed(2)}" step="0.1">
                </div>
                <div class="property">
                    <label>Position Z:</label>
                    <input type="number" id="position-z" value="${this.selectedObject.position.z.toFixed(2)}" step="0.1">
                </div>
                <div class="property">
                    <label>Rotation X:</label>
                    <input type="number" id="rotation-x" value="${(this.selectedObject.rotation.x * 180 / Math.PI).toFixed(1)}" step="1">
                </div>
                <div class="property">
                    <label>Rotation Y:</label>
                    <input type="number" id="rotation-y" value="${(this.selectedObject.rotation.y * 180 / Math.PI).toFixed(1)}" step="1">
                </div>
                <div class="property">
                    <label>Rotation Z:</label>
                    <input type="number" id="rotation-z" value="${(this.selectedObject.rotation.z * 180 / Math.PI).toFixed(1)}" step="1">
                </div>
                <div class="property">
                    <label>Scale X:</label>
                    <input type="number" id="scale-x" value="${this.selectedObject.scale.x.toFixed(2)}" step="0.1" min="0.1">
                </div>
                <div class="property">
                    <label>Scale Y:</label>
                    <input type="number" id="scale-y" value="${this.selectedObject.scale.y.toFixed(2)}" step="0.1" min="0.1">
                </div>
                <div class="property">
                    <label>Scale Z:</label>
                    <input type="number" id="scale-z" value="${this.selectedObject.scale.z.toFixed(2)}" step="0.1" min="0.1">
                </div>
            </div>
            
            <button class="apply-btn" id="apply-properties">Apply Changes</button>
        `;
        
        propertiesPanel.innerHTML = html;
        
        // Add event listener for apply button
        document.getElementById('apply-properties').addEventListener('click', () => {
            this.applyProperties();
        });
    }
    
    applyProperties() {
        if (!this.selectedObject) return;
        
        // Update name
        this.selectedObject.name = document.getElementById('object-name').value;
        
        // Update position
        this.selectedObject.position.set(
            parseFloat(document.getElementById('position-x').value),
            parseFloat(document.getElementById('position-y').value),
            parseFloat(document.getElementById('position-z').value)
        );
        
        // Update rotation (convert from degrees to radians)
        this.selectedObject.rotation.set(
            parseFloat(document.getElementById('rotation-x').value) * Math.PI / 180,
            parseFloat(document.getElementById('rotation-y').value) * Math.PI / 180,
            parseFloat(document.getElementById('rotation-z').value) * Math.PI / 180
        );
        
        // Update scale
        this.selectedObject.scale.set(
            parseFloat(document.getElementById('scale-x').value),
            parseFloat(document.getElementById('scale-y').value),
            parseFloat(document.getElementById('scale-z').value)
        );
    }
    
    addLibraryObject(object, position) {
        // Convert 2D screen position to 3D world position
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Position the object at the intersection point
        object.position.copy(intersectionPoint);
        
        // Add the object to the scene
        this.sceneManager.add(object);
        this.objects.push(object);
        
        console.log(`Added ${object.name} to scene at position:`, intersectionPoint);
    }
    
    createWall(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create wall geometry
        const wallProps = this.defaultProperties.wall;
        const wallGeometry = new THREE.BoxGeometry(2, wallProps.height, wallProps.thickness);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        
        // Position wall
        wall.position.copy(intersectionPoint);
        wall.position.y = wallProps.height / 2;
        
        // Set name and metadata
        wall.name = 'Wall';
        wall.userData.type = 'Wall';
        wall.userData.layer = this.activeLayer;
        wall.userData.story = this.activeStory;
        
        // Enable shadows
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        // Add to scene
        this.sceneManager.add(wall);
        this.objects.push(wall);
    }
    
    createDoor(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create door frame
        const doorProps = this.defaultProperties.door;
        const group = new THREE.Group();
        
        // Door frame
        const frameGeometry = new THREE.BoxGeometry(doorProps.width + 0.1, doorProps.height + 0.05, doorProps.thickness);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = doorProps.height / 2;
        
        // Door panel
        const doorGeometry = new THREE.BoxGeometry(doorProps.width, doorProps.height, doorProps.thickness / 2);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(doorProps.width / 2 - 0.05, doorProps.height / 2, 0);
        
        // Door handle
        const handleGeometry = new THREE.SphereGeometry(0.03);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(doorProps.width / 2 - 0.15, doorProps.height / 2, doorProps.thickness / 2);
        
        // Add all parts to the group
        group.add(frame);
        group.add(door);
        group.add(handle);
        
        // Position door
        group.position.copy(intersectionPoint);
        
        // Set name and metadata
        group.name = 'Door';
        group.userData.type = 'Door';
        group.userData.layer = this.activeLayer;
        group.userData.story = this.activeStory;
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Add to scene
        this.sceneManager.add(group);
        this.objects.push(group);
    }
    
    createWindow(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create window
        const windowProps = this.defaultProperties.window;
        const group = new THREE.Group();
        
        // Window frame
        const frameGeometry = new THREE.BoxGeometry(windowProps.width + 0.1, windowProps.height + 0.1, windowProps.thickness);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = windowProps.sillHeight + windowProps.height / 2;
        
        // Window glass
        const glassGeometry = new THREE.BoxGeometry(windowProps.width, windowProps.height, windowProps.thickness / 2);
        const glassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xADD8E6,
            transparent: true,
            opacity: 0.5
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.y = windowProps.sillHeight + windowProps.height / 2;
        
        // Window sill
        const sillGeometry = new THREE.BoxGeometry(windowProps.width + 0.2, 0.05, windowProps.thickness + 0.1);
        const sillMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
        const sill = new THREE.Mesh(sillGeometry, sillMaterial);
        sill.position.y = windowProps.sillHeight - 0.025;
        
        // Add all parts to the group
        group.add(frame);
        group.add(glass);
        group.add(sill);
        
        // Position window
        group.position.copy(intersectionPoint);
        
        // Set name and metadata
        group.name = 'Window';
        group.userData.type = 'Window';
        group.userData.layer = this.activeLayer;
        group.userData.story = this.activeStory;
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Add to scene
        this.sceneManager.add(group);
        this.objects.push(group);
    }
    
    createColumn(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create column
        const columnProps = this.defaultProperties.column;
        const columnGeometry = new THREE.BoxGeometry(
            columnProps.width, 
            columnProps.height, 
            columnProps.depth
        );
        const columnMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        
        // Position column
        column.position.copy(intersectionPoint);
        column.position.y = columnProps.height / 2;
        
        // Set name and metadata
        column.name = 'Column';
        column.userData.type = 'Column';
        column.userData.layer = this.activeLayer;
        column.userData.story = this.activeStory;
        
        // Enable shadows
        column.castShadow = true;
        column.receiveShadow = true;
        
        // Add to scene
        this.sceneManager.add(column);
        this.objects.push(column);
    }
    
    createBeam(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create beam
        const beamProps = this.defaultProperties.beam;
        const beamGeometry = new THREE.BoxGeometry(
            beamProps.length,
            beamProps.height,
            beamProps.width
        );
        const beamMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        
        // Position beam
        beam.position.copy(intersectionPoint);
        beam.position.y = beamProps.height / 2 + 2.7; // Position at top of walls
        
        // Set name and metadata
        beam.name = 'Beam';
        beam.userData.type = 'Beam';
        beam.userData.layer = this.activeLayer;
        beam.userData.story = this.activeStory;
        
        // Enable shadows
        beam.castShadow = true;
        beam.receiveShadow = true;
        
        // Add to scene
        this.sceneManager.add(beam);
        this.objects.push(beam);
    }
    
    createSlab(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create slab
        const slabProps = this.defaultProperties.slab;
        const slabGeometry = new THREE.BoxGeometry(5, slabProps.thickness, 5);
        const slabMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
        const slab = new THREE.Mesh(slabGeometry, slabMaterial);
        
        // Position slab
        slab.position.copy(intersectionPoint);
        slab.position.y = 2.7 + slabProps.thickness / 2; // Position at top of walls
        
        // Set name and metadata
        slab.name = 'Slab';
        slab.userData.type = 'Slab';
        slab.userData.layer = this.activeLayer;
        slab.userData.story = this.activeStory;
        
        // Enable shadows
        slab.castShadow = true;
        slab.receiveShadow = true;
        
        // Add to scene
        this.sceneManager.add(slab);
        this.objects.push(slab);
    }
    
    createStair(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create stairs
        const stairProps = this.defaultProperties.stair;
        const group = new THREE.Group();
        
        // Create steps
        for (let i = 0; i < stairProps.numberOfSteps; i++) {
            // Create step (tread)
            const treadGeometry = new THREE.BoxGeometry(
                stairProps.width,
                stairProps.riserHeight * 0.1,
                stairProps.treadDepth
            );
            const treadMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
            const tread = new THREE.Mesh(treadGeometry, treadMaterial);
            
            // Position step
            tread.position.set(
                0,
                i * stairProps.riserHeight + stairProps.riserHeight * 0.05,
                i * stairProps.treadDepth - (stairProps.numberOfSteps * stairProps.treadDepth) / 2 + stairProps.treadDepth / 2
            );
            
            // Create riser
            const riserGeometry = new THREE.BoxGeometry(
                stairProps.width,
                stairProps.riserHeight * 0.9,
                stairProps.treadDepth * 0.1
            );
            const riserMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
            const riser = new THREE.Mesh(riserGeometry, riserMaterial);
            
            // Position riser
            riser.position.set(
                0,
                i * stairProps.riserHeight + stairProps.riserHeight * 0.45,
                i * stairProps.treadDepth - (stairProps.numberOfSteps * stairProps.treadDepth) / 2 - stairProps.treadDepth * 0.45
            );
            
            // Add step and riser to group
            group.add(tread);
            if (i > 0) { // No riser for first step
                group.add(riser);
            }
        }
        
        // Position stairs
        group.position.copy(intersectionPoint);
        
        // Set name and metadata
        group.name = 'Stairs';
        group.userData.type = 'Stairs';
        group.userData.layer = this.activeLayer;
        group.userData.story = this.activeStory;
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Add to scene
        this.sceneManager.add(group);
        this.objects.push(group);
    }
    
    createRoof(event) {
        // Get intersection point with ground plane
        const intersectionPoint = this.sceneManager.getIntersectionPoint();
        
        // Create roof
        const roofProps = this.defaultProperties.roof;
        const group = new THREE.Group();
        
        // Calculate roof dimensions
        const width = 5;
        const length = 5;
        const height = Math.tan(roofProps.pitch * Math.PI / 180) * (width / 2);
        
        // Create roof shape
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2 - roofProps.overhang, -length / 2 - roofProps.overhang);
        shape.lineTo(width / 2 + roofProps.overhang, -length / 2 - roofProps.overhang);
        shape.lineTo(width / 2 + roofProps.overhang, length / 2 + roofProps.overhang);
        shape.lineTo(-width / 2 - roofProps.overhang, length / 2 + roofProps.overhang);
        shape.lineTo(-width / 2 - roofProps.overhang, -length / 2 - roofProps.overhang);
        
        // Create extrusion settings
        const extrudeSettings = {
            steps: 1,
            depth: roofProps.thickness,
            bevelEnabled: false
        };
        
        // Create roof base
        const baseGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = Math.PI / 2;
        base.position.y = 2.7; // Position at top of walls
        
        // Create roof slopes
        const slopeGeometry1 = new THREE.BoxGeometry(width + roofProps.overhang * 2, roofProps.thickness, Math.sqrt(height * height + (width / 2) * (width / 2)));
        const slopeMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
        
        const slope1 = new THREE.Mesh(slopeGeometry1, slopeMaterial);
        slope1.position.set(0, 2.7 + height / 2, 0);
        slope1.rotation.x = Math.PI / 2 - Math.atan(height / (width / 2));
        slope1.position.z = length / 4;
        
        const slope2 = new THREE.Mesh(slopeGeometry1.clone(), slopeMaterial);
        slope2.position.set(0, 2.7 + height / 2, 0);
        slope2.rotation.x = -Math.PI / 2 + Math.atan(height / (width / 2));
        slope2.position.z = -length / 4;
        
        // Add all parts to the group
        group.add(base);
        group.add(slope1);
        group.add(slope2);
        
        // Position roof
        group.position.copy(intersectionPoint);
        
        // Set name and metadata
        group.name = 'Roof';
        group.userData.type = 'Roof';
        group.userData.layer = this.activeLayer;
        group.userData.story = this.activeStory;
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        // Add to scene
        this.sceneManager.add(group);
        this.objects.push(group);
    }
}
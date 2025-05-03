import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneManager } from './SceneManager';
import { ObjectManager } from './ObjectManager';
import { ViewManager } from './ViewManager';
import { LibraryManager } from './LibraryManager';
import { UIManager } from './UIManager';

// Main application class
class App {
    constructor() {
        this.init();
    }
    
    init() {
        // Create scene manager
        this.sceneManager = new SceneManager();
        
        // Create view manager
        this.viewManager = new ViewManager(this.sceneManager);
        
        // Create library manager
        this.libraryManager = new LibraryManager();
        
        // Create object manager
        this.objectManager = new ObjectManager(this.sceneManager);
        
        // Create UI manager
        this.uiManager = new UIManager(this.objectManager, this.viewManager, this.libraryManager);
        
        // Initialize the scene
        this.initScene();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    initScene() {
        // Add a ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.sceneManager.add(ground);
        
        // Add grid
        const grid = new THREE.GridHelper(100, 100, 0x888888, 0xcccccc);
        grid.position.y = 0.01; // Slightly above ground to prevent z-fighting
        this.sceneManager.add(grid);
        this.sceneManager.grid = grid;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.sceneManager.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        
        this.sceneManager.add(directionalLight);
        
        // Add hemisphere light for better ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.3);
        this.sceneManager.add(hemisphereLight);
        
        // Initialize orbit controls
        this.controls = new OrbitControls(this.sceneManager.camera, this.sceneManager.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = true;
        
        // Set initial camera position
        this.sceneManager.camera.position.set(10, 10, 10);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update controls
        this.controls.update();
        
        // Update coordinate display
        this.updateCoordinates();
        
        // Render scene
        this.sceneManager.render();
    }
    
    updateCoordinates() {
        // Get mouse position and update coordinates display
        const coordinates = document.getElementById('coordinates');
        if (coordinates && this.uiManager.mousePosition) {
            const pos = this.uiManager.mousePosition;
            coordinates.textContent = `X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)}`;
        }
    }
    
    onWindowResize() {
        // Update camera aspect ratio and renderer size
        this.sceneManager.camera.aspect = window.innerWidth / window.innerHeight;
        this.sceneManager.camera.updateProjectionMatrix();
        this.sceneManager.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize panel collapsing functionality
function initPanels() {
    document.querySelectorAll('.panel-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.classList.toggle('collapsed');
            header.classList.toggle('collapsed');
        });
    });
}

// Initialize view tabs
function initViewTabs() {
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.view-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Switch view based on tab ID
            const viewType = tab.id.replace('-tab', '');
            document.dispatchEvent(new CustomEvent('changeView', { 
                detail: { view: viewType } 
            }));
        });
    });
}

// Initialize tool icons in the left sidebar
function initToolIcons() {
    document.querySelectorAll('.tool-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            document.querySelectorAll('.tool-icon').forEach(i => {
                i.classList.remove('active');
            });
            icon.classList.add('active');
            
            // Get tool type from icon ID
            const toolType = icon.id.replace('-icon', '').replace('-tool', '');
            
            // Also activate corresponding toolbar button if exists
            const toolbarButton = document.getElementById(`${toolType}-tool`);
            if (toolbarButton) {
                document.querySelectorAll('.tool-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                toolbarButton.classList.add('active');
            }
            
            // Dispatch tool change event
            document.dispatchEvent(new CustomEvent('changeTool', { 
                detail: { tool: toolType } 
            }));
        });
    });
}

// Initialize zoom and view controls
function initViewControls() {
    // Zoom in button
    document.getElementById('zoom-in').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('zoomView', { 
            detail: { direction: 'in' } 
        }));
    });
    
    // Zoom out button
    document.getElementById('zoom-out').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('zoomView', { 
            detail: { direction: 'out' } 
        }));
    });
    
    // Pan button
    document.getElementById('pan').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('changeViewMode', { 
            detail: { mode: 'pan' } 
        }));
    });
    
    // Orbit button
    document.getElementById('orbit').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('changeViewMode', { 
            detail: { mode: 'orbit' } 
        }));
    });
}

// Initialize toolbar buttons
function initToolbarButtons() {
    document.querySelectorAll('.tool-btn').forEach(button => {
        button.addEventListener('click', () => {
            // If it's a tool button (not a command button like save/open)
            if (button.id.includes('-tool')) {
                document.querySelectorAll('.tool-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Get tool type from button ID
                const toolType = button.id.replace('-tool', '');
                
                // Also activate corresponding sidebar icon if exists
                const sidebarIcon = document.getElementById(`${toolType}-icon`);
                if (sidebarIcon) {
                    document.querySelectorAll('.tool-icon').forEach(icon => {
                        icon.classList.remove('active');
                    });
                    sidebarIcon.classList.add('active');
                }
                
                // Dispatch tool change event
                document.dispatchEvent(new CustomEvent('changeTool', { 
                    detail: { tool: toolType } 
                }));
            }
        });
    });
    
    // New project button
    document.getElementById('new-project-tool').addEventListener('click', () => {
        if (confirm('Create a new project? Unsaved changes will be lost.')) {
            document.dispatchEvent(new CustomEvent('newProject'));
        }
    });
}

// Initialize library categories and items
function initLibrary() {
    document.querySelectorAll('.lib-category').forEach(category => {
        category.addEventListener('click', () => {
            document.querySelectorAll('.lib-category').forEach(c => {
                c.classList.remove('active');
            });
            category.classList.add('active');
            
            // Load library items for this category
            const categoryName = category.textContent.toLowerCase();
            document.dispatchEvent(new CustomEvent('loadLibraryCategory', { 
                detail: { category: categoryName } 
            }));
        });
    });
    
    // Make library items draggable
    document.querySelectorAll('.lib-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.querySelector('span').textContent);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });
    
    // Make canvas a drop target for library items
    const canvas = document.getElementById('canvas-container');
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const itemName = e.dataTransfer.getData('text/plain');
        
        // Calculate drop position in 3D space
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
        
        document.dispatchEvent(new CustomEvent('dropLibraryItem', { 
            detail: { 
                item: itemName,
                position: { x: mouseX, y: mouseY }
            } 
        }));
    });
}

// Initialize menu dropdowns
function initMenus() {
    document.querySelectorAll('.menu-item').forEach(menuItem => {
        menuItem.addEventListener('click', (e) => {
            // Prevent click from closing dropdown immediately
            e.stopPropagation();
        });
    });
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    });
    
    // Toggle grid menu item
    document.getElementById('toggle-grid').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('toggleGrid'));
    });
    
    // New project menu item
    document.getElementById('new-project').addEventListener('click', () => {
        if (confirm('Create a new project? Unsaved changes will be lost.')) {
            document.dispatchEvent(new CustomEvent('newProject'));
        }
    });
}

// Initialize layer controls
function initLayerControls() {
    // Add layer button
    document.getElementById('add-layer').addEventListener('click', () => {
        const layerName = prompt('Enter layer name:');
        if (layerName) {
            const layersList = document.getElementById('layers-list');
            const newLayer = document.createElement('li');
            newLayer.className = 'layer-item';
            newLayer.innerHTML = `
                <input type="checkbox" checked>
                <span class="layer-name">${layerName}</span>
            `;
            
            layersList.appendChild(newLayer);
            
            // Add click event to select layer
            newLayer.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    document.querySelectorAll('.layer-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    newLayer.classList.add('active');
                    
                    document.dispatchEvent(new CustomEvent('selectLayer', { 
                        detail: { layer: layerName } 
                    }));
                }
            });
            
            // Add change event for visibility checkbox
            const checkbox = newLayer.querySelector('input');
            checkbox.addEventListener('change', () => {
                document.dispatchEvent(new CustomEvent('toggleLayerVisibility', { 
                    detail: { 
                        layer: layerName,
                        visible: checkbox.checked
                    } 
                }));
            });
            
            // Dispatch event to create layer
            document.dispatchEvent(new CustomEvent('createLayer', { 
                detail: { layer: layerName } 
            }));
        }
    });
    
    // Delete layer button
    document.getElementById('delete-layer').addEventListener('click', () => {
        const activeLayer = document.querySelector('.layer-item.active');
        if (activeLayer && confirm('Delete selected layer?')) {
            const layerName = activeLayer.querySelector('.layer-name').textContent;
            
            // Dispatch event to delete layer
            document.dispatchEvent(new CustomEvent('deleteLayer', { 
                detail: { layer: layerName } 
            }));
            
            activeLayer.remove();
        }
    });
    
    // Add click events to existing layers
    document.querySelectorAll('.layer-item').forEach(layer => {
        layer.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.classList.remove('active');
                });
                layer.classList.add('active');
                
                const layerName = layer.querySelector('.layer-name').textContent;
                document.dispatchEvent(new CustomEvent('selectLayer', { 
                    detail: { layer: layerName } 
                }));
            }
        });
        
        // Add change event for visibility checkbox
        const checkbox = layer.querySelector('input');
        checkbox.addEventListener('change', () => {
            const layerName = layer.querySelector('.layer-name').textContent;
            document.dispatchEvent(new CustomEvent('toggleLayerVisibility', { 
                detail: { 
                    layer: layerName,
                    visible: checkbox.checked
                } 
            }));
        });
    });
}

// Initialize story controls
function initStoryControls() {
    // Add story button
    document.getElementById('add-story').addEventListener('click', () => {
        const storyName = prompt('Enter story name:');
        if (storyName) {
            const storiesList = document.getElementById('stories-list');
            const newStory = document.createElement('li');
            newStory.className = 'story-item';
            newStory.textContent = storyName;
            
            storiesList.appendChild(newStory);
            
            // Add click event to select story
            newStory.addEventListener('click', () => {
                document.querySelectorAll('.story-item').forEach(item => {
                    item.classList.remove('active');
                });
                newStory.classList.add('active');
                
                document.dispatchEvent(new CustomEvent('selectStory', { 
                    detail: { story: storyName } 
                }));
            });
            
            // Dispatch event to create story
            document.dispatchEvent(new CustomEvent('createStory', { 
                detail: { story: storyName } 
            }));
        }
    });
    
    // Delete story button
    document.getElementById('delete-story').addEventListener('click', () => {
        const activeStory = document.querySelector('.story-item.active');
        if (activeStory && confirm('Delete selected story?')) {
            const storyName = activeStory.textContent;
            
            // Dispatch event to delete story
            document.dispatchEvent(new CustomEvent('deleteStory', { 
                detail: { story: storyName } 
            }));
            
            activeStory.remove();
        }
    });
    
    // Add click events to existing stories
    document.querySelectorAll('.story-item').forEach(story => {
        story.addEventListener('click', () => {
            document.querySelectorAll('.story-item').forEach(item => {
                item.classList.remove('active');
            });
            story.classList.add('active');
            
            const storyName = story.textContent;
            document.dispatchEvent(new CustomEvent('selectStory', { 
                detail: { story: storyName } 
            }));
        });
    });
}

// Initialize all UI components
function initUI() {
    initPanels();
    initViewTabs();
    initToolIcons();
    initViewControls();
    initToolbarButtons();
    initLibrary();
    initMenus();
    initLayerControls();
    initStoryControls();
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    initUI();
    
    // Create app instance
    const app = new App();
    
    // Store app instance globally for debugging
    window.app = app;
});

export default App;
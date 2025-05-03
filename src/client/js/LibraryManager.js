import * as THREE from 'three';

export class LibraryManager {
    constructor() {
        this.libraryItems = {
            furniture: [
                { name: 'Chair', model: 'chair.glb' },
                { name: 'Table', model: 'table.glb' },
                { name: 'Sofa', model: 'sofa.glb' },
                { name: 'Bed', model: 'bed.glb' },
                { name: 'Cabinet', model: 'cabinet.glb' }
            ],
            fixtures: [
                { name: 'Sink', model: 'sink.glb' },
                { name: 'Toilet', model: 'toilet.glb' },
                { name: 'Bathtub', model: 'bathtub.glb' },
                { name: 'Shower', model: 'shower.glb' }
            ],
            appliances: [
                { name: 'Refrigerator', model: 'refrigerator.glb' },
                { name: 'Stove', model: 'stove.glb' },
                { name: 'Dishwasher', model: 'dishwasher.glb' },
                { name: 'Washing Machine', model: 'washing_machine.glb' }
            ],
            vegetation: [
                { name: 'Tree', model: 'tree.glb' },
                { name: 'Bush', model: 'bush.glb' },
                { name: 'Flower', model: 'flower.glb' }
            ],
            people: [
                { name: 'Man', model: 'man.glb' },
                { name: 'Woman', model: 'woman.glb' },
                { name: 'Child', model: 'child.glb' }
            ],
            vehicles: [
                { name: 'Car', model: 'car.glb' },
                { name: 'Bicycle', model: 'bicycle.glb' }
            ]
        };
        
        this.loadedModels = {};
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Listen for library category change
        document.addEventListener('loadLibraryCategory', (event) => {
            this.loadCategory(event.detail.category);
        });
        
        // Listen for library item drop
        document.addEventListener('dropLibraryItem', (event) => {
            this.placeLibraryItem(event.detail.item, event.detail.position);
        });
    }
    
    loadCategory(category) {
        // Update the library items display based on category
        const libraryItemsContainer = document.querySelector('.library-items');
        libraryItemsContainer.innerHTML = '';
        
        if (!this.libraryItems[category]) {
            return;
        }
        
        this.libraryItems[category].forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'lib-item';
            itemElement.setAttribute('draggable', 'true');
            
            itemElement.innerHTML = `
                <img src="assets/library/${item.name.toLowerCase()}.png" alt="${item.name}">
                <span>${item.name}</span>
            `;
            
            // Add drag start event
            itemElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.name);
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            libraryItemsContainer.appendChild(itemElement);
        });
    }
    
    placeLibraryItem(itemName, position) {
        // Find the item in the library
        let item = null;
        let category = null;
        
        for (const cat in this.libraryItems) {
            const found = this.libraryItems[cat].find(i => i.name === itemName);
            if (found) {
                item = found;
                category = cat;
                break;
            }
        }
        
        if (!item) {
            console.error(`Library item not found: ${itemName}`);
            return;
        }
        
        // For now, create a simple placeholder object
        // In a real app, you would load the actual 3D model
        let object;
        
        if (category === 'furniture') {
            if (itemName === 'Chair') {
                object = this.createChair();
            } else if (itemName === 'Table') {
                object = this.createTable();
            } else if (itemName === 'Sofa') {
                object = this.createSofa();
            } else if (itemName === 'Bed') {
                object = this.createBed();
            } else {
                object = this.createGenericFurniture(itemName);
            }
        } else {
            object = this.createGenericObject(itemName, category);
        }
        
        // Dispatch event to add the object to the scene
        document.dispatchEvent(new CustomEvent('addLibraryObject', { 
            detail: { object: object, position: position } 
        }));
    }
    
    createChair() {
        const group = new THREE.Group();
        
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.45;
        
        // Chair back
        const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 0.7, -0.2);
        
        // Chair legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.45);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(0.2, 0.225, 0.2);
        
        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(-0.2, 0.225, 0.2);
        
        const leg3 = new THREE.Mesh(legGeometry, legMaterial);
        leg3.position.set(0.2, 0.225, -0.2);
        
        const leg4 = new THREE.Mesh(legGeometry, legMaterial);
        leg4.position.set(-0.2, 0.225, -0.2);
        
        // Add all parts to the group
        group.add(seat);
        group.add(back);
        group.add(leg1);
        group.add(leg2);
        group.add(leg3);
        group.add(leg4);
        
        // Set name and category for the object
        group.name = 'Chair';
        group.userData.category = 'furniture';
        group.userData.type = 'Chair';
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        return group;
    }
    
    createTable() {
        const group = new THREE.Group();
        
        // Table top
        const topGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.8);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.75;
        
        // Table legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.75);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(0.5, 0.375, 0.3);
        
        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(-0.5, 0.375, 0.3);
        
        const leg3 = new THREE.Mesh(legGeometry, legMaterial);
        leg3.position.set(0.5, 0.375, -0.3);
        
        const leg4 = new THREE.Mesh(legGeometry, legMaterial);
        leg4.position.set(-0.5, 0.375, -0.3);
        
        // Add all parts to the group
        group.add(top);
        group.add(leg1);
        group.add(leg2);
        group.add(leg3);
        group.add(leg4);
        
        // Set name and category for the object
        group.name = 'Table';
        group.userData.category = 'furniture';
        group.userData.type = 'Table';
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        return group;
    }
    
    createSofa() {
        const group = new THREE.Group();
        
        // Sofa base
        const baseGeometry = new THREE.BoxGeometry(2, 0.5, 0.8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x6B8E23 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        
        // Sofa back
        const backGeometry = new THREE.BoxGeometry(2, 0.6, 0.2);
        const back = new THREE.Mesh(backGeometry, baseMaterial);
        back.position.set(0, 0.55, -0.3);
        
        // Sofa arms
        const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.8);
        
        const leftArm = new THREE.Mesh(armGeometry, baseMaterial);
        leftArm.position.set(-1.1, 0.3, 0);
        
        const rightArm = new THREE.Mesh(armGeometry, baseMaterial);
        rightArm.position.set(1.1, 0.3, 0);
        
        // Sofa cushions
        const cushionGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.6);
        const cushionMaterial = new THREE.MeshStandardMaterial({ color: 0x556B2F });
        
        const leftCushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        leftCushion.position.set(-0.65, 0.575, 0);
        
        const rightCushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        rightCushion.position.set(0, 0.575, 0);
        
        const thirdCushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        thirdCushion.position.set(0.65, 0.575, 0);
        
        // Add all parts to the group
        group.add(base);
        group.add(back);
        group.add(leftArm);
        group.add(rightArm);
        group.add(leftCushion);
        group.add(rightCushion);
        group.add(thirdCushion);
        
        // Set name and category for the object
        group.name = 'Sofa';
        group.userData.category = 'furniture';
        group.userData.type = 'Sofa';
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        return group;
    }
    
    createBed() {
        const group = new THREE.Group();
        
        // Bed frame
        const frameGeometry = new THREE.BoxGeometry(2, 0.3, 2.5);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.15;
        
        // Bed mattress
        const mattressGeometry = new THREE.BoxGeometry(1.9, 0.2, 2.4);
        const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5DC });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.y = 0.4;
        
        // Bed headboard
        const headboardGeometry = new THREE.BoxGeometry(2, 0.8, 0.1);
        const headboard = new THREE.Mesh(headboardGeometry, frameMaterial);
        headboard.position.set(0, 0.55, -1.25);
        
        // Bed pillows
        const pillowGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.4);
        const pillowMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        
        const leftPillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        leftPillow.position.set(-0.5, 0.55, -1);
        
        const rightPillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        rightPillow.position.set(0.5, 0.55, -1);
        
        // Bed blanket
        const blanketGeometry = new THREE.BoxGeometry(1.9, 0.05, 1.2);
        const blanketMaterial = new THREE.MeshStandardMaterial({ color: 0x4682B4 });
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        blanket.position.set(0, 0.525, 0.2);
        
        // Add all parts to the group
        group.add(frame);
        group.add(mattress);
        group.add(headboard);
        group.add(leftPillow);
        group.add(rightPillow);
        group.add(blanket);
        
        // Set name and category for the object
        group.name = 'Bed';
        group.userData.category = 'furniture';
        group.userData.type = 'Bed';
        
        // Enable shadows
        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        return group;
    }
    
    createGenericFurniture(itemName) {
        // Create a simple box as a placeholder for other furniture items
        const geometry = new THREE.BoxGeometry(1, 0.5, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position at floor level
        mesh.position.y = 0.25;
        
        // Set name and category for the object
        mesh.name = itemName;
        mesh.userData.category = 'furniture';
        mesh.userData.type = itemName;
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    createGenericObject(itemName, category) {
        let geometry, material, mesh;
        
        // Create different shapes based on category
        switch(category) {
            case 'fixtures':
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5);
                material = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 0.25;
                break;
                
            case 'appliances':
                geometry = new THREE.BoxGeometry(0.6, 1.2, 0.6);
                material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 0.6;
                break;
                
            case 'vegetation':
                // Create a simple tree-like shape
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, 0.8),
                    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
                );
                trunk.position.y = 0.4;
                
                const foliage = new THREE.Mesh(
                    new THREE.ConeGeometry(0.5, 1, 8),
                    new THREE.MeshStandardMaterial({ color: 0x228B22 })
                );
                foliage.position.y = 1.1;
                
                mesh = new THREE.Group();
                mesh.add(trunk);
                mesh.add(foliage);
                break;
                
            case 'people':
                // Create a simple person-like shape
                const body = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 1),
                    new THREE.MeshStandardMaterial({ color: 0x1E90FF })
                );
                body.position.y = 0.5;
                
                const head = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2),
                    new THREE.MeshStandardMaterial({ color: 0xFFE4C4 })
                );
                head.position.y = 1.1;
                
                mesh = new THREE.Group();
                mesh.add(body);
                mesh.add(head);
                break;
                
            case 'vehicles':
                // Create a simple car-like shape
                const carBody = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 0.5, 0.8),
                    new THREE.MeshStandardMaterial({ color: 0xFF0000 })
                );
                carBody.position.y = 0.3;
                
                const carTop = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.4, 0.7),
                    new THREE.MeshStandardMaterial({ color: 0xFF0000 })
                );
                carTop.position.set(0, 0.6, 0);
                
                const wheel1 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                    new THREE.MeshStandardMaterial({ color: 0x000000 })
                );
                wheel1.rotation.z = Math.PI / 2;
                wheel1.position.set(0.4, 0.15, 0.4);
                
                const wheel2 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                    new THREE.MeshStandardMaterial({ color: 0x000000 })
                );
                wheel2.rotation.z = Math.PI / 2;
                wheel2.position.set(0.4, 0.15, -0.4);
                
                const wheel3 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                    new THREE.MeshStandardMaterial({ color: 0x000000 })
                );
                wheel3.rotation.z = Math.PI / 2;
                wheel3.position.set(-0.4, 0.15, 0.4);
                
                const wheel4 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                    new THREE.MeshStandardMaterial({ color: 0x000000 })
                );
                wheel4.rotation.z = Math.PI / 2;
                wheel4.position.set(-0.4, 0.15, -0.4);
                
                mesh = new THREE.Group();
                mesh.add(carBody);
                mesh.add(carTop);
                mesh.add(wheel1);
                mesh.add(wheel2);
                mesh.add(wheel3);
                mesh.add(wheel4);
                break;
                
            default:
                // Default generic object
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 0.25;
        }
        
        // Set name and category for the object
        mesh.name = itemName;
        mesh.userData.category = category;
        mesh.userData.type = itemName;
        
        // Enable shadows
        mesh.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        return mesh;
    }
}
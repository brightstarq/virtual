import * as THREE from "three";
import { PointerLockControls } from "PointerLockControls";
import { OrbitControls } from "OrbitControls";

class CustomPointerLockControls extends PointerLockControls {
    constructor(camera, domElement) {
        super(camera, domElement);
        this.sensitivity = 0.001;
        this.camera = camera; // ✓ FIXED: Store camera reference
        this.boundMouseMove = this.onMouseMove.bind(this); // ✓ FIXED: Store bound function to prevent memory leak
    }

    getObject() {
        return this.camera;
    }

    lock() {
        super.lock();
        // ✓ FIXED: Use stored bound function
        this.domElement.ownerDocument.addEventListener("mousemove", this.boundMouseMove);
    }

    unlock() {
        super.unlock();
        // ✓ FIXED: Remove correct reference
        this.domElement.ownerDocument.removeEventListener("mousemove", this.boundMouseMove);
    }

    onMouseMove(event) {
        if (this.isLocked === true) {
            const movementX = event.movementX * this.sensitivity;
            const movementY = event.movementY * this.sensitivity;

            const euler = new THREE.Euler(0, 0, 0, "YXZ");
            euler.setFromQuaternion(this.camera.quaternion);

            euler.y -= movementX;
            euler.x -= movementY;
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

            this.camera.quaternion.setFromEuler(euler);
        }
    }

    setSensitivity(value) {
        this.sensitivity = value;
    }
}

class ThreeJSApp {
 constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a1a1a, 10, 50); // ✓ ADDED: Atmospheric fog
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
this.roomCameraSettings = [
    { 
        position: new THREE.Vector3(0, 2.5, 35), // ✓ CHANGE: was 1.6, now 2.5
        lookAt: new THREE.Vector3(0, 2.5, 0)     // ✓ CHANGE: was 1.6, now 2.5
    }
];

    const initialSettings = this.roomCameraSettings[0];
    this.camera.position.copy(initialSettings.position);
    this.camera.lookAt(initialSettings.lookAt);

    this.renderer = new THREE.WebGLRenderer({ 
        alpha: false, 
        antialias: true, 
        preserveDrawingBuffer: true,
        powerPreference: "high-performance" // ✓ ADDED
    });
    this.renderer.setClearColor(0x1a1a1a, 1); // ✓ FIXED: Darker background
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // ✓ FIXED: Cap pixel ratio
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // ✓ ADDED: Better tone mapping
    this.renderer.toneMappingExposure = 1.0;
    
    document.body.appendChild(this.renderer.domElement);
        this.isSliderActive = false;
        this.currentSliderIndex = 0;
        this.sliderImages = [];
        this.isControlPressed = false;
        this.pendingFiles = []; 
        this.metadata = []; 
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
        
        if (this.isMobile) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.copy(initialSettings.lookAt);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 20;
            this.controls.enablePan = true;
            this.controls.enableZoom = true;
        } else {
            this.controls = new CustomPointerLockControls(this.camera, this.renderer.domElement);
            this.controls.getObject().position.copy(initialSettings.position);
        }

        this.images = [];
        this.sessionId = localStorage.getItem('sessionId');
        this.textureLoader = new THREE.TextureLoader();

        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);
        this.backgroundAudio = new THREE.Audio(this.audioListener);
        this.clickSound = new THREE.Audio(this.audioListener);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedMesh = null;

        this.rooms = [];
        this.currentRoom = 0;
        this.isMoving = false;
        this.isFocused = false;
        this.isLocked = false;

        this.previousCameraState = {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            target: initialSettings.lookAt.clone()
        };

        this.lastClickTime = 0;
        this.clickDelay = 300;
       this.moveSpeed = 0.15;
    this.rotationSpeed = 0.05;
    this.cameraHeight = 1.6; // ✓ ADD THIS LINE
    this.keys = { w: false, a: false, s: false, d: false, q: false, e: false };

        this.time = 0;
        this.wallLights = [];
        this.glassSpotlights = [];
        this.ceilingLights = [];
        this.ledMaterial = null;

        // Animation and Recording Properties
        this.isRecording = false;
        this.recordedFrames = [];
        this.mediaRecorder = null;
        this.autoRotateSpeed = 0.5;
        this.isAutoRotating = false;
        this.previewContainer = document.getElementById('previewContainer');
        this.animationMixer = new THREE.AnimationMixer(this.scene);
        this.isAnimatingObjects = false;
        this.animationSpeed = 1.0;

        this.addLighting();
        this.createGallery();
        this.setupAudio();
        this.setupEventListeners();
        // this.createAvatar();

        this.isLoading = true;
        this.showPreloader();
this.lastRaycastTime = 0;
this.raycastInterval = 100; // Throttle raycasting

// Initialize UI components
this.createArtworkProgressUI();
this.setupMobileControls();

        this.fallbackImages = [
            {
                url: 'https://picsum.photos/800/600?random=1',
                metadata: {
                    filename: 'demo1.jpg',
                    title: 'Abstract Serenity',
                    description: 'A calming abstract artwork with soft colors.',
                    artist: 'Demo Artist'
                }
            },
            {
                url: 'https://picsum.photos/800/600?random=2',
                metadata: {
                    filename: 'demo2.jpg',
                    title: 'Urban Landscape',
                    description: 'A vibrant city skyline at dusk.',
                    artist: 'Demo Artist'
                }
            },
            {
                url: 'https://picsum.photos/800/600?random=3',
                metadata: {
                    filename: 'demo3.jpg',
                    title: 'Nature Harmony',
                    description: 'Rolling hills under a clear sky.',
                    artist: 'Demo Artist'
                }
            },
            {
                url: 'https://picsum.photos/800/600?random=4',
                metadata: {
                    filename: 'demo4.jpg',
                    title: 'Modern Architecture', // ✓ IMPROVED: Added variety
                    description: 'Geometric patterns in contemporary design.',
                    artist: 'Demo Artist'
                }
            },
            {
                url: 'https://picsum.photos/800/600?random=5',
                metadata: {
                    filename: 'demo5.jpg',
                    title: 'Ocean Waves', // ✓ IMPROVED: Added variety
                    description: 'The rhythmic motion of the sea.',
                    artist: 'Demo Artist'
                }
            },
            {
                url: 'https://picsum.photos/800/600?random=6',
                metadata: {
                    filename: 'demo6.jpg',
                    title: 'Night Sky', // ✓ IMPROVED: Added variety
                    description: 'Stars scattered across the cosmos.',
                    artist: 'Demo Artist'
                }
            }
        ];
    }

    showPreloader() {
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    preloader.innerHTML = `
        <div style="text-align: center;">
            <div style="
                width: 80px;
                height: 80px;
                border: 5px solid rgba(255,255,255,0.3);
                border-top: 5px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 30px;
            "></div>
            <h2 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Loading Gallery...</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 16px;">Preparing your virtual exhibition</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(preloader);
}

    hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.transition = 'opacity 0.5s';
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
                this.isLoading = false;
            }, 500);
        }
    }
  addLighting() {
    // ✓ FIXED: Reduced ambient for more dramatic lighting
    this.scene.fog = new THREE.FogExp2(0x1a1a1a, 0.008); // Dark fog
    
    // Reduced ambient (dramatic shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambientLight);
   

    
    // ✓ FIXED: Main directional light (softer, more realistic)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); // was 1.2
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -25;
    mainLight.shadow.camera.right = 25;
    mainLight.shadow.camera.top = 25;
    mainLight.shadow.camera.bottom = -25;
    mainLight.shadow.bias = -0.0005; // ✓ ADDED
    this.scene.add(mainLight);
    
    // ✓ FIXED: Fill light (warmer tone)
    const fillLight = new THREE.DirectionalLight(0xfff5e6, 0.3); // was 0xffffff, 0.4
    fillLight.position.set(-15, 15, -10);
    this.scene.add(fillLight);
}

createGallery() {
    // ========================================
    // MUSEUM OF NATURAL HISTORY SYSTEM
    // ========================================
    
    this.dinosaurSkeletons = [];
    this.fossilExhibits = [];
    this.dioramas = [];
    this.marblePillars = [];
    this.skylights = [];
    this.pterodactyl = null;
    this.museumLighting = { timeOfDay: 0.5, isDay: true };
    this.dioramaInteractions = [];
    
    this.createMuseumHall();
    this.createMarbleFloor();
    this.createDomedCeiling();
    this.createDinosaurSkeletons();
    this.createFossilExhibits();
    this.createDioramas();
    this.createPterodactyl();
    this.createSkylights();
    this.createMuseumUI();
    
    console.log("🦕 Museum of Natural History loaded!");
}

// ========================================
// MUSEUM HALL (grand marble architecture)
// ========================================

createMuseumHall() {
    const museumRoom = new THREE.Group();
    museumRoom.visible = true;
    
    const hallWidth = 50;
    const hallLength = 80;
    const hallHeight = 20;
    
    // ========================================
    // MATERIALS (classical elegance)
    // ========================================
    
    this.marbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f0,
        roughness: 0.3,
        metalness: 0.1
    });
    
    this.darkMarbleMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a3a,
        roughness: 0.4,
        metalness: 0.2
    });
    
    this.goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.9,
        emissive: 0xaa8820,
        emissiveIntensity: 0.2
    });
    
    // ========================================
    // WALLS (with archways)
    // ========================================
    
    const wallHeight = hallHeight;
    const wallThickness = 0.5;
    
    // Side walls with arched windows
    [-hallWidth/2, hallWidth/2].forEach((x, index) => {
        // Main wall sections
        for (let z = -hallLength/2; z <= hallLength/2; z += 15) {
            const wall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, wallHeight, 12),
                this.marbleMaterial
            );
            wall.position.set(x, wallHeight/2, z);
            wall.receiveShadow = true;
            museumRoom.add(wall);
            
            // Decorative molding
            const molding = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness + 0.2, 0.5, 12),
                this.goldMaterial
            );
            molding.position.set(x, wallHeight - 1, z);
            museumRoom.add(molding);
        }
    });
    
    // End walls
    [-hallLength/2, hallLength/2].forEach((z, index) => {
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(hallWidth, wallHeight, wallThickness),
            this.marbleMaterial
        );
        wall.position.set(0, wallHeight/2, z);
        wall.receiveShadow = true;
        museumRoom.add(wall);
        
        // Grand archway in entrance (z = -hallLength/2)
        if (index === 0) {
            const archway = new THREE.Mesh(
                new THREE.BoxGeometry(10, 15, wallThickness + 0.2),
                this.darkMarbleMaterial
            );
            archway.position.set(0, 7.5, z);
            museumRoom.add(archway);
            
            // Gold arch trim
            const archTrim = new THREE.TorusGeometry(5, 0.3, 16, 32, Math.PI);
            const archMesh = new THREE.Mesh(archTrim, this.goldMaterial);
            archMesh.rotation.x = Math.PI / 2;
            archMesh.position.set(0, 15, z);
            museumRoom.add(archMesh);
        }
    });
    
    // ========================================
    // MARBLE PILLARS (Corinthian style)
    // ========================================
    
    const pillarPositions = [
        { x: -20, z: -30 }, { x: 20, z: -30 },
        { x: -20, z: -10 }, { x: 20, z: -10 },
        { x: -20, z: 10 }, { x: 20, z: 10 },
        { x: -20, z: 30 }, { x: 20, z: 30 }
    ];
    
    pillarPositions.forEach(pos => {
        const pillarGroup = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.4, 1, 8),
            this.darkMarbleMaterial
        );
        base.position.y = 0.5;
        pillarGroup.add(base);
        
        // Column shaft (fluted)
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 16, 16),
            this.marbleMaterial
        );
        shaft.position.y = 9;
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        pillarGroup.add(shaft);
        
        // Fluting (vertical grooves)
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const flute = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 16, 0.3),
                new THREE.MeshStandardMaterial({
                    color: 0xf0f0e8,
                    roughness: 0.4
                })
            );
            flute.position.set(
                Math.cos(angle) * 1.05,
                9,
                Math.sin(angle) * 1.05
            );
            pillarGroup.add(flute);
        }
        
        // Capital (ornate top)
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(1.4, 1.2, 2, 8),
            this.goldMaterial
        );
        capital.position.y = 18;
        pillarGroup.add(capital);
        
        // Decorative acanthus leaves (simplified)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                this.goldMaterial
            );
            leaf.position.set(
                Math.cos(angle) * 1.3,
                17.5,
                Math.sin(angle) * 1.3
            );
            leaf.scale.set(1, 1.5, 0.5);
            pillarGroup.add(leaf);
        }
        
        pillarGroup.position.set(pos.x, 0, pos.z);
        museumRoom.add(pillarGroup);
        this.marblePillars.push(pillarGroup);
    });
    
    // ========================================
    // AMBIENT LIGHTING (natural museum light)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0xf5f5e8, 0.6);
    museumRoom.add(ambientLight);
    
    // Main directional light (from skylights)
    this.museumMainLight = new THREE.DirectionalLight(0xffffee, 1.2);
    this.museumMainLight.position.set(0, 18, 0);
    this.museumMainLight.castShadow = true;
    this.museumMainLight.shadow.mapSize.width = 2048;
    this.museumMainLight.shadow.mapSize.height = 2048;
    museumRoom.add(this.museumMainLight);
    
    // Warm accent lights on exhibits
    for (let i = 0; i < 8; i++) {
        const spotLight = new THREE.SpotLight(0xffeecc, 0.8, 15, Math.PI / 4, 0.5);
        spotLight.position.set(
            (Math.random() - 0.5) * 40,
            15,
            (Math.random() - 0.5) * 70
        );
        spotLight.target.position.set(
            spotLight.position.x,
            0,
            spotLight.position.z
        );
        museumRoom.add(spotLight);
        museumRoom.add(spotLight.target);
    }
    
    museumRoom.position.set(0, 0, 0);
    this.rooms.push(museumRoom);
    this.scene.add(museumRoom);
}

// ========================================
// MARBLE FLOOR (polished checkered pattern)
// ========================================

createMarbleFloor() {
    const floorWidth = 50;
    const floorLength = 80;
    
    // Main floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(floorWidth, floorLength),
        this.marbleMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.rooms[0].add(floor);
    
    // Checkered marble pattern
    const tileSize = 5;
    for (let x = -floorWidth/2; x < floorWidth/2; x += tileSize) {
        for (let z = -floorLength/2; z < floorLength/2; z += tileSize) {
            const isDark = ((x / tileSize) + (z / tileSize)) % 2 === 0;
            if (isDark) {
                const tile = new THREE.Mesh(
                    new THREE.PlaneGeometry(tileSize - 0.05, tileSize - 0.05),
                    this.darkMarbleMaterial
                );
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(x + tileSize/2, 0.01, z + tileSize/2);
                tile.receiveShadow = true;
                this.rooms[0].add(tile);
            }
        }
    }
    
    // Center medallion (decorative)
    const medallionRadius = 4;
    const medallion = new THREE.Mesh(
        new THREE.CircleGeometry(medallionRadius, 32),
        this.goldMaterial
    );
    medallion.rotation.x = -Math.PI / 2;
    medallion.position.y = 0.02;
    this.rooms[0].add(medallion);
    
    // Medallion pattern (concentric circles)
    for (let r = 1; r < medallionRadius; r += 0.8) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(r, r + 0.2, 32),
            r % 1.6 < 0.8 ? this.darkMarbleMaterial : this.marbleMaterial
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        this.rooms[0].add(ring);
    }
}

// ========================================
// DOMED CEILING (Renaissance style)
// ========================================

createDomedCeiling() {
    const hallWidth = 50;
    const hallLength = 80;
    const ceilingHeight = 20;
    
    // Main flat ceiling sections
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(hallWidth, hallLength),
        new THREE.MeshStandardMaterial({
            color: 0xf5f5e8,
            roughness: 0.6,
            side: THREE.DoubleSide
        })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ceilingHeight;
    ceiling.receiveShadow = true;
    this.rooms[0].add(ceiling);
    
    // Central dome
    const domeGeometry = new THREE.SphereGeometry(12, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(
        domeGeometry,
        new THREE.MeshStandardMaterial({
            color: 0xf5f5e8,
            roughness: 0.5,
            side: THREE.DoubleSide
        })
    );
    dome.position.y = ceilingHeight;
    dome.receiveShadow = true;
    this.rooms[0].add(dome);
    
    // Dome ribs (structural/decorative)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const rib = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 12, 0.3),
            this.goldMaterial
        );
        rib.position.set(
            Math.cos(angle) * 6,
            ceilingHeight + 6,
            Math.sin(angle) * 6
        );
        rib.rotation.set(
            0,
            angle,
            Math.PI / 4
        );
        this.rooms[0].add(rib);
    }
    
    // Oculus (central opening for skylight)
    const oculus = new THREE.Mesh(
        new THREE.RingGeometry(2, 3, 32),
        this.goldMaterial
    );
    oculus.rotation.x = -Math.PI / 2;
    oculus.position.y = ceilingHeight + 11.8;
    this.rooms[0].add(oculus);
    
    // Coffered ceiling sections (between dome and walls)
    const cofferSize = 3;
    for (let x = -18; x <= 18; x += cofferSize + 0.5) {
        for (let z = -35; z <= 35; z += cofferSize + 0.5) {
            // Skip center area (dome)
            if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
            
            const coffer = new THREE.Mesh(
                new THREE.BoxGeometry(cofferSize, 0.5, cofferSize),
                this.darkMarbleMaterial
            );
            coffer.position.set(x, ceilingHeight - 0.5, z);
            this.rooms[0].add(coffer);
            
            // Gold trim
            const trim = new THREE.Mesh(
                new THREE.BoxGeometry(cofferSize + 0.1, 0.1, cofferSize + 0.1),
                this.goldMaterial
            );
            trim.position.set(x, ceilingHeight - 0.25, z);
            this.rooms[0].add(trim);
        }
    }
}

// ========================================
// DINOSAUR SKELETONS (centerpiece exhibits)
// ========================================

createDinosaurSkeletons() {
    this.createTRexSkeleton();
    this.createTriceratopsSkeleton();
    this.createStegosaurusSkeleton();
}

createTRexSkeleton() {
    const trexGroup = new THREE.Group();
    
    const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e0d0,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // ========================================
    // T-REX POSE (standing, mouth open)
    // ========================================
    
    // Skull (menacing)
    const skull = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1, 2),
        boneMaterial
    );
    skull.position.set(0, 8, -3);
    skull.rotation.x = -0.3;
    skull.castShadow = true;
    trexGroup.add(skull);
    
    // Upper jaw
    const upperJaw = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.3, 1.8),
        boneMaterial
    );
    upperJaw.position.set(0, 8.5, -3.5);
    upperJaw.rotation.x = -0.4;
    trexGroup.add(upperJaw);
    
    // Lower jaw (open)
    const lowerJaw = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.3, 1.5),
        boneMaterial
    );
    lowerJaw.position.set(0, 7.3, -3.5);
    lowerJaw.rotation.x = 0.3;
    trexGroup.add(lowerJaw);
    
    // Teeth (fearsome)
    for (let i = 0; i < 20; i++) {
        const tooth = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.3, 4),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.4
            })
        );
        tooth.position.set(
            (i % 2 === 0 ? -0.5 : 0.5),
            i < 10 ? 8.3 : 7.3,
            -4 + (i % 10) * 0.15
        );
        tooth.rotation.x = i < 10 ? -Math.PI / 6 : Math.PI / 6;
        trexGroup.add(tooth);
    }
    
    // Neck vertebrae
    for (let i = 0; i < 4; i++) {
        const vertebra = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.8, 0.8),
            boneMaterial
        );
        vertebra.position.set(0, 7 - i * 0.8, -1.5 + i * 0.5);
        vertebra.rotation.x = 0.2;
        vertebra.castShadow = true;
        trexGroup.add(vertebra);
    }
    
    // Spine
    for (let i = 0; i < 8; i++) {
        const vertebra = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.8),
            boneMaterial
        );
        vertebra.position.set(0, 4 - i * 0.3, i * 0.8);
        vertebra.rotation.x = -0.1;
        vertebra.castShadow = true;
        trexGroup.add(vertebra);
        
        // Spinal process (top protrusion)
        const process = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.8, 0.2),
            boneMaterial
        );
        process.position.set(0, 4.5 - i * 0.3, i * 0.8);
        trexGroup.add(process);
    }
    
    // Rib cage
    for (let i = 0; i < 12; i++) {
        [-1, 1].forEach(side => {
            const rib = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 2, 0.15),
                boneMaterial
            );
            rib.position.set(side * 0.5, 3.5 - i * 0.2, i * 0.5);
            rib.rotation.set(0.3, 0, side * 0.8);
            rib.castShadow = true;
            trexGroup.add(rib);
        });
    }
    
    // Pelvis
    const pelvis = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.8, 1.5),
        boneMaterial
    );
    pelvis.position.set(0, 2, 5);
    pelvis.castShadow = true;
    trexGroup.add(pelvis);
    
    // Tail vertebrae (powerful tail)
    for (let i = 0; i < 15; i++) {
        const size = 0.7 - i * 0.04;
        const tailBone = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            boneMaterial
        );
        tailBone.position.set(0, 1.5 + i * 0.1, 6 + i * 0.6);
        tailBone.rotation.x = -0.1 - i * 0.05;
        tailBone.castShadow = true;
        trexGroup.add(tailBone);
    }
    
    // Legs (powerful hind legs)
    [-1, 1].forEach(side => {
        // Femur
        const femur = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.25, 3, 8),
            boneMaterial
        );
        femur.position.set(side * 1, 3, 4);
        femur.rotation.set(0.3, 0, side * 0.2);
        femur.castShadow = true;
        trexGroup.add(femur);
        
        // Tibia
        const tibia = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.2, 2.5, 8),
            boneMaterial
        );
        tibia.position.set(side * 1.2, 1.2, 4.5);
        tibia.rotation.set(-0.5, 0, side * 0.1);
        tibia.castShadow = true;
        trexGroup.add(tibia);
        
        // Foot (3 toes)
        for (let toe = 0; toe < 3; toe++) {
            const toeAngle = (toe - 1) * 0.4;
            const toeBone = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.15, 1),
                boneMaterial
            );
            toeBone.position.set(
                side * 1.3 + Math.sin(toeAngle) * 0.3,
                0.1,
                4.8 + Math.cos(toeAngle) * 0.3
            );
            toeBone.rotation.y = toeAngle;
            toeBone.castShadow = true;
            trexGroup.add(toeBone);
            
            // Claw
            const claw = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.25, 4),
                new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.4,
                    metalness: 0.3
                })
            );
            claw.position.set(
                side * 1.3 + Math.sin(toeAngle) * 0.5,
                0.1,
                5.2 + Math.cos(toeAngle) * 0.5
            );
            claw.rotation.x = Math.PI / 2;
            claw.rotation.z = toeAngle;
            trexGroup.add(claw);
        }
    });
    
    // Arms (tiny but iconic)
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.12, 1.2, 6),
            boneMaterial
        );
        arm.position.set(side * 0.8, 5.5, -1);
        arm.rotation.set(0.8, 0, side * 0.5);
        arm.castShadow = true;
        trexGroup.add(arm);
        
        // Hand
        const hand = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.3, 0.2),
            boneMaterial
        );
        hand.position.set(side * 1.2, 4.8, -0.5);
        trexGroup.add(hand);
    });
    
    trexGroup.position.set(-10, 0, -15);
    this.rooms[0].add(trexGroup);
    this.dinosaurSkeletons.push({ model: trexGroup, type: 'trex' });
    
    // Info plaque
    this.createInfoPlaque("Tyrannosaurus Rex", "Late Cretaceous Period\n68-66 Million Years Ago", -10, 0, -20);
}

createTriceratopsSkeleton() {
    const triceratopsGroup = new THREE.Group();
    
    const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e0d0,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // Skull with frill and horns
    const skull = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.2, 2),
        boneMaterial
    );
    skull.position.set(0, 2.5, -3);
    skull.castShadow = true;
    triceratopsGroup.add(skull);
    
    // Beak
    const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 0.8, 4),
        boneMaterial
    );
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, 2.5, -4.2);
    triceratopsGroup.add(beak);
    
    // Frill (iconic feature)
    const frill = new THREE.Mesh(
        new THREE.CircleGeometry(2.5, 32),
        boneMaterial
    );
    frill.position.set(0, 3.5, -2);
    frill.rotation.x = 0.3;
    frill.castShadow = true;
    triceratopsGroup.add(frill);
    
    // Horns (3 horns - 2 brow, 1 nose)
    // Brow horns
    [-0.6, 0.6].forEach(x => {
        const horn = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 1.5, 8),
            boneMaterial
        );
        horn.position.set(x, 3.2, -3.5);
        horn.rotation.set(0.5, 0, x * 0.2);
        horn.castShadow = true;
        triceratopsGroup.add(horn);
    });
    
    // Nose horn (shorter)
    const noseHorn = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.8, 8),
        boneMaterial
    );
    noseHorn.position.set(0, 2.2, -4);
    noseHorn.rotation.x = 0.3;
    triceratopsGroup.add(noseHorn);
    
    // Body (stocky)
    const spine = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.8, 5),
        boneMaterial
    );
    spine.position.set(0, 2.5, 1);
    spine.castShadow = true;
    triceratopsGroup.add(spine);
    
    // Ribs
    for (let i = 0; i < 10; i++) {
        [-1, 1].forEach(side => {
            const rib = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 1.5, 0.12),
                boneMaterial
            );
            rib.position.set(side * 0.6, 2.5, -1 + i * 0.5);
            rib.rotation.set(0.2, 0, side * 0.6);
            triceratopsGroup.add(rib);
        });
    }
    
    // Legs (4 sturdy legs)
    const legPositions = [
        { x: -0.8, z: -1.5 }, { x: 0.8, z: -1.5 },  // Front
        { x: -0.8, z: 2.5 }, { x: 0.8, z: 2.5 }     // Back
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.2, 2, 8),
            boneMaterial
        );
        leg.position.set(pos.x, 1, pos.z);
        leg.castShadow = true;
        triceratopsGroup.add(leg);
        
        // Foot
        const foot = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.2, 0.5),
            boneMaterial
        );
        foot.position.set(pos.x, 0.1, pos.z);
        triceratopsGroup.add(foot);
    });
    
    // Tail
    for (let i = 0; i < 8; i++) {
        const size = 0.5 - i * 0.05;
        const tailBone = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            boneMaterial
        );
        tailBone.position.set(0, 2 - i * 0.1, 3.5 + i * 0.5);
        tailBone.castShadow = true;
        triceratopsGroup.add(tailBone);
    }
    
    triceratopsGroup.position.set(10, 0, -10);
    this.rooms[0].add(triceratopsGroup);
    this.dinosaurSkeletons.push({ model: triceratopsGroup, type: 'triceratops' });
    
    this.createInfoPlaque("Triceratops", "Late Cretaceous Period\n68-66 Million Years Ago", 10, 0, -15);
}

createStegosaurusSkeleton() {
    const stegosaurusGroup = new THREE.Group();
    
    const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e0d0,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // Small head (low intelligence)
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.5, 0.8),
        boneMaterial
    );
    head.position.set(0, 2, -3);
    head.castShadow = true;
    stegosaurusGroup.add(head);
    
    // Neck
    for (let i = 0; i < 3; i++) {
        const vertebra = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            boneMaterial
        );
        vertebra.position.set(0, 2.2 + i * 0.2, -2 + i * 0.5);
        stegosaurusGroup.add(vertebra);
    }
    
    // Body (high arched back)
    for (let i = 0; i < 8; i++) {
        const heightOffset = Math.sin((i / 7) * Math.PI) * 2; // Arc shape
        const vertebra = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.8, 0.8),
            boneMaterial
        );
        vertebra.position.set(0, 3 + heightOffset, -0.5 + i * 0.8);
        vertebra.castShadow = true;
        stegosaurusGroup.add(vertebra);
        
        // Back plates (iconic feature)
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.5 + Math.random() * 0.5, 1),
            boneMaterial
        );
        plate.position.set(0, 4.5 + heightOffset, -0.5 + i * 0.8);
        plate.rotation.x = -0.2;
        plate.castShadow = true;
        stegosaurusGroup.add(plate);
    }
    
    // Ribs
    for (let i = 0; i < 10; i++) {
        [-1, 1].forEach(side => {
            const rib = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 1.2, 0.1),
                boneMaterial
            );
            const heightOffset = Math.sin((i / 9) * Math.PI) * 1.5;
            rib.position.set(side * 0.4, 3 + heightOffset, i * 0.6);
            rib.rotation.set(0.2, 0, side * 0.5);
            stegosaurusGroup.add(rib);
        });
    }
    
    // Legs (front shorter than back)
    const frontLegs = [{ x: -0.6, z: -1 }, { x: 0.6, z: -1 }];
    const backLegs = [{ x: -0.6, z: 4 }, { x: 0.6, z: 4 }];
    
    frontLegs.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.15, 1.5, 8),
            boneMaterial
        );
        leg.position.set(pos.x, 0.75, pos.z);
        leg.castShadow = true;
        stegosaurusGroup.add(leg);
    });
    
    backLegs.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.2, 2.5, 8),
            boneMaterial
        );
        leg.position.set(pos.x, 1.25, pos.z);
        leg.castShadow = true;
        stegosaurusGroup.add(leg);
    });
    
    // Tail with spikes (thagomizer)
    for (let i = 0; i < 10; i++) {
        const size = 0.5 - i * 0.03;
        const tailBone = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            boneMaterial
        );
        tailBone.position.set(0, 2.5 - i * 0.2, 5 + i * 0.5);
        tailBone.rotation.x = -0.2;
        tailBone.castShadow = true;
        stegosaurusGroup.add(tailBone);
    }
    
    // Tail spikes (4 spikes at end)
    for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.8, 6),
            boneMaterial
        );
        const sideOffset = i % 2 === 0 ? -0.3 : 0.3;
        const zOffset = Math.floor(i / 2) * 0.5;
        spike.position.set(sideOffset, 1 + i * 0.1, 9.5 + zOffset);
        spike.rotation.set(0.5, 0, sideOffset * 2);
        spike.castShadow = true;
        stegosaurusGroup.add(spike);
    }
    
    stegosaurusGroup.position.set(0, 0, 15);
    this.rooms[0].add(stegosaurusGroup);
    this.dinosaurSkeletons.push({ model: stegosaurusGroup, type: 'stegosaurus' });
    
    this.createInfoPlaque("Stegosaurus", "Late Jurassic Period\n155-150 Million Years Ago", 0, 0, 10);
}

createInfoPlaque(title, info, x, y, z) {
    const plaqueGroup = new THREE.Group();
    
    // Metal stand
    const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    stand.position.y = 0.6;
    plaqueGroup.add(stand);
    
    // Plaque
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Bronze background
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(0, 0, 512, 256);
    
    // Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 236);
    
    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 80);
    
    ctx.font = '28px Georgia';
    const lines = info.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, 256, 140 + index * 35);
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1),
        new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.5,
            metalness: 0.7
        })
    );
    plaque.position.y = 1.2;
    plaqueGroup.add(plaque);
    
    plaqueGroup.position.set(x, y, z);
    this.rooms[0].add(plaqueGroup);
}

// ========================================
// FOSSIL EXHIBITS (display cases)
// ========================================

createFossilExhibits() {
    const fossilTypes = [
        { name: 'Ammonite', type: 'spiral' },
        { name: 'Trilobite', type: 'segmented' },
        { name: 'Fern Fossil', type: 'plant' },
        { name: 'Dinosaur Egg', type: 'egg' },
        { name: 'Footprint', type: 'track' },
        { name: 'Amber', type: 'amber' }
    ];
    
    const exhibitPositions = [
        { x: -15, z: 5 }, { x: 15, z: 5 },
        { x: -15, z: 20 }, { x: 15, z: 20 },
        { x: -15, z: -25 }, { x: 15, z: -25 }
    ];
    
    exhibitPositions.forEach((pos, index) => {
        const fossil = fossilTypes[index];
        this.createFossilCase(fossil, pos.x, pos.z);
    });
}

createFossilCase(fossil, x, z) {
    const caseGroup = new THREE.Group();
    
    // Glass display case
    const glassCase = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2.5, 2),
        new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.9,
            thickness: 0.5
        })
    );
    glassCase.position.y = 1.25;
    glassCase.castShadow = true;
    glassCase.receiveShadow = true;
    caseGroup.add(glassCase);
    
    // Wooden base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.3, 2.2),
        new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8,
            metalness: 0.1
        })
    );
    base.position.y = 0.15;
    caseGroup.add(base);
    
    // Pedestal inside
    const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.7, 0.8, 8),
        new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.6
        })
    );
    pedestal.position.y = 0.7;
    caseGroup.add(pedestal);
    
    // Create specific fossil
    const fossilMesh = this.createFossilMesh(fossil.type);
    fossilMesh.position.y = 1.1;
    caseGroup.add(fossilMesh);
    
    // Spotlight on fossil
    const spotLight = new THREE.SpotLight(0xffffcc, 1.5, 5, Math.PI / 6, 0.5);
    spotLight.position.set(x, 3, z);
    spotLight.target.position.set(x, 1.1, z);
    spotLight.castShadow = true;
    this.rooms[0].add(spotLight);
    this.rooms[0].add(spotLight.target);
    
    // Label
    const label = this.createFossilLabel(fossil.name);
    label.position.set(0, 0.05, -1.2);
    caseGroup.add(label);
    
    caseGroup.position.set(x, 0, z);
    this.rooms[0].add(caseGroup);
    this.fossilExhibits.push(caseGroup);
    
    
}

createFossilMesh(type) {
    const fossilMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a5a4a,
        roughness: 0.9,
        metalness: 0.1
    });
    
    switch (type) {
        case 'spiral': // Ammonite
            const ammonite = new THREE.Group();
            const shell = new THREE.Mesh(
                new THREE.TorusGeometry(0.4, 0.15, 16, 32),
                fossilMaterial
            );
            shell.rotation.x = Math.PI / 2;
            ammonite.add(shell);
            
            // Spiral chambers
            for (let i = 0; i < 5; i++) {
                const chamber = new THREE.Mesh(
                    new THREE.TorusGeometry(0.4 - i * 0.06, 0.08, 8, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0x8a7a6a,
                        roughness: 0.85
                    })
                );
                chamber.rotation.x = Math.PI / 2;
                chamber.position.y = i * 0.02;
                ammonite.add(chamber);
            }
            return ammonite;
            
        case 'segmented': // Trilobite
            const trilobite = new THREE.Group();
            // Body segments
            for (let i = 0; i < 7; i++) {
                const segment = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3 - i * 0.03, 16, 8),
                    fossilMaterial
                );
                segment.scale.set(1, 0.3, 0.8);
                segment.position.z = i * 0.15;
                trilobite.add(segment);
            }
            // Legs (simple)
            for (let i = 0; i < 6; i++) {
                [-1, 1].forEach(side => {
                    const leg = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.05, 0.05),
                        fossilMaterial
                    );
                    leg.position.set(side * 0.2, -0.05, i * 0.15);
                    leg.rotation.y = side * 0.5;
                    trilobite.add(leg);
                });
            }
            trilobite.rotation.x = Math.PI / 2;
            return trilobite;
            
        case 'plant': // Fern
            const fern = new THREE.Group();
            const rock = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.3, 0.6),
                new THREE.MeshStandardMaterial({
                    color: 0x5a4a3a,
                    roughness: 0.95
                })
            );
            fern.add(rock);
            
            // Fern impression
            for (let i = 0; i < 8; i++) {
                const frond = new THREE.Mesh(
                    new THREE.BoxGeometry(0.02, 0.4, 0.1),
                    new THREE.MeshStandardMaterial({
                        color: 0x3a2a1a,
                        roughness: 1.0
                    })
                );
                frond.position.set(0.1, 0.16, -0.2 + i * 0.06);
                frond.rotation.z = Math.PI / 6;
                fern.add(frond);
            }
            return fern;
            
        case 'egg': // Dinosaur egg
            const egg = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 16, 16),
                fossilMaterial
            );
            egg.scale.set(1, 1.3, 1);
            
            // Crack texture
            for (let i = 0; i < 5; i++) {
                const crack = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.02, 0.3),
                    new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
                );
                crack.position.set(
                    Math.cos(i * 1.2) * 0.36,
                    Math.sin(i * 1.2) * 0.36,
                    0
                );
                crack.rotation.z = i * 1.2;
                egg.add(crack);
            }
            return egg;
            
        case 'track': // Footprint
            const track = new THREE.Group();
            const stone = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.2, 0.9),
                new THREE.MeshStandardMaterial({
                    color: 0x7a6a5a,
                    roughness: 0.9
                })
            );
            track.add(stone);
            
            // Three-toed print
            for (let i = 0; i < 3; i++) {
                const angle = (i - 1) * 0.6;
                const toe = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.21, 0.4),
                    new THREE.MeshStandardMaterial({
                        color: 0x4a3a2a,
                        roughness: 1.0
                    })
                );
                toe.position.set(
                    Math.sin(angle) * 0.2,
                    0,
                    Math.cos(angle) * 0.2
                );
                toe.rotation.y = angle;
                track.add(toe);
            }
            return track;
            
        case 'amber': // Amber with insect
            const amber = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 16, 16),
                new THREE.MeshPhysicalMaterial({
                    color: 0xffaa44,
                    transparent: true,
                    opacity: 0.8,
                    roughness: 0.2,
                    metalness: 0.1,
                    transmission: 0.5
                })
            );
            
            // Insect inside (simple)
            const insect = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.04, 0.15),
                new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
            );
            insect.position.set(0.05, 0, 0.05);
            amber.add(insect);
            
            return amber;
    }
}

createFossilLabel(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f5f5e8';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#2a2a2a';
    ctx.font = 'bold 28px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.2),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    label.rotation.x = -Math.PI / 2;
    
    return label;
}

// ========================================
// PTERODACTYL (flying overhead)
// ========================================

createPterodactyl() {
    const pteroGroup = new THREE.Group();
    
    const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e0d0,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // Body (lightweight)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.8),
        boneMaterial
    );
    body.castShadow = true;
    pteroGroup.add(body);
    
    // Head with crest
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.25, 0.5),
        boneMaterial
    );
    head.position.set(0, 0.1, -0.5);
    pteroGroup.add(head);
    
    // Beak
    const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.4, 4),
        boneMaterial
    );
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, 0.1, -0.9);
    pteroGroup.add(beak);
    
    // Head crest
    const crest = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.5, 0.3),
        boneMaterial
    );
    crest.position.set(0, 0.4, -0.5);
    crest.rotation.x = -0.3;
    pteroGroup.add(crest);
    
    // Wings (large membrane wings)
    [-1, 1].forEach(side => {
        // Wing arm bones
        const humerus = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.05, 1, 6),
            boneMaterial
        );
        humerus.rotation.z = side * Math.PI / 3;
        humerus.position.set(side * 0.5, 0, 0);
        pteroGroup.add(humerus);
        
        const radius = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.04, 1.5, 6),
            boneMaterial
        );
        radius.rotation.z = side * Math.PI / 4;
        radius.position.set(side * 1.3, -0.2, 0);
        pteroGroup.add(radius);
        
        // Wing finger (elongated 4th finger)
        const wingFinger = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.03, 2, 6),
            boneMaterial
        );
        wingFinger.rotation.z = side * Math.PI / 6;
        wingFinger.position.set(side * 2.3, -0.5, 0);
        pteroGroup.add(wingFinger);
        
        // Wing membrane
        const wingGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            side * 0.2, 0, 0,
            side * 3.3, -0.7, 0,
            side * 3.3, -0.7, 0.5,
            side * 0.2, 0, 0.3
        ]);
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        
        wingGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        wingGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
        wingGeometry.computeVertexNormals();
        
        const membrane = new THREE.Mesh(
            wingGeometry,
            new THREE.MeshStandardMaterial({
                color: 0xc8b8a0,
                roughness: 0.9,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            })
        );
        pteroGroup.add(membrane);
    });
    
    // Legs (small)
    [-0.15, 0.15].forEach(x => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.02, 0.5, 6),
            boneMaterial
        );
        leg.position.set(x, -0.3, 0.2);
        pteroGroup.add(leg);
    });
    
    // Tail
    const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.6, 6),
        boneMaterial
    );
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0, 0.7);
    pteroGroup.add(tail);
    
    // Start position (high up)
    pteroGroup.position.set(-20, 15, -30);
    pteroGroup.rotation.y = Math.PI / 4;
    
    this.pterodactyl = {
        model: pteroGroup,
        flightPath: 0,
        wingFlap: 0,
        speed: 0.3
    };
    
    this.rooms[0].add(pteroGroup);
}

// ========================================
// INTERACTIVE DIORAMAS (3D display boxes)
// ========================================

createDioramas() {
    const dioramaScenes = [
        { name: 'Triassic Desert', x: -20, z: -5 },
        { name: 'Jurassic Forest', x: 20, z: -5 },
        { name: 'Cretaceous Swamp', x: -20, z: 25 },
        { name: 'Ice Age Tundra', x: 20, z: 25 }
    ];
    
    dioramaScenes.forEach(scene => {
        this.createDiorama(scene.name, scene.x, scene.z);
    });
}

createDiorama(sceneName, x, z) {
    const dioramaGroup = new THREE.Group();
    
    // Glass box (museum display)
    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 3),
        new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.95,
            thickness: 0.5
        })
    );
    glass.position.y = 1.8;
    glass.castShadow = true;
    dioramaGroup.add(glass);
    
    // Wooden base/frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.4, 3.2),
        new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        })
    );
    frame.position.y = 0.2;
    dioramaGroup.add(frame);
    
    // Scene interior
    const interior = this.createDioramaScene(sceneName);
    interior.position.y = 0.5;
    interior.scale.set(0.9, 0.9, 0.9);
    dioramaGroup.add(interior);
    
    // Overhead light
    const dioLight = new THREE.PointLight(0xffffcc, 1.5, 6);
    dioLight.position.y = 3.3;
    dioramaGroup.add(dioLight);
    
    // Title plaque
    const title = this.createDioramaTitle(sceneName);
    title.position.set(0, 0.1, 1.7);
    dioramaGroup.add(title);
    
    // Interactive indicator (glowing button)
    const button = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8
        })
    );
    button.position.set(1.8, 0.6, 1.5);
    dioramaGroup.add(button);
    
    dioramaGroup.position.set(x, 0, z);
    this.rooms[0].add(dioramaGroup);
    
    this.dioramas.push({
        model: dioramaGroup,
        name: sceneName,
        light: dioLight,
        button: button,
        active: false
    });
}

createDioramaScene(sceneName) {
    const scene = new THREE.Group();
    
    switch (sceneName) {
        case 'Triassic Desert':
            // Sandy ground
            const sand = new THREE.Mesh(
                new THREE.PlaneGeometry(3.5, 2.5),
                new THREE.MeshStandardMaterial({
                    color: 0xd4a574,
                    roughness: 0.95
                })
            );
            sand.rotation.x = -Math.PI / 2;
            scene.add(sand);
            
            // Rocks
            for (let i = 0; i < 5; i++) {
                const rock = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.2),
                    new THREE.MeshStandardMaterial({
                        color: 0x8a6a4a,
                        roughness: 0.9
                    })
                );
                rock.position.set(
                    (Math.random() - 0.5) * 3,
                    0.15,
                    (Math.random() - 0.5) * 2
                );
                scene.add(rock);
            }
            
            // Primitive plants
            for (let i = 0; i < 3; i++) {
                const plant = new THREE.Mesh(
                    new THREE.ConeGeometry(0.15, 0.5, 6),
                    new THREE.MeshStandardMaterial({ color: 0x4a6a3a })
                );
                plant.position.set(
                    (Math.random() - 0.5) * 2.5,
                    0.25,
                    (Math.random() - 0.5) * 1.8
                );
                scene.add(plant);
            }
            break;
            
        case 'Jurassic Forest':
            // Ground
            const grass = new THREE.Mesh(
                new THREE.PlaneGeometry(3.5, 2.5),
                new THREE.MeshStandardMaterial({
                    color: 0x3a5a2a,
                    roughness: 0.95
                })
            );
            grass.rotation.x = -Math.PI / 2;
            scene.add(grass);
            
            // Trees (cycads)
            for (let i = 0; i < 4; i++) {
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8),
                    new THREE.MeshStandardMaterial({ color: 0x5a4a3a })
                );
                trunk.position.set(
                    (Math.random() - 0.5) * 2.5,
                    0.4,
                    (Math.random() - 0.5) * 1.8
                );
                scene.add(trunk);
                
                // Fronds
                for (let j = 0; j < 6; j++) {
                    const angle = (j / 6) * Math.PI * 2;
                    const frond = new THREE.Mesh(
                        new THREE.BoxGeometry(0.05, 0.4, 0.15),
                        new THREE.MeshStandardMaterial({ color: 0x2a4a1a })
                    );
                    frond.position.set(
                        trunk.position.x + Math.cos(angle) * 0.2,
                        trunk.position.y + 0.4,
                        trunk.position.z + Math.sin(angle) * 0.2
                    );
                    frond.rotation.set(Math.PI / 3, angle, 0);
                    scene.add(frond);
                }
            }
            
            // Ferns
            for (let i = 0; i < 6; i++) {
                const fern = new THREE.Mesh(
                    new THREE.ConeGeometry(0.1, 0.3, 8),
                    new THREE.MeshStandardMaterial({ color: 0x3a5a2a })
                );
                fern.position.set(
                    (Math.random() - 0.5) * 3,
                    0.15,
                    (Math.random() - 0.5) * 2
                );
                scene.add(fern);
            }
            break;
            
        case 'Cretaceous Swamp':
            // Water
            const water = new THREE.Mesh(
                new THREE.PlaneGeometry(3.5, 2.5),
                new THREE.MeshStandardMaterial({
                    color: 0x2a4a5a,
                    roughness: 0.2,
                    metalness: 0.8
                })
            );
            water.rotation.x = -Math.PI / 2;
            scene.add(water);
            
            // Vegetation
            for (let i = 0; i < 8; i++) {
                const reed = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.03, 0.6, 6),
                    new THREE.MeshStandardMaterial({ color: 0x4a6a3a })
                );
                reed.position.set(
                    (Math.random() - 0.5) * 3,
                    0.3,
                    (Math.random() - 0.5) * 2
                );
                scene.add(reed);
            }
            
            // Lily pads
            for (let i = 0; i < 5; i++) {
                const lily = new THREE.Mesh(
                    new THREE.CircleGeometry(0.2, 8),
                    new THREE.MeshStandardMaterial({ color: 0x3a5a2a })
                );
                lily.rotation.x = -Math.PI / 2;
                lily.position.set(
                    (Math.random() - 0.5) * 2.5,
                    0.02,
                    (Math.random() - 0.5) * 1.8
                );
                scene.add(lily);
            }
            break;
            
        case 'Ice Age Tundra':
            // Snow
            const snow = new THREE.Mesh(
                new THREE.PlaneGeometry(3.5, 2.5),
                new THREE.MeshStandardMaterial({
                    color: 0xf5f5ff,
                    roughness: 0.9
                })
            );
            snow.rotation.x = -Math.PI / 2;
            scene.add(snow);
            
            // Ice chunks
            for (let i = 0; i < 4; i++) {
                const ice = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.2),
                    new THREE.MeshPhysicalMaterial({
                        color: 0xccddff,
                        transparent: true,
                        opacity: 0.7,
                        roughness: 0.1,
                        metalness: 0.1,
                        transmission: 0.8
                    })
                );
                ice.position.set(
                    (Math.random() - 0.5) * 3,
                    0.2,
                    (Math.random() - 0.5) * 2
                );
                scene.add(ice);
            }
            
            // Sparse vegetation
            for (let i = 0; i < 3; i++) {
                const shrub = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 8, 8),
                    new THREE.MeshStandardMaterial({ color: 0x5a6a5a })
                );
                shrub.position.set(
                    (Math.random() - 0.5) * 2,
                    0.1,
                    (Math.random() - 0.5) * 1.5
                );
                scene.add(shrub);
            }
            break;
    }
    
    return scene;
}

createDioramaTitle(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 75);
    
    const texture = new THREE.CanvasTexture(canvas);
    const title = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.5),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    title.rotation.x = -Math.PI / 2;
    
    return title;
}

// ========================================
// SKYLIGHTS (day/night cycle)
// ========================================

createSkylights() {
    const skylightPositions = [
        { x: 0, z: -20 },
        { x: 0, z: 0 },
        { x: 0, z: 20 }
    ];
    
    skylightPositions.forEach(pos => {
        // Skylight frame (in ceiling)
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.3, 6),
            this.goldMaterial
        );
        frame.position.set(pos.x, 19.85, pos.z);
        this.rooms[0].add(frame);
        
        // Glass pane
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(5.8, 5.8),
            new THREE.MeshPhysicalMaterial({
                color: 0xaaccff,
                transparent: true,
                opacity: 0.3,
                roughness: 0.1,
                metalness: 0.1,
                transmission: 0.9
            })
        );
        glass.rotation.x = -Math.PI / 2;
        glass.position.set(pos.x, 19.9, pos.z);
        this.rooms[0].add(glass);
        
        // Sunlight shaft (day only)
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(2.5, 2.5, 20, 32, 1, true),
            new THREE.MeshBasicMaterial({
                color: 0xffffee,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            })
        );
        shaft.position.set(pos.x, 10, pos.z);
        this.rooms[0].add(shaft);
        
        this.skylights.push({ glass, shaft });
    });
}

// ========================================
// MUSEUM UI
// ========================================

createMuseumUI() {
    const museumUI = document.createElement('div');
    museumUI.id = 'museumUI';
    museumUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(245, 245, 232, 0.95) 0%, rgba(212, 175, 55, 0.95) 100%);
        color: #2a2a2a;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: Georgia, serif;
        font-size: 16px;
        z-index: 100;
        border: 3px solid #d4af37;
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.4), 
                    inset 0 0 20px rgba(255, 255, 255, 0.3);
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        font-weight: bold;
    `;
    
    museumUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">🦕</span>
            <div>
                <div style="font-size: 20px; letter-spacing: 2px;">
                    MUSEUM OF NATURAL HISTORY
                </div>
                <div style="font-size: 11px; opacity: 0.9; font-style: italic; letter-spacing: 1px;">
                    <span id="timeOfDay">Daytime</span> • Classical Wing
                </div>
            </div>
            <span style="font-size: 28px;">☀️</span>
        </div>
    `;
    
    document.body.appendChild(museumUI);
}

// ========================================
// MUSEUM ANIMATIONS
// ========================================

updateMuseumAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. DAY/NIGHT CYCLE (slow transition)
    this.museumLighting.timeOfDay += 0.0001;
    if (this.museumLighting.timeOfDay > 1) this.museumLighting.timeOfDay = 0;
    
    const isDay = this.museumLighting.timeOfDay < 0.5;
    
    // Update lighting based on time
    if (isDay) {
        this.museumMainLight.intensity = 1.2;
        this.museumMainLight.color.setHex(0xffffee);
        this.skylights.forEach(skylight => {
            skylight.glass.material.color.setHex(0xaaccff);
            skylight.shaft.material.opacity = 0.1;
        });
    } else {
        this.museumMainLight.intensity = 0.4;
        this.museumMainLight.color.setHex(0x4444aa);
        this.skylights.forEach(skylight => {
            skylight.glass.material.color.setHex(0x1a1a3a);
            skylight.shaft.material.opacity = 0.02;
        });
    }
    
    // Update UI
    const timeUI = document.getElementById('timeOfDay');
    if (timeUI) {
        timeUI.textContent = isDay ? 'Daytime ☀️' : 'Nighttime 🌙';
    }
    
    // 2. PTERODACTYL FLIGHT
    if (this.pterodactyl) {
        this.pterodactyl.flightPath += 0.002 * this.pterodactyl.speed;
        
        // Circular flight path
        const radius = 25;
        const height = 15;
        const x = Math.cos(this.pterodactyl.flightPath) * radius;
        const z = Math.sin(this.pterodactyl.flightPath) * radius;
        const y = height + Math.sin(this.pterodactyl.flightPath * 3) * 2;
        
        this.pterodactyl.model.position.set(x, y, z);
        this.pterodactyl.model.rotation.y = this.pterodactyl.flightPath + Math.PI / 2;
        
        // Wing flapping
        this.pterodactyl.wingFlap = Math.sin(time * 5) * 0.3;
        this.pterodactyl.model.rotation.z = this.pterodactyl.wingFlap;
    }
    
    // 3. DIORAMA INTERACTIONS (pulsing buttons)
    this.dioramas.forEach((diorama, index) => {
        const pulse = 0.5 + Math.sin(time * 2 + index) * 0.5;
        diorama.button.material.emissiveIntensity = pulse;
        
        // Light intensity variation
        diorama.light.intensity = 1.5 + Math.sin(time + index) * 0.3;
    });
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Museum bounds
        const minX = -24;
        const maxX = 24;
        const minZ = -39;
        const maxZ = 39;
        
        this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    // Spawn at museum entrance
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: -35
    };
}



    async setupAudio() {
            try {
                const backgroundBuffer = await this.loadAudio('/sweet.mp3');
                this.backgroundAudio.setBuffer(backgroundBuffer);
                this.backgroundAudio.setLoop(true);
                this.backgroundAudio.setVolume(0.2);
                this.backgroundAudio.play();
    
                const clickBuffer = await this.loadAudio('/sweet.mp3');
                this.clickSound.setBuffer(clickBuffer);
                this.clickSound.setVolume(0.5);
            } catch (error) {
                console.error("Error loading audio:", error);
            }
        }
    
        loadAudio(url) {
            return new Promise((resolve, reject) => {
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load(
                    url,
                    (audioBuffer) => resolve(audioBuffer),
                    undefined,
                    (err) => reject(err)
                );
            });
        }

   
   async init() {
           console.log("🚀 Virtual Gallery loading...");
           if (this.sessionId) {
               await this.loadImages(this.sessionId);
               // Check if images were loaded successfully
               if (!this.imagesToLoad || this.imagesToLoad.length === 0) {
                   console.warn("No images loaded for session, using fallback images");
                   this.useFallbackImages();
                   await this.displayImagesInGallery();
               }
           } else {
               console.log("No sessionId, using fallback images");
               this.useFallbackImages();
               await this.displayImagesInGallery();
           }
           await this.setupAudio(); // Ensure audio is loaded
           this.animate();
           window.addEventListener("resize", () => this.handleResize());
           this.hidePreloader();
           console.log("🚀 Virtual Gallery loaded");
       }

animate() {
    requestAnimationFrame(() => this.animate());
    const delta = 0.016;
    this.time += delta;
    this.update();
    this.updateImageEffects();
    this.updateLighting();
   
    
    this.updateMuseumAnimations();      // ✓ ADD THIS LINE
   
    this.renderer.render(this.scene, this.camera);
    this.updateArtworkProgress();
    if (this.isMobile) this.controls.update();
    
    this.animationMixer.update(delta * this.animationSpeed);
    this.updateObjectAnimations();
}
showArtworkInfo(index) {
    const metadata = this.metadata[index];
    if (!metadata) return;
    
    // Remove existing info
    const existing = document.getElementById('artworkInfo');
    if (existing) existing.remove();
    
    const info = document.createElement('div');
    info.id = 'artworkInfo';
    info.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 350px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        animation: slideInLeft 0.3s ease;
    `;
    
    info.innerHTML = `
        <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #4CAF50;">${metadata.title}</h3>
        <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">
            <strong>Artist:</strong> ${metadata.artist}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 1.5; opacity: 0.8;">
            ${metadata.description}
        </p>
        <button id="closeArtworkInfo" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: #4CAF50;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        ">Close</button>
        <style>
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(info);
    
    document.getElementById('closeArtworkInfo').addEventListener('click', () => info.remove());
    
    // Auto-remove after 12 seconds
    setTimeout(() => {
        if (info.parentNode) {
            info.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => info.remove(), 500);
        }
    }, 12000);
}

toggleHelpOverlay() {
    let help = document.getElementById('keyboardHelp');
    
    if (help) {
        help.remove();
        return;
    }
    
    help = document.createElement('div');
    help.id = 'keyboardHelp';
    help.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        color: white;
        padding: 30px 40px;
        border-radius: 15px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        max-width: 550px;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        animation: scaleIn 0.3s ease;
    `;
    
const shortcuts = this.isMobile ? `
    <h2 style="margin: 0 0 25px 0; text-align: center; font-size: 28px; color: #4CAF50;">📱 Mobile Controls</h2>
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 15px 25px; font-size: 15px;">
        <strong>👆 Swipe</strong><span>Look around</span>
        <strong>🤏 Pinch</strong><span>Zoom in/out</span>
        <strong>👆 Tap</strong><span>Focus artwork</span>
        <strong>👆👆 Double-tap</strong><span>Open slider</span>
        <strong>🕹️ Joystick</strong><span>Move (bottom-left)</span>
    </div>
` : `
    <h2 style="margin: 0 0 25px 0; text-align: center; font-size: 28px; color: #4CAF50;">⌨️ Keyboard Shortcuts</h2>
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 15px 25px; font-size: 15px;">
        <strong>W A S D</strong><span>Move around</span>
        <strong>Q / E</strong><span>Rotate left/right</span>
        <strong>[ / ]</strong><span>Lower/Raise camera</span>
        <strong>PgUp / PgDn</strong><span>Adjust height</span>
        <strong>1-9</strong><span>Jump to artwork</span>
        <strong>← →</strong><span>Prev/Next artwork</span>
        <strong>Mouse</strong><span>Look around</span>
        <strong>ESC</strong><span>Unlock/Exit</span>
        <strong>?</strong><span>Toggle help</span>
        <strong>Double-click</strong><span>Focus artwork</span>
    </div>
`;
    
    help.innerHTML = `
        ${shortcuts}
        <button id="closeHelp" style="
            width: 100%;
            margin-top: 25px;
            padding: 12px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            border: none;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            font-weight: bold;
        ">Close (ESC or ?)</button>
        <style>
            @keyframes scaleIn {
                from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        </style>
    `;
    
    document.body.appendChild(help);
    document.getElementById('closeHelp').addEventListener('click', () => help.remove());
}
    async startRecording() {
        if (this.isRecording) return;
    
        try {
            // Step 1: Request screen capture
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: 'monitor' }, // Prefer entire screen
                audio: false
            });
    
            // Step 2: Show a confirmation dialog to enter full-screen mode
            const enterFullscreen = new Promise((resolve, reject) => {
                const dialog = document.createElement('div');
                dialog.id = 'fullscreenDialog';
                dialog.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 5px;
                    z-index: 1001;
                    text-align: center;
                `;
                dialog.innerHTML = `
                    <p>Click to enter full-screen mode for recording.</p>
                    <button id="confirmFullscreen" class="glow-btn">Enter Full-Screen</button>
                    <button id="skipFullscreen" class="glow-btn">Skip</button>
                `;
                document.body.appendChild(dialog);
    
                const confirmBtn = document.getElementById('confirmFullscreen');
                const skipBtn = document.getElementById('skipFullscreen');
    
                confirmBtn.addEventListener('click', async () => {
                    try {
                        await document.documentElement.requestFullscreen();
                        console.log("🖥️ Entered full-screen mode");
                        document.body.removeChild(dialog);
                        resolve();
                    } catch (error) {
                        console.warn("Failed to enter full-screen mode:", error);
                        this.showMessage('recordStatus', 'Full-screen mode not supported; recording may include browser UI', 'warning');
                        document.body.removeChild(dialog);
                        resolve(); // Proceed with recording
                    }
                });
    
                skipBtn.addEventListener('click', () => {
                    this.showMessage('recordStatus', 'Recording without full-screen; browser UI may be included', 'warning');
                    document.body.removeChild(dialog);
                    resolve();
                });
            });
    
            // Wait for the user to confirm or skip full-screen
            await enterFullscreen;
    
            // Step 3: Set up recording
            this.isRecording = true;
            this.recordedFrames = [];
            this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedFrames.push(event.data);
                }
            };
    
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
                stream.getTracks().forEach(track => track.stop());
                // Exit full-screen mode if active
                if (document.fullscreenElement) {
                    document.exitFullscreen().then(() => {
                        console.log("🖥️ Exited full-screen mode");
                    }).catch(err => {
                        console.warn("Failed to exit full-screen mode:", err);
                    });
                }
            };
    
            this.mediaRecorder.start();
            document.getElementById('recordStatus').classList.remove('hidden');
            this.showMessage('recordStatus', 'Recording started', 'success');
            console.log("🎥 Screen recording started");
        } catch (error) {
            console.error("Error starting recording:", error);
            this.isRecording = false;
            document.getElementById('recordStatus').classList.add('hidden');
            this.showMessage('recordStatus', 'Failed to start recording', 'error');
        }
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
    
        this.isRecording = false;
        this.mediaRecorder.stop();
        document.getElementById('recordStatus').classList.add('hidden');
        document.getElementById('recordBtn').textContent = 'Record';
        this.showMessage('recordStatus', 'Recording stopped', 'success');
        console.log("🎥 Recording stopped");
    }


    saveRecording() {
        const blob = new Blob(this.recordedFrames, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gallery_recording_${new Date().toISOString()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        this.recordedFrames = [];
    }

    toggleAutoRotate() {
        this.isAutoRotating = !this.isAutoRotating;
        const rotateBtn = document.getElementById('autoRotateBtn');
        rotateBtn.textContent = this.isAutoRotating ? 'Stop Rotation' : 'Auto Rotate';
        console.log(this.isAutoRotating ? "🔄 Auto-rotation enabled" : "🔄 Auto-rotation disabled");
    }

    toggleObjectAnimation() {
        this.isAnimatingObjects = !this.isAnimatingObjects;
        const animateBtn = document.getElementById('animateObjectsBtn');
        animateBtn.textContent = this.isAnimatingObjects ? 'Stop Animating' : 'Animate Objects';
        console.log(this.isAnimatingObjects ? "🎬 Object animation enabled" : "🎬 Object animation disabled");
    }

    updateAutoRotate() {
        if (this.isAutoRotating && !this.isFocused) {
            if (this.isMobile) {
                this.controls.azimuthAngle += THREE.MathUtils.degToRad(this.autoRotateSpeed);
                this.controls.update();
            } else if (this.isLocked) {
                const euler = new THREE.Euler(0, 0, 0, "YXZ");
                euler.setFromQuaternion(this.camera.quaternion);
                euler.y -= THREE.MathUtils.degToRad(this.autoRotateSpeed);
                this.camera.quaternion.setFromEuler(euler);
            }
        }
    }

    updateObjectAnimations() {
            const time = this.time || Date.now() * 0.001;
        if (this.isAnimatingObjects) {
            this.images.forEach(img => {
                img.mesh.rotation.y += 0.02 * this.animationSpeed;
            });
           
        }
        if (this.turbine) {
        this.turbine.rotation.z += this.turbine.userData.rotationSpeed;
    }
    
    // 2. CENTER SCULPTURE ROTATION
    if (this.centerSculpture) {
        this.centerSculpture.rotation.y += this.centerSculpture.userData.rotationSpeed;
    }
    
    // 3. SUSPENDED ARTWORKS (rotate + sway)
    if (this.suspendedArtworks) {
        this.suspendedArtworks.forEach((artwork, index) => {
            // Slow rotation
            artwork.rotation.y += artwork.userData.rotationSpeed;
            
            // Swaying motion (like hanging on cables)
            const sway = Math.sin(time * 0.5 + index) * artwork.userData.swayAmount;
            artwork.rotation.z = sway;
        });
    }
    
    // 4. EDISON BULBS (subtle swaying + flicker)
    if (this.edisonBulbs) {
        this.edisonBulbs.forEach((bulb, index) => {
            // Gentle sway
            const baseY = bulb.bulb.position.y;
            bulb.bulb.position.y = baseY + Math.sin(time * 0.3 + index * 0.5) * 0.02;
            bulb.light.position.copy(bulb.bulb.position);
            
            // Random flicker
            if (Math.random() < 0.01) {
                const flicker = 0.8 + Math.random() * 0.4;
                bulb.light.intensity = 1.5 * flicker;
                bulb.bulb.material.emissiveIntensity = 1.2 * flicker;
            } else {
                bulb.light.intensity += (1.5 - bulb.light.intensity) * 0.1;
                bulb.bulb.material.emissiveIntensity += (1.2 - bulb.bulb.material.emissiveIntensity) * 0.1;
            }
        });
    }
    
    // 5. TRACK SPOTLIGHTS (subtle movement + flicker)
    if (this.trackSpotlights) {
        this.trackSpotlights.forEach((light, index) => {
            // Subtle rotation (like wind or vibration)
            light.group.rotation.x += Math.sin(time * 0.2 + index) * 0.0001;
            light.group.rotation.z += Math.cos(time * 0.3 + index) * 0.0001;
            
            // Occasional flicker/spark
            if (Math.random() < 0.005) {
                light.spotlight.intensity = 5.0 + Math.random() * 2.0;
                light.lens.material.emissiveIntensity = 1.5;
            } else {
                light.spotlight.intensity += (3.5 - light.spotlight.intensity) * 0.05;
                light.lens.material.emissiveIntensity += (0.8 - light.lens.material.emissiveIntensity) * 0.05;
            }
        });
    }
    
    // 6. OFFICE FLUORESCENT FLICKER
    if (this.officeFlicker && Math.random() < 0.02) {
        this.officeFlicker.intensity = Math.random() < 0.5 ? 0.5 : 2.0;
        setTimeout(() => {
            if (this.officeFlicker) this.officeFlicker.intensity = 2.0;
        }, 50 + Math.random() * 100);
    }
    
    // 7. STEAM VENTS (periodic puffs)
    if (this.steamVents) {
        this.steamVents.forEach(vent => {
            const currentTime = Date.now();
            if (currentTime - vent.lastPuff > vent.interval) {
                this.createSteamPuff(vent.position);
                vent.lastPuff = currentTime;
                vent.interval = 3000 + Math.random() * 5000;
            }
        });
    }
    
  
    
    // 9. CATWALK RATTLING (if player nearby)
    if (this.catwalks && this.camera) {
        this.catwalks.forEach(catwalk => {
            const distance = this.camera.position.distanceTo(catwalk.position);
            if (distance < 5) {
                // Shake when player is nearby
                catwalk.position.y += Math.sin(time * 10) * 0.002;
            }
        });
    }
    
    // 10. FREIGHT ELEVATOR ANIMATION (if moving)
    if (this.freightElevator && this.freightElevator.userData.isMoving) {
        const elevator = this.freightElevator;
        const targetY = elevator.userData.targetY || 0;
        const currentY = elevator.position.y;
        const speed = 0.05;
        
        if (Math.abs(targetY - currentY) > 0.1) {
            // Move elevator
            elevator.position.y += (targetY - currentY) * speed;
            
            // Warning lights flash
            elevator.traverse(child => {
                if (child.material && child.material.emissive && child.material.emissive.getHex() === 0xff0000) {
                    child.material.emissiveIntensity = 1.5 + Math.sin(time * 10) * 0.5;
                }
            });
            
            // Mechanical sound effect (visual cue)
            if (Math.floor(time * 10) % 2 === 0) {
                elevator.rotation.z = 0.002;
            } else {
                elevator.rotation.z = -0.002;
            }
        } else {
            // Arrived at destination
            elevator.position.y = targetY;
            elevator.userData.isMoving = false;
            elevator.rotation.z = 0;
            
            // Turn off warning lights
            elevator.traverse(child => {
                if (child.material && child.material.emissive && child.material.emissive.getHex() === 0xff0000) {
                    child.material.emissiveIntensity = 1.5;
                }
            });
            
            console.log("🛗 Elevator arrived at level", elevator.userData.currentLevel);
        }
    }
    }

    createSteamPuff(position) {
    const steamGroup = new THREE.Group();
    
    // Create multiple steam particles
    for (let i = 0; i < 10; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6
            })
        );
        
        particle.position.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        steamGroup.add(particle);
    }
    
    steamGroup.position.copy(position);
    this.scene.add(steamGroup);
    
    // Animate steam rising and dissipating
    const startTime = Date.now();
    const duration = 2000;
    
    const animateSteam = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            this.scene.remove(steamGroup);
            steamGroup.children.forEach(child => {
                child.geometry.dispose();
                child.material.dispose();
            });
            return;
        }
        
        // Rise and expand
        steamGroup.position.y += 0.03;
        steamGroup.scale.setScalar(1 + progress * 2);
        
        // Fade out
        steamGroup.children.forEach(child => {
            child.material.opacity = 0.6 * (1 - progress);
        });
        
        requestAnimationFrame(animateSteam);
    };
    
    animateSteam();
}

updateLighting() {
    const time = this.time || 0;
    
    // Dynamic track spotlights
    this.glassSpotlights.forEach((light, index) => {
        const distance = this.camera.position.distanceTo(light.position);
        const baseIntensity = Math.max(2.5, Math.min(4.5, 6 - distance / 4));
        
        // Subtle flicker
        const flicker = Math.sin(time * 4 + index * 1.2) * 0.2;
        light.spot.intensity = baseIntensity + flicker;
        
        // Pulsing lens glow
        if (light.lens) {
            light.lens.material.emissiveIntensity = 0.8 + Math.sin(time * 2 + index) * 0.3;
        }
        
        // Warm up when close
        const proximity = Math.max(0, 1 - distance / 20);
        light.spot.color.setRGB(1.0, 0.96 + proximity * 0.04, 0.90 + proximity * 0.05);
    });
    
    // Update artwork shaders
    this.images.forEach((img, index) => {
        if (img.mesh.material.uniforms) {
            img.mesh.material.uniforms.time.value = time + index;
        }
    });
}



    updateImageEffects() {
        this.images.forEach((img, index) => {
            if (img.mesh.material.uniforms) {
                img.mesh.material.uniforms.time.value = this.time + index;
                const spotlight = img.mesh.parent.children.find(child => child instanceof THREE.SpotLight && child.target === img.mesh);
                if (spotlight) {
                    spotlight.intensity = 2.0 + Math.sin(this.time * 2 + index) * 0.2;
                }
            }
        });
    }

    setupEventListeners() {
        // Create tutorial overlay
        const tutorial = document.createElement("div");
        tutorial.id = "tutorialOverlay";
        tutorial.innerHTML = `
            Welcome to your 3D Gallery!<br>
            Click anywhere to start exploring!
        `;
        tutorial.dataset.step = "start";
        tutorial.style.display = 'block'; // Ensure visible
        document.body.appendChild(tutorial);
        console.log("Tutorial overlay created, display:", tutorial.style.display);
    
        // Ensure canvas is focusable but not obscuring UI
        this.renderer.domElement.setAttribute('tabindex', '0');
        this.renderer.domElement.style.outline = 'none';
        this.renderer.domElement.style.position = 'relative';
        this.renderer.domElement.style.zIndex = '1'; // Lower z-index to avoid covering UI
        console.log("Canvas z-index:", window.getComputedStyle(this.renderer.domElement).zIndex);
    
        // Debug UI elements
        this.debugUI();
    
        // Initialize controls visibility
        this.restoreControls();
    
        // Click event for canvas interactions
        this.renderer.domElement.addEventListener("click", (event) => {
            console.log("Canvas clicked, isLocked:", this.isLocked, "isFocused:", this.isFocused, "isSliderActive:", this.isSliderActive);
            this.onCanvasClick(event);
        });
    
        // Click event to lock pointer
        this.renderer.domElement.addEventListener("click", () => {
            if (!this.isLocked && !this.isFocused && !this.isSliderActive) {
                console.log("Attempting to lock pointer");
                this.controls.lock();
                this.renderer.domElement.focus();
                if (tutorial.dataset.step === "start") {
                    this.updateTutorialOnAction({ type: "click" }, tutorial);
                }
            }
        }, { once: false });
    
        // Right-click via mousedown (primary)
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Right-click
                event.preventDefault();
                event.stopPropagation();
                console.log("Canvas mousedown (right-click), isLocked:", this.isLocked, "target:", event.target.nodeName);
                if (this.isLocked) {
                    console.log("Calling controls.unlock() from mousedown");
                    this.controls.unlock();
                    document.exitPointerLock();
                    console.log("Pointer unlock requested (mousedown)");
                    this.restoreControls();
                } else {
                    console.log("Pointer not locked, no action taken (mousedown)");
                }
            }
        }, { capture: true });
    
        // Right-click via contextmenu (fallback)
        this.renderer.domElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("Canvas contextmenu, isLocked:", this.isLocked, "target:", event.target.nodeName);
            if (this.isLocked) {
                console.log("Calling controls.unlock() from contextmenu");
                this.controls.unlock();
                document.exitPointerLock();
                console.log("Pointer unlock requested");
                this.restoreControls();
            } else {
                console.log("Pointer not locked, no action taken");
            }
        }, { capture: true });
    
        // Fallback document-level contextmenu
        document.addEventListener('contextmenu', (event) => {
            console.log("Document contextmenu, target:", event.target.nodeName, "isCanvas:", event.target === this.renderer.domElement);
            if (event.target === this.renderer.domElement) {
                event.preventDefault();
                console.log("Document contextmenu on canvas, isLocked:", this.isLocked);
                if (this.isLocked) {
                    console.log("Calling controls.unlock() from document");
                    this.controls.unlock();
                    document.exitPointerLock();
                    console.log("Pointer unlock requested (document)");
                    this.restoreControls();
                }
            }
        }, { capture: true });
    
        // Pointer lock state change
        document.addEventListener("pointerlockchange", () => {
            const isLocked = document.pointerLockElement === this.renderer.domElement;
            console.log("pointerlockchange fired, isLocked:", isLocked);
            this.isLocked = isLocked;
            if (!isLocked) {
                this.isFocused = false;
                console.log("Pointer unlocked, isFocused reset to false");
                this.restoreControls();
            }
        });
    
        // Pointer lock error
        document.addEventListener("pointerlockerror", (err) => {
            console.error("Pointer Lock error:", err);
        });
    
        // Tutorial updates
        document.addEventListener("click", (e) => this.updateTutorialOnAction(e, tutorial));
        document.addEventListener("keydown", (e) => this.updateTutorialOnAction(e, tutorial));
    
        // Keyboard events
        document.addEventListener("keydown", (event) => this.onKeyDown(event));
        document.addEventListener("keyup", (event) => this.onKeyUp(event));
    
        // Other control listeners
        const shareBtn = document.getElementById("shareBtn");
        if (shareBtn) {
            shareBtn.addEventListener("click", () => this.handleShare());
            console.log("✅ Share button listener attached");
        } else {
            console.error("❌ Share button not found in DOM");
        }
    
        document.getElementById("uploadForm")?.addEventListener("submit", (e) => this.handleUploadSubmit(e));
        document.getElementById("uploadForm")?.addEventListener("change", (e) => this.showImagePreviewsAndMetadataPrompt(e));
        document.getElementById("screenshotForm")?.addEventListener("submit", (e) => this.handleScreenshotSubmit(e));
        document.getElementById("downloadBtn")?.addEventListener("click", () => this.handleDownload());
        document.getElementById("zoomSlider")?.addEventListener("input", () => this.handleZoom());
        document.getElementById("toggleControlsBtn")?.addEventListener("click", () => this.toggleControls());
        document.getElementById("recordBtn")?.addEventListener("click", () => {
            if (this.isRecording) {
                this.stopRecording();
                document.getElementById('recordBtn').textContent = 'Record';
            } else {
                this.startRecording();
                document.getElementById('recordBtn').textContent = 'Stop Recording';
            }
        });
        document.getElementById("autoRotateBtn")?.addEventListener("click", () => this.toggleAutoRotate());
        document.getElementById("animateObjectsBtn")?.addEventListener("click", () => this.toggleObjectAnimation());
        document.getElementById("animationSpeedSlider")?.addEventListener("input", () => {
            const slider = document.getElementById("animationSpeedSlider");
            const value = document.getElementById("animationSpeedValue");
            this.animationSpeed = parseFloat(slider.value);
            value.textContent = this.animationSpeed.toFixed(1);
        });
    
     // Camera Height Slider - FIXED VERSION
const cameraHeightSlider = document.getElementById("cameraHeightSlider");
const cameraHeightValue = document.getElementById("cameraHeightValue");

if (cameraHeightSlider && cameraHeightValue) {
    cameraHeightSlider.addEventListener("input", () => {
        // Get new height value
        this.cameraHeight = parseFloat(cameraHeightSlider.value);
        cameraHeightValue.textContent = this.cameraHeight.toFixed(1);
        
        // Update the stored initial settings (so it persists on pointer lock)
        this.roomCameraSettings[0].position.y = this.cameraHeight;
        this.roomCameraSettings[0].lookAt.y = this.cameraHeight;
        
        // Update camera position
        this.camera.position.y = this.cameraHeight;
        
        // Update controls position (this is the critical fix!)
        if (!this.isMobile) {
            this.controls.getObject().position.y = this.cameraHeight;
        } else {
            this.controls.target.y = this.cameraHeight;
            this.controls.update();
        }
    });
}
        document.getElementById("sensitivitySlider")?.addEventListener("input", () => {
            const sensitivitySlider = document.getElementById("sensitivitySlider");
            const sensitivityValue = document.getElementById("sensitivityValue");
            const sensitivity = parseFloat(sensitivitySlider.value);
            sensitivityValue.textContent = sensitivity.toFixed(3);
            this.controls.setSensitivity(sensitivity);
        });
    
        const prevBtn = document.getElementById('prevImage');
        const nextBtn = document.getElementById('nextImage');
        const closeBtn = document.getElementById('closeSlider');
    
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Prev button clicked");
            this.prevSliderImage();
        });
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Next button clicked");
            this.nextSliderImage();
        });
        if (closeBtn) closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Close button clicked");
            this.closeSlider();
        });
    
        document.addEventListener('keydown', (event) => {
            if (this.isSliderActive) {
                if (event.key === 'ArrowLeft') {
                    console.log("Arrow Left pressed");
                    this.prevSliderImage();
                } else if (event.key === 'ArrowRight') {
                    console.log("Arrow Right pressed");
                    this.nextSliderImage();
                }
            }
            this.onKeyDown(event);
        });
    }
    setupMobileControls() {
    if (!this.isMobile) return;
    
    const joystick = document.createElement('div');
    joystick.id = 'virtualJoystick';
    joystick.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 30px;
        width: 120px;
        height: 120px;
        background: rgba(255,255,255,0.15);
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        z-index: 1000;
        touch-action: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    const joystickKnob = document.createElement('div');
    joystickKnob.style.cssText = `
        position: absolute;
        width: 50px;
        height: 50px;
        background: rgba(76, 175, 80, 0.7);
        border: 2px solid rgba(255,255,255,0.5);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.1s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    joystick.appendChild(joystickKnob);
    document.body.appendChild(joystick);
    
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    
    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const rect = joystick.getBoundingClientRect();
        joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        joystickKnob.style.background = 'rgba(76, 175, 80, 0.9)';
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const dx = touch.clientX - joystickCenter.x;
        const dy = touch.clientY - joystickCenter.y;
        const maxDistance = 35;
        
        const clampedDx = Math.max(-maxDistance, Math.min(maxDistance, dx));
        const clampedDy = Math.max(-maxDistance, Math.min(maxDistance, dy));
        
        joystickKnob.style.transform = `translate(calc(-50% + ${clampedDx}px), calc(-50% + ${clampedDy}px))`;
        
        // Convert to movement
        const threshold = 8;
        this.keys.w = clampedDy < -threshold;
        this.keys.s = clampedDy > threshold;
        this.keys.a = clampedDx < -threshold;
        this.keys.d = clampedDx > threshold;
    }, { passive: false });
    
    const resetJoystick = () => {
        joystickActive = false;
        joystickKnob.style.transform = 'translate(-50%, -50%)';
        joystickKnob.style.background = 'rgba(76, 175, 80, 0.7)';
        this.keys = { w: false, a: false, s: false, d: false, q: false, e: false };
    };
    
    document.addEventListener('touchend', resetJoystick);
    document.addEventListener('touchcancel', resetJoystick);
}
    // Restore UI controls
    restoreControls() {
        console.log("Restoring controls, isLocked:", this.isLocked, "isSliderActive:", this.isSliderActive);
        
        // Restore control panel (if exists)
        const controlPanel = document.getElementById('controlPanel');
        if (controlPanel) {
            controlPanel.style.display = 'block';
            console.log("Control panel restored, display:", controlPanel.style.display);
        } else {
            console.log("Control panel not found");
        }
    
        // Restore individual buttons/sliders
        const uiElements = [
            'shareBtn', 'zoomSlider', 'toggleControlsBtn', 'recordBtn',
            'uploadForm', 'screenshotForm', 'downloadBtn', 'autoRotateBtn',
            'animateObjectsBtn', 'animationSpeedSlider', 'sensitivitySlider'
        ];
        uiElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                console.log(`${id} restored, display:`, element.style.display);
            } else {
                console.error(`❌ ${id} not found in DOM`);
            }
        });
    
        // Ensure image slider is hidden unless isSliderActive
        const slider = document.getElementById('imageSliderContainer');
        if (slider) {
            slider.style.display = this.isSliderActive ? 'block' : 'none';
            console.log("Image slider display:", slider.style.display);
        } else {
            console.log("Image slider not found");
        }
    
        // Restore tutorial overlay if not completed
        const tutorial = document.getElementById('tutorialOverlay');
        if (tutorial && tutorial.dataset.step !== 'zoom') {
            tutorial.style.display = 'block';
            console.log("Tutorial overlay restored, display:", tutorial.style.display);
        } else if (!tutorial) {
            console.log("Tutorial overlay not found");
        }
    }
    
    // Debug UI elements
    debugUI() {
        console.log("Debugging UI elements:");
        const uiElements = [
            'controlPanel', 'shareBtn', 'zoomSlider', 'toggleControlsBtn', 'recordBtn',
            'uploadForm', 'screenshotForm', 'downloadBtn', 'autoRotateBtn',
            'animateObjectsBtn', 'animationSpeedSlider', 'sensitivitySlider',
            'imageSliderContainer', 'prevImage', 'nextImage', 'closeSlider',
            'tutorialOverlay'
        ];
        uiElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`${id} found, display:`, window.getComputedStyle(element).display, 
                            "visibility:", window.getComputedStyle(element).visibility,
                            "z-index:", window.getComputedStyle(element).zIndex);
            } else {
                console.error(`❌ ${id} not found in DOM`);
            }
        });
    }


   
    async handleShare() {
        console.log(`Share button clicked, sessionId: ${this.sessionId}`);

        if (!this.images.length) {
            this.showMessage('shareStatus', 'No images in the gallery to share', 'error');
            console.warn('No images available for sharing');
            return;
        }

        this.showStatus('shareStatus', true);

        try {
            // Get current HTML pathname (e.g., /creative.html)
            const htmlPath = window.location.pathname;
            console.log(`Sharing with htmlPath: ${htmlPath}`);

            const response = await fetch(`/api/share/${this.sessionId || 'new'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ htmlPath })
            });

            console.log('Fetch response status:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            console.log('Fetch result:', result);

            if (result.success && result.shareUrl) {
                this.sessionId = result.sessionId || this.sessionId;
                this.shareUrl = result.shareUrl;
                localStorage.setItem('sessionId', this.sessionId);
                this.showShareLink();
                this.showMessage('shareStatus', 'Share link generated', 'success');
            } else {
                throw new Error('No share URL provided by server');
            }
        } catch (error) {
            console.error('Error sharing gallery:', error);
            this.showMessage('shareStatus', `Failed to share: ${error.message}`, 'error');
        } finally {
            this.showStatus('shareStatus', false);
        }
    }

    
    showShareLink() {
        console.log("showShareLink called with shareUrl:", this.shareUrl);
        if (!this.shareUrl) {
            console.error("No shareUrl available");
            this.showMessage("shareStatus", "No share link available", "error");
            return;
        }
    
        const shareModal = document.getElementById("shareModal");
        if (!shareModal) {
            console.error("shareModal element not found in DOM");
            this.showMessage("shareStatus", "Failed to display share modal", "error");
            return;
        }
    
        shareModal.innerHTML = `
            <h3>Share Your Gallery</h3>
            <input type="text" value="${this.shareUrl}" id="shareLinkInput" readonly>
            <button id="copyShareLink" class="glow-btn">Copy Link</button>
            <button id="closeShareModal" class="glow-btn">Close</button>
        `;
        shareModal.style.display = 'block';
    
        console.log("Modal displayed:", shareModal);
    
        const copyButton = document.getElementById("copyShareLink");
        const closeButton = document.getElementById("closeShareModal");
    
        if (copyButton) {
            copyButton.addEventListener("click", async () => {
                const input = document.getElementById("shareLinkInput");
                if (input) {
                    try {
                        await navigator.clipboard.writeText(input.value);
                        this.showMessage("shareStatus", "Link copied to clipboard", "success");
                    } catch (err) {
                        console.warn("Clipboard API failed, using fallback:", err);
                        input.select();
                        document.execCommand("copy");
                        this.showMessage("shareStatus", "Link copied to clipboard", "success");
                    }
                } else {
                    console.error("shareLinkInput not found");
                    this.showMessage("shareStatus", "Failed to copy link", "error");
                }
            });
        } else {
            console.error("copyShareLink button not found");
        }
    
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                shareModal.style.display = 'none';
                shareModal.innerHTML = ''; // Clear to prevent duplicate listeners
                console.log("Share modal closed");
            });
        } else {
            console.error("closeShareModal button not found");
        }
    }



    updateTutorialOnAction(event, tutorial) {
        if (this.isMobile) return; // Skip tutorial progression on mobile

        if (tutorial.dataset.step === "start" && event.type === "click") {
            tutorial.innerHTML = `
                Great! Now move around:<br>
                • <strong>W</strong>: Forward<br>
                • <strong>A</strong>: Right<br>
                • <strong>S</strong>: Back<br>
                • <strong>D</strong>: Left<br>
                Try it!
            `;
            tutorial.dataset.step = "move";
        } else if (tutorial.dataset.step === "move" && ["w", "a", "s", "d"].includes(event.key?.toLowerCase())) {
            tutorial.innerHTML = `
                Nice! Turn and look:<br>
                • <strong>Q</strong>: Turn left<br>
                • <strong>E</strong>: Turn right<br>
                • Move mouse to look up/down<br>
                Give it a go!
            `;
            tutorial.dataset.step = "rotate";
        } else if (tutorial.dataset.step === "rotate" && ["q", "e"].includes(event.key?.toLowerCase())) {
            tutorial.innerHTML = `
                Good job! More tips:<br>
                • Double-click art to zoom in<br>
                • Press <strong>Esc or Right Click</strong> to exit focus<br>
                • Click the avatar for help<br>
                Enjoy exploring!
            `;
            tutorial.dataset.step = "zoom";
           
            setTimeout(() => {
                tutorial.style.transition = "opacity 1s";
                tutorial.style.opacity = "0";
                setTimeout(() => tutorial.remove(), 1000);
            }, 5000); 
        }
    }

    showImagePreviewsAndMetadataPrompt(event) {
        const files = event.target.files;
        if (!files || !this.previewContainer) return;

        this.pendingFiles = Array.from(files);
        this.previewContainer.innerHTML = '';

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'image-preview';
                    img.style.cssText = 'max-width: 100px; max-height: 100px; margin: 5px; object-fit: cover;';
                    this.previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });

        this.showMetadataModal();
    }

    showMetadataModal() {
        const modal = document.getElementById('metadataModal');
        const inputsContainer = document.getElementById('metadataInputs');
        inputsContainer.innerHTML = '';

        this.pendingFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <h4>${file.name}</h4>
                <input type="text" id="title-${index}" placeholder="Image Title" value="${file.name.split('.')[0]}">
                <input type="text" id="description-${index}" placeholder="Description">
                 <input type="text" id="artist-${index}" placeholder="Url">
            `;
            inputsContainer.appendChild(div);
        });

        modal.style.display = 'block';

        document.getElementById('submitMetadata').onclick = () => this.submitMetadata();
        document.getElementById('cancelMetadata').onclick = () => {
            modal.style.display = 'none';
            this.pendingFiles = [];
            this.previewContainer.innerHTML = '';
            document.getElementById('images').value = '';
        };
    }

    submitMetadata() {
        const modal = document.getElementById('metadataModal');
        this.metadata = this.pendingFiles.map((file, index) => ({
            filename: file.name,
            title: document.getElementById(`title-${index}`).value || file.name.split('.')[0],
            description: document.getElementById(`description-${index}`).value || '',
            artist: document.getElementById(`artist-${index}`).value || 'Unknown'
        }));
        modal.style.display = 'none';
        this.handleUploadSubmit({ preventDefault: () => {} });
    }

    toggleControls() {
        this.controlsVisible = !this.controlsVisible;
        const controlPanels = document.querySelectorAll(".control-panel");
        const toggleButton = document.getElementById("toggleControlsBtn");

        controlPanels.forEach(panel => {
            panel.classList.toggle("hidden-panel", !this.controlsVisible);
        });

        toggleButton.textContent = this.controlsVisible ? "Hide" : "Show";
        toggleButton.querySelector("i") && (toggleButton.querySelector("i").className = this.controlsVisible ? "fas fa-eye" : "fas fa-eye-slash");
        console.log(this.controlsVisible ? "🖥️ Controls visible" : "🖥️ Controls hidden");
    }

onKeyDown(event) {
    // Existing movement keys
    switch(event.key.toLowerCase()) {
        case "w": this.keys.w = true; break;
        case "a": this.keys.a = true; break;
        case "s": this.keys.s = true; break;
        case "d": this.keys.d = true; break;
        case "q": this.keys.q = true; break;
        case "e": this.keys.e = true; break;
        case "control": this.isControlPressed = true; break;
        case " ":  // ✓ ADD: Spacebar for wormhole
            if (this.nearWormhole) {
                event.preventDefault();
                this.teleportThroughWormhole();
            }
            break;
    }
    
    // Height adjustment
    if (event.key === 'PageUp' || event.key === ']') {
        this.cameraHeight = Math.min(3.0, this.cameraHeight + 0.1);
        document.getElementById('cameraHeightValue').textContent = this.cameraHeight.toFixed(1);
        document.getElementById('cameraHeightSlider').value = this.cameraHeight;
    }
    if (event.key === 'PageDown' || event.key === '[') {
        this.cameraHeight = Math.max(1.2, this.cameraHeight - 0.1);
        document.getElementById('cameraHeightValue').textContent = this.cameraHeight.toFixed(1);
        document.getElementById('cameraHeightSlider').value = this.cameraHeight;
    }
    
    // Artwork navigation
    const num = parseInt(event.key);
    if (num >= 4 && num <= 9 && num <= this.images.length + 3) {
        this.focusOnArtwork(num - 4);
    }
    
    // Help toggle
    if (event.key === '?' || event.key === '/') {
        this.toggleHelpOverlay();
    }
    if (event.key.toLowerCase() === 'r') {
        this.resetCameraPosition();
    }
}

    onKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case "w": this.keys.w = false; break;
            case "a": this.keys.a = false; break;
            case "s": this.keys.s = false; break;
            case "d": this.keys.d = false; break;
            case "q": this.keys.q = false; break;
            case "e": this.keys.e = false; break;
        }
    }

    update() {
        if (!this.isMobile && this.isLocked && !this.isMoving && !this.isFocused) {
            const movement = new THREE.Vector3();
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            direction.y = 0;
            direction.normalize();

            if (this.keys.w) movement.addScaledVector(direction, this.moveSpeed);
            if (this.keys.s) movement.addScaledVector(direction, -this.moveSpeed);
            if (this.keys.a) {
                const left = new THREE.Vector3().crossVectors(this.camera.up, direction).normalize();
                movement.addScaledVector(left, -this.moveSpeed);
            }
            if (this.keys.d) {
                const right = new THREE.Vector3().crossVectors(this.camera.up, direction).normalize();
                movement.addScaledVector(right, this.moveSpeed);
            }

            this.controls.getObject().position.add(movement);
            this.checkCollisions();

            const euler = new THREE.Euler(0, 0, 0, "YXZ");
            euler.setFromQuaternion(this.camera.quaternion);
            if (this.keys.q) euler.y += this.rotationSpeed;
            if (this.keys.e) euler.y -= this.rotationSpeed;
            this.camera.quaternion.setFromEuler(euler);
        }
        this.updateAutoRotate();
    }
  resetCameraPosition() {
    const initialSettings = this.roomCameraSettings[0];
    this.smoothCameraTransition(initialSettings.position, initialSettings.lookAt);
    this.isFocused = false;
}

    async computeImageHash(texture) {
        return new Promise((resolve) => {
            const img = texture.image;
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

            let hash = 0;
            for (let i = 0; i < imageData.length; i += 4) {
                hash += imageData[i] + imageData[i + 1] + imageData[i + 2] + imageData[i + 3];
            }
            resolve(hash.toString());
        });
    }

    async loadImages(sessionId) {
        const maxRetries = 3;
        let attempt = 0;
    
        while (attempt < maxRetries) {
            try {
                const response = await fetch(`/api/screenshots/${sessionId}/`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log("📸 Fetched data for session", sessionId, ":", data);
    
                // Validate and sanitize screenshots
                if (!Array.isArray(data.screenshots) || data.screenshots.length === 0) {
                    console.warn("No valid screenshots in response, using fallback");
                    this.useFallbackImages();
                    await this.displayImagesInGallery();
                    return;
                }
    
                this.imagesToLoad = data.screenshots
                    .filter(s => s && typeof s === 'string')
                    .map(s => s.trim());
                // Handle metadata as object or array
                this.metadata = [];
                if (data.metadata && typeof data.metadata === 'object') {
                    if (Array.isArray(data.metadata.metadata)) {
                        this.metadata = data.metadata.metadata.map(m => ({
                            filename: m.filename,
                            title: m.title || 'Untitled',
                            description: m.description || '',
                            artist: m.artist || 'Unknown'
                        }));
                    } else if (Array.isArray(data.metadata)) {
                        this.metadata = data.metadata.map(m => ({
                            filename: m.filename,
                            title: m.title || 'Untitled',
                            description: m.description || '',
                            artist: m.artist || 'Unknown'
                        }));
                    }
                }
                // Fallback if no metadata
                if (!this.metadata.length && this.imagesToLoad.length) {
                    this.metadata = this.imagesToLoad.map(filename => ({
                        filename: filename.split('/').pop(),
                        title: 'Untitled',
                        description: '',
                        artist: 'Unknown'
                    }));
                }
    
                console.log("Sanitized imagesToLoad:", this.imagesToLoad);
                console.log("Sanitized metadata:", this.metadata);
    
                if (!this.imagesToLoad.length) {
                    console.error("No valid images to load after sanitization, using fallback");
                    this.useFallbackImages();
                }
    
                await this.displayImagesInGallery();
                return;
            } catch (error) {
                console.error("❌ Error fetching images (attempt " + attempt + "):", error);
                attempt++;
                if (attempt === maxRetries) {
                    console.error("Max retries reached, using fallback");
                    this.useFallbackImages();
                    await this.displayImagesInGallery();
                } else {
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                }
            }
        }
    }

    useFallbackImages() {
        this.imagesToLoad = this.fallbackImages.map(img => img.url);
        this.metadata = this.fallbackImages.map(img => img.metadata);
        console.log("Using fallback images:", this.imagesToLoad);
        console.log("Fallback metadata:", this.metadata);
    }

    async displayImagesInGallery() {
        if (!this.imagesToLoad) return;
    
        this.clearScene();
        const totalImages = this.imagesToLoad.length;
        let imageIndex = 0;
        const seenHashes = new Set();
    
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.8 });
        const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0 });
    
        const room = this.rooms[0];
        const wallLength = 30;
        const displayWidth = 4;
        const displayHeight = 3;
        const displayDepth = 0.2;
        const numImagesPerWall = Math.ceil(this.imagesToLoad.length / 4);
        const spacing = wallLength / (numImagesPerWall + 1);
        const backWallOffset = 0.5;
        const maxImagesInRoom = Math.min(16, numImagesPerWall * 4);
    
        const wallConfigs = [
            { basePos: new THREE.Vector3(0, 2.5, -wallLength / 2 + backWallOffset), rot: 0, dir: 'x' },
            { basePos: new THREE.Vector3(-wallLength / 2 + backWallOffset, 2.5, 0), rot: Math.PI / 2, dir: 'z' },
            { basePos: new THREE.Vector3(wallLength / 2 - backWallOffset, 2.5, 0), rot: -Math.PI / 2, dir: 'z' },
            { basePos: new THREE.Vector3(0, 2.5, wallLength / 2 - backWallOffset), rot: Math.PI, dir: 'x' }
        ];
    
        for (let wall of wallConfigs) {
            if (imageIndex >= totalImages || this.images.length >= maxImagesInRoom) break;
    
            const wallPositions = [];
            for (let i = 0; i < numImagesPerWall && imageIndex < totalImages && this.images.length < maxImagesInRoom; i++) {
                const offset = -wallLength / 2 + (i + 0.5) * (wallLength / numImagesPerWall);
                const pos = wall.basePos.clone();
                if (wall.dir === 'x') pos.x += offset;
                else pos.z += offset;
                wallPositions.push({ pos, rot: wall.rot });
            }
    
            for (let { pos, rot } of wallPositions) {
                if (imageIndex >= totalImages) break;
    
                const filename = this.imagesToLoad[imageIndex];
                const meta = this.metadata.find(m => m.filename === filename.split('/').pop()) || {
                    title: 'Untitled',
                    description: '',
                    artist: 'Unknown'
                };
                console.log(`Assigning metadata to ${filename}:`, meta);
    
                try {
                    const texture = await this.loadTexture(filename);
                    const hash = await this.computeImageHash(texture);
    
                    if (seenHashes.has(hash)) {
                        console.warn(`Duplicate image content detected for ${filename} with hash ${hash}, skipping`);
                        imageIndex++;
                        continue;
                    }
                    seenHashes.add(hash);
    
                    let material;
                    if (texture.image) {
                        material = new THREE.ShaderMaterial({
                            uniforms: {
                                map: { value: texture },
                                opacity: { value: 1.0 },
                                time: { value: 0.0 }
                            },
                            vertexShader: `
                                varying vec2 vUv;
                                varying vec3 vNormal;
                                void main() {
                                    vUv = uv;
                                    vNormal = normalMatrix * normal;
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                                }
                            `,
                            fragmentShader: `
                                uniform sampler2D map;
                                uniform float opacity;
                                uniform float time;
                                varying vec2 vUv;
                                varying vec3 vNormal;
                                void main() {
                                    vec4 color = texture2D(map, vUv);
                                    if (color.a < 0.5) discard;
                                    gl_FragColor = vec4(color.rgb, color.a * opacity);
                                }
                            `,
                            transparent: true,
                            side: THREE.DoubleSide
                        });
                    } else {
                        material = fallbackMaterial;
                    }
    
                    const aspectRatio = texture.image ? texture.image.width / texture.image.height : 1;
                    const maxWidth = 4;
                    const adjustedWidth = Math.min(displayHeight * aspectRatio, maxWidth);
    
                    const geometry = new THREE.BoxGeometry(adjustedWidth, displayHeight, displayDepth);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(pos).add(room.position);
                    mesh.rotation.y = rot;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.userData = {
                        filename,
                        hash,
                        baseScale: mesh.scale.clone(),
                        metadata: {
                            title: meta.title,
                            description: meta.description,
                            artist: meta.artist
                        }
                    };
                    room.add(mesh);
                    this.images.push({ mesh, filename, hash, metadata: meta }); // Also store metadata directly in images array
    
                    // Frame and spotlight code remains unchanged...
                    const frameThickness = 0.1;
                    const frameShape = new THREE.Shape();
                    frameShape.moveTo(-adjustedWidth / 2 - frameThickness, -displayHeight / 2 - frameThickness);
                    frameShape.lineTo(adjustedWidth / 2 + frameThickness, -displayHeight / 2 - frameThickness);
                    frameShape.lineTo(adjustedWidth / 2 + frameThickness, displayHeight / 2 + frameThickness);
                    frameShape.lineTo(-adjustedWidth / 2 - frameThickness, displayHeight / 2 + frameThickness);
                    frameShape.lineTo(-adjustedWidth / 2 - frameThickness, -displayHeight / 2 - frameThickness);
    
                    const hole = new THREE.Path();
                    hole.moveTo(-adjustedWidth / 2, -displayHeight / 2);
                    hole.lineTo(adjustedWidth / 2, -displayHeight / 2);
                    hole.lineTo(adjustedWidth / 2, displayHeight / 2);
                    hole.lineTo(-adjustedWidth / 2, displayHeight / 2);
                    hole.lineTo(-adjustedWidth / 2, -displayHeight / 2);
                    frameShape.holes.push(hole);
    
                    const extrudeSettings = { depth: frameThickness, bevelEnabled: false };
                    const frameGeometry = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);
                    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                    frame.position.copy(mesh.position);
                    frame.position.z += (rot === 0 ? -displayDepth / 2 : (rot === Math.PI ? displayDepth / 2 : 0));
                    frame.position.x += (rot === Math.PI / 2 ? -displayDepth / 2 : (rot === -Math.PI / 2 ? displayDepth / 2 : 0));
                    frame.rotation.y = rot;
                    frame.castShadow = true;
                    frame.receiveShadow = true;
                    room.add(frame);
    
                    const spotlight = new THREE.SpotLight(0xffffff, 2.0, 20, Math.PI / 6, 0.7);
                    const lightOffset = 2;
                    spotlight.position.set(
                        pos.x + (Math.abs(rot) === Math.PI / 2 ? (rot > 0 ? lightOffset : -lightOffset) : 0),
                        6,
                        pos.z + (Math.abs(rot) === Math.PI / 2 ? 0 : (rot === 0 ? -lightOffset : lightOffset))
                    ).add(room.position);
                    spotlight.target = mesh;
                    spotlight.castShadow = true;
                    spotlight.shadow.mapSize.width = 1024;
                    spotlight.shadow.mapSize.height = 1024;
                    spotlight.shadow.bias = -0.0001;
                    room.add(spotlight);
    
                    imageIndex++;
                } catch (error) {
                    console.error(`Error loading image ${this.imagesToLoad[imageIndex]}:`, error);
                    imageIndex++;
                }
            }
        }
        // Apply quantum superposition effect to artworks in quantum lab
if (this.labArtworkSpots) {
    this.images.forEach((img, index) => {
        if (img.mesh.userData.quantum) {
            this.makeArtworkQuantum(img.mesh, index);
        }
    });
}
        console.log(`🎨 Images rendered in room ${this.currentRoom}:`, this.images.length, "Unique hashes:", seenHashes.size);
    }

    clearScene() {
        this.images.forEach(img => {
            if (img.mesh.parent) {
                img.mesh.parent.remove(img.mesh);
            }
            img.mesh.geometry.dispose();
            if (img.mesh.material.map) img.mesh.material.map.dispose();
            img.mesh.material.dispose();
        });
        this.images = [];
        this.rooms.forEach(room => {
            const toRemove = room.children.filter(child => 
                child instanceof THREE.SpotLight || 
                (child.material?.color?.getHex() === 0x333333)
            );
            toRemove.forEach(child => {
                room.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        console.log("🗑️ Scene cleared");
    }

    loadTexture(filename) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                filename,
                (texture) => {
                    texture.minFilter = THREE.LinearMipmapLinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.generateMipmaps = true;
                    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy() || 1);
                    texture.needsUpdate = true;
                    resolve(texture);
                },
                undefined,
                (err) => reject(err)
            );
        });
    }
onCanvasClick(event) {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - this.lastClickTime;

    if (timeSinceLastClick < this.clickDelay) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all interactive objects including portal meshes
        const interactiveObjects = [
            ...this.images.map(img => img.mesh),
            ...this.scene.children.filter(obj => (obj.parent && obj.parent.userData.isAvatar))
        ];
        
        // ✓ ADD: Get all portal meshes from current room
        const currentRoom = this.rooms[this.currentEra];
        if (currentRoom) {
            currentRoom.traverse(child => {
                if (child.isMesh && child.parent?.userData?.isPortal) {
                    interactiveObjects.push(child);
                }
            });
        }
        
        const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            
            // ✓ CHECK: Portal click detection
          // Add after existing click handling
if (intersects.length > 0) {
    const obj = intersects[0].object;
    
    // Check if clicked on jukebox
    if (obj.parent && obj.parent.userData.isJukebox) {
        this.playJukeboxSong();
        return;
    }
}
            
            // Rest of your existing click handling
            if (this.isFocused) {
                this.resetCamera();
                this.closeSlider();
            } else if (obj.parent && obj.parent.userData.isAvatar) {
                this.showAvatarInstructions();
            } else if (obj.userData.filename) {
                console.log(`Clicked image: ${obj.userData.filename}`);
                if (!this.clickSound.isPlaying) this.clickSound.play();
                this.focusImage(obj);
                this.scaleImage(obj);
                this.openSlider(obj);
            }
        }
    }
    this.lastClickTime = currentTime;
}

playJukeboxSong() {
    const songs = [
        'Rock Around the Clock',
        'Johnny B. Goode', 
        'Great Balls of Fire',
        'Blue Suede Shoes',
        'Peggy Sue'
    ];
    
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 255, 0.95);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        z-index: 10000;
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: bold;
        border: 3px solid #ffd700;
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.8);
        animation: jukeboxPop 0.5s ease;
    `;
    
    notification.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎵 NOW PLAYING 🎵</div>
            <div style="font-size: 20px;">"${randomSong}"</div>
        </div>
        <style>
            @keyframes jukeboxPop {
                0% { transform: translateX(-50%) scale(0); opacity: 0; }
                50% { transform: translateX(-50%) scale(1.1); }
                100% { transform: translateX(-50%) scale(1); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(notification);
    
    // Speed up record spinning
    if (this.jukebox && this.jukebox.userData.record) {
        this.jukebox.userData.rotationSpeed = 0.1;
        setTimeout(() => {
            this.jukebox.userData.rotationSpeed = 0.02;
        }, 3000);
    }
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
    openSlider(selectedMesh) {
       if (!this.isFocused) {
    this.updateCameraState(); // Only save if not already focused
}
        if (!this.images.length) return;
    
        if (!this.isMobile && this.isLocked) {
            this.controls.unlock();
            this.isLocked = false;
        }
        this.isSliderActive = true;
        this.sliderImages = this.images.map(img => ({
            src: img.filename,
            mesh: img.mesh,
            metadata: img.metadata || img.mesh.userData.metadata || { title: 'Untitled', description: '', artist: 'Unknown' }
        }));
        console.log("Slider images with metadata:", this.sliderImages);
    
        this.currentSliderIndex = this.sliderImages.findIndex(img => img.mesh === selectedMesh);
        if (this.currentSliderIndex === -1) this.currentSliderIndex = 0;
    
        const sliderContainer = document.getElementById('imageSliderContainer');
        if (sliderContainer) {
            sliderContainer.classList.remove('hidden');
            sliderContainer.style.pointerEvents = 'auto';
            sliderContainer.style.display = 'block'; // Ensure visibility
            this.updateSliderDisplay();
            console.log("Slider opened, index:", this.currentSliderIndex, 
                        "container display:", sliderContainer.style.display);
        } else {
            console.error("Slider container not found in DOM");
            this.isSliderActive = false;
        }
    }
    
    closeSlider() {
        this.isSliderActive = false;
        const sliderContainer = document.getElementById('imageSliderContainer');
        if (sliderContainer) {
            sliderContainer.classList.add('hidden');
            sliderContainer.style.pointerEvents = 'none';
            sliderContainer.style.display = 'none';
            console.log("Slider closed, container display:", sliderContainer.style.display);
        } else {
            console.error("Slider container not found in DOM");
        }
    
        // Always reset camera to handle edge cases
        console.log("Initiating camera reset, isFocused:", this.isFocused);
        this.resetCamera();
        this.restoreControls();
    }
    
    prevSliderImage() {
        if (this.currentSliderIndex > 0) {
            this.currentSliderIndex--;
            this.updateSliderDisplay();
            this.focusImage(this.sliderImages[this.currentSliderIndex].mesh);
        }
    }
    
    nextSliderImage() {
        if (this.currentSliderIndex < this.sliderImages.length - 1) {
            this.currentSliderIndex++;
            this.updateSliderDisplay();
            this.focusImage(this.sliderImages[this.currentSliderIndex].mesh);
        }
    }
    
    updateSliderDisplay() {
        const sliderImage = document.getElementById('sliderImage');
        const sliderIndex = document.getElementById('sliderIndex');
        const sliderContent = document.querySelector('.slider-content');
        const currentImage = this.sliderImages[this.currentSliderIndex];
    
        if (sliderImage && sliderIndex && sliderContent) {
            sliderImage.src = currentImage.src;
            sliderIndex.textContent = `${this.currentSliderIndex + 1} / ${this.sliderImages.length}`;
    
            let metadataDiv = document.getElementById('sliderMetadata');
            if (!metadataDiv) {
                metadataDiv = document.createElement('div');
                metadataDiv.id = 'sliderMetadata';
                metadataDiv.style.cssText = 'color: white; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; margin-top: 10px;';
                sliderContent.appendChild(metadataDiv);
            }
            console.log("Displaying metadata for image", currentImage.src, ":", currentImage.metadata);
            metadataDiv.innerHTML = `
                <h3>${currentImage.metadata.title || 'Untitled'}</h3>
                <p><strong>Url:</strong> ${currentImage.metadata.artist ? `<a href="${currentImage.metadata.artist}" target="_blank">${currentImage.metadata.artist}</a>` : 'None'}</p>
                <p><strong>Description:</strong> ${currentImage.metadata.description || ''}</p>
            `;
        } else {
            console.error("Slider elements missing:", { sliderImage, sliderIndex, sliderContent });
        }
    }

    scaleImage(mesh) {
        const startScale = mesh.scale.clone();
        const targetScale = mesh.userData.baseScale.clone().multiplyScalar(1.2);
        const duration = 500;
        const startTime = performance.now();

        const animateScale = (time) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            mesh.scale.lerpVectors(startScale, targetScale, t);

            if (t < 1) requestAnimationFrame(animateScale);
            else {
                const reverseScale = (time) => {
                    const elapsed = time - startTime - duration;
                    const t = Math.min(elapsed / duration, 1);
                    mesh.scale.lerpVectors(targetScale, startScale, t);

                    if (t < 1) requestAnimationFrame(reverseScale);
                };
                requestAnimationFrame(reverseScale);
            }
        };
        requestAnimationFrame(animateScale);
    }

    focusImage(mesh) {
        this.updateCameraState();
        this.isFocused = true;
    
        if (this.isMobile) {
            const targetPos = mesh.position.clone();
            targetPos.y = 1.6;
            const distance = 3;
            const direction = new THREE.Vector3();
            direction.subVectors(this.camera.position, targetPos).normalize();
            targetPos.add(direction.multiplyScalar(-distance));
    
            const startPos = this.camera.position.clone();
            const startTarget = this.controls.target.clone();
            const duration = 500;
            const startTime = performance.now();
    
            const animateFocus = (time) => {
                const elapsed = time - startTime;
                const t = Math.min(elapsed / duration, 1);
                const easedT = 0.5 - 0.5 * Math.cos(Math.PI * t);
                this.camera.position.lerpVectors(startPos, targetPos, easedT);
                this.controls.target.lerpVectors(startTarget, mesh.position, easedT);
                this.controls.update();
    
                if (t < 1) requestAnimationFrame(animateFocus);
                else {
                    console.log(`Focused on mesh at ${mesh.position.toArray()}, camera at ${this.camera.position.toArray()}`);
                }
            };
            requestAnimationFrame(animateFocus);
        } else {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
    
            const targetPos = mesh.position.clone().sub(direction.multiplyScalar(3));
            targetPos.y = 1.6;
    
            const roomBounds = this.rooms[this.currentRoom].position;
            const minX = roomBounds.x - 15 + 1;
            const maxX = roomBounds.x + 15 - 1;
            const minZ = roomBounds.z - 15 + 1;
            const maxZ = roomBounds.z + 15 - 1;
    
            targetPos.x = Math.max(minX, Math.min(maxX, targetPos.x));
            targetPos.z = Math.max(minZ, Math.min(maxZ, targetPos.z));
    
            const startPos = this.camera.position.clone();
            const startQuat = this.camera.quaternion.clone();
            const targetQuat = new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().lookAt(targetPos, mesh.position, new THREE.Vector3(0, 1, 0))
            );
            const duration = 500;
            const startTime = performance.now();
    
            const animateFocus = (time) => {
                const elapsed = time - startTime;
                const t = Math.min(elapsed / duration, 1);
                const easedT = 0.5 - 0.5 * Math.cos(Math.PI * t);
                this.camera.position.lerpVectors(startPos, targetPos, easedT);
                this.camera.quaternion.slerpQuaternions(startQuat, targetQuat, easedT);
                this.controls.getObject().position.copy(this.camera.position);
                this.checkCollisions();
    
                if (t < 1) requestAnimationFrame(animateFocus);
                else {
                    console.log(`Focused on mesh at ${mesh.position.toArray()}, camera at ${this.camera.position.toArray()}`);
                }
            };
            requestAnimationFrame(animateFocus);
        }
    }

    resetCamera() {
        console.log("Starting camera reset, target position:", this.previousCameraState.position.toArray(), 
                    "target rotation:", this.previousCameraState.rotation.toArray());
    
        // Disable controls to prevent interference
        this.controls.enabled = false;
    
        const startPos = this.camera.position.clone();
        const targetPos = this.previousCameraState.position.clone();
        const startQuat = this.camera.quaternion.clone();
        const targetQuat = new THREE.Quaternion().setFromEuler(this.previousCameraState.rotation);
        const duration = 500;
        const startTime = performance.now();
    
        if (this.isMobile) {
            const startTarget = this.controls.target.clone();
            const targetTarget = this.previousCameraState.target.clone();
    
            const animateReset = (time) => {
                const elapsed = time - startTime;
                const t = Math.min(elapsed / duration, 1);
                const easedT = 0.5 - 0.5 * Math.cos(Math.PI * t);
                this.camera.position.lerpVectors(startPos, targetPos, easedT);
                this.camera.quaternion.slerpQuaternions(startQuat, targetQuat, easedT);
                this.controls.target.lerpVectors(startTarget, targetTarget, easedT);
                this.controls.update();
    
                if (t < 1) {
                    requestAnimationFrame(animateReset);
                } else {
                    // Set final state explicitly
                    this.camera.position.copy(targetPos);
                    this.camera.quaternion.copy(targetQuat);
                    this.controls.target.copy(targetTarget);
                    this.controls.update();
                    this.controls.enabled = true;
                    this.isFocused = false;
                    console.log("Camera reset complete, final position:", this.camera.position.toArray(), 
                                "final rotation:", this.camera.rotation.toArray());
                }
            };
            requestAnimationFrame(animateReset);
        } else {
            const animateReset = (time) => {
                const elapsed = time - startTime;
                const t = Math.min(elapsed / duration, 1);
                const easedT = 0.5 - 0.5 * Math.cos(Math.PI * t);
                this.camera.position.lerpVectors(startPos, targetPos, easedT);
                this.camera.quaternion.slerpQuaternions(startQuat, targetQuat, easedT);
                this.controls.getObject().position.copy(this.camera.position);
                this.checkCollisions();
    
                if (t < 1) {
                    requestAnimationFrame(animateReset);
                } else {
                    // Set final state explicitly
                    this.camera.position.copy(targetPos);
                    this.camera.quaternion.copy(targetQuat);
                    this.controls.getObject().position.copy(this.camera.position);
                    this.controls.enabled = true;
                    this.isFocused = false;
                    console.log("Camera reset complete, final position:", this.camera.position.toArray(), 
                                "final rotation:", this.camera.rotation.toArray());
                }
            };
            requestAnimationFrame(animateReset);
        }
    }

    updateCameraState() {
        this.previousCameraState = {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            target: this.isMobile ? this.controls.target.clone() : this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10).add(this.camera.position)
        };
        console.log("Updated previousCameraState: position=", this.previousCameraState.position.toArray(), 
                    "rotation=", this.previousCameraState.rotation.toArray());
    }

   handleDownload() {
    const currentIndex = this.getCurrentArtworkIndex();
    const metadata = this.metadata[currentIndex];
    
    const imgData = this.renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    
    // Better filename with artwork info
    const filename = metadata 
        ? `gallery_${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
        : `gallery_view_${Date.now()}.png`;
    
    link.download = filename;
    link.click();
    
    // Show confirmation
    this.showDownloadConfirmation(metadata);
}

showDownloadConfirmation(metadata) {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.95);
        color: white;
        padding: 18px 28px;
        border-radius: 12px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    msg.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">✅</div>
            <div>
                <strong style="font-size: 16px;">Screenshot saved!</strong><br>
                ${metadata ? `<small style="opacity: 0.9;">${metadata.title}</small>` : ''}
            </div>
        </div>
        <style>
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

    handleZoom() {
        const zoomSlider = document.getElementById("zoomSlider");
        const zoomValue = document.getElementById("zoomValue");
        const zoomLevel = parseFloat(zoomSlider.value);
        zoomValue.textContent = zoomLevel.toFixed(1);
        if (this.isMobile) {
            this.controls.minDistance = 1 / zoomLevel;
            this.controls.maxDistance = 20 / zoomLevel;
            this.controls.update();
        } else {
            this.moveSpeed = zoomLevel / 10;
            this.camera.fov = 75 / (zoomLevel * 0.5 + 0.5);
            this.camera.updateProjectionMatrix();
        }
    }

    
async handleScreenshotSubmit(event) {
    event.preventDefault();
    const url = document.getElementById("url").value;
    if (!url) {
        this.showMessage("screenshotStatus", "Please enter a valid URL", "error");
        return;
    }
     
    this.showStatus("screenshotStatus", true);
    
    try {
        const response = await fetch("/api/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });
        
        const result = await response.json();
        if (result.sessionId) {
            this.sessionId = result.sessionId;
            localStorage.setItem('sessionId', this.sessionId);
            this.showMessage("screenshotStatus", `Screenshots captured for ${url}`, "success");
            this.loadImages(this.sessionId);
        } else {
            this.showMessage("screenshotStatus", "Failed to capture screenshot", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        this.showMessage("screenshotStatus", `Failed to capture screenshot: ${error.message}`, "error");
    } finally {
        this.showStatus("screenshotStatus", false);
    }
    }
    
    async handleUploadSubmit(event) {
        event.preventDefault();
        if (!this.pendingFiles.length || !this.metadata.length) {
            console.log("No files or metadata to upload");
            return;
        }
    
        const formData = new FormData();
        this.pendingFiles.forEach((file, index) => {
            formData.append("images", file);
            formData.append("title", this.metadata[index].title);
            formData.append("description", this.metadata[index].description);
            formData.append("artist", this.metadata[index].artist);
        });
    
        try {
            const response = await fetch(`/api/upload${this.sessionId ? `/${this.sessionId}` : ''}`, {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                this.sessionId = result.sessionId;
                localStorage.setItem('sessionId', this.sessionId);
                // Update this.metadata with backend filenames
                this.metadata = result.filePaths.map((filePath, index) => ({
                    filename: filePath.split('/').pop(),
                    title: this.metadata[index].title,
                    description: this.metadata[index].description,
                    artist: this.metadata[index].artist
                }));
                console.log("Updated metadata with backend filenames:", this.metadata);
                await new Promise(resolve => setTimeout(resolve, 100));
                await this.loadImages(this.sessionId);
                this.pendingFiles = [];
                document.getElementById('images').value = '';
                this.previewContainer.innerHTML = '';
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            this.showMessage("shareStatus", "Failed to upload images", "error");
        }
    }

    
    showStatus(statusId, show) {
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.classList.toggle("hidden", !show);
            if (show) {
                statusElement.classList.remove("success", "error");
                statusElement.classList.add("loading");
                statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            } else {
                statusElement.classList.remove("loading");
            }
        }
    }

    showMessage(statusId, message, type) {
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.classList.remove("hidden", "loading");
            statusElement.classList.add(type === "success" ? "success" : "error");
            statusElement.innerHTML = type === "success" ? '<i class="fas fa-check"></i>' : '<i class="fas fa-exclamation-triangle"></i>';
            statusElement.setAttribute("data-tooltip", message);
            
            setTimeout(() => {
                statusElement.classList.add("hidden");
                statusElement.removeAttribute("data-tooltip");
                statusElement.classList.remove("success", "error");
            }, 3000);
        }
        }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // ============ ARTWORK NAVIGATION METHODS ============

createArtworkProgressUI() {
    const progressBar = document.createElement('div');
    progressBar.id = 'artworkProgress';
    progressBar.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        padding: 12px 24px;
        border-radius: 25px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 100;
        display: none;
        align-items: center;
        gap: 15px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    progressBar.innerHTML = `
        <span id="artworkCounter">0 / 0</span>
        <div style="display: flex; gap: 5px;" id="artworkDots"></div>
    `;
    
    document.body.appendChild(progressBar);
}

updateArtworkProgress() {
    const progressBar = document.getElementById('artworkProgress');
    const counter = document.getElementById('artworkCounter');
    const dots = document.getElementById('artworkDots');
    
    if (!counter || !dots || !this.images.length) return;
    
    progressBar.style.display = 'flex';
    
    const current = this.getCurrentArtworkIndex() + 1;
    const total = this.images.length;
    
    counter.textContent = `${current} / ${total}`;
    
    // Create clickable dots
    dots.innerHTML = '';
    this.images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            width: ${index === current - 1 ? '12px' : '8px'};
            height: ${index === current - 1 ? '12px' : '8px'};
            border-radius: 50%;
            background: ${index === current - 1 ? '#4CAF50' : '#666'};
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        dot.title = this.metadata[index]?.title || `Artwork ${index + 1}`;
        dot.addEventListener('click', () => this.focusOnArtwork(index));
        dots.appendChild(dot);
    });
}

getCurrentArtworkIndex() {
    if (!this.images.length) return 0;
    
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    let closestIndex = 0;
    let maxDot = -Infinity;
    
    this.images.forEach((img, index) => {
        const toArtwork = new THREE.Vector3()
            .subVectors(img.mesh.position, this.camera.position) // ✓ FIXED: Access mesh.position
            .normalize();
        const dot = direction.dot(toArtwork);
        if (dot > maxDot) {
            maxDot = dot;
            closestIndex = index;
        }
    });
    
    return closestIndex;
}

focusOnArtwork(index) {
      if (index < 0 || index >= this.images.length) return;
    
    this.isFocused = true; // ✓ ADD THIS LINE
    
    const artwork = this.images[index];
    const artworkPos = artwork.mesh.position.clone();
    const artworkRotation = artwork.mesh.rotation.y;
    
    // ✓ FIXED: Properly calculate normal from rotation
    const normal = new THREE.Vector3(
        Math.sin(artworkRotation),
        0,
        Math.cos(artworkRotation)
    );
    
    // Use a consistent viewing distance (adjust 6 to your preference: 5-8)
    const viewingDistance = 6;
    
    const targetPos = artworkPos.clone();
    targetPos.add(normal.multiplyScalar(viewingDistance));
    targetPos.y = 1.6;
    
    this.smoothCameraTransition(targetPos, artworkPos);
    this.showArtworkInfo(index);
    setTimeout(() => this.updateCameraState(), 1100);
}

smoothCameraTransition(targetPosition, lookAtPosition) {
    const startPos = this.camera.position.clone();
    const startTime = Date.now();
    const duration = 1000;
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);
        
        this.camera.position.lerpVectors(startPos, targetPosition, eased);
        this.camera.lookAt(lookAtPosition);
        
        if (this.isMobile) {
            this.controls.target.copy(lookAtPosition);
            this.controls.update();
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

navigateToNextArtwork() {
    if (!this.images.length) return;
    const currentIndex = this.getCurrentArtworkIndex();
    const nextIndex = (currentIndex + 1) % this.images.length;
    this.focusOnArtwork(nextIndex);
}

navigateToPrevArtwork() {
    if (!this.images.length) return;
    const currentIndex = this.getCurrentArtworkIndex();
    const prevIndex = (currentIndex - 1 + this.images.length) % this.images.length;
    this.focusOnArtwork(prevIndex);
}

showArtworkInfo(index) {
    const metadata = this.metadata[index];
    if (!metadata) return;
    
    // Remove existing info
    const existing = document.getElementById('artworkInfo');
    if (existing) existing.remove();
    
    const info = document.createElement('div');
    info.id = 'artworkInfo';
    info.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 350px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        animation: slideInLeft 0.3s ease;
    `;
    
    info.innerHTML = `
        <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #4CAF50;">${metadata.title}</h3>
        <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">
            <strong>Artist:</strong> ${metadata.artist}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 1.5; opacity: 0.8;">
            ${metadata.description}
        </p>
        <button id="closeArtworkInfo" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: #4CAF50;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        ">Close</button>
        <style>
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        </style>
    `;
    
    document.body.appendChild(info);
    
    document.getElementById('closeArtworkInfo').addEventListener('click', () => info.remove());
    
    // Auto-remove after 12 seconds
    setTimeout(() => {
        if (info.parentNode) {
            info.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => info.remove(), 500);
        }
    }, 12000);
}

setupMobileControls() {
    if (!this.isMobile) return;
    
    const joystick = document.createElement('div');
    joystick.id = 'virtualJoystick';
    joystick.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 30px;
        width: 120px;
        height: 120px;
        background: rgba(255,255,255,0.15);
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        z-index: 1000;
        touch-action: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    const joystickKnob = document.createElement('div');
    joystickKnob.style.cssText = `
        position: absolute;
        width: 50px;
        height: 50px;
        background: rgba(76, 175, 80, 0.7);
        border: 2px solid rgba(255,255,255,0.5);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.1s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    joystick.appendChild(joystickKnob);
    document.body.appendChild(joystick);
    
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    
    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const rect = joystick.getBoundingClientRect();
        joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        joystickKnob.style.background = 'rgba(76, 175, 80, 0.9)';
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const dx = touch.clientX - joystickCenter.x;
        const dy = touch.clientY - joystickCenter.y;
        const maxDistance = 35;
        
        const clampedDx = Math.max(-maxDistance, Math.min(maxDistance, dx));
        const clampedDy = Math.max(-maxDistance, Math.min(maxDistance, dy));
        
        joystickKnob.style.transform = `translate(calc(-50% + ${clampedDx}px), calc(-50% + ${clampedDy}px))`;
        
        // Convert to movement
        const threshold = 8;
        this.keys.w = clampedDy < -threshold;
        this.keys.s = clampedDy > threshold;
        this.keys.a = clampedDx < -threshold;
        this.keys.d = clampedDx > threshold;
    }, { passive: false });
    
    const resetJoystick = () => {
        joystickActive = false;
        joystickKnob.style.transform = 'translate(-50%, -50%)';
        joystickKnob.style.background = 'rgba(76, 175, 80, 0.7)';
        this.keys = { w: false, a: false, s: false, d: false, q: false, e: false };
    };
    
    document.addEventListener('touchend', resetJoystick);
    document.addEventListener('touchcancel', resetJoystick);
}

    showAvatarInstructions() {
        const instructions = document.createElement("div");
        instructions.id = "avatarInstructions";
        instructions.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:white; background:rgba(0,0,0,0.7); padding:20px; border-radius:5px; z-index:11; text-align:center;";
        if (this.isMobile) {
            instructions.innerHTML = `
                <h3>Gallery Controls</h3>
                <p>Swipe to look around.</p>
                <p>Pinch to zoom in/out.</p>
                <p>Tap an artwork to focus, tap again to reset.</p>
                <p>Double-tap artwork to open image slider.</p>
                <button id="closeInstructions" style="margin-top:10px; padding:5px 10px; background:#1e90ff; border:none; color:white; border-radius:5px; cursor:pointer;">Close</button>
            `;
        } else {
            instructions.innerHTML = `
                <h3>Gallery Controls</h3>
                <p>Click to lock pointer and start exploring.</p>
                <p>Use W, A, S, D to move.</p>
                <p>Use Q and E to rotate left/right.</p>
                <p>Mouse to look up/down.</p>
                <p>Double-click an artwork to focus and open slider.</p>
                <p>Hold Control key to cycle through images in slider.</p>
                <button id="closeInstructions" style="margin-top:10px; padding:5px 10px; background:#1e90ff; border:none; color:white; border-radius:5px; cursor:pointer;">Close</button>
            `;
        }
        document.body.appendChild(instructions);

        document.getElementById("closeInstructions").addEventListener("click", () => {
            document.body.removeChild(instructions);
        });
    }
}

window.app = new ThreeJSApp(); // ✓ Make globally accessible
app.init();
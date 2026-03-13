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
    { position: new THREE.Vector3(0, 1.6, 35), lookAt: new THREE.Vector3(0, 1.6, 0) }
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
        this.createAvatar();

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
    const room1 = new THREE.Group();
    
    // ========================================
    // MATERIALS LIBRARY - ANCIENT SCHOLARLY
    // ========================================
    
    // 1. Aged papyrus/parchment
    const papyrusMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4e4c1,
        roughness: 0.9,
        metalness: 0.0,
        emissive: 0x3a2a1a,
        emissiveIntensity: 0.1
    });
    
    // 2. Polished marble (Greco-Roman style)
    const marbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        roughness: 0.3,
        metalness: 0.1,
        envMapIntensity: 0.5
    });
    
    const marbleTexture = this.generateCarraraMarble(2048, 2048);
    const marbleTextureObj = new THREE.Texture(marbleTexture);
    marbleTextureObj.needsUpdate = true;
    marbleTextureObj.wrapS = marbleTextureObj.wrapT = THREE.RepeatWrapping;
    marbleTextureObj.repeat.set(4, 4);
    marbleMaterial.map = marbleTextureObj;
    
    // 3. Dark aged wood (bookshelves)
    const darkWoodMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 0.8,
        metalness: 0.0
    });
    
    const woodTexture = this.generateWoodTexture(1024, 1024);
    const woodTextureObj = new THREE.Texture(woodTexture);
    woodTextureObj.needsUpdate = true;
    woodTextureObj.wrapS = woodTextureObj.wrapT = THREE.RepeatWrapping;
    woodTextureObj.repeat.set(2, 2);
    darkWoodMaterial.map = woodTextureObj;
    
    // 4. Bronze/brass fixtures
    const bronzeMaterial = new THREE.MeshStandardMaterial({
        color: 0xcd7f32,
        roughness: 0.4,
        metalness: 0.8,
        envMapIntensity: 1.0
    });
    
    // 5. Aged leather book bindings
    const leatherMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.9,
        metalness: 0.0
    });
    
    // 6. Gold leaf accents
    const goldLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.9,
        emissive: 0xffd700,
        emissiveIntensity: 0.2
    });
    
    // ========================================
    // LIBRARY STRUCTURE
    // ========================================
    
    const libraryWidth = 80;
    const libraryDepth = 60;
    const libraryHeight = 25;
    
    // Polished marble floor with geometric inlay patterns
    const mainFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(libraryWidth, libraryDepth),
        marbleMaterial
    );
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.receiveShadow = true;
    room1.add(mainFloor);
    
    // Geometric mosaic inlay (Greek key pattern)
    const mosaicPositions = [
        { x: 0, z: 0, size: 15 },
        { x: -25, z: -20, size: 8 },
        { x: 25, z: -20, size: 8 },
        { x: -25, z: 20, size: 8 },
        { x: 25, z: 20, size: 8 }
    ];
    
    mosaicPositions.forEach(pos => {
        const mosaic = new THREE.Mesh(
            new THREE.CircleGeometry(pos.size, 64),
            new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.5,
                metalness: 0.1
            })
        );
        mosaic.position.set(pos.x, 0.01, pos.z);
        mosaic.rotation.x = -Math.PI / 2;
        mosaic.receiveShadow = true;
        room1.add(mosaic);
        
        // Greek key pattern border
        const border = new THREE.Mesh(
            new THREE.RingGeometry(pos.size, pos.size + 0.3, 64),
            goldLeafMaterial
        );
        border.position.set(pos.x, 0.02, pos.z);
        border.rotation.x = -Math.PI / 2;
        room1.add(border);
    });
    
    // ========================================
    // MASSIVE MARBLE COLUMNS (Corinthian Style)
    // ========================================
    
    const columnPositions = [
        { x: -30, z: -20 }, { x: -30, z: 0 }, { x: -30, z: 20 },
        { x: 0, z: -25 }, { x: 0, z: 25 },
        { x: 30, z: -20 }, { x: 30, z: 0 }, { x: 30, z: 20 }
    ];
    
    columnPositions.forEach(pos => {
        // Column shaft (slightly tapered)
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1.0, libraryHeight - 4, 32),
            marbleMaterial
        );
        column.position.set(pos.x, (libraryHeight - 4) / 2, pos.z);
        column.castShadow = true;
        column.receiveShadow = true;
        room1.add(column);
        
        // Fluted grooves (20 flutes typical of Corinthian)
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const flute = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, libraryHeight - 4, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xe8e8d0,
                    roughness: 0.4
                })
            );
            flute.position.set(
                pos.x + Math.cos(angle) * 0.85,
                (libraryHeight - 4) / 2,
                pos.z + Math.sin(angle) * 0.85
            );
            room1.add(flute);
        }
        
        // Corinthian capital (ornate acanthus leaves)
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(1.3, 0.8, 2.0, 32),
            marbleMaterial
        );
        capital.position.set(pos.x, libraryHeight - 3, pos.z);
        capital.castShadow = true;
        room1.add(capital);
        
        // Gold leaf decoration on capital
        const goldBand = new THREE.Mesh(
            new THREE.TorusGeometry(1.1, 0.08, 16, 32),
            goldLeafMaterial
        );
        goldBand.position.set(pos.x, libraryHeight - 2.5, pos.z);
        goldBand.rotation.x = Math.PI / 2;
        room1.add(goldBand);
        
        // Column base (plinth)
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.4, 0.8, 32),
            marbleMaterial
        );
        base.position.set(pos.x, 0.4, pos.z);
        base.castShadow = true;
        base.receiveShadow = true;
        room1.add(base);
    });
    
    // ========================================
    // TOWERING BOOKSHELVES (4-Story High)
    // ========================================
    
    this.bookshelves = [];
    
    const shelfConfigs = [
        { x: -35, z: 0, rotation: Math.PI / 2, length: 50 },
        { x: 35, z: 0, rotation: -Math.PI / 2, length: 50 },
        { x: 0, z: -28, rotation: 0, length: 60 },
        { x: 0, z: 28, rotation: Math.PI, length: 60 }
    ];
    
    shelfConfigs.forEach((config, wallIndex) => {
        const shelfGroup = new THREE.Group();
        
        // Main bookshelf frame (reaching to ceiling)
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(
                config.rotation === 0 || config.rotation === Math.PI ? config.length : 3,
                libraryHeight - 2,
                config.rotation === 0 || config.rotation === Math.PI ? 3 : config.length
            ),
            darkWoodMaterial
        );
        frame.position.y = (libraryHeight - 2) / 2;
        frame.castShadow = true;
        frame.receiveShadow = true;
        shelfGroup.add(frame);
        
        // Individual shelves (12 levels)
        const numShelves = 12;
        for (let i = 0; i < numShelves; i++) {
            const shelfY = 1.5 + i * ((libraryHeight - 4) / numShelves);
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(
                    config.rotation === 0 || config.rotation === Math.PI ? config.length - 0.5 : 2.8,
                    0.1,
                    config.rotation === 0 || config.rotation === Math.PI ? 2.8 : config.length - 0.5
                ),
                darkWoodMaterial
            );
            shelf.position.y = shelfY;
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            shelfGroup.add(shelf);
            
            // Books on each shelf
            const numBooks = 40;
            for (let j = 0; j < numBooks; j++) {
                const bookWidth = 0.05 + Math.random() * 0.1;
                const bookHeight = 0.25 + Math.random() * 0.15;
                const bookDepth = 0.2 + Math.random() * 0.1;
                
                // Random book colors (aged leather)
                const bookColors = [0x654321, 0x8b4513, 0x2f1f0f, 0x4a2511, 0x6b3410];
                const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];
                
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth),
                    new THREE.MeshStandardMaterial({
                        color: bookColor,
                        roughness: 0.9,
                        metalness: 0.0
                    })
                );
                
                // Position books along shelf
                const bookOffset = ((config.length - 1) / numBooks) * j - (config.length - 1) / 2;
                if (config.rotation === 0 || config.rotation === Math.PI) {
                    book.position.set(bookOffset, shelfY + bookHeight / 2, 1.2);
                } else {
                    book.position.set(1.2, shelfY + bookHeight / 2, bookOffset);
                }
                
                // Slight random tilt
                book.rotation.z = (Math.random() - 0.5) * 0.1;
                book.castShadow = true;
                
                shelfGroup.add(book);
                
                // Gold lettering on spine (some books)
                if (Math.random() > 0.7) {
                    const spine = new THREE.Mesh(
                        new THREE.PlaneGeometry(bookWidth * 0.8, 0.02),
                        goldLeafMaterial
                    );
                    spine.position.copy(book.position);
                    spine.position.z -= bookDepth / 2 + 0.001;
                    shelfGroup.add(spine);
                }
            }
        }
        
        shelfGroup.position.set(config.x, 0, config.z);
        shelfGroup.rotation.y = config.rotation;
        room1.add(shelfGroup);
        this.bookshelves.push(shelfGroup);
    });
    
    // ========================================
    // ROLLING LIBRARY LADDERS
    // ========================================
    
    this.ladders = [];
    
    shelfConfigs.forEach((config, index) => {
        const ladderGroup = new THREE.Group();
        
        // Ladder rails (vertical)
        for (let side = 0; side < 2; side++) {
            const rail = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, libraryHeight - 3, 0.08),
                darkWoodMaterial
            );
            rail.position.set(side === 0 ? -0.5 : 0.5, (libraryHeight - 3) / 2, 0);
            rail.castShadow = true;
            ladderGroup.add(rail);
        }
        
        // Ladder rungs (horizontal)
        const numRungs = 15;
        for (let i = 0; i < numRungs; i++) {
            const rungY = 1 + i * ((libraryHeight - 5) / numRungs);
            const rung = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8),
                darkWoodMaterial
            );
            rung.position.y = rungY;
            rung.rotation.z = Math.PI / 2;
            rung.castShadow = true;
            ladderGroup.add(rung);
        }
        
        // Wheels at bottom (brass)
        for (let side = 0; side < 2; side++) {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                bronzeMaterial
            );
            wheel.position.set(side === 0 ? -0.5 : 0.5, 0.15, 0);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            ladderGroup.add(wheel);
        }
        
        // Top hook for sliding rail
        const hook = new THREE.Mesh(
            new THREE.TorusGeometry(0.12, 0.04, 8, 16, Math.PI),
            bronzeMaterial
        );
        hook.position.y = libraryHeight - 3.5;
        hook.rotation.x = -Math.PI / 2;
        ladderGroup.add(hook);
        
        // Position ladder along wall
        const ladderPos = (index % 2 === 0) ? -10 : 10;
        if (config.rotation === 0 || config.rotation === Math.PI) {
            ladderGroup.position.set(ladderPos, 0, config.z - 2);
        } else {
            ladderGroup.position.set(config.x - 2, 0, ladderPos);
        }
        ladderGroup.rotation.y = config.rotation;
        
        ladderGroup.userData.canSlide = true;
        ladderGroup.userData.slideRange = { min: -15, max: 15 };
        ladderGroup.userData.currentPos = 0;
        
        room1.add(ladderGroup);
        this.ladders.push(ladderGroup);
    });
    
    // Overhead rail system for ladders
    shelfConfigs.forEach(config => {
        const rail = new THREE.Mesh(
            new THREE.BoxGeometry(
                config.rotation === 0 || config.rotation === Math.PI ? config.length : 0.1,
                0.1,
                config.rotation === 0 || config.rotation === Math.PI ? 0.1 : config.length
            ),
            bronzeMaterial
        );
        rail.position.set(config.x, libraryHeight - 3.5, config.z);
        rail.castShadow = true;
        room1.add(rail);
    });
    
    // ========================================
    // READING ALCOVES (6 Cozy Study Spaces)
    // ========================================
    
    this.readingDesks = [];
    
    const alcovePositions = [
        { x: -20, z: -15, rot: 0 },
        { x: 0, z: -15, rot: 0 },
        { x: 20, z: -15, rot: 0 },
        { x: -20, z: 15, rot: Math.PI },
        { x: 0, z: 15, rot: Math.PI },
        { x: 20, z: 15, rot: Math.PI }
    ];
    
    alcovePositions.forEach((alcove, index) => {
        const alcoveGroup = new THREE.Group();
        
        // Arched alcove frame (marble)
        const arch = new THREE.Mesh(
            new THREE.BoxGeometry(4, 5, 0.3),
            marbleMaterial
        );
        arch.position.set(0, 2.5, -2);
        arch.castShadow = true;
        alcoveGroup.add(arch);
        
        // Arch opening (cutout effect with decorative trim)
        const archTrim = new THREE.Mesh(
            new THREE.TorusGeometry(1.8, 0.1, 16, 32, Math.PI),
            goldLeafMaterial
        );
        archTrim.position.set(0, 3, -1.85);
        archTrim.rotation.y = Math.PI / 2;
        alcoveGroup.add(archTrim);
        
        // Reading desk (ornate wooden)
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(3.5, 0.1, 2.0),
            darkWoodMaterial
        );
        desk.position.set(0, 0.8, 0);
        desk.castShadow = true;
        desk.receiveShadow = true;
        alcoveGroup.add(desk);
        
        // Desk legs (carved)
        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.1, 0.8, 12),
                darkWoodMaterial
            );
            leg.position.set(
                (i % 2 === 0 ? -1.6 : 1.6),
                0.4,
                (i < 2 ? -0.8 : 0.8)
            );
            leg.castShadow = true;
            alcoveGroup.add(leg);
        }
        
        // Ornate chair (high-backed)
        const chairBack = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 2.0, 0.1),
            darkWoodMaterial
        );
        chairBack.position.set(0, 1.5, 1.5);
        chairBack.castShadow = true;
        alcoveGroup.add(chairBack);
        
        const chairSeat = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.1, 1.0),
            leatherMaterial
        );
        chairSeat.position.set(0, 0.9, 1.2);
        chairSeat.castShadow = true;
        chairSeat.receiveShadow = true;
        alcoveGroup.add(chairSeat);
        
        // Chair legs
        for (let i = 0; i < 4; i++) {
            const chairLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.06, 0.9, 8),
                darkWoodMaterial
            );
            chairLeg.position.set(
                (i % 2 === 0 ? -0.5 : 0.5),
                0.45,
                1.2 + (i < 2 ? -0.4 : 0.4)
            );
            chairLeg.castShadow = true;
            alcoveGroup.add(chairLeg);
        }
        
        // Candelabra on desk (3-branch brass)
        const candelabraBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16),
            bronzeMaterial
        );
        candelabraBase.position.set(1.2, 0.95, 0);
        candelabraBase.castShadow = true;
        alcoveGroup.add(candelabraBase);
        
        // Three candle branches
        for (let i = 0; i < 3; i++) {
            const branch = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8),
                bronzeMaterial
            );
            branch.position.set(
                1.2 + (i - 1) * 0.25,
                1.4,
                0
            );
            branch.castShadow = true;
            alcoveGroup.add(branch);
            
            // Candle flame (glowing)
            const flame = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xffaa33,
                    emissive: 0xff6600,
                    emissiveIntensity: 2.0
                })
            );
            flame.position.set(
                1.2 + (i - 1) * 0.25,
                1.75,
                0
            );
            alcoveGroup.add(flame);
            
            // Point light for flame
            const candleLight = new THREE.PointLight(0xff9944, 1.5, 5);
            candleLight.position.copy(flame.position);
            candleLight.castShadow = true;
            candleLight.shadow.mapSize.width = 512;
            candleLight.shadow.mapSize.height = 512;
            alcoveGroup.add(candleLight);
            
            // Store for animation
            if (!this.candleFlames) this.candleFlames = [];
            this.candleFlames.push({ flame, light: candleLight, baseY: flame.position.y });
        }
        
        // Open book on desk
        const openBook = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.05, 1.0),
            papyrusMaterial
        );
        openBook.position.set(-0.8, 0.85, 0);
        openBook.rotation.y = Math.PI / 8;
        openBook.castShadow = true;
        openBook.receiveShadow = true;
        alcoveGroup.add(openBook);
        
        // Book pages
        const pages = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 0.9),
            papyrusMaterial
        );
        pages.position.set(-0.8, 0.88, 0);
        pages.rotation.x = -Math.PI / 2;
        pages.rotation.z = Math.PI / 8;
        alcoveGroup.add(pages);
        
        // Quill and inkwell
        const inkwell = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.15, 12),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 })
        );
        inkwell.position.set(0.3, 0.88, -0.5);
        inkwell.castShadow = true;
        alcoveGroup.add(inkwell);
        
        const quill = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.02, 0.4, 6),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
        );
        quill.position.set(0.35, 0.95, -0.5);
        quill.rotation.z = -Math.PI / 6;
        alcoveGroup.add(quill);
        
        // Small stack of books beside desk
        for (let i = 0; i < 4; i++) {
            const stackedBook = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.08, 0.4),
                leatherMaterial
            );
            stackedBook.position.set(
                -1.5,
                0.85 + i * 0.08,
                0.5 + (Math.random() - 0.5) * 0.1
            );
            stackedBook.rotation.y = (Math.random() - 0.5) * 0.3;
            stackedBook.castShadow = true;
            alcoveGroup.add(stackedBook);
        }
        
        // Alcove back wall (dark wood paneling)
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(4, 5, 0.2),
            darkWoodMaterial
        );
        backWall.position.set(0, 2.5, -2.1);
        backWall.receiveShadow = true;
        alcoveGroup.add(backWall);
        
        alcoveGroup.position.set(alcove.x, 0, alcove.z);
        alcoveGroup.rotation.y = alcove.rot;
        room1.add(alcoveGroup);
        this.readingDesks.push(alcoveGroup);
    });
    
    // ========================================
    // PAPYRUS SCROLLS (Animated Unfurling)
    // ========================================
    
    this.scrolls = [];
    
    const scrollPositions = [
        { x: -15, y: 2, z: -10 },
        { x: 15, y: 3, z: 10 },
        { x: -10, y: 4, z: 15 },
        { x: 10, y: 2.5, z: -12 }
    ];
    
    scrollPositions.forEach((pos, index) => {
        const scrollGroup = new THREE.Group();
        
        // Scroll cylinder (rolled)
        const scrollRoll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16),
            new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 })
        );
        scrollRoll.rotation.z = Math.PI / 2;
        scrollRoll.castShadow = true;
        scrollGroup.add(scrollRoll);
        
        // Unrolled papyrus section
        const papyrus = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 1.5),
            papyrusMaterial
        );
        papyrus.position.x = 0.4;
        papyrus.receiveShadow = true;
        scrollGroup.add(papyrus);
        
        // Ancient text (hieroglyphic-style)
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 1024;
        const ctx = textCanvas.getContext('2d');
        ctx.fillStyle = '#f4e4c1';
        ctx.fillRect(0, 0, 512, 1024);
        ctx.fillStyle = '#3a2a1a';
        ctx.font = '20px "Times New Roman"';
        const sampleText = [
            'ΜΟΥΣΕΙΟΝ ΑΛΕΞΑΝΔΡΕΙΑΣ',
            '',
            'In the great library of',
            'Alexandria, knowledge',
            'from all corners of',
            'the ancient world was',
            'gathered and preserved.',
            '',
            'Scholars studied',
            'geometry, astronomy,',
            'medicine, and the arts.',
            '',
            'The flame of wisdom',
            'burned bright here.'
        ];
        sampleText.forEach((line, i) => {
            ctx.fillText(line, 30, 50 + i * 35);
        });
        
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.75, 1.45),
            new THREE.MeshBasicMaterial({ map: textTexture, transparent: true, opacity: 0.8 })
        );
        textMesh.position.set(0.4, 0, 0.001);
        scrollGroup.add(textMesh);
        
        // Wooden end caps
        for (let side = 0; side < 2; side++) {
            const endCap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16),
                darkWoodMaterial
            );
            endCap.position.y = side === 0 ? -0.75 : 0.75;
            endCap.castShadow = true;
            scrollGroup.add(endCap);
        }
        
        // Tied ribbon
        const ribbon = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.02, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 })
        );
        ribbon.position.y = -0.3;
        ribbon.rotation.x = Math.PI / 2;
        scrollGroup.add(ribbon);
        
        scrollGroup.position.copy(pos);
        scrollGroup.rotation.y = Math.random() * Math.PI;
        scrollGroup.userData.unfurlSpeed = 0.002 + Math.random() * 0.003;
        scrollGroup.userData.unfurlAmount = 0;
        scrollGroup.userData.isUnfurling = false;
        
        room1.add(scrollGroup);
        this.scrolls.push(scrollGroup);
    });
    
    // ========================================
    // CENTRAL READING ROTUNDA
    // ========================================
    
    const rotunda = new THREE.Group();
    
    // Circular raised platform
    const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 8.5, 0.5, 64),
        marbleMaterial
    );
    platform.position.y = 0.25;
    platform.castShadow = true;
    platform.receiveShadow = true;
    rotunda.add(platform);
    
    // Steps leading up (3 levels)
    for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(
            new THREE.CylinderGeometry(8.5 + i * 0.5, 9 + i * 0.5, 0.15, 64),
            marbleMaterial
        );
        step.position.y = -0.075 - i * 0.15;
        step.castShadow = true;
        step.receiveShadow = true;
        rotunda.add(step);
    }
    
    // Central pedestal with important tome
    const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.0, 1.5, 32),
        marbleMaterial
    );
    pedestal.position.y = 1.25;
    pedestal.castShadow = true;
    rotunda.add(pedestal);
    
    // Pedestal top (brass)
    const pedestalTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.8, 0.1, 32),
        bronzeMaterial
    );
    pedestalTop.position.y = 2.05;
    rotunda.add(pedestalTop);
    
    // Important tome (large book)
    const ancientTome = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, 2.0),
        leatherMaterial
    );
    ancientTome.position.y = 2.25;
    ancientTome.castShadow = true;
    ancientTome.receiveShadow = true;
    rotunda.add(ancientTome);
    
    // Gold embossing on tome cover
    const embossing = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.32, 1.7),
        goldLeafMaterial
    );
    embossing.position.copy(ancientTome.position);
    rotunda.add(embossing);
    
    // Reading lecterns around rotunda (8 positions)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lecternDist = 6;
        
        const lectern = new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 1.2, 0.8),
            darkWoodMaterial
        );
        lectern.position.set(
            Math.cos(angle) * lecternDist,
            0.85,
            Math.sin(angle) * lecternDist
        );
        lectern.rotation.y = angle + Math.PI;
        lectern.castShadow = true;
        rotunda.add(lectern);
        
        // Angled reading surface
        const readingSurface = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 0.05, 0.7),
            darkWoodMaterial
        );
        readingSurface.position.copy(lectern.position);
        readingSurface.position.y = 1.3;
        readingSurface.position.x -= Math.cos(angle) * 0.15;
        readingSurface.position.z -= Math.sin(angle) * 0.15;
        readingSurface.rotation.y = angle + Math.PI;
        readingSurface.rotation.x = -Math.PI / 6;
        readingSurface.castShadow = true;
        rotunda.add(readingSurface);
        
        // Book on lectern
        const lecternBook = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.08, 0.8),
            leatherMaterial
        );
        lecternBook.position.copy(readingSurface.position);
        lecternBook.position.y += 0.05;
        lecternBook.rotation.copy(readingSurface.rotation);
        lecternBook.castShadow = true;
        rotunda.add(lecternBook);
    }
    
    rotunda.position.set(0, 0, 0);
    room1.add(rotunda);
    
    // ========================================
    // CEILING & SKYLIGHT (Dusty Sunbeams)
    // ========================================
    
    // Coffered ceiling with geometric patterns
    for (let x = -3; x < 3; x++) {
        for (let z = -3; z < 3; z++) {
            // Skip center for skylight
            if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
            
            const coffer = new THREE.Mesh(
                new THREE.BoxGeometry(8, 0.5, 8),
                marbleMaterial
            );
            coffer.position.set(x * 10, libraryHeight - 0.25, z * 10);
            coffer.castShadow = true;
            room1.add(coffer);
            
            // Recessed panel
            const panel = new THREE.Mesh(
                new THREE.BoxGeometry(7, 0.3, 7),
                new THREE.MeshStandardMaterial({ color: 0xe8d7b0, roughness: 0.8 })
            );
            panel.position.set(x * 10, libraryHeight - 0.6, z * 10);
            room1.add(panel);
            
            // Gold rosette center
            const rosette = new THREE.Mesh(
                new THREE.CircleGeometry(0.5, 32),
                goldLeafMaterial
            );
            rosette.position.set(x * 10, libraryHeight - 0.55, z * 10);
            rosette.rotation.x = -Math.PI / 2;
            room1.add(rosette);
        }
    }
    
    // Central octagonal skylight
    const skylightSize = 18;
    const skylight = new THREE.Mesh(
        new THREE.CylinderGeometry(skylightSize / 2, skylightSize / 2, 0.3, 8),
        new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.9,
            thickness: 0.5,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        })
    );
    skylight.position.y = libraryHeight - 0.15;
    skylight.receiveShadow = true;
    room1.add(skylight);
    
    // Brass skylight frame
    const skylightFrame = new THREE.Mesh(
        new THREE.TorusGeometry(skylightSize / 2, 0.15, 16, 8),
        bronzeMaterial
    );
    skylightFrame.position.y = libraryHeight - 0.15;
    skylightFrame.rotation.x = Math.PI / 2;
    room1.add(skylightFrame);
    
    // God rays (volumetric light shafts)
    this.godRays = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const rayRadius = 1.5;
        
        const godRay = new THREE.SpotLight(0xfff8dc, 3.0, 30, Math.PI / 8, 0.9);
        godRay.position.set(
            Math.cos(angle) * rayRadius,
            libraryHeight - 0.5,
            Math.sin(angle) * rayRadius
        );
        godRay.target.position.set(
            Math.cos(angle) * rayRadius,
            0,
            Math.sin(angle) * rayRadius
        );
        godRay.castShadow = true;
        godRay.shadow.mapSize.width = 1024;
        godRay.shadow.mapSize.height = 1024;
        room1.add(godRay);
        room1.add(godRay.target);
        
        this.godRays.push(godRay);
    }
    
    // Dust particles floating in light shafts
    this.dustParticles = [];
    for (let i = 0; i < 300; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 4, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3
            })
        );
        
        const radius = Math.random() * 8;
        const angle = Math.random() * Math.PI * 2;
        particle.position.set(
            Math.cos(angle) * radius,
            Math.random() * libraryHeight,
            Math.sin(angle) * radius
        );
        
      particle.userData = {
    velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        0.008 + Math.random() * 0.015,
        (Math.random() - 0.5) * 0.003
    ),
    center: new THREE.Vector3(0, 0, 0), // ← ADD THIS
    radius: radius,  // ← ADD THIS
    baseRadius: radius,
    angle: angle
};
        
        room1.add(particle);
        this.dustParticles.push(particle);
    }
    
    // ========================================
    // SECRET PASSAGES (Interactive Bookshelves)
    // ========================================
    
  this.secretPassages = [];

const passagePositions = [
    { x: -35, z: -20, rot: Math.PI / 2 },
    { x: 35, z: 20, rot: -Math.PI / 2 }
];

passagePositions.forEach(passage => {
    // ✓ IMPROVED: Fake bookshelf that looks real
    const fakeShelfGroup = new THREE.Group();
    
    // Bookshelf backing
    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.3),
        darkWoodMaterial
    );
    fakeShelfGroup.add(backing);
    
    // Add 3 shelves with books to make it look real
    for (let shelf = 0; shelf < 3; shelf++) {
        const shelfBoard = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 0.05, 0.25),
            darkWoodMaterial
        );
        shelfBoard.position.y = -1.5 + shelf * 1.5;
        shelfBoard.position.z = 0.1;
        fakeShelfGroup.add(shelfBoard);
        
        // Add books on each shelf
        for (let book = 0; book < 15; book++) {
            const bookWidth = 0.05 + Math.random() * 0.08;
            const bookHeight = 0.25 + Math.random() * 0.1;
            const bookDepth = 0.2;
            
            const bookColors = [0x654321, 0x8b4513, 0x2f1f0f, 0x4a2511];
            const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];
            
            const book = new THREE.Mesh(
                new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth),
                new THREE.MeshStandardMaterial({
                    color: bookColor,
                    roughness: 0.9,
                    metalness: 0.0
                })
            );
            
            const bookX = -1.3 + (book * 0.18);
            book.position.set(
                bookX,
                -1.5 + shelf * 1.5 + bookHeight / 2,
                0.2
            );
            book.rotation.z = (Math.random() - 0.5) * 0.05;
            fakeShelfGroup.add(book);
        }
    }
    
    // Position the fake bookshelf
    fakeShelfGroup.position.set(passage.x, 2, passage.z);
    fakeShelfGroup.rotation.y = passage.rot;
    fakeShelfGroup.castShadow = true;
    fakeShelfGroup.receiveShadow = true;
    fakeShelfGroup.userData.isSecretDoor = true;
    fakeShelfGroup.userData.isOpen = false;
    room1.add(fakeShelfGroup);
    
    // ✓ IMPROVED: Add subtle visual hint (slight glow on edges)
    const edgeGlow = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 4.1, 0.35),
        new THREE.MeshStandardMaterial({
            color: 0x4a3520,
            emissive: 0x4a3520,
            emissiveIntensity: 0.15, // Subtle glow
            transparent: true,
            opacity: 0.3
        })
    );
    edgeGlow.position.z = -0.05;
    fakeShelfGroup.add(edgeGlow);
    
    // Hidden passage behind (dark corridor)
    const corridor = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 5),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
    );
    corridor.position.set(
        passage.x + Math.cos(passage.rot) * 2.5,
        2,
        passage.z + Math.sin(passage.rot) * 2.5
    );
    corridor.rotation.y = passage.rot;
    corridor.visible = false;
    room1.add(corridor);
    
    // Torch inside passage
    const torch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8),
        darkWoodMaterial
    );
    torch.position.set(
        corridor.position.x,
        3,
        corridor.position.z
    );
    torch.visible = false;
    room1.add(torch);
    
    const torchFlame = new THREE.PointLight(0xff6600, 2.0, 8);
    torchFlame.position.copy(torch.position);
    torchFlame.position.y += 0.5;
    torchFlame.visible = false;
    room1.add(torchFlame);
    
    this.secretPassages.push({
        door: fakeShelfGroup,
        corridor: corridor,
        torch: torch,
        flame: torchFlame
    });
});
    
    // ========================================
    // ARTWORK DISPLAY INTEGRATION
    // ========================================
    
    // Artworks displayed in ornate frames on walls
    // (This integrates with your existing image loading system)
    this.artworkSpots = [];
    
    const artworkWallPositions = [
        { x: 0, y: 3, z: -28, rot: 0 },    // Back wall
        { x: 0, y: 5, z: -28, rot: 0 },
        { x: 0, y: 7, z: -28, rot: 0 },
        { x: -35, y: 3, z: 0, rot: Math.PI / 2 },  // Left wall
        { x: -35, y: 5, z: 8, rot: Math.PI / 2 },
        { x: -35, y: 7, z: -8, rot: Math.PI / 2 },
        { x: 35, y: 3, z: 0, rot: -Math.PI / 2 },  // Right wall
        { x: 35, y: 5, z: 8, rot: -Math.PI / 2 },
        { x: 35, y: 7, z: -8, rot: -Math.PI / 2 },
        { x: 0, y: 3, z: 28, rot: Math.PI },   // Front wall
        { x: 0, y: 5, z: 28, rot: Math.PI },
        { x: 0, y: 7, z: 28, rot: Math.PI },
        // Additional spots in alcoves
        { x: -20, y: 4, z: -17, rot: 0 },
        { x: 0, y: 4, z: -17, rot: 0 },
        { x: 20, y: 4, z: -17, rot: 0 },
        { x: -20, y: 4, z: 17, rot: Math.PI },
        { x: 0, y: 4, z: 17, rot: Math.PI },
        { x: 20, y: 4, z: 17, rot: Math.PI }
    ];
    
    this.artworkSpots = artworkWallPositions;
    
    // ========================================
    // LIGHTING SYSTEM
    // ========================================
    
    // Warm ambient (candlelit atmosphere)
    const ambientWarm = new THREE.AmbientLight(0xffa86b, 0.4);
    room1.add(ambientWarm);
    
    // Main directional (sunlight through skylight)
    const sunlight = new THREE.DirectionalLight(0xfff8dc, 1.5);
    sunlight.position.set(0, libraryHeight - 1, 0);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 2048;
    sunlight.shadow.mapSize.height = 2048;
    sunlight.shadow.camera.left = -40;
    sunlight.shadow.camera.right = 40;
    sunlight.shadow.camera.top = 40;
    sunlight.shadow.camera.bottom = -40;
    sunlight.shadow.bias = -0.0005;
    room1.add(sunlight);
    
    // Wall sconces (brass oil lamps)
    const sconcePositions = [
        { x: -30, y: 4, z: -25 }, { x: -30, y: 4, z: 25 },
        { x: 30, y: 4, z: -25 }, { x: 30, y: 4, z: 25 },
        { x: -15, y: 4, z: -28 }, { x: 15, y: 4, z: -28 },
        { x: -15, y: 4, z: 28 }, { x: 15, y: 4, z: 28 }
    ];
    
    this.wallSconces = [];
    
    sconcePositions.forEach(pos => {
        // Sconce bracket
        const bracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.4, 0.3),
            bronzeMaterial
        );
        bracket.position.copy(pos);
        bracket.castShadow = true;
        room1.add(bracket);
        
        // Oil lamp
        const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            bronzeMaterial
        );
        lamp.position.copy(pos);
        lamp.position.y += 0.3;
        lamp.castShadow = true;
        room1.add(lamp);
        
        // Flame
        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffaa33,
                emissive: 0xff6600,
                emissiveIntensity: 2.0
            })
        );
        flame.position.copy(lamp.position);
        flame.position.y += 0.2;
        room1.add(flame);
        
        // Point light
        const light = new THREE.PointLight(0xff9944, 2.0, 12);
        light.position.copy(flame.position);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        room1.add(light);
        
        this.wallSconces.push({ flame, light, baseY: flame.position.y });
    });
    
    // Hanging bronze chandeliers (3 large ones)
    const chandelierPositions = [
        { x: 0, z: -15 },
        { x: -20, z: 10 },
        { x: 20, z: 10 }
    ];
    
    this.chandeliers = [];
    
    chandelierPositions.forEach(pos => {
        const chandelierGroup = new THREE.Group();
        
        // Chain
        const chain = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 8, 8),
            bronzeMaterial
        );
        chain.position.y = libraryHeight - 4;
        chain.castShadow = true;
        chandelierGroup.add(chain);
        
        // Main body (ornate bronze)
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            bronzeMaterial
        );
        body.position.y = libraryHeight - 8.5;
        body.castShadow = true;
        chandelierGroup.add(body);
        
        // 8 candle arms radiating outward
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const armLength = 1.2;
            
            // Arm
            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, armLength, 8),
                bronzeMaterial
            );
            arm.position.set(
                Math.cos(angle) * armLength / 2,
                libraryHeight - 8.5,
                Math.sin(angle) * armLength / 2
            );
            arm.rotation.z = -Math.cos(angle) * Math.PI / 4;
            arm.rotation.x = -Math.sin(angle) * Math.PI / 4;
            arm.castShadow = true;
            chandelierGroup.add(arm);
            
            // Candle holder
            const holder = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.06, 0.2, 8),
                bronzeMaterial
            );
            holder.position.set(
                Math.cos(angle) * armLength,
                libraryHeight - 8.5,
                Math.sin(angle) * armLength
            );
            holder.castShadow = true;
            chandelierGroup.add(holder);
            
            // Flame
            const flame = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xffaa33,
                    emissive: 0xff6600,
                    emissiveIntensity: 2.0
                })
            );
            flame.position.copy(holder.position);
            flame.position.y += 0.15;
            chandelierGroup.add(flame);
            
            // Point light
            const light = new THREE.PointLight(0xff9944, 1.8, 10);
            light.position.copy(flame.position);
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            chandelierGroup.add(light);
            
            if (!this.chandelierFlames) this.chandelierFlames = [];
            this.chandelierFlames.push({ flame, light, baseY: flame.position.y });
        }
        
        chandelierGroup.position.set(pos.x, 0, pos.z);
        room1.add(chandelierGroup);
        this.chandeliers.push(chandelierGroup);
    });
    
    // Fog atmosphere (dust and age)
    room1.fog = new THREE.FogExp2(0x2a2520, 0.008);
    
    // ========================================
    // FINAL SETUP
    // ========================================
    
    room1.position.set(0, 0, 0);
    this.rooms.push(room1);
    this.scene.add(room1);
    
    console.log("📚 Ancient Library of Alexandria created!");
}

// ========================================
// SUPPORTING TEXTURE GENERATION METHODS
// ========================================

generateWoodTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base wood color
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(0, 0, width, height);
    
    // Wood grain (vertical streaks)
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const grainWidth = Math.random() * 3 + 1;
        const shade = Math.random() * 40 + 30;
        ctx.fillStyle = `rgba(${shade}, ${shade * 0.7}, ${shade * 0.4}, 0.3)`;
        ctx.fillRect(x, 0, grainWidth, height);
    }
    
    // Growth rings
    for (let i = 0; i < 15; i++) {
        const y = Math.random() * height;
        const amplitude = Math.random() * 20 + 10;
        ctx.strokeStyle = `rgba(${20 + Math.random() * 20}, 10, 5, ${0.2 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            const yPos = y + Math.sin(x * 0.02 + i) * amplitude;
            if (x === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
        }
        ctx.stroke();
    }
    
    return canvas;
}

// ========================================
// ANIMATION UPDATES (Add to your existing animate loop)
// ========================================

updateLibraryAnimations() {
    const time = this.time || Date.now() * 0.001;
    
    // 1. CANDLE FLAMES FLICKER
    if (this.candleFlames) {
        this.candleFlames.forEach((candle, index) => {
            // Gentle flickering motion
            candle.flame.position.y = candle.baseY + Math.sin(time * 3 + index) * 0.02;
            candle.flame.scale.set(
                1 + Math.sin(time * 4 + index) * 0.1,
                1 + Math.cos(time * 3.5 + index) * 0.15,
                1 + Math.sin(time * 4 + index) * 0.1
            );
            
            // Light intensity flicker
            candle.light.intensity = 1.5 + Math.sin(time * 5 + index) * 0.3;
        });
    }
    
    // 2. CHANDELIER FLAMES
    if (this.chandelierFlames) {
        this.chandelierFlames.forEach((candle, index) => {
            candle.flame.position.y = candle.baseY + Math.sin(time * 2.8 + index) * 0.03;
            candle.light.intensity = 1.8 + Math.sin(time * 4.5 + index) * 0.4;
        });
    }
    
    // 3. WALL SCONCE FLAMES
    if (this.wallSconces) {
        this.wallSconces.forEach((sconce, index) => {
            sconce.flame.position.y = sconce.baseY + Math.sin(time * 3.2 + index) * 0.025;
            sconce.light.intensity = 2.0 + Math.sin(time * 4 + index) * 0.3;
        });
    }
    
    // 4. SCROLLS UNFURLING (when triggered)
    if (this.scrolls) {
        this.scrolls.forEach(scroll => {
            if (scroll.userData.isUnfurling && scroll.userData.unfurlAmount < 1) {
                scroll.userData.unfurlAmount += scroll.userData.unfurlSpeed;
                
                // Animate papyrus unrolling
                scroll.children[1].scale.x = scroll.userData.unfurlAmount;
                scroll.children[1].position.x = 0.4 * scroll.userData.unfurlAmount;
                
                // Show text gradually
                if (scroll.children[2]) {
                    scroll.children[2].material.opacity = scroll.userData.unfurlAmount * 0.8;
                }
            }
        });
    }
    
    // 5. DUST PARTICLES FLOATING
    if (this.dustParticles) {
        this.dustParticles.forEach(particle => {
            // Slow upward drift
            particle.position.add(particle.userData.velocity);
            
            // Brownian motion
            particle.position.x += (Math.random() - 0.5) * 0.01;
            particle.position.z += (Math.random() - 0.5) * 0.01;
            
            // Keep within cylindrical volume under skylight
            const distFromCenter = Math.sqrt(
                particle.position.x * particle.position.x +
                particle.position.z * particle.position.z
            );
            
            if (distFromCenter > 8) {
                const angle = Math.atan2(particle.position.z, particle.position.x);
                particle.position.x = Math.cos(angle) * 8;
                particle.position.z = Math.sin(angle) * 8;
            }
            
            // Reset when reaching ceiling
            if (particle.position.y > 24) {
                particle.position.y = 0.5;
            }
            
            // Fade based on distance from light shaft
            particle.material.opacity = 0.3 * (1 - distFromCenter / 8);
        });
    }
    
    // 6. GOD RAYS INTENSITY VARIATION (time of day effect)
    if (this.godRays) {
        const dayIntensity = 2.5 + Math.sin(time * 0.1) * 0.5;
        this.godRays.forEach(ray => {
            ray.intensity = dayIntensity;
        });
    }
    
    // 7. CHANDELIER SWAYING
    if (this.chandeliers) {
        this.chandeliers.forEach((chandelier, index) => {
            chandelier.rotation.z = Math.sin(time * 0.5 + index) * 0.02;
        });
    }
    
    // 8. SECRET DOOR ANIMATION
    if (this.secretPassages) {
        this.secretPassages.forEach(passage => {
            if (passage.door.userData.isOpen && passage.door.rotation.y < Math.PI / 2) {
                passage.door.rotation.y += 0.02;
                
                // Reveal hidden elements
                if (passage.door.rotation.y > Math.PI / 4) {
                    passage.corridor.visible = true;
                    passage.torch.visible = true;
                    passage.flame.visible = true;
                }
            } else if (!passage.door.userData.isOpen && passage.door.rotation.y > 0) {
                passage.door.rotation.y -= 0.02;
                
                // Hide hidden elements
                if (passage.door.rotation.y < Math.PI / 4) {
                    passage.corridor.visible = false;
                    passage.torch.visible = false;
                    passage.flame.visible = false;
                }
            }
        });
    }
}

// ========================================
// INTERACTION HANDLERS
// ========================================

handleLibraryInteractions(intersectedObject) {
    if (!intersectedObject) return;
    
    // Trigger scroll unfurling
    if (this.scrolls) {
        this.scrolls.forEach(scroll => {
            // Check if clicked object is the scroll or any of its children
            if (intersectedObject === scroll || 
                scroll.children.includes(intersectedObject) ||
                intersectedObject.parent === scroll) {
                scroll.userData.isUnfurling = true;
                console.log("📜 Scroll unfurling...");
                if (!this.clickSound.isPlaying) this.clickSound.play();
            }
        });
    }
    
    // Toggle secret passages
    if (this.secretPassages) {
        this.secretPassages.forEach(passage => {
            // Check if clicked on the door itself
            if (intersectedObject === passage.door || 
                intersectedObject.parent === passage.door) {
                passage.door.userData.isOpen = !passage.door.userData.isOpen;
                console.log(passage.door.userData.isOpen ? "🚪 Secret passage opened!" : "🚪 Secret passage closed");
                if (!this.clickSound.isPlaying) this.clickSound.play();
            }
        });
    }
}
toggleLightZone(zoneIndex) {
    console.log(`💡 Toggling light zone ${zoneIndex}`);
    
    // Find all lights in this zone
    const zoneLights = this.trackSpotlights.filter((_, i) => i % 4 === zoneIndex);
    
    zoneLights.forEach(light => {
        const currentIntensity = light.spotlight.intensity;
        const targetIntensity = currentIntensity > 1 ? 0 : 3.5;
        
        // Animate intensity change
        const duration = 500;
        const startTime = Date.now();
        const startIntensity = currentIntensity;
        
        const animateLight = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            light.spotlight.intensity = startIntensity + (targetIntensity - startIntensity) * progress;
            light.lens.material.emissiveIntensity = light.spotlight.intensity / 3.5 * 0.8;
            
            if (progress < 1) {
                requestAnimationFrame(animateLight);
            }
        };
        
        animateLight();
    });
    
    // Spark effect
    if (Math.random() > 0.7) {
        this.createSparkEffect(this.lightSwitches[zoneIndex].position);
    }
}

createSparkEffect(position) {
    const sparks = new THREE.Group();
    
    for (let i = 0; i < 8; i++) {
        const spark = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 4, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 1.0
            })
        );
        
        spark.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        
        sparks.add(spark);
    }
    
    sparks.position.copy(position);
    this.scene.add(sparks);
    
    // Animate sparks
    const startTime = Date.now();
    const duration = 800;
    
    const animateSparks = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            this.scene.remove(sparks);
            sparks.children.forEach(child => {
                child.geometry.dispose();
                child.material.dispose();
            });
            return;
        }
        
        sparks.children.forEach(spark => {
            spark.position.add(spark.userData.velocity);
            spark.userData.velocity.y -= 0.005; // Gravity
            spark.material.opacity = 1 - progress;
        });
        
        requestAnimationFrame(animateSparks);
    };
    
    animateSparks();
}
generateBoardFormedConcrete(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base concrete gray
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, width, height);
    
    // Horizontal wood grain lines (formwork boards)
    const boardHeight = 120;
    for (let y = 0; y < height; y += boardHeight) {
        // Darker seam line
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, y, width, 3);
        
        // Wood grain texture
        for (let i = 0; i < 50; i++) {
            const grainY = y + Math.random() * boardHeight;
            ctx.strokeStyle = `rgba(${60 + Math.random() * 20}, ${60 + Math.random() * 20}, ${60 + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(0, grainY);
            ctx.lineTo(width, grainY + (Math.random() - 0.5) * 10);
            ctx.stroke();
        }
    }
    
    // Random concrete imperfections
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 4 + 1;
        const shade = Math.random() * 40 + 40;
        ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.5)`;
        ctx.fillRect(x, y, size, size);
    }
    
    return canvas;
}
generateCarraraMarble(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base white marble
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, width, height);
    
    // Subtle gray veining (diagonal flow)
    const numVeins = 40;
    for (let i = 0; i < numVeins; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Mix of gray tones
        const grayValue = 200 + Math.random() * 40;
        const color = `rgba(${grayValue}, ${grayValue}, ${grayValue + 5}, ${0.15 + Math.random() * 0.25})`;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        // Diagonal angle for natural marble flow
        let angle = Math.PI / 4 + (Math.random() - 0.5) * 0.8;
        
        for (let j = 0; j < 150; j++) {
            angle += (Math.random() - 0.5) * 0.3;
            x += Math.cos(angle) * 8;
            y += Math.sin(angle) * 8;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Add occasional darker accent veins
    for (let i = 0; i < 8; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        ctx.strokeStyle = `rgba(150, 150, 155, ${0.2 + Math.random() * 0.2})`;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.PI / 4 + (Math.random() - 0.5) * 1.0;
        
        for (let j = 0; j < 100; j++) {
            angle += (Math.random() - 0.5) * 0.4;
            x += Math.cos(angle) * 12;
            y += Math.sin(angle) * 12;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Polished finish with subtle shine
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}
generateMetalGridPattern(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Dark metallic base
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = '#2a3f5f';
    ctx.lineWidth = 3;
    
    const gridSize = 128;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Tech details (random panels)
    ctx.fillStyle = '#00d4ff';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
        ctx.fillRect(x + 10, y + 10, gridSize - 20, gridSize - 20);
    }
    
    return canvas;
}

generateEarthTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Ocean base
    ctx.fillStyle = '#0a3d62';
    ctx.fillRect(0, 0, width, height);
    
    // Continents (simplified)
    ctx.fillStyle = '#2d5016';
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.5, width * 0.15, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Americas
    ctx.beginPath();
    ctx.ellipse(width * 0.2, height * 0.4, width * 0.1, height * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(width * 0.25, height * 0.6, width * 0.08, height * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.35, width * 0.18, height * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.32, width * 0.08, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.78, height * 0.65, width * 0.09, height * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 50 + 20;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ice caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.05, width * 0.2, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.95, width * 0.15, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

generateBlackMarquina(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Deep black base
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Gold and white veining
    const numVeins = 30;
    for (let i = 0; i < numVeins; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Mix of gold and white veins
        const isGold = Math.random() > 0.6;
        const color = isGold 
            ? `rgba(218, 165, 32, ${0.4 + Math.random() * 0.3})`  // Gold
            : `rgba(255, 255, 255, ${0.2 + Math.random() * 0.2})`; // White
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.random() * Math.PI * 2;
        
        for (let j = 0; j < 120; j++) {
            angle += (Math.random() - 0.5) * 0.4;
            x += Math.cos(angle) * 10;
            y += Math.sin(angle) * 10;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Polished finish
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}

generateMarbleNormalMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base normal map color (neutral normal)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Generate subtle height variation for normal map
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Perlin-like noise for realistic surface
            const noise = (Math.sin(x * 0.02) * Math.cos(y * 0.02)) * 0.5 + 0.5;
            const variation = (Math.random() - 0.5) * 30;
            
            // Normal map RGB channels (X, Y, Z surface normals)
            imageData.data[i] = 128 + noise * 25 + variation;     // R (X normal)
            imageData.data[i + 1] = 128 + noise * 25 + variation; // G (Y normal)
            imageData.data[i + 2] = 200 + noise * 45;             // B (Z normal - pointing up)
            imageData.data[i + 3] = 255;                           // Alpha
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
    generateModernWallTexture(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const i = (y * width + x) * 4;
                const noise = Math.sin(x * 0.05 + y * 0.05) * 0.5 + 0.5;
                imageData.data[i] = noise * 255;
                imageData.data[i + 1] = noise * 255;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 255;
            }
        }

        context.putImageData(imageData, 0, 0);
        return canvas;
    }

    generateNoiseCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 0.1 + 0.9;
            imageData.data[i] = 136 * noise;
            imageData.data[i + 1] = 136 * noise;
            imageData.data[i + 2] = 136 * noise;
            imageData.data[i + 3] = 255;
        }

        context.putImageData(imageData, 0, 0);
        return canvas;
    }

  createAvatar() {
    this.avatarGroup = new THREE.Group();
    const avatarMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1 // ✓ FIXED: Much less visible (was 0.3)
    });

    const clickablePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 })
    );
    clickablePlane.position.set(2, 1.7, 2);
    this.avatarGroup.add(clickablePlane);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 32), avatarMaterial);
    body.position.set(2, 0.5, 2);
    this.avatarGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), avatarMaterial);
    head.position.set(2, 1.2, 2);
    this.avatarGroup.add(head);

    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
    const leftArm = new THREE.Mesh(armGeometry, avatarMaterial);
    leftArm.position.set(1.7, 0.7, 2);
    leftArm.rotation.z = Math.PI / 4;
    this.avatarGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, avatarMaterial);
    rightArm.position.set(2.3, 0.7, 2);
    rightArm.rotation.z = -Math.PI / 4;
    this.avatarGroup.add(rightArm);

    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
    const leftLeg = new THREE.Mesh(legGeometry, avatarMaterial);
    leftLeg.position.set(1.8, 0.25, 2);
    this.avatarGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, avatarMaterial);
    rightLeg.position.set(2.2, 0.25, 2);
    this.avatarGroup.add(rightLeg);

    this.avatarGroup.userData = { isAvatar: true };
    this.scene.add(this.avatarGroup);

    this.setupAvatarAnimation();
    this.updateAvatarPosition();
}

    setupAvatarAnimation() {
        const times = [0, 1, 2];
        const armValues = [
            [Math.PI / 4, -Math.PI / 4],
            [-Math.PI / 4, Math.PI / 4],
            [Math.PI / 4, -Math.PI / 4]
        ];

        const leftArmTrack = new THREE.NumberKeyframeTrack(
            '.children[3].rotation[z]',
            times,
            armValues.map(v => v[0])
        );
        const rightArmTrack = new THREE.NumberKeyframeTrack(
            '.children[4].rotation[z]',
            times,
            armValues.map(v => v[1])
        );

        const clip = new THREE.AnimationClip('avatarWave', 2, [leftArmTrack, rightArmTrack]);
        const action = this.animationMixer.clipAction(clip, this.avatarGroup);
        action.setLoop(THREE.LoopRepeat);
        action.play();
    }

    updateAvatarPosition() {
        if (this.isMobile) {
            const roomCenter = this.rooms[this.currentRoom].position.clone();
            this.avatarGroup.position.copy(roomCenter);
            this.avatarGroup.position.y = 0.5;
        } else {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            direction.y = 0;
            direction.normalize().multiplyScalar(3);
            this.avatarGroup.position.copy(this.camera.position).add(direction);
            this.avatarGroup.position.y = 0.5;
        }
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
    this.updateLibraryAnimations(); // ← ADD THIS LINE
   
        this.renderer.render(this.scene, this.camera);
        this.updateArtworkProgress();
        if (this.isMobile) this.controls.update();
        this.updateAvatarPosition();
        
        if (this.isRecording) {
            // Frame capture handled by MediaRecorder
        }
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
    
    // 8. DUST PARTICLES (floating in god-rays)
    if (this.dustParticles) {
        this.dustParticles.forEach(particle => {
            // Slow upward drift
            particle.position.add(particle.userData.velocity);
            
            // Brownian motion (random walk)
            particle.position.x += (Math.random() - 0.5) * 0.01;
            particle.position.z += (Math.random() - 0.5) * 0.01;
            
            // Keep within cylinder around light shaft
            const center = particle.userData.center;
            const radius = particle.userData.radius;
            const distFromCenter = Math.sqrt(
                Math.pow(particle.position.x - center.x, 2) +
                Math.pow(particle.position.z - center.z, 2)
            );
            
            if (distFromCenter > radius) {
                const angle = Math.atan2(
                    particle.position.z - center.z,
                    particle.position.x - center.x
                );
                particle.position.x = center.x + Math.cos(angle) * radius;
                particle.position.z = center.z + Math.sin(angle) * radius;
            }
            
            // Reset when reaching top
            if (particle.position.y > 24) {
                particle.position.y = 0.5;
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
    }
    
    // ✨ NEW: Number keys for artwork navigation
    const num = parseInt(event.key);
    if (num >= 1 && num <= 9 && num <= this.images.length) {
        this.focusOnArtwork(num - 1);
    }
    
    // ✨ NEW: Arrow keys for navigation
    if (!this.isSliderActive) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            this.navigateToNextArtwork();
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            this.navigateToPrevArtwork();
        }
    }
    
    // ✨ NEW: Help toggle
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
    checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = 1.6;
        const roomBounds = this.rooms[this.currentRoom].position;
        const minX = -38;
        const maxX = 38;
        const minZ = -28;
        const maxZ = 28;

        this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        this.controls.getObject().position.copy(this.camera.position);
    }
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
        
        // ✓ FIXED: Include all interactive objects
        const interactiveObjects = [
            ...this.images.map(img => img.mesh),
            ...this.scene.children.filter(obj => (obj.parent && obj.parent.userData.isAvatar)),
            ...(this.scrolls || []).map(scroll => scroll.children).flat(), // All scroll children
            ...(this.secretPassages || []).map(p => p.door) // Secret doors
        ];
        
        const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
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
        else {
            // ========================================
            // ELEVATOR BUTTON INTERACTION
            // ========================================
            
            // Get all clickable objects in scene
            const clickableObjects = [];
            this.scene.traverse(child => {
                if (child.userData.isElevatorButton || 
                    child.userData.canMove || 
                    child.userData.isLightSwitch) {
                    clickableObjects.push(child);
                }
            });
            
            const clickIntersects = this.raycaster.intersectObjects(clickableObjects, true);
            
            if (clickIntersects.length > 0) {
                const clicked = clickIntersects[0].object;
                
                // ELEVATOR BUTTON CLICKED
                if (clicked.userData.isElevatorButton) {
                    this.callElevator(clicked.userData.targetLevel);
                    if (!this.clickSound.isPlaying) this.clickSound.play();
                }
                
                // MOVABLE WALL CLICKED
                else if (clicked.parent && clicked.parent.userData.canMove) {
                    this.moveWall(clicked.parent);
                    if (!this.clickSound.isPlaying) this.clickSound.play();
                }
            }
        }
        
        // ✓ FIXED: Handle library interactions for ANY intersected object
        if (intersects.length > 0) {
            this.handleLibraryInteractions(intersects[0].object);
        }
    }
    this.lastClickTime = currentTime;
}


callElevator(targetLevel) {
    if (!this.freightElevator) return;
    
    console.log(`🛗 Calling elevator to level ${targetLevel}`);
    
    const elevator = this.freightElevator;
    
    // Prevent multiple calls while moving
    if (elevator.userData.isMoving) {
        console.log("⏳ Elevator is already moving");
        return;
    }
    
    // Set target height based on level
    const levels = [0, 8, 15]; // Ground, Mezzanine 1, Mezzanine 2
    elevator.userData.targetY = levels[targetLevel];
    elevator.userData.currentLevel = targetLevel;
    elevator.userData.isMoving = true;
    
    // Show elevator UI
    this.showElevatorUI(targetLevel);
}

showElevatorUI(level) {
    const existing = document.getElementById('elevatorUI');
    if (existing) existing.remove();
    
    const ui = document.createElement('div');
    ui.id = 'elevatorUI';
    ui.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        color: #ffcc00;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: bold;
        border: 2px solid #ffcc00;
        animation: slideDown 0.3s ease;
    `;
    
    ui.innerHTML = `
        🛗 FREIGHT ELEVATOR: ${['GROUND FLOOR', 'MEZZANINE 1', 'MEZZANINE 2'][level]}
        <style>
            @keyframes slideDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(ui);
    
    setTimeout(() => {
        ui.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => ui.remove(), 500);
    }, 3000);
}
moveWall(wall) {
    if (!wall.userData.canMove) return;
    
    console.log("🚧 Moving wall panel...");
    
    // Animate wall sliding along track
    const currentX = wall.position.x;
    const trackStart = wall.userData.trackStart;
    const trackEnd = wall.userData.trackEnd;
    
    // Toggle between start and end positions
    let targetX;
    if (Math.abs(currentX - trackStart) < 1) {
        targetX = trackEnd;
    } else {
        targetX = trackStart;
    }
    
    const startX = currentX;
    const duration = 2000;
    const startTime = Date.now();
    
    const animateWall = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);
        
        wall.position.x = startX + (targetX - startX) * eased;
        
        // Grinding sound effect (visual vibration)
        if (progress < 1) {
            wall.rotation.z = Math.sin(elapsed * 0.05) * 0.005;
            requestAnimationFrame(animateWall);
        } else {
            wall.rotation.z = 0;
            console.log("✅ Wall moved to new position");
        }
    };
    
    animateWall();
    
    // Show notification
    this.showWallNotification();
}

showWallNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(139, 69, 19, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 16px;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">🚧</span>
            <span>Wall Panel Repositioning...</span>
        </div>
        <style>
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
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

const app = new ThreeJSApp();
app.init();
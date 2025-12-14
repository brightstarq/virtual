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
        { position: new THREE.Vector3(0, 1.6, 15), lookAt: new THREE.Vector3(0, 2, 0) }
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
    this.renderer.shadowMap.enabled = true;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // was 0.3
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
    // MATERIALS LIBRARY - RAW INDUSTRIAL
    // ========================================
    
    // 1. Raw board-formed concrete
    const rawConcreteMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.9,
        metalness: 0.05,
        envMapIntensity: 0.3
    });
    
    // Generate concrete texture
    const concreteTexture = this.generateBoardFormedConcrete(2048, 2048);
    const concreteTextureObj = new THREE.Texture(concreteTexture);
    concreteTextureObj.needsUpdate = true;
    concreteTextureObj.wrapS = concreteTextureObj.wrapT = THREE.RepeatWrapping;
    concreteTextureObj.repeat.set(4, 4);
    rawConcreteMaterial.map = concreteTextureObj;
    
    // 2. Acid-stained polished concrete floor
    const polishedFloorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2b1f,
        roughness: 0.3,
        metalness: 0.2,
        envMapIntensity: 0.8
    });
    
    // 3. Weathered rusted steel
    const rustedSteelMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.85,
        metalness: 0.3,
        envMapIntensity: 0.5
    });
    
    // 4. Chrome pipes and railings
    const chromeMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.1,
        metalness: 1.0,
        envMapIntensity: 2.0
    });
    
    // 5. Industrial steel grating (semi-transparent)
    const gratingMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    // 6. Exposed steel I-beams
    const iBeamMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a5a5a,
        roughness: 0.7,
        metalness: 0.8
    });
    
    // 7. Old wood crates
    const crateWoodMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b4423,
        roughness: 0.95,
        metalness: 0.0
    });
    
    // 8. Graffiti/street art surface
    const graffitiMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // 9. Frosted industrial glass
    const industrialGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.7,
        thickness: 0.5,
        roughness: 0.4,
        transparent: true,
        opacity: 0.6
    });
    
    // ========================================
    // MASSIVE CONCRETE SHELL STRUCTURE
    // ========================================
    
    const warehouseWidth = 80;
    const warehouseDepth = 60;
    const warehouseHeight = 25;
    
    // Main polished concrete floor with acid-stain pattern
    const mainFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(warehouseWidth, warehouseDepth),
        polishedFloorMaterial
    );
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.receiveShadow = true;
    room1.add(mainFloor);
    
    // Crack lines and expansion joints
    const crackPositions = [-20, -10, 0, 10, 20];
    crackPositions.forEach(pos => {
        // Longitudinal cracks
        const crackX = new THREE.Mesh(
            new THREE.BoxGeometry(warehouseWidth * 0.95, 0.05, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 1.0
            })
        );
        crackX.position.set(0, 0.01, pos);
        crackX.receiveShadow = true;
        room1.add(crackX);
        
        // Lateral cracks
        const crackZ = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.05, warehouseDepth * 0.95),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 1.0
            })
        );
        crackZ.position.set(pos, 0.01, 0);
        crackZ.receiveShadow = true;
        room1.add(crackZ);
    });
    
    // Random oil stains and water damage
    for (let i = 0; i < 15; i++) {
        const stain = new THREE.Mesh(
            new THREE.CircleGeometry(Math.random() * 2 + 0.5, 32),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.95,
                transparent: true,
                opacity: 0.6
            })
        );
        stain.position.set(
            (Math.random() - 0.5) * warehouseWidth * 0.9,
            0.02,
            (Math.random() - 0.5) * warehouseDepth * 0.9
        );
        stain.rotation.x = -Math.PI / 2;
        room1.add(stain);
    }
    
    // ========================================
    // MASSIVE CONCRETE COLUMNS (2m diameter)
    // ========================================
    
    const columnPositions = [
        { x: -30, z: -20 }, { x: -30, z: 0 }, { x: -30, z: 20 },
        { x: 0, z: -20 }, { x: 0, z: 20 },
        { x: 30, z: -20 }, { x: 30, z: 0 }, { x: 30, z: 20 }
    ];
    
    columnPositions.forEach(pos => {
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(1.0, 1.2, warehouseHeight, 16),
            rawConcreteMaterial
        );
        column.position.set(pos.x, warehouseHeight / 2, pos.z);
        column.castShadow = true;
        column.receiveShadow = true;
        room1.add(column);
        
        // Rebar exposed at top (weathering damage)
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const rebar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8),
                rustedSteelMaterial
            );
            rebar.position.set(
                pos.x + Math.cos(angle) * 0.9,
                warehouseHeight - 0.75,
                pos.z + Math.sin(angle) * 0.9
            );
            rebar.castShadow = true;
            room1.add(rebar);
        }
        
        // Water damage/rust stains running down
        const stain = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 8),
            new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            })
        );
        stain.position.set(pos.x, warehouseHeight / 2, pos.z + 1.0);
        room1.add(stain);
    });
    
    // ========================================
    // EXPOSED STEEL I-BEAMS & TRUSSES
    // ========================================
    
    // Main overhead beams (spanning width)
    for (let z = -25; z <= 25; z += 10) {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(warehouseWidth, 0.6, 0.4),
            iBeamMaterial
        );
        beam.position.set(0, warehouseHeight - 2, z);
        beam.castShadow = true;
        room1.add(beam);
        
        // Cross bracing
        for (let x = -35; x <= 35; x += 10) {
            const brace = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 12),
                iBeamMaterial
            );
            brace.position.set(x, warehouseHeight - 2, z);
            brace.rotation.x = Math.PI / 6;
            brace.castShadow = true;
            room1.add(brace);
        }
    }
    
    // Roof trusses
    for (let x = -30; x <= 30; x += 15) {
        // Top chord
        const topChord = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, warehouseDepth),
            iBeamMaterial
        );
        topChord.position.set(x, warehouseHeight - 1, 0);
        topChord.castShadow = true;
        room1.add(topChord);
        
        // Diagonal web members
        for (let z = -25; z < 25; z += 10) {
            const web = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.15, 12),
                iBeamMaterial
            );
            web.position.set(x, warehouseHeight - 2, z + 5);
            web.rotation.x = Math.PI / 4;
            room1.add(web);
        }
    }
    
    // ========================================
    // STEEL GRATING CATWALKS (Multi-Level)
    // ========================================
    
    this.catwalks = [];
    
    // Mezzanine Level 1 (8m high)
    const mezzanine1Paths = [
        { start: [-35, 8, -25], end: [-35, 8, 25] },
        { start: [35, 8, -25], end: [35, 8, 25] },
        { start: [-35, 8, -25], end: [35, 8, -25] },
        { start: [-35, 8, 25], end: [35, 8, 25] }
    ];
    
    mezzanine1Paths.forEach(path => {
        const length = Math.sqrt(
            Math.pow(path.end[0] - path.start[0], 2) +
            Math.pow(path.end[2] - path.start[2], 2)
        );
        
        const catwalk = new THREE.Mesh(
            new THREE.BoxGeometry(2.0, 0.1, length),
            gratingMaterial
        );
        
        const midX = (path.start[0] + path.end[0]) / 2;
        const midZ = (path.start[2] + path.end[2]) / 2;
        
        catwalk.position.set(midX, 8, midZ);
        
        if (path.start[0] !== path.end[0]) {
            catwalk.rotation.y = 0;
        } else {
            catwalk.rotation.y = Math.PI / 2;
        }
        
        catwalk.receiveShadow = true;
        catwalk.castShadow = true;
        room1.add(catwalk);
        this.catwalks.push(catwalk);
        
        // Safety railings (chain-link)
        const railing1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1.2, length),
            chromeMaterial
        );
        railing1.position.set(midX + (catwalk.rotation.y === 0 ? 0 : 1.0), 8.6, midZ + (catwalk.rotation.y === 0 ? 1.0 : 0));
        room1.add(railing1);
        
        const railing2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1.2, length),
            chromeMaterial
        );
        railing2.position.set(midX - (catwalk.rotation.y === 0 ? 0 : 1.0), 8.6, midZ - (catwalk.rotation.y === 0 ? 1.0 : 0));
        room1.add(railing2);
    });
    
    // Mezzanine Level 2 (15m high)
    const mezzanine2Positions = [
        { x: -25, z: -20, size: 8 },
        { x: 25, z: -20, size: 8 },
        { x: -25, z: 20, size: 8 },
        { x: 25, z: 20, size: 8 }
    ];
    
    mezzanine2Positions.forEach(pos => {
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(pos.size, 0.3, pos.size),
            rawConcreteMaterial
        );
        platform.position.set(pos.x, 15, pos.z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        room1.add(platform);
        
        // Cantilevered edge beam
        const edgeBeam = new THREE.Mesh(
            new THREE.BoxGeometry(pos.size + 0.4, 0.5, 0.3),
            iBeamMaterial
        );
        edgeBeam.position.set(pos.x, 14.85, pos.z + pos.size / 2);
        edgeBeam.castShadow = true;
        room1.add(edgeBeam);
        
        // Precarious safety cage (chain-link fencing)
        for (let side = 0; side < 4; side++) {
            const fence = new THREE.Mesh(
                new THREE.PlaneGeometry(pos.size, 2.0),
                new THREE.MeshStandardMaterial({
                    color: 0x5a5a5a,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide
                })
            );
            
            const angle = (side * Math.PI) / 2;
            fence.position.set(
                pos.x + Math.cos(angle) * (pos.size / 2),
                16,
                pos.z + Math.sin(angle) * (pos.size / 2)
            );
            fence.rotation.y = angle;
            room1.add(fence);
        }
    });
    
    // Industrial ladder access to mezzanines
    const ladderPositions = [
        { x: -35, z: -25 },
        { x: 35, z: 25 }
    ];
    
    ladderPositions.forEach(pos => {
        for (let y = 0; y < 8; y += 0.4) {
            const rung = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
                chromeMaterial
            );
            rung.position.set(pos.x, y, pos.z);
            rung.rotation.z = Math.PI / 2;
            rung.castShadow = true;
            room1.add(rung);
        }
        
        // Side rails
        const rail1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 8, 8),
            chromeMaterial
        );
        rail1.position.set(pos.x - 0.4, 4, pos.z);
        rail1.castShadow = true;
        room1.add(rail1);
        
        const rail2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 8, 8),
            chromeMaterial
        );
        rail2.position.set(pos.x + 0.4, 4, pos.z);
        rail2.castShadow = true;
        room1.add(rail2);
    });
    
    // ========================================
    // MASSIVE SKYLIGHTS (Grid Pattern)
    // ========================================
    
    const skylightPositions = [
        { x: -25, z: -15 }, { x: 0, z: -15 }, { x: 25, z: -15 },
        { x: -25, z: 0 }, { x: 0, z: 0 }, { x: 25, z: 0 },
        { x: -25, z: 15 }, { x: 0, z: 15 }, { x: 25, z: 15 }
    ];
    
    skylightPositions.forEach((pos, index) => {
        // Frosted industrial glass panel
        const skylight = new THREE.Mesh(
            new THREE.BoxGeometry(12, 0.2, 8),
            industrialGlassMaterial
        );
        skylight.position.set(pos.x, warehouseHeight - 0.1, pos.z);
        skylight.receiveShadow = true;
        room1.add(skylight);
        
        // Some skylights are "broken" (missing glass)
        if (index === 2 || index === 7) {
            skylight.visible = false;
            
            // Broken glass shards on floor below
            for (let i = 0; i < 8; i++) {
                const shard = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3 + Math.random() * 0.5, 0.5 + Math.random() * 0.8),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.7,
                        side: THREE.DoubleSide
                    })
                );
                shard.position.set(
                    pos.x + (Math.random() - 0.5) * 10,
                    0.05,
                    pos.z + (Math.random() - 0.5) * 6
                );
                shard.rotation.x = -Math.PI / 2;
                shard.rotation.z = Math.random() * Math.PI;
                room1.add(shard);
            }
        }
        
        // Metal frame around skylight
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(12.4, 0.3, 8.4),
            iBeamMaterial
        );
        frame.position.set(pos.x, warehouseHeight - 0.25, pos.z);
        frame.castShadow = true;
        room1.add(frame);
        
        // God rays coming through (especially broken ones)
        if (index === 2 || index === 7) {
            const godRay = new THREE.SpotLight(0xffffee, 4.0, 30, Math.PI / 6, 0.8);
            godRay.position.set(pos.x, warehouseHeight - 0.5, pos.z);
            godRay.target.position.set(pos.x, 0, pos.z);
            godRay.castShadow = true;
            godRay.shadow.mapSize.width = 1024;
            godRay.shadow.mapSize.height = 1024;
            room1.add(godRay);
            room1.add(godRay.target);
        }
    });
    
    // ========================================
    // GIANT FREIGHT ELEVATOR (INTERACTIVE)
    // ========================================
    
    const elevatorGroup = new THREE.Group();
    
    // Elevator platform (5m × 5m)
    const elevatorPlatform = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.3, 5),
        gratingMaterial
    );
    elevatorPlatform.position.set(0, 0.15, -28);
    elevatorPlatform.castShadow = true;
    elevatorPlatform.receiveShadow = true;
    elevatorGroup.add(elevatorPlatform);
    
    // Safety cage (yellow industrial color)
    const cageMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        roughness: 0.6,
        metalness: 0.8
    });
    
    // Cage frame
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 3.0, 0.1),
            cageMaterial
        );
        post.position.set(
            Math.cos(angle) * 2.4,
            1.5,
            -28 + Math.sin(angle) * 2.4
        );
        elevatorGroup.add(post);
    }
    
    // Cage mesh walls
    for (let side = 0; side < 4; side++) {
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 3),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            })
        );
        wall.position.set(
            side % 2 === 0 ? 0 : (side === 1 ? 2.5 : -2.5),
            1.5,
            side % 2 === 1 ? -28 : (side === 0 ? -30.5 : -25.5)
        );
        wall.rotation.y = side % 2 === 0 ? 0 : Math.PI / 2;
        elevatorGroup.add(wall);
    }
    
    // Exposed cables (4 corners)
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, warehouseHeight + 5, 8),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.8,
                metalness: 0.7
            })
        );
        cable.position.set(
            Math.cos(angle) * 2.3,
            warehouseHeight / 2 + 2.5,
            -28 + Math.sin(angle) * 2.3
        );
        room1.add(cable);
    }
    
    // Control panel on wall
    const controlPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.7
        })
    );
    controlPanel.position.set(-3, 1.6, -30.5);
    room1.add(controlPanel);
    
    // Elevator buttons (3 levels)
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16),
            new THREE.MeshStandardMaterial({
                color: i === 0 ? 0x00ff00 : 0xff0000,
                emissive: i === 0 ? 0x00ff00 : 0xff0000,
                emissiveIntensity: 0.5
            })
        );
        button.position.set(-3, 1.8 - i * 0.2, -30.4);
        button.rotation.x = Math.PI / 2;
        button.userData.isElevatorButton = true;
        button.userData.targetLevel = i;
        room1.add(button);
        
        // Label
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(['G', 'M1', 'M2'][i], 64, 90);
        
        const labelTexture = new THREE.CanvasTexture(canvas);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.15, 0.15),
            new THREE.MeshBasicMaterial({ map: labelTexture })
        );
        label.position.set(-2.8, 1.8 - i * 0.2, -30.4);
        room1.add(label);
    }
    
    // Warning lights (red, flashing when moving)
    for (let i = 0; i < 2; i++) {
        const warningLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 1.5
            })
        );
        warningLight.position.set(i === 0 ? -2 : 2, 3.2, -28);
        elevatorGroup.add(warningLight);
        
        const light = new THREE.PointLight(0xff0000, 2.0, 8);
        light.position.copy(warningLight.position);
        elevatorGroup.add(light);
    }
    
    elevatorGroup.position.y = 0;
    elevatorGroup.userData.currentLevel = 0;
    elevatorGroup.userData.isElevator = true;
    room1.add(elevatorGroup);
    this.freightElevator = elevatorGroup;
    
    // ========================================
    // ABANDONED MACHINERY AS ART
    // ========================================
    
    // Large rusted turbine (3m diameter)
    const turbineGroup = new THREE.Group();
    
    const turbineBody = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 2.0, 32),
        rustedSteelMaterial
    );
    turbineBody.rotation.z = Math.PI / 2;
    turbineBody.castShadow = true;
    turbineGroup.add(turbineBody);
    
    // Turbine blades
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1.8, 0.05),
            rustedSteelMaterial
        );
        blade.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
        blade.rotation.z = angle + Math.PI / 2;
        blade.castShadow = true;
        turbineGroup.add(blade);
    }
    
    turbineGroup.position.set(15, 2, 18);
    turbineGroup.userData.rotationSpeed = 0.002; // Slow ambient rotation
    room1.add(turbineGroup);
    this.turbine = turbineGroup;
    
    // Old conveyor belt system
    const conveyorLength = 20;
    const conveyor = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, conveyorLength),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8
        })
    );
    conveyor.position.set(-20, 1.5, 0);
    conveyor.castShadow = true;
    room1.add(conveyor);
    
    // Conveyor rollers
    for (let z = -conveyorLength / 2; z < conveyorLength / 2; z += 1) {
        const roller = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.5, 12),
            chromeMaterial
        );
        roller.position.set(-20, 1.65, z);
        roller.rotation.z = Math.PI / 2;
        roller.castShadow = true;
        room1.add(roller);
    }
    
    // Support legs
    for (let z = -8; z <= 8; z += 8) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.5, 0.1),
            iBeamMaterial
        );
        leg.position.set(-20.6, 0.75, z);
        leg.castShadow = true;
        room1.add(leg);
    }
    
    // Vintage control panels with flickering gauges
    const controlPanelGroup = new THREE.Group();
    
    const panelBack = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.0, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.6
        })
    );
    panelBack.castShadow = true;
    controlPanelGroup.add(panelBack);
    
    // Analog gauges (8 circular meters)
    for (let i = 0; i < 8; i++) {
        const gauge = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 32),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                emissive: 0x00ff00,
                emissiveIntensity: 0.3
            })
        );
        gauge.position.set(
            -1.0 + (i % 4) * 0.6,
            0.5 - Math.floor(i / 4) * 0.8,
            0.11
        );
        controlPanelGroup.add(gauge);
        
        // Gauge needle
        const needle = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.15, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        needle.position.copy(gauge.position);
        needle.position.z += 0.01;
        needle.rotation.z = (Math.random() - 0.5) * Math.PI;
        controlPanelGroup.add(needle);
    }
    
    // Warning labels
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 256;
    const labelCtx = labelCanvas.getContext('2d');
    labelCtx.fillStyle = '#ffcc00';
    labelCtx.font = 'bold 60px Arial';
    labelCtx.fillText('DANGER', 20, 80);
    labelCtx.fillText('HIGH VOLTAGE', 20, 160);
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    
    const warning = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.8),
        new THREE.MeshBasicMaterial({ map: labelTexture })
    );
    warning.position.set(0, -0.8, 0.11);
    controlPanelGroup.add(warning);
    
    controlPanelGroup.position.set(-15, 3, -28);
    controlPanelGroup.rotation.y = Math.PI;
    room1.add(controlPanelGroup);
    
    // Steam pipes with occasional "steam" vents
    this.steamVents = [];
    
    const pipeConfigs = [
        { start: [-35, 10, -25], end: [-35, 10, 25], diameter: 0.4 },
        { start: [35, 12, -25], end: [35, 12, 25], diameter: 0.3 },
        { start: [-30, warehouseHeight - 3, -25], end: [30, warehouseHeight - 3, -25], diameter: 0.5 }
    ];
    
    pipeConfigs.forEach((config, pipeIndex) => {
        const length = Math.sqrt(
            Math.pow(config.end[0] - config.start[0], 2) +
            Math.pow(config.end[1] - config.start[1], 2) +
            Math.pow(config.end[2] - config.start[2], 2)
        );
        
        const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(config.diameter, config.diameter, length, 16),
            chromeMaterial
        );
        
        const midX = (config.start[0] + config.end[0]) / 2;
        const midY = (config.start[1] + config.end[1]) / 2;
        const midZ = (config.start[2] + config.end[2]) / 2;
        
        pipe.position.set(midX, midY, midZ);
        
        // Rotate pipe to align with endpoints
        if (config.start[2] !== config.end[2]) {
            pipe.rotation.x = Math.PI / 2;
        } else if (config.start[0] !== config.end[0]) {
            pipe.rotation.z = Math.PI / 2;
        }
        
        pipe.castShadow = true;
        room1.add(pipe);
        
        // Pipe joints every 10m
        const numJoints = Math.floor(length / 10);
        for (let j = 0; j < numJoints; j++) {
            const t = (j + 1) / (numJoints + 1);
            const joint = new THREE.Mesh(
                new THREE.SphereGeometry(config.diameter * 1.3, 16, 16),
                rustedSteelMaterial
            );
            joint.position.set(
                config.start[0] + (config.end[0] - config.start[0]) * t,
                config.start[1] + (config.end[1] - config.start[1]) * t,
                config.start[2] + (config.end[2] - config.start[2]) * t
            );
            joint.castShadow = true;
            room1.add(joint);
        }
        
        // Steam vent (randomly positioned along pipe)
        const ventPos = new THREE.Vector3(
            config.start[0] + (config.end[0] - config.start[0]) * 0.3,
            config.start[1] + (config.end[1] - config.start[1]) * 0.3,
            config.start[2] + (config.end[2] - config.start[2]) * 0.3
        );
        
        this.steamVents.push({
            position: ventPos,
            lastPuff: 0,
            interval: 3000 + Math.random() * 5000
        });
    });
    
    // ========================================
    // SHIPPING CONTAINER GALLERIES (6 Total)
    // ========================================
    
    this.shippingContainers = [];
    
    const containerConfigs = [
        { x: -35, z: 10, rot: 0, color: 0x8b0000, open: true },
        { x: -35, z: -10, rot: 0, color: 0x1a4d7a, open: true },
        { x: 35, z: 10, rot: Math.PI, color: 0x2d5016, open: true },
        { x: 35, z: -10, rot: Math.PI, color: 0x8b4513, open: false },
        { x: 0, z: 25, rot: -Math.PI / 2, color: 0x4a4a4a, open: true },
        { x: 20, z: -25, rot: Math.PI / 6, color: 0xffcc00, open: false, sideways: true }
    ];
    
    containerConfigs.forEach(config => {
        const containerGroup = new THREE.Group();
        
        // Container body (20ft standard)
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 2.6, 6.0),
            new THREE.MeshStandardMaterial({
                color: config.color,
                roughness: 0.85,
                metalness: 0.6
            })
        );
        body.castShadow = true;
        body.receiveShadow = true;
        containerGroup.add(body);
        
        // Corrugated texture (vertical ribs)
        for (let z = -2.8; z <= 2.8; z += 0.3) {
            const rib = new THREE.Mesh(
                new THREE.BoxGeometry(2.42, 2.62, 0.05),
                new THREE.MeshStandardMaterial({
                    color: config.color,
                    roughness: 0.9,
                    metalness: 0.5
                })
            );
            rib.position.z = z;
            containerGroup.add(rib);
        }
        
        // Weathering/rust patches
        for (let i = 0; i < 8; i++) {
            const rust = new THREE.Mesh(
                new THREE.CircleGeometry(0.2 + Math.random() * 0.3, 16),
                new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 1.0
                })
            );
            rust.position.set(
                (Math.random() - 0.5) * 2.2,
                (Math.random() - 0.5) * 2.4,
                3.01
            );
            containerGroup.add(rust);
        }
        
        // Dents (deformed geometry)
        const dent = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({
                color: config.color,
                roughness: 0.85,
                metalness: 0.6
            })
        );
        dent.position.set(0.8, 0, 2.5);
        dent.rotation.y = Math.PI;
        containerGroup.add(dent);
        
        // Container doors (double doors at back)
        if (config.open) {
            // Left door (open 90 degrees)
            const leftDoor = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 2.5, 0.1),
                new THREE.MeshStandardMaterial({
                    color: config.color,
                    roughness: 0.8,
                    metalness: 0.7
                })
            );
            leftDoor.position.set(-1.8, 0, -3.0);
            leftDoor.rotation.y = -Math.PI / 2;
            leftDoor.castShadow = true;
            containerGroup.add(leftDoor);
            
            // Right door (open 90 degrees)
            const rightDoor = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 2.5, 0.1),
                new THREE.MeshStandardMaterial({
                    color: config.color,
                    roughness: 0.8,
                    metalness: 0.7
                })
            );
            rightDoor.position.set(1.8, 0, -3.0);
            rightDoor.rotation.y = Math.PI / 2;
            rightDoor.castShadow = true;
            containerGroup.add(rightDoor);
            
            // Interior mini-gallery setup
            // Fluorescent light inside
            const interiorLight = new THREE.RectAreaLight(0xffffcc, 3.0, 2.0, 2.4);
            interiorLight.position.set(0, 1.2, 0);
            interiorLight.rotation.x = -Math.PI / 2;
            containerGroup.add(interiorLight);
            
            // Interior walls (white gallery walls)
            const interiorWall = new THREE.Mesh(
                new THREE.PlaneGeometry(2.2, 2.4),
                new THREE.MeshStandardMaterial({
                    color: 0xf5f5f5,
                    roughness: 0.9
                })
            );
            interiorWall.position.set(0, 0, 2.95);
            interiorWall.receiveShadow = true;
            containerGroup.add(interiorWall);
            
            // Industrial fan (not running)
            const fan = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
                new THREE.MeshStandardMaterial({
                    color: 0x3a3a3a,
                    roughness: 0.5
                })
            );
            fan.position.set(0.8, 1.0, 2.8);
            fan.rotation.z = Math.PI / 2;
            containerGroup.add(fan);
        } else {
            // Closed doors
            const closedDoor = new THREE.Mesh(
                new THREE.BoxGeometry(2.4, 2.5, 0.1),
                new THREE.MeshStandardMaterial({
                    color: config.color,
                    roughness: 0.8,
                    metalness: 0.7
                })
            );
            closedDoor.position.set(0, 0, -3.05);
            closedDoor.castShadow = true;
            containerGroup.add(closedDoor);
            
            // Locking bars
            const lockBar = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.08, 0.08),
                chromeMaterial
            );
            lockBar.position.set(0, 0, -3.1);
            containerGroup.add(lockBar);
        }
        
        // Container markings (shipping codes)
        const markingCanvas = document.createElement('canvas');
        markingCanvas.width = 512;
        markingCanvas.height = 256;
        const mCtx = markingCanvas.getContext('2d');
        mCtx.fillStyle = '#ffffff';
        mCtx.font = 'bold 60px Courier';
        mCtx.fillText(`MAEU ${Math.floor(Math.random() * 900000 + 100000)}`, 20, 80);
        mCtx.font = '40px Courier';
        mCtx.fillText('22G1', 20, 140);
        mCtx.fillText(`TARE: ${2300 + Math.floor(Math.random() * 500)} kg`, 20, 200);
        const markingTex = new THREE.CanvasTexture(markingCanvas);
        
        const marking = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.8),
            new THREE.MeshBasicMaterial({ map: markingTex })
        );
        marking.position.set(0, 0.5, 3.01);
        containerGroup.add(marking);
        
        // Position container
        if (config.sideways) {
            containerGroup.position.set(config.x, 1.3, config.z);
            containerGroup.rotation.set(0, config.rot, Math.PI / 2);
        } else {
            containerGroup.position.set(config.x, 1.3, config.z);
            containerGroup.rotation.y = config.rot;
        }
        
        room1.add(containerGroup);
        this.shippingContainers.push(containerGroup);
    });
    
    // ========================================
    // MOVABLE WALL PANELS ON TRACKS
    // ========================================
    
    this.movableWalls = [];
    
    const wallConfigs = [
        { x: -10, z: 0, width: 6, height: 8 },
        { x: 0, z: 5, width: 8, height: 8 },
        { x: 10, z: -5, width: 5, height: 7 }
    ];
    
    wallConfigs.forEach(config => {
        const wallGroup = new THREE.Group();
        
        // Main concrete panel
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(config.width, config.height, 0.3),
            rawConcreteMaterial
        );
        panel.position.y = config.height / 2;
        panel.castShadow = true;
        panel.receiveShadow = true;
        wallGroup.add(panel);
        
        // Graffiti layer (wheat paste posters)
        const graffiti = new THREE.Mesh(
            new THREE.PlaneGeometry(config.width * 0.9, config.height * 0.8),
            graffitiMaterial
        );
        graffiti.position.set(0, config.height / 2, 0.16);
        wallGroup.add(graffiti);
        
        // Random street art stickers
        for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
            const sticker = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3 + Math.random() * 0.4, 0.4 + Math.random() * 0.5),
                new THREE.MeshBasicMaterial({
                    color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00][Math.floor(Math.random() * 4)],
                    transparent: true,
                    opacity: 0.8
                })
            );
            sticker.position.set(
                (Math.random() - 0.5) * config.width * 0.8,
                Math.random() * config.height,
                0.17
            );
            wallGroup.add(sticker);
        }
        
        // Wheeled base (industrial casters)
        for (let i = 0; i < 4; i++) {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                new THREE.MeshStandardMaterial({
                    color: 0x2a2a2a,
                    roughness: 0.8
                })
            );
            wheel.position.set(
                (i % 2 === 0 ? -1 : 1) * (config.width / 2 - 0.5),
                0.15,
                (i < 2 ? -1 : 1) * 0.15
            );
            wheel.rotation.x = Math.PI / 2;
            wheel.castShadow = true;
            wallGroup.add(wheel);
        }
        
        // Floor track (rusty rails)
        const track = new THREE.Mesh(
            new THREE.BoxGeometry(config.width + 2, 0.05, 0.15),
            rustedSteelMaterial
        );
        track.position.set(config.x, 0.025, config.z);
        room1.add(track);
        
        wallGroup.position.set(config.x, 0, config.z);
        wallGroup.userData.canMove = true;
        wallGroup.userData.trackStart = config.x - 3;
        wallGroup.userData.trackEnd = config.x + 3;
        room1.add(wallGroup);
        this.movableWalls.push(wallGroup);
    });
    
    // ========================================
    // SUSPENDED WIRE ARTWORK SYSTEM
    // ========================================
    
    this.suspendedArtworks = [];
    
    const suspendedPositions = [
        { x: -15, y: 6, z: -10 },
        { x: 0, y: 5, z: -15 },
        { x: 15, y: 7, z: -8 },
        { x: -10, y: 8, z: 10 },
        { x: 10, y: 6, z: 12 }
    ];
    
    suspendedPositions.forEach(pos => {
        // Steel cable from ceiling
        const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, warehouseHeight - pos.y, 8),
            new THREE.MeshStandardMaterial({
                color: 0x5a5a5a,
                roughness: 0.7,
                metalness: 0.8
            })
        );
        cable.position.set(pos.x, (warehouseHeight + pos.y) / 2, pos.z);
        cable.castShadow = true;
        room1.add(cable);
        
        // Pulley mechanism at ceiling
        const pulley = new THREE.Mesh(
            new THREE.TorusGeometry(0.15, 0.05, 16, 32),
            chromeMaterial
        );
        pulley.position.set(pos.x, warehouseHeight - 0.5, pos.z);
        pulley.rotation.x = Math.PI / 2;
        room1.add(pulley);
        
        // Suspended artwork frame (empty frame for now, artwork added later)
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 3.5, 0.15),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.6,
                metalness: 0.7
            })
        );
        frame.position.set(pos.x, pos.y, pos.z);
        frame.castShadow = true;
        frame.receiveShadow = true;
        frame.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
        frame.userData.swayAmount = 0.05 + Math.random() * 0.1;
        room1.add(frame);
        
        this.suspendedArtworks.push(frame);
        
        // Clip/hook at top of frame
        const hook = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.03, 8, 16),
            chromeMaterial
        );
        hook.position.set(pos.x, pos.y + 1.8, pos.z);
        room1.add(hook);
    });
    
    // ========================================
    // MASSIVE OVERHEAD TRACK LIGHTING GANTRY
    // ========================================
    
    this.trackSpotlights = [];
    
    // Main lighting gantry (motorized track system)
    const gantryTracks = [
        { x: -25, z: 0, length: warehouseDepth },
        { x: -12, z: 0, length: warehouseDepth },
        { x: 0, z: 0, length: warehouseDepth },
        { x: 12, z: 0, length: warehouseDepth },
        { x: 25, z: 0, length: warehouseDepth }
    ];
    
    gantryTracks.forEach((track, trackIndex) => {
        // Aluminum track rail
        const rail = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, track.length),
            new THREE.MeshStandardMaterial({
                color: 0xa8a8a8,
                roughness: 0.25,
                metalness: 0.9
            })
        );
        rail.position.set(track.x, warehouseHeight - 1.5, 0);
        rail.castShadow = true;
        room1.add(rail);
        
        // Power cables draped along track
        const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, track.length, 8),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.8
            })
        );
        cable.position.set(track.x + 0.1, warehouseHeight - 1.7, 0);
        cable.rotation.x = Math.PI / 2;
        room1.add(cable);
        
        // Theater-style spotlights (8-12 per track)
        const numLights = 10;
        for (let i = 0; i < numLights; i++) {
            const lightGroup = new THREE.Group();
            
            // Fixture housing (cylinder)
            const housing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.18, 0.4, 16),
                new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    roughness: 0.4,
                    metalness: 0.8
                })
            );
            housing.castShadow = true;
            lightGroup.add(housing);
            
            // Barn doors (4 flaps)
            for (let b = 0; b < 4; b++) {
                const angle = (b * Math.PI) / 2;
                const door = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.08, 0.02),
                    new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a,
                        roughness: 0.5,
                        metalness: 0.7
                    })
                );
                door.position.set(
                    Math.cos(angle) * 0.15,
                    -0.25 + Math.sin(angle) * 0.15,
                    0
                );
                door.rotation.z = angle;
                lightGroup.add(door);
            }
            
            // LED lens with colored gel (random)
            const gelColors = [0xffffff, 0xff6b6b, 0x6b9dff, 0xffcc66, 0x66ff66];
            const lens = new THREE.Mesh(
                new THREE.CircleGeometry(0.1, 16),
                new THREE.MeshStandardMaterial({
                    color: gelColors[trackIndex % gelColors.length],
                    emissive: gelColors[trackIndex % gelColors.length],
                    emissiveIntensity: 0.8,
                    transparent: true,
                    opacity: 0.7
                })
            );
            lens.position.y = -0.21;
            lightGroup.add(lens);
            
            // Actual spotlight
            const spotlight = new THREE.SpotLight(
                gelColors[trackIndex % gelColors.length],
                3.5,
                30,
                Math.PI / 7,
                0.6
            );
            spotlight.position.y = -0.3;
            spotlight.castShadow = (i % 3 === 0);
            if (spotlight.castShadow) {
                spotlight.shadow.mapSize.width = 1024;
                spotlight.shadow.mapSize.height = 1024;
                spotlight.shadow.bias = -0.0005;
            }
            lightGroup.add(spotlight);
            
            // Target (points downward with slight random angle)
            const target = new THREE.Object3D();
            target.position.set(
                (Math.random() - 0.5) * 5,
                0,
                (Math.random() - 0.5) * 5
            );
            lightGroup.add(target);
            spotlight.target = target;
            
            // Position on track
            const z = -track.length / 2 + (i / (numLights - 1)) * track.length;
            lightGroup.position.set(track.x, warehouseHeight - 2.0, z);
            
            // Random rotation for dramatic angles
            lightGroup.rotation.x = Math.random() * 0.3 - 0.15;
            lightGroup.rotation.z = Math.random() * 0.3 - 0.15;
            
            room1.add(lightGroup);
            this.trackSpotlights.push({
                group: lightGroup,
                spotlight: spotlight,
                lens: lens
            });
        }
    });
    
    // ========================================
    // EDISON BULB STRING LIGHTS
    // ========================================
    
    this.edisonBulbs = [];
    
    const stringConfigs = [
        { start: [-35, 18, -25], end: [35, 18, -25] },
        { start: [-35, 18, 25], end: [35, 18, 25] },
        { start: [-35, 18, -25], end: [-35, 18, 25] },
        { start: [35, 18, -25], end: [35, 18, 25] }
    ];
    
    stringConfigs.forEach(config => {
        const numBulbs = 15;
        for (let i = 0; i < numBulbs; i++) {
            const t = i / (numBulbs - 1);
            const pos = new THREE.Vector3(
                config.start[0] + (config.end[0] - config.start[0]) * t,
                config.start[1] + (config.end[1] - config.start[1]) * t - Math.sin(t * Math.PI) * 2,
                config.start[2] + (config.end[2] - config.start[2]) * t
            );
            
            // Bulb filament (warm glow)
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 16, 16),
                new THREE.MeshStandardMaterial({
                    color: 0xffd699,
                    emissive: 0xffa500,
                    emissiveIntensity: 1.2,
                    transparent: true,
                    opacity: 0.8
                })
            );
            bulb.position.copy(pos);
            room1.add(bulb);
            
            // Warm tungsten light
            const light = new THREE.PointLight(0xffa500, 1.5, 6);
            light.position.copy(pos);
            room1.add(light);
            
            this.edisonBulbs.push({ bulb, light });
            
            // Power cord segment
            if (i > 0) {
                const prevT = (i - 1) / (numBulbs - 1);
                const prevPos = new THREE.Vector3(
                    config.start[0] + (config.end[0] - config.start[0]) * prevT,
                    config.start[1] + (config.end[1] - config.start[1]) * prevT - Math.sin(prevT * Math.PI) * 2,
                    config.start[2] + (config.end[2] - config.start[2]) * prevT
                );
                
                const cordLength = pos.distanceTo(prevPos);
                const cord = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, cordLength, 8),
                    new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
                );
                
                const midPoint = new THREE.Vector3().addVectors(pos, prevPos).multiplyScalar(0.5);
                cord.position.copy(midPoint);
                cord.lookAt(pos);
                cord.rotation.x += Math.PI / 2;
                
                room1.add(cord);
            }
        }
    });
    
    // ========================================
    // DUST PARTICLE SYSTEM (In God-Rays)
    // ========================================
    
    this.dustParticles = [];
    
    // Only create dust in areas with broken skylights
    skylightPositions.forEach((pos, index) => {
        if (index === 2 || index === 7) { // Broken skylights
            for (let i = 0; i < 100; i++) {
                const particle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.02, 4, 4),
                    new THREE.MeshBasicMaterial({
                        color: 0xcccccc,
                        transparent: true,
                        opacity: 0.4
                    })
                );
                
                particle.position.set(
                    pos.x + (Math.random() - 0.5) * 8,
                    Math.random() * warehouseHeight,
                    pos.z + (Math.random() - 0.5) * 6
                );
                
                particle.userData = {
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.005,
                        0.01 + Math.random() * 0.02,
                        (Math.random() - 0.5) * 0.005
                    ),
                    center: new THREE.Vector3(pos.x, warehouseHeight / 2, pos.z),
                    radius: 4
                };
                
                room1.add(particle);
                this.dustParticles.push(particle);
            }
        }
    });
    
    // ========================================
    // AMBIENT & ACCENT LIGHTING
    // ========================================
    
    // Harsh overhead fluorescents (some flickering)
    for (let x = -30; x <= 30; x += 15) {
        for (let z = -20; z <= 20; z += 20) {
            const fluorescentLight = new THREE.RectAreaLight(0xffffee, 2.5, 4, 1);
            fluorescentLight.position.set(x, warehouseHeight - 3, z);
            fluorescentLight.rotation.x = -Math.PI / 2;
            room1.add(fluorescentLight);
            
            // Visible fixture housing
            const fixture = new THREE.Mesh(
                new THREE.BoxGeometry(4.2, 0.3, 1.2),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: 0xffffee,
                    emissiveIntensity: 0.5
                })
            );
            fixture.position.set(x, warehouseHeight - 3, z);
            room1.add(fixture);
        }
    }
    
    // Emergency exit signs (red glow)
    const exitPositions = [
        { x: -38, y: 3, z: -28 },
        { x: 38, y: 3, z: -28 },
        { x: 0, y: 3, z: 28 }
    ];
    
    exitPositions.forEach(pos => {
        const exitSign = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.4, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 2.0
            })
        );
        exitSign.position.set(pos.x, pos.y, pos.z);
        room1.add(exitSign);
        
        const exitLight = new THREE.PointLight(0xff0000, 1.5, 8);
        exitLight.position.copy(exitSign.position);
        room1.add(exitLight);
    });
    
    // Ambient warehouse darkness
    const ambientDark = new THREE.AmbientLight(0x404040, 0.3);
    room1.add(ambientDark);
    
    // Directional "daylight" from broken skylights
    const daylight = new THREE.DirectionalLight(0xffffee, 1.2);
    daylight.position.set(10, warehouseHeight, 5);
    daylight.castShadow = true;
    daylight.shadow.mapSize.width = 2048;
    daylight.shadow.mapSize.height = 2048;
    daylight.shadow.camera.left = -50;
    daylight.shadow.camera.right = 50;
    daylight.shadow.camera.top = 50;
    daylight.shadow.camera.bottom = -50;
    room1.add(daylight);
    
    // ========================================
    // ABANDONED OFFICE CONTROL ROOM (Side Area)
    // ========================================
    
    const officeGroup = new THREE.Group();
    
    // Glass walls (dirty, cracked)
    for (let side = 0; side < 4; side++) {
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(side % 2 === 0 ? 8 : 6, 3, 0.1),
            new THREE.MeshPhysicalMaterial({
                color: 0x888888,
                transmission: 0.3,
                thickness: 0.5,
                roughness: 0.8,
                transparent: true,
                opacity: 0.7
            })
        );
        
        if (side === 0) wall.position.set(0, 1.5, 3);
        else if (side === 1) wall.position.set(4, 1.5, 0);
        else if (side === 2) wall.position.set(0, 1.5, -3);
        else wall.position.set(-4, 1.5, 0);
        
        wall.rotation.y = (side % 2 === 0 ? 0 : Math.PI / 2);
        officeGroup.add(wall);
    }
    
    // Desk with scattered papers
    const desk = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.1, 1.2),
        new THREE.MeshStandardMaterial({
            color: 0x6b4423,
            roughness: 0.8
        })
    );
    desk.position.set(0, 0.8, 0);
    desk.castShadow = true;
    officeGroup.add(desk);
    
    // Desk legs
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.8, 0.08),
            crateWoodMaterial
        );
        leg.position.set(
            (i % 2 === 0 ? -1 : 1) * 0.9,
            0.4,
            (i < 2 ? -1 : 1) * 0.5
        );
        leg.castShadow = true;
        officeGroup.add(leg);
    }
    
    // Vintage computer monitor (green CRT glow)
    const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.4, 0.4),
        new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.6
        })
    );
    monitor.position.set(0, 1.1, 0);
    monitor.castShadow = true;
    officeGroup.add(monitor);
    
    // CRT screen (glowing)
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 0.28),
        new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1.5
        })
    );
    screen.position.set(0, 1.1, 0.21);
    officeGroup.add(screen);
    
    const screenLight = new THREE.PointLight(0x00ff00, 1.5, 4);
    screenLight.position.set(0, 1.1, 0.3);
    officeGroup.add(screenLight);
    
    // Coffee mug with mold
    const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        })
    );
    mug.position.set(0.4, 0.9, 0.3);
    mug.castShadow = true;
    officeGroup.add(mug);
    
    // Moldy liquid inside
    const mold = new THREE.Mesh(
        new THREE.CircleGeometry(0.055, 16),
        new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 1.0
        })
    );
    mold.position.set(0.4, 0.95, 0.3);
    mold.rotation.x = -Math.PI / 2;
    officeGroup.add(mold);
    
    // Calendar stuck on old date
    const calendar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.4),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9
        })
    );
    calendar.position.set(-3.9, 1.5, 0);
    calendar.rotation.y = Math.PI / 2;
    officeGroup.add(calendar);
    
    // Flickering overhead fluorescent
    const officeLight = new THREE.RectAreaLight(0xffffee, 2.0, 1.5, 1.5);
    officeLight.position.set(0, 2.8, 0);
    officeLight.rotation.x = -Math.PI / 2;
    officeGroup.add(officeLight);
    this.officeFlicker = officeLight;
    
    officeGroup.position.set(30, 0, 0);
    room1.add(officeGroup);
    
    // ========================================
    // KINETIC SCULPTURE / ART INSTALLATION
    // ========================================
    
    const sculptureGroup = new THREE.Group();
    
    // Abstract geometric sculpture (rusted metal)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const piece = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 3 + Math.random() * 2, 0.3),
            rustedSteelMaterial
        );
        piece.position.set(
            Math.cos(angle) * 2,
            2.5,
            Math.sin(angle) * 2
        );
        piece.rotation.set(
            (Math.random() - 0.5) * 0.5,
            angle,
            (Math.random() - 0.5) * 0.5
        );
        piece.castShadow = true;
        sculptureGroup.add(piece);
    }
    
    sculptureGroup.position.set(0, 0, 0);
    sculptureGroup.userData.rotationSpeed = 0.001;
    room1.add(sculptureGroup);
    this.centerSculpture = sculptureGroup;
    
    // Dramatic spotlight on sculpture
    const sculptureSpot = new THREE.SpotLight(0xffffff, 5.0, 20, Math.PI / 8, 0.4);
    sculptureSpot.position.set(0, warehouseHeight - 2, 0);
    sculptureSpot.target.position.set(0, 2, 0);
    sculptureSpot.castShadow = true;
    room1.add(sculptureSpot);
    room1.add(sculptureSpot.target);
    
    // ========================================
    // FINAL SETUP
    // ========================================
    
    room1.position.set(0, 0, 0);
    this.rooms.push(room1);
    this.scene.add(room1);
    
    console.log("🏭 Brutalist industrial warehouse gallery created!");
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

// ============================================================================
// HELPER FUNCTION: Generate Carrara Marble Texture
// Add this function after generateConcreteTexture() (around line 569)
// ============================================================================

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
        if (this.isAnimatingObjects) {
            this.images.forEach(img => {
                img.mesh.rotation.y += 0.02 * this.animationSpeed;
            });
            this.wallLights.forEach(light => {
                light.left.rotation.y += 0.03 * this.animationSpeed;
                light.right.rotation.y += 0.03 * this.animationSpeed;
            });
            this.glassSpotlights.forEach(light => {
                light.mesh.rotation.y += 0.01 * this.animationSpeed;
            });
        }
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
           const minX = -16;
const maxX = 16;
const minZ = -16;
const maxZ = 16;

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
            const intersects = this.raycaster.intersectObjects([...this.images.map(img => img.mesh), ...this.scene.children.filter(obj => (obj.parent && obj.parent.userData.isAvatar))]);

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
        }
        this.lastClickTime = currentTime;
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
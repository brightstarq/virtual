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
    // MEDIEVAL DUNGEON CATACOMBS SYSTEM
    // ========================================
    
    this.torches = [];
    this.armorSuits = [];
    this.rats = [];
    this.waterDrips = [];
    this.chains = [];
    this.gates = [];
    this.boneAlcoves = [];
    this.smokeParticles = [];
    this.treasureChests = [];
    
    this.createDungeonStructure();
    this.createTorches();
    this.createBoneAlcoves();
    this.createArmorGuards();
    this.createIronGates();
    this.createTreasureRoom();
    this.createWaterDrips();
    this.createRats();
    this.createChains();
    this.createDungeonUI();
    
    console.log("🏰 Medieval Dungeon Catacombs created!");
}

// ========================================
// DUNGEON STRUCTURE
// ========================================

createDungeonStructure() {
    const dungeonRoom = new THREE.Group();
    dungeonRoom.visible = true;
    
    const dungeonWidth = 50;
    const dungeonLength = 80;
    const dungeonHeight = 12;
    
    // ========================================
    // MATERIALS
    // ========================================
    
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.95,
        metalness: 0.1
    });
    
    const darkStoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.98,
        metalness: 0.05
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    const mossyMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a4a2a,
        roughness: 0.9,
        metalness: 0.0
    });
    
    // ========================================
    // STONE FLOOR (irregular flagstones)
    // ========================================
    
    const floorSize = 3;
    const tilesX = Math.ceil(dungeonWidth / floorSize);
    const tilesZ = Math.ceil(dungeonLength / floorSize);
    
    for (let x = 0; x < tilesX; x++) {
        for (let z = 0; z < tilesZ; z++) {
            const useLight = (x + z) % 3 !== 0;
            const tile = new THREE.Mesh(
                new THREE.BoxGeometry(
                    floorSize - 0.1,
                    0.3 + Math.random() * 0.2,
                    floorSize - 0.1
                ),
                useLight ? stoneMaterial : darkStoneMaterial
            );
            tile.position.set(
                -dungeonWidth/2 + x * floorSize + floorSize/2,
                0.15,
                -dungeonLength/2 + z * floorSize + floorSize/2
            );
            tile.receiveShadow = true;
            dungeonRoom.add(tile);
            
            // Moss on some tiles
            if (Math.random() < 0.15) {
                const moss = new THREE.Mesh(
                    new THREE.PlaneGeometry(floorSize * 0.6, floorSize * 0.6),
                    mossyMaterial
                );
                moss.rotation.x = -Math.PI / 2;
                moss.position.set(
                    tile.position.x,
                    0.35,
                    tile.position.z
                );
                dungeonRoom.add(moss);
            }
        }
    }
    
    // ========================================
    // VAULTED CEILING (Gothic arches)
    // ========================================
    
    const numArches = 8;
    for (let i = 0; i < numArches; i++) {
        const z = -dungeonLength/2 + (i / (numArches - 1)) * dungeonLength;
        
        // Create pointed gothic arch
        const archPoints = [];
        const segments = 20;
        
        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const angle = t * Math.PI;
            let x = Math.cos(angle) * dungeonWidth / 2;
            let y = Math.sin(angle) * dungeonHeight * 0.8 + dungeonHeight * 0.2;
            
            // Make it pointed at top
            if (t > 0.3 && t < 0.7) {
                y += Math.sin((t - 0.3) / 0.4 * Math.PI) * dungeonHeight * 0.3;
            }
            
            archPoints.push(new THREE.Vector3(x, y, z));
        }
        
        const archCurve = new THREE.CatmullRomCurve3(archPoints);
        const archGeometry = new THREE.TubeGeometry(archCurve, segments, 0.5, 8, false);
        const arch = new THREE.Mesh(archGeometry, darkStoneMaterial);
        arch.castShadow = true;
        dungeonRoom.add(arch);
        
        // Stone blocks along arch
        for (let j = 0; j < 10; j++) {
            const t = j / 9;
            const point = archCurve.getPoint(t);
            
            const block = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 0.8),
                stoneMaterial
            );
            block.position.copy(point);
            dungeonRoom.add(block);
        }
    }
    
    // Ceiling between arches
    for (let i = 0; i < numArches - 1; i++) {
        const z = -dungeonLength/2 + ((i + 0.5) / (numArches - 1)) * dungeonLength;
        
        const ceilingPanel = new THREE.Mesh(
            new THREE.PlaneGeometry(dungeonWidth, dungeonLength / numArches * 0.9),
            darkStoneMaterial
        );
        ceilingPanel.rotation.x = Math.PI / 2;
        ceilingPanel.position.set(0, dungeonHeight, z);
        ceilingPanel.receiveShadow = true;
        dungeonRoom.add(ceilingPanel);
    }
    
    // ========================================
    // STONE WALLS (with texture)
    // ========================================
    
    const wallPositions = [
        { x: -dungeonWidth/2, z: 0, width: dungeonLength },
        { x: dungeonWidth/2, z: 0, width: dungeonLength },
        { x: 0, z: -dungeonLength/2, width: dungeonWidth },
        { x: 0, z: dungeonLength/2, width: dungeonWidth }
    ];
    
    wallPositions.forEach((wall, wallIndex) => {
        const isVertical = wallIndex < 2;
        
        // Main wall surface
        const wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(
                isVertical ? 1 : wall.width,
                dungeonHeight,
                isVertical ? wall.width : 1
            ),
            stoneMaterial
        );
        wallMesh.position.set(wall.x, dungeonHeight/2, wall.z);
        wallMesh.receiveShadow = true;
        dungeonRoom.add(wallMesh);
        
        // Stone blocks on walls
        const numBlocks = 20;
        for (let i = 0; i < numBlocks; i++) {
            const block = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1.5, 0.8),
                Math.random() < 0.7 ? stoneMaterial : darkStoneMaterial
            );
            
            if (isVertical) {
                block.position.set(
                    wall.x,
                    2 + (i % 5) * 2,
                    -wall.width/2 + (Math.floor(i / 5) / 3) * wall.width
                );
            } else {
                block.position.set(
                    -wall.width/2 + (Math.floor(i / 5) / 3) * wall.width,
                    2 + (i % 5) * 2,
                    wall.z
                );
            }
            
            dungeonRoom.add(block);
        }
    });
    
    // ========================================
    // STONE PILLARS (support columns)
    // ========================================
    
    const pillarPositions = [
        { x: -15, z: -30 },
        { x: 15, z: -30 },
        { x: -15, z: -10 },
        { x: 15, z: -10 },
        { x: -15, z: 10 },
        { x: 15, z: 10 },
        { x: -15, z: 30 },
        { x: 15, z: 30 }
    ];
    
    pillarPositions.forEach(pos => {
        // Main pillar
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, dungeonHeight, 8),
            darkStoneMaterial
        );
        pillar.position.set(pos.x, dungeonHeight/2, pos.z);
        pillar.castShadow = true;
        dungeonRoom.add(pillar);
        
        // Stone rings around pillar
        for (let i = 0; i < 4; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1.1, 0.15, 8, 8),
                stoneMaterial
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.set(pos.x, 2 + i * 2.5, pos.z);
            dungeonRoom.add(ring);
        }
        
        // Capital at top
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(1.4, 1.2, 0.8, 8),
            stoneMaterial
        );
        capital.position.set(pos.x, dungeonHeight - 0.4, pos.z);
        dungeonRoom.add(capital);
        
        // Base at bottom
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.5, 0.8, 8),
            stoneMaterial
        );
        base.position.set(pos.x, 0.4, pos.z);
        dungeonRoom.add(base);
    });
    
    // ========================================
    // AMBIENT LIGHTING (Very dim)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0x442200, 0.1);
    dungeonRoom.add(ambientLight);
    
    // Fog for atmosphere
    this.scene.fog = new THREE.Fog(0x000000, 20, 60);
    
    // ========================================
    // ARTWORK DISPLAY LOCATIONS
    // ========================================
    
    this.dungeonArtworkSpots = [];
    
    // Main corridor artworks (8 pieces)
    for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -30 + Math.floor(i / 2) * 20;
        
        this.dungeonArtworkSpots.push({
            x: side * 20,
            y: 5,
            z: z,
            rot: side === -1 ? Math.PI/2 : -Math.PI/2
        });
    }
    
    // Treasure room artworks (will add later)
    this.dungeonArtworkSpots.push({
        x: 0,
        y: 5,
        z: 35,
        rot: Math.PI
    });
    
    dungeonRoom.position.set(0, 0, 0);
    this.rooms.push(dungeonRoom);
    this.scene.add(dungeonRoom);
}

// ========================================
// WALL TORCHES (flickering flames)
// ========================================

createTorches() {
    const torchPositions = [
        // Main corridor torches
        { x: -20, y: 6, z: -30 },
        { x: 20, y: 6, z: -30 },
        { x: -20, y: 6, z: -10 },
        { x: 20, y: 6, z: -10 },
        { x: -20, y: 6, z: 10 },
        { x: 20, y: 6, z: 10 },
        { x: -20, y: 6, z: 30 },
        { x: 20, y: 6, z: 30 },
        // Center pillars
        { x: 0, y: 7, z: -25 },
        { x: 0, y: 7, z: 0 },
        { x: 0, y: 7, z: 25 }
    ];
    
    torchPositions.forEach((pos, index) => {
        const torch = this.createTorch();
        torch.position.set(pos.x, pos.y, pos.z);
        torch.userData.flickerPhase = Math.random() * Math.PI * 2;
        torch.userData.flickerSpeed = 3 + Math.random() * 2;
        
        this.rooms[0].add(torch);
        this.torches.push(torch);
    });
}

createTorch() {
    const torchGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.9
    });
    
    // Wall bracket (iron)
    const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.3),
        ironMaterial
    );
    torchGroup.add(bracket);
    
    const bracketArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.2, 0.2),
        ironMaterial
    );
    bracketArm.position.set(0.4, 0, 0);
    torchGroup.add(bracketArm);
    
    // Torch handle (wood)
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8),
        woodMaterial
    );
    handle.position.set(0.8, 0.3, 0);
    torchGroup.add(handle);
    
    // Flame (animated)
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.6, 8),
        new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.9
        })
    );
    flame.position.set(0.8, 0.8, 0);
    torchGroup.add(flame);
    torchGroup.userData.flame = flame;
    
    // Inner flame (yellow)
    const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.4, 6),
        new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        })
    );
    innerFlame.position.set(0.8, 0.9, 0);
    torchGroup.add(innerFlame);
    torchGroup.userData.innerFlame = innerFlame;
    
    // Point light (warm orange)
    const light = new THREE.PointLight(0xff6600, 2, 15);
    light.position.set(0.8, 0.8, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    torchGroup.add(light);
    torchGroup.userData.light = light;
    
    // Smoke particles (3 per torch)
    for (let i = 0; i < 3; i++) {
        const smoke = new THREE.Mesh(
            new THREE.SphereGeometry(0.1 + i * 0.05, 6, 6),
            new THREE.MeshBasicMaterial({
                color: 0x222222,
                transparent: true,
                opacity: 0.3 - i * 0.08
            })
        );
        smoke.position.set(0.8, 1.2 + i * 0.3, 0);
        smoke.userData.baseY = 1.2 + i * 0.3;
        smoke.userData.riseSpeed = 0.015 + i * 0.005;
        smoke.userData.phase = i;
        torchGroup.add(smoke);
        this.smokeParticles.push(smoke);
    }
    
    return torchGroup;
}

// ========================================
// BONE ALCOVES (skulls and bones)
// ========================================

createBoneAlcoves() {
    const alcovePositions = [
        // Left wall alcoves
        { x: -23, y: 3, z: -20 },
        { x: -23, y: 3, z: 0 },
        { x: -23, y: 3, z: 20 },
        // Right wall alcoves
        { x: 23, y: 3, z: -20 },
        { x: 23, y: 3, z: 0 },
        { x: 23, y: 3, z: 20 }
    ];
    
    alcovePositions.forEach(pos => {
        const alcove = this.createBoneAlcove();
        alcove.position.set(pos.x, pos.y, pos.z);
        alcove.rotation.y = pos.x < 0 ? -Math.PI/2 : Math.PI/2;
        
        this.rooms[0].add(alcove);
        this.boneAlcoves.push(alcove);
    });
}

createBoneAlcove() {
    const alcoveGroup = new THREE.Group();
    
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.95
    });
    
    const boneMaterial = new THREE.MeshStandardMaterial({
        color: 0xddddc8,
        roughness: 0.8
    });
    
    // Alcove recess
    const recess = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 1),
        stoneMaterial
    );
    recess.position.z = -0.5;
    alcoveGroup.add(recess);
    
    // Arch top
    const arch = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.3, 16, 1, false, 0, Math.PI),
        stoneMaterial
    );
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 1.5, -0.5);
    alcoveGroup.add(arch);
    
    // Skulls (stacked)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
            const skull = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                boneMaterial
            );
            skull.scale.set(1, 1.2, 1);
            skull.position.set(
                -0.4 + col * 0.8,
                0.3 + row * 0.5,
                -0.3
            );
            skull.rotation.y = (Math.random() - 0.5) * 0.5;
            alcoveGroup.add(skull);
            
            // Eye sockets
            [-0.08, 0.08].forEach(x => {
                const socket = new THREE.Mesh(
                    new THREE.SphereGeometry(0.04, 6, 6),
                    new THREE.MeshBasicMaterial({ color: 0x000000 })
                );
                socket.position.copy(skull.position);
                socket.position.x += x;
                socket.position.y += 0.05;
                socket.position.z += 0.18;
                alcoveGroup.add(socket);
            });
        }
    }
    
    // Bones (femurs crossed)
    for (let i = 0; i < 4; i++) {
        const bone = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.06, 0.8, 6),
            boneMaterial
        );
        bone.position.set(
            -0.3 + (i % 2) * 0.6,
            -0.5 + Math.floor(i / 2) * 0.4,
            -0.2
        );
        bone.rotation.z = i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
        alcoveGroup.add(bone);
    }
    
    return alcoveGroup;
}

// ========================================
// ARMOR GUARDS (standing suits)
// ========================================

createArmorGuards() {
    const armorPositions = [
        { x: -18, z: -25, facing: 'center' },
        { x: 18, z: -25, facing: 'center' },
        { x: -18, z: -5, facing: 'center' },
        { x: 18, z: -5, facing: 'center' },
        { x: -18, z: 15, facing: 'center' },
        { x: 18, z: 15, facing: 'center' }
    ];
    
    armorPositions.forEach(pos => {
        const armor = this.createArmorSuit();
        armor.position.set(pos.x, 0, pos.z);
        armor.rotation.y = pos.x < 0 ? Math.PI/4 : -Math.PI/4;
        
        this.rooms[0].add(armor);
        this.armorSuits.push(armor);
    });
}

createArmorSuit() {
    const armorGroup = new THREE.Group();
    
    const armorMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.6,
        metalness: 0.9
    });
    
    const rustMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        metalness: 0.4
    });
    
    // Stone base/pedestal
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1, 0.5, 8),
        new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.9
        })
    );
    base.position.y = 0.25;
    armorGroup.add(base);
    
    // ========================================
    // LEGS
    // ========================================
    
    [-0.3, 0.3].forEach(x => {
        // Upper leg
        const upperLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.22, 1, 8),
            armorMaterial
        );
        upperLeg.position.set(x, 1, 0);
        armorGroup.add(upperLeg);
        
        // Knee guard
        const knee = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            armorMaterial
        );
        knee.position.set(x, 0.5, 0);
        armorGroup.add(knee);
        
        // Lower leg
        const lowerLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.18, 0.8, 8),
            armorMaterial
        );
        lowerLeg.position.set(x, 0.1, 0);
        armorGroup.add(lowerLeg);
        
        // Foot (sabatons)
        const foot = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.2, 0.5),
            armorMaterial
        );
        foot.position.set(x, -0.2, 0.1);
        armorGroup.add(foot);
    });
    
    // ========================================
    // TORSO
    // ========================================
    
    // Breastplate
    const breastplate = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.4),
        armorMaterial
    );
    breastplate.position.y = 2.2;
    breastplate.castShadow = true;
    armorGroup.add(breastplate);
    
    // Decorative engravings (rust colored)
    const engraving = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.41),
        rustMaterial
    );
    engraving.position.set(0, 2.2, 0);
    armorGroup.add(engraving);
    
    // Pauldrons (shoulders)
    [-0.5, 0.5].forEach(x => {
        const pauldron = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            armorMaterial
        );
        pauldron.scale.set(1.2, 1, 0.8);
        pauldron.position.set(x, 2.8, 0);
        armorGroup.add(pauldron);
    });
    
    // ========================================
    // ARMS
    // ========================================
    
    [-0.6, 0.6].forEach((x, index) => {
        // Upper arm
        const upperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.16, 0.8, 8),
            armorMaterial
        );
        upperArm.position.set(x, 2.2, 0);
        armorGroup.add(upperArm);
        
        // Elbow guard
        const elbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            armorMaterial
        );
        elbow.position.set(x, 1.7, 0);
        armorGroup.add(elbow);
        
        // Forearm
        const forearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.7, 8),
            armorMaterial
        );
        forearm.position.set(x, 1.2, 0);
        armorGroup.add(forearm);
        
        // Gauntlet
        const gauntlet = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.3, 0.15),
            armorMaterial
        );
        gauntlet.position.set(x, 0.8, 0);
        armorGroup.add(gauntlet);
        
        // Weapon (only for right hand)
        if (index === 1) {
            // Halberd/Spear
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 3, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x3a2a1a,
                    roughness: 0.9
                })
            );
            shaft.position.set(x, 2.5, 0);
            armorGroup.add(shaft);
            
            // Spear tip
            const spearTip = new THREE.Mesh(
                new THREE.ConeGeometry(0.1, 0.5, 8),
                armorMaterial
            );
            spearTip.position.set(x, 4.25, 0);
            armorGroup.add(spearTip);
        }
    });
    
    // ========================================
    // HELMET
    // ========================================
    
    // Helmet base
    const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        armorMaterial
    );
    helmet.position.y = 3.5;
    armorGroup.add(helmet);
    
    // Visor
    const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.3, 0.05),
        new THREE.MeshBasicMaterial({
            color: 0x000000
        })
    );
    visor.position.set(0, 3.4, 0.35);
    armorGroup.add(visor);
    
    // Helmet crest
    const crest = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.5),
        rustMaterial
    );
    crest.position.set(0, 3.8, 0);
    armorGroup.add(crest);
    
    // Plume
    const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.6, 8),
        new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.8
        })
    );
    plume.position.set(0, 4.3, -0.1);
    armorGroup.add(plume);
    
    // Shield (left side)
    const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.2, 6),
        armorMaterial
    );
    shield.rotation.z = Math.PI / 2;
    shield.rotation.y = Math.PI / 6;
    shield.position.set(-0.8, 2, -0.3);
    armorGroup.add(shield);
    
    // Shield emblem (cross)
    const emblem = new THREE.Group();
    const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.8, 0.05),
        rustMaterial
    );
    emblem.add(crossV);
    
    const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.05),
        rustMaterial
    );
    crossH.position.y = 0.2;
    emblem.add(crossH);
    
    emblem.position.copy(shield.position);
    emblem.position.x -= 0.15;
    emblem.rotation.copy(shield.rotation);
    armorGroup.add(emblem);
    
    return armorGroup;
}

// ========================================
// IRON GATES (prison cells)
// ========================================

createIronGates() {
    const gatePositions = [
        { x: -23, z: -35, side: 'left' },
        { x: 23, z: -35, side: 'right' },
        { x: -23, z: 5, side: 'left' },
        { x: 23, z: 5, side: 'right' }
    ];
    
    gatePositions.forEach(pos => {
        const gate = this.createIronGate();
        gate.position.set(pos.x, 0, pos.z);
        gate.rotation.y = pos.side === 'left' ? Math.PI/2 : -Math.PI/2;
        
        this.rooms[0].add(gate);
        this.gates.push(gate);
    });
}

createIronGate() {
    const gateGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.8
    });
    
    const rustMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        metalness: 0.3
    });
    
    // Frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4, 6, 0.3),
        ironMaterial
    );
    frame.position.y = 3;
    gateGroup.add(frame);
    
    // Vertical bars (10 bars)
    for (let i = 0; i < 10; i++) {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 5.5, 8),
            i % 3 === 0 ? rustMaterial : ironMaterial
        );
        bar.position.set(-1.8 + i * 0.4, 3, 0);
        gateGroup.add(bar);
    }
    
    // Horizontal bars (3 bars)
    for (let i = 0; i < 3; i++) {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 3.8, 8),
            ironMaterial
        );
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 1.5 + i * 1.5, 0);
        gateGroup.add(bar);
    }
    
    // Lock mechanism
    const lock = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.3),
        rustMaterial
    );
    lock.position.set(1.5, 3, 0);
    gateGroup.add(lock);
    
    // Keyhole
    const keyhole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    keyhole.rotation.z = Math.PI / 2;
    keyhole.position.set(1.5, 3, 0);
    gateGroup.add(keyhole);
    
    // Chains attached
    const chainAttach = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.04, 8, 16),
        ironMaterial
    );
    chainAttach.position.set(-1.8, 5, 0);
    gateGroup.add(chainAttach);
    
    return gateGroup;
}

// ========================================
// TREASURE ROOM (special gallery)
// ========================================

createTreasureRoom() {
    const treasureGroup = new THREE.Group();
    
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.9
    });
    
    // Central treasure platform
    const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 9, 0.8, 16),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        })
    );
    platform.position.set(0, 0.4, 32);
    treasureGroup.add(platform);
    
    // Steps leading up
    for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(
            new THREE.CylinderGeometry(9 + i, 9.5 + i, 0.4, 16),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.95
            })
        );
        step.position.set(0, -0.2 - i * 0.4, 32);
        treasureGroup.add(step);
    }
    
    // Treasure chests (4 around platform)
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const chest = this.createTreasureChest();
        chest.position.set(
            Math.cos(angle) * 6,
            0.8,
            32 + Math.sin(angle) * 6
        );
        chest.rotation.y = angle + Math.PI;
        treasureGroup.add(chest);
        this.treasureChests.push(chest);
    }
    
    // Gold piles
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const goldPile = new THREE.Group();
        
        // Stack of gold coins
        for (let j = 0; j < 5; j++) {
            const coin = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
                goldMaterial
            );
            coin.position.set(
                (Math.random() - 0.5) * 0.2,
                j * 0.1,
                (Math.random() - 0.5) * 0.2
            );
            coin.rotation.y = Math.random() * Math.PI;
            goldPile.add(coin);
        }
        
        goldPile.position.set(
            Math.cos(angle) * 7,
            0.8,
            32 + Math.sin(angle) * 7
        );
        treasureGroup.add(goldPile);
    }
    
    // Crown on pedestal (center)
    const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 1.5, 8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8
        })
    );
    pedestal.position.set(0, 1.55, 32);
    treasureGroup.add(pedestal);
    
    const crown = this.createCrown();
    crown.position.set(0, 2.5, 32);
    crown.userData.rotationSpeed = 0.01;
    treasureGroup.add(crown);
    this.treasureChests.push(crown); // For animation
    
    this.rooms[0].add(treasureGroup);
}

createTreasureChest() {
    const chestGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.9
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    // Chest body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.8),
        woodMaterial
    );
    chestGroup.add(body);
    
    // Lid (curved)
    const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16, 1, false, 0, Math.PI),
        woodMaterial
    );
    lid.rotation.z = Math.PI / 2;
    lid.position.y = 0.6;
    chestGroup.add(lid);
    
    // Iron bands
    for (let i = 0; i < 3; i++) {
        const band = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.1, 0.1),
            ironMaterial
        );
        band.position.set(0, -0.3 + i * 0.3, 0.4);
        chestGroup.add(band);
    }
    
    // Lock
    const lock = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.2),
        ironMaterial
    );
    lock.position.set(0, 0, 0.5);
    chestGroup.add(lock);
    
    return chestGroup;
}

createCrown() {
    const crownGroup = new THREE.Group();
    
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.2,
        metalness: 1.0,
        emissive: 0x443300,
        emissiveIntensity: 0.3
    });
    
    const gemMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.1,
        metalness: 0.5,
        emissive: 0x660000,
        emissiveIntensity: 0.5
    });
    
    // Base ring
    const base = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.08, 12, 24),
        goldMaterial
    );
    base.rotation.x = Math.PI / 2;
    crownGroup.add(base);
    
    // Points (8 points)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const point = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.4, 8),
            goldMaterial
        );
        point.position.set(
            Math.cos(angle) * 0.4,
            0.2,
            Math.sin(angle) * 0.4
        );
        crownGroup.add(point);
        
        // Gem on every other point
        if (i % 2 === 0) {
            const gem = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 8, 8),
                gemMaterial
            );
            gem.position.set(
                Math.cos(angle) * 0.4,
                0.35,
                Math.sin(angle) * 0.4
            );
            crownGroup.add(gem);
        }
    }
    
    return crownGroup;
}

// ========================================
// WATER DRIPS
// ========================================

createWaterDrips() {
    // Drip sources on ceiling
    this.dripSources = [];
    
    for (let i = 0; i < 15; i++) {
        const source = {
            x: (Math.random() - 0.5) * 40,
            y: 11,
            z: (Math.random() - 0.5) * 70,
            nextDripTime: Math.random() * 5,
            dripInterval: 3 + Math.random() * 4
        };
        this.dripSources.push(source);
    }
    
    this.activeWaterDrops = [];
}

createWaterDrop(x, y, z) {
    const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.3
        })
    );
    
    drop.position.set(x, y, z);
    drop.userData.velocity = 0;
    drop.userData.gravity = 0.025;
    
    this.rooms[0].add(drop);
    this.activeWaterDrops.push(drop);
}

createWaterSplash(x, z) {
    const splash = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.15, 12),
        new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        })
    );
    
    splash.rotation.x = -Math.PI / 2;
    splash.position.set(x, 0.35, z);
    splash.userData.startTime = Date.now();
    splash.userData.lifetime = 800;
    
    this.rooms[0].add(splash);
    this.waterDrips.push(splash);
}

// ========================================
// RATS (scurrying)
// ========================================

createRats() {
    for (let i = 0; i < 6; i++) {
        const rat = this.createRat();
        rat.position.set(
            (Math.random() - 0.5) * 40,
            0.3,
            (Math.random() - 0.5) * 70
        );
        rat.userData.speed = 0.05 + Math.random() * 0.05;
        rat.userData.direction = Math.random() * Math.PI * 2;
        rat.userData.changeDirectionTime = Math.random() * 5;
        
        this.rooms[0].add(rat);
        this.rats.push(rat);
    }
}

createRat() {
    const ratGroup = new THREE.Group();
    
    const ratMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.9
    });
    
    // Body
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        ratMaterial
    );
    body.scale.set(1.5, 1, 1);
    ratGroup.add(body);
    
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        ratMaterial
    );
    head.position.set(0.2, 0, 0);
    ratGroup.add(head);
    
    // Ears
    [-0.06, 0.06].forEach(x => {
        const ear = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 6, 6),
            ratMaterial
        );
        ear.position.set(0.2 + x, 0.08, 0);
        ratGroup.add(ear);
    });
    
    // Tail
    const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.01, 0.4, 6),
        ratMaterial
    );
    tail.rotation.z = -Math.PI / 4;
    tail.position.set(-0.25, 0, 0);
    ratGroup.add(tail);
    ratGroup.userData.tail = tail;
    
    // Eyes (glowing red)
    [-0.03, 0.03].forEach(x => {
        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.015, 6, 6),
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 1
            })
        );
        eye.position.set(0.25, 0.03, x);
        ratGroup.add(eye);
    });
    
    ratGroup.castShadow = true;
    
    return ratGroup;
}

// ========================================
// CHAINS (rattling)
// ========================================

createChains() {
    const chainPositions = [
        { x: -10, z: -15 },
        { x: 10, z: -15 },
        { x: -10, z: 15 },
        { x: 10, z: 15 }
    ];
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    chainPositions.forEach((pos, index) => {
        const chainGroup = new THREE.Group();
        const numLinks = 10;
        
        for (let i = 0; i < numLinks; i++) {
            const link = new THREE.Mesh(
                new THREE.TorusGeometry(0.12, 0.03, 8, 16),
                ironMaterial
            );
            link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
            link.position.y = 11 - i;
            chainGroup.add(link);
        }
        
        // Shackle at bottom
        const shackle = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI),
            ironMaterial
        );
        shackle.position.y = 11 - numLinks - 0.5;
        chainGroup.add(shackle);
        
        chainGroup.position.set(pos.x, 0, pos.z);
        chainGroup.userData.swingPhase = index * (Math.PI / 2);
        chainGroup.userData.swingSpeed = 0.5;
        chainGroup.userData.baseX = pos.x;
        
        this.rooms[0].add(chainGroup);
        this.chains.push(chainGroup);
    });
}

// ========================================
// DUNGEON UI
// ========================================

createDungeonUI() {
    const dungeonUI = document.createElement('div');
    dungeonUI.id = 'dungeonUI';
    dungeonUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
        color: #cc9966;
        padding: 15px 30px;
        border-radius: 5px;
        font-family: 'Georgia', serif;
        font-size: 18px;
        z-index: 100;
        border: 3px solid #4a4a4a;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.9), 
                    inset 0 0 20px rgba(255, 100, 0, 0.1);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
        font-weight: bold;
    `;
    
    dungeonUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">🏰</span>
            <div>
                <div style="font-size: 22px; letter-spacing: 2px;">DUNGEON CATACOMBS</div>
                <div style="font-size: 12px; opacity: 0.9; font-style: italic;">Depth Unknown • Year ???</div>
            </div>
            <span style="font-size: 28px;">💀</span>
        </div>
    `;
    
    document.body.appendChild(dungeonUI);
}

// Continue with animation methods in next message...
// ========================================
// COMPLETE DUNGEON ANIMATIONS
// ========================================

updateDungeonAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. TORCH FLICKERING
    if (this.torches) {
        this.torches.forEach(torch => {
            torch.userData.flickerPhase += 0.01 * torch.userData.flickerSpeed;
            
            if (torch.userData.flame) {
                // Flame scale flicker
                const flicker = 0.8 + Math.sin(torch.userData.flickerPhase) * 0.2 +
                               Math.sin(torch.userData.flickerPhase * 2.3) * 0.1;
                torch.userData.flame.scale.set(1, flicker, 1);
                torch.userData.flame.material.opacity = 0.7 + flicker * 0.2;
                
                // Flame sway
                torch.userData.flame.rotation.z = Math.sin(time * 2) * 0.1;
            }
            
            if (torch.userData.innerFlame) {
                const innerFlicker = 0.9 + Math.sin(torch.userData.flickerPhase * 1.7) * 0.15;
                torch.userData.innerFlame.scale.set(1, innerFlicker, 1);
            }
            
            if (torch.userData.light) {
                // Light intensity flicker
                const lightFlicker = 1.5 + Math.sin(torch.userData.flickerPhase) * 0.5 +
                                    Math.sin(torch.userData.flickerPhase * 3.1) * 0.2;
                torch.userData.light.intensity = lightFlicker;
                
                // Slight light color variation (more orange to more red)
                const colorShift = 0.05 + Math.sin(torch.userData.flickerPhase * 1.3) * 0.03;
                torch.userData.light.color.setRGB(1, 0.4 + colorShift, 0);
            }
        });
    }
    
    // 2. SMOKE PARTICLES RISING
    if (this.smokeParticles) {
        this.smokeParticles.forEach(smoke => {
            smoke.position.y += smoke.userData.riseSpeed;
            
            // Drift sideways
            smoke.position.x += Math.sin(time * 2 + smoke.userData.phase) * 0.003;
            smoke.position.z += Math.cos(time * 1.5 + smoke.userData.phase) * 0.003;
            
            // Fade as it rises
            smoke.material.opacity = Math.max(
                0,
                0.3 - (smoke.position.y - smoke.userData.baseY) * 0.06
            );
            
            // Scale grows
            const growthFactor = 1 + (smoke.position.y - smoke.userData.baseY) * 0.15;
            smoke.scale.set(growthFactor, growthFactor, growthFactor);
            
            // Reset when too high
            if (smoke.position.y > smoke.userData.baseY + 5) {
                smoke.position.y = smoke.userData.baseY;
                smoke.material.opacity = 0.3;
                smoke.scale.set(1, 1, 1);
                smoke.position.x = smoke.parent.position.x + 0.8;
                smoke.position.z = smoke.parent.position.z;
            }
        });
    }
    
    // 3. WATER DRIP SYSTEM
    if (this.dripSources) {
        this.dripSources.forEach(source => {
            source.nextDripTime -= 0.016;
            
            if (source.nextDripTime <= 0) {
                this.createWaterDrop(source.x, source.y, source.z);
                source.nextDripTime = source.dripInterval;
            }
        });
    }
    
    // Active water drops falling
    if (this.activeWaterDrops) {
        for (let i = this.activeWaterDrops.length - 1; i >= 0; i--) {
            const drop = this.activeWaterDrops[i];
            
            drop.userData.velocity += drop.userData.gravity;
            drop.position.y -= drop.userData.velocity;
            
            // Hit ground
            if (drop.position.y <= 0.35) {
                this.createWaterSplash(drop.position.x, drop.position.z);
                this.rooms[0].remove(drop);
                this.activeWaterDrops.splice(i, 1);
            }
        }
    }
    
    // Water splash ripples
    if (this.waterDrips) {
        const now = Date.now();
        
        for (let i = this.waterDrips.length - 1; i >= 0; i--) {
            const splash = this.waterDrips[i];
            
            if (!splash.userData.startTime) continue;
            
            const age = now - splash.userData.startTime;
            const progress = age / splash.userData.lifetime;
            
            if (progress >= 1) {
                this.rooms[0].remove(splash);
                this.waterDrips.splice(i, 1);
            } else {
                // Expand and fade
                const scale = 1 + progress * 3;
                splash.scale.set(scale, scale, 1);
                splash.material.opacity = 0.6 * (1 - progress);
            }
        }
    }
    
    // 4. RATS SCURRYING
    if (this.rats) {
        this.rats.forEach(rat => {
            rat.userData.changeDirectionTime -= 0.016;
            
            // Change direction randomly
            if (rat.userData.changeDirectionTime <= 0) {
                rat.userData.direction = Math.random() * Math.PI * 2;
                rat.userData.changeDirectionTime = 3 + Math.random() * 5;
            }
            
            // Move rat
            const moveX = Math.cos(rat.userData.direction) * rat.userData.speed;
            const moveZ = Math.sin(rat.userData.direction) * rat.userData.speed;
            
            rat.position.x += moveX;
            rat.position.z += moveZ;
            
            // Keep in bounds
            if (rat.position.x < -22) rat.position.x = -22;
            if (rat.position.x > 22) rat.position.x = 22;
            if (rat.position.z < -37) rat.position.z = -37;
            if (rat.position.z > 37) rat.position.z = 37;
            
            // Face direction of movement
            rat.rotation.y = rat.userData.direction;
            
            // Tail animation
            if (rat.userData.tail) {
                rat.userData.tail.rotation.z = -Math.PI / 4 + Math.sin(time * 8) * 0.3;
            }
            
            // Bobbing motion
            rat.position.y = 0.3 + Math.sin(time * 10 + rat.position.x) * 0.02;
        });
    }
    
    // 5. CHAINS SWAYING AND RATTLING
    if (this.chains) {
        this.chains.forEach(chain => {
            chain.userData.swingPhase += 0.01 * chain.userData.swingSpeed;
            
            // Sway side to side
            const sway = Math.sin(chain.userData.swingPhase) * 0.5;
            chain.position.x = chain.userData.baseX + sway;
            
            // Rotation for more dynamic movement
            chain.rotation.z = Math.sin(chain.userData.swingPhase * 1.3) * 0.05;
            
            // Individual link movement
            chain.children.forEach((link, index) => {
                if (link.geometry.type === 'TorusGeometry') {
                    const linkSway = Math.sin(time * 2 + index * 0.3) * 0.02;
                    link.position.x = linkSway;
                    
                    // Slight rotation
                    if (index % 2 === 0) {
                        link.rotation.y = Math.sin(time * 1.5 + index) * 0.1;
                    } else {
                        link.rotation.x = Math.sin(time * 1.5 + index) * 0.1;
                    }
                }
            });
        });
    }
    
    // 6. ARMOR GUARDS SUBTLE BREATHING
    if (this.armorSuits) {
        this.armorSuits.forEach((armor, index) => {
            const breathPhase = time * 0.5 + index;
            
            // Very subtle up-down breathing
            armor.position.y = Math.sin(breathPhase) * 0.02;
            
            // Slight head tilt
            const helmet = armor.children.find(child => 
                child.geometry?.type === 'SphereGeometry' && 
                child.position.y > 3
            );
            if (helmet) {
                helmet.rotation.z = Math.sin(breathPhase * 1.3) * 0.01;
            }
            
            // Weapon sway (if present)
            const weapon = armor.children.find(child => 
                child.geometry?.type === 'CylinderGeometry' && 
                child.position.y > 2 &&
                child.scale.y > 2
            );
            if (weapon) {
                weapon.rotation.z = Math.sin(breathPhase * 0.7) * 0.02;
            }
        });
    }
    
    // 7. BONE ALCOVE ATMOSPHERE (subtle glow pulse)
    if (this.boneAlcoves) {
        this.boneAlcoves.forEach((alcove, index) => {
            const pulsePhase = time * 0.3 + index * 0.5;
            const pulse = Math.sin(pulsePhase) * 0.1 + 0.9;
            
            // Find skulls and make them subtly glow
            alcove.children.forEach(child => {
                if (child.geometry?.type === 'SphereGeometry' && child.scale.y > 1) {
                    // This is a skull
                    if (!child.material.emissive) {
                        child.material.emissive = new THREE.Color(0x221100);
                    }
                    child.material.emissiveIntensity = pulse * 0.05;
                }
            });
        });
    }
    
    // 8. TREASURE ROOM EFFECTS
    if (this.treasureChests) {
        this.treasureChests.forEach(item => {
            // Crown rotation
            if (item.userData.rotationSpeed) {
                item.rotation.y += item.userData.rotationSpeed;
                
                // Bobbing
                const basePosY = item.position.y > 2 ? item.position.y : 2.5;
                item.position.y = basePosY + Math.sin(time * 1.5) * 0.1;
                
                // Gems pulsing
                item.children.forEach(child => {
                    if (child.material?.emissive?.getHex() === 0x660000) {
                        child.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;
                    }
                });
            }
            
            // Chest subtle glow
            const chestBody = item.children.find(child => 
                child.geometry?.type === 'BoxGeometry' &&
                child.position.y === 0
            );
            if (chestBody) {
                if (!chestBody.material.emissive) {
                    chestBody.material.emissive = new THREE.Color(0x221100);
                }
                chestBody.material.emissiveIntensity = Math.sin(time * 0.5) * 0.02 + 0.03;
            }
        });
    }
    
    // 9. IRON GATES CREAKING (very subtle)
    if (this.gates) {
        this.gates.forEach((gate, index) => {
            const creakPhase = time * 0.2 + index;
            gate.rotation.y += Math.sin(creakPhase) * 0.0002;
            
            // Chains on gates swaying
            gate.children.forEach(child => {
                if (child.geometry?.type === 'TorusGeometry') {
                    child.rotation.z = Math.sin(time * 2 + index) * 0.05;
                }
            });
        });
    }
    
    // 10. FOG DENSITY PULSING (atmospheric)
    if (this.scene.fog) {
        const fogPulse = Math.sin(time * 0.1) * 2 + 20;
        this.scene.fog.near = fogPulse;
        this.scene.fog.far = fogPulse + 40;
    }
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Dungeon bounds (slightly tighter than walls)
        const minX = -22;
        const maxX = 22;
        const minZ = -37;
        const maxZ = 37;

        this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// HELPER: Get Spawn Position
// ========================================

getSpawnPosition() {
    // Spawn in the entrance area
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: -30
    };
}

// ========================================
// SOUND EFFECTS (Optional - add if you want)
// ========================================

playDungeonAmbience() {
    // Could add:
    // - Dripping water sounds
    // - Distant chain rattling
    // - Rat squeaking
    // - Wind howling
    // - Creaking doors
    console.log("🔊 Dungeon ambience (audio not implemented)");
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
    this.updateDungeonAnimations(); // ✓ ADD THIS LINE
   
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
    }
    
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
    
    // Existing artwork navigation
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
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
    // TIME TRAVEL GALLERY SYSTEM
    // ========================================
    
    this.currentEra = 0; // 0: Egypt, 1: Renaissance, 2: Future
    this.portals = [];
    this.eraNames = ['Ancient Egypt', 'Renaissance', 'Future'];
    this.timeParticles = [];
    
    // Create all three era rooms
    this.createAncientEgyptRoom();
    this.createRenaissanceRoom();
    this.createFutureRoom();
    this.createPortalSystem();
    this.createTimeUI();
    
    console.log("🕰️ Time Travel Gallery created!");
}

createTimeUI() {
    const timeUI = document.createElement('div');
    timeUI.id = 'timeUI';
    timeUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        font-family: 'Arial', sans-serif;
        font-size: 18px;
        z-index: 100;
        backdrop-filter: blur(10px);
        border: 2px solid #4466ff;
        box-shadow: 0 0 20px rgba(68, 102, 255, 0.5);
    `;
    
    timeUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 24px;">🕰️</span>
            <div>
                <div style="font-weight: bold; font-size: 20px;" id="currentEra">Ancient Egypt</div>
                <div style="font-size: 14px; opacity: 0.8;" id="eraYear">2500 BC</div>
            </div>
        </div>
        <!-- ✓ ADD: Quick travel buttons -->
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button onclick="app.travelToEra(0)" style="
                padding: 8px 12px;
                background: rgba(212, 167, 106, 0.3);
                border: 2px solid #d4a76a;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(212, 167, 106, 0.6)'" 
               onmouseout="this.style.background='rgba(212, 167, 106, 0.3)'">
                🏛️ Egypt
            </button>
            <button onclick="app.travelToEra(1)" style="
                padding: 8px 12px;
                background: rgba(212, 175, 55, 0.3);
                border: 2px solid #d4af37;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(212, 175, 55, 0.6)'" 
               onmouseout="this.style.background='rgba(212, 175, 55, 0.3)'">
                🎨 Renaissance
            </button>
            <button onclick="app.travelToEra(2)" style="
                padding: 8px 12px;
                background: rgba(68, 102, 255, 0.3);
                border: 2px solid #4466ff;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(68, 102, 255, 0.6)'" 
               onmouseout="this.style.background='rgba(68, 102, 255, 0.3)'">
                🚀 Future
            </button>
        </div>
    `;
    
    document.body.appendChild(timeUI);
}
// ========================================
// ANCIENT EGYPT ROOM (2500 BC)
// ========================================

createAncientEgyptRoom() {
    const egyptRoom = new THREE.Group();
    egyptRoom.visible = true; // Start in Egypt
    
    const roomSize = 30;
    const wallHeight = 12;
    
    // ========================================
    // MATERIALS - ANCIENT EGYPT
    // ========================================
    
    // Sandstone walls
    const sandstoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4a76a,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const sandstoneTexture = this.generateSandstoneTexture(2048, 2048);
    const sandstoneTextureObj = new THREE.CanvasTexture(sandstoneTexture);
    sandstoneTextureObj.wrapS = sandstoneTextureObj.wrapT = THREE.RepeatWrapping;
    sandstoneTextureObj.repeat.set(3, 3);
    sandstoneMaterial.map = sandstoneTextureObj;
    
    // Gold accent material
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.9,
        emissive: 0x886600,
        emissiveIntensity: 0.3
    });
    
    // ========================================
    // ROOM STRUCTURE
    // ========================================
    
    // Floor (sand-covered stone)
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(roomSize, roomSize),
        new THREE.MeshStandardMaterial({
            color: 0xc9a877,
            roughness: 0.95
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    egyptRoom.add(floor);
    
    // Walls with hieroglyphics
    const wallPositions = [
        { pos: [0, wallHeight/2, -roomSize/2], rot: [0, 0, 0] },
        { pos: [0, wallHeight/2, roomSize/2], rot: [0, Math.PI, 0] },
        { pos: [-roomSize/2, wallHeight/2, 0], rot: [0, Math.PI/2, 0] },
        { pos: [roomSize/2, wallHeight/2, 0], rot: [0, -Math.PI/2, 0] }
    ];
    
    wallPositions.forEach(wall => {
        const wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(roomSize, wallHeight, 1),
            sandstoneMaterial.clone()
        );
        wallMesh.position.set(...wall.pos);
        wallMesh.rotation.set(...wall.rot);
        wallMesh.receiveShadow = true;
        egyptRoom.add(wallMesh);
        
        // Add hieroglyphics
        for (let i = 0; i < 8; i++) {
            const hieroglyph = this.createHieroglyph();
            hieroglyph.position.set(
                (Math.random() - 0.5) * (roomSize - 4),
                2 + Math.random() * 6,
                0.51
            );
            wallMesh.add(hieroglyph);
        }
    });
    
    // Ceiling
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(roomSize, roomSize),
        sandstoneMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    ceiling.receiveShadow = true;
    egyptRoom.add(ceiling);
    
    // ========================================
    // EGYPTIAN COLUMNS (8 columns)
    // ========================================
    
    const columnPositions = [
        [-8, -8], [-8, 0], [-8, 8],
        [8, -8], [8, 0], [8, 8],
        [0, -8], [0, 8]
    ];
    
    columnPositions.forEach(([x, z]) => {
        const columnGroup = new THREE.Group();
        
        // Column shaft
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.7, 10, 16),
            sandstoneMaterial
        );
        shaft.position.y = 5;
        shaft.castShadow = true;
        columnGroup.add(shaft);
        
        // Papyrus capital (top)
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 0.6, 1.5, 16),
            sandstoneMaterial
        );
        capital.position.y = 10.5;
        columnGroup.add(capital);
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.9, 0.5, 16),
            sandstoneMaterial
        );
        base.position.y = 0.25;
        columnGroup.add(base);
        
        // Gold bands
        for (let i = 0; i < 3; i++) {
            const band = new THREE.Mesh(
                new THREE.CylinderGeometry(0.65, 0.65, 0.3, 16),
                goldMaterial
            );
            band.position.y = 2 + i * 3;
            columnGroup.add(band);
        }
        
        columnGroup.position.set(x, 0, z);
        egyptRoom.add(columnGroup);
    });
    
    // ========================================
    // OBELISKS (2 at entrance)
    // ========================================
    
    [-6, 6].forEach(xPos => {
        const obelisk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.5, 8, 4),
            sandstoneMaterial
        );
        obelisk.position.set(xPos, 4, 12);
        obelisk.castShadow = true;
        
        // Pyramidion (top)
        const pyramidion = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1, 4),
            goldMaterial
        );
        pyramidion.position.y = 4.5;
        obelisk.add(pyramidion);
        
        egyptRoom.add(obelisk);
    });
    
    // ========================================
    // TORCH LIGHTING
    // ========================================
    
    this.egyptTorches = [];
    
    const torchPositions = [
        [-12, 10], [12, 10], [-12, -10], [12, -10],
        [0, 13], [0, -13]
    ];
    
    torchPositions.forEach(([x, z]) => {
        const torchGroup = new THREE.Group();
        
        // Torch holder
        const holder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0x4a3728 })
        );
        holder.position.y = 8;
        torchGroup.add(holder);
        
        // Flame
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 0.6, 8),
            new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.8
            })
        );
        flame.position.y = 9.3;
        torchGroup.add(flame);
        
        // Point light
        const torchLight = new THREE.PointLight(0xff8844, 2, 12);
        torchLight.position.y = 9;
        torchLight.castShadow = true;
        torchLight.shadow.mapSize.width = 512;
        torchLight.shadow.mapSize.height = 512;
        torchGroup.add(torchLight);
        
        torchGroup.position.set(x, 0, z);
        egyptRoom.add(torchGroup);
        
        this.egyptTorches.push({
            group: torchGroup,
            flame: flame,
            light: torchLight,
            baseIntensity: 2
        });
    });
    
    // Ambient golden light
    const egyptAmbient = new THREE.AmbientLight(0xffaa66, 0.4);
    egyptRoom.add(egyptAmbient);
    
    // ========================================
    // ARTWORK DISPLAY POSITIONS
    // ========================================
    
    this.egyptArtworkSpots = [
        { x: -13, y: 6, z: -10, rot: Math.PI/2 },
        { x: -13, y: 6, z: 0, rot: Math.PI/2 },
        { x: -13, y: 6, z: 10, rot: Math.PI/2 },
        { x: 13, y: 6, z: -10, rot: -Math.PI/2 },
        { x: 13, y: 6, z: 0, rot: -Math.PI/2 },
        { x: 13, y: 6, z: 10, rot: -Math.PI/2 }
    ];
    
    egyptRoom.position.set(0, 0, 0);
    egyptRoom.userData.era = 'egypt';
    this.rooms.push(egyptRoom);
    this.scene.add(egyptRoom);
}

// ========================================
// RENAISSANCE ROOM (1500 AD)
// ========================================

createRenaissanceRoom() {
    const renaissanceRoom = new THREE.Group();
    renaissanceRoom.visible = false;
    
    const roomSize = 30;
    const wallHeight = 15;
    
    // ========================================
    // MATERIALS - RENAISSANCE
    // ========================================
    
    // Marble material
    const marbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        roughness: 0.3,
        metalness: 0.2
    });
    
    const marbleTexture = this.generateMarbleTexture(2048, 2048);
    const marbleTextureObj = new THREE.CanvasTexture(marbleTexture);
    marbleTextureObj.wrapS = marbleTextureObj.wrapT = THREE.RepeatWrapping;
    marbleTextureObj.repeat.set(4, 4);
    marbleMaterial.map = marbleTextureObj;
    
    // Ornate gold trim
    const ornateGoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.95,
        emissive: 0xaa8833,
        emissiveIntensity: 0.2
    });
    
    // Rich fabric material (for drapes)
    const fabricMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // ========================================
    // ROOM STRUCTURE
    // ========================================
    
    // Checkered marble floor
    const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize, 10, 10);
    const floor = new THREE.Mesh(floorGeometry, marbleMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    renaissanceRoom.add(floor);
    
    // Walls with fresco panels
    const wallPositions = [
        { pos: [0, wallHeight/2, -roomSize/2], rot: [0, 0, 0] },
        { pos: [0, wallHeight/2, roomSize/2], rot: [0, Math.PI, 0] },
        { pos: [-roomSize/2, wallHeight/2, 0], rot: [0, Math.PI/2, 0] },
        { pos: [roomSize/2, wallHeight/2, 0], rot: [0, -Math.PI/2, 0] }
    ];
    
    wallPositions.forEach((wall, index) => {
        const wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(roomSize, wallHeight, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0xf0e6d2,
                roughness: 0.7
            })
        );
        wallMesh.position.set(...wall.pos);
        wallMesh.rotation.set(...wall.rot);
        wallMesh.receiveShadow = true;
        renaissanceRoom.add(wallMesh);
        
        // Ornate molding
        for (let i = 0; i < 3; i++) {
            const molding = new THREE.Mesh(
                new THREE.BoxGeometry(roomSize - 2, 0.3, 0.3),
                ornateGoldMaterial
            );
            molding.position.set(0, -wallHeight/2 + 2 + i * (wallHeight - 4) / 2, 0.76);
            wallMesh.add(molding);
        }
    });
    
    // Vaulted ceiling with frescoes
    const ceilingCurve = new THREE.Shape();
    ceilingCurve.moveTo(-roomSize/2, 0);
    ceilingCurve.quadraticCurveTo(0, 3, roomSize/2, 0);
    ceilingCurve.lineTo(roomSize/2, 0);
    ceilingCurve.lineTo(-roomSize/2, 0);
    
    const ceilingGeometry = new THREE.ExtrudeGeometry(ceilingCurve, {
        steps: 30,
        depth: roomSize,
        bevelEnabled: false
    });
    
    const ceiling = new THREE.Mesh(
        ceilingGeometry,
        new THREE.MeshStandardMaterial({
            color: 0xe6d7c3,
            roughness: 0.6,
            side: THREE.DoubleSide
        })
    );
    ceiling.position.set(0, wallHeight, -roomSize/2);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    renaissanceRoom.add(ceiling);
    
    // ========================================
    // CORINTHIAN COLUMNS
    // ========================================
    
    const columnPositions = [
        [-10, -12], [-10, 12],
        [10, -12], [10, 12]
    ];
    
    columnPositions.forEach(([x, z]) => {
        const columnGroup = new THREE.Group();
        
        // Column shaft with fluting
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.8, 13, 20),
            marbleMaterial
        );
        shaft.position.y = 6.5;
        shaft.castShadow = true;
        columnGroup.add(shaft);
        
        // Ornate Corinthian capital
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 0.7, 2, 8),
            ornateGoldMaterial
        );
        capital.position.y = 13.5;
        columnGroup.add(capital);
        
        // Acanthus leaves (simplified)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const leaf = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1, 0.1),
                ornateGoldMaterial
            );
            leaf.position.set(
                Math.cos(angle) * 0.9,
                13,
                Math.sin(angle) * 0.9
            );
            leaf.rotation.y = angle;
            leaf.rotation.x = -Math.PI / 6;
            columnGroup.add(leaf);
        }
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.1, 0.8, 20),
            marbleMaterial
        );
        base.position.y = 0.4;
        columnGroup.add(base);
        
        columnGroup.position.set(x, 0, z);
        renaissanceRoom.add(columnGroup);
    });
    
    // ========================================
    // CLASSICAL STATUES
    // ========================================
    
    const statuePositions = [
        { x: -13, z: 0, rot: Math.PI/2 },
        { x: 13, z: 0, rot: -Math.PI/2 }
    ];
    
    statuePositions.forEach(stat => {
        const statueGroup = new THREE.Group();
        
        // Pedestal
        const pedestal = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1, 1.5),
            marbleMaterial
        );
        pedestal.position.y = 0.5;
        statueGroup.add(pedestal);
        
        // Statue body (simplified)
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 2, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.3,
                metalness: 0.1
            })
        );
        body.position.y = 2.5;
        statueGroup.add(body);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            body.material
        );
        head.position.y = 4;
        statueGroup.add(head);
        
        statueGroup.position.set(stat.x, 0, stat.z);
        statueGroup.rotation.y = stat.rot;
        renaissanceRoom.add(statueGroup);
    });
    
    // ========================================
    // CANDELABRAS & CHANDELIERS
    // ========================================
    
    this.renaissanceCandles = [];
    
    // Wall candelabras
    const candelabraPositions = [
        [-13, 8, -8], [-13, 8, 8],
        [13, 8, -8], [13, 8, 8]
    ];
    
    candelabraPositions.forEach(pos => {
        const candleGroup = new THREE.Group();
        
        // Ornate holder
        const holder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 1, 8),
            ornateGoldMaterial
        );
        candleGroup.add(holder);
        
        // 3 candles
        for (let i = -1; i <= 1; i++) {
            const candle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8),
                new THREE.MeshStandardMaterial({ color: 0xfffff0 })
            );
            candle.position.set(i * 0.25, 0.75, 0);
            candleGroup.add(candle);
            
            // Flame
            const flame = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffaa00,
                    transparent: true,
                    opacity: 0.9
                })
            );
            flame.position.set(i * 0.25, 1.1, 0);
            flame.scale.set(1, 1.5, 1);
            candleGroup.add(flame);
        }
        
        // Warm light
        const candleLight = new THREE.PointLight(0xffcc88, 1.5, 10);
        candleLight.position.y = 1;
        candleLight.castShadow = true;
        candleGroup.add(candleLight);
        
        candleGroup.position.set(...pos);
        renaissanceRoom.add(candleGroup);
        
        this.renaissanceCandles.push({
            group: candleGroup,
            light: candleLight,
            flames: candleGroup.children.filter(c => c.material?.transparent),
            baseIntensity: 1.5
        });
    });
    
    // Central chandelier
    const chandelier = new THREE.Group();
    
    // Chain
    const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 5, 8),
        ornateGoldMaterial
    );
    chain.position.y = wallHeight - 2.5;
    chandelier.add(chain);
    
    // Frame
    const frame = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.1, 8, 16),
        ornateGoldMaterial
    );
    frame.position.y = wallHeight - 5;
    frame.rotation.x = Math.PI / 2;
    chandelier.add(frame);
    
    // 12 candles around chandelier
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const candleLight = new THREE.PointLight(0xffcc88, 1, 15);
        candleLight.position.set(
            Math.cos(angle) * 1.5,
            wallHeight - 5,
            Math.sin(angle) * 1.5
        );
        candleLight.castShadow = true;
        chandelier.add(candleLight);
    }
    
    renaissanceRoom.add(chandelier);
    
    // Warm ambient light
    const renaissanceAmbient = new THREE.AmbientLight(0xffeecc, 0.5);
    renaissanceRoom.add(renaissanceAmbient);
    
    // ========================================
    // ARTWORK DISPLAY POSITIONS
    // ========================================
    
    this.renaissanceArtworkSpots = [
        { x: 0, y: 7, z: -13.5, rot: 0 },
        { x: -5, y: 7, z: -13.5, rot: 0 },
        { x: 5, y: 7, z: -13.5, rot: 0 },
        { x: 0, y: 7, z: 13.5, rot: Math.PI },
        { x: -5, y: 7, z: 13.5, rot: Math.PI },
        { x: 5, y: 7, z: 13.5, rot: Math.PI }
    ];
    
    renaissanceRoom.position.set(0, 0, 0);
    renaissanceRoom.userData.era = 'renaissance';
    this.rooms.push(renaissanceRoom);
    this.scene.add(renaissanceRoom);
}

// ========================================
// FUTURE ROOM (2500 AD)
// ========================================

createFutureRoom() {
    const futureRoom = new THREE.Group();
    futureRoom.visible = false;
    
    const roomSize = 30;
    const wallHeight = 15;
    
    // ========================================
    // MATERIALS - FUTURE
    // ========================================
    
    // Metallic panels
    const metallicMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0x003366,
        emissiveIntensity: 0.3
    });
    
    // Holographic material
    const hologramMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    // Neon glow
    const neonMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.8
    });
    
    // ========================================
    // ROOM STRUCTURE
    // ========================================
    
    // Illuminated floor grid
    const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize, 20, 20);
    const floor = new THREE.Mesh(
        floorGeometry,
        new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x0066ff,
            emissiveIntensity: 0.2
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    futureRoom.add(floor);
    
    // Grid lines
    this.futureGridLines = [];
    for (let i = 0; i <= 20; i++) {
        // Horizontal lines
        const hLine = new THREE.Mesh(
            new THREE.PlaneGeometry(roomSize, 0.05),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5
            })
        );
        hLine.rotation.x = -Math.PI / 2;
        hLine.position.set(0, 0.02, -roomSize/2 + i * (roomSize/20));
        futureRoom.add(hLine);
        this.futureGridLines.push(hLine);
        
        // Vertical lines
        const vLine = new THREE.Mesh(
            new THREE.PlaneGeometry(0.05, roomSize),
            hLine.material.clone()
        );
        vLine.rotation.x = -Math.PI / 2;
        vLine.position.set(-roomSize/2 + i * (roomSize/20), 0.02, 0);
        futureRoom.add(vLine);
        this.futureGridLines.push(vLine);
    }
    
    // Metallic walls with LED strips
    const wallPositions = [
        { pos: [0, wallHeight/2, -roomSize/2], rot: [0, 0, 0] },
        { pos: [0, wallHeight/2, roomSize/2], rot: [0, Math.PI, 0] },
        { pos: [-roomSize/2, wallHeight/2, 0], rot: [0, Math.PI/2, 0] },
        { pos: [roomSize/2, wallHeight/2, 0], rot: [0, -Math.PI/2, 0] }
    ];
    
    wallPositions.forEach(wall => {
        const wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(roomSize, wallHeight, 0.5),
            metallicMaterial.clone()
        );
        wallMesh.position.set(...wall.pos);
        wallMesh.rotation.set(...wall.rot);
        wallMesh.receiveShadow = true;
        futureRoom.add(wallMesh);
        
        // LED light strips
        for (let i = 0; i < 5; i++) {
            const ledStrip = new THREE.Mesh(
                new THREE.BoxGeometry(roomSize - 4, 0.1, 0.1),
                new THREE.MeshBasicMaterial({
                    color: 0x00ffff,
                    emissive: 0x00ffff,
                    emissiveIntensity: 1
                })
            );
            ledStrip.position.set(0, -wallHeight/2 + 2 + i * 2.5, 0.26);
            wallMesh.add(ledStrip);
        }
    });
    
    // Ceiling with hexagonal panels
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(roomSize, roomSize),
        new THREE.MeshStandardMaterial({
            color: 0x0a0a1a,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0x0033ff,
            emissiveIntensity: 0.3
        })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    futureRoom.add(ceiling);
    
    // ========================================
    // HOLOGRAPHIC COLUMNS
    // ========================================
    
    this.hologramColumns = [];
    
    const holomColumnPositions = [
        [-8, -8], [-8, 8], [8, -8], [8, 8],
        [0, -10], [0, 10]
    ];
    
    holomColumnPositions.forEach(([x, z]) => {
        const columnGroup = new THREE.Group();
        
        // Base projector
        const projector = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.6, 0.5, 6),
            metallicMaterial
        );
        projector.position.y = 0.25;
        columnGroup.add(projector);
        
        // Holographic column
        const holoColumn = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 12, 6, 1, true),
            hologramMaterial.clone()
        );
        holoColumn.position.y = 6.5;
        columnGroup.add(holoColumn);
        
        // Rotating rings
        for (let i = 0; i < 4; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.5, 0.05, 8, 16),
                neonMaterial.clone()
            );
            ring.position.y = 2 + i * 3;
            ring.userData.rotationSpeed = 0.01 + Math.random() * 0.02;
            columnGroup.add(ring);
        }
        
        // Pulsing light
        const holoLight = new THREE.PointLight(0x00ffff, 2, 10);
        holoLight.position.y = 6.5;
        columnGroup.add(holoLight);
        
        columnGroup.position.set(x, 0, z);
        futureRoom.add(columnGroup);
        
        this.hologramColumns.push({
            group: columnGroup,
            column: holoColumn,
            rings: columnGroup.children.filter(c => c.geometry?.type === 'TorusGeometry'),
            light: holoLight,
            baseIntensity: 2
        });
    });
    
    // ========================================
    // FLOATING PLATFORMS
    // ========================================
    
    this.floatingPlatforms = [];
    
    const platformPositions = [
        { x: -10, z: -5, y: 2 },
        { x: 10, z: -5, y: 2.5 },
        { x: -10, z: 5, y: 2.2 },
        { x: 10, z: 5, y: 1.8 }
    ];
    
    platformPositions.forEach(pos => {
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 0.2, 6),
            new THREE.MeshStandardMaterial({
                color: 0x4466ff,
                roughness: 0.2,
                metalness: 0.9,
                emissive: 0x2244ff,
                emissiveIntensity: 0.5
            })
        );
        platform.position.set(pos.x, pos.y, pos.z);
        platform.castShadow = true;
        platform.userData.baseY = pos.y;
        platform.userData.floatSpeed = 0.3 + Math.random() * 0.5;
        platform.userData.floatAmount = 0.3;
        futureRoom.add(platform);
        
        this.floatingPlatforms.push(platform);
    });
    
    // ========================================
    // DIGITAL SCREENS
    // ========================================
    
    this.digitalScreens = [];
    
    const screenPositions = [
        { x: -13, y: 7, z: -5, rot: Math.PI/2 },
        { x: -13, y: 7, z: 5, rot: Math.PI/2 },
        { x: 13, y: 7, z: -5, rot: -Math.PI/2 },
        { x: 13, y: 7, z: 5, rot: -Math.PI/2 }
    ];
    
    screenPositions.forEach(screen => {
        const screenGroup = new THREE.Group();
        
        // Screen frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(4.5, 3.5, 0.3),
            metallicMaterial
        );
        screenGroup.add(frame);
        
        // Display
        const display = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 3),
            new THREE.MeshBasicMaterial({
                color: 0x0088ff,
                emissive: 0x0066ff,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.9
            })
        );
        display.position.z = 0.16;
        screenGroup.add(display);
        
        // Scanlines effect
        for (let i = 0; i < 15; i++) {
            const scanline = new THREE.Mesh(
                new THREE.PlaneGeometry(4, 0.05),
                new THREE.MeshBasicMaterial({
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.3
                })
            );
            scanline.position.set(0, -1.5 + i * 0.2, 0.17);
            screenGroup.add(scanline);
        }
        
        screenGroup.position.set(screen.x, screen.y, screen.z);
        screenGroup.rotation.y = screen.rot;
        futureRoom.add(screenGroup);
        
        this.digitalScreens.push({
            group: screenGroup,
            display: display
        });
    });
    
    // ========================================
    // NEON LIGHTING
    // ========================================
    
    this.neonLights = [];
    
    // Ceiling neon rings
    for (let i = 0; i < 3; i++) {
        const neonRing = new THREE.Mesh(
            new THREE.TorusGeometry(3 + i * 2, 0.1, 16, 32),
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                emissive: 0xff00ff,
                emissiveIntensity: 1
            })
        );
        neonRing.position.y = wallHeight - 1;
        neonRing.rotation.x = Math.PI / 2;
        futureRoom.add(neonRing);
        
        const ringLight = new THREE.PointLight(0xff00ff, 3, 20);
        ringLight.position.y = wallHeight - 1;
        futureRoom.add(ringLight);
        
        this.neonLights.push({
            mesh: neonRing,
            light: ringLight,
            baseIntensity: 3
        });
    }
    
    // Ambient futuristic glow
    const futureAmbient = new THREE.AmbientLight(0x4466ff, 0.4);
    futureRoom.add(futureAmbient);
    
    // ========================================
    // ARTWORK DISPLAY POSITIONS
    // ========================================
    
    this.futureArtworkSpots = [
        { x: 0, y: 7, z: -13.5, rot: 0 },
        { x: -6, y: 7, z: -13.5, rot: 0 },
        { x: 6, y: 7, z: -13.5, rot: 0 },
        { x: 0, y: 7, z: 13.5, rot: Math.PI },
        { x: -6, y: 7, z: 13.5, rot: Math.PI },
        { x: 6, y: 7, z: 13.5, rot: Math.PI }
    ];
    
    futureRoom.position.set(0, 0, 0);
    futureRoom.userData.era = 'future';
    this.rooms.push(futureRoom);
    this.scene.add(futureRoom);
}

// ========================================
// PORTAL SYSTEM
// ========================================

createPortalSystem() {
    this.portals = [];
    
    const portalPositions = [
        { x: 0, z: 14, targetEra: 1, label: 'To Renaissance →' },
        { x: 0, z: -14, targetEra: 2, label: '→ To Future' }
    ];
    
    portalPositions.forEach(portalData => {
        const portalGroup = new THREE.Group();
        
        // Portal frame
        const frame = new THREE.Mesh(
            new THREE.TorusGeometry(2, 0.3, 16, 32),
            new THREE.MeshStandardMaterial({
                color: 0x4444ff,
                roughness: 0.3,
                metalness: 0.9,
                emissive: 0x2222ff,
                emissiveIntensity: 0.5
            })
        );
        portalGroup.add(frame);
        
        // Portal surface
        const portalSurface = new THREE.Mesh(
            new THREE.CircleGeometry(1.8, 32),
            new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color1: { value: new THREE.Color(0x00ffff) },
                    color2: { value: new THREE.Color(0xff00ff) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color1;
                    uniform vec3 color2;
                    varying vec2 vUv;
                    
                    void main() {
                        vec2 uv = vUv - 0.5;
                        float dist = length(uv);
                        float angle = atan(uv.y, uv.x);
                        
                        float spiral = sin(dist * 10.0 - time * 2.0 + angle * 3.0) * 0.5 + 0.5;
                        vec3 color = mix(color1, color2, spiral);
                        
                        float alpha = 1.0 - smoothstep(0.7, 0.9, dist);
                        gl_FragColor = vec4(color, alpha * 0.8);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            })
        );
        portalGroup.add(portalSurface);
        
        // Particle effects
        const particles = [];
        for (let i = 0; i < 50; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2;
            particle.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 0.5
            );
            
            particle.userData.angle = angle;
            particle.userData.radius = radius;
            particle.userData.speed = 0.5 + Math.random();
            
            portalGroup.add(particle);
            particles.push(particle);
        }
        
        // Portal light
        const portalLight = new THREE.PointLight(0x8844ff, 3, 10);
        portalLight.position.z = 1;
        portalGroup.add(portalLight);
        
        portalGroup.position.set(portalData.x, 4, portalData.z);
        portalGroup.userData.targetEra = portalData.targetEra;
        portalGroup.userData.isPortal = true;
        
        // Add to all rooms
        this.rooms.forEach(room => {
            const clone = portalGroup.clone();
            clone.userData = portalGroup.userData;
            room.add(clone);
        });
        
        this.portals.push({
            group: portalGroup,
            surface: portalSurface,
            particles: particles,
            light: portalLight,
            targetEra: portalData.targetEra,
            label: portalData.label
        });
    });
}

// ========================================
// TIME TRAVEL UI
// ========================================

// ========================================
// PORTAL PROXIMITY DETECTION
// ========================================

checkPortalProximity() {
    if (!this.rooms[this.currentEra]) return;
    
    let nearestPortal = null;
    let minDistance = Infinity;
    
    // Check distance to all portals in current room
    this.rooms[this.currentEra].traverse(child => {
        if (child.userData?.isPortal) {
            const distance = this.camera.position.distanceTo(child.position);
            
            if (distance < 5 && distance < minDistance) {
                minDistance = distance;
                nearestPortal = child;
            }
        }
    });
    
    // Show/hide portal prompt
    const portalPrompt = document.getElementById('portalPrompt');
    
    if (nearestPortal && minDistance < 3) {
        const targetEra = nearestPortal.userData.targetEra;
        const eraNames = ['Ancient Egypt', 'Renaissance', 'Future'];
        
        if (!portalPrompt) {
            this.createPortalPrompt();
        }
        
        const prompt = document.getElementById('portalPrompt');
        if (prompt) {
            prompt.style.display = 'block';
            prompt.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">🌀</div>
                <div style="font-weight: bold; font-size: 18px;">Time Portal</div>
                <div style="font-size: 14px; margin-top: 5px;">
                    ${this.isMobile ? 'Tap' : 'Double-click'} to travel to<br>
                    <strong style="color: #4466ff;">${eraNames[targetEra]}</strong>
                </div>
            `;
        }
    } else if (portalPrompt) {
        portalPrompt.style.display = 'none';
    }
}

createPortalPrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'portalPrompt';
    prompt.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        text-align: center;
        font-family: Arial, sans-serif;
        z-index: 200;
        border: 2px solid #4466ff;
        box-shadow: 0 0 30px rgba(68, 102, 255, 0.8);
        backdrop-filter: blur(10px);
        display: none;
        animation: portalPulse 2s infinite;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes portalPulse {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.05); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(prompt);
}

// ========================================
// TEXTURE GENERATORS
// ========================================

generateSandstoneTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base sandstone color
    ctx.fillStyle = '#d4a76a';
    ctx.fillRect(0, 0, width, height);
    
    // Sand texture noise
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 180 + Math.random() * 60;
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.8}, ${brightness * 0.6})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    
    // Weathering cracks
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = Math.random() * 100 + 50;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.strokeStyle = `rgba(160, 120, 80, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    return canvas;
}

generateMarbleTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base marble color
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, width, height);
    
    // Marble veins
    for (let i = 0; i < 30; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        ctx.strokeStyle = `rgba(180, 180, 180, ${0.2 + Math.random() * 0.4})`;
        ctx.lineWidth = 2 + Math.random() * 4;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        for (let j = 0; j < 20; j++) {
            x += (Math.random() - 0.5) * 30;
            y += Math.random() * 50;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Fine details
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 230 + Math.random() * 25;
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness - 10})`;
        ctx.fillRect(x, y, 1, 1);
    }
    
    return canvas;
}

createHieroglyph() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Random hieroglyph symbols (simplified)
    const symbols = ['𓀀', '𓁏', '𓂀', '𓃀', '𓄀', '𓅀', '𓆈', '𓇳', '𓈖'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    ctx.font = 'bold 200px serif';
    ctx.fillStyle = '#8b6914';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.6
    });
    
    return new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), material);
}
updateMetroAnimations() {
    const time = this.time || Date.now() * 0.001;
    
    // 1. EMERGENCY LIGHTS FLICKERING
    if (this.emergencyLights) {
        this.emergencyLights.forEach(emergency => {
            if (!emergency.isWorking) {
                emergency.light.intensity = 0;
                emergency.panel.material.emissiveIntensity = 0;
                return;
            }
            
            const flicker = Math.sin(time * emergency.flickerSpeed + emergency.flickerOffset);
            const random = Math.random();
            
            // Occasional power surge/dropout
            if (random < 0.005) {
                emergency.light.intensity = 0;
                emergency.panel.material.emissiveIntensity = 0;
            } else if (random < 0.01) {
                emergency.light.intensity = 4.0;
                emergency.panel.material.emissiveIntensity = 2.0;
            } else {
                emergency.light.intensity = 2.0 + flicker * 0.8;
                emergency.panel.material.emissiveIntensity = 1.5 + flicker * 0.5;
            }
        });
    }
    
    // 2. FLUORESCENT TUBES FLICKERING
    if (this.fluorescents) {
        const currentTime = Date.now();
        this.fluorescents.forEach(fluor => {
            if (fluor.isBroken) {
                if (currentTime - fluor.lastFlicker > fluor.flickerInterval) {
                    const flickerOn = Math.random() > 0.7;
                    fluor.light.intensity = flickerOn ? 1.5 : 0;
                    fluor.tube.material.emissiveIntensity = flickerOn ? 0.5 : 0;
                    fluor.lastFlicker = currentTime;
                    fluor.flickerInterval = 100 + Math.random() * 300;
                }
            } else {
                fluor.light.intensity = 1.5 + Math.sin(time * 10) * 0.1;
            }
        });
    }
    
    // 3. CAMPFIRE FLAMES
    if (this.campfires) {
        this.campfires.forEach(fire => {
            // Flame animation
            fire.flames.forEach(flame => {
                flame.position.y = flame.userData.baseY + 
                    Math.sin(time * flame.userData.flickerSpeed) * flame.userData.flickerAmount;
                flame.scale.setScalar(0.8 + Math.sin(time * flame.userData.flickerSpeed * 2) * 0.3);
            });
            
            // Fire light intensity
            fire.light.intensity = fire.baseIntensity + Math.sin(time * 3) * 0.8;
            
            // Smoke rising
            fire.smoke.forEach(particle => {
                particle.position.y += particle.userData.riseSpeed;
                particle.position.x += (Math.random() - 0.5) * 0.02;
                particle.position.z += (Math.random() - 0.5) * 0.02;
                
                if (particle.position.y > particle.userData.maxHeight) {
                    particle.position.y = 1;
                    particle.position.x = (Math.random() - 0.5) * 0.3;
                    particle.position.z = (Math.random() - 0.5) * 0.3;
                }
                
                // Fade as it rises
                const fadeAmount = particle.position.y / particle.userData.maxHeight;
                particle.material.opacity = 0.3 * (1 - fadeAmount);
            });
        });
    }
    
    // 4. GRAFFITI SLIGHT ANIMATION (breathing effect)
    if (this.graffitiWalls) {
        this.graffitiWalls.forEach((graffiti, index) => {
            const pulse = Math.sin(time * 0.5 + index * 0.3) * 0.02 + 1;
            graffiti.scale.x = graffiti.scale.x > 0 ? Math.abs(graffiti.scale.x) * pulse : -Math.abs(graffiti.scale.x) * pulse;
            graffiti.scale.y = graffiti.scale.y > 0 ? Math.abs(graffiti.scale.y) * pulse : -Math.abs(graffiti.scale.y) * pulse;
        });
    }
}

// ========================================
// TIME TRAVEL ANIMATIONS
// ========================================

updateTimeAnimations() {
    const time = this.time || Date.now() * 0.001;
    
    // 1. EGYPT - Flickering torches
    if (this.egyptTorches) {
        this.egyptTorches.forEach((torch, index) => {
            const flicker = Math.sin(time * 8 + index * 2) * 0.3 + 0.7;
            torch.light.intensity = torch.baseIntensity * flicker;
            torch.flame.scale.y = 1 + Math.sin(time * 10 + index) * 0.2;
        });
    }
    
    // 2. RENAISSANCE - Candle flicker
    if (this.renaissanceCandles) {
        this.renaissanceCandles.forEach((candle, index) => {
            const flicker = Math.sin(time * 5 + index) * 0.2 + 0.8;
            candle.light.intensity = candle.baseIntensity * flicker;
            
            candle.flames.forEach((flame, fIndex) => {
                flame.scale.set(1, 1 + Math.sin(time * 8 + fIndex) * 0.3, 1);
            });
        });
    }
    
    // 3. FUTURE - Hologram effects
    if (this.hologramColumns) {
        this.hologramColumns.forEach(holo => {
            // Pulsing light
            holo.light.intensity = holo.baseIntensity + Math.sin(time * 2) * 0.5;
            
            // Opacity flicker
            holo.column.material.opacity = 0.5 + Math.sin(time * 3) * 0.1;
            
            // Rotating rings
            holo.rings.forEach(ring => {
                ring.rotation.y += ring.userData.rotationSpeed;
            });
        });
    }
    
    // 4. FUTURE - Floating platforms
    if (this.floatingPlatforms) {
        this.floatingPlatforms.forEach(platform => {
            platform.position.y = platform.userData.baseY + 
                Math.sin(time * platform.userData.floatSpeed) * platform.userData.floatAmount;
        });
    }
    
    // 5. FUTURE - Grid pulse
    if (this.futureGridLines) {
        this.futureGridLines.forEach((line, index) => {
            const pulse = Math.sin(time * 2 + index * 0.1) * 0.3 + 0.5;
            line.material.opacity = pulse;
        });
    }
    
    // 6. FUTURE - Neon lights
    if (this.neonLights) {
        this.neonLights.forEach((neon, index) => {
            neon.light.intensity = neon.baseIntensity + Math.sin(time * 4 + index) * 1;
        });
    }
    
    // 7. FUTURE - Digital screens
    if (this.digitalScreens) {
        this.digitalScreens.forEach(screen => {
            const pulse = Math.sin(time * 3) * 0.1 + 0.9;
            screen.display.material.opacity = pulse;
        });
    }
    
    // 8. Portal animations
    if (this.portals) {
        this.portals.forEach(portal => {
            // Update shader time
            if (portal.surface.material.uniforms) {
                portal.surface.material.uniforms.time.value = time;
            }
            
            // Rotate particles
            portal.particles.forEach(particle => {
                particle.userData.angle += 0.01 * particle.userData.speed;
                const newX = Math.cos(particle.userData.angle) * particle.userData.radius;
                const newY = Math.sin(particle.userData.angle) * particle.userData.radius;
                particle.position.x = newX;
                particle.position.y = newY;
            });
            
            // Pulsing light
            portal.light.intensity = 3 + Math.sin(time * 3) * 1;
        });
    }
}

// ========================================
// TIME TRAVEL TRANSITION
// ========================================

travelToEra(newEra) {
    if (newEra === this.currentEra || this.isTimeTransitioning) return;
    
    this.isTimeTransitioning = true;
    console.log(`⏰ Traveling from ${this.eraNames[this.currentEra]} to ${this.eraNames[newEra]}`);
    
    // Show transition effect
    this.showTimeTransition();
    
    // Hide current room
    this.rooms[this.currentEra].visible = false;
    
    // Show new room after transition
    setTimeout(() => {
        this.rooms[newEra].visible = true;
        this.currentEra = newEra;
        this.isTimeTransitioning = false;
        
        // Update UI
        const eraInfo = [
            { name: 'Ancient Egypt', year: '2500 BC' },
            { name: 'Renaissance', year: '1500 AD' },
            { name: 'Future', year: '2500 AD' }
        ];
        
        document.getElementById('currentEra').textContent = eraInfo[newEra].name;
        document.getElementById('eraYear').textContent = eraInfo[newEra].year;
        
        // Reload artworks for new era
        this.displayImagesInGallery();
        
    }, 1000);
}

showTimeTransition() {
    const transition = document.createElement('div');
    transition.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, #4466ff 0%, #000000 100%);
        z-index: 9999;
        animation: timeWarp 1s ease-in-out;
        pointer-events: none;
    `;
    
    transition.innerHTML = `
        <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: white;
            font-weight: bold;
            animation: spin 1s linear infinite;
        ">🕰️</div>
        <style>
            @keyframes timeWarp {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            @keyframes spin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(transition);
    
    setTimeout(() => transition.remove(), 1000);
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
updateCrystalCaveAnimations() {
    const time = this.time || Date.now() * 0.001;
    
    // 1. CRYSTAL PULSING
    if (this.crystalClusters) {
        this.crystalClusters.forEach(cluster => {
            const pulse = Math.sin(time * cluster.pulseSpeed + cluster.pulseOffset) * 0.5 + 0.5;
            cluster.light.intensity = cluster.baseIntensity + pulse * 1.5;
            
            // Crystal glow intensity
            cluster.group.children.forEach(child => {
                if (child.material && child.material.emissiveIntensity !== undefined) {
                    child.material.emissiveIntensity = 0.8 + pulse * 0.4;
                }
            });
        });
    }
    
    // 2. MOSS PULSING
    if (this.mossPatches) {
        this.mossPatches.forEach(moss => {
            const pulse = Math.sin(time * moss.pulseSpeed + moss.pulseOffset) * 0.5 + 0.5;
            moss.light.intensity = moss.baseIntensity + pulse * 0.3;
            moss.mesh.material.emissiveIntensity = 0.4 + pulse * 0.2;
        });
    }
    
    // 3. WATERFALL PARTICLES
    if (this.waterfalls) {
        this.waterfalls.forEach(fall => {
            fall.particles.forEach(particle => {
                particle.position.y -= particle.userData.fallSpeed;
                
                // Reset to top when reaching bottom
                if (particle.position.y < 0) {
                    particle.position.y = particle.userData.maxHeight;
                    particle.position.x = (Math.random() - 0.5) * 2.5;
                }
            });
            
            // Pulsing impact light
            fall.light.intensity = 2.0 + Math.sin(time * 3) * 0.5;
            
            // Mist animation
            fall.mist.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
            fall.mist.material.opacity = 0.2 + Math.sin(time * 1.5) * 0.1;
        });
    }
    
    // 4. REFLECTING POOL RIPPLES
    if (this.reflectingPools) {
        this.reflectingPools.forEach(pool => {
            pool.ripples.forEach(ripple => {
                const ripplePhase = (time * 0.5 + ripple.userData.phase) % (Math.PI * 2);
                const expansion = (ripplePhase / (Math.PI * 2));
                
                const currentRadius = ripple.userData.initialRadius + 
                    (ripple.userData.maxRadius - ripple.userData.initialRadius) * expansion;
                
                ripple.scale.setScalar(currentRadius * 10);
                ripple.material.opacity = 0.3 * (1 - expansion);
            });
            
            // Pool light pulse
            pool.light.intensity = 1.5 + Math.sin(time * 0.8) * 0.5;
        });
    }
    
    // 5. GENTLE STALACTITE SWAY
    if (this.stalactites) {
        this.stalactites.forEach((stalactite, index) => {
            stalactite.rotation.z = Math.sin(time * 0.2 + index * 0.5) * 0.02;
        });
    }
}

animate() {
    requestAnimationFrame(() => this.animate());
    const delta = 0.016;
    this.time += delta;
    this.update();
    this.updateImageEffects();
    this.updateLighting();
    this.updateTimeAnimations();
    this.checkPortalProximity(); // ✓ ADD THIS LINE
   
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
    
    // ✓ ADD: Era switching with keys 1, 2, 3
    if (event.key === '1') this.travelToEra(0); // Egypt
    if (event.key === '2') this.travelToEra(1); // Renaissance
    if (event.key === '3') this.travelToEra(2); // Future
    
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
checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = 1.6;
        
        // Time Travel Gallery bounds
        const minX = -13;
        const maxX = 13;
        const minZ = -13;
        const maxZ = 13;

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
            if (obj.parent && obj.parent.userData.isPortal) {
                const targetEra = obj.parent.userData.targetEra;
                this.travelToEra(targetEra);
                if (!this.clickSound.isPlaying) this.clickSound.play();
                return; // Exit early
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
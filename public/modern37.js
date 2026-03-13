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
    // ABANDONED THEME PARK HOTEL SYSTEM
    // ========================================
    
    this.neonSigns = [];
    this.dustyFurniture = [];
    this.plantLife = [];
    this.flickeringLights = [];
    this.debrisObjects = [];
    this.hotelAnimations = [];
    
    this.createHotelStructure();
    this.createGrandLobby();
    this.createBrokenEscalators();
    this.createIndoorPool();
    this.createElevatorShaft();
    this.createDustyFurniture();
    this.createFlickeringNeon();
    this.createBallroom();
    this.createRooftopGarden();
    this.createDecayEffects();
    this.createHotelUI();
    
    console.log("🏨 Abandoned Theme Park Hotel created!");
}

// ========================================
// HOTEL STRUCTURE (main building shell)
// ========================================

createHotelStructure() {
    const hotelRoom = new THREE.Group();
    hotelRoom.visible = true;
    
    const lobbyWidth = 40;
    const lobbyLength = 60;
    const lobbyHeight = 20;
    
    // ========================================
    // MATERIALS (worn, decayed)
    // ========================================
    
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a5a4a,
        roughness: 0.8,
        metalness: 0.0
    });
    
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.9
    });
    
    // ========================================
    // LOBBY FLOOR (broken tiles)
    // ========================================
    
    const lobbyFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(lobbyWidth, lobbyLength),
        floorMaterial
    );
    lobbyFloor.rotation.x = -Math.PI / 2;
    lobbyFloor.receiveShadow = true;
    hotelRoom.add(lobbyFloor);
    
    // Broken tile pattern
    for (let i = 0; i < 50; i++) {
        const brokenTile = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x2a2a2a : 0x5a4a3a,
                roughness: 0.9
            })
        );
        brokenTile.rotation.x = -Math.PI / 2;
        brokenTile.position.set(
            (Math.random() - 0.5) * lobbyWidth,
            0.01,
            (Math.random() - 0.5) * lobbyLength
        );
        hotelRoom.add(brokenTile);
    }
    
    // Missing tiles (holes)
    for (let i = 0; i < 15; i++) {
        const hole = new THREE.Mesh(
            new THREE.CircleGeometry(0.5, 6),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 1.0
            })
        );
        hole.rotation.x = -Math.PI / 2;
        hole.position.set(
            (Math.random() - 0.5) * lobbyWidth,
            0.02,
            (Math.random() - 0.5) * lobbyLength
        );
        hotelRoom.add(hole);
    }
    
    // ========================================
    // WALLS (peeling wallpaper)
    // ========================================
    
    // Main walls
    [-lobbyWidth/2, lobbyWidth/2].forEach((x, index) => {
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(lobbyLength, lobbyHeight),
            wallMaterial
        );
        wall.position.set(x, lobbyHeight/2, 0);
        wall.rotation.y = index === 0 ? Math.PI/2 : -Math.PI/2;
        wall.receiveShadow = true;
        hotelRoom.add(wall);
        
        // Peeling wallpaper strips
        for (let i = 0; i < 20; i++) {
            const peel = new THREE.Mesh(
                new THREE.PlaneGeometry(0.5, 2),
                new THREE.MeshStandardMaterial({
                    color: 0x8a7a6a,
                    roughness: 0.7,
                    side: THREE.DoubleSide
                })
            );
            peel.position.set(
                x + (index === 0 ? 0.05 : -0.05),
                Math.random() * lobbyHeight,
                (Math.random() - 0.5) * lobbyLength
            );
            peel.rotation.y = index === 0 ? Math.PI/2 : -Math.PI/2;
            peel.rotation.z = (Math.random() - 0.5) * 0.5;
            hotelRoom.add(peel);
        }
    });
    
    // End walls
    [-lobbyLength/2, lobbyLength/2].forEach((z, index) => {
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(lobbyWidth, lobbyHeight),
            wallMaterial
        );
        wall.position.set(0, lobbyHeight/2, z);
        wall.rotation.y = index === 0 ? 0 : Math.PI;
        wall.receiveShadow = true;
        hotelRoom.add(wall);
    });
    
    // ========================================
    // CEILING (water damage, holes)
    // ========================================
    
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(lobbyWidth, lobbyLength),
        ceilingMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = lobbyHeight;
    ceiling.receiveShadow = true;
    hotelRoom.add(ceiling);
    
    // Water damage stains
    for (let i = 0; i < 30; i++) {
        const stain = new THREE.Mesh(
            new THREE.CircleGeometry(1 + Math.random() * 2, 8),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a1a,
                roughness: 1.0,
                transparent: true,
                opacity: 0.7
            })
        );
        stain.rotation.x = Math.PI / 2;
        stain.position.set(
            (Math.random() - 0.5) * lobbyWidth,
            lobbyHeight - 0.1,
            (Math.random() - 0.5) * lobbyLength
        );
        hotelRoom.add(stain);
    }
    
    // Ceiling holes (collapsed sections)
    for (let i = 0; i < 5; i++) {
        const hole = new THREE.Mesh(
            new THREE.CircleGeometry(2, 8),
            new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                roughness: 1.0
            })
        );
        hole.rotation.x = Math.PI / 2;
        hole.position.set(
            (Math.random() - 0.5) * lobbyWidth * 0.8,
            lobbyHeight - 0.05,
            (Math.random() - 0.5) * lobbyLength * 0.8
        );
        hotelRoom.add(hole);
    }
    
    // ========================================
    // ATMOSPHERIC LIGHTING (dim, eerie)
    // ========================================
    
    // Very dim ambient (abandoned feel)
    const ambientLight = new THREE.AmbientLight(0x332211, 0.3);
    hotelRoom.add(ambientLight);
    
    // Broken overhead lights (some working, some not)
    for (let i = 0; i < 12; i++) {
        const isWorking = Math.random() > 0.4;
        
        if (isWorking) {
            const light = new THREE.PointLight(0xffaa44, 0.5, 15);
            light.position.set(
                (Math.random() - 0.5) * lobbyWidth * 0.8,
                lobbyHeight - 2,
                (Math.random() - 0.5) * lobbyLength * 0.8
            );
            light.castShadow = true;
            hotelRoom.add(light);
            
            this.flickeringLights.push({
                light: light,
                baseIntensity: 0.5,
                flickerSpeed: 2 + Math.random() * 3
            });
        }
    }
    
    // Eerie fog
    this.scene.fog = new THREE.Fog(0x1a1510, 20, 80);
    
    // ========================================
    // ARTWORK DISPLAY LOCATIONS
    // ========================================
    
    this.hotelArtworkSpots = [];
    
    // Lobby walls
    for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -25 + (Math.floor(i / 2) * 12);
        
        this.hotelArtworkSpots.push({
            x: side * 18,
            y: 4,
            z: z,
            rot: side === -1 ? Math.PI/2 : -Math.PI/2
        });
    }
    
    hotelRoom.position.set(0, 0, 0);
    this.rooms.push(hotelRoom);
    this.scene.add(hotelRoom);
}

// ========================================
// GRAND LOBBY (reception desk, chandelier)
// ========================================

createGrandLobby() {
    const lobbyGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.9
    });
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a3a,
        roughness: 0.6,
        metalness: 0.7
    });
    
    // ========================================
    // RECEPTION DESK (abandoned)
    // ========================================
    
    const receptionDesk = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.2, 2.5),
        woodMaterial
    );
    receptionDesk.position.set(0, 0.6, -25);
    receptionDesk.castShadow = true;
    lobbyGroup.add(receptionDesk);
    
    // Desk top
    const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(8.2, 0.1, 2.7),
        new THREE.MeshStandardMaterial({
            color: 0x2a1a0a,
            roughness: 0.7
        })
    );
    deskTop.position.set(0, 1.25, -25);
    lobbyGroup.add(deskTop);
    
    // Old bell (tarnished)
    const bell = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.3, 8),
        metalMaterial
    );
    bell.position.set(-2, 1.4, -25);
    lobbyGroup.add(bell);
    
    // Scattered papers
    for (let i = 0; i < 10; i++) {
        const paper = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0xeeeecc,
                roughness: 0.9
            })
        );
        paper.position.set(
            (Math.random() - 0.5) * 3,
            1.3,
            -25 + (Math.random() - 0.5) * 1
        );
        paper.rotation.x = -Math.PI / 2;
        paper.rotation.z = Math.random() * Math.PI;
        lobbyGroup.add(paper);
    }
    
    // ========================================
    // BROKEN CHANDELIER (hanging low)
    // ========================================
    
    const chandelierGroup = new THREE.Group();
    
    // Main body (rusty)
    const chandelierBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, 2, 8),
        metalMaterial
    );
    chandelierGroup.add(chandelierBase);
    
    // Arms (broken, hanging)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.08, 1.5, 6),
            metalMaterial
        );
        arm.position.set(
            Math.cos(angle) * 1.2,
            -0.5,
            Math.sin(angle) * 1.2
        );
        arm.rotation.z = Math.PI / 4;
        arm.rotation.y = angle;
        chandelierGroup.add(arm);
        
        // Broken bulbs (some missing)
        if (Math.random() > 0.3) {
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x332211,
                    roughness: 0.8,
                    emissive: Math.random() > 0.5 ? 0x0 : 0x442211,
                    emissiveIntensity: 0.2
                })
            );
            bulb.position.set(
                Math.cos(angle) * 1.8,
                -1.2,
                Math.sin(angle) * 1.8
            );
            chandelierGroup.add(bulb);
        }
    }
    
    // Chain (rusty, drooping)
    const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 8, 8),
        metalMaterial
    );
    chain.position.y = 5;
    chandelierGroup.add(chain);
    
    chandelierGroup.position.set(0, 10, -10);
    chandelierGroup.userData.swayAmount = 0.05;
    chandelierGroup.userData.swaySpeed = 0.3;
    this.hotelAnimations.push(chandelierGroup);
    
    lobbyGroup.add(chandelierGroup);
    
    // ========================================
    // PILLARS (cracked marble)
    // ========================================
    
    const pillarPositions = [
        { x: -12, z: -15 },
        { x: 12, z: -15 },
        { x: -12, z: 0 },
        { x: 12, z: 0 },
        { x: -12, z: 15 },
        { x: 12, z: 15 }
    ];
    
    pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1, 15, 12),
            new THREE.MeshStandardMaterial({
                color: 0x8a8a7a,
                roughness: 0.7
            })
        );
        pillar.position.set(pos.x, 7.5, pos.z);
        pillar.castShadow = true;
        lobbyGroup.add(pillar);
        
        // Cracks
        for (let i = 0; i < 5; i++) {
            const crack = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 2),
                new THREE.MeshStandardMaterial({
                    color: 0x2a2a2a,
                    roughness: 1.0
                })
            );
            const angle = Math.random() * Math.PI * 2;
            crack.position.set(
                pos.x + Math.cos(angle) * 0.81,
                3 + Math.random() * 8,
                pos.z + Math.sin(angle) * 0.81
            );
            crack.lookAt(new THREE.Vector3(pos.x, crack.position.y, pos.z));
            lobbyGroup.add(crack);
        }
    });
    
    this.rooms[0].add(lobbyGroup);
}
// ========================================
// BROKEN ESCALATORS (frozen in time)
// ========================================

createBrokenEscalators() {
    const escalatorGroup = new THREE.Group();
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.5,
        metalness: 0.8
    });
    
    const rubberMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9
    });
    
    // Create two escalators (up and down)
    [-4, 4].forEach((xOffset, index) => {
        const direction = index === 0 ? 1 : -1;
        
        // Escalator frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 15),
            metalMaterial
        );
        frame.position.set(xOffset, 3, 10);
        frame.rotation.x = Math.PI / 8 * direction;
        frame.castShadow = true;
        escalatorGroup.add(frame);
        
        // Steps (stuck at odd angles)
        for (let i = 0; i < 20; i++) {
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.15, 0.4),
                rubberMaterial
            );
            
            const progress = i / 20;
            const z = 3 + progress * 14;
            const y = 0.5 + progress * 5;
            
            step.position.set(xOffset, y, z);
            step.rotation.x = Math.PI / 8 * direction + (Math.random() - 0.5) * 0.1;
            step.castShadow = true;
            escalatorGroup.add(step);
            
            // Random broken step
            if (Math.random() > 0.7) {
                step.rotation.z = (Math.random() - 0.5) * 0.3;
                step.position.y -= 0.2;
            }
        }
        
        // Handrails (bent, hanging)
        [-1, 1].forEach(side => {
            const railPoints = [];
            for (let i = 0; i <= 15; i++) {
                const t = i / 15;
                const z = 3 + t * 14;
                const y = 1.5 + t * 5;
                const sag = Math.sin(t * Math.PI) * 0.3; // Sagging in middle
                
                railPoints.push(new THREE.Vector3(
                    xOffset + side,
                    y + sag,
                    z
                ));
            }
            
            const railCurve = new THREE.CatmullRomCurve3(railPoints);
            const railGeometry = new THREE.TubeGeometry(railCurve, 15, 0.08, 8, false);
            const rail = new THREE.Mesh(railGeometry, metalMaterial);
            escalatorGroup.add(rail);
        });
        
        // Warning signs (faded)
        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.5),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.7,
                emissive: 0x442200,
                emissiveIntensity: 0.2
            })
        );
        sign.position.set(xOffset, 0.8, 2);
        sign.rotation.x = -Math.PI / 3;
        escalatorGroup.add(sign);
    });
    
    // Debris at bottom
    for (let i = 0; i < 15; i++) {
        const debris = new THREE.Mesh(
            new THREE.BoxGeometry(
                Math.random() * 0.3 + 0.1,
                Math.random() * 0.2 + 0.05,
                Math.random() * 0.3 + 0.1
            ),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x3a3a3a : 0x2a2a2a,
                roughness: 0.9
            })
        );
        debris.position.set(
            (Math.random() - 0.5) * 8,
            0.1,
            2 + Math.random() * 3
        );
        debris.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        escalatorGroup.add(debris);
        this.debrisObjects.push(debris);
    }
    
    this.rooms[0].add(escalatorGroup);
}

// ========================================
// INDOOR POOL (overgrown, murky water)
// ========================================

createIndoorPool() {
    const poolGroup = new THREE.Group();
    
    // Pool structure
    const poolWidth = 12;
    const poolLength = 20;
    const poolDepth = 3;
    
    // Pool walls (cracked tiles)
    const tileMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a6a8a,
        roughness: 0.4,
        metalness: 0.1
    });
    
    // Pool floor
    const poolFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(poolWidth, poolLength),
        new THREE.MeshStandardMaterial({
            color: 0x2a3a4a,
            roughness: 0.6
        })
    );
    poolFloor.rotation.x = -Math.PI / 2;
    poolFloor.position.set(15, -poolDepth, 10);
    poolGroup.add(poolFloor);
    
    // Pool sides
    const poolSide1 = new THREE.Mesh(
        new THREE.PlaneGeometry(poolLength, poolDepth),
        tileMaterial
    );
    poolSide1.position.set(15 - poolWidth/2, -poolDepth/2, 10);
    poolSide1.rotation.y = Math.PI / 2;
    poolGroup.add(poolSide1);
    
    const poolSide2 = new THREE.Mesh(
        new THREE.PlaneGeometry(poolLength, poolDepth),
        tileMaterial
    );
    poolSide2.position.set(15 + poolWidth/2, -poolDepth/2, 10);
    poolSide2.rotation.y = -Math.PI / 2;
    poolGroup.add(poolSide2);
    
    // Cracked tiles
    for (let i = 0; i < 30; i++) {
        const crack = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 1.0
            })
        );
        crack.position.set(
            15 + (Math.random() - 0.5) * poolWidth,
            -poolDepth + 0.1,
            10 + (Math.random() - 0.5) * poolLength
        );
        crack.rotation.x = -Math.PI / 2;
        crack.rotation.z = Math.random() * Math.PI;
        poolGroup.add(crack);
    }
    
    // Murky water surface
    const waterSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(poolWidth, poolLength),
        new THREE.MeshStandardMaterial({
            color: 0x2a4a3a,
            transparent: true,
            opacity: 0.7,
            roughness: 0.2,
            metalness: 0.3
        })
    );
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.set(15, -0.5, 10);
    waterSurface.userData.isWater = true;
    this.hotelAnimations.push(waterSurface);
    poolGroup.add(waterSurface);
    
    // Algae/scum on surface
    for (let i = 0; i < 20; i++) {
        const algae = new THREE.Mesh(
            new THREE.CircleGeometry(0.3 + Math.random() * 0.5, 6),
            new THREE.MeshStandardMaterial({
                color: 0x2a3a1a,
                roughness: 1.0
            })
        );
        algae.rotation.x = -Math.PI / 2;
        algae.position.set(
            15 + (Math.random() - 0.5) * poolWidth * 0.9,
            -0.4,
            10 + (Math.random() - 0.5) * poolLength * 0.9
        );
        poolGroup.add(algae);
    }
    
    // ========================================
    // OVERGROWN PLANTS (vines, weeds)
    // ========================================
    
    // Vines growing from ceiling
    for (let i = 0; i < 15; i++) {
        const vinePoints = [];
        const startX = 15 + (Math.random() - 0.5) * poolWidth * 2;
        const startZ = 10 + (Math.random() - 0.5) * poolLength * 1.5;
        const vineLength = 5 + Math.random() * 8;
        
        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            const y = 18 - t * vineLength;
            const sway = Math.sin(t * Math.PI * 3) * 0.3;
            
            vinePoints.push(new THREE.Vector3(
                startX + sway,
                y,
                startZ + sway * 0.5
            ));
        }
        
        const vineCurve = new THREE.CatmullRomCurve3(vinePoints);
        const vineGeometry = new THREE.TubeGeometry(vineCurve, 20, 0.05, 6, false);
        const vine = new THREE.Mesh(
            vineGeometry,
            new THREE.MeshStandardMaterial({
                color: 0x2a4a2a,
                roughness: 0.9
            })
        );
        poolGroup.add(vine);
        this.plantLife.push(vine);
        
        // Leaves on vine
        for (let k = 0; k < 10; k++) {
            const leaf = new THREE.Mesh(
                new THREE.ConeGeometry(0.15, 0.3, 4),
                new THREE.MeshStandardMaterial({
                    color: 0x3a5a3a,
                    roughness: 0.8
                })
            );
            const point = vineCurve.getPoint(k / 10);
            leaf.position.copy(point);
            leaf.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            poolGroup.add(leaf);
        }
    }
    
    // Weeds growing through floor cracks
    for (let i = 0; i < 25; i++) {
        const weed = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.5 + Math.random() * 0.5, 4),
            new THREE.MeshStandardMaterial({
                color: 0x3a5a2a,
                roughness: 0.9
            })
        );
        weed.position.set(
            15 + (Math.random() - 0.5) * poolWidth * 1.5,
            0.25,
            10 + (Math.random() - 0.5) * poolLength * 1.2
        );
        weed.rotation.x = (Math.random() - 0.5) * 0.3;
        poolGroup.add(weed);
    }
    
    // Rusty pool ladder
    const ladderMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a5a3a,
        roughness: 0.8,
        metalness: 0.5
    });
    
    const ladder = new THREE.Group();
    
    // Vertical bars
    [-0.3, 0.3].forEach(x => {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, poolDepth + 1, 8),
            ladderMaterial
        );
        bar.position.set(15 + poolWidth/2 - 1, -poolDepth/2 + 0.5, 10);
        ladder.add(bar);
    });
    
    // Rungs
    for (let i = 0; i < 5; i++) {
        const rung = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8),
            ladderMaterial
        );
        rung.rotation.z = Math.PI / 2;
        rung.position.set(
            15 + poolWidth/2 - 1,
            -poolDepth + 1 + i * 0.7,
            10
        );
        ladder.add(rung);
    }
    
    poolGroup.add(ladder);
    
    // Broken pool chairs
    for (let i = 0; i < 4; i++) {
        const chair = this.createPoolChair();
        chair.position.set(
            15 + (Math.random() - 0.5) * poolWidth * 2,
            0,
            10 + poolLength/2 + 3 + i * 2
        );
        chair.rotation.y = (Math.random() - 0.5) * Math.PI;
        poolGroup.add(chair);
    }
    
    this.rooms[0].add(poolGroup);
}

createPoolChair() {
    const chairGroup = new THREE.Group();
    
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a6a5a,
        roughness: 0.7,
        metalness: 0.6
    });
    
    const fabricMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.9
    });
    
    // Frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 2),
        frameMaterial
    );
    frame.position.y = 0.5;
    chairGroup.add(frame);
    
    // Legs (some bent)
    [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]].forEach((pos, index) => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6),
            frameMaterial
        );
        leg.position.set(pos[0], 0.25, pos[1]);
        if (index === 2) leg.rotation.x = 0.2; // Bent leg
        chairGroup.add(leg);
    });
    
    // Torn fabric
    const fabric = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 1.8),
        fabricMaterial
    );
    fabric.rotation.x = -Math.PI / 3;
    fabric.position.set(0, 0.6, 0);
    chairGroup.add(fabric);
    
    // Holes in fabric
    for (let i = 0; i < 3; i++) {
        const hole = new THREE.Mesh(
            new THREE.CircleGeometry(0.1, 6),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 1.0
            })
        );
        hole.position.set(
            (Math.random() - 0.5) * 0.8,
            0.61,
            (Math.random() - 0.5) * 1.2
        );
        hole.rotation.x = -Math.PI / 3;
        chairGroup.add(hole);
    }
    
    return chairGroup;
}

// ========================================
// ELEVATOR SHAFT (view into darkness)
// ========================================

createElevatorShaft() {
    const shaftGroup = new THREE.Group();
    
    const shaftWidth = 3;
    const shaftDepth = 3;
    const shaftHeight = 30;
    
    const shaftMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8
    });
    
    // Shaft opening in wall
    const shaftPosition = { x: -18, y: 5, z: -20 };
    
    // Back wall of shaft (darkness)
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(shaftWidth, shaftHeight),
        new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 1.0
        })
    );
    backWall.position.set(shaftPosition.x - shaftDepth, shaftPosition.y, shaftPosition.z);
    backWall.rotation.y = Math.PI / 2;
    shaftGroup.add(backWall);
    
    // Side walls
    [-shaftWidth/2, shaftWidth/2].forEach(offset => {
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(shaftDepth, shaftHeight),
            shaftMaterial
        );
        wall.position.set(shaftPosition.x - shaftDepth/2, shaftPosition.y, shaftPosition.z + offset);
        wall.rotation.y = offset < 0 ? 0 : Math.PI;
        shaftGroup.add(wall);
    });
    
    // Elevator cables (hanging, frayed)
    for (let i = 0; i < 4; i++) {
        const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, shaftHeight, 6),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.6,
                metalness: 0.8
            })
        );
        cable.position.set(
            shaftPosition.x - shaftDepth/2,
            shaftPosition.y,
            shaftPosition.z + (Math.random() - 0.5) * shaftWidth * 0.6
        );
        shaftGroup.add(cable);
    }
    
    // Broken elevator car at bottom (visible from top)
    const elevatorCar = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.5, 2.5),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a3a,
            roughness: 0.6,
            metalness: 0.5
        })
    );
    elevatorCar.position.set(
        shaftPosition.x - shaftDepth/2,
        -10,
        shaftPosition.z
    );
    shaftGroup.add(elevatorCar);
    
    // Broken doors (partially open)
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a5a4a,
        roughness: 0.5,
        metalness: 0.7
    });
    
    [-0.8, 0.8].forEach((offset, index) => {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 2.5, 0.1),
            doorMaterial
        );
        door.position.set(
            shaftPosition.x + 0.05,
            shaftPosition.y - 3.5,
            shaftPosition.z + offset
        );
        shaftGroup.add(door);
    });
    
    // Warning signs
    const warningSign = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.4),
        new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            roughness: 0.7,
            emissive: 0x442200,
            emissiveIntensity: 0.3
        })
    );
    warningSign.position.set(shaftPosition.x + 0.2, shaftPosition.y + 2, shaftPosition.z);
    warningSign.rotation.y = Math.PI / 2;
    shaftGroup.add(warningSign);
    
    // Dim light from above
    const shaftLight = new THREE.PointLight(0x664422, 0.3, 20);
    shaftLight.position.set(shaftPosition.x - shaftDepth/2, shaftPosition.y + 10, shaftPosition.z);
    shaftGroup.add(shaftLight);
    
    this.rooms[0].add(shaftGroup);
}

// ========================================
// DUSTY FURNITURE (scattered, broken)
// ========================================

createDustyFurniture() {
    // Lobby couches (torn, faded)
    const couchPositions = [
        { x: -8, z: -5, rot: 0 },
        { x: 8, z: -5, rot: Math.PI },
        { x: -10, z: 5, rot: Math.PI / 4 },
        { x: 10, z: 8, rot: -Math.PI / 3 }
    ];
    
    couchPositions.forEach(pos => {
        const couch = this.createOldCouch();
        couch.position.set(pos.x, 0, pos.z);
        couch.rotation.y = pos.rot;
        this.rooms[0].add(couch);
        this.dustyFurniture.push(couch);
    });
    
    // Coffee tables (broken glass)
    for (let i = 0; i < 6; i++) {
        const table = this.createCoffeeTable();
        table.position.set(
            (Math.random() - 0.5) * 25,
            0,
            (Math.random() - 0.5) * 40
        );
        table.rotation.y = Math.random() * Math.PI;
        this.rooms[0].add(table);
    }
    
    // Overturned chairs
    for (let i = 0; i < 10; i++) {
        const chair = this.createLobbyChair();
        chair.position.set(
            (Math.random() - 0.5) * 30,
            Math.random() > 0.5 ? 0 : 0.8, // Some upright, some fallen
            (Math.random() - 0.5) * 50
        );
        chair.rotation.set(
            Math.random() > 0.5 ? 0 : Math.PI / 2, // Some on side
            Math.random() * Math.PI,
            Math.random() > 0.7 ? Math.PI / 4 : 0
        );
        this.rooms[0].add(chair);
    }
    
    // Abandoned luggage cart
    const luggageCart = this.createLuggageCart();
    luggageCart.position.set(5, 0, -18);
    luggageCart.rotation.y = Math.PI / 6;
    this.rooms[0].add(luggageCart);
    
    // Potted plants (dead, dried)
    for (let i = 0; i < 8; i++) {
        const plant = this.createDeadPlant();
        plant.position.set(
            (Math.random() - 0.5) * 35,
            0,
            (Math.random() - 0.5) * 55
        );
        this.rooms[0].add(plant);
    }
}

createOldCouch() {
    const couchGroup = new THREE.Group();
    
    const fabricMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a4a3a,
        roughness: 0.9
    });
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.8
    });
    
    // Base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.8, 1.2),
        fabricMaterial
    );
    base.position.y = 0.4;
    couchGroup.add(base);
    
    // Backrest (sagging)
    const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 0.3),
        fabricMaterial
    );
    backrest.position.set(0, 1, -0.45);
    backrest.rotation.x = -0.1; // Leaning back
    couchGroup.add(backrest);
    
    // Armrests
    [-1.4, 1.4].forEach(x => {
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 1.2),
            woodMaterial
        );
        arm.position.set(x, 0.8, 0);
        couchGroup.add(arm);
    });
    
    // Torn fabric (holes)
    for (let i = 0; i < 4; i++) {
        const tear = new THREE.Mesh(
            new THREE.CircleGeometry(0.1 + Math.random() * 0.15, 6),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a1a,
                roughness: 1.0
            })
        );
        tear.position.set(
            (Math.random() - 0.5) * 2.5,
            0.41,
            (Math.random() - 0.5) * 1
        );
        tear.rotation.x = -Math.PI / 2;
        couchGroup.add(tear);
    }
    
    // Dust/dirt accumulation (dark spots)
    for (let i = 0; i < 10; i++) {
        const dust = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 6),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 1.0,
                transparent: true,
                opacity: 0.5
            })
        );
        dust.position.set(
            (Math.random() - 0.5) * 2.8,
            0.82,
            (Math.random() - 0.5) * 1.1
        );
        dust.rotation.x = -Math.PI / 2;
        couchGroup.add(dust);
    }
    
    return couchGroup;
}

createCoffeeTable() {
    const tableGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.7
    });
    
    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.4
    });
    
    // Legs
    [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]].forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8),
            woodMaterial
        );
        leg.position.set(pos[0], 0.3, pos[1]);
        tableGroup.add(leg);
    });
    
    // Glass top (cracked or missing)
    if (Math.random() > 0.3) {
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.05, 1.2),
            glassMaterial
        );
        top.position.y = 0.65;
        tableGroup.add(top);
        
        // Cracks in glass
        for (let i = 0; i < 3; i++) {
            const crack = new THREE.Mesh(
                new THREE.PlaneGeometry(0.02, 0.5),
                new THREE.MeshStandardMaterial({
                    color: 0x222222,
                    roughness: 1.0
                })
            );
            crack.position.set(
                (Math.random() - 0.5) * 1.5,
                0.66,
                (Math.random() - 0.5) * 0.8
            );
            crack.rotation.x = -Math.PI / 2;
            crack.rotation.z = Math.random() * Math.PI;
            tableGroup.add(crack);
        }
    }
    
    return tableGroup;
}

createLobbyChair() {
    const chairGroup = new THREE.Group();
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.8
    });
    
    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.6),
        material
    );
    seat.position.y = 0.5;
    chairGroup.add(seat);
    
    // Backrest
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.1),
        material
    );
    back.position.set(0, 0.9, -0.25);
    chairGroup.add(back);
    
    // Legs
    [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.04, 0.5, 6),
            material
        );
        leg.position.set(pos[0], 0.25, pos[1]);
        chairGroup.add(leg);
    });
    
    return chairGroup;
}

createLuggageCart() {
    const cartGroup = new THREE.Group();
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a5a4a,
        roughness: 0.6,
        metalness: 0.7
    });
    
    // Frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1, 0.8),
        metalMaterial
    );
    frame.position.y = 0.7;
    cartGroup.add(frame);
    
    // Handle
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8),
        metalMaterial
    );
    handle.position.set(0, 1.5, -0.5);
    handle.rotation.x = Math.PI / 6;
    cartGroup.add(handle);
    
    // Wheels
    [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].forEach(pos => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.8
            })
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], 0.1, pos[1]);
        cartGroup.add(wheel);
    });
    
    // Old suitcases on cart
    for (let i = 0; i < 2; i++) {
        const suitcase = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3, 0.4),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x5a3a2a : 0x3a3a2a,
                roughness: 0.9
            })
        );
        suitcase.position.set(
            (Math.random() - 0.5) * 0.8,
            1 + i * 0.35,
            (Math.random() - 0.5) * 0.4
        );
        suitcase.rotation.y = Math.random() * Math.PI;
        cartGroup.add(suitcase);
    }
    
    return cartGroup;
}

createDeadPlant() {
    const plantGroup = new THREE.Group();
    
    // Pot (cracked)
    const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.25, 0.5, 8),
        new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        })
    );
    pot.position.y = 0.25;
    plantGroup.add(pot);
    
    // Dead branches
    for (let i = 0; i < 5; i++) {
        const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.01, 0.5 + Math.random() * 0.5, 6),
            new THREE.MeshStandardMaterial({
                color: 0x3a2a1a,
                roughness: 1.0
            })
        );
        branch.position.set(
            (Math.random() - 0.5) * 0.2,
            0.5 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.2
        );
        branch.rotation.set(
            (Math.random() - 0.5) * 0.5,
            Math.random() * Math.PI,
            (Math.random() - 0.5) * 0.5
        );
        plantGroup.add(branch);
    }
    
    return plantGroup;
}

// ========================================
// FLICKERING NEON SIGNS
// ========================================

createFlickeringNeon() {
    // "HOTEL" sign (partially broken)
    const hotelSign = this.createNeonSign("HOTEL", 0xff0066, { x: 0, y: 12, z: -28 });
    this.rooms[0].add(hotelSign);
    this.neonSigns.push(hotelSign);
    
    // "VACANCY" sign (ironic - all broken letters except "NO")
    const vacancySign = this.createNeonSign("NO VACANCY", 0x00ffff, { x: -15, y: 8, z: -28 });
    vacancySign.userData.brokenLetters = [3, 5, 6, 7, 8, 9]; // Only "NO " works
    this.rooms[0].add(vacancySign);
    this.neonSigns.push(vacancySign);
    
    // "POOL" sign (dim, flickering)
    const poolSign = this.createNeonSign("POOL", 0x00ff88, { x: 15, y: 6, z: 20 });
    poolSign.rotation.y = -Math.PI / 2;
    this.rooms[0].add(poolSign);
    this.neonSigns.push(poolSign);
    
    // "EXIT" signs (emergency, faded red)
    const exitPositions = [
        { x: -18, y: 3, z: 25, rot: Math.PI / 2 },
        { x: 18, y: 3, z: 25, rot: -Math.PI / 2 },
        { x: 0, y: 3, z: -28, rot: 0 }
    ];
    
    exitPositions.forEach(pos => {
        const exitSign = this.createNeonSign("EXIT", 0xff2200, pos);
        exitSign.rotation.y = pos.rot;
        exitSign.userData.isExit = true;
        this.rooms[0].add(exitSign);
        this.neonSigns.push(exitSign);
    });
}

createNeonSign(text, color, position) {
    const signGroup = new THREE.Group();
    
    // Backing board
    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(text.length * 0.8, 1.2, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8
        })
    );
    signGroup.add(backing);
    
    // Neon tubes (one per letter)
    const letterSpacing = 0.8;
    const startX = -(text.length - 1) * letterSpacing / 2;
    
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') continue;
        
        const isBroken = signGroup.userData.brokenLetters?.includes(i) || false;
        
        const tube = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.8, 0.08),
            new THREE.MeshStandardMaterial({
                color: isBroken ? 0x1a1a1a : color,
                emissive: isBroken ? 0x000000 : color,
                emissiveIntensity: isBroken ? 0 : 0.8,
                transparent: true,
                opacity: isBroken ? 0.3 : 0.9
            })
        );
        tube.position.set(startX + i * letterSpacing, 0, 0.06);
        signGroup.add(tube);
        
        // Point light for glow
        if (!isBroken) {
            const light = new THREE.PointLight(color, 0.8, 5);
            light.position.set(startX + i * letterSpacing, 0, 0.5);
            signGroup.add(light);
            signGroup.userData.lights = signGroup.userData.lights || [];
            signGroup.userData.lights.push(light);
        }
    }
    
    signGroup.position.set(position.x, position.y, position.z);
    signGroup.userData.baseColor = color;
    signGroup.userData.flickerPhase = Math.random() * Math.PI * 2;
    
    return signGroup;
}

// ========================================
// BALLROOM (exhibition space)
// ========================================

createBallroom() {
    const ballroomGroup = new THREE.Group();
    
    const ballroomWidth = 25;
    const ballroomLength = 30;
    const ballroomHeight = 15;
    
    // Position ballroom to the side
    const ballroomOffset = { x: -25, z: 20 };
    
    // Parquet floor (warped, stained)
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ballroomWidth, ballroomLength),
        new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.7
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(ballroomOffset.x, 0, ballroomOffset.z);
    ballroomGroup.add(floor);
    
    // Parquet pattern
    for (let i = 0; i < 200; i++) {
        const plank = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.15),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x4a2a1a : 0x6a4a3a,
                roughness: 0.8
            })
        );
        plank.rotation.x = -Math.PI / 2;
        plank.rotation.z = Math.floor(Math.random() * 2) * Math.PI / 2;
        plank.position.set(
            ballroomOffset.x + (Math.random() - 0.5) * ballroomWidth,
            0.01,
            ballroomOffset.z + (Math.random() - 0.5) * ballroomLength
        );
        ballroomGroup.add(plank);
    }
    
    // Broken mirror wall
    const mirrorWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ballroomWidth, ballroomHeight),
        new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.1,
            metalness: 0.9
        })
    );
    mirrorWall.position.set(ballroomOffset.x, ballroomHeight/2, ballroomOffset.z - ballroomLength/2);
    ballroomGroup.add(mirrorWall);
    
    // Cracks in mirror
    for (let i = 0; i < 15; i++) {
        const crack = new THREE.Mesh(
            new THREE.PlaneGeometry(0.05, 2 + Math.random() * 5),
            new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 1.0
            })
        );
        crack.position.set(
            ballroomOffset.x + (Math.random() - 0.5) * ballroomWidth,
            ballroomHeight/2 + (Math.random() - 0.5) * ballroomHeight,
            ballroomOffset.z - ballroomLength/2 + 0.01
        );
        crack.rotation.z = (Math.random() - 0.5) * Math.PI;
        ballroomGroup.add(crack);
    }
    
    // Stage area (for artwork display)
    const stage = new THREE.Mesh(
        new THREE.BoxGeometry(ballroomWidth, 0.5, 8),
        new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.8
        })
    );
    stage.position.set(ballroomOffset.x, 0.25, ballroomOffset.z + ballroomLength/2 - 4);
    ballroomGroup.add(stage);
    
    // Torn curtains
    [-ballroomWidth/2, ballroomWidth/2].forEach(x => {
        for (let i = 0; i < 5; i++) {
            const curtain = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x8a2a2a,
                    roughness: 0.9,
                    side: THREE.DoubleSide
                })
            );
            curtain.position.set(
                ballroomOffset.x + x,
                6,
                ballroomOffset.z + ballroomLength/2 - 6 + i * 2.5
            );
            curtain.rotation.y = x < 0 ? -Math.PI / 8 : Math.PI / 8;
            ballroomGroup.add(curtain);
        }
    });
    
    // Ballroom artwork spots
    for (let i = 0; i < 6; i++) {
        this.hotelArtworkSpots.push({
            x: ballroomOffset.x + (i % 2 === 0 ? -ballroomWidth/2 + 2 : ballroomWidth/2 - 2),
            y: 4,
            z: ballroomOffset.z - ballroomLength/2 + 5 + Math.floor(i / 2) * 8,
            rot: i % 2 === 0 ? Math.PI/2 : -Math.PI/2
        });
    }
    
    this.rooms[0].add(ballroomGroup);
}

// ========================================
// ROOFTOP GARDEN (overgrown, atmospheric)
// ========================================

createRooftopGarden() {
    const gardenGroup = new THREE.Group();
    
    const gardenWidth = 20;
    const gardenLength = 25;
    const roofHeight = 20;
    
    const gardenOffset = { x: 15, z: -15 };
    
    // Rooftop floor (cracked concrete)
    const roofFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(gardenWidth, gardenLength),
        new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.9
        })
    );
    roofFloor.rotation.x = -Math.PI / 2;
    roofFloor.position.set(gardenOffset.x, roofHeight, gardenOffset.z);
    roofFloor.receiveShadow = true;
    gardenGroup.add(roofFloor);
    
    // Cracks in concrete
    for (let i = 0; i < 30; i++) {
        const crack = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, 1 + Math.random() * 3),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 1.0
            })
        );
        crack.rotation.x = -Math.PI / 2;
        crack.rotation.z = Math.random() * Math.PI;
        crack.position.set(
            gardenOffset.x + (Math.random() - 0.5) * gardenWidth,
            roofHeight + 0.01,
            gardenOffset.z + (Math.random() - 0.5) * gardenLength
        );
        gardenGroup.add(crack);
    }
    
    // Overgrown planters (broken concrete)
    const planterPositions = [
        { x: -6, z: -8 },
        { x: 6, z: -8 },
        { x: -6, z: 0 },
        { x: 6, z: 0 },
        { x: -6, z: 8 },
        { x: 6, z: 8 }
    ];
    
    planterPositions.forEach(pos => {
        const planter = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1, 3),
            new THREE.MeshStandardMaterial({
                color: 0x4a4a4a,
                roughness: 0.8
            })
        );
        planter.position.set(
            gardenOffset.x + pos.x,
            roofHeight + 0.5,
            gardenOffset.z + pos.z
        );
        gardenGroup.add(planter);
        
        // Wild grass/weeds growing from planter
        for (let i = 0; i < 20; i++) {
            const grass = new THREE.Mesh(
                new THREE.ConeGeometry(0.05, 0.6 + Math.random() * 0.8, 3),
                new THREE.MeshStandardMaterial({
                    color: 0x3a5a2a,
                    roughness: 0.9
                })
            );
            grass.position.set(
                gardenOffset.x + pos.x + (Math.random() - 0.5) * 2.5,
                roofHeight + 1 + Math.random() * 0.3,
                gardenOffset.z + pos.z + (Math.random() - 0.5) * 2.5
            );
            grass.rotation.x = (Math.random() - 0.5) * 0.3;
            grass.rotation.z = (Math.random() - 0.5) * 0.3;
            gardenGroup.add(grass);
            
            this.plantLife.push(grass);
        }
        
        // Small flowers (dried, dead)
        for (let i = 0; i < 5; i++) {
            const flower = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 4, 4),
                new THREE.MeshStandardMaterial({
                    color: Math.random() > 0.5 ? 0x5a3a2a : 0x4a2a3a,
                    roughness: 0.9
                })
            );
            flower.position.set(
                gardenOffset.x + pos.x + (Math.random() - 0.5) * 2,
                roofHeight + 1.2 + Math.random() * 0.2,
                gardenOffset.z + pos.z + (Math.random() - 0.5) * 2
            );
            gardenGroup.add(flower);
        }
    });
    
    // Broken greenhouse structure
    const greenhouseFrame = new THREE.Group();
    
    // Frame posts
    [[-3, -4], [3, -4], [-3, 4], [3, 4]].forEach(pos => {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 6, 8),
            new THREE.MeshStandardMaterial({
                color: 0x5a4a3a,
                roughness: 0.7,
                metalness: 0.5
            })
        );
        post.position.set(
            gardenOffset.x + pos[0],
            roofHeight + 3,
            gardenOffset.z + pos[1]
        );
        greenhouseFrame.add(post);
    });
    
    // Broken glass panels (some missing)
    for (let i = 0; i < 8; i++) {
        if (Math.random() > 0.4) { // 60% missing
            const glass = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 3),
                new THREE.MeshStandardMaterial({
                    color: 0xaaaaaa,
                    transparent: true,
                    opacity: 0.3,
                    roughness: 0.2
                })
            );
            glass.position.set(
                gardenOffset.x + (i < 4 ? -3 : 3),
                roofHeight + 3,
                gardenOffset.z - 4 + (i % 4) * 2.5
            );
            glass.rotation.y = i < 4 ? Math.PI / 2 : -Math.PI / 2;
            greenhouseFrame.add(glass);
        }
    }
    
    gardenGroup.add(greenhouseFrame);
    
    // Rusty water tower
    const waterTower = new THREE.Group();
    
    const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 3, 12),
        new THREE.MeshStandardMaterial({
            color: 0x6a4a3a,
            roughness: 0.8,
            metalness: 0.6
        })
    );
    tank.position.y = roofHeight + 8;
    waterTower.add(tank);
    
    // Support legs
    [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]].forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 6, 8),
            new THREE.MeshStandardMaterial({
                color: 0x5a3a2a,
                roughness: 0.7,
                metalness: 0.7
            })
        );
        leg.position.set(pos[0], roofHeight + 3.5, pos[1]);
        waterTower.add(leg);
    });
    
    waterTower.position.set(gardenOffset.x, 0, gardenOffset.z);
    gardenGroup.add(waterTower);
    
    // Abandoned garden furniture
    const benchPositions = [
        { x: -8, z: 6 },
        { x: 8, z: -6 }
    ];
    
    benchPositions.forEach(pos => {
        const bench = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.3, 0.8),
            new THREE.MeshStandardMaterial({
                color: 0x4a3a2a,
                roughness: 0.9
            })
        );
        bench.position.set(
            gardenOffset.x + pos.x,
            roofHeight + 0.6,
            gardenOffset.z + pos.z
        );
        gardenGroup.add(bench);
    });
    
    // Rooftop artwork spots (best views!)
    for (let i = 0; i < 4; i++) {
        this.hotelArtworkSpots.push({
            x: gardenOffset.x + (i % 2 === 0 ? -8 : 8),
            y: roofHeight + 2,
            z: gardenOffset.z - 8 + Math.floor(i / 2) * 16,
            rot: i % 2 === 0 ? Math.PI/2 : -Math.PI/2
        });
    }
    
    this.rooms[0].add(gardenGroup);
}

// ========================================
// DECAY EFFECTS (dripping, falling debris)
// ========================================

createDecayEffects() {
    // Dripping water points
    this.waterDrips = [];
    
    for (let i = 0; i < 15; i++) {
        const dripPoint = {
            x: (Math.random() - 0.5) * 35,
            y: 18 - Math.random() * 2,
            z: (Math.random() - 0.5) * 55,
            nextDrip: Date.now() + Math.random() * 3000,
            interval: 2000 + Math.random() * 4000
        };
        this.waterDrips.push(dripPoint);
    }
    
    // Falling debris spawn points
    this.debrisSpawners = [];
    
    for (let i = 0; i < 8; i++) {
        const spawner = {
            x: (Math.random() - 0.5) * 30,
            y: 19,
            z: (Math.random() - 0.5) * 50,
            nextSpawn: Date.now() + Math.random() * 10000,
            interval: 8000 + Math.random() * 12000
        };
        this.debrisSpawners.push(spawner);
    }
    
    // Dust motes floating in light shafts
    this.dustMotes = [];
    
    for (let i = 0; i < 40; i++) {
        const mote = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 4, 4),
            new THREE.MeshBasicMaterial({
                color: 0xccccaa,
                transparent: true,
                opacity: 0.3
            })
        );
        
        mote.position.set(
            (Math.random() - 0.5) * 35,
            Math.random() * 18,
            (Math.random() - 0.5) * 55
        );
        
        mote.userData.velocity = {
            x: (Math.random() - 0.5) * 0.005,
            y: 0.01 + Math.random() * 0.02,
            z: (Math.random() - 0.5) * 0.005
        };
        
        this.rooms[0].add(mote);
        this.dustMotes.push(mote);
    }
}

createWaterDrop(position) {
    const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.MeshStandardMaterial({
            color: 0x6699cc,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.3
        })
    );
    
    drop.position.copy(position);
    drop.userData.velocity = 0;
    drop.userData.isDrop = true;
    
    this.rooms[0].add(drop);
    
    const animateDrop = () => {
        drop.userData.velocity += 0.01; // Gravity
        drop.position.y -= drop.userData.velocity;
        
        // Splash when hitting ground
        if (drop.position.y <= 0.1) {
            // Create splash effect
            for (let i = 0; i < 6; i++) {
                const splash = new THREE.Mesh(
                    new THREE.SphereGeometry(0.03, 4, 4),
                    drop.material.clone()
                );
                splash.position.copy(drop.position);
                splash.userData.velocity = {
                    x: (Math.random() - 0.5) * 0.1,
                    y: 0.1 + Math.random() * 0.05,
                    z: (Math.random() - 0.5) * 0.1
                };
                splash.userData.life = 30;
                this.rooms[0].add(splash);
                
                const animateSplash = () => {
                    splash.position.x += splash.userData.velocity.x;
                    splash.position.y += splash.userData.velocity.y;
                    splash.position.z += splash.userData.velocity.z;
                    splash.userData.velocity.y -= 0.005;
                    splash.userData.life--;
                    
                    splash.material.opacity *= 0.95;
                    
                    if (splash.userData.life > 0 && splash.position.y > 0) {
                        requestAnimationFrame(animateSplash);
                    } else {
                        this.rooms[0].remove(splash);
                        splash.geometry.dispose();
                        splash.material.dispose();
                    }
                };
                animateSplash();
            }
            
            this.rooms[0].remove(drop);
            drop.geometry.dispose();
            drop.material.dispose();
        } else {
            requestAnimationFrame(animateDrop);
        }
    };
    
    animateDrop();
}

createFallingDebris(position) {
    const debrisTypes = [
        { w: 0.2, h: 0.1, d: 0.15 }, // Small chunk
        { w: 0.15, h: 0.3, d: 0.15 }, // Plaster piece
        { w: 0.1, h: 0.1, d: 0.1 }   // Tiny fragment
    ];
    
    const type = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
    
    const debris = new THREE.Mesh(
        new THREE.BoxGeometry(type.w, type.h, type.d),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a3a,
            roughness: 0.9
        })
    );
    
    debris.position.copy(position);
    debris.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    
    debris.userData.velocity = {
        x: (Math.random() - 0.5) * 0.02,
        y: 0,
        z: (Math.random() - 0.5) * 0.02
    };
    debris.userData.rotationVel = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1
    };
    
    this.rooms[0].add(debris);
    
    const animateDebris = () => {
        debris.userData.velocity.y -= 0.015; // Gravity
        debris.position.add(debris.userData.velocity);
        
        debris.rotation.x += debris.userData.rotationVel.x;
        debris.rotation.y += debris.userData.rotationVel.y;
        debris.rotation.z += debris.userData.rotationVel.z;
        
        // Remove when hits ground
        if (debris.position.y <= 0.1) {
            this.rooms[0].remove(debris);
            debris.geometry.dispose();
            debris.material.dispose();
        } else {
            requestAnimationFrame(animateDebris);
        }
    };
    
    animateDebris();
}

// ========================================
// HOTEL UI
// ========================================

createHotelUI() {
    const hotelUI = document.createElement('div');
    hotelUI.id = 'hotelUI';
    hotelUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(90, 70, 50, 0.95) 0%, rgba(60, 50, 40, 0.95) 100%);
        color: #f5e5d5;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        z-index: 100;
        border: 3px solid #8a6a4a;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 
                    inset 0 0 20px rgba(0, 0, 0, 0.3);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
        font-weight: bold;
    `;
    
    hotelUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">🏨</span>
            <div>
                <div style="font-size: 20px; letter-spacing: 3px; color: #ff6666;">PARADISE HOTEL</div>
                <div style="font-size: 11px; opacity: 0.8; font-style: italic; letter-spacing: 1px;">
                    Abandoned Since 1987 • Trespassers Welcome
                </div>
            </div>
            <span style="font-size: 28px;">👻</span>
        </div>
    `;
    
    document.body.appendChild(hotelUI);
}

// ========================================
// COMPLETE HOTEL ANIMATIONS
// ========================================

updateHotelAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. CHANDELIER SWAYING (creaking motion)
    this.hotelAnimations.forEach(obj => {
        if (obj.userData.swayAmount) {
            obj.rotation.z = Math.sin(time * obj.userData.swaySpeed) * obj.userData.swayAmount;
            obj.rotation.x = Math.cos(time * obj.userData.swaySpeed * 0.7) * obj.userData.swayAmount * 0.5;
        }
        
        // Water surface ripples
        if (obj.userData.isWater) {
            obj.material.opacity = 0.6 + Math.sin(time * 0.5) * 0.1;
        }
    });
    
    // 2. FLICKERING LIGHTS (broken, unstable)
    this.flickeringLights.forEach((lightObj, index) => {
        const flicker = lightObj.baseIntensity * (0.8 + Math.sin(time * lightObj.flickerSpeed + index) * 0.3);
        
        // Random complete blackouts
        if (Math.random() < 0.001) {
            lightObj.light.intensity = 0;
            setTimeout(() => {
                if (lightObj.light) lightObj.light.intensity = flicker;
            }, 50 + Math.random() * 200);
        } else {
            lightObj.light.intensity = flicker;
        }
    });
    
    // 3. NEON SIGNS (buzzing, failing)
    this.neonSigns.forEach((sign, index) => {
        if (sign.userData.lights) {
            sign.userData.lights.forEach((light, lightIndex) => {
                // Buzz flicker
                const buzz = 0.6 + Math.sin(time * 15 + index + lightIndex) * 0.3;
                
                // Random failures
                if (Math.random() < 0.002) {
                    light.intensity = 0;
                    setTimeout(() => {
                        if (light) light.intensity = buzz;
                    }, 100 + Math.random() * 500);
                } else {
                    light.intensity = buzz;
                }
                
                // Color shift for dying neon
                if (!sign.userData.isExit && Math.random() < 0.01) {
                    const colorShift = Math.random() * 0.3;
                    light.color.setRGB(
                        Math.min(1, light.color.r + colorShift),
                        light.color.g,
                        Math.max(0, light.color.b - colorShift)
                    );
                }
            });
        }
    });
    
    // 4. PLANT LIFE SUBTLE SWAY
    this.plantLife.forEach((plant, index) => {
        const sway = Math.sin(time * 0.5 + index * 0.3) * 0.02;
        plant.rotation.x = sway;
        plant.rotation.z = Math.cos(time * 0.4 + index * 0.5) * 0.02;
    });
    
    // 5. WATER DRIPS
    const now = Date.now();
    this.waterDrips?.forEach(drip => {
        if (now >= drip.nextDrip) {
            this.createWaterDrop(new THREE.Vector3(drip.x, drip.y, drip.z));
            drip.nextDrip = now + drip.interval;
        }
    });
    
    // 6. FALLING DEBRIS
    this.debrisSpawners?.forEach(spawner => {
        if (now >= spawner.nextSpawn) {
            this.createFallingDebris(new THREE.Vector3(spawner.x, spawner.y, spawner.z));
            spawner.nextSpawn = now + spawner.interval;
        }
    });
    
    // 7. DUST MOTES FLOATING
    if (this.dustMotes) {
        this.dustMotes.forEach(mote => {
            mote.position.add(mote.userData.velocity);
            
            // Brownian motion
            mote.position.x += Math.sin(time * 2 + mote.position.y) * 0.002;
            mote.position.z += Math.cos(time * 1.5 + mote.position.x) * 0.002;
            
            // Reset when reaching ceiling
            if (mote.position.y > 19) {
                mote.position.y = 0.5;
            }
            
            // Keep in bounds
            if (Math.abs(mote.position.x) > 20) {
                mote.position.x = (Math.random() - 0.5) * 35;
            }
            if (Math.abs(mote.position.z) > 30) {
                mote.position.z = (Math.random() - 0.5) * 55;
            }
            
            // Opacity variation
            mote.material.opacity = 0.2 + Math.sin(time * 3 + mote.position.x) * 0.15;
        });
    }
    
    // 8. DUSTY FURNITURE SUBTLE SHIFT (settling)
    if (Math.random() < 0.001) {
        this.dustyFurniture.forEach(furniture => {
            furniture.position.y += (Math.random() - 0.5) * 0.001;
            furniture.rotation.y += (Math.random() - 0.5) * 0.0005;
        });
    }
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Main lobby bounds
        const minX = -19;
        const maxX = 19;
        const minZ = -29;
        const maxZ = 29;
        
        this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        
        // Don't fall into pool
        if (this.camera.position.x > 9 && this.camera.position.x < 21 &&
            this.camera.position.z > 0 && this.camera.position.z < 20) {
            if (this.camera.position.y < 1) {
                this.camera.position.y = 1.6; // Teleport back up
            }
        }
        
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    // Spawn near reception desk
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: -20
    };
}c

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
   
    this.updateHotelAnimations();       // ✓ ADD THIS LINE
   
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
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
    // FILM STUDIO BACKLOT SYSTEM
    // ========================================
    
    this.buildingFacades = [];
    this.soundstages = [];
    this.filmEquipment = [];
    this.greenScreens = [];
    this.movieSets = [];
    this.movingSetPieces = [];
    this.directorsChairs = [];
    this.clapperboards = [];
    this.propWarehouses = [];
    this.studioLights = [];
    this.cameras = [];
    
    this.createStudioBacklot();
    this.createBuildingFacades();
    this.createSoundstages();
    this.createStudioStreets();
    this.createFilmEquipment();
    this.createGreenScreens();
    this.createWesternTownSet();
    this.createNYCStreetSet();
    this.createSpaceshipSet();
    this.createPropWarehouse();
    this.createStudioUI();
    
    console.log("🎬 Film Studio Backlot loaded!");
}

// ========================================
// STUDIO BACKLOT (Hollywood lot)
// ========================================

createStudioBacklot() {
    const backlotRoom = new THREE.Group();
    backlotRoom.visible = true;
    
    const lotWidth = 80;
    const lotLength = 100;
    
    // ========================================
    // MATERIALS (studio construction)
    // ========================================
    
    this.concreteMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a8a8a,
        roughness: 0.9,
        metalness: 0.1
    });
    
    this.woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a5a4a,
        roughness: 0.85,
        metalness: 0.05
    });
    
    this.metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.5,
        metalness: 0.9
    });
    
    this.fabricMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.95
    });
    
    // ========================================
    // ATMOSPHERIC LIGHTING (studio lighting)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0xffffee, 0.6);
    backlotRoom.add(ambientLight);
    
    // Main overhead studio lights
    for (let i = 0; i < 8; i++) {
        const studioLight = new THREE.SpotLight(0xffffee, 2, 30, Math.PI / 4, 0.3);
        studioLight.position.set(
            (Math.random() - 0.5) * 70,
            15,
            (Math.random() - 0.5) * 90
        );
        studioLight.castShadow = true;
        backlotRoom.add(studioLight);
        this.studioLights.push(studioLight);
    }
    
    // California sky (sunny backlot)
    this.backlotSky = new THREE.HemisphereLight(0x87ceeb, 0x8a7a6a, 0.8);
    backlotRoom.add(this.backlotSky);
    
    // Fog (atmospheric depth)
    this.scene.fog = new THREE.Fog(0xccddee, 30, 120);
    
    backlotRoom.position.set(0, 0, 0);
    this.rooms.push(backlotRoom);
    this.scene.add(backlotRoom);
}

// ========================================
// BUILDING FACADES (false fronts)
// ========================================

createBuildingFacades() {
    // Backlot facades - buildings with no interiors
    const facadeGroups = [
        { x: -35, z: 0, type: 'brownstone' },
        { x: -35, z: 10, type: 'storefront' },
        { x: -35, z: 20, type: 'bank' },
        { x: 35, z: 0, type: 'saloon' },
        { x: 35, z: 10, type: 'generalstore' },
        { x: 35, z: 20, type: 'sheriff' }
    ];
    
    facadeGroups.forEach(config => {
        const facade = this.createFacade(config.type);
        facade.position.set(config.x, 0, config.z);
        this.rooms[0].add(facade);
        this.buildingFacades.push(facade);
    });
}

createFacade(type) {
    const group = new THREE.Group();
    
    // Support structure (visible from behind)
    const supports = new THREE.Group();
    
    // Wooden beams
    for (let i = 0; i < 5; i++) {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 8, 0.2),
            this.woodMaterial
        );
        beam.position.set(-4 + i * 2, 4, 0.5);
        supports.add(beam);
    }
    
    // Cross braces
    [-3, -1, 1, 3].forEach(x => {
        const brace = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 2),
            this.woodMaterial
        );
        brace.position.set(x, 4, 1);
        brace.rotation.y = Math.PI / 4;
        supports.add(brace);
    });
    
    group.add(supports);
    
    // Front facade (painted flat)
    const facadeFront = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 8),
        new THREE.MeshStandardMaterial({
            color: 0xd4c4b4,
            roughness: 0.8
        })
    );
    facadeFront.position.z = 0;
    facadeFront.receiveShadow = true;
    group.add(facadeFront);
    
    // Type-specific details
    switch (type) {
        case 'brownstone':
            this.addBrownstoneDetails(group);
            break;
        case 'storefront':
            this.addStorefrontDetails(group);
            break;
        case 'bank':
            this.addBankDetails(group);
            break;
        case 'saloon':
            this.addSaloonDetails(group);
            break;
        case 'generalstore':
            this.addGeneralStoreDetails(group);
            break;
        case 'sheriff':
            this.addSheriffDetails(group);
            break;
    }
    
    return group;
}

addBrownstoneDetails(group) {
    // Windows
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            const window = new THREE.Mesh(
                new THREE.PlaneGeometry(1.2, 1.5),
                new THREE.MeshStandardMaterial({
                    color: 0x4488aa,
                    roughness: 0.2,
                    metalness: 0.8
                })
            );
            window.position.set(-3 + col * 3, 5 - row * 2.5, 0.01);
            group.add(window);
            
            // Window frame
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(1.3, 1.6, 0.05),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6
                })
            );
            frame.position.set(-3 + col * 3, 5 - row * 2.5, 0.02);
            group.add(frame);
        }
    }
    
    // Front door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 3),
        new THREE.MeshStandardMaterial({
            color: 0x5a3a2a,
            roughness: 0.7
        })
    );
    door.position.set(0, 1.5, 0.01);
    group.add(door);
    
    // Front steps
    for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 0.4),
            this.concreteMaterial
        );
        step.position.set(0, 0.1 + i * 0.2, 0.2 + i * 0.4);
        group.add(step);
    }
}

addStorefrontDetails(group) {
    // Large display windows
    const window1 = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 3),
        new THREE.MeshStandardMaterial({
            color: 0x6699aa,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7
        })
    );
    window1.position.set(-2, 2.5, 0.01);
    group.add(window1);
    
    const window2 = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 3),
        new THREE.MeshStandardMaterial({
            color: 0x6699aa,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7
        })
    );
    window2.position.set(2, 2.5, 0.01);
    group.add(window2);
    
    // Awning
    const awning = new THREE.Mesh(
        new THREE.BoxGeometry(9, 0.1, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0xcc4444,
            roughness: 0.8
        })
    );
    awning.position.set(0, 4.5, 0.5);
    group.add(awning);
    
    // Door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 3),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.6
        })
    );
    door.position.set(0, 1.5, 0.01);
    group.add(door);
}

addBankDetails(group) {
    // Columns (Greek revival)
    [-3, -1, 1, 3].forEach(x => {
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, 7, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.5
            })
        );
        column.position.set(x, 3.5, 0.2);
        column.castShadow = true;
        group.add(column);
    });
    
    // Pediment
    const pediment = new THREE.Mesh(
        new THREE.ConeGeometry(6, 1.5, 3),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5
        })
    );
    pediment.rotation.x = Math.PI / 2;
    pediment.rotation.z = Math.PI / 2;
    pediment.position.set(0, 7.5, 0.3);
    group.add(pediment);
    
    // Sign
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('BANK', 256, 85);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 1),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    sign.position.set(0, 5.5, 0.01);
    group.add(sign);
}

addSaloonDetails(group) {
    // Swinging doors
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2),
        new THREE.MeshStandardMaterial({
            color: 0x6a4a2a,
            roughness: 0.8
        })
    );
    door.position.set(0, 1, 0.01);
    group.add(door);
    
    // Balcony
    const balcony = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.2, 1),
        this.woodMaterial
    );
    balcony.position.set(0, 4.5, 0.5);
    group.add(balcony);
    
    // Balcony railing
    for (let i = 0; i < 10; i++) {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1, 8),
            this.woodMaterial
        );
        post.position.set(-4 + i * 0.9, 5, 0.5);
        group.add(post);
    }
    
    // "SALOON" sign
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8a4a2a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 80px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SALOON', 256, 90);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 1.2),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    sign.position.set(0, 6.5, 0.01);
    group.add(sign);
}

addGeneralStoreDetails(group) {
    // Large windows
    for (let i = 0; i < 2; i++) {
        const window = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 2.5),
            new THREE.MeshStandardMaterial({
                color: 0x6699aa,
                roughness: 0.2,
                metalness: 0.8
            })
        );
        window.position.set(-2 + i * 4, 3, 0.01);
        group.add(window);
    }
    
    // Porch
    const porch = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.3, 2),
        this.woodMaterial
    );
    porch.position.set(0, 0.15, 1);
    group.add(porch);
    
    // Porch posts
    [-4, -2, 0, 2, 4].forEach(x => {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 3, 8),
            this.woodMaterial
        );
        post.position.set(x, 1.5, 1.8);
        group.add(post);
    });
    
    // Sign
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#cc4444';
    ctx.font = 'bold 56px serif';
    ctx.textAlign = 'center';
    ctx.fillText('GENERAL STORE', 256, 85);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1.5),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    sign.position.set(0, 5.5, 0.01);
    group.add(sign);
}

addSheriffDetails(group) {
    // Door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 2.5),
        new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        })
    );
    door.position.set(0, 1.25, 0.01);
    group.add(door);
    
    // Windows (with bars)
    [-2.5, 2.5].forEach(x => {
        const window = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0x4488aa,
                roughness: 0.3
            })
        );
        window.position.set(x, 3, 0.01);
        group.add(window);
        
        // Bars
        for (let i = 0; i < 5; i++) {
            const bar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6),
                this.metalMaterial
            );
            bar.position.set(x - 0.6 + i * 0.3, 3, 0.02);
            group.add(bar);
        }
    });
    
    // Star badge
    const starGeometry = this.createStarGeometry();
    const star = new THREE.Mesh(
        starGeometry,
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    star.position.set(0, 5.5, 0.01);
    star.scale.set(0.5, 0.5, 0.1);
    group.add(star);
    
    // "SHERIFF" text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHERIFF', 256, 85);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 1),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    sign.position.set(0, 6.5, 0.01);
    group.add(sign);
}

createStarGeometry() {
    const points = [];
    const outerRadius = 1;
    const innerRadius = 0.4;
    
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push(new THREE.Vector2(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        ));
    }
    
    const shape = new THREE.Shape(points);
    return new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: false
    });
}

// ========================================
// SOUNDSTAGES (warehouse buildings)
// ========================================

createSoundstages() {
    const stagePositions = [
        { x: -25, z: -35, num: 'A' },
        { x: 0, z: -35, num: 'B' },
        { x: 25, z: -35, num: 'C' }
    ];
    
    stagePositions.forEach(config => {
        const stage = this.createSoundstage(config.num);
        stage.position.set(config.x, 0, config.z);
        this.rooms[0].add(stage);
        this.soundstages.push(stage);
    });
}

createSoundstage(number) {
    const group = new THREE.Group();
    
    // Main warehouse structure
    const warehouse = new THREE.Mesh(
        new THREE.BoxGeometry(15, 10, 20),
        new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.8,
            metalness: 0.3
        })
    );
    warehouse.position.y = 5;
    warehouse.castShadow = true;
    warehouse.receiveShadow = true;
    group.add(warehouse);
    
    // Corrugated metal texture
    for (let i = 0; i < 20; i++) {
        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(15.1, 0.05, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0x5a5a5a,
                roughness: 0.9
            })
        );
        ridge.position.set(0, 5, -10 + i * 1);
        group.add(ridge);
    }
    
    // Large sliding door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 9),
        new THREE.MeshStandardMaterial({
            color: 0x8a4a2a,
            roughness: 0.7
        })
    );
    door.position.set(0, 4.5, 10.01);
    group.add(door);
    
    // Door tracks
    [-4, 4].forEach(x => {
        const track = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.5),
            this.metalMaterial
        );
        track.position.set(x, 9, 10.2);
        group.add(track);
    });
    
    // "STAGE X" sign
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${number}`, 256, 160);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 2),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    sign.position.set(0, 11, 0);
    sign.rotation.y = Math.PI;
    group.add(sign);
    
    // Ventilation units on roof
    for (let i = 0; i < 3; i++) {
        const vent = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.8, 1.5),
            this.metalMaterial
        );
        vent.position.set(-5 + i * 5, 10.4, 0);
        group.add(vent);
    }
    
    return group;
}

// ========================================
// STUDIO STREETS (asphalt roads)
// ========================================

createStudioStreets() {
    // Main road (running through backlot)
    const mainRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 100),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.95
        })
    );
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.receiveShadow = true;
    this.rooms[0].add(mainRoad);
    
    // Road markings (yellow lines)
    for (let z = -48; z <= 48; z += 4) {
        const marking = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 3),
            new THREE.MeshBasicMaterial({
                color: 0xffff00
            })
        );
        marking.rotation.x = -Math.PI / 2;
        marking.position.set(0, 0.01, z);
        this.rooms[0].add(marking);
    }
    
    // Sidewalks
    [-7, 7].forEach(x => {
        const sidewalk = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 100),
            this.concreteMaterial
        );
        sidewalk.rotation.x = -Math.PI / 2;
        sidewalk.position.x = x;
        sidewalk.receiveShadow = true;
        this.rooms[0].add(sidewalk);
    });
    
    // Parking lot (near soundstages)
    const parkingLot = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 20),
        new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.95
        })
    );
    parkingLot.rotation.x = -Math.PI / 2;
    parkingLot.position.set(0, 0, -45);
    parkingLot.receiveShadow = true;
    this.rooms[0].add(parkingLot);
    
    // Parking spaces
    for (let row = 0; row < 3; row++) {
        for (let spot = 0; spot < 8; spot++) {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(2.5, 0.1),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff
                })
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(-14 + spot * 4, 0.01, -42 + row * 6);
            this.rooms[0].add(line);
        }
    }
}

// ========================================
// FILM EQUIPMENT (cameras, lights, etc.)
// ========================================

createFilmEquipment() {
    // Film cameras on dollies
    const cameraPositions = [
        { x: -15, z: 5 },
        { x: 15, z: -10 },
        { x: -10, z: 25 }
    ];
    
    cameraPositions.forEach(pos => {
        const camera = this.createFilmCamera();
        camera.position.set(pos.x, 0, pos.z);
        this.rooms[0].add(camera);
        this.cameras.push({
            model: camera,
            dollyPosition: 0,
            dollyDirection: 1
        });
    });
    
    // Director's chairs
    for (let i = 0; i < 5; i++) {
        const chair = this.createDirectorsChair();
        chair.position.set(
            -12 + i * 6,
            0,
            8
        );
        chair.rotation.y = Math.PI;
        this.rooms[0].add(chair);
        this.directorsChairs.push(chair);
    }
    
    // Clapperboards
    for (let i = 0; i < 3; i++) {
        const clapper = this.createClapperboard();
        clapper.position.set(
            -8 + i * 8,
            1.2,
            6
        );
        this.rooms[0].add(clapper);
        this.clapperboards.push({
            model: clapper,
            isOpen: true,
            snapTimer: 0
        });
    }
    
    // Lighting rigs
    const lightPositions = [
        { x: -18, z: 10 },
        { x: 18, z: 10 },
        { x: 0, z: 15 }
    ];
    
    lightPositions.forEach(pos => {
        const rig = this.createLightingRig();
        rig.position.set(pos.x, 0, pos.z);
        this.rooms[0].add(rig);
        this.filmEquipment.push(rig);
    });
    
    // Boom microphone
    const boom = this.createBoomMic();
    boom.position.set(-5, 0, 12);
    this.rooms[0].add(boom);
    this.filmEquipment.push(boom);
}

createFilmCamera() {
    const group = new THREE.Group();
    
    // Dolly base (wheeled platform)
    const dolly = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.2, 1.5),
        this.metalMaterial
    );
    dolly.position.y = 0.1;
    dolly.castShadow = true;
    group.add(dolly);
    
    // Wheels
    [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(pos => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.9
            })
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos[0], 0.1, pos[1]);
        group.add(wheel);
    });
    
    // Camera mount post
    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 1.5, 12),
        this.metalMaterial
    );
    post.position.y = 1;
    group.add(post);
    
    // Camera body
    const cameraBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6,
            metalness: 0.7
        })
    );
    cameraBody.position.y = 1.8;
    cameraBody.castShadow = true;
    group.add(cameraBody);
    
    // Lens
    const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.4, 16),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.8, -0.6);
    group.add(lens);
    
    // Lens glass
    const lensGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.15, 16),
        new THREE.MeshPhysicalMaterial({
            color: 0x4466aa,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        })
    );
    lensGlass.position.set(0, 1.8, -0.8);
    group.add(lensGlass);
    
    // Viewfinder
    const viewfinder = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.2),
        this.metalMaterial
    );
    viewfinder.position.set(0, 2, 0);
    group.add(viewfinder);
    
    return group;
}

createDirectorsChair() {
    const group = new THREE.Group();
    
    // Legs
    const legPositions = [
        [-0.4, 0, -0.4], [0.4, 0, -0.4],
        [-0.4, 0, 0.4], [0.4, 0, 0.4]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1, 8),
            this.woodMaterial
        );
        leg.position.set(pos[0], 0.5, pos[2]);
        group.add(leg);
    });
    
    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.05, 0.8),
        this.fabricMaterial
    );
    seat.position.y = 1;
    group.add(seat);
    
    // Back rest
    const backRest = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.8),
        this.fabricMaterial
    );
    backRest.position.set(0, 1.4, -0.35);
    backRest.rotation.x = 0.2;
    group.add(backRest);
    
    // "DIRECTOR" text on back
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DIRECTOR', 128, 75);
    
    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.3),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    label.position.set(0, 1.4, -0.36);
    label.rotation.x = 0.2;
    group.add(label);
    
    // Armrests
    [-0.45, 0.45].forEach(x => {
        const armrest = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.05, 0.6),
            this.woodMaterial
        );
        armrest.position.set(x, 1.2, 0);
        group.add(armrest);
    });
    
    return group;
}

createClapperboard() {
    const group = new THREE.Group();
    
    // Handle
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
        this.woodMaterial
    );
    handle.position.y = -0.15;
    group.add(handle);
    
    // Base board
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.05, 0.6),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        })
    );
    base.position.y = 0;
    base.castShadow = true;
    group.add(base);
    
    // Clapper (top piece)
    const clapper = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.05, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.7
        })
    );
    clapper.position.set(0, 0.025, -0.2);
    clapper.rotation.x = -0.3;
    group.add(clapper);
    
    // Black and white stripes on clapper
    for (let i = 0; i < 4; i++) {
        const stripe = new THREE.Mesh(
            new THREE.PlaneGeometry(0.12, 0.19),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );
        stripe.position.set(-0.18 + i * 0.12, 0.051, -0.2);
        stripe.rotation.x = -Math.PI / 2 - 0.3;
        group.add(stripe);
    }
    
    // Scene/take info on base
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('SCENE: 42', 10, 40);
    ctx.fillText('TAKE: 7', 10, 80);
    ctx.fillText('DIRECTOR: S.N.', 10, 120);
    
    const texture = new THREE.CanvasTexture(canvas);
    const info = new THREE.Mesh(
        new THREE.PlaneGeometry(0.48, 0.58),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    info.position.set(0, 0.026, 0.1);
    info.rotation.x = -Math.PI / 2;
    group.add(info);
    
    group.userData.clapperPiece = clapper;
    
    return group;
}

createLightingRig() {
    const group = new THREE.Group();
    
    // Stand
    const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 3, 8),
        this.metalMaterial
    );
    stand.position.y = 1.5;
    stand.castShadow = true;
    group.add(stand);
    
    // Tripod legs
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.05, 1, 6),
            this.metalMaterial
        );
        leg.position.set(
            Math.cos(angle) * 0.3,
            0.5,
            Math.sin(angle) * 0.3
        );
        leg.rotation.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
        );
        group.add(leg);
    }
    
    // Light head
    const lightHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.5, 16),
        this.metalMaterial
    );
    lightHead.rotation.x = Math.PI;
    lightHead.position.y = 3.2;
    lightHead.castShadow = true;
    group.add(lightHead);
    
    // Barn doors (flaps)
    const barnDoors = [
        { x: 0, y: 0.25, angle: 0 },
        { x: 0, y: -0.25, angle: Math.PI },
        { x: 0.25, y: 0, angle: Math.PI / 2 },
        { x: -0.25, y: 0, angle: -Math.PI / 2 }
    ];
    
    barnDoors.forEach(door => {
        const flap = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 0.15),
            this.metalMaterial
        );
        flap.position.set(door.x, 3.2 + door.y, 0);
        flap.rotation.y = door.angle;
        group.add(flap);
    });
    
    // Actual light (point light)
    const light = new THREE.SpotLight(0xffffee, 3, 15, Math.PI / 4, 0.5);
    light.position.y = 3;
    light.target.position.set(0, 0, 5);
    light.castShadow = true;
    group.add(light);
    group.add(light.target);
    
    group.userData.studioLight = light;
    
    return group;
}

createBoomMic() {
    const group = new THREE.Group();
    
    // Base stand
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16),
        this.metalMaterial
    );
    base.position.y = 0.1;
    group.add(base);
    
    // Vertical pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8),
        this.metalMaterial
    );
    pole.position.y = 1.5;
    group.add(pole);
    
    // Boom arm (extending horizontally)
    const boom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 3, 8),
        this.metalMaterial
    );
    boom.rotation.z = Math.PI / 2;
    boom.position.set(1.5, 2.8, 0);
    group.add(boom);
    
    // Microphone
    const mic = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.3, 12),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.8
        })
    );
    mic.position.set(3, 2.6, 0);
    group.add(mic);
    
    // Windscreen (fuzzy cover)
    const windscreen = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.95
        })
    );
    windscreen.position.set(3, 2.6, 0);
    group.add(windscreen);
    
    return group;
}

// ========================================
// GREEN SCREENS (chroma key walls)
// ========================================

createGreenScreens() {
    const greenScreenPositions = [
        { x: -20, z: 30, size: 'large' },
        { x: 20, z: 30, size: 'medium' },
        { x: 0, z: 35, size: 'small' }
    ];
    
    greenScreenPositions.forEach(config => {
        const screen = this.createGreenScreen(config.size);
        screen.position.set(config.x, 0, config.z);
        this.rooms[0].add(screen);
        this.greenScreens.push(screen);
    });
}

createGreenScreen(size) {
    const group = new THREE.Group();
    
    let width, height;
    switch (size) {
        case 'large':
            width = 15;
            height = 8;
            break;
        case 'medium':
            width = 10;
            height = 6;
            break;
        case 'small':
            width = 6;
            height = 4;
            break;
    }
    
    // Frame
    const frameThickness = 0.15;
    
    // Top and bottom
    [height/2, -height/2].forEach(y => {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameThickness),
            this.metalMaterial
        );
        beam.position.set(0, y, 0);
        group.add(beam);
    });
    
    // Sides
    [-width/2, width/2].forEach(x => {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameThickness),
            this.metalMaterial
        );
        beam.position.set(x, 0, 0);
        group.add(beam);
    });
    
    // Green fabric
    const greenFabric = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            roughness: 0.8,
            emissive: 0x00aa00,
            emissiveIntensity: 0.2
        })
    );
    greenFabric.receiveShadow = true;
    group.add(greenFabric);
    
    // Support stands
    [-width/2 + 1, width/2 - 1].forEach(x => {
        const stand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.08, height, 8),
            this.metalMaterial
        );
        stand.position.set(x, -height/2, -0.3);
        stand.castShadow = true;
        group.add(stand);
        
        // Tripod base
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.05, 0.8, 6),
                this.metalMaterial
            );
            leg.position.set(
                x + Math.cos(angle) * 0.4,
                -height,
                -0.3 + Math.sin(angle) * 0.4
            );
            leg.rotation.set(
                Math.cos(angle) * 0.3,
                0,
                Math.sin(angle) * 0.3
            );
            group.add(leg);
        }
    });
    
    group.position.y = height / 2;
    return group;
}

// ========================================
// WESTERN TOWN SET (detailed)
// ========================================

createWesternTownSet() {
    const westernTown = new THREE.Group();
    
    // Dirt main street
    const dirtRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 25),
        new THREE.MeshStandardMaterial({
            color: 0x8a6a4a,
            roughness: 0.95
        })
    );
    dirtRoad.rotation.x = -Math.PI / 2;
    dirtRoad.position.set(35, 0.01, -10);
    dirtRoad.receiveShadow = true;
    this.rooms[0].add(dirtRoad);
    
    // Hitching posts
    for (let i = 0; i < 5; i++) {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
            this.woodMaterial
        );
        post.position.set(32, 0.6, -20 + i * 5);
        this.rooms[0].add(post);
        
        const rail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 2, 6),
            this.woodMaterial
        );
        rail.rotation.z = Math.PI / 2;
        rail.position.set(32.8, 0.9, -20 + i * 5);
        this.rooms[0].add(rail);
    }
    
    // Water trough
    const trough = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 2),
        this.woodMaterial
    );
    trough.position.set(38, 0.2, -5);
    this.rooms[0].add(trough);
    
    // Water in trough
    const water = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.05, 1.95),
        new THREE.MeshPhysicalMaterial({
            color: 0x6699aa,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.7
        })
    );
    water.position.set(38, 0.38, -5);
    this.rooms[0].add(water);
    
    // Wooden barrels
    for (let i = 0; i < 6; i++) {
        const barrel = this.createBarrel();
        barrel.position.set(
            32 + Math.random() * 6,
            0.5,
            -18 + i * 6 + Math.random() * 2
        );
        barrel.rotation.y = Math.random() * Math.PI * 2;
        this.rooms[0].add(barrel);
    }
    
    // Tumbleweeds (movable)
    for (let i = 0; i < 3; i++) {
        const tumbleweed = this.createTumbleweed();
        tumbleweed.position.set(
            33 + Math.random() * 4,
            0.3,
            -15 + Math.random() * 20
        );
        this.rooms[0].add(tumbleweed);
        this.movingSetPieces.push({
            model: tumbleweed,
            type: 'tumbleweed',
            speed: 0.02 + Math.random() * 0.03,
            rotationSpeed: 0.05 + Math.random() * 0.05
        });
    }
    
    // Wanted posters on walls
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 256;
    posterCanvas.height = 384;
    const ctx = posterCanvas.getContext('2d');
    ctx.fillStyle = '#f5e5d5';
    ctx.fillRect(0, 0, 256, 384);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('WANTED', 128, 60);
    ctx.font = '24px serif';
    ctx.fillText('REWARD', 128, 300);
    ctx.font = 'bold 36px serif';
    ctx.fillText('$500', 128, 350);
    
    const posterTexture = new THREE.CanvasTexture(posterCanvas);
    const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.75),
        new THREE.MeshBasicMaterial({ map: posterTexture })
    );
    poster.position.set(35.01, 2, 15);
    this.rooms[0].add(poster);
    
  
}

createBarrel() {
    const group = new THREE.Group();
    
    // Main barrel body
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 0.8, 16),
        this.woodMaterial
    );
    barrel.castShadow = true;
    group.add(barrel);
    
    // Metal bands
    [0.3, 0, -0.3].forEach(y => {
        const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.32, 0.03, 8, 16),
            this.metalMaterial
        );
        band.rotation.x = Math.PI / 2;
        band.position.y = y;
        group.add(band);
    });
    
    return group;
}

createTumbleweed() {
    const group = new THREE.Group();
    
    const twigMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a7a5a,
        roughness: 0.95
    });
    
    // Random branching structure
    for (let i = 0; i < 20; i++) {
        const twig = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 0.3 + Math.random() * 0.2, 4),
            twigMaterial
        );
        
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI;
        
        twig.position.set(
            Math.sin(angle1) * Math.cos(angle2) * 0.3,
            Math.sin(angle2) * 0.3,
            Math.cos(angle1) * Math.cos(angle2) * 0.3
        );
        twig.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        group.add(twig);
    }
    
    group.scale.set(0.8, 0.8, 0.8);
    return group;
}

// ========================================
// NYC STREET SET (urban)
// ========================================

createNYCStreetSet() {
    // Asphalt street
    const nycStreet = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 30),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.95
        })
    );
    nycStreet.rotation.x = -Math.PI / 2;
    nycStreet.position.set(-25, 0.01, 15);
    nycStreet.receiveShadow = true;
    this.rooms[0].add(nycStreet);
    
    // Yellow taxi cab (prop)
    const taxi = this.createTaxiCab();
    taxi.position.set(-28, 0, 20);
    taxi.rotation.y = Math.PI / 6;
    this.rooms[0].add(taxi);
    this.movingSetPieces.push({
        model: taxi,
        type: 'static',
        basePosition: taxi.position.clone()
    });
    
    // Fire hydrant
    const hydrant = this.createFireHydrant();
    hydrant.position.set(-30, 0, 12);
    this.rooms[0].add(hydrant);
    
    // Street lights
    [-30, -20].forEach(x => {
        const streetLight = this.createStreetLight();
        streetLight.position.set(x, 0, 8);
        this.rooms[0].add(streetLight);
    });
    
    // Mailbox
    const mailbox = this.createMailbox();
    mailbox.position.set(-22, 0, 18);
    this.rooms[0].add(mailbox);
    
    // Newspaper stand
    const newsStand = this.createNewsStand();
    newsStand.position.set(-28, 0, 25);
    this.rooms[0].add(newsStand);
    
    // Manhole cover
    const manhole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32),
        this.metalMaterial
    );
    manhole.rotation.x = Math.PI / 2;
    manhole.position.set(-25, 0.02, 15);
    this.rooms[0].add(manhole);
    
    // Crosswalk lines
    for (let i = 0; i < 8; i++) {
        const stripe = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 12),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(-25, 0.02, 10 + i * 1.5);
        this.rooms[0].add(stripe);
    }
    
    // Steam vent (practical effect)
    const steamVent = this.createSteamVent();
    steamVent.position.set(-27, 0, 22);
    this.rooms[0].add(steamVent);
    this.movingSetPieces.push({
        model: steamVent,
        type: 'steam',
        particleTimer: 0
    });
    
}

createTaxiCab() {
    const group = new THREE.Group();
    
    const taxiYellow = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        roughness: 0.3,
        metalness: 0.8
    });
    
    // Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, 4),
        taxiYellow
    );
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);
    
    // Roof
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 2),
        taxiYellow
    );
    roof.position.y = 1.3;
    group.add(roof);
    
    // Taxi light on roof
    const taxiLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.15, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        })
    );
    taxiLight.position.y = 1.7;
    group.add(taxiLight);
    
    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6
    });
    
    // Side windows
    [-0.85, 0.85].forEach(x => {
        const window = new THREE.Mesh(
            new THREE.PlaneGeometry(1.8, 0.5),
            windowMaterial
        );
        window.position.set(x, 1.3, 0);
        window.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(window);
    });
    
    // Wheels
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9
    });
    
    [[-0.7, -1.3], [0.7, -1.3], [-0.7, 1.3], [0.7, 1.3]].forEach(pos => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
            wheelMaterial
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], 0.3, pos[1]);
        group.add(wheel);
    });
    
    // Bumpers
    [2.1, -2.1].forEach(z => {
        const bumper = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.15, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.5,
                metalness: 0.8
            })
        );
        bumper.position.set(0, 0.3, z);
        group.add(bumper);
    });
    
    return group;
}

createFireHydrant() {
    const group = new THREE.Group();
    
    const redMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc3333,
        roughness: 0.6,
        metalness: 0.7
    });
    
    // Main body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.8, 12),
        redMaterial
    );
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);
    
    // Top cap
    const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.2, 0.2, 12),
        redMaterial
    );
    cap.position.y = 0.9;
    group.add(cap);
    
    // Side nozzles
    [-1, 1].forEach(side => {
        const nozzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8),
            redMaterial
        );
        nozzle.rotation.z = Math.PI / 2;
        nozzle.position.set(side * 0.25, 0.5, 0);
        group.add(nozzle);
        
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffff00,
                roughness: 0.5,
                metalness: 0.8
            })
        );
        cap.position.set(side * 0.4, 0.5, 0);
        group.add(cap);
    });
    
    return group;
}

createStreetLight() {
    const group = new THREE.Group();
    
    // Pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 5, 12),
        this.metalMaterial
    );
    pole.position.y = 2.5;
    pole.castShadow = true;
    group.add(pole);
    
    // Curved arm
    const arm = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.06, 8, 16, Math.PI / 2),
        this.metalMaterial
    );
    arm.rotation.x = Math.PI / 2;
    arm.rotation.z = -Math.PI / 2;
    arm.position.set(0.5, 5, 0);
    group.add(arm);
    
    // Light fixture
    const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 0.4, 8),
        this.metalMaterial
    );
    fixture.position.set(1, 4.8, 0);
    group.add(fixture);
    
    // Light bulb
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffcc,
            emissiveIntensity: 0.8
        })
    );
    bulb.position.set(1, 4.6, 0);
    group.add(bulb);
    
    // Actual light
    const light = new THREE.PointLight(0xffffee, 1, 10);
    light.position.set(1, 4.5, 0);
    light.castShadow = true;
    group.add(light);
    
    return group;
}

createMailbox() {
    const group = new THREE.Group();
    
    const blueMaterial = new THREE.MeshStandardMaterial({
        color: 0x2244aa,
        roughness: 0.5,
        metalness: 0.8
    });
    
    // Main box
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.2, 0.4),
        blueMaterial
    );
    box.position.y = 0.8;
    box.castShadow = true;
    group.add(box);
    
    // Rounded top
    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16, 1, false, 0, Math.PI),
        blueMaterial
    );
    top.rotation.z = Math.PI / 2;
    top.position.y = 1.4;
    group.add(top);
    
    // Mail slot
    const slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.05, 0.41),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    slot.position.set(0, 1, 0.2);
    group.add(slot);
    
    // USPS logo
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#2244aa';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('USPS', 64, 75);
    
    const texture = new THREE.CanvasTexture(canvas);
    const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.3),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    logo.position.set(0, 0.6, 0.21);
    group.add(logo);
    
    return group;
}

createNewsStand() {
    const group = new THREE.Group();
    
    // Frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 1),
        this.woodMaterial
    );
    frame.position.y = 1;
    frame.castShadow = true;
    group.add(frame);
    
    // Awning
    const awning = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.1, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0xcc4444,
            roughness: 0.8
        })
    );
    awning.position.set(0, 2.1, 0.2);
    group.add(awning);
    
    // Newspapers on rack
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const paper = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.4),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.8
                })
            );
            paper.position.set(-0.6 + col * 0.4, 0.5 + row * 0.5, 0.51);
            group.add(paper);
        }
    }
    
    return group;
}

createSteamVent() {
    const group = new THREE.Group();
    
    // Grate
    const grate = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.05, 0.8),
        this.metalMaterial
    );
    grate.position.y = 0.025;
    group.add(grate);
    
    // Steam particles (will be animated)
    for (let i = 0; i < 8; i++) {
        const steam = new THREE.Mesh(
            new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5
            })
        );
        steam.position.set(
            (Math.random() - 0.5) * 0.6,
            0.1,
            (Math.random() - 0.5) * 0.6
        );
        steam.visible = false;
        group.add(steam);
        
        steam.userData.isSteam = true;
        steam.userData.riseSpeed = 0.02 + Math.random() * 0.02;
        steam.userData.baseY = 0.1;
    }
    
    return group;
}

// ========================================
// SPACESHIP INTERIOR SET (sci-fi)
// ========================================

createSpaceshipSet() {
    const spaceship = new THREE.Group();
    
    // Metallic floor platform
    const floor = new THREE.Mesh(
        new THREE.CircleGeometry(8, 32),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a5a,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.01, -25);
    floor.receiveShadow = true;
    this.rooms[0].add(floor);
    
    // Hexagonal floor panels
    for (let ring = 0; ring < 3; ring++) {
        const hexCount = ring === 0 ? 1 : ring * 6;
        for (let i = 0; i < hexCount; i++) {
            const angle = (i / hexCount) * Math.PI * 2;
            const radius = ring * 2;
            
            const panel = this.createHexPanel();
            panel.position.set(
                Math.cos(angle) * radius,
                0.02,
                -25 + Math.sin(angle) * radius
            );
            this.rooms[0].add(panel);
        }
    }
    
    // Control panels/consoles
    const consolePositions = [
        { x: -3, z: -22, rot: Math.PI / 4 },
        { x: 3, z: -22, rot: -Math.PI / 4 },
        { x: 0, z: -28, rot: Math.PI }
    ];
    
    consolePositions.forEach(config => {
        const console = this.createConsole();
        console.position.set(config.x, 0, config.z);
        console.rotation.y = config.rot;
        this.rooms[0].add(console);
        this.movingSetPieces.push({
            model: console,
            type: 'console',
            blinkTimer: Math.random() * Math.PI * 2
        });
    });
    
    
    
    // Sci-fi doors
    [-6, 6].forEach(x => {
        const door = this.createSciFiDoor();
        door.position.set(x, 0, -32);
        this.rooms[0].add(door);
    });
    
    // Overhead lights (neon strips)
    for (let i = 0; i < 4; i++) {
        const neonLight = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.1, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1.0
            })
        );
        neonLight.position.set(0, 4, -28 + i * 2);
        this.rooms[0].add(neonLight);
        
        const light = new THREE.RectAreaLight(0x00ffff, 2, 10, 0.3);
        light.position.set(0, 3.9, -28 + i * 2);
        light.lookAt(0, 0, -28 + i * 2);
        this.rooms[0].add(light);
    }
    
    
}

createHexPanel() {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        points.push(new THREE.Vector2(
            Math.cos(angle) * 0.5,
            Math.sin(angle) * 0.5
        ));
    }
    
    const shape = new THREE.Shape(points);
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.05,
        bevelEnabled: false
    });
    
    const panel = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: 0x3a3a4a,
            roughness: 0.4,
            metalness: 0.8
        })
    );
    panel.rotation.x = -Math.PI / 2;
    
    return panel;
}

createConsole() {
    const group = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1, 0.8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a3a,
            roughness: 0.5,
            metalness: 0.8
        })
    );
    base.position.y = 0.5;
    base.castShadow = true;
    group.add(base);
    
    // Screen
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.7),
        new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8
        })
    );
    screen.position.set(0, 0.8, 0.41);
    screen.rotation.x = -0.2;
    group.add(screen);
    
    // Buttons
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    for (let i = 0; i < 8; i++) {
        const button = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12),
            new THREE.MeshStandardMaterial({
                color: colors[i % 4],
                emissive: colors[i % 4],
                emissiveIntensity: 0.5
            })
        );
        button.position.set(
            -0.5 + (i % 4) * 0.35,
            0.2,
            0.35 + Math.floor(i / 4) * 0.15
        );
        button.rotation.x = Math.PI / 2;
        group.add(button);
        
        button.userData.isButton = true;
    }
    
    return group;
}

createHoloProjector() {
    const group = new THREE.Group();
    
    // Base projector
    const projector = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.3, 32),
        new THREE.MeshStandardMaterial({
            color: 0x3a3a4a,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    projector.position.y = 0.15;
    group.add(projector);
    
    // Hologram (rotating wireframe sphere)
    const holoGeometry = new THREE.IcosahedronGeometry(0.6, 1);
    const holo = new THREE.Mesh(
        holoGeometry,
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        })
    );
    holo.position.y = 1.5;
    group.add(holo);
    
    group.userData.hologram = holo;
    
    // Light beam effect
    const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.5, 1.5, 32, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        })
    );
    beam.position.y = 0.75;
    group.add(beam);
    
    return group;
}

createSciFiDoor() {
    const group = new THREE.Group();
    
    // Door frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a5a,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    frame.position.y = 1.5;
    frame.castShadow = true;
    group.add(frame);
    
    // Sliding door panels
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a6a7a,
        roughness: 0.3,
        metalness: 0.9
    });
    
    [-0.5, 0.5].forEach((offset, index) => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 2.8, 0.2),
            doorMaterial
        );
        panel.position.set(offset, 1.5, 0);
        group.add(panel);
        
        panel.userData.isDoorPanel = true;
        panel.userData.side = index;
    });
    
    // Lights along edge
    for (let i = 0; i < 5; i++) {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0x00ff00,
                emissive: 0x00ff00,
                emissiveIntensity: 1.0
            })
        );
        light.position.set(-1.1, 0.5 + i * 0.6, 0.11);
        group.add(light);
    }
    
    return group;
}

// Continue to Part 3...
// ========================================
// PROP WAREHOUSE (storage building)
// ========================================

createPropWarehouse() {
    const warehouse = new THREE.Group();
    
    // Warehouse building
    const building = new THREE.Mesh(
        new THREE.BoxGeometry(12, 8, 15),
        new THREE.MeshStandardMaterial({
            color: 0x7a6a5a,
            roughness: 0.8,
            metalness: 0.2
        })
    );
    building.position.set(-15, 4, 40);
    building.castShadow = true;
    building.receiveShadow = true;
    this.rooms[0].add(building);
    
    // Warehouse door (large rolling door)
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(6, 7, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.7
        })
    );
    door.position.set(-15, 3.5, 32.6);
    this.rooms[0].add(door);
    
    // "PROPS" sign
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8a7a6a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PROPS', 256, 85);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 1),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    sign.position.set(-15, 9, 32.5);
    this.rooms[0].add(sign);
    
    // Props outside warehouse (various items)
    this.createWarehouseProps(-15, 32);
}

createWarehouseProps(centerX, centerZ) {
    // Wooden crates (stacked)
    const cratePositions = [
        { x: centerX - 4, y: 0.5, z: centerZ - 3 },
        { x: centerX - 4, y: 1.5, z: centerZ - 3 },
        { x: centerX - 3, y: 0.5, z: centerZ - 3 },
        { x: centerX - 5, y: 0.5, z: centerZ - 2 }
    ];
    
    cratePositions.forEach(pos => {
        const crate = this.createWoodenCrate();
        crate.position.set(pos.x, pos.y, pos.z);
        this.rooms[0].add(crate);
        this.propWarehouses.push(crate);
    });
    
    // Film reels
    for (let i = 0; i < 3; i++) {
        const reel = this.createFilmReel();
        reel.position.set(centerX - 6 + i * 1.5, 0.25, centerZ - 1);
        reel.rotation.x = Math.PI / 2;
        this.rooms[0].add(reel);
    }
    
    // Megaphone
    const megaphone = this.createMegaphone();
    megaphone.position.set(centerX - 2, 0.8, centerZ - 2);
    megaphone.rotation.set(0.3, 0.5, 0);
    this.rooms[0].add(megaphone);
    
    // Old-timey camera (vintage)
    const vintageCamera = this.createVintageCamera();
    vintageCamera.position.set(centerX + 3, 1, centerZ - 2.5);
    this.rooms[0].add(vintageCamera);
    
    // Movie poster frame (empty)
    const posterFrame = this.createPosterFrame();
    posterFrame.position.set(centerX, 1.5, centerZ - 4);
    this.rooms[0].add(posterFrame);
    
   
    
    // Traffic cones
    for (let i = 0; i < 4; i++) {
        const cone = this.createTrafficCone();
        cone.position.set(
            centerX + 4 + i * 0.8,
            0.3,
            centerZ - 3
        );
        this.rooms[0].add(cone);
    }
    
    // Apple boxes (stacked)
    const appleBoxes = this.createAppleBoxStack();
    appleBoxes.position.set(centerX + 5, 0, centerZ);
    this.rooms[0].add(appleBoxes);
}

createWoodenCrate() {
    const group = new THREE.Group();
    
    // Main crate
    const crate = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        this.woodMaterial
    );
    crate.castShadow = true;
    group.add(crate);
    
    // Wooden slats
    for (let i = 0; i < 5; i++) {
        const slat = new THREE.Mesh(
            new THREE.BoxGeometry(1.02, 0.05, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0x5a4a3a,
                roughness: 0.9
            })
        );
        slat.position.y = -0.4 + i * 0.2;
        slat.position.z = 0.51;
        group.add(slat);
    }
    
    // Stenciled text "FRAGILE"
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 60px stencil';
    ctx.textAlign = 'center';
    ctx.fillText('FRAGILE', 128, 130);
    
    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
        })
    );
    label.position.set(0, 0, 0.51);
    group.add(label);
    
    return group;
}

createFilmReel() {
    const group = new THREE.Group();
    
    // Reel body
    const reel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
        this.metalMaterial
    );
    reel.castShadow = true;
    group.add(reel);
    
    // Center hub
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.12, 16),
        this.metalMaterial
    );
    group.add(hub);
    
    // Spokes
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.11, 0.5),
            this.metalMaterial
        );
        spoke.position.set(
            Math.cos(angle) * 0.15,
            0,
            Math.sin(angle) * 0.15
        );
        spoke.rotation.y = angle;
        group.add(spoke);
    }
    
    // Film (wound around)
    const film = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.03, 8, 32),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6
        })
    );
    film.rotation.x = Math.PI / 2;
    group.add(film);
    
    return group;
}

createMegaphone() {
    const group = new THREE.Group();
    
    // Cone
    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.6, 16),
        new THREE.MeshStandardMaterial({
            color: 0xcc4444,
            roughness: 0.6,
            metalness: 0.3
        })
    );
    cone.rotation.x = -Math.PI / 2;
    cone.castShadow = true;
    group.add(cone);
    
    // Handle
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8
        })
    );
    handle.position.set(0, -0.15, 0.2);
    handle.rotation.x = Math.PI / 3;
    group.add(handle);
    
    return group;
}

createVintageCamera() {
    const group = new THREE.Group();
    
    // Camera body (box camera style)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.5, 0.7),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.7,
            metalness: 0.5
        })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);
    
    // Hand crank (side)
    const crank = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.02, 8, 16),
        this.metalMaterial
    );
    crank.rotation.y = Math.PI / 2;
    crank.position.set(0.35, 0.5, 0);
    group.add(crank);
    
    const crankHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6),
        this.metalMaterial
    );
    crankHandle.position.set(0.45, 0.5, 0);
    crankHandle.rotation.z = Math.PI / 2;
    group.add(crankHandle);
    
    // Lens
    const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 0.3, 16),
        this.metalMaterial
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.5, -0.5);
    group.add(lens);
    
    // Tripod
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.03, 1, 6),
            this.woodMaterial
        );
        leg.position.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
        );
        leg.rotation.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
        );
        group.add(leg);
    }
    
    return group;
}

createPosterFrame() {
    const group = new THREE.Group();
    
    // Ornate gold frame
    const frameThickness = 0.15;
    const width = 2;
    const height = 3;
    
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.4,
        metalness: 0.8
    });
    
    // Top
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameThickness),
        frameMaterial
    );
    top.position.y = height / 2;
    group.add(top);
    
    // Bottom
    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameThickness),
        frameMaterial
    );
    bottom.position.y = -height / 2;
    group.add(bottom);
    
    // Sides
    [-width/2, width/2].forEach(x => {
        const side = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameThickness),
            frameMaterial
        );
        side.position.x = x;
        group.add(side);
    });
    
    // Backing
    const backing = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9
        })
    );
    backing.position.z = -0.05;
    group.add(backing);
    
    return group;
}

createTrafficCone() {
    const group = new THREE.Group();
    
    // Cone
    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.6, 8),
        new THREE.MeshStandardMaterial({
            color: 0xff6600,
            roughness: 0.7
        })
    );
    cone.position.y = 0.3;
    cone.castShadow = true;
    group.add(cone);
    
    // White stripes
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.15 - i * 0.04,
                0.15 - (i - 0.3) * 0.04,
                0.08,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.7
            })
        );
        stripe.position.y = 0.1 + i * 0.15;
        group.add(stripe);
    }
    
    // Base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9
        })
    );
    base.position.y = 0.025;
    group.add(base);
    
    return group;
}

createAppleBoxStack() {
    const group = new THREE.Group();
    
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a6a4a,
        roughness: 0.9
    });
    
    // Stack of 3 apple boxes
    for (let i = 0; i < 3; i++) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.3, 0.8),
            boxMaterial
        );
        box.position.y = 0.15 + i * 0.3;
        box.castShadow = true;
        group.add(box);
    }
    
    return group;
}

// ========================================
// STUDIO UI
// ========================================

createStudioUI() {
    const studioUI = document.createElement('div');
    studioUI.id = 'studioUI';
    studioUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
        color: #ffaa00;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: 'Arial Black', sans-serif;
        font-size: 16px;
        z-index: 100;
        border: 3px solid #ffaa00;
        box-shadow: 0 0 30px rgba(255, 170, 0, 0.4), 
                    inset 0 0 20px rgba(0, 0, 0, 0.5);
        text-shadow: 0 0 10px rgba(255, 170, 0, 0.8);
        font-weight: bold;
    `;
    
    studioUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">🎬</span>
            <div>
                <div style="font-size: 20px; letter-spacing: 3px;">
                    HOLLYWOOD STUDIOS BACKLOT
                </div>
                <div style="font-size: 11px; opacity: 0.9; font-style: italic; letter-spacing: 1px;">
                    <span id="studioStatus">FILMING IN PROGRESS</span> • <span id="sceneInfo">Scene 42 • Take 7</span>
                </div>
            </div>
            <span style="font-size: 28px;">🎥</span>
        </div>
    `;
    
    document.body.appendChild(studioUI);
}

// ========================================
// STUDIO ANIMATIONS (complete system)
// ========================================

updateStudioAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. CAMERA DOLLIES (tracking shots)
    this.cameras.forEach((camera, index) => {
        // Move dolly back and forth
        camera.dollyPosition += 0.02 * camera.dollyDirection;
        
        if (camera.dollyPosition > 3 || camera.dollyPosition < -3) {
            camera.dollyDirection *= -1;
        }
        
        camera.model.position.z += 0.02 * camera.dollyDirection;
    });
    
    // 2. CLAPPERBOARDS (snap animation)
    this.clapperboards.forEach((clapper, index) => {
        clapper.snapTimer += 0.016;
        
        // Snap every 5 seconds
        if (clapper.snapTimer > 5) {
            clapper.snapTimer = 0;
            clapper.isOpen = false;
            
            // Snap closed animation
            const clapperPiece = clapper.model.userData.clapperPiece;
            if (clapperPiece) {
                let snapCount = 0;
                const snapInterval = setInterval(() => {
                    clapperPiece.rotation.x = snapCount % 2 === 0 ? 0 : -0.3;
                    snapCount++;
                    
                    if (snapCount >= 6) {
                        clearInterval(snapInterval);
                        clapperPiece.rotation.x = -0.3;
                        clapper.isOpen = true;
                    }
                }, 100);
            }
            
            console.log("🎬 Clapper board snap! Scene 42, Take " + (Math.floor(Math.random() * 10) + 1));
        }
    });
    
    // 3. WESTERN TOWN - TUMBLEWEEDS
    this.movingSetPieces.forEach((piece, index) => {
        if (piece.type === 'tumbleweed') {
            // Roll across the ground
            piece.model.position.x += piece.speed;
            piece.model.rotation.x += piece.rotationSpeed;
            piece.model.rotation.z += piece.rotationSpeed * 0.5;
            
            // Wrap around
            if (piece.model.position.x > 40) {
                piece.model.position.x = 30;
                piece.model.position.z = -15 + Math.random() * 20;
            }
        }
        
        // 4. NYC SET - STEAM VENTS
        if (piece.type === 'steam') {
            piece.particleTimer += 0.016;
            
            // Release steam periodically
            const shouldSteam = Math.sin(piece.particleTimer * 2) > 0.8;
            
            piece.model.children.forEach(child => {
                if (child.userData.isSteam) {
                    child.visible = shouldSteam;
                    
                    if (shouldSteam) {
                        child.position.y += child.userData.riseSpeed;
                        child.material.opacity = 0.5 - (child.position.y - child.userData.baseY) / 3;
                        
                        // Reset when too high
                        if (child.position.y > child.userData.baseY + 2) {
                            child.position.y = child.userData.baseY;
                            child.material.opacity = 0.5;
                        }
                    } else {
                        child.position.y = child.userData.baseY;
                    }
                }
            });
        }
        
        // 5. SPACESHIP SET - HOLOGRAM ROTATION
        if (piece.type === 'hologram') {
            piece.model.rotation.y += piece.rotationSpeed;
            
            const hologram = piece.model.userData.hologram;
            if (hologram) {
                hologram.rotation.x += 0.005;
                hologram.rotation.y += 0.01;
                
                // Pulsing opacity
                const pulse = 0.5 + Math.sin(time * 2) * 0.2;
                hologram.material.opacity = pulse;
            }
        }
        
        // 6. CONSOLE BUTTONS BLINKING
        if (piece.type === 'console') {
            piece.blinkTimer += 0.016;
            
            piece.model.children.forEach(child => {
                if (child.userData.isButton) {
                    const shouldBlink = Math.sin(time * 5 + piece.blinkTimer * 10) > 0.7;
                    child.material.emissiveIntensity = shouldBlink ? 1.0 : 0.5;
                }
            });
        }
    });
    
    // 7. STUDIO LIGHTS (subtle intensity variation)
    this.studioLights.forEach((light, index) => {
        const flicker = 1.8 + Math.sin(time * 2 + index) * 0.2;
        light.intensity = flicker;
    });
    
    // 8. FILM EQUIPMENT LIGHTS
    this.filmEquipment.forEach(equipment => {
        if (equipment.userData.studioLight) {
            const light = equipment.userData.studioLight;
            const intensity = 2.8 + Math.sin(time * 3) * 0.2;
            light.intensity = intensity;
        }
    });
    
    // 9. GREEN SCREEN SUBTLE GLOW
    this.greenScreens.forEach((screen, index) => {
        screen.children.forEach(child => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = 0.15 + Math.sin(time * 0.5 + index) * 0.05;
            }
        });
    });
    
    // 10. UPDATE UI
    const sceneInfo = document.getElementById('sceneInfo');
    if (sceneInfo && Math.random() < 0.01) {
        const take = Math.floor(Math.random() * 15) + 1;
        sceneInfo.textContent = `Scene 42 • Take ${take}`;
    }
    
    const status = document.getElementById('studioStatus');
    if (status) {
        const statuses = ['FILMING IN PROGRESS', 'STANDBY', 'RESETTING', 'CHECKING GATE'];
        if (Math.random() < 0.005) {
            status.textContent = statuses[Math.floor(Math.random() * statuses.length)];
        }
    }
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Studio backlot bounds
        const minX = -38;
        const maxX = 38;
        const minZ = -48;
        const maxZ = 48;
        
        this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    // Spawn at studio entrance (main road)
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: -45
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
    
    this.updateStudioAnimations();        // ✓ ADD THIS LINE
   
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
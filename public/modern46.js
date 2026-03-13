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
    // CARNIVAL MIDWAY AT MIDNIGHT SYSTEM
    // ========================================
    
    this.artworkSpots = [];
    
    this.ferrisWheel = null;
    this.carousel = null;
    this.gameBooths = [];
    this.stringLights = [];
    this.carnivalRides = [];
    this.funhouseMirrors = [];
    this.carnivalPosters = [];
    this.creakingSounds = [];
    this.ticketBooths = [];
    this.trashBins = [];
    this.ferrisWheelRotation = 0;
    this.carouselRotation = 0;
    this.windEffects = [];
    
    this.createCarnivalMidway();
    this.createFerrisWheel();
    this.createCarousel();
    this.createStringLights();
    this.createGameBooths();
    this.createFunhouseMirrors();
    this.createTicketBooths();
    this.createCarnivalProps();
    this.createCarnivalAtmosphere();
    
    
    console.log("🎪 Carnival Midway at Midnight loaded!");
}

// ========================================
// CARNIVAL MIDWAY (abandoned fairground)
// ========================================

createCarnivalMidway() {
    const midwayRoom = new THREE.Group();
    midwayRoom.visible = true;
    
    const midwayWidth = 60;
    const midwayLength = 80;
    
    // ========================================
    // MATERIALS (weathered, old carnival)
    // ========================================
    
    this.woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a5a4a,
        roughness: 0.95,
        metalness: 0.05
    });
    
    this.metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.7,
        metalness: 0.8
    });
    
    this.fabricMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a4a3a,
        roughness: 0.9,
        metalness: 0.05
    });
    
    this.rustMaterial = new THREE.MeshStandardMaterial({
        color: 0x7a4a2a,
        roughness: 0.95,
        metalness: 0.6
    });
    
    // ========================================
    // GROUND (dirt and grass)
    // ========================================
    
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(midwayWidth, midwayLength),
        new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.95
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    midwayRoom.add(ground);
    
    // Worn dirt paths
    const mainPath = new THREE.Mesh(
        new THREE.PlaneGeometry(8, midwayLength),
        new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.98
        })
    );
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = 0.01;
    midwayRoom.add(mainPath);
    
    // Patches of dead grass
    for (let i = 0; i < 30; i++) {
        const patch = new THREE.Mesh(
            new THREE.CircleGeometry(1 + Math.random() * 2, 12),
            new THREE.MeshStandardMaterial({
                color: 0x3a4a2a,
                roughness: 1.0
            })
        );
        patch.rotation.x = -Math.PI / 2;
        patch.position.set(
            (Math.random() - 0.5) * 50,
            0.01,
            (Math.random() - 0.5) * 70
        );
        midwayRoom.add(patch);
    }
    
    // ========================================
    // ATMOSPHERIC LIGHTING (midnight/moonlight)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0x2a2a4a, 0.3);
    midwayRoom.add(ambientLight);
    
    // Moonlight
    this.moonlight = new THREE.DirectionalLight(0x6688aa, 0.5);
    this.moonlight.position.set(20, 30, 10);
    this.moonlight.castShadow = true;
    this.moonlight.shadow.mapSize.width = 2048;
    this.moonlight.shadow.mapSize.height = 2048;
    midwayRoom.add(this.moonlight);
    
    // Eerie purple/blue fog
    this.scene.fog = new THREE.FogExp2(0x1a1a2a, 0.015);
    
    midwayRoom.position.set(0, 0, 0);
    this.rooms.push(midwayRoom);
    this.scene.add(midwayRoom);
}

// ========================================
// FERRIS WHEEL (slowly spinning, creaky)
// ========================================

createFerrisWheel() {
    const ferrisGroup = new THREE.Group();
    
    const wheelRadius = 12;
    const numCars = 12;
    
    // Support structure (A-frame)
    const supportHeight = 15;
    
    // Left support
    const leftSupport = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, supportHeight, 0.5),
        this.rustMaterial
    );
    leftSupport.position.set(-3, supportHeight / 2, 0);
    leftSupport.rotation.z = 0.15;
    leftSupport.castShadow = true;
    ferrisGroup.add(leftSupport);
    
    // Right support
    const rightSupport = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, supportHeight, 0.5),
        this.rustMaterial
    );
    rightSupport.position.set(3, supportHeight / 2, 0);
    rightSupport.rotation.z = -0.15;
    rightSupport.castShadow = true;
    ferrisGroup.add(rightSupport);
    
    // Cross braces
    for (let i = 0; i < 3; i++) {
        const brace = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.3, 0.3),
            this.rustMaterial
        );
        brace.position.y = 3 + i * 4;
        ferrisGroup.add(brace);
    }
    
    // Wheel hub (center)
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 16),
        this.metalMaterial
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.y = supportHeight;
    hub.castShadow = true;
    ferrisGroup.add(hub);
    
    // Wheel spokes and rim
    const wheelGroup = new THREE.Group();
    
    // Rim (outer ring)
    const rimSegments = 32;
    for (let i = 0; i < rimSegments; i++) {
        const angle = (i / rimSegments) * Math.PI * 2;
        const nextAngle = ((i + 1) / rimSegments) * Math.PI * 2;
        
        const segment = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 1.5),
            this.rustMaterial
        );
        segment.position.set(
            Math.cos(angle) * wheelRadius,
            Math.sin(angle) * wheelRadius,
            0
        );
        segment.rotation.z = angle + Math.PI / 2;
        wheelGroup.add(segment);
    }
    
    // Spokes (radial supports)
    for (let i = 0; i < numCars; i++) {
        const angle = (i / numCars) * Math.PI * 2;
        
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, wheelRadius, 0.2),
            this.rustMaterial
        );
        spoke.position.set(
            Math.cos(angle) * wheelRadius / 2,
            Math.sin(angle) * wheelRadius / 2,
            0
        );
        spoke.rotation.z = angle + Math.PI / 2;
        wheelGroup.add(spoke);
    }
    
    // Cross bracing on wheel
    const bracingAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    bracingAngles.forEach(baseAngle => {
        const brace = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, wheelRadius * 1.4, 0.15),
            this.metalMaterial
        );
        brace.position.set(
            Math.cos(baseAngle + Math.PI / 4) * wheelRadius / 2,
            Math.sin(baseAngle + Math.PI / 4) * wheelRadius / 2,
            0
        );
        brace.rotation.z = baseAngle + Math.PI / 4;
        wheelGroup.add(brace);
    });
    
    // Gondola cars
    this.ferrisWheelCars = [];
    
    for (let i = 0; i < numCars; i++) {
        const angle = (i / numCars) * Math.PI * 2;
        const car = this.createFerrisWheelCar();
        
        car.position.set(
            Math.cos(angle) * wheelRadius,
            Math.sin(angle) * wheelRadius,
            0
        );
        
        wheelGroup.add(car);
        this.ferrisWheelCars.push({
            model: car,
            angle: angle,
            swingPhase: Math.random() * Math.PI * 2
        });
    }
    
    wheelGroup.position.y = supportHeight;
    ferrisGroup.add(wheelGroup);
    
    ferrisGroup.position.set(-20, 0, -20);
    ferrisGroup.userData.wheel = wheelGroup;
    
    this.ferrisWheel = ferrisGroup;
    this.rooms[0].add(ferrisGroup);
    this.carnivalRides.push(ferrisGroup);
}

createFerrisWheelCar() {
    const group = new THREE.Group();
    
    // Car frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.2, 1.2),
        new THREE.MeshStandardMaterial({
            color: 0xcc4444,
            roughness: 0.8,
            metalness: 0.3
        })
    );
    frame.castShadow = true;
    group.add(frame);
    
    // Roof
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.1, 1.3),
        this.metalMaterial
    );
    roof.position.y = 0.65;
    group.add(roof);
    
    // Windows (broken/dirty)
    [-0.76, 0.76].forEach(x => {
        const window = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.6),
            new THREE.MeshStandardMaterial({
                color: 0x2a3a4a,
                transparent: true,
                opacity: 0.5,
                roughness: 0.8
            })
        );
        window.position.set(x, 0.1, 0);
        window.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(window);
    });
    
    // Suspension cables
    const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1, 6),
        this.metalMaterial
    );
    cable.position.y = 1.2;
    group.add(cable);
    
    // Rust patches
    for (let i = 0; i < 3; i++) {
        const rust = new THREE.Mesh(
            new THREE.CircleGeometry(0.1 + Math.random() * 0.1, 8),
            this.rustMaterial
        );
        rust.position.set(
            (Math.random() - 0.5) * 1.4,
            (Math.random() - 0.5) * 1,
            0.61
        );
        group.add(rust);
    }
    
    return group;
}

// ========================================
// CAROUSEL (with horses, slowly spinning)
// ========================================

createCarousel() {
    const carouselGroup = new THREE.Group();
    
    const radius = 8;
    const height = 4;
    
    // Platform base
    const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius + 0.5, 0.5, 24),
        this.woodMaterial
    );
    platform.position.y = 0.25;
    platform.castShadow = true;
    carouselGroup.add(platform);
    
    // Platform edge (decorative trim)
    const trim = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.15, 12, 24),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.5,
            metalness: 0.8
        })
    );
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.5;
    carouselGroup.add(trim);
    
    // Central pole
    const centerPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, height, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.5
        })
    );
    centerPole.position.y = height / 2 + 0.5;
    centerPole.castShadow = true;
    carouselGroup.add(centerPole);
    
    // Gold bands on pole
    for (let i = 0; i < 5; i++) {
        const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.05, 8, 16),
            new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                roughness: 0.4,
                metalness : 0.9
            })
        );
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.8 + i * 0.8;
        carouselGroup.add(band);
    }
    
    // Canopy (top)
    const canopyLayers = 3;
    for (let layer = 0; layer < canopyLayers; layer++) {
        const canopyRadius = radius * 0.8 - layer * 0.5;
        const canopy = new THREE.Mesh(
            new THREE.ConeGeometry(canopyRadius, 1, 24),
            new THREE.MeshStandardMaterial({
                color: layer % 2 === 0 ? 0xcc4444 : 0xffffff,
                roughness: 0.7,
                metalness: 0.3
            })
        );
        canopy.position.y = height + 0.5 + layer * 0.8;
        carouselGroup.add(canopy);
    }
    
    // Top ornament
    const ornament = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.9,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        })
    );
    ornament.position.y = height + 3;
    carouselGroup.add(ornament);
    
    // Carousel horses
    this.carouselHorses = [];
    const numHorses = 8;
    
    for (let i = 0; i < numHorses; i++) {
        const angle = (i / numHorses) * Math.PI * 2;
        const horse = this.createCarouselHorse(i);
        
        horse.position.set(
            Math.cos(angle) * (radius * 0.7),
            1.5,
            Math.sin(angle) * (radius * 0.7)
        );
        horse.rotation.y = angle + Math.PI / 2;
        
        carouselGroup.add(horse);
        this.carouselHorses.push({
            model: horse,
            baseY: 1.5,
            bobPhase: (i / numHorses) * Math.PI * 2,
            poleAngle: angle
        });
    }
    
    // Mirror panels around edge
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const mirror = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 2.5),
            new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.2,
                metalness : 0.9
            })
        );
        mirror.position.set(
            Math.cos(angle) * (radius - 0.2),
            2,
            Math.sin(angle) * (radius - 0.2)
        );
        mirror.rotation.y = angle + Math.PI;
        carouselGroup.add(mirror);
    }
    
    carouselGroup.position.set(20, 0, -10);
    carouselGroup.userData.isCarousel = true;
    
    this.carousel = carouselGroup;
    this.rooms[0].add(carouselGroup);
    this.carnivalRides.push(carouselGroup);
}

createCarouselHorse(index) {
    const group = new THREE.Group();
    
    // Horse colors (various carnival colors)
    const colors = [0xffffff, 0xffaa88, 0x88aaff, 0xffff88, 0xff88aa, 0x88ffaa];
    const color = colors[index % colors.length];
    
    const horseMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.3
    });
    
    // Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.6, 1),
        horseMaterial
    );
    body.position.y = 0.3;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.4),
        horseMaterial
    );
    head.position.set(0, 0.7, -0.6);
    head.rotation.x = 0.3;
    group.add(head);
    
    // Snout
    const snout = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 0.3),
        horseMaterial
    );
    snout.position.set(0, 0.55, -0.85);
    group.add(snout);
    
    // Ears
    [-0.12, 0.12].forEach(x => {
        const ear = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.15, 4),
            horseMaterial
        );
        ear.position.set(x, 0.95, -0.6);
        group.add(ear);
    });
    
    // Mane
    for (let i = 0; i < 5; i++) {
        const maneSegment = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.15, 0.05),
            new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                roughness: 0.8
            })
        );
        maneSegment.position.set(0, 0.75 - i * 0.12, -0.45 + i * 0.15);
        maneSegment.rotation.x = 0.3;
        group.add(maneSegment);
    }
    
    // Legs
    const legPositions = [
        [-0.2, -0.1], [0.2, -0.1],
        [-0.2, 0.4], [0.2, 0.4]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
            horseMaterial
        );
        leg.position.set(pos[0], -0.4, pos[1]);
        group.add(leg);
        
        // Hoof
        const hoof = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.1, 0.15),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.8
            })
        );
        hoof.position.set(pos[0], -0.85, pos[1]);
        group.add(hoof);
    });
    
    // Saddle
    const saddle = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.15, 0.7),
        new THREE.MeshStandardMaterial({
            color: 0x8a4a2a,
            roughness: 0.7
        })
    );
    saddle.position.y = 0.65;
    group.add(saddle);
    
    // Brass pole (up/down pole)
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2, 8),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    pole.position.y = 0.5;
    group.add(pole);
    
    // Decorative elements
    // Stirrups
    [-0.25, 0.25].forEach(x => {
        const stirrup = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.02, 8, 12),
            new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                roughness: 0.5,
                metalness: 0.8
            })
        );
        stirrup.position.set(x, 0.1, 0);
        stirrup.rotation.x = Math.PI / 2;
        group.add(stirrup);
    });
    
    return group;
}

// ========================================
// STRING LIGHTS (twinkling, some broken)
// ========================================

createStringLights() {
    // Strands of lights across the midway
    const strandConfigs = [
        { start: { x: -25, y: 8, z: -35 }, end: { x: 25, y: 8, z: -35 } },
        { start: { x: -25, y: 8, z: -15 }, end: { x: 25, y: 8, z: -15 } },
        { start: { x: -25, y: 8, z: 5 }, end: { x: 25, y: 8, z: 5 } },
        { start: { x: -25, y: 8, z: 25 }, end: { x: 25, y: 8, z: 25 } },
        { start: { x: -25, y: 10, z: -35 }, end: { x: -25, y: 6, z: 35 } },
        { start: { x: 25, y: 10, z: -35 }, end: { x: 25, y: 6, z: 35 } }
    ];
    
    strandConfigs.forEach((config, strandIndex) => {
        this.createLightStrand(config.start, config.end, strandIndex);
    });
}

createLightStrand(start, end, strandIndex) {
    const numBulbs = 20;
    
    // Cable
    const points = [
        new THREE.Vector3(start.x, start.y, start.z),
        new THREE.Vector3(end.x, end.y, end.z)
    ];
    
    const cableGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const cable = new THREE.Line(
        cableGeometry,
        new THREE.LineBasicMaterial({
            color: 0x2a2a2a,
            linewidth: 2
        })
    );
    this.rooms[0].add(cable);
    
  
}


// ========================================
// GAME BOOTHS (carnival games)
// ========================================

createGameBooths() {
    const boothConfigs = [
        { x: -25, z: -25, type: 'ringtoss', name: 'RING TOSS' },
        { x: -25, z: -10, type: 'shooting', name: 'SHOOTING GALLERY' },
        { x: -25, z: 5, type: 'bottles', name: 'KNOCK EM DOWN' },
        { x: 25, z: -25, type: 'darts', name: 'BALLOON DARTS' },
        { x: 25, z: -10, type: 'basketball', name: 'HOOP SHOT' },
        { x: 25, z: 5, type: 'strongman', name: 'TEST YOUR STRENGTH' }
    ];
    
    boothConfigs.forEach(config => {
        const booth = this.createGameBooth(config);
        booth.position.set(config.x, 0, config.z);
        this.rooms[0].add(booth);
        this.gameBooths.push(booth);
    });
}

createGameBooth(config) {
    const group = new THREE.Group();
    
    // Booth frame/structure
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 3),
        this.woodMaterial
    );
    frame.position.y = 1.5;
    frame.castShadow = true;
    group.add(frame);
    
    // Striped awning (red and white)
    const awning = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.2, 3.5),
        new THREE.MeshStandardMaterial({
            color: 0xcc4444,
            roughness: 0.8
        })
    );
    awning.position.y = 3.2;
    group.add(awning);
    
    // Awning stripes
    for (let i = 0; i < 5; i++) {
        const stripe = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 3.5),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8
            })
        );
        stripe.position.set(-1.8 + i * 0.9, 3.21, 0);
        stripe.rotation.x = -Math.PI / 2;
        group.add(stripe);
    }
    
    // Awning fringe
    for (let i = 0; i < 20; i++) {
        const fringe = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.3, 0.05),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness : 0.9
            })
        );
        fringe.position.set(
            -2.2 + i * 0.22,
            3,
            1.75
        );
        group.add(fringe);
    }
    
    // Sign board
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');
    
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 60px Impact';
    ctx.textAlign = 'center';
    ctx.fillText(config.name, 256, 80);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 0.9),
        new THREE.MeshBasicMaterial({ map: signTexture })
    );
    sign.position.set(0, 3.8, 0);
    group.add(sign);
    
    // Counter
    const counter = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.8, 0.6),
        this.woodMaterial
    );
    counter.position.set(0, 0.9, 1.2);
    group.add(counter);
    
    // Back wall (for artwork poster)
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 2.5),
        new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.9
        })
    );
    backWall.position.set(0, 1.8, -1.4);
    backWall.receiveShadow = true;
    group.add(backWall);
    
    // Add artwork spot for carnival poster
    this.artworkSpots.push({
        x: config.x,
        y: 1.8,
        z: config.z - 1.4,
        rot: 0,
        booth: config.type
    });
    
    // Game-specific props
    switch (config.type) {
        case 'ringtoss':
            this.addRingTossProps(group);
            break;
        case 'shooting':
            this.addShootingGalleryProps(group);
            break;
        case 'bottles':
            this.addBottleProps(group);
            break;
        case 'darts':
            this.addDartProps(group);
            break;
        case 'basketball':
            this.addBasketballProps(group);
            break;
        case 'strongman':
            this.addStrongmanProps(group);
            break;
    }
    
    return group;
}

addRingTossProps(group) {
    // Pegs/bottles to throw rings over
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const peg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6
                })
            );
            peg.position.set(
                -0.6 + col * 0.4,
                1.1,
                1 - row * 0.3
            );
            group.add(peg);
        }
    }
    
    // Rings scattered on counter
    for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.02, 8, 16),
            new THREE.MeshStandardMaterial({
                color: 0xff4444,
                roughness: 0.7
            })
        );
        ring.position.set(
            -1.5 + i * 0.8,
            1.31,
            1.2
        );
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
    }
}

addShootingGalleryProps(group) {
    // Moving duck targets
    for (let i = 0; i < 5; i++) {
        const duck = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.2, 0.15),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.8
            })
        );
        duck.position.set(
            -1.2 + i * 0.6,
            1.5 + (i % 2) * 0.3,
            0.8
        );
        group.add(duck);
        
        // Duck head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.8
            })
        );
        head.position.set(
            -1.2 + i * 0.6,
            1.5 + (i % 2) * 0.3,
            0.7
        );
        group.add(head);
    }
    
    // Toy rifle on counter
    const rifle = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.1, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6,
            metalness: 0.7
        })
    );
    rifle.position.set(1, 1.31, 1.2);
    rifle.rotation.y = -Math.PI / 6;
    group.add(rifle);
}

addBottleProps(group) {
    // Pyramid of bottles
    const bottlePositions = [
        // Bottom row
        { x: -0.15, y: 1.2, z: 0.9 },
        { x: 0, y: 1.2, z: 0.9 },
        { x: 0.15, y: 1.2, z: 0.9 },
        // Middle row
        { x: -0.075, y: 1.45, z: 0.9 },
        { x: 0.075, y: 1.45, z: 0.9 },
        // Top
        { x: 0, y: 1.7, z: 0.9 }
    ];
    
    bottlePositions.forEach(pos => {
        const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x44aa44 : 0xaa4444,
                roughness: 0.5,
                metalness: 0.3
            })
        );
        bottle.position.set(pos.x, pos.y, pos.z);
        group.add(bottle);
    });
    
    // Balls on counter
    for (let i = 0; i < 3; i++) {
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.8
            })
        );
        ball.position.set(-1 + i * 0.5, 1.35, 1.2);
        group.add(ball);
    }
}

addDartProps(group) {
    // Balloon board (grid of balloons)
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            const balloonColors = [0xff4444, 0x4444ff, 0xffff44, 0xff44ff];
            const balloon = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 12, 12),
                new THREE.MeshStandardMaterial({
                    color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
                    roughness: 0.4
                })
            );
            balloon.scale.y = 1.2;
            balloon.position.set(
                -1 + col * 0.5,
                1 + row * 0.5,
                0.7
            );
            group.add(balloon);
            
            // String
            const string = new THREE.Mesh(
                new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4),
                new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
            );
            string.position.set(
                -1 + col * 0.5,
                1 + row * 0.5 - 0.25,
                0.7
            );
            group.add(string);
        }
    }
    
    // Darts on counter
    for (let i = 0; i < 3; i++) {
        const dart = new THREE.Mesh(
            new THREE.ConeGeometry(0.02, 0.15, 6),
            new THREE.MeshStandardMaterial({
                color: 0xcc4444,
                roughness: 0.6,
                metalness: 0.5
            })
        );
        dart.position.set(-0.8 + i * 0.4, 1.31, 1.2);
        dart.rotation.x = Math.PI / 2;
        group.add(dart);
    }
}

addBasketballProps(group) {
    // Hoop
    const hoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.03, 8, 16),
        this.metalMaterial
    );
    hoop.position.set(0, 2, 0.5);
    hoop.rotation.x = Math.PI / 2;
    group.add(hoop);
    
    // Backboard
    const backboard = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.6),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5
        })
    );
    backboard.position.set(0, 2.2, 0.3);
    group.add(backboard);
    
    // Net
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const netString = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        netString.position.set(
            Math.cos(angle) * 0.2,
            1.85,
            0.5 + Math.sin(angle) * 0.2
        );
        group.add(netString);
    }
    
    // Basketballs on counter
    for (let i = 0; i < 2; i++) {
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0xff6600,
                roughness: 0.7
            })
        );
        ball.position.set(-0.5 + i, 1.42, 1.2);
        group.add(ball);
    }
}

addStrongmanProps(group) {
    // Bell tower
    const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 3, 0.3),
        this.woodMaterial
    );
    tower.position.set(0, 1.5, 0.8);
    group.add(tower);
    
    // Markers on tower
    const labels = ['WEAK', 'OK', 'STRONG', 'CHAMPION'];
    labels.forEach((label, i) => {
        const marker = new THREE.Mesh(
            new THREE.PlaneGeometry(0.4, 0.15),
            new THREE.MeshBasicMaterial({ color: 0xffaa00 })
        );
        marker.position.set(-0.3, 0.8 + i * 0.6, 0.8);
        marker.rotation.y = Math.PI / 2;
        group.add(marker);
    });
    
    // Bell at top
    const bell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.2, 8),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    bell.position.set(0, 3.2, 0.8);
    group.add(bell);
    
    // Striker puck
    const puck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12),
        this.metalMaterial
    );
    puck.position.set(0, 0.55, 0.8);
    group.add(puck);
    
    // Hammer on ground
    const hammerHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
        this.woodMaterial
    );
    hammerHandle.position.set(0.5, 0.3, 1.2);
    hammerHandle.rotation.z = Math.PI / 4;
    group.add(hammerHandle);
    
    const hammerHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.15, 0.15),
        this.metalMaterial
    );
    hammerHead.position.set(0.9, 0.6, 1.2);
    hammerHead.rotation.z = Math.PI / 4;
    group.add(hammerHead);
}

// ========================================
// FUNHOUSE MIRRORS (distorted reflections)
// ========================================

createFunhouseMirrors() {
    const mirrorPositions = [
        { x: 0, z: -35, type: 'tall' },
        { x: -10, z: 30, type: 'wide' },
        { x: 10, z: 30, type: 'wavy' }
    ];
    
    mirrorPositions.forEach(config => {
        const mirror = this.createFunhouseMirror(config.type);
        mirror.position.set(config.x, 0, config.z);
        this.rooms[0].add(mirror);
        this.funhouseMirrors.push({
            model: mirror,
            type: config.type
        });
    });
}

createFunhouseMirror(type) {
    const group = new THREE.Group();
    
    // Frame
    let width, height;
    switch (type) {
        case 'tall':
            width = 1.5;
            height = 4;
            break;
        case 'wide':
            width = 3;
            height = 2;
            break;
        case 'wavy':
            width = 2;
            height = 3;
            break;
    }
    
    // Ornate frame
    const frameThickness = 0.2;
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
    top.position.y = height / 2 + frameThickness / 2;
    group.add(top);
    
    // Bottom
    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameThickness),
        frameMaterial
    );
    bottom.position.y = -height / 2 - frameThickness / 2;
    group.add(bottom);
    
    // Sides
    [-width/2 - frameThickness/2, width/2 + frameThickness/2].forEach(x => {
        const side = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height + frameThickness * 2, frameThickness),
            frameMaterial
        );
        side.position.x = x;
        group.add(side);
    });
    
    // Mirror surface (distorted based on type)
    let mirrorGeometry;
    
    if (type === 'wavy') {
        // Create wavy geometry
        mirrorGeometry = new THREE.PlaneGeometry(width, height, 20, 20);
        const positions = mirrorGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const wave = Math.sin(y * 3) * 0.2;
            positions.setZ(i, wave);
        }
        positions.needsUpdate = true;
        mirrorGeometry.computeVertexNormals();
    } else {
        mirrorGeometry = new THREE.PlaneGeometry(width, height);
    }
    
    const mirror = new THREE.Mesh(
        mirrorGeometry,
        new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.1,
            metalness: 1.0
        })
    );
    mirror.position.z = 0.05;
    group.add(mirror);
    
    // Cracks in mirror (abandoned/broken)
    for (let i = 0; i < 3; i++) {
        const crack = new THREE.Mesh(
            new THREE.PlaneGeometry(0.02, height * (0.3 + Math.random() * 0.5)),
            new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.6
            })
        );
        crack.position.set(
            (Math.random() - 0.5) * width * 0.8,
            (Math.random() - 0.5) * height * 0.6,
            0.06
        );
        crack.rotation.z = (Math.random() - 0.5) * Math.PI / 3;
        group.add(crack);
    }
    
    // "FUNHOUSE" sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Impact';
    ctx.textAlign = 'center';
    ctx.fillText('FUNHOUSE', 128, 42);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.25),
        new THREE.MeshBasicMaterial({ map: signTexture })
    );
    sign.position.set(0, height / 2 + 0.5, 0.05);
    group.add(sign);
    
    group.position.y = height / 2;
    return group;
}

// ========================================
// TICKET BOOTHS (entrance booths)
// ========================================

createTicketBooths() {
    const boothPositions = [
        { x: -5, z: -38 },
        { x: 5, z: -38 }
    ];
    
    boothPositions.forEach(pos => {
        const booth = this.createTicketBooth();
        booth.position.set(pos.x, 0, pos.z);
        this.rooms[0].add(booth);
        this.ticketBooths.push(booth);
    });
}

createTicketBooth() {
    const group = new THREE.Group();
    
    // Booth structure
    const booth = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2.5, 2),
        this.woodMaterial
    );
    booth.position.y = 1.25;
    booth.castShadow = true;
    group.add(booth);
    
    // Roof
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 0.8, 4),
        new THREE.MeshStandardMaterial({
            color: 0xcc4444,
            roughness: 0.7
        })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.9;
    group.add(roof);
    
    // Window
    const window = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.6),
        new THREE.MeshStandardMaterial({
            color: 0x2a3a4a,
            transparent: true,
            opacity: 0.7,
            roughness: 0.2
        })
    );
    window.position.set(0, 1.5, 1.01);
    group.add(window);
    
    // "TICKETS" sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Impact';
    ctx.textAlign = 'center';
    ctx.fillText('TICKETS', 128, 80);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.6),
        new THREE.MeshBasicMaterial({ map: signTexture })
    );
    sign.position.set(0, 2.5, 1.01);
    group.add(sign);
    
    // Counter shelf
    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 0.3),
        this.woodMaterial
    );
    shelf.position.set(0, 1.2, 1.1);
    group.add(shelf);
    
    return group;
}

// ========================================
// CARNIVAL PROPS (trash, signs, prizes)
// ========================================

createCarnivalProps() {
    // Trash bins
    for (let i = 0; i < 8; i++) {
        const bin = this.createTrashBin();
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 15;
        bin.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        this.rooms[0].add(bin);
        this.trashBins.push(bin);
    }
    
    // Scattered popcorn boxes
    for (let i = 0; i < 15; i++) {
        const popcorn = this.createPopcornBox();
        popcorn.position.set(
            (Math.random() - 0.5) * 50,
            0.05,
            (Math.random() - 0.5) * 70
        );
        popcorn.rotation.y = Math.random() * Math.PI * 2;
        this.rooms[0].add(popcorn);
    }
    
    // Balloon on ground (deflated)
    for (let i = 0; i < 10; i++) {
        const balloon = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff,
                roughness: 0.6,
                transparent: true,
                opacity: 0.7
            })
        );
        balloon.scale.y = 0.3;
        balloon.position.set(
            (Math.random() - 0.5) * 50,
            0.05,
            (Math.random() - 0.5) * 70
        );
        this.rooms[0].add(balloon);
    }
    
    // Stuffed animal prizes (fallen)
    for (let i = 0; i < 6; i++) {
        const prize = this.createStuffedAnimal();
        prize.position.set(
            (Math.random() - 0.5) * 40,
            0.2,
            (Math.random() - 0.5) * 60
        );
        prize.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI
        );
        this.rooms[0].add(prize);
    }
    
    // Directional signs
    const signPost = this.createDirectionalSign();
    signPost.position.set(0, 0, -30);
    this.rooms[0].add(signPost);
}

createTrashBin() {
    const group = new THREE.Group();
    
    const bin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 0.8, 12),
        this.metalMaterial
    );
    bin.position.y = 0.4;
    bin.castShadow = true;
    group.add(bin);
    
    // Overflowing trash
    for (let i = 0; i < 3; i++) {
        const trash = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.1),
            new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff,
                roughness: 0.9
            })
        );
        trash.position.set(
            (Math.random() - 0.5) * 0.6,
            0.9 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.6
        );
        trash.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        group.add(trash);
    }
    
    return group;
}

createPopcornBox() {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 0.15),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.8
        })
    );
    box.castShadow = true;
    
    return box;
}

createStuffedAnimal() {
    const group = new THREE.Group();
    
    // Simple teddy bear shape
    const colors = [0x8a5a3a, 0xffaa88, 0xaaaaaa, 0xff88aa];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.95
    });
    
    // Body
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        material
    );
    body.scale.set(1, 1.2, 0.9);
    group.add(body);
    
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        material
    );
    head.position.y = 0.3;
    group.add(head);
    
    // Ears
    [-0.08, 0.08].forEach(x => {
        const ear = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            material
        );
        ear.position.set(x, 0.4, 0);
        group.add(ear);
    });
    
    return group;
}

createDirectionalSign() {
    const group = new THREE.Group();
    
    // Post
    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3, 8),
        this.woodMaterial
    );
    post.position.y = 1.5;
    post.castShadow = true;
    group.add(post);
    
    // Arrow signs
    const signs = [
        { text: 'FERRIS WHEEL →', y: 2.5, rot: -Math.PI / 4 },
        { text: '← CAROUSEL', y: 2, rot: Math.PI / 6 },
        { text: 'GAMES ↑', y: 1.5, rot: 0 }
    ];
    
    signs.forEach(config => {
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 256;
        signCanvas.height = 64;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(config.text, 128, 40);
        
        const texture = new THREE.CanvasTexture(signCanvas);
        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 0.25),
            new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        );
        sign.position.y = config.y;
        sign.rotation.y = config.rot;
        group.add(sign);
    });
    
    return group;
}

// ========================================
// CARNIVAL ATMOSPHERE (fog, wind, night sky)
// ========================================

createCarnivalAtmosphere() {
    // Night sky
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0a1a,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.rooms[0].add(sky);
    
    // Stars
    const starCount = 500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 95;
        
        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        })
    );
    this.rooms[0].add(stars);
    
    // Moon
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(3, 24, 24),
        new THREE.MeshBasicMaterial({
            color: 0xffffee,
            emissive: 0xffffee,
            emissiveIntensity: 0.5
        })
    );
    moon.position.set(40, 50, -30);
    this.rooms[0].add(moon);
    
  
    
    // Wind effect particles (leaves, debris)
    for (let i = 0; i < 20; i++) {
        const leaf = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, 0.15),
            new THREE.MeshStandardMaterial({
                color: 0x4a3a2a,
                roughness: 0.9,
                side: THREE.DoubleSide
            })
        );
        leaf.position.set(
            (Math.random() - 0.5) * 50,
            Math.random() * 3,
            (Math.random() - 0.5) * 70
        );
        leaf.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        this.rooms[0].add(leaf);
        
        this.windEffects.push({
            model: leaf,
            velocity: new THREE.Vector3(
                0.02 + Math.random() * 0.03,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.02
            ),
            rotationSpeed: new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05
            )
        });
    }
}

// ========================================
// CARNIVAL UI
// ========================================



// ========================================
// CARNIVAL ANIMATIONS (complete system)
// ========================================

updateCarnivalAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. FERRIS WHEEL ROTATION (slow, creaky)
    if (this.ferrisWheel && this.ferrisWheel.userData.wheel) {
        // Very slow rotation (1 revolution per ~2 minutes)
        this.ferrisWheelRotation += 0.0005;
        this.ferrisWheel.userData.wheel.rotation.z = this.ferrisWheelRotation;
        
        // Update car positions and keep them upright
        this.ferrisWheelCars.forEach((car, index) => {
            // Counter-rotate to keep cars level
            car.model.rotation.z = -this.ferrisWheelRotation;
            
            // Slight swinging motion
            car.swingPhase += 0.01;
            const swing = Math.sin(car.swingPhase) * 0.05;
            car.model.rotation.z += swing;
        });
        
        // Creaking sound indicator (visual)
        if (Math.random() < 0.003) {
            console.log("🎡 *CREAK* Ferris wheel groans...");
            
            // Create visual "creak" indicator
            const creakFlash = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffaa00,
                    transparent: true,
                    opacity: 0.5
                })
            );
            creakFlash.position.copy(this.ferrisWheel.position);
            creakFlash.position.y += 15;
            this.rooms[0].add(creakFlash);
            
            setTimeout(() => {
                this.rooms[0].remove(creakFlash);
            }, 200);
        }
    }
    
    // 2. CAROUSEL ROTATION (slow spin)
    if (this.carousel) {
        this.carouselRotation += 0.001;
        this.carousel.rotation.y = this.carouselRotation;
        
        // Horse bobbing up and down
        this.carouselHorses.forEach(horse => {
            horse.bobPhase += 0.02;
            const bob = Math.sin(horse.bobPhase) * 0.3;
            horse.model.position.y = horse.baseY + bob;
        });
        
        // Creaking sound
        if (Math.random() < 0.002) {
            console.log("🎠 *CREAK* Carousel squeaks...");
        }
    }
    
    // 3. STRING LIGHTS TWINKLING (some broken, some flickering)
    let workingLights = 0;
    
    this.stringLights.forEach((lightData, index) => {
        if (lightData.isBroken) {
            // Broken light is dark
            if (lightData.model.userData.bulb) {
                lightData.model.userData.bulb.material.emissiveIntensity = 0;
            }
            if (lightData.model.userData.light) {
                lightData.model.userData.light.intensity = 0;
            }
        } else {
            workingLights++;
            
            // Flickering effect
            lightData.flickerPhase += lightData.flickerSpeed * 0.016;
            
            const flicker = 0.6 + Math.sin(lightData.flickerPhase) * 0.3 + 
                           Math.sin(lightData.flickerPhase * 2.3) * 0.1;
            
            if (lightData.model.userData.bulb) {
                lightData.model.userData.bulb.material.emissiveIntensity = flicker;
            }
            if (lightData.model.userData.light) {
                lightData.model.userData.light.intensity = flicker * 0.5;
            }
            
            // Occasional complete flicker out
            if (Math.random() < 0.001) {
                if (lightData.model.userData.light) {
                    lightData.model.userData.light.intensity = 0;
                }
                setTimeout(() => {
                    if (lightData.model.userData.light) {
                        lightData.model.userData.light.intensity = 0.5;
                    }
                }, 100 + Math.random() * 300);
            }
        }
    });
    
    // Update UI
    const lightsUI = document.getElementById('lightsWorking');
    if (lightsUI) {
        lightsUI.textContent = workingLights;
    }
    
    // 4. FOG DRIFTING
    this.rooms[0].children.forEach(child => {
        if (child.userData.isFog) {
            const positions = child.geometry.attributes.position.array;
            const speeds = child.userData.driftSpeeds;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Drift
                positions[i * 3] += speeds[i].x;
                positions[i * 3 + 2] += speeds[i].z;
                
                // Wrap around
                if (Math.abs(positions[i * 3]) > 30) {
                    positions[i * 3] = (Math.random() - 0.5) * 60;
                }
                if (Math.abs(positions[i * 3 + 2]) > 40) {
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
                }
                
                // Subtle vertical drift
                positions[i * 3 + 1] += Math.sin(time + i) * 0.001;
                positions[i * 3 + 1] = Math.max(0, Math.min(2, positions[i * 3 + 1]));
            }
            
            child.geometry.attributes.position.needsUpdate = true;
        }
    });
    
    // 5. WIND EFFECTS (leaves blowing)
    this.windEffects.forEach(effect => {
        // Move with wind
        effect.model.position.add(effect.velocity);
        
        // Rotate
        effect.model.rotation.x += effect.rotationSpeed.x;
        effect.model.rotation.y += effect.rotationSpeed.y;
        effect.model.rotation.z += effect.rotationSpeed.z;
        
        // Wrap around
        if (effect.model.position.x > 30) {
            effect.model.position.x = -30;
        }
        if (effect.model.position.x < -30) {
            effect.model.position.x = 30;
        }
        if (Math.abs(effect.model.position.z) > 40) {
            effect.model.position.z = (Math.random() - 0.5) * 80;
        }
        
        // Keep at low height
        if (effect.model.position.y < 0) {
            effect.model.position.y = 3;
        }
        if (effect.model.position.y > 3) {
            effect.model.position.y = 0;
        }
    });
    
    // 6. MOONLIGHT INTENSITY VARIATION (clouds passing)
    if (this.moonlight) {
        const cloudCover = 0.4 + Math.sin(time * 0.1) * 0.1;
        this.moonlight.intensity = cloudCover;
    }
    
    // 7. GAME BOOTH ANIMATIONS
    // Shooting gallery ducks slightly swaying
    this.gameBooths.forEach(booth => {
        booth.children.forEach(child => {
            // Check if it might be a duck (small box-like object at certain height)
            if (child.type === 'Mesh' && 
                child.geometry.type === 'BoxGeometry' &&
                child.position.y > 1.3 && child.position.y < 1.9) {
                const sway = Math.sin(time * 2 + child.position.x) * 0.02;
                child.rotation.z = sway;
            }
        });
    });
    
    // 8. FUNHOUSE MIRROR DISTORTION (animate wavy mirrors)
    this.funhouseMirrors.forEach((mirrorData, index) => {
        if (mirrorData.type === 'wavy') {
            mirrorData.model.children.forEach(child => {
                if (child.geometry && child.geometry.attributes.position) {
                    const positions = child.geometry.attributes.position;
                    
                    for (let i = 0; i < positions.count; i++) {
                        const x = positions.getX(i);
                        const y = positions.getY(i);
                        const wave = Math.sin(y * 3 + time * 2) * 0.2;
                        positions.setZ(i, wave);
                    }
                    positions.needsUpdate = true;
                    child.geometry.computeVertexNormals();
                }
            });
        }
    });
    
    // 9. TRASH BINS RUSTLING (wind effect)
    this.trashBins.forEach((bin, index) => {
        const rustle = Math.sin(time * 3 + index) * 0.01;
        bin.rotation.y = rustle;
    });
    
    // 10. CARNIVAL ATMOSPHERE SOUNDS (visual indicators)
    if (Math.random() < 0.001) {
        const sounds = [
            "🎪 *Wind whistles through the booths*",
            "🎡 *Distant creaking of metal*",
            "🎠 *Carousel music box winds down*",
            "👻 *Something moves in the shadows*",
            "🌙 *An owl hoots in the distance*"
        ];
        console.log(sounds[Math.floor(Math.random() * sounds.length)]);
    }
    
    // 11. RANDOM LIGHT FAILURES
    if (Math.random() < 0.0005) {
        // Random light burns out
        const workingLights = this.stringLights.filter(l => !l.isBroken);
        if (workingLights.length > 20) {
            const randomLight = workingLights[Math.floor(Math.random() * workingLights.length)];
            randomLight.isBroken = true;
            console.log("💡 *POP* A light bulb burns out...");
        }
    }
    
    // 12. STATUS UPDATES
    const statusUI = document.getElementById('carnivalStatus');
    if (statusUI && Math.random() < 0.003) {
        const statuses = ['Abandoned', 'Eerie', 'Silent', 'Desolate', 'Haunted'];
        statusUI.textContent = statuses[Math.floor(Math.random() * statuses.length)];
    }
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Carnival midway bounds
        const minX = -28;
        const maxX = 28;
        const minZ = -38;
        const maxZ = 38;
        
        this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        
        // Don't walk through ferris wheel
        if (this.ferrisWheel) {
            const fwX = this.ferrisWheel.position.x;
            const fwZ = this.ferrisWheel.position.z;
            const fwRadius = 5;
            
            const distToFW = Math.sqrt(
                Math.pow(this.camera.position.x - fwX, 2) +
                Math.pow(this.camera.position.z - fwZ, 2)
            );
            
            if (distToFW < fwRadius) {
                const angle = Math.atan2(
                    this.camera.position.z - fwZ,
                    this.camera.position.x - fwX
                );
                this.camera.position.x = fwX + Math.cos(angle) * fwRadius;
                this.camera.position.z = fwZ + Math.sin(angle) * fwRadius;
            }
        }
        
        // Don't walk through carousel
        if (this.carousel) {
            const carX = this.carousel.position.x;
            const carZ = this.carousel.position.z;
            const carRadius = 9;
            
            const distToCar = Math.sqrt(
                Math.pow(this.camera.position.x - carX, 2) +
                Math.pow(this.camera.position.z - carZ, 2)
            );
            
            if (distToCar < carRadius) {
                const angle = Math.atan2(
                    this.camera.position.z - carZ,
                    this.camera.position.x - carX
                );
                this.camera.position.x = carX + Math.cos(angle) * carRadius;
                this.camera.position.z = carZ + Math.sin(angle) * carRadius;
            }
        }
        
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    // Spawn at carnival entrance (between ticket booths)
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
   
    this.updateCarnivalAnimations();      // ✓ ADD THIS LINE
   
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
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
    // ABANDONED OBSERVATORY SYSTEM
    // ========================================
    
    this.observatoryDome = null;
    this.telescope = null;
    this.starCharts = [];
    this.dustyEquipment = [];
    this.planetariumProjector = null;
    this.constellationMaps = [];
    this.meteorShower = [];
    this.nebulaeViews = [];
    this.astronomicalInstruments = [];
    this.telescopeTracking = { azimuth: 0, altitude: 45, targetStar: null };
    this.domeRotation = 0;
    this.artworkSpots = [];
    this.nightSky = null;
    
    this.createObservatory();
    this.createRotatingDome();
    this.createMainTelescope();
    this.createStarCharts();
    this.createAstronomicalInstruments();
    this.createPlanetariumProjector();
    this.createDustyEquipment();
    this.createNightSky();
    this.createMeteorShower();
    this.createConstellationDisplays();
    this.createObservatoryUI();
    
    console.log("🔭 Abandoned Observatory loaded!");
}

// ========================================
// OBSERVATORY (main structure)
// ========================================

createObservatory() {
    const observatoryRoom = new THREE.Group();
    observatoryRoom.visible = true;
    
    const roomRadius = 15;
    const wallHeight = 8;
    
    // ========================================
    // MATERIALS (aged, dusty)
    // ========================================
    
    this.stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a6a5a,
        roughness: 0.95,
        metalness: 0.05
    });
    
    this.metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.7,
        metalness: 0.8
    });
    
    this.brassMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a6a3a,
        roughness: 0.6,
        metalness: 0.7
    });
    
    this.woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a4a3a,
        roughness: 0.9,
        metalness: 0.05
    });
    
    // ========================================
    // CIRCULAR STONE WALLS
    // ========================================
    
    const wallSegments = 32;
    for (let i = 0; i < wallSegments; i++) {
        const angle = (i / wallSegments) * Math.PI * 2;
        const nextAngle = ((i + 1) / wallSegments) * Math.PI * 2;
        
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, wallHeight, 0.5),
            this.stoneMaterial
        );
        wall.position.set(
            Math.cos(angle) * roomRadius,
            wallHeight / 2,
            Math.sin(angle) * roomRadius
        );
        wall.rotation.y = angle + Math.PI / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        observatoryRoom.add(wall);
    }
    
    // Stone floor
    const floor = new THREE.Mesh(
        new THREE.CircleGeometry(roomRadius, 32),
        this.stoneMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    observatoryRoom.add(floor);
    
    // Worn floor texture
    for (let i = 0; i < 20; i++) {
        const patch = new THREE.Mesh(
            new THREE.CircleGeometry(0.5 + Math.random() * 0.5, 12),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x5a5a4a : 0x7a7a6a,
                roughness: 0.98
            })
        );
        patch.rotation.x = -Math.PI / 2;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (roomRadius - 1);
        patch.position.set(
            Math.cos(angle) * radius,
            0.01,
            Math.sin(angle) * radius
        );
        observatoryRoom.add(patch);
    }
    
    // ========================================
    // ATMOSPHERIC LIGHTING (night observatory)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0x2a2a4a, 0.3);
    observatoryRoom.add(ambientLight);
    
    // Dim work lights (abandoned but some still work)
    const workLights = [
        { angle: 0, color: 0x4466aa },
        { angle: Math.PI / 2, color: 0x6644aa },
        { angle: Math.PI, color: 0x4466aa },
        { angle: Math.PI * 1.5, color: 0x6644aa }
    ];
    
    workLights.forEach(config => {
        const light = new THREE.PointLight(config.color, 0.5, 8);
        light.position.set(
            Math.cos(config.angle) * (roomRadius - 1),
            wallHeight - 1,
            Math.sin(config.angle) * (roomRadius - 1)
        );
        observatoryRoom.add(light);
    });
    
    // Moonlight from dome opening
    this.moonlight = new THREE.DirectionalLight(0xaaccff, 0.4);
    this.moonlight.position.set(0, 20, 0);
    this.moonlight.castShadow = true;
    observatoryRoom.add(this.moonlight);
    
    observatoryRoom.position.set(0, 0, 0);
    this.rooms.push(observatoryRoom);
    this.scene.add(observatoryRoom);
}

// ========================================
// ROTATING DOME CEILING
// ========================================

createRotatingDome() {
    const domeGroup = new THREE.Group();
    
    const domeRadius = 15;
    const domeHeight = 10;
    
    // Main dome structure (hemisphere with opening)
    const domeGeometry = new THREE.SphereGeometry(
        domeRadius,
        32,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
    );
    
    const dome = new THREE.Mesh(
        domeGeometry,
        new THREE.MeshStandardMaterial({
            color: 0x3a4a3a,
            roughness: 0.8,
            metalness: 0.4,
            side: THREE.DoubleSide
        })
    );
    dome.position.y = 8;
    dome.castShadow = true;
    dome.receiveShadow = true;
    domeGroup.add(dome);
    
    // Dome ribs (structural)
    const ribCount = 16;
    for (let i = 0; i < ribCount; i++) {
        const angle = (i / ribCount) * Math.PI * 2;
        
        const rib = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, domeRadius),
            this.metalMaterial
        );
        rib.position.set(
            Math.cos(angle) * domeRadius / 2,
            8 + domeRadius / 2,
            Math.sin(angle) * domeRadius / 2
        );
        rib.rotation.set(
            0,
            angle,
            Math.PI / 4
        );
        domeGroup.add(rib);
    }
    
    // Dome slit (opening for telescope)
    const slitWidth = 2;
    const slitLength = domeRadius * 1.5;
    
    // Slit doors (two panels that slide apart)
    const slitDoorMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.7,
        metalness: 0.5
    });
    
    [-slitWidth/2 - 0.1, slitWidth/2 + 0.1].forEach((offset, index) => {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(slitWidth, 0.2, slitLength),
            slitDoorMaterial
        );
        door.position.set(offset, 8 + domeRadius * 0.8, 0);
        door.rotation.x = Math.PI / 8;
        domeGroup.add(door);
    });
    
    // Rails for dome rotation
    const rail = new THREE.Mesh(
        new THREE.TorusGeometry(domeRadius - 0.5, 0.2, 16, 32),
        this.metalMaterial
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 8;
    domeGroup.add(rail);
    
    // Wheels on rail (supports)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12),
            this.metalMaterial
        );
        wheel.position.set(
            Math.cos(angle) * (domeRadius - 0.5),
            8,
            Math.sin(angle) * (domeRadius - 0.5)
        );
        wheel.rotation.x = Math.PI / 2;
        domeGroup.add(wheel);
    }
    
    // Control wheel (manual dome rotation)
    const controlWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.08, 12, 24),
        this.brassMaterial
    );
    controlWheel.rotation.y = Math.PI / 2;
    controlWheel.position.set(13, 2, 0);
    domeGroup.add(controlWheel);
    
    // Spokes
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.5, 0.05),
            this.brassMaterial
        );
        spoke.position.set(
            13,
            2 + Math.cos(angle) * 0.5,
            Math.sin(angle) * 0.5
        );
        spoke.rotation.x = angle;
        domeGroup.add(spoke);
    }
    
    this.observatoryDome = domeGroup;
    this.rooms[0].add(domeGroup);
}

// ========================================
// MAIN TELESCOPE (large refractor)
// ========================================

createMainTelescope() {
    const telescopeGroup = new THREE.Group();
    
    // Pier/mount base
    const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.5, 3, 16),
        this.stoneMaterial
    );
    pier.position.y = 1.5;
    pier.castShadow = true;
    telescopeGroup.add(pier);
    
    // Equatorial mount
    const mountBase = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 2),
        this.brassMaterial
    );
    mountBase.position.y = 3.2;
    mountBase.castShadow = true;
    telescopeGroup.add(mountBase);
    
    // Polar axis
    const polarAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 3, 12),
        this.brassMaterial
    );
    polarAxis.rotation.x = Math.PI / 4;
    polarAxis.position.set(0, 4, -1);
    telescopeGroup.add(polarAxis);
    
    // Declination axis
    const decAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 2, 12),
        this.brassMaterial
    );
    decAxis.rotation.z = Math.PI / 2;
    decAxis.position.set(0, 5, -1.5);
    telescopeGroup.add(decAxis);
    
    // Telescope tube (main body)
    const tubeLength = 6;
    const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, tubeLength, 24),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.5
        })
    );
    tube.rotation.z = Math.PI / 2;
    tube.position.set(-tubeLength/2, 5, -1.5);
    tube.castShadow = true;
    telescopeGroup.add(tube);
    
    // Brass bands on tube
    for (let i = 0; i < 5; i++) {
        const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.42, 0.04, 12, 24),
            this.brassMaterial
        );
        band.rotation.y = Math.PI / 2;
        band.position.set(-tubeLength/2 + i * 1.5, 5, -1.5);
        telescopeGroup.add(band);
    }
    
    // Objective lens (front)
    const objective = new THREE.Mesh(
        new THREE.CircleGeometry(0.38, 24),
        new THREE.MeshPhysicalMaterial({
            color: 0x88aaff,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.8,
            thickness: 0.5
        })
    );
    objective.position.set(-tubeLength - 0.5, 5, -1.5);
    objective.rotation.y = Math.PI / 2;
    telescopeGroup.add(objective);
    
    // Lens hood
    const hood = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.4, 0.3, 24),
        this.metalMaterial
    );
    hood.rotation.z = Math.PI / 2;
    hood.position.set(-tubeLength - 0.3, 5, -1.5);
    telescopeGroup.add(hood);
    
    // Eyepiece end
    const eyepieceHolder = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        this.brassMaterial
    );
    eyepieceHolder.position.set(tubeLength/2 + 0.3, 5, -1.5);
    telescopeGroup.add(eyepieceHolder);
    
    // Eyepiece
    const eyepiece = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 0.4, 12),
        this.metalMaterial
    );
    eyepiece.position.set(tubeLength/2 + 0.3, 5.4, -1.5);
    telescopeGroup.add(eyepiece);
    
    // Finder scope (small guide telescope)
    const finder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.5, 12),
        this.metalMaterial
    );
    finder.rotation.z = Math.PI / 2;
    finder.position.set(-1, 5.4, -1.5);
    telescopeGroup.add(finder);
    
    // Counterweight shaft
    const cwShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 2, 8),
        this.metalMaterial
    );
    cwShaft.rotation.z = Math.PI / 2;
    cwShaft.position.set(1.5, 5, -1.5);
    telescopeGroup.add(cwShaft);
    
    // Counterweight
    const counterweight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12),
        this.metalMaterial
    );
    counterweight.rotation.z = Math.PI / 2;
    counterweight.position.set(2.5, 5, -1.5);
    counterweight.castShadow = true;
    telescopeGroup.add(counterweight);
    
    // Focusing knobs
    for (let i = 0; i < 2; i++) {
        const knob = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12),
            this.brassMaterial
        );
        knob.rotation.z = Math.PI / 2;
        knob.position.set(
            tubeLength/2,
            5 + (i === 0 ? 0.3 : -0.3),
            -1.5
        );
        telescopeGroup.add(knob);
    }
    
    // Store tube for animation
    tube.userData.isTelescope = true;
    telescopeGroup.userData.mainTube = tube;
    
    this.telescope = telescopeGroup;
    this.rooms[0].add(telescopeGroup);
}

// ========================================
// STAR CHARTS (on walls)
// ========================================

createStarCharts() {
    const chartPositions = [
        { angle: 0, title: 'NORTHERN SKY' },
        { angle: Math.PI / 2, title: 'SPRING CONSTELLATIONS' },
        { angle: Math.PI, title: 'SOUTHERN SKY' },
        { angle: Math.PI * 1.5, title: 'AUTUMN STARS' }
    ];
    
    chartPositions.forEach(config => {
        const chart = this.createStarChart(config.title);
        chart.position.set(
            Math.cos(config.angle) * 14.5,
            4,
            Math.sin(config.angle) * 14.5
        );
        chart.rotation.y = config.angle + Math.PI;
        this.rooms[0].add(chart);
        this.starCharts.push(chart);
    });
    
    // Celestial sphere model (decorative)
    const celestialSphere = this.createCelestialSphere();
    celestialSphere.position.set(-10, 1, 8);
    this.rooms[0].add(celestialSphere);
    this.starCharts.push(celestialSphere);
}

createStarChart(title) {
    const group = new THREE.Group();
    
    // Wooden frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.1),
        this.woodMaterial
    );
    frame.castShadow = true;
    group.add(frame);
    
    // Chart canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 684;
    const ctx = canvas.getContext('2d');
    
    // Aged paper background
    ctx.fillStyle = '#e8dcb8';
    ctx.fillRect(0, 0, 512, 684);
    
    // Title
    ctx.fillStyle = '#2a2a2a';
    ctx.font = 'bold 32px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 50);
    
    // Draw star field
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 512;
        const y = 80 + Math.random() * 550;
        const size = Math.random() * 3 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw constellation lines
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const startX = Math.random() * 512;
        const startY = 100 + Math.random() * 500;
        ctx.moveTo(startX, startY);
        
        for (let j = 0; j < 3; j++) {
            const endX = startX + (Math.random() - 0.5) * 100;
            const endY = startY + (Math.random() - 0.5) * 100;
            ctx.lineTo(endX, endY);
        }
        ctx.stroke();
    }
    
    // Border
    ctx.strokeStyle = '#8a7a6a';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 664);
    
    const texture = new THREE.CanvasTexture(canvas);
    const chartSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 3.9),
        new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9
        })
    );
    chartSurface.position.z = 0.06;
    group.add(chartSurface);
    
    // Dust on glass
    const dustLayer = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 3.9),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            roughness: 1.0
        })
    );
    dustLayer.position.z = 0.07;
    group.add(dustLayer);
    
    return group;
}

createCelestialSphere() {
    const group = new THREE.Group();
    
    // Wooden base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16),
        this.woodMaterial
    );
    base.position.y = 0.1;
    group.add(base);
    
    // Sphere (wire frame showing constellations)
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x8a7a5a,
            roughness: 0.7,
            metalness: 0.3,
            wireframe: false
        })
    );
    sphere.position.y = 0.8;
    group.add(sphere);
    
    // Constellation lines on sphere
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        linewidth: 2
    });
    
    // Create random constellation pattern
    for (let i = 0; i < 8; i++) {
        const points = [];
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        for (let j = 0; j < 4; j++) {
            const offset = (Math.random() - 0.5) * 0.5;
            points.push(new THREE.Vector3(
                Math.sin(phi + offset) * Math.cos(theta + offset) * 0.52,
                Math.cos(phi + offset) * 0.52,
                Math.sin(phi + offset) * Math.sin(theta + offset) * 0.52
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, linesMaterial);
        line.position.y = 0.8;
        group.add(line);
    }
    
    // Meridian ring
    const meridian = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.02, 8, 32),
        this.brassMaterial
    );
    meridian.rotation.x = Math.PI / 2;
    meridian.position.y = 0.8;
    group.add(meridian);
    
    // Horizon ring
    const horizon = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.02, 8, 32),
        this.brassMaterial
    );
    horizon.position.y = 0.8;
    group.add(horizon);
    
    return group;
}

// ========================================
// ASTRONOMICAL INSTRUMENTS (vintage tools)
// ========================================

createAstronomicalInstruments() {
    // Desk with instruments
    const desk = this.createAstronomersDesk();
    desk.position.set(10, 0, 0);
    this.rooms[0].add(desk);
    this.astronomicalInstruments.push(desk);
    
    // Sextant
    const sextant = this.createSextant();
    sextant.position.set(10, 1, -0.3);
    this.rooms[0].add(sextant);
    
    // Orrery (mechanical solar system model)
    const orrery = this.createOrrery();
    orrery.position.set(10, 1.1, 0.4);
    this.rooms[0].add(orrery);
    this.astronomicalInstruments.push(orrery);
    
    // Bookshelf with astronomy books
    const bookshelf = this.createBookshelf();
    bookshelf.position.set(-12, 0, -8);
    bookshelf.rotation.y = Math.PI / 4;
    this.rooms[0].add(bookshelf);
    
    // Old telescope (smaller, on tripod)
    const smallTelescope = this.createSmallTelescope();
    smallTelescope.position.set(8, 0, -10);
    this.rooms[0].add(smallTelescope);
}

createAstronomersDesk() {
    const group = new THREE.Group();
    
    // Desktop
    const desktop = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 1.5),
        this.woodMaterial
    );
    desktop.position.y = 0.9;
    desktop.castShadow = true;
    group.add(desktop);
    
    // Legs
    const legPositions = [
        [-1.1, -0.7], [1.1, -0.7],
        [-1.1, 0.7], [1.1, 0.7]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.06, 0.9, 8),
            this.woodMaterial
        );
        leg.position.set(pos[0], 0.45, pos[1]);
        group.add(leg);
    });
    
    // Drawers
    for (let i = 0; i < 2; i++) {
        const drawer = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.2, 1.2),
            this.woodMaterial
        );
        drawer.position.set(-0.7, 0.3 + i * 0.25, 0);
        group.add(drawer);
        
        // Knob
        const knob = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            this.brassMaterial
        );
        knob.position.set(-0.7, 0.3 + i * 0.25, 0.61);
        group.add(knob);
    }
    
    // Papers scattered on desk
    for (let i = 0; i < 5; i++) {
        const paper = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.4),
            new THREE.MeshStandardMaterial({
                color: 0xf5f5e8,
                roughness: 0.95
            })
        );
        paper.rotation.x = -Math.PI / 2;
        paper.rotation.z = (Math.random() - 0.5) * 0.5;
        paper.position.set(
            (Math.random() - 0.5) * 2,
            0.96,
            (Math.random() - 0.5) * 1.2
        );
        group.add(paper);
    }
    
    // Oil lamp
    const lamp = this.createOilLamp();
    lamp.position.set(0.8, 1, 0.5);
    group.add(lamp);
    
    return group;
}

createOilLamp() {
    const group = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.05, 16),
        this.brassMaterial
    );
    group.add(base);
    
    // Body
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        this.brassMaterial
    );
    body.scale.set(1, 0.8, 1);
    body.position.y = 0.08;
    group.add(body);
    
    // Chimney (glass)
    const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12),
        new THREE.MeshPhysicalMaterial({
            color: 0xffffee,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            transmission: 0.9
        })
    );
    chimney.position.y = 0.25;
    group.add(chimney);
    
    // Flame (dim light)
    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffaa44,
            emissive: 0xffaa44,
            emissiveIntensity: 1.0
        })
    );
    flame.scale.set(1, 1.5, 1);
    flame.position.y = 0.25;
    group.add(flame);
    
    // Point light
    const light = new THREE.PointLight(0xffaa44, 0.5, 3);
    light.position.y = 0.25;
    group.add(light);
    
    group.userData.flame = flame;
    
    return group;
}

createSextant() {
    const group = new THREE.Group();
    
    // Arc frame
    const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.02, 8, 16, Math.PI / 3),
        this.brassMaterial
    );
    arc.rotation.x = Math.PI / 2;
    group.add(arc);
    
    // Radius arms
    for (let i = 0; i < 2; i++) {
        const angle = i * Math.PI / 3;
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.18, 0.02),
            this.brassMaterial
        );
        arm.position.set(
            Math.cos(angle) * 0.09,
            0,
            Math.sin(angle) * 0.09
        );
        arm.rotation.y = -angle;
        group.add(arm);
    }
    
    // Index arm (movable)
    const indexArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.2, 0.015),
        this.brassMaterial
    );
    indexArm.position.y = 0.1;
    indexArm.rotation.z = Math.PI / 6;
    group.add(indexArm);
    
    // Mirrors
    const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.06, 0.01),
        new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.1,
            metalness: 1.0
        })
    );
    mirror.position.y = 0.15;
    group.add(mirror);
    
    group.scale.set(1.5, 1.5, 1.5);
    return group;
}

createOrrery() {
    const group = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16),
        this.woodMaterial
    );
    group.add(base);
    
    // Central sun
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.8
        })
    );
    sun.position.y = 0.15;
    group.add(sun);
    
    // Planets on arms (simplified - 3 planets)
    const planets = [
        { radius: 0.2, size: 0.03, color: 0x8899aa },
        { radius: 0.35, size: 0.04, color: 0xaa6644 },
        { radius: 0.5, size: 0.035, color: 0x6688aa }
    ];
    
    planets.forEach((planet, index) => {
        // Orbital arm
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, planet.radius, 6),
            this.brassMaterial
        );
        arm.rotation.z = Math.PI / 2;
        arm.position.set(planet.radius / 2, 0.15, 0);
        arm.rotation.y = (index / planets.length) * Math.PI * 2;
        group.add(arm);
        
        // Planet sphere
        const planetSphere = new THREE.Mesh(
            new THREE.SphereGeometry(planet.size, 12, 12),
            new THREE.MeshStandardMaterial({
                color: planet.color,
                roughness: 0.7
            })
        );
        planetSphere.position.set(planet.radius, 0.15, 0);
        planetSphere.rotation.y = (index / planets.length) * Math.PI * 2;
        group.add(planetSphere);
        
        planetSphere.userData.isPlanet = true;
        planetSphere.userData.orbitRadius = planet.radius;
        planetSphere.userData.orbitSpeed = 0.002 / (index + 1);
        planetSphere.userData.orbitAngle = (index / planets.length) * Math.PI * 2;
    });
    
    group.userData.hasOrrery = true;
    
    return group;
}

createBookshelf() {
    const group = new THREE.Group();
    
    // Frame
    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.5),
        this.woodMaterial
    );
    shelf.castShadow = true;
    group.add(shelf);
    
    // Shelves (3 levels)
    for (let i = 0; i < 4; i++) {
        const shelfBoard = new THREE.Mesh(
            new THREE.BoxGeometry(2.9, 0.05, 0.45),
            this.woodMaterial
        );
        shelfBoard.position.y = -1.8 + i * 1.2;
        group.add(shelfBoard);
        
        // Books on shelf
        if (i < 3) {
            for (let j = 0; j < 8; j++) {
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15 + Math.random() * 0.1, 0.9, 0.3),
                    new THREE.MeshStandardMaterial({
                        color: Math.random() * 0xffffff,
                        roughness: 0.9
                    })
                );
                book.position.set(
                    -1.3 + j * 0.35,
                    -1.35 + i * 1.2,
                    0
                );
                book.rotation.y = (Math.random() - 0.5) * 0.2;
                group.add(book);
            }
        }
    }
    
    group.position.y = 2;
    return group;
}

createSmallTelescope() {
    const group = new THREE.Group();
    
    // Tripod legs
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.05, 1.5, 6),
            this.woodMaterial
        );
        leg.position.set(
            Math.cos(angle) * 0.4,
            0.75,
            Math.sin(angle) * 0.4
        );
        leg.rotation.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
        );
        group.add(leg);
    }
    
    // Telescope tube (small brass telescope)
    const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 1.2, 12),
        this.brassMaterial
    );
    tube.rotation.z = Math.PI / 2;
    tube.rotation.y = Math.PI / 6;
    tube.position.set(-0.5, 1.5, 0);
    group.add(tube);
    
    return group;
}


// ========================================
// PLANETARIUM PROJECTOR (Zeiss-style)
// ========================================

createPlanetariumProjector() {
    const projectorGroup = new THREE.Group();
    
    // Base platform
    const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1.2, 0.3, 16),
        this.metalMaterial
    );
    platform.position.y = 0.15;
    platform.castShadow = true;
    projectorGroup.add(platform);
    
    // Central column
    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 2, 12),
        this.metalMaterial
    );
    column.position.y = 1.3;
    projectorGroup.add(column);
    
    // Main sphere (star ball)
    const starBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 24, 24),
        this.metalMaterial
    );
    starBall.position.y = 2.5;
    starBall.castShadow = true;
    projectorGroup.add(starBall);
    
    // Projection lenses around sphere
    const lensCount = 12;
    for (let i = 0; i < lensCount; i++) {
        const theta = (i / lensCount) * Math.PI * 2;
        const phi = Math.PI / 3;
        
        const lens = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.15, 12),
            this.brassMaterial
        );
        lens.position.set(
            Math.sin(phi) * Math.cos(theta) * 0.85,
            2.5 + Math.cos(phi) * 0.85,
            Math.sin(phi) * Math.sin(theta) * 0.85
        );
        lens.lookAt(0, 2.5, 0);
        projectorGroup.add(lens);
        
        // Light rays (for visual effect)
        const light = new THREE.SpotLight(0x8899ff, 0.3, 20, Math.PI / 6, 0.8);
        light.position.set(
            Math.sin(phi) * Math.cos(theta) * 0.85,
            2.5 + Math.cos(phi) * 0.85,
            Math.sin(phi) * Math.sin(theta) * 0.85
        );
        light.target.position.set(
            Math.sin(phi) * Math.cos(theta) * 20,
            2.5 + Math.cos(phi) * 20,
            Math.sin(phi) * Math.sin(theta) * 20
        );
        projectorGroup.add(light);
        projectorGroup.add(light.target);
        
        light.userData.isProjectorLight = true;
    }
    
    // Secondary projectors (planetary projectors)
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.8),
            this.brassMaterial
        );
        arm.position.set(
            Math.cos(angle) * 0.4,
            2.5,
            Math.sin(angle) * 0.4
        );
        arm.rotation.y = angle;
        projectorGroup.add(arm);
        
        // Small projector head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 12),
            this.brassMaterial
        );
        head.position.set(
            Math.cos(angle) * 0.8,
            2.5,
            Math.sin(angle) * 0.8
        );
        projectorGroup.add(head);
    }
    
    // Control panel on base
    const controlPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6,
            metalness: 0.7
        })
    );
    controlPanel.position.set(0, 0.5, 1);
    controlPanel.rotation.x = -0.3;
    projectorGroup.add(controlPanel);
    
    // Buttons on control panel
    for (let i = 0; i < 6; i++) {
        const button = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8),
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0xff4444 : 0x44ff44,
                emissive: Math.random() > 0.5 ? 0xff4444 : 0x44ff44,
                emissiveIntensity: 0.3
            })
        );
        button.position.set(
            -0.2 + (i % 3) * 0.2,
            0.5 + Math.floor(i / 3) * 0.15,
            1.06
        );
        button.rotation.x = -0.3;
        projectorGroup.add(button);
    }
    
    projectorGroup.position.set(0, 0, 0);
    projectorGroup.userData.starBall = starBall;
    
    this.planetariumProjector = projectorGroup;
    this.rooms[0].add(projectorGroup);
}

// ========================================
// DUSTY EQUIPMENT (abandoned items)
// ========================================

createDustyEquipment() {
    // Old chairs
    for (let i = 0; i < 4; i++) {
        const chair = this.createOldChair();
        const angle = (i / 4) * Math.PI * 2;
        chair.position.set(
            Math.cos(angle) * 12,
            0,
            Math.sin(angle) * 12
        );
        chair.rotation.y = angle + Math.PI;
        this.rooms[0].add(chair);
        this.dustyEquipment.push(chair);
    }
    
    // Broken equipment boxes
    for (let i = 0; i < 3; i++) {
        const box = this.createEquipmentBox();
        box.position.set(
            -13 + i * 2,
            0,
            -11
        );
        this.rooms[0].add(box);
        this.dustyEquipment.push(box);
    }
    
    // Old photographic plates (glass plates for capturing images)
    const plateRack = this.createPlateRack();
    plateRack.position.set(11, 0, -8);
    this.rooms[0].add(plateRack);
    
    // Broken clock (stopped at specific time)
    const clock = this.createBrokenClock();
    clock.position.set(0, 6, -14.8);
    this.rooms[0].add(clock);
    
    // Cobwebs in corners
    for (let i = 0; i < 8; i++) {
        const web = this.createCobweb();
        const angle = (i / 8) * Math.PI * 2;
        web.position.set(
            Math.cos(angle) * 14.5,
            6 + Math.random() * 1,
            Math.sin(angle) * 14.5
        );
        this.rooms[0].add(web);
    }
    
    // Dust particles in air
    this.createDustParticles();
}

createOldChair() {
    const group = new THREE.Group();
    
    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.05, 0.5),
        this.woodMaterial
    );
    seat.position.y = 0.5;
    group.add(seat);
    
    // Backrest
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.6, 0.05),
        this.woodMaterial
    );
    back.position.set(0, 0.8, -0.22);
    group.add(back);
    
    // Legs
    const legPositions = [
        [-0.2, -0.2], [0.2, -0.2],
        [-0.2, 0.2], [0.2, 0.2]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.03, 0.5, 8),
            this.woodMaterial
        );
        leg.position.set(pos[0], 0.25, pos[1]);
        group.add(leg);
    });
    
    // Dust layer
    const dust = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.01, 0.52),
        new THREE.MeshStandardMaterial({
            color: 0xc8c8b8,
            roughness: 1.0,
            transparent: true,
            opacity: 0.7
        })
    );
    dust.position.y = 0.53;
    group.add(dust);
    
    return group;
}

createEquipmentBox() {
    const group = new THREE.Group();
    
    // Wooden crate
    const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.6),
        this.woodMaterial
    );
    crate.position.y = 0.3;
    crate.rotation.y = (Math.random() - 0.5) * 0.5;
    crate.castShadow = true;
    group.add(crate);
    
    // "FRAGILE" stencil
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8a4a2a';
    ctx.font = 'bold 60px stencil';
    ctx.textAlign = 'center';
    ctx.fillText('FRAGILE', 128, 130);
    
    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.6),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        })
    );
    label.position.set(0, 0.3, 0.31);
    group.add(label);
    
    // Dust
    const dust = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.02, 0.62),
        new THREE.MeshStandardMaterial({
            color: 0xc8c8b8,
            roughness: 1.0
        })
    );
    dust.position.y = 0.61;
    group.add(dust);
    
    return group;
}

createPlateRack() {
    const group = new THREE.Group();
    
    // Rack frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 0.3),
        this.woodMaterial
    );
    frame.position.y = 0.75;
    group.add(frame);
    
    // Glass plates (old photographic plates)
    for (let i = 0; i < 10; i++) {
        const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(0.15, 0.2),
            new THREE.MeshPhysicalMaterial({
                color: 0x888888,
                roughness: 0.2,
                metalness: 0.1,
                transparent: true,
                opacity: 0.8
            })
        );
        plate.position.set(
            -0.4 + (i % 5) * 0.2,
            0.3 + Math.floor(i / 5) * 0.7,
            0.16
        );
        group.add(plate);
    }
    
    return group;
}

createBrokenClock() {
    const group = new THREE.Group();
    
    // Clock face
    const face = new THREE.Mesh(
        new THREE.CircleGeometry(0.4, 32),
        new THREE.MeshStandardMaterial({
            color: 0xf5f5e8,
            roughness: 0.9
        })
    );
    group.add(face);
    
    // Frame
    const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.05, 12, 32),
        this.woodMaterial
    );
    frame.rotation.x = Math.PI / 2;
    group.add(frame);
    
    // Hour markers
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const marker = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.06, 0.01),
            new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
        );
        marker.position.set(
            Math.cos(angle) * 0.35,
            Math.sin(angle) * 0.35,
            0.01
        );
        marker.rotation.z = angle + Math.PI / 2;
        group.add(marker);
    }
    
    // Hands (stopped at 11:47)
    const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.2, 0.01),
        this.metalMaterial
    );
    hourHand.position.set(0, 0.1, 0.02);
    hourHand.rotation.z = -(11/12) * Math.PI * 2 + Math.PI / 2;
    group.add(hourHand);
    
    const minuteHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.3, 0.01),
        this.metalMaterial
    );
    minuteHand.position.set(0, 0.15, 0.03);
    minuteHand.rotation.z = -(47/60) * Math.PI * 2 + Math.PI / 2;
    group.add(minuteHand);
    
    // Cracked glass
    const crack = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.01),
        new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.5
        })
    );
    crack.position.z = 0.04;
    crack.rotation.z = Math.PI / 4;
    group.add(crack);
    
    return group;
}

createCobweb() {
    const group = new THREE.Group();
    
    const webMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.3,
        roughness: 0.9,
        side: THREE.DoubleSide
    });
    
    // Radial strands
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const strand = new THREE.Mesh(
            new THREE.PlaneGeometry(0.01, 0.5),
            webMaterial
        );
        strand.position.set(
            Math.cos(angle) * 0.25,
            -0.25,
            Math.sin(angle) * 0.25
        );
        strand.rotation.z = angle + Math.PI / 2;
        strand.rotation.y = angle;
        group.add(strand);
    }
    
    // Spiral strands
    for (let ring = 0; ring < 3; ring++) {
        const points = [];
        const radius = 0.15 + ring * 0.15;
        for (let i = 0; i <= 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                -ring * 0.1,
                Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.3
        }));
        group.add(line);
    }
    
    group.scale.set(0.5, 0.5, 0.5);
    return group;
}

createDustParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 13;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.random() * 8;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        
        velocities.push({
            y: 0.001 + Math.random() * 0.002,
            drift: (Math.random() - 0.5) * 0.01
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xccccbb,
        size: 0.05,
        transparent: true,
        opacity: 0.4
    });
    
    const particles = new THREE.Points(geometry, material);
    this.rooms[0].add(particles);
    
    particles.userData.isDust = true;
    particles.userData.velocities = velocities;
}

// ========================================
// NIGHT SKY (starfield outside dome)
// ========================================

createNightSky() {
    // Outer sphere for night sky
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0a1a,
        side: THREE.BackSide
    });
    this.nightSky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.rooms[0].add(this.nightSky);
    
    // Stars (point cloud)
    const starCount = 1000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Distribute stars on sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 95;
        
        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Star colors (most white, some blue, some yellow)
        const colorType = Math.random();
        if (colorType < 0.7) {
            // White
            starColors[i * 3] = 1;
            starColors[i * 3 + 1] = 1;
            starColors[i * 3 + 2] = 1;
        } else if (colorType < 0.85) {
            // Blue
            starColors[i * 3] = 0.7;
            starColors[i * 3 + 1] = 0.8;
            starColors[i * 3 + 2] = 1;
        } else {
            // Yellow
            starColors[i * 3] = 1;
            starColors[i * 3 + 1] = 0.9;
            starColors[i * 3 + 2] = 0.7;
        }
        
        // Variable sizes (brighter stars are larger)
        starSizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: false
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.rooms[0].add(stars);
    
    // Milky Way band (subtle glow)
    const milkyWayGeometry = new THREE.PlaneGeometry(200, 40);
    const milkyWay = new THREE.Mesh(
        milkyWayGeometry,
        new THREE.MeshBasicMaterial({
            color: 0x3a3a5a,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        })
    );
    milkyWay.position.set(0, 50, 0);
    milkyWay.rotation.x = Math.PI / 3;
    this.rooms[0].add(milkyWay);
}

// ========================================
// METEOR SHOWER (animated)
// ========================================

createMeteorShower() {
    // Create 20 meteors that streak across the sky
    for (let i = 0; i < 20; i++) {
        const meteor = this.createMeteor();
        
        // Random starting position outside dome
        const angle = Math.random() * Math.PI * 2;
        meteor.position.set(
            Math.cos(angle) * 80,
            60 + Math.random() * 30,
            Math.sin(angle) * 80
        );
        
        this.rooms[0].add(meteor);
        
        this.meteorShower.push({
            model: meteor,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                -(0.8 + Math.random() * 0.4),
                (Math.random() - 0.5) * 0.5
            ),
            resetTimer: Math.random() * 10,
            trailParticles: []
        });
    }
}

createMeteor() {
    const group = new THREE.Group();
    
    // Meteor head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            emissive: 0xffffaa,
            emissiveIntensity: 1.0
        })
    );
    group.add(head);
    
    // Trail (glowing line)
    const trailLength = 3;
    const trailPoints = [];
    for (let i = 0; i < 10; i++) {
        trailPoints.push(new THREE.Vector3(0, i * trailLength / 10, 0));
    }
    
    const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trail = new THREE.Line(
        trailGeometry,
        new THREE.LineBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.6
        })
    );
    group.add(trail);
    
    group.scale.set(0.5, 0.5, 0.5);
    return group;
}

// ========================================
// CONSTELLATION DISPLAYS (artwork spots)
// ========================================

createConstellationDisplays() {
    // Constellation map displays (for artworks)
    const displays = [
        { angle: Math.PI / 6, name: 'Orion' },
        { angle: Math.PI * 5 / 6, name: 'Ursa Major' },
        { angle: Math.PI * 9 / 6, name: 'Cassiopeia' },
        { angle: Math.PI * 13 / 6, name: 'Andromeda' }
    ];
    
    displays.forEach(config => {
        const display = this.createConstellationDisplay(config.name);
        display.position.set(
            Math.cos(config.angle) * 14.5,
            3,
            Math.sin(config.angle) * 14.5
        );
        display.rotation.y = config.angle + Math.PI;
        this.rooms[0].add(display);
        this.constellationMaps.push(display);
        
        // Add artwork spot
        this.artworkSpots.push({
            x: Math.cos(config.angle) * 14.5,
            y: 3,
            z: Math.sin(config.angle) * 14.5,
            rot: config.angle + Math.PI,
            constellation: config.name
        });
    });
    
    // Telescope eyepiece view (special artwork spot - nebula view)
    this.createTelescopeView();
}

createConstellationDisplay(name) {
    const group = new THREE.Group();
    
    // Backlit display case
    const case1 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2.5, 0.2),
        this.woodMaterial
    );
    case1.castShadow = true;
    group.add(case1);
    
    // Glass front
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 2.4),
        new THREE.MeshPhysicalMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.1,
            roughness: 0.1,
            metalness: 0.1
        })
    );
    glass.position.z = 0.11;
    group.add(glass);
    
    // Back light (makes it glow)
    const backLight = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 2.3),
        new THREE.MeshBasicMaterial({
            color: 0x2a3a5a,
            emissive: 0x2a3a5a,
            emissiveIntensity: 0.3
        })
    );
    backLight.position.z = -0.09;
    group.add(backLight);
    
    // Constellation name plate
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#f5f5e8';
    ctx.font = 'italic 32px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 42);
    
    const texture = new THREE.CanvasTexture(canvas);
    const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.25),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    plate.position.set(0, -1.4, 0.11);
    group.add(plate);
    
    return group;
}

createTelescopeView() {
    // Create a "through the telescope" view showing nebula
    // This will be a special artwork display location
    
    const viewScreen = new THREE.Group();
    
    // Monitor/screen near telescope
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            emissive: 0x2a2a4a,
            emissiveIntensity: 0.5
        })
    );
    screen.position.set(5, 1.5, 2);
    screen.rotation.y = -Math.PI / 4;
    this.rooms[0].add(screen);
    
    // Screen frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.6, 0.1),
        this.metalMaterial
    );
    frame.position.set(5, 1.5, 2);
    frame.rotation.y = -Math.PI / 4;
    this.rooms[0].add(frame);
    
    // "TELESCOPE VIEW" label
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.2),
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        })
    );
    label.position.set(5, 2.3, 2);
    label.rotation.y = -Math.PI / 4;
    
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 64);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TELESCOPE VIEW', 256, 42);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    label.material.map = labelTexture;
    this.rooms[0].add(label);
    
    // Add artwork spot for nebula image
    this.artworkSpots.push({
        x: 5,
        y: 1.5,
        z: 2,
        rot: -Math.PI / 4,
        telescope: true,
        nebula: true
    });
    
    this.nebulaeViews.push(screen);
}

// ========================================
// OBSERVATORY UI
// ========================================

createObservatoryUI() {
    const observatoryUI = document.createElement('div');
    observatoryUI.id = 'observatoryUI';
    observatoryUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(26, 26, 58, 0.95) 0%, rgba(42, 42, 74, 0.95) 100%);
        color: #88aaff;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        z-index: 100;
        border: 3px solid #4466aa;
        box-shadow: 0 0 30px rgba(68, 102, 170, 0.5), 
                    inset 0 0 20px rgba(136, 170, 255, 0.2);
        text-shadow: 0 0 10px rgba(136, 170, 255, 0.6);
        font-weight: bold;
    `;
    
    observatoryUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">🔭</span>
            <div>
                <div style="font-size: 20px; letter-spacing: 3px;">
                    ABANDONED OBSERVATORY
                </div>
                <div style="font-size: 11px; opacity: 0.9; font-style: normal; letter-spacing: 1px;">
                    <span id="telescopeStatus">Tracking</span> • Alt: <span id="altitude">45°</span> • Az: <span id="azimuth">0°</span> • <span id="meteorCount">0</span> meteors
                </div>
            </div>
            <span style="font-size: 28px;">⭐</span>
        </div>
    `;
    
    document.body.appendChild(observatoryUI);
}

// Continue to Part 3...
// ========================================
// OBSERVATORY ANIMATIONS (complete system)
// ========================================

updateObservatoryAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. DOME ROTATION (slow, continuous)
    if (this.observatoryDome) {
        this.domeRotation += 0.0002;
        this.observatoryDome.rotation.y = this.domeRotation;
    }
    
    // 2. TELESCOPE TRACKING (follows celestial objects)
    if (this.telescope) {
        // Slowly track across the sky
        this.telescopeTracking.azimuth += 0.0003;
        this.telescopeTracking.altitude = 45 + Math.sin(time * 0.05) * 10;
        
        // Update telescope orientation
        const tube = this.telescope.userData.mainTube;
        if (tube) {
            tube.rotation.y = this.telescopeTracking.azimuth;
            tube.rotation.z = (this.telescopeTracking.altitude / 180) * Math.PI;
        }
        
        // Update UI
        const altitudeUI = document.getElementById('altitude');
        const azimuthUI = document.getElementById('azimuth');
        if (altitudeUI) {
            altitudeUI.textContent = this.telescopeTracking.altitude.toFixed(1) + '°';
        }
        if (azimuthUI) {
            azimuthUI.textContent = ((this.telescopeTracking.azimuth * 180 / Math.PI) % 360).toFixed(0) + '°';
        }
    }
    
    // 3. METEOR SHOWER (streaking across sky)
    let activeMeteors = 0;
    this.meteorShower.forEach((meteor, index) => {
        // Move meteor
        meteor.model.position.add(meteor.velocity);
        
        // Point meteor in direction of travel
        const direction = meteor.velocity.clone().normalize();
        meteor.model.lookAt(
            meteor.model.position.x + direction.x,
            meteor.model.position.y + direction.y,
            meteor.model.position.z + direction.z
        );
        
        // Check if meteor has fallen too far
        if (meteor.model.position.y < -10 || 
            Math.abs(meteor.model.position.x) > 100 ||
            Math.abs(meteor.model.position.z) > 100) {
            
            meteor.resetTimer += 0.016;
            
            // Reset meteor after delay
            if (meteor.resetTimer > 1) {
                const angle = Math.random() * Math.PI * 2;
                meteor.model.position.set(
                    Math.cos(angle) * 80,
                    60 + Math.random() * 30,
                    Math.sin(angle) * 80
                );
                
                meteor.velocity.set(
                    (Math.random() - 0.5) * 0.5,
                    -(0.8 + Math.random() * 0.4),
                    (Math.random() - 0.5) * 0.5
                );
                
                meteor.resetTimer = Math.random() * 5;
            }
        } else {
            activeMeteors++;
        }
        
        // Trail fade effect
        if (meteor.model.children[1]) {
            const trail = meteor.model.children[1];
            const opacity = 0.6 + Math.sin(time * 10 + index) * 0.2;
            trail.material.opacity = Math.max(0.2, opacity);
        }
    });
    
    // Update meteor count in UI
    const meteorCountUI = document.getElementById('meteorCount');
    if (meteorCountUI) {
        meteorCountUI.textContent = activeMeteors;
    }
    
    // 4. DUST PARTICLES (floating in air)
    this.rooms[0].children.forEach(child => {
        if (child.userData.isDust) {
            const positions = child.geometry.attributes.position.array;
            const velocities = child.userData.velocities;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Upward drift
                positions[i * 3 + 1] += velocities[i].y;
                
                // Side drift
                positions[i * 3] += velocities[i].drift * Math.sin(time + i);
                positions[i * 3 + 2] += velocities[i].drift * Math.cos(time + i);
                
                // Reset if too high
                if (positions[i * 3 + 1] > 8) {
                    positions[i * 3 + 1] = 0;
                }
                
                // Keep within room bounds
                const distance = Math.sqrt(
                    positions[i * 3] * positions[i * 3] + 
                    positions[i * 3 + 2] * positions[i * 3 + 2]
                );
                
                if (distance > 13) {
                    const angle = Math.atan2(positions[i * 3 + 2], positions[i * 3]);
                    positions[i * 3] = Math.cos(angle) * 13;
                    positions[i * 3 + 2] = Math.sin(angle) * 13;
                }
            }
            
            child.geometry.attributes.position.needsUpdate = true;
        }
    });
    
    // 5. ORRERY PLANETS ORBITING
    this.astronomicalInstruments.forEach(instrument => {
        if (instrument.userData.hasOrrery) {
            instrument.children.forEach(child => {
                if (child.userData.isPlanet) {
                    // Update orbit angle
                    child.userData.orbitAngle += child.userData.orbitSpeed;
                    
                    // Calculate new position
                    const radius = child.userData.orbitRadius;
                    const angle = child.userData.orbitAngle;
                    
                    child.position.x = Math.cos(angle) * radius;
                    child.position.z = Math.sin(angle) * radius;
                }
            });
        }
    });
    
    // 6. OIL LAMP FLICKERING
    this.astronomicalInstruments.forEach(instrument => {
        instrument.children.forEach(child => {
            if (child.userData.flame) {
                const flame = child.userData.flame;
                
                // Flicker effect
                const flicker = 0.9 + Math.sin(time * 15) * 0.1 + Math.sin(time * 7.3) * 0.05;
                flame.scale.set(flicker, flicker * 1.5, flicker);
                
                // Color shift
                const intensity = 0.8 + Math.sin(time * 8) * 0.2;
                flame.material.emissiveIntensity = intensity;
            }
        });
    });
    
    // 7. PLANETARIUM PROJECTOR ROTATION
    if (this.planetariumProjector && this.planetariumProjector.userData.starBall) {
        const starBall = this.planetariumProjector.userData.starBall;
        starBall.rotation.y += 0.001;
        starBall.rotation.x += 0.0005;
        
        // Projector lights pulsing
        this.planetariumProjector.children.forEach(child => {
            if (child.userData.isProjectorLight) {
                const pulse = 0.25 + Math.sin(time * 2) * 0.05;
                child.intensity = pulse;
            }
        });
    }
    
    // 8. STAR CHARTS SUBTLE MOVEMENT (like they're being blown by draft)
    this.starCharts.forEach((chart, index) => {
        const sway = Math.sin(time * 0.5 + index) * 0.005;
        chart.rotation.z = sway;
    });
    
    // 9. NIGHT SKY ROTATION (stars rotating overhead)
    if (this.nightSky) {
        this.nightSky.rotation.y += 0.00005;
    }
    
    // 10. CELESTIAL SPHERE ROTATION
    this.starCharts.forEach(chart => {
        // Find celestial sphere (has multiple children with line geometry)
        if (chart.children.length > 10) {
            chart.rotation.y += 0.002;
        }
    });
    
    // 11. MOONLIGHT INTENSITY VARIATION
    if (this.moonlight) {
        const intensity = 0.35 + Math.sin(time * 0.3) * 0.05;
        this.moonlight.intensity = intensity;
    }
    
    // 12. TELESCOPE STATUS UPDATES
    const statusUI = document.getElementById('telescopeStatus');
    if (statusUI && Math.random() < 0.005) {
        const statuses = ['Tracking', 'Focusing', 'Calibrating', 'Observing'];
        statusUI.textContent = statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    // 13. BROKEN CLOCK TICKING (even though it's stopped - eerie effect)
    // No actual animation, but could add subtle sound effect indicator
    
    // 14. COBWEB SWAYING
    this.rooms[0].children.forEach(child => {
        if (child.children.length > 0 && child.children[0].type === 'Mesh') {
            // Check if it might be a cobweb (has low opacity mesh)
            child.children.forEach(mesh => {
                if (mesh.material && mesh.material.opacity < 0.5) {
                    const sway = Math.sin(time + child.position.x) * 0.01;
                    child.rotation.z = sway;
                }
            });
        }
    });
    
    // 15. DUSTY EQUIPMENT SETTLING DUST
    this.dustyEquipment.forEach((equipment, index) => {
        // Very subtle settling animation
        if (equipment.children.length > 0) {
            const lastChild = equipment.children[equipment.children.length - 1];
            if (lastChild.material && lastChild.material.color.r > 0.7) {
                // This is probably dust
                const settle = Math.sin(time * 0.1 + index) * 0.001;
                lastChild.position.y += settle;
            }
        }
    });
    
    // 16. CONSTELLATION MAP BACKLIGHT PULSING
    this.constellationMaps.forEach((map, index) => {
        map.children.forEach(child => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                const pulse = 0.25 + Math.sin(time * 0.8 + index) * 0.05;
                child.material.emissiveIntensity = pulse;
            }
        });
    });
    
    // 17. NEBULA VIEW SCREEN STATIC/FLICKER
    this.nebulaeViews.forEach(screen => {
        const flicker = 0.45 + Math.sin(time * 20) * 0.05;
        screen.material.emissiveIntensity = flicker;
    });
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Circular observatory bounds
        const centerX = 0;
        const centerZ = 0;
        const maxRadius = 13.5;
        
        const dx = this.camera.position.x - centerX;
        const dz = this.camera.position.z - centerZ;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > maxRadius) {
            const angle = Math.atan2(dz, dx);
            this.camera.position.x = centerX + Math.cos(angle) * maxRadius;
            this.camera.position.z = centerZ + Math.sin(angle) * maxRadius;
        }
        
        // Don't walk through telescope (simple box collision)
        const telescopeX = 0;
        const telescopeZ = 0;
        const telescopeRadius = 2;
        
        const distToTelescope = Math.sqrt(
            Math.pow(this.camera.position.x - telescopeX, 2) +
            Math.pow(this.camera.position.z - telescopeZ, 2)
        );
        
        if (distToTelescope < telescopeRadius) {
            const angle = Math.atan2(
                this.camera.position.z - telescopeZ,
                this.camera.position.x - telescopeX
            );
            this.camera.position.x = telescopeX + Math.cos(angle) * telescopeRadius;
            this.camera.position.z = telescopeZ + Math.sin(angle) * telescopeRadius;
        }
        
        // Don't walk through planetarium projector
        const projectorX = 0;
        const projectorZ = 0;
        const projectorRadius = 1.5;
        
        const distToProjector = Math.sqrt(
            Math.pow(this.camera.position.x - projectorX, 2) +
            Math.pow(this.camera.position.z - projectorZ, 2)
        );
        
        if (distToProjector < projectorRadius) {
            const angle = Math.atan2(
                this.camera.position.z - projectorZ,
                this.camera.position.x - projectorX
            );
            this.camera.position.x = projectorX + Math.cos(angle) * projectorRadius;
            this.camera.position.z = projectorZ + Math.sin(angle) * projectorRadius;
        }
        
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    // Spawn at observatory entrance (near the wall)
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: 12
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
    
    this.updateObservatoryAnimations();   // ✓ ADD THIS LINE
   
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
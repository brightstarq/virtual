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
this.isSpacewalkMode = false;
    this.currentSpacewalkCamera = 0;
    this.orbitalAngle = 0;
    this.earthRotation = 0;
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
   this.artworkSpots = [];
    this.stationModules = [];
    this.corridors = [];
    this.viewingWindows = [];
    this.floatingArtworks = [];
    this.holographicDisplays = [];
    this.controlPanels = [];
    this.warningLights = [];
    this.earth = null;
    this.earthNight = null;
    this.earthClouds = null;
    this.spaceBackground = null;
    this.solarPanels = [];
    this.antennas = [];
    this.exteriorArtMounts = [];
    this.earthRotation = 0;
    this.stationLights = [];
    this.airlock = null;
    this.isSpacewalkMode = false;
    this.roboticArm = null;
    this.cupolaModule = null;
    this.cupolaShutters = [];
    this.mmu = null;
    this.tether = null;
    this.spacewalkCameras = [];
    this.currentSpacewalkCamera = 0;
    this.spacecraftList = [];
    this.interactivePanels = [];
    this.holographicArt = [];
    this.moon = null;
    this.sun = null;
    this.sunSprite = null;
    
    // Create all modules
    this.createSpaceStation();              // Core structure
    this.createMainCorridor();              // Main tube
    this.createObservationDome();           // Original dome
    this.createCupolaModule();              // NEW: Advanced cupola
    this.createEarthView();                 // ENHANCED: Day/night Earth
    this.createSpaceBackground();           // Stars
    this.createViewingWindows();            // Corridor windows
    this.createControlRoom();               // Original control room
    this.createInteractiveControlPanels();  // NEW: Advanced panels
    this.createDockingBay();                // Original bay
    this.createMultipleSpacecraft();        // NEW: Dragon, Soyuz, Cargo
    this.createRoboticArm();                // NEW: Canadarm
    this.createAirlock();                   // Spacewalk access
    this.createFloatingArtworks();          // Zero-G art
    this.createHolographicDisplays();       // Original holos
    this.createAdvancedHolographicArt();    // NEW: 3D holo art
    this.createWarningLights();             // Safety lights
    this.createInteriorDetails();           // Cables, vents, etc
    this.createAdvancedSpacewalk();         // NEW: MMU, cameras
    this.createSpacewalkMode();             // Exterior mounts
    this.setupPostProcessing();             // NEW: God rays, bloom
   
    this.createSpacewalkButton();           // NEW: Better button
    this.setupSpacewalkButton();            // Keyboard controls
    this.optimizePerformance();             // NEW: Performance
    this.addFinalPolish();                  // NEW: Sounds, achievements
    
    console.log("🛰️ ═══════════════════════════════════════");
    console.log("🛰️  SPACE STATION GALLERY INITIALIZED");
    console.log("🛰️ ═══════════════════════════════════════");
    console.log("✅ Main Corridor: ACTIVE");
    console.log("✅ Observation Dome: ACTIVE");
    console.log("✅ Cupola Module: ACTIVE");
    console.log("✅ Earth View: DAY/NIGHT CYCLE ENABLED");
    console.log("✅ Robotic Arm (Canadarm): OPERATIONAL");
    console.log("✅ Spacecraft: 3 DOCKED");
    console.log("✅ Floating Artworks: " + this.floatingArtworks.length);
    console.log("✅ Holographic Displays: ACTIVE");
    console.log("✅ Interactive Panels: " + this.interactivePanels.length);
    console.log("✅ Spacewalk Mode: READY");
    console.log("✅ Total Artwork Spots: " + this.artworkSpots.length);
    console.log("🛰️ ═══════════════════════════════════════");
    console.log("🎮 CONTROLS:");
    console.log("   'E' - Toggle Spacewalk Mode");
    console.log("   'C' - Cycle Spacewalk Cameras");
    console.log("🛰️ ═══════════════════════════════════════");
}

// ========================================
// SPACE STATION (main structure)
// ========================================

createSpaceStation() {
    const stationRoom = new THREE.Group();
    stationRoom.visible = true;
    
    // ========================================
    // MATERIALS (pristine, futuristic)
    // ========================================
    
    this.panelMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        roughness: 0.3,
        metalness: 0.8
    });
    
    this.darkPanelMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.4,
        metalness: 0.7
    });
    
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaccff,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        transparent: true,
        opacity: 0.3
    });
    
    this.glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8
    });
    this.metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.4,
        metalness: 0.9
    });
    // ========================================
    // LIGHTING (clean white station lights)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    stationRoom.add(ambientLight);
    
    // Main station lights (white, clinical)
    const lightPositions = [
        { x: 0, y: 4, z: 0 },
        { x: 0, y: 4, z: -15 },
        { x: 0, y: 4, z: 15 },
        { x: -15, y: 4, z: 0 },
        { x: 15, y: 4, z: 0 }
    ];
    
    lightPositions.forEach(pos => {
        const light = new THREE.PointLight(0xffffff, 0.8, 25);
        light.position.set(pos.x, pos.y, pos.z);
        light.castShadow = false; // Performance
        stationRoom.add(light);
        this.stationLights.push(light);
    });
    
    // Blue accent lights
    const accentLight = new THREE.PointLight(0x4488ff, 0.3, 20);
    accentLight.position.set(0, 3, -25);
    stationRoom.add(accentLight);
    
    stationRoom.position.set(0, 0, 0);
    this.rooms.push(stationRoom);
    this.scene.add(stationRoom);
}

// ========================================
// MAIN CORRIDOR (central tube)
// ========================================

createMainCorridor() {
    const corridorLength = 50;
    const corridorRadius = 3;
    
    // Main cylindrical corridor
    const corridor = new THREE.Mesh(
        new THREE.CylinderGeometry(corridorRadius, corridorRadius, corridorLength, 16),
        this.panelMaterial
    );
    corridor.rotation.x = Math.PI / 2;
    corridor.castShadow = true;
    corridor.receiveShadow = true;
    this.rooms[0].add(corridor);
    
    // Panel segments (every 5 units)
    const numSegments = Math.floor(corridorLength / 5);
    for (let i = 0; i < numSegments; i++) {
        const z = -corridorLength/2 + i * 5;
        
        // Ring detail
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(corridorRadius + 0.05, 0.1, 8, 16),
            this.darkPanelMaterial
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.z = z;
        this.rooms[0].add(ring);
        
        // Panel lines (4 vertical sections)
        for (let j = 0; j < 4; j++) {
            const angle = (j / 4) * Math.PI * 2;
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.05, 5),
                this.darkPanelMaterial
            );
            line.position.set(
                Math.cos(angle) * corridorRadius,
                Math.sin(angle) * corridorRadius,
                z + 2.5
            );
            this.rooms[0].add(line);
        }
    }
    
    // Floor panels (hexagonal pattern)
    for (let i = 0; i < 20; i++) {
        const panel = this.createHexPanel();
        panel.position.set(
            (Math.random() - 0.5) * 4,
            -corridorRadius + 0.01,
            -20 + i * 2
        );
        panel.rotation.x = -Math.PI / 2;
        this.rooms[0].add(panel);
    }
    
    // Ceiling lights (LED strips)
    for (let i = 0; i < 10; i++) {
        const strip = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.05, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 1.0
            })
        );
        strip.position.set(0, corridorRadius - 0.3, -20 + i * 5);
        this.rooms[0].add(strip);
    }
    
    // Handrails (for zero-G movement)
    [-1.5, 1.5].forEach(x => {
        const rail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, corridorLength, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.4,
                metalness: 0.8
            })
        );
        rail.rotation.x = Math.PI / 2;
        rail.position.set(x, 1.5, 0);
        this.rooms[0].add(rail);
    });
    
    this.corridors.push(corridor);
}

createHexPanel() {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        points.push(new THREE.Vector2(
            Math.cos(angle) * 0.4,
            Math.sin(angle) * 0.4
        ));
    }
    
    const shape = new THREE.Shape(points);
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.05,
        bevelEnabled: false
    });
    
    return new THREE.Mesh(geometry, this.darkPanelMaterial);
}

// ========================================
// OBSERVATION DOME (panoramic Earth view)
// ========================================

createObservationDome() {
    const domeGroup = new THREE.Group();
    
    // Dome structure
    const domeGeometry = new THREE.SphereGeometry(
        8,
        24,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
    );
    
    const dome = new THREE.Mesh(
        domeGeometry,
        this.glassMaterial
    );
    dome.position.y = 3;
    dome.position.z = -25;
    this.rooms[0].add(dome);
    
    // Dome frame (structural ribs)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rib = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 8),
            this.panelMaterial
        );
        rib.position.set(
            Math.cos(angle) * 4,
            3 + 4,
            -25 + Math.sin(angle) * 4
        );
        rib.rotation.set(0, angle, Math.PI / 4);
        this.rooms[0].add(rib);
    }
    
    // Platform/floor
    const platform = new THREE.Mesh(
        new THREE.CircleGeometry(7, 24),
        this.panelMaterial
    );
    platform.rotation.x = -Math.PI / 2;
    platform.position.set(0, 0, -25);
    this.rooms[0].add(platform);
    
    // Seating area (benches around perimeter)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const bench = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 0.6),
            this.panelMaterial
        );
        bench.position.set(
            Math.cos(angle) * 5,
            0.4,
            -25 + Math.sin(angle) * 5
        );
        bench.rotation.y = angle + Math.PI;
        this.rooms[0].add(bench);
    }
    
    // Central pedestal (main Earth viewing spot)
    const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.8, 12),
        this.darkPanelMaterial
    );
    pedestal.position.set(0, 0.4, -25);
    this.rooms[0].add(pedestal);
    
    // Holographic projector
    const projector = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 12),
        this.glowMaterial
    );
    projector.position.set(0, 0.9, -25);
    this.rooms[0].add(projector);
    
    this.stationModules.push(domeGroup);
}

// ========================================
// EARTH VIEW (rotating planet visible through windows)
// ========================================

// ========================================
// ADVANCED EARTH VIEW (day/night, city lights, atmosphere)
// ========================================

createEarthView() {
    const earthGroup = new THREE.Group();
    
    // Earth sphere (large, detailed)
    const earthGeometry = new THREE.SphereGeometry(40, 64, 64);
    
    // Create advanced Earth textures
    const dayCanvas = this.createDayEarthTexture();
    const nightCanvas = this.createNightEarthTexture();
    
    const dayTexture = new THREE.CanvasTexture(dayCanvas);
    const nightTexture = new THREE.CanvasTexture(nightCanvas);
    
    // Day side material
    this.earthDayMaterial = new THREE.MeshStandardMaterial({
        map: dayTexture,
        roughness: 0.7,
        metalness: 0.2
    });
    
    // Night side material (with city lights)
    this.earthNightMaterial = new THREE.MeshBasicMaterial({
        map: nightTexture,
        transparent: true,
        opacity: 0
    });
    
    // Create two Earth meshes (day and night) at same position
    const earthDay = new THREE.Mesh(earthGeometry, this.earthDayMaterial);
    const earthNight = new THREE.Mesh(earthGeometry, this.earthNightMaterial);
    
    earthDay.position.set(0, -20, -80);
    earthNight.position.copy(earthDay.position);
    
    earthGroup.add(earthDay);
    earthGroup.add(earthNight);
    
    // Clouds layer (separate, rotating faster)
    const cloudsCanvas = this.createCloudTexture();
    const cloudTexture = new THREE.CanvasTexture(cloudsCanvas);
    
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(40.5, 48, 48),
        new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
    );
    clouds.position.copy(earthDay.position);
    earthGroup.add(clouds);
    
    // Atmosphere glow (multiple layers)
    const atmosphereLayers = [
        { radius: 41, opacity: 0.15, color: 0x4488ff },
        { radius: 42, opacity: 0.10, color: 0x6699ff },
        { radius: 43, opacity: 0.05, color: 0x88aaff }
    ];
    
    atmosphereLayers.forEach(layer => {
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(layer.radius, 32, 32),
            new THREE.MeshBasicMaterial({
                color: layer.color,
                transparent: true,
                opacity: layer.opacity,
                side: THREE.BackSide
            })
        );
        atmosphere.position.copy(earthDay.position);
        earthGroup.add(atmosphere);
    });
    
    // Sun (directional light source)
    this.sun = new THREE.DirectionalLight(0xffffee, 1.5);
    this.sun.position.set(100, 50, -50);
    earthGroup.add(this.sun);
    
    // Lens flare effect (visible sun)
    const sunSprite = new THREE.Mesh(
        new THREE.SphereGeometry(5, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xffffee,
            emissive: 0xffffee,
            emissiveIntensity: 2.0
        })
    );
    sunSprite.position.copy(this.sun.position);
    earthGroup.add(sunSprite);
    
    // Moon (visible in background)
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(8, 32, 32),
        new THREE.MeshStandardMaterial({
            color: 0xccccbb,
            roughness: 0.9,
            metalness: 0.1
        })
    );
    moon.position.set(-60, 30, -120);
    earthGroup.add(moon);
    
    this.earth = earthDay;
    this.earthNight = earthNight;
    this.earthClouds = clouds;
    this.moon = moon;
    this.sunSprite = sunSprite;
    
    this.rooms[0].add(earthGroup);
}

createDayEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Ocean blue base
    ctx.fillStyle = '#1a4a8a';
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Continents (more detailed)
    ctx.fillStyle = '#2a6a3a';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(300, 300, 200, 250, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(400, 600, 100, 200, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(1100, 500, 150, 250, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(1050, 250, 100, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(1500, 300, 300, 200, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(1700, 700, 120, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Desert areas (lighter)
    ctx.fillStyle = '#8a7a5a';
    ctx.beginPath();
    ctx.ellipse(1150, 400, 120, 100, 0, 0, Math.PI * 2);
    ctx.fill(); // Sahara
    
    // Ice caps
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2048, 100); // North pole
    ctx.fillRect(0, 924, 2048, 100); // South pole
    
    return canvas;
}

createNightEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Black base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 2048, 1024);
    
    // City lights (concentrated in populated areas)
    const cityRegions = [
        // North America East Coast
        { x: 350, y: 320, w: 50, h: 200 },
        // North America West Coast
        { x: 250, y: 350, w: 30, h: 150 },
        // Europe
        { x: 1000, y: 250, w: 150, h: 100 },
        // Japan
        { x: 1650, y: 320, w: 40, h: 80 },
        // India
        { x: 1350, y: 450, w: 80, h: 100 },
        // East Asia
        { x: 1500, y: 300, w: 200, h: 150 }
    ];
    
    cityRegions.forEach(region => {
        const numLights = 500;
        for (let i = 0; i < numLights; i++) {
            const x = region.x + Math.random() * region.w;
            const y = region.y + Math.random() * region.h;
            const size = Math.random() * 2 + 1;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            gradient.addColorStop(0, 'rgba(255, 220, 150, 1)');
            gradient.addColorStop(1, 'rgba(255, 220, 150, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);
        }
    });
    
    return canvas;
}

createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Transparent base
    ctx.clearRect(0, 0, 2048, 1024);
    
    // Cloud formations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 1024;
        const w = 30 + Math.random() * 100;
        const h = 15 + Math.random() * 40;
        
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return canvas;
}



// ========================================
// ORBITAL MECHANICS (sunrise/sunset simulation)
// ========================================

updateOrbitalMechanics() {
    const time = Date.now() * 0.001;
    
    if (!this.earth || !this.earthNight) return;
    
    // Orbital position (station orbits Earth)
    this.orbitalAngle = (this.orbitalAngle || 0) + 0.0001; // ~90 minutes per orbit
    
    // Calculate day/night transition
    // Based on camera position relative to sun
    const cameraPos = this.camera.position;
    const earthPos = this.earth.position;
    const sunDir = new THREE.Vector3().subVectors(this.sun.position, earthPos).normalize();
    const viewDir = new THREE.Vector3().subVectors(cameraPos, earthPos).normalize();
    
    const dotProduct = sunDir.dot(viewDir);
    
    // Fade between day and night textures
    const nightOpacity = Math.max(0, Math.min(1, (-dotProduct + 0.5) * 2));
    this.earthNight.material.opacity = nightOpacity;
    
    // Rotate clouds slightly faster
    if (this.earthClouds) {
        this.earthClouds.rotation.y += 0.00015;
    }
    
    // Moon orbit
    if (this.moon) {
        const moonOrbit = time * 0.0005;
        this.moon.position.x = -60 * Math.cos(moonOrbit);
        this.moon.position.z = -120 + 40 * Math.sin(moonOrbit);
    }
    
    // Sunrise/sunset indicator
    const phase = dotProduct > 0 ? 'DAY' : 'NIGHT';
    const transitionProgress = Math.abs(dotProduct);
    
    if (transitionProgress < 0.3) {
        // Near terminator (sunrise/sunset)
        console.log(`🌅 ${phase === 'DAY' ? 'Sunrise' : 'Sunset'} approaching...`);
    }
}

// ========================================
// ROBOTIC ARM (Canadarm-style manipulator)
// ========================================

createRoboticArm() {
    const armGroup = new THREE.Group();
    
    // Shoulder joint (attached to station)
    const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    shoulder.position.set(8, 2, -10);
    armGroup.add(shoulder);
    
    // Upper arm segment
    const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 8, 16),
        this.panelMaterial
    );
    upperArm.position.set(8, 2, -6);
    upperArm.rotation.x = Math.PI / 3;
    armGroup.add(upperArm);
    
    // Elbow joint
    const elbow = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    elbow.position.set(8, 6, -2);
    armGroup.add(elbow);
    
    // Forearm segment
    const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 6, 16),
        this.panelMaterial
    );
    forearm.position.set(8, 8, 0);
    forearm.rotation.x = -Math.PI / 6;
    armGroup.add(forearm);
    
    // Wrist joint
    const wrist = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    wrist.position.set(8, 11, 2);
    armGroup.add(wrist);
    
    // End effector (grapple)
    const grapple = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.2, 0.8, 12),
        this.metalMaterial
    );
    grapple.position.set(8, 11.8, 2);
    armGroup.add(grapple);
    
    // Grapple fingers (3)
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const finger = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.4, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.5,
                metalness: 0.8
            })
        );
        finger.position.set(
            8 + Math.cos(angle) * 0.25,
            12.2,
            2 + Math.sin(angle) * 0.25
        );
        finger.rotation.z = angle;
        armGroup.add(finger);
    }
    
    // Canada flag decal
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 256;
    flagCanvas.height = 128;
    const ctx = flagCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#ff0000';
    // Simplified maple leaf
    ctx.fillRect(100, 30, 56, 68);
    
    const flagTexture = new THREE.CanvasTexture(flagCanvas);
    const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.4),
        new THREE.MeshBasicMaterial({ map: flagTexture })
    );
    flag.position.set(8.31, 5, -4);
    flag.rotation.y = -Math.PI / 2;
    armGroup.add(flag);
    
    this.roboticArm = {
        group: armGroup,
        shoulder: shoulder,
        upperArm: upperArm,
        elbow: elbow,
        forearm: forearm,
        wrist: wrist,
        grapple: grapple,
        animationPhase: 0
    };
    
    this.rooms[0].add(armGroup);
}

updateRoboticArm() {
    if (!this.roboticArm) return;
    
    const time = Date.now() * 0.001;
    this.roboticArm.animationPhase += 0.001;
    
    // Slow, realistic movements
    const shoulderAngle = Math.sin(this.roboticArm.animationPhase) * 0.3;
    const elbowAngle = Math.cos(this.roboticArm.animationPhase * 1.3) * 0.4;
    const wristAngle = Math.sin(this.roboticArm.animationPhase * 1.7) * 0.2;
    
    this.roboticArm.upperArm.rotation.x = Math.PI / 3 + shoulderAngle;
    this.roboticArm.forearm.rotation.x = -Math.PI / 6 + elbowAngle;
    this.roboticArm.wrist.rotation.z = wristAngle;
    
    // Update positions based on rotations (simplified IK)
    const upperArmLength = 8;
    const forearmLength = 6;
    
    this.roboticArm.elbow.position.y = 2 + Math.cos(this.roboticArm.upperArm.rotation.x) * upperArmLength/2;
    this.roboticArm.elbow.position.z = -10 + Math.sin(this.roboticArm.upperArm.rotation.x) * upperArmLength;
}

// ========================================
// CUPOLA MODULE (panoramic observation dome)
// ========================================

createCupolaModule() {
    const cupolaGroup = new THREE.Group();
    
    // Cupola position (below main corridor)
    const cupolaX = 0;
    const cupolaY = -4;
    const cupolaZ = 0;
    
    // Main cupola body (truncated cone)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 1.5, 3, 8),
        this.panelMaterial
    );
    body.position.set(cupolaX, cupolaY - 1.5, cupolaZ);
    cupolaGroup.add(body);
    
    // 6 large windows (hexagonal around sides)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 2;
        
        const window = this.createCupolaWindow('side');
        window.position.set(
            cupolaX + Math.cos(angle) * radius,
            cupolaY - 1.5,
            cupolaZ + Math.sin(angle) * radius
        );
        window.rotation.y = angle + Math.PI;
        cupolaGroup.add(window);
    }
    
    // Top window (Earth-facing, largest)
    const topWindow = this.createCupolaWindow('top');
    topWindow.position.set(cupolaX, cupolaY - 3.2, cupolaZ);
    topWindow.rotation.x = Math.PI / 2;
    cupolaGroup.add(topWindow);
    
    // Window shutters (protective covers)
    this.cupolaShutters = [];
    for (let i = 0; i < 7; i++) {
        const shutter = new THREE.Mesh(
            new THREE.BoxGeometry(i === 6 ? 1.4 : 0.8, i === 6 ? 1.4 : 0.8, 0.1),
            this.darkPanelMaterial
        );
        shutter.userData.isOpen = true;
        shutter.userData.targetRotation = 0;
        this.cupolaShutters.push(shutter);
        
        if (i < 6) {
            const angle = (i / 6) * Math.PI * 2;
            shutter.position.set(
                cupolaX + Math.cos(angle) * 2,
                cupolaY - 1.5,
                cupolaZ + Math.sin(angle) * 2
            );
            shutter.rotation.y = angle + Math.PI;
        } else {
            shutter.position.set(cupolaX, cupolaY - 3.25, cupolaZ);
            shutter.rotation.x = Math.PI / 2;
        }
        
        cupolaGroup.add(shutter);
    }
    
    // Access hatch (from main corridor)
    const hatch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16),
        this.darkPanelMaterial
    );
    hatch.rotation.x = Math.PI / 2;
    hatch.position.set(cupolaX, cupolaY + 0.2, cupolaZ);
    cupolaGroup.add(hatch);
    
    // Control panel for shutters
    const controlPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.1),
        this.darkPanelMaterial
    );
    controlPanel.position.set(cupolaX + 1.5, cupolaY - 1, cupolaZ);
    cupolaGroup.add(controlPanel);
    
    // Shutter control buttons
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12),
            new THREE.MeshStandardMaterial({
                color: i === 0 ? 0x00ff00 : i === 1 ? 0xffff00 : 0xff0000,
                emissive: i === 0 ? 0x00ff00 : i === 1 ? 0xffff00 : 0xff0000,
                emissiveIntensity: 0.5
            })
        );
        button.rotation.x = Math.PI / 2;
        button.position.set(
            cupolaX + 1.5 - 0.15 + i * 0.15,
            cupolaY - 1,
            cupolaZ + 0.06
        );
        cupolaGroup.add(button);
    }
    
    // Handholds for astronauts
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const handhold = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.03, 8, 12),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.4,
                metalness: 0.9
            })
        );
        handhold.position.set(
            cupolaX + Math.cos(angle) * 1.3,
            cupolaY - 1.5,
            cupolaZ + Math.sin(angle) * 1.3
        );
        handhold.rotation.y = angle;
        cupolaGroup.add(handhold);
    }
    
    // "CUPOLA" label
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CUPOLA MODULE', 128, 40);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.4),
        new THREE.MeshBasicMaterial({ map: labelTexture })
    );
    label.position.set(cupolaX, cupolaY + 0.5, cupolaZ + 1.2);
    cupolaGroup.add(label);
    
    this.cupolaModule = cupolaGroup;
    this.rooms[0].add(cupolaGroup);
}

createCupolaWindow(type) {
    const group = new THREE.Group();
    
    const size = type === 'top' ? 1.2 : 0.7;
    
    // Window frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(size + 0.2, size + 0.2, 0.15),
        this.darkPanelMaterial
    );
    group.add(frame);
    
    // Multi-pane glass (pressure resistant)
    for (let i = 0; i < 3; i++) {
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            new THREE.MeshPhysicalMaterial({
                color: 0xaaccff,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.95,
                thickness: 0.3,
                transparent: true,
                opacity: 0.2
            })
        );
        glass.position.z = 0.08 - i * 0.03;
        group.add(glass);
    }
    
    // Protective grid
    for (let i = -1; i <= 1; i++) {
        const gridLine = new THREE.Mesh(
            new THREE.BoxGeometry(size + 0.1, 0.02, 0.02),
            this.metalMaterial
        );
        gridLine.position.set(0, i * (size / 3), 0.09);
        group.add(gridLine);
        
        const gridLine2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, size + 0.1, 0.02),
            this.metalMaterial
        );
        gridLine2.position.set(i * (size / 3), 0, 0.09);
        group.add(gridLine2);
    }
    
    return group;
}

// ========================================
// ADVANCED SPACEWALK (with MMU jetpack)
// ========================================

createAdvancedSpacewalk() {
    // MMU (Manned Maneuvering Unit) - astronaut jetpack
    this.mmu = this.createMMU();
    this.mmu.position.set(0, 0, 30);
    this.mmu.visible = false; // Hidden until spacewalk mode
    this.rooms[0].add(this.mmu);
    
    // Tether cable (safety line)
    this.tetherPoints = [];
    for (let i = 0; i < 20; i++) {
        this.tetherPoints.push(new THREE.Vector3(0, 0, 25 + i * 0.5));
    }
    
    const tetherGeometry = new THREE.BufferGeometry().setFromPoints(this.tetherPoints);
    this.tether = new THREE.Line(
        tetherGeometry,
        new THREE.LineBasicMaterial({
            color: 0xffcc00,
            linewidth: 2
        })
    );
    this.tether.visible = false;
    this.rooms[0].add(this.tether);
    
    // Spacewalk camera positions (for cinematic views)
    this.spacewalkCameras = [
        { name: 'Exterior View', pos: { x: 0, y: 15, z: 40 }, lookAt: { x: 0, y: 0, z: 0 } },
        { name: 'Robotic Arm View', pos: { x: 12, y: 10, z: 0 }, lookAt: { x: 0, y: 0, z: 0 } },
        { name: 'Earth View', pos: { x: 0, y: -10, z: 0 }, lookAt: { x: 0, y: -20, z: -80 } },
        { name: 'Station Flyby', pos: { x: -20, y: 5, z: 10 }, lookAt: { x: 0, y: 0, z: 0 } }
    ];
    this.currentSpacewalkCamera = 0;
}

createMMU() {
    const group = new THREE.Group();
    
    // Backpack frame
    const backpack = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 0.5),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
            metalness: 0.8
        })
    );
    group.add(backpack);
    
    // Nitrogen thrusters (24 small jets)
    const thrusterPositions = [
        // Front
        { x: -0.4, y: 0.6, z: 0.3 }, { x: 0.4, y: 0.6, z: 0.3 },
        { x: -0.4, y: -0.6, z: 0.3 }, { x: 0.4, y: -0.6, z: 0.3 },
        // Back
        { x: -0.4, y: 0.6, z: -0.3 }, { x: 0.4, y: 0.6, z: -0.3 },
        { x: -0.4, y: -0.6, z: -0.3 }, { x: 0.4, y: -0.6, z: -0.3 },
        // Sides
        { x: -0.55, y: 0, z: 0 }, { x: 0.55, y: 0, z: 0 },
        { x: 0, y: 0.8, z: 0 }, { x: 0, y: -0.8, z: 0 }
    ];
    
    thrusterPositions.forEach(pos => {
        const thruster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8),
            this.metalMaterial
        );
        thruster.position.set(pos.x, pos.y, pos.z);
        
        // Determine rotation based on position
        if (Math.abs(pos.x) > 0.5) {
            thruster.rotation.z = Math.PI / 2;
        } else if (Math.abs(pos.y) > 0.7) {
            thruster.rotation.x = Math.PI / 2;
        }
        
        group.add(thruster);
        
        // Add thruster glow (when firing)
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0
            })
        );
        glow.position.copy(thruster.position);
        group.add(glow);
    });
    
    // Control arms/handles
    [-0.6, 0.6].forEach(x => {
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.6, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.5,
                metalness: 0.8
            })
        );
        arm.position.set(x, 0, 0.3);
        group.add(arm);
        
        const handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.1, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0xff4444,
                roughness: 0.6,
                metalness: 0.7
            })
        );
        handle.position.set(x, -0.3, 0.3);
        group.add(handle);
    });
    
    // NASA logo
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 128;
    logoCanvas.height = 128;
    const ctx = logoCanvas.getContext('2d');
    ctx.fillStyle = '#0b3d91';
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NASA', 64, 75);
    
    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.4),
        new THREE.MeshBasicMaterial({ map: logoTexture })
    );
    logo.position.z = 0.26;
    group.add(logo);
    
    return group;
}

updateAdvancedSpacewalk() {
    if (!this.isSpacewalkMode || !this.mmu) return;
    
    const time = Date.now() * 0.001;
    
    // Gentle drift animation
    this.mmu.position.x = Math.sin(time * 0.2) * 2;
    this.mmu.position.y = 5 + Math.cos(time * 0.3) * 1;
    this.mmu.rotation.y = Math.sin(time * 0.1) * 0.3;
    this.mmu.rotation.x = Math.cos(time * 0.15) * 0.2;
    
    // Update tether cable (follows MMU)
    if (this.tether) {
        const positions = this.tether.geometry.attributes.position.array;
        for (let i = 0; i < this.tetherPoints.length; i++) {
            const t = i / (this.tetherPoints.length - 1);
            // Catenary curve
            positions[i * 3] = this.mmu.position.x * t;
            positions[i * 3 + 1] = Math.sin(t * Math.PI) * 2;
            positions[i * 3 + 2] = 25 + (this.mmu.position.z - 25) * t;
        }
        this.tether.geometry.attributes.position.needsUpdate = true;
    }
    
    // Thruster effects (random firing simulation)
    if (Math.random() < 0.1) {
        this.mmu.children.forEach(child => {
            if (child.material && child.material.transparent) {
                child.material.opacity = Math.random() * 0.8;
                setTimeout(() => {
                    child.material.opacity = 0;
                }, 100);
            }
        });
    }
}

cycleSpacewalkCamera() {
    if (!this.isSpacewalkMode) return;
    
    this.currentSpacewalkCamera = (this.currentSpacewalkCamera + 1) % this.spacewalkCameras.length;
    const cam = this.spacewalkCameras[this.currentSpacewalkCamera];
    
    this.camera.position.set(cam.pos.x, cam.pos.y, cam.pos.z);
    this.camera.lookAt(cam.lookAt.x, cam.lookAt.y, cam.lookAt.z);
    
    console.log(`📹 Camera: ${cam.name}`);
}

// ========================================
// MULTIPLE SPACECRAFT & DOCKING
// ========================================

createMultipleSpacecraft() {
    // SpaceX Dragon
    const dragon = this.createDragonCapsule();
    dragon.position.set(25, 2, -5);
    dragon.rotation.y = -Math.PI / 2;
    this.rooms[0].add(dragon);
    
    // Russian Soyuz
    const soyuz = this.createSoyuzCapsule();
    soyuz.position.set(25, -2, 5);
    soyuz.rotation.y = -Math.PI / 2;
    this.rooms[0].add(soyuz);
    
    // Cargo spacecraft (Cygnus/Progress)
    const cargo = this.createCargoVehicle();
    cargo.position.set(15, 4, -15);
    cargo.rotation.y = Math.PI;
    this.rooms[0].add(cargo);
    
    this.spacecraftList = [
        { model: dragon, name: 'SpaceX Dragon', type: 'crew' },
        { model: soyuz, name: 'Soyuz MS', type: 'crew' },
        { model: cargo, name: 'Cygnus Cargo', type: 'cargo' }
    ];
}

createDragonCapsule() {
    const group = new THREE.Group();
    
    // Sleek modern design
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.8, 3, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.9
        })
    );
    body.rotation.z = Math.PI / 2;
    group.add(body);
    
    // Nose cone (sharp)
    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 1.5, 16),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        })
    );
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 2.25;
    group.add(nose);
    
    // Solar panels (foldable)
    [-1, 1].forEach(side => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 3, 2),
            new THREE.MeshStandardMaterial({
                color: 0x1a2a4a,
                roughness: 0.2,
                metalness: 0.9
            })
        );
        panel.position.set(-1, side * 2.5, 0);
        group.add(panel);
    });
    
    // SpaceX logo
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 256;
    logoCanvas.height = 64;
    const ctx = logoCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPACEX', 128, 45);
    
    const texture = new THREE.CanvasTexture(logoCanvas);
    const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.4),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    logo.position.set(0, 1.81, 0);
    logo.rotation.x = Math.PI / 2;
    group.add(logo);
    
    return group;
}

createSoyuzCapsule() {
    const group = new THREE.Group();
    
    // Classic Russian design (3 modules)
    
    // Orbital module (sphere)
    const orbital = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x4a6a4a,
            roughness: 0.7,
            metalness: 0.5
        })
    );
    orbital.position.x = 2;
    group.add(orbital);
    
    // Descent module (bell shape)
    const descent = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
            color: 0x6a8a6a,
            roughness: 0.6,
            metalness: 0.6
        })
    );
    descent.rotation.z = Math.PI;
    descent.position.x = 0;
    group.add(descent);
    
    // Service module (cylinder)
    const service = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 2, 16),
        new THREE.MeshStandardMaterial({
            color: 0x8a7a5a,
            roughness: 0.5,
            metalness: 0.7
        })
    );
    service.rotation.z = Math.PI / 2;
    service.position.x = -2;
    group.add(service);
    
    // Solar panels (wings)
    [-1, 1].forEach(side => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 2.5, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0x1a2a4a,
                roughness: 0.3,
                metalness: 0.8
            })
        );
        panel.position.set(-2, side * 1.5, 0);
        group.add(panel);
    });
    
    return group;
}

createCargoVehicle() {
    const group = new THREE.Group();
    
    // Large cylindrical body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 5, 16),
        new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.5,
            metalness: 0.7
        })
    );
    body.rotation.z = Math.PI / 2;
    group.add(body);
    
    // Solar panels (large arrays)
    [-1, 1].forEach(side => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 4, 3),
            new THREE.MeshStandardMaterial({
                color: 0x1a2a4a,
                roughness: 0.2,
                metalness: 0.9
            })
        );
        panel.position.set(0, side * 3, 0);
        group.add(panel);
    });
    
    // "CARGO" label
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CARGO', 128, 45);
    
    const texture = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.5),
        new THREE.MeshBasicMaterial({ map: texture })
    );
    label.position.y = 2.01;
    label.rotation.x = Math.PI / 2;
    group.add(label);
    
    return group;
}

// Continue to Part 4...

// ========================================
// INTERACTIVE CONTROL PANELS (clickable screens)
// ========================================

createInteractiveControlPanels() {
    // Main engineering console
    const engineeringConsole = this.createEngineeringConsole();
    engineeringConsole.position.set(6, 0, 10);
    engineeringConsole.rotation.y = -Math.PI / 4;
    this.rooms[0].add(engineeringConsole);
    
    // Life support panel
    const lifeSupportPanel = this.createLifeSupportPanel();
    lifeSupportPanel.position.set(-2.8, 1.5, -18);
    lifeSupportPanel.rotation.y = Math.PI / 2;
    this.rooms[0].add(lifeSupportPanel);
    
    // Power management panel
    const powerPanel = this.createPowerManagementPanel();
    powerPanel.position.set(2.8, 1.5, 12);
    powerPanel.rotation.y = -Math.PI / 2;
    this.rooms[0].add(powerPanel);
    
    // Communication array panel
    const commsPanel = this.createCommunicationsPanel();
    commsPanel.position.set(-6, 1.2, -5);
    commsPanel.rotation.y = Math.PI / 3;
    this.rooms[0].add(commsPanel);
    
    this.interactivePanels = [
        engineeringConsole,
        lifeSupportPanel,
        powerPanel,
        commsPanel
    ];
}

createEngineeringConsole() {
    const group = new THREE.Group();
    
    // Console desk
    const desk = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 2),
        this.darkPanelMaterial
    );
    desk.position.y = 0.5;
    group.add(desk);
    
    // Large main screen (system overview)
    const mainScreen = this.createInteractiveScreen('engineering', 2, 1.5);
    mainScreen.position.set(0, 1.5, 0.95);
    mainScreen.rotation.x = -0.3;
    group.add(mainScreen);
    
    // Side screens (detailed systems)
    [-1.2, 1.2].forEach((x, index) => {
        const sideScreen = this.createInteractiveScreen(
            index === 0 ? 'propulsion' : 'thermal',
            0.8,
            0.6
        );
        sideScreen.position.set(x, 1.2, 0.9);
        sideScreen.rotation.set(-0.3, x < 0 ? 0.2 : -0.2, 0);
        group.add(sideScreen);
    });
    
    // Keyboard
    const keyboard = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.05, 0.4),
        this.darkPanelMaterial
    );
    keyboard.position.set(0, 1.03, 0.3);
    group.add(keyboard);
    
    // Status LEDs
    for (let i = 0; i < 12; i++) {
        const led = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8),
            new THREE.MeshBasicMaterial({
                color: Math.random() > 0.7 ? 0xff0000 : 0x00ff00,
                emissive: Math.random() > 0.7 ? 0xff0000 : 0x00ff00,
                emissiveIntensity: 1.0
            })
        );
        led.position.set(
            -1.3 + (i % 6) * 0.25,
            1.02,
            0.8 - Math.floor(i / 6) * 0.3
        );
        led.rotation.x = Math.PI / 2;
        group.add(led);
    }
    
    return group;
}

createInteractiveScreen(type, width, height) {
    const group = new THREE.Group();
    
    // Screen bezel
    const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.05),
        this.darkPanelMaterial
    );
    group.add(bezel);
    
    // Screen display
    const canvas = this.createScreenContent(type, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({
            map: texture,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3
        })
    );
    screen.position.z = 0.03;
    group.add(screen);
    
    // Store canvas for animation updates
    screen.userData.canvas = canvas;
    screen.userData.type = type;
    screen.userData.updateTimer = 0;
    
    return group;
}

createScreenContent(type, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512 * (height / width);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#001a00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Title
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'center';
    
    switch(type) {
        case 'engineering':
            ctx.fillText('SYSTEMS OVERVIEW', canvas.width / 2, 50);
            this.drawSystemsOverview(ctx, canvas);
            break;
        case 'propulsion':
            ctx.fillText('PROPULSION', canvas.width / 2, 50);
            this.drawPropulsionData(ctx, canvas);
            break;
        case 'thermal':
            ctx.fillText('THERMAL CONTROL', canvas.width / 2, 50);
            this.drawThermalData(ctx, canvas);
            break;
        case 'lifesupport':
            ctx.fillText('LIFE SUPPORT', canvas.width / 2, 50);
            this.drawLifeSupportData(ctx, canvas);
            break;
        case 'power':
            ctx.fillText('POWER SYSTEMS', canvas.width / 2, 50);
            this.drawPowerData(ctx, canvas);
            break;
        case 'communications':
            ctx.fillText('COMMUNICATIONS', canvas.width / 2, 50);
            this.drawCommsData(ctx, canvas);
            break;
    }
    
    // Timestamp
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'right';
    const date = new Date();
    ctx.fillText(`${date.toISOString()}`, canvas.width - 20, canvas.height - 20);
    
    return canvas;
}

drawSystemsOverview(ctx, canvas) {
    ctx.font = '20px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    
    const systems = [
        { name: 'POWER', status: 'NOMINAL', value: '98%', color: '#00ff00' },
        { name: 'LIFE SUPPORT', status: 'NOMINAL', value: '100%', color: '#00ff00' },
        { name: 'PROPULSION', status: 'STANDBY', value: 'READY', color: '#ffff00' },
        { name: 'COMMUNICATIONS', status: 'ACTIVE', value: '5 LINKS', color: '#00ff00' },
        { name: 'THERMAL', status: 'NOMINAL', value: '21°C', color: '#00ff00' },
        { name: 'ATTITUDE CTRL', status: 'NOMINAL', value: 'STABLE', color: '#00ff00' }
    ];
    
    systems.forEach((sys, index) => {
        const y = 100 + index * 60;
        
        ctx.fillStyle = '#00ff88';
        ctx.fillText(sys.name, 40, y);
        
        ctx.fillStyle = sys.color;
        ctx.fillText(sys.status, 250, y);
        ctx.fillText(sys.value, 400, y);
        
        // Status bar
        const barWidth = 100;
        const barHeight = 10;
        ctx.strokeStyle = sys.color;
        ctx.strokeRect(40, y + 10, barWidth, barHeight);
        ctx.fillStyle = sys.color + '80';
        const fillWidth = sys.name === 'POWER' ? 98 : 100;
        ctx.fillRect(40, y + 10, (fillWidth / 100) * barWidth, barHeight);
    });
}

drawPropulsionData(ctx, canvas) {
    ctx.font = '18px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    
    ctx.fillText('RCS THRUSTERS:', 40, 100);
    ctx.fillText('Status: STANDBY', 60, 130);
    ctx.fillText('Fuel: 87%', 60, 160);
    
    ctx.fillText('MAIN ENGINES:', 40, 220);
    ctx.fillText('Status: OFFLINE', 60, 250);
    ctx.fillText('Fuel: 0%', 60, 280);
    
    // Thruster diagram
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(200, 100, 200, 200);
    
    // Draw thruster positions
    const thrusterPos = [
        [220, 120], [380, 120], [220, 280], [380, 280],
        [290, 110], [310, 110], [290, 290], [310, 290]
    ];
    
    thrusterPos.forEach(pos => {
        ctx.fillStyle = Math.random() > 0.5 ? '#00ff00' : '#ffff00';
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

drawThermalData(ctx, canvas) {
    ctx.font = '18px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    
    const zones = [
        { name: 'Hab Module', temp: 21.5 },
        { name: 'Lab Module', temp: 22.0 },
        { name: 'Docking Bay', temp: 19.0 },
        { name: 'Solar Arrays', temp: -45.0 },
        { name: 'Radiators', temp: -120.0 }
    ];
    
    zones.forEach((zone, index) => {
        const y = 100 + index * 50;
        ctx.fillText(`${zone.name}:`, 40, y);
        
        const color = zone.temp > 25 ? '#ff0000' : 
                     zone.temp < 18 ? '#4488ff' : '#00ff00';
        ctx.fillStyle = color;
        ctx.fillText(`${zone.temp.toFixed(1)}°C`, 300, y);
        ctx.fillStyle = '#00ff88';
        
        // Temperature bar
        const normalized = (zone.temp + 150) / 200; // Normalize to 0-1
        ctx.fillStyle = color + '40';
        ctx.fillRect(40, y + 10, normalized * 200, 8);
        ctx.strokeStyle = color;
        ctx.strokeRect(40, y + 10, 200, 8);
    });
}

drawLifeSupportData(ctx, canvas) {
    ctx.font = '18px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    
    ctx.fillText('ATMOSPHERE:', 40, 100);
    ctx.fillText('O₂: 21.0%', 60, 130);
    ctx.fillText('CO₂: 0.04%', 60, 160);
    ctx.fillText('Pressure: 101.3 kPa', 60, 190);
    ctx.fillText('Humidity: 45%', 60, 220);
    
    ctx.fillText('WATER SYSTEMS:', 40, 270);
    ctx.fillText('Potable: 450 L', 60, 300);
    ctx.fillText('Waste: 120 L', 60, 330);
    ctx.fillText('Recycle Rate: 93%', 60, 360);
}

drawPowerData(ctx, canvas) {
    ctx.font = '18px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    
    ctx.fillText('SOLAR ARRAYS:', 40, 100);
    ctx.fillText('Output: 14.2 kW', 60, 130);
    ctx.fillText('Efficiency: 98%', 60, 160);
    
    ctx.fillText('BATTERIES:', 40, 210);
    ctx.fillText('Charge: 87%', 60, 240);
    ctx.fillText('Status: CHARGING', 60, 270);
    
    ctx.fillText('CONSUMPTION:', 40, 320);
    ctx.fillText('Current: 8.4 kW', 60, 350);
    ctx.fillText('Peak: 12.1 kW', 60, 380);
    
    // Power graph
    ctx.strokeStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(300, 200);
    for (let i = 0; i < 50; i++) {
        const x = 300 + i * 4;
        const y = 200 - Math.sin(i * 0.2) * 30 - Math.random() * 10;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

drawCommsData(ctx, canvas) {
    ctx.font = '18px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    
    const links = [
        { name: 'Ground (Houston)', status: 'ACTIVE', strength: 98 },
        { name: 'Ground (Moscow)', status: 'ACTIVE', strength: 95 },
        { name: 'TDRS Satellite', status: 'ACTIVE', strength: 100 },
        { name: 'Dragon Capsule', status: 'ACTIVE', strength: 100 },
        { name: 'Soyuz Capsule', status: 'ACTIVE', strength: 100 }
    ];
    
    links.forEach((link, index) => {
        const y = 100 + index * 60;
        ctx.fillText(link.name, 40, y);
        
        const color = link.strength > 90 ? '#00ff00' : 
                     link.strength > 70 ? '#ffff00' : '#ff0000';
        ctx.fillStyle = color;
        ctx.fillText(link.status, 250, y);
        ctx.fillText(`${link.strength}%`, 380, y);
        
        // Signal strength bars
        for (let i = 0; i < 5; i++) {
            const barHeight = (i + 1) * 5;
            const shouldFill = (link.strength / 100) * 5 > i;
            if (shouldFill) {
                ctx.fillRect(450 + i * 15, y - barHeight, 10, barHeight);
            } else {
                ctx.strokeRect(450 + i * 15, y - barHeight, 10, barHeight);
            }
        }
        
        ctx.fillStyle = '#00ff88';
    });
}

createLifeSupportPanel() {
    const group = new THREE.Group();
    
    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 0.8),
        this.darkPanelMaterial
    );
    group.add(panel);
    
    const screen = this.createInteractiveScreen('lifesupport', 0.7, 1.1);
    screen.position.set(0.06, 0, 0);
    group.add(screen);
    
    return group;
}

createPowerManagementPanel() {
    const group = new THREE.Group();
    
    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 0.8),
        this.darkPanelMaterial
    );
    group.add(panel);
    
    const screen = this.createInteractiveScreen('power', 0.7, 1.1);
    screen.position.set(-0.06, 0, 0);
    group.add(screen);
    
    return group;
}

createCommunicationsPanel() {
    const group = new THREE.Group();
    
    const console = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.8, 1),
        this.darkPanelMaterial
    );
    console.position.y = 0.4;
    group.add(console);
    
    const screen = this.createInteractiveScreen('communications', 1.2, 0.7);
    screen.position.set(0, 0.9, 0.48);
    screen.rotation.x = -0.2;
    group.add(screen);
    
    return group;
}

// Update screens in real-time
// Update screens in real-time
updateInteractivePanels() {
    if (!this.interactivePanels) return;
    
    const time = Date.now() * 0.001;
    
    this.rooms[0].traverse(child => {
        if (child.userData.canvas && child.userData.type) {
            child.userData.updateTimer += 0.016;
            
            // Update screen every 2 seconds
            if (child.userData.updateTimer > 2) {
                child.userData.updateTimer = 0;
                
                const canvas = child.userData.canvas; // ✅ FIXED: Get canvas from userData
                const ctx = canvas.getContext('2d');
                
                // Redraw with updated data
                const type = child.userData.type;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#001a00';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 4;
                ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
                
                // Redraw content based on type
                ctx.fillStyle = '#00ff88';
                ctx.font = 'bold 32px Courier New';
                ctx.textAlign = 'center';
                
                switch(type) {
                    case 'engineering':
                        ctx.fillText('SYSTEMS OVERVIEW', canvas.width / 2, 50);
                        this.drawSystemsOverview(ctx, canvas);
                        break;
                    case 'propulsion':
                        ctx.fillText('PROPULSION', canvas.width / 2, 50);
                        this.drawPropulsionData(ctx, canvas);
                        break;
                    case 'thermal':
                        ctx.fillText('THERMAL CONTROL', canvas.width / 2, 50);
                        this.drawThermalData(ctx, canvas);
                        break;
                    case 'lifesupport':
                        ctx.fillText('LIFE SUPPORT', canvas.width / 2, 50);
                        this.drawLifeSupportData(ctx, canvas);
                        break;
                    case 'power':
                        ctx.fillText('POWER SYSTEMS', canvas.width / 2, 50);
                        this.drawPowerData(ctx, canvas);
                        break;
                    case 'communications':
                        ctx.fillText('COMMUNICATIONS', canvas.width / 2, 50);
                        this.drawCommsData(ctx, canvas);
                        break;
                }
                
                // Timestamp
                ctx.font = '16px Courier New';
                ctx.fillStyle = '#00ff88';
                ctx.textAlign = 'right';
                const date = new Date();
                ctx.fillText(`${date.toISOString()}`, canvas.width - 20, canvas.height - 20);
                
                // Update texture
                child.material.map.needsUpdate = true;
            }
            
            // ✅ FIXED: Scanline effect - properly access canvas
            const canvas = child.userData.canvas;
            if (canvas) {
                const scanline = (time * 100) % canvas.height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
                ctx.fillRect(0, scanline, canvas.width, 2);
                child.material.map.needsUpdate = true;
            }
        }
    });
}

// ========================================
// ADVANCED HOLOGRAPHIC ART (3D projections)
// ========================================

createAdvancedHolographicArt() {
    const artPositions = [
        { x: 0, y: 2.5, z: -18, type: '3d_model' },
        { x: -2.5, y: 2, z: 8, type: 'particle_system' },
        { x: 2.5, y: 2, z: 8, type: 'geometric' }
    ];
    
    artPositions.forEach(config => {
        const holoArt = this.createHolographicArtPiece(config.type);
        holoArt.position.set(config.x, config.y, config.z);
        this.rooms[0].add(holoArt);
        
        this.holographicArt = this.holographicArt || [];
        this.holographicArt.push({
            model: holoArt,
            type: config.type,
            animationPhase: Math.random() * Math.PI * 2
        });
    });
}

createHolographicArtPiece(type) {
    const group = new THREE.Group();
    
    // Hologram projector base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16),
        new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    base.position.y = -1;
    group.add(base);
    
    // Light beam
    const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.3, 1.8, 16, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        })
    );
    beam.position.y = -0.1;
    group.add(beam);
    
    // Holographic content
    let holoContent;
    
    switch(type) {
        case '3d_model':
            holoContent = this.createHolo3DModel();
            break;
        case 'particle_system':
            holoContent = this.createHoloParticleSystem();
            break;
        case 'geometric':
            holoContent = this.createHoloGeometric();
            break;
    }
    
    holoContent.position.y = 0.5;
    group.add(holoContent);
    
    group.userData.holoContent = holoContent;
    group.userData.type = type;
    
    return group;
}

createHolo3DModel() {
    // Create a complex 3D holographic sculpture
    const group = new THREE.Group();
    
    // Rotating DNA helix style
    for (let i = 0; i < 20; i++) {
        const angle1 = (i / 20) * Math.PI * 4;
        const angle2 = angle1 + Math.PI;
        
        const sphere1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.6,
                wireframe: true
            })
        );
        sphere1.position.set(
            Math.cos(angle1) * 0.4,
            i * 0.1 - 1,
            Math.sin(angle1) * 0.4
        );
        group.add(sphere1);
        
        const sphere2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.6,
                wireframe: true
            })
        );
        sphere2.position.set(
            Math.cos(angle2) * 0.4,
            i * 0.1 - 1,
            Math.sin(angle2) * 0.4
        );
        group.add(sphere2);
        
        // Connecting line
        const points = [sphere1.position, sphere2.position];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.4
            })
        );
        group.add(line);
    }
    
    return group;
}

createHoloParticleSystem() {
    // Particle cloud hologram
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Spherical distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = Math.random() * 0.8;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Cyan to magenta gradient
        const t = Math.random();
        colors[i * 3] = t;
        colors[i * 3 + 1] = 1 - t;
        colors[i * 3 + 2] = 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particles = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        })
    );
    
    return particles;
}

createHoloGeometric() {
    const group = new THREE.Group();
    
    // Nested geometric shapes
    const shapes = [
        { geometry: new THREE.IcosahedronGeometry(0.5), color: 0x00ffff },
        { geometry: new THREE.OctahedronGeometry(0.7), color: 0xff00ff },
        { geometry: new THREE.TetrahedronGeometry(0.9), color: 0x00ff88 }
    ];
    
    shapes.forEach((shape, index) => {
        const mesh = new THREE.Mesh(
            shape.geometry,
            new THREE.MeshBasicMaterial({
                color: shape.color,
                transparent: true,
                opacity: 0.3,
                wireframe: true,
                side: THREE.DoubleSide
            })
        );
        group.add(mesh);
    });
    
    return group;
}

updateHolographicArt() {
    if (!this.holographicArt) return;
    
    const time = Date.now() * 0.001;
    
    this.holographicArt.forEach(art => {
        art.animationPhase += 0.01;
        
        const content = art.model.userData.holoContent;
        if (!content) return;
        
        switch(art.type) {
            case '3d_model':
                content.rotation.y += 0.02;
                content.position.y = 0.5 + Math.sin(art.animationPhase) * 0.1;
                break;
                
            case 'particle_system':
                content.rotation.y += 0.015;
                content.rotation.x = Math.sin(art.animationPhase) * 0.3;
                
                // Pulsing effect
                const scale = 1 + Math.sin(art.animationPhase * 2) * 0.2;
                content.scale.set(scale, scale, scale);
                break;
                
            case 'geometric':
                content.children.forEach((child, index) => {
                    child.rotation.x += 0.01 * (index + 1);
                    child.rotation.y += 0.02 * (index + 1);
                    child.rotation.z += 0.015 * (index + 1);
                });
                break;
        }
        
        // Glitch effect (occasional)
        if (Math.random() < 0.001) {
            content.visible = false;
            setTimeout(() => {
                content.visible = true;
            }, 50);
        }
    });
}

// ========================================
// POST-PROCESSING EFFECTS (bloom, lens flare)
// ========================================

setupPostProcessing() {
    // Note: This requires importing EffectComposer, RenderPass, UnrealBloomPass
    // For now, we'll simulate with glow effects
    
    // Add god rays from sun
    this.createGodRays();
    
    // Add lens flare sprites
    this.createLensFlare();
    
    // Screen space glow for emissive objects
    this.enableScreenSpaceGlow();
}

createGodRays() {
    if (!this.sun) return;
    
    const rayCount = 20;
    const rayGeometry = new THREE.BufferGeometry();
    const rayPositions = [];
    
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const distance = 3 + Math.random() * 2;
        
        // From sun center
        rayPositions.push(0, 0, 0);
        // To outer ring
        rayPositions.push(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            0
        );
    }
    
    rayGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(rayPositions, 3)
    );
    
    const rays = new THREE.LineSegments(
        rayGeometry,
        new THREE.LineBasicMaterial({
            color: 0xffffee,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        })
    );
    
    if (this.sunSprite) {
        this.sunSprite.add(rays);
        rays.userData.isGodRays = true;
    }
}

createLensFlare() {
    if (!this.sunSprite) return;
    
    // Create multiple flare sprites at different distances
    const flareDistances = [0.3, 0.6, 0.9, 1.2];
    const flareSizes = [0.3, 0.5, 0.2, 0.4];
    const flareColors = [0xffffff, 0xffeeaa, 0xffccaa, 0xffaaaa];
    
    flareDistances.forEach((dist, index) => {
        const flare = new THREE.Mesh(
            new THREE.CircleGeometry(flareSizes[index], 16),
            new THREE.MeshBasicMaterial({
                color: flareColors[index],
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            })
        );
        
        flare.position.set(-dist * 10, -dist * 5, -dist * 5);
        this.sunSprite.add(flare);
    });
}

enableScreenSpaceGlow() {
    // Enhance emissive materials
    this.rooms[0].traverse(child => {
        if (child.material && child.material.emissive) {
            // Already has emissive, boost it
            child.material.emissiveIntensity = Math.min(
                child.material.emissiveIntensity * 1.2,
                2.0
            );
        }
    });
}

// Continue to Part 5 (Integration)...
// ========================================
// SPACE BACKGROUND (stars and nebulae)
// ========================================

createSpaceBackground() {
    // Black space sphere
    const spaceGeometry = new THREE.SphereGeometry(200, 32, 32);
    const space = new THREE.Mesh(
        spaceGeometry,
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide
        })
    );
    this.rooms[0].add(space);
    
    // Stars (point cloud)
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 195;
        
        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Star colors (white, blue, yellow)
        const colorType = Math.random();
        if (colorType < 0.8) {
            // White
            starColors[i * 3] = 1;
            starColors[i * 3 + 1] = 1;
            starColors[i * 3 + 2] = 1;
        } else if (colorType < 0.9) {
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
        
        starSizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: false
        })
    );
    
    this.rooms[0].add(stars);
    this.spaceBackground = space;
}

// ========================================
// VIEWING WINDOWS (along corridor)
// ========================================

createViewingWindows() {
    const windowPositions = [
        { x: -3, y: 1.5, z: -15, side: 'left' },
        { x: 3, y: 1.5, z: -15, side: 'right' },
        { x: -3, y: 1.5, z: -5, side: 'left' },
        { x: 3, y: 1.5, z: -5, side: 'right' },
        { x: -3, y: 1.5, z: 5, side: 'left' },
        { x: 3, y: 1.5, z: 5, side: 'right' },
        { x: -3, y: 1.5, z: 15, side: 'left' },
        { x: 3, y: 1.5, z: 15, side: 'right' }
    ];
    
    windowPositions.forEach(config => {
        const window = this.createWindow();
        window.position.set(config.x, config.y, config.z);
        window.rotation.y = config.side === 'left' ? Math.PI / 2 : -Math.PI / 2;
        this.rooms[0].add(window);
        this.viewingWindows.push(window);
    });
}

createWindow() {
    const group = new THREE.Group();
    
    // Window frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.5, 0.2),
        this.darkPanelMaterial
    );
    frame.castShadow = true;
    group.add(frame);
    
    // Glass pane
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 2.2),
        this.glassMaterial
    );
    glass.position.z = 0.11;
    group.add(glass);
    
    // Frame segments (cross pattern)
    const crossBar1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.5, 0.1),
        this.darkPanelMaterial
    );
    crossBar1.position.z = 0.15;
    group.add(crossBar1);
    
    const crossBar2 = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 0.1),
        this.darkPanelMaterial
    );
    crossBar2.position.z = 0.15;
    group.add(crossBar2);
    
    // Warning label
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('OBSERVATION PORT', 128, 40);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.25),
        new THREE.MeshBasicMaterial({ map: labelTexture })
    );
    label.position.set(0, 1.5, 0.11);
    group.add(label);
    
    return group;
}

// ========================================
// CONTROL ROOM (monitoring station)
// ========================================

createControlRoom() {
    const controlGroup = new THREE.Group();
    
    // Control console
    const console = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.2, 1.5),
        this.darkPanelMaterial
    );
    console.position.set(-6, 0.6, 0);
    console.rotation.y = Math.PI / 6;
    console.castShadow = true;
    this.rooms[0].add(console);
    
    // Screens (3 monitors)
    for (let i = 0; i < 3; i++) {
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.6),
            new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.6
            })
        );
        screen.position.set(
            -6 + (i - 1) * 0.9,
            1,
            0.76
        );
        screen.rotation.y = Math.PI / 6;
        screen.rotation.x = -0.2;
        this.rooms[0].add(screen);
        
        this.controlPanels.push(screen);
    }
    
    // Buttons and controls
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 6; col++) {
            const button = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8),
                new THREE.MeshStandardMaterial({
                    color: Math.random() > 0.5 ? 0xff4444 : 0x44ff44,
                    emissive: Math.random() > 0.5 ? 0xff4444 : 0x44ff44,
                    emissiveIntensity: 0.5
                })
            );
            button.position.set(
                -7 + col * 0.3,
                0.4 + row * 0.2,
                0.76
            );
            button.rotation.set(Math.PI / 2, 0, Math.PI / 6);
            this.rooms[0].add(button);
        }
    }
    
    // Chair
    const chair = this.createCommandChair();
    chair.position.set(-6, 0, -1);
    chair.rotation.y = Math.PI / 6;
    this.rooms[0].add(chair);
}

createCommandChair() {
    const group = new THREE.Group();
    
    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.6),
        this.darkPanelMaterial
    );
    seat.position.y = 0.5;
    group.add(seat);
    
    // Backrest
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.1),
        this.darkPanelMaterial
    );
    back.position.set(0, 0.8, -0.25);
    group.add(back);
    
    // Armrests
    [-0.3, 0.3].forEach(x => {
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.4, 0.5),
            this.darkPanelMaterial
        );
        arm.position.set(x, 0.6, 0);
        group.add(arm);
    });
    
    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8),
        this.panelMaterial
    );
    base.position.y = 0.25;
    group.add(base);
    
    return group;
}

// Continue to Part 2...


// ========================================
// DOCKING BAY (with spacecraft)
// ========================================

createDockingBay() {
    const bayGroup = new THREE.Group();
    
    // Docking bay module (larger chamber)
    const bay = new THREE.Mesh(
        new THREE.BoxGeometry(12, 8, 12),
        this.panelMaterial
    );
    bay.position.set(15, 0, 0);
    bay.castShadow = true;
    this.rooms[0].add(bay);
    
    // Docking port (circular)
    const port = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 2, 24),
        this.darkPanelMaterial
    );
    port.rotation.z = Math.PI / 2;
    port.position.set(21, 0, 0);
    this.rooms[0].add(port);
    
    // Docking clamps (8 around port)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const clamp = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.4,
                metalness: 0.9
            })
        );
        clamp.position.set(
            21,
            Math.cos(angle) * 3.2,
            Math.sin(angle) * 3.2
        );
        clamp.rotation.x = angle;
        this.rooms[0].add(clamp);
    }
    
    // Docked spacecraft
    const spacecraft = this.createSpacecraft();
    spacecraft.position.set(25, 0, 0);
    spacecraft.rotation.y = -Math.PI / 2;
    this.rooms[0].add(spacecraft);
    
    // Bay windows
    for (let i = 0; i < 4; i++) {
        const window = this.createBayWindow();
        const angle = (i / 4) * Math.PI * 2;
        window.position.set(
            15 + Math.cos(angle) * 5.5,
            2,
            Math.sin(angle) * 5.5
        );
        window.rotation.y = angle + Math.PI;
        this.rooms[0].add(window);
    }
    
    // Status lights around bay
    const statusColors = [0x00ff00, 0x00ff00, 0xffff00, 0xff0000];
    for (let i = 0; i < 4; i++) {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshBasicMaterial({
                color: statusColors[i],
                emissive: statusColors[i],
                emissiveIntensity: 1.0
            })
        );
        light.position.set(15 - 5 + i * 3, 4, 5);
        this.rooms[0].add(light);
        
        this.warningLights.push({
            model: light,
            color: statusColors[i],
            blinkSpeed: 1 + i * 0.5
        });
    }
    
    // "DOCKING BAY" sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DOCKING BAY', 256, 80);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 1),
        new THREE.MeshBasicMaterial({ map: signTexture })
    );
    sign.position.set(15, 4.5, 6);
    this.rooms[0].add(sign);
    
    this.stationModules.push(bayGroup);
}

createSpacecraft() {
    const group = new THREE.Group();
    
    // Main body (capsule shape)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, 4, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.8
        })
    );
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    
    // Nose cone
    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 2, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.8
        })
    );
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 3;
    group.add(nose);
    
    // Engine
    const engine = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.5, 1, 12),
        this.darkPanelMaterial
    );
    engine.rotation.z = Math.PI / 2;
    engine.position.x = -2.5;
    group.add(engine);
    
    // Engine nozzles (3)
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const nozzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 0.6, 8),
            this.darkPanelMaterial
        );
        nozzle.rotation.z = Math.PI / 2;
        nozzle.position.set(
            -3,
            Math.cos(angle) * 0.8,
            Math.sin(angle) * 0.8
        );
        group.add(nozzle);
    }
    
    // Windows
    for (let i = 0; i < 3; i++) {
        const window = new THREE.Mesh(
            new THREE.CircleGeometry(0.3, 12),
            new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                emissive: 0x4488ff,
                emissiveIntensity: 0.3
            })
        );
        window.position.set(i - 1, 1.51, 0);
        window.rotation.x = Math.PI / 2;
        group.add(window);
    }
    
    // Stripes (NASA-style)
    const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 0.3),
        new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
    );
    stripe.position.set(0, 1.51, 0);
    stripe.rotation.x = Math.PI / 2;
    group.add(stripe);
    
    // RCS thrusters (small maneuvering jets)
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const thruster = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.2),
            this.glowMaterial
        );
        thruster.position.set(
            0,
            Math.cos(angle) * 1.6,
            Math.sin(angle) * 1.6
        );
        group.add(thruster);
    }
    
    return group;
}

createBayWindow() {
    const group = new THREE.Group();
    
    // Window frame (rectangular)
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 0.15),
        this.darkPanelMaterial
    );
    group.add(frame);
    
    // Glass
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 1.3),
        this.glassMaterial
    );
    glass.position.z = 0.08;
    group.add(glass);
    
    return group;
}

// ========================================
// AIRLOCK (for spacewalk mode)
// ========================================

createAirlock() {
    const airlockGroup = new THREE.Group();
    
    // Airlock chamber
    const chamber = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 3, 16),
        this.panelMaterial
    );
    chamber.rotation.z = Math.PI / 2;
    chamber.position.set(0, 0, 25);
    chamber.castShadow = true;
    this.rooms[0].add(chamber);
    
    // Inner door
    const innerDoor = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 16),
        this.darkPanelMaterial
    );
    innerDoor.position.set(0, 0, 23.5);
    this.rooms[0].add(innerDoor);
    
    // Outer door
    const outerDoor = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 16),
        this.darkPanelMaterial
    );
    outerDoor.position.set(0, 0, 26.5);
    this.rooms[0].add(outerDoor);
    
    // Door frame rings
    [23.5, 26.5].forEach(z => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.3, 0.1, 8, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.4,
                metalness: 0.9
            })
        );
        ring.position.z = z;
        this.rooms[0].add(ring);
    });
    
    // Warning stripes around airlock
    for (let i = 0; i < 8; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 2, 0.3),
            new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xffcc00 : 0x000000
            })
        );
        const angle = (i / 8) * Math.PI * 2;
        stripe.position.set(
            Math.cos(angle) * 2.6,
            Math.sin(angle) * 2.6,
            25
        );
        stripe.rotation.z = angle + Math.PI / 2;
        this.rooms[0].add(stripe);
    }
    
    // Control panel
    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.1),
        this.darkPanelMaterial
    );
    panel.position.set(-1.5, 1, 23);
    this.rooms[0].add(panel);
    
    // "AIRLOCK" sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ AIRLOCK ⚠', 256, 80);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 0.75),
        new THREE.MeshBasicMaterial({ map: signTexture })
    );
    sign.position.set(0, 3.5, 23);
    this.rooms[0].add(sign);
    
    // Spacewalk button
    const button = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
        new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.8
        })
    );
    button.rotation.x = Math.PI / 2;
    button.position.set(-1.5, 1.2, 22.95);
    this.rooms[0].add(button);
    
    button.userData.isSpacewalkButton = true;
    
    this.airlock = {
        chamber: chamber,
        innerDoor: innerDoor,
        outerDoor: outerDoor,
        button: button
    };
}

// ========================================
// FLOATING ARTWORKS (tethered in zero-G)
// ========================================

createFloatingArtworks() {
    const artworkPositions = [
        { x: 0, y: 2, z: -10, size: 'large' },
        { x: -2, y: 2.5, z: -2, size: 'medium' },
        { x: 2, y: 1.5, z: 3, size: 'medium' },
        { x: -1.5, y: 2, z: 10, size: 'small' },
        { x: 1.5, y: 2.5, z: 12, size: 'small' },
        { x: 0, y: 2, z: -20, size: 'large' }
    ];
    
    artworkPositions.forEach((config, index) => {
        const artwork = this.createFloatingFrame(config.size);
        artwork.position.set(config.x, config.y, config.z);
        artwork.rotation.y = (Math.random() - 0.5) * 0.5;
        this.rooms[0].add(artwork);
        
        // Add tether cable
        const tether = this.createTether(config);
        this.rooms[0].add(tether);
        
        this.floatingArtworks.push({
            model: artwork,
            basePosition: artwork.position.clone(),
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.5 + Math.random() * 0.5,
            rotationSpeed: (Math.random() - 0.5) * 0.01
        });
        
        // Add artwork spot
        this.artworkSpots.push({
            x: config.x,
            y: config.y,
            z: config.z,
            rot: artwork.rotation.y,
            floating: true
        });
    });
}

createFloatingFrame(size) {
    const group = new THREE.Group();
    
    let width, height;
    switch (size) {
        case 'large':
            width = 2;
            height = 1.5;
            break;
        case 'medium':
            width = 1.5;
            height = 1;
            break;
        case 'small':
            width = 1;
            height = 0.75;
            break;
    }
    
    // Futuristic frame (glowing edges)
    const frameThickness = 0.05;
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.9,
        emissive: 0x4488ff,
        emissiveIntensity: 0.3
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
    
    // Backing (dark)
    const backing = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        this.darkPanelMaterial
    );
    backing.position.z = -0.03;
    group.add(backing);
    
    // Corner lights (LEDs)
    const corners = [
        [-width/2, height/2],
        [width/2, height/2],
        [-width/2, -height/2],
        [width/2, -height/2]
    ];
    
    corners.forEach(pos => {
        const led = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1.0
            })
        );
        led.position.set(pos[0], pos[1], 0.03);
        group.add(led);
    });
    
    return group;
}

createTether(config) {
    const points = [
        new THREE.Vector3(config.x, config.y, config.z),
        new THREE.Vector3(config.x, 0, config.z)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const tether = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0x888888,
            linewidth: 1
        })
    );
    
    return tether;
}

// ========================================
// HOLOGRAPHIC DISPLAYS (floating info panels)
// ========================================

createHolographicDisplays() {
    const displayConfigs = [
        { x: 6, y: 1.5, z: 0, text: 'GALLERY MAP' },
        { x: -6, y: 1.5, z: -10, text: 'STATION STATUS' },
        { x: 0, y: 2, z: 18, text: 'EARTH ORBIT INFO' }
    ];
    
    displayConfigs.forEach(config => {
        const display = this.createHologram(config.text);
        display.position.set(config.x, config.y, config.z);
        this.rooms[0].add(display);
        this.holographicDisplays.push(display);
    });
}

createHologram(text) {
    const group = new THREE.Group();
    
    // Hologram projector base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.3, 12),
        this.glowMaterial
    );
    base.position.y = -0.5;
    group.add(base);
    
    // Hologram panel
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Semi-transparent cyan background
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(0, 0, 512, 512);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 64, 0);
        ctx.lineTo(i * 64, 512);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * 64);
        ctx.lineTo(512, i * 64);
        ctx.stroke();
    }
    
    // Text
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 256);
    
    // Scanline effect
    for (let i = 0; i < 512; i += 4) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, i, 512, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        })
    );
    group.add(panel);
    
    // Hologram shimmer effect (will be animated)
    panel.userData.isHologram = true;
    
    return group;
}

// ========================================
// WARNING LIGHTS & PANELS
// ========================================

createWarningLights() {
    // Emergency lights along corridor
    for (let i = 0; i < 10; i++) {
        const light = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8),
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            })
        );
        light.position.set(
            i % 2 === 0 ? -2.8 : 2.8,
            2.8,
            -20 + i * 4
        );
        light.rotation.z = Math.PI / 2;
        this.rooms[0].add(light);
        
        this.warningLights.push({
            model: light,
            type: 'emergency',
            blinkSpeed: 1.5
        });
    }
    
    // Hazard panels (yellow and black stripes)
    const hazardPositions = [
        { x: -3, y: 0.1, z: -22 },
        { x: 3, y: 0.1, z: -22 },
        { x: -3, y: 0.1, z: 22 },
        { x: 3, y: 0.1, z: 22 }
    ];
    
    hazardPositions.forEach(pos => {
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 1),
            new THREE.MeshBasicMaterial({
                color: 0xffcc00
            })
        );
        panel.position.set(pos.x, pos.y, pos.z);
        panel.rotation.y = pos.x < 0 ? Math.PI / 2 : -Math.PI / 2;
        this.rooms[0].add(panel);
        
        // Black stripes
        for (let i = 0; i < 5; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(0.5, 0.15),
                new THREE.MeshBasicMaterial({
                    color: 0x000000
                })
            );
            stripe.position.set(pos.x, pos.y - 0.4 + i * 0.2, pos.z);
            stripe.rotation.y = pos.x < 0 ? Math.PI / 2 : -Math.PI / 2;
            stripe.position.z += pos.x < 0 ? 0.001 : -0.001;
            this.rooms[0].add(stripe);
        }
    });
}

// ========================================
// INTERIOR DETAILS (cables, vents, labels)
// ========================================

createInteriorDetails() {
    // Cable conduits along ceiling
    for (let i = 0; i < 20; i++) {
        const conduit = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 2),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.6,
                metalness: 0.7
            })
        );
        conduit.position.set(
            (i % 2 === 0 ? -1 : 1),
            2.7,
            -22 + i * 2.2
        );
        this.rooms[0].add(conduit);
    }
    
    // Air vents
    for (let i = 0; i < 8; i++) {
        const vent = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            this.darkPanelMaterial
        );
        vent.position.set(
            i % 2 === 0 ? -2.9 : 2.9,
            1 + Math.random() * 2,
            -18 + i * 5
        );
        vent.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        this.rooms[0].add(vent);
        
        // Vent grille
        for (let j = 0; j < 5; j++) {
            const slat = new THREE.Mesh(
                new THREE.PlaneGeometry(0.7, 0.05),
                new THREE.MeshBasicMaterial({
                    color: 0x2a2a2a
                })
            );
            slat.position.copy(vent.position);
            slat.rotation.copy(vent.rotation);
            slat.position.y += -0.3 + j * 0.15;
            slat.position.x += i % 2 === 0 ? 0.01 : -0.01;
            this.rooms[0].add(slat);
        }
    }
    
    // Informational labels
    const labels = [
        { text: '→ OBSERVATION DOME', z: -18 },
        { text: '→ CONTROL ROOM', z: -5 },
        { text: '→ DOCKING BAY', z: 8 },
        { text: '→ AIRLOCK', z: 20 }
    ];
    
    labels.forEach(config => {
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 512;
        labelCanvas.height = 128;
        const ctx = labelCanvas.getContext('2d');
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(config.text, 20, 75);
        
        const texture = new THREE.CanvasTexture(labelCanvas);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5),
            new THREE.MeshBasicMaterial({ map: texture })
        );
        label.position.set(-2.5, 2.3, config.z);
        label.rotation.y = Math.PI / 2;
        this.rooms[0].add(label);
    });
    
    // Fire extinguishers
    for (let i = 0; i < 4; i++) {
        const extinguisher = this.createFireExtinguisher();
        extinguisher.position.set(
            i % 2 === 0 ? -2.7 : 2.7,
            0.8,
            -15 + i * 10
        );
        this.rooms[0].add(extinguisher);
    }
}

createFireExtinguisher() {
    const group = new THREE.Group();
    
    // Cylinder
    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.4,
            metalness: 0.8
        })
    );
    group.add(cylinder);
    
    // Nozzle
    const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
        this.darkPanelMaterial
    );
    nozzle.position.set(0.08, 0.2, 0);
    nozzle.rotation.z = Math.PI / 4;
    group.add(nozzle);
    
    // Mounting bracket
    const bracket = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.02, 8, 12, Math.PI),
        this.panelMaterial
    );
    bracket.rotation.x = Math.PI / 2;
    group.add(bracket);
    
    return group;
}

createSpacewalkButton() {
    // Create button element
    const button = document.createElement('button');
    button.id = 'spacewalkButton';
    button.textContent = '🚀 SPACEWALK MODE';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 30px;
        background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
        color: #000000;
        border: 3px solid #ffffff;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
        transition: all 0.3s ease;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    `;
    
    // Hover effect
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.9)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.6)';
    });
    
    // Click handler
    button.addEventListener('click', () => {
        this.toggleSpacewalk();
        this.updateSpacewalkButton();
    });
    
    // Add to page
    document.body.appendChild(button);
    
    console.log("🚀 Spacewalk button created!");
}

updateSpacewalkButton() {
    const button = document.getElementById('spacewalkButton');
    
    if (!button) return;
    
    if (this.isSpacewalkMode) {
        // Active state (red)
        button.textContent = '🛰️ RETURN TO STATION';
        button.style.background = 'linear-gradient(135deg, #ff4444 0%, #ff8844 100%)';
        button.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.6)';
    } else {
        // Inactive state (green/cyan)
        button.textContent = '🚀 SPACEWALK MODE';
        button.style.background = 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)';
        button.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.6)';
    }
}

setupSpacewalkButton() {
    // Keyboard shortcut (E key)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'e' || e.key === 'E') {
            this.toggleSpacewalk();
            this.updateSpacewalkButton();
        }
    });
    
    console.log("🚀 Spacewalk controls ready! (Click button or press 'E')");
}
createSpacewalkMode() {
    // Exterior art mounting points on station hull
    const exteriorMounts = [
        { x: 0, y: 5, z: -15, facing: 'up' },
        { x: -5, y: 0, z: 0, facing: 'left' },
        { x: 5, y: 0, z: 0, facing: 'right' },
        { x: 0, y: -5, z: 10, facing: 'down' }
    ];
    
    exteriorMounts.forEach(config => {
        const mount = this.createExteriorMount();
        mount.position.set(config.x, config.y, config.z);
        
        // Orient based on facing direction
        switch(config.facing) {
            case 'up':
                mount.rotation.x = -Math.PI / 2;
                break;
            case 'down':
                mount.rotation.x = Math.PI / 2;
                break;
            case 'left':
                mount.rotation.y = Math.PI / 2;
                break;
            case 'right':
                mount.rotation.y = -Math.PI / 2;
                break;
        }
        
        this.rooms[0].add(mount);
        this.exteriorArtMounts.push(mount);
        
        // Add artwork spot
        this.artworkSpots.push({
            x: config.x,
            y: config.y,
            z: config.z,
            rot: mount.rotation.y,
            exterior: true,
            facing: config.facing
        });
    });
    
    // Solar panels (visible from exterior)
    this.createSolarPanels();
    
    // Communication antennas
    this.createAntennas();
}

createExteriorMount() {
    const group = new THREE.Group();
    
    // Mounting plate
    const plate = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.2),
        this.darkPanelMaterial
    );
    plate.castShadow = true;
    group.add(plate);
    
    // Frame (will hold artwork)
    const frameThickness = 0.1;
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Top
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, frameThickness, frameThickness),
        frameMaterial
    );
    top.position.y = 1;
    top.position.z = 0.15;
    group.add(top);
    
    // Bottom
    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, frameThickness, frameThickness),
        frameMaterial
    );
    bottom.position.y = -1;
    bottom.position.z = 0.15;
    group.add(bottom);
    
    // Sides
    [-1, 1].forEach(x => {
        const side = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, 2, frameThickness),
            frameMaterial
        );
        side.position.x = x;
        side.position.z = 0.15;
        group.add(side);
    });
    
    // Warning lights on corners
    const corners = [[-1, 1], [1, 1], [-1, -1], [1, -1]];
    corners.forEach(pos => {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            })
        );
        light.position.set(pos[0], pos[1], 0.2);
        group.add(light);
    });
    
    return group;
}

createSolarPanels() {
    // Two large solar panel arrays
    [-8, 8].forEach((x, index) => {
        const panelArray = new THREE.Group();
        
        // Support arm
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 10),
            this.panelMaterial
        );
        arm.position.set(x, 0, 0);
        this.rooms[0].add(arm);
        
        // Solar panels (3x4 grid)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 0.05, 2),
                    new THREE.MeshStandardMaterial({
                        color: 0x1a2a4a,
                        roughness: 0.2,
                        metalness: 0.9,
                        emissive: 0x1a4a8a,
                        emissiveIntensity: 0.1
                    })
                );
                panel.position.set(
                    x + (index === 0 ? -1 : 1) * (5 + col * 2.1),
                    row * 2.1 - 2,
                    col * 2.1 - 3
                );
                panelArray.add(panel);
                this.rooms[0].add(panel);
            }
        }
        
        this.solarPanels.push(panelArray);
    });
}

createAntennas() {
    const antennaPositions = [
        { x: 0, y: 4, z: -10 },
        { x: -4, y: 3, z: 5 },
        { x: 4, y: 3, z: 5 }
    ];
    
    antennaPositions.forEach(pos => {
        const antenna = this.createAntenna();
        antenna.position.set(pos.x, pos.y, pos.z);
        this.rooms[0].add(antenna);
        this.antennas.push(antenna);
    });
}

createAntenna() {
    const group = new THREE.Group();
    
    // Main mast
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 2, 8),
        this.panelMaterial
    );
    mast.position.y = 1;
    group.add(mast);
    
    // Dish
    const dish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.4, 0.2, 16),
        this.panelMaterial
    );
    dish.position.y = 2.2;
    dish.rotation.x = Math.PI / 6;
    group.add(dish);
    
    // Receiver (center of dish)
    const receiver = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        this.glowMaterial
    );
    receiver.position.y = 2.3;
    group.add(receiver);
    
    // Blinking light on top
    const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1.0
        })
    );
    light.position.y = 2.5;
    group.add(light);
    
    group.userData.antennaLight = light;
    
    return group;
}

// ========================================
// SPACE STATION UI
// ========================================

createSpaceStationUI() {
    const stationUI = document.createElement('div');
    stationUI.id = 'stationUI';
    stationUI.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(42, 42, 74, 0.95) 0%, rgba(68, 68, 136, 0.95) 100%);
        color: #00ffff;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        z-index: 100;
        border: 3px solid #00ffff;
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), 
                    inset 0 0 20px rgba(0, 0, 0, 0.5);
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        font-weight: bold;
    `;
    
    stationUI.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">🛰️</span>
            <div>
                <div style="font-size: 20px; letter-spacing: 3px;">
                    SPACE STATION GALLERY
                </div>
                <div style="font-size: 11px; opacity: 0.9; font-style: normal; letter-spacing: 1px;">
                    <span id="stationStatus">ORBIT STABLE</span> • Alt: <span id="altitude">408</span>km • Mode: <span id="viewMode">INTERIOR</span>
                </div>
            </div>
            <span style="font-size: 28px;">🌍</span>
        </div>
    `;
    
    document.body.appendChild(stationUI);
    
    // Spacewalk button instructions
    const instructions = document.createElement('div');
    instructions.id = 'spacewalkInstructions';
    instructions.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 255, 0.2);
        color: #00ffff;
        padding: 10px 20px;
        border-radius: 5px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 100;
        border: 2px solid #00ffff;
        text-align: center;
    `;
    instructions.innerHTML = `
        Press green airlock button to toggle spacewalk mode<br>
        <span style="font-size: 12px; opacity: 0.8;">(View exterior-mounted artworks)</span>
    `;
    document.body.appendChild(instructions);
}

// ========================================
// COMPLETE ANIMATION SYSTEM (all advanced features)
// ========================================

updateSpaceStationAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. EARTH ROTATION (slow, realistic)
    if (this.earth) {
        this.earthRotation += 0.0002; // ~1 rotation per hour
        this.earth.rotation.y = this.earthRotation;
        
        // Night side
        if (this.earthNight) {
            this.earthNight.rotation.y = this.earthRotation;
        }
    }
    
    // 2. ORBITAL MECHANICS (day/night transition)
    this.updateOrbitalMechanics();
    
    // 3. FLOATING ARTWORKS (gentle zero-G movement)
    this.floatingArtworks.forEach(artwork => {
        artwork.floatPhase += artwork.floatSpeed * 0.016;
        
        // Gentle bobbing
        const bobAmount = Math.sin(artwork.floatPhase) * 0.15;
        artwork.model.position.y = artwork.basePosition.y + bobAmount;
        
        // Slow rotation
        artwork.model.rotation.y += artwork.rotationSpeed;
        artwork.model.rotation.x = Math.sin(artwork.floatPhase * 0.5) * 0.1;
    });
    
    // 4. HOLOGRAPHIC DISPLAYS (shimmer effect)
    this.holographicDisplays.forEach((display, index) => {
        display.children.forEach(child => {
            if (child.userData.isHologram) {
                // Shimmer
                const shimmer = 0.7 + Math.sin(time * 3 + index) * 0.1;
                child.material.opacity = shimmer;
                
                // Slight movement
                child.position.y = Math.sin(time * 2 + index) * 0.05;
            }
        });
        
        // Rotate entire display slowly
        display.rotation.y = Math.sin(time * 0.5 + index) * 0.2;
    });
    
    // 5. ADVANCED HOLOGRAPHIC ART
    this.updateHolographicArt();
    
    // 6. WARNING LIGHTS (blinking)
    this.warningLights.forEach((lightData, index) => {
        if (lightData.type === 'emergency') {
            // Slow pulse for emergency lights
            const pulse = 0.3 + Math.sin(time * lightData.blinkSpeed) * 0.2;
            lightData.model.material.emissiveIntensity = pulse;
        } else {
            // Blink pattern for status lights
            const blink = Math.sin(time * lightData.blinkSpeed * 2) > 0.5 ? 1.0 : 0.2;
            lightData.model.material.emissiveIntensity = blink;
        }
    });
    
    // 7. INTERACTIVE CONTROL PANELS
    this.updateInteractivePanels();
    
    // 8. STATION LIGHTS (subtle variation)
    this.stationLights.forEach((light, index) => {
        const variation = 0.75 + Math.sin(time * 0.5 + index) * 0.05;
        light.intensity = variation;
    });
    
    // 9. SOLAR PANELS (tracking adjustment)
    this.solarPanels.forEach((panelArray, index) => {
        const adjustment = Math.sin(time * 0.1 + index * Math.PI) * 0.05;
        panelArray.rotation.z = adjustment;
    });
    
    // 10. ANTENNAS (scanning rotation)
    this.antennas.forEach((antenna, index) => {
        antenna.rotation.y += 0.002;
        
        // Blinking light
        const light = antenna.userData.antennaLight;
        if (light) {
            const blink = Math.sin(time * 2 + index) > 0.8 ? 1.0 : 0.3;
            light.material.emissiveIntensity = blink;
        }
    });
    
    // 11. ROBOTIC ARM (complex movement)
    this.updateRoboticArm();
    
    // 12. ADVANCED SPACEWALK (if active)
    this.updateAdvancedSpacewalk();
    
    // 13. CUPOLA SHUTTERS (breathing animation)
    if (this.cupolaShutters) {
        this.cupolaShutters.forEach((shutter, index) => {
            if (shutter.userData.isOpen) {
                // Fully open position
                shutter.userData.targetRotation = 0;
            }
            // Shutters can be animated to close during solar flares, etc.
        });
    }
    
    // 14. SPACECRAFT (subtle docking drift)
    if (this.spacecraftList) {
        this.spacecraftList.forEach((craft, index) => {
            const drift = Math.sin(time * 0.3 + index) * 0.02;
            craft.model.position.y += drift * 0.01;
        });
    }
    
    // 15. GOD RAYS (rotation)
    if (this.sunSprite) {
        this.sunSprite.traverse(child => {
            if (child.userData.isGodRays) {
                child.rotation.z += 0.001;
            }
        });
    }
    
    // 16. UPDATE UI
    const statusUI = document.getElementById('stationStatus');
    if (statusUI && Math.random() < 0.003) {
        const statuses = [
            'ORBIT STABLE',
            'ALL SYSTEMS NOMINAL',
            'LIFE SUPPORT OK',
            'POWER OPTIMAL',
            'CREW: 6 ABOARD'
        ];
        statusUI.textContent = statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    const altitudeUI = document.getElementById('altitude');
    if (altitudeUI) {
        // Slight altitude variation (realistic orbital mechanics)
        const altitude = 408 + Math.sin(time * 0.1) * 2;
        altitudeUI.textContent = altitude.toFixed(1);
    }
    
    const viewModeUI = document.getElementById('viewMode');
    if (viewModeUI) {
        viewModeUI.textContent = this.isSpacewalkMode ? 'SPACEWALK' : 'INTERIOR';
    }
    
    // 17. ATMOSPHERIC EFFECTS (occasional events)
    if (Math.random() < 0.001) {
        const events = [
            "🛰️ *Station keeping maneuver*",
            "📡 *Telemetry downlink active*",
            "☀️ *Solar array repositioning*",
            "🌍 *Passing over daylight terminator*",
            "🚀 *Dragon capsule status: DOCKED*"
        ];
        console.log(events[Math.floor(Math.random() * events.length)]);
    }
}

// ========================================
// IMPROVED SPACEWALK TOGGLE
// ========================================

toggleSpacewalk() {
    this.isSpacewalkMode = !this.isSpacewalkMode;
    
    if (this.isSpacewalkMode) {
        console.log("🚀 SPACEWALK MODE ACTIVATED");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔹 Camera: Moving to exterior view");
        console.log("🔹 MMU jetpack: ONLINE");
        console.log("🔹 Safety tether: CONNECTED");
        console.log("🔹 Press 'C' to cycle camera views");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Move camera to exterior view
        const cam = this.spacewalkCameras[this.currentSpacewalkCamera];
        this.camera.position.set(cam.pos.x, cam.pos.y, cam.pos.z);
        this.camera.lookAt(cam.lookAt.x, cam.lookAt.y, cam.lookAt.z);
        
        // Show MMU and tether
        if (this.mmu) this.mmu.visible = true;
        if (this.tether) this.tether.visible = true;
        
        // Disable pointer lock controls temporarily
        if (this.controls && this.controls.isLocked) {
            this.controls.unlock();
        }
        
        // Show spacewalk camera controls hint
        this.showSpacewalkHints();
        
    } else {
        console.log("🛰️ RETURNING TO INTERIOR");
        
        // Return to interior
        const spawn = this.getSpawnPosition();
        this.camera.position.set(spawn.x, spawn.y, spawn.z);
        this.camera.rotation.set(0, 0, 0);
        
        // Hide MMU and tether
        if (this.mmu) this.mmu.visible = false;
        if (this.tether) this.tether.visible = false;
        
        // Hide hints
        this.hideSpacewalkHints();
    }
}

showSpacewalkHints() {
    const hints = document.createElement('div');
    hints.id = 'spacewalkHints';
    hints.style.cssText = `
        position: fixed;
        bottom: 140px;
        right: 20px;
        background: rgba(0, 255, 136, 0.15);
        color: #00ff88;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 1000;
        border: 2px solid #00ff88;
        backdrop-filter: blur(10px);
    `;
    hints.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">SPACEWALK CONTROLS</div>
        <div style="font-size: 12px; line-height: 1.6;">
        🎥 Press 'C' - Cycle Camera Views<br>
        🔄 Mouse Drag - Look Around<br>
        📷 ${this.currentSpacewalkCamera + 1}/${this.spacewalkCameras.length} - ${this.spacewalkCameras[this.currentSpacewalkCamera].name}
        </div>
    `;
    document.body.appendChild(hints);
}

hideSpacewalkHints() {
    const hints = document.getElementById('spacewalkHints');
    if (hints) hints.remove();
}

updateSpacewalkHints() {
    const hints = document.getElementById('spacewalkHints');
    if (hints && this.isSpacewalkMode) {
        const cam = this.spacewalkCameras[this.currentSpacewalkCamera];
        const cameraInfo = hints.querySelector('div:last-child');
        if (cameraInfo) {
            cameraInfo.innerHTML = `
                🎥 Press 'C' - Cycle Camera Views<br>
                🔄 Mouse Drag - Look Around<br>
                📷 ${this.currentSpacewalkCamera + 1}/${this.spacewalkCameras.length} - ${cam.name}
            `;
        }
    }
}

// ========================================
// ENHANCED SPACEWALK BUTTON
// ========================================

createSpacewalkButton() {
    const btn = document.createElement('button');
    btn.id = 'spacewalkButton';
    btn.innerHTML = '🚀 SPACEWALK MODE';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 30px;
        background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
        color: #000000;
        border: 3px solid #ffffff;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
        transition: all 0.3s ease;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    `;
    
    // Hover effect
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.05)';
        btn.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.9)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = this.isSpacewalkMode ? 
            '0 0 20px rgba(255, 68, 68, 0.6)' : 
            '0 0 20px rgba(0, 255, 136, 0.6)';
    });
    
    // Click handler
    btn.onclick = () => {
        this.toggleSpacewalk();
        this.updateSpacewalkButton();
    };
    
    document.body.appendChild(btn);
}

updateSpacewalkButton() {
    const button = document.getElementById('spacewalkButton');
    if (!button) return;
    
    if (this.isSpacewalkMode) {
        button.innerHTML = '🛰️ RETURN TO STATION';
        button.style.background = 'linear-gradient(135deg, #ff4444 0%, #ff8844 100%)';
        button.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.6)';
    } else {
        button.innerHTML = '🚀 SPACEWALK MODE';
        button.style.background = 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)';
        button.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.6)';
    }
}

setupSpacewalkButton() {
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'e':  // Toggle spacewalk
                this.toggleSpacewalk();
                this.updateSpacewalkButton();
                break;
                
            case 'c':  // Cycle camera (spacewalk only)
                if (this.isSpacewalkMode) {
                    this.cycleSpacewalkCamera();
                    this.updateSpacewalkHints();
                }
                break;
        }
    });
    
    console.log("🚀 Spacewalk controls initialized!");
    console.log("   Press 'E' to toggle spacewalk mode");
    console.log("   Press 'C' to cycle cameras (when in spacewalk)");
}

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

optimizePerformance() {
    // 1. Frustum culling for distant objects
    this.rooms[0].traverse(child => {
        if (child.isMesh) {
            child.frustumCulled = true;
        }
    });
    
    // 2. Reduce geometry complexity for distant objects
    const simplifyDistantObjects = () => {
        const cameraPos = this.camera.position;
        
        this.rooms[0].traverse(child => {
            if (child.isMesh && child.geometry) {
                const distance = child.position.distanceTo(cameraPos);
                
                // If very far, reduce draw calls
                if (distance > 50) {
                    child.visible = false;
                } else {
                    child.visible = true;
                }
            }
        });
    };
    
    // Run optimization check every 2 seconds
    setInterval(simplifyDistantObjects, 2000);
    
    // 3. Limit shadow casting
    this.rooms[0].traverse(child => {
        if (child.isMesh) {
            // Only main structures cast shadows
            if (child.geometry.type === 'BoxGeometry' && 
                child.scale.x > 1 && child.scale.y > 1) {
                child.castShadow = true;
                child.receiveShadow = true;
            } else {
                child.castShadow = false;
                child.receiveShadow = false;
            }
        }
    });
    
    // 4. Use object pooling for particles
    // (Already efficient with BufferGeometry)
    
    console.log("⚡ Performance optimizations applied");
}

// ========================================
// FINAL POLISH
// ========================================

addFinalPolish() {
    // 1. Ambient sounds (visual indicators)
    this.createAmbientSoundSystem();
    
    // 2. Achievement system
    this.createAchievements();
    
    // 3. Easter eggs
    this.addEasterEggs();
}

createAmbientSoundSystem() {
    // Periodic ambient "sounds" via console
    setInterval(() => {
        if (Math.random() < 0.3) {
            const sounds = [
                "🔊 *Atmospheric circulation hum*",
                "🔊 *Distant equipment whir*",
                "🔊 *Radio chatter from ground control*",
                "🔊 *Air filtration system cycling*",
                "🔊 *Soft beep from monitoring station*"
            ];
            console.log(sounds[Math.floor(Math.random() * sounds.length)]);
        }
    }, 10000); // Every 10 seconds
}

createAchievements() {
    this.achievements = {
        visitedCupola: false,
        spacewalkActivated: false,
        allCamerasViewed: false,
        foundEasterEgg: false
    };
    
    // Check achievements periodically
    setInterval(() => {
        this.checkAchievements();
    }, 5000);
}

checkAchievements() {
    // Check if player visited cupola
    if (!this.achievements.visitedCupola) {
        const distToCupola = this.camera.position.distanceTo(
            new THREE.Vector3(0, -4, 0)
        );
        if (distToCupola < 5) {
            this.achievements.visitedCupola = true;
            console.log("🏆 ACHIEVEMENT UNLOCKED: Cupola Explorer!");
        }
    }
    
    // Check spacewalk
    if (!this.achievements.spacewalkActivated && this.isSpacewalkMode) {
        this.achievements.spacewalkActivated = true;
        console.log("🏆 ACHIEVEMENT UNLOCKED: First Spacewalk!");
    }
    
    // Check all cameras
    if (this.isSpacewalkMode && this.currentSpacewalkCamera === this.spacewalkCameras.length - 1) {
        if (!this.achievements.allCamerasViewed) {
            this.achievements.allCamerasViewed = true;
            console.log("🏆 ACHIEVEMENT UNLOCKED: Cinematographer!");
        }
    }
}

addEasterEggs() {
    // Hidden message on Earth
    const secretMessage = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 2),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.01, // Nearly invisible
            side: THREE.DoubleSide
        })
    );
    secretMessage.position.set(0, -20, -75); // Behind Earth
    secretMessage.userData.isEasterEgg = true;
    this.rooms[0].add(secretMessage);
    
    // Add collision detection for easter egg
    setInterval(() => {
        if (this.isSpacewalkMode) {
            const distToSecret = this.camera.position.distanceTo(secretMessage.position);
            if (distToSecret < 10 && !this.achievements.foundEasterEgg) {
                this.achievements.foundEasterEgg = true;
                console.log("🎉 EASTER EGG FOUND!");
                console.log("💫 'Ad Astra Per Aspera' - To the stars through difficulty");
                console.log("🏆 ACHIEVEMENT UNLOCKED: Explorer!");
                
                // Make it visible
                secretMessage.material.opacity = 1;
                secretMessage.material.color.setHex(0x00ffff);
            }
        }
    }, 1000);
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    // ✅ SKIP collision in spacewalk mode
    if (this.isSpacewalkMode) {
        return; // Free camera movement in space
    }
    
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Corridor bounds (cylindrical)
        const corridorRadius = 2.8;
        const dx = this.camera.position.x;
        const dy = this.camera.position.y - 1.6;
        const distance = Math.sqrt(dx * dx);
        
        if (distance > corridorRadius) {
            const angle = Math.atan2(0, dx);
            this.camera.position.x = Math.cos(angle) * corridorRadius;
        }
        
        // Corridor length bounds
        const minZ = -27;
        const maxZ = 27;
        this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
        
        // Observation dome area
        if (this.camera.position.z < -22) {
            const domeX = this.camera.position.x;
            const domeZ = this.camera.position.z + 25;
            const domeDistance = Math.sqrt(domeX * domeX + domeZ * domeZ);
            
            if (domeDistance > 6.5) {
                const angle = Math.atan2(domeZ, domeX);
                this.camera.position.x = Math.cos(angle) * 6.5;
                this.camera.position.z = -25 + Math.sin(angle) * 6.5;
            }
        }
        
        // Docking bay area
        if (this.camera.position.x > 8 && Math.abs(this.camera.position.z) < 8) {
            const bayRadius = 5.5;
            const bayX = this.camera.position.x - 15;
            const bayZ = this.camera.position.z;
            const bayDistance = Math.sqrt(bayX * bayX + bayZ * bayZ);
            
            if (bayDistance > bayRadius) {
                const angle = Math.atan2(bayZ, bayX);
                this.camera.position.x = 15 + Math.cos(angle) * bayRadius;
                this.camera.position.z = Math.sin(angle) * bayRadius;
            }
        }
        
        this.controls.getObject().position.copy(this.camera.position);
    }
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    // Spawn at main corridor entrance
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: 23
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
   
    this.updateSpaceStationAnimations();     // ✓ SPACE STATION (ALL FEATURES)
   
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
        case "e": 
            this.keys.e = true;
            // ✅ IMPROVED: Toggle spacewalk with E
            if (!this.isSliderActive && !this.isFocused) {
                this.toggleSpacewalk();
                this.updateSpacewalkButton();
            }
            break;
        case "c":
            // ✅ ADD: Cycle spacewalk cameras
            if (this.isSpacewalkMode) {
                this.cycleSpacewalkCamera();
                this.updateSpacewalkHints();
            }
            break;
        case "control": this.isControlPressed = true; break;
        case " ":  
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
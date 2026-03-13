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
    // STEAMPUNK AIRSHIP HANGAR - FULL VERSION
    // ========================================
    
    this.gears = [];
    this.propellers = [];
    this.steamPipes = [];
    this.mechanicalArms = [];
    this.clockworkAutomatons = [];
    this.gauges = [];
    this.balloons = [];
    this.chains = [];
    this.catwalks = [];
    this.pressureGauges = [];
    this.controlPanels = [];
    
    this.createHangarStructure();
    this.createAirship();
    this.createRotatingPropellers();
    this.createSteamPipes();
    this.createMechanicalArms();
    this.createGearWalls();
    this.createClockworkAutomatons();
    this.createHotAirBalloons();
    this.createCatwalks();
    this.createControlPanels();
    this.createPressureGauges();
    this.createChainSystems();
    this.createRivetDetails();
    this.createWorkbenches();
  
    
    console.log("⚙️ Full Steampunk Airship Hangar created!");
}

// ========================================
// ELABORATE HANGAR STRUCTURE
// ========================================

createHangarStructure() {
    const hangarRoom = new THREE.Group();
    hangarRoom.visible = true;
    
    const hangarWidth = 50;
    const hangarLength = 70;
    const hangarHeight = 25;
    
    // ========================================
    // PREMIUM MATERIALS
    // ========================================
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a2511,
        roughness: 0.9
    });
    
    const leatherMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.8
    });
    
    // ========================================
    // DETAILED WOODEN PLANK FLOOR
    // ========================================
    
    const plankWidth = 0.8;
    const numPlanks = Math.floor(hangarWidth / plankWidth);
    
    for (let i = 0; i < numPlanks; i++) {
        const plank = new THREE.Mesh(
            new THREE.BoxGeometry(plankWidth, 0.2, hangarLength),
            woodMaterial
        );
        plank.position.set(
            -hangarWidth/2 + i * plankWidth + plankWidth/2,
            0,
            0
        );
        plank.receiveShadow = true;
        hangarRoom.add(plank);
        
        // Brass nails on planks
        for (let j = 0; j < 10; j++) {
            const nail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6),
                brassMaterial
            );
            nail.position.set(
                plank.position.x,
                0.2,
                -hangarLength/2 + (j / 9) * hangarLength
            );
            hangarRoom.add(nail);
        }
    }
    
    // ========================================
    // ORNATE IRON FRAMEWORK
    // ========================================
    
    // Vertical support beams with decorative capitals
    const beamPositions = [
        { x: -hangarWidth/2, z: -hangarLength/2 },
        { x: hangarWidth/2, z: -hangarLength/2 },
        { x: -hangarWidth/2, z: -hangarLength/4 },
        { x: hangarWidth/2, z: -hangarLength/4 },
        { x: -hangarWidth/2, z: 0 },
        { x: hangarWidth/2, z: 0 },
        { x: -hangarWidth/2, z: hangarLength/4 },
        { x: hangarWidth/2, z: hangarLength/4 },
        { x: -hangarWidth/2, z: hangarLength/2 },
        { x: hangarWidth/2, z: hangarLength/2 }
    ];
    
    beamPositions.forEach(pos => {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, hangarHeight, 0.6),
            ironMaterial
        );
        beam.position.set(pos.x, hangarHeight/2, pos.z);
        beam.castShadow = true;
        hangarRoom.add(beam);
        
        // Ornate brass capital
        const capital = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.8, 1),
            brassMaterial
        );
        capital.position.set(pos.x, hangarHeight, pos.z);
        hangarRoom.add(capital);
        
        // Base plate
        const basePlate = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8),
            brassMaterial
        );
        basePlate.position.set(pos.x, 0.15, pos.z);
        hangarRoom.add(basePlate);
        
        // Rivets on beam
        for (let i = 0; i < 8; i++) {
            const rivet = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 6, 6),
                brassMaterial
            );
            rivet.position.set(pos.x + 0.3, 2 + i * 2.5, pos.z);
            hangarRoom.add(rivet);
        }
    });
    
    // ========================================
    // GOTHIC ARCHED CEILING WITH GLASS
    // ========================================
    
    const numArches = 9;
    for (let i = 0; i < numArches; i++) {
        const z = -hangarLength/2 + (i / (numArches - 1)) * hangarLength;
        
        // Arch frame
        const archCurve = new THREE.EllipseCurve(
            0, hangarHeight,
            hangarWidth/2, hangarHeight * 0.3,
            0, Math.PI,
            false, 0
        );
        
        const points = archCurve.getPoints(30);
        const archPoints = points.map(p => new THREE.Vector3(p.x, p.y, z));
        
        const archGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(archPoints),
            30,
            0.3,
            8,
            false
        );
        
        const arch = new THREE.Mesh(archGeometry, ironMaterial);
        arch.castShadow = true;
        hangarRoom.add(arch);
        
        // Brass decorative elements
        for (let j = 0; j < 7; j++) {
            const t = j / 6;
            const point = archCurve.getPoint(t);
            
            // Rivets
            const rivet = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                brassMaterial
            );
            rivet.position.set(point.x, point.y, z);
            hangarRoom.add(rivet);
            
            // Small gears at joints
            if (j % 2 === 0) {
                const smallGear = this.createGear(0.3, copperMaterial);
                smallGear.position.set(point.x, point.y, z - 0.2);
                hangarRoom.add(smallGear);
                this.gears.push(smallGear);
                smallGear.userData.rotationSpeed = 0.01;
                smallGear.userData.direction = j % 4 === 0 ? 1 : -1;
            }
        }
        
        // Crossbeams
        if (i < numArches - 1) {
            const crossbeam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, hangarLength / numArches, 8),
                copperMaterial
            );
            crossbeam.rotation.x = Math.PI / 2;
            crossbeam.position.set(0, hangarHeight + 4, z + hangarLength / numArches / 2);
            hangarRoom.add(crossbeam);
        }
    }
    
    // ========================================
    // STAINED GLASS CEILING PANELS
    // ========================================
    
    const glassColors = [0xffaa00, 0xff6600, 0xffcc88, 0xff9944];
    
    for (let i = 0; i < numArches - 1; i++) {
        const z = -hangarLength/2 + ((i + 0.5) / (numArches - 1)) * hangarLength;
        
        // Multiple glass panes
        for (let j = 0; j < 4; j++) {
            const glassPanel = new THREE.Mesh(
                new THREE.PlaneGeometry(hangarWidth / 4, hangarLength / numArches * 0.9),
                new THREE.MeshStandardMaterial({
                    color: glassColors[j],
                    transparent: true,
                    opacity: 0.5,
                    roughness: 0.1,
                    metalness: 0.1,
                    emissive: glassColors[j],
                    emissiveIntensity: 0.2,
                    side: THREE.DoubleSide
                })
            );
            glassPanel.rotation.x = -Math.PI / 2;
            glassPanel.position.set(
                -hangarWidth/2 + hangarWidth/8 + j * hangarWidth/4,
                hangarHeight + 5,
                z
            );
            hangarRoom.add(glassPanel);
        }
    }
    
    // ========================================
    // ELABORATE SIDE WALLS
    // ========================================
    
    [-hangarWidth/2, hangarWidth/2].forEach((x, wallIndex) => {
        // Main wall structure
        for (let i = 0; i < 7; i++) {
            const z = -hangarLength/2 + (i / 6) * hangarLength;
            
            const wallPanel = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, hangarHeight * 0.7, hangarLength / 7 * 0.85),
                new THREE.MeshStandardMaterial({
                    color: 0x3a3a3a,
                    roughness: 0.9,
                    metalness: 0.3
                })
            );
            wallPanel.position.set(x, hangarHeight * 0.35, z);
            wallPanel.castShadow = true;
            hangarRoom.add(wallPanel);
            
            // Brass-framed windows with mullions
            if (i % 2 === 1) {
                // Window frame
                const windowFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 4, 5),
                    brassMaterial
                );
                windowFrame.position.set(x, 10, z);
                hangarRoom.add(windowFrame);
                
                // Glass panes (4 panes)
                for (let px = 0; px < 2; px++) {
                    for (let py = 0; py < 2; py++) {
                        const pane = new THREE.Mesh(
                            new THREE.PlaneGeometry(2, 1.8),
                            new THREE.MeshStandardMaterial({
                                color: 0xffffcc,
                                transparent: true,
                                opacity: 0.6,
                                emissive: 0xffff88,
                                emissiveIntensity: 0.3
                            })
                        );
                        pane.rotation.y = wallIndex === 0 ? Math.PI/2 : -Math.PI/2;
                        pane.position.set(
                            x,
                            9 + py * 2,
                            z - 1.1 + px * 2.2
                        );
                        hangarRoom.add(pane);
                    }
                }
                
                // Mullions (cross bars)
                const verticalBar = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 4, 0.1),
                    copperMaterial
                );
                verticalBar.position.set(x, 10, z);
                hangarRoom.add(verticalBar);
                
                const horizontalBar = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.1, 5),
                    copperMaterial
                );
                horizontalBar.position.set(x, 10, z);
                hangarRoom.add(horizontalBar);
            }
            
            // Decorative brass plates
            const brassPlate = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 1, 1),
                brassMaterial
            );
            brassPlate.position.set(x, 5 + i * 2, z);
            hangarRoom.add(brassPlate);
        }
    });
    
    // ========================================
    // ELABORATE LIGHTING (Gas lamps + spot lights)
    // ========================================
    
    const ambientLight = new THREE.AmbientLight(0xffeecc, 0.5);
    hangarRoom.add(ambientLight);
    
    // Main chandeliers
    const chandelierPositions = [
        { x: 0, y: 22, z: -25 },
        { x: 0, y: 22, z: 0 },
        { x: 0, y: 22, z: 25 }
    ];
    
    chandelierPositions.forEach(pos => {
        const chandelier = this.createChandelier();
        chandelier.position.set(pos.x, pos.y, pos.z);
        hangarRoom.add(chandelier);
        
        // Point light for chandelier
        const light = new THREE.PointLight(0xffbb66, 2, 40);
        light.position.set(pos.x, pos.y - 1, pos.z);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        hangarRoom.add(light);
    });
    
    // Wall sconces
    const sconcePositions = [
        { x: -23, y: 12, z: -30 },
        { x: 23, y: 12, z: -30 },
        { x: -23, y: 12, z: 0 },
        { x: 23, y: 12, z: 0 },
        { x: -23, y: 12, z: 30 },
        { x: 23, y: 12, z: 30 }
    ];
    
    sconcePositions.forEach(pos => {
        const sconce = this.createWallSconce();
        sconce.position.set(pos.x, pos.y, pos.z);
        sconce.rotation.y = pos.x < 0 ? Math.PI/2 : -Math.PI/2;
        hangarRoom.add(sconce);
        
        // Spot light
        const spotLight = new THREE.SpotLight(0xffaa66, 1, 25, Math.PI/4, 0.5);
        spotLight.position.set(pos.x, pos.y, pos.z);
        spotLight.target.position.set(
            pos.x < 0 ? pos.x + 10 : pos.x - 10,
            0,
            pos.z
        );
        hangarRoom.add(spotLight);
        hangarRoom.add(spotLight.target);
    });
    
    // Floor lamps
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const floorLamp = this.createFloorLamp();
        floorLamp.position.set(
            Math.cos(angle) * 18,
            0,
            Math.sin(angle) * 18
        );
        hangarRoom.add(floorLamp);
    }
    
    // ========================================
    // ARTWORK DISPLAY PLATFORMS (Elaborate)
    // ========================================
    
    this.steampunkArtworkSpots = [];
    
    for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const distance = 20;
        
        // Ornate pedestal base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, 0.5, 8),
            brassMaterial
        );
        base.position.set(
            Math.cos(angle) * distance,
            0.25,
            Math.sin(angle) * distance
        );
        hangarRoom.add(base);
        
        // Main pedestal
        const pedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.9, 2.5, 8),
            brassMaterial
        );
        pedestal.position.set(
            Math.cos(angle) * distance,
            1.75,
            Math.sin(angle) * distance
        );
        pedestal.castShadow = true;
        hangarRoom.add(pedestal);
        
        // Top platform
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 0.8, 0.3, 8),
            copperMaterial
        );
        platform.position.set(
            Math.cos(angle) * distance,
            3.15,
            Math.sin(angle) * distance
        );
        hangarRoom.add(platform);
        
        // Decorative gears around pedestal
        for (let j = 0; j < 4; j++) {
            const gearAngle = (j / 4) * Math.PI * 2;
            const gear = this.createGear(0.25, copperMaterial);
            gear.position.set(
                Math.cos(angle) * distance + Math.cos(gearAngle) * 0.8,
                1.5,
                Math.sin(angle) * distance + Math.sin(gearAngle) * 0.8
            );
            gear.rotation.x = Math.PI / 2;
            hangarRoom.add(gear);
            this.gears.push(gear);
            gear.userData.rotationSpeed = 0.015;
            gear.userData.direction = j % 2 === 0 ? 1 : -1;
        }
        
        this.steampunkArtworkSpots.push({
            x: Math.cos(angle) * distance,
            y: 3.5,
            z: Math.sin(angle) * distance,
            rot: angle + Math.PI
        });
    }
    
    hangarRoom.position.set(0, 0, 0);
    this.rooms.push(hangarRoom);
    this.scene.add(hangarRoom);
}

// ========================================
// CHANDELIERS
// ========================================

createChandelier() {
    const chandelierGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Central column
    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
        brassMaterial
    );
    chandelierGroup.add(column);
    
    // Arms (6 arms)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 1.5, 6),
            brassMaterial
        );
        arm.position.set(
            Math.cos(angle) * 0.75,
            -0.5,
            Math.sin(angle) * 0.75
        );
        arm.rotation.set(
            Math.cos(angle) * 0.5,
            0,
            Math.sin(angle) * 0.5
        );
        chandelierGroup.add(arm);
        
        // Gas lamp at end
        const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xffffaa,
                transparent: true,
                opacity: 0.8
            })
        );
        lamp.position.set(
            Math.cos(angle) * 1.5,
            -0.8,
            Math.sin(angle) * 1.5
        );
        chandelierGroup.add(lamp);
        
        // Glass shade
        const shade = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 0.4, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffffcc,
                transparent: true,
                opacity: 0.6,
                roughness: 0.2
            })
        );
        shade.position.copy(lamp.position);
        shade.position.y += 0.2;
        chandelierGroup.add(shade);
    }
    
    // Top ornament
    const ornament = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        brassMaterial
    );
    ornament.position.y = 1.2;
    chandelierGroup.add(ornament);
    
    return chandelierGroup;
}

// ========================================
// WALL SCONCES
// ========================================

createWallSconce() {
    const sconceGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Wall plate
    const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1, 0.2),
        brassMaterial
    );
    sconceGroup.add(plate);
    
    // Arm extending out
    const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
        brassMaterial
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.x = 0.4;
    sconceGroup.add(arm);
    
    // Gas lamp
    const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.9
        })
    );
    lamp.position.x = 0.8;
    sconceGroup.add(lamp);
    
    // Glass shade
    const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.3, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.6
        })
    );
    shade.rotation.z = Math.PI;
    shade.position.set(0.8, 0.15, 0);
    sconceGroup.add(shade);
    
    return sconceGroup;
}

// ========================================
// FLOOR LAMPS
// ========================================

createFloorLamp() {
    const lampGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8),
        brassMaterial
    );
    base.position.y = 0.15;
    lampGroup.add(base);
    
    // Pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 4, 8),
        brassMaterial
    );
    pole.position.y = 2.15;
    lampGroup.add(pole);
    
    // Top light
    const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.8
        })
    );
    light.position.y = 4.3;
    lampGroup.add(light);
    
    // Shade
    const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 0.6, 8),
        new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8
        })
    );
    shade.position.y = 4.5;
    lampGroup.add(shade);
    
    return lampGroup;
}
// ========================================
// ELABORATE CENTRAL AIRSHIP
// ========================================

createAirship() {
    const airshipGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const leatherMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.8
    });
    
    // ========================================
    // MAIN ENVELOPE (Dirigible balloon)
    // ========================================
    
    const envelope = new THREE.Mesh(
        new THREE.SphereGeometry(6, 32, 32),
        leatherMaterial
    );
    envelope.scale.set(2.5, 1, 1);
    envelope.position.y = 15;
    envelope.castShadow = true;
    airshipGroup.add(envelope);
    
    // Brass bands around envelope (8 bands)
    for (let i = 0; i < 8; i++) {
        const band = new THREE.Mesh(
            new THREE.TorusGeometry(6 * 2.5, 0.2, 12, 32),
            brassMaterial
        );
        band.rotation.z = Math.PI / 2;
        band.position.set(-12 + i * 3.5, 15, 0);
        airshipGroup.add(band);
        
        // Rivets on bands
        for (let j = 0; j < 20; j++) {
            const angle = (j / 20) * Math.PI * 2;
            const rivet = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                brassMaterial
            );
            rivet.position.set(
                -12 + i * 3.5,
                15 + Math.cos(angle) * 6,
                Math.sin(angle) * 6
            );
            airshipGroup.add(rivet);
        }
    }
    
    // Nose cone (front)
    const noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 16),
        brassMaterial
    );
    noseCone.rotation.z = -Math.PI / 2;
    noseCone.position.set(-17, 15, 0);
    airshipGroup.add(noseCone);
    
    // Tail fins (back)
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const fin = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 3, 1.5),
            copperMaterial
        );
        fin.position.set(
            12,
            15 + Math.cos(angle) * 3,
            Math.sin(angle) * 3
        );
        fin.rotation.y = angle;
        airshipGroup.add(fin);
    }
    
    // ========================================
    // ELABORATE GONDOLA (Cabin)
    // ========================================
    
    // Main cabin body
    const gondola = new THREE.Mesh(
        new THREE.BoxGeometry(5, 2.5, 3),
        new THREE.MeshStandardMaterial({
            color: 0x4a2511,
            roughness: 0.8
        })
    );
    gondola.position.y = 11;
    gondola.castShadow = true;
    airshipGroup.add(gondola);
    
    // Brass trim (multiple layers)
    const trimLayers = [
        { y: 12.3, scale: 1.02 },
        { y: 11, scale: 1.05 },
        { y: 9.7, scale: 1.02 }
    ];
    
    trimLayers.forEach(layer => {
        const trim = new THREE.Mesh(
            new THREE.BoxGeometry(5 * layer.scale, 0.15, 3 * layer.scale),
            brassMaterial
        );
        trim.position.y = layer.y;
        airshipGroup.add(trim);
    });
    
    // Windows (10 windows around cabin)
    for (let i = 0; i < 5; i++) {
        // Front windows
        const window1 = new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.8),
            new THREE.MeshBasicMaterial({
                color: 0xffffaa,
                emissive: 0xffffaa,
                emissiveIntensity: 0.5
            })
        );
        window1.position.set(-2 + i * 1, 11.5, 1.51);
        airshipGroup.add(window1);
        
        // Window frames
        const frame1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.85, 0.1),
            brassMaterial
        );
        frame1.position.set(-2 + i * 1, 11.5, 1.55);
        airshipGroup.add(frame1);
        
        // Back windows
        const window2 = window1.clone();
        window2.position.z = -1.51;
        window2.rotation.y = Math.PI;
        airshipGroup.add(window2);
        
        const frame2 = frame1.clone();
        frame2.position.z = -1.55;
        airshipGroup.add(frame2);
    }
    
    // Doors
    [-1.5, 1.5].forEach(x => {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.8, 0.15),
            new THREE.MeshStandardMaterial({
                color: 0x4a2511,
                roughness: 0.8
            })
        );
        door.position.set(x, 10.9, 1.52);
        airshipGroup.add(door);
        
        // Door handle
        const handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.03, 8, 16),
            brassMaterial
        );
        handle.position.set(x + 0.3, 10.9, 1.58);
        airshipGroup.add(handle);
    });
    
    // Railing around deck
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1, 6),
            brassMaterial
        );
        post.position.set(
            Math.cos(angle) * 2.6,
            10.5,
            Math.sin(angle) * 1.6
        );
        airshipGroup.add(post);
    }
    
    // Railing top rail
    const railCurve = new THREE.EllipseCurve(0, 0, 2.6, 1.6, 0, Math.PI * 2, false, 0);
    const railPoints = railCurve.getPoints(50).map(p => new THREE.Vector3(p.x, 11, p.y));
    const railGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(railPoints),
        50,
        0.04,
        8,
        true
    );
    const rail = new THREE.Mesh(railGeometry, brassMaterial);
    airshipGroup.add(rail);
    
    // ========================================
    // SUSPENSION CABLES
    // ========================================
    
    for (let i = 0; i < 8; i++) {
        const x = -8 + i * 2;
        const points = [
            new THREE.Vector3(x, 11, -1.5),
            new THREE.Vector3(x, 13, -3),
            new THREE.Vector3(x, 15, -5)
        ];
        
        const cableCurve = new THREE.CatmullRomCurve3(points);
        const cableGeometry = new THREE.TubeGeometry(cableCurve, 10, 0.05, 6, false);
        const cable = new THREE.Mesh(
            cableGeometry,
            copperMaterial
        );
        airshipGroup.add(cable);
        
        // Mirror for other side
        const cable2 = cable.clone();
        cable2.position.z = 3;
        airshipGroup.add(cable2);
    }
    
    // ========================================
    // PROPULSION SYSTEM
    // ========================================
    
    // Rear propeller mount
    const propellerMount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8),
        brassMaterial
    );
    propellerMount.rotation.z = Math.PI / 2;
    propellerMount.position.set(10, 15, 0);
    airshipGroup.add(propellerMount);
    
    // Decorative housing
    const housing = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12),
        copperMaterial
    );
    housing.scale.set(1.5, 1, 1);
    housing.position.set(9, 15, 0);
    airshipGroup.add(housing);
    
    // Main propeller (6 blades)
    const propeller = new THREE.Group();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 4, 0.6),
            copperMaterial
        );
        blade.position.y = Math.cos(angle) * 2;
        blade.position.z = Math.sin(angle) * 2;
        blade.rotation.x = angle;
        blade.castShadow = true;
        propeller.add(blade);
    }
    propeller.position.set(11, 15, 0);
    propeller.rotation.z = Math.PI / 2;
    airshipGroup.add(propeller);
    
    // Side propellers (steering)
    [-3, 3].forEach(z => {
        const sidePropGroup = new THREE.Group();
        
        const sideMount = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8),
            brassMaterial
        );
        sideMount.rotation.x = Math.PI / 2;
        sidePropGroup.add(sideMount);
        
        const sideProp = new THREE.Group();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 1.5, 0.3),
                copperMaterial
            );
            blade.position.x = Math.cos(angle) * 0.75;
            blade.position.y = Math.sin(angle) * 0.75;
            blade.rotation.z = angle;
            sideProp.add(blade);
        }
        sideProp.position.z = 0.5;
        sidePropGroup.add(sideProp);
        
        sidePropGroup.position.set(0, 11, z);
        sidePropGroup.userData.propeller = sideProp;
        sidePropGroup.userData.rotationSpeed = 0.08;
        airshipGroup.add(sidePropGroup);
        this.propellers.push(sidePropGroup);
    });
    
    // Smokestacks
    [-1.5, 1.5].forEach(x => {
        const smokestack = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, 2, 8),
            copperMaterial
        );
        smokestack.position.set(x, 13.5, 0);
        airshipGroup.add(smokestack);
        
        // Brass cap
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.3, 0.3, 8),
            brassMaterial
        );
        cap.position.set(x, 14.8, 0);
        airshipGroup.add(cap);
        
        // Smoke particles
        const smoke = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0.3
            })
        );
        smoke.position.set(x, 15.5, 0);
        smoke.userData.baseY = 15.5;
        smoke.userData.riseSpeed = 0.02;
        airshipGroup.add(smoke);
        this.steamPipes.push(smoke);
    });
    
    airshipGroup.userData.propeller = propeller;
    airshipGroup.userData.rotationSpeed = 0.12;
    
    airshipGroup.position.set(0, 0, 0);
    this.rooms[0].add(airshipGroup);
    this.airship = airshipGroup;
}

// ========================================
// EXTENSIVE ROTATING PROPELLERS
// ========================================

createRotatingPropellers() {
    const propellerPositions = [
        { x: -23, y: 12, z: -30, axis: 'z', size: 'large' },
        { x: 23, y: 12, z: -30, axis: 'z', size: 'large' },
        { x: -23, y: 12, z: 0, axis: 'z', size: 'medium' },
        { x: 23, y: 12, z: 0, axis: 'z', size: 'medium' },
        { x: -23, y: 12, z: 30, axis: 'z', size: 'large' },
        { x: 23, y: 12, z: 30, axis: 'z', size: 'large' },
        { x: 0, y: 20, z: -33, axis: 'y', size: 'small' },
        { x: 0, y: 20, z: 33, axis: 'y', size: 'small' }
    ];
    
    propellerPositions.forEach(pos => {
        const propellerGroup = this.createDetailedPropeller(pos.size);
        propellerGroup.position.set(pos.x, pos.y, pos.z);
        propellerGroup.userData.axis = pos.axis;
        propellerGroup.userData.rotationSpeed = 0.04 + Math.random() * 0.04;
        
        this.rooms[0].add(propellerGroup);
        this.propellers.push(propellerGroup);
    });
}

createDetailedPropeller(size) {
    const propellerGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const sizes = {
        small: { hub: 0.3, blade: 1.5, thickness: 0.3 },
        medium: { hub: 0.4, blade: 2, thickness: 0.4 },
        large: { hub: 0.5, blade: 2.5, thickness: 0.5 }
    };
    
    const s = sizes[size];
    
    // Hub with detailing
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(s.hub, s.hub, s.thickness, 8),
        brassMaterial
    );
    hub.rotation.x = Math.PI / 2;
    propellerGroup.add(hub);
    
    // Center cap
    const cap = new THREE.Mesh(
        new THREE.SphereGeometry(s.hub * 0.7, 8, 8),
        brassMaterial
    );
    propellerGroup.add(cap);
    
    // Blades (5 blades for more detail)
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, s.blade, s.thickness),
            copperMaterial
        );
        
        blade.position.x = Math.cos(angle) * s.blade / 2;
        blade.position.y = Math.sin(angle) * s.blade / 2;
        blade.rotation.z = angle;
        blade.castShadow = true;
        propellerGroup.add(blade);
        
        // Blade edge reinforcement
        const reinforcement = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, s.blade, 0.1),
            brassMaterial
        );
        reinforcement.position.copy(blade.position);
        reinforcement.position.z = s.thickness / 2;
        reinforcement.rotation.z = angle;
        propellerGroup.add(reinforcement);
    }
    
    // Support struts
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + Math.PI / 10;
        const strut = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, s.hub * 2, 0.08),
            brassMaterial
        );
        strut.position.x = Math.cos(angle) * s.hub * 0.5;
        strut.position.y = Math.sin(angle) * s.hub * 0.5;
        strut.rotation.z = angle;
        propellerGroup.add(strut);
    }
    
    return propellerGroup;
}

// ========================================
// COMPLEX STEAM PIPE NETWORK
// ========================================

createSteamPipes() {
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // ========================================
    // HORIZONTAL CEILING PIPES (Multiple levels)
    // ========================================
    
    for (let level = 0; level < 4; level++) {
        for (let i = 0; i < 3; i++) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 65, 8),
                copperMaterial
            );
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(0, 18 - level * 1.5, -15 + i * 15);
            pipe.castShadow = true;
            this.rooms[0].add(pipe);
            
            // Joints every 10 units
            for (let j = 0; j < 7; j++) {
                const joint = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4, 8, 8),
                    brassMaterial
                );
                joint.position.set(-30 + j * 10, 18 - level * 1.5, -15 + i * 15);
                this.rooms[0].add(joint);
                
                // Valve wheels on alternating joints
                if (j % 2 === 0) {
                    const valve = this.createValveWheel();
                    valve.position.copy(joint.position);
                    valve.position.x += 0.6;
                    valve.rotation.y = Math.PI / 2;
                    this.rooms[0].add(valve);
                    this.gears.push(valve);
                    valve.userData.rotationSpeed = 0.005;
                    valve.userData.direction = 1;
                }
                
                // Pressure gauges
                if (j % 3 === 1) {
                    const gauge = this.createPressureGauge();
                    gauge.position.copy(joint.position);
                    gauge.position.y -= 0.6;
                    this.rooms[0].add(gauge);
                    this.pressureGauges.push(gauge);
                }
            }
            
            this.steamPipes.push(pipe);
        }
    }
    
    // ========================================
    // VERTICAL PIPES (Down to floor)
    // ========================================
    
    for (let i = 0; i < 6; i++) {
        const x = -20 + i * 8;
        const z = i % 2 === 0 ? -25 : 25;
        
        const verticalPipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, 18, 8),
            copperMaterial
        );
        verticalPipe.position.set(x, 9, z);
        verticalPipe.castShadow = true;
        this.rooms[0].add(verticalPipe);
        
        // Flanges
        for (let j = 0; j < 4; j++) {
            const flange = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8),
                brassMaterial
            );
            flange.position.set(x, 2 + j * 5, z);
            this.rooms[0].add(flange);
        }
    }
    
    // ========================================
    // INDUSTRIAL CHIMNEYS
    // ========================================
    
    const chimneyPositions = [
        { x: -18, z: 30 },
        { x: -10, z: 32 },
        { x: 10, z: 32 },
        { x: 18, z: 30 }
    ];
    
    chimneyPositions.forEach(pos => {
        const chimney = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.7, 20, 8),
            copperMaterial
        );
        chimney.position.set(pos.x, 15, pos.z);
        chimney.castShadow = true;
        this.rooms[0].add(chimney);
        
        // Brass bands
        for (let i = 0; i < 4; i++) {
            const band = new THREE.Mesh(
                new THREE.CylinderGeometry(0.75, 0.75, 0.3, 8),
                brassMaterial
            );
            band.position.set(pos.x, 8 + i * 5, pos.z);
            this.rooms[0].add(band);
        }
        
        // Top cap
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.6, 1, 8),
            brassMaterial
        );
        cap.position.set(pos.x, 25.5, pos.z);
        this.rooms[0].add(cap);
        
        // Steam particles (3 per chimney)
        for (let i = 0; i < 3; i++) {
            const steam = new THREE.Mesh(
                new THREE.SphereGeometry(0.5 + i * 0.2, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.3 - i * 0.08
                })
            );
            steam.position.set(pos.x, 26 + i * 0.5, pos.z);
            steam.userData.baseY = 26 + i * 0.5;
            steam.userData.riseSpeed = 0.015 + i * 0.005;
            steam.userData.phase = i;
            this.rooms[0].add(steam);
            this.steamPipes.push(steam);
        }
    });
}

createValveWheel() {
    const valveGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Main wheel
    const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.08, 12, 24),
        brassMaterial
    );
    valveGroup.add(wheel);
    
    // Spokes (6 spokes)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.4, 0.08),
            brassMaterial
        );
        spoke.position.x = Math.cos(angle) * 0.2;
        spoke.position.y = Math.sin(angle) * 0.2;
        spoke.rotation.z = angle;
        valveGroup.add(spoke);
    }
    
    // Center hub
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.15, 8),
        brassMaterial
    );
    hub.rotation.x = Math.PI / 2;
    valveGroup.add(hub);
    
    return valveGroup;
}

// ========================================
// MECHANICAL ARMS (More elaborate)
// ========================================

createMechanicalArms() {
    const armPositions = [
        { x: -20, y: 10, z: -10, artIndex: 2 },
        { x: 20, y: 12, z: -10, artIndex: 4 },
        { x: -18, y: 11, z: 10, artIndex: 6 },
        { x: 18, y: 13, z: 10, artIndex: 7 },
        { x: 0, y: 14, z: 25, artIndex: 8 }
    ];
    
    armPositions.forEach(pos => {
        const armGroup = this.createElaborateMechanicalArm();
        armGroup.position.set(pos.x, pos.y, pos.z);
        armGroup.userData.artworkIndex = pos.artIndex;
        armGroup.userData.swingPhase = Math.random() * Math.PI * 2;
        armGroup.userData.swingSpeed = 0.3 + Math.random() * 0.3;
        
        this.rooms[0].add(armGroup);
        this.mechanicalArms.push(armGroup);
    });
}

createElaborateMechanicalArm() {
    const armGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    // Heavy base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.9, 1.2, 8),
        ironMaterial
    );
    base.position.y = -0.6;
    armGroup.add(base);
    
    // Brass ring detail
    const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.1, 8, 16),
        brassMaterial
    );
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.1;
    armGroup.add(baseRing);
    
    // Lower arm segment (with hydraulics)
    const lowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 3.5, 8),
        copperMaterial
    );
    lowerArm.position.y = 2;
    lowerArm.castShadow = true;
    armGroup.add(lowerArm);
    
    // Hydraulic pistons (2)
    for (let i = 0; i < 2; i++) {
        const angle = (i / 2) * Math.PI;
        
        const piston = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8),
            ironMaterial
        );
        piston.position.set(
            Math.cos(angle) * 0.3,
            1.8,
            Math.sin(angle) * 0.3
        );
        armGroup.add(piston);
        
        // Piston rod
        const rod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6),
            brassMaterial
        );
        rod.position.copy(piston.position);
        rod.position.y += 0.3;
        armGroup.add(rod);
    }
    
    // Elbow joint (elaborate)
    const elbow = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 12, 12),
        brassMaterial
    );
    elbow.position.y = 3.8;
    armGroup.add(elbow);
    
    // Gears at elbow
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const gear = this.createGear(0.2, copperMaterial);
        gear.position.set(
            Math.cos(angle) * 0.5,
            3.8,
            Math.sin(angle) * 0.5
        );
        gear.rotation.y = Math.PI / 2;
        armGroup.add(gear);
        this.gears.push(gear);
        gear.userData.rotationSpeed = 0.02;
        gear.userData.direction = i % 2 === 0 ? 1 : -1;
    }
    
    // Upper arm segment
    const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 3, 8),
        copperMaterial
    );
    upperArm.rotation.z = Math.PI / 5;
    upperArm.position.set(0.9, 5.3, 0);
    upperArm.castShadow = true;
    armGroup.add(upperArm);
    
    // Wrist joint
    const wrist = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 10, 10),
        brassMaterial
    );
    wrist.position.set(1.8, 6.8, 0);
    armGroup.add(wrist);
    
    // Claw/gripper (3-fingered)
    const gripperBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 0.5, 6),
        ironMaterial
    );
    gripperBase.position.set(2.1, 7.2, 0);
    armGroup.add(gripperBase);
    
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const finger = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.8, 0.15),
            brassMaterial
        );
        finger.position.set(
            2.1 + Math.cos(angle) * 0.3,
            7.5,
            Math.sin(angle) * 0.3
        );
        finger.rotation.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
        );
        armGroup.add(finger);
    }
    
    armGroup.userData.segments = { lowerArm, upperArm, elbow };
    
    return armGroup;
}

// ========================================
// EXTENSIVE GEAR WALLS
// ========================================

createGearWalls() {
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Back wall - Large gear installation
    const gearSizes = [0.4, 0.6, 0.8, 1.0, 1.2, 1.5];
    
    for (let i = 0; i < 25; i++) {
        const size = gearSizes[Math.floor(Math.random() * gearSizes.length)];
        const material = i % 2 === 0 ? copperMaterial : brassMaterial;
        const gear = this.createGear(size, material);
        
        gear.position.set(
            -22 + (i % 9) * 5,
            3 + Math.floor(i / 9) * 6,
            -34
        );
        
        gear.userData.rotationSpeed = (0.01 + Math.random() * 0.02) / size;
        gear.userData.direction = Math.random() < 0.5 ? 1 : -1;
        
        this.rooms[0].add(gear);
        this.gears.push(gear);
    }
    
    // Side walls - Smaller gear clusters
    [-24, 24].forEach(x => {
        for (let i = 0; i < 8; i++) {
            const size = 0.3 + Math.random() * 0.5;
            const gear = this.createGear(size, copperMaterial);
            
            gear.position.set(
                x,
                4 + (i % 4) * 5,
                -25 + Math.floor(i / 4) * 50
            );
            gear.rotation.y = Math.PI / 2;
            
            gear.userData.rotationSpeed = 0.015 / size;
            gear.userData.direction = i % 2 === 0 ? 1 : -1;
            
            this.rooms[0].add(gear);
            this.gears.push(gear);
        }
    });
}

createGear(radius, material) {
    const gearGroup = new THREE.Group();
    
    // Main gear body (thicker)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 0.4, 16),
        material
    );
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    gearGroup.add(body);
    
    // Teeth (more detailed)
    const numTeeth = Math.floor(radius * 12);
    for (let i = 0; i < numTeeth; i++) {
        const angle = (i / numTeeth) * Math.PI * 2;
        const tooth = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.4, 0.4),
            material
        );
        tooth.position.x = Math.cos(angle) * (radius + 0.15);
        tooth.position.y = Math.sin(angle) * (radius + 0.15);
        tooth.rotation.z = angle;
        gearGroup.add(tooth);
    }
    
    // Center hub with detail
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, 0.5, 12),
        new THREE.MeshStandardMaterial({
            color: 0xb8860b,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    hub.rotation.x = Math.PI / 2;
    gearGroup.add(hub);
    
    // Spokes
    const numSpokes = Math.max(4, Math.floor(radius * 6));
    for (let i = 0; i < numSpokes; i++) {
        const angle = (i / numSpokes) * Math.PI * 2;
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, radius * 0.5, 0.1),
            material
        );
        spoke.position.x = Math.cos(angle) * radius * 0.4;
        spoke.position.y = Math.sin(angle) * radius * 0.4;
        spoke.rotation.z = angle;
        gearGroup.add(spoke);
    }
    
    // Center bolt
    const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.15, radius * 0.15, 0.6, 8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.7
        })
    );
    bolt.rotation.x = Math.PI / 2;
    gearGroup.add(bolt);
    
    return gearGroup;
}
// ========================================
// CLOCKWORK AUTOMATONS (Detailed)
// ========================================

createClockworkAutomatons() {
    const positions = [
        { x: -12, y: 0.2, z: 18, path: 'circle1' },
        { x: 12, y: 0.2, z: 18, path: 'circle2' },
        { x: -8, y: 0.2, z: -18, path: 'line1' },
        { x: 8, y: 0.2, z: -18, path: 'line2' }
    ];
    
    positions.forEach(pos => {
        const automaton = this.createAutomaton();
        automaton.position.set(pos.x, pos.y, pos.z);
        automaton.userData.walkPhase = Math.random() * Math.PI * 2;
        automaton.userData.walkSpeed = 0.5;
        automaton.userData.pathType = pos.path;
        automaton.userData.pathProgress = 0;
        
        this.rooms[0].add(automaton);
        this.clockworkAutomatons.push(automaton);
    });
}

createAutomaton() {
    const automatonGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    // ========================================
    // BODY (Victorian style)
    // ========================================
    
    // Main torso
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 1.8, 8),
        brassMaterial
    );
    body.position.y = 2.2;
    body.castShadow = true;
    automatonGroup.add(body);
    
    // Chest plate
    const chestPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.2, 0.3),
        copperMaterial
    );
    chestPlate.position.set(0, 2.2, 0.35);
    automatonGroup.add(chestPlate);
    
    // Rivets on chest
    for (let i = 0; i < 12; i++) {
        const rivet = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 6, 6),
            brassMaterial
        );
        rivet.position.set(
            -0.35 + (i % 4) * 0.25,
            2.6 - Math.floor(i / 4) * 0.35,
            0.5
        );
        automatonGroup.add(rivet);
    }
    
    // Clock mechanism window (showing gears inside)
    const window = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 16),
        new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            emissive: 0x4488ff,
            emissiveIntensity: 0.3
        })
    );
    window.position.set(0, 2.2, 0.51);
    automatonGroup.add(window);
    
    // Small gears visible through window
    for (let i = 0; i < 3; i++) {
        const gear = this.createGear(0.08 + i * 0.03, copperMaterial);
        gear.position.set(
            -0.1 + i * 0.1,
            2.15 + i * 0.05,
            0.52
        );
        automatonGroup.add(gear);
        this.gears.push(gear);
        gear.userData.rotationSpeed = 0.05 + i * 0.02;
        gear.userData.direction = i % 2 === 0 ? 1 : -1;
    }
    
    // ========================================
    // HEAD
    // ========================================
    
    // Neck
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8),
        brassMaterial
    );
    neck.position.y = 3.3;
    automatonGroup.add(neck);
    
    // Head (dome shaped)
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 12, 12),
        brassMaterial
    );
    head.position.y = 3.7;
    head.castShadow = true;
    automatonGroup.add(head);
    
    // Top hat
    const hatBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        })
    );
    hatBrim.position.y = 4;
    automatonGroup.add(hatBrim);
    
    const hatTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        })
    );
    hatTop.position.y = 4.35;
    automatonGroup.add(hatTop);
    
    // Brass band on hat
    const hatBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.1, 16),
        brassMaterial
    );
    hatBand.position.y = 4.1;
    automatonGroup.add(hatBand);
    
    // Eyes (glowing red)
    [-0.15, 0.15].forEach(x => {
        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xff3300,
                emissive: 0xff3300,
                emissiveIntensity: 1
            })
        );
        eye.position.set(x, 3.75, 0.35);
        automatonGroup.add(eye);
        
        // Monocle on right eye
        if (x > 0) {
            const monocle = new THREE.Mesh(
                new THREE.TorusGeometry(0.12, 0.02, 8, 16),
                brassMaterial
            );
            monocle.position.copy(eye.position);
            monocle.position.z += 0.05;
            automatonGroup.add(monocle);
        }
    });
    
    // Mustache (copper wires)
    const mustacheLeft = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.02, 6, 12, Math.PI),
        copperMaterial
    );
    mustacheLeft.rotation.z = -Math.PI / 4;
    mustacheLeft.position.set(-0.1, 3.5, 0.35);
    automatonGroup.add(mustacheLeft);
    
    const mustacheRight = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.02, 6, 12, Math.PI),
        copperMaterial
    );
    mustacheRight.rotation.z = Math.PI / 4 + Math.PI;
    mustacheRight.position.set(0.1, 3.5, 0.35);
    automatonGroup.add(mustacheRight);
    
    // ========================================
    // LEGS (with pistons)
    // ========================================
    
    [-0.35, 0.35].forEach((x, index) => {
        // Upper leg
        const upperLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.18, 1.2, 8),
            brassMaterial
        );
        upperLeg.position.set(x, 1, 0);
        upperLeg.castShadow = true;
        automatonGroup.add(upperLeg);
        
        // Knee joint
        const knee = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            copperMaterial
        );
        knee.position.set(x, 0.4, 0);
        automatonGroup.add(knee);
        
        // Lower leg
        const lowerLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.16, 0.8, 8),
            brassMaterial
        );
        lowerLeg.position.set(x, 0.05, 0);
        automatonGroup.add(lowerLeg);
        
        // Piston (hydraulic)
        const piston = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1, 8),
            copperMaterial
        );
        piston.position.set(x + 0.15, 0.7, 0);
        automatonGroup.add(piston);
        
        // Foot (brass boot)
        const foot = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.2, 0.5),
            brassMaterial
        );
        foot.position.set(x, -0.25, 0.1);
        foot.castShadow = true;
        automatonGroup.add(foot);
        
        // Boot toe cap
        const toeCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            copperMaterial
        );
        toeCap.rotation.x = Math.PI / 2;
        toeCap.position.set(x, -0.25, 0.3);
        automatonGroup.add(toeCap);
    });
    
    // ========================================
    // ARMS (articulated)
    // ========================================
    
    [-0.7, 0.7].forEach((x, index) => {
        // Shoulder joint
        const shoulder = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            brassMaterial
        );
        shoulder.position.set(x, 2.8, 0);
        automatonGroup.add(shoulder);
        
        // Upper arm
        const upperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.15, 0.9, 8),
            copperMaterial
        );
        upperArm.position.set(x, 2.25, 0);
        upperArm.rotation.z = x < 0 ? -0.3 : 0.3;
        automatonGroup.add(upperArm);
        
        // Elbow
        const elbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            brassMaterial
        );
        elbow.position.set(x * 1.15, 1.8, 0);
        automatonGroup.add(elbow);
        
        // Forearm
        const forearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8),
            copperMaterial
        );
        forearm.position.set(x * 1.15, 1.3, 0);
        automatonGroup.add(forearm);
        
        // Hand (3 fingers)
        const hand = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.25, 0.15),
            brassMaterial
        );
        hand.position.set(x * 1.15, 0.85, 0);
        automatonGroup.add(hand);
        
        for (let i = 0; i < 3; i++) {
            const finger = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.03, 0.2, 6),
                copperMaterial
            );
            finger.position.set(
                x * 1.15 + (i - 1) * 0.05,
                0.65,
                0
            );
            automatonGroup.add(finger);
        }
    });
    
    // ========================================
    // WIND-UP KEY (on back)
    // ========================================
    
    const keyBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
        brassMaterial
    );
    keyBase.rotation.x = Math.PI / 2;
    keyBase.position.set(0, 2.5, -0.6);
    automatonGroup.add(keyBase);
    
    const keyHandle = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.05, 8, 16),
        copperMaterial
    );
    keyHandle.rotation.y = Math.PI / 2;
    keyHandle.position.set(0, 2.5, -0.8);
    automatonGroup.add(keyHandle);
    
    // Steam vent
    const vent = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8),
        brassMaterial
    );
    vent.position.set(0, 3, -0.5);
    automatonGroup.add(vent);
    
    automatonGroup.userData.parts = {
        body,
        head,
        keyHandle,
        eyes: automatonGroup.children.filter(c => c.material?.emissive?.getHex() === 0xff3300)
    };
    
    return automatonGroup;
}

// ========================================
// HOT AIR BALLOONS (Elaborate)
// ========================================

createHotAirBalloons() {
    const balloonPositions = [
        { x: -16, y: 19, z: -22, color: [0xcc0000, 0xffff00, 0xcc0000] },
        { x: 16, y: 17, z: -22, color: [0x0000cc, 0xffffff, 0x0000cc] },
        { x: -14, y: 18, z: 22, color: [0x00cc00, 0xffff00, 0x00cc00] },
        { x: 14, y: 20, z: 22, color: [0xff6600, 0xffff00, 0xff6600] }
    ];
    
    balloonPositions.forEach(pos => {
        const balloon = this.createHotAirBalloon(pos.color);
        balloon.position.set(pos.x, pos.y, pos.z);
        balloon.userData.bobPhase = Math.random() * Math.PI * 2;
        balloon.userData.bobSpeed = 0.4 + Math.random() * 0.3;
        balloon.userData.bobAmount = 0.4;
        balloon.userData.baseY = pos.y;
        balloon.userData.swayPhase = Math.random() * Math.PI * 2;
        
        this.rooms[0].add(balloon);
        this.balloons.push(balloon);
    });
}

createHotAirBalloon(colors) {
    const balloonGroup = new THREE.Group();
    
    // ========================================
    // ENVELOPE (striped pattern)
    // ========================================
    
    const stripes = 8;
    for (let i = 0; i < stripes; i++) {
        const colorIndex = i % colors.length;
        const segment = new THREE.Mesh(
            new THREE.SphereGeometry(
                2,
                16,
                16,
                0,
                Math.PI * 2,
                (i / stripes) * Math.PI,
                Math.PI / stripes
            ),
            new THREE.MeshStandardMaterial({
                color: colors[colorIndex],
                roughness: 0.6,
                metalness: 0.1
            })
        );
        segment.castShadow = true;
        balloonGroup.add(segment);
    }
    
    // Top cap (brass)
    const topCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0xb8860b,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    topCap.position.y = 2;
    balloonGroup.add(topCap);
    
    // Vent at top
    const vent = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8),
        new THREE.MeshStandardMaterial({
            color: 0xb87333,
            roughness: 0.4,
            metalness: 0.8
        })
    );
    vent.position.y = 2.15;
    balloonGroup.add(vent);
    
    // ========================================
    // BASKET (wicker texture)
    // ========================================
    
    const basket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.6, 1, 8),
        new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9
        })
    );
    basket.position.y = -2.5;
    basket.castShadow = true;
    balloonGroup.add(basket);
    
    // Brass rim
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.05, 8, 16),
        new THREE.MeshStandardMaterial({
            color: 0xb8860b,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -2;
    balloonGroup.add(rim);
    
    // ========================================
    // ROPES (8 ropes)
    // ========================================
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        
        const points = [
            new THREE.Vector3(Math.cos(angle) * 0.6, -2, Math.sin(angle) * 0.6),
            new THREE.Vector3(Math.cos(angle) * 1, -1, Math.sin(angle) * 1),
            new THREE.Vector3(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5),
            new THREE.Vector3(Math.cos(angle) * 1.8, 1, Math.sin(angle) * 1.8)
        ];
        
        const ropeCurve = new THREE.CatmullRomCurve3(points);
        const ropeGeometry = new THREE.TubeGeometry(ropeCurve, 10, 0.03, 6, false);
        const rope = new THREE.Mesh(
            ropeGeometry,
            new THREE.MeshStandardMaterial({
                color: 0x654321,
                roughness: 0.9
            })
        );
        balloonGroup.add(rope);
    }
    
    // ========================================
    // BURNER (under envelope)
    // ========================================
    
    const burnerMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.6),
        new THREE.MeshStandardMaterial({
            color: 0xb87333,
            roughness: 0.4,
            metalness: 0.8
        })
    );
    burnerMount.position.y = -1.7;
    balloonGroup.add(burnerMount);
    
    // Flame
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8
        })
    );
    flame.position.y = -1;
    flame.rotation.x = Math.PI;
    balloonGroup.add(flame);
    balloonGroup.userData.flame = flame;
    
    // Inner glow
    const flameGlow = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.9, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.6
        })
    );
    flameGlow.position.y = -1;
    flameGlow.rotation.x = Math.PI;
    balloonGroup.add(flameGlow);
    balloonGroup.userData.flameGlow = flameGlow;
    
    // Fuel tanks
    [-0.4, 0.4].forEach(x => {
        const tank = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                roughness: 0.3,
                metalness: 0.9
            })
        );
        tank.position.set(x, -2.5, 0);
        balloonGroup.add(tank);
    });
    
    return balloonGroup;
}

// ========================================
// CATWALKS (Overhead walkways)
// ========================================

createCatwalks() {
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Main catwalk (runs length of hangar)
    const catwalkWidth = 2;
    const catwalkLength = 60;
    
    // Platform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(catwalkWidth, 0.2, catwalkLength),
        ironMaterial
    );
    platform.position.y = 16;
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.rooms[0].add(platform);
    
    // Grating pattern
    for (let i = 0; i < 30; i++) {
        const grating = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.25, catwalkLength),
            ironMaterial
        );
        grating.position.set(
            -catwalkWidth/2 + (i / 29) * catwalkWidth,
            16,
            0
        );
        this.rooms[0].add(grating);
    }
    
    // Railings (both sides)
    [-1.2, 1.2].forEach(x => {
        // Posts
        for (let i = 0; i < 12; i++) {
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8),
                brassMaterial
            );
            post.position.set(
                x,
                16.6,
                -25 + i * 5
            );
            this.rooms[0].add(post);
        }
        
        // Top rail
        const rail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, catwalkLength, 8),
            brassMaterial
        );
        rail.rotation.x = Math.PI / 2;
        rail.position.set(x, 17.2, 0);
        this.rooms[0].add(rail);
        
        // Mid rail
        const midRail = rail.clone();
        midRail.position.y = 16.6;
        this.rooms[0].add(midRail);
    });
    
    // Ladder access
    const ladder = new THREE.Group();
    for (let i = 0; i < 16; i++) {
        const rung = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8),
            brassMaterial
        );
        rung.rotation.z = Math.PI / 2;
        rung.position.y = i;
        ladder.add(rung);
    }
    ladder.position.set(-22, 0, 0);
    this.rooms[0].add(ladder);
    
    this.catwalks.push(platform);
}

// ========================================
// CONTROL PANELS
// ========================================

createControlPanels() {
    const panelPositions = [
        { x: -20, y: 1.5, z: -30, rot: 0 },
        { x: 20, y: 1.5, z: -30, rot: Math.PI },
        { x: 0, y: 1.5, z: 30, rot: Math.PI }
    ];
    
    panelPositions.forEach(pos => {
        const panel = this.createControlPanel();
        panel.position.set(pos.x, pos.y, pos.z);
        panel.rotation.y = pos.rot;
        
        this.rooms[0].add(panel);
        this.controlPanels.push(panel);
    });
}

createControlPanel() {
    const panelGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.8
    });
    
    // Base stand
    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 3, 0.5),
        new THREE.MeshStandardMaterial({
            color: 0x4a2511,
            roughness: 0.8
        })
    );
    stand.position.y = -1.5;
    stand.castShadow = true;
    panelGroup.add(stand);
    
    // Control panel face (angled)
    const panelFace = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.8, 0.1),
        copperMaterial
    );
    panelFace.rotation.x = -Math.PI / 6;
    panelFace.position.set(0, 0.2, 0.3);
    panelGroup.add(panelFace);
    
    // Brass frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.9, 0.15),
        brassMaterial
    );
    frame.rotation.x = -Math.PI / 6;
    frame.position.set(0, 0.2, 0.28);
    panelGroup.add(frame);
    
    // Gauges (4 gauges)
    for (let i = 0; i < 4; i++) {
        const gauge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
            brassMaterial
        );
        gauge.rotation.set(-Math.PI / 6, 0, Math.PI / 2);
        gauge.position.set(
            -0.5 + (i % 2) * 1,
            0.35 - Math.floor(i / 2) * 0.4,
            0.35
        );
        panelGroup.add(gauge);
        
        // Gauge face
        const gaugeFace = new THREE.Mesh(
            new THREE.CircleGeometry(0.12, 16),
            new THREE.MeshBasicMaterial({
                color: 0xffffcc,
                emissive: 0xffff88,
                emissiveIntensity: 0.3
            })
        );
        gaugeFace.position.copy(gauge.position);
        gaugeFace.position.z += 0.06;
        gaugeFace.rotation.set(-Math.PI / 6, 0, 0);
        panelGroup.add(gaugeFace);
        
        // Needle
        const needle = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.1, 0.02),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        needle.position.copy(gaugeFace.position);
        needle.position.z += 0.01;
        needle.rotation.copy(gaugeFace.rotation);
        needle.rotation.z = Math.random() * Math.PI;
        panelGroup.add(needle);
        
        this.gauges.push(needle);
    }
    
    // Levers (3 levers)
    for (let i = 0; i < 3; i++) {
        const leverBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8),
            brassMaterial
        );
        leverBase.rotation.set(-Math.PI / 6, 0, Math.PI / 2);
        leverBase.position.set(
            -0.4 + i * 0.4,
            -0.2,
            0.35
        );
        panelGroup.add(leverBase);
        
        const lever = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
            copperMaterial
        );
        lever.rotation.set(-Math.PI / 6 + 0.3, 0, Math.PI / 2);
        lever.position.copy(leverBase.position);
        lever.position.z += 0.2;
        panelGroup.add(lever);
        
        const leverHandle = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            brassMaterial
        );
        leverHandle.position.copy(lever.position);
        leverHandle.position.z += 0.2;
        panelGroup.add(leverHandle);
    }
    
    // Buttons (6 buttons)
    for (let i = 0; i < 6; i++) {
        const buttonColors = [0xff0000, 0x00ff00, 0xffff00, 0x0000ff, 0xff00ff, 0x00ffff];
        const button = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8),
            new THREE.MeshBasicMaterial({
                color: buttonColors[i],
                emissive: buttonColors[i],
                emissiveIntensity: 0.5
            })
        );
        button.rotation.set(-Math.PI / 6, 0, Math.PI / 2);
        button.position.set(
            -0.5 + (i % 3) * 0.35,
            -0.5 - Math.floor(i / 3) * 0.25,
            0.38
        );
        panelGroup.add(button);
    }
    
    return panelGroup;
}

// ========================================
// PRESSURE GAUGES
// ========================================

createPressureGauges() {
    // Already created in steam pipes, but add standalone ones
    const positions = [
        { x: -15, y: 8, z: -33 },
        { x: 0, y: 8, z: -33 },
        { x: 15, y: 8, z: -33 }
    ];
    
    positions.forEach(pos => {
        const gauge = this.createPressureGauge();
        gauge.position.set(pos.x, pos.y, pos.z);
        this.rooms[0].add(gauge);
    });
}

createPressureGauge() {
    const gaugeGroup = new THREE.Group();
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Mounting plate
    const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.1),
        brassMaterial
    );
    gaugeGroup.add(plate);
    
    // Gauge body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
        brassMaterial
    );
    body.rotation.x = Math.PI / 2;
    body.position.z = 0.1;
    gaugeGroup.add(body);
    
    // Glass face
    const face = new THREE.Mesh(
        new THREE.CircleGeometry(0.28, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.8,
            emissive: 0xffff88,
            emissiveIntensity: 0.2
        })
    );
    face.position.z = 0.21;
    gaugeGroup.add(face);
    
    // Needle
    const needle = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.2, 0.02),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    needle.position.z = 0.22;
    needle.rotation.z = Math.random() * Math.PI - Math.PI / 2;
    gaugeGroup.add(needle);
    gaugeGroup.userData.needle = needle;
    
    // Pressure marks
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI - Math.PI / 2;
        const mark = new THREE.Mesh(
            new THREE.BoxGeometry(0.01, 0.05, 0.01),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        mark.position.set(
            Math.cos(angle) * 0.22,
            Math.sin(angle) * 0.22,
            0.22
        );
        mark.rotation.z = angle - Math.PI / 2;
        gaugeGroup.add(mark);
    }
    
    return gaugeGroup;
}

// ========================================
// CHAIN SYSTEMS
// ========================================

createChainSystems() {
    // Chains for lifting heavy equipment
    const chainPositions = [
        { x: -10, z: -20, length: 15 },
        { x: 10, z: -20, length: 12 },
        { x: -10, z: 20, length: 14 },
        { x: 10, z: 20, length: 13 }
    ];
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    chainPositions.forEach(pos => {
        // Chain links
        for (let i = 0; i < pos.length; i++) {
            const link = new THREE.Mesh(
                new THREE.TorusGeometry(0.15, 0.04, 8, 16),
                ironMaterial
            );
            link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
            link.position.set(pos.x, 24 - i, pos.z);
            this.rooms[0].add(link);
            this.chains.push(link);
        }
        
        // Hook at bottom
        const hook = new THREE.Mesh(
            new THREE.TorusGeometry(0.3, 0.06, 8, 16, Math.PI),
            ironMaterial
        );
        hook.position.set(pos.x, 24 - pos.length - 0.5, pos.z);
        this.rooms[0].add(hook);
    });
}

// ========================================
// RIVET DETAILS
// ========================================

createRivetDetails() {
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Rivets on floor beams
    for (let x = -20; x <= 20; x += 5) {
        for (let z = -30; z <= 30; z += 10) {
            const rivet = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                brassMaterial
            );
            rivet.position.set(x, 0.25, z);
            this.rooms[0].add(rivet);
        }
    }
    
    // Rivets on walls (decorative)
    for (let i = 0; i < 50; i++) {
        const rivet = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 6, 6),
            brassMaterial
        );
        rivet.position.set(
            Math.random() < 0.5 ? -23.5 : 23.5,
            2 + Math.random() * 15,
            -30 + Math.random() * 60
        );
        this.rooms[0].add(rivet);
    }
}

// ========================================
// WORKBENCHES
// ========================================

createWorkbenches() {
    const benchPositions = [
        { x: -20, z: -25 },
        { x: 20, z: -25 },
        { x: -20, z: 25 },
        { x: 20, z: 25 }
    ];
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a2511,
        roughness: 0.9
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.7
    });
    
    benchPositions.forEach(pos => {
        // Table top
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.2, 2),
            woodMaterial
        );
        top.position.set(pos.x, 3, pos.z);
        top.castShadow = true;
        this.rooms[0].add(top);
        
        // Legs (4)
        [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]].forEach(offset => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 3, 8),
                ironMaterial
            );
            leg.position.set(pos.x + offset[0], 1.5, pos.z + offset[1]);
            this.rooms[0].add(leg);
        });
        
        // Tools on bench
        const hammer = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.1),
            ironMaterial
        );
        hammer.position.set(pos.x - 0.5, 3.15, pos.z);
        this.rooms[0].add(hammer);
        
        const wrench = new THREE.Mesh(
            new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI),
            ironMaterial
        );
        wrench.position.set(pos.x + 0.5, 3.15, pos.z);
        wrench.rotation.x = -Math.PI / 2;
        this.rooms[0].add(wrench);
    });
}

// ========================================
// STEAMPUNK UI
// ========================================



// ========================================
// COMPLETE ANIMATIONS
// ========================================

updateSteampunkAnimations() {
    const time = this.time || Date.now() * 0.001;
    
    // 1. AIRSHIP PROPELLER
    if (this.airship && this.airship.userData.propeller) {
        this.airship.userData.propeller.rotation.x += this.airship.userData.rotationSpeed;
        
        // Airship gentle sway
        this.airship.rotation.z = Math.sin(time * 0.3) * 0.02;
        this.airship.position.y = Math.sin(time * 0.5) * 0.3;
    }
    
    // 2. ALL PROPELLERS
    if (this.propellers) {
        this.propellers.forEach(propeller => {
            if (propeller.userData.axis === 'z') {
                propeller.rotation.z += propeller.userData.rotationSpeed;
            } else if (propeller.userData.axis === 'y') {
                propeller.rotation.y += propeller.userData.rotationSpeed;
            }
            
            if (propeller.userData.propeller) {
                propeller.userData.propeller.rotation.z += propeller.userData.rotationSpeed;
            }
        });
    }
    
    // 3. ALL GEARS ROTATING
    if (this.gears) {
        this.gears.forEach(gear => {
            if (gear.userData.rotationSpeed) {
                gear.rotation.z += gear.userData.rotationSpeed * gear.userData.direction;
            }
        });
    }
    
    // 4. MECHANICAL ARMS SWINGING
    if (this.mechanicalArms) {
        this.mechanicalArms.forEach(arm => {
            arm.userData.swingPhase += 0.01 * arm.userData.swingSpeed;
            const swing = Math.sin(arm.userData.swingPhase) * 0.4;
            
            if (arm.userData.segments) {
                arm.userData.segments.lowerArm.rotation.z = swing;
                arm.userData.segments.upperArm.rotation.z = swing * 1.8;
                arm.userData.segments.elbow.rotation.y = swing * 0.5;
            }
        });
    }
    
    // 5. STEAM RISING FROM PIPES & CHIMNEYS
    if (this.steamPipes) {
        this.steamPipes.forEach(pipe => {
            if (pipe.userData.riseSpeed) {
                pipe.position.y += pipe.userData.riseSpeed;
                
                // Fade and drift
                if (pipe.material.opacity !== undefined) {
                    pipe.material.opacity = Math.max(
                        0,
                        0.3 - (pipe.position.y - pipe.userData.baseY) * 0.04
                    );
                }
                
                // Drift sideways
                pipe.position.x += Math.sin(time * 2 + pipe.userData.phase) * 0.005;
                
                // Reset when too high
                if (pipe.position.y > pipe.userData.baseY + 8) {
                    pipe.position.y = pipe.userData.baseY;
                    if (pipe.material.opacity !== undefined) {
                        pipe.material.opacity = 0.3;
                    }
                }
            }
        });
    }
    
    // 6. CLOCKWORK AUTOMATONS
    if (this.clockworkAutomatons) {
        this.clockworkAutomatons.forEach(automaton => {
            automaton.userData.walkPhase += 0.02 * automaton.userData.walkSpeed;
            
            if (automaton.userData.parts) {
                // Head bobbing
                automaton.userData.parts.head.position.y = 3.7 + 
                    Math.sin(automaton.userData.walkPhase * 3) * 0.08;
                
                // Body swaying
                automaton.userData.parts.body.rotation.z = 
                    Math.sin(automaton.userData.walkPhase * 2) * 0.05;
                
                // Wind-up key spinning
                automaton.userData.parts.keyHandle.rotation.y += 0.08;
                
                // Eyes glowing pulse
                automaton.userData.parts.eyes.forEach(eye => {
                    eye.material.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.2;
                });
            }
            
            // Walking animation (subtle position change)
            automaton.position.x += Math.sin(automaton.userData.walkPhase) * 0.002;
        });
    }
    
    // 7. HOT AIR BALLOONS BOBBING
    if (this.balloons) {
        this.balloons.forEach(balloon => {
            balloon.userData.bobPhase += 0.01 * balloon.userData.bobSpeed;
            balloon.userData.swayPhase += 0.008;
            
            balloon.position.y = balloon.userData.baseY + 
                Math.sin(balloon.userData.bobPhase) * balloon.userData.bobAmount;
            
            balloon.position.x += Math.sin(balloon.userData.swayPhase) * 0.01;
            
            // Flame flickering
            if (balloon.userData.flame) {
                balloon.userData.flame.scale.y = 1 + Math.sin(time * 12) * 0.3;
                balloon.userData.flame.material.opacity = 0.6 + Math.sin(time * 10) * 0.2;
            }
            
            if (balloon.userData.flameGlow) {
                balloon.userData.flameGlow.scale.y = 1 + Math.sin(time * 15) * 0.25;
                balloon.userData.flameGlow.material.opacity = 0.4 + Math.sin(time * 8) * 0.2;
            }
        });
    }
    
    // 8. PRESSURE GAUGE NEEDLES
    if (this.pressureGauges) {
        this.pressureGauges.forEach((gauge, index) => {
            if (gauge.userData.needle) {
                gauge.userData.needle.rotation.z = -Math.PI / 2 + 
                    Math.sin(time * 0.5 + index) * 0.8;
            }
        });
    }
    
    // 9. GAUGE NEEDLES IN CONTROL PANELS
    if (this.gauges) {
        this.gauges.forEach((needle, index) => {
            needle.rotation.z = Math.sin(time + index) * Math.PI / 3;
        });
    }
    
    // 10. CHAINS SWAYING
    if (this.chains) {
        this.chains.forEach((link, index) => {
            link.rotation.y = Math.sin(time * 0.5 + index * 0.1) * 0.05;
        });
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
    this.updateSteampunkAnimations(); // ✓ ADD THIS
   
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
checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // ✓ FIXED: Sky Islands bounds (much larger to reach all islands)
        const minX = -50; // ✓ CHANGE: was -13, now -50
        const maxX = 50;  // ✓ CHANGE: was 13, now 50
        const minZ = -50; // ✓ CHANGE: was -13, now -50
        const maxZ = 50;  // ✓ CHANGE: was 13, now 50
        const minY = -10; // Safety net (respawn if falling too far)

        // Respawn if falling into the void
        if (this.camera.position.y < minY) {
            console.log("⚠️ Fell into void! Respawning at main island...");
            this.camera.position.set(0, 2, 10);
            this.controls.getObject().position.copy(this.camera.position);
            
            // Show respawn message
            this.showRespawnMessage();
        }

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
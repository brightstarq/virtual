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

 this.neonSigns = [];
    this.holographicAds = [];
    this.ledBillboards = [];
    this.steamVents = [];
    this.droneCameras = [];
    this.vendingMachines = [];
    this.flickeringScreens = [];
    this.rainDroplets = [];
    this.puddles = [];
    this.cyberpunkLights = [];
    this.fogLayers = [];
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
    // Initialize arrays
    this.artworkSpots = [];
    this.neonSigns = [];
    this.holographicAds = [];
    this.ledBillboards = [];
    this.steamVents = [];
    this.droneCameras = [];
    this.vendingMachines = [];
    this.flickeringScreens = [];
    this.rainDroplets = [];
    this.puddles = [];
    this.cyberpunkLights = [];
    
    // Create environment (in order)
    this.createCyberpunkAlley();           
    this.createNeonSigns();                
    this.createHolographicDisplays();      
    this.createLEDBillboards();  // ✅ ARTWORK DISPLAYS          
    this.createSteamVents();               
    this.createRainEffect();               
    this.createPuddles();                  
    this.createVendingMachines();          
    this.createCables();                   
    this.createFlickeringScreens();        
    this.createCyberpunkLighting();        
    this.createCyberpunkFog();
    this.createDroneCameras(); // ✅ LAST (so they spawn at player position)
    
    console.log("🌃 ═══════════════════════════════════════");
    console.log("🌃  CYBERPUNK NEON ALLEY INITIALIZED");
    console.log("🌃 ═══════════════════════════════════════");
    console.log("✅ Neon Signs: " + this.neonSigns.length);
    console.log("✅ LED Billboards (Artworks): " + this.ledBillboards.length);
    console.log("✅ Holograms: " + this.holographicAds.length);
    console.log("✅ Drones Following: " + this.droneCameras.length);
    console.log("✅ Steam Vents: " + this.steamVents.length);
    console.log("✅ Rain Particles: " + (this.rainDroplets.length > 0 ? "ACTIVE" : "NONE"));
    console.log("✅ Puddles: " + this.puddles.length);
    console.log("✅ Vending Machines: " + this.vendingMachines.length);
    console.log("✅ Total Artwork Spots: " + this.artworkSpots.length);
    console.log("🌃 ═══════════════════════════════════════");
    console.log("🎮 CONTROLS:");
    console.log("   WASD - Move through alley");
    console.log("   Mouse - Look around");
    console.log("   Q/E - Rotate view");
    console.log("   ESC - Exit focus");
    console.log("🌃 ═══════════════════════════════════════");
    console.log("🌧️ ATMOSPHERIC EFFECTS:");
    console.log("   ✓ Constant rainfall");
    console.log("   ✓ Reflective puddles");
    console.log("   ✓ Steam vents");
    console.log("   ✓ Volumetric fog");
    console.log("   ✓ Neon sign flickering");
    console.log("   ✓ Holographic glitches");
    console.log("   ✓ Drone cameras following you");
    console.log("🌃 ═══════════════════════════════════════");
}

// ========================================
// CYBERPUNK ALLEY (main structure)
// ========================================

createCyberpunkAlley() {
    const alleyRoom = new THREE.Group();
    alleyRoom.visible = true;
    
    // Materials
    this.wetConcreteMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.7
    });
    
    this.neonPinkMaterial = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 1.5
    });
    
    this.neonCyanMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1.5
    });
    
    this.darkMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.6,
        metalness: 0.9
    });
    
    // Alley dimensions (narrow, tall buildings)
    const alleyWidth = 12;
    const alleyLength = 80;
    const buildingHeight = 40;
    
    // Floor (wet, reflective)
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(alleyWidth, alleyLength),
        this.wetConcreteMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    alleyRoom.add(floor);
    
    // Left building wall (with windows and details)
    this.createBuildingWall('left', alleyLength, buildingHeight, alleyRoom);
    
    // Right building wall
    this.createBuildingWall('right', alleyLength, buildingHeight, alleyRoom);
    
    // Back wall (dead end)
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(alleyWidth, buildingHeight, 2),
        this.darkMetalMaterial
    );
    backWall.position.set(0, buildingHeight / 2, -alleyLength / 2);
    backWall.castShadow = true;
    alleyRoom.add(backWall);
    
    // Ceiling/Sky (dark, rainy)
    const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(alleyWidth, alleyLength),
        new THREE.MeshBasicMaterial({
            color: 0x0a0a0a,
            side: THREE.BackSide
        })
    );
    sky.rotation.x = Math.PI / 2;
    sky.position.y = buildingHeight;
    alleyRoom.add(sky);
    
    // Ambient lighting (dim, purple-tinted)
    const ambientLight = new THREE.AmbientLight(0x4a2a6a, 0.3);
    alleyRoom.add(ambientLight);
    
    this.rooms.push(alleyRoom);
    this.scene.add(alleyRoom);
}

createBuildingWall(side, length, height, parent) {
    const x = side === 'left' ? -6 : 6;
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    
    // Main wall
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(length, height, 2),
        this.darkMetalMaterial
    );
    wall.position.set(x, height / 2, 0);
    wall.rotation.y = rotation;
    wall.castShadow = true;
    wall.receiveShadow = true;
    parent.add(wall);
    
    // Windows (dark, some lit)
    const windowsPerFloor = 12;
    const floors = 8;
    
    for (let floor = 0; floor < floors; floor++) {
        for (let i = 0; i < windowsPerFloor; i++) {
            const window = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 2),
                new THREE.MeshBasicMaterial({
                    color: Math.random() < 0.3 ? 0xffaa00 : 0x1a1a2a,
                    emissive: Math.random() < 0.3 ? 0xffaa00 : 0x000000,
                    emissiveIntensity: 0.5
                })
            );
            
            window.position.set(
                x + (side === 'left' ? -1.01 : 1.01),
                5 + floor * 4,
                -length / 2 + 5 + i * 6
            );
            window.rotation.y = rotation;
            parent.add(window);
            
            // Some windows flicker
            if (Math.random() < 0.2) {
                this.flickeringScreens.push({
                    mesh: window,
                    baseIntensity: 0.5,
                    flickerSpeed: 0.5 + Math.random() * 2
                });
            }
        }
    }
    
    // Fire escapes (metal stairs)
    for (let i = 0; i < 4; i++) {
        const escape = this.createFireEscape();
        escape.position.set(
            x + (side === 'left' ? -2 : 2),
            10 + i * 8,
            -30 + i * 15
        );
        escape.rotation.y = rotation;
        parent.add(escape);
    }
}

createFireEscape() {
    const group = new THREE.Group();
    
    // Platform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.1, 3),
        new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.8,
            metalness: 0.9
        })
    );
    group.add(platform);
    
    // Railings
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const railing = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1, 3),
            new THREE.MeshStandardMaterial({
                color: 0x6a6a6a,
                roughness: 0.7,
                metalness: 0.8
            })
        );
        railing.position.set(
            Math.cos(angle) * 1.5,
            0.5,
            Math.sin(angle) * 1.5
        );
        group.add(railing);
    }
    
    return group;
}

// ========================================
// NEON SIGNS (vertical Japanese-style)
// ========================================

createNeonSigns() {
    const signConfigs = [
        // Left wall signs
        { x: -6.5, y: 15, z: -20, text: '拉麺', color: 0xff0066, vertical: true },
        { x: -6.5, y: 20, z: -5, text: 'BAR', color: 0x00ffff, vertical: false },
        { x: -6.5, y: 12, z: 10, text: '居酒屋', color: 0xff9900, vertical: true },
        { x: -6.5, y: 25, z: 25, text: 'HOTEL', color: 0xff00ff, vertical: false },
        
        // Right wall signs
        { x: 6.5, y: 18, z: -25, text: 'CYBER', color: 0x00ff00, vertical: false },
        { x: 6.5, y: 14, z: -8, text: '薬局', color: 0xff0000, vertical: true },
        { x: 6.5, y: 22, z: 8, text: 'CLUB', color: 0xff00ff, vertical: false },
        { x: 6.5, y: 16, z: 22, text: '寿司', color: 0x00ffff, vertical: true }
    ];
    
    signConfigs.forEach(config => {
        const sign = this.createNeonSign(config);
        this.rooms[0].add(sign);
        this.neonSigns.push(sign);
    });
}

createNeonSign(config) {
    const group = new THREE.Group();
    
    // Sign backing (dark panel)
    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(
            config.vertical ? 2 : 4,
            config.vertical ? 6 : 2,
            0.2
        ),
        this.darkMetalMaterial
    );
    group.add(backing);
    
    // Neon text (using canvas texture)
    const canvas = document.createElement('canvas');
    canvas.width = config.vertical ? 256 : 512;
    canvas.height = config.vertical ? 512 : 256;
    const ctx = canvas.getContext('2d');
    
    // Background (transparent)
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Neon glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = `#${config.color.toString(16).padStart(6, '0')}`;
    ctx.fillStyle = `#${config.color.toString(16).padStart(6, '0')}`;
    ctx.font = `bold ${config.vertical ? '80px' : '120px'} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (config.vertical) {
        // Vertical text
        const chars = config.text.split('');
        chars.forEach((char, index) => {
            ctx.fillText(char, canvas.width / 2, 80 + index * 100);
        });
    } else {
        // Horizontal text
        ctx.fillText(config.text, canvas.width / 2, canvas.height / 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const neonText = new THREE.Mesh(
        new THREE.PlaneGeometry(
            config.vertical ? 1.8 : 3.8,
            config.vertical ? 5.8 : 1.8
        ),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        })
    );
    neonText.position.z = 0.15;
    group.add(neonText);
    
    // Point light for illumination
    const light = new THREE.PointLight(config.color, 3, 15);
    light.position.z = 2;
    group.add(light);
    
    // Position the sign
    group.position.set(config.x, config.y, config.z);
    group.rotation.y = config.x < 0 ? Math.PI / 2 : -Math.PI / 2;
    
    // Store for animation
    group.userData = {
        light: light,
        baseIntensity: 3,
        flickerSpeed: 0.5 + Math.random(),
        color: config.color
    };
    
    return group;
}

// Continue to Part 2...

// ========================================
// LED BILLBOARDS (massive screens for artwork)
// ========================================

createLEDBillboards() {
    const billboardConfigs = [
        // Left wall billboards
        { x: -6.2, y: 10, z: -30, width: 8, height: 5, rotation: Math.PI / 2 },
        { x: -6.2, y: 15, z: 0, width: 6, height: 4, rotation: Math.PI / 2 },
        { x: -6.2, y: 12, z: 20, width: 7, height: 4.5, rotation: Math.PI / 2 },
        
        // Right wall billboards
        { x: 6.2, y: 12, z: -25, width: 7, height: 5, rotation: -Math.PI / 2 },
        { x: 6.2, y: 16, z: -2, width: 8, height: 6, rotation: -Math.PI / 2 },
        { x: 6.2, y: 14, z: 18, width: 6, height: 4, rotation: -Math.PI / 2 },
        
        // Back wall (huge screen)
        { x: 0, y: 20, z: -39.5, width: 10, height: 8, rotation: 0 }
    ];
    
    billboardConfigs.forEach((config, index) => {
        const billboard = this.createLEDBillboard(config);
        this.rooms[0].add(billboard);
        this.ledBillboards.push(billboard);
        
        // Add to artwork spots
        this.artworkSpots.push({
            position: new THREE.Vector3(config.x, config.y, config.z),
            normal: new THREE.Vector3(
                Math.sin(config.rotation),
                0,
                Math.cos(config.rotation)
            ),
            mesh: billboard,
            type: 'billboard',
            index: index
        });
    });
    
    console.log(`✅ Created ${this.ledBillboards.length} LED billboards for artwork`);
}

createLEDBillboard(config) {
    const group = new THREE.Group();
    
    // Frame/housing (dark metal with tech details)
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(config.width + 0.4, config.height + 0.4, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    group.add(frame);
    
    // Screen (for artwork display)
    const screenGeometry = new THREE.PlaneGeometry(config.width, config.height);
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x111111,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
    });
    
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.16;
    group.add(screen);
    
    // LED border lights (animated)
    const borderLights = [];
    const ledCount = 20;
    
    for (let i = 0; i < ledCount; i++) {
        const t = i / ledCount;
        let x, y;
        
        // Create border around screen
        if (t < 0.25) {
            x = (t * 4) * config.width - config.width / 2;
            y = config.height / 2;
        } else if (t < 0.5) {
            x = config.width / 2;
            y = config.height / 2 - ((t - 0.25) * 4) * config.height;
        } else if (t < 0.75) {
            x = config.width / 2 - ((t - 0.5) * 4) * config.width;
            y = -config.height / 2;
        } else {
            x = -config.width / 2;
            y = -config.height / 2 + ((t - 0.75) * 4) * config.height;
        }
        
        const led = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 2
            })
        );
        led.position.set(x, y, 0.2);
        group.add(led);
        borderLights.push(led);
    }
    
    // Spotlight for billboard illumination
    const spotlight = new THREE.SpotLight(0xffffff, 2, 30, Math.PI / 6, 0.5);
    spotlight.position.set(0, 0, 3);
    spotlight.target = screen;
    group.add(spotlight);
    
    // Tech details (vents, panels)
    for (let i = 0; i < 4; i++) {
        const vent = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.8
            })
        );
        vent.position.set(
            -config.width / 2 + 0.2 + i * (config.width / 4),
            -config.height / 2 - 0.3,
            0
        );
        group.add(vent);
    }
    
    // Position and rotate
    group.position.set(config.x, config.y, config.z);
    group.rotation.y = config.rotation;
    
    // Store data
    group.userData = {
        screen: screen,
        borderLights: borderLights,
        spotlight: spotlight,
        isArtworkDisplay: true,
        width: config.width,
        height: config.height
    };
    
    return group;
}

// ========================================
// HOLOGRAPHIC DISPLAYS (floating ads)
// ========================================

createHolographicDisplays() {
    const hologramConfigs = [
        { x: -3, y: 8, z: -15, type: 'ad1' },
        { x: 3, y: 12, z: -8, type: 'ad2' },
        { x: -2, y: 10, z: 5, type: 'ad3' },
        { x: 4, y: 14, z: 15, type: 'warning' },
        { x: -4, y: 11, z: -22, type: 'ad4' },
        { x: 2, y: 9, z: 12, type: 'news' }
    ];
    
    hologramConfigs.forEach(config => {
        const hologram = this.createHologram(config);
        this.rooms[0].add(hologram);
        this.holographicAds.push(hologram);
    });
}

createHologram(config) {
    const group = new THREE.Group();
    
    // Projector base
    const projector = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 0.5, 8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    projector.position.y = -2;
    group.add(projector);
    
    // Projection beam
    const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.8, 2, 8, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        })
    );
    beam.position.y = -1;
    group.add(beam);
    
    // Holographic content
    const content = this.createHologramContent(config.type);
    content.position.y = 0;
    group.add(content);
    
    // Scan lines effect
    const scanLines = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        })
    );
    content.add(scanLines);
    
    // Point light
    const light = new THREE.PointLight(0x00ffff, 1.5, 10);
    light.position.y = 0;
    group.add(light);
    
    // Position
    group.position.set(config.x, config.y, config.z);
    
    // Store for animation
    group.userData = {
        content: content,
        scanLines: scanLines,
        beam: beam,
        light: light,
        type: config.type,
        floatPhase: Math.random() * Math.PI * 2,
        rotationSpeed: 0.002 + Math.random() * 0.003
    };
    
    return group;
}

createHologramContent(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Content based on type
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    
    switch(type) {
        case 'ad1':
            ctx.fillText('CYBER', 256, 200);
            ctx.font = '40px Arial';
            ctx.fillText('ENHANCEMENTS', 256, 260);
            ctx.fillText('50% OFF', 256, 320);
            break;
        case 'ad2':
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.fillText('NOODLE', 256, 200);
            ctx.fillText('BAR', 256, 280);
            ctx.font = '30px Arial';
            ctx.fillText('→ OPEN 24/7', 256, 340);
            break;
        case 'ad3':
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.fillText('TECH', 256, 200);
            ctx.fillText('UPGRADES', 256, 280);
            break;
        case 'warning':
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.fillText('⚠️', 256, 200);
            ctx.font = '40px Arial';
            ctx.fillText('SURVEILLANCE', 256, 280);
            ctx.fillText('ACTIVE', 256, 330);
            break;
        case 'ad4':
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.fillText('ARCADE', 256, 220);
            ctx.font = '35px Arial';
            ctx.fillText('LEVEL UP ↑', 256, 300);
            break;
        case 'news':
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.font = '35px Arial';
            ctx.fillText('NEWS FEED', 256, 180);
            ctx.font = '25px Arial';
            ctx.fillText('市場上涨 +2.4%', 256, 240);
            ctx.fillText('Weather: Rain', 256, 280);
            ctx.fillText('Temp: 18°C', 256, 320);
            break;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const hologram = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        })
    );
    
    return hologram;
}

// ========================================
// STEAM VENTS (particle effects)
// ========================================

createSteamVents() {
    const ventPositions = [
        { x: -5, y: 0, z: -18 },
        { x: 5, y: 0, z: -10 },
        { x: -4, y: 0, z: 3 },
        { x: 4, y: 0, z: 12 },
        { x: -5, y: 0, z: 25 },
        { x: 3, y: 0, z: -28 }
    ];
    
    ventPositions.forEach(pos => {
        const vent = this.createSteamVent(pos);
        this.rooms[0].add(vent);
        this.steamVents.push(vent);
    });
}

createSteamVent(pos) {
    const group = new THREE.Group();
    
    // Vent grate
    const grate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 0.1, 8),
        new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.8,
            metalness: 0.7
        })
    );
    grate.rotation.x = Math.PI / 2;
    group.add(grate);
    
    // Steam particles
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const lifetimes = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: 0.05 + Math.random() * 0.05,
            z: (Math.random() - 0.5) * 0.02
        });
        
        lifetimes.push(Math.random() * 100);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.3,
        transparent: true,
        opacity: 0.6,
        fog: true
    });
    
    const particles = new THREE.Points(geometry, material);
    group.add(particles);
    
    // Position
    group.position.set(pos.x, pos.y, pos.z);
    
    // Store for animation
    group.userData = {
        particles: particles,
        velocities: velocities,
        lifetimes: lifetimes,
        particleCount: particleCount
    };
    
    return group;
}

// ========================================
// DRONE CAMERAS (following player)
// ========================================

createDroneCameras() {
    const droneConfigs = [
        { offset: new THREE.Vector3(3, 4, -2), color: 0xff0000 },
        { offset: new THREE.Vector3(-3, 5, -3), color: 0x00ff00 },
        { offset: new THREE.Vector3(2, 6, 2), color: 0x0000ff }
    ];
    
    droneConfigs.forEach(config => {
        const drone = this.createDrone(config);
        this.rooms[0].add(drone);
        this.droneCameras.push(drone);
    });
}

createDrone(config) {
    const group = new THREE.Group();
    
    // Drone body
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    group.add(body);
    
    // Propellers (4 arms)
    const propellers = [];
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        
        // Arm
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6),
            new THREE.MeshStandardMaterial({
                color: 0x4a4a4a,
                metalness: 0.8
            })
        );
        arm.rotation.z = Math.PI / 2;
        arm.position.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
        );
        arm.rotation.y = angle;
        group.add(arm);
        
        // Propeller
        const propeller = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.02, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0x6a6a6a,
                transparent: true,
                opacity: 0.7
            })
        );
        propeller.position.set(
            Math.cos(angle) * 0.6,
            0,
            Math.sin(angle) * 0.6
        );
        group.add(propeller);
        propellers.push(propeller);
    }
    
    // Camera lens
    const camera = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 0.2, 8),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.2,
            metalness: 0.9
        })
    );
    camera.rotation.x = Math.PI / 2;
    camera.position.y = -0.2;
    group.add(camera);
    
    // Tracking light
    const light = new THREE.PointLight(config.color, 1, 8);
    light.position.y = -0.3;
    group.add(light);
    
    // LED indicator
    const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 2
        })
    );
    led.position.y = 0.3;
    group.add(led);
    
    // Store for animation
    group.userData = {
        propellers: propellers,
        light: light,
        led: led,
        offset: config.offset.clone(),
        targetPosition: new THREE.Vector3(),
        currentPosition: new THREE.Vector3(),
        bobPhase: Math.random() * Math.PI * 2,
        color: config.color
    };
    
    return group;
}

// Continue to Part 3...

// ========================================
// RAIN EFFECT (constant rainfall)
// ========================================

createRainEffect() {
    const rainCount = 2000;
    const positions = new Float32Array(rainCount * 3);
    const velocities = [];
    
    for (let i = 0; i < rainCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;      // x
        positions[i * 3 + 1] = Math.random() * 40;          // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
        
        velocities.push({
            x: -0.02 + Math.random() * 0.01,
            y: -0.5 - Math.random() * 0.3,
            z: 0
        });
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x88aaff,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    
    const rain = new THREE.Points(geometry, material);
    this.rooms[0].add(rain);
    
    this.rainDroplets.push({
        mesh: rain,
        velocities: velocities,
        count: rainCount
    });
    
    console.log("🌧️ Rain effect activated");
}

// ========================================
// PUDDLES (reflective water)
// ========================================

createPuddles() {
    const puddlePositions = [
        { x: -2, z: -15, radius: 1.5 },
        { x: 3, z: -8, radius: 1.2 },
        { x: -3, z: 0, radius: 1.8 },
        { x: 2, z: 10, radius: 1.3 },
        { x: -1, z: 18, radius: 1.6 },
        { x: 4, z: -22, radius: 1.4 },
        { x: -4, z: 25, radius: 1.7 }
    ];
    
    puddlePositions.forEach(config => {
        const puddle = this.createPuddle(config);
        this.rooms[0].add(puddle);
        this.puddles.push(puddle);
    });
}

createPuddle(config) {
    const group = new THREE.Group();
    
    // Main puddle surface
    const puddle = new THREE.Mesh(
        new THREE.CircleGeometry(config.radius, 32),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        })
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.y = 0.01;
    puddle.receiveShadow = true;
    group.add(puddle);
    
    // Ripple rings (animated)
    const ripples = [];
    for (let i = 0; i < 3; i++) {
        const ripple = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.15, 32),
            new THREE.MeshBasicMaterial({
                color: 0x88aaff,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            })
        );
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.y = 0.02;
        group.add(ripple);
        ripples.push(ripple);
    }
    
    // Position
    group.position.set(config.x, 0, config.z);
    
    // Store for animation
    group.userData = {
        ripples: ripples,
        radius: config.radius,
        rippleTimer: Math.random() * 100,
        currentRipple: 0
    };
    
    return group;
}

// ========================================
// HANGING CABLES (atmospheric detail)
// ========================================

createCables() {
    const cableConfigs = [
        { startX: -6, startZ: -30, endX: 6, endZ: -28, y: 15, sag: 2 },
        { startX: -6, startZ: -20, endX: 6, endZ: -18, y: 18, sag: 1.5 },
        { startX: -6, startZ: -10, endX: 6, endZ: -8, y: 12, sag: 2.5 },
        { startX: -6, startZ: 0, endX: 6, endZ: 2, y: 16, sag: 1.8 },
        { startX: -6, startZ: 10, endX: 6, endZ: 12, y: 14, sag: 2.2 },
        { startX: -6, startZ: 20, endX: 6, endZ: 22, y: 17, sag: 1.6 }
    ];
    
    cableConfigs.forEach(config => {
        const cable = this.createCable(config);
        this.rooms[0].add(cable);
    });
}

createCable(config) {
    const points = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = config.startX + (config.endX - config.startX) * t;
        const z = config.startZ + (config.endZ - config.startZ) * t;
        
        // Catenary curve for realistic sag
        const sag = config.sag * Math.sin(t * Math.PI);
        const y = config.y - sag;
        
        points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
    
    const cable = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.6
        })
    );
    
    // Add some lights hanging from cables occasionally
    if (Math.random() < 0.5) {
        const hangingLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 1
            })
        );
        
        const midPoint = points[Math.floor(segments / 2)];
        hangingLight.position.copy(midPoint);
        hangingLight.position.y -= 0.5;
        
        const light = new THREE.PointLight(0xffaa00, 1, 10);
        light.position.copy(hangingLight.position);
        
        const group = new THREE.Group();
        group.add(cable);
        group.add(hangingLight);
        group.add(light);
        
        return group;
    }
    
    return cable;
}

// ========================================
// VENDING MACHINES (interactive)
// ========================================

createVendingMachines() {
    const machinePositions = [
        { x: -5.5, y: 0, z: -25, rotation: Math.PI / 2, type: 'drinks' },
        { x: 5.5, y: 0, z: -12, rotation: -Math.PI / 2, type: 'food' },
        { x: -5.5, y: 0, z: 8, rotation: Math.PI / 2, type: 'tech' },
        { x: 5.5, y: 0, z: 20, rotation: -Math.PI / 2, type: 'cigarettes' }
    ];
    
    machinePositions.forEach(config => {
        const machine = this.createVendingMachine(config);
        this.rooms[0].add(machine);
        this.vendingMachines.push(machine);
    });
}

createVendingMachine(config) {
    const group = new THREE.Group();
    
    // Machine body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2.5, 1),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            roughness: 0.3,
            metalness: 0.8
        })
    );
    body.position.y = 1.25;
    body.castShadow = true;
    group.add(body);
    
    // Glass display
    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.8, 0.1),
        new THREE.MeshPhysicalMaterial({
            color: 0x88aaff,
            transmission: 0.9,
            opacity: 0.3,
            transparent: true,
            roughness: 0.1
        })
    );
    glass.position.set(0, 1.4, 0.51);
    group.add(glass);
    
    // LED screen
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Content based on type
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff00';
    
    switch(config.type) {
        case 'drinks':
            ctx.fillText('DRINKS', 128, 80);
            ctx.font = '30px Arial';
            ctx.fillText('Cola: ¥5', 128, 130);
            ctx.fillText('Water: ¥3', 128, 170);
            ctx.fillText('Energy: ¥8', 128, 210);
            break;
        case 'food':
            ctx.fillText('FOOD', 128, 80);
            ctx.font = '30px Arial';
            ctx.fillText('Ramen: ¥12', 128, 130);
            ctx.fillText('Sushi: ¥15', 128, 170);
            ctx.fillText('Snacks: ¥5', 128, 210);
            break;
        case 'tech':
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.fillText('CYBER', 128, 80);
            ctx.font = '30px Arial';
            ctx.fillText('Implants', 128, 130);
            ctx.fillText('Upgrades', 128, 170);
            ctx.fillText('Mods', 128, 210);
            break;
        case 'cigarettes':
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.fillText('SMOKE', 128, 80);
            ctx.font = '30px Arial';
            ctx.fillText('Various', 128, 140);
            ctx.fillText('Brands', 128, 190);
            break;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.6),
        new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
    );
    screen.position.set(0, 2, 0.52);
    group.add(screen);
    
    // Products inside (visible through glass)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const product = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.25, 0.1),
                new THREE.MeshStandardMaterial({
                    color: Math.random() * 0xffffff,
                    roughness: 0.5,
                    metalness: 0.3
                })
            );
            product.position.set(
                -0.4 + col * 0.4,
                0.5 + row * 0.4,
                0.4
            );
            group.add(product);
        }
    }
    
    // Coin slot
    const coinSlot = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.05, 0.05),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9
        })
    );
    coinSlot.position.set(0.5, 0.8, 0.51);
    group.add(coinSlot);
    
    // Dispenser opening
    const dispenser = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.3, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a
        })
    );
    dispenser.position.set(0, 0.2, 0.51);
    group.add(dispenser);
    
    // Glow light
    const glowColor = config.type === 'tech' ? 0xff00ff : 
                     config.type === 'cigarettes' ? 0xff6600 : 0x00ff00;
    
    const light = new THREE.PointLight(glowColor, 1.5, 8);
    light.position.set(0, 2, 1);
    group.add(light);
    
    // Position and rotate
    group.position.set(config.x, config.y, config.z);
    group.rotation.y = config.rotation;
    
    // Store for animation
    group.userData = {
        screen: screen,
        light: light,
        type: config.type
    };
    
    return group;
}

// ========================================
// CYBERPUNK LIGHTING (neon atmosphere)
// ========================================

createCyberpunkLighting() {
    // Main ambient (very dim)
    const ambient = new THREE.AmbientLight(0x220044, 0.2);
    this.rooms[0].add(ambient);
    
    // Key neon lights along alley
    const lightConfigs = [
        { x: -4, y: 3, z: -30, color: 0xff0066, intensity: 2 },
        { x: 4, y: 4, z: -22, color: 0x00ffff, intensity: 2 },
        { x: -3, y: 3.5, z: -15, color: 0xff00ff, intensity: 2 },
        { x: 3, y: 4, z: -8, color: 0x00ff00, intensity: 2 },
        { x: -4, y: 3, z: 0, color: 0xffff00, intensity: 2 },
        { x: 4, y: 4.5, z: 8, color: 0xff6600, intensity: 2 },
        { x: -3, y: 3, z: 15, color: 0x00ffff, intensity: 2 },
        { x: 3, y: 4, z: 22, color: 0xff00ff, intensity: 2 }
    ];
    
    lightConfigs.forEach(config => {
        const light = new THREE.PointLight(config.color, config.intensity, 15);
        light.position.set(config.x, config.y, config.z);
        this.rooms[0].add(light);
        
        this.cyberpunkLights.push({
            light: light,
            baseIntensity: config.intensity,
            flickerSpeed: 0.5 + Math.random() * 1.5,
            color: config.color
        });
    });
    
    // Spotlight from above (simulating distant city lights)
    const topLight = new THREE.DirectionalLight(0x4a2a6a, 0.5);
    topLight.position.set(0, 30, 0);
    topLight.target.position.set(0, 0, 0);
    this.rooms[0].add(topLight);
    this.rooms[0].add(topLight.target);
}

// ========================================
// VOLUMETRIC FOG (atmospheric depth)
// ========================================

createCyberpunkFog() {
    // Fog for depth
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    
    // Volumetric fog effect using planes
    const fogLayers = [];
    
    for (let i = 0; i < 5; i++) {
        const fogPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 80),
            new THREE.MeshBasicMaterial({
                color: 0x2a1a3a,
                transparent: true,
                opacity: 0.05,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        
        fogPlane.rotation.x = -Math.PI / 2;
        fogPlane.position.y = 2 + i * 1.5;
        this.rooms[0].add(fogPlane);
        
        fogLayers.push({
            mesh: fogPlane,
            baseY: 2 + i * 1.5,
            floatPhase: Math.random() * Math.PI * 2
        });
    }
    
    this.fogLayers = fogLayers;
    
    console.log("🌫️ Volumetric fog created");
}

// ========================================
// FLICKERING SCREENS (building detail)
// ========================================

createFlickeringScreens() {
    // Already created in createBuildingWall()
    // This method can add additional standalone screens
    
    const extraScreens = [
        { x: -5.8, y: 6, z: -18, rotation: Math.PI / 2 },
        { x: 5.8, y: 7, z: -5, rotation: -Math.PI / 2 },
        { x: -5.8, y: 5, z: 12, rotation: Math.PI / 2 }
    ];
    
    extraScreens.forEach(config => {
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({
                color: 0x0066ff,
                emissive: 0x0066ff,
                emissiveIntensity: 0.8
            })
        );
        
        screen.position.set(config.x, config.y, config.z);
        screen.rotation.y = config.rotation;
        this.rooms[0].add(screen);
        
        this.flickeringScreens.push({
            mesh: screen,
            baseIntensity: 0.8,
            flickerSpeed: 1 + Math.random() * 2
        });
    });
}

// Continue to Part 4 for animations...

// ========================================
// ANIMATION SYSTEM (all cyberpunk effects)
// ========================================

updateCyberpunkAnimations() {
    if (!this.rooms || !this.rooms[0]) return;
    
    const time = Date.now() * 0.001;
    
    // Update rain
    this.updateRain();
    
    // Update puddle ripples
    this.updatePuddles(time);
    
    // Update steam vents
    this.updateSteamVents();
    
    // Update neon sign flickering
    this.updateNeonSigns(time);
    
    // Update holograms
    this.updateHolograms(time);
    
    // Update drones (following player)
    this.updateDrones();
    
    // Update flickering screens
    this.updateFlickeringScreens(time);
    
    // Update LED billboard effects
    this.updateLEDBillboards(time);
    
    // Update fog layers
    this.updateFogLayers(time);
    
    // Update cyberpunk lights
    this.updateCyberpunkLights(time);
}

// Rain animation
updateRain() {
    this.rainDroplets.forEach(rain => {
        const positions = rain.mesh.geometry.attributes.position.array;
        
        for (let i = 0; i < rain.count; i++) {
            // Update position
            positions[i * 3] += rain.velocities[i].x;
            positions[i * 3 + 1] += rain.velocities[i].y;
            positions[i * 3 + 2] += rain.velocities[i].z;
            
            // Reset when hits ground
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3] = (Math.random() - 0.5) * 20;
                positions[i * 3 + 1] = 40;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
                
                // Create splash/ripple effect in puddles
                this.createRainSplash(positions[i * 3], positions[i * 3 + 2]);
            }
        }
        
        rain.mesh.geometry.attributes.position.needsUpdate = true;
    });
}

createRainSplash(x, z) {
    // Find nearest puddle and trigger ripple
    this.puddles.forEach(puddle => {
        const dx = puddle.position.x - x;
        const dz = puddle.position.z - z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < puddle.userData.radius && Math.random() < 0.05) {
            puddle.userData.rippleTimer = 0;
        }
    });
}

// Puddle ripple animation
updatePuddles(time) {
    this.puddles.forEach(puddle => {
        puddle.userData.rippleTimer += 0.05;
        
        const ripples = puddle.userData.ripples;
        const currentRipple = Math.floor(puddle.userData.rippleTimer / 30) % 3;
        
        ripples.forEach((ripple, index) => {
            const phase = (puddle.userData.rippleTimer - index * 30) / 30;
            
            if (phase > 0 && phase < 1) {
                const scale = 0.1 + phase * puddle.userData.radius;
                ripple.scale.set(scale, scale, 1);
                ripple.material.opacity = (1 - phase) * 0.5;
            } else {
                ripple.material.opacity = 0;
            }
        });
    });
}

// Steam vent particle animation
updateSteamVents() {
    this.steamVents.forEach(vent => {
        const positions = vent.userData.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < vent.userData.particleCount; i++) {
            // Update position
            positions[i * 3] += vent.userData.velocities[i].x;
            positions[i * 3 + 1] += vent.userData.velocities[i].y;
            positions[i * 3 + 2] += vent.userData.velocities[i].z;
            
            // Update lifetime
            vent.userData.lifetimes[i]++;
            
            // Reset particle when it rises too high or lives too long
            if (positions[i * 3 + 1] > 8 || vent.userData.lifetimes[i] > 100) {
                positions[i * 3] = (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
                
                vent.userData.velocities[i] = {
                    x: (Math.random() - 0.5) * 0.02,
                    y: 0.05 + Math.random() * 0.05,
                    z: (Math.random() - 0.5) * 0.02
                };
                
                vent.userData.lifetimes[i] = 0;
            }
        }
        
        vent.userData.particles.geometry.attributes.position.needsUpdate = true;
    });
}

// Neon sign flickering
updateNeonSigns(time) {
    this.neonSigns.forEach(sign => {
        const data = sign.userData;
        
        // Realistic neon flicker (mostly stable, occasional flicker)
        let intensity = data.baseIntensity;
        
        if (Math.random() < 0.02) {
            // Sudden flicker
            intensity *= 0.3 + Math.random() * 0.4;
        } else {
            // Gentle variation
            intensity += Math.sin(time * data.flickerSpeed) * 0.2;
        }
        
        data.light.intensity = Math.max(0, intensity);
    });
}

// Holographic display animation
updateHolograms(time) {
    this.holographicAds.forEach(hologram => {
        const data = hologram.userData;
        
        // Floating motion
        data.floatPhase += 0.02;
        hologram.position.y += Math.sin(data.floatPhase) * 0.002;
        
        // Rotation
        data.content.rotation.y += data.rotationSpeed;
        
        // Scanline effect
        const scanlinePos = (time * 2) % 2 - 1;
        data.scanLines.position.y = scanlinePos;
        
        // Glitch effect (occasional)
        if (Math.random() < 0.005) {
            data.content.position.x = (Math.random() - 0.5) * 0.1;
            setTimeout(() => {
                data.content.position.x = 0;
            }, 50);
        }
        
        // Light pulsing
        data.light.intensity = 1.5 + Math.sin(time * 2 + data.floatPhase) * 0.5;
        
        // Beam opacity variation
        data.beam.material.opacity = 0.15 + Math.sin(time * 3) * 0.05;
    });
}

// Drone camera following
updateDrones() {
    if (!this.camera) return;
    
    this.droneCameras.forEach(drone => {
        const data = drone.userData;
        
        // Target position (player position + offset)
        data.targetPosition.copy(this.camera.position);
        data.targetPosition.add(data.offset);
        
        // Smooth follow
        drone.position.lerp(data.targetPosition, 0.02);
        
        // Bobbing motion
        data.bobPhase += 0.03;
        drone.position.y += Math.sin(data.bobPhase) * 0.01;
        
        // Rotate propellers
        data.propellers.forEach((propeller, index) => {
            propeller.rotation.y += 0.5;
        });
        
        // Look at player
        drone.lookAt(this.camera.position);
        
        // LED blinking
        const blinkSpeed = 2;
        const blinkPhase = (Date.now() * 0.001 * blinkSpeed) % 1;
        data.led.material.emissiveIntensity = blinkPhase < 0.5 ? 2 : 0.5;
    });
}

// Flickering screen effects
updateFlickeringScreens(time) {
    this.flickeringScreens.forEach(screen => {
        let intensity = screen.baseIntensity;
        
        // Random flicker
        if (Math.random() < 0.1) {
            intensity *= 0.2 + Math.random() * 0.6;
        } else {
            intensity += Math.sin(time * screen.flickerSpeed) * 0.2;
        }
        
        screen.mesh.material.emissiveIntensity = Math.max(0, intensity);
    });
}

// LED billboard border animation
updateLEDBillboards(time) {
    this.ledBillboards.forEach(billboard => {
        const data = billboard.userData;
        
        if (data.borderLights) {
            data.borderLights.forEach((led, index) => {
                // Chasing light effect
                const phase = (time * 2 + index * 0.1) % 1;
                led.material.emissiveIntensity = 1 + Math.sin(phase * Math.PI * 2) * 1;
            });
        }
    });
}

// Fog layer movement
updateFogLayers(time) {
    if (!this.fogLayers) return;
    
    this.fogLayers.forEach(fog => {
        fog.floatPhase += 0.01;
        fog.mesh.position.y = fog.baseY + Math.sin(fog.floatPhase) * 0.5;
        fog.mesh.material.opacity = 0.05 + Math.sin(time * 0.5 + fog.floatPhase) * 0.02;
    });
}

// Cyberpunk light variation
updateCyberpunkLights(time) {
    this.cyberpunkLights.forEach(lightData => {
        // Subtle intensity variation
        const variation = Math.sin(time * lightData.flickerSpeed) * 0.3;
        lightData.light.intensity = lightData.baseIntensity + variation;
        
        // Occasional surge
        if (Math.random() < 0.01) {
            lightData.light.intensity = lightData.baseIntensity * 1.5;
            setTimeout(() => {
                lightData.light.intensity = lightData.baseIntensity;
            }, 100);
        }
    });
}

// ========================================
// COLLISION DETECTION (narrow alley)
// ========================================

checkCollisions() {
    if (!this.camera) return;
    
    const pos = this.camera.position;
    const alleyWidth = 5.5; // Narrower collision bounds
    
    // Side walls
    if (pos.x < -alleyWidth) pos.x = -alleyWidth;
    if (pos.x > alleyWidth) pos.x = alleyWidth;
    
    // Length bounds
    if (pos.z < -38) pos.z = -38;
    if (pos.z > 35) pos.z = 35;
    
    // Floor (wet ground)
    if (pos.y < 1.6) pos.y = 1.6;
    if (pos.y > 8) pos.y = 8; // Ceiling limit
}

// ========================================
// SPAWN POSITION
// ========================================

getSpawnPosition() {
    return {
        position: new THREE.Vector3(0, 1.6, 30), // Start at alley entrance
        rotation: Math.PI // Looking into the alley
    };
}

// ========================================
// UPDATE IN MAIN ANIMATE LOOP
// ========================================

// Add this to your existing animate() method:


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
   
    if (this.currentGalleryIndex === 34) { // Adjust index as needed
        this.updateCyberpunkAnimations();
    }
   
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
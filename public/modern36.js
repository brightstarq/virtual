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
    // ✓ REALISTIC AMBIENT (very low - underground feel)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.08); // Reduced from 0.15
    this.scene.add(ambientLight);
    
    // ✓ REALISTIC FOG (denser, more atmospheric)
    this.scene.fog = new THREE.FogExp2(0x1a1612, 0.015); // Warmer, denser
    
    // ✓ MAIN SUNLIGHT (from entrance - realistic fall-off)
    const sunlight = new THREE.DirectionalLight(0xfff5e6, 0.6);
    sunlight.position.set(0, 25, -55); // From entrance
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 4096; // Higher quality shadows
    sunlight.shadow.mapSize.height = 4096;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 100;
    sunlight.shadow.camera.left = -50;
    sunlight.shadow.camera.right = 50;
    sunlight.shadow.camera.top = 50;
    sunlight.shadow.camera.bottom = -50;
    sunlight.shadow.bias = -0.001;
    sunlight.shadow.radius = 2; // Softer shadows
    this.scene.add(sunlight);
    
    // ✓ REALISTIC FILL LIGHT (bounced light from tiles)
    const fillLight = new THREE.DirectionalLight(0xffe8d6, 0.15);
    fillLight.position.set(-20, 10, 20);
    this.scene.add(fillLight);
    
    // ✓ UNDERGROUND AMBIENT (bluish from outside)
    const skyLight = new THREE.HemisphereLight(0xb8d4e8, 0x3a2a1a, 0.2);
    this.scene.add(skyLight);
}

createGallery() {
    // ========================================
    // ART NOUVEAU METRO STATION SYSTEM
    // ========================================
    
    this.trains = [];
    this.lamps = [];
    this.stainedGlass = [];
    this.ironwork = [];
    this.performers = [];
    this.advertisements = [];
    this.trainCars = [];
    this.passengers = [];
    
    this.createMetroStructure();
    this.createOrnateIronwork();
    this.createStainedGlass();
    this.createArtNouveauLamps();
    this.createPlatform();
    this.createTicketBooth();
    this.createTrainSystem();
    this.createPeriodAdvertisements();
    this.createBenches();
    this.createPerformers();
  
    
    console.log("🎨 Art Nouveau Metro Station created!");
}

// ========================================
// METRO STRUCTURE (curved organic architecture)
// ========================================

// Replace the addLighting() method with this enhanced version:

addLighting() {
    // ✓ REALISTIC AMBIENT (very low - underground feel)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.08); // Reduced from 0.15
    this.scene.add(ambientLight);
    
    // ✓ REALISTIC FOG (denser, more atmospheric)
    this.scene.fog = new THREE.FogExp2(0x1a1612, 0.015); // Warmer, denser
    
    // ✓ MAIN SUNLIGHT (from entrance - realistic fall-off)
    const sunlight = new THREE.DirectionalLight(0xfff5e6, 0.6);
    sunlight.position.set(0, 25, -55); // From entrance
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 4096; // Higher quality shadows
    sunlight.shadow.mapSize.height = 4096;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 100;
    sunlight.shadow.camera.left = -50;
    sunlight.shadow.camera.right = 50;
    sunlight.shadow.camera.top = 50;
    sunlight.shadow.camera.bottom = -50;
    sunlight.shadow.bias = -0.001;
    sunlight.shadow.radius = 2; // Softer shadows
    this.scene.add(sunlight);
    
    // ✓ REALISTIC FILL LIGHT (bounced light from tiles)
    const fillLight = new THREE.DirectionalLight(0xffe8d6, 0.15);
    fillLight.position.set(-20, 10, 20);
    this.scene.add(fillLight);
    
    // ✓ UNDERGROUND AMBIENT (bluish from outside)
    const skyLight = new THREE.HemisphereLight(0xb8d4e8, 0x3a2a1a, 0.2);
    this.scene.add(skyLight);
}

// Replace createMetroStructure() with enhanced materials and details:

createMetroStructure() {
    const metroRoom = new THREE.Group();
    metroRoom.visible = true;
    
    const stationWidth = 40;
    const stationLength = 100;
    const stationHeight = 15;
    
    // ========================================
    // ✓ ENHANCED REALISTIC MATERIALS
    // ========================================
    
    const creamTileMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f0e8, // Slightly warmer cream
        roughness: 0.6, // More matte (realistic ceramic)
        metalness: 0.0,
        envMapIntensity: 0.3
    });
    
    const darkTileMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b5a48, // More realistic brown
        roughness: 0.65,
        metalness: 0.0,
        envMapIntensity: 0.2
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d3a2d, // Aged dark green iron
        roughness: 0.5, // Slightly worn
        metalness: 0.7,
        envMapIntensity: 0.8
    });
    
    const groutMaterial = new THREE.MeshStandardMaterial({
        color: 0xa89584, // Dirty grout
        roughness: 0.95,
        metalness: 0.0
    });
    
    // ========================================
    // ✓ REALISTIC PLATFORM FLOOR (with grout lines)
    // ========================================
    
    const platformGeometry = new THREE.PlaneGeometry(stationWidth, stationLength);
    const platform = new THREE.Mesh(platformGeometry, creamTileMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.receiveShadow = true;
    metroRoom.add(platform);
    
    // ✓ GROUT LINES (realistic tile separation)
    const groutSize = 0.02;
    for (let x = -stationWidth/2; x <= stationWidth/2; x += 1) {
        const groutLine = new THREE.Mesh(
            new THREE.PlaneGeometry(groutSize, stationLength),
            groutMaterial
        );
        groutLine.rotation.x = -Math.PI / 2;
        groutLine.position.set(x, 0.005, 0);
        metroRoom.add(groutLine);
    }
    
    for (let z = -stationLength/2; z <= stationLength/2; z += 1) {
        const groutLine = new THREE.Mesh(
            new THREE.PlaneGeometry(stationWidth, groutSize),
            groutMaterial
        );
        groutLine.rotation.x = -Math.PI / 2;
        groutLine.position.set(0, 0.005, z);
        metroRoom.add(groutLine);
    }
    
    // ✓ WORN FLOOR AREAS (darker near walls)
    for (let i = 0; i < 30; i++) {
        const wornPatch = new THREE.Mesh(
            new THREE.CircleGeometry(0.3 + Math.random() * 0.5, 16),
            new THREE.MeshStandardMaterial({
                color: 0xd5cfc5,
                roughness: 0.8,
                metalness: 0.0,
                transparent: true,
                opacity: 0.4
            })
        );
        wornPatch.rotation.x = -Math.PI / 2;
        wornPatch.position.set(
            (Math.random() - 0.5) * stationWidth * 0.9,
            0.01,
            (Math.random() - 0.5) * stationLength * 0.9
        );
        metroRoom.add(wornPatch);
    }
    
    // ✓ REALISTIC BORDER TILES (with depth)
    const tileSize = 1;
    for (let i = 0; i < stationLength; i += tileSize) {
        [-stationWidth/2 + 1, stationWidth/2 - 1].forEach(x => {
            // Main tile
            const tile = new THREE.Mesh(
                new THREE.BoxGeometry(tileSize - 0.02, 0.05, tileSize - 0.02),
                darkTileMaterial
            );
            tile.position.set(x, 0.025, -stationLength/2 + i + tileSize/2);
            tile.castShadow = true;
            tile.receiveShadow = true;
            metroRoom.add(tile);
            
            // Grout around it
            const grout = new THREE.Mesh(
                new THREE.BoxGeometry(tileSize, 0.02, tileSize),
                groutMaterial
            );
            grout.position.set(x, 0.01, -stationLength/2 + i + tileSize/2);
            grout.receiveShadow = true;
            metroRoom.add(grout);
        });
    }
    
    // ========================================
    // ✓ REALISTIC VAULTED CEILING
    // ========================================
    
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e0d8,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.BackSide
    });
    
    const numArches = 10;
    for (let i = 0; i < numArches; i++) {
        const z = -stationLength/2 + (i / (numArches - 1)) * stationLength;
        
        // Enhanced arch with more realistic curve
        const archPoints = [];
        const segments = 40;
        
        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const angle = t * Math.PI;
            
            // More realistic catenary curve
            let x = Math.cos(angle) * stationWidth / 2;
            let y = stationHeight * 0.3 + Math.sin(angle) * stationHeight * 0.7;
            
            // Subtle Art Nouveau curve
            if (t > 0.15 && t < 0.85) {
                const curveInfluence = Math.sin((t - 0.15) / 0.7 * Math.PI);
                y += curveInfluence * 0.8;
            }
            
            archPoints.push(new THREE.Vector3(x, y, z));
        }
        
        const archCurve = new THREE.CatmullRomCurve3(archPoints);
        const archGeometry = new THREE.TubeGeometry(archCurve, segments, 0.25, 12, false);
        const arch = new THREE.Mesh(archGeometry, ironMaterial);
        arch.castShadow = true;
        arch.receiveShadow = true;
        metroRoom.add(arch);
        
        // Decorative rivets on arch
        for (let k = 0; k < segments; k += 4) {
            const point = archCurve.getPoint(k / segments);
            const rivet = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    roughness: 0.3,
                    metalness: 0.9
                })
            );
            rivet.position.copy(point);
            rivet.castShadow = true;
            metroRoom.add(rivet);
        }
    }
    
    // Ceiling panels (aged, slightly discolored)
    for (let i = 0; i < numArches - 1; i++) {
        const z = -stationLength/2 + ((i + 0.5) / (numArches - 1)) * stationLength;
        
        const ceilingPanel = new THREE.Mesh(
            new THREE.PlaneGeometry(stationWidth * 0.92, stationLength / numArches * 0.85),
            ceilingMaterial
        );
        ceilingPanel.rotation.x = Math.PI / 2;
        ceilingPanel.position.set(0, stationHeight - 0.5, z);
        ceilingPanel.receiveShadow = true;
        metroRoom.add(ceilingPanel);
        
        // ✓ WATER STAINS (realistic aging)
        if (Math.random() < 0.4) {
            const stain = new THREE.Mesh(
                new THREE.CircleGeometry(1 + Math.random() * 2, 16),
                new THREE.MeshStandardMaterial({
                    color: 0xb8b0a8,
                    roughness: 0.9,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                })
            );
            stain.rotation.x = Math.PI / 2;
            stain.position.set(
                (Math.random() - 0.5) * stationWidth * 0.8,
                stationHeight - 0.48,
                z + (Math.random() - 0.5) * 3
            );
            metroRoom.add(stain);
        }
    }
    
    // ========================================
    // ✓ REALISTIC PLATFORM WALLS (beveled tiles with depth)
    // ========================================
    
    [-stationWidth/2, stationWidth/2].forEach((x, wallIndex) => {
        const wallHeight = 8;
        const tileRows = 16; // More tiles for realism
        const tileCols = 100;
        
        for (let row = 0; row < tileRows; row++) {
            for (let col = 0; col < tileCols; col++) {
                // Realistic tile pattern (some darker for variety)
                const isDark = (row + col) % 17 === 0 || Math.random() < 0.05;
                const isWorn = Math.random() < 0.15;
                
                let tileMat = isDark ? darkTileMaterial : creamTileMaterial;
                if (isWorn) {
                    tileMat = new THREE.MeshStandardMaterial({
                        color: isDark ? 0x5a4a38 : 0xe5dfd5,
                        roughness: 0.75,
                        metalness: 0.0
                    });
                }
                
                // Beveled tile (realistic 3D depth)
                const tileGroup = new THREE.Group();
                
                // Main tile face
                const tileFace = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.92, 0.46),
                    tileMat
                );
                tileGroup.add(tileFace);
                
                // Bevel edges (4 sides)
                const bevelMat = new THREE.MeshStandardMaterial({
                    color: isDark ? 0x6b5a48 : 0xeae4dc,
                    roughness: 0.65
                });
                
                // Top bevel
                const bevelTop = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.92, 0.03),
                    bevelMat
                );
                bevelTop.position.y = 0.23;
                bevelTop.rotation.x = -Math.PI / 12;
                tileGroup.add(bevelTop);
                
                // Bottom bevel
                const bevelBottom = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.92, 0.03),
                    bevelMat
                );
                bevelBottom.position.y = -0.23;
                bevelBottom.rotation.x = Math.PI / 12;
                tileGroup.add(bevelBottom);
                
                tileGroup.position.set(
                    x,
                    0.25 + row * 0.5,
                    -stationLength/2 + (col / tileCols) * stationLength
                );
                tileGroup.rotation.y = wallIndex === 0 ? Math.PI/2 : -Math.PI/2;
                
                tileGroup.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                metroRoom.add(tileGroup);
            }
        }
    });
    
    // ========================================
    // ✓ REALISTIC ORNATE PILLARS
    // ========================================
    
    const pillarPositions = [
        { x: -12, z: -40 }, { x: 12, z: -40 },
        { x: -12, z: -20 }, { x: 12, z: -20 },
        { x: -12, z: 0 }, { x: 12, z: 0 },
        { x: -12, z: 20 }, { x: 12, z: 20 },
        { x: -12, z: 40 }, { x: 12, z: 40 }
    ];
    
    pillarPositions.forEach(pos => {
        const pillar = this.createRealisticPillar();
        pillar.position.set(pos.x, 0, pos.z);
        metroRoom.add(pillar);
    });
    
    // ========================================
    // ✓ ENHANCED LIGHTING (realistic metro ambience)
    // ========================================
    
    // Warm overhead lights (realistic spacing and intensity)
    for (let i = 0; i < 10; i++) {
        const light = new THREE.PointLight(0xffdda8, 2.5, 18, 2);
        light.position.set(
            (i % 2 === 0 ? -6 : 6),
            11,
            -45 + i * 10
        );
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.bias = -0.001;
        light.shadow.radius = 3; // Soft shadows
        metroRoom.add(light);
        
        // ✓ REALISTIC LIGHT FIXTURES
        const fixture = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.3, 0.6, 12),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.4,
                metalness: 0.8,
                emissive: 0xffaa66,
                emissiveIntensity: 0.2
            })
        );
        fixture.position.copy(light.position);
        fixture.position.y -= 0.5;
        fixture.castShadow = true;
        metroRoom.add(fixture);
    }
    
    // ✓ REALISTIC FOG (warm underground atmosphere)
    this.scene.fog = new THREE.Fog(0x2a2622, 40, 90);
    
    // ========================================
    // ✓ ARTWORK DISPLAY LOCATIONS
    // ========================================
    
    this.metroArtworkSpots = [];
    for (let i = 0; i < 9; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -40 + Math.floor(i / 2) * 20;
        
        this.metroArtworkSpots.push({
            x: side * 17,
            y: 4,
            z: z,
            rot: side === -1 ? Math.PI/2 : -Math.PI/2
        });
    }
    
    metroRoom.position.set(0, 0, 0);
    this.rooms.push(metroRoom);
    this.scene.add(metroRoom);
}

// ✓ ADD THIS NEW METHOD for realistic pillars:

createRealisticPillar() {
    const pillarGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d3a2d,
        roughness: 0.5,
        metalness: 0.75,
        envMapIntensity: 0.8
    });
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8942f, // Aged brass
        roughness: 0.35,
        metalness: 0.85,
        envMapIntensity: 1.0
    });
    
    const verdigrismaterial = new THREE.MeshStandardMaterial({
        color: 0x5a7a5a, // Green patina
        roughness: 0.7,
        metalness: 0.3
    });
    
    // Main pillar (with realistic wear)
    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.48, 12, 16),
        ironMaterial
    );
    pillar.position.y = 6;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    pillarGroup.add(pillar);
    
    // ✓ VERTICAL FLUTING (realistic Art Nouveau detail)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const flute = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 11.5, 0.15),
            new THREE.MeshStandardMaterial({
                color: 0x252a25,
                roughness: 0.6,
                metalness: 0.7
            })
        );
        flute.position.set(
            Math.cos(angle) * 0.42,
            6,
            Math.sin(angle) * 0.42
        );
        flute.castShadow = true;
        pillarGroup.add(flute);
    }
    
    // Ornate capital (aged brass with verdigris)
    const capital = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.5, 0.8, 12),
        brassMaterial
    );
    capital.position.y = 12.4;
    capital.castShadow = true;
    pillarGroup.add(capital);
    
    // ✓ VERDIGRIS PATCHES (realistic aging)
    for (let i = 0; i < 4; i++) {
        const patch = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            verdigrismaterial
        );
        const angle = (i / 4) * Math.PI * 2;
        patch.position.set(
            Math.cos(angle) * 0.6,
            12.4,
            Math.sin(angle) * 0.6
        );
        patch.scale.y = 0.3;
        pillarGroup.add(patch);
    }
    
    // Flowing acanthus leaves
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 1.2, 4),
            brassMaterial
        );
        leaf.position.set(
            Math.cos(angle) * 0.65,
            11.8,
            Math.sin(angle) * 0.65
        );
        leaf.rotation.z = -Math.PI / 3;
        leaf.rotation.y = angle;
        leaf.castShadow = true;
        pillarGroup.add(leaf);
    }
    
    // Decorative base (multi-tiered)
    const baseTiers = [
        { r1: 0.75, r2: 0.8, h: 0.3, y: 0.15 },
        { r1: 0.65, r2: 0.7, h: 0.4, y: 0.55 },
        { r1: 0.55, r2: 0.6, h: 0.3, y: 0.95 }
    ];
    
    baseTiers.forEach(tier => {
        const baseTier = new THREE.Mesh(
            new THREE.CylinderGeometry(tier.r1, tier.r2, tier.h, 12),
            brassMaterial
        );
        baseTier.position.y = tier.y;
        baseTier.castShadow = true;
        baseTier.receiveShadow = true;
        pillarGroup.add(baseTier);
    });
    
    // ✓ REALISTIC VINE WITH DEPTH
    const vinePoints = [];
    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const angle = t * Math.PI * 5;
        const height = t * 10 + 1.2;
        const radius = 0.46 + Math.sin(t * Math.PI * 3) * 0.04;
        
        vinePoints.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        ));
    }
    
    const vineCurve = new THREE.CatmullRomCurve3(vinePoints);
    const vineGeometry = new THREE.TubeGeometry(vineCurve, 30, 0.05, 8, false);
    const vine = new THREE.Mesh(vineGeometry, verdigrismaterial);
    vine.castShadow = true;
    pillarGroup.add(vine);
    
    // ✓ REALISTIC RUST STREAKS
    for (let i = 0; i < 5; i++) {
        const rust = new THREE.Mesh(
            new THREE.PlaneGeometry(0.08, 2 + Math.random() * 3),
            new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.95,
                transparent: true,
                opacity: 0.4
            })
        );
        const angle = Math.random() * Math.PI * 2;
        rust.position.set(
            Math.cos(angle) * 0.48,
            4 + Math.random() * 6,
            Math.sin(angle) * 0.48
        );
        rust.lookAt(0, rust.position.y, 0);
        pillarGroup.add(rust);
    }
    
    return pillarGroup;
}

createArtNouveauPillar() {
    const pillarGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Main pillar (slightly tapered)
    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 12, 12),
        ironMaterial
    );
    pillar.position.y = 6;
    pillar.castShadow = true;
    pillarGroup.add(pillar);
    
    // Organic floral capital at top
    const capital = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 3),
        goldMaterial
    );
    capital.position.y = 12;
    pillarGroup.add(capital);
    
    // Flowing leaves around capital
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 1, 4),
            goldMaterial
        );
        leaf.position.set(
            Math.cos(angle) * 0.7,
            11.5,
            Math.sin(angle) * 0.7
        );
        leaf.rotation.z = -Math.PI / 4;
        leaf.rotation.y = angle;
        pillarGroup.add(leaf);
    }
    
    // Decorative base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.8, 1, 12),
        goldMaterial
    );
    base.position.y = 0.5;
    pillarGroup.add(base);
    
    // Organic vine pattern wrapping around pillar
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 4;
        const height = (i / 20) * 10 + 1;
        
        const vine = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            goldMaterial
        );
        vine.position.set(
            Math.cos(angle) * 0.45,
            height,
            Math.sin(angle) * 0.45
        );
        pillarGroup.add(vine);
    }
    
    return pillarGroup;
}

// ========================================
// ORNATE IRONWORK (Guimard-style entrance)
// ========================================

createOrnateIronwork() {
    // Entrance archway (Art Nouveau style)
    const entrance = this.createMetroEntrance();
    entrance.position.set(0, 0, -48);
    this.rooms[0].add(entrance);
    
    // Platform railings (organic curves)
    this.createPlatformRailings();
}

createMetroEntrance() {
    const entranceGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a4a2a,
        roughness: 0.3,
        metalness: 0.9
    });
    
    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ff88,
        transparent: true,
        opacity: 0.6,
        emissive: 0x44aa44,
        emissiveIntensity: 0.3
    });
    
    // Two curved support pillars (Guimard style)
    [-3, 3].forEach(x => {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const y = t * 8;
            const curve = Math.sin(t * Math.PI) * 0.5;
            points.push(new THREE.Vector3(x + curve, y, 0));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
        const support = new THREE.Mesh(tubeGeometry, ironMaterial);
        entranceGroup.add(support);
    });
    
    // Top arch with organic curves
    const archPoints = [];
    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const angle = Math.PI * t;
        const x = Math.cos(angle) * 4;
        const y = 8 + Math.sin(angle) * 2;
        
        // Add Art Nouveau flourish
        const flourish = Math.sin(t * Math.PI * 3) * 0.2;
        
        archPoints.push(new THREE.Vector3(x, y + flourish, 0));
    }
    
    const archCurve = new THREE.CatmullRomCurve3(archPoints);
    const archGeometry = new THREE.TubeGeometry(archCurve, 30, 0.15, 8, false);
    const arch = new THREE.Mesh(archGeometry, ironMaterial);
    entranceGroup.add(arch);
    
    // "MÉTROPOLITAIN" sign
    const signGeometry = new THREE.PlaneGeometry(5, 0.8);
    const signMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        emissive: 0xffeecc,
        emissiveIntensity: 0.3
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 9, 0.2);
    entranceGroup.add(sign);
    
    // Glass panels with floral pattern
    for (let i = 0; i < 4; i++) {
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 6),
            glassMaterial
        );
        glass.position.set(-2 + i * 1.3, 4, 0.1);
        entranceGroup.add(glass);
    }
    
    // Lamp globes on top
    [-2, 2].forEach(x => {
        const globe = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffffcc,
                transparent: true,
                opacity: 0.8,
                emissive: 0xffffaa,
                emissiveIntensity: 1
            })
        );
        globe.position.set(x, 10, 0);
        entranceGroup.add(globe);
        
        const light = new THREE.PointLight(0xffffaa, 2, 15);
        light.position.copy(globe.position);
        entranceGroup.add(light);
    });
    
    return entranceGroup;
}

createPlatformRailings() {
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.4,
        metalness: 0.8
    });
    
    // Railings along platform edge
    const railingPositions = [
        { x: -8, z: 0, length: 80 },
        { x: 8, z: 0, length: 80 }
    ];
    
    railingPositions.forEach(pos => {
        // Top rail (curved organic line)
        const points = [];
        for (let i = 0; i <= 40; i++) {
            const z = -40 + (i / 40) * pos.length;
            const wave = Math.sin(i * 0.3) * 0.1;
            points.push(new THREE.Vector3(pos.x + wave, 1.2, z));
        }
        
        const railCurve = new THREE.CatmullRomCurve3(points);
        const railGeometry = new THREE.TubeGeometry(railCurve, 40, 0.05, 8, false);
        const rail = new THREE.Mesh(railGeometry, ironMaterial);
        this.rooms[0].add(rail);
        
        // Decorative posts
        for (let i = 0; i < 20; i++) {
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8),
                ironMaterial
            );
            post.position.set(
                pos.x,
                0.6,
                -40 + (i / 19) * pos.length
            );
            this.rooms[0].add(post);
            
            // Floral decoration on posts
            if (i % 3 === 0) {
                const flower = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 6, 6),
                    new THREE.MeshStandardMaterial({
                        color: 0xd4af37,
                        roughness: 0.3,
                        metalness: 0.9
                    })
                );
                flower.position.set(pos.x, 1, -40 + (i / 19) * pos.length);
                this.rooms[0].add(flower);
            }
        }
    });
}

// ========================================
// STAINED GLASS PANELS
// ========================================

createStainedGlass() {
    const glassPositions = [
        { x: -19, z: -30 },
        { x: 19, z: -30 },
        { x: -19, z: 0 },
        { x: 19, z: 0 },
        { x: -19, z: 30 },
        { x: 19, z: 30 }
    ];
    
    glassPositions.forEach(pos => {
        const panel = this.createStainedGlassPanel();
        panel.position.set(pos.x, 5, pos.z);
        panel.rotation.y = pos.x < 0 ? Math.PI/2 : -Math.PI/2;
        
        this.rooms[0].add(panel);
        this.stainedGlass.push(panel);
    });
}

createStainedGlassPanel() {
    const panelGroup = new THREE.Group();
    
    // Frame (iron)
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 4, 3),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.8
        })
    );
    panelGroup.add(frame);
    
    // Glass segments (Art Nouveau floral pattern)
    const glassColors = [
        0xff6633, // Orange
        0x3366ff, // Blue
        0x33ff66, // Green
        0xffcc33, // Yellow
        0xff33cc  // Magenta
    ];
    
    // Central flower
    const centerFlower = new THREE.Mesh(
        new THREE.CircleGeometry(0.5, 8),
        new THREE.MeshStandardMaterial({
            color: glassColors[0],
            transparent: true,
            opacity: 0.7,
            emissive: glassColors[0],
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide
        })
    );
    centerFlower.position.z = 0.06;
    panelGroup.add(centerFlower);
    
    // Petals around center
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(
            new THREE.CircleGeometry(0.4, 4),
            new THREE.MeshStandardMaterial({
                color: glassColors[(i + 1) % glassColors.length],
                transparent: true,
                opacity: 0.7,
                emissive: glassColors[(i + 1) % glassColors.length],
                emissiveIntensity: 0.4,
                side: THREE.DoubleSide
            })
        );
        petal.position.set(
            Math.cos(angle) * 0.7,
            Math.sin(angle) * 0.7,
            0.06
        );
        petal.rotation.z = angle;
        panelGroup.add(petal);
    }
    
    // Flowing stems (bottom)
    for (let i = 0; i < 3; i++) {
        const stemPoints = [];
        for (let j = 0; j <= 10; j++) {
            const t = j / 10;
            const x = -0.5 + i * 0.5;
            const y = -2 + t * 2;
            const curve = Math.sin(t * Math.PI * 2) * 0.2;
            stemPoints.push(new THREE.Vector3(x + curve, y, 0.06));
        }
        
        const stemCurve = new THREE.CatmullRomCurve3(stemPoints);
        const stemGeometry = new THREE.TubeGeometry(stemCurve, 10, 0.05, 6, false);
        const stem = new THREE.Mesh(
            stemGeometry,
            new THREE.MeshStandardMaterial({
                color: glassColors[2],
                transparent: true,
                opacity: 0.7,
                emissive: glassColors[2],
                emissiveIntensity: 0.3
            })
        );
        panelGroup.add(stem);
    }
    
    // Backlight
    const light = new THREE.PointLight(0xffaa66, 0.8, 10);
    light.position.z = -0.5;
    panelGroup.add(light);
    panelGroup.userData.light = light;
    
    return panelGroup;
}

// ========================================
// ART NOUVEAU LAMPS (Tiffany-style)
// ========================================

createArtNouveauLamps() {
    // Platform lamps (every 10 units along platform)
    for (let i = 0; i < 9; i++) {
        const lamp = this.createTiffanyLamp();
        lamp.position.set(
            i % 2 === 0 ? -10 : 10,
            0,
            -40 + i * 10
        );
        
        this.rooms[0].add(lamp);
        this.lamps.push(lamp);
    }
    
    // Wall-mounted sconces
    for (let i = 0; i < 12; i++) {
        const sconce = this.createWallSconce();
        sconce.position.set(
            i % 2 === 0 ? -18 : 18,
            4,
            -50 + i * 8
        );
        sconce.rotation.y = i % 2 === 0 ? Math.PI/2 : -Math.PI/2;
        
        this.rooms[0].add(sconce);
        this.lamps.push(sconce);
    }
}

createTiffanyLamp() {
    const lampGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.4,
        metalness: 0.8
    });
    
    // Base (ornate cast iron)
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8),
        ironMaterial
    );
    base.position.y = 0.15;
    lampGroup.add(base);
    
    // Stem with organic curves
    const stemPoints = [];
    for (let i = 0; i <= 15; i++) {
        const t = i / 15;
        const y = t * 4;
        const curve = Math.sin(t * Math.PI * 2) * 0.15;
        stemPoints.push(new THREE.Vector3(curve, y, 0));
    }
    
    const stemCurve = new THREE.CatmullRomCurve3(stemPoints);
    const stemGeometry = new THREE.TubeGeometry(stemCurve, 15, 0.08, 8, false);
    const stem = new THREE.Mesh(stemGeometry, ironMaterial);
    stem.position.y = 0.3;
    lampGroup.add(stem);
    
    // Decorative nodes on stem
    for (let i = 1; i <= 3; i++) {
        const node = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                roughness: 0.3,
                metalness: 0.9
            })
        );
        node.position.y = i * 1.3;
        lampGroup.add(node);
    }
    
    // Shade (Tiffany glass dome)
    const shadeColors = [0xff6633, 0xffcc33, 0x33ff66, 0x3366ff, 0xff33cc];
    
    // Main dome
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const segment = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 8, angle, Math.PI / 4, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({
                color: shadeColors[i % shadeColors.length],
                transparent: true,
                opacity: 0.8,
                emissive: shadeColors[i % shadeColors.length],
                emissiveIntensity: 0.4,
                side: THREE.DoubleSide
            })
        );
        segment.position.y = 4.5;
        lampGroup.add(segment);
    }
    
    // Decorative bronze rim
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.08, 8, 16),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 4.5;
    lampGroup.add(rim);
    
    // Light source
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.9
        })
    );
    bulb.position.y = 4.3;
    lampGroup.add(bulb);
    lampGroup.userData.bulb = bulb;
    
    const light = new THREE.PointLight(0xffddaa, 2, 12);
    light.position.y = 4.3;
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    lampGroup.add(light);
    lampGroup.userData.light = light;
    
    return lampGroup;
}

createWallSconce() {
    const sconceGroup = new THREE.Group();
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.4,
        metalness: 0.8
    });
    
    // Wall mount (organic flowing design)
    const mount = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.2),
        ironMaterial
    );
    sconceGroup.add(mount);
    
    // Curved arm
    const armPoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.3, 0.2, 0.2),
        new THREE.Vector3(0.5, 0.3, 0.5)
    ];
    const armCurve = new THREE.CatmullRomCurve3(armPoints);
    const armGeometry = new THREE.TubeGeometry(armCurve, 10, 0.06, 8, false);
    const arm = new THREE.Mesh(armGeometry, ironMaterial);
    sconceGroup.add(arm);
    
    // Glass shade (tulip shape)
    const shade = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
            color: 0xffaa66,
            transparent: true,
            opacity: 0.7,
            emissive: 0xff8844,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        })
    );
    shade.position.set(0.5, 0.3, 0.5);
    shade.rotation.x = Math.PI;
    sconceGroup.add(shade);
    
    // Light
    const light = new THREE.PointLight(0xffaa66, 1.5, 10);
    light.position.set(0.5, 0.3, 0.5);
    sconceGroup.add(light);
    sconceGroup.userData.light = light;
    
    return sconceGroup;
}

// ========================================
// PLATFORM
// ========================================

createPlatform() {
    // ✓ PLATFORM EDGE LINES (both sides)
    [-8, 8].forEach(x => {
        const edgeLine = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 90),
            new THREE.MeshBasicMaterial({
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.5
            })
        );
        edgeLine.rotation.x = -Math.PI / 2;
        edgeLine.position.set(x, 0.01, 0);
        this.rooms[0].add(edgeLine);
    });
    
    // ✓ CREATE LEFT AND RIGHT TRACKS
    [-17, 17].forEach(trackX => {
        // Track bed
        const trackBed = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 100),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.9
            })
        );
        trackBed.rotation.x = -Math.PI / 2;
        trackBed.position.set(trackX, -0.5, 0);
        this.rooms[0].add(trackBed);
        
        // Rails (two per track)
        [-2, 2].forEach(offset => {
            const rail = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.2, 100),
                new THREE.MeshStandardMaterial({
                    color: 0x8a8a8a,
                    roughness: 0.3,
                    metalness: 0.9
                })
            );
            rail.position.set(trackX + offset, -0.4, 0);
            this.rooms[0].add(rail);
        });
        
        // Wooden sleepers
        for (let i = 0; i < 50; i++) {
            const sleeper = new THREE.Mesh(
                new THREE.BoxGeometry(4, 0.3, 0.3),
                new THREE.MeshStandardMaterial({
                    color: 0x4a3a2a,
                    roughness: 0.9
                })
            );
            sleeper.position.set(trackX, -0.5, -48 + i * 2);
            this.rooms[0].add(sleeper);
        }
    });
}

// ========================================
// TICKET BOOTH (vintage style)
// ========================================

createTicketBooth() {
    const boothGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a3a1a,
        roughness: 0.8
    });
    
    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.9
    });
    
    // Main booth structure
    const booth = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 2),
        woodMaterial
    );
    booth.position.y = 1.5;
    boothGroup.add(booth);
    
    // Ornate top
    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.6, 0.5, 8),
        brassMaterial
    );
    top.position.y = 3.25;
    boothGroup.add(top);
    
    // Window (brass frame)
    const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1, 0.1),
        brassMaterial
    );
    windowFrame.position.set(0, 2, 1.01);
    boothGroup.add(windowFrame);
    
    // Glass
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 0.8),
        new THREE.MeshStandardMaterial({
            color: 0xccffff,
            transparent: true,
            opacity: 0.5
        })
    );
    glass.position.set(0, 2, 1.02);
    boothGroup.add(glass);
    
    // "BILLETS" (Tickets) sign
    const sign = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.4, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0xf5f5dc,
            emissive: 0xffeecc,
            emissiveIntensity: 0.3
        })
    );
    sign.position.set(0, 3.2, 1.05);
    boothGroup.add(sign);
    
    // Ticket slot
    const slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.1, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.7
        })
    );
    slot.position.set(0, 1.3, 1.1);
    boothGroup.add(slot);
    
    // Decorative Art Nouveau panels on sides
    [-1.5, 1.5].forEach(x => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0x6a8a6a,
                roughness: 0.6
            })
        );
        panel.position.set(x, 2, 0);
        boothGroup.add(panel);
    });
    
    boothGroup.position.set(15, 0, -45);
    this.rooms[0].add(boothGroup);
}

// ========================================
// TRAIN SYSTEM (arriving/departing)
// ========================================

createTrainSystem() {
    // Create two trains (one arriving, one departing)
    const train1 = this.createMetroTrain();
    train1.position.set(-17, -0.3, -80); // ✓ CHANGED: -13 → -17
    train1.userData.direction = 1; // Moving forward
    train1.userData.speed = 0.3;
    train1.userData.state = 'arriving';
    train1.userData.stopPosition = -20;
    train1.userData.departPosition = 80;
    this.rooms[0].add(train1);
    this.trains.push(train1);
    
    const train2 = this.createMetroTrain();
    train2.position.set(-17, -0.3, 80); // ✓ CHANGED: -13 → -17
    train2.userData.direction = -1; // Moving backward
    train2.userData.speed = 0;
    train2.userData.state = 'waiting';
    train2.userData.waitTime = 10;
    this.rooms[0].add(train2);
    this.trains.push(train2);
}

createMetroTrain() {
    const trainGroup = new THREE.Group();
    
    const trainMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a4a2a,
        roughness: 0.4,
        metalness: 0.8
    });
    
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        transparent: true,
        opacity: 0.6,
        emissive: 0xffffaa,
        emissiveIntensity: 0.4
    });
    
    // Create 3 train cars
    for (let carIndex = 0; carIndex < 3; carIndex++) {
        const carGroup = new THREE.Group();
        
        // Car body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3, 15),
            trainMaterial
        );
        body.position.y = 1.5;
        body.castShadow = true;
        carGroup.add(body);
        
        // Rounded roof
        const roof = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.5, 15, 16, 1, false, 0, Math.PI),
            trainMaterial
        );
        roof.rotation.z = Math.PI / 2;
        roof.position.y = 3;
        carGroup.add(roof);
        
        // Windows (8 per car)
        for (let i = 0; i < 8; i++) {
            [-1.51, 1.51].forEach(x => {
                const window = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.8, 1.2),
                    windowMaterial
                );
                window.position.set(x, 1.8, -6 + i * 1.7);
                window.rotation.y = x < 0 ? Math.PI/2 : -Math.PI/2;
                carGroup.add(window);
            });
        }
        
        // Doors (2 per car)
        [-4, 4].forEach(z => {
            [-1.52, 1.52].forEach(x => {
                const door = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.2, 2.2),
                    new THREE.MeshStandardMaterial({
                        color: 0x4a4a4a,
                        roughness: 0.5,
                        metalness: 0.6
                    })
                );
                door.position.set(x, 1.1, z);
                door.rotation.y = x < 0 ? Math.PI/2 : -Math.PI/2;
                carGroup.add(door);
            });
        });
        
        // Undercarriage
        const undercarriage = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 14),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.8,
                metalness: 0.7
            })
        );
        undercarriage.position.y = 0.2;
        carGroup.add(undercarriage);
        
        // Wheels (4 per car)
        [-5, 5].forEach(z => {
            [-1.3, 1.3].forEach(x => {
                const wheel = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0x3a3a3a,
                        roughness: 0.6,
                        metalness: 0.9
                    })
                );
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(x, 0, z);
                carGroup.add(wheel);
            });
        });
        
        // Position car in train
        carGroup.position.z = carIndex * 16;
        trainGroup.add(carGroup);
        
        // Store for animation
        this.trainCars.push(carGroup);
    }
    
    // Front headlights
    const headlight1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            emissive: 0xffffaa,
            emissiveIntensity: 1
        })
    );
    headlight1.position.set(-1, 2, -7.5);
    trainGroup.children[0].add(headlight1);
    
    const headlight2 = headlight1.clone();
    headlight2.position.x = 1;
    trainGroup.children[0].add(headlight2);
    
    const frontLight = new THREE.SpotLight(0xffffaa, 2, 30, Math.PI/6, 0.5);
    frontLight.position.set(0, 2, -8);
    frontLight.target.position.set(0, 0, -20);
    trainGroup.children[0].add(frontLight);
    trainGroup.children[0].add(frontLight.target);
    
    return trainGroup;
}

// ========================================
// PERIOD ADVERTISEMENTS (1900s posters)
// ========================================

createPeriodAdvertisements() {
    const adPositions = [
        { x: -18.5, z: -35 },
        { x: 18.5, z: -35 },
        { x: -18.5, z: -15 },
        { x: 18.5, z: -15 },
        { x: -18.5, z: 5 },
        { x: 18.5, z: 5 },
        { x: -18.5, z: 25 },
        { x: 18.5, z: 25 }
    ];
    
    const adTypes = [
        { color: 0xff6633, text: 'ABSINTHE' },
        { color: 0x3366ff, text: 'CHOCOLAT MENIER' },
        { color: 0xffcc33, text: 'MOULIN ROUGE' },
        { color: 0x33cc33, text: 'CHEMINS DE FER' }
    ];
    
    adPositions.forEach((pos, index) => {
        const ad = this.createAdvertisement(adTypes[index % adTypes.length]);
        ad.position.set(pos.x, 3, pos.z);
        ad.rotation.y = pos.x < 0 ? Math.PI/2 : -Math.PI/2;
        
        this.rooms[0].add(ad);
        this.advertisements.push(ad);
    });
}

createAdvertisement(type) {
    const adGroup = new THREE.Group();
    
    // Ornate frame (gilded)
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 3.5, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.9
        })
    );
    adGroup.add(frame);
    
    // Poster
    const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 3.2),
        new THREE.MeshStandardMaterial({
            color: type.color,
            roughness: 0.7,
            emissive: type.color,
            emissiveIntensity: 0.2
        })
    );
    poster.position.z = 0.11;
    adGroup.add(poster);
    
    // Decorative Art Nouveau border
    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.5
    });
    
    // Top flourish
    const flourish = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.3, 0.05),
        borderMaterial
    );
    flourish.position.set(0, 1.5, 0.12);
    adGroup.add(flourish);
    
    return adGroup;
}

// ========================================
// BENCHES (period style)
// ========================================

createBenches() {
    const benchPositions = [
        { x: 5, z: -30 },
        { x: 5, z: -10 },
        { x: 5, z: 10 },
        { x: 5, z: 30 }
    ];
    
    benchPositions.forEach(pos => {
        const bench = this.createPeriodBench();
        bench.position.set(pos.x, 0, pos.z);
        this.rooms[0].add(bench);
    });
}

createPeriodBench() {
    const benchGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a3a1a,
        roughness: 0.8
    });
    
    const ironMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.5,
        metalness: 0.8
    });
    
    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.2, 1),
        woodMaterial
    );
    seat.position.y = 1;
    benchGroup.add(seat);
    
    // Backrest
    const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 0.2),
        woodMaterial
    );
    backrest.position.set(0, 1.5, -0.4);
    benchGroup.add(backrest);
    
    // Ornate iron legs (Art Nouveau curves)
    [-1.2, 1.2].forEach(x => {
        const legPoints = [
            new THREE.Vector3(x, 0, 0),
            new THREE.Vector3(x + 0.1, 0.3, 0),
            new THREE.Vector3(x, 0.7, -0.2),
            new THREE.Vector3(x, 1, -0.3)
        ];
        
        const legCurve = new THREE.CatmullRomCurve3(legPoints);
        const legGeometry = new THREE.TubeGeometry(legCurve, 10, 0.05, 8, false);
        const leg = new THREE.Mesh(legGeometry, ironMaterial);
        benchGroup.add(leg);
    });
    
    return benchGroup;
}

// ========================================
// PLATFORM PERFORMERS (musicians/artists)
// ========================================

createPerformers() {
    // Violinist
    const violinist = this.createPerformer('violin');
    violinist.position.set(3, 0, 20);
    violinist.rotation.y = Math.PI / 4;
    violinist.userData.animationType = 'violin';
    this.rooms[0].add(violinist);
    this.performers.push(violinist);
    
    // Accordion player
    const accordionist = this.createPerformer('accordion');
    accordionist.position.set(-3, 0, -20);
    accordionist.rotation.y = -Math.PI / 4;
    accordionist.userData.animationType = 'accordion';
    this.rooms[0].add(accordionist);
    this.performers.push(accordionist);
}

createPerformer(type) {
    const performerGroup = new THREE.Group();
    
    const clothMaterial = new THREE.MeshStandardMaterial({
        color: type === 'violin' ? 0x2a2a2a : 0x4a3a2a,
        roughness: 0.8
    });
    
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5deb3,
        roughness: 0.7
    });
    
    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8),
        clothMaterial
    );
    body.position.y = 2;
    performerGroup.add(body);
    
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 12),
        skinMaterial
    );
    head.position.y = 3;
    performerGroup.add(head);
    performerGroup.userData.head = head;
    
    // Hat (bowler)
    const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.6
        })
    );
    hat.position.y = 3.4;
    performerGroup.add(hat);
    
    const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16),
        hat.material
    );
    brim.position.y = 3.25;
    performerGroup.add(brim);
    
    // Arms
    [-0.5, 0.5].forEach((x, index) => {
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8),
            clothMaterial
        );
        arm.position.set(x, 2, 0.3);
        arm.rotation.z = x < 0 ? 0.5 : -0.5;
        arm.rotation.x = -0.5;
        performerGroup.add(arm);
        
        if (index === 1) {
            performerGroup.userData.rightArm = arm;
        }
    });
    
    // Legs
    [-0.2, 0.2].forEach(x => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.15, 1.8, 8),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.8
            })
        );
        leg.position.set(x, 0.9, 0);
        performerGroup.add(leg);
    });
    
    // Instrument
    if (type === 'violin') {
        const violin = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.6, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.4
            })
        );
        violin.position.set(0.4, 2.3, 0.3);
        violin.rotation.y = -Math.PI / 4;
        performerGroup.add(violin);
        
        // Bow
        const bow = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a })
        );
        bow.position.set(0.5, 2.2, 0.4);
        bow.rotation.z = Math.PI / 6;
        performerGroup.add(bow);
        performerGroup.userData.bow = bow;
    } else if (type === 'accordion') {
        const accordion = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.4, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0xcc0000,
                roughness: 0.5,
                metalness: 0.3
            })
        );
        accordion.position.set(0, 2.2, 0.4);
        performerGroup.add(accordion);
        performerGroup.userData.accordion = accordion;
    }
    
    // Instrument case at feet
    const case_ = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.15, 1),
        new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.7
        })
    );
    case_.position.set(0.8, 0.08, 0);
    performerGroup.add(case_);
    
    // Coins in case
    for (let i = 0; i < 5; i++) {
        const coin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffd700,
                roughness: 0.3,
                metalness: 0.9
            })
        );
        coin.position.set(
            0.8 + (Math.random() - 0.5) * 0.3,
            0.16,
            (Math.random() - 0.5) * 0.8
        );
        coin.rotation.x = Math.PI / 2;
        performerGroup.add(coin);
    }
    
    return performerGroup;
}





// Continue with animations in next message...

// ========================================
// COMPLETE METRO ANIMATIONS
// ========================================

updateMetroAnimations() {
    const time = Date.now() * 0.001;
    
    // 1. TRAIN SYSTEM (arriving/departing)
    if (this.trains) {
        this.trains.forEach(train => {
            if (train.userData.state === 'arriving') {
                // Train approaching station
                train.position.z += train.userData.speed * train.userData.direction;
                
                // Slow down as approaching stop
                const distanceToStop = Math.abs(train.position.z - train.userData.stopPosition);
                if (distanceToStop < 10) {
                    train.userData.speed = Math.max(0.05, train.userData.speed * 0.98);
                }
                
                // Stop at platform
                if (Math.abs(train.position.z - train.userData.stopPosition) < 0.5) {
                    train.userData.state = 'stopped';
                    train.userData.speed = 0;
                    train.userData.stopTime = time;
                }
            } else if (train.userData.state === 'stopped') {
                // Wait at platform for 8 seconds
                if (time - train.userData.stopTime > 8) {
                    train.userData.state = 'departing';
                    train.userData.speed = 0.05;
                }
            } else if (train.userData.state === 'departing') {
                // Train leaving station
                train.position.z += train.userData.speed * train.userData.direction;
                
                // Accelerate
                train.userData.speed = Math.min(0.4, train.userData.speed * 1.02);
                
                // Reset when far enough
                if (Math.abs(train.position.z) > 80) {
                    train.position.z = train.userData.direction > 0 ? -80 : 80;
                    train.userData.state = 'arriving';
                    train.userData.speed = 0.3;
                }
            } else if (train.userData.state === 'waiting') {
                // Second train waiting to depart
                train.userData.waitTime -= 0.016;
                if (train.userData.waitTime <= 0) {
                    train.userData.state = 'departing';
                    train.userData.speed = 0.05;
                }
            }
        });
    }
    
    // 2. LAMP FLICKERING (Art Nouveau lamps)
    if (this.lamps) {
        this.lamps.forEach((lamp, index) => {
            // Subtle warm flicker
            if (lamp.userData.light) {
                const flicker = 1.8 + Math.sin(time * 4 + index) * 0.2 +
                               Math.sin(time * 7.3 + index * 2) * 0.1;
                lamp.userData.light.intensity = flicker;
                
                // Color temperature variation (more orange to more yellow)
                const colorTemp = 0.9 + Math.sin(time * 3 + index) * 0.05;
                lamp.userData.light.color.setRGB(1, colorTemp, 0.6);
            }
            
            // Bulb glow pulse
            if (lamp.userData.bulb) {
                const pulse = 0.85 + Math.sin(time * 5 + index * 1.5) * 0.15;
                lamp.userData.bulb.material.opacity = pulse;
            }
        });
    }
    
    // 3. STAINED GLASS BACKLIGHT PULSING
    if (this.stainedGlass) {
        this.stainedGlass.forEach((panel, index) => {
            if (panel.userData.light) {
                const pulse = 0.6 + Math.sin(time * 1.5 + index * 0.7) * 0.2;
                panel.userData.light.intensity = pulse;
            }
            
            // Individual glass segments shimmer
            panel.children.forEach(child => {
                if (child.material && child.material.emissiveIntensity !== undefined) {
                    const shimmer = 0.3 + Math.sin(time * 2 + index + child.position.x) * 0.15;
                    child.material.emissiveIntensity = shimmer;
                }
            });
        });
    }
    
    // 4. PERFORMERS PLAYING INSTRUMENTS
    if (this.performers) {
        this.performers.forEach(performer => {
            const animPhase = time * 2;
            
            if (performer.userData.animationType === 'violin') {
                // Violin bow movement
                if (performer.userData.bow) {
                    const bowMotion = Math.sin(animPhase * 1.5) * 0.15;
                    performer.userData.bow.rotation.z = Math.PI / 6 + bowMotion;
                    performer.userData.bow.position.y = 2.2 + Math.sin(animPhase * 1.5) * 0.05;
                }
                
                // Head sway
                if (performer.userData.head) {
                    performer.userData.head.rotation.z = Math.sin(animPhase * 0.8) * 0.1;
                    performer.userData.head.rotation.x = Math.sin(animPhase * 0.5) * 0.05;
                }
                
                // Arm movement
                if (performer.userData.rightArm) {
                    performer.userData.rightArm.rotation.z = -0.5 + Math.sin(animPhase * 1.5) * 0.2;
                }
            } else if (performer.userData.animationType === 'accordion') {
                // Accordion squeeze
                if (performer.userData.accordion) {
                    const squeeze = 0.3 + Math.sin(animPhase) * 0.1;
                    performer.userData.accordion.scale.z = squeeze;
                }
                
                // Head bob
                if (performer.userData.head) {
                    performer.userData.head.position.y = 3 + Math.sin(animPhase * 0.6) * 0.05;
                    performer.userData.head.rotation.y = Math.sin(animPhase * 0.4) * 0.08;
                }
                
                // Body sway
                performer.rotation.z = Math.sin(animPhase * 0.7) * 0.03;
            }
        });
    }
    
    // 5. IRONWORK SUBTLE SWAY (organic movement)
    if (this.ironwork) {
        this.ironwork.forEach((element, index) => {
            const sway = Math.sin(time * 0.5 + index * 0.3) * 0.002;
            element.rotation.z = sway;
        });
    }
    
    // 6. ADVERTISEMENTS SUBTLE GLOW
    if (this.advertisements) {
        this.advertisements.forEach((ad, index) => {
            ad.children.forEach(child => {
                if (child.material && child.material.emissiveIntensity !== undefined) {
                    const glow = 0.2 + Math.sin(time * 0.8 + index) * 0.08;
                    child.material.emissiveIntensity = glow;
                }
            });
        });
    }
    
    // 7. TRAIN CAR WINDOWS FLICKERING
    if (this.trainCars) {
        this.trainCars.forEach((car, index) => {
            car.children.forEach(child => {
                if (child.material && child.material.emissive && 
                    child.material.emissive.getHex() === 0xffffaa) {
                    const flicker = 0.3 + Math.sin(time * 6 + index * 2) * 0.1;
                    child.material.emissiveIntensity = flicker;
                }
            });
        });
    }
    
    // 8. PLATFORM EDGE LINE PULSING (safety warning)
    // Find yellow platform edge line
    this.rooms[0].children.forEach(child => {
        if (child.material && child.material.color && 
            child.material.color.getHex() === 0xffff00) {
            const pulse = 0.4 + Math.sin(time * 3) * 0.15;
            child.material.emissiveIntensity = pulse;
        }
    });
    
    // 9. ATMOSPHERIC DUST PARTICLES (subtle)
    // Create floating dust in light rays
    if (!this.dustParticles) {
        this.dustParticles = [];
        
        for (let i = 0; i < 30; i++) {
            const dust = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 4, 4),
                new THREE.MeshBasicMaterial({
                    color: 0xffffee,
                    transparent: true,
                    opacity: 0.3
                })
            );
            
            dust.position.set(
                (Math.random() - 0.5) * 30,
                Math.random() * 12,
                (Math.random() - 0.5) * 80
            );
            
            dust.userData.velocity = {
                x: (Math.random() - 0.5) * 0.01,
                y: Math.random() * 0.02 + 0.01,
                z: (Math.random() - 0.5) * 0.01
            };
            
            this.rooms[0].add(dust);
            this.dustParticles.push(dust);
        }
    }
    
  
    
    // 10. ENTRANCE ARCH LAMPS GLOW
    // The entrance archway globes should pulse gently
    this.rooms[0].traverse(child => {
        if (child.material && child.material.emissive && 
            child.material.emissive.getHex() === 0xffffaa &&
            child.geometry && child.geometry.type === 'SphereGeometry' &&
            child.position.y > 9) {
            const glow = 0.9 + Math.sin(time * 2) * 0.15;
            child.material.emissiveIntensity = glow;
        }
    });
    
    // 11. CEILING SHADOWS (simulate passing lights)
    // Subtle lighting variations to simulate atmospheric depth
    if (Math.random() < 0.01) { // Occasional flicker
        this.rooms[0].children.forEach(child => {
            if (child.type === 'PointLight' && child.position.y > 10) {
                const randomFlicker = 0.95 + Math.random() * 0.1;
                child.intensity *= randomFlicker;
            }
        });
    }
    
    // 12. ORGANIC PILLAR VINE SHIMMER
    // The gold vine decorations on pillars should subtly shimmer
    this.rooms[0].traverse(child => {
        if (child.material && child.material.color && 
            child.material.color.getHex() === 0xd4af37 &&
            child.geometry && child.geometry.type === 'SphereGeometry' &&
            child.geometry.parameters && child.geometry.parameters.radius < 0.1) {
            // These are the small vine decorations
            if (!child.userData.shimmerPhase) {
                child.userData.shimmerPhase = Math.random() * Math.PI * 2;
            }
            
            const shimmer = 0.5 + Math.sin(time * 1.5 + child.userData.shimmerPhase) * 0.3;
            
            if (!child.material.emissive) {
                child.material.emissive = new THREE.Color(0xaa8800);
            }
            child.material.emissiveIntensity = shimmer * 0.2;
        }
    });
}

// ========================================
// COLLISION BOUNDARIES
// ========================================

checkCollisions() {
    if (!this.isMobile) {
        this.camera.position.y = this.cameraHeight || 1.6;
        
        // Bazaar bounds
        const minX = -27;
        const maxX = 27;
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
    // Spawn on platform near entrance
    return {
        x: 0,
        y: this.cameraHeight || 1.6,
        z: -40
    };
}

// ========================================
// OPTIONAL: Sound System (Framework)
// ========================================

playMetroAmbience() {
    // Could add:
    // - Train arrival/departure sounds
    // - Platform announcements in French
    // - Violin music from performer
    // - Accordion music
    // - Distant crowd murmur
    // - Echoing footsteps
    console.log("🎵 Metro ambience (audio not implemented)");
}

// ========================================
// TRAIN ANNOUNCEMENT SYSTEM (Visual)
// ========================================

showTrainAnnouncement(message) {
    const announcement = document.createElement('div');
    announcement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2a4a2a 0%, #1a3a1a 100%);
        color: #ffff00;
        padding: 20px 40px;
        border-radius: 10px;
        font-family: 'Georgia', serif;
        font-size: 24px;
        z-index: 1001;
        border: 3px solid #d4af37;
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.8);
        text-align: center;
        animation: fadeInOut 4s ease-in-out;
    `;
    
    announcement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">🚇 MÉTROPOLITAIN 🚇</div>
        <div style="font-size: 18px;">${message}</div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        announcement.remove();
    }, 4000);
}

// Call this when trains arrive/depart
updateTrainAnnouncements() {
    if (this.trains) {
        this.trains.forEach((train, index) => {
            // Show announcement when train stops
            if (train.userData.state === 'stopped' && !train.userData.announcementShown) {
                const direction = index === 0 ? 'Direction Porte de Vincennes' : 'Direction Château de Vincennes';
                this.showTrainAnnouncement(`Train à quai • ${direction}`);
                train.userData.announcementShown = true;
            }
            
            // Reset flag when departing
            if (train.userData.state === 'departing') {
                train.userData.announcementShown = false;
            }
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
    this.updateMetroAnimations();       // ✓ ADD THIS LINE
    this.updateTrainAnnouncements();    // ✓ ADD THIS LINE (optional)
   
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
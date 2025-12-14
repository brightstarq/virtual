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
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // ✅ UPDATED: Camera position for 20x20 room
    this.roomCameraSettings = [
        { position: new THREE.Vector3(0, 1.6, 8), lookAt: new THREE.Vector3(0, 1.6, 0) }
    ];
    const initialSettings = this.roomCameraSettings[0];
    this.camera.position.copy(initialSettings.position);
    this.camera.lookAt(initialSettings.lookAt);

    this.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
        this.controls.maxDistance = 15; // ✅ UPDATED: Changed from 20 to 15
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
    this.createAvatar();

    this.isLoading = true;
    this.showPreloader();
    this.lastRaycastTime = 0;
    this.raycastInterval = 100;

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
                title: 'Modern Architecture',
                description: 'Geometric patterns in contemporary design.',
                artist: 'Demo Artist'
            }
        },
        {
            url: 'https://picsum.photos/800/600?random=5',
            metadata: {
                filename: 'demo5.jpg',
                title: 'Ocean Waves',
                description: 'The rhythmic motion of the sea.',
                artist: 'Demo Artist'
            }
        },
        {
            url: 'https://picsum.photos/800/600?random=6',
            metadata: {
                filename: 'demo6.jpg',
                title: 'Night Sky',
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
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light (simulates sun/skylight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);

        // Additional directional light for fill
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 8, -5);
        this.scene.add(fillLight);
    }
    
// ============================================================
// MODERN CLASSICAL CREATIVE GALLERY - REDESIGNED
// Blending contemporary architecture with timeless elegance
// ============================================================

createGallery() {
    const textureLoader = new THREE.TextureLoader();

    // ====== PREMIUM MATERIAL PALETTE ======
    
    // 1. ULTRA-POLISHED WHITE MARBLE (Calacatta Gold)
    const calacattaMarble = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.7,
        envMapIntensity: 1.5
    });
    const marbleTexture = new THREE.Texture(this.generateCalacattaMarble(2048, 2048));
    marbleTexture.needsUpdate = true;
    marbleTexture.wrapS = marbleTexture.wrapT = THREE.RepeatWrapping;
    marbleTexture.repeat.set(3, 3);
    calacattaMarble.map = marbleTexture;
    
    // 2. BRUSHED BRONZE (Modern accent)
    const brushedBronze = new THREE.MeshStandardMaterial({
        color: 0xcd7f32,
        roughness: 0.35,
        metalness: 0.95,
        envMapIntensity: 1.2
    });

    // 3. SMOKED GLASS (Contemporary)
    const smokedGlass = new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.7,
        transmission: 0.9,
        thickness: 0.5,
        envMapIntensity: 1.5
    });

    // 4. CHARCOAL CONCRETE (Industrial modern)
    const charcoalConcrete = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.8,
        metalness: 0.2
    });

    // 5. WARM WHITE WALLS (Museum quality)
    const museumWhite = new THREE.MeshStandardMaterial({
        color: 0xf8f8f8,
        roughness: 0.9,
        metalness: 0.05
    });

    // 6. POLISHED BRASS (Classical accent)
    const polishedBrass = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.2,
        metalness: 0.98,
        emissive: 0xb8860b,
        emissiveIntensity: 0.15
    });

    // 7. LED STRIP MATERIAL
    this.ledMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.4
    });

    // ====== MAIN GALLERY SPACE ======
    const room1 = new THREE.Group();
    const roomWidth = 35;
    const roomDepth = 35;
    const roomHeight = 7;

    // ====== FLOOR: GEOMETRIC PATTERN WITH MARBLE INLAY ======
    
    // Main polished white marble floor
    const mainFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(roomWidth - 4, roomDepth - 4),
        calacattaMarble
    );
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.position.y = 0.01;
    mainFloor.receiveShadow = true;
    room1.add(mainFloor);

    // Dark border (modern accent)
    const borderWidth = 2;
    const borders = [
        new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, borderWidth), charcoalConcrete),
        new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, borderWidth), charcoalConcrete),
        new THREE.Mesh(new THREE.PlaneGeometry(borderWidth, roomDepth), charcoalConcrete),
        new THREE.Mesh(new THREE.PlaneGeometry(borderWidth, roomDepth), charcoalConcrete)
    ];
    
    borders[0].position.set(0, 0, -roomDepth / 2 + borderWidth / 2);
    borders[1].position.set(0, 0, roomDepth / 2 - borderWidth / 2);
    borders[2].position.set(-roomWidth / 2 + borderWidth / 2, 0, 0);
    borders[3].position.set(roomWidth / 2 - borderWidth / 2, 0, 0);
    
    borders.forEach(border => {
        border.rotation.x = -Math.PI / 2;
        border.receiveShadow = true;
        room1.add(border);
    });

    // ====== CLASSICAL IONIC COLUMNS (8 columns in symmetrical layout) ======
    
    const columnPositions = [
        { x: -12, z: -12 }, { x: 12, z: -12 },
        { x: -12, z: 12 }, { x: 12, z: 12 },
        { x: -12, z: 0 }, { x: 12, z: 0 },
        { x: 0, z: -12 }, { x: 0, z: 12 }
    ];

    columnPositions.forEach(pos => {
        const column = this.createIonicColumn();
        column.position.set(pos.x, 0, pos.z);
        room1.add(column);
    });

    // ====== WALLS: MODERN PANELING WITH CLASSICAL PROPORTIONS ======
    
    const walls = [
        new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.3), museumWhite),
        new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.3), museumWhite),
        new THREE.Mesh(new THREE.BoxGeometry(0.3, roomHeight, roomDepth), museumWhite),
        new THREE.Mesh(new THREE.BoxGeometry(0.3, roomHeight, roomDepth), museumWhite)
    ];

    walls[0].position.set(0, roomHeight / 2, -roomDepth / 2);
    walls[1].position.set(0, roomHeight / 2, roomDepth / 2);
    walls[2].position.set(-roomWidth / 2, roomHeight / 2, 0);
    walls[3].position.set(roomWidth / 2, roomHeight / 2, 0);

    walls.forEach(wall => {
        wall.receiveShadow = true;
        wall.castShadow = true;
        room1.add(wall);
    });

    // Wall paneling (modern geometric accent)
    const panelHeight = 3;
    const panelWidth = 6;
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.7,
        metalness: 0.1
    });

    // Back wall panels (5 panels)
    for (let i = -2; i <= 2; i++) {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(panelWidth - 0.2, panelHeight, 0.08),
            panelMaterial
        );
        panel.position.set(i * panelWidth, 2.5, -roomDepth / 2 + 0.2);
        panel.castShadow = true;
        room1.add(panel);

        // Brass trim around panels
        const trim = new THREE.Mesh(
            new THREE.BoxGeometry(panelWidth - 0.1, panelHeight, 0.02),
            polishedBrass
        );
        trim.position.copy(panel.position);
        trim.position.z += 0.05;
        room1.add(trim);
    }

    // ====== CEILING: MODERN COFFERED WITH LED STRIPS ======
    
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(roomWidth, roomDepth),
        new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.6,
            metalness: 0.2
        })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    ceiling.receiveShadow = true;
    room1.add(ceiling);

    // Modern coffered ceiling (9 recessed squares)
    const cofferSize = 9;
    const cofferDepth = 0.5;
    
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            // Recessed coffer
            const coffer = new THREE.Mesh(
                new THREE.BoxGeometry(cofferSize - 1, cofferDepth, cofferSize - 1),
                charcoalConcrete
            );
            coffer.position.set(
                x * (cofferSize + 1),
                roomHeight - cofferDepth / 2,
                z * (cofferSize + 1)
            );
            coffer.receiveShadow = true;
            room1.add(coffer);

            // LED strip around coffer edge
            const ledStrip = this.createLEDStrip(cofferSize - 1);
            ledStrip.position.set(
                x * (cofferSize + 1),
                roomHeight - cofferDepth - 0.05,
                z * (cofferSize + 1)
            );
            room1.add(ledStrip);
        }
    }

    // ====== DRAMATIC LIGHTING SYSTEM ======
    
    this.ceilingLights = [];
    this.glassSpotlights = [];

    // Main wash lights (9 coffered lights)
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            // Modern recessed fixture
            const fixture = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.3, 0.2, 32),
                new THREE.MeshStandardMaterial({
                    color: 0x2a2a2a,
                    emissive: 0xffffff,
                    emissiveIntensity: 1.5,
                    roughness: 0.1,
                    metalness: 0.8
                })
            );
            fixture.position.set(
                x * (cofferSize + 1),
                roomHeight - cofferDepth - 0.25,
                z * (cofferSize + 1)
            );
            room1.add(fixture);

            // High-intensity spotlight
            const spotlight = new THREE.SpotLight(0xffffff, 3.5, 30, Math.PI / 4.5, 0.4);
            spotlight.position.copy(fixture.position);
            spotlight.position.y -= 0.1;
            spotlight.target.position.set(x * (cofferSize + 1), 0, z * (cofferSize + 1));
            spotlight.castShadow = true;
            spotlight.shadow.mapSize.width = 2048;
            spotlight.shadow.mapSize.height = 2048;
            spotlight.shadow.bias = -0.0001;
            spotlight.shadow.radius = 4;
            room1.add(spotlight);
            room1.add(spotlight.target);

            this.ceilingLights.push({ mesh: fixture, spot: spotlight });
        }
    }

    // Museum-grade artwork track lighting
    const trackLightPositions = [
        // Back wall (6 lights)
        { x: -12, z: -17, targetZ: -17.5, intensity: 3.5 },
        { x: -7, z: -17, targetZ: -17.5, intensity: 3.5 },
        { x: -2, z: -17, targetZ: -17.5, intensity: 3.5 },
        { x: 2, z: -17, targetZ: -17.5, intensity: 3.5 },
        { x: 7, z: -17, targetZ: -17.5, intensity: 3.5 },
        { x: 12, z: -17, targetZ: -17.5, intensity: 3.5 },
        
        // Left wall (4 lights)
        { x: -17, z: -10, targetX: -17.5, intensity: 3.5 },
        { x: -17, z: -3, targetX: -17.5, intensity: 3.5 },
        { x: -17, z: 3, targetX: -17.5, intensity: 3.5 },
        { x: -17, z: 10, targetX: -17.5, intensity: 3.5 },
        
        // Right wall (4 lights)
        { x: 17, z: -10, targetX: 17.5, intensity: 3.5 },
        { x: 17, z: -3, targetX: 17.5, intensity: 3.5 },
        { x: 17, z: 3, targetX: 17.5, intensity: 3.5 },
        { x: 17, z: 10, targetX: 17.5, intensity: 3.5 }
    ];

    trackLightPositions.forEach(lightPos => {
        // Sleek modern track fixture
        const fixtureBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.16, 0.4, 16),
            brushedBronze
        );
        fixtureBody.position.set(lightPos.x, roomHeight - 0.6, lightPos.z);
        room1.add(fixtureBody);

        // Precision spotlight
        const spotLight = new THREE.SpotLight(0xfff8f0, lightPos.intensity, 18, Math.PI / 7, 0.5);
        spotLight.position.set(lightPos.x, roomHeight - 0.7, lightPos.z);
        
        const target = new THREE.Object3D();
        target.position.set(
            lightPos.targetX || lightPos.x,
            3,
            lightPos.targetZ || lightPos.z
        );
        room1.add(target);
        
        spotLight.target = target;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1536;
        spotLight.shadow.mapSize.height = 1536;
        spotLight.shadow.bias = -0.0001;
        room1.add(spotLight);
        
        this.glassSpotlights.push({ 
            mesh: fixtureBody,
            spot: spotLight, 
            position: spotLight.position.clone() 
        });
    });

    // ====== CENTER FOCAL POINT: FLOATING GLASS SCULPTURE ======
    
    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.set(0, 2, 0);

    // Modern glass spiral
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const height = i * 0.4;
        const radius = 1.2 - i * 0.08;
        
        const glassShard = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 1.5, 0.05),
            smokedGlass
        );
        glassShard.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        glassShard.rotation.y = angle + Math.PI / 2;
        glassShard.rotation.z = Math.PI / 6;
        glassShard.castShadow = true;
        sculptureGroup.add(glassShard);
    }

    // Polished marble base
    const sculptureBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.7, 0.4, 32),
        calacattaMarble
    );
    sculptureBase.position.y = -1.8;
    sculptureBase.castShadow = true;
    sculptureBase.receiveShadow = true;
    sculptureGroup.add(sculptureBase);

    // Brass accent ring
    const brassRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.6, 0.06, 16, 32),
        polishedBrass
    );
    brassRing.position.y = -1.6;
    brassRing.rotation.x = Math.PI / 2;
    sculptureGroup.add(brassRing);

    // Dedicated sculpture spotlight
    const sculptureLight = new THREE.SpotLight(0xffffff, 4.5, 15, Math.PI / 5, 0.6);
    sculptureLight.position.set(0, roomHeight - 1, 0);
    sculptureLight.target = sculptureGroup;
    sculptureLight.castShadow = true;
    room1.add(sculptureLight);

    room1.add(sculptureGroup);

    // ====== MODERN SEATING: CANTILEVERED BENCHES ======
    
    const benchMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.3,
        metalness: 0.8
    });

    const leatherMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.7,
        metalness: 0.2
    });

    const benchPositions = [
        { x: -9, z: 0, rot: Math.PI / 2 },
        { x: 9, z: 0, rot: -Math.PI / 2 }
    ];

    benchPositions.forEach(pos => {
        const benchGroup = new THREE.Group();
        
        // Cantilevered seat (floating appearance)
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(3.5, 0.12, 0.8),
            leatherMaterial
        );
        seat.position.y = 0.5;
        seat.castShadow = true;
        seat.receiveShadow = true;
        benchGroup.add(seat);

        // Cushion
        const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(3.4, 0.15, 0.75),
            new THREE.MeshStandardMaterial({
                color: 0x5a5a5a,
                roughness: 0.8
            })
        );
        cushion.position.y = 0.64;
        benchGroup.add(cushion);

        // Single central support (cantilevered)
        const support = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.5, 0.6),
            benchMaterial
        );
        support.position.y = 0.25;
        support.castShadow = true;
        benchGroup.add(support);

        // Brass feet
        const feet = [
            new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.6), polishedBrass),
            new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.6), polishedBrass)
        ];
        feet[0].position.set(-0.05, 0.015, 0);
        feet[1].position.set(0.05, 0.015, 0);
        feet.forEach(foot => benchGroup.add(foot));

        benchGroup.position.set(pos.x, 0, pos.z);
        benchGroup.rotation.y = pos.rot;
        room1.add(benchGroup);
    });

    // ====== DECORATIVE ELEMENTS ======

    // 1. LIVING GREEN WALLS (Modern biophilic design)
    const livingWallPositions = [
        { x: -17.3, z: -15, width: 0.15, height: 4, depth: 6 },
        { x: 17.3, z: -15, width: 0.15, height: 4, depth: 6 }
    ];

    livingWallPositions.forEach(pos => {
        const livingWall = this.createLivingWall(pos.width, pos.height, pos.depth);
        livingWall.position.set(pos.x, 2.5, pos.z);
        room1.add(livingWall);
    });

    // 2. MINIMALIST PLANTERS
    const planterPositions = [
        { x: -14, z: -14 }, { x: 14, z: -14 },
        { x: -14, z: 14 }, { x: 14, z: 14 }
    ];

    planterPositions.forEach(pos => {
        const planter = this.createModernPlanter();
        planter.position.set(pos.x, 0, pos.z);
        room1.add(planter);
    });

    // 3. ABSTRACT WALL SCULPTURES (Contemporary art)
    const wallSculpturePositions = [
        { x: 0, y: 3.5, z: -17.4, rot: 0 },
        { x: -17.4, y: 3.5, z: 0, rot: Math.PI / 2 },
        { x: 17.4, y: 3.5, z: 0, rot: -Math.PI / 2 }
    ];

    wallSculpturePositions.forEach(pos => {
        const sculpture = this.createAbstractWallSculpture();
        sculpture.position.set(pos.x, pos.y, pos.z);
        sculpture.rotation.y = pos.rot;
        room1.add(sculpture);
    });

    // ====== ARCHITECTURAL GLASS BARRIERS (Safety + Design) ======
    
    const glassBarrierMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.02,
        transparent: true,
        opacity: 0.15,
        transmission: 0.95,
        thickness: 0.3,
        envMapIntensity: 2.0
    });

    const barrierPositions = [
        { start: { x: -3, z: -3 }, end: { x: 3, z: -3 } },
        { start: { x: 3, z: -3 }, end: { x: 3, z: 3 } },
        { start: { x: 3, z: 3 }, end: { x: -3, z: 3 } },
        { start: { x: -3, z: 3 }, end: { x: -3, z: -3 } }
    ];

    barrierPositions.forEach(barrier => {
        const length = Math.sqrt(
            Math.pow(barrier.end.x - barrier.start.x, 2) + 
            Math.pow(barrier.end.z - barrier.start.z, 2)
        );
        
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(length, 1.2, 0.02),
            glassBarrierMaterial
        );
        
        const midX = (barrier.start.x + barrier.end.x) / 2;
        const midZ = (barrier.start.z + barrier.end.z) / 2;
        glass.position.set(midX, 0.6, midZ);
        
        const angle = Math.atan2(barrier.end.z - barrier.start.z, barrier.end.x - barrier.start.x);
        glass.rotation.y = angle;
        
        room1.add(glass);

        // Brass posts at ends
        [barrier.start, barrier.end].forEach(point => {
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16),
                polishedBrass
            );
            post.position.set(point.x, 0.6, point.z);
            room1.add(post);
        });
    });

    // ====== AMBIENT ARCHITECTURAL LIGHTING ======
    
    // LED strip uplighting along walls
    const uplightPositions = [
        { x: -16, z: -16 }, { x: 16, z: -16 },
        { x: -16, z: 16 }, { x: 16, z: 16 }
    ];

    uplightPositions.forEach(pos => {
        const uplight = new THREE.SpotLight(0xffd700, 2.5, 12, Math.PI / 3, 0.6);
        uplight.position.set(pos.x, 0.1, pos.z);
        uplight.target.position.set(pos.x, roomHeight, pos.z);
        uplight.castShadow = false;
        room1.add(uplight);
        room1.add(uplight.target);

        // Modern floor fixture
        const fixture = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.22, 0.12, 24),
            brushedBronze
        );
        fixture.position.set(pos.x, 0.06, pos.z);
        room1.add(fixture);
    });

    // Initialize wall lights array for compatibility
    this.wallLights = [];

    room1.position.set(0, 0, 0);
    this.rooms.push(room1);
    this.rooms.forEach(room => this.scene.add(room));
}

// ====== HELPER METHODS FOR ARCHITECTURAL ELEMENTS ======

createIonicColumn() {
    const columnGroup = new THREE.Group();
    
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.4,
        metalness: 0.3
    });

    // Base (Attic style)
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.55, 0.3, 24),
        columnMaterial
    );
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    columnGroup.add(base);

    // Fluted shaft
    const shaftHeight = 5.5;
    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.45, shaftHeight, 24),
        columnMaterial
    );
    shaft.position.y = 0.3 + shaftHeight / 2;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    columnGroup.add(shaft);

    // Add fluting detail (vertical grooves)
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const flute = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, shaftHeight, 0.1),
            new THREE.MeshStandardMaterial({
                color: 0xeeeeee,
                roughness: 0.5
            })
        );
        flute.position.set(
            Math.cos(angle) * 0.44,
            0.3 + shaftHeight / 2,
            Math.sin(angle) * 0.44
        );
        flute.rotation.y = angle;
        columnGroup.add(flute);
    }

    // Capital (Ionic volutes)
    const capital = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.45, 0.4, 24),
        columnMaterial
    );
    capital.position.y = 0.3 + shaftHeight + 0.2;
    capital.castShadow = true;
    columnGroup.add(capital);

    // Brass accent ring
    const brassRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.03, 12, 24),
        new THREE.MeshStandardMaterial({
            color: 0xb8860b,
            roughness: 0.2,
            metalness: 0.98
        })
    );
    brassRing.position.y = 0.3 + shaftHeight + 0.4;
    brassRing.rotation.x = Math.PI / 2;
    columnGroup.add(brassRing);

    return columnGroup;
}

createLEDStrip(size) {
    const ledGroup = new THREE.Group();
    const ledMaterial = this.ledMaterial.clone();
    
    const stripWidth = 0.05;
    const segments = [
        new THREE.BoxGeometry(size, stripWidth, 0.02),
        new THREE.BoxGeometry(size, stripWidth, 0.02),
        new THREE.BoxGeometry(stripWidth, size, 0.02),
        new THREE.BoxGeometry(stripWidth, size, 0.02)
    ];

    const positions = [
        { x: 0, z: -size / 2 },
        { x: 0, z: size / 2 },
        { x: -size / 2, z: 0 },
        { x: size / 2, z: 0 }
    ];

    segments.forEach((geom, i) => {
        const strip = new THREE.Mesh(geom, ledMaterial);
        strip.position.set(positions[i].x, 0, positions[i].z);
        ledGroup.add(strip);
    });

    return ledGroup;
}

createLivingWall(width, height, depth) {
    const wallGroup = new THREE.Group();
    
    // Dark backing
    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        })
    );
    backing.castShadow = true;
    wallGroup.add(backing);

    // Green foliage (moss/plants)
    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        roughness: 1.0,
        metalness: 0
    });

    // Create random plant patches
    for (let y = 0; y < 6; y++) {
        for (let z = 0; z < 8; z++) {
            if (Math.random() > 0.3) {
                const patch = new THREE.Mesh(
                    new THREE.BoxGeometry(width + 0.05, height / 6, depth / 8),
                    foliageMaterial
                );
                patch.position.set(
                    0.05,
                    -height / 2 + (y + 0.5) * (height / 6),
                    -depth / 2 + (z + 0.5) * (depth / 8)
                );
                wallGroup.add(patch);
            }
        }
    }

    return wallGroup;
}

createModernPlanter() {
    const planterGroup = new THREE.Group();
    
    const planterMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.3,
        metalness: 0.7
    });

    // Sleek angular planter
    const planter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 0.8, 6),
        planterMaterial
    );
    planter.position.y = 0.4;
    planter.castShadow = true;
    planter.receiveShadow = true;
    planterGroup.add(planter);

    // Modern sculptural plant (abstract)
    const plantMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d5a27,
        roughness: 0.8
    });

    for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.8, 0.02),
            plantMaterial
        );
        const angle = (i / 5) * Math.PI * 2;
        leaf.position.set(
            Math.cos(angle) * 0.15,
            1.0 + Math.random() * 0.3,
            Math.sin(angle) * 0.15
        );
        leaf.rotation.y = angle;
        leaf.rotation.z = Math.PI / 8;
        planterGroup.add(leaf);
    }

    return planterGroup;
}

createAbstractWallSculpture() {
    const sculptureGroup = new THREE.Group();
    
    const sculptureMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        roughness: 0.25,
        metalness: 0.95
    });

    // Abstract geometric composition
    const shapes = [
        new THREE.BoxGeometry(0.6, 0.6, 0.1),
        new THREE.BoxGeometry(0.4, 0.8, 0.1),
        new THREE.BoxGeometry(0.5, 0.3, 0.1)
    ];

    shapes.forEach((geom, i) => {
        const piece = new THREE.Mesh(geom, sculptureMaterial);
        piece.position.set(
            (i - 1) * 0.4,
            (i % 2) * 0.3,
            i * 0.05
        );
        piece.rotation.z = (i - 1) * Math.PI / 8;
        piece.castShadow = true;
        sculptureGroup.add(piece);
    });

    return sculptureGroup;
}

generateCalacattaMarble(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Pure white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Gold veining (dramatic and elegant)
    const numVeins = 25;
    for (let i = 0; i < numVeins; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Gold veins
        const color = `rgba(218, 165, 32, ${0.3 + Math.random() * 0.2})`;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 4 + 1;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.random() * Math.PI * 2;
        
        for (let j = 0; j < 150; j++) {
            angle += (Math.random() - 0.5) * 0.5;
            x += Math.cos(angle) * 12;
            y += Math.sin(angle) * 12;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Subtle gray veining
    for (let i = 0; i < 15; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        ctx.strokeStyle = `rgba(150, 150, 150, ${0.15 + Math.random() * 0.1})`;
        ctx.lineWidth = Math.random() * 2 + 0.5;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.random() * Math.PI * 2;
        
        for (let j = 0; j < 100; j++) {
            angle += (Math.random() - 0.5) * 0.4;
            x += Math.cos(angle) * 8;
            y += Math.sin(angle) * 8;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // High polish effect
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 1.5
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}

    // Enhanced wood floor texture generator with VISIBLE colors
    generateEnhancedWoodFloor(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        // Create lighter, more visible wood
        const imageData = context.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                // Wood grain with good visibility
                const grainX = Math.sin(x * 0.015) * 0.12;
                const grainY = Math.sin(y * 0.004) * 0.08;
                const noise = (Math.random() - 0.5) * 0.04;
                const brightness = 0.75 + grainX + grainY + noise;
                
                // Lighter brown wood color (VISIBLE)
                imageData.data[i] = 160 * brightness;     // R
                imageData.data[i + 1] = 130 * brightness; // G  
                imageData.data[i + 2] = 109 * brightness; // B
                imageData.data[i + 3] = 255;              // A
                
                // Plank lines
                if (y % 100 < 2) {
                    imageData.data[i] *= 0.7;
                    imageData.data[i + 1] *= 0.7;
                    imageData.data[i + 2] *= 0.7;
                }
            }
        }
        context.putImageData(imageData, 0, 0);
        return canvas;
    }
    // Light epoxy floor with pearl, marble, and gold veins

// Keep the same normal map generator from before
generateEpoxyNormalMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const noise = (Math.sin(x * 0.02) * Math.cos(y * 0.02)) * 0.5 + 0.5;
            const variation = (Math.random() - 0.5) * 15;
            
            imageData.data[i] = 128 + noise * 20 + variation;
            imageData.data[i + 1] = 128 + noise * 20 + variation;
            imageData.data[i + 2] = 200 + noise * 40;
            imageData.data[i + 3] = 255;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

    generateModernWallTexture(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const i = (y * width + x) * 4;
                const noise = Math.sin(x * 0.05 + y * 0.05) * 0.5 + 0.5;
                imageData.data[i] = noise * 255;
                imageData.data[i + 1] = noise * 255;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 255;
            }
        }

        context.putImageData(imageData, 0, 0);
        return canvas;
    }

    generateNoiseCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 0.1 + 0.9;
            imageData.data[i] = 136 * noise;
            imageData.data[i + 1] = 136 * noise;
            imageData.data[i + 2] = 136 * noise;
            imageData.data[i + 3] = 255;
        }

        context.putImageData(imageData, 0, 0);
        return canvas;
    }

    createAvatar() {
        this.avatarGroup = new THREE.Group();
        const avatarMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });

        const clickablePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 })
        );
        clickablePlane.position.set(2, 1.7, 2);
        this.avatarGroup.add(clickablePlane);

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 32), avatarMaterial);
        body.position.set(2, 0.5, 2);
        this.avatarGroup.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), avatarMaterial);
        head.position.set(2, 1.2, 2);
        this.avatarGroup.add(head);

        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
        const leftArm = new THREE.Mesh(armGeometry, avatarMaterial);
        leftArm.position.set(1.7, 0.7, 2);
        leftArm.rotation.z = Math.PI / 4;
        this.avatarGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, avatarMaterial);
        rightArm.position.set(2.3, 0.7, 2);
        rightArm.rotation.z = -Math.PI / 4;
        this.avatarGroup.add(rightArm);

        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
        const leftLeg = new THREE.Mesh(legGeometry, avatarMaterial);
        leftLeg.position.set(1.8, 0.25, 2);
        this.avatarGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, avatarMaterial);
        rightLeg.position.set(2.2, 0.25, 2);
        this.avatarGroup.add(rightLeg);

        this.avatarGroup.userData = { isAvatar: true };
        this.scene.add(this.avatarGroup);

        this.setupAvatarAnimation();
        this.updateAvatarPosition();
    }

    setupAvatarAnimation() {
        const times = [0, 1, 2];
        const armValues = [
            [Math.PI / 4, -Math.PI / 4],
            [-Math.PI / 4, Math.PI / 4],
            [Math.PI / 4, -Math.PI / 4]
        ];

        const leftArmTrack = new THREE.NumberKeyframeTrack(
            '.children[3].rotation[z]',
            times,
            armValues.map(v => v[0])
        );
        const rightArmTrack = new THREE.NumberKeyframeTrack(
            '.children[4].rotation[z]',
            times,
            armValues.map(v => v[1])
        );

        const clip = new THREE.AnimationClip('avatarWave', 2, [leftArmTrack, rightArmTrack]);
        const action = this.animationMixer.clipAction(clip, this.avatarGroup);
        action.setLoop(THREE.LoopRepeat);
        action.play();
    }

    generatePolishedConcrete(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base concrete color (medium gray)
    ctx.fillStyle = '#9ca3a8';
    ctx.fillRect(0, 0, width, height);
    
    // Add concrete patches and variations
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 200 + 100;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        const darkness = 0.85 + Math.random() * 0.15;
        gradient.addColorStop(0, `rgba(156, 163, 168, ${0.6 * darkness})`);
        gradient.addColorStop(1, 'rgba(156, 163, 168, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    // Add fine aggregate (small stones)
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (Math.random() > 0.993) {
            const brightness = 180 + Math.random() * 40;
            imageData.data[i] = brightness;
            imageData.data[i + 1] = brightness;
            imageData.data[i + 2] = brightness;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Add control joints (expansion lines)
    ctx.strokeStyle = 'rgba(70, 70, 70, 0.4)';
    ctx.lineWidth = 3;
    
    // Horizontal lines
    for (let i = 0; i < height; i += 512) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    
    // Vertical lines
    for (let i = 0; i < width; i += 512) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    
    // Polished sheen overlay
    const sheen = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
    );
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}

generateConcreteNormalMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const noise = (Math.sin(x * 0.03) * Math.cos(y * 0.03)) * 0.5 + 0.5;
            const variation = (Math.random() - 0.5) * 25;
            
            imageData.data[i] = 128 + noise * 25 + variation;
            imageData.data[i + 1] = 128 + noise * 25 + variation;
            imageData.data[i + 2] = 195 + noise * 40;
            imageData.data[i + 3] = 255;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
    updateAvatarPosition() {
        if (this.isMobile) {
            const roomCenter = this.rooms[this.currentRoom].position.clone();
            this.avatarGroup.position.copy(roomCenter);
            this.avatarGroup.position.y = 0.5;
        } else {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            direction.y = 0;
            direction.normalize().multiplyScalar(3);
            this.avatarGroup.position.copy(this.camera.position).add(direction);
            this.avatarGroup.position.y = 0.5;
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
        this.renderer.render(this.scene, this.camera);
        this.updateArtworkProgress();
        if (this.isMobile) this.controls.update();
        this.updateAvatarPosition();
        
        if (this.isRecording) {
            // Frame capture handled by MediaRecorder
        }
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
        if (this.isAnimatingObjects) {
            this.images.forEach(img => {
                img.mesh.rotation.y += 0.02 * this.animationSpeed;
            });
            this.wallLights.forEach(light => {
                light.left.rotation.y += 0.03 * this.animationSpeed;
                light.right.rotation.y += 0.03 * this.animationSpeed;
            });
            this.glassSpotlights.forEach(light => {
                light.mesh.rotation.y += 0.01 * this.animationSpeed;
            });
        }
    }

    updateLighting() {
        const time = this.time || 0;

        const hue = (Math.sin(time * 0.5) + 1) / 2;
        const color = new THREE.Color().setHSL(hue, 0.5, 0.7);
        this.ledMaterial.emissive.copy(color);
        this.ledMaterial.color.copy(color);

        // Update wall lights if they exist
        if (this.wallLights && this.wallLights.length > 0) {
            this.wallLights.forEach(light => {
                if (light.left && light.right && light.position) {
                    const distance = this.camera.position.distanceTo(light.position);
                    const intensity = Math.max(0.8, Math.min(1.5, 2 - distance / 10));
                    light.left.material.emissiveIntensity = intensity;
                    light.right.material.emissiveIntensity = intensity;
                }
            });
        }

        // Update glass spotlights (track lighting)
        if (this.glassSpotlights && this.glassSpotlights.length > 0) {
            this.glassSpotlights.forEach(light => {
                if (light.spot && light.position) {
                    const distance = this.camera.position.distanceTo(light.position);
                    const intensity = Math.max(0.5, Math.min(2.0, 3 - distance / 6));
                    light.spot.intensity = intensity;
                    
                    // Only update mesh if it exists
                    if (light.mesh && light.mesh.material) {
                        light.mesh.material.emissiveIntensity = intensity * 0.8;
                    }
                }
            });
        }

        // Update ceiling lights with pulse effect
        const pulse = 1.0 + Math.sin(time * 2) * 0.2;
        if (this.ceilingLights && this.ceilingLights.length > 0) {
            this.ceilingLights.forEach(light => {
                if (light.spot) {
                    light.spot.intensity = pulse;
                }
                
                // Only update mesh if it exists
                if (light.mesh && light.mesh.material) {
                    light.mesh.material.emissiveIntensity = pulse * 0.6;
                }
            });
        }
    }
// Epoxy floor with metallic swirls and depth
generateEpoxyFloor(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Dark base color (charcoal/black)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Create metallic swirls and veins
    const numSwirls = 15;
    for (let i = 0; i < numSwirls; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Metallic colors (silver, gold, copper tones)
        const colors = [
            'rgba(192, 192, 192, 0.3)',  // Silver
            'rgba(184, 134, 11, 0.25)',   // Gold
            'rgba(205, 127, 50, 0.2)',    // Bronze
            'rgba(169, 169, 169, 0.35)',  // Light gray
            'rgba(255, 255, 255, 0.15)'   // White shimmer
        ];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create flowing swirl pattern
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 40 + 20;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.random() * Math.PI * 2;
        
        for (let j = 0; j < 100; j++) {
            angle += (Math.random() - 0.5) * 0.5;
            x += Math.cos(angle) * 15;
            y += Math.sin(angle) * 15;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Add subtle sparkle/glitter effect
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (Math.random() > 0.998) {  // Occasional sparkle
            const brightness = 200 + Math.random() * 55;
            imageData.data[i] = brightness;
            imageData.data[i + 1] = brightness;
            imageData.data[i + 2] = brightness;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Add glossy overlay gradient for depth
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}

// Normal map for 3D depth effect
generateEpoxyNormalMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Purple-blue normal map base
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Add noise for surface variation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Perlin-like noise
            const noise = (Math.sin(x * 0.02) * Math.cos(y * 0.02)) * 0.5 + 0.5;
            const variation = (Math.random() - 0.5) * 20;
            
            imageData.data[i] = 128 + noise * 30 + variation;     // R (X normal)
            imageData.data[i + 1] = 128 + noise * 30 + variation; // G (Y normal)
            imageData.data[i + 2] = 200 + noise * 55;             // B (Z normal - depth)
            imageData.data[i + 3] = 255;                          // A
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
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
    
    // ✨ NEW: Number keys for artwork navigation
    const num = parseInt(event.key);
    if (num >= 1 && num <= 9 && num <= this.images.length) {
        this.focusOnArtwork(num - 1);
    }
    
    // ✨ NEW: Arrow keys for navigation
    if (!this.isSliderActive) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            this.navigateToNextArtwork();
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            this.navigateToPrevArtwork();
        }
    }
    
    // ✨ NEW: Help toggle
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
        const roomBounds = this.rooms[this.currentRoom].position;
        
        // ✅ UPDATED: Edge boundaries for 20x20 room
        const edge = 9;
        const minX = roomBounds.x - edge;
        const maxX = roomBounds.x + edge;
        const minZ = roomBounds.z - edge;
        const maxZ = roomBounds.z + edge;

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
    if (!this.imagesToLoad || !Array.isArray(this.imagesToLoad) || this.imagesToLoad.length === 0) {
        console.error("imagesToLoad is invalid or empty:", this.imagesToLoad);
        return;
    }

    this.clearScene();
    const totalImages = this.imagesToLoad.length;
    let imageIndex = 0;
    const seenHashes = new Set();

    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        roughness: 0.3, 
        metalness: 0.7
    });
    const fallbackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000, 
        roughness: 0.5, 
        metalness: 0 
    });

    const room = this.rooms[0];
    
    // ✅ UPDATED: Wall length for 20x20 room
    const wallLength = 20;
    
    const displayHeight = 2.0;
    const displayWidth = 2.8;
    const displayDepth = 0.15;
    const frameThickness = 0.08;
    const wallOffset = 0.6;

    const wallConfigs = [
        { basePos: new THREE.Vector3(0, 2.3, -wallLength / 2 + wallOffset), rot: 0, dir: 'x', name: 'Back' },
        { basePos: new THREE.Vector3(0, 2.3, wallLength / 2 - wallOffset), rot: Math.PI, dir: 'x', name: 'Front' },
        { basePos: new THREE.Vector3(-wallLength / 2 + wallOffset, 2.3, 0), rot: Math.PI / 2, dir: 'z', name: 'Left' },
        { basePos: new THREE.Vector3(wallLength / 2 - wallOffset, 2.3, 0), rot: -Math.PI / 2, dir: 'z', name: 'Right' }
    ];

    const imagesPerWall = Math.floor(totalImages / 4);
    const extraImages = totalImages % 4;

    const wallDistribution = wallConfigs.map((wall, index) => {
        return imagesPerWall + (index < extraImages ? 1 : 0);
    });

    console.log(`🎨 Distributing ${totalImages} images:`);
    wallConfigs.forEach((wall, i) => {
        console.log(`   ${wall.name}: ${wallDistribution[i]} images`);
    });

    for (let wallIdx = 0; wallIdx < wallConfigs.length; wallIdx++) {
        const wall = wallConfigs[wallIdx];
        const imagesThisWall = wallDistribution[wallIdx];

        if (imagesThisWall === 0) continue;

        console.log(`📍 Placing ${imagesThisWall} images on ${wall.name} wall...`);

        const usableWallLength = wallLength - (wallOffset * 2);
        const spacing = usableWallLength / (imagesThisWall + 1);

        for (let i = 0; i < imagesThisWall; i++) {
            if (imageIndex >= totalImages) break;

            const offset = -usableWallLength / 2 + (i + 1) * spacing;
            const pos = wall.basePos.clone();
            
            if (wall.dir === 'x') {
                pos.x += offset;
            } else {
                pos.z += offset;
            }

            const filename = this.imagesToLoad[imageIndex];
            if (!filename || typeof filename !== 'string') {
                console.error(`Invalid filename at index ${imageIndex}`);
                imageIndex++;
                i--;
                continue;
            }

            const fileBaseName = filename.split('/').pop();
            const meta = this.metadata.find(m => m.filename === fileBaseName) || {
                filename: fileBaseName,
                title: 'Untitled',
                description: '',
                artist: 'Unknown'
            };

            try {
                const texture = await this.loadTexture(filename);
                const hash = await this.computeImageHash(texture);

                if (seenHashes.has(hash)) {
                    console.warn(`Duplicate detected, skipping`);
                    imageIndex++;
                    i--;
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

                const aspectRatio = texture.image ? texture.image.width / texture.image.height : 1.33;
                const adjustedWidth = Math.min(displayHeight * aspectRatio, displayWidth);
                const adjustedHeight = adjustedWidth / aspectRatio;

                const geometry = new THREE.BoxGeometry(adjustedWidth, adjustedHeight, displayDepth);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(pos).add(room.position);
                mesh.rotation.y = wall.rot;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.userData = {
                    filename,
                    hash,
                    baseScale: mesh.scale.clone(),
                    wallName: wall.name,
                    metadata: {
                        title: meta.title,
                        description: meta.description,
                        artist: meta.artist
                    }
                };
                room.add(mesh);
                this.images.push({ mesh, filename, hash, metadata: meta });

                // Frame
                const frameShape = new THREE.Shape();
                const fw = adjustedWidth / 2 + frameThickness;
                const fh = adjustedHeight / 2 + frameThickness;
                
                frameShape.moveTo(-fw, -fh);
                frameShape.lineTo(fw, -fh);
                frameShape.lineTo(fw, fh);
                frameShape.lineTo(-fw, fh);
                frameShape.lineTo(-fw, -fh);

                const hole = new THREE.Path();
                hole.moveTo(-adjustedWidth / 2, -adjustedHeight / 2);
                hole.lineTo(adjustedWidth / 2, -adjustedHeight / 2);
                hole.lineTo(adjustedWidth / 2, adjustedHeight / 2);
                hole.lineTo(-adjustedWidth / 2, adjustedHeight / 2);
                hole.lineTo(-adjustedWidth / 2, -adjustedHeight / 2);
                frameShape.holes.push(hole);

                const extrudeSettings = { depth: frameThickness, bevelEnabled: false };
                const frameGeometry = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                frame.position.copy(mesh.position);
                
                if (wall.rot === 0) {
                    frame.position.z -= displayDepth / 2;
                } else if (wall.rot === Math.PI) {
                    frame.position.z += displayDepth / 2;
                } else if (wall.rot === Math.PI / 2) {
                    frame.position.x -= displayDepth / 2;
                } else if (wall.rot === -Math.PI / 2) {
                    frame.position.x += displayDepth / 2;
                }
                
                frame.rotation.y = wall.rot;
                frame.castShadow = true;
                frame.receiveShadow = true;
                room.add(frame);

                // Spotlight
                const spotlight = new THREE.SpotLight(0xffffff, 2.5, 15, Math.PI / 7, 0.6);
                const lightOffset = 1.5;
                
                spotlight.position.set(
                    pos.x + (Math.abs(wall.rot) === Math.PI / 2 ? (wall.rot > 0 ? lightOffset : -lightOffset) : 0),
                    3.5,
                    pos.z + (Math.abs(wall.rot) === Math.PI / 2 ? 0 : (wall.rot === 0 ? -lightOffset : lightOffset))
                ).add(room.position);
                
                spotlight.target = mesh;
                spotlight.castShadow = true;
                spotlight.shadow.mapSize.width = 1024;
                spotlight.shadow.mapSize.height = 1024;
                spotlight.shadow.bias = -0.0001;
                room.add(spotlight);

                imageIndex++;
                console.log(`   ✅ [${imageIndex}/${totalImages}] "${meta.title}" on ${wall.name}`);

            } catch (error) {
                console.error(`Error loading ${filename}:`, error);
                imageIndex++;
                i--;
            }
        }
    }

    const actualDistribution = {};
    this.images.forEach(img => {
        const wall = img.mesh.userData.wallName;
        actualDistribution[wall] = (actualDistribution[wall] || 0) + 1;
    });

    console.log(`✅ Gallery Complete: ${this.images.length}/${totalImages} artworks displayed`);
    console.log(`   Back: ${actualDistribution.Back || 0} | Front: ${actualDistribution.Front || 0} | Left: ${actualDistribution.Left || 0} | Right: ${actualDistribution.Right || 0}`);
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
            const intersects = this.raycaster.intersectObjects([...this.images.map(img => img.mesh), ...this.scene.children.filter(obj => (obj.parent && obj.parent.userData.isAvatar))]);

            if (intersects.length > 0) {
                const obj = intersects[0].object;
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
        };
        requestAnimationFrame(animateFocus);
    } else {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);

        const targetPos = mesh.position.clone().sub(direction.multiplyScalar(3));
        targetPos.y = 1.6;

        const roomBounds = this.rooms[this.currentRoom].position;
        
        // ✅ UPDATED: Collision bounds for 20x20 room
        const minX = roomBounds.x - 9;
        const maxX = roomBounds.x + 9;
        const minZ = roomBounds.z - 9;
        const maxZ = roomBounds.z + 9;

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

const app = new ThreeJSApp();
app.init();
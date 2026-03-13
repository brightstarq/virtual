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
        { position: new THREE.Vector3(0, 1.6, 15), lookAt: new THREE.Vector3(0, 2, 0) }
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
    this.renderer.shadowMap.enabled = true;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // was 0.3
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
    const room1 = new THREE.Group();
    
    const galleryLength = 60;
    const galleryWidth = 35;
    const maxHeight = 16;
    
    // ========================================
    // AFRICAN COLOR PALETTE
    // ========================================
    
    const colors = {
        // Earth tones (mud brick, terracotta)
        mudBrick: 0xc08552,
        terracotta: 0xd4774e,
        ochre: 0xcc7722,
        earthBrown: 0x8b6f47,
        
        // Vibrant traditional colors
        kenteGold: 0xdaa520,
        indigoBlue: 0x4b0082,
        maasaiRed: 0xb22222,
        africanGreen: 0x2d5016,
        royalPurple: 0x663399,
        
        // Natural materials
        darkWood: 0x3e2723,
        baobabWood: 0x8d6e63,
        brass: 0xb5a642,
        copper: 0xb87333
    };
    
    // ========================================
    // MATERIALS
    // ========================================
    
    // Mud brick material (Mali/Djenné style)
    const mudBrickMaterial = new THREE.MeshStandardMaterial({
        color: colors.mudBrick,
        roughness: 0.9,
        metalness: 0.0,
        envMap: this.envMap,
        envMapIntensity: 0.3
    });
    
    // Terracotta clay
    const terracottaMaterial = new THREE.MeshStandardMaterial({
        color: colors.terracotta,
        roughness: 0.8,
        metalness: 0.0
    });
    
    // Carved wood (dark African hardwood)
    const carvedWoodMaterial = new THREE.MeshStandardMaterial({
        color: colors.darkWood,
        roughness: 0.6,
        metalness: 0.1,
        envMap: this.envMap,
        envMapIntensity: 0.5
    });
    
    // Woven textile material (Kente/Ndebele patterns)
  const kenteTextileMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(colors.kenteGold) },
        color2: { value: new THREE.Color(colors.indigoBlue) },
        color3: { value: new THREE.Color(colors.maasaiRed) },
        color4: { value: new THREE.Color(colors.africanGreen) }
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
    uniform vec3 color3;
    uniform vec3 color4;
    varying vec2 vUv;
    
    void main() {
        // Kente cloth pattern
        float pattern1 = step(0.5, fract(vUv.x * 10.0));
        float pattern2 = step(0.5, fract(vUv.y * 8.0));
        float pattern3 = step(0.5, fract((vUv.x + vUv.y) * 6.0));
        
        vec3 color = color1;
        if (pattern1 > 0.5 && pattern2 > 0.5) color = color2;
        else if (pattern3 > 0.5) color = color3;
        else if (pattern1 < 0.5 && pattern2 < 0.5) color = color4;
        
        // ⭐ ADD SHIMMER/SHEEN
        float shimmer = sin(vUv.x * 20.0 + time) * 0.5 + 0.5;
        color += vec3(shimmer * 0.2);
        
        gl_FragColor = vec4(color, 1.0);
    }
`
});
    
    // Brass/Copper accents
 const brassAccentMaterial = new THREE.MeshStandardMaterial({
    color: colors.brass,
    roughness: 0.25,  // More polished
    metalness: 0.95,  // More metallic
    emissive: colors.brass,
    emissiveIntensity: 0.4,  // Stronger glow
    envMap: this.envMap,
    envMapIntensity: 2.5  // More reflection
});
    
    // ========================================
    // FLOOR - EARTH & PATTERNS
    // ========================================
    
    // Base floor - packed earth/ochre
    const baseFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(galleryWidth, galleryLength),
        new THREE.MeshStandardMaterial({
            color: colors.ochre,
            roughness: 0.95,
            metalness: 0.0
        })
    );
    baseFloor.rotation.x = -Math.PI / 2;
    baseFloor.receiveShadow = true;
    room1.add(baseFloor);
    
    // Ndebele-style geometric floor pattern (center path)
    const createNdebelePattern = (startZ, length, patternType) => {
        const segments = Math.floor(length / 2);
        for (let i = 0; i < segments; i++) {
            const z = startZ + i * 2;
            const colorIndex = i % 4;
            const patternColors = [
                colors.maasaiRed,
                colors.kenteGold,
                colors.indigoBlue,
                colors.africanGreen
            ];
            
            // Diamond pattern
            const diamond = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 1.5),
                new THREE.MeshStandardMaterial({
                    color: patternColors[colorIndex],
                    roughness: 0.8
                })
            );
            diamond.rotation.x = -Math.PI / 2;
            diamond.rotation.z = Math.PI / 4;
            diamond.position.set(0, 0.001, z);
            diamond.receiveShadow = true;
            room1.add(diamond);
            
            // Border triangles
            for (let side of [-1, 1]) {
                const triangle = new THREE.Mesh(
                    new THREE.CircleGeometry(0.3, 3),
                    new THREE.MeshStandardMaterial({
                        color: patternColors[(colorIndex + 2) % 4],
                        roughness: 0.8
                    })
                );
                triangle.rotation.x = -Math.PI / 2;
                triangle.position.set(side * 1.5, 0.002, z);
                room1.add(triangle);
            }
        }
    };
    
    createNdebelePattern(-galleryLength / 2, galleryLength, 'path');
    
    // ========================================
    // ORGANIC MUD BRICK WALLS (Djenné style)
    // ========================================
    
    // Left wall - organic curved mud brick
    const createMudBrickWall = (side) => {
        const wallSegments = 30;
        for (let i = 0; i < wallSegments; i++) {
            const t = i / wallSegments;
            const z = -galleryLength / 2 + t * galleryLength;
            
            // Organic wave pattern (like Djenné mosque)
            const curve = Math.sin(t * Math.PI * 3) * 2;
            const x = side * (galleryWidth / 2 - 3) + curve;
            
            for (let y = 0; y < maxHeight; y += 1.2) {
                // Individual mud bricks (slightly irregular)
                const brick = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.8 + Math.random() * 0.2,
                        1.0 + Math.random() * 0.2,
                        2.2
                    ),
                    mudBrickMaterial
                );
                brick.position.set(x, y + 0.6, z);
                brick.rotation.y = (Math.random() - 0.5) * 0.1;
                brick.castShadow = true;
                brick.receiveShadow = true;
                room1.add(brick);
                
                // Wooden beam supports (toron - protruding beams)
                if (y > 0 && y < maxHeight - 2 && i % 5 === 0) {
                    const beam = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8),
                        carvedWoodMaterial
                    );
                    beam.rotation.z = Math.PI / 2;
                    beam.position.set(x + side * 0.7, y + 0.6, z);
                    beam.castShadow = true;
                    room1.add(beam);
                }
            }
        }
    };
    
    createMudBrickWall(-1); // Left wall
    createMudBrickWall(1);  // Right wall
    
    // ========================================
    // BACK WALL - ADINKRA SYMBOLS
    // ========================================
    
    // Create back wall with carved symbols
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(galleryWidth - 10, maxHeight - 2, 1),
        terracottaMaterial
    );
    backWall.position.set(0, maxHeight / 2, -galleryLength / 2 + 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    room1.add(backWall);
    
    // Adinkra symbols carved into back wall
    const createAdinkraSymbol = (x, y, z, symbolType) => {
        const symbolMaterial = new THREE.MeshStandardMaterial({
            color: colors.darkWood,
            roughness: 0.7,
            metalness: 0.1
        });
        
        // Gye Nyame (supremacy of God) - most popular Adinkra
        if (symbolType === 'gyeNyame') {
            const symbol = new THREE.Mesh(
                new THREE.TorusGeometry(0.5, 0.15, 8, 16),
                symbolMaterial
            );
            symbol.position.set(x, y, z);
            symbol.castShadow = true;
            room1.add(symbol);
            
            const cross = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 1.2, 0.1),
                symbolMaterial
            );
            cross.position.set(x, y, z);
            room1.add(cross);
        }
        // Sankofa (return and get it)
        else if (symbolType === 'sankofa') {
            const heart = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 8, 8),
                symbolMaterial
            );
            heart.scale.set(1, 0.8, 0.5);
            heart.position.set(x, y, z);
            room1.add(heart);
            
            const curve = new THREE.Mesh(
                new THREE.TorusGeometry(0.3, 0.08, 6, 12, Math.PI),
                symbolMaterial
            );
            curve.position.set(x, y + 0.3, z);
            curve.rotation.x = Math.PI / 2;
            room1.add(curve);
        }
    };
    
    // Place Adinkra symbols on back wall
    createAdinkraSymbol(-8, 8, -galleryLength / 2 + 1.6, 'gyeNyame');
    createAdinkraSymbol(0, 8, -galleryLength / 2 + 1.6, 'sankofa');
    createAdinkraSymbol(8, 8, -galleryLength / 2 + 1.6, 'gyeNyame');
    createAdinkraSymbol(-4, 12, -galleryLength / 2 + 1.6, 'sankofa');
    createAdinkraSymbol(4, 12, -galleryLength / 2 + 1.6, 'sankofa');
    
    // ========================================
    // DOMED CEILING (Zulu beehive hut inspired)
    // ========================================
    
    const ceilingGeometry = new THREE.SphereGeometry(
        galleryWidth / 2,
        40,
        40,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
    );
    
    const ceiling = new THREE.Mesh(
        ceilingGeometry,
        new THREE.MeshStandardMaterial({
            color: colors.earthBrown,
            roughness: 0.9,
            side: THREE.BackSide
        })
    );
    ceiling.position.set(0, maxHeight - 2, 0);
    ceiling.receiveShadow = true;
    room1.add(ceiling);
    
    // Thatch texture rings (concentric circles)
    for (let r = 5; r < 20; r += 3) {
        const thatchRing = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.2, 8, 32),
            new THREE.MeshStandardMaterial({
                color: colors.baobabWood,
                roughness: 0.95
            })
        );
        thatchRing.rotation.x = Math.PI / 2;
        thatchRing.position.set(0, maxHeight - 2 + Math.sqrt(Math.max(0, (galleryWidth/2)**2 - r**2)), 0);
        room1.add(thatchRing);
    }
    
    // ========================================
    // CARVED WOODEN PILLARS
    // ========================================
    
    const createCarvedPillar = (x, z) => {
        const pillarHeight = 12;
        const segments = 6;
        
        for (let i = 0; i < segments; i++) {
            const y = (i / segments) * pillarHeight;
            const segmentHeight = pillarHeight / segments;
            
            // Alternating carved patterns
            const radius = i % 2 === 0 ? 0.35 : 0.25;
            const geometry = i % 2 === 0 
                ? new THREE.CylinderGeometry(radius, radius, segmentHeight, 8)
                : new THREE.CylinderGeometry(radius, radius, segmentHeight, 4);
            
            const segment = new THREE.Mesh(geometry, carvedWoodMaterial);
            segment.position.set(x, y + segmentHeight / 2, z);
            segment.rotation.y = (i % 2 === 0) ? 0 : Math.PI / 4;
            segment.castShadow = true;
            segment.receiveShadow = true;
            room1.add(segment);
            
            // Brass rings between segments
            if (i < segments - 1) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(radius + 0.05, 0.03, 8, 16),
                    brassAccentMaterial
                );
                ring.rotation.x = Math.PI / 2;
                ring.position.set(x, y + segmentHeight, z);
                ring.castShadow = true;
                room1.add(ring);
            }
        }
        
        // Carved capital (top)
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.4, 1, 8),
            carvedWoodMaterial
        );
        capital.position.set(x, pillarHeight, z);
        capital.castShadow = true;
        room1.add(capital);
        
        // Brass finial
        const finial = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            brassAccentMaterial
        );
        finial.position.set(x, pillarHeight + 0.8, z);
        finial.castShadow = true;
        room1.add(finial);
    };
    
    // Place carved pillars
    createCarvedPillar(-10, -20);
    createCarvedPillar(10, -20);
    createCarvedPillar(-10, 0);
    createCarvedPillar(10, 0);
    createCarvedPillar(-10, 20);
    createCarvedPillar(10, 20);
    
    // ========================================
    // KENTE CLOTH HANGING BANNERS
    // ========================================
    
    this.kenteBanners = [];
    const bannerPositions = [
        [-12, -15], [12, -15],
        [-12, 5], [12, 5],
        [-12, 25], [12, 25]
    ];
    
    bannerPositions.forEach(pos => {
        const banner = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 8),
            kenteTextileMaterial.clone()
        );
        banner.position.set(pos[0], 8, pos[1]);
        banner.castShadow = true;
        banner.receiveShadow = true;
        room1.add(banner);
        this.kenteBanners.push(banner);
    });
    
    // ========================================
    // TRADITIONAL DRUMS (Djembe)
    // ========================================
    
    const createDjembeDrum = (x, z, scale = 1) => {
        // Drum body
        const drumBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4 * scale, 0.3 * scale, 1.2 * scale, 12),
            carvedWoodMaterial
        );
        drumBody.position.set(x, 0.6 * scale, z);
        drumBody.castShadow = true;
        room1.add(drumBody);
        
        // Drum head (leather)
        const drumHead = new THREE.Mesh(
            new THREE.CircleGeometry(0.4 * scale, 16),
            new THREE.MeshStandardMaterial({
                color: 0xdeb887,
                roughness: 0.9
            })
        );
        drumHead.rotation.x = -Math.PI / 2;
        drumHead.position.set(x, 1.2 * scale + 0.01, z);
        room1.add(drumHead);
        
        // Rope pattern
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const rope = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 1.3 * scale, 4),
                new THREE.MeshStandardMaterial({ color: 0x8b7355 })
            );
            rope.position.set(
                x + Math.cos(angle) * 0.35 * scale,
                0.65 * scale,
                z + Math.sin(angle) * 0.35 * scale
            );
            rope.rotation.z = 0.1;
            room1.add(rope);
        }
    };
    
    // Place drums as decorative elements
    createDjembeDrum(-14, -25, 1);
    createDjembeDrum(14, -25, 0.8);
    createDjembeDrum(-14, 25, 0.9);
    createDjembeDrum(14, 25, 1.1);
    
    // ========================================
    // WOVEN BASKETS
    // ========================================
    
    const createWovenBasket = (x, z, radius) => {
        const basket = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius * 0.8, radius * 1.5, 16, 4, true),
            new THREE.MeshStandardMaterial({
                color: colors.baobabWood,
                roughness: 0.9,
                wireframe: false
            })
        );
        basket.position.set(x, radius * 0.75, z);
        basket.castShadow = true;
        room1.add(basket);
        
        // Woven pattern (horizontal bands)
        for (let i = 0; i < 4; i++) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(radius - 0.02, 0.03, 6, 16),
                new THREE.MeshStandardMaterial({
                    color: i % 2 === 0 ? colors.earthBrown : colors.baobabWood
                })
            );
            band.rotation.x = Math.PI / 2;
            band.position.set(x, radius * 0.4 * i, z);
            room1.add(band);
        }
    };
    
// ⭐ FIXED: Moved inside boundaries (Z: ±26 instead of ±28)
createWovenBasket(-12, 26, 0.6);
createWovenBasket(12, 26, 0.5);
createWovenBasket(-12, -26, 0.7);
createWovenBasket(12, -26, 0.6);
    
    // ========================================
    // TERRACOTTA POTTERY
    // ========================================
    
    const createTerracottaPot = (x, z, height) => {
        const pot = new THREE.Mesh(
            new THREE.SphereGeometry(height * 0.4, 16, 16),
            terracottaMaterial
        );
        pot.scale.set(1, 1.2, 1);
        pot.position.set(x, height * 0.5, z);
        pot.castShadow = true;
        room1.add(pot);
        
        // Decorative bands
        for (let i = 1; i <= 3; i++) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(height * 0.35, 0.02, 8, 16),
                new THREE.MeshStandardMaterial({ color: colors.darkWood })
            );
            band.rotation.x = Math.PI / 2;
            band.position.set(x, height * 0.3 * i, z);
            room1.add(band);
        }
    };
    
    createTerracottaPot(galleryWidth / 2 - 4, 20, 1.2);
    createTerracottaPot(-galleryWidth / 2 + 4, 20, 1.0);
    createTerracottaPot(galleryWidth / 2 - 4, -10, 1.1);
    createTerracottaPot(-galleryWidth / 2 + 4, -10, 1.3);
    

    const createAfricanMask = (x, y, z, rotation, maskType) => {
    const group = new THREE.Group();
    
    const maskMaterial = new THREE.MeshStandardMaterial({
        color: colors.darkWood,
        roughness: 0.6,
        metalness: 0.1
    });
    
    if (maskType === 'ceremonial') {
        // Ceremonial mask (elongated face)
        const face = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 1.2, 0.2),
            maskMaterial
        );
        group.add(face);
        
        // Eyes (carved indentations)
        [-0.2, 0.2].forEach(xOff => {
            const eye = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x000000 })
            );
            eye.position.set(xOff, 0.2, 0.12);
            group.add(eye);
        });
        
        // Nose
        const nose = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.3, 6),
            maskMaterial
        );
        nose.position.set(0, 0, 0.2);
        nose.rotation.x = Math.PI / 2;
        group.add(nose);
        
        // Mouth
        const mouth = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.08, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x8b0000 })
        );
        mouth.position.set(0, -0.3, 0.12);
        group.add(mouth);
        
        // Decorative horns
        [-1, 1].forEach(side => {
            const horn = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.06, 0.4, 6),
                brassAccentMaterial
            );
            horn.position.set(side * 0.35, 0.6, 0);
            horn.rotation.z = side * Math.PI / 6;
            group.add(horn);
        });
    } else if (maskType === 'warrior') {
        // Warrior mask (angular, fierce)
        const face = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 1.0, 0.25),
            maskMaterial
        );
        face.scale.set(1, 1.2, 1);
        group.add(face);
        
        // Sharp geometric eyes
        [-0.2, 0.2].forEach(xOff => {
            const eye = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.25, 0.05),
                new THREE.MeshStandardMaterial({ color: 0xffffff })
            );
            eye.position.set(xOff, 0.2, 0.14);
            eye.rotation.z = Math.PI / 4;
            group.add(eye);
        });
        
        // Fierce teeth
        for (let i = 0; i < 5; i++) {
            const tooth = new THREE.Mesh(
                new THREE.ConeGeometry(0.04, 0.15, 6),
                new THREE.MeshStandardMaterial({ color: 0xffffff })
            );
            tooth.position.set((i - 2) * 0.12, -0.5, 0.15);
            tooth.rotation.x = Math.PI;
            group.add(tooth);
        }
        
        // Red war paint
        const paint = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.15, 0.02),
            new THREE.MeshStandardMaterial({ 
                color: colors.maasaiRed,
                emissive: colors.maasaiRed,
                emissiveIntensity: 0.3
            })
        );
        paint.position.set(0, 0.35, 0.13);
        group.add(paint);
    }
    
    group.position.set(x, y, z);
    group.rotation.y = rotation;
    group.castShadow = true;
    return group;
};

// Place masks on walls (6 total)
const maskPositions = [
    { x: -12, y: 6, z: -galleryLength/2 + 3, rot: 0, type: 'ceremonial' },
    { x: 12, y: 6, z: -galleryLength/2 + 3, rot: 0, type: 'warrior' },
    { x: -galleryWidth/2 + 3, y: 5, z: -15, rot: Math.PI/2, type: 'ceremonial' },
    { x: galleryWidth/2 - 3, y: 5, z: 15, rot: -Math.PI/2, type: 'warrior' },
    { x: -galleryWidth/2 + 3, y: 7, z: 10, rot: Math.PI/2, type: 'warrior' },
    { x: galleryWidth/2 - 3, y: 7, z: -5, rot: -Math.PI/2, type: 'ceremonial' }
];

maskPositions.forEach(pos => {
    const mask = createAfricanMask(pos.x, pos.y, pos.z, pos.rot, pos.type);
    room1.add(mask);
});



const createAfricanSculpture = (x, z, sculptureType) => {
    const group = new THREE.Group();
    
    if (sculptureType === 'mother-child') {
        // Mother and Child sculpture (common African theme)
        
        // Mother body
        const motherBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.25, 1.2, 8),
            carvedWoodMaterial
        );
        motherBody.position.y = 0.6;
        group.add(motherBody);
        
        // Mother head
        const motherHead = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            carvedWoodMaterial
        );
        motherHead.position.y = 1.4;
        motherHead.scale.set(1, 1.3, 1);
        group.add(motherHead);
        
        // Child (smaller figure)
        const child = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.12, 0.6, 8),
            carvedWoodMaterial
        );
        child.position.set(0.3, 0.8, 0.2);
        group.add(child);
        
        const childHead = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            carvedWoodMaterial
        );
        childHead.position.set(0.3, 1.2, 0.2);
        group.add(childHead);
        
        // Base pedestal
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: colors.earthBrown })
        );
        base.position.y = 0.1;
        group.add(base);
        
    } else if (sculptureType === 'warrior') {
        // Standing warrior figure
        
        // Body
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.3, 1.5, 8),
            carvedWoodMaterial
        );
        body.position.y = 0.75;
        group.add(body);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            carvedWoodMaterial
        );
        head.position.y = 1.7;
        head.scale.set(1, 1.2, 1);
        group.add(head);
        
        // Spear (brass)
        const spear = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 2.5, 6),
            brassAccentMaterial
        );
        spear.position.set(0.4, 1.2, 0);
        spear.rotation.z = Math.PI / 6;
        group.add(spear);
        
        // Spear tip
        const spearTip = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.3, 6),
            brassAccentMaterial
        );
        spearTip.position.set(0.7, 2.5, 0);
        spearTip.rotation.z = Math.PI / 6;
        group.add(spearTip);
        
        // Shield (round)
        const shield = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
            new THREE.MeshStandardMaterial({
                color: colors.maasaiRed,
                roughness: 0.8
            })
        );
        shield.position.set(-0.5, 0.9, 0);
        shield.rotation.z = Math.PI / 2;
        group.add(shield);
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: colors.earthBrown })
        );
        base.position.y = 0.1;
        group.add(base);
        
    } else if (sculptureType === 'dancer') {
        // Dancing figure (dynamic pose)
        
        // Body (tilted)
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8),
            carvedWoodMaterial
        );
        body.position.y = 0.6;
        body.rotation.z = Math.PI / 8;
        group.add(body);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            carvedWoodMaterial
        );
        head.position.set(0.2, 1.3, 0);
        group.add(head);
        
        // Arms (raised)
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6),
                carvedWoodMaterial
            );
            arm.position.set(side * 0.3, 1.0, 0);
            arm.rotation.z = side * Math.PI / 3;
            group.add(arm);
        });
        
        // Ceremonial beads (brass)
        for (let i = 0; i < 3; i++) {
            const bead = new THREE.Mesh(
                new THREE.TorusGeometry(0.15 + i * 0.05, 0.02, 8, 16),
                brassAccentMaterial
            );
            bead.position.y = 1.0 - i * 0.15;
            bead.rotation.x = Math.PI / 2;
            group.add(bead);
        }
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: colors.earthBrown })
        );
        base.position.y = 0.1;
        group.add(base);
    }
    
    group.position.set(x, 0, z);
    group.castShadow = true;
    group.receiveShadow = true;
    return group;
};

// Place sculptures strategically (6 total)
const sculpturePositions = [
    { x: -8, z: 15, type: 'mother-child' },
    { x: 8, z: 15, type: 'warrior' },
    { x: -8, z: -10, type: 'dancer' },
    { x: 8, z: -10, type: 'mother-child' },
    { x: 0, z: 22, type: 'warrior' },
    { x: 0, z: -18, type: 'dancer' }
];

sculpturePositions.forEach(pos => {
    const sculpture = createAfricanSculpture(pos.x, pos.z, pos.type);
    room1.add(sculpture);
});

const createRockArt = (x, y, z, rotation) => {
    // Canvas background (stone)
    const canvas = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0x6b5d4f,
            roughness: 0.95
        })
    );
    
    // Paint layer with African rock art motifs
    const paintMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        transparent: true,
        opacity: 0.8
    });
    
    // Human figures (stick figures - ancient style)
    for (let i = 0; i < 5; i++) {
        const figure = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6),
            paintMaterial
        );
        figure.position.set(-1 + i * 0.5, 0, 0.06);
        canvas.add(figure);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 6, 6),
            paintMaterial
        );
        head.position.set(-1 + i * 0.5, 0.25, 0.06);
        canvas.add(head);
    }
    
    // Animals (simplified shapes)
    const animalPositions = [
        { x: -0.8, y: -0.5 },
        { x: 0.3, y: -0.6 },
        { x: 1.0, y: -0.5 }
    ];
    
    animalPositions.forEach(pos => {
        const animal = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.05),
            paintMaterial
        );
        animal.position.set(pos.x, pos.y, 0.06);
        canvas.add(animal);
        
        // Legs
        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.01, 0.1, 4),
                paintMaterial
            );
            leg.position.set(pos.x - 0.1 + i * 0.07, pos.y - 0.12, 0.06);
            canvas.add(leg);
        }
    });
    
    // Sun symbol (common in African art)
    const sun = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 16),
        new THREE.MeshStandardMaterial({
            color: colors.kenteGold,
            emissive: colors.kenteGold,
            emissiveIntensity: 0.3
        })
    );
    sun.position.set(1.2, 0.7, 0.07);
    canvas.add(sun);
    
    canvas.position.set(x, y, z);
    canvas.rotation.y = rotation;
    canvas.castShadow = true;
    canvas.receiveShadow = true;
    return canvas;
};

// Place rock art on walls (4 total)
const rockArtPositions = [
    { x: -5, y: 4, z: -galleryLength/2 + 2.5, rot: 0 },
    { x: 5, y: 4, z: -galleryLength/2 + 2.5, rot: 0 },
    { x: -galleryWidth/2 + 2.5, y: 4, z: 5, rot: Math.PI/2 },
    { x: galleryWidth/2 - 2.5, y: 4, z: -8, rot: -Math.PI/2 }
];

rockArtPositions.forEach(pos => {
    const art = createRockArt(pos.x, pos.y, pos.z, pos.rot);
    room1.add(art);
});
const createAfricanStool = (x, z, style) => {
    const group = new THREE.Group();
    
    if (style === 'round') {
        // Round carved stool
        const seat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.35, 0.1, 16),
            carvedWoodMaterial
        );
        seat.position.y = 0.5;
        group.add(seat);
        
        // Central support
        const support = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8),
            carvedWoodMaterial
        );
        support.position.y = 0.2;
        group.add(support);
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, 0.1, 16),
            carvedWoodMaterial
        );
        base.position.y = 0.05;
        group.add(base);
        
    } else if (style === 'tribal') {
        // Four-legged tribal stool
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.08, 0.5),
            carvedWoodMaterial
        );
        seat.position.y = 0.4;
        group.add(seat);
        
        // Carved pattern on seat
        const pattern = new THREE.Mesh(
            new THREE.TorusGeometry(0.15, 0.02, 8, 16),
            new THREE.MeshStandardMaterial({ color: colors.kenteGold })
        );
        pattern.position.y = 0.45;
        pattern.rotation.x = Math.PI / 2;
        group.add(pattern);
        
        // Four legs
        const legPositions = [
            [-0.25, -0.2], [0.25, -0.2],
            [-0.25, 0.2], [0.25, 0.2]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.06, 0.4, 6),
                carvedWoodMaterial
            );
            leg.position.set(pos[0], 0.2, pos[1]);
            group.add(leg);
        });
    }
    
    group.position.set(x, 0, z);
    group.castShadow = true;
    group.receiveShadow = true;
    return group;
};

// Place stools (6 total - safe positions)
const stoolPositions = [
    { x: -11, z: 18, style: 'round' },
    { x: 11, z: 18, style: 'tribal' },
    { x: -11, z: -12, style: 'tribal' },
    { x: 11, z: -12, style: 'round' },
    { x: -6, z: 0, style: 'round' },
    { x: 6, z: 0, style: 'tribal' }
];

stoolPositions.forEach(pos => {
    const stool = createAfricanStool(pos.x, pos.z, pos.style);
    room1.add(stool);
});

console.log("🎭 African cultural artifacts added: masks, sculptures, rock art, stools");

    // ========================================
    // LIGHTING - WARM AFRICAN SUNSET
    // ========================================
    
    this.glassSpotlights = [];
    
    // Main spotlights (warm sunset colors)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 12;
        
        const spotlight = new THREE.SpotLight(0xffaa66, 3.5, 35, Math.PI / 5, 0.5);
        spotlight.position.set(
            Math.cos(angle) * radius,
            maxHeight - 3,
            Math.sin(angle) * radius * 1.5
        );
        spotlight.target.position.set(
            Math.cos(angle) * radius * 0.3,
            0,
            Math.sin(angle) * radius * 0.5
        );
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 2048;
        spotlight.shadow.mapSize.height = 2048;
        room1.add(spotlight);
        room1.add(spotlight.target);
        
        this.glassSpotlights.push({
            spot: spotlight,
            angle: angle
        });
    }
    
    // Warm ambient lighting
    const ambient = new THREE.AmbientLight(0xffcc88, 0.4);
    this.scene.add(ambient);
    
    // Hemisphere (sunset sky)
    const hemi = new THREE.HemisphereLight(0xffaa66, 0x8b6f47, 0.7);
    hemi.position.set(0, maxHeight, 0);
    this.scene.add(hemi);
    
    // Directional (sun)
    const sunLight = new THREE.DirectionalLight(0xffaa44, 1.0);
    sunLight.position.set(30, maxHeight * 1.5, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    this.scene.add(sunLight);
    
    // Warm fill light
    const fillLight = new THREE.DirectionalLight(0xff8844, 0.5);
    fillLight.position.set(-20, maxHeight, -15);
    this.scene.add(fillLight);

    // ⭐ ADD THIS HELPER FUNCTION
// ⭐ ADD THIS HELPER FUNCTION
const createTorchSmoke = (x, z) => {
    const smokeParticles = 50;  // 50 per torch (100 for more smoke)
    const positions = new Float32Array(smokeParticles * 3);
    const velocities = new Float32Array(smokeParticles * 3);
    
    for (let i = 0; i < smokeParticles; i++) {
        const i3 = i * 3;
        positions[i3] = x + (Math.random() - 0.5) * 0.3;
        positions[i3 + 1] = 2.5 + Math.random() * 0.5;
        positions[i3 + 2] = z + (Math.random() - 0.5) * 0.3;
        
        velocities[i3] = (Math.random() - 0.5) * 0.01;
        velocities[i3 + 1] = 0.02 + Math.random() * 0.01;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    const smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    smokeGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const smokeMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x666666,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const smoke = new THREE.Points(smokeGeo, smokeMat);
    return smoke;
};

// ⭐ DEFINE torchPositions ARRAY HERE (BEFORE using it!)
const torchPositions = [
    [-galleryWidth/2 + 5, -galleryLength/2 + 10],
    [galleryWidth/2 - 5, -galleryLength/2 + 10],
    [-galleryWidth/2 + 5, galleryLength/2 - 10],
    [galleryWidth/2 - 5, galleryLength/2 - 10]
];
    
// Fire/torch lights (warm glow)
torchPositions.forEach(pos => {
    const torchLight = new THREE.PointLight(0xff6633, 2, 15);
    torchLight.position.set(pos[0], 2, pos[1]);
    torchLight.castShadow = true;
    room1.add(torchLight);
    
    // ⭐ ANIMATED SHADER FLAME (UPGRADED)
    const flameMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                pos.x += sin(time * 5.0 + position.y * 10.0) * 0.1;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                float fire = vUv.y + sin(time * 3.0 + vUv.x * 10.0) * 0.2;
                vec3 color = mix(
                    vec3(1.0, 0.3, 0.0),  // Red-orange base
                    vec3(1.0, 1.0, 0.0),  // Yellow tips
                    fire
                );
                gl_FragColor = vec4(color, 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.6, 8),
        flameMaterial
    );
    flame.position.set(pos[0], 2.3, pos[1]);
    room1.add(flame);
    
    // ⭐ Store for animation
    if (!this.torchFlames) this.torchFlames = [];
    this.torchFlames.push(flame);
    
    // ⭐ ADD SMOKE
    const smoke = createTorchSmoke(pos[0], pos[1]);
    room1.add(smoke);
    if (!this.torchSmoke) this.torchSmoke = [];
    this.torchSmoke.push(smoke);
});
    
    // Fire/torch lights (warm glow)
 torchPositions.forEach(pos => {
    const torchLight = new THREE.PointLight(0xff6633, 2, 15);
    torchLight.position.set(pos[0], 2, pos[1]);
    torchLight.castShadow = true;
    room1.add(torchLight);
    
    // ⭐ ANIMATED SHADER FLAME (UPGRADED)
    const flameMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                pos.x += sin(time * 5.0 + position.y * 10.0) * 0.1;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                float fire = vUv.y + sin(time * 3.0 + vUv.x * 10.0) * 0.2;
                vec3 color = mix(
                    vec3(1.0, 0.3, 0.0),  // Red-orange base
                    vec3(1.0, 1.0, 0.0),  // Yellow tips
                    fire
                );
                gl_FragColor = vec4(color, 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.6, 8),
        flameMaterial
    );
    flame.position.set(pos[0], 2.3, pos[1]);
    room1.add(flame);
    
    // ⭐ Store for animation
  const smoke = createTorchSmoke(pos[0], pos[1]);
    room1.add(smoke);
    if (!this.torchSmoke) this.torchSmoke = [];
    this.torchSmoke.push(smoke);
});
    
    // ========================================
    // ATMOSPHERE
    // ========================================
    
    this.scene.background = new THREE.Color(0x3e2723); // Deep earth brown
    this.scene.fog = new THREE.FogExp2(0x3e2723, 0.01);
    
    room1.position.set(0, 0, 0);
    this.rooms.push(room1);
    this.rooms.forEach(room => this.scene.add(room));
    
    console.log("🌍 African Heritage Gallery created!");
}
generateConcreteTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base dark concrete
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, width, height);
    
    // Subtle noise
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        const shade = Math.random() * 30 + 45;
        ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.4)`;
        ctx.fillRect(x, y, size, size);
    }
    
    return canvas;
}

// ============================================================================
// HELPER FUNCTION: Generate Carrara Marble Texture
// Add this function after generateConcreteTexture() (around line 569)
// ============================================================================

generateCarraraMarble(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base white marble
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, width, height);
    
    // Subtle gray veining (diagonal flow)
    const numVeins = 40;
    for (let i = 0; i < numVeins; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Mix of gray tones
        const grayValue = 200 + Math.random() * 40;
        const color = `rgba(${grayValue}, ${grayValue}, ${grayValue + 5}, ${0.15 + Math.random() * 0.25})`;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        // Diagonal angle for natural marble flow
        let angle = Math.PI / 4 + (Math.random() - 0.5) * 0.8;
        
        for (let j = 0; j < 150; j++) {
            angle += (Math.random() - 0.5) * 0.3;
            x += Math.cos(angle) * 8;
            y += Math.sin(angle) * 8;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Add occasional darker accent veins
    for (let i = 0; i < 8; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        ctx.strokeStyle = `rgba(150, 150, 155, ${0.2 + Math.random() * 0.2})`;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.PI / 4 + (Math.random() - 0.5) * 1.0;
        
        for (let j = 0; j < 100; j++) {
            angle += (Math.random() - 0.5) * 0.4;
            x += Math.cos(angle) * 12;
            y += Math.sin(angle) * 12;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Polished finish with subtle shine
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}
generateMetalGridPattern(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Dark metallic base
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = '#2a3f5f';
    ctx.lineWidth = 3;
    
    const gridSize = 128;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Tech details (random panels)
    ctx.fillStyle = '#00d4ff';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
        ctx.fillRect(x + 10, y + 10, gridSize - 20, gridSize - 20);
    }
    
    return canvas;
}


generateEarthTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Ocean base
    ctx.fillStyle = '#0a3d62';
    ctx.fillRect(0, 0, width, height);
    
    // Continents (simplified)
    ctx.fillStyle = '#2d5016';
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.5, width * 0.15, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Americas
    ctx.beginPath();
    ctx.ellipse(width * 0.2, height * 0.4, width * 0.1, height * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(width * 0.25, height * 0.6, width * 0.08, height * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.35, width * 0.18, height * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.32, width * 0.08, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.78, height * 0.65, width * 0.09, height * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 50 + 20;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ice caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.05, width * 0.2, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.95, width * 0.15, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}



generateBlackMarquina(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Deep black base
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Gold and white veining
    const numVeins = 30;
    for (let i = 0; i < numVeins; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Mix of gold and white veins
        const isGold = Math.random() > 0.6;
        const color = isGold 
            ? `rgba(218, 165, 32, ${0.4 + Math.random() * 0.3})`  // Gold
            : `rgba(255, 255, 255, ${0.2 + Math.random() * 0.2})`; // White
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        let angle = Math.random() * Math.PI * 2;
        
        for (let j = 0; j < 120; j++) {
            angle += (Math.random() - 0.5) * 0.4;
            x += Math.cos(angle) * 10;
            y += Math.sin(angle) * 10;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    // Polished finish
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}

generateMarbleNormalMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Base normal map color (neutral normal)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Generate subtle height variation for normal map
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Perlin-like noise for realistic surface
            const noise = (Math.sin(x * 0.02) * Math.cos(y * 0.02)) * 0.5 + 0.5;
            const variation = (Math.random() - 0.5) * 30;
            
            // Normal map RGB channels (X, Y, Z surface normals)
            imageData.data[i] = 128 + noise * 25 + variation;     // R (X normal)
            imageData.data[i + 1] = 128 + noise * 25 + variation; // G (Y normal)
            imageData.data[i + 2] = 200 + noise * 45;             // B (Z normal - pointing up)
            imageData.data[i + 3] = 255;                           // Alpha
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

//   createAvatar() {
//     this.avatarGroup = new THREE.Group();
//     const avatarMaterial = new THREE.MeshBasicMaterial({
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.1 // ✓ FIXED: Much less visible (was 0.3)
//     });

//     const clickablePlane = new THREE.Mesh(
//         new THREE.PlaneGeometry(0.5, 0.5),
//         new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 })
//     );
//     clickablePlane.position.set(2, 1.7, 2);
//     this.avatarGroup.add(clickablePlane);

//     const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 32), avatarMaterial);
//     body.position.set(2, 0.5, 2);
//     this.avatarGroup.add(body);

//     const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), avatarMaterial);
//     head.position.set(2, 1.2, 2);
//     this.avatarGroup.add(head);

//     const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
//     const leftArm = new THREE.Mesh(armGeometry, avatarMaterial);
//     leftArm.position.set(1.7, 0.7, 2);
//     leftArm.rotation.z = Math.PI / 4;
//     this.avatarGroup.add(leftArm);

//     const rightArm = new THREE.Mesh(armGeometry, avatarMaterial);
//     rightArm.position.set(2.3, 0.7, 2);
//     rightArm.rotation.z = -Math.PI / 4;
//     this.avatarGroup.add(rightArm);

//     const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
//     const leftLeg = new THREE.Mesh(legGeometry, avatarMaterial);
//     leftLeg.position.set(1.8, 0.25, 2);
//     this.avatarGroup.add(leftLeg);

//     const rightLeg = new THREE.Mesh(legGeometry, avatarMaterial);
//     rightLeg.position.set(2.2, 0.25, 2);
//     this.avatarGroup.add(rightLeg);

//     this.avatarGroup.userData = { isAvatar: true };
//     this.scene.add(this.avatarGroup);

//     this.setupAvatarAnimation();
//     this.updateAvatarPosition();
// }

//     setupAvatarAnimation() {
//         const times = [0, 1, 2];
//         const armValues = [
//             [Math.PI / 4, -Math.PI / 4],
//             [-Math.PI / 4, Math.PI / 4],
//             [Math.PI / 4, -Math.PI / 4]
//         ];

//         const leftArmTrack = new THREE.NumberKeyframeTrack(
//             '.children[3].rotation[z]',
//             times,
//             armValues.map(v => v[0])
//         );
//         const rightArmTrack = new THREE.NumberKeyframeTrack(
//             '.children[4].rotation[z]',
//             times,
//             armValues.map(v => v[1])
//         );

//         const clip = new THREE.AnimationClip('avatarWave', 2, [leftArmTrack, rightArmTrack]);
//         const action = this.animationMixer.clipAction(clip, this.avatarGroup);
//         action.setLoop(THREE.LoopRepeat);
//         action.play();
//     }

//     updateAvatarPosition() {
//         if (this.isMobile) {
//             const roomCenter = this.rooms[this.currentRoom].position.clone();
//             this.avatarGroup.position.copy(roomCenter);
//             this.avatarGroup.position.y = 0.5;
//         } else {
//             const direction = new THREE.Vector3();
//             this.camera.getWorldDirection(direction);
//             direction.y = 0;
//             direction.normalize().multiplyScalar(3);
//             this.avatarGroup.position.copy(this.camera.position).add(direction);
//             this.avatarGroup.position.y = 0.5;
//         }
//     }

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
        // this.updateAvatarPosition();
        
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
    
    // Animate spotlights (gentle sway like lanterns in wind)
    this.glassSpotlights.forEach((light, index) => {
        const sway = Math.sin(time * 0.5 + index) * 0.1;
        const pulse = Math.sin(time * 1.5 + index) * 0.3;
        
        light.spot.intensity = 3.5 + pulse;
        
        // Sunset color shift (orange to deep red)
        const colorShift = Math.sin(time * 0.3) * 0.5 + 0.5;
        light.spot.color.setRGB(
            1.0,
            0.6 + colorShift * 0.1,
            0.3 + colorShift * 0.1
        );
    });
    
    // Animate Kente cloth banners (gentle wave)
    if (this.kenteBanners) {
        this.kenteBanners.forEach((banner, index) => {
            if (banner.material.uniforms) {
                banner.material.uniforms.time.value = time + index;
            }
            
            // Gentle sway
            banner.rotation.y = Math.sin(time * 0.5 + index) * 0.1;
        });
    }
    // Update torch flames (add to existing updateLighting function)
if (this.torchFlames) {
    this.torchFlames.forEach(flame => {
        if (flame.material.uniforms) {
            flame.material.uniforms.time.value = time;
        }
    });
}
    
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
        
        // ⭐ MATCH gallery dimensions exactly (35×60)
        const galleryWidth = 35;
        const galleryLength = 60;
        
        // Padding to stay inside walls
        const padding = 3;
        
        const minX = -(galleryWidth / 2) + padding;  // -14.5
        const maxX = (galleryWidth / 2) - padding;   // +14.5
        const minZ = -(galleryLength / 2) + padding; // -27
        const maxZ = (galleryLength / 2) - padding;  // +27
        
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

const app = new ThreeJSApp();
app.init();
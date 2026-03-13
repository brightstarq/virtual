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

        this.glassSegments = [];
        this.jellyfish = [];
        this.sharks = [];
        this.fishSchools = [];
        this.coralReefs = [];
        this.bioluminescentCreatures = [];
        this.bubbles = [];
        this.pressureCracks = [];
        this.causticsPlanes = [];
        this.underwaterLights = [];
        this.seaPlants = [];
        this.artworkFrames = [];
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
        this.glassSegments = [];
        this.jellyfish = [];
        this.sharks = [];
        this.fishSchools = [];
        this.coralReefs = [];
        this.bioluminescentCreatures = [];
        this.bubbles = [];
        this.pressureCracks = [];
        this.causticsPlanes = [];
        this.underwaterLights = [];
        this.seaPlants = [];
        this.artworkFrames = [];

        // Create underwater environment
        this.createUnderwaterObservatory();    // Main tunnel structure
        this.createGlassTunnels();             // Transparent walkways
        this.createObservationDome();          // Central viewing area
        this.createCoralReefs();               // Reef structures with artwork
        this.createJellyfish();                // Floating jellyfish
        this.createSharks();                   // Patrolling sharks
        this.createFishSchools();              // Schools of fish
        this.createBioluminescentLife();       // Glowing creatures
        this.createSeaPlants();                // Swaying kelp & plants
        this.createBubbles();                  // Rising bubbles
        this.createPressureCracks();           // Glass damage effects
        this.createCaustics();                 // Water light patterns
        this.createUnderwaterLighting();       // Deep sea lighting
        this.createOceanFloor();               // Sandy bottom
        this.createUnderwaterFog();            // Volumetric water

        console.log("🌊 ═══════════════════════════════════════");
        console.log("🌊  UNDERWATER OBSERVATORY INITIALIZED");
        console.log("🌊 ═══════════════════════════════════════");
        console.log("✅ Glass Tunnel Segments: " + this.glassSegments.length);
        console.log("✅ Jellyfish: " + this.jellyfish.length);
        console.log("✅ Sharks: " + this.sharks.length);
        console.log("✅ Fish Schools: " + this.fishSchools.length);
        console.log("✅ Coral Reefs: " + this.coralReefs.length);
        console.log("✅ Bioluminescent Creatures: " + this.bioluminescentCreatures.length);
        console.log("✅ Artwork Spots: " + this.artworkSpots.length);
        console.log("🌊 ═══════════════════════════════════════");
    }

    // ========================================
    // UNDERWATER OBSERVATORY (main structure)
    // ========================================

    createUnderwaterObservatory() {
        const observatoryRoom = new THREE.Group();
        observatoryRoom.visible = true;

        // Materials
        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transmission: 0.95,
            opacity: 0.3,
            transparent: true,
            roughness: 0.05,
            thickness: 0.5,
            envMapIntensity: 1
        });

        this.metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a5a6a,
            roughness: 0.4,
            metalness: 0.9
        });

        this.darkMetalMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a3a4a,
            roughness: 0.6,
            metalness: 0.8
        });

        this.sandMaterial = new THREE.MeshStandardMaterial({
            color: 0xc2b280,
            roughness: 0.9,
            metalness: 0.1
        });

        // Ocean dimensions
        this.tunnelRadius = 2.5;
        this.tunnelLength = 60;

        // Ambient water color
        const waterAmbient = new THREE.AmbientLight(0x1a4a6a, 0.4);
        observatoryRoom.add(waterAmbient);

        this.rooms.push(observatoryRoom);
        this.scene.add(observatoryRoom);
    }

    // ========================================
    // GLASS TUNNELS (cylindrical walkways)
    // ========================================

    createGlassTunnels() {
        const segmentLength = 6;
        const segmentCount = 10;

        for (let i = 0; i < segmentCount; i++) {
            const segment = this.createTunnelSegment(i, segmentLength);
            this.rooms[0].add(segment);
            this.glassSegments.push(segment);
        }

        console.log(`✅ Created ${segmentCount} glass tunnel segments`);
    }

    createTunnelSegment(index, length) {
        const group = new THREE.Group();
        const z = -this.tunnelLength / 2 + index * length;

        // Glass cylinder (walkway)
        const glassWall = new THREE.Mesh(
            new THREE.CylinderGeometry(
                this.tunnelRadius,
                this.tunnelRadius,
                length,
                16,
                1,
                true
            ),
            this.glassMaterial
        );
        glassWall.rotation.x = Math.PI / 2;
        glassWall.position.z = z + length / 2;
        glassWall.position.y = 1.5;
        group.add(glassWall);

        // Metal support rings
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(this.tunnelRadius + 0.1, 0.15, 8, 16),
                this.metalMaterial
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.z = z + (i / (ringCount - 1)) * length;
            ring.position.y = 1.5;
            group.add(ring);
        }

        // Floor grating
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.tunnelRadius * 1.8, length),
            new THREE.MeshStandardMaterial({
                color: 0x3a4a5a,
                roughness: 0.7,
                metalness: 0.6,
                transparent: true,
                opacity: 0.9
            })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.z = z + length / 2;
        floor.receiveShadow = true;
        group.add(floor);

        // Handrails
        for (let side = -1; side <= 1; side += 2) {
            const rail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, length, 8),
                this.darkMetalMaterial
            );
            rail.rotation.x = Math.PI / 2;
            rail.position.set(side * 1.2, 1, z + length / 2);
            group.add(rail);
        }

        // Emergency lights
        if (index % 2 === 0) {
            const emergencyLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xff3300,
                    emissive: 0xff3300,
                    emissiveIntensity: 1
                })
            );
            emergencyLight.position.set(0, 2.5, z + length / 2);
            group.add(emergencyLight);

            const light = new THREE.PointLight(0xff3300, 0.5, 8);
            light.position.copy(emergencyLight.position);
            group.add(light);
        }

        group.userData = {
            index: index,
            glassWall: glassWall
        };

        return group;
    }

    // ========================================
    // OBSERVATION DOME (central viewing area)
    // ========================================

    createObservationDome() {
        const dome = new THREE.Group();

        // Large glass hemisphere
        const domeGlass = new THREE.Mesh(
            new THREE.SphereGeometry(8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            this.glassMaterial
        );
        domeGlass.position.y = 1.5;
        domeGlass.position.z = 0;
        dome.add(domeGlass);

        // Metal frame ribs
        const ribCount = 8;
        for (let i = 0; i < ribCount; i++) {
            const angle = (i / ribCount) * Math.PI * 2;

            const points = [];
            for (let j = 0; j <= 10; j++) {
                const t = j / 10;
                const radius = 8 * Math.sin(t * Math.PI / 2);
                const y = 1.5 + 8 * (1 - Math.cos(t * Math.PI / 2));

                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    y,
                    Math.sin(angle) * radius
                ));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
            const rib = new THREE.Mesh(tubeGeometry, this.metalMaterial);
            dome.add(rib);
        }

        // Viewing platforms
        const platformCount = 4;
        for (let i = 0; i < platformCount; i++) {
            const angle = (i / platformCount) * Math.PI * 2;
            const platform = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.1, 1.5),
                this.metalMaterial
            );
            platform.position.set(
                Math.cos(angle) * 5,
                0.5,
                Math.sin(angle) * 5
            );
            platform.rotation.y = angle + Math.PI / 2;
            dome.add(platform);

            // Bench
            const bench = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.3, 0.5),
                this.darkMetalMaterial
            );
            bench.position.copy(platform.position);
            bench.position.y += 0.35;
            bench.rotation.y = angle + Math.PI / 2;
            dome.add(bench);
        }

        // Central control panel
        const controlPanel = this.createControlPanel();
        controlPanel.position.y = 1;
        dome.add(controlPanel);

        this.rooms[0].add(dome);
        this.observationDome = dome;
    }

    createControlPanel() {
        const group = new THREE.Group();

        // Panel base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1, 1.5, 8),
            this.darkMetalMaterial
        );
        group.add(base);

        // Screen
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#001a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // Title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('OBSERVATORY', 256, 60);

        // Data
        ctx.font = '28px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('Depth: 342m', 40, 120);
        ctx.fillText('Pressure: 34.2 bar', 40, 160);
        ctx.fillText('Temp: 4°C', 40, 200);
        ctx.fillText('Visibility: 15m', 40, 240);

        ctx.fillText('Status: NOMINAL', 40, 300);
        ctx.fillText('O₂: 98%', 40, 340);
        ctx.fillText('Systems: OK', 40, 380);

        // Warning
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ Minor pressure anomaly detected', 256, 450);

        const texture = new THREE.CanvasTexture(canvas);

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 1.2),
            new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            })
        );
        screen.position.y = 0.5;
        screen.position.z = 0.8;
        group.add(screen);

        // Screen glow
        const light = new THREE.PointLight(0x00ffff, 1, 5);
        light.position.set(0, 0.5, 1);
        group.add(light);

        return group;
    }

    // ========================================
    // CORAL REEFS (with artwork mounts)
    // ========================================

    createCoralReefs() {
        const reefConfigs = [
            // Left side reefs
            { x: -6, y: -1, z: -25, size: 'large' },
            { x: -7, y: -0.5, z: -12, size: 'medium' },
            { x: -6, y: -1, z: 3, size: 'large' },
            { x: -7, y: -0.5, z: 18, size: 'medium' },

            // Right side reefs
            { x: 6, y: -1, z: -22, size: 'medium' },
            { x: 7, y: -0.5, z: -8, size: 'large' },
            { x: 6, y: -1, z: 8, size: 'medium' },
            { x: 7, y: -0.5, z: 22, size: 'large' },

            // Dome area reefs
            { x: -10, y: -1, z: -2, size: 'large' },
            { x: 10, y: -1, z: 2, size: 'large' }
        ];

        reefConfigs.forEach((config, index) => {
            const reef = this.createCoralReef(config, index);
            this.rooms[0].add(reef);
            this.coralReefs.push(reef);
        });
    }

    createCoralReef(config, index) {
        const group = new THREE.Group();

        const sizeMultiplier = config.size === 'large' ? 1.5 :
            config.size === 'medium' ? 1 : 0.7;

        // Coral formations (various types)
        const coralTypes = [
            { color: 0xff6b9d, shape: 'branch' },
            { color: 0x8b4789, shape: 'fan' },
            { color: 0x00a8cc, shape: 'brain' },
            { color: 0xe76f51, shape: 'tube' }
        ];

        const coralCount = 8 + Math.floor(Math.random() * 5);

        for (let i = 0; i < coralCount; i++) {
            const type = coralTypes[Math.floor(Math.random() * coralTypes.length)];
            const coral = this.createCoral(type, sizeMultiplier);

            const angle = (i / coralCount) * Math.PI * 2;
            const radius = 1 + Math.random() * 2;

            coral.position.set(
                Math.cos(angle) * radius * sizeMultiplier,
                Math.random() * 0.5,
                Math.sin(angle) * radius * sizeMultiplier
            );
            coral.rotation.y = Math.random() * Math.PI * 2;

            group.add(coral);
        }

        // Artwork mounting frame
        if (index < 8) { // First 8 reefs get artwork spots
            const artworkMount = this.createUnderwaterArtworkFrame(config.size);
            artworkMount.position.y = 1 + sizeMultiplier * 0.5;
            group.add(artworkMount);

            this.artworkSpots.push({
                position: new THREE.Vector3(config.x, config.y + 1, config.z),
                normal: new THREE.Vector3(-Math.sign(config.x), 0, 0),
                mesh: artworkMount,
                type: 'underwater',
                index: index
            });

            this.artworkFrames.push(artworkMount);
        }

        // Position reef
        group.position.set(config.x, config.y, config.z);

        group.userData = {
            size: config.size,
            swayPhase: Math.random() * Math.PI * 2
        };

        return group;
    }

    createCoral(type, sizeMultiplier) {
        const group = new THREE.Group();

        const material = new THREE.MeshStandardMaterial({
            color: type.color,
            roughness: 0.7,
            metalness: 0.1,
            emissive: type.color,
            emissiveIntensity: 0.2
        });

        switch (type.shape) {
            case 'branch':
                // Branching coral
                for (let i = 0; i < 5; i++) {
                    const branch = new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            0.05 * sizeMultiplier,
                            0.1 * sizeMultiplier,
                            0.8 * sizeMultiplier,
                            6
                        ),
                        material
                    );
                    branch.position.y = 0.4 * sizeMultiplier;
                    branch.rotation.z = (Math.random() - 0.5) * 0.5;
                    branch.rotation.x = (Math.random() - 0.5) * 0.5;
                    group.add(branch);
                }
                break;

            case 'fan':
                // Fan coral
                const fan = new THREE.Mesh(
                    new THREE.PlaneGeometry(
                        0.8 * sizeMultiplier,
                        1.2 * sizeMultiplier,
                        8,
                        12
                    ),
                    material
                );


            case 'brain':
                // Brain coral
                const brain = new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.5 * sizeMultiplier,
                        16,
                        12
                    ),
                    material
                );
                brain.scale.y = 0.6;
                brain.position.y = 0.3 * sizeMultiplier;
                group.add(brain);
                break;

            case 'tube':
                // Tube coral
                for (let i = 0; i < 3; i++) {
                    const tube = new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            0.1 * sizeMultiplier,
                            0.12 * sizeMultiplier,
                            1 * sizeMultiplier,
                            8
                        ),
                        material
                    );
                    tube.position.set(
                        (Math.random() - 0.5) * 0.3 * sizeMultiplier,
                        0.5 * sizeMultiplier,
                        (Math.random() - 0.5) * 0.3 * sizeMultiplier
                    );
                    group.add(tube);
                }
                break;
        }

        return group;
    }

    createUnderwaterArtworkFrame(size) {
        const group = new THREE.Group();

        const width = size === 'large' ? 2.5 : size === 'medium' ? 2 : 1.5;
        const height = width * 0.75;

        // Waterproof housing (metal frame)
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.4),
            this.darkMetalMaterial
        );
        group.add(frame);

        // Protective glass
        const protectiveGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transmission: 0.9,
                opacity: 0.1,
                transparent: true,
                roughness: 0.1
            })
        );
        protectiveGlass.position.z = 0.21;
        group.add(protectiveGlass);

        // Artwork surface (black background for now)
        const artSurface = new THREE.Mesh(
            new THREE.PlaneGeometry(width - 0.1, height - 0.1),
            new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.8
            })
        );
        artSurface.position.z = 0.15;
        group.add(artSurface);

        // Mounting bolts (corners)
        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                const bolt = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8),
                    this.metalMaterial
                );
                bolt.position.set(
                    x * (width / 2 + 0.1),
                    y * (height / 2 + 0.1),
                    0.2
                );
                bolt.rotation.x = Math.PI / 2;
                group.add(bolt);
            }
        }

        // Underwater spotlights
        const spotlightLeft = new THREE.SpotLight(0xffffff, 1, 10, Math.PI / 6);
        spotlightLeft.position.set(-width / 2 - 0.5, height / 2, 1);
        spotlightLeft.target.position.set(0, 0, 0.2);
        group.add(spotlightLeft);
        group.add(spotlightLeft.target);

        const spotlightRight = new THREE.SpotLight(0xffffff, 1, 10, Math.PI / 6);
        spotlightRight.position.set(width / 2 + 0.5, height / 2, 1);
        spotlightRight.target.position.set(0, 0, 0.2);
        group.add(spotlightRight);
        group.add(spotlightRight.target);

        group.userData = {
            artSurface: artSurface,
            size: size,
            width: width,
            height: height
        };

        return group;
    }

    // Continue to Part 2...


    // ========================================
    // JELLYFISH (floating, animated)
    // Performance: Only 6-8 jellyfish, low-poly
    // ========================================

    createJellyfish() {
        const jellyfishCount = 6; // Keep low!

        const positions = [
            { x: -5, y: 3, z: -20 },
            { x: 4, y: 4, z: -10 },
            { x: -6, y: 2.5, z: 5 },
            { x: 5, y: 3.5, z: 12 },
            { x: -4, y: 4, z: -28 },
            { x: 6, y: 2, z: 20 }
        ];

        positions.forEach((pos, index) => {
            const jellyfish = this.createJellyfish(index);
            jellyfish.position.set(pos.x, pos.y, pos.z);
            this.rooms[0].add(jellyfish);
            this.jellyfish.push(jellyfish);
        });

        console.log(`🪼 Created ${jellyfishCount} jellyfish (optimized)`);
    }

    createJellyfish(index) {
        const group = new THREE.Group();

        // Bell (dome) - LOW POLY (8 segments only!)
        const bell = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({
                color: 0xff88cc,
                transparent: true,
                opacity: 0.6,
                emissive: 0xff88cc,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
            })
        );
        bell.scale.y = 0.7;
        group.add(bell);

        // Tentacles (simple lines, not geometry!)
        const tentacleCount = 6; // Not 20!
        const tentacles = [];

        for (let i = 0; i < tentacleCount; i++) {
            const angle = (i / tentacleCount) * Math.PI * 2;
            const points = [];

            // Only 4 points per tentacle (not 10!)
            for (let j = 0; j < 4; j++) {
                const t = j / 3;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * 0.3,
                    -t * (1 + Math.random() * 0.5),
                    Math.sin(angle) * 0.3
                ));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, 4, 0.02, 3, false); // Low segments!

            const tentacle = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({
                    color: 0xff88cc,
                    transparent: true,
                    opacity: 0.4
                })
            );
            group.add(tentacle);
            tentacles.push({ mesh: tentacle, curve: curve, points: points });
        }

        // Single small light (not one per jellyfish!)
        if (index % 2 === 0) { // Only half have lights!
            const light = new THREE.PointLight(0xff88cc, 0.5, 5);
            light.position.y = -0.2;
            group.add(light);
        }

        group.userData = {
            bell: bell,
            tentacles: tentacles,
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.5 + Math.random() * 0.5,
            driftSpeed: 0.01 + Math.random() * 0.01
        };

        return group;
    }

    // ========================================
    // SHARKS (patrolling)
    // Performance: Only 3 sharks, simple geometry
    // ========================================

    createSharks() {
        const sharkCount = 3; // Keep minimal!

        const paths = [
            { startZ: -30, endZ: 30, y: 4, x: -8 },
            { startZ: 30, endZ: -30, y: 3, x: 8 },
            { startZ: -25, endZ: 25, y: 5, x: 0 }
        ];

        paths.forEach((path, index) => {
            const shark = this.createShark();
            shark.position.set(path.x, path.y, path.startZ);
            this.rooms[0].add(shark);
            this.sharks.push({
                mesh: shark,
                path: path,
                progress: 0,
                speed: 0.02 + Math.random() * 0.01
            });
        });

        console.log(`🦈 Created ${sharkCount} sharks (optimized)`);
    }

    createShark() {
        const group = new THREE.Group();

        // Body (simple elongated sphere) - LOW POLY!
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 6), // Only 8 segments!
            new THREE.MeshStandardMaterial({
                color: 0x4a5a6a,
                roughness: 0.6,
                metalness: 0.3
            })
        );
        body.scale.set(1, 0.7, 2.5);
        group.add(body);

        // Fins (simple triangles)
        const finMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a4a5a,
            roughness: 0.7,
            side: THREE.DoubleSide
        });

        // Dorsal fin
        const dorsalFin = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 0.6, 4), // Only 4 sides!
            finMaterial
        );
        dorsalFin.rotation.z = Math.PI / 2;
        dorsalFin.position.set(0, 0.5, -0.3);
        group.add(dorsalFin);

        // Tail (simple cone)
        const tail = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 0.8, 4),
            finMaterial
        );
        tail.rotation.z = -Math.PI / 2;
        tail.position.z = -1.5;
        group.add(tail);

        group.userData = {
            body: body,
            tail: tail,
            tailSwing: 0
        };

        return group;
    }

    // ========================================
    // FISH SCHOOLS (using InstancedMesh!)
    // Performance: THE BIG WIN - 1 draw call for 50 fish!
    // ========================================

    createFishSchools() {
        const schoolCount = 3;
        const fishPerSchool = 50; // All rendered in ONE draw call!

        const schoolConfigs = [
            { centerX: -5, centerY: 2, centerZ: -15, radius: 3, color: 0xffaa00 },
            { centerX: 5, centerY: 3, centerZ: 0, radius: 4, color: 0x00aaff },
            { centerX: -6, centerY: 4, centerZ: 18, radius: 3, color: 0xff6600 }
        ];

        schoolConfigs.forEach(config => {
            const school = this.createFishSchool(config, fishPerSchool);
            this.rooms[0].add(school);
            this.fishSchools.push(school);
        });

        console.log(`🐟 Created ${schoolCount} schools with ${fishPerSchool} fish each (InstancedMesh)`);
    }

    createFishSchool(config, count) {
        // Single geometry for ALL fish in school!
        const fishGeometry = new THREE.ConeGeometry(0.08, 0.25, 4); // Tiny, low-poly
        fishGeometry.rotateX(Math.PI / 2);

        const fishMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            roughness: 0.5,
            metalness: 0.3
        });

        // InstancedMesh = ONE draw call for all fish!
        const instancedMesh = new THREE.InstancedMesh(fishGeometry, fishMaterial, count);

        // Initialize fish positions
        const fishData = [];
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            // Random position in sphere
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * config.radius;
            const height = (Math.random() - 0.5) * config.radius;

            const fishInfo = {
                angle: angle,
                radius: radius,
                height: height,
                speed: 0.01 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2
            };
            fishData.push(fishInfo);

            // Set initial matrix
            dummy.position.set(
                config.centerX + Math.cos(angle) * radius,
                config.centerY + height,
                config.centerZ + Math.sin(angle) * radius
            );
            dummy.rotation.y = angle;
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }

        instancedMesh.instanceMatrix.needsUpdate = true;

        instancedMesh.userData = {
            fishData: fishData,
            config: config
        };

        return instancedMesh;
    }

    // ========================================
    // BIOLUMINESCENT CREATURES
    // Performance: Only 12 total, simple spheres
    // ========================================

    createBioluminescentLife() {
        const creatureCount = 12; // Keep LOW!

        const positions = [
            { x: -7, y: 1, z: -22 }, { x: 7, y: 1.5, z: -18 },
            { x: -6, y: 2, z: -8 }, { x: 6, y: 1, z: -5 },
            { x: -7, y: 1.5, z: 6 }, { x: 7, y: 2, z: 10 },
            { x: -6, y: 1, z: 15 }, { x: 6, y: 1.5, z: 20 },
            { x: -8, y: 2, z: -28 }, { x: 8, y: 1, z: -12 },
            { x: -7, y: 1.5, z: 0 }, { x: 7, y: 2, z: 25 }
        ];

        const colors = [0x00ffff, 0x00ff88, 0x0088ff, 0x88ff00];

        positions.forEach((pos, index) => {
            const creature = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 6, 4), // Tiny, low-poly
                new THREE.MeshBasicMaterial({
                    color: colors[index % colors.length],
                    emissive: colors[index % colors.length],
                    emissiveIntensity: 1
                })
            );

            creature.position.set(pos.x, pos.y, pos.z);
            this.rooms[0].add(creature);

            // Only add light to HALF of them!
            if (index % 2 === 0) {
                const light = new THREE.PointLight(colors[index % colors.length], 0.5, 4);
                light.position.copy(creature.position);
                this.rooms[0].add(light);
            }

            this.bioluminescentCreatures.push({
                mesh: creature,
                baseY: pos.y,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5
            });
        });

        console.log(`✨ Created ${creatureCount} bioluminescent creatures (optimized)`);
    }

    // ========================================
    // SEA PLANTS (swaying kelp)
    // Performance: Simple planes, not 3D geometry
    // ========================================

    createSeaPlants() {
        const plantCount = 20; // Moderate count

        for (let i = 0; i < plantCount; i++) {
            const plant = this.createKelp();

            // Random position on ocean floor
            const angle = (i / plantCount) * Math.PI * 2 + Math.random();
            const radius = 6 + Math.random() * 4;

            plant.position.set(
                Math.cos(angle) * radius,
                -1.5,
                Math.sin(angle) * radius
            );

            this.rooms[0].add(plant);
            this.seaPlants.push(plant);
        }

        console.log(`🌿 Created ${plantCount} kelp plants (optimized)`);
    }

    createKelp() {
        const group = new THREE.Group();

        // Simple curved plane (not tube geometry!)
        const height = 2 + Math.random() * 2;

        const geometry = new THREE.PlaneGeometry(0.3, height, 1, 8); // Low segments
        const positions = geometry.attributes.position;

        // Curve the plane
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const curve = (y / height) * 0.3;
            positions.setX(i, positions.getX(i) + Math.sin((y / height) * Math.PI) * curve);
        }

        const material = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            roughness: 0.8,
            side: THREE.DoubleSide
        });

        const kelp = new THREE.Mesh(geometry, material);
        group.add(kelp);

        group.userData = {
            kelp: kelp,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.3 + Math.random() * 0.4,
            swayAmount: 0.1 + Math.random() * 0.1
        };

        return group;
    }

    // ========================================
    // BUBBLES (rising particles)
    // Performance: Single Points geometry, not spheres!
    // ========================================

    createBubbles() {
        const bubbleCount = 100; // Reasonable count
        const positions = new Float32Array(bubbleCount * 3);
        const velocities = [];

        for (let i = 0; i < bubbleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = -1 + Math.random() * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

            velocities.push({
                x: (Math.random() - 0.5) * 0.01,
                y: 0.02 + Math.random() * 0.03,
                z: (Math.random() - 0.5) * 0.01
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const bubbles = new THREE.Points(geometry, material);
        this.rooms[0].add(bubbles);

        this.bubbles.push({
            mesh: bubbles,
            velocities: velocities,
            count: bubbleCount
        });

        console.log(`💧 Created ${bubbleCount} bubbles (Points geometry)`);
    }

    // Continue to Part 3...
    // ========================================
    // PRESSURE CRACKS (simple decals on glass)
    // Performance: Just textures, no geometry!
    // ========================================

    createPressureCracks() {
        const crackCount = 8; // Minimal cracks

        // Only crack some glass segments, not all
        const crackedSegments = [1, 3, 5, 7];

        crackedSegments.forEach(segmentIndex => {
            if (this.glassSegments[segmentIndex]) {
                const crack = this.createCrack();
                const segment = this.glassSegments[segmentIndex];

                // Position on glass surface
                const angle = Math.random() * Math.PI * 2;
                const radius = this.tunnelRadius - 0.05;

                crack.position.set(
                    Math.cos(angle) * radius,
                    1.5 + (Math.random() - 0.5) * 1,
                    segment.position.z + (Math.random() - 0.5) * 3
                );
                crack.rotation.y = angle;

                this.rooms[0].add(crack);
                this.pressureCracks.push(crack);
            }
        });

        console.log(`⚠️ Created ${crackedSegments.length} pressure cracks (texture-based)`);
    }

    createCrack() {
        // Canvas texture for crack pattern
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw crack lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Main crack
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + (Math.random() - 0.5) * 200, centerY + (Math.random() - 0.5) * 200);
        ctx.stroke();

        // Branch cracks (3-5 branches)
        const branches = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < branches; i++) {
            const angle = (i / branches) * Math.PI * 2 + Math.random();
            const length = 50 + Math.random() * 80;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);

        const crack = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.7,
                depthWrite: false
            })
        );

        crack.userData = {
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.5 + Math.random() * 0.5
        };

        return crack;
    }

    // ========================================
    // CAUSTICS (animated water light patterns)
    // Performance: ONE plane with animated shader!
    // ========================================

    createCaustics() {
        // Single plane above entire scene
        const causticsSize = 30;

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        this.causticsCanvas = canvas;
        this.causticsCtx = ctx;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);

        const caustics = new THREE.Mesh(
            new THREE.PlaneGeometry(causticsSize, causticsSize),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );

        caustics.rotation.x = -Math.PI / 2;
        caustics.position.y = -1.4; // Just above floor
        this.rooms[0].add(caustics);

        this.causticsPlanes.push({
            mesh: caustics,
            texture: texture,
            frame: 0
        });

        console.log("🌊 Caustics created (single animated plane)");
    }

    drawCausticsPattern(frame) {
        if (!this.causticsCtx) return;

        const ctx = this.causticsCtx;
        const canvas = this.causticsCanvas;

        // Clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw caustic patterns (simplified)
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.lineWidth = 3;

        const time = frame * 0.01;
        const lines = 15; // Not too many!

        for (let i = 0; i < lines; i++) {
            ctx.beginPath();
            const offset = (i / lines) * canvas.width;

            for (let x = 0; x < canvas.width; x += 20) {
                const y = canvas.height / 2 +
                    Math.sin((x + offset) * 0.02 + time) * 50 +
                    Math.sin((x + offset) * 0.03 + time * 1.3) * 30;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    // ========================================
    // OCEAN FLOOR (simple plane)
    // Performance: Single plane with texture
    // ========================================

    createOceanFloor() {
        const floorSize = 80;

        // Simple sand floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(floorSize, floorSize, 1, 1), // No subdivisions!
            this.sandMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        this.rooms[0].add(floor);

        // Add some scattered rocks (LOW COUNT!)
        const rockCount = 15;
        for (let i = 0; i < rockCount; i++) {
            const rock = new THREE.Mesh(
                new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 6, 4), // Low poly!
                new THREE.MeshStandardMaterial({
                    color: 0x4a4a3a,
                    roughness: 0.9
                })
            );

            rock.position.set(
                (Math.random() - 0.5) * floorSize * 0.8,
                -1.8,
                (Math.random() - 0.5) * floorSize * 0.8
            );
            rock.scale.y = 0.6;
            this.rooms[0].add(rock);
        }

        console.log("🏝️ Ocean floor created (minimal geometry)");
    }

    // ========================================
    // UNDERWATER LIGHTING (strategic only!)
    // Performance: Just 5 lights total!
    // ========================================

    createUnderwaterLighting() {
        // Main overhead light (simulating distant surface)
        const surfaceLight = new THREE.DirectionalLight(0x4488ff, 0.6);
        surfaceLight.position.set(0, 20, 0);
        surfaceLight.target.position.set(0, 0, 0);
        surfaceLight.castShadow = false; // Shadow = expensive!
        this.rooms[0].add(surfaceLight);
        this.rooms[0].add(surfaceLight.target);

        // Tunnel lights (only 4 along the path)
        const lightPositions = [
            { x: 0, y: 2.5, z: -25 },
            { x: 0, y: 2.5, z: -10 },
            { x: 0, y: 2.5, z: 10 },
            { x: 0, y: 2.5, z: 25 }
        ];

        lightPositions.forEach(pos => {
            const light = new THREE.PointLight(0x88ccff, 1, 15);
            light.position.set(pos.x, pos.y, pos.z);
            light.castShadow = false; // NO SHADOWS = faster!
            this.rooms[0].add(light);

            this.underwaterLights.push({
                light: light,
                baseIntensity: 1,
                phase: Math.random() * Math.PI * 2
            });
        });

        console.log("💡 Lighting created (5 lights total, no shadows)");
    }

    // ========================================
    // UNDERWATER FOG (built-in, free!)
    // Performance: THREE.js fog = zero cost!
    // ========================================

    createUnderwaterFog() {
        // Exponential fog for depth effect
        this.scene.fog = new THREE.FogExp2(0x1a3a4a, 0.035);

        console.log("🌫️ Underwater fog enabled (built-in)");
    }

    // ========================================
    // ANIMATION SYSTEM (optimized updates)
    // ========================================

    updateUnderwaterAnimations() {
        if (!this.rooms || !this.rooms[0]) return;

        const time = Date.now() * 0.001;

        // Update only what's needed
        this.updateJellyfish(time);
        this.updateSharks();
        this.updateFishSchools(time);
        this.updateBioluminescentCreatures(time);
        this.updateSeaPlants(time);
        this.updateBubbles();
        this.updatePressureCracks(time);
        this.updateCaustics();
        this.updateUnderwaterLights(time);
        this.updateCoralSway(time);
    }

    // Jellyfish floating
    updateJellyfish(time) {
        this.jellyfish.forEach(jelly => {
            const data = jelly.userData;

            // Vertical bobbing
            data.floatPhase += 0.02 * data.floatSpeed;
            jelly.position.y += Math.sin(data.floatPhase) * 0.01;

            // Horizontal drift
            jelly.position.x += Math.sin(time * data.driftSpeed) * 0.005;
            jelly.position.z += Math.cos(time * data.driftSpeed) * 0.005;

            // Bell pulsing (scale)
            const pulse = 1 + Math.sin(data.floatPhase * 2) * 0.05;
            data.bell.scale.y = 0.7 * pulse;

            // Tentacle waving (every 3rd frame only!)
            if (Math.floor(time * 60) % 3 === 0) {
                data.tentacles.forEach((tentacle, index) => {
                    const wave = Math.sin(time * 2 + index * 0.5) * 0.2;
                    tentacle.mesh.rotation.z = wave;
                });
            }
        });
    }

    // Shark swimming
    updateSharks() {
        this.sharks.forEach(shark => {
            const path = shark.path;

            // Linear path movement
            shark.progress += shark.speed;
            if (shark.progress >= 1) shark.progress = 0;

            const z = path.startZ + (path.endZ - path.startZ) * shark.progress;
            shark.mesh.position.z = z;

            // Tail swing
            const data = shark.mesh.userData;
            data.tailSwing += 0.1;
            data.tail.rotation.y = Math.sin(data.tailSwing) * 0.3;

            // Face direction
            shark.mesh.rotation.y = path.endZ > path.startZ ? 0 : Math.PI;
        });
    }

    // Fish schools (InstancedMesh update)
    updateFishSchools(time) {
        this.fishSchools.forEach(school => {
            const data = school.userData;
            const dummy = new THREE.Object3D();

            data.fishData.forEach((fish, i) => {
                // Circular swimming
                fish.angle += fish.speed;
                fish.phase += 0.1;

                const x = data.config.centerX + Math.cos(fish.angle) * fish.radius;
                const z = data.config.centerZ + Math.sin(fish.angle) * fish.radius;
                const y = data.config.centerY + fish.height + Math.sin(fish.phase) * 0.2;

                dummy.position.set(x, y, z);
                dummy.rotation.y = fish.angle + Math.PI / 2;
                dummy.updateMatrix();
                school.setMatrixAt(i, dummy.matrix);
            });

            school.instanceMatrix.needsUpdate = true;
        });
    }

    // Bioluminescent pulsing
    updateBioluminescentCreatures(time) {
        this.bioluminescentCreatures.forEach(creature => {
            creature.phase += 0.02 * creature.speed;

            // Floating
            creature.mesh.position.y = creature.baseY + Math.sin(creature.phase) * 0.3;

            // Pulsing glow
            const intensity = 0.5 + Math.sin(creature.phase * 2) * 0.5;
            creature.mesh.material.emissiveIntensity = intensity;
        });
    }

    // Kelp swaying
    updateSeaPlants(time) {
        // Only update every other frame for performance
        if (Math.floor(time * 60) % 2 !== 0) return;

        this.seaPlants.forEach(plant => {
            const data = plant.userData;
            data.swayPhase += 0.02 * data.swaySpeed;

            const sway = Math.sin(data.swayPhase) * data.swayAmount;
            data.kelp.rotation.z = sway;
        });
    }

    // Bubbles rising
    updateBubbles() {
        this.bubbles.forEach(bubbleGroup => {
            const positions = bubbleGroup.mesh.geometry.attributes.position.array;

            for (let i = 0; i < bubbleGroup.count; i++) {
                // Move up
                positions[i * 3] += bubbleGroup.velocities[i].x;
                positions[i * 3 + 1] += bubbleGroup.velocities[i].y;
                positions[i * 3 + 2] += bubbleGroup.velocities[i].z;

                // Reset at surface
                if (positions[i * 3 + 1] > 8) {
                    positions[i * 3] = (Math.random() - 0.5) * 15;
                    positions[i * 3 + 1] = -1;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
                }
            }

            bubbleGroup.mesh.geometry.attributes.position.needsUpdate = true;
        });
    }

    // Pressure crack pulsing
    updatePressureCracks(time) {
        this.pressureCracks.forEach(crack => {
            const data = crack.userData;
            data.pulsePhase += 0.02 * data.pulseSpeed;

            // Warning pulse
            const opacity = 0.5 + Math.sin(data.pulsePhase) * 0.2;
            crack.material.opacity = opacity;
        });
    }

    // Caustics animation
    updateCaustics() {
        if (this.causticsPlanes.length === 0) return;

        const caustic = this.causticsPlanes[0];
        caustic.frame++;

        // Only redraw every 3 frames (20fps is fine for caustics)
        if (caustic.frame % 3 === 0) {
            this.drawCausticsPattern(caustic.frame);
            caustic.texture.needsUpdate = true;
        }
    }

    // Light flickering (minimal)
    updateUnderwaterLights(time) {
        this.underwaterLights.forEach(lightData => {
            // Gentle variation (simulating water movement)
            const variation = Math.sin(time + lightData.phase) * 0.2;
            lightData.light.intensity = lightData.baseIntensity + variation;
        });
    }

    // Coral swaying
    updateCoralSway(time) {
        // Only every 2nd frame
        if (Math.floor(time * 60) % 2 !== 0) return;

        this.coralReefs.forEach(reef => {
            const data = reef.userData;
            data.swayPhase += 0.01;

            const sway = Math.sin(data.swayPhase) * 0.02;
            reef.rotation.y = sway;
        });
    }

    // ========================================
    // COLLISION DETECTION
    // ========================================

    checkCollisions() {
        if (!this.camera) return;

        const pos = this.camera.position;

        // Tunnel bounds (cylindrical)
        const distFromCenter = Math.sqrt(pos.x * pos.x);
        if (distFromCenter > 2.0) { // Slightly less than tunnel radius
            const angle = Math.atan2(0, pos.x);
            pos.x = Math.cos(angle) * 2.0;
        }

        // Length bounds
        if (pos.z < -28) pos.z = -28;
        if (pos.z > 28) pos.z = 28;

        // Floor/ceiling
        if (pos.y < 0.2) pos.y = 0.2;
        if (pos.y > 2.5) pos.y = 2.5;
    }

    // ========================================
    // SPAWN POSITION
    // ========================================

    getSpawnPosition() {
        return {
            position: new THREE.Vector3(0, 1.6, 25), // Start at tunnel entrance
            rotation: Math.PI // Looking into tunnel
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

        this.updateUnderwaterAnimations();


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
        this.handleUploadSubmit({ preventDefault: () => { } });
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
        switch (event.key.toLowerCase()) {
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
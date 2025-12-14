import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

class ImmersiveGallery {
    constructor() {
        console.log("🚀 Starting ImmersiveGallery...");
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 3);

        // Renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        });
        this.renderer.setClearColor(0x000000, 0.2);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.body.appendChild(this.renderer.domElement);
        document.body.style.backgroundColor = "#0f0f1a";

        // Slideshow system
        this.slideshow = {
            active: false,
            currentIndex: 0,
            interval: 5000,
            timer: null
        };

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 10;
        this.controls.enablePan = false;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;

        // State
        this.images = [];
        this.radius = 5;
        this.sessionId = localStorage.getItem('sessionId');
        this.textureLoader = new THREE.TextureLoader();
        this.isRemoveActive = false;
        this.is360View = false;
        this.controlsVisible = true;
        this.selectedMesh = null;
        this.focusedMesh = null;
        this.imagesToLoad = [];
        this.maxImages = 20;

        // FEATURE PROPERTIES (Layout removed)
        this.bookmarks = JSON.parse(localStorage.getItem('gallery_bookmarks') || '[]');
        this.currentTheme = localStorage.getItem('gallery_theme') || 'dark';
        this.currentFilter = 'none';
        
        console.log("✅ Features initialized:", {
            theme: this.currentTheme,
            bookmarks: this.bookmarks.length
        });

        // Raycaster for interactions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Recording
        this.recording = {
            mediaRecorder: null,
            chunks: [],
            isRecording: false,
            blob: null,
            url: null
        };

        // Audio
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);
        this.backgroundAudio = new THREE.Audio(this.audioListener);
        this.clickSound = new THREE.Audio(this.audioListener);
        this.shuffleSound = new THREE.Audio(this.audioListener);

        // Post-processing effects
        this.time = 0;
        this.animationSpeed = 1.0;

        this.init();
    }

    init() {
        console.log("🎬 Initializing gallery...");
        this.addLighting();
        this.addBackgroundEnvironment();
        this.setupAudio();
        this.addParticleSystem();
        
        // Load from share link if present
        this.loadFromShareLink();
        
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Update bookmark list
        this.updateBookmarkList();
        
        // Setup event listeners
        this.setupEventListeners();
        
        if (this.sessionId && !window.location.search.includes('config=')) {
            this.loadImages(this.sessionId);
        }
        
        this.animate();
        window.addEventListener("resize", () => this.handleResize());
        
        console.log("✅ Gallery ready!");
    }

    // ========================================
    // LIGHTING SYSTEM
    // ========================================
    
    addLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        this.lights = [];
        const lightColors = [0x00d4ff, 0xff00ff, 0x00ff88];
        const lightPositions = [
            [5, 5, 5],
            [-5, 5, -5],
            [0, -5, 5]
        ];

        lightPositions.forEach((pos, i) => {
            const light = new THREE.PointLight(lightColors[i], 0.8, 20);
            light.position.set(...pos);
            this.scene.add(light);
            this.lights.push({ light, originalPos: new THREE.Vector3(...pos) });
        });

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(10, 10, 10);
        this.scene.add(dirLight);
    }

    // ========================================
    // SLIDESHOW SYSTEM
    // ========================================
    
    startSlideshow() {
        if (this.images.length === 0) return;
        
        this.slideshow.active = true;
        this.slideshow.currentIndex = 0;
        
        const showNextImage = () => {
            if (!this.slideshow.active) return;
            
            const mesh = this.images[this.slideshow.currentIndex].mesh;
            this.smoothCameraToImage(mesh);
            
            this.slideshow.currentIndex = (this.slideshow.currentIndex + 1) % this.images.length;
            this.slideshow.timer = setTimeout(showNextImage, this.slideshow.interval);
        };
        
        showNextImage();
        this.showMessage("slideshowStatus", "Slideshow started", "success");
    }

    stopSlideshow() {
        this.slideshow.active = false;
        if (this.slideshow.timer) clearTimeout(this.slideshow.timer);
        this.showMessage("slideshowStatus", "Slideshow stopped", "success");
    }

    smoothCameraToImage(mesh) {
        const targetPos = mesh.position.clone().normalize().multiplyScalar(this.radius - 2);
        const startPos = this.camera.position.clone();
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.camera.lookAt(mesh.position);
            
            if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ========================================
    // PARTICLE SYSTEM
    // ========================================
    
    addParticleSystem() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            colors.push(
                Math.random(),
                Math.random() * 0.5 + 0.5,
                1
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    // ========================================
    // ENVIRONMENT SYSTEM
    // ========================================
    
    addBackgroundEnvironment() {
        this.loadEnvironmentMap('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg');
    }

    loadEnvironmentMap(url) {
        this.textureLoader.load(
            url,
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.background = texture;
                console.log("🌌 Environment loaded");
            },
            undefined,
            (err) => console.warn("⚠️ Environment load failed:", err)
        );
    }

    handleEnvMapUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.loadEnvironmentMap(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // ========================================
    // AUDIO SYSTEM
    // ========================================
    
    async setupAudio() {
        const startAudio = async () => {
            try {
                const backgroundBuffer = await this.loadAudio('sweet.mp3');
                this.backgroundAudio.setBuffer(backgroundBuffer);
                this.backgroundAudio.setLoop(true);
                this.backgroundAudio.setVolume(0.3);
                
                if (this.audioListener.context.state === 'suspended') {
                    await this.audioListener.context.resume();
                }
                
                this.backgroundAudio.play();
                console.log("🎶 Audio started");

                this.clickSound.setBuffer(await this.loadAudio('sweet.mp3'));
                this.clickSound.setVolume(0.5);

                this.shuffleSound.setBuffer(await this.loadAudio('sweet.mp3'));
                this.shuffleSound.setVolume(0.5);
            } catch (err) {
                console.warn("⚠️ Audio failed (non-critical):", err);
            }
        };

        const startOnInteraction = () => {
            startAudio();
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
        };

        document.addEventListener('click', startOnInteraction, { once: true });
        document.addEventListener('keydown', startOnInteraction, { once: true });
    }

    loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load(url, resolve, undefined, reject);
        });
    }

    // ========================================
    // ANIMATION LOOP
    // ========================================
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        this.controls.update();

        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
        }

        this.lights.forEach((lightData, i) => {
            const offset = i * Math.PI * 2 / this.lights.length;
            lightData.light.position.x = lightData.originalPos.x + Math.sin(this.time + offset) * 2;
            lightData.light.position.y = lightData.originalPos.y + Math.cos(this.time * 0.5 + offset) * 2;
            lightData.light.intensity = 0.6 + Math.sin(this.time * 2 + offset) * 0.2;
        });

        this.renderer.render(this.scene, this.camera);
    }

    // ========================================
    // IMAGE MANAGEMENT
    // ========================================
    
    async loadImages(sessionId) {
        this.clearScene();

        try {
            this.showStatus("toggleViewStatus", true);
            const response = await fetch(`/api/screenshots/${sessionId}`);
            
            if (response.status === 404) {
                console.warn("⚠️ Session not found, using demo images");
                this.showMessage("toggleViewStatus", "Session not found", "error");
                return;
            }
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (!data.screenshots?.length) {
                this.showMessage("toggleViewStatus", "No screenshots found", "error");
                return;
            }

            this.imagesToLoad = data.screenshots
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                .slice(0, this.maxImages);
            
            if (data.screenshots.length > this.maxImages) {
                console.warn(`⚠️ Limited ${data.screenshots.length} images to ${this.maxImages}`);
            }

            // Load images in default circular layout
            this.updateImagePositions();
            
            this.showMessage("toggleViewStatus", `Loaded ${this.imagesToLoad.length} images`, "success");
        } catch (error) {
            console.error("❌ Load failed:", error);
            this.showMessage("toggleViewStatus", `Load failed: ${error.message}`, "error");
        } finally {
            this.showStatus("toggleViewStatus", false);
        }
    }

    async addImage(filename, theta, phiOrIndex) {
        try {
            const texture = await this.loadTexture(filename);
            const aspectRatio = texture.image.width / texture.image.height;
            const planeHeight = this.is360View ? 1.5 : 2;
            const planeWidth = planeHeight * aspectRatio;

            const material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide,
                roughness: 0.5,
                metalness: 0.1
            });

            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
            const mesh = new THREE.Mesh(geometry, material);

            if (this.is360View) {
                const x = this.radius * Math.sin(phiOrIndex) * Math.cos(theta);
                const y = this.radius * Math.cos(phiOrIndex);
                const z = this.radius * Math.sin(phiOrIndex) * Math.sin(theta);
                mesh.position.set(x, y, z);
            } else {
                const x = this.radius * Math.cos(theta);
                const z = this.radius * Math.sin(theta);
                mesh.position.set(x, 0, z);
            }
            
            mesh.lookAt(0, 0, 0);
            mesh.userData = { 
                filename, 
                buttonCreated: false,
                originalOpacity: 1.0
            };
            mesh.userData.onClick = () => this.showRemoveButton(mesh);

            this.scene.add(mesh);
            this.images.push({ mesh, filename });

            console.log(`✅ Image added: ${filename}`);
        } catch (error) {
            console.warn(`⚠️ Skip: ${filename}`, error);
        }
    }

    loadTexture(filename) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                filename,
                (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    updateImagePositions() {
        this.clearScene();

        if (!this.imagesToLoad || this.imagesToLoad.length === 0) return;

        const totalImages = this.imagesToLoad.length;
        const goldenRatio = (Math.sqrt(5) + 1) / 2;

        if (this.is360View) {
            // Spherical distribution
            for (let index = 0; index < totalImages; index++) {
                const y = 1 - (index / (totalImages - 1)) * 2;
                const radiusAtY = Math.sqrt(1 - y * y);
                const theta = goldenRatio * index * Math.PI * 2;
                const phi = Math.acos(y);
                this.addImage(this.imagesToLoad[index], theta, phi);
            }
        } else {
            // Circular distribution
            const angleIncrement = (2 * Math.PI) / totalImages;
            for (let index = 0; index < totalImages; index++) {
                const angle = index * angleIncrement;
                this.addImage(this.imagesToLoad[index], angle, angleIncrement);
            }
        }
    }

    clearScene() {
        const imagesToRemove = this.scene.children.filter(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        imagesToRemove.forEach(child => {
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
        
        this.images = [];
        console.log("🗑️ Images cleared");
    }

    // ========================================
    // BOOKMARKS SYSTEM
    // ========================================
    
    saveBookmark() {
        const name = prompt("Bookmark name:", `View ${this.bookmarks.length + 1}`) || `Bookmark ${this.bookmarks.length + 1}`;
        
        const bookmark = {
            name: name,
            cameraPosition: this.camera.position.toArray(),
            cameraRotation: this.camera.rotation.toArray(),
            timestamp: Date.now()
        };
        
        this.bookmarks.push(bookmark);
        localStorage.setItem('gallery_bookmarks', JSON.stringify(this.bookmarks));
        this.updateBookmarkList();
        this.showMessage("bookmarkStatus", "Bookmark saved", "success");
    }

    loadBookmark(index) {
        const bookmark = this.bookmarks[index];
        if (!bookmark) return;
        
        const targetPos = new THREE.Vector3(...bookmark.cameraPosition);
        const targetRot = new THREE.Euler(...bookmark.cameraRotation);
        
        this.animateCameraTo(targetPos, targetRot);
        
        this.showMessage("bookmarkStatus", `Loaded: ${bookmark.name}`, "success");
    }

    animateCameraTo(targetPos, targetRot) {
        const startPos = this.camera.position.clone();
        const startRot = this.camera.rotation.clone();
        const duration = 1500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.camera.rotation.x = THREE.MathUtils.lerp(startRot.x, targetRot.x, eased);
            this.camera.rotation.y = THREE.MathUtils.lerp(startRot.y, targetRot.y, eased);
            this.camera.rotation.z = THREE.MathUtils.lerp(startRot.z, targetRot.z, eased);
            
            if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
    }

    deleteBookmark(index) {
        this.bookmarks.splice(index, 1);
        localStorage.setItem('gallery_bookmarks', JSON.stringify(this.bookmarks));
        this.updateBookmarkList();
        this.showMessage("bookmarkStatus", "Bookmark deleted", "success");
    }

    updateBookmarkList() {
        const container = document.getElementById('bookmarkList');
        if (!container) return;
        
        container.innerHTML = this.bookmarks.map((b, i) => `
            <div class="bookmark-item">
                <span style="flex: 1; color: #00d4ff;">${b.name}</span>
                <button onclick="gallery.loadBookmark(${i})" class="glow-btn" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Load</button>
                <button onclick="gallery.deleteBookmark(${i})" class="glow-btn danger-btn" style="padding: 5px 10px; font-size: 12px;">✕</button>
            </div>
        `).join('');
    }

    // ========================================
    // SHARE & EXPORT SYSTEM
    // ========================================
    
    generateShareLink() {
        const config = {
            sessionId: this.sessionId,
            view360: this.is360View,
            radius: this.radius,
            theme: this.currentTheme,
            filter: this.currentFilter
        };
        
        const encoded = btoa(JSON.stringify(config));
        const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showMessage("shareStatus", "Link copied to clipboard!", "success");
        }).catch(() => {
            prompt("Copy this link:", shareUrl);
        });
        
        return shareUrl;
    }

    loadFromShareLink() {
        const params = new URLSearchParams(window.location.search);
        const configStr = params.get('config');
        
        if (configStr) {
            try {
                const config = JSON.parse(atob(configStr));
                this.sessionId = config.sessionId;
                this.radius = config.radius || 5;
                this.is360View = config.view360 || false;
                this.currentTheme = config.theme || 'dark';
                this.currentFilter = config.filter || 'none';
                
                this.applyTheme(this.currentTheme);
                
                if (this.sessionId) {
                    this.loadImages(this.sessionId).then(() => {
                        if (this.currentFilter !== 'none') {
                            this.applyImageFilter(this.currentFilter);
                        }
                    });
                }
                
                this.showMessage("shareStatus", "Loaded from share link", "success");
            } catch (e) {
                console.error("Invalid share link");
            }
        }
    }

    exportAsJSON() {
        const data = {
            version: '1.0',
            sessionId: this.sessionId,
            images: this.images.map(img => ({
                filename: img.filename,
                position: img.mesh.position.toArray(),
                rotation: img.mesh.rotation.toArray()
            })),
            settings: {
                radius: this.radius,
                is360View: this.is360View,
                theme: this.currentTheme,
                filter: this.currentFilter
            },
            bookmarks: this.bookmarks,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, `gallery-config-${Date.now()}.json`);
        this.showMessage("exportStatus", "Configuration exported", "success");
    }

    // ========================================
    // THEME SYSTEM
    // ========================================
    
    applyTheme(themeName) {
        const themes = {
            dark: {
                background: 0x0f0f1a,
                lightColor: 0x00d4ff,
                particleColor: [0, 0.8, 1],
                bodyBg: '#0f0f1a'
            },
            light: {
                background: 0xf5f5f5,
                lightColor: 0xffa500,
                particleColor: [1, 0.6, 0],
                bodyBg: '#f5f5f5'
            },
            sunset: {
                background: 0x2a1a4a,
                lightColor: 0xff6b35,
                particleColor: [1, 0.4, 0.2],
                bodyBg: '#2a1a4a'
            },
            ocean: {
                background: 0x0a3d62,
                lightColor: 0x00fff5,
                particleColor: [0, 1, 0.96],
                bodyBg: '#0a3d62'
            },
            forest: {
                background: 0x1a3a1a,
                lightColor: 0x00ff88,
                particleColor: [0, 1, 0.5],
                bodyBg: '#1a3a1a'
            }
        };
        
        const theme = themes[themeName];
        if (!theme) return;
        
        this.currentTheme = themeName;
        localStorage.setItem('gallery_theme', themeName);
        
        this.renderer.setClearColor(theme.background);
        document.body.style.backgroundColor = theme.bodyBg;
        
        this.lights.forEach(lightData => {
            lightData.light.color.setHex(theme.lightColor);
        });
        
        if (this.particles) {
            const colors = this.particles.geometry.attributes.color;
            for (let i = 0; i < colors.count; i++) {
                colors.setXYZ(i, ...theme.particleColor);
            }
            colors.needsUpdate = true;
        }
        
        this.showMessage("themeStatus", `Theme: ${themeName}`, "success");
    }

    // ========================================
    // IMAGE FILTERS
    // ========================================
    
    applyImageFilter(filterType) {
        this.currentFilter = filterType;
        
        this.images.forEach(img => {
            const material = img.mesh.material;
            
            switch(filterType) {
                case 'grayscale':
                    material.color.setHSL(0, 0, 0.5);
                    material.emissive.setHex(0x000000);
                    material.emissiveIntensity = 0;
                    break;
                case 'sepia':
                    material.color.setRGB(1.0, 0.9, 0.7);
                    material.emissive.setHex(0x000000);
                    material.emissiveIntensity = 0;
                    break;
                case 'vibrant':
                    material.color.setHex(0xffffff);
                    material.emissive.setHex(0x222222);
                    material.emissiveIntensity = 0.3;
                    break;
                case 'cool':
                    material.color.setRGB(0.8, 0.9, 1.0);
                    material.emissive.setHex(0x000000);
                    material.emissiveIntensity = 0;
                    break;
                case 'warm':
                    material.color.setRGB(1.0, 0.95, 0.85);
                    material.emissive.setHex(0x000000);
                    material.emissiveIntensity = 0;
                    break;
                case 'none':
                default:
                    material.color.setHex(0xffffff);
                    material.emissive.setHex(0x000000);
                    material.emissiveIntensity = 0;
                    break;
            }
        });
        
        this.showMessage("filterStatus", `Filter: ${filterType}`, "success");
    }

    // ========================================
    // INTERACTION SYSTEM
    // ========================================
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onCanvasClick(event) {
        if (!this.isRemoveActive) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.images.map(img => img.mesh)
        );

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            this.selectedMesh = intersectedObject;
            this.showRemoveButton(intersectedObject);
            if (!this.clickSound.isPlaying) {
                this.clickSound.play();
            }
        }
    }

    onDoubleClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.images.map(img => img.mesh)
        );

        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            
            if (this.focusedMesh === mesh) {
                mesh.scale.set(1, 1, 1);
                mesh.material.opacity = 1;
                this.focusedMesh = null;
                this.images.forEach(img => img.mesh.material.opacity = 1);
                this.showMessage("toggleViewStatus", "View reset", "success");
            } else {
                if (this.focusedMesh) {
                    this.focusedMesh.scale.set(1, 1, 1);
                    this.focusedMesh.material.opacity = 1;
                }

                this.focusedMesh = mesh;
                mesh.scale.set(2, 2, 2);
                mesh.material.opacity = 1;

                this.images.forEach(img => {
                    if (img.mesh !== mesh) {
                        img.mesh.material.opacity = 0.3;
                    }
                });
                this.showMessage("toggleViewStatus", "Image focused", "success");
            }
        } else if (this.focusedMesh) {
            this.focusedMesh.scale.set(1, 1, 1);
            this.focusedMesh.material.opacity = 1;
            this.focusedMesh = null;
            this.images.forEach(img => img.mesh.material.opacity = 1);
            this.showMessage("toggleViewStatus", "View reset", "success");
        }
    }

    onTouchStart(event) {
        const touch = event.touches[0];
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        this.onCanvasClick(event);
    }

    onTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }

    // ========================================
    // IMAGE MANIPULATION
    // ========================================
    
    shuffleImages() {
        if (this.images.length === 0) {
            this.showMessage("shuffleStatus", "No images to shuffle", "error");
            return;
        }

        this.showStatus("shuffleStatus", true);
        this.images = this.images.sort(() => Math.random() - 0.5);
        this.imagesToLoad = this.images.map(img => img.mesh.userData.filename);
        this.updateImagePositions();
        
        if (!this.shuffleSound.isPlaying) {
            this.shuffleSound.play();
        }
        
        this.showMessage("shuffleStatus", "Shuffled successfully", "success");
        this.showStatus("shuffleStatus", false);
    }

    removeImage(mesh) {
        this.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (mesh.material.map) mesh.material.map.dispose();
            child.material.dispose();
        }
        
        this.images = this.images.filter(img => img.mesh !== mesh);
        this.imagesToLoad = this.images.map(img => img.mesh.userData.filename);
        console.log(`🗑️ Removed: ${mesh.userData.filename}`);
        this.updateImagePositions();
    }

    removeSelectedImage() {
        if (this.selectedMesh) {
            this.showStatus("removeSelectedStatus", true);
            this.removeImage(this.selectedMesh);
            this.hideAllRemoveButtons();
            this.selectedMesh = null;
            this.showMessage("removeSelectedStatus", "Image removed", "success");
            this.showStatus("removeSelectedStatus", false);
        } else {
            this.showMessage("removeSelectedStatus", "No image selected", "error");
        }
    }

    removeAllImages() {
        this.showStatus("removeAllStatus", true);
        this.clearScene();
        this.imagesToLoad = [];
        this.showMessage("removeAllStatus", "All images removed", "success");
        this.showStatus("removeAllStatus", false);
    }

    toggleRemove() {
        this.showStatus("toggleRemoveStatus", true);
        this.isRemoveActive = !this.isRemoveActive;
        const removeControls = document.getElementById("removeControls");
        
        setTimeout(() => {
            removeControls.classList.toggle("hidden", !this.isRemoveActive);
            this.showMessage(
                "toggleRemoveStatus", 
                this.isRemoveActive ? "Remove mode enabled" : "Remove mode disabled", 
                "success"
            );
            this.showStatus("toggleRemoveStatus", false);
        }, 500);
    }

    showRemoveButton(mesh) {
        if (!this.isRemoveActive || mesh.userData.buttonCreated) return;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✕ Remove";
        removeBtn.style.cssText = `
            position: absolute;
            z-index: 1000;
            padding: 8px 16px;
            background: rgba(220, 53, 69, 0.9);
            color: #fff;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(removeBtn);

        const updateButtonPosition = () => {
            const screenPos = new THREE.Vector3();
            mesh.getWorldPosition(screenPos);
            screenPos.project(this.camera);

            const xPos = (screenPos.x + 1) / 2 * window.innerWidth;
            const yPos = (1 - screenPos.y) / 2 * window.innerHeight;

            removeBtn.style.left = `${xPos}px`;
            removeBtn.style.top = `${yPos - 40}px`;
            removeBtn.style.display = "block";
        };

        updateButtonPosition();

        const updateLoop = () => {
            if (this.isRemoveActive && removeBtn.parentNode) {
                updateButtonPosition();
                requestAnimationFrame(updateLoop);
            } else {
                removeBtn.remove();
                mesh.userData.buttonCreated = false;
            }
        };
        updateLoop();

        removeBtn.addEventListener("click", () => {
            this.removeImage(mesh);
            removeBtn.remove();
            mesh.userData.buttonCreated = false;
        });

        removeBtn.addEventListener("mouseover", () => {
            removeBtn.style.transform = "scale(1.1)";
            removeBtn.style.background = "rgba(200, 35, 51, 0.95)";
        });
        
        removeBtn.addEventListener("mouseout", () => {
            removeBtn.style.transform = "scale(1)";
            removeBtn.style.background = "rgba(220, 53, 69, 0.9)";
        });

        mesh.userData.buttonCreated = true;
    }

    hideAllRemoveButtons() {
        const removeButtons = document.querySelectorAll("button[style*='Remove']");
        removeButtons.forEach(btn => btn.remove());
        this.images.forEach(img => {
            img.mesh.userData.buttonCreated = false;
        });
    }

    // ========================================
    // VIEW CONTROLS
    // ========================================
    
    toggleViewMode() {
        this.showStatus("toggleViewStatus", true);
        this.is360View = !this.is360View;

        if (this.is360View) {
            this.camera.position.set(0, 0, 0);
            this.controls.maxDistance = 10;
            this.controls.minDistance = 0.1;
        } else {
            this.camera.position.set(0, 0, 3);
            this.controls.maxDistance = 8;
            this.controls.minDistance = 1;
        }
        
        this.camera.updateProjectionMatrix();
        this.updateImagePositions();
        
        this.showMessage(
            "toggleViewStatus", 
            this.is360View ? "360° view enabled" : "3D view enabled", 
            "success"
        );
        this.showStatus("toggleViewStatus", false);
    }

    toggleRotate() {
        this.showStatus("toggleRotateStatus", true);
        this.controls.autoRotate = !this.controls.autoRotate;
        this.showMessage(
            "toggleRotateStatus", 
            this.controls.autoRotate ? "Auto-rotate ON" : "Auto-rotate OFF", 
            "success"
        );
        this.showStatus("toggleRotateStatus", false);
    }

    rotateScene(angle) {
        this.scene.rotation.y += angle;
    }

    toggleControls() {
        this.controlsVisible = !this.controlsVisible;
        const controlPanels = document.querySelectorAll(".control-panel");
        const toggleButton = document.getElementById("toggleControlsBtn");

        controlPanels.forEach(panel => {
            panel.classList.toggle("hidden-panel", !this.controlsVisible);
        });

        toggleButton.textContent = this.controlsVisible ? "Hide Controls" : "Show Controls";
        const icon = toggleButton.querySelector("i");
        if (icon) {
            icon.className = this.controlsVisible ? "fas fa-eye" : "fas fa-eye-slash";
        }
    }

    // ========================================
    // CONTROLS & SLIDERS
    // ========================================
    
    handleZoom() {
        const zoomSlider = document.getElementById("zoomSlider");
        const zoomValue = document.getElementById("zoomValue");
        const zoomLevel = parseFloat(zoomSlider.value);
        zoomValue.textContent = zoomLevel.toFixed(1);
        this.controls.maxDistance = zoomLevel;
        this.controls.update();
        
        if (!this.is360View) {
            this.camera.position.z = zoomLevel;
            this.camera.updateProjectionMatrix();
        }
    }

    handleRadius() {
        const radiusSlider = document.getElementById("radiusSlider");
        const radiusValue = document.getElementById("radiusValue");
        this.radius = parseFloat(radiusSlider.value);
        radiusValue.textContent = this.radius.toFixed(1);
        this.updateImagePositions();
    }

    // ========================================
    // FILE UPLOAD & CAPTURE
    // ========================================
    
    async handleScreenshotSubmit(event) {
        event.preventDefault();
        const url = document.getElementById("url").value;
        
        if (!url) {
            this.showMessage("screenshotStatus", "Enter a valid URL", "error");
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
                this.showMessage("screenshotStatus", `Captured: ${url}`, "success");
                this.loadImages(this.sessionId);
            } else {
                this.showMessage("screenshotStatus", "Capture failed", "error");
            }
        } catch (error) {
            console.error("❌ Capture error:", error);
            this.showMessage("screenshotStatus", `Failed: ${error.message}`, "error");
        } finally {
            this.showStatus("screenshotStatus", false);
        }
    }

    async handleUploadSubmit(event) {
        event.preventDefault();
        const fileInput = document.getElementById("images");
        
        if (!fileInput.files?.length) {
            this.showMessage("uploadStatus", "Select images first", "error");
            return;
        }

        this.showStatus("uploadStatus", true);

        const formData = new FormData();
        for (const file of fileInput.files) {
            formData.append("images", file);
        }

        try {
            const response = await fetch(
                `/api/upload${this.sessionId ? `/${this.sessionId}` : ''}`,
                { method: "POST", body: formData }
            );
            
            const result = await response.json();
            
            if (result.success) {
                this.sessionId = result.sessionId;
                localStorage.setItem('sessionId', this.sessionId);
                this.showMessage("uploadStatus", `Uploaded ${result.filePaths.length} images`, "success");
                this.loadImages(this.sessionId);
            } else {
                this.showMessage("uploadStatus", `Upload failed: ${result.error}`, "error");
            }
        } catch (error) {
            console.error("❌ Upload error:", error);
            this.showMessage("uploadStatus", `Failed: ${error.message}`, "error");
        } finally {
            this.showStatus("uploadStatus", false);
        }
    }

    showImagePreviews(event) {
        const files = event.target.files;
        const previewContainer = document.getElementById("previewContainer");
        previewContainer.innerHTML = "";

        Array.from(files).slice(0, 20).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.classList.add("preview-thumbnail");
                img.style.cssText = `
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    margin: 5px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s;
                `;
                img.addEventListener("mouseover", () => img.style.transform = "scale(1.1)");
                img.addEventListener("mouseout", () => img.style.transform = "scale(1)");
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        
        if (files.length > 20) {
            const warning = document.createElement("p");
            warning.textContent = `Showing first 20 of ${files.length} images`;
            warning.style.color = "#ffa500";
            previewContainer.appendChild(warning);
        }
    }

    // ========================================
    // RECORDING
    // ========================================
    
    startRecording() {
        if (this.recording.isRecording) {
            this.showMessage("startRecordingStatus", "Already recording", "error");
            return;
        }

        this.showStatus("startRecordingStatus", true);
        this.recording.chunks = [];
        
        const stream = this.renderer.domElement.captureStream(30);

        try {
            this.recording.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
            this.setupRecorder("mp4", "gallery-360.mp4");
        } catch (e) {
            console.warn("⚠️ MP4 failed, using WebM");
            this.recording.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
            this.setupRecorder("webm", "gallery-360.webm");
        }

        const indicator = document.getElementById("recordingIndicator");
        indicator.classList.remove("hidden");
        indicator.textContent = "● Recording (2:00)";

        let timeLeft = 120;
        this.recordingTimer = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            indicator.textContent = `● Recording (${mins}:${secs.toString().padStart(2, '0')})`;
            
            if (timeLeft <= 0) {
                clearInterval(this.recordingTimer);
                this.stopRecording();
            }
        }, 1000);
        
        this.showMessage("startRecordingStatus", "Recording started", "success");
        this.showStatus("startRecordingStatus", false);
    }

    setupRecorder(type, filename) {
        this.recording.mediaRecorder.ondataavailable = (event) => {
            this.recording.chunks.push(event.data);
        };

        this.recording.mediaRecorder.onstop = () => {
            this.recording.blob = new Blob(this.recording.chunks, { type: `video/${type}` });
            this.recording.url = URL.createObjectURL(this.recording.blob);
            this.downloadFile(this.recording.url, filename);
        };

        this.recording.mediaRecorder.start();
        this.recording.isRecording = true;
        console.log(`🎥 Recording (${type})`);
    }

    stopRecording() {
        if (!this.recording.isRecording) {
            this.showMessage("stopRecordingStatus", "Not recording", "error");
            return;
        }

        this.showStatus("stopRecordingStatus", true);
        this.recording.mediaRecorder.stop();
        this.recording.isRecording = false;

        const indicator = document.getElementById("recordingIndicator");
        indicator.classList.add("hidden");
        
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }

        this.showMessage("stopRecordingStatus", "Recording saved", "success");
        this.showStatus("stopRecordingStatus", false);
    }

    // ========================================
    // DOWNLOAD & EXPORT
    // ========================================
    
    handleDownload() {
        this.showStatus("downloadStatus", true);
        
        const originalSize = { 
            width: this.renderer.domElement.width, 
            height: this.renderer.domElement.height 
        };
        
        this.renderer.setSize(3840, 2160, false);
        this.renderer.render(this.scene, this.camera);

        const imgData = this.renderer.domElement.toDataURL("image/png", 1.0);

        this.renderer.setSize(originalSize.width, originalSize.height, false);
        this.renderer.render(this.scene, this.camera);

        this.downloadFile(imgData, "gallery-4k.png");
        this.showMessage("downloadStatus", "4K image downloaded", "success");
        this.showStatus("downloadStatus", false);
    }

    downloadFile(data, filename) {
        const link = document.createElement("a");
        link.href = data;
        link.download = filename;
        link.click();
    }

    // ========================================
    // UI HELPERS
    // ========================================
    
    showStatus(statusId, show) {
        const el = document.getElementById(statusId);
        if (el) {
            el.classList.toggle("hidden", !show);
            if (show) {
                el.classList.remove("success", "error");
                el.classList.add("loading");
                el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            } else {
                el.classList.remove("loading");
            }
        }
    }

    showMessage(statusId, message, type) {
        const el = document.getElementById(statusId);
        if (el) {
            el.classList.remove("hidden", "loading");
            el.classList.add(type === "success" ? "success" : "error");
            el.innerHTML = type === "success" 
                ? '<i class="fas fa-check"></i>' 
                : '<i class="fas fa-exclamation-triangle"></i>';
            el.setAttribute("data-tooltip", message);
            
            setTimeout(() => {
                el.classList.add("hidden");
                el.removeAttribute("data-tooltip");
                el.classList.remove("success", "error");
            }, 3000);
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        console.log("🔧 Setting up event listeners...");
        
        // Download & Export
        document.getElementById("downloadBtn")?.addEventListener("click", () => this.handleDownload());
        
        // Controls
        document.getElementById("zoomSlider")?.addEventListener("input", () => this.handleZoom());
        document.getElementById("radiusSlider")?.addEventListener("input", () => this.handleRadius());
        document.getElementById("toggleRotateBtn")?.addEventListener("click", () => this.toggleRotate());
        document.getElementById("toggleViewBtn")?.addEventListener("click", () => this.toggleViewMode());
        document.getElementById("toggleControlsBtn")?.addEventListener("click", () => this.toggleControls());
        
        // Image Management
        document.getElementById("shuffleBtn")?.addEventListener("click", () => this.shuffleImages());
        document.getElementById("prevPage")?.addEventListener("click", () => this.rotateScene(-Math.PI / 8));
        document.getElementById("nextPage")?.addEventListener("click", () => this.rotateScene(Math.PI / 8));
        
        // Remove Mode
        document.getElementById("toggleRemoveBtn")?.addEventListener("click", () => this.toggleRemove());
        document.getElementById("removeBtn")?.addEventListener("click", () => this.removeSelectedImage());
        document.getElementById("removeAllBtn")?.addEventListener("click", () => this.removeAllImages());
        
        // Upload & Capture
        document.getElementById("screenshotForm")?.addEventListener("submit", (e) => this.handleScreenshotSubmit(e));
        document.getElementById("uploadForm")?.addEventListener("submit", (e) => this.handleUploadSubmit(e));
        document.getElementById("images")?.addEventListener("change", (e) => this.showImagePreviews(e));
        document.getElementById("envMapInput")?.addEventListener("change", (e) => this.handleEnvMapUpload(e));
        
        // Recording
        document.getElementById("startRecordingBtn")?.addEventListener("click", () => this.startRecording());
        document.getElementById("stopRecordingBtn")?.addEventListener("click", () => this.stopRecording());
        
        // NEW FEATURES EVENT LISTENERS
        
        // Bookmark controls
        const saveBookmarkBtn = document.getElementById("saveBookmarkBtn");
        if (saveBookmarkBtn) {
            saveBookmarkBtn.addEventListener("click", () => this.saveBookmark());
            console.log("✅ Bookmark button connected");
        }
        
        // Share controls
        const shareBtn = document.getElementById("shareBtn");
        if (shareBtn) {
            shareBtn.addEventListener("click", () => this.generateShareLink());
            console.log("✅ Share button connected");
        }
        
        const exportBtn = document.getElementById("exportBtn");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportAsJSON());
            console.log("✅ Export button connected");
        }
        
        // Theme controls
        const themeSelector = document.getElementById("themeSelector");
        if (themeSelector) {
            themeSelector.addEventListener("change", (e) => this.applyTheme(e.target.value));
            console.log("✅ Theme selector connected");
        }
        
        // Filter controls
        const filterSelector = document.getElementById("filterSelector");
        if (filterSelector) {
            filterSelector.addEventListener("change", (e) => this.applyImageFilter(e.target.value));
            console.log("✅ Filter selector connected");
        }
        
        // Slideshow control
        const slideshowBtn = document.getElementById("slideshowBtn");
        if (slideshowBtn) {
            slideshowBtn.addEventListener("click", () => {
                if (this.slideshow.active) {
                    this.stopSlideshow();
                    slideshowBtn.innerHTML = '<i class="fas fa-play"></i> Slideshow';
                } else {
                    this.startSlideshow();
                    slideshowBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                }
            });
            console.log("✅ Slideshow button connected");
        }
        
        // Canvas Interactions
        this.renderer.domElement.addEventListener("click", (e) => this.onCanvasClick(e));
        this.renderer.domElement.addEventListener("dblclick", (e) => this.onDoubleClick(e));
        this.renderer.domElement.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener("touchstart", (e) => this.onTouchStart(e));
        this.renderer.domElement.addEventListener("touchmove", (e) => this.onTouchMove(e));
        
        console.log("✅ All event listeners connected!");
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize
const gallery = new ImmersiveGallery();
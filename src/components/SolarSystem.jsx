import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default function SolarSystem({onBack}) {
    const mountRef = useRef(null);
    const [globalSpeed, setGlobalSpeed] = useState(0.5);
    const animationRef = useRef(null);
    const isPlayingRef = useRef(true);
    const [playButtonText, setPlayButtonText] = useState('⏸️ Pause');
    const [hoveredPlanet, setHoveredPlanet] = useState(null);
    const [planetInfo, setPlanetInfo] = useState(null);

    const anglesRef = useRef({
        mercury: 0, venus: 0, earth: 0, mars: 0,
        jupiter: 0, saturn: 0, uranus: 0, neptune: 0
    });

    const moonAnglesRef = useRef({}); // ✅ FEHLTE - JETZT HINZUGEFÜGT
    const asteroidsRef = useRef([]);
    const asteroidAnglesRef = useRef([]);
    const setRealLifePositionsRef = useRef(null);
    const autoRotateRef = useRef({ active: false, planetMesh: null, startTime: 0 });
    const moonsRef = useRef([]);

    const planetData = {
        // ... (deine planetData bleibt gleich)
        mercury: {
            name: "Merkur",
            facts: [
                "Kleinster Planet im Sonnensystem",
                "Ein Tag dauert 176 Erdentage",
                "Keine Atmosphäre",
                "Temperatur: -173°C bis 427°C"
            ]
        },
        venus: {
            name: "Venus",
            facts: [
                "Heißester Planet (462°C)",
                "Dreht sich rückwärts",
                "Dicke Wolkendecke aus Schwefelsäure",
                "Ein Venustag länger als ein Venusjahr"
            ]
        },
        earth: {
            name: "Erde",
            facts: [
                "Einziger Planet mit Leben",
                "71% mit Wasser bedeckt",
                "Dichte Atmosphäre aus Stickstoff und Sauerstoff",
                "Mond: Luna"
            ]
        },
        mars: {
            name: "Mars",
            facts: [
                "Roter Planet durch Eisenoxid",
                "Höchster Vulkan: Olympus Mons",
                "2 Monde: Phobos und Deimos",
                "Tage nur 40 Minuten länger als auf der Erde"
            ]
        },
        jupiter: {
            name: "Jupiter",
            facts: [
                "Größter Planet im Sonnensystem",
                "Großer Roter Fleck (Sturm)",
                "Mindestens 79 Monde",
                "Gasriese ohne feste Oberfläche"
            ]
        },
        saturn: {
            name: "Saturn",
            facts: [
                "Berühmt für seine Ringe",
                "Dichte niedriger als Wasser",
                "62 bekannte Monde",
                "Windgeschwindigkeiten bis 1800 km/h"
            ]
        },
        uranus: {
            name: "Uranus",
            facts: [
                "Rotiert auf der Seite",
                "Eisriese",
                "13 schwache Ringe",
                "Erde würde 63x hineinpassen"
            ]
        },
        neptune: {
            name: "Neptun",
            facts: [
                "Windigster Planet (2100 km/h)",
                "Erster durch Berechnung entdeckter Planet",
                "14 Monde",
                "Braucht 165 Jahre für eine Sonnenumrundung"
            ]
        }
    };

    const orbitalPeriods = {
        mercury: 88, venus: 225, earth: 365, mars: 687,
        jupiter: 4333, saturn: 10759, uranus: 30687, neptune: 60190
    };

    const moonData = {
        earth: [
            { name: "Mond", distance: 1.2, size: 0.15, speed: 0.05, color: 0x888888 }
        ],
        mars: [
            { name: "Phobos", distance: 0.8, size: 0.05, speed: 0.1, color: 0x996633 },
            { name: "Deimos", distance: 1.2, size: 0.04, speed: 0.08, color: 0x664422 }
        ],
        jupiter: [
            { name: "Io", distance: 2.0, size: 0.12, speed: 0.15, color: 0xffaa66 },
            { name: "Europa", distance: 2.5, size: 0.1, speed: 0.12, color: 0xffffff },
            { name: "Ganymed", distance: 3.2, size: 0.18, speed: 0.08, color: 0xcccccc },
            { name: "Callisto", distance: 4.0, size: 0.16, speed: 0.06, color: 0x999999 }
        ],
        saturn: [
            { name: "Mimas", distance: 1.8, size: 0.06, speed: 0.2, color: 0xcccccc },
            { name: "Enceladus", distance: 2.2, size: 0.07, speed: 0.18, color: 0xffffff },
            { name: "Titan", distance: 3.5, size: 0.2, speed: 0.1, color: 0xffcc99 },
            { name: "Iapetus", distance: 4.5, size: 0.1, speed: 0.05, color: 0x666666 }
        ],
        uranus: [
            { name: "Titania", distance: 2.0, size: 0.12, speed: 0.08, color: 0xccccff },
            { name: "Oberon", distance: 2.5, size: 0.11, speed: 0.07, color: 0xaaaadd }
        ],
        neptune: [
            { name: "Triton", distance: 2.2, size: 0.15, speed: 0.09, color: 0x66ccff },
            { name: "Nereid", distance: 3.5, size: 0.08, speed: 0.04, color: 0x88aaff }
        ]
    };

    const togglePlayPause = () => {
        isPlayingRef.current = !isPlayingRef.current;
        setPlayButtonText(isPlayingRef.current ? '⏸️ Pause' : '▶️ Play');
    };

    const createMoon = (planet, moonConfig, planetName) => {
        const geometry = new THREE.SphereGeometry(moonConfig.size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: moonConfig.color,
            roughness: 0.9,
            metalness: 0.1
        });

        const moon = new THREE.Mesh(geometry, material);
        moon.position.x = moonConfig.distance;

        planet.add(moon);

        // ✅ KORRIGIERT: planetName statt planet verwenden
        const moonId = `${planetName}-${moonConfig.name}`;
        moonAnglesRef.current[moonId] = Math.random() * Math.PI * 2;

        moonsRef.current.push({
            mesh: moon,
            planet: planet,
            distance: moonConfig.distance,
            speed: moonConfig.speed,
            id: moonId
        });
        return moon;
    };

    // moon Positions
    const updateMoonPositions = () => {
        moonsRef.current.forEach(moonData => {
            if (isPlayingRef.current) {
                moonAnglesRef.current[moonData.id] += moonData.speed * globalSpeed;
            }
            const angle = moonAnglesRef.current[moonData.id];
            moonData.mesh.position.x = moonData.distance * Math.cos(angle);
            moonData.mesh.position.z = moonData.distance * Math.sin(angle);

            // ✅ KORRIGIERT: rotation statt position für Y-Achse
            moonData.mesh.rotation.y += 0.02 * globalSpeed;
        });
    };

    // create moons
    const createMoonsForPlanet = (planet, planetName) => {
        if (moonData[planetName]) {
            // ✅ KORRIGIERT: moonData statt moonsRef verwenden
            moonData[planetName].forEach(moonConfig => {
                createMoon(planet, moonConfig, planetName);
            });
        }
    };

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);
        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (!mountRef.current) return;
        mountRef.current.appendChild(renderer.domElement);

        const textureLoader = new THREE.TextureLoader();

        // Raycaster für Mouse-Interaktion
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredPlanetMesh = null;

        function onMouseMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function onClick(event) {
            if (isPlayingRef.current) return;

            raycaster.setFromCamera(mouse, camera);
            const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
            const intersects = raycaster.intersectObjects(planets);

            if (intersects.length > 0) {
                const planetMesh = intersects[0].object;
                const planetName = getPlanetName(planetMesh);
                if (planetName) {
                    focusOnPlanet(planetMesh);
                }
            }
        }

        function onCameraControlStart() {
            if (autoRotateRef.current.active) {
                autoRotateRef.current.active = false;
            }
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        function getPlanetName(planetMesh) {
            const planets = {
                mercury: mercury,
                venus: venus,
                earth: earth,
                mars: mars,
                jupiter: jupiter,
                saturn: saturn,
                uranus: uranus,
                neptune: neptune
            };

            for (const [name, mesh] of Object.entries(planets)) {
                if (mesh === planetMesh) return name;
            }
            return null;
        }

        const focusOnPlanet = (planetMesh) => {
            if (!camera || !controls || !planetMesh) return;

            autoRotateRef.current.active = false;

            const planetPosition = new THREE.Vector3();
            planetMesh.getWorldPosition(planetPosition);

            const direction = new THREE.Vector3()
                .subVectors(camera.position, planetPosition)
                .normalize();
            const distance = Math.max(planetMesh.geometry.parameters.radius * 4, 3);
            const targetPosition = new THREE.Vector3()
                .copy(planetPosition)
                .add(direction.multiplyScalar(distance));

            const startPosition = camera.position.clone();
            const startControlsTarget = controls.target.clone();
            const startTime = performance.now();
            const duration = 1000;

            const animateCameraToPlanet = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);

                camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                controls.target.lerpVectors(startControlsTarget, planetPosition, easeProgress);

                if (progress < 1) {
                    requestAnimationFrame(animateCameraToPlanet);
                } else {
                    autoRotateRef.current = {
                        active: true,
                        planetMesh: planetMesh,
                        planetPosition: planetPosition.clone(),
                        startTime: performance.now(),
                        initialCameraPosition: camera.position.clone(),
                        initialDistance: camera.position.distanceTo(planetPosition)
                    };
                }
            };

            requestAnimationFrame(animateCameraToPlanet);
        };

        const updateAutoRotation = () => {
            if (!autoRotateRef.current.active || !autoRotateRef.current.planetMesh) return;

            const autoRotate = autoRotateRef.current;
            const currentTime = performance.now();
            const elapsedTime = (currentTime - autoRotate.startTime) * 0.005;

            const currentPlanetPosition = new THREE.Vector3();
            autoRotate.planetMesh.getWorldPosition(currentPlanetPosition);

            const rotationSpeed = 0.1;
            const angle = elapsedTime * rotationSpeed;

            const distance = autoRotate.initialDistance;
            const newPosition = new THREE.Vector3(
                Math.cos(angle) * distance,
                autoRotate.initialCameraPosition.y * 0.7,
                Math.sin(angle) * distance
            ).add(currentPlanetPosition);

            camera.position.lerp(newPosition, 0.05);
            controls.target.copy(currentPlanetPosition);
        };

        function checkHover() {
            if (isPlayingRef.current) {
                if (hoveredPlanetMesh) {
                    hoveredPlanetMesh.scale.set(1, 1, 1);
                    hoveredPlanetMesh = null;
                }
                setHoveredPlanet(null);
                setPlanetInfo(null);
                return;
            }

            raycaster.setFromCamera(mouse, camera);
            const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
            const intersects = raycaster.intersectObjects(planets);

            if (intersects.length > 0) {
                const planetMesh = intersects[0].object;
                const planetName = getPlanetName(planetMesh);

                if (planetName && planetName !== hoveredPlanet) {
                    setHoveredPlanet(planetName);
                    setPlanetInfo(planetData[planetName]);

                    if (hoveredPlanetMesh && hoveredPlanetMesh !== planetMesh) {
                        hoveredPlanetMesh.scale.set(1, 1, 1);
                    }

                    planetMesh.scale.set(1.1, 1.1, 1.1);
                    hoveredPlanetMesh = planetMesh;
                }
            } else {
                if (hoveredPlanetMesh) {
                    hoveredPlanetMesh.scale.set(1, 1, 1);
                    hoveredPlanetMesh = null;
                }
                setHoveredPlanet(null);
                setPlanetInfo(null);
            }
        }

        function createStars() {
            const starsGeometry = new THREE.BufferGeometry();
            const starsCount = 10000;
            const positions = new Float32Array(starsCount * 3);
            const colors = new Float32Array(starsCount * 3);

            for (let i = 0; i < starsCount * 3; i += 3) {
                const radius = 30 + Math.random() * 500;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);

                positions[i] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = radius * Math.cos(phi);

                const starType = Math.random();
                if (starType < 0.75) {
                    colors[i] = 1.2; colors[i + 1] = 1.1; colors[i + 2] = 0.9;
                } else if (starType < 0.90) {
                    colors[i] = 1.3; colors[i + 1] = 0.9; colors[i + 2] = 0.5;
                } else if (starType < 0.98) {
                    colors[i] = 0.6; colors[i + 1] = 0.7; colors[i + 2] = 1.3;
                } else {
                    colors[i] = 1.3; colors[i + 1] = 0.5; colors[i + 2] = 0.5;
                }
            }
            starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const starsMaterial = new THREE.PointsMaterial({
                size: 0.4, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 1,
            });
            const stars = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(stars);
            return stars;
        }
        const stars = createStars();

        scene.fog = new THREE.FogExp2(0x000011, 0.0010);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.addEventListener('start', onCameraControlStart);

        // 🌞 SONNE
        function createSunWithRealLight() {
            const sunGeometry = new THREE.SphereGeometry(1, 64, 64);

            const sunMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    lightIntensity: { value: 3.0 }
                },
                vertexShader: `
                    varying vec3 vWorldPosition;
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform float lightIntensity;
                    varying vec3 vWorldPosition;
                    varying vec3 vNormal;
                    void main() {
                        vec3 coreColor = vec3(1.0, 0.8, 0.3);
                        float turbulence = sin(vWorldPosition.x * 10.0 + time) * 
                                         sin(vWorldPosition.y * 8.0 + time * 1.2) * 
                                         sin(vWorldPosition.z * 12.0 + time * 0.8) * 0.1;
                        float pulse = sin(time * 2.0) * 0.1 + 0.9;
                        vec3 finalColor = coreColor * (1.0 + turbulence) * pulse * lightIntensity;
                        gl_FragColor = vec4(finalColor, 1.0);
                    }
                `
            });

            const sun = new THREE.Mesh(sunGeometry, sunMaterial);
            scene.add(sun);
            return { sun, material: sunMaterial };
        }

        const { sun, material: sunShaderMaterial } = createSunWithRealLight();

        sun.castShadow = false;
        sun.receiveShadow = false;

        // 💡 LIGHTING
        function setupPhysicalLighting() {
            const sunLight = new THREE.PointLight(0xffdd88, 4.0, 200);
            sunLight.position.set(0, 0, 0);
            sunLight.decay = 2;

            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 1024;
            sunLight.shadow.mapSize.height = 1024;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 200;
            sunLight.shadow.radius = 2;

            scene.add(sunLight);
            return sunLight;
        }

        const sunLight = setupPhysicalLighting();

        // 🪐 PLANETEN
        function createPBRPlanet(size, texturePath, distance, metalness = 0.1, roughness = 0.8, castShadow = false) {
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            let material;

            if (texturePath) {
                const texture = textureLoader.load(texturePath);
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: roughness,
                    metalness: metalness
                });
            } else {
                material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: roughness,
                    metalness: metalness
                });
            }

            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = distance;

            planet.castShadow = castShadow;
            planet.receiveShadow = true;

            scene.add(planet);
            return planet;
        }

        // Planeten erstellen
        const mercury = createPBRPlanet(0.3, 'mercury.jpg', 4, 0.1, 0.9, false);
        const venus = createPBRPlanet(0.4, 'venus.jpg', 6, 0.1, 0.7, false);
        const earth = createPBRPlanet(0.6, 'earth_texture.jpg', 8, 0.3, 0.7, false);
        const mars = createPBRPlanet(0.4, 'mars.jpg', 10, 0.1, 0.9, false);
        const jupiter = createPBRPlanet(1.2, 'jupiter.jpg', 14, 0.2, 0.8, true);
        const saturn = createPBRPlanet(1.0, 'saturn.jpg', 18, 0.2, 0.7, true);
        const uranus = createPBRPlanet(0.8, 'uranus.jpg', 22, 0.3, 0.6, false);
        const neptune = createPBRPlanet(0.8, 'neptun.jpg', 26, 0.3, 0.6, false);

        // ✅ MONDE ERSTELLEN (nachdem alle Planeten erstellt sind)
        createMoonsForPlanet(earth, 'earth');
        createMoonsForPlanet(mars, 'mars');
        createMoonsForPlanet(jupiter, 'jupiter');
        createMoonsForPlanet(saturn, 'saturn');
        createMoonsForPlanet(uranus, 'uranus');
        createMoonsForPlanet(neptune, 'neptune');

        // Asteroidengürtel
        function createAsteroidBelt() {
            const asteroidCount = 200;
            asteroidsRef.current = [];
            asteroidAnglesRef.current = [];

            for (let i = 0; i < asteroidCount; i++) {
                const size = Math.random() * 0.05 + 0.01;
                const distance = 11 + Math.random() * 2;
                const angle = Math.random() * Math.PI * 2;
                const height = (Math.random() - 0.5) * 0.5;

                const geometry = new THREE.SphereGeometry(size, 8, 8);
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(
                        Math.random() * 0.1 + 0.05,
                        Math.random() * 0.6 + 0.3,
                        Math.random() * 0.5 + 0.3
                    ),
                    roughness: 0.9,
                    metalness: 0.1
                });

                const asteroid = new THREE.Mesh(geometry, material);
                asteroid.position.x = distance * Math.cos(angle);
                asteroid.position.z = distance * Math.sin(angle);
                asteroid.position.y = height;

                asteroid.castShadow = false;
                asteroid.receiveShadow = true;

                scene.add(asteroid);
                asteroidsRef.current.push(asteroid);
                asteroidAnglesRef.current.push({
                    angle: angle,
                    distance: distance,
                    height: height,
                    speed: Math.random() * 0.005 + 0.002
                });
            }
        }
        createAsteroidBelt();

        // Saturn Ring
        const saturnRingGeometry = new THREE.RingGeometry(1.3, 2.0, 64);
        const saturnRingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd99,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
        saturnRing.rotation.x = Math.PI / 2;
        saturnRing.castShadow = false;
        saturn.add(saturnRing);

        // 🎯 LICHTBERECHNUNG
        function updatePlanetLighting() {
            const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];

            planets.forEach(planet => {
                const distanceToSun = planet.position.length();
                const lightIntensity = Math.max(0, 1.0 - (distanceToSun / 50));

                if (planet.material) {
                    planet.material.emissive = new THREE.Color(0x000000);
                    planet.material.emissiveIntensity = lightIntensity * 0.2;
                }
            });
        }

        const updatePlanetPositions = () => {
            const angles = anglesRef.current;
            mercury.position.x = 4 * Math.cos(angles.mercury);
            mercury.position.z = 4 * Math.sin(angles.mercury);
            venus.position.x = 6 * Math.cos(angles.venus);
            venus.position.z = 6 * Math.sin(angles.venus);
            earth.position.x = 8 * Math.cos(angles.earth);
            earth.position.z = 8 * Math.sin(angles.earth);
            mars.position.x = 10 * Math.cos(angles.mars);
            mars.position.z = 10 * Math.sin(angles.mars);
            jupiter.position.x = 14 * Math.cos(angles.jupiter);
            jupiter.position.z = 14 * Math.sin(angles.jupiter);
            saturn.position.x = 18 * Math.cos(angles.saturn);
            saturn.position.z = 18 * Math.sin(angles.saturn);
            uranus.position.x = 22 * Math.cos(angles.uranus);
            uranus.position.z = 22 * Math.sin(angles.uranus);
            neptune.position.x = 26 * Math.cos(angles.neptune);
            neptune.position.z = 26 * Math.sin(angles.neptune);
        };

        const updateAsteroidPositions = () => {
            const asteroids = asteroidsRef.current;
            const asteroidAngles = asteroidAnglesRef.current;

            for (let i = 0; i < asteroids.length; i++) {
                const asteroid = asteroids[i];
                const asteroidData = asteroidAngles[i];

                if (isPlayingRef.current) {
                    asteroidData.angle += asteroidData.speed * globalSpeed;
                }

                asteroid.position.x = asteroidData.distance * Math.cos(asteroidData.angle);
                asteroid.position.z = asteroidData.distance * Math.sin(asteroidData.angle);
                asteroid.rotation.y += 0.01 * globalSpeed;
                asteroid.rotation.x += 0.005 * globalSpeed;
            }
        };

        const setRealLifePositions = () => {
            const today = new Date();
            const daysSinceEpoch = (today - new Date(2000, 0, 1)) / (1000 * 60 * 60 * 24);

            anglesRef.current.mercury = (daysSinceEpoch / orbitalPeriods.mercury) * Math.PI * 2;
            anglesRef.current.venus = (daysSinceEpoch / orbitalPeriods.venus) * Math.PI * 2;
            anglesRef.current.earth = (daysSinceEpoch / orbitalPeriods.earth) * Math.PI * 2;
            anglesRef.current.mars = (daysSinceEpoch / orbitalPeriods.mars) * Math.PI * 2;
            anglesRef.current.jupiter = (daysSinceEpoch / orbitalPeriods.jupiter) * Math.PI * 2;
            anglesRef.current.saturn = (daysSinceEpoch / orbitalPeriods.saturn) * Math.PI * 2;
            anglesRef.current.uranus = (daysSinceEpoch / orbitalPeriods.uranus) * Math.PI * 2;
            anglesRef.current.neptune = (daysSinceEpoch / orbitalPeriods.neptune) * Math.PI * 2;

            updatePlanetPositions();
        };

        setRealLifePositionsRef.current = setRealLifePositions;

        // ANIMATION LOOP
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);

            checkHover();
            updateAutoRotation();

            if (isPlayingRef.current) {
                sun.rotation.y += 0.01 * globalSpeed;

                if (sunShaderMaterial) {
                    sunShaderMaterial.uniforms.time.value = performance.now() * 0.001;
                }

                anglesRef.current.mercury += 0.03 * globalSpeed;
                anglesRef.current.venus += 0.02 * globalSpeed;
                anglesRef.current.earth += 0.015 * globalSpeed;
                anglesRef.current.mars += 0.012 * globalSpeed;
                anglesRef.current.jupiter += 0.008 * globalSpeed;
                anglesRef.current.saturn += 0.006 * globalSpeed;
                anglesRef.current.uranus += 0.004 * globalSpeed;
                anglesRef.current.neptune += 0.003 * globalSpeed;

                updatePlanetPositions();
                updatePlanetLighting();
                saturnRing.rotation.y += 0.01 * globalSpeed;

                // ✅ MONDE AKTUALISIEREN
                updateMoonPositions();
            }

            updateAsteroidPositions();
            stars.rotation.y += 0.00002 * globalSpeed;
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            controls.removeEventListener('start', onCameraControlStart);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [globalSpeed]);

    return (
        <div className="relative w-full h-screen">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-4">
                <div className="bg-black/70 backdrop-blur-md p-4 rounded-lg border border-gray-600 min-w-64">
                    <div className="flex flex-col gap-3 text-white">
                        <h3 className="font-bold text-lg mb-2">🚀 Steuerung</h3>

                        <button
                            className={`px-4 py-2 rounded font-medium ${
                                playButtonText === '⏸️ Pause' ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                            }`}
                            onClick={togglePlayPause}
                        >
                            {playButtonText}
                        </button>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm">Geschwindigkeit: {globalSpeed.toFixed(1)}x</label>
                            <input
                                type="range"
                                min="0.1"
                                max="10"
                                step="0.1"
                                value={globalSpeed}
                                onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <button
                            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 font-medium"
                            onClick={() => setRealLifePositionsRef.current?.()}
                        >
                            📅 Echte Positionen
                        </button>

                        <div className="flex gap-2">
                            <button className="flex-1 px-2 py-1 bg-blue-600 rounded hover:bg-blue-500 text-sm"
                                    onClick={() => setGlobalSpeed(0.1)}>0.1x</button>
                            <button className="flex-1 px-2 py-1 bg-blue-600 rounded hover:bg-blue-500 text-sm"
                                    onClick={() => setGlobalSpeed(1)}>1x</button>
                            <button className="flex-1 px-2 py-1 bg-blue-600 rounded hover:bg-blue-500 text-sm"
                                    onClick={() => setGlobalSpeed(5)}>5x</button>
                        </div>

                        {/* Info Box */}
                        {planetInfo && !isPlayingRef.current && (
                            <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                                <h4 className="font-bold text-lg mb-2 text-yellow-400">{planetInfo.name}</h4>
                                <ul className="text-sm space-y-1">
                                    {planetInfo.facts.map((fact, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="text-yellow-400 mr-2">•</span>
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500 text-white font-medium w-fit"
                    onClick={onBack}
                >
                    ⬅ Back
                </button>
            </div>

            {/* Hover Indicator */}
            {hoveredPlanet && !isPlayingRef.current && (
                <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-md p-3 rounded-lg border border-gray-600">
                    <p className="text-white text-sm">
                        <span className="text-yellow-400">{planetData[hoveredPlanet].name}</span> - Klicken zum Fokussieren
                    </p>
                </div>
            )}

            <div ref={mountRef} className="w-full h-screen" />
        </div>
    );
}
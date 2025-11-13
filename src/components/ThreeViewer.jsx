import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, TransformControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';
import * as THREE from 'three';

function EditableModel({ file, mode, orbitControlsRef }) {
    const ref = useRef();
    const transformControlsRef = useRef();
    const [object, setObject] = useState(null);
    const [isCommandPressed, setIsCommandPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.metaKey || event.ctrlKey) { // Command (Mac) oder Ctrl (Windows)
                setIsCommandPressed(true);
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enabled = true;
                }
            }
        };
        const handleKeyUp = (event) => {
            if (event.metaKey || event.ctrlKey) {
                setIsCommandPressed(false);
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enabled = false;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [orbitControlsRef]);

    useEffect(() => {
        if (!transformControlsRef.current || !orbitControlsRef.current) return;

        const transformControls = transformControlsRef.current;
        const orbitControls = orbitControlsRef.current;

        const onMouseDown = () => {
            if ( !isCommandPressed) {
                orbitControls.enabled = false;
            }

        };

        const onMouseUp = () => {
            if ( !isCommandPressed) {
                orbitControls.enabled = true;
            }
        };

        transformControls.addEventListener('mouseDown', onMouseDown);
        transformControls.addEventListener('mouseUp', onMouseUp);

        return () => {
            transformControls.removeEventListener('mouseDown', onMouseDown);
            transformControls.removeEventListener('mouseUp', onMouseUp);
        };
    }, [orbitControlsRef, isCommandPressed]);

    useEffect(() => {
        if (!file) return;

        const extension = file.name.split('.').pop().toLowerCase();
        const url = URL.createObjectURL(file);

        const loadModel = async () => {
            let loader;
            let obj;

            if (extension === 'glb' || extension === 'gltf') {
                loader = new GLTFLoader();
                const gltf = await loader.loadAsync(url);
                obj = gltf.scene;
            } else if (extension === 'stl') {
                loader = new STLLoader();
                const geometry = await loader.loadAsync(url);
                const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
                obj = new THREE.Mesh(geometry, material);
            } else if (extension === '3mf') {
                loader = new ThreeMFLoader();
                obj = await loader.loadAsync(url);
            } else {
                console.warn('Unsupported file type:', extension);
                return;
            }

            obj.position.set(0, 0, 0);
            setObject(obj);
        };

        loadModel();
    }, [file]);

    if (!object) return null;

    return (
        <TransformControls ref={transformControlsRef} object={ref.current} mode={mode}>
            <primitive ref={ref} object={object} />
        </TransformControls>
    );
}

export default function ThreeViewer({ onBack }) {
    const [file, setFile] = useState(null);
    const [mode, setMode] = useState('translate');
    const orbitControlsRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) setFile(f);
    };

    return (
        <div className="fixed inset-0 z-10 bg-black text-white font-orbitron">
            {/* UI-Toolbar */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button onClick={onBack} className="bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500">⬅ Zurück</button>
                <input
                    type="file"
                    accept=".glb,.gltf,.stl,.3mf"
                    onChange={handleFile}
                    className="bg-gray-800 px-3 py-2 rounded border border-cyan-500"
                />
                <div className="flex gap-2">
                    <button onClick={() => setMode('translate')} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-500">🧲 Move</button>
                    <button onClick={() => setMode('rotate')} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-500">🔁 Rotate</button>
                    <button onClick={() => setMode('scale')} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-500">↔️ Scale</button>
                </div>
            </div>

            {/* 3D-Canvas */}
            <Canvas camera={{ position: [3, 3, 3], fov: 60 }} className="w-full h-full absolute top-0 left-0">
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <OrbitControls
                    ref={orbitControlsRef}
                    makeDefault
                    enabled={true} //  WICHTIG: Deaktiviere OrbitControls wenn ein Objekt geladen ist
                />
                <Environment preset="city" />
                <gridHelper args={[100,100]} />
                <Suspense fallback={null}>
                    {file && (
                        <EditableModel
                            file={file}
                            mode={mode}
                            orbitControlsRef={orbitControlsRef} // 🔥 NEU: Ref übergeben
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    );
}
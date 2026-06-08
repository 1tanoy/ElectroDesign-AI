/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeDModelProps {
  categoryId: string;
  equipmentId: string;
  dimensions: Record<string, number>;
  activeTab?: string;
}

export default function ThreeDModel({ categoryId, equipmentId, dimensions, activeTab }: ThreeDModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exploded, setExploded] = useState<number>(0); // 0 (normal) to 1 (fully exploded)
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [interactiveMode, setInteractiveMode] = useState<'rotate' | 'pan'>('rotate');

  // Refs to allow dynamic slider updates to the interactive meshes without full scene rebuilds
  const meshesRef = useRef<{
    core?: THREE.Group;
    windingL?: THREE.Mesh | THREE.Group;
    windingR?: THREE.Mesh | THREE.Group;
    windingC?: THREE.Mesh | THREE.Group;
    shaftAndRotor?: THREE.Group;
    statorHousing?: THREE.Group;
  }>({});

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // beautiful off-white matching Slate theme

    // Set up transparent wireframe-grid ground representing a workspace test bench
    const gridHelper = new THREE.GridHelper(250, 25, 0x6366f1, 0xcbd5e1);
    gridHelper.position.y = -60;
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(120, 80, 150);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Lights Layout
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(150, 200, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.4); // soft purple secondary highlighting
    dirLight2.position.set(-150, -100, -100);
    scene.add(dirLight2);

    // 3. Create Model Geometry depending on category
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Charcoal grey CRGO steel laminate coloring
      roughness: 0.5,
      metalness: 0.8,
    });

    const copperMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Rich golden-bronze amber copper
      roughness: 0.2,
      metalness: 0.9,
    });

    const steelShinyMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // bright steel
      roughness: 0.1,
      metalness: 0.95,
    });

    const darkHousingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // deep navy enclosure casing
      roughness: 0.6,
      metalness: 0.3,
    });

    // Mesh building logic
    if (categoryId === 'transformers') {
      // Create Core Frame Group
      const coreGroup = new THREE.Group();
      
      // Left Limb
      const limbGeo = new THREE.BoxGeometry(16, 80, 16);
      const limbL = new THREE.Mesh(limbGeo, coreMaterial);
      limbL.position.x = -40;
      coreGroup.add(limbL);

      // Right Limb
      const limbR = limbL.clone();
      limbR.position.x = 40;
      coreGroup.add(limbR);

      // Middle Limb
      const limbC = limbL.clone();
      limbC.position.x = 0;
      coreGroup.add(limbC);

      // Top Yoke
      const yokeGeo = new THREE.BoxGeometry(100, 16, 16);
      const yokeTop = new THREE.Mesh(yokeGeo, coreMaterial);
      yokeTop.position.y = 48;
      coreGroup.add(yokeTop);

      // Bottom Yoke
      const yokeBottom = yokeTop.clone();
      yokeBottom.position.y = -48;
      coreGroup.add(yokeBottom);

      modelGroup.add(coreGroup);
      meshesRef.current.core = coreGroup;

      // Create primary/secondary windings meshes
      const coilGroupL = new THREE.Group();
      const coilLGeo = new THREE.CylinderGeometry(15, 15, 60, 24);
      const coilL = new THREE.Mesh(coilLGeo, copperMaterial);
      coilGroupL.add(coilL);
      modelGroup.add(coilGroupL);
      meshesRef.current.windingL = coilGroupL;

      const coilGroupR = new THREE.Group();
      const coilRGeo = new THREE.CylinderGeometry(15, 15, 60, 24);
      const coilR = new THREE.Mesh(coilRGeo, copperMaterial);
      coilGroupR.add(coilR);
      modelGroup.add(coilGroupR);
      meshesRef.current.windingR = coilGroupR;

      const coilGroupC = new THREE.Group();
      const coilCGeo = new THREE.CylinderGeometry(16.5, 16.5, 56, 24);
      const coilC = new THREE.Mesh(coilCGeo, copperMaterial);
      coilGroupC.add(coilC);
      modelGroup.add(coilGroupC);
      meshesRef.current.windingC = coilGroupC;

    } else if (categoryId === 'ac_machines' || categoryId === 'modern_motors' || categoryId === 'dc_machines') {
      // Rotating Shaft & Rotor Core
      const rotorGroup = new THREE.Group();
      
      const shaftGeo = new THREE.CylinderGeometry(5, 5, 120, 16);
      shaftGeo.rotateX(Math.PI / 2);
      const shaft = new THREE.Mesh(shaftGeo, steelShinyMaterial);
      rotorGroup.add(shaft);

      const rotorGeo = new THREE.CylinderGeometry(20, 20, 70, 32);
      rotorGeo.rotateX(Math.PI / 2);
      const rotorCore = new THREE.Mesh(rotorGeo, coreMaterial);
      rotorGroup.add(rotorCore);

      // Core skew bar ribs on rotor for induction/synchronous
      const barsGroup = new THREE.Group();
      for (let i = 0; i < 12; i++) {
        const phi = (i / 12) * Math.PI * 2;
        const barGeo = new THREE.CylinderGeometry(1.2, 1.2, 70, 8);
        barGeo.rotateX(Math.PI / 2);
        const bar = new THREE.Mesh(barGeo, copperMaterial);
        bar.position.set(Math.cos(phi) * 19.5, Math.sin(phi) * 19.5, 0);
        barsGroup.add(bar);
      }
      rotorGroup.add(barsGroup);
      modelGroup.add(rotorGroup);
      meshesRef.current.shaftAndRotor = rotorGroup;

      // Outer Stator with cooling fins frame
      const statorGroup = new THREE.Group();
      
      const frameGeo = new THREE.CylinderGeometry(35, 35, 76, 24, 1, true); // hollow cylinder
      frameGeo.rotateX(Math.PI / 2);
      const statorCasing = new THREE.Mesh(frameGeo, darkHousingMaterial);
      statorGroup.add(statorCasing);

      // Outer fins
      for (let i = 0; i < 16; i++) {
        const theta = (i / 16) * Math.PI * 2;
        const finGeo = new THREE.BoxGeometry(2, 6, 76);
        const fin = new THREE.Mesh(finGeo, darkHousingMaterial);
        fin.position.set(Math.cos(theta) * 36.5, Math.sin(theta) * 36.5, 0);
        fin.rotation.z = theta;
        statorGroup.add(fin);
      }

      modelGroup.add(statorGroup);
      meshesRef.current.statorHousing = statorGroup;

    } else {
      // Power Electronics / default PCB with inductor & capacitors
      const pcbGroup = new THREE.Group();

      // Green PCB board
      const pcbGeo = new THREE.BoxGeometry(100, 3, 80);
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.9, metalness: 0.1 });
      const pcb = new THREE.Mesh(pcbGeo, pcbMat);
      pcb.position.y = -10;
      pcbGroup.add(pcb);

      // Large toroid magnetics inductor coil
      const toroidGeo = new THREE.TorusGeometry(12, 5, 16, 40);
      toroidGeo.rotateY(Math.PI / 2);
      const inductor = new THREE.Mesh(toroidGeo, copperMaterial);
      inductor.position.set(-20, 4, -10);
      pcbGroup.add(inductor);

      // Core center of the inductor
      const tCoreGeo = new THREE.CylinderGeometry(7, 7, 10, 16);
      tCoreGeo.rotateX(Math.PI / 2);
      const tCore = new THREE.Mesh(tCoreGeo, coreMaterial);
      tCore.position.set(-20, 4, -10);
      pcbGroup.add(tCore);

      // Capacitors (cylinders)
      const capGeo = new THREE.CylinderGeometry(6, 6, 24, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const cap1 = new THREE.Mesh(capGeo, capMat);
      cap1.position.set(15, 10, -20);
      const cap2 = cap1.clone();
      cap2.position.set(15, 10, 10);
      pcbGroup.add(cap1);
      pcbGroup.add(cap2);

      // Heat sinks blocks
      const sinkGeo = new THREE.BoxGeometry(20, 14, 16);
      const sinkMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2, metalness: 0.9 });
      const sink = new THREE.Mesh(sinkGeo, sinkMat);
      sink.position.set(-15, 5, 20);
      pcbGroup.add(sink);

      modelGroup.add(pcbGroup);
    }

    // 4. Interactive custom rotation tracking
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dX = e.clientX - prevMouseX;
      const dY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (interactiveMode === 'rotate') {
        modelGroup.rotation.y += dX * 0.0075;
        modelGroup.rotation.x += dY * 0.0075;
      } else {
        camera.position.x -= dX * 0.25;
        camera.position.y += dY * 0.25;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Support wheel zoom safely
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.15;
      camera.position.z = Math.max(40, Math.min(400, camera.position.z + zoomFactor));
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    // 5. Container Resize Tracker (ResizeObserver)
    let resizeFrameId: number;
    const resizeObserver = new ResizeObserver((entries) => {
      cancelAnimationFrame(resizeFrameId);
      resizeFrameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width === 0 || height === 0) continue;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        }
      });
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 6. Animation Loop
    let animId: number;
    const tick = () => {
      if (autoRotate && !isDragging) {
        modelGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    tick();

    // Cleanups
    return () => {
      cancelAnimationFrame(animId);
      cancelAnimationFrame(resizeFrameId);
      resizeObserver.disconnect();
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [categoryId, equipmentId, autoRotate, interactiveMode]);

  // Handle Explode animation factor
  useEffect(() => {
    const meshes = meshesRef.current;
    
    // Core expansion or spacing
    if (categoryId === 'transformers') {
      const scaleSpacer = exploded * 28; // move outwards up to 28 units

      if (meshes.windingL) {
        meshes.windingL.position.x = -40 - scaleSpacer;
      }
      if (meshes.windingR) {
        meshes.windingR.position.x = 40 + scaleSpacer;
      }
      if (meshes.windingC) {
        meshes.windingC.position.y = scaleSpacer * 0.5; // slight push up for distinction
      }
    } else if (categoryId === 'ac_machines' || categoryId === 'modern_motors' || categoryId === 'dc_machines') {
      const scaleSpacer = exploded * 32; // push stator outwards
      if (meshes.statorHousing) {
        meshes.statorHousing.position.y = scaleSpacer; // lift housing casing away from shaft
      }
    }
  }, [exploded, categoryId]);

  return (
    <div className="w-full h-full flex flex-col relative" id="threejs_viewport_div">
      {/* 3D Action Toolbar */}
      <div className="absolute top-3 left-3 flex items-center space-x-2 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-slate-200">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
            autoRotate
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Toggle rotation"
          id="btn_auto_rotate"
        >
          {autoRotate ? '⏸ Pause Rotate' : '▶ Auto Rotate'}
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <button
          onClick={() => setInteractiveMode('rotate')}
          className={`p-1 rounded text-xs transition-all ${
            interactiveMode === 'rotate' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Rotate Mode"
          id="btn_mode_rotate"
        >
          🔄 Rotate
        </button>
        <button
          onClick={() => setInteractiveMode('pan')}
          className={`p-1 rounded text-xs transition-all ${
            interactiveMode === 'pan' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Pan Mode"
          id="btn_mode_pan"
        >
          ✋ Pan
        </button>
      </div>

      {/* Exploded Slider Controls */}
      <div className="absolute top-3 right-3 flex flex-col space-y-1.5 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-200 z-10 w-44">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Exploded View</span>
          <span className="font-mono text-indigo-600 text-xs">{Math.round(exploded * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className="w-full accent-indigo-600 cursor-col-resize mt-1"
          id="slider_exploded_view"
        />
        <span className="text-[9px] text-slate-400 leading-tight">
          {categoryId === 'transformers' ? 'Isolate primary & secondary windings' : 'Pull stator stator housing from shaft rotor'}
        </span>
      </div>

      {/* Main interactive WebGL output container */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative">
        <canvas ref={canvasRef} className="block w-full h-full" id="three_rendering_canvas" />
      </div>

      {/* Live Calibration Markers Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-slate-200 font-mono text-[10px] space-y-1 text-slate-500 z-10 select-none">
        <div className="flex justify-between space-x-4">
          <span>FRAME SCALE:</span>
          <span className="text-slate-800 font-bold">{dimensions?.W || 120} x {dimensions?.H || 80} x {dimensions?.D || 30} mm</span>
        </div>
        <div className="flex justify-between">
          <span>RENDER ENGINE:</span>
          <span className="text-green-600 italic font-bold">WebGL v2.0 Active</span>
        </div>
      </div>
    </div>
  );
}

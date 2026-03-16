// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import {
    Clock as ThreeClock,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    SRGBColorSpace,
    MathUtils,
    Vector2,
    Vector3,
    MeshPhysicalMaterial,
    ShaderChunk,
    Color,
    Object3D,
    InstancedMesh,
    PMREMGenerator,
    SphereGeometry,
    AmbientLight,
    PointLight,
    ACESFilmicToneMapping,
    Raycaster,
    Plane
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

class BallpitCore {
    constructor(options) {
        this.options = { ...options };
        this.setupCamera();
        this.setupScene();
        this.setupRenderer();
        this.setupListeners();
    }

    setupCamera() {
        this.camera = new PerspectiveCamera();
        this.cameraFov = this.camera.fov;
    }

    setupScene() {
        this.scene = new Scene();
    }

    setupRenderer() {
        if (this.options.canvas) {
            this.canvas = this.options.canvas;
        } else if (this.options.id) {
            this.canvas = document.getElementById(this.options.id);
        } else {
            console.error('Three: Missing canvas or id parameter');
        }
        this.canvas.style.display = 'block';
        const rendererOptions = {
            canvas: this.canvas,
            powerPreference: 'high-performance',
            ...(this.options.rendererOptions ?? {})
        };
        this.renderer = new WebGLRenderer(rendererOptions);
        this.renderer.outputColorSpace = SRGBColorSpace;
    }

    setupListeners() {
        if (!(this.options.size instanceof Object)) {
            window.addEventListener('resize', this.onResize.bind(this));
            if (this.options.size === 'parent' && this.canvas.parentNode) {
                this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
                this.resizeObserver.observe(this.canvas.parentNode);
            }
        }
        this.intersectionObserver = new IntersectionObserver(this.onIntersection.bind(this), {
            root: null,
            rootMargin: '0px',
            threshold: 0
        });
        this.intersectionObserver.observe(this.canvas);
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
    }

    cleanupListeners() {
        window.removeEventListener('resize', this.onResize.bind(this));
        this.resizeObserver?.disconnect();
        this.intersectionObserver?.disconnect();
        document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this));
    }

    onIntersection(entries) {
        this.isVisible = entries[0].isIntersecting;
        this.isVisible ? this.start() : this.stop();
    }

    onVisibilityChange() {
        if (this.isVisible) {
            document.hidden ? this.stop() : this.start();
        }
    }

    onResize() {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(this.resize.bind(this), 100);
    }

    resize() {
        let width, height;
        if (this.options.size instanceof Object) {
            width = this.options.size.width;
            height = this.options.size.height;
        } else if (this.options.size === 'parent' && this.canvas.parentNode) {
            width = this.canvas.parentNode.offsetWidth;
            height = this.canvas.parentNode.offsetHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }
        this.size = { width, height, ratio: width / height };
        this.updateCamera();
        this.updateRenderer();
        if (this.onAfterResize) this.onAfterResize(this.size);
    }

    updateCamera() {
        this.camera.aspect = this.size.width / this.size.height;
        if (this.camera.isPerspectiveCamera && this.cameraFov) {
            if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
                this.adjustFov(this.cameraMinAspect);
            } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
                this.adjustFov(this.cameraMaxAspect);
            } else {
                this.camera.fov = this.cameraFov;
            }
        }
        this.camera.updateProjectionMatrix();
        this.updateWorldSize();
    }

    adjustFov(aspect) {
        const tangent = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect);
        this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(tangent));
    }

    updateWorldSize() {
        if (this.camera.isPerspectiveCamera) {
            const vFov = (this.camera.fov * Math.PI) / 180;
            this.size.wHeight = 2 * Math.tan(vFov / 2) * this.camera.position.length();
            this.size.wWidth = this.size.wHeight * this.camera.aspect;
        } else if (this.camera.isOrthographicCamera) {
            this.size.wHeight = this.camera.top - this.camera.bottom;
            this.size.wWidth = this.camera.right - this.camera.left;
        }
    }

    updateRenderer() {
        this.renderer.setSize(this.size.width, this.size.height);
        let pixelRatio = window.devicePixelRatio;
        if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
            pixelRatio = this.maxPixelRatio;
        } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
            pixelRatio = this.minPixelRatio;
        }
        this.renderer.setPixelRatio(pixelRatio);
        this.size.pixelRatio = pixelRatio;
    }

    start() {
        if (this.isRunning) return;
        const animate = () => {
            this.animationFrame = requestAnimationFrame(animate);
            this.clockDelta = this.clock.getDelta();
            this.clockElapsed += this.clockDelta;
            if (this.onBeforeRender) this.onBeforeRender({ delta: this.clockDelta, elapsed: this.clockElapsed });
            this.render();
            if (this.onAfterRender) this.onAfterRender({ delta: this.clockDelta, elapsed: this.clockElapsed });
        };
        this.isRunning = true;
        this.clock.start();
        animate();
    }

    stop() {
        if (this.isRunning) {
            cancelAnimationFrame(this.animationFrame);
            this.isRunning = false;
            this.clock.stop();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    clear() {
        this.scene.traverse(object => {
            if (object.isMesh && typeof object.material === 'object' && object.material !== null) {
                Object.keys(object.material).forEach(prop => {
                    const material = object.material[prop];
                    if (material !== null && typeof material === 'object' && typeof material.dispose === 'function') {
                        material.dispose();
                    }
                });
                object.material.dispose();
                object.geometry.dispose();
            }
        });
        this.scene.clear();
    }

    dispose() {
        this.cleanupListeners();
        this.stop();
        this.clear();
        this.renderer.dispose();
    }

    clock = new ThreeClock();
    clockElapsed = 0;
    clockDelta = 0;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
}

const interactionMap = new Map();
const mousePosition = new Vector2();
let interactionListenerAdded = false;

function setupInteraction(config) {
    const data = {
        position: new Vector2(),
        nPosition: new Vector2(),
        hover: false,
        touching: false,
        onEnter() { },
        onMove() { },
        onClick() { },
        onLeave() { },
        ...config
    };

    if (!interactionMap.has(config.domElement)) {
        interactionMap.set(config.domElement, data);
        if (!interactionListenerAdded) {
            document.body.addEventListener('pointermove', onPointerMove);
            document.body.addEventListener('pointerleave', onPointerLeave);
            document.body.addEventListener('click', onClick);
            document.body.addEventListener('touchstart', onTouchStart, { passive: false });
            document.body.addEventListener('touchmove', onTouchMove, { passive: false });
            document.body.addEventListener('touchend', onTouchEnd, { passive: false });
            document.body.addEventListener('touchcancel', onTouchEnd, { passive: false });
            interactionListenerAdded = true;
        }
    }

    data.dispose = () => {
        interactionMap.delete(config.domElement);
        if (interactionMap.size === 0) {
            document.body.removeEventListener('pointermove', onPointerMove);
            document.body.removeEventListener('pointerleave', onPointerLeave);
            document.body.removeEventListener('click', onClick);
            document.body.removeEventListener('touchstart', onTouchStart);
            document.body.removeEventListener('touchmove', onTouchMove);
            document.body.removeEventListener('touchend', onTouchEnd);
            document.body.removeEventListener('touchcancel', onTouchEnd);
            interactionListenerAdded = false;
        }
    };
    return data;
}

function onPointerMove(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    processInteraction();
}

function processInteraction() {
    for (const [elem, data] of interactionMap) {
        const rect = elem.getBoundingClientRect();
        if (isInside(rect)) {
            updatePosition(data, rect);
            if (!data.hover) {
                data.hover = true;
                data.onEnter(data);
            }
            data.onMove(data);
        } else if (data.hover && !data.touching) {
            data.hover = false;
            data.onLeave(data);
        }
    }
}

function onClick(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    for (const [elem, data] of interactionMap) {
        const rect = elem.getBoundingClientRect();
        updatePosition(data, rect);
        if (isInside(rect)) data.onClick(data);
    }
}

function onPointerLeave() {
    for (const data of interactionMap.values()) {
        if (data.hover) {
            data.hover = false;
            data.onLeave(data);
        }
    }
}

function onTouchStart(e) {
    if (e.touches.length > 0) {
        mousePosition.x = e.touches[0].clientX;
        mousePosition.y = e.touches[0].clientY;
        for (const [elem, data] of interactionMap) {
            const rect = elem.getBoundingClientRect();
            if (isInside(rect)) {
                data.touching = true;
                updatePosition(data, rect);
                if (!data.hover) {
                    data.hover = true;
                    data.onEnter(data);
                }
                data.onMove(data);
            }
        }
    }
}

function onTouchMove(e) {
    if (e.touches.length > 0) {
        mousePosition.x = e.touches[0].clientX;
        mousePosition.y = e.touches[0].clientY;
        for (const [elem, data] of interactionMap) {
            const rect = elem.getBoundingClientRect();
            updatePosition(data, rect);
            if (isInside(rect)) {
                if (!data.hover) {
                    data.hover = true;
                    data.touching = true;
                    data.onEnter(data);
                }
                data.onMove(data);
            } else if (data.hover && data.touching) {
                data.onMove(data);
            }
        }
    }
}

function onTouchEnd() {
    for (const [, data] of interactionMap) {
        if (data.touching) {
            data.touching = false;
            if (data.hover) {
                data.hover = false;
                data.onLeave(data);
            }
        }
    }
}

function updatePosition(data, rect) {
    const { position, nPosition } = data;
    position.x = mousePosition.x - rect.left;
    position.y = mousePosition.y - rect.top;
    nPosition.x = (position.x / rect.width) * 2 - 1;
    nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isInside(rect) {
    const { x, y } = mousePosition;
    const { left, top, width, height } = rect;
    return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const tempVec1 = new Vector3();
const tempVec2 = new Vector3();
const tempVec3 = new Vector3();
const tempVec4 = new Vector3();
const tempVec5 = new Vector3();
const tempVec6 = new Vector3();
const tempVec7 = new Vector3();
const tempVec8 = new Vector3();
const tempVec9 = new Vector3();
const tempVec10 = new Vector3();

class PhysicsEngine {
    constructor(config) {
        this.config = config;
        this.positionData = new Float32Array(3 * config.count).fill(0);
        this.velocityData = new Float32Array(3 * config.count).fill(0);
        this.sizeData = new Float32Array(config.count).fill(1);
        this.center = new Vector3();
        this.initPositions();
        this.initSizes();
    }

    initPositions() {
        const { config, positionData } = this;
        this.center.toArray(positionData, 0);
        for (let i = 1; i < config.count; i++) {
            const idx = 3 * i;
            positionData[idx] = randFloatSpread(2 * config.maxX);
            positionData[idx + 1] = randFloatSpread(2 * config.maxY);
            positionData[idx + 2] = randFloatSpread(2 * config.maxZ);
        }
    }

    initSizes() {
        const { config, sizeData } = this;
        sizeData[0] = config.size0;
        for (let i = 1; i < config.count; i++) {
            sizeData[i] = randFloat(config.minSize, config.maxSize);
        }
    }

    update(params) {
        const { config, center, positionData, sizeData, velocityData } = this;
        let startIdx = 0;
        if (config.controlSphere0) {
            startIdx = 1;
            tempVec1.fromArray(positionData, 0);
            tempVec1.lerp(center, 0.1).toArray(positionData, 0);
            tempVec4.set(0, 0, 0).toArray(velocityData, 0);
        }

        for (let idx = startIdx; idx < config.count; idx++) {
            const base = 3 * idx;
            tempVec2.fromArray(positionData, base);
            tempVec5.fromArray(velocityData, base);
            tempVec5.y -= params.delta * config.gravity * sizeData[idx];
            tempVec5.multiplyScalar(config.friction);
            tempVec5.clampLength(0, config.maxVelocity);
            tempVec2.add(tempVec5);
            tempVec2.toArray(positionData, base);
            tempVec5.toArray(velocityData, base);
        }

        for (let idx = startIdx; idx < config.count; idx++) {
            const base = 3 * idx;
            tempVec2.fromArray(positionData, base);
            tempVec5.fromArray(velocityData, base);
            const radius = sizeData[idx];

            for (let jdx = idx + 1; jdx < config.count; jdx++) {
                const otherBase = 3 * jdx;
                tempVec3.fromArray(positionData, otherBase);
                tempVec6.fromArray(velocityData, otherBase);
                const otherRadius = sizeData[jdx];
                tempVec7.copy(tempVec3).sub(tempVec2);
                const dist = tempVec7.length();
                const sumRadius = radius + otherRadius;

                if (dist < sumRadius) {
                    const overlap = sumRadius - dist;
                    tempVec8.copy(tempVec7).normalize().multiplyScalar(0.5 * overlap);
                    tempVec9.copy(tempVec8).multiplyScalar(Math.max(tempVec5.length(), 1));
                    tempVec10.copy(tempVec8).multiplyScalar(Math.max(tempVec6.length(), 1));

                    tempVec2.sub(tempVec8);
                    tempVec5.sub(tempVec9);
                    tempVec2.toArray(positionData, base);
                    tempVec5.toArray(velocityData, base);

                    tempVec3.add(tempVec8);
                    tempVec6.add(tempVec10);
                    tempVec3.toArray(positionData, otherBase);
                    tempVec6.toArray(velocityData, otherBase);
                }
            }

            if (config.controlSphere0) {
                tempVec7.copy(tempVec1).sub(tempVec2);
                const dist = tempVec7.length();
                const sumRadius0 = radius + sizeData[0];
                if (dist < sumRadius0) {
                    const diff = sumRadius0 - dist;
                    tempVec8.copy(tempVec7.normalize()).multiplyScalar(diff);
                    tempVec9.copy(tempVec8).multiplyScalar(Math.max(tempVec5.length(), 2));
                    tempVec2.sub(tempVec8);
                    tempVec5.sub(tempVec9);
                }
            }

            if (Math.abs(tempVec2.x) + radius > config.maxX) {
                tempVec2.x = Math.sign(tempVec2.x) * (config.maxX - radius);
                tempVec5.x = -tempVec5.x * config.wallBounce;
            }

            if (config.gravity === 0) {
                if (Math.abs(tempVec2.y) + radius > config.maxY) {
                    tempVec2.y = Math.sign(tempVec2.y) * (config.maxY - radius);
                    tempVec5.y = -tempVec5.y * config.wallBounce;
                }
            } else if (tempVec2.y - radius < -config.maxY) {
                tempVec2.y = -config.maxY + radius;
                tempVec5.y = -tempVec5.y * config.wallBounce;
            }

            const maxBoundary = Math.max(config.maxZ, config.maxSize);
            if (Math.abs(tempVec2.z) + radius > maxBoundary) {
                tempVec2.z = Math.sign(tempVec2.z) * (config.maxZ - radius);
                tempVec5.z = -tempVec5.z * config.wallBounce;
            }

            tempVec2.toArray(positionData, base);
            tempVec5.toArray(velocityData, base);
        }
    }
}

class CustomMaterial extends MeshPhysicalMaterial {
    constructor(parameters) {
        super(parameters);
        this.uniforms = {
            thicknessDistortion: { value: 0.1 },
            thicknessAmbient: { value: 0 },
            thicknessAttenuation: { value: 0.1 },
            thicknessPower: { value: 2 },
            thicknessScale: { value: 10 }
        };
        this.defines.USE_UV = '';
        this.onBeforeCompile = shader => {
            Object.assign(shader.uniforms, this.uniforms);
            shader.fragmentShader =
                '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
                shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
            );
            const lightFragment = ShaderChunk.lights_fragment_begin.replaceAll(
                'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
            );
            shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightFragment);
        };
    }
}

const defaultBallpitConfig = {
    count: 200,
    colors: [0, 0, 0],
    ambientColor: 16777215,
    ambientIntensity: 1,
    lightIntensity: 200,
    materialParams: {
        metalness: 0.5,
        roughness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.15
    },
    minSize: 0.5,
    maxSize: 1,
    size0: 1,
    gravity: 0.5,
    friction: 0.9975,
    wallBounce: 0.95,
    maxVelocity: 0.15,
    maxX: 5,
    maxY: 5,
    maxZ: 2,
    controlSphere0: false,
    followCursor: true
};

const instanceObject = new Object3D();

class BallsInstance extends InstancedMesh {
    constructor(renderer, config = {}) {
        const finalConfig = { ...defaultBallpitConfig, ...config };
        const pmremGenerator = new PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const roomEnvironment = new RoomEnvironment();
        const envMap = pmremGenerator.fromScene(roomEnvironment).texture;
        const geometry = new SphereGeometry();
        const material = new CustomMaterial({ envMap, ...finalConfig.materialParams });
        material.envMapRotation.x = -Math.PI / 2;
        super(geometry, material, finalConfig.count);

        this.config = finalConfig;
        this.physics = new PhysicsEngine(finalConfig);
        this.setupLights();
        this.setColors(finalConfig.colors);
    }

    setupLights() {
        this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
        this.add(this.ambientLight);
        this.pointLight = new PointLight(this.config.colors[0], this.config.lightIntensity);
        this.add(this.pointLight);
    }

    setColors(colors) {
        if (Array.isArray(colors) && colors.length > 1) {
            const colorInterpolator = (function (colorsArray) {
                let colorsList = [];
                colorsArray.forEach(col => colorsList.push(new Color(col)));
                return {
                    getColorAt: function (ratio, out = new Color()) {
                        const scaled = Math.max(0, Math.min(1, ratio)) * (colorsList.length - 1);
                        const idx = Math.floor(scaled);
                        const start = colorsList[idx];
                        if (idx >= colorsList.length - 1) return start.clone();
                        const alpha = scaled - idx;
                        const end = colorsList[idx + 1];
                        out.r = start.r + alpha * (end.r - start.r);
                        out.g = start.g + alpha * (end.g - start.g);
                        out.b = start.b + alpha * (end.b - start.b);
                        return out;
                    }
                };
            })(colors);

            for (let idx = 0; idx < this.count; idx++) {
                this.setColorAt(idx, colorInterpolator.getColorAt(idx / this.count));
                if (idx === 0) {
                    this.pointLight.color.copy(colorInterpolator.getColorAt(idx / this.count));
                }
            }
            this.instanceColor.needsUpdate = true;
        }
    }

    update(params) {
        this.physics.update(params);
        for (let idx = 0; idx < this.count; idx++) {
            instanceObject.position.fromArray(this.physics.positionData, 3 * idx);
            if (idx === 0 && this.config.followCursor === false) {
                instanceObject.scale.setScalar(0);
            } else {
                instanceObject.scale.setScalar(this.physics.sizeData[idx]);
            }
            instanceObject.updateMatrix();
            this.setMatrixAt(idx, instanceObject.matrix);
            if (idx === 0) this.pointLight.position.copy(instanceObject.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

function createBallpit(canvas, config = {}) {
    const core = new BallpitCore({
        canvas: canvas,
        size: 'parent',
        rendererOptions: { antialias: true, alpha: true }
    });
    let ballsInstance;
    core.renderer.toneMapping = ACESFilmicToneMapping;
    core.camera.position.set(0, 0, 20);
    core.camera.lookAt(0, 0, 0);
    core.cameraMaxAspect = 1.5;
    core.resize();

    initialize(config);

    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const intersectPoint = new Vector3();
    let paused = false;

    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';

    const interaction = setupInteraction({
        domElement: canvas,
        onMove() {
            raycaster.setFromCamera(interaction.nPosition, core.camera);
            core.camera.getWorldDirection(plane.normal);
            raycaster.ray.intersectPlane(plane, intersectPoint);
            ballsInstance.physics.center.copy(intersectPoint);
            ballsInstance.config.controlSphere0 = true;
        },
        onLeave() {
            ballsInstance.config.controlSphere0 = false;
        }
    });

    function initialize(newConfig) {
        if (ballsInstance) {
            core.clear();
            core.scene.remove(ballsInstance);
        }
        ballsInstance = new BallsInstance(core.renderer, newConfig);
        core.scene.add(ballsInstance);
    }

    core.onBeforeRender = (params) => {
        if (!paused) ballsInstance.update(params);
    };

    core.onAfterResize = (sizeParams) => {
        ballsInstance.config.maxX = sizeParams.wWidth / 2;
        ballsInstance.config.maxY = sizeParams.wHeight / 2;
    };

    return {
        three: core,
        get spheres() {
            return ballsInstance;
        },
        setCount(count) {
            initialize({ ...ballsInstance.config, count: count });
        },
        togglePause() {
            paused = !paused;
        },
        dispose() {
            interaction.dispose();
            core.dispose();
        }
    };
}

const Ballpit = ({ className = '', followCursor = true, ...props }) => {
    const canvasRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        instanceRef.current = createBallpit(canvas, { followCursor, ...props });

        return () => {
            if (instanceRef.current) {
                instanceRef.current.dispose();
            }
        };
    }, [followCursor, JSON.stringify(props)]);

    return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default Ballpit;

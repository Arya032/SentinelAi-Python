/**
 * main.js  |  SentinelAI — Ambient Background Canvas + Dedicated 3D Robot Viewport
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. #webgl-canvas (z-index: 0): Ambient Fluid Aura & Floating Particles (No Text Overlap)
 * 2. #robot-webgl-canvas: Dedicated 3D Sentinel Robot placed in between Hero & Section 2
 */

'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   1. ZEIGARNIK EFFECT: 2PX TOP PROGRESS BAR
───────────────────────────────────────────────────────────────────────────── */
const progressBar = document.getElementById('top-progress-bar');

ScrollTrigger.create({
  trigger: document.body,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.1,
  onUpdate: (self) => {
    if (progressBar) {
      progressBar.style.width = `${(self.progress * 100).toFixed(2)}%`;
    }
  }
});


/* ─────────────────────────────────────────────────────────────────────────────
   2. CURSOR SPOTLIGHT TRACKING & NDC
───────────────────────────────────────────────────────────────────────────── */
const spotlight = document.getElementById('cursor-spotlight');
const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };
const mouseScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (e) => {
  mouseScreen.x = e.clientX;
  mouseScreen.y = e.clientY;
  targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}, { passive: true });

function updateSpotlight() {
  if (spotlight) {
    spotlight.style.transform = `translate3d(${mouseScreen.x}px, ${mouseScreen.y}px, 0)`;
  }
  requestAnimationFrame(updateSpotlight);
}
updateSpotlight();


/* ─────────────────────────────────────────────────────────────────────────────
   3. BACKGROUND AMBIENT CANVAS (#webgl-canvas, z-index: 0 — Clean Ambient Aura)
───────────────────────────────────────────────────────────────────────────── */
(function initAmbientBackgroundCanvas() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080a);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  scene.add(new THREE.AmbientLight(0x07080a, 2.0));

  const cyanLight = new THREE.PointLight(0x00f2fe, 3.5, 16);
  cyanLight.position.set(-3, 2, 2);
  scene.add(cyanLight);

  const mintLight = new THREE.PointLight(0x10b981, 2.0, 14);
  mintLight.position.set(3, -2, 1);
  scene.add(mintLight);

  // Floating background ambient particles
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let pt = 0; pt < particleCount * 3; pt += 3) {
    particlePos[pt] = (Math.random() - 0.5) * 18;
    particlePos[pt + 1] = (Math.random() - 0.5) * 14;
    particlePos[pt + 2] = -2 - Math.random() * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.045,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const clock = new THREE.Clock();

  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    cyanLight.intensity = 3.0 + Math.sin(t * 1.0) * 1.0;
    mintLight.intensity = 1.8 + Math.cos(t * 0.8) * 0.6;
    particles.rotation.y = t * 0.015;

    renderer.render(scene, camera);
  }

  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   4. DEDICATED 3D SENTINEL ROBOT (#robot-webgl-canvas — Placed in Between)
───────────────────────────────────────────────────────────────────────────── */
(function initSentinelRobotDedicatedScene() {
  const canvas = document.getElementById('robot-webgl-canvas');
  const container = document.getElementById('robot-canvas-container');
  if (!canvas || !container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true, // Transparent so background shows through
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.0);

  // Lighting for Cute Robot
  scene.add(new THREE.AmbientLight(0x0e1424, 2.2));

  const keyLight = new THREE.DirectionalLight(0xb0d8ff, 2.8);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
  fillLight.position.set(-5, -2, 3);
  scene.add(fillLight);

  const robotCoreLight = new THREE.PointLight(0x00f2fe, 5.0, 16);
  robotCoreLight.position.set(0, 0, 0);
  scene.add(robotCoreLight);

  // Cute Materials (Smooth Pearl White Armor + Dark Screen Visor + LED Emissives)
  const whiteArmorMat = new THREE.MeshPhongMaterial({
    color: 0xfcfdfd,
    specular: 0xffffff,
    shininess: 100
  });

  const darkVisorMat = new THREE.MeshPhongMaterial({
    color: 0x0a0c16,
    specular: 0x00f2fe,
    shininess: 120
  });

  const cyanEmissiveMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const pinkEmissiveMat = new THREE.MeshBasicMaterial({ color: 0xff55aa });

  const shieldPlateMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
    side: THREE.DoubleSide
  });

  // Construct Robot Architecture
  const robotGroup = new THREE.Group();
  scene.add(robotGroup);

  // 1. Proper Cute Round Pod Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);
  robotGroup.add(headGroup);

  // Smooth Round Head Shell (Porcelain White Sphere)
  const headGeo = new THREE.SphereGeometry(1.0, 32, 32);
  headGeo.scale(1.12, 0.98, 0.96);
  const headShell = new THREE.Mesh(headGeo, whiteArmorMat);
  headGroup.add(headShell);

  // Face Feature Group (Placed directly on smooth porcelain head surface)
  const faceGroup = new THREE.Group();
  headGroup.add(faceGroup);

  // Expressive LED Ring Eyes + Inner Pupil Sphere + White Catchlight Sparkle
  const eyeRingGeo = new THREE.TorusGeometry(0.18, 0.035, 16, 32);
  const eyePupilGeo = new THREE.SphereGeometry(0.12, 24, 24);
  const sparkGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Left Eye Assembly
  const eyeLeft = new THREE.Mesh(eyeRingGeo, cyanEmissiveMat);
  eyeLeft.position.set(-0.42, 0.08, 0.94);
  faceGroup.add(eyeLeft);

  const pupilLeft = new THREE.Mesh(eyePupilGeo, cyanEmissiveMat);
  pupilLeft.position.set(-0.42, 0.08, 0.93);
  faceGroup.add(pupilLeft);

  const sparkLeft = new THREE.Mesh(sparkGeo, sparkMat);
  sparkLeft.position.set(-0.36, 0.14, 0.99);
  faceGroup.add(sparkLeft);

  // Right Eye Assembly
  const eyeRight = new THREE.Mesh(eyeRingGeo, cyanEmissiveMat);
  eyeRight.position.set(0.42, 0.08, 0.94);
  faceGroup.add(eyeRight);

  const pupilRight = new THREE.Mesh(eyePupilGeo, cyanEmissiveMat);
  pupilRight.position.set(0.42, 0.08, 0.93);
  faceGroup.add(pupilRight);

  const sparkRight = new THREE.Mesh(sparkGeo, sparkMat);
  sparkRight.position.set(0.48, 0.14, 0.99);
  faceGroup.add(sparkRight);

  // LED Cute Smile Mouth (U-shape Torus Arc)
  const smileGeo = new THREE.TorusGeometry(0.12, 0.028, 16, 32, Math.PI * 0.85);
  const smileMesh = new THREE.Mesh(smileGeo, cyanEmissiveMat);
  smileMesh.rotation.z = Math.PI * 1.07;
  smileMesh.position.set(0, -0.08, 0.94);
  faceGroup.add(smileMesh);

  // Cute Pink Glowing Cheeks (Left & Right)
  const cheekGeo = new THREE.CircleGeometry(0.09, 24);
  const cheekLeft = new THREE.Mesh(cheekGeo, pinkEmissiveMat);
  cheekLeft.position.set(-0.58, -0.14, 0.94);
  faceGroup.add(cheekLeft);

  const cheekRight = new THREE.Mesh(cheekGeo, pinkEmissiveMat);
  cheekRight.position.set(0.58, -0.14, 0.94);
  faceGroup.add(cheekRight);

  // Side Ear Headphone Discs
  const earDiscGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 32);
  earDiscGeo.rotateZ(Math.PI / 2);

  const earLeft = new THREE.Mesh(earDiscGeo, whiteArmorMat);
  earLeft.position.set(-1.08, 0, 0);
  headGroup.add(earLeft);

  const earRight = new THREE.Mesh(earDiscGeo, whiteArmorMat);
  earRight.position.set(1.08, 0, 0);
  headGroup.add(earRight);

  // Top Antenna Stalk + Glowing Tip Ball
  const antennaStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 16), whiteArmorMat);
  antennaStalk.position.set(0, 1.0, 0);
  headGroup.add(antennaStalk);

  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), cyanEmissiveMat);
  antennaTip.position.set(0, 1.15, 0);
  headGroup.add(antennaTip);

  // 2. Neck Glow Ring
  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 16, 32), cyanEmissiveMat);
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.set(0, 0.12, 0);
  robotGroup.add(neckRing);

  // 3. Compact Body Pod
  const bodyGeo = new THREE.SphereGeometry(0.78, 32, 32);
  bodyGeo.scale(0.9, 1.1, 0.85);
  const bodyMesh = new THREE.Mesh(bodyGeo, whiteArmorMat);
  bodyMesh.position.set(0, -0.58, 0);
  robotGroup.add(bodyMesh);

  // Belly Cyan Seam Accent
  const bellySeam = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.02, 16, 32), cyanEmissiveMat);
  bellySeam.rotation.x = Math.PI / 2;
  bellySeam.position.set(0, -0.68, 0);
  robotGroup.add(bellySeam);

  // 4. Arms (Waving Right Arm + Left Arm)
  const armRightGroup = new THREE.Group();
  armRightGroup.position.set(0.75, -0.4, 0);
  robotGroup.add(armRightGroup);

  const armRightMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.65, 16), whiteArmorMat);
  armRightMesh.position.set(0.25, 0.15, 0);
  armRightMesh.rotation.z = -Math.PI / 3.5;
  armRightGroup.add(armRightMesh);

  const armLeftGroup = new THREE.Group();
  armLeftGroup.position.set(-0.75, -0.4, 0);
  robotGroup.add(armLeftGroup);

  const armLeftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.65, 16), whiteArmorMat);
  armLeftMesh.position.set(-0.25, -0.1, 0);
  armLeftMesh.rotation.z = Math.PI / 6;
  armLeftGroup.add(armLeftMesh);

  // 5. Short Stubby Legs
  const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.45, 16), whiteArmorMat);
  legLeft.position.set(-0.32, -1.35, 0);
  robotGroup.add(legLeft);

  const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.45, 16), whiteArmorMat);
  legRight.position.set(0.32, -1.35, 0);
  robotGroup.add(legRight);

  // No surrounding wireframe rings or shield plates (Clean cute robot floating in space)

  // Scroll Trigger attached specifically to #robot-section
  const ROBOT_STATE = { scrollProgress: 0 };

  gsap.to(ROBOT_STATE, {
    scrollProgress: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#robot-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2
    }
  });

  let currentExpression = 'IDLE'; // 'IDLE' | 'THINKING' | 'RESPONDING' | 'SAFETY_CONFIRMED'
  let expressionTimeout = null;

  window.setRobotExpressionState = function(state, autoResetMs = 0) {
    currentExpression = state;
    if (expressionTimeout) clearTimeout(expressionTimeout);

    const statusText = document.getElementById('robot-status-text');
    const statusDot = document.getElementById('robot-status-dot');
    const speechBubble = document.getElementById('speech-bubble');
    const speechHeaderTitle = document.getElementById('speech-header-title');

    if (speechBubble) {
      speechBubble.classList.remove('speech-bubble-mint', 'speech-bubble-amber');
    }

    if (state === 'THINKING') {
      if (statusText) statusText.innerText = 'Sentinel Companion // Answering Your Question...';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#f59e0b] animate-ping'; }
      if (speechBubble) speechBubble.classList.add('speech-bubble-amber');
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'Thinking...';
    } else if (state === 'RESPONDING') {
      if (statusText) statusText.innerText = 'Sentinel Companion // Answering You in Plain English';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse'; }
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'SentinelAI Companion';
    } else if (state === 'SAFETY_CONFIRMED') {
      if (statusText) statusText.innerText = 'Sentinel Companion // Everything Is Safe & Sound';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#10b981] animate-bounce'; }
      if (speechBubble) speechBubble.classList.add('speech-bubble-mint');
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'System 100% Secure';
    } else {
      if (statusText) statusText.innerText = 'Sentinel Companion // Watching Over You';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#10b981] animate-pulse'; }
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'SentinelAI Companion';
    }

    if (autoResetMs > 0) {
      expressionTimeout = setTimeout(() => {
        window.setRobotExpressionState('IDLE');
      }, autoResetMs);
    }
  };

  const clock = new THREE.Clock();
  const colorCyan = new THREE.Color(0x00f2fe);
  const colorAmber = new THREE.Color(0xf59e0b);
  const colorMint = new THREE.Color(0x10b981);
  const currentColor = new THREE.Color(0x00f2fe);
  const speechCloudWrapper = document.getElementById('speech-cloud-wrapper');

  function tick() {
    requestAnimationFrame(tick);
    const elapsedTime = clock.getElapsedTime();
    const prog = ROBOT_STATE.scrollProgress;

    // Mouse tracking lerp — robot stays facing forward and follows mouse cursor
    mouse.x += (targetMouse.x - mouse.x) * 0.08;
    mouse.y += (targetMouse.y - mouse.y) * 0.08;

    // 1. Mathematical 3D Vector Screen Projection Math for Speech Cloud
    if (window.innerWidth > 640 && headGroup && speechCloudWrapper) {
      const headPos = new THREE.Vector3();
      headGroup.getWorldPosition(headPos);
      headPos.y += 0.45; // Offset to top-right of head
      headPos.x += 0.85;

      const projVec = headPos.clone().project(camera);
      const containerRect = container.getBoundingClientRect();

      const screenX = (projVec.x * 0.5 + 0.5) * containerRect.width;
      const screenY = (-(projVec.y * 0.5) + 0.5) * containerRect.height;

      speechCloudWrapper.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
    }

    // 2. Synchronized Robot Expression Animation Loop (Steady & Stationary — No Bouncing)
    robotGroup.position.y = 0;

    if (currentExpression === 'THINKING') {
      headGroup.rotation.y = mouse.x * 0.3;
      headGroup.rotation.z = Math.sin(elapsedTime * 8.0) * 0.12;
      armRightGroup.rotation.z = 0.6 + Math.sin(elapsedTime * 4.0) * 0.1;

      const pulseT = (Math.sin(elapsedTime * 10.0) + 1) / 2;
      currentColor.lerpColors(colorCyan, colorAmber, pulseT);

    } else if (currentExpression === 'RESPONDING') {
      // Vocal Pulse Sync: Pulse light intensity and color rhythmically to simulate speaking
      const vocalPulse = (Math.sin(elapsedTime * 14.0) + 1) / 2;
      currentColor.lerpColors(colorCyan, colorMint, vocalPulse * 0.45);

      // Head tilts slightly toward speech cloud callout
      headGroup.rotation.z = -0.14 + Math.sin(elapsedTime * 5.0) * 0.05;
      headGroup.rotation.x = -mouse.y * 0.2 + Math.sin(elapsedTime * 6.0) * 0.06;
      headGroup.rotation.y = 0.15 + mouse.x * 0.2;

      armRightGroup.rotation.z = Math.sin(elapsedTime * 3.5) * 0.2 + 0.1;

    } else if (currentExpression === 'SAFETY_CONFIRMED') {
      // All-Clear State: Happy nod & Emerald Mint glow
      headGroup.rotation.y = mouse.x * 0.4;
      headGroup.rotation.x = Math.sin(elapsedTime * 6.0) * 0.08; // Happy nod
      headGroup.rotation.z = Math.sin(elapsedTime * 4.0) * 0.04;
      armRightGroup.rotation.z = 0.45 + Math.sin(elapsedTime * 5.0) * 0.15;

      currentColor.copy(colorMint);

    } else { // IDLE
      headGroup.rotation.y = mouse.x * 0.55;
      headGroup.rotation.x = -mouse.y * 0.35;
      headGroup.rotation.z = mouse.x * 0.08;

      robotGroup.rotation.y = mouse.x * 0.22;
      robotGroup.rotation.x = -mouse.y * 0.12;

      armRightGroup.rotation.z = Math.sin(elapsedTime * 3.2) * 0.18 + 0.1;

      if (prog < 0.5) {
        const t1 = prog / 0.5;
        currentColor.lerpColors(colorCyan, colorAmber, t1);
      } else {
        const t2 = (prog - 0.5) / 0.5;
        currentColor.lerpColors(colorAmber, colorMint, t2);
      }
    }

    eyeLeft.material.color.copy(currentColor);
    eyeRight.material.color.copy(currentColor);
    pupilLeft.material.color.copy(currentColor);
    pupilRight.material.color.copy(currentColor);
    smileMesh.material.color.copy(currentColor);
    neckRing.material.color.copy(currentColor);
    bellySeam.material.color.copy(currentColor);
    robotCoreLight.color.copy(currentColor);

    renderer.render(scene, camera);
  }

  tick();

  window.addEventListener('resize', () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ScrollTrigger.refresh();
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   5. 3D SPEECH CLOUD DIALOGUE & STREAMING ENGINE
───────────────────────────────────────────────────────────────────────────── */
(function initSpeechCloudDialogueController() {
  const speechText = document.getElementById('speech-text');
  const speechForm = document.getElementById('speech-form');
  const speechInput = document.getElementById('speech-input');
  const quickChips = document.querySelectorAll('.quick-chip');

  if (!speechText || !speechForm || !speechInput) return;

  const KNOWLEDGE_BASE = {
    "Is my business safe right now?": "Yes, 100%! Everything is quiet, safe, and running smoothly. All your files, emails, and customer data are fully protected.",
    "How do you keep me protected?": "I act like a friendly digital guard at your door. If anything suspicious tries to come near your business data, I quietly block it before it ever reaches you.",
    "Do I need any tech skills?": "Not at all! SentinelAI is designed specifically for business owners. There is nothing to install, configure, or manage—just complete peace of mind."
  };

  let isStreaming = false;

  function streamSpeechText(fullText) {
    isStreaming = true;
    if (window.setRobotExpressionState) window.setRobotExpressionState('RESPONDING');

    speechText.innerHTML = '';
    let charIdx = 0;

    const interval = setInterval(() => {
      speechText.innerHTML = escapeHTML(fullText.substring(0, charIdx + 1)) + '<span class="inline-block w-1.5 h-3 bg-[#00f2fe] ml-1 animate-pulse"></span>';
      speechText.scrollTop = speechText.scrollHeight;
      charIdx++;

      if (charIdx >= fullText.length) {
        clearInterval(interval);
        speechText.innerHTML = escapeHTML(fullText);
        isStreaming = false;
        if (window.setRobotExpressionState) {
          window.setRobotExpressionState('SAFETY_CONFIRMED', 3800);
        }
      }
    }, 22);
  }

  function handleQuery(queryText) {
    if (!queryText.trim() || isStreaming) return;

    speechInput.value = '';
    if (window.setRobotExpressionState) window.setRobotExpressionState('THINKING');

    setTimeout(() => {
      let answer = KNOWLEDGE_BASE[queryText];
      if (!answer) {
        answer = generateSmartAnswer(queryText);
      }
      streamSpeechText(answer);
    }, 600);
  }

  function generateSmartAnswer(input) {
    const lower = input.toLowerCase();
    if (lower.includes('safe') || lower.includes('security') || lower.includes('status')) {
      return "Everything is 100% safe and sound! Your business data is protected 24/7 with zero effort required from you.";
    }
    if (lower.includes('cost') || lower.includes('price') || lower.includes('pay')) {
      return "SentinelAI offers simple, transparent protection with no hidden fees or surprise upgrades. You get complete peace of mind at one simple price.";
    }
    if (lower.includes('setup') || lower.includes('install') || lower.includes('work')) {
      return "There's zero setup required! Once activated, SentinelAI works automatically in the background without slowing down your computer.";
    }
    return "SentinelAI is keeping your business data safe and protected. Everything is running smoothly so you can focus on your day!";
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  speechForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleQuery(speechInput.value);
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) handleQuery(prompt);
    });
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   6. CRED HOVER GLOW INTERACTIVE HELPERS
───────────────────────────────────────────────────────────────────────────── */
document.querySelectorAll('.btn-mint, .glass-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(el, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { scale: 1.0, duration: 0.35, ease: 'power2.out' });
  });
});


/* ─────────────────────────────────────────────────────────────────────────────
   7. INTERACTIVE LOGIN & SIGNUP AUTH MODAL SYSTEM
───────────────────────────────────────────────────────────────────────────── */
(function initAuthModalController() {
  const authModal = document.getElementById('auth-modal');
  const authModalCard = document.getElementById('auth-modal-card');
  const authModalClose = document.getElementById('auth-modal-close');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  
  const navLoginBtn = document.getElementById('nav-login-btn');
  const navCtaBtn = document.getElementById('nav-cta-btn');
  const heroCtaBtn = document.getElementById('hero-cta-btn');
  
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const authToast = document.getElementById('auth-toast');
  const authToastMsg = document.getElementById('auth-toast-msg');

  if (!authModal || !authModalCard) return;

  function openModal(mode = 'login') {
    authModal.classList.remove('hidden');
    // Trigger transition
    requestAnimationFrame(() => {
      authModal.classList.remove('opacity-0');
      authModalCard.classList.remove('scale-95');
      authModalCard.classList.add('scale-100');
    });
    switchTab(mode);
  }

  function closeModal() {
    authModal.classList.add('opacity-0');
    authModalCard.classList.remove('scale-100');
    authModalCard.classList.add('scale-95');
    setTimeout(() => {
      authModal.classList.add('hidden');
      if (authToast) authToast.classList.add('hidden');
    }, 300);
  }

  function switchTab(mode) {
    if (authToast) authToast.classList.add('hidden');
    if (mode === 'login') {
      formLogin.classList.remove('hidden');
      formSignup.classList.add('hidden');
      tabLoginBtn.className = 'py-2.5 rounded-xl transition-all text-white bg-[#00f2fe]/15 border border-[#00f2fe]/40 shadow-sm cursor-pointer';
      tabSignupBtn.className = 'py-2.5 rounded-xl transition-all text-[#8b90a0] hover:text-white cursor-pointer';
      if (authModalSubtitle) authModalSubtitle.innerText = 'Welcome back! Log in to manage your silent security.';
    } else {
      formSignup.classList.remove('hidden');
      formLogin.classList.add('hidden');
      tabSignupBtn.className = 'py-2.5 rounded-xl transition-all text-white bg-[#10b981]/15 border border-[#10b981]/40 shadow-sm cursor-pointer';
      tabLoginBtn.className = 'py-2.5 rounded-xl transition-all text-[#8b90a0] hover:text-white cursor-pointer';
      if (authModalSubtitle) authModalSubtitle.innerText = 'Get started in under 60 seconds with zero technical setup.';
    }
  }

  // Event Listeners for Opening Modal
  if (navLoginBtn) navLoginBtn.addEventListener('click', () => openModal('login'));
  if (navCtaBtn) navCtaBtn.addEventListener('click', () => openModal('signup'));
  if (heroCtaBtn) heroCtaBtn.addEventListener('click', () => openModal('signup'));

  const activateSelectedModulesBtn = document.getElementById('activate-selected-modules-btn');
  if (activateSelectedModulesBtn) {
    activateSelectedModulesBtn.addEventListener('click', () => {
      const homeSys = document.getElementById('home-mod-system');
      const homeEmail = document.getElementById('home-mod-email');
      const homeCloud = document.getElementById('home-mod-cloud');

      const signupSys = document.getElementById('signup-mod-system');
      const signupEmail = document.getElementById('signup-mod-email');
      const signupCloud = document.getElementById('signup-mod-cloud');

      if (signupSys && homeSys) signupSys.checked = homeSys.checked;
      if (signupEmail && homeEmail) signupEmail.checked = homeEmail.checked;
      if (signupCloud && homeCloud) signupCloud.checked = homeCloud.checked;

      openModal('signup');
    });
  }

  // Close Event Listeners
  if (authModalClose) authModalClose.addEventListener('click', closeModal);
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Tab Switchers
  if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchTab('login'));
  if (tabSignupBtn) tabSignupBtn.addEventListener('click', () => switchTab('signup'));

  // Password Toggle Eye Buttons
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) icon.className = 'ph ph-eye-slash';
        } else {
          input.type = 'password';
          if (icon) icon.className = 'ph ph-eye';
        }
      }
    });
  });

  // Form Submissions (Authentication & Server API Database Persistence)
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const typedName = document.getElementById('login-name-input')?.value.trim();
      const loginEmailInput = document.getElementById('login-email-input')?.value.trim();
      const passwordInput = document.getElementById('login-password-input')?.value || 'password123';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: typedName, email: loginEmailInput, password: passwordInput })
        });
        const data = await response.json();

        if (data.success && data.user) {
          localStorage.setItem('sentinel_user', JSON.stringify(data.user));
          if (data.user.token) localStorage.setItem('sentinel_token', data.user.token);

          if (authToast && authToastMsg) {
            authToastMsg.innerText = `Welcome back, ${data.user.name}! Redirecting to your Security Dashboard...`;
            authToast.classList.remove('hidden');
            if (window.setRobotExpressionState) window.setRobotExpressionState('SAFETY_CONFIRMED', 3000);
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1000);
          }
        } else {
          alert(data.message || 'Login failed. Please check your credentials.');
        }
      } catch (err) {
        // Fallback for standalone file opening
        const finalName = typedName || loginEmailInput.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const initials = finalName.split(/\s+/).filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BO';
        const userObj = { name: finalName, email: loginEmailInput, initials: initials, modules: { system: true, email: true, cloud: true } };
        localStorage.setItem('sentinel_user', JSON.stringify(userObj));
        window.location.href = 'dashboard.html';
      }
    });
  }

  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const typedName = document.getElementById('signup-name-input')?.value.trim();
      const emailInput = document.getElementById('signup-email-input')?.value.trim();
      const passwordInput = document.getElementById('signup-password-input')?.value || 'password123';

      const sysMod = document.getElementById('signup-mod-system')?.checked ?? true;
      const emailMod = document.getElementById('signup-mod-email')?.checked ?? true;
      const cloudMod = document.getElementById('signup-mod-cloud')?.checked ?? true;
      const modulesObj = { system: sysMod, email: emailMod, cloud: cloudMod };

      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: typedName, email: emailInput, password: passwordInput, modules: modulesObj })
        });
        const data = await response.json();

        if (data.success && data.user) {
          localStorage.setItem('sentinel_user', JSON.stringify(data.user));
          if (data.user.token) localStorage.setItem('sentinel_token', data.user.token);

          if (authToast && authToastMsg) {
            authToastMsg.innerText = `Account created for ${data.user.name}! Loading your Security Dashboard...`;
            authToast.classList.remove('hidden');
            if (window.setRobotExpressionState) window.setRobotExpressionState('SAFETY_CONFIRMED', 3000);
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1000);
          }
        } else {
          alert(data.message || 'Signup failed.');
        }
      } catch (err) {
        // Fallback for standalone file opening
        const finalName = typedName || emailInput.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const initials = finalName.split(/\s+/).filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BO';
        const userObj = { name: finalName, email: emailInput, initials: initials, modules: modulesObj };
        localStorage.setItem('sentinel_user', JSON.stringify(userObj));
        window.location.href = 'dashboard.html';
      }
    });
  }

  // ─── Web Audio API Sound Chime Synthesizer ─────────────────────────────────
  function playAffirmationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.35); // G5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }
  window.playAffirmationChime = playAffirmationChime;

  // ─── Threat Defense Simulator Controller ────────────────────────────────────
  const simulateThreatBtn = document.getElementById('simulate-threat-btn');
  if (simulateThreatBtn) {
    simulateThreatBtn.addEventListener('click', () => {
      playAffirmationChime();
      if (window.setRobotExpressionState) {
        window.setRobotExpressionState('THINKING');
      }
      
      const textSpan = document.getElementById('speech-text');
      if (textSpan) {
        textSpan.innerHTML = '<span class="text-[#f59e0b] font-bold">🚨 Phishing Link Intercepted!</span> Neutralizing threat in real time...';
      }

      setTimeout(() => {
        playAffirmationChime();
        if (window.setRobotExpressionState) {
          window.setRobotExpressionState('SAFETY_CONFIRMED', 4000);
        }
        if (textSpan) {
          textSpan.innerHTML = '<span class="text-[#10b981] font-bold">✅ Threat Blocked & Shielded!</span> Your business files & email inbox remain 100% safe.';
        }
      }, 1600);
    });
  }

  // ─── Security Audit Scorecard Controller ──────────────────────────────────
  const auditChecks = document.querySelectorAll('.audit-check');
  const auditScoreNum = document.getElementById('audit-score-number');
  const auditScoreLabel = document.getElementById('audit-score-label');

  function calculateAuditScore() {
    let score = 50; // Base score
    auditChecks.forEach(chk => {
      if (chk.checked) {
        score += parseInt(chk.getAttribute('data-points') || '15', 10);
      }
    });

    if (auditScoreNum) auditScoreNum.innerText = `${score}%`;
    if (auditScoreLabel) {
      if (score >= 90) {
        auditScoreLabel.innerHTML = '<i class="ph ph-shield-check-bold text-[#10b981]"></i> <span class="text-[#10b981]">High Shielding</span>';
      } else if (score >= 70) {
        auditScoreLabel.innerHTML = '<i class="ph ph-warning-bold text-[#f59e0b]"></i> <span class="text-[#f59e0b]">Moderate Risk</span>';
      } else {
        auditScoreLabel.innerHTML = '<i class="ph ph-warning-octagon-bold text-rose-500"></i> <span class="text-rose-500">Protection Needed</span>';
      }
    }
  }

  auditChecks.forEach(chk => chk.addEventListener('change', () => {
    playAffirmationChime();
    calculateAuditScore();
  }));
})();

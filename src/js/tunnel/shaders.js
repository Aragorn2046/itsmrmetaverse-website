/* ============================================
   Tunnel Shaders — Vertex + Fragment for particles
   ============================================ */

export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;      // 0 → 1 scroll progress
  uniform float uDisperse;      // 0 → 1 disperse phase
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aSpeed;
  attribute float aAngle;
  attribute float aRadius;
  attribute float aOffset;

  varying float vAlpha;
  varying float vDistance;

  void main() {
    // Position along the curve (0–1)
    float t = mod(aOffset + uProgress * aSpeed, 1.0);

    // Tunnel radius with slight variation
    float radius = aRadius * (1.0 + 0.3 * sin(uTime * 0.5 + aOffset * 6.28));

    // Angle rotation over time
    float angle = aAngle + uTime * 0.1 * aSpeed + uProgress * 3.14;

    // Ring position in local space
    float localX = cos(angle) * radius;
    float localY = sin(angle) * radius;

    // Map t to position along tunnel path (provided by uniform)
    // Use position attribute as the curve sample point
    vec3 curvePos = position; // Set per-frame from JS

    // Disperse: push particles outward
    float disperseForce = uDisperse * uDisperse * 3.0;
    vec3 disperseDir = normalize(vec3(localX, localY, 0.5)) * disperseForce;

    vec3 finalPos = curvePos + vec3(localX, localY, 0.0) + disperseDir;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);

    // Size attenuation
    float size = aSize * uPixelRatio * (200.0 / -mvPosition.z);
    gl_PointSize = clamp(size, 0.5, 12.0);

    gl_Position = projectionMatrix * mvPosition;

    // Alpha: fade at edges of tunnel + distance fade
    vAlpha = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.85, t);
    vAlpha *= (1.0 - uDisperse * 0.8);
    vDistance = -mvPosition.z;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying float vAlpha;
  varying float vDistance;

  void main() {
    // Soft circle shape
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float strength = 1.0 - smoothstep(0.2, 0.5, d);

    // Color mix based on distance
    float colorMix = smoothstep(50.0, 300.0, vDistance);
    vec3 color = mix(uColorA, uColorB, colorMix);

    // Subtle pulse
    float pulse = 0.85 + 0.15 * sin(uTime * 1.5 + vDistance * 0.02);

    gl_FragColor = vec4(color, strength * vAlpha * pulse);
  }
`;

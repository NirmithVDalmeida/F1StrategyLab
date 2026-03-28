import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore.js'

/*
 * COORDINATE SYSTEM: X = right, Y = up, Z = forward/nose
 * GROUND: Y = 0  |  FRONT AXLE: Z = +1.70  |  REAR AXLE: Z = -1.10
 * Scale: 1 unit ≈ 1 m  |  Wheelbase = 2.8 units
 *
 * 2024 F1 proportions:
 *   Monocoque width  ≈ 0.74 units (cockpit)
 *   Total width incl. sidepods ≈ 1.10 units
 *   Coke-bottle rear ≈ 0.36 units
 */

const C = {
  body:      '#e10600',
  bodyDark:  '#8e0000',
  carbon:    '#141414',
  carbonMid: '#232323',
  tyre:      '#181818',
  rim:       '#8898aa',
  halo:      '#c8ced6',
  floor:     '#0c0c10',
  white:     '#f0f0f0',
  accent:    '#ffffff',
}

/* ═══════════════════════════════════════════════
   BODY
   ═══════════════════════════════════════════════ */

function NoseCone() {
  return (
    <group>
      {/* Pivot at rear edge of nub so inclination rotates the tip down */}
      <group position={[0, 0.133, 1.78]} rotation={[0.22, 0, 0]}>
        <RoundedBox args={[0.260, 0.088, 0.340]} radius={0.036} smoothness={4}
          position={[0, 0, 0.17]} castShadow>
          <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
        </RoundedBox>
        {/* Onboard camera pod follows the nub */}
        <mesh position={[0, 0.076, 0.10]}>
          <cylinderGeometry args={[0.018, 0.018, 0.055, 8]} />
          <meshStandardMaterial color={C.carbon} roughness={0.50} metalness={0.62} />
        </mesh>
      </group>
    </group>
  )
}

function Monocoque() {
  return (
    <group>
      {/* ── COCKPIT → FRONT TAPER junction ──────────────────────────────
           Mirrors the nose-ramp idea: a top ramp + side fillets
           bridging the cockpit RoundedBox into the tapered front section */}
      <mesh position={[0, 0.178, 0.645]} rotation={[-0.10, 0, 0]} castShadow>
        <boxGeometry args={[0.720, 0.060, 0.20]} />
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={`cj${s}`} position={[s * 0.330, 0.168, 0.640]} rotation={[0.10, 0, s * -0.10]}>
          <boxGeometry args={[0.080, 0.200, 0.20]} />
          <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
        </mesh>
      ))}

      {/* ── FRONT TAPER section ──────────────────────────────────────────── */}
      <RoundedBox args={[0.62, 0.21, 0.72]} radius={0.022} smoothness={3}
        position={[0, 0.168, 0.95]} castShadow>
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </RoundedBox>

      {/* ── FRONT TAPER → NOSE RAMP junction ─────────────────────────────── */}
      <mesh position={[0, 0.152, 1.12]} rotation={[0.10, 0, 0]} castShadow>
        <boxGeometry args={[0.580, 0.055, 0.18]} />
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={`tj${s}`} position={[s * 0.268, 0.148, 1.12]} rotation={[0.08, 0, s * 0.10]}>
          <boxGeometry args={[0.060, 0.058, 0.18]} />
          <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
        </mesh>
      ))}

      {/* ── NOSE RAMP (slopes body height down to nose height) ─────────────── */}
      <mesh position={[0, 0.182, 1.48]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.440, 0.072, 0.58]} />
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={`nr${s}`} position={[s * 0.195, 0.194, 1.40]} rotation={[0.14, 0, s * 0.12]}>
          <boxGeometry args={[0.090, 0.068, 0.52]} />
          <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
        </mesh>
      ))}

      {/* ── NOSE RAMP → NOSE CONE junction ───────────────────────────────── */}
      <mesh position={[0, 0.142, 1.76]} rotation={[0.26, 0, 0]} castShadow>
        <boxGeometry args={[0.380, 0.048, 0.22]} />
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={`nc${s}`} position={[s * 0.160, 0.144, 1.76]} rotation={[0.24, 0, s * 0.22]}>
          <boxGeometry args={[0.065, 0.052, 0.22]} />
          <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
        </mesh>
      ))}
      {/* Cockpit tub — widest point of the car body */}
      <RoundedBox args={[0.76, 0.24, 0.84]} radius={0.022} smoothness={3}
        position={[0, 0.182, 0.28]} castShadow>
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </RoundedBox>
      {/* Engine / PU zone */}
      <RoundedBox args={[0.58, 0.23, 0.90]} radius={0.022} smoothness={3}
        position={[0, 0.188, -0.58]} castShadow>
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </RoundedBox>
      {/* Raised upper engine crest */}
      <RoundedBox args={[0.22, 0.13, 0.88]} radius={0.018} smoothness={3}
        position={[0, 0.342, -0.46]} castShadow>
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </RoundedBox>
      {/* Gearbox / rear — coke bottle taper */}
      <RoundedBox args={[0.36, 0.19, 0.52]} radius={0.018} smoothness={3}
        position={[0, 0.172, -0.92]} castShadow>
        <meshStandardMaterial color={C.body} roughness={0.24} metalness={0.50} />
      </RoundedBox>

      {/* Body crease lines */}
      {[-1, 1].map(s => (
        <group key={s}>
          <mesh position={[s * 0.290, 0.108, -0.58]}>
            <boxGeometry args={[0.007, 0.006, 0.90]} />
            <meshStandardMaterial color={C.bodyDark} roughness={0.28} metalness={0.56} />
          </mesh>
        </group>
      ))}

      {/* Livery stripe */}
      <mesh position={[0, 0.378, -0.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.028, 0.92]} />
        <meshStandardMaterial color={C.accent} roughness={0.36}
          transparent opacity={0.92} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Cockpit() {
  return (
    <group position={[0, 0.304, 0.30]}>
      <mesh>
        <boxGeometry args={[0.305, 0.044, 0.53]} />
        <meshStandardMaterial color={C.carbon} roughness={0.88} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <boxGeometry args={[0.340, 0.022, 0.57]} />
        <meshStandardMaterial color={C.bodyDark} roughness={0.44} metalness={0.30} />
      </mesh>
      {/* Steering wheel */}
      <mesh position={[0, 0.024, 0.160]} rotation={[0.28, 0, 0]}>
        <torusGeometry args={[0.062, 0.009, 8, 20]} />
        <meshStandardMaterial color={C.carbon} roughness={0.60} metalness={0.50} />
      </mesh>
      <mesh position={[0, 0.008, 0.218]}>
        <cylinderGeometry args={[0.008, 0.008, 0.078, 6]} />
        <meshStandardMaterial color={C.carbon} roughness={0.60} metalness={0.46} />
      </mesh>
    </group>
  )
}

function Driver() {
  return (
    <group position={[0, 0, 0.18]}>
      {/* Torso / racing suit */}
      <mesh position={[0, 0.330, 0]} castShadow>
        <boxGeometry args={[0.260, 0.095, 0.320]} />
        <meshStandardMaterial color={C.body} roughness={0.55} metalness={0.10} />
      </mesh>
      {/* Shoulders — wider than torso */}
      <mesh position={[0, 0.368, 0.022]} castShadow>
        <boxGeometry args={[0.320, 0.048, 0.200]} />
        <meshStandardMaterial color={C.body} roughness={0.55} metalness={0.10} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.400, 0.040]}>
        <cylinderGeometry args={[0.030, 0.034, 0.052, 10]} />
        <meshStandardMaterial color="#c8a882" roughness={0.70} metalness={0.00} />
      </mesh>
      {/* Helmet — rounded box shape */}
      <mesh position={[0, 0.448, 0.028]} castShadow>
        <sphereGeometry args={[0.075, 16, 12]} />
        <meshStandardMaterial color={C.white} roughness={0.18} metalness={0.30}
          envMapIntensity={1.2} />
      </mesh>
      {/* Helmet chin / lower section */}
      <mesh position={[0, 0.420, 0.060]}>
        <boxGeometry args={[0.130, 0.042, 0.090]} />
        <meshStandardMaterial color={C.white} roughness={0.18} metalness={0.28} />
      </mesh>
      {/* Visor — dark tinted strip */}
      <mesh position={[0, 0.452, 0.096]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.108, 0.036, 0.012]} />
        <meshStandardMaterial color="#1a2a18" roughness={0.08} metalness={0.60}
          transparent opacity={0.88} />
      </mesh>
      {/* HANS device — carbon collar either side of helmet */}
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * 0.068, 0.398, -0.010]} rotation={[0.18, 0, s * 0.28]}>
          <boxGeometry args={[0.018, 0.095, 0.028]} />
          <meshStandardMaterial color={C.carbon} roughness={0.50} metalness={0.48} />
        </mesh>
      ))}
      {/* Gloves on steering wheel area */}
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * 0.090, 0.346, 0.148]}>
          <boxGeometry args={[0.040, 0.028, 0.038]} />
          <meshStandardMaterial color={C.carbon} roughness={0.60} metalness={0.12} />
        </mesh>
      ))}
    </group>
  )
}

function Halo() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3( 0.112,  0.302, -0.148),
    new THREE.Vector3( 0.136,  0.434, -0.026),
    new THREE.Vector3( 0.152,  0.548,  0.160),
    new THREE.Vector3( 0.118,  0.558,  0.360),
    new THREE.Vector3( 0,      0.390,  0.620),
    new THREE.Vector3(-0.118,  0.558,  0.360),
    new THREE.Vector3(-0.152,  0.548,  0.160),
    new THREE.Vector3(-0.136,  0.434, -0.026),
    new THREE.Vector3(-0.112,  0.302, -0.148),
  ], false, 'catmullrom', 0.5), [])

  const geo = useMemo(() =>
    new THREE.TubeGeometry(curve, 64, 0.0168, 10, false), [curve])

  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={C.halo} roughness={0.14} metalness={0.94}
          envMapIntensity={2.4} />
      </mesh>
      <mesh position={[0, 0.286, 0.596]}>
        <cylinderGeometry args={[0.013, 0.018, 0.192, 8]} />
        <meshStandardMaterial color={C.halo} roughness={0.14} metalness={0.94} />
      </mesh>
    </group>
  )
}

function EngineCover() {
  return (
    <group>
      {/* ── ROLL HOOP ──────────────────────────────────────────
          Positioned right behind the cockpit opening.
          Real 2024 cars: tall safety arch ~0.52–0.56 Y height,
          clearly visible from the side as a raised hump. */}

      {/* Roll hoop body fairing */}
      <RoundedBox args={[0.200, 0.285, 0.210]} radius={0.022} smoothness={3}
        position={[0, 0.352, -0.095]} castShadow>
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </RoundedBox>

      {/* Roll hoop inner safety structure */}
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * 0.060, 0.428, -0.095]} castShadow>
          <boxGeometry args={[0.022, 0.252, 0.030]} />
          <meshStandardMaterial color={C.carbon} roughness={0.42} metalness={0.58} />
        </mesh>
      ))}
      {/* Top beam of roll hoop */}
      <mesh position={[0, 0.548, -0.095]} castShadow>
        <boxGeometry args={[0.156, 0.024, 0.030]} />
        <meshStandardMaterial color={C.carbon} roughness={0.42} metalness={0.58} />
      </mesh>

      {/* Airbox — slim scoop above roll hoop */}
      <RoundedBox args={[0.144, 0.162, 0.228]} radius={0.018} smoothness={3}
        position={[0, 0.552, -0.102]} castShadow>
        <meshStandardMaterial color={C.carbon} roughness={0.40} metalness={0.64} />
      </RoundedBox>
      {/* Airbox mouth */}
      <mesh position={[0, 0.552, 0.012]}>
        <boxGeometry args={[0.090, 0.086, 0.010]} />
        <meshStandardMaterial color="#030305" roughness={0.97} metalness={0.03} />
      </mesh>

      {/* Engine cover spine */}
      <mesh position={[0, 0.415, -0.40]} castShadow>
        <boxGeometry args={[0.044, 0.074, 0.78]} />
        <meshStandardMaterial color={C.body} roughness={0.22} metalness={0.52} />
      </mesh>

      {/* Shark fin */}
      <mesh position={[0, 0.472, -0.40]}>
        <boxGeometry args={[0.007, 0.160, 0.62]} />
        <meshStandardMaterial color={C.carbon} roughness={0.46} metalness={0.54} />
      </mesh>
    </group>
  )
}

function Sidepods() {
  // W15 zeropod style: very slim top surface, extreme undercut, floor fully exposed
  return (
    <group>
      {[-1, 1].map(s => (
        <group key={s}>
          {/* Zeropod top surface */}
          <mesh position={[s * 0.445, 0.268, -0.22]} castShadow>
            <boxGeometry args={[0.168, 0.024, 1.00]} />
            <meshStandardMaterial color={C.body} roughness={0.20} metalness={0.54} />
          </mesh>

          {/* Outer bodywork panel */}
          <mesh position={[s * 0.528, 0.210, -0.22]} castShadow>
            <boxGeometry args={[0.026, 0.175, 0.96]} />
            <meshStandardMaterial color={C.body} roughness={0.20} metalness={0.54} />
          </mesh>

          {/* Inner body-to-sidepod transition wall */}
          <mesh position={[s * 0.362, 0.200, -0.22]}>
            <boxGeometry args={[0.018, 0.155, 0.92]} />
            <meshStandardMaterial color={C.bodyDark} roughness={0.30} metalness={0.46} />
          </mesh>

          {/* Deep undercut */}
          <mesh position={[s * 0.470, 0.115, -0.16]} rotation={[0, 0, s * 0.62]} castShadow>
            <boxGeometry args={[0.190, 0.022, 0.88]} />
            <meshStandardMaterial color={C.bodyDark} roughness={0.46} metalness={0.36} />
          </mesh>

          {/* Tiny inlet slot */}
          <mesh position={[s * 0.450, 0.278, 0.480]}>
            <boxGeometry args={[0.112, 0.040, 0.014]} />
            <meshStandardMaterial color="#030306" roughness={0.97} metalness={0.03} />
          </mesh>
          {/* Inlet lip */}
          <mesh position={[s * 0.448, 0.278, 0.496]}>
            <boxGeometry args={[0.136, 0.060, 0.008]} />
            <meshStandardMaterial color={C.bodyDark} roughness={0.32} metalness={0.48} />
          </mesh>

          {/* Rear exit louvres */}
          {[0, 1].map(i => (
            <mesh key={i} position={[s * 0.462, 0.255 - i * 0.052, -0.70]}>
              <boxGeometry args={[0.124, 0.007, 0.048]} />
              <meshStandardMaterial color={C.carbon} roughness={0.70} metalness={0.30} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Floor({ rideHeight }) {
  const gap = 0.050 + (rideHeight / 100) * 0.018
  return (
    <group position={[0, gap, -0.05]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.98, 0.017, 3.50]} />
        <meshStandardMaterial color={C.floor} roughness={0.84} metalness={0.16} />
      </mesh>
      {/* Venturi tunnels */}
      {[-1, 1].map(s => [0.16, 0.34].map((x, i) => (
        <mesh key={`${s}${i}`} position={[s * x, 0.014, 0]}>
          <boxGeometry args={[0.062, 0.009, 3.28]} />
          <meshStandardMaterial color={C.carbonMid} roughness={0.78} metalness={0.22} />
        </mesh>
      )))}
      {/* Edge wing assembly */}
      {[-1, 1].map(s => (
        <group key={s} position={[s * 0.502, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.010, 0.014, 3.28]} />
            <meshStandardMaterial color={C.carbonMid} roughness={0.70} metalness={0.30} />
          </mesh>
          {[-5, -3, -1, 1, 3].map((zi, i) => (
            <mesh key={i} position={[0, 0.025, zi * 0.290]}>
              <boxGeometry args={[0.007, 0.044, 0.148]} />
              <meshStandardMaterial color={C.carbon} roughness={0.80} metalness={0.20} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function FrontWing({ angle }) {
  const pitch = ((angle - 50) / 50) * 0.20
  // Wing origin at Z=2.65 — sits forward of the nose cape (which ends at Z=2.36)
  // Pylons bridge back to the nose underside at Z≈2.28
  return (
    <group position={[0, 0.048, 1.92]}>
      {/* Centre neutral section */}
      <mesh castShadow>
        <boxGeometry args={[0.420, 0.024, 0.220]} />
        <meshStandardMaterial color={C.carbon} roughness={0.38} metalness={0.52} />
      </mesh>

      {/* Nose pylons are wired as SuspArm struts in F1Car for correct world coords */}

      {/* Outboard flap stacks + endplate (endplate inside group to inherit sweep rotation) */}
      {[-1, 1].map(s => (
        <group key={s} position={[s * 0.380, 0, 0]} rotation={[0, s * 0.28, 0]}>
          {/* Main plane */}
          <mesh position={[0, 0.030, 0]} rotation={[pitch, 0, 0]} castShadow>
            <boxGeometry args={[0.680, 0.022, 0.230]} />
            <meshStandardMaterial color={C.body} roughness={0.24} metalness={0.40} />
          </mesh>
          {/* Flap 2 */}
          <mesh position={[0, 0.032, -0.050]} rotation={[pitch * 1.25, 0, 0]} castShadow>
            <boxGeometry args={[0.640, 0.018, 0.118]} />
            <meshStandardMaterial color={C.bodyDark} roughness={0.26} metalness={0.38} />
          </mesh>
          {/* Flap 3 */}
          <mesh position={[0, 0.058, -0.066]} rotation={[pitch * 1.52, 0, 0]} castShadow>
            <boxGeometry args={[0.590, 0.016, 0.090]} />
            <meshStandardMaterial color={C.body} roughness={0.26} metalness={0.36} />
          </mesh>
          {/* Flap 4 */}
          <mesh position={[0, 0.080, -0.078]} rotation={[pitch * 1.75, 0, 0]} castShadow>
            <boxGeometry args={[0.530, 0.014, 0.070]} />
            <meshStandardMaterial color={C.bodyDark} roughness={0.26} metalness={0.36} />
          </mesh>
          {/* Endplate — at outer edge of main plane, inherits sweep from group */}
          <mesh position={[s * 0.340, 0.036, -0.012]} castShadow>
            <boxGeometry args={[0.012, 0.110, 0.250]} />
            <meshStandardMaterial color={C.carbon} roughness={0.48} metalness={0.48} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function RearWing({ angle }) {
  const pitch = ((angle - 50) / 50) * 0.24
  return (
    <group position={[0, 0.450, -1.10]}>
      {/* Main plane */}
      <mesh rotation={[-pitch, 0, 0]} castShadow>
        <boxGeometry args={[0.950, 0.015, 0.220]} />
        <meshStandardMaterial color={C.body} roughness={0.26} metalness={0.34} />
      </mesh>
      {/* DRS flap — sits just above main plane, no rearward overhang */}
      <mesh position={[0, 0.032, -0.028]} rotation={[-pitch * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.908, 0.011, 0.118]} />
        <meshStandardMaterial color={C.bodyDark} roughness={0.28} metalness={0.34} />
      </mesh>
      {/* Beam wing — tucked close under main plane */}
      <mesh position={[0, -0.095, 0.010]} castShadow>
        <boxGeometry args={[0.700, 0.011, 0.145]} />
        <meshStandardMaterial color={C.carbon} roughness={0.42} metalness={0.46} />
      </mesh>
      {/* Endplates */}
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * 0.482, -0.028, 0.002]} castShadow>
          <boxGeometry args={[0.011, 0.196, 0.260]} />
          <meshStandardMaterial color={C.carbon} roughness={0.50} metalness={0.46} />
        </mesh>
      ))}
      {/* Centre pylon — main structural mount to gearbox */}
      <mesh position={[0, -0.148, 0.012]} castShadow>
        <boxGeometry args={[0.026, 0.172, 0.038]} />
        <meshStandardMaterial color={C.carbon} roughness={0.48} metalness={0.48} />
      </mesh>
      {/* Side pylons connecting wing to gearbox */}
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * 0.155, -0.155, 0.018]} castShadow>
          <boxGeometry args={[0.016, 0.180, 0.042]} />
          <meshStandardMaterial color={C.carbon} roughness={0.50} metalness={0.46} />
        </mesh>
      ))}
    </group>
  )
}

function Diffuser() {
  return (
    <group position={[0, 0.060, -1.12]}>
      <mesh rotation={[0.28, 0, 0]} castShadow>
        <boxGeometry args={[0.86, 0.085, 0.44]} />
        <meshStandardMaterial color={C.carbon} roughness={0.76} metalness={0.20} />
      </mesh>
      {[-2, -1, 0, 1, 2].map(i => (
        <mesh key={i} position={[i * 0.118, 0.005, 0.020]} rotation={[0.28, 0, 0]}>
          <boxGeometry args={[0.007, 0.070, 0.42]} />
          <meshStandardMaterial color={C.carbonMid} roughness={0.80} metalness={0.20} />
        </mesh>
      ))}
      {[-1, 1].map(s => (
        <group key={s} position={[s * 0.138, 0.098, 0.088]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.028, 0.060, 12]} />
            <meshStandardMaterial color="#282828" roughness={0.50} metalness={0.82} />
          </mesh>
          <pointLight intensity={0.55} color="#ff4400" distance={0.70} />
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════
   WHEELS & SUSPENSION
   ═══════════════════════════════════════════════ */

function Wheel({ position, isFront }) {
  const spinRef = useRef()
  const side = Math.sign(position[0])

  const outerR = isFront ? 0.200 : 0.222
  const tubeR  = isFront ? 0.075 : 0.086
  const ringR  = outerR - tubeR
  const rimR   = ringR - 0.004
  const width  = 2 * tubeR

  useFrame((_, dt) => {
    if (spinRef.current) spinRef.current.rotation.x -= dt * 9.5
  })

  return (
    <group position={position}>
      <group ref={spinRef}>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[ringR, tubeR, 18, 36]} />
          <meshStandardMaterial color={C.tyre} roughness={0.96} metalness={0.03} />
        </mesh>
        {[-1, 1].map(sw => (
          <mesh key={sw} position={[sw * width * 0.52, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[outerR * 0.974, outerR * 0.974, 0.010, 30]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.95} metalness={0.04} />
          </mesh>
        ))}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[rimR, rimR, width * 0.90, 22]} />
          <meshStandardMaterial color={C.rim} roughness={0.12} metalness={0.92}
            envMapIntensity={1.8} />
        </mesh>
        {[0, 1, 2, 3, 4].map(i => (
          <mesh key={i} rotation={[i * (Math.PI * 2 / 5), 0, Math.PI / 2]}>
            <boxGeometry args={[rimR * 0.130, rimR * 1.76, width * 0.28]} />
            <meshStandardMaterial color="#5e6e80" roughness={0.16} metalness={0.94} />
          </mesh>
        ))}
        <mesh position={[side * (width * 0.49), 0, 0]}
          rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.038, 0.038, 0.014, 12]} />
          <meshStandardMaterial color={C.body} roughness={0.35} metalness={0.56} />
        </mesh>
      </group>
      {/* 2026 wheel cover */}
      <mesh position={[side * (width * 0.58), 0, 0]}
        rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[outerR * 0.942, outerR * 0.942, 0.008, 28]} />
        <meshStandardMaterial color="#1e2032" roughness={0.38} metalness={0.60}
          transparent opacity={0.62} />
      </mesh>
      <mesh position={[side * -0.018, -outerR * 0.48, 0.012]}>
        <boxGeometry args={[0.018, 0.046, 0.066]} />
        <meshStandardMaterial color="#cc2200" roughness={0.42} metalness={0.62} />
      </mesh>
    </group>
  )
}

function SuspArm({ from, to }) {
  const vF  = new THREE.Vector3(...from)
  const vT  = new THREE.Vector3(...to)
  const mid = vF.clone().lerp(vT, 0.5)
  const len = vF.distanceTo(vT)
  const dir = vT.clone().sub(vF).normalize()
  const q   = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  const e   = new THREE.Euler().setFromQuaternion(q)
  return (
    <mesh position={mid.toArray()} rotation={[e.x, e.y, e.z]} castShadow>
      <cylinderGeometry args={[0.009, 0.009, len, 6]} />
      <meshStandardMaterial color={C.carbon} roughness={0.60} metalness={0.42} />
    </mesh>
  )
}

function FrontSuspension({ wx, wy, wz }) {
  return (
    <group>
      <SuspArm from={[wx * 0.24, wy + 0.065, wz + 0.060]} to={[wx * 0.88, wy + 0.062, wz + 0.005]} />
      <SuspArm from={[wx * 0.26, wy + 0.065, wz + 0.060]} to={[wx * 0.88, wy + 0.062, wz - 0.005]} />
      <SuspArm from={[wx * 0.24, wy - 0.042, wz - 0.055]} to={[wx * 0.88, wy - 0.040, wz + 0.005]} />
      <SuspArm from={[wx * 0.26, wy - 0.042, wz - 0.055]} to={[wx * 0.88, wy - 0.040, wz - 0.005]} />
      <SuspArm from={[wx * 0.24, wy + 0.020, wz + 0.002]} to={[wx * 0.82, wy + 0.068, wz + 0.022]} />
    </group>
  )
}

function RearSuspension({ wx, wy, wz }) {
  return (
    <group>
      <SuspArm from={[wx * 0.28, wy + 0.055, wz - 0.044]} to={[wx * 0.84, wy + 0.052, wz + 0.005]} />
      <SuspArm from={[wx * 0.30, wy + 0.055, wz - 0.044]} to={[wx * 0.84, wy + 0.052, wz - 0.005]} />
      <SuspArm from={[wx * 0.30, wy - 0.050, wz + 0.040]} to={[wx * 0.84, wy - 0.048, wz + 0.005]} />
      <SuspArm from={[wx * 0.32, wy - 0.050, wz + 0.040]} to={[wx * 0.84, wy - 0.048, wz - 0.005]} />
    </group>
  )
}

function F1Car({ config }) {
  const FY = 0.200, RY = 0.222
  const FZ = 1.42,  RZ = -1.10
  const fwPos = [[-0.720, FY, FZ], [0.720, FY, FZ]]
  const rwPos = [[-0.740, RY, RZ], [0.740, RY, RZ]]

  return (
    <group>
      <Monocoque />
      <NoseCone />
      <Sidepods />
      <EngineCover />
      <Cockpit />
      <Driver />
      <Halo />
      <Floor rideHeight={config.floorRideHeight} />
      <Diffuser />
      <FrontWing angle={config.frontWing} />
      <RearWing  angle={config.rearWing} />
      {/* Nose-to-wing V pylons — meet tight at the nub, spread to outboard inner edge */}
      {[-1, 1].map(s => (
        <SuspArm key={`np${s}`}
          from={[s * 0.028, 0.090, 2.06]}
          to={[s * 0.480, 0.062, 1.90]}
        />
      ))}
      {fwPos.map((p, i) => <Wheel key={`fw${i}`} position={p} isFront />)}
      {rwPos.map((p, i) => <Wheel key={`rw${i}`} position={p} isFront={false} />)}
      {fwPos.map((p, i) => <FrontSuspension key={`fs${i}`} wx={p[0]} wy={p[1]} wz={p[2]} />)}
      {rwPos.map((p, i) => <RearSuspension  key={`rs${i}`} wx={p[0]} wy={p[1]} wz={p[2]} />)}
    </group>
  )
}

/* ═══════════════════════════════════════════════
   AIRFLOW LINES
   Each segment: 2 vertices (head bright, tail dim)
   moving from nose toward rear, lane-aware.
   ═══════════════════════════════════════════════ */

// [xMin, xMax, yMin, yMax, r, g, b, speedMul, isWake]
const LANES = [
  // Floor venturi tunnels — fastest, deep blue
  [-0.44, -0.18, 0.022, 0.055, 0.02, 0.38, 1.00, 1.45, 0],
  [ 0.18,  0.44, 0.022, 0.055, 0.02, 0.38, 1.00, 1.45, 0],
  // Wing-level side streams — cyan
  [-0.70, -0.50, 0.058, 0.135, 0.00, 0.82, 1.00, 1.12, 0],
  [ 0.50,  0.70, 0.058, 0.135, 0.00, 0.82, 1.00, 1.12, 0],
  // Outer body sides — teal
  [-0.95, -0.70, 0.110, 0.340, 0.08, 0.90, 0.70, 1.00, 0],
  [ 0.70,  0.95, 0.110, 0.340, 0.08, 0.90, 0.70, 1.00, 0],
  // Over-car top flow — green
  [-0.38,  0.38, 0.430, 0.610, 0.18, 0.95, 0.45, 0.88, 0],
  // Far field — slow green
  [-1.55, -0.95, 0.080, 0.380, 0.20, 0.85, 0.38, 0.72, 0],
  [ 0.95,  1.55, 0.080, 0.380, 0.20, 0.85, 0.38, 0.72, 0],
  // Wake (diverging behind car) — orange/red
  [-0.28,  0.28, 0.100, 0.500, 1.00, 0.52, 0.06, 0.60, 1],
]

const SEG_LEN   = 0.46
const LINE_N    = 380

function FlowLines({ power, ers }) {
  const ref      = useRef()
  const baseSpeed = 2.6 + power * 5.0

  const { positions, colors, speeds, laneIds } = useMemo(() => {
    const pos  = new Float32Array(LINE_N * 6)   // 2 verts × 3 floats
    const col  = new Float32Array(LINE_N * 6)
    const spd  = new Float32Array(LINE_N)
    const lid  = new Uint8Array(LINE_N)

    for (let i = 0; i < LINE_N; i++) {
      const li   = i % LANES.length
      const L    = LANES[li]
      const i6   = i * 6
      const x    = L[0] + Math.random() * (L[1] - L[0])
      const y    = L[2] + Math.random() * (L[3] - L[2])
      const z    = -4.2 + Math.random() * 9.0

      // HEAD (lower Z = leading in direction of travel)
      pos[i6]     = x;   pos[i6 + 1] = y;   pos[i6 + 2] = z
      // TAIL (higher Z = trailing)
      pos[i6 + 3] = x;   pos[i6 + 4] = y;   pos[i6 + 5] = z + SEG_LEN

      const jitter = (Math.random() - 0.5) * 0.10
      // Head = bright
      col[i6]     = Math.min(1, L[4] + jitter); col[i6 + 1] = Math.min(1, L[5] + jitter); col[i6 + 2] = Math.min(1, L[6] + jitter)
      // Tail = dim
      col[i6 + 3] = (L[4] + jitter) * 0.28;    col[i6 + 4] = (L[5] + jitter) * 0.28;     col[i6 + 5] = (L[6] + jitter) * 0.28

      spd[i] = L[7]
      lid[i] = li
    }
    return { positions: pos, colors: col, speeds: spd, laneIds: lid }
  }, [])

  useFrame((_, dt) => {
    if (!ref.current) return
    const attr = ref.current.geometry.attributes.position
    const arr  = attr.array
    const s    = baseSpeed

    for (let i = 0; i < LINE_N; i++) {
      const i6    = i * 6
      const li    = laneIds[i]
      const L     = LANES[li]
      const isW   = L[8] === 1
      const move  = s * speeds[i] * dt

      arr[i6 + 2] -= move           // head Z
      arr[i6 + 5] -= move           // tail Z

      if (isW) {
        // Wake segments spread outward as they move back
        const sign = arr[i6] >= 0 ? 1 : -1
        arr[i6]     += sign * 0.06 * dt * s
        arr[i6 + 3] += sign * 0.06 * dt * s
      }

      // Reset when tail passes the rear limit
      if (arr[i6 + 5] < -4.2) {
        const x  = L[0] + Math.random() * (L[1] - L[0])
        const y  = L[2] + Math.random() * (L[3] - L[2])
        const z0 = 4.6 + Math.random() * 0.6
        arr[i6]     = x;   arr[i6 + 1] = y;   arr[i6 + 2] = z0
        arr[i6 + 3] = x;   arr[i6 + 4] = y;   arr[i6 + 5] = z0 + SEG_LEN
      }
    }
    attr.needsUpdate = true
  })

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={LINE_N * 2}
          array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={LINE_N * 2}
          array={colors} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent
        opacity={0.58 + ers * 0.32} depthWrite={false} />
    </lineSegments>
  )
}

/* ═══════════════════════════════════════════════
   PRESSURE ZONES
   ═══════════════════════════════════════════════ */

function PressureSphere({ pos, scale, color }) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current)
      ref.current.scale.setScalar(scale + Math.sin(Date.now() * 0.003) * 0.028)
  })
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshStandardMaterial color={color} transparent opacity={0.11}
        emissive={color} emissiveIntensity={0.52} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PressureZones({ frontWing, rearWing, floorRideHeight }) {
  return (
    <group>
      <PressureSphere pos={[0, 0.10,  2.02]}
        scale={0.13 + (frontWing / 100) * 0.24} color="#00d2ff" />
      <PressureSphere pos={[0, 0.52, -1.55]}
        scale={0.10 + (rearWing  / 100) * 0.20} color="#00d2ff" />
      <PressureSphere pos={[0, 0.05,  0]}
        scale={0.17 + ((100 - floorRideHeight) / 100) * 0.18} color="#e10600" />
      <PressureSphere pos={[0, 0.22, -1.65]}
        scale={0.28} color="#f5c518" />
    </group>
  )
}

/* ═══════════════════════════════════════════════
   LABELS
   ═══════════════════════════════════════════════ */

function CarLabels({ config }) {
  const { frontWing, rearWing, floorRideHeight, iceOutput, ersRate } = config
  const labels = [
    { pos: [0,    0.20,  2.08],  text: `Front Wing  ${frontWing}%`,             color: 'text-cyan-400'  },
    { pos: [0,    0.62, -1.55],  text: `Rear Wing  ${rearWing}%`,               color: 'text-cyan-400'  },
    { pos: [0.92, 0.22, -0.30],  text: `Sidepod`,                               color: 'text-green-400' },
    { pos: [0,    0.06,  0.40],  text: `Floor  ${floorRideHeight}mm`,           color: 'text-blue-400'  },
    { pos: [0,    0.52, -0.58],  text: `ICE ${iceOutput}%  ·  ERS ${ersRate}%`, color: 'text-red-400'   },
    { pos: [0,    0.62,  0.30],  text: `Cockpit / Halo`,                        color: 'text-gray-300'  },
  ]
  return (
    <>
      {labels.map((l, i) => (
        <Html key={i} position={l.pos} center>
          <div className={`text-[10px] ${l.color} font-mono whitespace-nowrap
            bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-lg`}>
            {l.text}
          </div>
        </Html>
      ))}
    </>
  )
}

/* ═══════════════════════════════════════════════
   STUDIO FLOOR
   ═══════════════════════════════════════════════ */

function StudioFloor() {
  return (
    <group>
      {/* Dark reflective floor — like the LightExperience black studio stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#080808" roughness={0.40} metalness={0.55} />
      </mesh>
      {/* Subtle grid — very dark, almost invisible */}
      <gridHelper
        args={[16, 32, '#1a1a1a', '#111111']}
        position={[0, 0.001, 0]}
      />
    </group>
  )
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════ */

export default function AeroViz3D({ activeLayers = {} }) {
  const carConfig = useAppStore(s => s.carConfig)

  const showFlow     = activeLayers.flow     !== false
  const showPressure = activeLayers.pressure !== false
  const showLabels   = activeLayers.labels   !== false

  return (
    <div className="relative w-full" style={{ height: 440 }}>
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-f1red/90 text-white
        text-[10px] font-bold rounded-full tracking-wider uppercase shadow-lg">
        BETA
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-[10px] text-gray-400 font-mono
        bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
        Drag to rotate · Scroll to zoom · Shift+drag to pan
      </div>

      <Canvas
        camera={{ position: [3.4, 1.8, 5.2], fov: 35 }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.CineonToneMapping,
          toneMappingExposure: 1.75,
        }}
        style={{ background: '#000000', borderRadius: 8 }}
      >
        {/* Matching LightExperience: one strong key light + very subtle ambient fill */}
        <ambientLight intensity={0.28} />
        <directionalLight
          position={[0.08, 4.2, 5.0]}
          intensity={2.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.05}
          shadow-camera-far={18}
        />
        {/* Soft cool bounce from opposite side — keeps shadow side from going pure black */}
        <directionalLight position={[-3, 1.5, -3]} intensity={0.35} color="#3a5080" />

        <Suspense fallback={null}>
          <F1Car config={carConfig} />

          {showFlow && (
            <FlowLines
              power={carConfig.iceOutput / 100}
              ers={carConfig.ersRate / 100}
            />
          )}
          {showPressure && (
            <PressureZones
              frontWing={carConfig.frontWing}
              rearWing={carConfig.rearWing}
              floorRideHeight={carConfig.floorRideHeight}
            />
          )}
          {showLabels && <CarLabels config={carConfig} />}

          <StudioFloor />
          <ContactShadows position={[0, -0.001, 0]}
            opacity={0.70} scale={16} blur={3.0} far={5} />
          <Environment preset="night" />
        </Suspense>

        <OrbitControls
          makeDefault
          minPolarAngle={0.08}
          maxPolarAngle={Math.PI / 2.04}
          minDistance={2.2}
          maxDistance={13}
          enableDamping
          dampingFactor={0.06}
          target={[0, 0.18, 0]}
        />
      </Canvas>
    </div>
  )
}

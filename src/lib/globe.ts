import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Country } from '../data/viajes'

/**
 * Globo terráqueo 3D del Aeropuerto, con three.js.
 * La textura del mapa se dibuja en un canvas a partir de world-atlas (fronteras reales),
 * con el estilo de la ciudad: tierra verde, contorno de tinta y los países visitados en amarillo.
 */

const INK = '#1b1b2f'
const OCEAN = '#4aa8e0'
const LAND = '#8bd36f'
const VISITED = '#ffd23f'
const PIN = '#ee4266'

const R = 1
const START_DISTANCE = 14
const VIEW_DISTANCE = 3.3

/** Punto de la esfera para una latitud/longitud (misma convención que la textura equirectangular). */
function latLonToVec(lat: number, lon: number, radius = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

async function buildTexture(visitedIds: Set<string>) {
  // el mapa del mundo (~700 KB) se descarga solo al entrar al aeropuerto
  const world = (await import('world-atlas/countries-50m.json')).default as unknown as Parameters<typeof feature>[0]
  const countries = feature(world, (world as unknown as { objects: { countries: never } }).objects.countries) as unknown as {
    features: (GeoJSON.Feature & { id?: string })[]
  }

  const W = 4096
  const H = 2048
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2])
  const path = geoPath(projection, ctx)

  ctx.fillStyle = OCEAN
  ctx.fillRect(0, 0, W, H)

  // meridianos y paralelos muy suaves
  ctx.beginPath()
  path(geoGraticule10())
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.stroke()

  for (const f of countries.features) {
    ctx.beginPath()
    path(f)
    ctx.fillStyle = visitedIds.has(String(f.id)) ? VISITED : LAND
    ctx.fill()
  }
  ctx.beginPath()
  for (const f of countries.features) path(f)
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.4
  ctx.lineJoin = 'round'
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export interface GlobeOptions {
  container: HTMLElement
  /** Etiqueta HTML que el globo coloca encima de la chincheta señalada. */
  label: HTMLElement
  countries: Country[]
  reducedMotion: boolean
  onSelect?: (index: number | null) => void
}

export class Globe {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private earth: THREE.Mesh
  private pins: THREE.Group[] = []
  private pinHits: THREE.Mesh[] = []
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private hovered: number | null = null
  private selected: number | null = null
  private frame = 0
  private disposed = false
  private intro: { start: number; duration: number } | null = null
  private flight: { from: THREE.Vector3; to: THREE.Vector3; start: number } | null = null
  private resizeObserver: ResizeObserver
  private opts: GlobeOptions

  constructor(opts: GlobeOptions) {
    this.opts = opts
    const { container } = opts

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(this.renderer.domElement)
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.touchAction = 'none'

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
    // empieza lejos y mirando a Europa, donde están casi todas las chinchetas
    this.camera.position.copy(latLonToVec(38, 10, START_DISTANCE))

    // luz que va con la cámara: la cara que miras siempre está iluminada
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(-2, 2, 4)
    this.camera.add(sun)
    this.scene.add(this.camera)

    // la Tierra: mapa sin texturas hasta que se dibuje
    this.earth = new THREE.Mesh(
      new THREE.SphereGeometry(R, 96, 64),
      new THREE.MeshLambertMaterial({ color: OCEAN }),
    )
    this.scene.add(this.earth)

    // contorno de tinta: una esfera negra un poco mayor, vista por dentro
    const outline = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.022, 64, 48),
      new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }),
    )
    this.scene.add(outline)

    // atmósfera: halo azul suave alrededor del borde
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.16, 64, 48),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            float i = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(0.36, 0.72, 1.0, 1.0) * i * 1.6;
          }`,
      }),
    )
    this.scene.add(atmosphere)

    this.addStars()
    this.addPins()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enablePan = false
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.rotateSpeed = 0.55
    this.controls.zoomSpeed = 0.6
    this.controls.minDistance = 1.7
    this.controls.maxDistance = 6
    this.controls.autoRotate = !opts.reducedMotion
    this.controls.autoRotateSpeed = 0.5
    this.controls.enabled = false
    // en cuanto alguien lo toca, deja de girar solo
    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false
      this.flight = null
    })

    const el = this.renderer.domElement
    el.addEventListener('pointermove', this.onPointerMove)
    el.addEventListener('pointerleave', this.onPointerLeave)
    el.addEventListener('click', this.onClick)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()

    void buildTexture(new Set(opts.countries.map((c) => c.id))).then((tex) => {
      if (this.disposed) return tex.dispose()
      const m = this.earth.material as THREE.MeshLambertMaterial
      m.color.set(0xffffff)
      m.map = tex
      m.needsUpdate = true
    })

    this.loop()
  }

  /** Acercamiento desde lejos, como si llegaras al planeta. */
  startIntro(delay = 0, duration = 2200) {
    this.intro = { start: performance.now() + delay, duration }
  }

  /** Gira el globo hasta un país y lo deja señalado. */
  flyTo(index: number) {
    const c = this.opts.countries[index]
    this.controls.autoRotate = false
    this.setSelected(index)
    const dist = Math.min(this.camera.position.length(), 2.6)
    this.flight = {
      from: this.camera.position.clone(),
      to: latLonToVec(c.lat, c.lon, dist),
      start: performance.now(),
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    this.controls.dispose()
    const el = this.renderer.domElement
    el.removeEventListener('pointermove', this.onPointerMove)
    el.removeEventListener('pointerleave', this.onPointerLeave)
    el.removeEventListener('click', this.onClick)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      for (const mat of mats) {
        ;(mat as THREE.MeshLambertMaterial).map?.dispose()
        mat.dispose()
      }
    })
    this.renderer.dispose()
    el.remove()
  }

  private addStars() {
    const count = 1800
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 30)
      pos.set([v.x, v.y, v.z], i * 3)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, sizeAttenuation: true, transparent: true, opacity: 0.85 }),
    )
    this.scene.add(stars)
  }

  private addPins() {
    const needleGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.075, 8)
    const needleMat = new THREE.MeshLambertMaterial({ color: '#c9ccd6' })
    const headGeo = new THREE.SphereGeometry(0.02, 16, 12)
    const headMat = new THREE.MeshLambertMaterial({ color: PIN })
    const rimGeo = new THREE.SphereGeometry(0.027, 16, 12)
    const rimMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })
    // zona de clic más grande que la cabeza, invisible
    const hitGeo = new THREE.SphereGeometry(0.05, 8, 6)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const up = new THREE.Vector3(0, 1, 0)

    this.opts.countries.forEach((c, i) => {
      const pin = new THREE.Group()
      const needle = new THREE.Mesh(needleGeo, needleMat)
      needle.position.y = 0.0375
      const head = new THREE.Mesh(headGeo, headMat)
      head.position.y = 0.08
      const rim = new THREE.Mesh(rimGeo, rimMat)
      rim.position.y = 0.08
      const hit = new THREE.Mesh(hitGeo, hitMat)
      hit.position.y = 0.07
      hit.userData.index = i
      pin.add(needle, head, rim, hit)

      const v = latLonToVec(c.lat, c.lon)
      pin.position.copy(v)
      pin.quaternion.setFromUnitVectors(up, v.clone().normalize())
      this.scene.add(pin)
      this.pins.push(pin)
      this.pinHits.push(hit)
    })
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects([this.earth, ...this.pinHits], false)
    const first = hits[0]
    // si delante está la Tierra, la chincheta queda por detrás y no cuenta
    const index = first && first.object !== this.earth ? (first.object.userData.index as number) : null
    this.hovered = index
    this.renderer.domElement.style.cursor = index === null ? 'grab' : 'pointer'
  }

  private onPointerLeave = () => {
    this.hovered = null
  }

  private onClick = () => {
    if (this.hovered !== null) this.flyTo(this.hovered)
  }

  private setSelected(index: number | null) {
    this.selected = index
    this.opts.onSelect?.(index)
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.opts.container
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private loop = () => {
    this.frame = requestAnimationFrame(this.loop)
    const now = performance.now()

    if (this.intro) {
      const t = Math.min(1, Math.max(0, (now - this.intro.start) / this.intro.duration))
      const ease = 1 - (1 - t) ** 3
      const d = START_DISTANCE + (VIEW_DISTANCE - START_DISTANCE) * ease
      this.camera.position.setLength(d)
      if (t >= 1) {
        this.intro = null
        this.controls.enabled = true
      }
    }

    if (this.flight) {
      const t = Math.min(1, (now - this.flight.start) / 1200)
      const ease = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
      const len = THREE.MathUtils.lerp(this.flight.from.length(), this.flight.to.length(), ease)
      const dir = this.flight.from.clone().normalize()
      const qa = new THREE.Quaternion()
      const qb = new THREE.Quaternion().setFromUnitVectors(dir, this.flight.to.clone().normalize())
      qa.slerp(qb, ease)
      this.camera.position.copy(dir.applyQuaternion(qa).multiplyScalar(len))
      if (t >= 1) this.flight = null
    }

    this.controls.update()

    // chincheta señalada: la del ratón o, si no, la elegida en la lista
    const active = this.hovered ?? this.selected
    // las chinchetas mantienen un tamaño parecido en pantalla al acercar o alejar
    const base = THREE.MathUtils.clamp(this.camera.position.length() / VIEW_DISTANCE, 0.5, 1.2)
    this.pins.forEach((p, i) => {
      const target = base * (i === active ? 1.6 : 1)
      const s = THREE.MathUtils.lerp(p.scale.x, target, 0.2)
      p.scale.setScalar(s)
    })
    this.placeLabel(active)

    this.renderer.render(this.scene, this.camera)
  }

  private placeLabel(index: number | null) {
    const { label } = this.opts
    if (index === null) {
      label.style.opacity = '0'
      return
    }
    const pin = this.pins[index]
    const head = new THREE.Vector3(0, 0.1 * pin.scale.y, 0).applyMatrix4(pin.matrixWorld)
    // ¿está en la cara visible del globo?
    const facing = head.clone().normalize().dot(this.camera.position.clone().normalize()) > 0.15
    const p = head.project(this.camera)
    const { clientWidth: w, clientHeight: h } = this.opts.container
    label.textContent = this.opts.countries[index].name
    label.style.transform = `translate(-50%, -130%) translate(${((p.x + 1) / 2) * w}px, ${((1 - p.y) / 2) * h}px)`
    label.style.opacity = facing ? '1' : '0'
  }
}

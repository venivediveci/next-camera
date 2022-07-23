import { useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GrannyKnot } from 'three/examples/jsm/curves/CurveExtras'
import styles from '../styles/Camera.module.css'

import {
  Clock,
  Scene,
  TextureLoader,
  CubeTextureLoader,
  PerspectiveCamera,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderer,
  TubeGeometry,
  MeshBasicMaterial,
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  Vector3,
  DoubleSide,
} from 'three'

export default function CameraPage() {
  useEffect(() => {
    const NUM_POINTS = 20
    const textureLoader = new TextureLoader()
    const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/'
    const clock = new Clock()
    const scene = new Scene()
    const envMap = new CubeTextureLoader()
      .setPath(`${assetPath}skybox1_`)
      .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
    scene.background = envMap

    const camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 4, 57) //wide position
    camera.lookAt(0, 1.5, 0)

    const light1 = new HemisphereLight(0xffffbb, 0x080820, 1)
    scene.add(light1)

    const light = new DirectionalLight(0xffffff, 1)
    light.position.set(1, 10, 6)
    scene.add(light)

    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: document.getElementById('canvas'),
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    // document.body.appendChild(renderer.domElement)

    //Add meshes here
    const curve = new GrannyKnot()
    const geometry = new TubeGeometry(curve, 200, 2, 8, true)
    const material = new MeshBasicMaterial({
      // wireframe: true,
      visible: false,
    })
    const tube = new Mesh(geometry, material)
    scene.add(tube)

    // add images
    const texture = textureLoader.load('./imgs/attngan-test-image.jpg')
    const boxGeometry = new BoxGeometry(5, 5, 0.2)
    const imageMaterial = new MeshLambertMaterial({
      color: 0xffffff,
      map: texture,
    })
    const boxMaterial = new MeshLambertMaterial({
      color: 0xffffff,
    })

    const points = curve.getSpacedPoints(NUM_POINTS)

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const norm = i / (points.length - 1)
      const tan = curve.getTangentAt(norm)
      const cube = new Mesh(boxGeometry, [
        boxMaterial,
        boxMaterial,
        boxMaterial,
        boxMaterial,
        boxMaterial,
        imageMaterial,
      ])
      cube.position.copy(point)
      cube.lookAt(tan.add(point))
      scene.add(cube)
    }

    const controls = new OrbitControls(camera, renderer.domElement)

    window.addEventListener('resize', resize, false)

    let isCameraUpdate = false
    let startTime = 0
    let currentImgIndex = 0
    let progress = 0
    let velocity = 0.001
    function update() {
      requestAnimationFrame(update)
      updateCamera()
      // controls.update()
      renderer.render(scene, camera)
    }
    update()

    const position = new Vector3()
    const tangent = new Vector3()
    const lookAt = new Vector3()
    function updateCamera() {
      if (!isCameraUpdate) {
        return
      }

      const time = clock.getElapsedTime()
      const timeUsed = time - startTime

      progress += velocity
      progress = progress % 1

      position.copy(curve.getPointAt(progress))
      // position.y += 3

      tangent.copy(curve.getTangentAt(progress))
      console.log(tangent.length())
      camera.position.copy(
        lookAt.copy(position).sub(tangent.multiplyScalar(12))
      )

      // velocity -= tangent.y * 0.0000001 * delta
      // velocity = Math.max(0.00004, Math.min(0.0002, velocity))

      camera.lookAt(position)
    }

    const btn = document.getElementById('camera-btn')
    btn.addEventListener('click', () => {
      if (isCameraUpdate === true) {
        return
      }
      isCameraUpdate = true
      startTime = clock.getElapsedTime()
    })

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
  }, [])

  return (
    <>
      <canvas id="canvas"></canvas>
      <div id="camera-btn" className={styles.cameraBtn}></div>
    </>
  )
}

<script>
	import { T, extend } from '@threlte/core';
	import { Environment } from '@threlte/extras';
	import { MeshTransmissionMaterial } from '$lib/TransmissionMaterial.js';

	extend({ MeshTransmissionMaterial });
</script>

<Environment
  path="/"
  files="shanghai_riverside_1k.hdr"
  format="hdr"
  isBackground={true}
  groundProjection={{ radius: 200, height: 5, scale: { x: 100, y: 100, z: 100 } }}
/>

<!-- <T.Mesh
  castShadow
  receiveShadow
  position.y={2.5}
>
  <T.SphereGeometry args={[2.5]} />
  <T.MeshStandardMaterial
    color="white"
    metalness={0.9}
    roughness={0.05}
    envMapIntensity={0.5}
  />
</T.Mesh> -->

<!-- <T.Mesh
  castShadow
  receiveShadow
  position.y={2.5}
>
  <T.SphereGeometry args={[2.5]} />
  <T.MeshTransmissionMaterial
    backside
    color="white"
    chromaticAberration={2}

  />
</T.Mesh> -->

<!-- <T.Mesh castShadow receiveShadow position.y={2.5}>
	<T.TorusKnotGeometry args={[3, 1, 100, 32]} />
	<T.MeshTransmissionMaterial backside color="white" chromaticAberration={2} />
</T.Mesh> -->

<T.Mesh scale={4}>
	<T.SphereGeometry />
	<T.MeshTransmissionMaterial
		args={[8]}
		clearcoat={1}
		clearcoatRoughness={0}
		transmission={1}
		chromaticAberration={0.1}
		anisotropy="{0.1},"
		roughness={0}
		thickness={4.5}
		ior={1.5}
		distortion={0.1}
		distortionScale={0.2}
		temporalDistortion={0.2}
	/>
</T.Mesh>

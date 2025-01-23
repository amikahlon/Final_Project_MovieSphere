import { useRef, useEffect } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Color3, Color4, Texture, Mesh } from '@babylonjs/core';
import loginBG from '/src/assets/movies/moviesBackground.jpg';

const Globe = () => {
  const sphereRef = useRef<Mesh>(null);

  useEffect(() => {
    if (sphereRef.current) {
      const sphere = sphereRef.current;

      sphere.rotation.y = Math.PI;

      const scene = sphere.getScene();
      scene.onBeforeRenderObservable.add(() => {
        sphere.rotation.y += 0.001;
      });
    }
  }, []);

  return (
    <sphere
      name="globe"
      ref={sphereRef}
      diameter={4} // גודל הגלובוס
      segments={64}
      position={new Vector3(0, 0, 0)}
    >
      <standardMaterial
        name="globeMaterial"
        diffuseTexture={new Texture(loginBG)}
        bumpTexture={
          new Texture('https://upload.wikimedia.org/wikipedia/commons/e/ed/Earth_Bump_Map.jpg')
        }
        specularTexture={
          new Texture('https://upload.wikimedia.org/wikipedia/commons/f/f0/Earth_Specular_Map.jpg')
        }
        emissiveColor={new Color3(0.2, 0.2, 0.6)}
        specularColor={new Color3(1, 1, 1)}
      />
    </sphere>
  );
};

const Text3D = () => {
  return (
    <mesh name="welcomeText" position={new Vector3(0, 3, 0)} rotation={new Vector3(0, Math.PI, 0)}>
      <textBlock
        name="text"
        text="Welcome"
        fontSize={24}
        fontFamily="Arial"
        color="white"
        resizeToFit
        textWrapping
      />
    </mesh>
  );
};

const MovieGlobe = () => {
  return (
    <>
      <style>
        {`
          #babylonCanvas {
            outline: none; 
            width: 100%; 
            height: 100%;
            margin:0; 
            padding:0;
          }
        `}
      </style>
      <Engine
        antialias
        adaptToDeviceRatio
        canvasId="babylonCanvas"
        engineOptions={{ preserveDrawingBuffer: true, premultipliedAlpha: false }}
      >
        <Scene clearColor={new Color4(0, 0, 0, 0)}>
          <hemisphericLight name="light" intensity={0.8} direction={new Vector3(0, 1, 0)} />
          <directionalLight
            name="directionalLight"
            intensity={1.2}
            direction={new Vector3(-5, 5, -5)}
          />
          <arcRotateCamera
            name="camera"
            target={Vector3.Zero()}
            alpha={Math.PI / 4}
            beta={Math.PI / 2.5}
            radius={6}
            minZ={0.1}
            lowerRadiusLimit={6}
            upperRadiusLimit={6}
            lowerBetaLimit={Math.PI / 4}
            upperBetaLimit={Math.PI / 1.5}
          />
          <Globe />
          <Text3D />
        </Scene>
      </Engine>
    </>
  );
};

export default MovieGlobe;

import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as THREE from "three";

import * as OBC from "openbim-components";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    const container = document.getElementById("container")!;

    const components = new OBC.Components();
    components.scene = new OBC.SimpleScene(components);
    components.renderer = new OBC.SimpleRenderer(components, container);
    components.camera = new OBC.SimpleCamera(components);
    components.raycaster = new OBC.SimpleRaycaster(components);

    components.init();

    const scene = components.scene.get();

    // scene.background = new THREE.Color("white");

    // @ts-expect-error: ts stupid err
    components.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

    new OBC.SimpleGrid(components, new THREE.Color("white"));

    const boxMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
    const boxGeometry = new THREE.BoxGeometry(3, 3, 3);
    const cube = new THREE.Mesh(boxGeometry, boxMaterial);
    cube.position.set(0, 1.5, 0);
    scene.add(cube);

    // @ts-expect-error: ts stupid err
    components.scene.setup();
  }, []);

  return (
    <div id="container" className="w-screen h-screen">
      {/* <h3>Welcome Homeeeeeee!</h3>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button>Click me</Button> */}
    </div>
  );
}

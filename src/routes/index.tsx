import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    const container = document.getElementById("container")!;

    const components = new OBC.Components();

    // set up the world ( A world represents a 3D environment in your application. It consists of a scene, a camera and (optionally) a renderer )
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.SimpleCamera(components);

    components.init();

    world.scene.three.background = null;

    // grids
    const grids = components.get(OBC.Grids);
    const grid = grids.create(world);
    console.log(grid);

    // cube
    const material = new THREE.MeshLambertMaterial({ color: "#6528D7" });
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, material);
    world.scene.three.add(cube);

    // it will set some basic lightings and stuffs
    world.scene.setup();

    // make the camera look at the cube
    world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

    // measure the performance
    const stats = new Stats();
    stats.showPanel(2);
    document.body.append(stats.dom);
    stats.dom.style.left = "0px";
    stats.dom.style.zIndex = "unset";
    world.renderer.onBeforeUpdate.add(() => stats.begin());
    world.renderer.onAfterUpdate.add(() => stats.end());

    // initialize cool ui
    BUI.Manager.init();

    // inputs panel
    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
        <bim-panel label="Worlds Tutorial" class="options-menu">
          <bim-panel-section collapsed label="Controls">
          
            <bim-color-input 
              label="Background Color" color="#202932" 
              @input="${({ target }: { target: BUI.ColorInput }) => {
                world.scene.three.background = new THREE.Color(target.color);
              }}">
            </bim-color-input>
            
            <bim-number-input 
              slider step="0.1" label="Directional lights intensity" value="1.5" min="0.1" max="10"
              @change="${({ target }: { target: BUI.NumberInput }) => {
                for (const child of world.scene.three.children) {
                  if (child instanceof THREE.DirectionalLight) {
                    child.intensity = target.value;
                  }
                }
              }}">
            </bim-number-input>
            
            <bim-number-input 
              slider step="0.1" label="Ambient light intensity" value="1" min="0.1" max="5"
              @change="${({ target }: { target: BUI.NumberInput }) => {
                for (const child of world.scene.three.children) {
                  if (child instanceof THREE.AmbientLight) {
                    child.intensity = target.value;
                  }
                }
              }}">
            </bim-number-input>
            
          </bim-panel-section>
        </bim-panel>
        `;
    });

    document.body.append(panel);

    const button = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
          <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
            @click="${() => {
              if (panel.classList.contains("options-menu-visible")) {
                panel.classList.remove("options-menu-visible");
              } else {
                panel.classList.add("options-menu-visible");
              }
            }}">
          </bim-button>
        `;
    });

    document.body.append(button);

    return () => {
      components.dispose();
    };
  }, []);

  return (
    <div id="container" className="full-screen">
      {/* <h3>Welcome Homeeeeeee!</h3>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button>Click me</Button> */}
    </div>
  );
}
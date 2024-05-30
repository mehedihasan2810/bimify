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

    let components = new OBC.Components();

    // set up the world ( A world represents a 3D environment in your application. It consists of a scene, a camera and (optionally) a renderer )
    let worlds = components.get(OBC.Worlds);
    let world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.OrthoPerspectiveCamera(components);

    components.init();

    // it will set some basic lightings and stuffs
    world.scene.setup();

    // make the camera look at the cube
    world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

    world.scene.three.background = null;

    // cube
    let cubeGeometry = new THREE.BoxGeometry();
    let cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0.5, 0);

    world.scene.three.add(cube);
    world.meshes.add(cube);

    // grids
    let grids = components.get(OBC.Grids);
    let grid = grids.create(world);
    console.log(grid);

    world.camera.projection.onChanged.add(() => {
      const projection = world.camera.projection.current;
      grid.fade = projection === "Perspective";
    });

    // need to initialize the Raycaster for this world so that the position of the mouse is tracked from the very first moment we use the clipping planes.
    const casters = components.get(OBC.Raycasters);
    casters.get(world);

    const clipper = components.get(OBC.Clipper);

    clipper.enabled = true;

    container.ondblclick = () => clipper.create(world);

    window.onkeydown = (event) => {
      if (event.code === "Delete" || event.code === "Backspace") {
        clipper.delete(world);
      }
    };

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
        <bim-panel label="Settings" class="options-menu">
          <bim-panel-section collapsed label="Lights">
          
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
        <bim-panel-section collapsed label="Clipper">

          <bim-checkbox label="Clipper enabled" checked 
            @change="${({ target }: { target: BUI.Checkbox }) => {
              clipper.enabled = target.value;
            }}">
          </bim-checkbox>
          
          <bim-checkbox label="Clipper visible" checked 
            @change="${({ target }: { target: BUI.Checkbox }) => {
              clipper.visible = target.value;
            }}">
          </bim-checkbox>
        
          <bim-color-input 
            label="Planes Color" color="#202932" 
            @input="${({ target }: { target: BUI.ColorInput }) => {
              clipper.material.color.set(target.color);
            }}">
          </bim-color-input>
          
          <bim-number-input 
            slider step="0.01" label="Planes opacity" value="0.2" min="0.1" max="1"
            @change="${({ target }: { target: BUI.NumberInput }) => {
              clipper.material.opacity = target.value;
            }}">
          </bim-number-input>
          
          <bim-number-input 
            slider step="0.1" label="Planes size" value="5" min="2" max="10"
            @change="${({ target }: { target: BUI.NumberInput }) => {
              clipper.size = target.value;
            }}">
          </bim-number-input>
          
          <bim-button 
            label="Delete all" 
            @click="${() => {
              clipper.deleteAll();
            }}">  
          </bim-button>        
          
          <bim-button 
            label="Rotate cube" 
            @click="${() => {
              cube.rotation.x = 2 * Math.PI * Math.random();
              cube.rotation.y = 2 * Math.PI * Math.random();
              cube.rotation.z = 2 * Math.PI * Math.random();
            }}">  
          </bim-button>
         
          
        </bim-panel-section>
        <bim-panel-section collapsed label="Camera">
         
        <bim-dropdown required label="Navigation mode" 
          @change="${({ target }: { target: BUI.Dropdown }) => {
            const selected = target.value[0] as OBC.NavModeID;

            const { current } = world.camera.projection;
            const isOrtho = current === "Orthographic";
            const isFirstPerson = selected === "FirstPerson";
            if (isOrtho && isFirstPerson) {
              alert("First person is not compatible with ortho!");
              target.value[0] = world.camera.mode.id;
              return;
            }
            world.camera.set(selected);
          }}">

        <bim-option checked label="Orbit"></bim-option>
        <bim-option label="FirstPerson"></bim-option>
        <bim-option label="Plan"></bim-option>
      </bim-dropdown>
       
    
      <bim-dropdown required label="Camera projection" 
          @change="${({ target }: { target: BUI.Dropdown }) => {
            const selected = target.value[0] as OBC.CameraProjection;
            const isOrtho = selected === "Orthographic";
            const isFirstPerson = world.camera.mode.id === "FirstPerson";
            if (isOrtho && isFirstPerson) {
              alert("First person is not compatible with ortho!");
              target.value[0] = world.camera.projection.current;
              return;
            }
            world.camera.projection.set(selected);
          }}">
        <bim-option checked label="Perspective"></bim-option>
        <bim-option label="Orthographic"></bim-option>
      </bim-dropdown>

      <bim-checkbox 
        label="Allow user input" checked 
        @change="${({ target }: { target: BUI.Checkbox }) => {
          world.camera.setUserInput(target.checked);
        }}">  
      </bim-checkbox>  
      
      <bim-button 
        label="Fit cube" 
        @click="${() => {
          world.camera.fit([cube]);
        }}">  
      </bim-button>

      <bim-button 
      label="Reset scene" 
      @click="${async () => {
        components.dispose();

        components = new OBC.Components();
        worlds = components.get(OBC.Worlds);

        world = worlds.create<
          OBC.SimpleScene,
          OBC.OrthoPerspectiveCamera,
          OBC.SimpleRenderer
        >();

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, container);
        world.camera = new OBC.OrthoPerspectiveCamera(components);

        world.scene.setup();

        await world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

        components.init();

        world.scene.three.background = null;

        cubeGeometry = new THREE.BoxGeometry();
        cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 0.5, 0);

        world.scene.three.add(cube);
        world.meshes.add(cube);

        grids = components.get(OBC.Grids);
        grid = grids.create(world);

        world.camera.projection.onChanged.add(() => {
          const projection = world.camera.projection.current;
          grid.fade = projection === "Perspective";
        });
      }}">  
    </bim-button>  

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
      clipper.deleteAll();
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

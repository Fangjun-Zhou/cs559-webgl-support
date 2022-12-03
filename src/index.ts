import { mainWorld } from "white-dwarf";
import { coreRenderContext } from "white-dwarf/src/Core/Context/RenderContext";
import { CoreStartProps } from "white-dwarf/src/Core/Context/SystemContext";
import { systemContext } from "white-dwarf/src/Core/CoreSetup";
import { TransformData3D } from "white-dwarf/src/Core/Locomotion/DataComponent/TransformData3D";
import { MeshRenderData3D } from "white-dwarf/src/Core/Render/DataComponent/MeshRenderData3D";
import { PerspectiveCameraData3D } from "white-dwarf/src/Core/Render/DataComponent/PerspectiveCameraData3D";
import { Material } from "white-dwarf/src/Core/Render/Material";
import { RenderSystem3DRegister } from "white-dwarf/src/Core/Render/RenderSystem3DRegister";
import { MainCameraInitSystem } from "white-dwarf/src/Core/Render/System/MainCameraInitSystem";
import { MainCameraTag } from "white-dwarf/src/Core/Render/TagComponent/MainCameraTag";
import {
  WorldSerializer,
  IWorldObject,
} from "white-dwarf/src/Core/Serialization/WorldSerializer";
import { EditorSystem3DRegister } from "white-dwarf/src/Editor/EditorSystem3DRegister";
import { EditorCamTagAppendSystem } from "white-dwarf/src/Editor/System/EditorCamTagAppendSystem";
import { Vector3 } from "white-dwarf/src/Mathematics/Vector3";

import default_vert from "white-dwarf/src/Core/Render/Shader/DefaultShader/default_vert.glsl";
import default_frag from "white-dwarf/src/Core/Render/Shader/DefaultShader/default_frag.glsl";

export const main = () => {
  systemContext.coreSetup = () => {
    if (coreRenderContext.mainCanvas) {
      new RenderSystem3DRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }
  };

  systemContext.coreStart = async (props: CoreStartProps) => {
    // If in editor mode, deserialize the world.
    if (props.worldObject) {
      WorldSerializer.deserializeWorld(mainWorld, props.worldObject);
    } else {
      // Read world.json.
      const worldObject = (await fetch("assets/cloth_world.json").then(
        (response) => response.json()
      )) as IWorldObject;
      // Deserialize the world.
      WorldSerializer.deserializeWorld(mainWorld, worldObject);
    }

    // Register main camera init system.
    mainWorld.registerSystem(MainCameraInitSystem);
  };

  systemContext.editorStart = () => {
    // Add a editor cam.
    mainWorld
      .createEntity("Editor Main Camera")
      .addComponent(TransformData3D, {
        position: new Vector3(0, 0, -10),
      })
      .addComponent(PerspectiveCameraData3D, {
        fov: Math.PI / 2,
      })
      .addComponent(MainCameraTag);

    // Register Editor System.
    if (coreRenderContext.mainCanvas) {
      new EditorSystem3DRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }

    // Add a entity with mesh render data.
    mainWorld
      .createEntity("WebGL Render Target")
      .addComponent(MeshRenderData3D, {
        material: new Material(
          coreRenderContext.mainCanvas?.getContext("webgl")!,
          default_vert,
          default_frag
        ),
      });

    // Setup editor scene camera.
    try {
      mainWorld.registerSystem(EditorCamTagAppendSystem);
    } catch (error) {
      console.error(error);
    }
  };
};

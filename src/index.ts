import { mainWorld } from "white-dwarf";
import { coreRenderContext } from "white-dwarf/src/Core/Context/RenderContext";
import { CoreStartProps } from "white-dwarf/src/Core/Context/SystemContext";
import { systemContext } from "white-dwarf/src/Core/CoreSetup";
import { TransformData3D } from "white-dwarf/src/Core/Locomotion/DataComponent/TransformData3D";
import { MeshRenderData3D } from "white-dwarf/src/Core/Render/DataComponent/MeshRenderData3D";
import { PerspectiveCameraData3D } from "white-dwarf/src/Core/Render/DataComponent/PerspectiveCameraData3D";
import {
  Material,
  MaterialDescriptor,
} from "white-dwarf/src/Core/Render/Material";
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
import { WebGLRenderPipelineRegister } from "white-dwarf/src/Core/Render/WebGLRenderPipelineRegister";
import { EditorSystemWebGLRegister } from "white-dwarf/src/Editor/EditorSystemWebGLRegister";
import { CubeMesh } from "white-dwarf/src/Utils/DefaultMeshes/CubeMesh";
import { MeshBuffer } from "white-dwarf/src/Core/Render/MeshBuffer";
import { OrthographicCameraData3D } from "white-dwarf/src/Core/Render/DataComponent/OrthographicCameraData3D";
import { CubeMeshGeneratorData } from "white-dwarf/src/Core/Render/DataComponent/MeshGenerator/CubeMeshGeneratorData";
import { MainCameraInitTag } from "white-dwarf/src/Core/Render/TagComponent/MainCameraInitTag";
import { Cam3DDragSystem } from "white-dwarf/src/Utils/System/Cam3DDragSystem";

export const main = () => {
  systemContext.coreSetup = () => {
    if (coreRenderContext.mainCanvas) {
      new WebGLRenderPipelineRegister(coreRenderContext.mainCanvas).register(
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
      const worldObject = (await fetch("world.json").then((response) =>
        response.json()
      )) as IWorldObject;
      // Deserialize the world.
      WorldSerializer.deserializeWorld(mainWorld, worldObject);
    }

    // Register main camera init system.
    mainWorld.registerSystem(MainCameraInitSystem, {
      priority: -100,
    });

    // Register game play systems.
    mainWorld.registerSystem(Cam3DDragSystem, {
      mainCanvas: coreRenderContext.mainCanvas,
    });
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
      new EditorSystemWebGLRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }

    // Add a runtime cam.
    mainWorld
      .createEntity("Runtime Main Camera")
      .addComponent(TransformData3D, {
        position: new Vector3(0, 0, -10),
      })
      .addComponent(PerspectiveCameraData3D, {
        fov: Math.PI / 2,
      })
      .addComponent(MainCameraInitTag);

    // Add a entity with mesh render data.
    const mat = new MaterialDescriptor(default_vert, default_frag);
    mainWorld
      .createEntity("WebGL Render Target")
      .addComponent(TransformData3D, {
        position: new Vector3(0, 0, 0),
      })
      .addComponent(CubeMeshGeneratorData, {
        size: new Vector3(1, 1, 1),
      })
      .addComponent(MeshRenderData3D, {
        materialDesc: mat,
      });

    // Setup editor scene camera.
    try {
      mainWorld.registerSystem(EditorCamTagAppendSystem);
    } catch (error) {
      console.error(error);
    }
  };
};

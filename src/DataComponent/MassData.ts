import { Component, ComponentSchema, Types } from "white-dwarf/ecsy";
import { IComponent } from "white-dwarf/src/Core/ComponentRegistry";

@IComponent.register
export class MassData extends Component<MassData> {
  static schema: ComponentSchema = {
    mass: {
      type: Types.Number,
      default: 1,
    },
  };

  mass: number = 1;
}

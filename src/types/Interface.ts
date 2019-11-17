import { isType, Type } from ".";

export type InterfaceContent =
    | { optional: boolean; value: Type; multiType: false }
    | {
          optional: boolean;
          value: Type[];
          multiType: true;
      };

export interface Interface {
    [id: string]: InterfaceContent;
}

export const isInterface = (input: any): input is Interface => {
    if (typeof input !== "object") {
        return false;
    }
    const { optional, multiType } = input;
    if (
        typeof optional !== "boolean" ||
        typeof multiType !== "boolean"
    ) {
        return false;
    }
    if (multiType) {
        if (!input.value) {
            return false;
        }
        if (!isType(input.value)) {
            return false;
        }
    } else {
        if (!input.values || !(input.values instanceof Array)) {
            return false;
        }
        const values = input.values as any[];
        if (!values.every(v => isType(v))) {
            return false;
        }
    }
    return true;
};

export interface InterfaceData {
    name: string;
    interface: Interface;
}

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

export type InterfaceMap = { [id: string]: Interface };

export const isInterface = (input: any): input is Interface => {
    if (typeof input !== "object") {
        return false;
    }
    // Is all content of the object InterfaceContent
    if (Object.values(input).every(v => isInterfaceContent(v))) {
        return true;
    }
    return false;
};

export const isInterfaceContent = (
    input: any
): input is InterfaceContent => {
    if (typeof input !== "object") {
        return false;
    }
    const { optional, value, multiType } = input;
    if (optional == null || value == null || multiType == null) {
        return false;
    }
    if (
        typeof optional !== "boolean" ||
        typeof multiType !== "boolean"
    ) {
        return false;
    }
    if (multiType) {
        if (value instanceof Array && value.every(v => isType(v))) {
            return true;
        }
    } else if (isType(value)) {
        return true;
    }
    return false;
};

export interface InterfaceData {
    name: string;
    interface: Interface;
}

import { FileWrapper } from "../types";
import CompilerError from "./CompilerError";
import { FileWrapperCompiler } from "./FileWrapperCompiler";

export * from "./Compiler";
export * from "./CompilerError";
export * from "./FileWrapperCompiler";
export * from "./IdentifierCompiler";
export * from "./scope";

const compile = (
    wrapper: FileWrapper,
    file: string,
    debug = false
): string | null => {
    if (debug) return FileWrapperCompiler(wrapper);
    else {
        try {
            return FileWrapperCompiler(wrapper);
        } catch (e) {
            if (e instanceof CompilerError) {
                console.log(e.prettyPrint(file));
                return null;
            } else {
                throw new Error("Internal error");
            }
        }
    }
};

export default compile;

import { legacyBuild } from "./engines/legacy";
import { CompilationResult } from "./types";
import path from 'path';
import process from 'process';
import { wasmBuild } from "./engines/wasm";
import { wasmFsBuild } from "./engines/wasmFs";

type Version =
    | 'v2022.10'
    | 'v2022.12'
    | 'v2023.01'
    | 'legacy'

export async function compileContract(opts: { files: string[], version?: Version | 'latest', stdlib?: boolean | null | undefined, workdir?: string | null | undefined }): Promise<CompilationResult> {

    // Resolve stdlib
    let stdlib = true;
    if (opts.stdlib === false) {
        opts.stdlib = false;
    }

    // Resolve version
    let version: Version = 'v2023.01'; // Latest
    if (opts.version !== 'latest' && typeof opts.version === 'string') {
        version = opts.version;
    }

    // Resolve working directory
    let workdir = process.cwd();
    if (typeof opts.workdir === 'string') {
        workdir = path.resolve(opts.workdir);
    }

    // Resolve relative paths
    let files: string[] = [];
    for (let f of opts.files) {
        // Check that file is indeed within workdir
        let relative = path.relative(workdir, f);
        let resolved = path.resolve(workdir, relative);
        if (!resolved.startsWith(workdir)) {
            throw Error('File "' + f + '" is not under workdir "' + workdir + '"');
        }
        files.push(relative);
    }

    // Compile
    if (version === 'legacy') {
        return await legacyBuild({ files: files, stdlib, workdir });
    } else if (version === 'v2022.10') {
        return await wasmFsBuild({ files: files, version, stdlib, workdir });
    } else if (version === 'v2022.12') {
        return await wasmBuild({ files: files, version, stdlib, workdir });
    } else if (version === 'v2023.01') {
        return await wasmBuild({ files: files, version, stdlib, workdir });
    } else {
        throw Error('Unsupported compiler version ' + version);
    }
}
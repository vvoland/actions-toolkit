"use strict";
/**
 * Copyright 2024 actions-toolkit authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Install = void 0;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const core = __importStar(require("@actions/core"));
const httpm = __importStar(require("@actions/http-client"));
const tc = __importStar(require("@actions/tool-cache"));
const semver = __importStar(require("semver"));
const util = __importStar(require("util"));
const cache_1 = require("../cache");
const context_1 = require("../context");
class Install {
    /*
     * Download undock binary from GitHub release
     * @param v: version semver version or latest
     * @param ghaNoCache: disable binary caching in GitHub Actions cache backend
     * @returns path to the undock binary
     */
    download(v, ghaNoCache) {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield Install.getDownloadVersion(v);
            core.debug(`Install.download version: ${version.version}`);
            const release = yield Install.getRelease(version);
            core.debug(`Install.download release tag name: ${release.tag_name}`);
            const vspec = yield this.vspec(release.tag_name);
            core.debug(`Install.download vspec: ${vspec}`);
            const c = semver.clean(vspec) || '';
            if (!semver.valid(c)) {
                throw new Error(`Invalid Undock version "${vspec}".`);
            }
            const installCache = new cache_1.Cache({
                htcName: 'undock-dl-bin',
                htcVersion: vspec,
                baseCacheDir: path_1.default.join(os_1.default.homedir(), '.bin'),
                cacheFile: os_1.default.platform() == 'win32' ? 'undock.exe' : 'undock',
                ghaNoCache: ghaNoCache
            });
            const cacheFoundPath = yield installCache.find();
            if (cacheFoundPath) {
                core.info(`Unodck binary found in ${cacheFoundPath}`);
                return cacheFoundPath;
            }
            const downloadURL = util.format(version.downloadURL, vspec, this.filename(vspec));
            core.info(`Downloading ${downloadURL}`);
            const htcDownloadPath = yield tc.downloadTool(downloadURL);
            core.debug(`Install.download htcDownloadPath: ${htcDownloadPath}`);
            let htcExtPath;
            if (os_1.default.platform() == 'win32') {
                htcExtPath = yield tc.extractZip(htcDownloadPath);
            }
            else {
                htcExtPath = yield tc.extractTar(htcDownloadPath);
            }
            core.info(`Extracted to ${htcExtPath}`);
            const exePath = path_1.default.join(htcExtPath, os_1.default.platform() == 'win32' ? 'undock.exe' : 'undock');
            core.debug(`Install.download exePath: ${exePath}`);
            const cacheSavePath = yield installCache.save(exePath);
            core.info(`Cached to ${cacheSavePath}`);
            return cacheSavePath;
        });
    }
    install(binPath, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            dest = dest || context_1.Context.tmpDir();
            const binDir = path_1.default.join(dest, 'undock-bin');
            if (!fs_1.default.existsSync(binDir)) {
                fs_1.default.mkdirSync(binDir, { recursive: true });
            }
            const binName = os_1.default.platform() == 'win32' ? 'undock.exe' : 'undock';
            const undockPath = path_1.default.join(binDir, binName);
            fs_1.default.copyFileSync(binPath, undockPath);
            core.info('Fixing perms');
            fs_1.default.chmodSync(undockPath, '0755');
            core.addPath(binDir);
            core.info('Added Unodck to PATH');
            core.info(`Binary path: ${undockPath}`);
            return undockPath;
        });
    }
    filename(version) {
        let arch;
        switch (os_1.default.arch()) {
            case 'x64': {
                arch = 'amd64';
                break;
            }
            case 'ppc64': {
                arch = 'ppc64le';
                break;
            }
            case 'arm': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const arm_version = process.config.variables.arm_version;
                arch = arm_version ? 'armv' + arm_version : 'arm';
                break;
            }
            default: {
                arch = os_1.default.arch();
                break;
            }
        }
        const platform = os_1.default.platform() == 'win32' ? 'windows' : os_1.default.platform();
        const ext = os_1.default.platform() == 'win32' ? '.zip' : '.tar.gz';
        return util.format('undock_%s_%s_%s%s', version, platform, arch, ext);
    }
    vspec(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = version.replace(/^v+|v+$/g, '');
            core.info(`Use ${v} version spec cache key for ${version}`);
            return v;
        });
    }
    static getDownloadVersion(v) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                version: v,
                downloadURL: 'https://github.com/crazy-max/undock/releases/download/v%s/%s',
                releasesURL: 'https://raw.githubusercontent.com/docker/actions-toolkit/main/.github/undock-releases.json'
            };
        });
    }
    static getRelease(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const http = new httpm.HttpClient('docker-actions-toolkit');
            const resp = yield http.get(version.releasesURL);
            const body = yield resp.readBody();
            const statusCode = resp.message.statusCode || 500;
            if (statusCode >= 400) {
                throw new Error(`Failed to get Undock releases from ${version.releasesURL} with status code ${statusCode}: ${body}`);
            }
            const releases = JSON.parse(body);
            if (!releases[version.version]) {
                throw new Error(`Cannot find Undock release ${version.version} in ${version.releasesURL}`);
            }
            return releases[version.version];
        });
    }
}
exports.Install = Install;
//# sourceMappingURL=install.js.map
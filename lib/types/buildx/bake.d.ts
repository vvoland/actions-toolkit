/**
 * Copyright 2023 actions-toolkit authors
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
export interface BakeDefinition {
    group: Record<string, Group>;
    target: Record<string, Target>;
}
export interface Group {
    targets: Array<string>;
}
export interface Target {
    args?: Record<string, string>;
    attest?: Array<string>;
    'cache-from'?: Array<string>;
    'cache-to'?: Array<string>;
    context: string;
    contexts?: Record<string, string>;
    dockerfile: string;
    'dockerfile-inline'?: string;
    labels?: Record<string, string>;
    'no-cache'?: boolean;
    'no-cache-filter'?: Array<string>;
    output?: Array<string>;
    platforms?: Array<string>;
    pull?: boolean;
    secret?: Array<string>;
    'shm-size'?: string;
    ssh?: Array<string>;
    tags?: Array<string>;
    target?: string;
    ulimits?: Array<string>;
}

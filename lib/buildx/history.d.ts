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
import { Buildx } from './buildx';
import { ExportRecordOpts, ExportRecordResponse } from '../types/buildx/history';
export interface HistoryOpts {
    buildx?: Buildx;
}
export declare class History {
    private readonly buildx;
    private static readonly EXPORT_BUILD_IMAGE_DEFAULT;
    private static readonly EXPORT_BUILD_IMAGE_ENV;
    constructor(opts?: HistoryOpts);
    export(opts: ExportRecordOpts): Promise<ExportRecordResponse>;
}

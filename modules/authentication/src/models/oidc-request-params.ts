/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * OIDC request parameters.
 */
export interface OIDCRequestParamsInterface {
    clientId: string;
    clientHost: string;
    clientSecret?: string;
    enablePKCE: boolean;
    prompt?: string;
    redirectUri: string;
    scope?: string[];
    serverOrigin: string;
}

/**
 * Interface for the account switch grant
 * request parameters.
 */
export interface AccountSwitchRequestParams {
    grant_type: string;
    username: string;
    "userstore-domain": string;
    "tenant-domain": string;
    token: string;
    scope: string[];
    client_id: string;
    clientHost: string;
    serverOrigin: string;
}

/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { AlertLevels, ProfileSchema } from "../../models";
import { AuthAction, authenticateActionTypes } from "./types";
import {
    AuthenticateSessionUtil,
    AuthenticateTokenKeys,
    OIDCRequestParamsInterface,
    OPConfigurationUtil,
    SignInUtil,
    SignOutUtil
} from "@wso2is/authentication";
import { setProfileInfoLoader, setProfileSchemaLoader } from "./loaders";
import _ from "lodash";
import { addAlert } from "@wso2is/core/store";
import { getProfileInfo } from "@wso2is/core/api";
import { getProfileSchemas } from "../../api";
import { history } from "../../helpers";
import { I18n } from "@wso2is/i18n";
import { store } from "../index";
import { SYSTEM_SCOPE } from "../../constants";

/**
 * Dispatches an action of type `SET_SIGN_IN`.
 */
export const setSignIn = (): AuthAction => ({
    type: authenticateActionTypes.SET_SIGN_IN
});

/**
 * Dispatches an action of type `SET_SIGN_OUT`.
 */
export const setSignOut = (): AuthAction => ({
    type: authenticateActionTypes.SET_SIGN_OUT
});

/**
 * Dispatches an action of type `RESET_AUTHENTICATION`.
 */
export const resetAuthentication = (): AuthAction => ({
    type: authenticateActionTypes.RESET_AUTHENTICATION
});

/**
 * Dispatches an action of type `SET_PROFILE_INFO`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const setProfileInfo = (details: any): AuthAction => ({
    payload: details,
    type: authenticateActionTypes.SET_PROFILE_INFO
});

/**
 * Dispatches an action of type `SET_SCHEMAS`
 * @param schemas
 */
export const setScimSchemas = (schemas: ProfileSchema[]): AuthAction => ({
    payload: schemas,
    type: authenticateActionTypes.SET_SCHEMAS
});

/**
 * Get SCIM2 schemas
 */
export const getScimSchemas = () => (dispatch): void => {
    dispatch(setProfileSchemaLoader(true));
    getProfileSchemas()
        .then((response: ProfileSchema[]) => {
            dispatch(setProfileSchemaLoader(false));
            dispatch(setScimSchemas(response));
        });
};

/**
 *  Gets profile information by making an API call
 */
export const getProfileInformation = () => (dispatch): void => {

    dispatch(setProfileInfoLoader(true));

    // Get the profile info.
    // TODO: Add the function to handle SCIM disabled error.
    getProfileInfo(null)
        .then((infoResponse) => {
            if (infoResponse.responseStatus === 200) {
                dispatch(
                    setProfileInfo({
                        ...infoResponse
                    })
                );

                // If the schemas in the redux store is empty, fetch the SCIM schemas from the API.
                if (_.isEmpty(store.getState().authenticationInformation.profileSchemas)) {
                    dispatch(getScimSchemas());
                }

                return;
            }

            dispatch(
                addAlert({
                    description: I18n.instance.t(
                        "devPortal:components.user.profile.notifications.getProfileInfo.genericError.description"
                    ),
                    level: AlertLevels.ERROR,
                    message: I18n.instance.t(
                        "devPortal:components.user.profile.notifications.getProfileInfo.genericError.message"
                    )
                })
            );
        })
        .catch((error) => {
            if (error.response && error.response.data && error.response.data.detail) {
                dispatch(
                    addAlert({
                        description: I18n.instance.t(
                            "devPortal:components.user.profile.notifications.getProfileInfo.error.description",
                            { description: error.response.data.detail }
                        ),
                        level: AlertLevels.ERROR,
                        message: I18n.instance.t(
                            "devPortal:components.user.profile.notifications.getProfileInfo.error.message"
                        )
                    })
                );

                return;
            }

            dispatch(
                addAlert({
                    description: I18n.instance.t(
                        "devPortal:components.user.profile.notifications.getProfileInfo.genericError.description"
                    ),
                    level: AlertLevels.ERROR,
                    message: I18n.instance.t(
                        "devPortal:components.user.profile.notifications.getProfileInfo.genericError.message"
                    )
                })
            );
        })
        .finally(() => {
            dispatch(setProfileInfoLoader(false));
        });
};


/**
 * Handle user sign-out
 */
export const handleSignOut = () => (dispatch): void => {
    if (sessionStorage.length === 0) {
        history.push(store.getState().config.deployment.appLoginPath);
    } else {
        SignOutUtil.sendSignOutRequest(store.getState().config.deployment.loginCallbackUrl, () => {
                dispatch(setSignOut());
                AuthenticateSessionUtil.endAuthenticatedSession();
                OPConfigurationUtil.resetOPConfiguration();
            }).catch(() => {
                history.push(store.getState().config.deployment.appLoginPath);
            });
    }
};

/**
 * Handle user sign-in
 */
export const handleSignIn = (consentDenied = false) => (dispatch): void => {
    const requestParams: OIDCRequestParamsInterface = {
        clientHost: store.getState().config.deployment.clientHost,
        clientId: store.getState().config.deployment.clientID,
        clientSecret: null,
        enablePKCE: true,
        redirectUri: store.getState().config.deployment.loginCallbackUrl,
        scope: [ SYSTEM_SCOPE ],
        serverOrigin: store.getState().config.deployment.serverOrigin,
        tenant: store.getState().config.deployment.tenant
    };

    const sendSignInRequest = (): void => {
        if (consentDenied) {
            requestParams.prompt = "login";
        }

        if (SignInUtil.hasAuthorizationCode()) {
            SignInUtil.sendTokenRequest(requestParams)
                .then((response) => {
                    AuthenticateSessionUtil.initUserSession(
                        response,
                        SignInUtil.getAuthenticatedUser(response.idToken)
                    );
                    dispatch(setSignIn());
                    dispatch(getProfileInformation());
                })
                .catch((error) => {
                    if (error.response.status === 400) {
                        SignInUtil.sendAuthorizationRequest(requestParams);
                    }

                    throw error;
                });
        } else {
            SignInUtil.sendAuthorizationRequest(requestParams);
        }
    };

    if (AuthenticateSessionUtil.getSessionParameter(AuthenticateTokenKeys.ACCESS_TOKEN)) {
        if (OPConfigurationUtil.isValidOPConfig(requestParams.tenant)) {
            AuthenticateSessionUtil.endAuthenticatedSession();
            OPConfigurationUtil.resetOPConfiguration();
            handleSignOut();
        }

        dispatch(setSignIn());
        dispatch(getProfileInformation());
    } else {
        OPConfigurationUtil.initOPConfiguration(store.getState().config.endpoints.wellKnown, false)
            .then(() => {
                sendSignInRequest();
            })
            .catch(() => {
                OPConfigurationUtil.setAuthorizeEndpoint(store.getState().config.endpoints.authorize);
                OPConfigurationUtil.setTokenEndpoint(store.getState().config.endpoints.token);
                OPConfigurationUtil.setRevokeTokenEndpoint(store.getState().config.endpoints.revoke);
                OPConfigurationUtil.setEndSessionEndpoint(store.getState().config.endpoints.logout);
                OPConfigurationUtil.setJwksUri(store.getState().config.endpoints.jwks);
                OPConfigurationUtil.setIssuer(store.getState().config.endpoints.issuer);
                OPConfigurationUtil.setOPConfigInitiated();

                sendSignInRequest();
            });
    }
};

/**
 * Update sessionStorage with location history path
 *
 * @param {string} location - history path.
 */
export const updateAuthenticationCallbackUrl = (location): void => {
    window.sessionStorage.setItem("auth_callback_url", location);
};

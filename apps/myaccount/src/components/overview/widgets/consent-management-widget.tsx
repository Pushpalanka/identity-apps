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

import React, { FunctionComponent, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { WidgetIcons } from "../../../configs";
import { AppConstants } from "../../../constants";
import { history } from "../../../helpers";
import { SettingsSection } from "../../shared";

/**
 * Consent management widget.
 *
 * @return {ReactElement}
 */
export const ConsentManagementWidget: FunctionComponent<{}> = (): ReactElement => {

    const { t } = useTranslation();

    const navigate = () => {
        history.push(AppConstants.getPaths().get("SECURITY"));
    };

    return (
        <div className="widget consent-management">
            <SettingsSection
                header={ t("userPortal:components.overview.widgets.consentManagement.header") }
                description={ t("userPortal:components.overview.widgets.consentManagement.description") }
                primaryAction={ t("userPortal:components.overview.widgets.consentManagement.actionTitles.manage") }
                onPrimaryActionClick={ navigate }
                icon={ WidgetIcons.consents }
                iconMini={ WidgetIcons.consents }
                iconSize="tiny"
                iconStyle="twoTone"
            />
        </div>
    );
};

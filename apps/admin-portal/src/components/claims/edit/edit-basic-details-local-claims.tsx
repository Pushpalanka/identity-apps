/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React from "react";
import { AlertLevels, Claim } from "../../../models";
import { Field, Forms } from "@wso2is/forms";
import { Divider, Form, Grid } from "semantic-ui-react";
import { updateAClaim } from "../../../api";
import { useDispatch } from "react-redux";
import { addAlert } from "@wso2is/core/store";
import { CopyInputField, Hint } from "@wso2is/react-components";

/**
 * Prop types for `EditBasicDetailsLocalClaims` component
 */
interface EditBasicDetailsLocalClaimsPropsInterface {
    /**
     * The claim to be edited
     */
    claim: Claim;
    /**
     * The function to be called to initiate an update
     */
    update: () => void;
}

/**
 * This component renders the Basic Details pane of the edit local claim screen
 * @param {EditBasicDetailsLocalClaimsPropsInterface} props
 * @return {React.ReactElement}
 */
export const EditBasicDetailsLocalClaims = (
    props: EditBasicDetailsLocalClaimsPropsInterface
): React.ReactElement => {

    const dispatch = useDispatch();

    const { claim, update } = props;

    return (
        <>
            <Grid>
                <Grid.Row columns={ 1 }>
                    <Grid.Column tablet={ 16 } computer={ 12 } largeScreen={ 9 } widescreen={ 6 } mobile={ 16 }>
                        <Form>
                            <Form.Field>
                                <label>Claim URI</label>
                                <CopyInputField value={ claim ? claim.claimURI : "" } />
                            </Form.Field>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Forms
                onSubmit={ (values) => {
                    const data: Claim = {
                        claimURI: claim.claimURI,
                        description: values.get("description").toString(),
                        displayOrder: parseInt(values.get("displayOrder").toString()),
                        regEx: values.get("regularExpression").toString(),
                        displayName: values.get("name").toString(),
                        attributeMapping: claim.attributeMapping,
                        properties: claim.properties,
                        supportedByDefault: values.get("supportedByDefault").length > 0,
                        readOnly: values.get("readOnly").length > 0,
                        required: values.get("required").length > 0

                    }
                    updateAClaim(claim.id, data).then(() => {
                        dispatch(addAlert(
                            {
                                description: "The basic details of the local claim have been updated successfully!",
                                level: AlertLevels.SUCCESS,
                                message: "Basic details updated successfully"
                            }
                        ));
                        update();
                    }).catch(error => {
                        dispatch(addAlert(
                            {
                                description: error?.description || "There was an error while updating the local claim",
                                level: AlertLevels.ERROR,
                                message: error?.message || "Something went wrong"
                            }
                        ));
                    })
                } }
            >
                <Grid>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column tablet={ 16 } computer={ 12 } largeScreen={ 9 } widescreen={ 6 } mobile={ 16 }>
                            <Field
                                type="text"
                                name="name"
                                label="Name"
                                required={ true }
                                requiredErrorMessage="Name is required"
                                placeholder="Enter a name for the claim"
                                value={ claim?.displayName }
                            />
                            <Hint>
                                Name of the claim displayed on the profile page and the self-registration page
                            </Hint>
                            <Divider hidden />
                            <Field
                                type="textarea"
                                name="description"
                                label="Description"
                                required={ true }
                                requiredErrorMessage="Description is required"
                                placeholder="Enter a description"
                                value={ claim?.description }
                            />
                            <Field
                                type="text"
                                name="regularExpression"
                                label="Regular Expression"
                                required={ false }
                                requiredErrorMessage=""
                                placeholder="Regular expression to validate the claim"
                                value={ claim?.regEx }
                            />
                            <Hint>Regular Expression used to validate inputs</Hint>
                            <Divider hidden />
                            <Field
                                type="number"
                                min="0"
                                name="displayOrder"
                                label="Display Order"
                                required={ false }
                                requiredErrorMessage=""
                                placeholder="Enter the display order"
                                value={ claim?.displayOrder.toString() }
                            />
                            <Hint>
                                Integer value to specify the order in which the claim is displayed among 
                                other claims under the same dialect
                            </Hint>
                            <Divider hidden={ true } />
                            <Field
                                type="checkbox"
                                name="supportedByDefault"
                                required={ false }
                                requiredErrorMessage=""
                                children={ [{ value: "Support", label: "Show on Profile" }] }
                                value={ claim?.supportedByDefault ? ["Support"] : [] }
                            />
                            <Hint>
                                Specifies if the claim will be prompted during user registration and displayed on the user profile
                            </Hint>
                            <Divider hidden />
                            <Field
                                type="checkbox"
                                name="required"
                                required={ false }
                                requiredErrorMessage=""
                                children={ [{ value: "Required", label: "Required" }] }
                                value={ claim?.required ? ["Required"] : [] }
                            />
                            <Hint>
                                Specifies if the claim is required for user registration
                            </Hint>
                            <Divider hidden />
                            <Field
                                type="checkbox"
                                name="readOnly"
                                required={ false }
                                requiredErrorMessage=""
                                children={ [{ value: "ReadOnly", label: "Read Only" }] }
                                value={ claim?.readOnly ? ["ReadOnly"] : [] }
                            />
                            <Hint>
                                Specifies if the claim is read-only
                            </Hint>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column width={ 6 }>
                            <Field
                                type="submit"
                                value="Update"
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Forms>
        </>
    )
};

/*
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CreateDeployment } from 'modules/Circles/Release/interfaces/Deployment';
import { postRequest, baseRequest } from './base';

const v2Endpoint = '/moove/v2/deployments';

export const createDeployment = (data: CreateDeployment) =>
  postRequest(v2Endpoint, data);

export const undeploy = (deploymentId: string) =>
  postRequest(`${v2Endpoint}/${deploymentId}/undeploy`);

export const getDeployHistoryByCircleId = (
  params: URLSearchParams,
  circleId: string
) => {
  params.append('size', '10');
  return baseRequest(`${v2Endpoint}/circle/${circleId}/history?${params}`);
}

export const findDeployLogsByDeploymentId = (deploymentId: string) =>
  baseRequest(`${v2Endpoint}/${deploymentId}/logs`);

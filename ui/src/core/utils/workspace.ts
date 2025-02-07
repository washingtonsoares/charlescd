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

import { Workspace } from 'modules/Workspaces/interfaces/Workspace';

const WORKSPACE = 'workspace';

export const clearWorkspace = () => {
  localStorage.removeItem(WORKSPACE);
}

export const getWorkspace = (): Workspace => {
  const ws = {
    id: ''
  } as Workspace;

  try {
    const workspace : Workspace = JSON.parse(localStorage.getItem(WORKSPACE));
    return workspace || ws;
  
  } catch (e) {
    return ws;
  }
}

export const getWorkspaceId = () => {
  const workspace = getWorkspace();
  return workspace.id;
}

export const saveWorkspace = (workspace: Workspace) => {
  clearWorkspace();

  if (workspace) {
    localStorage.setItem(WORKSPACE, JSON.stringify(workspace));
  }
};

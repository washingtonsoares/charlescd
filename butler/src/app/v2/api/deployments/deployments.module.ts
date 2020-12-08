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

import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CdConfigurationEntity } from '../../../v1/api/configurations/entity'
import { CdConfigurationsRepository } from '../../../v1/api/configurations/repository'
import { SpinnakerApiService } from '../../../v1/core/integrations/cd/spinnaker/spinnaker-api.service'
import { MooveService } from '../../../v1/core/integrations/moove'
import { ConsoleLoggerService } from '../../../v1/core/logs/console'
import { DeploymentsController } from './controller/deployments.controller'
import { DeploymentEntityV2 as DeploymentEntity } from './entity/deployment.entity'
import { Execution } from './entity/execution.entity'
import { PgBossWorker } from './jobs/pgboss.worker'
import { DeploymentCleanupHandler } from './use-cases/deployment-cleanup-handler'
import { DeploymentHandlerUseCase } from './use-cases/deployment-handler.usecase'
import { ReceiveNotificationUseCase } from './use-cases/receive-notification.usecase'
import { SpinnakerConnector } from '../../core/integrations/spinnaker/connector'
import { ComponentsRepositoryV2 } from './repository'
import { CreateDeploymentUseCase } from './use-cases/create-deployment.usecase'
import { CreateUndeploymentUseCase } from './use-cases/create-undeployment.usecase'
import { DeploymentRepositoryV2 } from './repository/deployment.repository'
import { ExecutionRepository } from './repository/execution.repository'
import { ExecutionsController } from './controller/executions.controller'
import { PaginatedExecutionsUseCase } from './use-cases/paginated-executions.usecase'
import { CdStrategyFactory } from '../../core/integrations/cd-strategy-factory'
import { OctopipeConnector } from '../../core/integrations/octopipe/connector'
import { OctopipeApi } from '../../core/integrations/octopipe/octopipe-api'
import { HelmManifest } from '../../core/manifests/helm/helm-manifest'
import { GitHubRepository } from '../../core/integrations/github/github-repository'
import { GitLabRepository } from '../../core/integrations/gitlab/gitlab-repository'
import { RepositoryStrategyFactory } from '../../core/integrations/repository-strategy-factory'
import { K8sClient } from '../../core/integrations/k8s/client'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      DeploymentEntity,
      Execution,
      CdConfigurationEntity,
      CdConfigurationsRepository,
      ComponentsRepositoryV2,
      ExecutionRepository,
      DeploymentRepositoryV2
    ])
  ],
  controllers: [
    DeploymentsController,
    ExecutionsController
  ],
  providers: [
    PgBossWorker,
    CreateDeploymentUseCase,
    CreateUndeploymentUseCase,
    ReceiveNotificationUseCase,
    DeploymentHandlerUseCase,
    PaginatedExecutionsUseCase,
    MooveService,
    DeploymentCleanupHandler,
    ConsoleLoggerService,
    SpinnakerConnector,
    SpinnakerApiService,
    CdStrategyFactory,
    OctopipeConnector,
    OctopipeApi,
    GitHubRepository,
    GitLabRepository,
    RepositoryStrategyFactory,
    HelmManifest,
    K8sClient
  ],
  exports: [
  ]
})
export class DeploymentsModule { }

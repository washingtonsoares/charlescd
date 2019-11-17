import { CreateModuleDeploymentDto } from './create-module-deployment.dto'
import { CreateCircleDeploymentDto } from './create-circle-deployment.dto'
import { DeploymentEntity } from '../entity'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

export class CreateDeploymentDto {

  public readonly deploymentId: string

  public readonly valueFlowId: string

  @ValidateNested({ each: true })
  @Type(() => CreateModuleDeploymentDto)
  public readonly modules: CreateModuleDeploymentDto[]

  public readonly authorId: string

  public readonly description: string

  public readonly callbackUrl: string

  public readonly defaultCircle: boolean

  @ValidateNested({ each: true })
  @Type(() => CreateCircleDeploymentDto)
  public readonly circle: CreateCircleDeploymentDto

  public toEntity(circleId: string): DeploymentEntity {
    return new DeploymentEntity(
      this.deploymentId,
      this.valueFlowId,
      this.modules.map(module => module.toEntity()),
      this.authorId,
      this.description,
      this.callbackUrl,
      this.circle.toEntity(),
      this.defaultCircle,
      circleId
    )
  }
}

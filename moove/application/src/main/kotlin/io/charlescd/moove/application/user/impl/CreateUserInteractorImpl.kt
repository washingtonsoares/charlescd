package io.charlescd.moove.application.user.impl

import io.charlescd.moove.application.UserService
import io.charlescd.moove.application.user.CreateUserInteractor
import io.charlescd.moove.application.user.request.CreateUserRequest
import io.charlescd.moove.application.user.response.UserResponse
import io.charlescd.moove.domain.MooveErrorCode
import io.charlescd.moove.domain.User
import io.charlescd.moove.domain.exceptions.BusinessException
import io.charlescd.moove.domain.exceptions.ForbiddenException
import io.charlescd.moove.domain.exceptions.NotFoundException
import java.util.*
import javax.inject.Inject
import javax.inject.Named
import org.springframework.beans.factory.annotation.Value

@Named
class CreateUserInteractorImpl @Inject constructor(
    private val userService: UserService,
    @Value("\${charles.internal.idm.enabled:true}") private val internalIdmEnabled: Boolean
) : CreateUserInteractor {

    override fun execute(createUserRequest: CreateUserRequest, authorization: String): UserResponse {
        val newUser = createUserRequest.toUser()
        val password = createUserRequest.password
        val userFromToken = getUserFromToken(authorization)
        userFromToken.ifPresentOrElse({
            createUserWhenUserFromTokenExists(it, newUser, password)
        }, {
            createOwnUser(userService.getEmailFromToken(authorization), newUser, password)
        })
        return UserResponse.from(newUser)
    }

    private fun getUserFromToken(authorization: String): Optional<User> {
        try {
            val user = userService.findByAuthorizationToken(authorization)
            return Optional.of(user)
        } catch (ex: NotFoundException) {
            return Optional.empty()
        }
    }

    private fun createOwnUser(emailFromToken: String, newUser: User, password: String?) {
        if (emailFromToken == newUser.email) {
            saveUser(newUser.copy(root = false), password)
        } else {
            throw ForbiddenException()
        }
    }

    private fun createUserWhenUserFromTokenExists(it: User, newUser: User, password: String?) {
        if (it.root) {
            saveUser(newUser, password)
        } else {
            throw ForbiddenException()
        }
    }

    private fun saveUser(newUser: User, password: String?) {
        userService.checkIfEmailAlreadyExists(newUser)
        userService.save(newUser)

        if (internalIdmEnabled) {
            saveUserOnKeycloak(newUser, password)
        }
    }

    private fun saveUserOnKeycloak(user: User, password: String?) {
        if (password.isNullOrBlank()) throw BusinessException.of(MooveErrorCode.MISSING_PARAMETER).withParameters("password")
        this.userService.createUserOnKeycloak(
            user.email,
            user.name,
            password
        )
    }
}

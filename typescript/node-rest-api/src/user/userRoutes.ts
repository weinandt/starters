import type { paths } from "../schema";
import { Router } from 'express'
import { UserInteractor } from "./userInteractor";

export type GetUserRequestParameters =
  paths["/users/{id}"]["get"]["parameters"]["path"];

export type GetUserResponse =
  paths["/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type CreateUserRequestBody =
  paths["/users"]["post"]["requestBody"]["content"]["application/json"];

export type CreateUserResponse =
  paths["/users"]["post"]["responses"]["201"]["content"]["application/json"];

export function createUserRouter(userInteractor: UserInteractor): Router {
    const router = Router()


    router.post<Record<string, never>, CreateUserResponse, CreateUserRequestBody>('/users', async (request, response) => {
        const user = await userInteractor.createUser(request.body.username)

        response.status(201).json(user)
    })


    router.get<GetUserRequestParameters, GetUserResponse>('/users/:id', async (request, response) => {
        const user = await userInteractor.getUser(request.params.id)
        if (user == null) {
            response.status(404).send()
            return
        }

        response.status(200).json(user)
    })


    return router
}

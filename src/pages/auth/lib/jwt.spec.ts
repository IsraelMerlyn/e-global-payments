import {
    describe,
    expect,
    it,
} from 'vitest'

import { decodeAccessToken } from './jwt'

const operatorToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcGVyYWRvciIsIm5hbWUiOiJPbGl2aWEgT3BlcmFkb3IiLCJ1c2VybmFtZSI6Im9wZXJhZG9yIiwiUm9sZSI6Ik9wZXJhZG9yIiwiaWF0IjoxNzg0MTYwMDAwLCJleHAiOjE4OTM0NTYwMDB9.U80cQm-4z_Ww9UuM-a2KwMgFy880hv8axM40M_kGX3c'

describe('decodeAccessToken', () => {
    it('maps the operator claims to an authenticated user', () => {
        const user =
            decodeAccessToken(operatorToken)

        expect(user).toEqual({
            id: 'operador',
            username: 'operador',
            name: 'Olivia Operador',
            role: 'Operador',
        })
    })

    it('rejects a malformed token', () => {
        expect(() =>
            decodeAccessToken('invalid-token'),
        ).toThrow(
            'El servidor devolvió un token inválido',
        )
    })
})
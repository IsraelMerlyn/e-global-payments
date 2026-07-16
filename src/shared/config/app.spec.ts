import { describe, expect, it } from 'vitest';

import { APP_CONFIG } from './app'

describe('APP_CONFIG', () => {
    it('defines the application name', () => {
        expect(APP_CONFIG.name).toBeTruthy()
    })

    it('defines the default document title', () => {
        expect(APP_CONFIG.defaultTitle).toBeTruthy()
    })
})
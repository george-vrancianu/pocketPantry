import { availableParallelism } from 'node:os';

// Every worker boots whole Nest apps (about 1 GB resident) and owns a cloned
// database. Jest's default of cores - 1 means 31 workers on a big dev machine:
// the cloning, the memory and the CPU contention then push suite setup past the
// timeout. Small machines (e.g. CI) keep jest's default of cores - 1; cap it at
// 4 elsewhere.
const MAX_WORKERS = 4;

/** @type {import('jest').Config} */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/support/global-setup.mjs',
  globalTeardown: '<rootDir>/support/global-teardown.mjs',
  setupFiles: ['<rootDir>/support/env.ts'],
  testRegex: '.int-spec.ts$',
  maxWorkers: Math.min(MAX_WORKERS, Math.max(1, availableParallelism() - 1)),
  // Applies to hooks too: most suites boot an app in beforeAll without
  // setting their own timeout, and jest's 5 s default is too tight under load.
  testTimeout: 30_000,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2022',
          moduleResolution: 'Bundler',
          rootDir: '..',
          target: 'ES2023',
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    ],
  },
};

import { PostHog } from 'posthog-node'
import { CYCLONE_POSTHOG_ADDRESS, CYCLONE_DISABLE_ENV_VAR } from './constants.js'
import machineId from 'node-machine-id'

const CYCLONE_MACHINE_ID_ENV_VAR = 'NEXT_PUBLIC_CYCLONE_MACHINE_ID'
const NEXT_JS_PREFIX = 'NEXT_PUBLIC_'

export default abc

export default class NodeClient {
  projectId: string
  posthogClient: PostHog
  machineId: string

  constructor (projectId: string, apiKey: string) {
    this.projectId = projectId
    this.posthogClient = new PostHog(apiKey, {
      host: CYCLONE_POSTHOG_ADDRESS,
      // use aggressive flush policy since CLI is used
      flushAt: 1,
      flushInterval: 0
    })
    this.machineId = machineId.machineIdSync(true)

    process.env[CYCLONE_MACHINE_ID_ENV_VAR] = this.machineId

    if (this._checkDoNotTrack()) {
      // set do not track for next.js client
      process.env[`${NEXT_JS_PREFIX}${CYCLONE_DISABLE_ENV_VAR}`] = 'true'
    }

    if (!this._checkDoNotTrack()) {
      this._setup()
    }
  }

  _setup () {
    // Use prepend listener because we want to run Cyclone signal handler before
    // another signal handler that explicitly calls process.exit()
    process.prependListener('SIGINT', this._getShutdownSignalHandler('SIGINT'))
    process.prependListener('SIGTERM', this._getShutdownSignalHandler('SIGTERM'))

    this._reportArgvEvent()
  }

  _checkDoNotTrack () {
    return process.env[CYCLONE_DISABLE_ENV_VAR] !== undefined
  }

  _reportArgvEvent () {
    if (this._checkDoNotTrack()) {
      return
    }

    this.posthogClient.capture({
      distinctId: this.machineId,
      event: 'argv',
      properties: {
        ...this._getMetadata(),
        argv: process.argv
      }
    })
  }

  _getShutdownSignalHandler (signal: string) {
    return () => {
      if (this._checkDoNotTrack()) {
        return
      }

      this.posthogClient.capture({
        distinctId: this.machineId,
        event: 'cli_os_signal',
        properties: {
          ...this._getMetadata(),
          signal
        }
      })
      // TODO: debug why the flush here is not working
      this.posthogClient.flush()
      this.shutdown()
      if (process.listenerCount(signal) === 1) {
        process.exit(0)
      }
    }
  }

  _getMetadata () {
    return {
      projectId: this.projectId,
      machineId: this.machineId
    }
  }

  captureExit (signal: string, code: number) {
    if (this._checkDoNotTrack()) {
      return
    }

    this.posthogClient.capture({
      distinctId: this.machineId,
      event: 'cli_exit',
      properties: {
        ...this._getMetadata(),
        signal,
        exit_code: code
      }
    })
    this.posthogClient.flush()
  }

  captureStdout (data: string) {
    if (this._checkDoNotTrack()) {
      return
    }

    this.posthogClient.capture({
      distinctId: this.machineId,
      event: 'stdout',
      properties: {
        ...this._getMetadata(),
        output: data
      }
    })
  }

  captureStderr (data: string) {
    if (this._checkDoNotTrack()) {
      return
    }

    this.posthogClient.capture({
      distinctId: this.machineId,
      event: 'stderr',
      properties: {
        ...this._getMetadata(),
        output: data
      }
    })
  }

  async shutdownAsync () {
    await this.posthogClient.shutdownAsync()
  }

  shutdown () {
    this.posthogClient.shutdown()
  }
}

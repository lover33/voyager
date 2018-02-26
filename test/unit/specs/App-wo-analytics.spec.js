/* mocking electron differently in one file apparently didn't work so I had to split the App tests in 2 files */

jest.mock('renderer/node.js', () => () => require('../helpers/node_mock'))

describe('App without analytics', () => {
  jest.mock('../../../config', () => ({
    google_analytics_uid: '123',
    sentry_dsn_public: '456'
  }))
  jest.mock('raven-js', () => ({
    config: (dsn) => {
      return ({
        install: () => {
        }
      })
    }
  }))
  jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {
  })
  jest.mock('electron', () => ({
    remote: {
      getGlobal: () => ({
        env: {
          NODE_ENV: 'test',
          COSMOS_ANALYTICS: 'false'
        }
      })
    }
  }))

  beforeEach(() => {
    jest.resetModules()
  })

  it('has all dependencies', async done => {
    document.body.innerHTML = '<div id="app"></div>'
    try {
      await require('renderer/main.js')
    } catch (e) {
      done.fail(e)
    }
    done()
  })

  it('does not activate google analytics if analytics is disabled', async mockDone => {
    jest.mock('../../../app/src/renderer/google-analytics.js', () => (uid) => {
      mockDone.fail()
    })
    await require('renderer/main.js')
    mockDone()
  })

  it('does not set Raven dsn if analytics is disabled', mockDone => {
    jest.mock('raven-js', () => ({
      config: (dsn) => {
        expect(dsn).toBe('')
        return ({
          install: () => {
            mockDone()
          }
        })
      }
    }))
    require('renderer/main.js')
  })
})
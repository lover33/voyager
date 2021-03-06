"use strict"
/**
 * Main store module
 * @module store
 */

import Vue from "vue"
import Vuex from "vuex"
import { merge } from "lodash"
import * as getters from "./getters"
import modules from "./modules"

Vue.use(Vuex)

/**
 * Module Store
 * @param opts
 * @returns {Vuex.Store}
 */
export default (opts = {}) => {
  // provide commit and dispatch to tests
  opts.commit = (...args) => store.commit(...args)
  opts.dispatch = (...args) => store.dispatch(...args)

  const store = new Vuex.Store({
    getters,
    // strict: true,
    modules: modules(opts),
    actions: {
      loadPersistedState
    }
  })

  let pending = null
  store.subscribe((mutation, state) => {
    /* istanbul ignore next */
    pending = storeUpdateHandler(mutation, state, pending)
  })

  return store
}

/*
 * We want to store a sub-state of the state to local storage to serve data faster for the user.
 * This function is triggered on all mutations.
 */
export function storeUpdateHandler(mutation, state, pending) {
  // since persisting the state is costly we should only do it on mutations that change the data
  const updatingMutations = [
    `setWalletBalances`,
    `setWalletHistory`,
    `setCommittedDelegation`,
    `setUnbondingDelegations`,
    `setDelegates`,
    `setStakingParameters`,
    `setPool`,
    `setProposal`,
    `setProposalDeposits`,
    `setProposalVotes`,
    `setProposalTally`,
    `setGovParameters`,
    `setKeybaseIdentities`
  ]

  if (updatingMutations.indexOf(mutation.type) === -1) return

  // if the user is logged in cache the balances and the tx-history for that user
  if (!state.session.address) return

  // throttle updates so we don't write to disk on every mutation
  // pending is the last updates setTimeout
  if (pending) {
    clearTimeout(pending)
  }
  return setTimeout(() => {
    persistState(state)
  }, 5000)
}

/**
 * Persist the state passed as parameter
 * Only persists a subset of the state
 * @param state
 */
function persistState(state) {
  const cachedState = JSON.stringify({
    transactions: {
      wallet: state.transactions.wallet,
      staking: state.transactions.staking
    },
    wallet: {
      balances: state.wallet.balances
    },
    delegation: {
      loaded: state.delegation.loaded,
      committedDelegates: state.delegation.committedDelegates,
      unbondingDelegations: state.delegation.unbondingDelegations
    },
    delegates: {
      delegates: state.delegates.delegates
    },
    keybase: {
      identities: state.keybase.identities
    },
    stakingParameters: state.stakingParameters,
    pool: state.pool,
    proposals: state.proposals,
    deposits: state.deposits,
    votes: state.votes,
    governanceParameters: state.governanceParameters,
    session: {
      address: state.session.address
    }
  })
  // Store the state object as a JSON string
  localStorage.setItem(getStorageKey(state), cachedState)
}

/**
 * Get a storage key
 * @param state
 * @returns {string}
 */
export function getStorageKey(state) {
  const chainId = state.connection.lastHeader.chain_id
  const address = state.session.address
  return `store_${chainId}_${address}`
}

/**
 * load persisted state
 * @param state
 * @param commit
 */
export function loadPersistedState({ state, commit }) {
  const storageKey = getStorageKey(state)
  let cachedState
  try {
    cachedState = JSON.parse(localStorage.getItem(storageKey))
  } catch (err) {
    console.error(`Couldn't parse the cached state`)
  }
  if (cachedState) {
    // Replace the state object with the stored state
    merge(state, cachedState, {
      // set loading indicators to false
      transactions: {
        loaded: true,
        loading: false
      },
      wallet: {
        loaded: true,
        loading: false
      },
      delegates: {
        loaded: true,
        loading: false
      },
      proposals: {
        loaded: true,
        loading: false
      },
      pool: {
        loaded: true,
        loading: false
      },
      governanceParameters: {
        loaded: true,
        loading: false
      },
      stakingParameters: {
        loaded: true,
        loading: false
      }
    })
    this.replaceState(state)

    // add all delegates the user has bond with already to the cart
    state.delegates.delegates
      .filter(d => state.delegation.committedDelegates[d.operator_address])
      .forEach(d => {
        commit(`addToCart`, d)
      })
  }
}

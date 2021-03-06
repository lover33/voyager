"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalDeposit`, () => {
  let wrapper, store
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(async () => {
    const coins = [
      {
        amount: `200000000`,
        denom: `stake`
      }
    ]
    const instance = mount(ModalDeposit, {
      localVue,
      propsData: {
        proposalId: `1`,
        proposalTitle: lcdClientMock.state.proposals[`1`].title,
        denom: `stake`
      },
      sync: false
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.connection.connected = true
    store.commit(`setWalletBalances`, coins)
    store.commit(`setSignIn`, true)

    await wrapper.vm.$nextTick()
    wrapper.vm.$refs.actionModal.open()
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`opens`, () => {
    wrapper.vm.$refs.actionModal.open = jest.fn()
    wrapper.vm.open()
    expect(wrapper.vm.$refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    wrapper.setData({ amount: 100000000000 })
    // produce validation error as amount is too high
    wrapper.vm.$v.$touch()
    expect(wrapper.vm.$v.$error).toBe(true)

    wrapper.vm.clear()
    expect(wrapper.vm.$v.$error).toBe(false)
    expect(wrapper.vm.amount).toBe(0)
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`when the amount deposited higher than the user's balance`, async () => {
        wrapper.setData({ amount: 25 })
        expect(wrapper.vm.validateForm()).toBe(false)
        await wrapper.vm.$nextTick()
        const errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`when the user doesn't have the deposited coin`, () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        store.commit(`setWalletBalances`, otherCoins)
        wrapper.setData({ amount: 25 })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`succeeds`, () => {
      it(`when the user has enough balance to submit a deposit`, async () => {
        wrapper.setData({ amount: 15 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  describe(`Deposit`, () => {
    it(`submits a deposit`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 10 })
      await wrapper.vm.submitForm(`local`, `1234567890`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitDeposit`,
          {
            amount: [
              {
                amount: `100000000`,
                denom: `stake`
              }
            ],
            proposal_id: `1`,
            password: `1234567890`,
            submitType: `local`
          }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully deposited your stakes on proposal #1`,
            title: `Successful deposit!`
          }
        ]
      ])
    })
  })
})

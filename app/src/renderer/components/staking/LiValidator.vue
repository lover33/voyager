<template>
  <tr class="data-table__row li-validator">
    <td class="data-table__row__info">
      <img
        v-if="validator.keybase"
        :src="validator.keybase.avatarUrl"
        class="data-table__row__info__image"
        width="48"
        height="48"
      >
      <img
        v-else
        class="
          data-table__row__info__image
          data-table__row__info__image--no-img
        "
        src="~assets/images/validator-icon.svg"
        width="48"
        height="48"
      >
      <div class="data-table__row__info__container">
        <span
          v-tooltip.top="status"
          :class="statusColor"
          class="data-table__row__info__container__status"
        />
        <router-link
          :to="{
            name: 'validator',
            params: { validator: validator.operator_address }
          }"
          :class="styles"
          class="data-table__row__info__container__name"
        >
          {{ validator.description.moniker }}
        </router-link>
        <div class="data-table__row__info__container__description">
          <short-bech32 :address="validator.operator_address" />
        </div>
      </div>
    </td>
    <td class="li-validator__delegated-steak">
      {{
        yourVotes.isLessThan(0.01) && yourVotes.isGreaterThan(0)
          ? num.shortNumber(0.01)
          : num.shortNumber(yourVotes)
      }}
    </td>
    <td class="li-validator__rewards data-table__row__cell__separator">
      {{ rewards || "--" }}
    </td>
    <td class="li-validator__voting-power">
      {{ validator.percent_of_vote ? validator.percent_of_vote : `--` }}
    </td>
    <td class="li-validator__uptime">
      {{ uptime }}
    </td>
    <td class="li-validator__commission">
      {{ commission }}
    </td>
    <td class="li-validator__slashes">
      --
    </td>
  </tr>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { calculateTokens, ratToBigNumber } from "scripts/common"
import ShortBech32 from "common/ShortBech32"
import BigNumber from "bignumber.js"
export default {
  name: `li-validator`,
  components: {
    ShortBech32
  },
  props: {
    validator: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({ num }),
  computed: {
    ...mapGetters([
      `delegates`,
      `committedDelegations`,
      `distribution`,
      `bondDenom`,
      `session`,
      `lastHeader`
    ]),
    commission() {
      return `${this.num.pretty(this.validator.commission.rate)}%`
    },
    uptime() {
      const rollingWindow = 10000 // param of slashing period
      const info = this.validator.signing_info
      if (info) {
        // uptime in the past 10k blocks
        const uptimeRollingWindow =
          (rollingWindow - info.missed_blocks_counter) / rollingWindow
        return num.percent(uptimeRollingWindow)
      }
      return `--`
    },
    yourVotes() {
      return this.committedDelegations[this.validator.operator_address]
        ? BigNumber(
          num
            .atoms(
              calculateTokens(
                this.validator,
                this.committedDelegations[this.validator.operator_address]
              )
            )
            .toString()
        )
        : BigNumber(0)
    },
    styles() {
      let value = ``
      if (this.validator.isValidator) value += `li-validator-validator `
      return value
    },
    delegateType() {
      return this.validator.revoked
        ? `Revoked`
        : this.validator.isValidator
          ? `Validator`
          : `Candidate`
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
        .toNumber()
    },
    status() {
      // status: jailed
      if (this.validator.revoked)
        return `This validator has been jailed and is not currently validating`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0)
        return `This validator does not have enough voting power yet and is inactive`

      // status: active
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return `red`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0) return `yellow`

      // status: active
      return `green`
    },
    rewards() {
      if (!this.session.signedIn) return null
      const validatorRewards = this.distribution.rewards[
        this.validator.operator_address
      ]
      return validatorRewards
        ? num.shortNumber(num.atoms(validatorRewards[this.bondDenom]) || 0)
        : null
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler() {
        if (this.yourVotes > 0) {
          this.$store.dispatch(
            `getRewardsFromValidator`,
            this.validator.operator_address
          )
        }
      }
    }
  }
}
</script>

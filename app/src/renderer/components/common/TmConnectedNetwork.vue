<template>
  <div v-if="connected" id="tm-connected-network" class="tm-connected-network">
    <div class="tm-connected-network__connection">
      <div id="tm-connected-network__icon" class="tm-connected-network__icon">
        <span
          v-tooltip.top="`Network is up and running`"
          class="page-profile__status green"
        />
      </div>
      <div
        id="tm-connected-network__string"
        class="tm-connected-network__string"
      >
        <span v-tooltip.top="networkTooltip" class="chain-id">
          {{ lastHeader.chain_id }}
        </span>
      </div>
    </div>
    <div id="tm-connected-network__block" class="tm-connected-network__string">
      <router-link
        v-tooltip.top="'Block Height'"
        :to="{ name: `block`, params: { height: lastHeader.height } }"
      >
        {{ blockHeight }}
      </router-link>
    </div>
  </div>
  <div
    v-else
    id="tm-disconnected-network"
    class="tm-connected-network tm-disconnected-network"
  >
    <img class="tm-connected-network-loader" src="~assets/images/loader.svg">
    <div
      v-tooltip.top="networkTooltip"
      class="
        tm-connected-network__string
        tm-connected-network__string--connecting
      "
    >
      Connecting to {{ lastHeader.chain_id }}…
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex"
import num from "scripts/num"

export default {
  name: `tm-connected-network`,
  data: () => ({
    num
  }),
  computed: {
    ...mapGetters([`lastHeader`, `nodeUrl`, `connected`]),
    networkTooltip({ connected, nodeUrl, lastHeader } = this) {
      if (connected) {
        return `You're connected to the ${
          lastHeader.chain_id
        } testnet via node ${nodeUrl}.`
      }
      return `We're pinging nodes to try to connect you to ${
        lastHeader.chain_id
      }.`
    },
    blockHeight({ num, lastHeader } = this) {
      return `#` + num.prettyInt(lastHeader.height)
    }
  }
}
</script>

<style>
.tm-connected-network {
  align-items: center;
  background: var(--app-fg);
  border-radius: 0.25rem;
  color: var(--dim);
  display: flex;
  font-size: var(--sm);
  justify-content: space-between;
  margin: 0.5rem;
  padding: 0.5rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 208px; /* sidebar width minus margin */
}

.tm-connected-network .chain-id {
  font-weight: 500;
  padding-right: 1rem;
  background: none !important;
}

.tm-connected-network .exit {
  font-size: var(--sm);
}

.tm-connected-network__icon {
  align-items: center;
  color: var(--success-bc);
  display: flex;
  font-size: var(--m);
  justify-content: center;
  padding-right: 0.25rem;
}

.tm-connected-network__icon .fa-spin {
  color: var(--warning);
}

.tm-connected-network--mocked .tm-connected-network__icon {
  color: var(--warning);
}

.tm-connected-network__connection {
  display: flex;
}

.tm-disconnected-network {
  justify-content: start;
}

.tm-connected-network__string--connecting {
  color: var(--warning);
}

.tm-connected-network-loader {
  height: 1rem;
  margin-right: 0.5rem;
  width: 1rem;
}
</style>

/* eslint-disable import/extensions */ /* eslint-disable import/no-unresolved */
<!-- <template>
  <div id="app">
    <notifications group="all" width="100%" position="bottom center" />
    <div v-if="isLoading">
      <fingerprint-spinner class="spinner" :animation-duration="1500" :size="150" color="#136a8a" />
    </div>
    <router-view />
  </div>
</template>

<script>
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import { mapGetters } from 'vuex';
import { FingerprintSpinner } from 'epic-spinners';
import { eventHub } from '@/utils/EventHub';

export default {
  name: 'app',
  components: {
    FingerprintSpinner
  },

  data() {
    return {
      refCount: 0,
      isLoading: false
    };
  },

  async created() {
    eventHub.$on('before-request', this.setLoading);
    eventHub.$on('request-error', this.unsetLoading);
    eventHub.$on('after-response', this.unsetLoading);
    eventHub.$on('response-error', this.unsetLoading);

    await this.$store.dispatch('authStore/initiateAppSession');
  },

  beforeDestroy() {
    eventHub.$off('before-request', this.setLoading);
    eventHub.$off('request-error', this.unsetLoading);
    eventHub.$off('after-response', this.unsetLoading);
    eventHub.$off('response-error', this.unsetLoading);
  },

  methods: {
    setLoading() {
      this.refCount += 1;
      this.isLoading = true;
    },

    unsetLoading() {
      if (this.refCount > 0) {
        this.refCount -= 1;
        this.isLoading = this.refCount > 0;
      }
    }
  },

  computed: {
    ...mapGetters({
      isSessionActive: 'authStore/isSessionActive'
    })
  }
};
</script>

<style lang="scss">
.notifications {
  .notification-wrapper {
    width: 100vw;
  }

  span {
    display: block;
  }
}

.spinner {
  position: fixed !important;
  top: 0px !important;
  height: 100vh !important;
  width: 100% !important;
  z-index: 10000 !important;
  background: rgba(255, 255, 255, 0.8) !important;
}
</style> -->

<!-- latest version -->

<template>
  <div id="app">
    <notifications group="all" width="100%" position="bottom center" />
    <div v-if="isLoading">
      <fingerprint-spinner class="spinner" :animation-duration="1500" :size="150" color="#136a8a" />
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { mapGetters } from 'vuex';
import { FingerprintSpinner } from 'epic-spinners';
import { eventHub } from '@/utils/EventHub';

const refCount = ref(0);
const isLoading = ref(false);

const setLoading = () => {
  refCount.value += 1;
  isLoading.value = true;
};

const unsetLoading = () => {
  if (refCount.value > 0) {
    refCount.value -= 1;
    isLoading.value = refCount.value > 0;
  }
};

// Lifecycle hooks
onBeforeMount(() => {
  eventHub.$on('before-request', setLoading);
  eventHub.$on('request-error', unsetLoading);
  eventHub.$on('after-response', unsetLoading);
  eventHub.$on('response-error', unsetLoading);
});

onBeforeUnmount(() => {
  eventHub.$off('before-request', setLoading);
  eventHub.$off('request-error', unsetLoading);
  eventHub.$off('after-response', unsetLoading);
  eventHub.$off('response-error', unsetLoading);
});

// Vuex getters
const { isSessionActive } = mapGetters('authStore', ['isSessionActive']);
</script>

<style lang="scss">
.notifications {
  .notification-wrapper {
    width: 100vw;
  }

  span {
    display: block;
  }
}

.spinner {
  position: fixed !important;
  top: 0px !important;
  height: 100vh !important;
  width: 100% !important;
  z-index: 10000 !important;
  background: rgba(255, 255, 255, 0.8) !important;
}
</style>

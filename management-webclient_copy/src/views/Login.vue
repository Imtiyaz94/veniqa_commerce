<!-- <template>
  <div>
    <div class="login">
      <div class="content">
        <div class="auth-box">
          <user-account-modal @loginSuccess="loggedIn()"></user-account-modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-unresolved
import UserAccountModal from '@/components/registrations/UserAccountModal.vue';

export default {
  name: 'Login',
  components: {
    UserAccountModal,
  },

  data() {
    return {
      registrationClass: ['registration-mode'],
      userLoggedIn: false,
    };
  },

  methods: {
    loggedIn() {
      // Do something when logged in.
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/css/global.scss';

.login {
  height: 100vh;
  //background-image: $gradient-color;
  line-height: 100vh;

  .content {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    width: 100%;
  }
}

.auth-box {
  width: 70%;
  margin: auto;
  background-color: white;
  //box-shadow: 5px 6px 10px 0px #2e3532;
}
</style> -->

<!-- latest version -->

<template>
  <div>
    <div class="login">
      <div class="content">
        <div class="auth-box">
          <user-account-modal @loginSuccess="loggedIn" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserAccountModal from '@/components/registrations/UserAccountModal.vue';
import { ref } from 'vue';

const registrationClass = ref(['registration-mode']);
const userLoggedIn = ref(false);

const loggedIn = () => {
  // Do something when logged in.
  // Example: Redirect to the home page
  userLoggedIn.value = true;
  setTimeout(() => {
    userLoggedIn.value = false; // Reset the flag to simulate the actual behavior
  }, 2000); // Reset the flag after 2 seconds (this is for demonstration purposes)
};
</script>

<style lang="scss" scoped>
@import '../assets/css/global.scss';

.login {
  height: 100vh;
  //background-image: $gradient-color;
  line-height: 100vh;

  .content {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    width: 100%;
  }
}

.auth-box {
  width: 70%;
  margin: auto;
  background-color: white;
  //box-shadow: 5px 6px 10px 0px #2e3532;
}
</style>

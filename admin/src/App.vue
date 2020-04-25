<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <button type="button" @click="removePlayer">Remove player</button>
    <br><br>
    {{ JSON.stringify(this.state, null, 4) }}
  </div>
</template>

<script>


export default {
  name: 'App',
  components: {
  },
  methods: {
    removePlayer () {

    }
  },
  sockets: {
    state (data) {
      this.state = data
    }
  },
  data () {
    return {
      state: {}
    }
  },
  mounted () {
    this.$socket.emit('register')
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

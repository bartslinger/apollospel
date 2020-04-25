<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    Register Player
    <form @submit.prevent="registerPlayer">
      <input type="text" placeholder="id" v-model="forms.registerPlayer.id" />
      <input type="text" placeholder="name" v-model="forms.registerPlayer.name" />
      <button>Go</button>
    </form>
    <br>
    Remove Player
    <form @submit.prevent="removePlayer">
      <input type="text" placeholder="id" v-model="forms.removePlayer.id" />
      <button>Go</button>
    </form>
    <br>
    <form @submit.prevent="movePlayer">
      <input type="text" placeholder="id" v-model="forms.movePlayer.id" />
      <button>Move</button>
    </form>
    <br>
    <form @submit.prevent="roll">
      <button>Roll</button>
    </form>
    <br>
    <form @submit.prevent="moveAfterRoll">
      <button>Move</button>
    </form>
    <br>
    <form @submit.prevent="drawCardsForAuction">
      <button>Draw cards for auction</button>
    </form>
    <br>
    <form @submit.prevent="refresh">
      <button>Refresh</button>
    </form>
    <br>
    Context
    <pre>{{ this.context }}</pre>
    <br>
    <pre>{{ this.state }}</pre>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  methods: {
    registerPlayer () {
      console.log('submit')
      this.$socket.emit('register', {
        playerID: parseInt(this.forms.registerPlayer.id),
        playerName: this.forms.registerPlayer.name
      }, () => {})
    },
    removePlayer () {
      this.$socket.emit('leave', {
        playerID: this.forms.removePlayer.id
      })
    },
    movePlayer () {
      this.$socket.emit('admin.movePlayer', {
        playerID: this.forms.movePlayer.id,
        steps: 1
      })
    },
    roll () {
      this.$socket.emit('roll', {})
      this.$socket.emit('moveAfterRoll', {})
    },
    moveAfterRoll () {
      this.$socket.emit('moveAfterRoll', {
      })
    },
    drawCardsForAuction () {
      this.$socket.emit('drawCardsForAuction', {})
    },
    refresh () {
      this.$socket.emit('refresh', {}, () => {})
    }
  },
  sockets: {
    state (data) {
      console.log(data)
      this.state = data
    },
    context (data) {
      this.context = data
    }
  },
  data () {
    return {
      state: {},
      context: {},
      forms: {
        registerPlayer: {
          id: '',
          name: ''
        },
        removePlayer: {
          id: ''
        },
        movePlayer: {
          id: ''
        }
      }
    }
  },
  computed: {
    prettyState () {
      return JSON.stringify(this.state, null, 4).replace(/(?:\r\n|\r|\n)/g, '<br>')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}
</style>

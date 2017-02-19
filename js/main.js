var STORAGE_KEY_NAMES = 'daregame-v1-names';
var STORAGE_KEY_DARES = 'daregame-v1-dares';
var dataStorage = {
    fetchNames: function () {
        var names = JSON.parse(localStorage.getItem(STORAGE_KEY_NAMES) || '[]');
        return names;
    },
    saveNames: function (names) {
        localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(names));
    },
    fetchDares: function () {
        var dares = JSON.parse(localStorage.getItem(STORAGE_KEY_DARES) || '[]');
        return dares;
    },
    saveDares: function (dares) {
        localStorage.setItem(STORAGE_KEY_DARES, JSON.stringify(dares));
    }
}

function getRandom(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
}

function speakArr(arr, str) {
    var s = "";
    for (var i = 0; i < arr.length; i++) {
        s += arr[i].name;
    }

    s += " must " + str;
    speak(s);
}

function speak(str) {
    responsiveVoice.speak(str, "Vietnamese Male");
}

var app = new Vue({
  data: {
    names: dataStorage.fetchNames(),
    dares: dataStorage.fetchDares(),
    newName: "",
    dareText: "",
    dareParticipants: 1,
    dareAdded: false,
    error: "",
    countdown: 1,
    dareCountdown: 30,
    penalty: false,
    chosenDare: null,
    participants: [],
    showDares: false
  },

  watch: {
    names: {
      handler: function (names) {
        dataStorage.saveNames(names)
      },
      deep: true
    },
    dares: {
      handler: function (dares) {
        dataStorage.saveDares(dares)
      },
      deep: true
    }
  },

  mounted() {
    setInterval(this.tick, 1000);
  },

  methods: {
    complete: function() {
        this.countdown = 300;
        for (var i = 0; i < this.participants.length; i++) {
            var idx = this.names.indexOf(this.participants[i]);
            if (idx >= 0) {
                this.names[idx].dareCount++;
            }
        }
    },
    tick: function() {
        if (this.countdown === 0) {
            this.dareCountdown--;
            if (this.dareCountdown === 0) {
                this.penalty = true;
                this.dareCountdown = 30;
                var d = getRandom(this.dares);
                while (d.text === this.chosenDare.text) {
                    d = getRandom(this.dares);
                }
                this.chosenDare = d;
                speak("PENALTY! " + this.chosenDare.text);
            }
        } else {
            this.countdown--;
            if (this.countdown === 0) {
                if (this.dares.length === 0) {
                    return;
                }
                this.penalty = false;
                this.dareCountdown = 30;
                // Choose a dare
                this.chosenDare = getRandom(this.dares);

                // Get participants
                var filteredPeople = this.names.filter(function(e) {
                    return e.isActive;
                });

                if (filteredPeople.length <= this.chosenDare.participants) {
                    this.participants = filteredPeople;
                    speakArr(this.participants, this.chosenDare.text);
                    return;
                }

                this.participants = [];
                while (this.participants.length < this.chosenDare.participants) {
                    var p = getRandom(filteredPeople);
                    this.participants.push(p);
                    filteredPeople.splice(filteredPeople.indexOf(p), 1);
                }

                speakArr(this.participants, this.chosenDare.text);
            }
        }
    },
    addPerson: function() {
        this.names.push({name: this.newName, dareCount: 0, isActive: true});
        this.newName = "";
    },
    deletePerson: function(person) {
        var t = confirm("Really delete " + person.name + "?");
        if (t) {
            this.names.splice(this.names.indexOf(person), 1);
        }
    },
    addDare: function() {
        this.error = "";
        if (!this.dareText || this.dareText.length === 0) {
            this.error = "Type in a dare, silly.";
            return;
        }
        if (!this.dareParticipants || this.dareParticipants <= 0) {
            this.error = "No participants?";
            return;
        }

        this.dares.push({text: this.dareText, participants: this.dareParticipants});
        this.dareAdded = true;
        this.dareText = "";
        this.dareParticipants = 1;
    },
    deleteDare: function(dare) {
        this.dares.splice(this.dares.indexOf(dare), 1);
    }
  }
})

app.$mount('#main');
(function(){

    var GameService = function(){

        var players = [];
        var steps = [];
        var Game = {};

        Game.init = function(){
            Game.loadPlayers();
        };

        Game.loadPlayers = function(){
            if (localStorage.getItem('players') == null || JSON.parse(localStorage.getItem('players')).length < 2){
                Game.clearGame();
            }
            else {
                players = JSON.parse(localStorage.getItem('players'));
                if (localStorage.getItem('steps') == null){
                    localStorage.setItem('steps', JSON.stringify([]));
                }
                steps = JSON.parse(localStorage.getItem('steps'));
            }
        };

        Game.getPlayers = function(){
            var scores = Game.getPlayersScore();
            var _players = angular.copy(players);
            for (var i = 0; i < _players.length; i++){
                _players[i].score = scores[i];
            }
            return _players;
        };

        Game.addPlayer = function(name){
            players[players.length] = {id: players.length, name: name};
            localStorage.setItem('players', JSON.stringify(players));
        };

        Game.getPlayer = function(id){
            if (players[id]){
                return angular.copy(players[id]);
            }
            return null;
        };

        Game.addStep = function(winnerId, score){
            steps[steps.length] = {winnerId: winnerId, score: score};
            localStorage.setItem('steps', JSON.stringify(steps));
        };

        Game.removeLastWin = function(){
            var last_step = steps.pop();
            localStorage.setItem('steps', JSON.stringify(steps));
            return last_step;
        };

        Game.getPlayersScore = function(){
            var scores = [];
            for (var j = 0; j < players.length; j++){
                scores[j] = 0;
            }
            for (var i = 0; i < steps.length; i++){
                scores[steps[i].winnerId] += steps[i].score;
            }
            return scores;
        };

        Game.stepNum = function(){
            return steps.length;
        };

        Game.getSteps = function(){
            return angular.copy(steps);
        };

        Game.clearGame = function(){
            localStorage.clear();
            players = [];
            steps = [];
        };

        Game.init();

        return Game;
    };

    var scoreController = function($rootScope, Game){
        var self = this;
        this.players = [];
        this.steps = [];
        var step = 0;

        $rootScope.$on('playersBeSave', function(){
            self.updateInfos();
        });

        $rootScope.$on('addWin', function(){
            self.updateInfos();
        });

        this.addWinner = function(){
            $rootScope.$emit('showAddWinnerFrom');
        };

        this.removeLastWin = function(){
            Game.removeLastWin();
            this.updateInfos();
        };

        this.updateInfos = function(){
            this.players = Game.getPlayers();
            this.steps = Game.getSteps();
            this.step = Game.stepNum();
        };

        this.initFn = function(){
            this.updateInfos();
        };

        this.clearGame = function(){
            Game.clearGame();
            window.location.reload();
        };

        this.initFn();
    };

    var playerController = function($rootScope, Game){
        var self = this;
        this.style = {display: 'none'};
        this.players = [{name:''},{name:''}];

        this.initFn = function(){
            Game.loadPlayers();
            if (Game.getPlayers() == null || Game.getPlayers().length < 2){
                Game.clearGame();
                this.style.display = 'block';
            }
            else {
                $rootScope.$emit('playersBeSave');
            }
        };

        this.removePlayer = function(id){
            this.players.splice(id, 1);
        };

        this.addPlayer = function(){
            this.players[this.players.length] = {name:''};
        };

        this.savePlayers = function(){
            for (var i = 0; i < this.players.length; i++){
                Game.addPlayer(this.players[i].name);
            }
            this.style.display = 'none';
            $rootScope.$emit('playersBeSave');
        };

        this.initFn();
    };

    var winnerController = function($rootScope, Game){
        var self = this;
        this.user_id = 0;
        this.step_score = 0;
        this.style = {display: 'none'};
        this.players = [];
        this.cards = [];
        var cards = [
            {val: 1, count: 0, name: '+1'},
            {val: 2, count: 0, name: '+2'},
            {val: 3, count: 0, name: '+3'},
            {val: 4, count: 0, name: '+4'},
            {val: 5, count: 0, name: '+5'},
            {val: 6, count: 0, name: '+6'},
            {val: 7, count: 0, name: '+7'},
            {val: 8, count: 0, name: '+8'},
            {val: 9, count: 0, name: '+9'},
            {val: 20, count: 0, name: '+20'},
            {val: 50, count: 0, name: '+50'}
        ];

        this.initFn = function(){
            this.cards = angular.copy(cards);
            this.players = Game.getPlayers();
            this.user_id = 0;
            this.step_score = 0;
        };

        $rootScope.$on('showAddWinnerFrom', function(){
            self.showForm();
        });

        this.showForm = function(){
            this.initFn();
            this.style.display = 'block';
        };

        this.hideForm = function(){
            this.style.display = 'none';
        };

        this.addCard = function(id){
            this.cards[id].count++;
            this.updateScore();
        };

        this.removeCard = function(id){
            this.cards[id].count--;
            this.updateScore();
        };

        this.updateScore = function(){
            var score = 0;
            for (var i = 0; i < this.cards.length; i++){
                score += this.cards[i].val*this.cards[i].count;
            }
            this.step_score = score;
        };

        this.saveWinner = function(){
            this.updateScore();
            Game.addStep(this.user_id, this.step_score);
            $rootScope.$emit('addWin');
            this.hideForm();
        };
    };

    angular
        .module('counterModule', [])
        .factory('Game', [GameService])
        .controller('scoreController',  ['$rootScope', 'Game', scoreController])
        .controller('playerController', ['$rootScope', 'Game', playerController])
        .controller('winnerController', ['$rootScope', 'Game', winnerController]);
})();

var counterApp = angular.module('counterApp', ['counterModule']);
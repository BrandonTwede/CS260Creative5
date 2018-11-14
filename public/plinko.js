angular.module('Plinko', [])
.controller('MainCtrl', [
'$scope', '$http',
function($scope, $http){
	$scope.tokenCount = 10;
	$scope.scores = [];
	
	refreshLeaderboard();
var buckets = {
	drops: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0
};


function updateStat(selector, count) {
	$(selector).text(count);
}

function updateBuckets() {
	var selectors = [ '#one', '#two', '#three', '#four', '#five'];
	$.each(selectors, function(i, e) {
		var count = buckets[i+1];
		updateStat(e, count);
	});
}

function getRandom() {
	var random = Math.floor(Math.random()*2);
	return random === 0 ? -1 : 1;
}

function getBucket(chip) {
	var total = 0;
	$.each(chip.path, function(i, e) {
		total += e;
	});
	switch(total) {
		case -4:
			buckets[1]++;
			break;
		case -2:
			buckets[2]++;
			break;
		case 0:
			buckets[3]++;
			break;
		case 2:
			buckets[4]++;
			break;
		case 4:
			buckets[5]++;
			break;
		default:
			break;
	}
	buckets.drops++;
	updateBuckets();
	$(chip.el).remove();
	if ($scope.tokenCount <= 0 && chip.chipNum <= 0) endGame();
}

function endGame(){
	let score = getScore();
	let scoreString = score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	if ($scope.scores.length < 10 || score > $scope.scores[$scope.scores.length - 1].Points){
		$.confirm({
			title: 'You got a highscore!',
			useBootstrap: false,
			animateFromElement: false,
			animation: 'scale',
			content: '' +
			    '<form action="" class="formName">' +
			    '<div class="form-group">' +
			    '<p>You won $' + scoreString + '!</p>' +
			    '<label>What is your name: </label>' +
			    '<input type="text" placeholder="Your name" maxlength="25" class="name form-control" required />' +
			    '</div>' +
			    '</form>',
			    buttons: {
			        formSubmit: {
			            text: 'Submit',
			            btnClass: 'btn-blue',
			            action: function () {
			                var name = this.$content.find('.name').val();
			                if(!name){
			                    $.alert({title:"Error", useBootstrap: false, content:'Name cannot be blank'});
			                    return false;
			                }
							postHighscore(name, score);
			            }
			        },
			        cancel: function () {
			            //close
			        },
			    },
			    onContentReady: function () {
			        // bind to events
			        var jc = this;
			        this.$content.find('form').on('submit', function (e) {
			            // if the user submits the form by pressing enter in the field.
			            e.preventDefault();
			            jc.$$formSubmit.trigger('click'); // reference the button and click it
			        });
			    }
		});
	} else {
		$.alert({title:"Sorry", useBootstrap: false, content:'<p>You won $' + scoreString + '</p><p>You did not make it into the top 10</p>'});
	}
}

function postHighscore(name, score){
	$.LoadingOverlay("show");
	score = { Name: name, Points: score };
	$http.post('/highscores', score).then(function(data){
		//$scope.comments.push(data);
		refreshLeaderboard();
		$.LoadingOverlay("hide");
	});
            
}

function refreshLeaderboard(){
	return $http.get('/highscores').then(function(data){
        angular.copy(data.data, $scope.scores);
	});
}

function getScore(){
	let score = 0;
	score += buckets[1] * 900000;
	score += buckets[2] * 400000;
	score += buckets[3] * 200000;
	score += buckets[4] * 500000;
	score += buckets[5] * 1000000;
	return score;
}

function printPath(path) {
	// for debugging
	// Shows path, 0 is left, 1 is right
	var directions = [];
	$.each(path, function(i, e) {
		var dir = e < 0 ? 'left' : 'right';
		directions.push(dir);
	});
	//console.log('New path: ' + directions);
}

var Chip = function(boardId, speed) {
	this.board = $('#' + boardId);
	this.speed = speed;
	this.chipNum = $scope.tokenCount
	this.location = {
		x: this.board.width() / 2,
		y: 0
	};
	this.lastStep = 0;
	var chip = $('<div class="chip"></div>');
	this.board.append(chip);
	this.el = $(chip);
	this.el.css('left', this.location.x + 'px').css('top', this.location.y + 'px');
};

Chip.prototype.start = function() {
	var self = this;
	self.path = [];
	for (var i=0; i<4; i++) {
		self.path.push(getRandom());
	}
	printPath(self.path);
	this.nextStep();
};

Chip.prototype.nextStep = function() {
	var self = this;
	if (self.lastStep < 4) {
		var offset = self.path[self.lastStep] < 0 ? -2  : 2;
		self.animateTo({
			x: offset,
			y: 2
		});
	} else {
		getBucket(self);
	}
};

Chip.prototype.animateTo = function(offset) {
	var self = this;
	var step = {
		x : self.board.height() / 11,
		y : self.board.width() / 17
	};
	self.el.animate({
		left: '+=' + (step.x * offset.x),
		top: '+=' + (step.y * offset.y)
	}, self.speed, function() {
		self.location.x = self.el.css('left');
		self.location.y = self.el.css('top');
		self.lastStep++;
		self.nextStep();
	});
};

var id = 1;
$(document).ready(function () {
	$(document).keydown(function (e) {
		e = e || window.event;
		if (e.keyCode === 32) {
			e.preventDefault();
			if ($scope.tokenCount > 0){
				$scope.tokenCount -= 1;
				$scope.$digest();
				refreshLeaderboard();
				var chip = new Chip('plinko-board', 500);
				chip.start();
			} else {
				console.log("Out of chips!!");
			}
		}
	});
});

}]);
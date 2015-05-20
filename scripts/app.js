var versionNumber = "1.0.1";
var adminEmail = "anthony.beard89@gmail.com";

var ErrorCodes = makeStruct("info warning error");
var logTypes = new ErrorCodes();
var loggingEnabled = true;

var browserIsCompleteShit = /^.*MSIE.*$/.test(navigator.userAgent);


var gameObjectPrototype = {
	// Public Properties
	domElement: null,
	
	// Private Properties
	localLogging: false,
	warningPrefix: "WARN:",
	errorPrefix: "ERROR:",
	infoPrefix: "INFO:",
	objLogId: "",
	
	// Public Methods
	enableLogging: function() {
		this.localLogging = true;
		return this;
	},
	disableLogging: function() {
		this.localLogging = false;
		return this;
	},
	hide: function() {
		$(this.domElement).hide();
		return this;
	},
	show: function() {
		//$(this.domElement).show();
		$(this.domElement).attr("style", "");
		//$(window).trigger("resize");
		return this;
	},
	remove: function() {
		var $parentElement = $(this.domElement).parent();
		$(this.domElement).remove();
		
		// This is a bit experimental. This is intended to only affect containers of listable elements, like teams or data sets.
		// For, these types, when the item is removed, it will hide the parent if there are no more children.
		// Of course, you'll have to undo this action somewhere, most likely in 'appendToDom';
		
		if ($parentElement.children().length == 0) {
			$parentElement.hide();
		}
	},
	createAndAppendToDom: function(ofType, toParent, optPrependBool) {
		var prepend = optPrependBool || false;
		var item = document.createElement(ofType);
		if (prepend) {
			$(toParent).prepend(item);
		} else {
			$(toParent).append(item);
		}
		return item;
	},
	appendToDom: function(toParent, optPrependBool){
		var prepend = optPrependBool || false;
		var item = this.domElement;
		if (prepend) {
			$(toParent).prepend(item);
		} else {
			$(toParent).append(item);
		}
		
		$(toParent).attr("style", "");
		
		return item;
	},
	addClassToDomElement: function(newClass){
		var jQueryElement = $(this.domElement);
		jQueryElement.addClass(newClass);
		return jQueryElement;
	},
	removeClassFromDomElement: function(oldClass){
		var jQueryElement = $(this.domElement);
		jQueryElement.removeClass(oldClass);
		return jQueryElement;
	},
	addPlayModeContainer: function(toParent, optPrependBool){
		var playModeDiv = this.createAndAppendToDom("span", toParent, optPrependBool);
		$(playModeDiv).addClass("playMode");
		return playModeDiv;
	},
	addEditModeContainer: function(toParent, optPrependBool){
		var editModeDiv = this.createAndAppendToDom("span", toParent, optPrependBool);
		$(editModeDiv).addClass("editMode");
		return editModeDiv;
	},
	enterEditMode: function() {
		//$(this.domElement).find(".doneButton").add(".deleteButton").add(".editButton").show();
		//$(this.domElement).find(".editMode").css("display", "inline-block");
		this.exitPlayMode();
		$(this.domElement).find(".editMode").css("display", "");
		return this;
	},
	exitEditMode: function() {
		//$(this.domElement).find(".doneButton").add(".deleteButton").add(".editButton").hide();
		
		// This is jerry-rigged as fuck! But I'm dealing with a major design flaw, so this is pretty minor compared to that monster!
		if ($(this.domElement).hasClass("gameTeam")) {
			var teamLabel = $(this.domElement).find(".teamLabel").get(0);
				
			if ($(teamLabel).find("input").length != 0) {
				$(teamLabel).find("input").get(0).value = this.teamName;
// 				team.buttons.done.domElement.click();
			}
		} else if ($(this.domElement).hasClass("gameDataSet")) {
			var dataSetNameInput = $(this.domElement).find(".dataSetNameInput").get(0);
			var dataSetNameDisplayInsert = $(this.domElement).find(".dataSetNameDisplayInsert").get(0);
			
			dataSetNameInput.value = $(dataSetNameDisplayInsert).html();
					
// 			$(doneButton.domElement).get(0).click();
		}
		
		$(this.domElement).find(".doneButton:visible").each(function(){
			this.click();
		});
		$(this.domElement).find(".editMode").hide();
		return this;
	},
	enterPlayMode: function() {
		//$(this.domElement).find(".doneButton").add(".deleteButton").add(".editButton").show();
		//$(this.domElement).find(".playMode").css("display", "inline-block");
		this.exitEditMode();
		$(this.domElement).find(".playMode").css("display", "");
		return this;
	},
	exitPlayMode: function() {
		//$(this.domElement).find(".doneButton").add(".deleteButton").add(".editButton").hide();
		$(this.domElement).find(".playMode").hide();
		return this;
	},
	toggleClassOnDomElement: function(toToggle){
		var jQueryElement = $(this.domElement);
		jQueryElement.toggleClass(toToggle);
		return jQueryElement;
	},
	log: function(logComment, logType) {
		// Added for IE compatibility. The console object is not defined unless the dev tab is open.
		// WTF, IE?! Seriously... W.T.F.?
		if (typeof console != "undefined") {
			if (window.loggingEnabled) {
				if (logType !== logTypes.warning && logType !== logTypes.error) {
					logType = logTypes.info;
				}
				switch (logType) {
					case logTypes.warning:
						logComment = this.warningPrefix + this.objLogId + ":" + logComment;
						break;
					case logTypes.error:
						logComment = this.errorPrefix + this.objLogId + ":" + logComment;
						break;
					default:
						logComment = this.infoPrefix + this.objLogId + ":" + logComment;
				}
				console.log(logComment);
			} else if (this.localLogging) {
				if (logType !== logTypes.warning && logType !== logTypes.error) {
					logType = logTypes.info;
				}
				switch (logType) {
					case logTypes.warning:
						logComment = this.warningPrefix + this.objLogId + ":" + logComment;
						break;
					case logTypes.error:
						logComment = this.errorPrefix + this.objLogId + ":" + logComment;
						break;
					default:
						logComment = this.infoPrefix + this.objLogId + ":" + logComment;
				}
				console.log(logComment);
			}
		}
		return this;
	}
}

function GameController(pointsArray, categoriesDict, containerId) {
	var GameStates = makeStruct("StartScreen Info Options ImportData ExportData DataMgmt MakeBoard ChooseData SelectQuestion AnswerQuestion");
	var navTrail = [];
	// Properties
	this.containerId = containerId || "body";
	this.gameBoard = {};
	this.gameStates = new GameStates();
	this.gameState = this.gameStates.StartScreen;
	this.gameOverlays = {};
	
	this.objLogId;
	this.currentQuestion = "";
	this.currentQuestionId = "";
	this.currentQuestionValue = "";
	this.options = {
		autoTeams: true
	};
	this.teamColors = {};
	
	this.teamsList = [];
	this.teams = {};
	this.teamsToSave = [];
	this.teamsToDelete = [];
	
	this.htmlFileToLoad;
	this.editModeCurrentCol;
	
	this.dataSetsList = [];
	this.dataSets = {}
	this.dataSetsToSave = [];
	this.dataSetsToDelete = [];
	
	this.currentDataSet = {};
	
	// Note that $.extend(true, {}, obj) is used to make a deep copy of a variable, instead of passing by reference.
	this.newOptions = $.extend(true, {}, this.options);
	
	// Methods
	this.changeGameState = function(toState){
		switch (toState) {
			case this.gameStates.StartScreen:
				this.gameState = toState;
				this.log("Game State changed to 'StartScreen'.");
				this.hideAllOverlays();
				this.gameOverlays[this.gameStates.StartScreen].show();
				break;
			case this.gameStates.Info:
				this.gameState = toState;
				this.log("Game State changed to 'Info'.");
				this.hideAllOverlays();
				this.gameOverlays[this.gameStates.Info].show();
				
				// IE workaround. Alternate AJAX request that actually works in IE
				if (browserIsCompleteShit) {
					var request = new ActiveXObject("MSXML2.XMLHTTP.6.0");
					request.open("GET", "./"+this.htmlFileToLoad, false);
					request.send();
					$("#infoDiv").html(request.responseText);
					refreshInfo();
				} else {
					$("#infoDiv").load("./"+this.htmlFileToLoad, refreshInfo);
				}
				break;
			case this.gameStates.Options:
				this.gameState = toState;
				// I'm paranoid. Reset the newOptions to the actual options object.
				// This will also effectively discard any changes that weren't saved.
				this.newOptions = $.extend(true, {}, this.options);
				
				this.log("Game State changed to 'Options'.");
				this.hideAllOverlays();
				
				for (team in this.teams) {
					this.teams[team].enterEditMode();
				}
				
				this.gameOverlays[this.gameStates.Options].show();
				this.gameOverlays[this.gameStates.Options].clearScreen();
				this.gameOverlays[this.gameStates.Options].fillScreen();
				
				$("#createTeamsFieldName")[0].focus();
				break;
			case this.gameStates.ImportData:
				this.gameState = toState;
				var ovly = this.gameOverlays[toState];
				this.log("Game State changed to 'ImportData'.");
				this.hideAllOverlays();
				ovly.show();
				break;
			case this.gameStates.ExportData:
				this.gameState = toState;
				var ovly = this.gameOverlays[toState];
				this.log("Game State changed to 'ExportData'.");
				this.hideAllOverlays();
				ovly.show();
				break;
			case this.gameStates.DataMgmt:
				this.gameState = toState;
				
				this.log("Game State changed to 'DataMgmt'.");
				
				this.hideAllOverlays();
				this.gameOverlays[this.gameStates.DataMgmt].show();
				this.gameOverlays[this.gameStates.DataMgmt].clearScreen();
				this.gameOverlays[this.gameStates.DataMgmt].fillScreen();

				break;
			case this.gameStates.MakeBoard:
				if (this.gameBoardEditMode != true) {this.gameBoardEditMode = true;};
				this.gameState = toState;
				this.log("Game State changed to 'MakeBoard'.");
				this.hideAllOverlays();
				
				var ovly = this.gameOverlays[toState];
				var selectQuestionOvly = this.gameOverlays[this.gameStates.SelectQuestion];
				var dummyBoardDiv = $(ovly.domElement).find(".makeBoardDummyContainer");
				
				selectQuestionOvly.show().appendToDom(dummyBoardDiv);
				selectQuestionOvly.enterEditMode();
				$(selectQuestionOvly.domElement).find("th button").get(0).click();
				
				ovly.show();

				break;
			case this.gameStates.ChooseData:
				this.gameState = toState;
				var ovly = this.gameOverlays[toState];
				this.log("Game State changed to 'ChooseData'.");
				this.hideAllOverlays();
				ovly.show();
				ovly.fillScreen();
				
				if (typeof this.currentDataSet == "undefined") {
					this.setCurrentDataSet();
				}
				
				break;
			case this.gameStates.SelectQuestion:
				this.gameOverlays[this.gameStates.AnswerQuestion].enterPlayMode();
				
				this.gameState = toState;
				this.log("Game State changed to 'SelectQuestion'.");
				this.hideAllOverlays();
				this.gameOverlays[toState].appendToDom(this.containerId);
				$("." +this.gameBoard.selectedColumnCssClass).removeClass(this.gameBoard.selectedColumnCssClass);
				this.gameOverlays[toState].show();
				this.gameBoard.enterPlayMode();
				
				for (key in this.teams) {
					this.teams[key].enterPlayMode();
				}
				
				break;
			case this.gameStates.AnswerQuestion:
				this.gameState = toState;
				this.log("Game State changed to 'AnswerQuestion'.");
				this.hideAllOverlays();
				this.gameOverlays[this.gameStates.AnswerQuestion].show();
				this.log("Utilizing currentQuestion: '" +this.currentQuestion +"'.")
				$(this.gameOverlays[this.gameStates.AnswerQuestion].domElement).find(".questionToAnswer span").html(this.currentQuestion);
				$(this.gameOverlays[this.gameStates.AnswerQuestion].domElement).find(".questionInfo").html(this.currentQuestionValue).wrapInner("<span></span>");
				this.updateTeamListInContainer( $(this.gameOverlays[this.gameStates.AnswerQuestion].domElement).find(".teamListDiv")[0] );

				break;
			default:
				this.log("Unknown Game State.", logTypes.error);
				break;
		}
		$(window).trigger("resize");
		return this;
	};
	
	// Screen Creation Methods.
	this.createStartScreen = function(){
		this.gameOverlays[this.gameStates.StartScreen] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.StartScreen];
		ovly.init("StartScreenOvly");
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonContainer");
		
		var startButton = new GameButtonWithController(this);
		startButton.initWith("regularButton", "Start Game", buttonDiv, function(){
			this.log("Button changing game state to 'ChooseData'");
			this.controller.navPush(this.controller.gameStates.ChooseData);
		});
		
		var optionsButton = new GameButtonWithController(this);
		optionsButton.initWith("regularButton", "Setup", buttonDiv, function() {
			this.log("Button changing game state to 'Options'.");
			this.controller.navPush(this.controller.gameStates.Options);
		});
		
		var aboutButton = new GameButtonWithController(this);
		aboutButton.initWith("regularButton", "About", buttonDiv, function(){
			this.log("Button changing game state to 'Info'.");
			this.controller.htmlFileToLoad = "./about.html";
			this.controller.navPush(this.controller.gameStates.Info);
		});
		
		var howToUseButton = new GameButtonWithController(this);
		howToUseButton.initWith("regularButton", "User's Guide", buttonDiv, function(){
			this.log("Button changing game state to 'Info'.");
			this.controller.htmlFileToLoad = "./howtouse.html";
			this.controller.navPush(this.controller.gameStates.Info);
		});
		
		var title = this.createAndAppendToDom("div", ovly.domElement, true);
		$(title).addClass("gameTitle").html("Jeopardy").wrapInner("<span></span>");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		return this;
	};
	this.createInfoScreen = function(){
		this.gameOverlays[this.gameStates.Info] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.Info];
		ovly.init("InfoScreenOvly");
		ovly.addClassToDomElement("twoPanes");
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
			
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
		
				var backButton = new GameButtonWithController(this);
				backButton.initWith("regularButton", "Back", buttonDivInsert, function(){
					this.log("Button changing game state to 'StartScreen'.");
					this.controller.navPop();
				});
			
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
			
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
		
				var infoDiv = this.createAndAppendToDom("div", dataDivInsert);
				infoDiv.id = "infoDiv";
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		return this;
	};
	this.createSelectQuestionScreen = function(){
		var ovlyId = "SelectQuestionScreenOvly";
		
		$("#" +ovlyId).remove();
		delete this.gameOverlays[this.gameStates.SelectQuestion];
		
		this.gameOverlays[this.gameStates.SelectQuestion] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.SelectQuestion];
		ovly.init(ovlyId);
		
		this.gameBoard = new GameBoardWithController(this, "gameCategories", "x", null);
		this.gameBoard.init("jeopBoard");
		this.gameBoard.appendToDom(ovly.domElement);
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		return this;
	};
	this.createAnswerQuestionScreen = function(){
		this.gameOverlays[this.gameStates.AnswerQuestion] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.AnswerQuestion];
		ovly.init("AnswerQuestionScreenOvly");
		
		var questionDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(questionDiv).addClass("questionToAnswer playMode");
		ovly.appendToDom(this.containerId);
		ovly.createAndAppendToDom("span", questionDiv);
		ovly.hide();
		
		var questionInfoAndControlDiv = this.createAndAppendToDom("div", ovly.domElement, true);
		$(questionInfoAndControlDiv).addClass("questionInfoAndControl playMode");
		
		var questionInfoDiv = this.createAndAppendToDom("div", questionInfoAndControlDiv);
		$(questionInfoDiv).addClass("questionInfo");
		
		var questionControlsDiv = this.createAndAppendToDom("div", questionInfoAndControlDiv);
		$(questionControlsDiv).addClass("questionControls");
		
		var backButton = new GameButtonWithController(this);
		backButton.initWith("regularButton backButton", "Cancel", questionControlsDiv, function(){
			this.controller.navPop();
			
			for (i=0;i<this.controller.teamsList.length;i++) {
				this.controller.teams[ this.controller.teamsList[i] ].cancelEdits();
			}
			
			$(window).trigger("resize");
		});
		
		var doneButton = new GameButtonWithController(this);
		doneButton.initWith("regularButton correctAnswerButton", "Done", questionControlsDiv, function() {
			$("#" +this.controller.currentQuestionId).addClass("answeredQ");
			
			for (i=0;i<this.controller.teamsList.length;i++) {
				this.controller.teams[ this.controller.teamsList[i] ].confirmEdits();
			}
			
			this.controller.navPop();
			$(window).trigger("resize");
		});
		
		var teamListDiv = this.createAndAppendToDom("div", questionInfoAndControlDiv);
		$(teamListDiv).addClass("teamListDiv");
		
		for (team in this.teams) {
			this.teams[team].appendToDom(teamListDiv);
		}
		
		// Edit Mode
		var editModeDiv = this.createAndAppendToDom("div", ovly.domElement, true);
		$(editModeDiv).addClass("editMode");
		
		var editModeButtonContainer = this.createAndAppendToDom("div", editModeDiv);
		$(editModeButtonContainer).addClass("buttonContainer");
		
		previewQuestionDiv = this.createAndAppendToDom("div", editModeDiv);
		$(previewQuestionDiv).addClass("previewQuestionDiv");
		
		var previewQuestionSpan = this.createAndAppendToDom("span", previewQuestionDiv);
		$(previewQuestionSpan).addClass("previewQuestionSpan");
		
		var questionEditor = this.createAndAppendToDom("div", previewQuestionDiv);
		questionEditor.id = "questionEditor1";
		$(questionEditor).addClass("ckeditor");
		$(questionEditor).hide();
		
		var editButton = new GameButtonWithController(this);
		editButton.initWith("regularButton editButton", "Edit", editModeButtonContainer, function(){
			// hide question
			$(previewQuestionSpan).hide();
			
			// display editor
			var editorsHaveStarted = ovly.initCkeditors();
			
			// insert question into editor
			var buttonObject = this;
			CKEDITOR.on("instanceReady", function(){
				// So, what I needed to do was leave the reference to the text variable in the setup function.
				// If I stored the question text in a separate variable within the button handler, then the dynamic link was cut,
				// leaving this function with a primitive value, rather than a dynamic reference that can be changed every time.
				CKEDITOR.instances[questionEditor.id].setData(buttonObject.controller.gameBoard.editModeQuestionText);
			});
			
			this.hide();
			$(editModeButtonContainer).find(".doneButton").show();
		});
		var doneButton = new GameButtonWithController(this);
		doneButton.initWith("regularButton doneButton", "Done", editModeButtonContainer, function(){
			// get question
			var htmlToSave = CKEDITOR.instances[questionEditor.id].getData();
			
			// hide editor
				// In response to the dynamic creation solution, let's destroy it after we save the Html.
			CKEDITOR.instances[questionEditor.id].updateElement();
			CKEDITOR.instances[questionEditor.id].destroy();
			// display question
			$(previewQuestionSpan).html(htmlToSave);
			$(previewQuestionSpan).show();
			
			// save question
			this.controller.gameBoard.editModeQuestionText = htmlToSave;
			
			this.hide();
			$(editModeButtonContainer).find(".editButton").show();
			$(questionEditor).hide();
			$(window).trigger("resize");
		});
		doneButton.hide();
		var closeButton = new GameButtonWithController(this);
		closeButton.initWith("regularButton", "Close", editModeButtonContainer, function(){
			if (typeof CKEDITOR.instances[questionEditor.id] != "undefined") {
				doneButton.domElement.click();
			}
			// hide overlay
			ovly.enterPlayMode().hide();
			// show other overlay
			this.controller.gameOverlays[this.controller.gameStates.MakeBoard].show();
			// and other stuff that needs doing...
			// Save the edited question text
			// reset the editing board (e.g. click on the already clicked column)
			var columnText = $(this.controller.gameBoard.domElement).find("." +this.controller.gameBoard.selectedColumnCssClass +" span").html();
			var rowValue = this.controller.gameBoard.editModeQuestionRow.replace(this.controller.gameBoard.qRowCssClassPrefix, "");
			rowValue = parseInt(rowValue);
			
			// Data management update:
			this.controller.currentDataSet.editQuestion(this.controller.gameBoard.editModeQuestionText, null, null, columnText, rowValue);
			
			$(this.controller.gameBoard.domElement).find("." +this.controller.gameBoard.selectedColumnCssClass +" button").get(0).click();
			$(window).trigger("resize");
		});
		
		return this;
	};
	this.createSetupScreen = function(){
		this.gameOverlays[this.gameStates.Options] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.Options];
		ovly.init("OptionsScreenOvly");
		
		$(ovly.domElement).addClass("twoPanes");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
			
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
		
		var backButton = new GameButtonWithController(this);
		var saveButton = new GameButtonWithController(this);
		var datasetMgmtButton = new GameButtonWithController(this);
		var importDataButton = new GameButtonWithController(this);
		var exportDataButton = new GameButtonWithController(this);
		var clearDataButton = new GameButtonWithController(this);
		
		backButton.initWith("regularButton", "Back", buttonDivInsert, function() {
			for (team in this.controller.teams) {
				this.controller.teams[team].enterPlayMode();
			}
			$(".errorMessage").html("");
			this.controller.navPop();
			
			var tempArray = $.extend([], this.controller.teamsToDelete);
			for (i=0;i<tempArray.length;i++) {
				this.controller.markTeamToUndelete(tempArray[i]);
			}
			
			tempArray = $.extend([], this.controller.teamsToSave);
			for (i=0;i<tempArray.length;i++) {
				this.controller.markTeamToDelete(tempArray[i]);
			}
			
			this.controller.deleteMarkedTeams();
			
			// Now that that's all taken care of, let's get rid of any changes to the remaining teams.
			this.controller.cancelTeamEdits();
		});
		saveButton.initWith("regularButton", "Save", buttonDivInsert, function() {
			$(".gameTeam .doneButton").each(function(){
				this.click();
			});
			this.controller.options = $.extend(true, {}, this.controller.newOptions);
			this.controller.saveMarkedTeams();
			this.controller.deleteMarkedTeams();
			this.controller.confirmTeamEdits();
			this.controller.saveTeams();
			this.controller.updateAutoTeams();
			this.log("Options saved.");
		});
		this.createAndAppendToDom("hr", buttonDivInsert);
		datasetMgmtButton.initWith("regularButton", "Data Sets", buttonDivInsert, function(){
			this.controller.navPush(this.controller.gameStates.DataMgmt);
		});
		importDataButton.initWith("regularButton", "Import", buttonDivInsert, function(){
			this.controller.navPush(this.controller.gameStates.ImportData);
		});
		exportDataButton.initWith("regularButton", "Export", buttonDivInsert, function(){
			this.controller.navPush(this.controller.gameStates.ExportData);
		});
		this.createAndAppendToDom("hr", buttonDivInsert);
		clearDataButton.initWith("regularButton", "Clear Data", buttonDivInsert, function(){
			var proceed = confirm("All saved data is about to be cleared.\n\nAre you sure you want to do this?");
			
			if (proceed == true) {
				this.controller.clearData();
				return true;
			} else {
				return false;
			}
		});
		
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
		
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
		
		var optionAutoTeams = new GameCheckboxWithController(this);
		optionAutoTeams.initWith("optionAutoTeams", "Use automatic teams?", dataDivInsert, this.newOptions["autoTeams"], function(){
			this.controller.newOptions["autoTeams"] = this.domElement.checked;
			if (this.domElement.checked) {
				$(".createTeams").show();
				ovly.fillScreen();
			} else {
				$(".createTeams, .readyTeams").hide();
				ovly.clearScreen();
			}
		});
		
		// Team Creator
		var createTeamsDiv = this.createAndAppendToDom("div", dataDivInsert);
		$(createTeamsDiv).addClass("createTeams");
			var createTeamsForm = this.createAndAppendToDom("form", createTeamsDiv);
			createTeamsForm.id = "createTeamsForm";
			createTeamsForm.onsubmit = function(){return false;};
		
		var createTeamsFieldName = this.createAndAppendToDom("input", createTeamsForm);
		createTeamsFieldName.type = "text";
		//createTeamsFieldName.placeholder = "Team Name";
		// The Placeholder.js for some reason won't update the text by simply setting the property, so setting via jQuery instead.
		$(createTeamsFieldName).attr("placeholder", "Team Name");
		createTeamsFieldName.id = "createTeamsFieldName";
		createTeamsFieldName.name = createTeamsFieldName.id;
		
		var createTeamsFieldPoints = this.createAndAppendToDom("input", createTeamsForm);
		
		// IE workaround. "Number" type not supported.
		if ( browserIsCompleteShit ) {
			createTeamsFieldPoints.type = "text";
		} else {
			createTeamsFieldPoints.type = "number";
		}
		//createTeamsFieldPoints.placeholder = "Team Points";
		$(createTeamsFieldPoints).attr("placeholder", "Team Points");
		createTeamsFieldPoints.id = "createTeamsFieldPoints";
		createTeamsFieldPoints.name = createTeamsFieldPoints.id;
		
		var createTeamsFieldColor = this.createAndAppendToDom("select", createTeamsForm);
		createTeamsFieldColor.id = "createTeamsFieldColor";
		var defaultItem = this.createAndAppendToDom("option", createTeamsFieldColor);
		defaultItem.value = "";
		$(defaultItem).prop("disabled", true).prop("selected", true);
		$(defaultItem).html("Team Color");
		for (color in this.teamColors) {
			var item = this.createAndAppendToDom("option", createTeamsFieldColor);
			$(item).html(color);
			item.value = color;
		}
		
		var errorMessage = document.createElement("span");
		$(errorMessage).addClass("errorMessage");
		
		var readyTeamsDiv = this.createAndAppendToDom("div", dataDivInsert);
		$(readyTeamsDiv).addClass("readyTeams").hide();
		for (key in this.teams) {
			this.teams[key].appendToDom(readyTeamsDiv);
		}
		
		var createTeamsSubmit = new GameButtonWithController(this);
		createTeamsSubmit.initWith("regularButton", "Create Team", createTeamsForm, function(){
			
			// Form checking
			
			if (createTeamsFieldName.value == "") {
				$(errorMessage).html("Please enter a Team Name.");
				return false;
			} else if (! this.controller.isNewTeamNameValid(createTeamsFieldName.value)) {
				$(errorMessage).html("That team already exists.");
				return false;
			}
			$(errorMessage).html("");
			
			var colorValue = createTeamsFieldColor.value +"";
			if (createTeamsFieldName.value != "" && createTeamsFieldColor.value == "") {
				colorValue = "Red";
			}
			
			
			// Form checks out
			
			this.log("Adding team '" +createTeamsFieldName.value +"'.");
			
			// Default points value of 0.
			var pointsToAdd = parseInt(createTeamsFieldPoints.value);
			if (pointsToAdd.toString() == "NaN") {
				pointsToAdd = 0;
			}
			
			// Initialize the new team.
			var team = this.controller.addTempTeam(createTeamsFieldName.value || "unnamed team", this.controller.teamColors[colorValue], pointsToAdd);
			// Definitely add this to the new GameTeam constructor
			team.addClassToDomElement("gameTeam");
			team.appendToDom(readyTeamsDiv);
			
			// Change this color thing. I could probably have a method to add a new color, and that method would refresh all the dropdowns in each team.
			for (i=0;i< $(createTeamsFieldColor).children("option").length ;i++) {
				$( team.chooseColorDropdown ).append( $( $(createTeamsFieldColor).children("option")[i] ).clone() ) ;
			}
			
			team.enterEditMode();
			$(readyTeamsDiv).show();
			
			// Isn't there a better way to reset a form? I can't remember it right now. Do it later.
			createTeamsFieldName.value = "";
			createTeamsFieldColor.value = "";
			createTeamsFieldPoints.value = "";

			// Yet another IE workaround (partially blaming Placeholder.js). Effect: displays the input placeholders after form submit.
			$("#createTeamsForm input").each(function(){
				this.focus();
				this.blur();
			});
			
			$("#createTeamsFieldName")[0].focus();
		});
		createTeamsSubmit.domElement.id = "createTeamsFormSubmit";
		
		$(function() {
		    $("#createTeamsForm").on('keydown', function(event) {
		        if(event.which == 13) {
		            $("#createTeamsFormSubmit")[0].click();
		            return false;
		        }
		    });
		});
		
		$(createTeamsForm).append(errorMessage);
		
		ovly.clearScreen = function() {
			$(".gameTeam").detach();
		};
		ovly.fillScreen = function() {
			if (this.controller.newOptions["autoTeams"] == true) {
				
				for (team in ovly.controller.teams) {
					ovly.controller.teams[team].appendToDom(readyTeamsDiv);
				}
				
				if ($(ovly.domElement).find(".readyTeams").children().length > 0) {
					$(ovly.domElement).find(".readyTeams").show();
				} else {
					$(ovly.domElement).find(".readyTeams").hide();
				}
			}
		};
		return this;
	};
	this.createImportDataScreen = function(){
		this.gameOverlays[this.gameStates.ImportData] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.ImportData];
		ovly.init("ImportDataScreenOvly");
		
		$(ovly.domElement).addClass("twoPanes");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
			
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
			
				var backButton = new GameButtonWithController(this);
				var exportButton = new GameButtonWithController(this);
				
				backButton.initWith("regularButton backButton", "Back", buttonDivInsert, function(){
					this.controller.navPop();
				});
				exportButton.initWith("regularButton exportButton", "Export", buttonDivInsert, function(){
					this.controller.navSwitch(this.controller.gameStates.ExportData);
				});
			
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
			
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
				
				var importTextArea = this.createAndAppendToDom("textarea", dataDivInsert);
				
				var importDataButton = new GameButtonWithController(this);
				importDataButton.initWith("regularButton", "Import Data", dataDivInsert, function(){
					this.controller.importStringAsData(importTextArea.value);
				});
				
				$(importTextArea).before(importDataButton.domElement);
	};
	this.createExportDataScreen = function(){
		this.gameOverlays[this.gameStates.ExportData] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.ExportData];
		ovly.init("ImportDataScreenOvly");
		
		$(ovly.domElement).addClass("twoPanes");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
			
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
			
				var backButton = new GameButtonWithController(this);
				var importButton = new GameButtonWithController(this);
				
				backButton.initWith("regularButton backButton", "Back", buttonDivInsert, function(){
					this.controller.navPop();
				});
				importButton.initWith("regularButton exportButton", "Import", buttonDivInsert, function(){
					this.controller.navSwitch(this.controller.gameStates.ImportData);
				});
			
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
			
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
				
				var exportTextArea = this.createAndAppendToDom("textarea", dataDivInsert);
				exportTextArea.readOnly = true;
				
				var exportDataButton = new GameButtonWithController(this);
				exportDataButton.initWith("regularButton", "Export Data", dataDivInsert, function(){
					var exportString = this.controller.createExportString();
					if (exportString === "{}") {
						alert("There is no data to export.");
					} else {
						exportTextArea.value = exportString;
					}
				});
				
				$(exportTextArea).before(exportDataButton.domElement);
	};
	this.createDataMgmtScreen = function(){
		this.gameOverlays[this.gameStates.DataMgmt] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.DataMgmt];
		ovly.init("DataMgmtScreenOvly");
		
		$(ovly.domElement).addClass("twoPanes");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
			
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
		
				var backButton = new GameButtonWithController(this);
				var saveButton = new GameButtonWithController(this);
				var importButton = new GameButtonWithController(this);
				var exportButton = new GameButtonWithController(this);
				
				backButton.initWith("regularButton", "Back", buttonDivInsert, function(){
					
					// I also replicated this process with the teams, so be careful if you need to change anything.
					
					// This is a bit strange, but let's go with it.
					// First, undelete everything that's set up for deletion.
						// We do this to make sure that if a data set was previously saved, it will be returned to normal.
						// Anything that wasn't previously saved will be put back into the array for new data sets.
					// Next, we mark all new data sets for deletion.
					// Then finally, we will get rid of them.
					
					// Doing things this way will ensure the following scenarios work properly.
						// 1. New data set will be removed upon cancel.
						// 2. Old data sets will remain undeleted.
						// 3. If an old data set was marked for deletion, then it will be automatically restored upon cancel.
						// 4. New data sets that are marked for deletion will be deleted upon cancel.
					var tempArray = $.extend([], this.controller.dataSetsToDelete);
					for (i=0;i<tempArray.length;i++) {
						this.controller.markDataSetToUndelete(tempArray[i]);
					}
					
					tempArray = $.extend([], this.controller.dataSetsToSave);
					for (i=0;i<tempArray.length;i++) {
						this.controller.markDataSetToDelete(tempArray[i]);
					}
					
					this.controller.deleteMarkedDataSets();
					
					// Now that that's all taken care of, let's get rid of any changes to the remaining data sets.
					this.controller.cancelDataSetEdits();
					
					this.controller.navPop();
				});
				saveButton.initWith("regularButton", "Save", buttonDivInsert, function(){
					// Get visible done buttons. (i.e. edits that haven't been saved yet)
					var buttons = $(ovly.domElement).find(".gameDataSet .doneButton:visible");
					
					// Save any new data sets
					this.controller.saveMarkedDataSets();
					// Also delete anything that needs to be deleted.
					this.controller.deleteMarkedDataSets();
					
					// Now, confirm any edits that have been made to the data sets;
					this.controller.confirmDataSetEdits();
					
					// Save everything to localStorage
					this.controller.saveDataSets();
					
					this.log("Saved data sets.");
				});
			
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
			
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
				
				var createDataSetForm = this.createAndAppendToDom("form", dataDivInsert);
				$(createDataSetForm).addClass("dataForm");
				createDataSetForm.id = "createDataSetForm";
					
					var dataSetNameField = this.createAndAppendToDom("input", createDataSetForm);
					
					dataSetNameField.type = "text";
// 					dataSetNameField.placeholder = "Name:";
					$(dataSetNameField).attr("placeholder", "Name:");
					
					// IE workaround
					dataSetNameField.focus();
					dataSetNameField.blur();
					
					var dataSetCreateButton = new GameButtonWithController(this);
					dataSetCreateButton.initWith("regularButton", "Create", createDataSetForm, function(event){
						event.preventDefault();
						
						// Get dataset name
						var dataSetName = dataSetNameField.value;
						// check for duplicates
						if ( ! this.controller.isNewDataSetNameValid(dataSetName) ) {
							this.log("Cannot create data set '" +dataSetName +"'.");
							return false;
						}
						
						// create new dataset
							// register dataset in controller if needed
						this.controller.dataSets[dataSetName] = new GameDatasetWithController(this.controller);
						var tempDataSet = this.controller.dataSets[dataSetName];
						
						tempDataSet.initWith(dataSetName);
						
						this.controller.markDataSetToSave(dataSetName);
						
						// add dataset element to the list
						$(dataDiv).find(".displayDataSets").show();
						tempDataSet.appendToDom($(dataDiv).find(".displayDataSets").get(0));
						
						// reset form
						createDataSetForm.reset();
						dataSetNameField.focus();
						
						$(window).trigger("resize");
					});
					
					$(function() {
					    $(dataSetNameField).on('keydown', function(event) {
					        if(event.which == 13) {
					            $(dataSetCreateButton.domElement).get(0).click();
					            return false;
					        }
					    });
					});
				
				var displayDataSetsDiv = this.createAndAppendToDom("div", dataDivInsert);
				$(displayDataSetsDiv).addClass("displayDataSets");
				$(displayDataSetsDiv).hide();
		
		ovly.clearScreen = function(){
			$(this.domElement).find(".gameDataSet").detach();
		};
		ovly.fillScreen = function(){
			for (set in ovly.controller.dataSets) {
				ovly.controller.dataSets[set].appendToDom(displayDataSetsDiv);
				ovly.controller.dataSets[set].exitPlayMode();
				ovly.controller.dataSets[set].enterEditMode();
				// bug fix
				ovly.controller.dataSets[set].updateDisplayInfo();
			}
			
			if ($(ovly.domElement).find(".displayDataSets").children().length > 0) {
				$(ovly.domElement).find(".displayDataSets").show();
			} else {
				$(ovly.domElement).find(".displayDataSets").hide();
			}
		};
	};
	this.createMakeBoardScreen = function(){
		this.gameOverlays[this.gameStates.MakeBoard] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.MakeBoard];
		ovly.init("MakeBoardScreenOvly");
		
		$(ovly.domElement).addClass("twoPanes");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
		
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
				
				var doneButton = new GameButtonWithController(this);
				doneButton.initWith("regularButton", "Done", buttonDivInsert, function(){
// 					this.controller.changeGameState(this.controller.gameStates.DataMgmt);
					this.controller.navPop();
				});
				
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
		
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
				
				var controlsContainer = this.createAndAppendToDom("div", dataDivInsert);
				$(controlsContainer).addClass("controlsContainer");
		
				var formContainer = this.createAndAppendToDom("div", controlsContainer);
				$(formContainer).addClass("formContainer");
		
					var addRowForm = this.createAndAppendToDom("form", formContainer);
					addRowForm.onsubmit = function(){return false;};
		
						var rowPoints = this.createAndAppendToDom("input", addRowForm);
						
						// IE workaround. "Number" type not supported.
						if ( browserIsCompleteShit ) {
							rowPoints.type = "text";
						} else {
							rowPoints.type = "number";
						}
						rowPoints.id = "addRowValue";
						rowPoints.onsubmit = function(){
							$("#"+rowPoints.id).parent().find(".addRow").get(0).click();
							return false;
						};
						rowPoints.placeholder = "Points";
		
					var addRowButton = new GameButtonWithController(this);
					addRowButton.initWith("regularButton addRow", "Add Row", addRowForm, function(){
						if (parseInt(rowPoints.value).toString() == "NaN") {
							this.log("Invalid point value.", logTypes.error);
							return null;
						}
						
						// Data management update:
						var rowAvailable = this.controller.currentDataSet.isRowValueAvailable(rowPoints.value);
						if (! rowAvailable) {
							this.log("Row already exists.", logTypes.error);
							return false;
						}
						this.controller.currentDataSet.addRow(rowPoints.value);
						
						
						var rowParent = this.controller.gameBoard.tableBody;
						var rowClass = this.controller.gameBoard.qRowCssClassPrefix + rowPoints.value +" jeopQuestionRow";
						var rowId = null;
						var prepend = false;
						
						var newRow = this.controller.gameBoard.addRow(rowParent, rowClass, rowId, prepend);
						this.controller.gameBoard.fillQuestionRowWithCells(newRow);
						
						this.controller.gameOverlays[this.controller.gameStates.SelectQuestion].enterEditMode();
						
						$(this.controller.gameBoard.domElement).find("." +this.controller.gameBoard.selectedColumnCssClass +" .editMode button").get(0).click();
						
						$(window).trigger("resize");
						
						// Reset the field
						rowPoints.value = "";
			
						// Yet another IE workaround (partially blaming Placeholder.js). Effect: displays the input placeholders after form submit.
						rowPoints.blur();
						rowPoints.focus();
					});
		
					var addColForm = this.createAndAppendToDom("form", formContainer);
					addColForm.onsubmit = function(){return false;};
		
					var colCat = this.createAndAppendToDom("input", addColForm);
					colCat.type = "text";
					colCat.id = "addColValue";
					colCat.onsubmit = function(){
						$("#" +colCat.id).parent().find(".addCol").get(0).click();
						return false;
					};
					colCat.placeholder = "Category";
					
					var addColButton = new GameButtonWithController(this);
					addColButton.initWith("regularButton addCol", "Add Column", addColForm, function(){
						// Get category text
						var newCategory = colCat.value;
						if (newCategory == "") {
							this.log("Invalid category name.", logTypes.error);
							return false;
						}
						
						// Data management update:
						var colAvailable = this.controller.currentDataSet.isColNameAvailable(newCategory);
						if (! colAvailable) {
							this.log("Category already exists.", logTypes.error);
							return false;
						}
						this.controller.currentDataSet.addCol(newCategory);
						
						// Insert cell to category row
						this.controller.gameBoard.addCellToCategoryRow(newCategory);
						// Insert cell to every row
						for (i=0;i<$(this.controller.gameBoard.tableBody).find("tr").length;i++) {
							this.controller.gameBoard.addCellToQuestionRow(i);
						}
						
						$(this.controller.gameBoard.domElement).find("." +this.controller.gameBoard.selectedColumnCssClass +" .editMode button").get(0).click();
						
						$(window).trigger("resize");
						
						// Reset the field
						colCat.value = "";
			
						// Yet another IE workaround (partially blaming Placeholder.js). Effect: displays the input placeholders after form submit.
						colCat.blur();
						colCat.focus();
					});
		
				var columnEditButtons = this.createAndAppendToDom("div", controlsContainer);
				$(columnEditButtons).addClass("columnEditButtons");
					
					var editColumnButton = new GameButtonWithController(this);
					var doneColumnButton = new GameButtonWithController(this);
					
					editColumnButton.initWith("regularButton editButton", "Edit Column", columnEditButtons, function(){
						$(this.controller.gameBoard.tableHead).find("th .editMode button").hide();
						
						var columnText = $("." +this.controller.gameBoard.selectedColumnCssClass +" .catDivInsert").html();
						$("." +this.controller.gameBoard.selectedColumnCssClass +" .editColumnName").show().get(0).value = columnText;
						
						this.hide();
						doneColumnButton.show();
						$(window).trigger("resize");
					});
					doneColumnButton.initWith("regularButton doneButton", "Done", columnEditButtons, function(){
						var oldText = $("." +this.controller.gameBoard.selectedColumnCssClass +" .catDivInsert").html();
						var newText = $("." +this.controller.gameBoard.selectedColumnCssClass +" .editColumnName").get(0).value;
						
						if (oldText != newText) {
							// Data management update:
							var success = this.controller.currentDataSet.editColName(null, oldText, newText);
							
							if (! success) {
								newText = oldText;
							}
							
							$("." +this.controller.gameBoard.selectedColumnCssClass +" .catDivInsert").html(newText);
						}
						
						$("." +this.controller.gameBoard.selectedColumnCssClass).find(".editColumnName").hide();
						$(this.controller.gameBoard.tableHead).find("th .editMode button").show();
						$("." +this.controller.gameBoard.selectedColumnCssClass +" .editMode button").get(0).click();
						
						this.hide();
						editColumnButton.show();
						$(window).trigger("resize");
					});
					doneColumnButton.hide();
					
					var deleteColumnButton = new GameButtonWithController(this);
					deleteColumnButton.initWith("regularButton", "Delete Column", columnEditButtons, function(){
						// Get the column index.
						var selectedColumn = $(this.controller.gameBoard.tableHead).find("." +this.controller.gameBoard.selectedColumnCssClass);
						if (selectedColumn.length == 0) {
							this.log("Cannot delete. No column selected.", logTypes.error);
							return false;
						}
						if ( $(this.controller.gameBoard.tableHead).find("th").length == 1 ) {
							this.log("Cannot delete the last category.", logTypes.error);
							return false;
						}
						selectedColumn = selectedColumn.get(0);
						var columnIndex = $(this.controller.gameBoard.tableHead).find("th").index(selectedColumn);
						
						var categoryName = $(selectedColumn).find(".catDivInsert").html();
						
						// Data management update:
						this.controller.currentDataSet.delCol(null, categoryName);
						
						// remove the category cell
						$(selectedColumn).remove();
						// Also click on another cell so we always have another column selected.
						var colToSelect = $(this.controller.gameBoard.tableHead).find("th").get(columnIndex);
						if ( typeof colToSelect == "undefined" ) {
							colToSelect = $(this.controller.gameBoard.tableHead).find("th").last().get(0);
						}
						$(colToSelect).find("button").get(0).click();
						
						// remove one cell from each row to make up for the loss of a column.
						var arrayOfRows = $(this.controller.gameBoard.tableBody).find("tr");
						for (i=0;i<arrayOfRows.length;i++) {
							this.controller.gameBoard.removeCellFromRow( arrayOfRows.get(i) );
						}
						
						// paperwork
						$(window).trigger("resize");
					});
		
				var dummyBoardDiv = this.createAndAppendToDom("div", dataDivInsert);
				$(dummyBoardDiv).addClass("makeBoardDummyContainer");
		
		return this;
	};
	this.createChooseDataScreen = function(){
		this.gameOverlays[this.gameStates.ChooseData] = new GameOverlayWithController(this);
		var ovly = this.gameOverlays[this.gameStates.ChooseData];
		ovly.init("ChooseDataScreenOvly");
		
		$(ovly.domElement).addClass("twoPanes");
		
		ovly.appendToDom(this.containerId);
		ovly.hide();
		
		var buttonDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(buttonDiv).addClass("buttonDiv");
			
			var buttonDivInsert = this.createAndAppendToDom("div", buttonDiv);
			$(buttonDivInsert).addClass("buttonDivInsert");
			
			var backButton = new GameButtonWithController(this);
			var startButton = new GameButtonWithController(this);
			var dataMgmtButton = new GameButtonWithController(this);
			
			backButton.initWith("regularButton", "Back", buttonDivInsert, function(){
				this.controller.navPop();
			});
			startButton.initWith("regularButton", "Start", buttonDivInsert, function(){
				this.controller.navPush(this.controller.gameStates.SelectQuestion);
			});
			
			this.createAndAppendToDom("hr", buttonDivInsert);
			
			dataMgmtButton.initWith("regularButton", "Edit Data Sets", buttonDivInsert, function(){
				this.controller.navPush(this.controller.gameStates.DataMgmt);
			});
		
		var dataDiv = this.createAndAppendToDom("div", ovly.domElement);
		$(dataDiv).addClass("dataDiv");
			
			var dataDivInsert = this.createAndAppendToDom("div", dataDiv);
			$(dataDivInsert).addClass("dataDivInsert");
			
				var dataSetContainer = this.createAndAppendToDom("div", dataDivInsert);
				$(dataSetContainer).addClass("dataSetContainer");
		
		ovly.clearScreen = function(){
			$(dataSetContainer).children().detach();
		};
		ovly.fillScreen = function(){
			for (i=0;i<this.controller.dataSetsList.length;i++) {
				this.controller.dataSets[this.controller.dataSetsList[i]].appendToDom(dataSetContainer);
				this.controller.dataSets[this.controller.dataSetsList[i]].exitEditMode();
				this.controller.dataSets[this.controller.dataSetsList[i]].enterPlayMode();
			}
			
			if ( $(dataSetContainer).children().length == 0) {
				$(dataSetContainer).hide();
			} else {
				$(dataSetContainer).css("display", "");
			}
		};
	};
	
	
	this.updateAutoTeams = function(){
		if (this.options.autoTeams) {
			$(".gameTeam").show();
		} else {
			$(".gameTeam").hide();
		}
	};
	this.addTempTeam = function(teamName, teamColor, teamPoints){
		var team = new GameTeam(this);
		team.initWith(this, teamName, teamColor, teamPoints);
		this.teams[teamName] = team;
		this.teamsToSave.push(teamName);
		return team;
	};
	this.hideAllOverlays = function(){
		for (key in this.gameStates) {
			this.gameOverlays[this.gameStates[key]].hide();
		}
	};
	
	this.createTeamColors = function(){
		var colorsToMake = {
			"Red": {
				"r":0xff,
				"g":0x0,
				"b":0x0
			},
			"Green": {
				"r":0x0,
				"g":0xff,
				"b":0x0
			},
			"Blue": {
				"r":0x0,
				"g":0x0,
				"b":0xff
			},
			"Cyan": {
				"r":0x0,
				"g":0xff,
				"b":0xff
			},
			"Magenta": {
				"r":0xff,
				"g":0x0,
				"b":0xff
			},
			"Yellow": {
				"r":0xff,
				"g":0xff,
				"b":0x0
			}
		};
		
		for (colorName in colorsToMake) {
			this.addTeamColor(colorName, colorsToMake[colorName]["r"], colorsToMake[colorName]["g"], colorsToMake[colorName]["b"])
		}
		return this;
	};
	this.addTeamColor = function(colorName, rValue, gValue, bValue){
		this.teamColors[colorName] = new GameColor(rValue, gValue, bValue, colorName);
	};
	this.updateTeamListInContainer = function(container){
		for (team in this.teams) {
			this.teams[team].appendToDom(container);
		}
		return this;
	};
	this.saveTeams = function(){
		// Rewrite to match data set implementation
		for (i=0;i<this.teamsList.length;i++) {
			var team = this.teamsList[i];
			var prefix = this.objLogId +"Team" +i;
			localStorage[prefix] = this.teams[team].teamName;
			this.teams[team].saveData();
		}
	};
	this.loadTeams = function(){
		// Rewrite to match data set implementation
		var i = 0;
		
		var stopLoop = false;
		while (stopLoop == false) {
			var prefix = this.objLogId +"Team" +i;
			var teamName = localStorage[prefix];
			if ( typeof localStorage[prefix] != "undefined" ) {
				this.teamsList.push(teamName);
				this.teams[teamName] = new GameTeam();
				this.teams[teamName].initWith(this, teamName);
				this.teams[teamName].loadData();
			} else {
				stopLoop = true;
			}
			
			i = i+1;
		}
	};
	this.saveDataSets = function(){
		for (i=0;i<this.dataSetsList.length;i++) {
			var set = this.dataSetsList[i];
			var prefix = this.objLogId +"DataSet" +i;
			localStorage[prefix] = this.dataSets[set].name;
			this.dataSets[set].saveData();
		}
	};
	this.loadDataSets = function(){
		var i = 0;
		
		var stopLoop = false;
		while (stopLoop == false) {
			var prefix = this.objLogId +"DataSet" +i;
			var dataSetName = localStorage[prefix];
			if ( typeof localStorage[prefix] != "undefined" ) {
				this.dataSetsList.push(dataSetName);
				this.dataSets[dataSetName] = new GameDatasetWithController(this);
				this.dataSets[dataSetName].initWith(dataSetName);
				this.dataSets[dataSetName].loadData();
			} else {
				stopLoop = true;
			}
			
			i = i+1;
		}
	};
	
	// These are for cleaning up record keeping when deleting stuff.
	this.redoSavedTeamIndices = function(){
		var basePrefix = this.objLogId +"Team";
		
		// First, clear out the old indexed markers.
		var i = 0;
		var stopLoop = false;
		while (stopLoop == false) {
			var prefix = basePrefix +i;
			var dataSetName = localStorage.getItem(prefix);
			if ( dataSetName != null ) {
				localStorage.removeItem(prefix);
			} else {
				stopLoop = true;
			}
			i = i+1;
		}
		
		// Next, let's make new ones.
		for (j=0;j<this.teamsList.length;j++) {
			localStorage.setItem( basePrefix +j , this.teamsList[j]);
		}
	};
	this.redoSavedDataSetIndices = function(){
		var basePrefix = this.objLogId +"DataSet";
		
		// First, clear out the old indexed markers.
		var i = 0;
		var stopLoop = false;
		while (stopLoop == false) {
			var prefix = basePrefix +i;
			var dataSetName = localStorage.getItem(prefix);
			if ( dataSetName != null ) {
				localStorage.removeItem(prefix);
			} else {
				stopLoop = true;
			}
			
			i = i+1;
		}
		
		// Next, let's make new ones.
		for (j=0;j<this.dataSetsList.length;j++) {
			localStorage.setItem( basePrefix +j , this.dataSetsList[j]);
		}
	};
	
	this.cancelDataSetEdits = function(){
		for (i=0;i<this.dataSetsList.length;i++) {
			this.dataSets[this.dataSetsList[i]].cancelEdits();
		}
		return true;
	};
	this.confirmDataSetEdits = function(){
		for (i=0;i<this.dataSetsList.length;i++) {
			this.dataSets[this.dataSetsList[i]].confirmEdits();
		}
		return true;
	};
	
	// This is used for marking either a new or previously saved data set as up for deletion.
	this.markDataSetToDelete = function(dataSetName){
		var indexTentativeSave = this.dataSetsToSave.indexOf(dataSetName);
		var indexAlreadyDeleted = this.dataSetsToDelete.indexOf(dataSetName);
		
		if (indexTentativeSave >= 0) {
			this.dataSetsToSave.splice(indexTentativeSave, 1);
		}
		
		if (indexAlreadyDeleted < 0) {
			this.dataSetsToDelete.push(dataSetName);
		}
		
		return true;
	};
	this.markDataSetToUndelete = function(dataSetName){
		var indexTentativeSave = this.dataSetsToSave.indexOf(dataSetName);
		var indexAlreadySaved = this.dataSetsList.indexOf(dataSetName);
		var indexAlreadyDeleted = this.dataSetsToDelete.indexOf(dataSetName);
		
		if (indexAlreadyDeleted >= 0) {
			this.dataSetsToDelete.splice(indexAlreadyDeleted, 1);
			
			if (indexAlreadySaved < 0) {
				if (indexTentativeSave < 0 && indexAlreadySaved < 0) {
					this.dataSetsToSave.push(dataSetName);
				}
			} else {
				this.dataSets[ this.dataSetsList[indexAlreadySaved] ].prepareToUndelete();
			}
		}
		
		return true;
	};
	this.deleteMarkedDataSets = function(){
		for (i=0;i<this.dataSetsToDelete.length;i++) {
			
			this.dataSets[this.dataSetsToDelete[i]].remove();
			
			var mainIndex = this.dataSetsList.indexOf(this.dataSetsToDelete[i]);
			
			if (mainIndex >= 0) {
				this.dataSets[this.dataSetsList[mainIndex]].deleteData();
				this.dataSetsList.splice(mainIndex, 1);
			}
			
			delete this.dataSets[this.dataSetsToDelete[i]];
		}
		
		// same bug fix as deleteMarkedTeams
		this.dataSetsToDelete = [];
		
		// Record keeping.
		this.redoSavedDataSetIndices();
		
		return true;
	};
	
	// This is for marking a new data set as ready to save.
	// This doesn't need an undo, because it is for new data sets,
	// and new sets are either going to be marked for saving or deletion.
	this.markDataSetToSave = function(dataSetName){
		var indexTentativeSave = this.dataSetsToSave.indexOf(dataSetName);
		var indexAlreadyDeleted = this.dataSetsToDelete.indexOf(dataSetName);
		
		if (indexAlreadyDeleted >= 0) {
			this.dataSetsToDelete.splice(indexAlreadyDeleted, 1);
		}
		
		if (indexTentativeSave < 0) {
			this.dataSetsToSave.push(dataSetName);
		}
		
		return true;
	};
	this.saveMarkedDataSets = function(){
		
		// Simply putting them in the main array will make sure the controller doesn't delete them, essentially saving them, even if only in local memory.
		for (i=0;i<this.dataSetsToSave.length;i++) {
			this.dataSetsList.push(this.dataSetsToSave[i]);
		}
		
		// Don't need this array's contents anymore.
		this.dataSetsToSave = [];
		
		// Again, this method is only for marking new data sets as "saved".
		// This isn't the place for confirming data set edits. That is to be done outside of this method.
		
		return true;
	};
	
	this.isNewDataSetNameValid = function(newName, _ignoreDataSet){
		if (newName == "" || newName == null || typeof newName == "undefined") {
			return false;
		} else {
			var indexNew = this.dataSetsToSave.indexOf(newName);
			var indexCurrent = this.dataSetsList.indexOf(newName);
			var indexDelete = this.dataSetsToDelete.indexOf(newName);
			if (indexNew >= 0 || indexCurrent >= 0 || indexDelete >= 0) {
				return false;
			}
			
			for (set in this.dataSets) {
				if ( this.dataSets[set] != _ignoreDataSet && this.dataSets[set].name == newName) {
					return false;
				}
			}
		}
		
		// If we make it this far, the name should be good.
		return true;
	};
	this.changeDataSetName = function(oldName, newName){
		var indexNew = this.dataSetsList.indexOf(newName);
		var indexOld = this.dataSetsList.indexOf(oldName);
		
		if (indexNew >= 0) {
			// Do nothing.
			return false;
		} else {
			
			// Something tells me that this is dangerous–assuming that the old index is valid.
			// But, it should never ever be invalid, so I'm going to leave it for now.
			this.dataSetsList.splice(indexOld, 1, newName);
			
			this.dataSets[newName] = this.dataSets[oldName];
			delete this.dataSets[oldName];
			
			return true;
		}
	};
	
	// Also doing the same for teams
	this.cancelTeamEdits = function(){
		for (i=0;i<this.teamsList.length;i++) {
			this.teams[this.teamsList[i]].cancelEdits();
		}
		return true;
	};
	this.confirmTeamEdits = function(){
		for (i=0;i<this.teamsList.length;i++) {
			this.teams[this.teamsList[i]].confirmEdits();
		}
		return true;
	};
	
	this.markTeamToDelete = function(teamName){
		var indexTentativeSave = this.teamsToSave.indexOf(teamName);
		var indexAlreadyDeleted = this.teamsToDelete.indexOf(teamName);
				
		if (indexTentativeSave >= 0) {
			this.teamsToSave.splice(indexTentativeSave, 1);
		}
		
		if (indexAlreadyDeleted < 0) {
			this.teamsToDelete.push(teamName);
		}
		
		return true;
	};
	this.markTeamToUndelete = function(teamName){
		var indexTentativeSave = this.teamsToSave.indexOf(teamName);
		var indexAlreadySaved = this.teamsList.indexOf(teamName);
		var indexAlreadyDeleted = this.teamsToDelete.indexOf(teamName);
		
		if (indexAlreadyDeleted >= 0) {
			this.teamsToDelete.splice(indexAlreadyDeleted, 1);
			
			if (indexAlreadySaved < 0 ) {
				if (indexTentativeSave < 0) {
					this.teamsToSave.push(teamName);
				}
			}
		}
		
		return true;
	};	
	this.deleteMarkedTeams = function(){
		// There's a problem with using teamsToDelete in the for loop.
		// splicing the array causes changes in the value at the current index.
		// How about we leave the array alone until after the for loop,
		// where we can simply just empty the array.
		
		for (i=0;i<this.teamsToDelete.length;i++) {
			this.teams[this.teamsToDelete[i]].remove();
			
			var mainIndex = this.teamsList.indexOf(this.teamsToDelete[i]);
			
			if (mainIndex >= 0) {
				this.teams[this.teamsList[mainIndex]].deleteData();
				this.teamsList.splice(mainIndex, 1);
			}
			
			delete this.teams[this.teamsToDelete[i]];
			
// 			this.teamsToDelete.splice(i, 1);
		}
		
		// bug fix
		this.teamsToDelete = [];
		
		// Record keeping.
		this.redoSavedTeamIndices();
		
		return true;
	};
	
	this.markTeamToSave = function(teamName){
		var indexTentativeSave = this.teamsToSave.indexOf(teamName);
		var indexAlreadyDeleted = this.teamsToDelete.indexOf(teamName);
		
		if (indexAlreadyDeleted >= 0) {
			this.teamsToDelete.splice(indexAlreadyDeleted, 1);
		}
		
		if (indexTentativeSave < 0) {
			this.teamsToSave.push(teamName);
		}
		
		return true;
	};
	this.saveMarkedTeams = function(){
		
		// Simply putting them in the array will tell the controller that they have already been saved.
		for (i=0;i<this.teamsToSave.length;i++) {
			this.teamsList.push(this.teamsToSave[i]);
		}
		
		// Don't need this array's contents anymore.
		this.teamsToSave = [];
		
		// Again, this method is only for marking new teams as "saved".
		// This isn't the place for confirming data set edits. That is to be done outside of this method.
		
		return true;
	};
	
	this.isNewTeamNameValid = function(newName, _ignoreTeamName){
		if (_ignoreTeamName == null || typeof _ignoreTeamName == "undefined") {
			
		}
		
		if (newName == "" || newName == null || typeof newName == "undefined") {
			return false;
		} else {
			var indexNew = this.teamsToSave.indexOf(newName);
			var indexCurrent = this.teamsList.indexOf(newName);
			var indexDelete = this.teamsToDelete.indexOf(newName);
			if (indexNew >= 0 || indexCurrent >= 0 || indexDelete >= 0) {
				return false;
			}
			
			for (team in this.teams) {
				if (this.teams[team].teamName == newName && team != _ignoreTeamName) {
					return false;
				}
			}
		}
		
		// If we make it this far, the name should be good.
		return true;
	};
	this.changeTeamName = function(oldName, newName){
		var indexNew = this.teamsList.indexOf(newName);
		var indexOld = this.teamsList.indexOf(oldName);
		
		if (indexNew >= 0) {
			// Do nothing.
			return false;
		} else {
			
			// Something tells me that this is dangerous–assuming that the old index is valid.
			// But, it should never ever be invalid, so I'm going to leave it for now.
			this.teamsList.splice(indexOld, 1, newName);
			
			this.teams[newName] = this.teams[oldName];
			delete this.teams[oldName];
			
			return true;
		}
	};

	this.setCurrentDataSet = function(_dataSetName){
		if (_dataSetName == null || _dataSetName == "" || typeof _dataSetName == "undefined") {
			if (typeof this.currentDataSet != "undefined" && typeof this.currentDataSet.unmarkAsCurrent != "undefined") this.currentDataSet.unmarkAsCurrent();
			
			this.currentDataSet = new GameDatasetWithController(this);
			this.currentDataSet.initDefault();
			this.currentDataSet.markAsCurrent();
			this.createSelectQuestionScreen();
			return true;
		}
		
		if ( typeof this.dataSets[_dataSetName] == "undefined" ) {
			return false;
		} else {
			// preventative bug fix
			if (typeof this.currentDataSet != "undefined" && typeof this.currentDataSet.unmarkAsCurrent != "undefined") this.currentDataSet.unmarkAsCurrent();
			
			this.currentDataSet = this.dataSets[_dataSetName];
			this.currentDataSet.markAsCurrent();
			this.createSelectQuestionScreen();
			return true;
		}
	};
	
	//// Importing and Exporting methods
	this.createExportString = function(){
		var exportObject = {
			"dataSetsList": [],
			"dataSets": {},
			"teamsList": [],
			"teams": {}
		};
		
		for (i=0;i<this.dataSetsList.length;i++) {
			var dataSetName = this.dataSetsList[i];
			
			exportObject["dataSetsList"].push(dataSetName);
			exportObject["dataSets"][ dataSetName ] = {
				"cats": this.dataSets[dataSetName].cats,
				"points": this.dataSets[dataSetName].points,
				"questions": this.dataSets[dataSetName].questions
			};
		}
		
		for (teamName in this.teams) {
			exportObject["teamsList"].push(teamName);
			
			exportObject["teams"][teamName] = {
				"teamPoints": this.teams[teamName].teamPoints,
				"teamColor": {
					"colorName": this.teams[teamName].teamColor.colorName,
					"colorValue": this.teams[teamName].teamColor.rgb
				}
			};
		}
		
		// If they're empty, just get rid of them from the object.
		// This is handy for handling empty sets of data, so we don't export empty objects.
		if (exportObject["dataSetsList"].length == 0) {
			delete exportObject["dataSetsList"];
			delete exportObject["dataSets"];
		}
		if (exportObject["teamsList"].length == 0) {
			delete exportObject["teamsList"];
			delete exportObject["teams"];
		}
		
		var exportString = JSON.stringify(exportObject);
		
		return exportString;
	};
	this.importStringAsData = function(dataString){
// 		eval("var importObject = " +dataString);
		
		try {
			var importObject = JSON.parse(dataString);
		} catch(error) {
			alert(error);
		}
		
		// I could probably break this out into more detailed error cases.
// 		if (typeof importObject == "undefined" || typeof importObject["dataSetsList"] == "undefined" || typeof importObject["dataSets"] == "undefined" || typeof importObject["teamsList"] == "undefined" || typeof importObject["teams"] == "undefined") {
		if (typeof importObject == "undefined") {
			this.log("Data import failed");
			return false;
		}
		
		// If there are no Teams or Data Sets to import, then those items will not be included in the imported Object.
		// So, first test to see if they exist in the Object.
			// Then, ask the user if they want to import them.
			// If so, then go through and import them, marking any that had a naming conflict.
		
		// Record keeping numbers
		var numberOfDataSets = 0;
		var numberOfTeams = 0;
		
		var notImportedDataSets = [];
		if (typeof importObject["dataSetsList"] != "undefined") {
			var askUser;
			
			// Singular v. Plural
			if (importObject["dataSetsList"].length == 1) {
				askUser = "Do you want to import " +importObject["dataSetsList"].length +" Data Set?";
			} else {
				askUser = "Do you want to import " +importObject["dataSetsList"].length +" Data Sets?";
			}
			
			var yesImport = confirm(askUser);
			
			if (yesImport) {
				for (i=0;i<importObject["dataSetsList"].length;i++) {
					var dataSetName = importObject["dataSetsList"][i];
					
					if (this.dataSetsList.indexOf(dataSetName) >= 0) {
						notImportedDataSets.push(dataSetName);
					} else {
						this.dataSetsList.push(dataSetName);
						
						var importedCats = importObject["dataSets"][dataSetName].cats;
						var importedPoints = importObject["dataSets"][dataSetName].points;
						var importedQuestions = importObject["dataSets"][dataSetName].questions;
						
						this.dataSets[dataSetName] = new GameDatasetWithController(this);
						this.dataSets[dataSetName].initWith(dataSetName, importedCats, importedPoints, importedQuestions);
						
						numberOfDataSets++;
					}
				}
			} else {
				notImportedDataSets = importObject["dataSetsList"];
			}
		}
		
		var notImportedTeams = [];
		if (typeof importObject["teamsList"] != "undefined") {
			var askUser;
			
			// Singular v. Plural
			if (importObject["teamsList"].length == 1) {
				askUser = "Do you want to import " +importObject["teamsList"].length +" Team?";
			} else {
				askUser = "Do you want to import " +importObject["teamsList"].length +" Teams?";
			}
			
			yesImport = confirm(askUser);
			if (yesImport) {
				for (i=0;i<importObject["teamsList"].length;i++) {
					var teamName = importObject["teamsList"][i];
					
					if (this.teamsList.indexOf(teamName) >= 0) {
						notImportedTeams.push(teamName);
					} else {
						this.teamsList.push(teamName);
						
						var importedColorName = importObject["teams"][teamName].teamColor.colorName;
						var importedColorR = importObject["teams"][teamName].teamColor.colorValue.r;
						var importedColorG = importObject["teams"][teamName].teamColor.colorValue.g;
						var importedColorB = importObject["teams"][teamName].teamColor.colorValue.b;
						
						var importedColor = new GameColor(importedColorR, importedColorG, importedColorB, importedColorName);
						
						var importedPoints = importObject["teams"][teamName].teamPoints;
						
						this.teams[teamName] = new GameTeam();
						this.teams[teamName].initWith(this, teamName, importedColor, importedPoints);
						
						numberOfTeams++;
					}
				}
			} else {
				notImportedTeams = importObject["teamsList"];
			}
		}
		
		// Now, some sort of feedback to the user about what wasn't imported.
		// Maybe in the form of an alert?
		var statusInfo;
		
		// Singular v. Plural
		if (numberOfDataSets == 1) {
			statusInfo = numberOfDataSets +" Data Set was imported.\n";
		} else {
			statusInfo = numberOfDataSets +" Data Sets were imported.\n";
		}
		
		if (numberOfTeams == 1) {
			statusInfo = statusInfo +numberOfTeams +" Team was imported.\n\n";
		} else {
			statusInfo = statusInfo +numberOfTeams +" Teams were imported.\n\n";
		}
		
		if (notImportedDataSets.length == 1) {
			statusInfo = statusInfo + notImportedDataSets.length +" Data Set was not imported.\n";
		} else {
			statusInfo = statusInfo + notImportedDataSets.length +" Data Sets were not imported.\n";
		}
		
		if (notImportedTeams.length == 1) {
			statusInfo = statusInfo +notImportedTeams.length +" Team was not imported.";
		} else {
			statusInfo = statusInfo +notImportedTeams.length +" Teams were not imported.";
		}
		
		alert(statusInfo);
		
		return true;
	};
	
	this.clearData = function(){
		for (team in this.teams) {
			this.markTeamToDelete(team);
		}
		this.deleteMarkedTeams();
		
		for (set in this.dataSets) {
			this.markDataSetToDelete(set);
		}
		this.deleteMarkedDataSets();
	};
	
	// Navigation functions
	this.navPush = function(gameState){
		navTrail.push(gameState);
		this.changeGameState(gameState);
	};
	this.navPop = function(){
		navTrail.pop();
		this.changeGameState( navTrail[ navTrail.length - 1 ] );
	};
	this.navSwitch = function(gameState){
		navTrail.pop();
		navTrail.push(gameState);
		this.changeGameState(gameState);
	};
	
	this.init = function(withName){
		this.objLogId = withName;
		this.createTeamColors();
		
		this.setCurrentDataSet();
		
		this.createStartScreen();
		this.createInfoScreen();
		this.createSetupScreen();
		this.createImportDataScreen();
		this.createExportDataScreen();
		this.createSelectQuestionScreen();
		this.createAnswerQuestionScreen();
		this.createMakeBoardScreen();
		this.createChooseDataScreen();
		this.createDataMgmtScreen();
		
		this.hideAllOverlays();
		
		this.navPush(this.gameStates.StartScreen);
		
		this.loadTeams();
		this.loadDataSets();
		return this;
	};
}

function GameOverlayWithController(controller){
	// Properties
	this.controller = controller;
	this.cssClass = "gameOverlay";
	this.ckeditorIds = {};
	// Methods
	this.init = function(withName) {
		this.objLogId = withName;
		this.domElement = document.createElement("div");
		this.addClassToDomElement(this.cssClass).attr("id", this.objLogId);
		return this;
	};
	this.initCkeditors = function(){
		var tempOvly = this;
		var editorElement;
		
		//CKEDITOR.disableAutoInline = true;
		$(this.domElement).find(".ckeditor").each(function(){
			
			//CKEDITOR.inline(this.id);
			editorElement = CKEDITOR.replace(this.id/*
, {
				width: 'auto',
				height: 'auto',
				resize_enabled: false,
				startupOutlineBlocks: false,
				startupShowBorders: false,
				toolbar: [
					{name: 'clipboard', items: ['clipboard', 'undo']},
					{name: 'insert'},
					{name: 'basicstyles', items: []}
				],
				removeButtons: "Subscript,Superscript,Maximize",
				removePlugins: 'blockquote,elementspath,filebrowser,horizontalrule,image,link,pastefromword,popup,scayt,showborders,sourcearea,stylescombo,table,tabletools,wsc'
			}
*/);
			// unremoved Plugins: format, listblock, richcombo, about
			tempOvly.ckeditorIds[this.id] = editorElement;
		});
		return editorElement;
	};
}

function GameBoardWithController(controller, catRowCssClass, qRowCssClassPrefix, qCellIdPrefix){
	// Properties
	this.controller = controller;
	this.catRowCssClass = catRowCssClass || "GameBoardDefaultCatRowClass";
	this.qRowCssClassPrefix = qRowCssClassPrefix || "GameBoardDefaultQRowClass";
	this.qCellIdPrefix = qCellIdPrefix || "";
	this.buttons = {};
	
	this.editModeQuestionText = "";
	this.editModeQuestionRow = "";
	
	this.tableMain;
	this.tableHead;
	this.tableFoot;
	this.tableBody;
	
	this.lastClickedCellCssClass = "previousQ";
	this.selectedColumnCssClass = "selectedCol";
	// Methods
	this.addRow = function(toParent, withClass, withId, optPrependBool) {
		var row = document.createElement("tr");
		var prepend = optPrependBool || false;
		var parentElement = toParent || this.tableBody;
		
		if (typeof withClass !== "undefined" && withClass !== null) {
			$(row).addClass(withClass);
		}
		
		if (typeof withId !== "undefined" && withId !== null) {
			$(row).attr("id", withId);
		}
		
		if (prepend) {
			$(parentElement).prepend(row);
		} else {
			$(parentElement).append(row);
		}
		
		var editModeDiv = this.addEditModeContainer(row);
		
		var editRowButtonsDiv = this.createAndAppendToDom("div", editModeDiv);
		$(editRowButtonsDiv).addClass("editRowButtons");
		
		var grabHandle = this.createAndAppendToDom("div", editRowButtonsDiv);
		$(grabHandle).addClass("grabHandle");
		$(grabHandle).html("<span>&#8597</span>");
		
		// Click and drag capability
		$(grabHandle).attr("draggable", "true");
		$(grabHandle).on("dragstart", $.proxy(function(event){
			$(this.tableBody).find("tr").on("dragover", $.proxy(function(event){
				event.preventDefault();
			}, this));
			$(this.tableBody).find("tr").on("drop", $.proxy(function(event){
				// get indices
				var movingIndex = event.originalEvent.dataTransfer.getData("text/plain");
				var moveToIndex = $(this.tableBody).find("tr").index( $(event.target).closest("tr").get(0) );
				
				// move around rows
				if (movingIndex < moveToIndex) {
					$(this.tableBody).find("tr").eq(moveToIndex).after( $(this.tableBody).find("tr").eq(movingIndex) );
				} else {
					$(this.tableBody).find("tr").eq(moveToIndex).before( $(this.tableBody).find("tr").eq(movingIndex) );
				}
				
				// Data management update:
				this.controller.currentDataSet.moveRow(movingIndex, moveToIndex);
				
				event.preventDefault();
			}, this));
			
			// Set index
			var index = $(this.tableBody).find("tr").index( $(event.originalEvent.target).closest("tr").get(0) );
			event.originalEvent.dataTransfer.setData("text/plain", index);
			// set drag image
			event.originalEvent.dataTransfer.setDragImage($(event.originalEvent.target).closest("tr").get(0), ( $(event.originalEvent.target).width() / 2 ), ( $(event.originalEvent.target).height() / 2 ));
		}, this));
		
		var findRowValueRegex = new RegExp("^.*" +this.qRowCssClassPrefix +"(\\d+).*$", "g");
		var foundRowValue = withClass.replace(findRowValueRegex, "$1")
		// 'pointValue' now defined
		var wrapValueDiv = this.createAndAppendToDom("div", editRowButtonsDiv);
		$(wrapValueDiv).addClass("wrapValue");
		var displayRowValue = this.createAndAppendToDom("span", wrapValueDiv);
		$(displayRowValue).addClass("displayRowValue");
		$(displayRowValue).html(foundRowValue);
				
		var editRowValue = this.createAndAppendToDom("input", wrapValueDiv);
		$(editRowValue).addClass("editRowValue");
		if (browserIsCompleteShit) {
			editRowValue.type = "text";
		} else {
			editRowValue.type = "number";
		}
		editRowValue.placeholder = "Points:";
		$(editRowValue).hide();
		
		var editRowButton = new GameButtonWithController(this.controller);
		editRowButton.initWith("regularButton editButton", "Edit", editRowButtonsDiv, function(){
			var tempValue = $(this.domElement).closest("tr").find(".displayRowValue").html();
			$(this.domElement).closest("tr").find(".editRowValue").get(0).value = tempValue;
			
			// Let's just go ahead and remove the class.
			$(this.domElement).closest("tr").removeClass(this.controller.gameBoard.qRowCssClassPrefix +tempValue);
			
			$(this.domElement).closest("tr").find(".displayRowValue").hide();
			$(this.domElement).closest("tr").find(".editRowValue").show();
			
			this.hide();
			$(this.domElement).parent().children(".doneButton").show();
			$(this.domElement).parent().children(".deleteButton").show();
			
			editRowValue.focus();
			
			$(window).trigger("resize");
			return true;
		});
		
		var doneRowButton = new GameButtonWithController(this.controller);
		doneRowButton.initWith("regularButton doneButton", "Done", editRowButtonsDiv, function(){
			var tempValue = $(this.domElement).closest("tr").find(".editRowValue").get(0).value;
			
			var currentIndex = $(this.controller.gameBoard.tableBody).find("tr").index( $(this.domElement).closest("tr") );
			// Data management update:
			var success = this.controller.currentDataSet.editRowValue(currentIndex, null, tempValue);
			if (! success) {
				tempValue = this.controller.currentDataSet.points[currentIndex];
			}
			
			// Now, we need to add the class to the row.
			$(this.domElement).closest("tr").addClass(this.controller.gameBoard.qRowCssClassPrefix +tempValue);
			
			$(this.domElement).closest("tr").find(".displayRowValue").html(tempValue.toString());
			
			$(this.domElement).closest("tr").find(".editRowValue").hide();
			$(this.domElement).closest("tr").find(".displayRowValue").show();
			
			this.hide();
			$(this.domElement).parent().children(".editButton").show();
			$(this.domElement).parent().children(".deleteButton").hide();
			
			$(window).trigger("resize");
			return true;
		});
		doneRowButton.hide();

		
		var deleteRowButton = new GameButtonWithController(this.controller);
		deleteRowButton.initWith("regularButton deleteButton", "Delete", editRowButtonsDiv, function(){
			if (this.controller.currentDataSet.points.length <= 1) {
				return false;
			}
			
			this.log("Deleting Row '." + withClass+"'.");
			$(this.domElement).closest("tr").remove();
			
			var searchForValue = new RegExp("^.*" +this.controller.gameBoard.qRowCssClassPrefix +"(\\d+).*$", "g");
			var rowValue = withClass.replace(searchForValue, "$1");
			rowValue = parseInt(rowValue);
			
			// Data management update:
			this.controller.currentDataSet.delRow(null, rowValue);
			
			$(window).trigger("resize");
		});
		deleteRowButton.hide();
		
		var editQuestionDiv = this.createAndAppendToDom("div", editModeDiv);
		$(editQuestionDiv).addClass("editQuestionDiv");
		var editQuestionDisplay = new GameButtonWithController(this.controller);
		editQuestionDisplay.initWith("editQuestionDisplay", "", editQuestionDiv, function(){
			var ovly = this.controller.gameOverlays[this.controller.gameStates.AnswerQuestion];
			var thisOvly = this.controller.gameOverlays[this.controller.gameStates.MakeBoard];
			
			// take the question text and save it to the controller or game board or overlay.
			this.controller.gameBoard.editModeQuestionText = $(this.domElement).find("span").html();
			var currentCol = $(this.controller.gameBoard.domElement).find("." +this.controller.gameBoard.selectedColumnCssClass +" .catDivInsert").html();
			
			// Data management update:
			for (value in this.controller.currentDataSet.questions[currentCol]) {
				var testForClass = this.controller.gameBoard.qRowCssClassPrefix +value;
				if ( $(this.domElement).closest("tr").hasClass(testForClass) ) {
					this.controller.gameBoard.editModeQuestionRow = testForClass;
				}
			}
			
				// Though, the game board seems like the most logical place for it.
			// display the (edit mode) Answer Question overlay
				// either change game mode (and set an 'edit' flag in the game board or the controller.
				// or shrink it down and put it in the Make Board container.
					// Though, honestly I think the best thing to do will be to switch to the game state so the user can preview the full display of the question,
					// as it would be in the actual run-through of the game.
			$(ovly.domElement).find(".previewQuestionSpan").html(this.controller.gameBoard.editModeQuestionText);
			ovly.enterEditMode().show();
			thisOvly.hide();
			
			$(window).trigger("resize");
		});
		
		$(function() {
		    $(editRowValue).on('keydown', function(event) {
		        if(event.which == 13) {
		            doneRowButton.click();
		            return false;
		        }
		    });
		});
		
		return row;
	};
	this.fillWithCategoriesFromController = function() {
		// Get the categories from the controller.
		// Data management update:
		var cats = this.controller.currentDataSet.cats;
		
		// This I will have to check for, since the table rows aren't a part of the concrete table structure.
		// If there isn't a category row, make it. If so, use it.
		if ( $(this.tableHead).find("tr."+this.catRowCssClass).length == 0 ) {
			var catRow = this.addRow(this.tableHead, this.catRowCssClass, null, true);
		} else {
			var catRow = $(tableHead).find("tr."+this.catRowCssClass).get(0);
		}
		
		// Delete anything that might already exist in the row.
		$(catRow).html("");
		
		// Insert a cell for every category.
		// Insert the respective contents from the category array.
		for (i=0;i<cats.length;i++) {
			this.addCellToCategoryRow(cats[i]);
		}
		return this;
	};
	this.fillWithQuestionRows = function() {
		// Data management update:
		var pointValues = this.controller.currentDataSet.points;
		
		var tempClassString;
		
		for (i=0;i<pointValues.length;i++) {
			tempClassString = this.qRowCssClassPrefix + pointValues[i];
			this.log("Adding question row with class '" +tempClassString+ "'.");
			$(this.addRow(this.tableBody, tempClassString)).addClass("jeopQuestionRow");
		}
	};
	this.fillQuestionRowsWithCells = function() {
		// Data management update:
		var pointValues = this.controller.currentDataSet.points;
		
		var tempRow;
		
		// I feel like most of the contents in the for-loops here should be separated into its own method.
		// This would really enhance the readability of this function.
		// Also, it would make all this functionality accessible separately if I need to do some fine tuning later on, like during the edit phase.
		
		// For each configured row (point value),
			// Get the row.
			// Empty it.
			// Add a playMode container
			
			// For every column (category),
				// Make a cell.
				// Make the cell's ID
				// Add the ID to the new cell.
				
				// Add a predefined button to the cell.
			//
		//
		for (i=0;i<pointValues.length;i++) {
			tempRow = $(this.tableBody).find("tr." +this.qRowCssClassPrefix +pointValues[i])[0];
			$(tempRow).children().not(".editMode").remove();
			
			this.fillQuestionRowWithCells( $(tempRow) );
		}
		return this;
	};
	this.fillQuestionRowWithCells = function($rowObject, orRowIndex){
		var index = parseInt(orRowIndex);
		var rowObject = $($rowObject).get(0);
		
		var rowIsValid = ( typeof rowObject != undefined && /tr/i.test(rowObject.tagName)  );
		
		// If the row is provided,
			// Use it and get the index (don't just trust the index provided, if it even exists).
		// Else if there is an index,
			// Use it and get the row
		// Else,
			// Error, there's nothing we can do without more info
		
		if (rowIsValid) {
			// get the index
			index = $(this.tableBody).find("tr").index(rowObject);
			index = parseInt(index);
		}
		// I chose to break this off from the usual else statement.
		// The effect is a double check on the derived index.
			// The downside is there is no feedback for the case of an invalid row.
		if (index.toString() != "NaN") {
			// get the row
			rowObject = $(this.tableBody).find("tr").get(index);
		} else {
			// error
			this.log("Could not fill row. Not enough info provided.");
		}
		
		// By now, we should have both a row object and its corresponding index.
		
		// Data management update:
		var cats = this.controller.currentDataSet.cats;
		
		var tempCell;
		var tempCellId;
		var playModeDiv = this.addPlayModeContainer(rowObject);
		
		for (j=0;j<cats.length;j++){
			this.addCellToQuestionRow(index, j);
		}
		
		return this;
	};
	this.addNewCategory = function(newCategory){
		// Add cell to Category Row
		this.addCellToCategoryRow(newCategory);
		// Add cell to Question Rows
		var tableBodyRows = $(this.tableBody).find("tr");
		for (i=0;i<tableBodyRows.length;i++) {
			this.addCellToQuestionRow(i);
		}
		return this;
	};
	this.addCellToCategoryRow = function(categoryName){
		var catRow = $(this.domElement).find("." +this.catRowCssClass);
		if (catRow.length == 0) {
			catRow = this.createAndAppendToDom("tr", this.tableHead);
		} else {
			catRow = catRow.get(0);
		}
		
		// create cell and insert into category row.
		var tempCell = this.createAndAppendToDom("th", catRow);
		
			var catDiv = this.createAndAppendToDom("div", tempCell);
			$(catDiv).addClass("catDiv");
				var catDivInsert = this.createAndAppendToDom("span", catDiv);
				$(catDivInsert).addClass("catDivInsert");
				$(catDivInsert).html(categoryName);
		
		var editModeDiv = this.createAndAppendToDom("div", tempCell);
		$(editModeDiv).addClass("editMode");
		
		var editColumnNameArea = this.createAndAppendToDom("textarea", editModeDiv);
		$(editColumnNameArea).addClass("editColumnName");
		$(editColumnNameArea).hide();
		
		var editModeColSelectButton = new GameButtonWithController(this.controller);
		editModeColSelectButton.initWith(null, "&#8596", editModeDiv, function(){
			$("." +this.controller.gameBoard.selectedColumnCssClass).removeClass( this.controller.gameBoard.selectedColumnCssClass );
			this.controller.editModeCurrentCol = $(this.domElement).closest("th").get(0);
			$(this.controller.editModeCurrentCol).addClass( this.controller.gameBoard.selectedColumnCssClass );
			
			// This button handler might be the best place to handle changing the displayed editable questions.
				// Something like this:
				// for every row in the column (identify dynamically to account for new or deleted rows):
					// look up the cell contents via column and row.
					// insert into display area.
			var colText = $(this.controller.editModeCurrentCol).find(".catDivInsert").html();
			
			// Data management update:
			var colIndex = this.controller.currentDataSet.cats.indexOf(colText);
			
			var ovly = this.controller.gameOverlays[this.controller.gameStates.SelectQuestion];
			
			// Data management update:
			for (value in this.controller.currentDataSet.questions[colText] ) {
				var tempRow = $(ovly.domElement).find("." +this.controller.gameBoard.qRowCssClassPrefix +value).get(0);
				
				// Data management update:
				var tempQText = this.controller.currentDataSet.questions[colText][value];
				
				$(tempRow).find(".editQuestionDisplay span").html(tempQText);
			}
		});
		
		// Set drag handlers here
		$(editModeColSelectButton.domElement).attr("draggable", "true");
		$(editModeColSelectButton.domElement).on(
			"dragstart",
			$.proxy(
				function(event){
					$(event.originalEvent.target).closest("tr").find("th").on("dragover", $.proxy(function(event){
						event.preventDefault();
					}, this));
					$(event.originalEvent.target).closest("tr").find("th").on("drop", $.proxy(function(event){
						event.preventDefault();
						$(event.target).closest("tr").find("th").unbind("dragover");
						
						var movingIndex = event.originalEvent.dataTransfer.getData("text/plain");
						var moveToIndex = $(event.target).closest("tr").find("th").index( $(event.target).closest("th").get(0) );
						if (movingIndex < moveToIndex) {
							$(event.target).closest("tr").find("th").eq(moveToIndex).after( $(event.target).closest("tr").find("th").eq(movingIndex) );
						} else {
							$(event.target).closest("tr").find("th").eq(moveToIndex).before( $(event.target).closest("tr").find("th").eq(movingIndex) );
						}
						
						// Data management update:
						this.controller.currentDataSet.moveCol(movingIndex, moveToIndex);
						
					}, this));
					
					var index = $( $(event.originalEvent.target).closest("tr").find("th") ).index( $(event.originalEvent.target).closest("th").get(0) );
					event.originalEvent.dataTransfer.setData("text/plain", index);
					event.originalEvent.dataTransfer.setDragImage($(event.target).closest("th").get(0), ( $(event.target).width() / 2 ), ( $(event.target).height() / 2 ));
					
				},
				editModeColSelectButton
			)
		);
		return this;
	};
	this.addCellToQuestionRow = function(rowIndex, optColIndex){
		rowIndex = parseInt(rowIndex);
		var colIndex = parseInt(optColIndex);
		
		if (rowIndex.toString() == "NaN") {
			this.log("Could not determine row", logTypes.error);
			return null;
		}
		
		var tempRow = $(this.tableBody).find("tr").get(rowIndex);
		
		if (colIndex.toString() == "NaN") {
			// Normally, I'd add one to the index to make it the very next column, but the length already has this 1 added to the index.
			// So, I can get away with this,
			// because the length should always equal the next available column index.
			colIndex = $(tempRow).find("td").length;
		}
		
		var playModeDiv = $(tempRow).find(".playMode");
		
		var tempCell = this.createAndAppendToDom("td", playModeDiv);
		var tempCellId = this.qCellIdPrefix +"R" +(rowIndex+1) +"C" +(colIndex+1);
		$(tempCell).attr("id", tempCellId);
		
		this.addButtonToCell(this.controller, "", tempCell);
		return this;
	};
	this.removeCellFromRow = function(rowObject){
		$(rowObject).find("td").last().remove();
		return this;
	};
	this.addButtonToCell = function(withController, buttonClass, parentElement, orQuestionRowIndex, andQuestionColIndex){
		
		// This is a monster of a logic structure. Let's go through is step-by-step.
		
		// if the element is not provided, attempt to get the ID from the indices and the element from the ID.
			// if indices are provided,
				// build the ID
				// attempt get the element via the ID.
				// if that fails,
					// error. There's nothing we can do about. We need more information.
				// else it worked,
					// All's good. Get out of here.
				//
			// else no indices provided,
				// error. nothing I can do. not enough info.
			//

		// else element was provided. Let's get the ID from the element and get indices from that.
			// element to a convenience variable.
			// grab the ID from the element. Note: the jQuery version of this should always return a string, even an empty string if the ID is undefined.
			// if the ID is blank. The user might know this and explicitly provide indices as a fallback. Let's check for those.
				// if indices were provided,
					// We can build the ID. We have the technology.
					// Cool. All's good. We can move on, cuz we've got all we need.
				// else no indices provided,
					// We can't build the ID. We don't have the technology.
					// error. Not cool. We don't have enough info without either an ID or indices to build an ID.
				//
			// else the ID is there. We still don't have indices, so let's get them.
				// if indices were provided, then this is a bit weird, and someone may have screwed up.
					// Warning. Let's just ignore these...
				//
				// get the indices from the ID and store them both in a single variable. (this is how the data is returned)
				// extract the row index
				// extract the col index
				// if the values are good integers,
					// then all's well. Let's get out of this monstrous if nest.
				// else something goes completely screwy and we couldn't parse the indices from the ID,
					// error. We need indices, or our other stuff won't work right.
				//
			//
		//
		
		// Phew! that was rough... I really hope I didn't miss anything in there. I don't want to go through that again, either!
		
		if (typeof parentElement == "undefined" || parentElement == null) {
			if (parseInt(orQuestionRowIndex).toString() != "NaN" && parseInt(andQuestionColIndex).toString() != "NaN") {
				var tempCellId = this.buildCellIdFromIndices(orQuestionRowIndex, andQuestionColIndex);
				var tempCell = $("#" +tempCellId).get(0);
				if (typeof tempCell == "undefined" || tempCell == null) {
					this.log("Could not identify cell. No cell found at R" +orQuestionRowIndex +"C" +andQuestionColIndex +".", logTypes.error);
				} else {
					this.log("Cell found. No parent element provided, but found cell at R" +orQuestionRowIndex +"C" +andQuestionColIndex +" using the provided indices.");
				}
			} else {
				this.log("Not enough info. Cannot identify cell. No parent element or indices provided.", logTypes.error);
				return null;
			}
		} else {
			var tempCell = parentElement;
			var tempCellId = $(parentElement).get(0).id;
			if (tempCellId == "" || typeof tempCellId == "undefined") {
				this.log("Element provided with no ID. Falling back to indices for cell ID.");
				if (parseInt(orQuestionRowIndex).toString() != "NaN" && parseInt(andQuestionColIndex).toString() != "NaN") {
					this.log("Success. ID built from the provided indices.");
					var tempCellId = this.buildCellIdFromIndices(orQuestionRowIndex, andQuestionColIndex);
				} else {
					this.log("Failure. Invalid/non-existent fallback indices provided.", logTypes.error);
					return null;
				}
			} else {
				this.log("Gathering cell indices from cell ID.");
				if (parseInt(orQuestionRowIndex).toString() != "NaN" && parseInt(andQuestionColIndex).toString() != "NaN") {
					this.log("Both an element with a valid ID and explicit indices were provided. Ignoring provided indices.", logTypes.warning);
				}
				var tempIndices = this.getCellIndicesFromId(tempCellId);
				orQuestionRowIndex = tempIndices.row;
				andQuestionColIndex = tempIndices.col;
				if (parseInt(orQuestionRowIndex).toString() != "NaN" && parseInt(andQuestionColIndex).toString() != "NaN") {
					this.log("Success. Indices " +orQuestionRowIndex +"x" +andQuestionColIndex +" parsed from element ID: '" +tempCellId +"'.");
				} else {
					this.log("Failure. Could not parse indices from element ID: '" +tempCellId +"'.", logTypes.error);
					return null;
				}
			}
		}
		
		// After that mess-of-a-logic-string, we should now have tempCell and tempCellId set (assuming we had all the info we needed).
		
		// By now, both tempCell and tempCellId should be available.
		
		// Data management update:
		var cats = withController.currentDataSet.cats;
		var pointValues = withController.currentDataSet.points;
		var pointValue = pointValues[orQuestionRowIndex];
		
		// Make a new button for the cell.
			// The button is stored in the 'buttons' object for future identification and convenience.
		// Store the new button in a convenience variable.
		// Store the actual HTML of the question associated with each button.
			// This is used by the button later on to fill the question text on the Answer Question Overlay.
		// Init the button with:
			// No class name.
				// I don't want this to be "regularButton",
				// and it can be easily selected in CSS as the child of a data cell element.
			// Point value as the text of the button
			// Data cell as its parent node
			// Click handler:
				// Deselect the previous "previousQ" (used for highlighting the last clicked question).
				
				// Do some logging.
				
				// Assign the stored question HTML as the current one in the controller.
				// For record keeping and accuracy, store the question ID in the controller.
				// Also store the question value to be used for other purposes.
				
				// Identify this cell as the last clicked cell, (for highlighting with CSS).
				
				// Now that all the setup has been taken care of, progress game state.
			//
		//
		
		// Most of this was encapsulated from a separate method. Let's generalize it a bit further.
		var prevQClass = this.lastClickedCellCssClass;
		
		this.buttons[tempCellId] = new GameButtonWithController(withController);
		var tempButton = this.buttons[tempCellId];
		tempButton.initWith(buttonClass, pointValue, tempCell, function(){
			$("." +prevQClass).removeClass(prevQClass);
			
			var rowIndex = orQuestionRowIndex;
			var colIndex = andQuestionColIndex;
			
			var getCategoryName = $( $(this.controller.gameBoard.tableHead).find("th .catDivInsert").get(andQuestionColIndex) ).html();
			var getRowValue = $(this.domElement).closest("tr").get(0).className;
			var searchRowValue = new RegExp("^.*" +this.controller.gameBoard.qRowCssClassPrefix +"(\\d+).*$", "g");
			getRowValue = getRowValue.replace(searchRowValue, "$1");
			getRowValue = parseInt(getRowValue);
			
			// Data management update:
			this.questionHtml = this.controller.currentDataSet.questions[getCategoryName][getRowValue];
			
			this.log("Question '" +tempCellId +"' selected.");
			this.log("Changing Game State to 'AnswerQuestion'.");
			this.log("CurrentQuestion: " +this.questionHtml);
			
			this.controller.currentQuestion = this.questionHtml;
			this.controller.currentQuestionId = tempCellId;
			this.controller.currentQuestionValue = pointValue;
			
			$("#"+tempCellId).addClass(prevQClass);
			
			this.controller.navPush(this.controller.gameStates.AnswerQuestion);
		});
		$(tempButton.domElement).wrapInner("<span></span>");
	};
	this.buildCellIdFromIndices = function(rowIndex, columnIndex){
		var idString;
		
		// Indices are zero-indexed, be sure to add one.
		idString = this.qCellIdPrefix +"R" +(rowIndex +1) +"C" +(columnIndex +1);
		
		return idString;
	};
	this.getCellIndicesFromId = function(idString){
		var row, col;
		
		idString = idString.replace(this.qCellIdPrefix, "");
		
		row = idString.replace(/^.*R(\d+).*$/g, "$1");
		col = idString.replace(/^.*C(\d+).*$/g, "$1");
		
		row = parseInt(row);
		col = parseInt(col);
		
		// Indices are zero-indexed. Need to subtract one.
		if (row.toString() == "NaN" || col.toString() == "NaN") {
			row = null;
			col = null;
		} else {
			row = row -1;
			col = col -1;
		}
		
		return {
			"row": row,
			"col": col
		}
	};
	this.makeEditButtons = function(){
		var editButtonsDiv = this.createAndAppendToDom("div", this.domElement, true);
		$(editButtonsDiv).addClass("tableEditButtons");
		
		var backButton = new GameButtonWithController(this.controller);
		backButton.initWith("regularButton", "Teams", editButtonsDiv, function(){});
	};
	this.makeTable = function(){
		// If there's already a table element (which there definitely should not be, but I'm paranoid), remove it from the DOM.
		if (typeof this.tableMain != "undefined") {
			$(this.tableMain).remove();
		}
		
		// Clear out all variables. Make sure there isn't anything in them and they are ready to use.
		this.tableMain = null;
		this.tableHead = null;
		this.tableFoot = null;
		this.tableBody = null;
		
		// Make the main table element
		this.tableMain = this.createAndAppendToDom("table", this.domElement);
		
		// If there's anything already in there (I'm looking at you, IE), get rid of it.
		$(this.tableMain).html("");
		
		// Create all the necessary elements, in the proper order.
		this.tableHead = this.createAndAppendToDom("thead", this.tableMain);
		this.tableFoot = this.createAndAppendToDom("tfoot", this.tableMain);
		this.tableBody = this.createAndAppendToDom("tbody", this.tableMain);
	};
	this.init = function(withName){
		this.objLogId = withName;
		this.domElement = document.createElement("div");
		this.addClassToDomElement(withName);
		
		// This function creates a full table structure from scratch.
		this.makeTable();
		
		// Let's just create everything fresh based off the info stored in the gameBoard and the controller.
		this.fillWithCategoriesFromController();
		this.fillWithQuestionRows();
		this.fillQuestionRowsWithCells();
		
		this.enterPlayMode();
		
		return this;
	};
}

// Again, just to see if I could, I remved the controller as a property of the Game Team. It is, instead, a private variable to the object.
// Therefore, it has been renamed from 'GameTeamWithController' to simply 'GameTeam'.
function GameTeam(){
	// Properties
	this.cssClassWhenDeleted = "";
	
	this.colorOptions = [];
	
	this.teamColor;
	this.teamName;
	this.teamPoints;
	
	this.backupTeamColor = null;
	this.backupTeamName = null;
	this.backupTeamPoints = null;
	
	this.dataPrefix = "";
	this.colorSuffix = "Color";
	this.nameSuffix = "Name";
	this.pointsSuffix = "Points";
	this.delim = "$";
	
	// Convenience
	this.chooseColorDropdown;
	
	// Private Properties
	var controller;
	
	// Methods
	this.init = function(controllerObject) {
		// The only thing I can think of to have this function do is set the private variable of the controller.
		// But I also don't want to go without it, for consistency's sake.
		controller = controllerObject;
		return this;
	};
	this.initWith = function(controller, teamName, teamColor, teamPoints) {
		this.init(controller);
		
		// Parameter checking
		if (controller == null || typeof controller == "undefined" || controller == "") {
			this.log("No controller provided for initialization.", logTypes.error);
			return false;
		}
		
		if (teamName == null || typeof teamName == "undefined" || teamName == "") {
			this.teamName = "Default Name"
		} else {
			this.teamName = teamName;
		}
		
		if (teamColor == null || typeof teamColor == "undefined" || teamColor == "") {
			this.teamColor = controller.teamColors.Red;
		} else {
			this.teamColor = teamColor;
		}
		
		if (parseInt(teamPoints).toString() == "NaN") {
			this.teamPoints = 0;
		} else {
			this.teamPoints = parseInt(teamPoints);
		}
		
		this.objLogId = "GameTeam_" +this.teamName;
		
		// Set the data prefix;
		this.dataPrefix = controller.objLogId +this.delim +"GameTeam" +this.delim +this.teamName;
		
		// Actual initialization
		this.createDomElement(controller);
		this.setColors();
		
		return this;
	};
	
	// This method will replace fillTeam. This will bring this object to standard with the other object.
	this.createDomElement = function(){
		// Define Structure
		
		this.domElement = document.createElement("div");
		$(this.domElement).addClass("gameTeam");
		
		// Edit Mode Controls Area
		var editModeDiv = this.createAndAppendToDom("span", this.domElement, true);
		$(editModeDiv).addClass("editMode");
		
		// Info Display Area
		var teamInfoDiv = this.createAndAppendToDom("span", this.domElement);
		$(teamInfoDiv).addClass("teamInfo");
		
		var teamInfoInsert = this.createAndAppendToDom("div", teamInfoDiv);
		$(teamInfoInsert).addClass("teamInfoInsert");
			
			// Team Name Display
			var teamLabel = this.createAndAppendToDom("span", teamInfoInsert);
			$(teamLabel).addClass("teamLabel");
			$(teamLabel).html(this.teamName);
			
				// Team Name Editing Input
				var editLabelInput  = this.createAndAppendToDom("input", teamInfoInsert);
				editLabelInput.placeholder = "Edit Name";
				editLabelInput.type = "text";
				editLabelInput.value = "";
				
					// Don't forget to hide the editing input.
				$(editLabelInput).hide();
			
			// Team Score Display
			var teamPoints = this.createAndAppendToDom("span", teamInfoInsert);
			$(teamPoints).addClass("teamPoints");
			$(teamPoints).html(this.teamPoints);
			
				// Team Score Editing Input
				var editPointsInput = this.createAndAppendToDom("input", teamInfoInsert);
				editPointsInput.placeholder = "Edit Points";
				if (browserIsCompleteShit) {
					editPointsInput.type = "text";
				} else {
					editPointsInput.type = "number";
				}
				editPointsInput.value = "";
				
					// Same here. Hide it, because we don't yet want it to be seen.
				$(editPointsInput).hide();
				
				// Color Select
				var chooseColorDropdown = this.createAndAppendToDom("select", teamInfoDiv);
				$(chooseColorDropdown).addClass("chooseColor").change( $.proxy(function(){
					this.changeColor(chooseColorDropdown.value);
				}, this) );
					
					// Sync Colors With the controller
					this.syncColorOptionsWithController();
				$(chooseColorDropdown).hide();
			
			// Edit Mode Error Msg Display
				// This is currently in the Info display area because layout-wise, this seems like the best place to put it.
			var errorMsgDiv = this.createAndAppendToDom("div", teamInfoDiv);
			$(errorMsgDiv).addClass("errorMsgDiv");
			$(errorMsgDiv).hide();
				
				// The inner span for displaying the message and resizing the text.
				var errorMsgDivInsert = this.createAndAppendToDom("span", errorMsgDiv);
				$(errorMsgDivInsert).addClass("errorMsgDivInsert");
				
		// Game Play Controls Area (correct and incorrect answer buttons)
		var playModeDiv = this.createAndAppendToDom("span", this.domElement);
		$(playModeDiv).addClass("playMode");
		
		
		// Define input elements
		var editButton = new GameButtonWithController(controller);
		var doneButton = new GameButtonWithController(controller);
		var deleteButton = new GameButtonWithController(controller);
		var undeleteButton = new GameButtonWithController(controller);
		var addPointsButton = new GameButtonWithController(controller);
		var subPointsButton = new GameButtonWithController(controller)
		
		// for referencing this team within the buttons.
		var thisTeam = this;
		
		// Edit Mode buttons
		editButton.initWith("regularButton editButton", "Edit", editModeDiv, function(){
			
			this.log("Editing team '" +thisTeam.teamName +"'.");
			
			var oldLabel = teamLabel;
			var textToEdit = $(oldLabel).html();
			
			var oldPoints = teamPoints;
			var pointsToEdit = $(oldPoints).html();
			
			editLabelInput.value = textToEdit + "";
			
			// Another IE workaround. Effect: Places cursor at the end of the field.
			$(editLabelInput).focus(function(){this.value = this.value;});
			
			editPointsInput.value = pointsToEdit +"";
			
			// Let's hide the old displays and show the inputs
			$(oldLabel).hide();
			$(oldPoints).hide();
			$(editLabelInput).show();
			$(editPointsInput).show();
			$(chooseColorDropdown).show();
			
			editLabelInput.focus();
			
			// Hide the Edit button and show the Done button.
			editButton.hide(); // this = editButton, but whatevs
			doneButton.show();
			deleteButton.show();
			
			// Click the done button when press Enter
			$(thisTeam.domElement).find("input").on('keydown', function(event) {
		        if (event.which == 13) {
		            $(thisTeam.domElement).find(".doneButton")[0].click();
		            return false;
		        }
		    });
		    
		    return true;
		});
		doneButton.initWith("regularButton doneButton", "Done", editModeDiv, function(){
			this.log("Attempting to update '" +thisTeam.teamName +"'.");
			
			var editedText = editLabelInput.value;
			
			if (editedText == "" || typeof editedText == "undefined") {
				editedText = thisTeam.teamName;
			}
			
			var editedPoints = parseInt(editPointsInput.value);
			
			if ( editedPoints.toString() == "NaN" ) {
				editedPoints = thisTeam.teamPoints;
			}
			
			// I should first check to see if the name has even changed.
			if (editedText != thisTeam.teamName) {
				if (! thisTeam.changeName(editedText) ) {
					return false;
				}
			}
			
			// Need to change this method.
			thisTeam.changePoints(editedPoints);
			
			// That can also be replaced.
			thisTeam.updateName();
			thisTeam.updatePoints();
			
			thisTeam.clearError();
			
			// In the new method, let's show the old displays and hide the inputs
			$(editLabelInput).hide();
			$(editPointsInput).hide();
			$(chooseColorDropdown).hide();
			$(teamLabel).show();
			$(teamPoints).show();
			
			doneButton.hide();
			deleteButton.hide();
			editButton.show();
			
			$("#createTeamsFieldName")[0].focus();
			
			this.log("Done editing team '" +thisTeam.teamName +"'.");
			
			return true;
		});
		deleteButton.initWith("regularButton deleteButton", "Delete", editModeDiv, function(){
			this.log("Deleting team '" +thisTeam.teamName +"'.");

			// First, let's discard any current changes.
				// We can just remove the input values and let the doneButton error handling take care of it.
				// Then, we just click the doneButton;
			editLabelInput.value = "";
			editPointsInput.value = "";
			doneButton.click();
			
			this.controller.markTeamToDelete(thisTeam.teamName);
			thisTeam.unsetColors();
			thisTeam.addClassToDomElement("deleted");
			
			editButton.hide();
			undeleteButton.show();
			
			return true;
		});
		undeleteButton.initWith("regularButton undeleteButton", "Undelete", editModeDiv, function(){
			this.log("Undeleting team '" +thisTeam.teamName +"'.");
			
			this.controller.markTeamToUndelete(thisTeam.teamName);
			thisTeam.setColors();
			thisTeam.removeClassFromDomElement("deleted");
			
			undeleteButton.hide();
			editButton.show();
		});
		
		// Play Mode buttons
		addPointsButton.initWith("regularButton addPointsButton", "O", playModeDiv, function(){
			thisTeam.addPoints( controller.currentQuestionValue );
		});
		subPointsButton.initWith("regularButton subPointsButton", "X", playModeDiv, function(){
			thisTeam.subPoints( controller.currentQuestionValue );
		});
		
		// Hide stuff
		doneButton.hide();
		deleteButton.hide();
		undeleteButton.hide();
		
		
		// Set things in order.
		// Defaulting to play mode.
		this.exitEditMode().exitPlayMode();
		
		// Set color
		this.setColors();
		
		return this;
	};
	this.setColors = function(){
		$(this.domElement).css("background-color", this.teamColor.getCssHexString() ).css("color", this.teamColor.getCssHexString(false, true));
		$(this.domElement).find("input, select").css("background-color", this.teamColor.getCssHexString(true, true));
	};
	this.unsetColors = function(){
		$(this.domElement).css("background-color", "" ).css("color", "");
		$(this.domElement).find("input, select").css("background-color", "");
	};
	
	// Color Select-specific methods
	this.syncColorOptionsWithController = function(){
		
		// Because this is a sync, it would naturally be expected that all existing options be deleted.
		this.resetColorOptions();
		
		for (color in controller.teamColors) {
			this.addColorOption(color);
		}
	};
	this.resetColorOptions = function(){
		// Remove options from dropdown
		var selectElement = $(this.domElement).find("select.chooseColor");
		$(selectElement).children().remove();
	};
	
	// Do I need this method? I already synced the options with the controller during dom creation.
	// Even later on, I'm leaning toward no.
	this.initColorOptionsInDropdown = function(){
		for (i=0;i<this.colorOptions.length;i++) {
			this.addColorOption( this.colorOptions[i] );
		}
	};
	this.addColorOption = function(newColor){
		// Check input
		if (typeof newColor != "string") {
			this.log("Cannot add new color. Invalid input.", logTypes.error);
			return;
		}
		
		// Create new option element
		var selectElement = $(this.domElement).find("select.chooseColor");
		var newOption = this.createAndAppendToDom("option", selectElement);
		$(newOption).html(newColor);
	};
	
	this.changeColor = function(newColor){
		// Make a backup
		this.backupColorData();
		
		// Grab and set color from controller
		this.teamColor = controller.teamColors[newColor];
		this.setColors();
	};
	this.changeName = function(newName){
		// Check if the name is available.
		var isAvailable = controller.isNewTeamNameValid(newName, this.backupTeamName);
		if (! isAvailable) {
			this.displayError("'" +newName +"' already taken.");
			return false;
		}
		
		// Make a backup
		this.backupNameData();
		
		// Change name locally
		this.teamName = newName;
		
		// Update dom elements
		// After looking, I'm not sure I need this here...
		// Though it's not hurting anything.
		this.updateName();
		
		return true;
	};
	this.updateName = function(){
		$(this.domElement).find(".teamLabel").text(this.teamName);
	};
	this.addPoints = function(amount){
		this.backupPointsData();
		
		var intAmount = parseInt(amount);
		
		if ( intAmount.toString() !== "NaN" ) {
			this.teamPoints = parseInt(this.teamPoints) + intAmount;
		}
		
		this.updatePoints();
		
		return parseInt(this.teamPoints);
	};
	this.subPoints = function(amount){
		this.backupPointsData();
		
		var intAmount = parseInt(amount);
		
		if ( intAmount.toString() !== "NaN" ) {
			this.teamPoints = parseInt(this.teamPoints) - intAmount;
		}
		
		this.updatePoints();
		
		return parseInt(this.teamPoints);
	};
	this.changePoints = function(newPoints){
		newPoints = parseInt(newPoints);
		
		if (newPoints == "NaN") {
			return false;
		}
		
		this.backupPointsData();
		
		this.teamPoints = newPoints;
		
		return true;
	};
	this.updatePoints = function() {
		$(this.domElement).find(".teamPoints").text(this.teamPoints);
	};
	
	this.backupNameData = function(){
		if ( this.nameChanged() ) {
			return false;
		} else {
			this.backupTeamName = this.teamName + "";
			return true;
		}
	};
	this.backupColorData = function(){
		if ( this.colorChanged() ) {
			return false;
		} else {
			this.backupTeamColor = controller.teamColors[this.teamColor.colorName];
			return true;
		}
	};
	this.backupPointsData = function(){
		if ( this.pointsChanged() ) {
			return false;
		} else {
			this.backupTeamPoints = this.teamPoints +0;
			return true;
		}
	};
	
	this.colorChanged = function(){
		if (this.backupTeamColor == null) {
			return false;
		} else {
			return true;
		}
	};
	this.nameChanged = function(){
		if (this.backupTeamName == null) {
			return false;
		} else {
			return true;
		}
	};
	this.pointsChanged = function(){
		if (this.backupTeamPoints == null) {
			return false;
		} else {
			return true;
		}
	};
	
	this.cancelEdits = function(){
		this.log("Canceling edits.");
		
		if (this.backupTeamName != null) {
			this.teamName = this.backupTeamName +"";
			this.backupTeamName = null;
			
			this.updateName();
		}
		
		if (this.backupTeamPoints != null) {
			this.teamPoints = this.backupTeamPoints +0;
			this.backupTeamPoints = null;
			
			this.updatePoints();
		}
		
		if (this.backupTeamColor != null) {
			this.teamColor = controller.teamColors[this.backupTeamColor.colorName];
			this.backupTeamColor = null;
			
			this.setColors();
		}
	};
	this.confirmEdits = function(){
		this.log("Confirming edits.");
		
		// Register change with controller
		if ( this.nameChanged() ) {
			controller.changeTeamName(this.backupTeamName, this.teamName);
		}
		
		this.backupTeamColor = null;
		this.backupTeamName = null;
		this.backupTeamPoints = null;
	};
	
	this.displayError = function(errorMsg){
		if (errorMsg +"" != "") {
			$(this.domElement).find(".errorMsgDiv").show();
			$(this.domElement).find(".errorMsgDivInsert").html(errorMsg);
		}
		
		return true;
	};
	this.clearError = function(){
		$(this.domElement).find(".errorMsgDiv").hide();
		$(this.domElement).find(".errorMsgDivInsert").html("");
	};
	
	this.saveData = function(){
		// This one basically serves as a marker for when data is retrieved,
		// so I don't try to retrieve data that isn't there.
		localStorage.setItem(this.dataPrefix, "true");
		
		localStorage.setItem( this.dataPrefix +this.delim +this.pointsSuffix ,						this.teamPoints);
		localStorage.setItem( this.dataPrefix +this.delim +this.colorSuffix +this.delim +"Name" ,	this.teamColor.colorName);
		localStorage.setItem( this.dataPrefix +this.delim +this.colorSuffix +this.delim +"R" ,		this.teamColor.rgb.r);
		localStorage.setItem( this.dataPrefix +this.delim +this.colorSuffix +this.delim +"G" ,		this.teamColor.rgb.g);
		localStorage.setItem( this.dataPrefix +this.delim +this.colorSuffix +this.delim +"B" ,		this.teamColor.rgb.b);
		
	};
	this.getSavedData = function(){
		// If data isn't even there, don't bother.
		if ( localStorage.getItem(this.dataPrefix) == null ) {
			return null;
		}
		
		var tempData = {};
		tempData.teamPoints = 0;
		tempData.teamColor = {};
		tempData.teamColor.colorName = "";
		tempData.teamColor.r = "";
		tempData.teamColor.g = "";
		tempData.teamColor.b = "";
		
		// My error checking system is as follows:
			// 1. Store all values in temp variables.
			// 2. Check for undefined values.
				// 2a. Log error
				// 2b. Set default value.
			// 3. Place all values in Object for return.
		
		// 1
		var tempTeamPoints = parseInt( localStorage.getItem(this.dataPrefix +this.delim +this.pointsSuffix) );
		var tempColorName = localStorage.getItem(this.dataPrefix +this.delim +this.colorSuffix +this.delim +"Name");
		var tempTeamColorR = localStorage.getItem(this.dataPrefix +this.delim +this.colorSuffix +this.delim +"R");
		var tempTeamColorG = localStorage.getItem(this.dataPrefix +this.delim +this.colorSuffix +this.delim +"G");
		var tempTeamColorB = localStorage.getItem(this.dataPrefix +this.delim +this.colorSuffix +this.delim +"B");
		
		// 2
		if (tempTeamPoints.toString() == "NaN") {
			this.log("Stored point value not found. Defaulting to 0.", logTypes.error);
			tempTeamPoints = 0;
		}
		if (tempColorName == null || tempTeamColorR == null || tempTeamColorG == null || tempTeamColorB == null) {
			this.log("Stored color not found or incomplete. Defaulting to \"Red\".", logTypes.error);
			tempColorName = "Red";
			tempColorR = 255;
			tempColorG = 0;
			tempColorB = 0;
		}
		
		// 3
		tempData.teamPoints = tempTeamPoints;
		tempData.teamColor.colorName = tempColorName;
		tempData.teamColor.r = tempTeamColorR;
		tempData.teamColor.g = tempTeamColorG;
		tempData.teamColor.b = tempTeamColorB;
			
		return tempData;
	};
	this.loadData = function(){
		var tempData = this.getSavedData();
		
		if ( tempData == null) {
			return false;
		}
		
		this.teamPoints = tempData.teamPoints;
		
		if (typeof controller.teamColors[tempData.teamColor.colorName] == "undefined") {
			controller.addTeamColor(tempData.teamColor.colorName, tempData.teamColor.r, tempData.teamColor.g, tempData.teamColor.b);
		}
		this.teamColor = controller.teamColors[tempData.teamColor.colorName];
		this.setColors();
		
		return true;
	};
	this.deleteData = function(){
		var tempString = this.dataPrefix.replace( new RegExp("\\$", "g"), "\\$").replace(new RegExp("\\^", "g"), "\\^");
		
		// DANGER!!!
		// There is a bug, reported below, which causes any regex with the global "g" flag set to not reset properly.
		// The effect is that it will alternate correct and incorrect tests.
		//
		// I usually use it out of thoroughness and habit,
		// but since I don't need it here, I have removed the "g" flag from my resultant regex.
		//
		// http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
		var tempRegex = new RegExp("^" +tempString +".*$");
		
		for (key in localStorage) {
			if (tempRegex.test(key)) {
				localStorage.removeItem(key);
			}
		}
		
		return true;
	};
	this.prepareToUndelete = function(){
		$(this.domElement).find(".undeleteButton").get(0).click();
	};
}

function GameButtonWithController(controller) {
	// Properties
	this.controller = controller;
	this.handler = function(){};
	this.text = "";
	this.objLogId = "Button";
	this.questionHtml = "";
	// Methods
	this.fillButton = function(){
		this.setHandler(this.handler);
		$(this.domElement).html(this.text).wrapInner("<span></span>");
		return this;
	};
	this.setHandler = function(handler){
		newFunction = handler || this.handler;
		$(this.domElement).unbind().click( $.proxy(newFunction, this) );
	};
	this.init = function() {
		this.domElement = document.createElement("button");
		return this;
	};
	this.initWith = function(cssClass, text, parentElem, handler) {
		this.init();
		this.text = text || this.text;
		this.addClassToDomElement( (cssClass || "") );
		this.handler = handler || this.handler;
		this.fillButton();
		if (typeof parentElem != "undefined") {
			this.appendToDom(parentElem);
		}
		return this;
	};
	this.click = function(){
		this.domElement.click();
	};
}

// I probably don't really need this object. This was more of a 'can I pull it off?' kind of experiment.
function GameCheckboxWithController(controller) {
	// Properties
	this.controller = controller;
	this.handler = function(){};
	this.text = "";
	this.objLogId = "Checkbox";
	// Methods
	this.fillCheckbox = function(toControl){
		this.setupControl(toControl);
		$(this.domElement).change( $.proxy(this.handler, this) );
		this.label = document.createElement("label");
		$(this.label).html(this.text);
		
		return this;
	};
	this.appendToDom = function(toParent){
		$(this.label).prepend(this.domElement);
		$(toParent).append(this.label);
	};
	this.setupControl = function(toControl){
		if (typeof toControl != "boolean") {
			this.log("Input not of type 'boolean'. Unable to control option.", logTypes.error);
		} else {
			this.domElement.checked = toControl;
		}
	};
	this.init = function(){
		this.domElement = document.createElement("input");
		$(this.domElement).attr("type", "checkbox");
		return this;
	};
	this.initWith = function(cssClass, text, parentElem, boolToControl, handler) {
		this.init();
		this.text = text;
		this.addClassToDomElement(cssClass);
		this.handler = handler || this.handler;
		this.fillCheckbox(boolToControl);
		// We will use a special implementation of 'appendToDom'.
		this.appendToDom(parentElem);
		return this;
	};
}

function GameDatasetWithController(controller) {
	this.controller = controller;
	
	this.cssClassWhenDeleted = "deletedDataSet";
	this.defaultQuestionText = "Default Question";
	
	this.name = "";
	this.cats = [];
	this.points = [];
	this.questions = {};
	
	this.backupName = null;
	this.backupCats = null;
	this.backupPoints = null;
	this.backupQuestions = null;
	
	this.dataPrefix = "";
	this.catsSuffix = "Cats";
	this.totalSuffix = "Total";
	this.pointsSuffix = "Points";
	this.qDictSuffix = "Data";
	this.delim = "$";
	
	// Private methods
	this.parseQuestions = function(qObject) {
		// This type of check should catch undefined objects, null, and other types, like numbers or strings.
		// I'm also using 'length' to differentiate between arrays and dictionaries, since dictionaries don't have a length property.
		if ( ! (typeof qObject == "object" && qObject != null && typeof qObject.length == "undefined") ) {
			return;
		}
		
		// Let's assume out parameter is actually a valid questions dictionary.
		
		// Here's what we can do to simplify this.
		// Let's create a new object and populate it using the info in qObject.
		// That should be much easier than trying to modify qObject directly and correcting errors.
		var tempObject = {};
		for (i=0;i<this.cats.length;i++) {
			tempObject[ this.cats[i] ] = {};
			for (j=0;j<this.points.length;j++) {
				if (typeof qObject[this.cats[i]] == "undefined" || typeof qObject[this.cats[i]][this.points[j]] == "undefined") {
					tempObject[ this.cats[i] ][ this.points[j] ] = this.defaultQuestionText;
				} else {
					tempObject[ this.cats[i] ][ this.points[j] ] = qObject[ this.cats[i] ][ this.points[j] ];
				}
			}
		}
		
		return tempObject;
	}
	
	this.init = function(datasetName){
		
		this.name = datasetName || "";
		
		this.objLogId = "DataSet_" +this.name;
		
		// Set the data prefix;
		this.dataPrefix = this.controller.objLogId +this.delim +"Dataset" +this.delim +this.name;
		// Set the DOM element.
		this.createDomElement();
	};
	this.initDefault = function(){
		this.initWith("Default");
	};
	this.initWith = function(datasetName, catArray, pointArray, qDict){
		var defaults = this.parseDefault();
		
		this.cats = catArray || defaults.cats;
		this.points = pointArray || defaults.points;
		this.questions = this.parseQuestions(qDict) || defaults.questions;
		
		this.init(datasetName);
		
		this.updateDisplayInfo();
	};
	
	this.parseDefault = function(){
		var defaults = {
			"cats": [],
			"points": [],
			"questions": {}
		}
		
		defaults["points"] = $.extend([], pointsToImport);
		
		for (key in categoriesToImport) {
			defaults["cats"].push(key);
			
			defaults["questions"][key] = {};
			
			for (j=0;j<defaults["points"].length;j++) {
				defaults["questions"][key][ defaults["points"][j] ] = categoriesToImport[key][j] +"";
			}
		}
		
		return defaults;
	};
	this.createDomElement = function(){
		var thisDataSet = this;
		// Set the main element.
		this.domElement = document.createElement("div");
		
		// Add a class.
			// This isn't configurable, but oh well.
		this.addClassToDomElement("gameDataSet");
				
		var nameDisplayDiv = this.createAndAppendToDom("div", this.domElement);
		$(nameDisplayDiv).addClass("nameDisplayDiv");
		
			var nameDisplayDivInsert = this.createAndAppendToDom("div", nameDisplayDiv);
			$(nameDisplayDivInsert).addClass("nameDisplayDivInsert");
			
				var dataSetNameInput = this.createAndAppendToDom("input", nameDisplayDivInsert);
				dataSetNameInput.type = "text";
				dataSetNameInput.placeholder = "Name:"
				$(dataSetNameInput).addClass("dataSetNameInput");
				$(dataSetNameInput).hide();
				
				var dataSetNameDisplay = this.createAndAppendToDom("div", nameDisplayDivInsert);
				$(dataSetNameDisplay).addClass("dataSetNameDisplay");
				
					var dataSetNameDisplayInsert = this.createAndAppendToDom("span", dataSetNameDisplay);
					$(dataSetNameDisplayInsert).addClass("dataSetNameDisplayInsert");
					
		var sizeDisplayDiv = this.createAndAppendToDom("div", this.domElement);
		$(sizeDisplayDiv).addClass("sizeDisplayDiv");
		
			var sizeDisplayDivInsert = this.createAndAppendToDom("div", sizeDisplayDiv);
			$(sizeDisplayDivInsert).addClass("sizeDisplayDivInsert");
				
				var rowDisplayDiv = this.createAndAppendToDom("div", sizeDisplayDivInsert);
				$(rowDisplayDiv).addClass("rowDisplayDiv");
				
					var rowDisplayDivInsert = this.createAndAppendToDom("span", rowDisplayDiv);
					$(rowDisplayDivInsert).addClass("rowDisplayDivInsert");
					$(rowDisplayDivInsert).html("0");
					
				var colDisplayDiv = this.createAndAppendToDom("div", sizeDisplayDivInsert);
				$(colDisplayDiv).addClass("colDisplayDiv");
				
					var colDisplayDivInsert = this.createAndAppendToDom("span", colDisplayDiv);
					$(colDisplayDivInsert).addClass("colDisplayDivInsert");
					$(colDisplayDivInsert).html("0");
		
		
		// Prepend this, but include it after every other element has been defined.
		var editModeDiv = this.createAndAppendToDom("div", this.domElement, true);
		$(editModeDiv).addClass("editMode");
		
			var editModeDivInsert = this.createAndAppendToDom("div", editModeDiv);
			$(editModeDivInsert).addClass("editModeDivInsert");
			
				var editButton = new GameButtonWithController(this.controller);
				var doneButton = new GameButtonWithController(this.controller);
				var questionsButton = new GameButtonWithController(this.controller);
				var deleteButton = new GameButtonWithController(this.controller);
				var undeleteButton = new GameButtonWithController(this.controller);
				
				editButton.initWith("regularButton editButton", "Edit", editModeDivInsert, function(){
					// hide edit button
					editButton.hide();
					// hide edit board button
					questionsButton.hide();
					// show done button
					doneButton.show();
					// show delete button
					deleteButton.show();
					
					// hide text display
					$(dataSetNameDisplay).hide();
					// show text input
					$(dataSetNameInput).show();
					
					// A side-effect of refreshing the display is filling the input with the current name.
					thisDataSet.updateDisplayInfo();
					
					dataSetNameInput.focus();
					
					$(window).trigger("resize");
				});
				doneButton.initWith("regularButton doneButton", "Done", editModeDivInsert, function(){
					var newName = dataSetNameInput.value +"";
					var oldName = thisDataSet.name +"";
					
					// Data management rewrite:
					// Also, the checks on the validity of the new name are done in this method.
					thisDataSet.changeName(newName);
					
					// hide delete button
					deleteButton.hide();
					// hide done button
					doneButton.hide();
					// show edit button
					editButton.show();
					// show edit board button
					questionsButton.show();
					
					// hide text input
					$(dataSetNameInput).hide();
					// show text display
					$(dataSetNameDisplay).show();
					// fill text display
					thisDataSet.updateDisplayInfo();
					
					$(this.domElement).closest(".gameOverlay").find("form input").get(0).focus();
					
					$(window).trigger("resize");
				});
				questionsButton.initWith("regularButton questionsButton", "View Board", editModeDivInsert, function(){
					thisDataSet.editBoard();
					this.controller.navPush(this.controller.gameStates.MakeBoard);
				})
				deleteButton.initWith("regularButton deleteButton", "Delete", editModeDivInsert, function(){
					// remove item from display.
					var parentElement = $(thisDataSet.domElement).parent();
					
					// Cancel any name input that was being made.
					// Setting this to an empty string should be just fine.
					dataSetNameInput.value = "";
					thisDataSet.clickDoneButton();
					
					$(this.domElement).closest(".gameOverlay").find("form input").get(0).focus();
					
					// Call something here to take care of the predeletion
					// I've decided to simply mark data sets for deletion and let the controller handle the actual deleting.
					this.controller.markDataSetToDelete(thisDataSet.name);
					
					thisDataSet.setDeleteStyling();
					
					deleteButton.hide();
					questionsButton.hide();
					editButton.hide();
					undeleteButton.show();
					
					$(window).trigger("resize");
					
					return true;
				});
				undeleteButton.initWith("regularButton undeleteButton", "Undelete", editModeDivInsert, function(){
					this.controller.markDataSetToUndelete(thisDataSet.name);
					
					thisDataSet.unsetDeleteStyling();
					
					undeleteButton.hide();
					editButton.show();
					questionsButton.show();
					
					$(window).trigger("resize");
					
					return true;
				})
				
				$(function() {
				    $(dataSetNameInput).on('keydown', function(event) {
				        if(event.which == 13) {
				            $(doneButton.domElement).get(0).click();
				            return false;
				        }
				    });
				});
				
				doneButton.hide();
				undeleteButton.hide();
				deleteButton.hide();
				
		var playModeDiv = this.createAndAppendToDom("div", this.domElement);
		$(playModeDiv).addClass("playMode");
		
			var playModeDivInsert = this.createAndAppendToDom("div", playModeDiv);
			$(playModeDivInsert).addClass("playModeDivInsert");
			
				var setCurrentButton = new GameButtonWithController(this.controller);
				setCurrentButton.initWith("regularButton", "Use", playModeDivInsert, function(){
					this.controller.setCurrentDataSet(thisDataSet.name);
				});
		
		this.exitPlayMode();
		this.enterEditMode();
		
		return true;
	};
	this.updateDisplayInfo = function(){
		var nameDisplay = $(this.domElement).find(".dataSetNameDisplayInsert");
		var nameInput = $(this.domElement).find(".dataSetNameInput");
		var rowCountDisplay = $(this.domElement).find(".rowDisplayDivInsert");
		var colCountDisplay = $(this.domElement).find(".colDisplayDivInsert");
		
		nameDisplay.html(this.name);
		nameInput.get(0).value = this.name;
		rowCountDisplay.html(this.points.length);
		colCountDisplay.html(this.cats.length);
		
		hackFontSize(rowCountDisplay);
		hackFontSize(colCountDisplay);
		hackFontSize(nameDisplay);
		
		return true;
	};
	this.saveData = function(){
		this.deleteData();
		
		localStorage.setItem(this.dataPrefix, "true");
// 		localStorage.setItem(this.dataPrefix +this.delim +this.catsSuffix, this.cats);
		
		localStorage.setItem(this.dataPrefix +this.delim +this.catsSuffix +this.totalSuffix, this.cats.length);
		for (i=0;i<this.cats.length;i++) {
			localStorage.setItem(this.dataPrefix +this.delim +this.catsSuffix +this.delim +i, this.cats[i]);
		}
		
		localStorage.setItem(this.dataPrefix +this.delim +this.pointsSuffix, this.points);
		
		for (category in this.questions) {
			for (i=0;i<this.points.length;i++) {
				localStorage.setItem( this.dataPrefix +this.delim +this.qDictSuffix +this.delim +category +this.delim +this.points[i] , this.questions[category][this.points[i]]);
			}
		}
		
		return true;
	};
	this.getSavedData = function(){
		// Do not pass GO
		if ( localStorage.getItem(this.dataPrefix) == null ) {
			return null;
		}
		
		var tempData = {};
		tempData.cats = [];
		tempData.points = [];
		tempData.qDict = {};
		
// 		var tempVarCats = localStorage.getItem(this.dataPrefix +this.delim +this.catsSuffix);
		
		var catsLength = localStorage.getItem(this.dataPrefix +this.delim +this.catsSuffix +this.totalSuffix);
		for (i=0;i<catsLength;i++) {
			tempData.cats.push( localStorage.getItem(this.dataPrefix +this.delim +this.catsSuffix +this.delim +i) );
		}
		
		var tempVarPts = localStorage.getItem(this.dataPrefix +this.delim +this.pointsSuffix);
		
		if (tempVarPts == null) {
			this.log("Stored Categories or Point Values missing. Unable to continue.", logTypes.error);
			return null;
		}
// 		tempData.cats = tempVarCats.split(",");
		tempData.points = tempVarPts.split(",");
		
		for (i=0;i<tempData.cats.length;i++) {
			tempData.qDict[ tempData.cats[i] ] = {};
			for (j=0;j<tempData.points.length;j++) {
				tempData.qDict[ tempData.cats[i] ][ tempData.points[j] ] = localStorage.getItem( this.dataPrefix +this.delim +this.qDictSuffix +this.delim +tempData.cats[i] +this.delim +tempData.points[j] );
			}
		}
		
		return tempData;
	};
	this.loadData = function(){
		var tempData = this.getSavedData();
		
		if (tempData == null) {
			return false;
		}
		
		this.cats = tempData.cats;
		this.points = tempData.points;
		this.questions = tempData.qDict;
		
		return true;
	};
	this.deleteData = function(){
		var tempString = this.dataPrefix.replace( new RegExp("\\$", "g"), "\\$").replace(new RegExp("\\^", "g"), "\\^");
		
		// DANGER!!!
		// There is a bug, reported below, which causes any regex with the global "g" flag set to not reset properly.
		// The effect is that it will alternate correct and incorrect tests.
		//
		// I usually use it out of thoroughness and habit,
		// but since I don't need it here, I have removed the "g" flag from my resultant regex.
		//
		// http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
		var tempRegex = new RegExp("^" +tempString +".*$");
		
		for (key in localStorage) {
			if ( tempRegex.test(key) ) {
				localStorage.removeItem(key);
			}
		}
		
		return true;
	};
	
	// Alright, with the complete rewrite of how internal object data is managed, this is how things are going to work:
		// First, any changes to the data will be done by method, no more touching data via an external object. That bullshit ain't gonna fly anymore...
		// Second, none of that data is written until it is specifically confirmed, via the defined method.
		// Third, after changes have been made, you must either cancel those edits or confirm them.
			// If you don't, then things like the DOM element will get out of sync with the data, and that would be bad.
	this.nameChanged = function(){
		if (this.backupName == null) {
			return false;
		} else {
			return true;
		}
	};
	this.catsChanged = function(){
		if (this.backupCats == null) {
			return false;
		} else {
			return true;
		}
	};
	this.rowsChanged = function(){
		if (this.backupPoints == null) {
			return false;
		} else {
			return true;
		}
	};
	this.questionsChanged = function(){
		if (this.backupQuestions == null) {
			return false;
		} else {
			return true;
		}
	};
	
	this.backupNameData = function(){
		if ( this.nameChanged() ) {
			return false;
		} else {
			this.backupName = this.name + "";
			return true;
		}
	};
	this.backupCatsData = function(){
		if ( this.catsChanged() ) {
			return false;
		} else {
			this.backupCats = $.extend([], this.cats);
			return true;
		}
	};
	this.backupPointsData = function(){
		if ( this.rowsChanged() ) {
			return false;
		} else {
			this.backupPoints = $.extend([], this.points);
			return true;
		}
	};
	this.backupQuestionsData = function(){
		if ( this.questionsChanged() ) {
			return false;
		} else {
			this.backupQuestions = $.extend({}, this.questions);
			return true;
		}
	};
	
	this.changeName = function(newName){
		if (newName == null || newName == "" || typeof newName == "undefined" || newName == this.name) {
			return this.name;
		}
		
		var goodChange = this.controller.isNewDataSetNameValid(newName, this);
		
		if (goodChange) {
			this.backupNameData();
			// Next, move on with the edit.
			this.name = newName + "";
		}
		
		return this.name;
	};
	this.moveCol = function(fromIndex, toIndex){
		var parsedFromIndex = parseInt(fromIndex);
		var parsedToIndex = parseInt(toIndex);
		
		if (parsedFromIndex.toString() == "NaN") {
			this.log("Invalid source index '" +fromIndex +"'." , logTypes.error);
			return false;
		} else if (parsedFromIndex < 0 || parsedFromIndex >= this.cats.length) {
			this.log("Column source index '" +parsedFromIndex +"' is out of range.", logTypes.error);
		}
		
		if (parsedToIndex.toString() == "NaN") {
			this.log("Invalid destination index '" +toIndex +"'." , logTypes.error);
			return false;
		} else if (parsedToIndex < 0 || parsedToIndex >= this.cats.length) {
			this.log("Column destination index '" +parsedToIndex +"' is out of range.", logTypes.error);
		}
		
		this.backupCatsData();
		
		// Take it out of the array.
		var moveThis = this.cats.splice(parsedFromIndex, 1)[0];
		
		// Place it where you want it.
		this.cats.splice(parsedToIndex, 0, moveThis);
		
		return true;
	};
	this.moveRow = function(fromIndex, toIndex){
		var parsedFromIndex = parseInt(fromIndex);
		var parsedToIndex = parseInt(toIndex);
		
		if (parsedFromIndex.toString() == "NaN") {
			this.log("Invalid source index '" +fromIndex +"'." , logTypes.error);
			return false;
		} else if (parsedFromIndex < 0 || parsedFromIndex >= this.points.length) {
			this.log("Row source index '" +parsedFromIndex +"' is out of range.", logTypes.error);
		}
		
		if (parsedToIndex.toString() == "NaN") {
			this.log("Invalid destination index '" +toIndex +"'." , logTypes.error);
			return false;
		} else if (parsedToIndex < 0 || parsedToIndex >= this.points.length) {
			this.log("Row destination index '" +parsedToIndex +"' is out of range.", logTypes.error);
		}
		
		this.backupPointsData();
		
		// Take it out of the array.
		var moveThis = this.points.splice(parsedFromIndex, 1)[0];
		
		// Place it where you want it.
		this.points.splice(parsedToIndex, 0, moveThis);
		
		return true;
	};
	this.addRow = function(newPointValue, _atIndex){
		// First run some checks on the new row
		if (newPointValue == null || newPointValue +"" == "" || typeof newPointValue == "undefined") {
			this.log("No category name provided.", logTypes.error);
			return false;
		} else if (this.points.indexOf(newPointValue +"") >= 0) {
			this.log("Row value '" +newPointValue +"' already taken.");
			return false;
		}
		
		this.backupPointsData();
		
		var index = parseInt(_atIndex);
		
		// If the index is not valid,
		if (index.toString() == "NaN") {
			// Push the value onto the end of the array.
			this.points.push(newPointValue);
			
		// Else it is actually good.
		} else {
			// Go ahead and insert the value at that index.
			this.points.splice(index, 0, newPointValue);
		}
		
		this.backupQuestionsData();
		
		for (i=0;i<this.cats.length;i++) {
			this.questions[this.cats[i]][newPointValue] = this.defaultQuestionText;
		}
		
		this.updateDisplayInfo();
		
		return true;
	};
	this.addCol = function(newCategoryName, _atIndex){
		// First run some checks on the new category
		if (newCategoryName == null || newCategoryName == "" || typeof newCategoryName == "undefined") {
			this.log("No category name provided.", logTypes.error);
			return false;
		} else if (this.cats.indexOf(newCategoryName +"") >= 0) {
			this.log("Category '" +newCategoryName +"' already taken.");
			return false;
		}
		
		this.backupCatsData();
		
		var index = parseInt(_atIndex);
		
		// If the index is not valid,
		if (index.toString() == "NaN") {
			// Push the value onto the end of the array.
			this.cats.push(newCategoryName);
			
		// Else it is actually good.
		} else {
			// Go ahead and insert the value at that index.
			this.cats.splice(index, 0, newCategoryName);
		}
		
		this.backupQuestionsData();
		
		this.questions[newCategoryName] = {};
		
		for (i=0;i<this.points.length;i++) {
			this.questions[newCategoryName][this.points[i]] = this.defaultQuestionText;
		}
		
		this.updateDisplayInfo();
		
		return true;
	};
	this.delRow = function(index, orValue){
		var tempIndex = parseInt(index);
		
		// If index is present,
			// use it and move on.
		
		// If index is not present,
		if (tempIndex.toString() == "NaN") {
			// get value from parameters
			var tempValue = parseInt(orValue).toString();
			
			// If value isn't present,
			if (tempValue == null || typeof tempValue == "undefined" || tempValue == "NaN") {
				// error.
				this.log("Could not identify row in data set '" +this.name +"'.\nPlease provide more information.", logTypes.error);
				return false;
			// If it is,
			} else {
				// get the index and move on.
				tempIndex = this.points.indexOf(tempValue);
				
				// Check if the index is valid
				if (tempIndex < 0) {
					this.log("Could not identify row from the provided value '" +tempValue +"'.", logTypes.error);
					return false;
				}
			}
		} else if (tempIndex < 0 || tempIndex >= this.points.length) {
			this.log("Row index '" +tempIndex +"' is out of range.", logTypes.error);
			return false;
		}
		
		// After the parameter check, a valid index can be assumed to be present.
		
		this.backupPointsData();
		
		var removedRow = this.points.splice(tempIndex, 1);
		
		// I'm specifically choosing at this time to not remove the questions.
		// This would be a feature of keeping the data of a deleted row until the data is fully written.
		// This means that we will have to remove this data specifically in the edit confirmation method.
/*
		this.backupQuestionsData();
		for (cat in this.questions) {
			for (point in this.questions[cat]) {
				if (point == removedRow) {
					delete this.questions[cat][point];
				}
			}
		}
*/
		this.updateDisplayInfo();
		
		return removedRow;
	};
	this.delCol = function(index, orValue){
		var tempIndex = parseInt(index);
		
		// If index is present,
			// use it and move on.
		
		// If index is not present,
		if (tempIndex.toString() == "NaN") {
			// get value from parameters
			var tempValue = orValue;
			
			// If value isn't present,
			if (tempValue == null || typeof tempValue == "undefined") {
				// error.
				this.log("Could not identify col in data set '" +this.name +"'.\nPlease provide more information.", logTypes.error);
				return false;
			// If it is,
			} else {
				// get the index and move on.
				tempIndex = this.cats.indexOf(tempValue);
				
				// Check if the index is valid
				if (tempIndex < 0) {
					this.log("Could not identify col from the provided value '" +tempValue +"'.", logTypes.error);
					return false;
				}
			}
		} else if (tempIndex < 0 || tempIndex >= this.cats.length) {
			this.log("Col index '" +tempIndex +"' is out of range.", logTypes.error);
			return false;
		}
		
		// After the parameter check, a valid index can be assumed to be present.
		
		this.backupCatsData();
		
		var removedCol = this.cats.splice(tempIndex, 1);
		
		this.updateDisplayInfo();
		
		return removedCol;
	};
	this.editQuestion = function(newText, _categoryIndex, _rowIndex, _categoryName, _rowValue){
		var catIndex = parseInt(_categoryIndex);
		var rowIndex = parseInt(_rowIndex);
		
		var catName;
		var rowValue = parseInt(_rowValue);
		
		if (catIndex.toString() == "NaN") {
			if (_categoryName == null || typeof _categoryName == "undefined" || _categoryName == "") {
				this.log("Unable to change question. Category name not provided.", logTypes.error);
				return false;
			}
			
			catIndex = this.cats.indexOf(_categoryName);
			
			if (catIndex < 0) {
				this.log("Unable to change question. Category '" +_categoryName +"' not found.", logTypes.error);
				return false;
			}
		}
		
		// catIndex now defined.
		
		if (rowIndex.toString() == "NaN") {
			if (rowValue.toString() == "NaN") {
				this.log("Unable to change question. '" +_rowValue +"' is not a valid row value.", logTypes.error);
				return false;
			}
			
			rowIndex = this.points.indexOf(rowValue.toString());
		}
		
		// rowIndex now defined.
		
		// Now, get the actual values from the indices.
		// Yes, I know that indices take precedence over provided values. That is intended.
		catName = this.cats[catIndex];
		rowValue = this.points[rowIndex];
		
		var oldText = this.questions[catName][rowValue];
		if (oldText === newText){
			return false;
		} else {
			this.backupQuestionsData();
			
			this.questions[catName][rowValue] = newText;
			return true;
		}
	};
	
	this.isRowValueAvailable = function(rowValue, _ignoreIndex){
		var parsedValue = parseInt(rowValue);
		var parsedIndex = parseInt(_ignoreIndex);
		
		if (parsedValue.toString() == "NaN") {
			this.log("Could not test row value. Could not parse '" +rowValue +"'.", logTypes.error);
			return false;
		} else {
			var index = this.points.indexOf( parsedValue.toString() );
			if (index >= 0 && index != parsedIndex) {
				return false;
			} else {
				return true;
			}
		}
	};
	this.editRowValue = function(index, orValue, newValue){
		var parsedIndex = parseInt(index);
		
		if (parsedIndex.toString() == "NaN") {
			if (orValue == "" || orValue == null || typeof orValue == "undefined") {
				this.log("Could not change row. '" +orValue +"' not found.", logTypes.error);
				return false;
			} else {
				parsedIndex = this.points.indexOf(orValue +"");
			}
		}
		
		if (parsedIndex < 0 ) {
			this.log("Could not change row. Value '" +orValue +"' not found.", logTypes.error);
			return false;
		} else if (parsedIndex >= this.points.length) {
			this.log("Could not change row. Index '" +parsedIndex +"' is out of range '" +this.points.length +"'.", logTypes.error);
			return false;
		} else {
			if ( ! this.isRowValueAvailable(newValue, parsedIndex) ) {
				this.log("Could not change row. '" +newValue +"' already in use.", logTypes.error);
				return false;
			}
			
			var oldValue = this.points.splice(parsedIndex, 1, newValue +"");
			
			this.backupQuestionsData();
			for (i=0;i<this.cats.length;i++) {
				this.questions[this.cats[i]][newValue] = this.questions[this.cats[i]][oldValue];
				delete this.questions[this.cats[i]][oldValue];
			}
			
			return true;
		}
	};
	
	this.isColNameAvailable = function(colName){
		var index = this.cats.indexOf(colName +"");
		if (index < 0) {
			return true;
		} else {
			return false;
		}
	};
	this.editColName = function(index, orValue, newName){
		if ( ! this.isColNameAvailable(newName) ) {
			this.log("Could not rename column. '" +newName +"' already in use.", logTypes.error);
			return false;
		}
		
		var parsedIndex = parseInt(index);
		
		if (parsedIndex.toString() == "NaN") {
			if (orValue == "" || orValue == null || typeof orValue == "undefined") {
				this.log("Could not rename column. '" +orValue +"' not found.", logTypes.error);
				return false;
			} else {
				parsedIndex = this.cats.indexOf(orValue +"");
			}
		}
		
		if (parsedIndex < 0 ) {
			this.log("Could not rename column. Category '" +orValue +"' not found.", logTypes.error);
			return false;
		} else if (parsedIndex >= this.cats.length) {
			this.log("Could not rename column. Index '" +parsedIndex +"' is out of range '" +this.cats.length +"'.", logTypes.error);
			return false;
		} else {
			this.backupCatsData();
			var oldName = this.cats.splice(parsedIndex, 1, newName +"");
			
			this.backupQuestionsData();
			this.questions[newName] = this.questions[oldName];
			delete this.questions[oldName];
			
			return true;
		}
	};
	
	this.prepareToUndelete = function(){
		$(this.domElement).find(".undeleteButton").get(0).click();
	};
	
	this.setDeleteStyling = function(){
		this.addClassToDomElement(this.cssClassWhenDeleted)
	};
	this.unsetDeleteStyling = function(){
		this.removeClassFromDomElement(this.cssClassWhenDeleted);
	};
	
	this.cancelEdits = function(){
		this.log("Canceling changes.");
		this.clickDoneButton();
		
		// The only thing that really need to be done is restore the backups (if they exist) into the main working properties.
		// If name has been changed (backup exists),
		if (this.backupName != null) {
			
			// Undo the database changes done by the name change.
			this.controller.changeDataSetName(this.name, this.backupName);
			
			// Move it back.
			this.name = this.backupName +"";
			
			// Remove backup and changes.
			this.backupName = null;
		}
		
		// If cats have been changed (backup exists),
		if (this.backupCats != null) {
			// Move it back.
			this.cats = $.extend([], this.backupCats);
			
			// Remove backup.
			this.backupCats = null;
		}
		
		// If points have been changed (backup exists),
		if (this.backupPoints != null) {
			// Move it back.
			this.points = $.extend([], this.backupPoints);
			
			// Remove backup.
			this.backupPoints = null;
		}
		
		// If questions have been changed (backup exists),
		if (this.backupQuestions != null) {
			// Move it back.
			this.questions = $.extend({}, this.backupQuestions);
			
			// Remove backup.
			this.backupQuestions = null;
		}
		
		this.updateDisplayInfo();
		this.unsetDeleteStyling();
		
		return true;
	};
	this.confirmEdits = function(){
		this.log("Writing changes.");
		this.clickDoneButton();
		
		if ( this.nameChanged() ) {
			this.controller.changeDataSetName(this.backupName, this.name);
		}
		
		// Also based on the tentative feature of keeping questions of deleted rows and columns until the edits are confirmed,
			// Go through each column and row in the questions dict and remove anything that doesn't belong.
		for (cat in this.questions) {
			
			// If the cat is found,
			if (this.cats.indexOf(cat) >= 0) {
				// go through and delete rows.
				
				// For each point value
				for (point in this.questions[cat]) {
					// If the point value is not found,
					if (this.points.indexOf(point) < 0) {
						// Get rid of it.
						delete this.questions[cat][point];
					}
				}
				
			// Else it isn't found,
			} else {
				// just delete the whole thing.
				delete this.questions[cat];
			}
		}
		
		// Get rid of the backups.
		this.backupName = null;
		this.backupCats = null;
		this.backupPoints = null;
		this.backupQuestions = null;
		
		// Update anything that needs updating.
			// Like maybe resetting DOM elements,
				// like the name input field.
				// or finishing editing the data set.
		this.updateDisplayInfo();
		this.unsetDeleteStyling();
		return true;
	};
	// I don't really like the need for making this a separate method, but I'm doing it for now. I can't see a huge demand for taking the time to integrate it into other methods.
	this.clickDoneButton = function(){
		$(this.domElement).find(".doneButton:visible").each(function(){
			this.click();
		});
	};
	// This method will be used to tell the controller that this board wishes to be edited.
	this.editBoard = function(){
		// Perhaps call a separate method in the controller?
		this.controller.setCurrentDataSet(this.name);
	};
	this.markAsCurrent = function(){
		$(this.domElement).addClass("current");
	};
	this.unmarkAsCurrent = function(){
		$(this.domElement).removeClass("current");
	};
}

GameController.prototype = gameObjectPrototype;
GameOverlayWithController.prototype = gameObjectPrototype;
GameBoardWithController.prototype = gameObjectPrototype;
GameTeam.prototype = gameObjectPrototype;
GameButtonWithController.prototype = gameObjectPrototype;
GameCheckboxWithController.prototype = gameObjectPrototype;
GameDatasetWithController.prototype = gameObjectPrototype;

function GameColor(R, G, B, colorName) {
	this.colorName = colorName || null;
	this.rgb = {
		"r":R.toString(),
		"g":G.toString(),
		"b":B.toString()
	};
	this.rgbInverse = {
		"r": (255 - parseInt(R.toString())) + "",
		"g": (255 - parseInt(G.toString())) + "",
		"b": (255 - parseInt(B.toString())) + ""
	};
	this.textColor = $.proxy(function(){
		var tempRGB = $.extend(true, {}, this.rgb);
		
		var average = ( parseInt(tempRGB.r) + parseInt(tempRGB.g) + parseInt(tempRGB.b) ) / 3;
		
		if (average < 128) {
			tempRGB.r = "255";
			tempRGB.g = "255";
			tempRGB.b = "255";
		} else {
			tempRGB.r = "0";
			tempRGB.g = "0";
			tempRGB.b = "0";
		}
		
		return tempRGB;
	}, this)();
	this.getCssHexString = function(optInverse, optTextColor){
		var stringR, stringG, stringB;
		var invert = typeof optInverse == "boolean" ? optInverse : false;
		var getTextColor = typeof optTextColor == "boolean" ? optTextColor: false;
		
		if (getTextColor) {
			var newR = this.textColor.r.toString();
			var newG = this.textColor.g.toString();
			var newB = this.textColor.b.toString();
		} else {
			var newR = R.toString();
			var newG = G.toString();
			var newB = B.toString();
		}
		
		if (invert) {
			newR = 255 - parseInt(newR);
			newG = 255 - parseInt(newG);
			newB = 255 - parseInt(newB);
		}
		
		stringR = pad(parseInt(newR).toString(16), 2);
		stringG = pad(parseInt(newG).toString(16), 2);
		stringB = pad(parseInt(newB).toString(16), 2);
		
		return "#" +stringR +stringG +stringB;
		
		// I got this function from Stack Overflow. I intend to come back to this later and fully understand it.
		function pad(n, width, z) {
		  z = z || '0';
		  n = n + '';
		  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}
	};
	this.getTextColor = function(){
		var average = ( parseInt(R) + parseInt(G) + parseInt(B) ) / 3;
		if (average < 128) {}
	};
}

function makeStruct(names) {
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i] || i+1;
    }
  }
  return constructor;
}

var jeopController = new GameController(pointsToImport, categoriesToImport, "#bodywrap");
jeopController.init("jeopCont");

// I hate, hate, hate these two functions. I named them 'hack' functions for a reason.
// What I want is an elegant and simple way to dynamically adjust font size based on both the container size and the amount of text.
// There are very simple and elegant ways to adjust font size based on the size of the container, but nothing I'm aware of to change it based on the amount of text.
// These functions are a product of my frustration, as I've succumbed to using a straight-forward, error-prone, brute force method of changing font size.

// The only good thing about hackStyle is that I have included the size of the game board cells in here as well.
// The game cells/rows will change whenever the size of it's container (usually the window) is adjusted.
// The only other way I can think of doing that is to use flex-box, but that isn't so widely supported, and I'd like to support a few older versions of browsers.
function hackStyle(){
	var dontResize = false;
	var controller = this || null;
	
	// CKeditor resizing
	if (typeof CKEDITOR != "undefined") {
		for (each in CKEDITOR.instances) {
			if ( $(CKEDITOR.instances[each].container.$).is(":visible") )
				var width = $(CKEDITOR.instances[each].container.$).parent().width();
				var height = $(CKEDITOR.instances[each].container.$).parent().height();
		}
	}
	
	// Table Resizing.
	
	var ovly = controller.gameOverlays[controller.gameStates.SelectQuestion] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (dontResize == false) {
		var numberOfCols = $(controller.gameBoard.tableHead).find("th").length;
		var numberOfRows = $(controller.gameBoard.domElement).find("tr").length;
		var totalWidth;
		var totalHeight;
		var cellWidth;
		var cellHeight;
		var modifier = 1;
		
		var sampleTable = $(ovly.domElement).find("table");
		var sampleRow = $( sampleTable.find("tr")[0] );
		
		var totalCellHorizMar = 0;
		// It shouldn't hurt having both th and td in here, since only one type should be within any given row.
		sampleRow.find("th, td").each(function(){
			totalCellHorizMar = totalCellHorizMar + parseInt( $(this).css("margin-left").replace("px", "") ) + parseInt( $(this).css("margin-right").replace("px", "") );
		});
		
		var totalCellVertMar = 0;
		sampleTable.find("tr").each(function(){
			var sampleCell = $( $(this).find("th, td")[0] );
			totalCellVertMar = totalCellVertMar + parseInt( sampleCell.css("margin-top").replace("px", "") ) + parseInt( sampleCell.css("margin-bottom").replace("px", "") );
		});
		
		totalWidth = Math.floor( $(ovly.domElement).get(0).getBoundingClientRect().width );
		totalHeight = Math.floor( $(ovly.domElement).get(0).getBoundingClientRect().height );
		
		totalWidth = totalWidth - totalCellHorizMar;
		totalHeight = totalHeight - totalCellVertMar;
		
		cellWidth = ( totalWidth / numberOfCols ) * modifier;
		cellHeight = ( totalHeight / numberOfRows ) * modifier;
		
		cellWidth = Math.floor(cellWidth);
		cellHeight = Math.floor(cellHeight);
		
		$(ovly.domElement).find("td, th").outerWidth(cellWidth).outerHeight(cellHeight);
		$(ovly.domElement).find(".editMode:visible .editRowButtons").outerHeight(cellHeight);
		
		$(ovly.domElement).find(".editMode:visible .editRowButtons").css("margin",(0.5 * totalCellHorizMar / numberOfCols ) + "px");
		
		$(ovly.domElement).find(".editMode:visible .editQuestionDisplay").outerHeight(cellHeight);//.css("margin",(0.5 * totalCellHorizMar / numberOfCols ) + "px");
		
		$(ovly.domElement).find("td button > span, th .catDivInsert, .editMode:visible .regularButton > span").each(function(){
			hackFontSize(this);
		});
	}
	
	// AnswerQuestion Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.AnswerQuestion] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.questionToAnswer span, \
		.previewQuestionSpan \
		").get(0));
	}
	
	// StartScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.StartScreen] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.gameTitle span \
		").get(0));
	}
	
	// OptionsScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.Options] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.optionButtons .regularButton span \
		"));
	}
	
	// MakeBoardScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.MakeBoard] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.formContainer .regularButton span, \
		.formContainer input, \
		.columnEditButtons .regularButton span \
		"));
	}
	
	// SelectQuestionScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.SelectQuestion] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.editMode .editRowButtons .wrapValue .displayRowValue, \
		.editMode .editRowButtons .wrapValue .editRowValue, \
		.editMode .editRowButtons .grabHandle span \
		"));
	}
	
	// DataMgmtScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.DataMgmt] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.regularButton:visible span, \
		.gameDataSet .dataSetNameInput, \
		#createDataSetForm input, \
		.dataSetNameDisplay .dataSetNameDisplayInsert, \
		.rowDisplayDiv .rowDisplayDivInsert, \
		.colDisplayDiv .colDisplayDivInsert \
		"));
	}
	
	// ImportDataScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.ImportData] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.dataDiv .regularButton span \
		"));
	}
	
	// ExportDataScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.ExportData] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.dataDiv .regularButton span \
		"));
	}
	
	// ChooseDataScreen Display Resizing
	dontResize = false;
	ovly = controller.gameOverlays[controller.gameStates.ChooseData] || null;
	if (controller == null || ovly == null || ! $(ovly.domElement).is(":visible")) dontResize = true;
	
	if (! dontResize) {
		hackFontSize($(" \
		.regularButton:visible span, \
		.gameDataSet .dataSetNameInput, \
		.dataSetNameDisplay .dataSetNameDisplayInsert, \
		.rowDisplayDiv .rowDisplayDivInsert, \
		.colDisplayDiv .colDisplayDivInsert \
		"));
	}
};
function hackFontSize(domElement, maxFontSize){
	$(domElement).each(function(){
		var dontResize = false;
		var maximumSize = parseInt(maxFontSize).toString() != "NaN" ? maxFontSize : 72;
		if ( ! $(this).is(":visible") ) {
			dontResize = true;
		}
		
		// (! dontResize) = YES, resize
		if (! dontResize ){
			//$(domElement).textfill({maxFontPixels:-1});
			// Dynamic font-sizes
			
			if ( /input/i.test(this.tagName) ) {
/*
					var valueToRestore = this.value;
					this.value = "I"
/*
					var parentHeight = $(this).height();
					var parentWidth = $(this).width();
*
					var boundRect = this.getBoundingClientRect();
					var parentHeight = boundRect.height;
					var parentWidth = boundRect.width;
					var testHeight, testWidth;
					
					var paddingTop = parseInt( $(this).css("padding-top").replace("px", "") );
					var paddingRight = parseInt( $(this).css("padding-right").replace("px", "") );
					var paddingBottom = parseInt( $(this).css("padding-bottom").replace("px", "") );
					var paddingLeft = parseInt( $(this).css("padding-left").replace("px", "") );
					
					
					var isOverflow = ( (this.scrollHeight - paddingTop - paddingBottom) > parentHeight );
					
					// To increase font sizes so that they fill their containers, we will induce overflow of the container.
					// This is done in big steps to try to minimize unneccessary cycles.
					while (! isOverflow) {
/*
						testHeight = this.scrollHeight;
						testWidth = this.scrollWidth;
*
						
						//console.log("Overflow: "+isOverflow);
						var oldFontSize = $(this).css("font-size").replace("px", "");
						//console.log("oldFontSize: "+oldFontSize);
						var newFontSize = parseInt(oldFontSize) + 5;
						//console.log("newFontSize: "+newFontSize);
						
						$(this).css("font-size", newFontSize +"px");
						
						// Update isOverflow
						//isOverflow = ( $(this).innerWidth() < this.scrollWidth || $(this).innerHeight() < this.scrollHeight );
// 						isOverflow = ( (this.scrollHeight - paddingTop - paddingBottom) > parentHeight );
						isOverflow = ( this.scrollHeight > parentHeight );
						
/*
						// Test for loop repetition
						if (testHeight == this.scrollHeight && testWidth == this.scrollWidth) {
							alert("Infinite loop detected during INPUT increase.");
							isOverflow = true;
						}
*
						if (newFontSize > 500) {
							alert("Infinite loop detected during INPUT increase. " +this.outerHTML);
							isOverflow = true;
						}
					}
					
					// Now, we will decrease font sizes granularly until that overflow is resolved.
					// If overflow was induced, then this should take no more cycles than a single increase step.
					while (isOverflow) {
/*
						testHeight = this.scrollHeight;
						testWidth = this.scrollWidth;
*
						
						//console.log("Overflow: "+isOverflow);
						var oldFontSize = $(this).css("font-size").replace("px", "");
						//console.log("oldFontSize: "+oldFontSize);
						var newFontSize = parseInt(oldFontSize) - 1;
						//console.log("newFontSize: "+newFontSize);
						
						$(this).css("font-size", newFontSize +"px");
						
						// Update isOverflow
// 						isOverflow = ( (this.scrollWidth - paddingRight - paddingLeft) > parentWidth || (this.scrollHeight - paddingRight - paddingLeft) > parentHeight );
						isOverflow = ( this.scrollWidth >= (parentWidth - paddingRight - paddingLeft) || this.scrollHeight >= (parentHeight - paddingTop - paddingBottom) );
						
/*
						// Test for loop repetition
						if (testHeight == this.scrollHeight && testWidth == this.scrollWidth) {
							alert("Infinite loop detected during INPUT decrease.");
							isOverflow = false;
						}
*
						if (newFontSize <= 0) {
							alert("Infinite loop detected during INPUT decrease. " +this.outerHTML );
							isOverflow = false;
						}
					}
					
					newFontSize = newFontSize * 0.85;
					$(this).css("font-size", newFontSize +"px");
					
					this.value = valueToRestore;
*/
					$(this).css("font-size", (this.getBoundingClientRect().height * 0.8).toString() + "px" );
				
			} else {
	// 			$(domElement).each(function(){
					var parentContainer = $(this).parent();
					var parentWidth = parentContainer.width() + 1; // I added this +1 because it looks like the width and height can end up being 1 more than that of the parent, triggering unnecessary overflow.
					var parentHeight = parentContainer.height() + 1;
					var testHeight, testWidth;
					
					//var isOverflow = ( $(this).innerWidth() < this.scrollWidth || $(this).innerHeight() < this.scrollHeight );
					var isOverflow = ( $(this).height() > parentHeight );
					
					// To increase font sizes so that they fill their containers, we will induce overflow of the container.
					// This is done in big steps to try to minimize unneccessary cycles.
					while (! isOverflow) {
						testHeight = this.scrollHeight;
						testWidth = this.scrollWidth;
						
						//console.log("Overflow: "+isOverflow);
						var oldFontSize = $(this).css("font-size").replace("px", "");
						//console.log("oldFontSize: "+oldFontSize);
						var newFontSize = parseInt(oldFontSize) + 5;
						//console.log("newFontSize: "+newFontSize);
						
						$(this).css("font-size", newFontSize +"px");
						
						// Update isOverflow
						//isOverflow = ( $(this).innerWidth() < this.scrollWidth || $(this).innerHeight() < this.scrollHeight );
						isOverflow = ( $(this).height() > parentHeight );
					}
					
					// Now, we will decrease font sizes granularly until that overflow is resolved.
					// If overflow was induced, then this should take no more cycles than a single increase step.
					while (isOverflow) {
						testHeight = this.scrollHeight;
						testWidth = this.scrollWidth;
						
						//console.log("Overflow: "+isOverflow);
						var oldFontSize = $(this).css("font-size").replace("px", "");
						//console.log("oldFontSize: "+oldFontSize);
						var newFontSize = parseInt(oldFontSize) - 1;
						//console.log("newFontSize: "+newFontSize);
						
						$(this).css("font-size", newFontSize +"px");
						
						// Update isOverflow
// 						isOverflow = ( $(this).width() > parentWidth || $(this).height() > parentHeight );
// 						isOverflow = ( this.scrollWidth > parentWidth || this.scrollHeight > parentHeight );
						isOverflow = ( $(this).width() > parentWidth || $(this).height() > parentHeight || this.scrollWidth > parentWidth || this.scrollHeight > parentHeight );
					}
					
					if ( ! $(this).parent().hasClass("grabHandle") ) {
						newFontSize = newFontSize * 0.85;
					}
					$(this).css("font-size", newFontSize +"px");
		
					
					/*
		console.log("Done resizing.");
					newFontSize = Math.ceil(newFontSize *shrinkFactor);
					console.log("Shrinking font to: "+newFontSize);
					$(this).css("font-size", newFontSize +"px");*/
					
					// New method.
					// Let's increase the font size until we induce vertical scrolling.
						// This might need to override the overflow property to scroll-y
						// You know what, let's just use the vertical scroll height for this.
					// After we've determined which font-size is a suitable maximum size, we can incrementally decrease until there is no more overflow at all.
						// I really hope this works.
					
					//var isVertOverflow = ( $(this).innerHeight() < this.scrollHeight );
					
					// Let's induce 
					//while (! isVertOverflow) {}
				
	// 			});
		/*$(domElement).each(function(){
					$(this).css("font-size", maximumSize + "px");
					var isOverflow = ( $(this).innerWidth() < this.scrollWidth || $(this).innerHeight() < this.scrollHeight );
					
					while (isOverflow) {
						var oldFontSize = parseInt( $(this).css("font-size").replace("px", "") );
						var newFontSize = oldFontSize -1;
						
						$(this).css("font-size", newFontSize + "px");
						isOverflow = ( $(this).innerWidth() < this.scrollWidth || $(this).innerHeight() < this.scrollHeight );
					}
					
				});
	*/
			}
		}
		
	});
};

$(window).resize($.proxy(hackStyle,jeopController)).trigger("resize");

function refreshInfo() {
	$(".versionNumber").html("v" +versionNumber);
	$(".mailToAdmin").html(adminEmail);
	$(".mailToAdmin").attr("href", "mailto:" +adminEmail +"?Subject=Feedback:%20Jeopardy%20v" +versionNumber +"&body=My%20Browser:%0A" +navigator.userAgent +"%0A%0AMy%20Comments:%0A");
}
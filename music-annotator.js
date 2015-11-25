// params: serverURL, mainContainerDOMEl

function MusicAnnotator(params) {

	var _id;

	var _annotationsEndpoint = "annotations";
	var _tracksEndpoint = "annotations-tracks";
	var _typesEndpoint = "types";


	// DATA
	var _board = {
		id: undefined,
		author: undefined,
		tracks: {}, 
		custom: {},
		feedback: []
	}

	// UI
	var _timeline;

	var _mainContainerDOMEl = params.mainContainerDOMEl;

	var _ctrlsDOMEl = {};

	function initUI() {
		var width = _trackDOMEl.getBoundingClientRect().width;
		var height = 60;
		var duration = 20;
		var pixelsPerSecond = width / duration;

		_timeline = new wavesUI.core.Timeline(pixelsPerSecond, width);
		_timeContext = new wavesUI.core.LayerTimeContext(_timeline.timeContext);

		_ctrlsDOMEl['play-stop'] = document.createElement('button');
		_ctrlsDOMEl['drag-view'] = document.createElement('button');
		_ctrlsDOMEl['add-annotations-track'] = document.createElement('button');
	}


	var _createTrackUI = function(trackMainDOMEl) {
		
		var trackTLDOMEl = document.createElement('div');
		var trackCtrlDOMEl = document.createElement('div');

		trackMainDOMEl.appendChild(trackTLDOMEl);
		trackMainDOMEl.appendChild(trackCtrlDOMEl);

		var track = new wavesUI.core.Track(trackTLDOMEl, height);

		var timeCursorLayer = new wavesUI.core.Layer('entity', { currentPosition: 0 }, {
			height: height
		});
		timeCursorLayer.setTimeContext(_timeContext);
		timeCursorLayer.configureShape(wavesUI.shapes.Cursor, {
			x: function(d) { 
				return d.currentPosition; 
			}
		}, {
			color: TIME_CURSOR_COLOR
		});

		track.add(timeCursorLayer);
	}
	
	this.set_audio_buffer = function() {

	}

	this.set_beat_grid = function() {
		// TODO: talvez seja boa ideia reajustar os segmentos à beat grid.
	}

	this.set_snap_to_grid = function() {

	}

	this.add_annotations_track = function(annTrackId) {
		_board[annTrackId] = {
			id: annTrackId, 

		}
	}

	this.add_annotations = function(annotations, annTrackId) {

	}

	this.set_current_time = function() {

	}

	this.destroy = function() {

	}

	this.save = function() {
		_beatGridLayer.data = new Array(beatsData.length);
		for (var i in beatsData) {
			_beatGridLayer.data[i] = {t0: beatsData[i], _id: _idCounter++};
		}
	}

}



function AnnotationsBoard(id, tracks) {


	Object.defineProperties(this, {
		'id' : {
			get : function() {
				
			}
		}, 
		'author' : {
			get : function() {
				
			}
		},
		'title' : {
			get : function() {
				
			}, 
			set : function(newTitle) {

			}
		}, 
		'description' : {
			get : function() {
				
			}, 
			set : function(newDescription) {

			}
		},
		'feedback' : {
			get : function() {
				
			}
		},
		'tracks' : {
			get : function() {

			}
		}
	});

	this.add_annotations_track = function() {

	}

	this.remove_annotations_track = function() {

	}

}

function Annotation(id, title, description, author) {

	var _id;
	var _title;
	var _author;
	var _feedback;

	this.destroy = function() {

	}

	this.save = function() {

	}

	this.add_feedback = function(params) {
		_feedback[params.id] = {
			id: params.id,
			author: params.author, 
			comment: params.comment,
			rate: params.rate
		};
	}

	this.set_custom = function(key, value) {

	}

}

function AnnotationTrack() {

	Object.defineProperties(this, {
		'id' : {
			get : function() {

			}
		}, 
		'annotations' : {

		}, 
		'types' : {
			get : function() {

			}, 
			set : function(newTypes) {

			}
		}
	});

	this.add_annotation = function() {

	}

	this.remove_annotations = function(filterFn) {

	}

	this.destroy = function() {
		// TODO
	}

	this.save = function() {
		// TODO
	}

}

function Feedback(id, author, comment, target, rate, actionCallback) {

	Object.defineProperties(this, {
		'id' : {
			get : function() {

			}
		}, 
		'author' : {
			get : function() {

			}, 
			set : function() {

			}
		}, 
		'comment' : {
			get : function() {

			}, 
			set : function() {

			}
		},
		'target' : {
			get : function() {

			}, 
			set : function() {

			}
		},
		'rate' : {
			get : function() {

			}, 
			set : function() {

			}
		}
	});
}


// actionCallback(action, fields, oldValues, newValues), action = 'save' | 'delete'
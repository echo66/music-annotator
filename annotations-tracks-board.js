function AnnotationTracksBoard(id, mainDOMEl) {

	var _boardId = id;


	var _mainDOMEl = mainDOMEl;
	var _waveformTrackDiv = document.createElement('div');
	_tracksDiv.id = 'board-waveform-container-' + _boardId;
	var _controlsDiv = document.createElement('div');
	_tracksDiv.id = 'board-controls-container-' + _boardId;
	var _tracksDiv = document.createElement('div');
	_tracksDiv.id = 'board-tracks-container-' + _boardId;
	

	var _pixelsPerSecond = _mainDOMEl.getBoundingClientRect().width / 20;
	var _tracks = {};
	var _idCounter = 0;
	var _sharedTimeline = new wavesUI.core.Timeline(_pixelsPerSecond, domEl.getBoundingClientRect().width);
	var _sharedCenteredZoomState = new wavesUI.states.CenteredZoomState(_sharedTimeline);
	

	var _waveformTrack = new AnnotatorTrackUI(_boardId + "-" + _idCounter++, _sharedTimeline, _waveformTrackDiv, height);

	_mainDOMEl.appendChild(_controlsDiv);
	_mainDOMEl.appendChild(_waveformTrackDiv);
	_mainDOMEl.appendChild(_tracksDiv);


	var _init_board_controls = function() {
		var _addTrackButton = document.createElement('button');
		_addTrackButton.innerHTML = 'Add Annotation Track';
		//TODO
		_controlsDiv.appendChild(_addTrackButton);
	}


	this.load_audio_buffer = function(audioBuffer) {
		for (var i in _tracks) 
			_tracks[i].set_audio_buffer(audioBuffer.getChannelData(0));

		_emit("loaded-audio-buffer");
	}

	this.load_beat_grid = function(beatData) {
		for (var i in _tracks) 
			_tracks[i].set_beat_grid(beatData);
		_emit("loaded-beat-grid");
	}
	
	this.add_annotation_track = function() {
		var containerDiv = document.createElement('div');
		var trackDiv = document.createElement('div');
		var controlsDiv = document.createElement('div');
		var infoDiv = document.createElement('div');

		// TODO 
		_tracks[trackId].toggle('snap-grid', true);
		_tracks[]

		containerDiv.appendChild()

		_mainDOMEl.appendChild(containerDiv);
		_emit('added', {
			type: 
		})
	}

	this.add_annotations = function(trackId, newData, type) {

		_

		
	}

	this.remove_track = function(trackId) {
		
		_tracks

	}

	this.destroy = function() {
		for (var i in _tracks) 
			_tracks[i].destroy();

	}

	this.set_current_time = function(newTime) {
		for (var i in _tracks) 
			_tracks[i].set_current_time(newTime);
	}


	this.toggle_lock_drag_view = function(trackId, toggle) {
		if (track != undefined)
	}

	this.toggle = function(type, value, trackId) {
		switch (type) {
			case 'snap-grid' : _toggle('snap-grid', value); break;
			case 'beat-grid' : _toggle('snap-grid', value); break;
			case 'follow-cursor' : _toggle('follow-cursor', value); break;
			case 'can-edit' : 
			case 'visibility' : 
				// TODO
				break;
		}

		if (trackId == undefined) {

		} else {

		}
	}

	var _toggle = function(type, value) {
		for (var i in _tracks)
			_tracks[i].toggle(type, value);
	}

	/***************************************************************/
	/*********************** EVENTS HANDLING ***********************/
	/***************************************************************/
	var _callbacks =  {
		"loaded-beat-grid": {},
		"loaded-audio-buffer": {},
		"set-current-time": {},
		"added": {},
		"edited": {},
		"removed": {},
		"selected": {},
	};
	var _idCounter = 0;

	var eventsToEmit = [];
	var eventsToEmitPointer = 0;

	function _push_event_to_emit(type, data) {
		eventsToEmit[eventsToEmitPointer++] = { type: type, data: data };
	}

	function _emit_all_events() {
		var m = eventsToEmitPointer;
		for (var i=0; i<m; i++, eventsToEmitPointer--) 
			_emit(eventsToEmit[i].type, eventsToEmit[i].data);
	}

	var _emit = function(evenType, data) {
		for (var ci in _callbacks[evenType]) 
			_callbacks[evenType][ci](data);
	}

	this.on = function(observerID, eventType, callback) {

		// if (!eventType || _callbacks[eventType]==undefined) 
		// 	throw "Unsupported event type";

		if (observerID!=undefined && _callbacks[eventType][observerID]!=undefined) 
			throw "Illegal modification of callback";

		var __id = (observerID==undefined)? _id + "-associate-" + (_idCounter++) : observerID;
		_callbacks[eventType][__id] = callback;
		return __id;
	}

	this.off = function(observerID, eventType) {

		// if (!eventType || _callbacks[eventType]==undefined) 
		// 	throw "Unsupported event type";

		delete _callbacks[eventType][observerID];
	}

	this.clear_listeners = function() {
		// TODO
	}
}
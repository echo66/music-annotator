function AnnotationTracksBoardUI(id, mainDOMEl) {

	var _boardId = id;

	var _height = 100;

	var _mainDOMEl = mainDOMEl;
	var _waveformTrackDiv = document.createElement('div');
	_waveformTrackDiv.id = 'board-waveform-container-' + _boardId;
	var _controlsDiv = document.createElement('div');
	_controlsDiv.id = 'board-controls-container-' + _boardId;
	var _tracksDiv = document.createElement('div');
	_tracksDiv.id = 'board-tracks-container-' + _boardId;
	

	var _pixelsPerSecond = _mainDOMEl.getBoundingClientRect().width / 20;
	var _tracks = {};
	var _idCounter = 0;
	var _sharedTimeline = new wavesUI.core.Timeline(_pixelsPerSecond, _mainDOMEl.getBoundingClientRect().width);
	var _sharedCenteredZoomState = new wavesUI.states.CenteredZoomState(_sharedTimeline);
	

	var _waveformTrack = new AnnotatorTrackUI(_boardId + "-" + _idCounter++, _sharedTimeline, _waveformTrackDiv, _height);

	_mainDOMEl.appendChild(_controlsDiv);
	_mainDOMEl.appendChild(_waveformTrackDiv);
	_mainDOMEl.appendChild(_tracksDiv);

	var that = this;
	var _beats;


	this._init_board_controls = function() {
		var _addTrackButton = document.createElement('button');
		_addTrackButton.innerHTML = 'Add Annotation Track';
		_addTrackButton.onclick = function(e) {
			that.add_annotation_track()
		}

		var _addAnnotationType = document.createElement('button');
		_addAnnotationType.innerHTML = 'Add Annotation Type';
		_addAnnotationType.onclick = function(e) {

		}

		var _addAnnotationsTrackType = document.createElement('button');
		_addAnnotationsTrackType.innerHTML = 'Add Annotations Track Type';
		_addAnnotationsTrackType.onclick = function(e) {

		}

		var _generalInfo = document.createElement('button');
		_generalInfo.innerHTML = "Change Annotations Board Info";
		_generalInfo.onclick = function(e) {

		}

		//TODO
		_controlsDiv.appendChild(_addTrackButton);
		_controlsDiv.appendChild(_addAnnotationType);
		_controlsDiv.appendChild(_addAnnotationsTrackType);
	}


	this.load_audio_buffer = function(audioBuffer) {
		_buffer = audioBuffer;
		_waveformTrack.set_audio_buffer(audioBuffer.getChannelData(0));
		_waveformTrack.toggle('waveform', true);
		for (var i in _tracks) 
			_tracks[i].set_audio_buffer(audioBuffer.getChannelData(0));

		_emit("loaded-audio-buffer");
	}

	this.load_beat_grid = function(beatData) {
		_beats = beatData; 
		_waveformTrack.set_beat_grid(beatData);
		for (var i in _tracks) 
			_tracks[i].set_beat_grid(beatData);
		_emit("loaded-beat-grid");
	}
	
	this.add_annotation_track = function(id) {

		var containerDiv = document.createElement('div');
		var trackDiv = document.createElement('div');
		var controlsDiv = document.createElement('div');
		var infoDiv = document.createElement('div');

		// TODO 

		var removeTrack = document.createElement('button');
		removeTrack.innerHTML = 'Remove Annotations Track';
		removeTrack.onclick = function(e) {
			// TODO
		}
		controlsDiv.appendChild(removeTrack);

		var showHideWaveform = document.createElement('button');
		showHideWaveform.innerHTML = 'Show/Hide Waveform';
		showHideWaveform.onclick = function(e) {
			// TODO
		}
		controlsDiv.appendChild(showHideWaveform);


		var _id = id || _boardId + "at-" + Math.random();
		var trackUI = new AnnotatorTrackUI(_id, _sharedTimeline, trackDiv, _height);
			trackUI.set_beat_grid(_beats);
		_tracks[_id] = trackUI;
		
		containerDiv.appendChild(infoDiv);
		containerDiv.appendChild(controlsDiv);
		containerDiv.appendChild(trackDiv);

		_mainDOMEl.appendChild(containerDiv);

	}

	this.add_annotations = function(trackId, newData, type) {

		// TODO
		
	}

	this.remove_track = function(trackId) {
		
		// TODO

	}

	this.destroy = function() {
		for (var i in _tracks) 
			_tracks[i].destroy();

	}

	this.set_current_time = function(newTime) {
		_waveformTrack.set_current_time(newTime);
		for (var i in _tracks) 
			_tracks[i].set_current_time(newTime);
	}


	this.toggle = function(type, value, trackId) {
		switch (type) {
			case 'snap-grid' : _toggle('snap-grid', value); break;
			case 'beat-grid' : _toggle('beat-grid', value); break;
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
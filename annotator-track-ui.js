function AnnotatorTrackUI(id, timeline, domEl, height) {

	var _id;

	var _waveformLayer;
	var _beatGridLayer;
	var _intervalsLayer;
	var _instantsLayer;
	var _timeCursorLayer;
	var _timeline = timeline || new wavesUI.core.Timeline(domEl.getBoundingClientRect().width / 10, domEl.getBoundingClientRect().width);
	var _timeContext = new wavesUI.core.LayerTimeContext(_timeline.timeContext);
	var _trackDOMEl = domEl;
	var _height = height || 100;
	var _track = new wavesUI.core.Track(_trackDOMEl, height);
	_timeline.add(_track);

	var _showWaveform = false;
	var _showBeatGrid = false;
	var _snapToGrid = false;
	var _follow = undefined;

	var DEFAULT_BEAT_GRID_COLOR = 'green';
	var DEFAULT_INSTANTS_COLOR = 'orange';
	var DEFAULT_INTERVALS_COLOR = 'cyan';
	var DEFAULT_TIME_CURSOR_COLOR = 'red';
	var DEFAULT_WAVEFORM_COLOR = 'steelblue';

	this._beatData = [];

	this.timeline = _timeline;

	var that = this;


	var _grid_callback = function(timeContext) {
		var data = [];

		if (_showBeatGrid) {
			var duration = timeContext.visibleDuration;
			var offset = -timeContext.offset;
			var minT = offset;
			var maxT = minT + duration;

			var idx = find_index(that._beatData, {t0: minT}, function(a,b) { return a.t0 - b.t0; });
			idx = idx[0];

			while (that._beatData[idx] && that._beatData[idx].t0 <= maxT) {
				if (that._beatData[idx].t0 >= minT) {
					data[data.length] = { time: that._beatData[idx].t0, focused: false };
				}
				idx++;
			}
		}

		return data;
	}


	var _update_layer = function(layer) {
		_timeline.tracks.render(layer);
		_timeline.tracks.update(layer);
	}

	var _random_color = function(alpha) {
		var R = ~~(Math.random() * 255);
		var G = ~~(Math.random() * 255);
		var B = ~~(Math.random() * 255);
		return 'rgba(' + [ R, G, B, alpha || 1 ] + ')';
	}

	var _init_grid_layer = function(timeline, layerHeight, timeContext) {
		// _beatGridLayer = new wavesUI.axis.AxisLayer(_grid_callback, {
		// 	height: layerHeight,
		// 	// top: timeAxisHeight
		// });

		// _beatGridLayer.setTimeContext(timeline.timeContext);
		// _beatGridLayer.configureShape(wavesUI.shapes.Ticks, {}, { color: DEFAULT_BEAT_GRID_COLOR });

		// _track.add(_beatGridLayer);



		_beatGridLayer = new wavesUI.core.Layer('collection', [], {
			height: layerHeight,
			displayHandlers: false
		});

		_beatGridLayer.setTimeContext(timeContext);
		_beatGridLayer.configureShape(wavesUI.shapes.Marker, {
			x: function(d, v) {
				if (v !== undefined) { d.t0 = v; }
				return d.t0;
			},
			color: function() {
				return DEFAULT_BEAT_GRID_COLOR;
			}
		});

		// _beatGridLayer.setBehavior(new wavesUI.behaviors.MarkerBehavior());

		_track.add(_beatGridLayer);

	}

	var _init_intervals_layer = function(timeline, layerHeight, timeContext) {

		_intervalsLayer = new wavesUI.core.Layer('collection', [], {
			height: layerHeight
		});

		_intervalsLayer.setTimeContext(timeContext);
		_intervalsLayer.configureShape(wavesUI.shapes.Segment, {
			x: function(d, v) {
				if (v !== undefined) { d.start = v; }
				return d.start;
			},
			width: function(d, v) {
				if (v !== undefined) { d.duration = v; }
				return d.duration;
			}, 
			color: function(d, v) {
				if (v !== undefined) { d.color = v; }
				return d.color || DEFAULT_INTERVALS_COLOR;
			},
			y: function(d, v) {
				if (v !== undefined) { d.y = v; }
				return d.y || 0;
			},
			height: function(d, v) {
				if (v !== undefined) { d.height = v; }
				return d.height || 1;
			},
		});

		_intervalsLayer.setBehavior(new wavesUI.behaviors.SegmentBehavior());
		
		_track.add(_intervalsLayer);

		_intervalsLayer.on('drag-start', function(layer, items){

		});

		_intervalsLayer.on('drag', function(layer, items){

		});

		_intervalsLayer.on('drag-end', function(layer, items){
			console.log('edited');
		});

		// timeline.state = new wavesUI.states.SimpleEditionState(timeline);
	}

	var _init_instants_layer = function(timeline, layerHeight, timeContext) {
		_instantsLayer = new wavesUI.core.Layer('collection', [], {
			height: height
		});

		_instantsLayer.setTimeContext(timeContext);
		_instantsLayer.configureShape(wavesUI.shapes.Marker, {
			x: function(d, v) {
				if (v !== undefined) { d.time = v; }
				return d.time;
			},
			color: function(d, v) {
				if (v !== undefined) { d.color = v; }
				return d.color || DEFAULT_INSTANTS_COLOR;
			}
		});

		_instantsLayer.setBehavior(new wavesUI.behaviors.MarkerBehavior());

		_track.add(_instantsLayer);

		// timeline.state = new wavesUI.states.SimpleEditionState(timeline);
	}

	var _init_waveform_layer = function(timeline, layerHeight, timeContext) {
		_waveformLayer = new wavesUI.core.Layer('entity', [], {
			height: layerHeight,
			yDomain: [-1, 1]
		});
		_waveformLayer.setTimeContext(timeContext);
		_waveformLayer.configureShape(wavesUI.shapes.Waveform, {
			y: function(d) { return d; },
		}, {
			color: DEFAULT_WAVEFORM_COLOR
		});
		_track.add(_waveformLayer);
	}

	var _init_time_cursor_layer = function(timeline, layerHeight, timeContext) {

		_timeCursorLayer = new wavesUI.core.Layer('entity', { currentPosition: 0 }, {
			height: layerHeight
		});

		_timeCursorLayer.setTimeContext(timeContext);
		_timeCursorLayer.configureShape(wavesUI.shapes.Cursor, {
			x: function(d) { return d.currentPosition; }
		}, {
			color: DEFAULT_TIME_CURSOR_COLOR
		});
		_track.add(_timeCursorLayer);
	}



	_init_waveform_layer(_timeline, _height, _timeContext);
	_init_instants_layer(_timeline, _height, _timeContext);
	_init_intervals_layer(_timeline, _height, _timeContext);
	_init_time_cursor_layer(_timeline, _height, _timeContext);
	_init_grid_layer(_timeline, _height, _timeContext);
	
	



	this.set_audio_buffer = function(floatArray) {
		_waveformLayer.__data = [floatArray];
		if (_showWaveform) {
			_waveformLayer.data[0] = floatArray;
		} else {
			_waveformLayer.data[0] = [];
		}
		_update_layer(_waveformLayer);
	}

	this.set_beat_grid = function(beatData) {
		this._beatData = new Array(beatData.length);
		for (var i in beatData) {
			this._beatData[i] = {t0: beatData[i]};
		}
		_beatGridLayer.data = this._beatData;
		_update_layer(_beatGridLayer);
	}

	this.set_current_time = function(newTime) {
		_timeCursorLayer.data[0].currentPosition = newTime;
		switch (_follow) {
			case 'center' : _followCenter(newTime, _timeCursorLayer); break;
			case 'edge-left': _followEdgeLeft(newTime, _timeCursorLayer); break;
			case 'edge-right': _followEdgeRight(newTime, _timeCursorLayer); break;
			default: _timeline.tracks.update();
		}
	}

	var _followCenter = function(newTime, _timeCursorLayer) {
		var timeContext = _timeline.timeContext;
		var candidateOffset = (-newTime + timeContext.visibleDuration / 2);
		timeContext.offset = Math.min(0, candidateOffset);
		timeContext._children.forEach(function(timeCtx, index) {
			timeCtx.duration = (-timeContext.offset) + timeContext.visibleDuration;
		});
		_timeline.tracks.update();
	}

	var _followEdgeRight = function(newTime, _timeCursorLayer) {
		// TODO
	}

	var _followEdgeLeft = function(newTime, _timeCursorLayer) {
		var timeContext = _timeline.timeContext;
		var candidateOffset = -newTime;
		timeContext.offset = Math.min(0, candidateOffset);
		timeContext._children.forEach(function(timeCtx, index) {
			timeCtx.duration = (-timeContext.offset) + timeContext.visibleDuration;
		});
		_timeline.tracks.update();
	}

	this.get_current_time = function() {
		return Math.max(0, _timeCursorLayer.data[0].currentPosition)
	}

	this.set_visible_time_interval = function(start, end) {
		var timeContext = _timeline.timeContext;
		timeContext.offset = -start;
		timeContext._children.forEach(function(timeCtx, index) {
			timeCtx.duration = -timeContext.offset + end;
		});
		_timeline.tracks.update();
	}







	function _resetBrush(track) {
		var $brush = track.$brush;
		// reset brush element
		$brush.setAttributeNS(null, 'transform', 'translate(0, 0)');
		$brush.setAttributeNS(null, 'width', 0);
		$brush.setAttributeNS(null, 'height', 0);
	}

	function _addBrush(track) {
		if (track.$brush) { 
			return; 
		}

		var brush = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
		brush.style.fill = '#686868';
		brush.style.opacity = 0.2;

		track.$interactions.appendChild(brush);
		track.$brush = brush;
	}

	function _removeBrush(track) {
		if (track.$brush === null) { return; }

		_resetBrush(track);
		track.$interactions.removeChild(track.$brush);
		delete track.$brush;
	}
	

	function _updateBrush(e, track) {
		var $brush = track.$brush;
		var translate = "translate(" + e.area.left + "," + 0 + ")";

		$brush.setAttributeNS(null, 'transform', translate);
		$brush.setAttributeNS(null, 'width', e.area.width);
		$brush.setAttributeNS(null, 'height', track.height);
	}


	this.clear_annotations = function() {
		_instantsLayer.data = [];
		_intervalsLayer.data = [];
		_update_layer();
	}


	
	this.set_interaction_mode = function(mode) {
		switch (mode) {
			case 'drag-view': 
				_timeline.state = new wavesUI.states.CenteredZoomState(_timeline);
				break;

			case 'selection':
				_timeline.state = new wavesUI.states.SimpleEditionState(_timeline);
				break;

			case 'edit':
				_timeline.state = new wavesUI.states.ProxyState(_timeline);

				_timeline.A = new DragInsertionInteractions(_trackDOMEl, _track, that);

				_timeline.state.on('mousedown', _timeline.A.onMouseDown);

				_timeline.state.on('mousedrag', _timeline.A.onMouseDrag);

				_timeline.state.on('mouseup', _timeline.A.onMouseUp);
		}
	}
	

	this.select = function() {
		// TODO
	}

	this.set = function(newData, type) {
		var layer;

		switch (type) {
			case 'intervals' : 
				layer = _intervalsLayer;
				break;
			case 'instants' : 
				layer = _instantsLayer;
				break;
		}

		layer.data = newData;

		_update_layer(layer);
	}


	this.add = function(newData, type) {
		var layer;

		switch (type) {
			case 'intervals' : 
				layer = _intervalsLayer;
				break;
			case 'instants' : 
				layer = _instantsLayer;
				break;
		}

		for (var i in newData) {
			layer.data[layer.data.length] = newData[i];
		};

		_update_layer(layer);
		
	}

	this.remove = function(removeCheckFn, type) {
		var layer;

		switch (type) {
			case 'intervals' : 
				layer = _intervalsLayer;
				break;
			case 'instants' : 
				layer = _instantsLayer;
				break;
		}

		var newData = [];

		for (var i in _instantsLayer.data) {
			if (!removeCheckFn(layer.data[i])) {
				newData[newData.length] = layer.data[i];
			}
		}

		layer.data = newData;

		_update_layer(layer);
	}



	/***************************************************************/
	/************************** TOGGLERS ***************************/
	/***************************************************************/

	this.toggle = function(type, value) {
		switch (type) {
			case 'snap-grid': _toggle_snap_to_grid(value); break;
			case 'beat-grid': _toggle_beat_grid(value); break;
			case 'waveform': _toggle_waveform(value); break;
			case 'follow-cursor' : _toggle_follow_time_cursor(value); break;
		}
	}

	var _toggle_snap_to_grid = function(snap) {
		_snapToGrid = snap;
		// TODO
	}

	var _toggle_follow_time_cursor = function(type) {
		switch (type) {
			case 'center': _follow = 'center'; break;
			case 'edge-left': _follow = 'edge-left'; break;
			case 'edge-right': _follow = 'edge-right'; break;
			case 'none': _follow = undefined; break;
		}
	}

	var _toggle_beat_grid = function(show) {
		_showBeatGrid = show;
		_update_layer(_beatGridLayer);
	}

	var _toggle_waveform = function(show) {
		_showWaveform = show;
		if (_showWaveform) {
			_waveformLayer._data = _waveformLayer.__data;
		} else {
			_waveformLayer.data = [];
		}
		_update_layer(_waveformLayer);
	}

	this.get_layer = function(type) {
		if (type == 'intervals') {
			return _intervalsLayer;
		} else if (type == 'instants') {
			return _instantsLayer;
		}
	}

	

	/***************************************************************/
	/******************* BINARY SEARCH FUNCTIONS *******************/
	/***************************************************************/
	function find_index(values, target, compareFn) {
		if (values.length == 0 || compareFn(target, values[0]) < 0) { 
			return [0]; 
		}
		if (compareFn(target, values[values.length-1]) > 0 ) {
			return [values.length-1];
		}
		return modified_binary_search(values, 0, values.length - 1, target, compareFn);
	}

	function modified_binary_search(values, start, end, target, compareFn) {
		// if the target is bigger than the last of the provided values.
		if (start > end) { return [end]; } 

		var middle = Math.floor((start + end) / 2);
		var middleValue = values[middle];

		if (compareFn(middleValue, target) < 0 && values[middle+1] && compareFn(values[middle+1], target) > 0)
			// if the target is in between the two halfs.
			return [middle, middle+1];
		else if (compareFn(middleValue, target) > 0)
			return modified_binary_search(values, start, middle-1, target, compareFn); 
		else if (compareFn(middleValue, target) < 0)
			return modified_binary_search(values, middle+1, end, target, compareFn); 
		else 
			return [middle]; //found!
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


	/***************************************************************/
	/********************** ASPECTS HANDLING ***********************/
	/***************************************************************/
	var _run_aspect = function(aspectId, data) {
		for (var ci in _aspects[aspectId]) {
			if (_aspects[aspectId](data) == false) 
				return false;
		}
		return true;
	}

	var add_aspect_watcher = function(aspectId, callBack) {
		// TODO
	}

	var remove_aspect_watcher = function(aspectId, callBack) {
		// TODO
	}




	/***************************************************************/
	/********************** AUXILIARY CLASSES **********************/
	/***************************************************************/
	function DragInsertionInteractions(trackDOMEl, track, trackUI) {

		var START = undefined;
		var END = undefined;
		var B0 = undefined;
		var B1 = undefined;
		var _trackDOMEl = trackDOMEl;
		var _trackUI = trackUI;
		var _track = track;

		this.reset = function() {
			START = undefined;
			END = undefined;
			B0 = undefined;
			B1 = undefined;
		}
	
		this.onMouseDown = function(time, e) {

			var idx = find_index(trackUI._beatData, {t0: time}, function(a,b) { return a.t0 - b.t0; });
			START = trackUI._beatData[idx[0]].t0;
			END = trackUI._beatData[idx[1]].t0;
			B0 = idx[0];
			B1 = idx[1];
			_addBrush(_track);
		}

		this.onMouseDrag = function(time, e) {

			var idx = find_index(trackUI._beatData, {t0: time}, function(a,b) { return a.t0 - b.t0; });

			e.area.left = _timeline.timeContext.timeToPixel(START + _timeline.timeContext.offset);
			e.area.width = _timeline.timeContext.timeToPixel(trackUI._beatData[idx[1]].t0 - START );
			
			if (e.area.width > 0 && trackUI._beatData[idx[1]].t0 > START) {
				END = trackUI._beatData[idx[1]].t0;
				B1 = idx[1];
				_updateBrush(e, _track);
			}
		}

		this.onMouseUp = function(time, e) {

			_resetBrush(_track);
			_removeBrush(_track);

			that.add([{ start: START, duration: END - START, b0: B0, b1: B1}], 'intervals');

			START = END = undefined;
		}

	}

}
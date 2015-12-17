function Form(fields) {

	var _emit;

	var _dialog = document.createElement('DIALOG');
	var _cancelBtn = document.createElement('button');
		_cancelBtn.innerHTML = 'Cancel';
		_cancelBtn.onclick = function(e) {
			_emit('cancel', _dialog);
		}
	var _submitBtn = document.createElement('button');
		_submitBtn.innerHTML = 'Submit';
		_submitBtn.onclick = function(e) {
			_emit('submit', _dialog);
		}
	var _fieldsDiv = document.createElement('div');

	_dialog.appendChild(_fieldsDiv);
	_dialog.appendChild(_submitBtn);
	_dialog.appendChild(_cancelBtn);

	for (var i in fields) {
		var field = fields[i];
		var fLabel = field.label;
		var fValue = field.value;
		var fId = field.id;
		var disabled = field.disabled;

		var n = Math.random();
		var id = ('field-'+n).replace(/(\.|\,)/gi, '');
		var labelEl = document.createElement('label');
			labelEl.innerHTML = fLabel;
			labelEl.for = id;
		var inputEl = document.createElement('input');
			inputEl.value = fValue;
			inputEl.id  = id;
			inputEl.name = fId;
			inputEl.disabled = disabled;
		var spanEl = document.createElement('p');
		spanEl.appendChild(labelEl);
		spanEl.appendChild(inputEl);
		_fieldsDiv.appendChild(spanEl);
	}

	document.body.appendChild(_dialog);



	this.open = function() {
		_dialog.show();
		_emit("open", _dialog);
	}

	this.close = function() {
		_dialog.close();
		_emit("close", _dialog);
	}

	this.get_values = function() {
		var els = _fieldsDiv.childNodes;
		var values = {};
		for (var i=0; i<els.length; i++) {
			var input = els[i].getElementsByTagName('input')[0];
			if (input)
				values[input.name] = input.value;
		}
		return values;
	}

	/***************************************************************/
	/*********************** EVENTS HANDLING ***********************/
	/***************************************************************/
	var _callbacks =  {
		"cancel": {}, 
		"submit": {},
		"close": {},
		"open": {}
	};
	var _idCounter = 0;

	var eventsToEmit = [];
	var eventsToEmitPointer = 0;

	function _push_event_to_emit(type, data) {
		if (_callbacks[type] != {}) {
			eventsToEmit[eventsToEmitPointer++] = { type: type, data: data };
		}
	}

	function _emit_all_events() {
		var m = eventsToEmitPointer;
		for (var i=0; i<m; i++, eventsToEmitPointer--) 
			_emit(eventsToEmit[i].type, eventsToEmit[i].data);
	}

	_emit = function(eventType, data) {
		for (var ci in _callbacks[eventType]) 
			_callbacks[eventType][ci](data);
	}

	this.add_event_listener = function(observerID, eventType, callback) {

		// if (!eventType || _callbacks[eventType]==undefined) 
		// 	throw "Unsupported event type";

		if (observerID!=undefined && _callbacks[eventType][observerID]!=undefined) 
			throw "Illegal modification of callback";

		var __id = (observerID==undefined)? _id + "-associate-" + (_idCounter++) : observerID;
		_callbacks[eventType][__id] = callback;
		return __id;
	}

	this.remove_event_listener = function(observerID, eventType) {

		// if (!eventType || _callbacks[eventType]==undefined) 
		// 	throw "Unsupported event type";

		delete _callbacks[eventType][observerID];
	}
	
}
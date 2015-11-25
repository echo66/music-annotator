function AnnotationTrackManagementInteractions(proxyState, trackUi) {

	/* 
	 *	INTERAÇÕES POSSÍVEIS:
	 *		[ ] Selecção de uma (ou mais) anotação.
	 *		[ ] Drag de uma anotação.
	 *		[ ] Double click numa anotação.
	 *		[ ] Remoção de uma, ou mais, anotações.
	 *		[X] Inserção de uma anotação por drag.
	 *		[ ] Drag da timeline.
	 */

	function remove_selected_items(layer) {
		var selectedItems = layer.selectedItems
		var data = layer.data;
		for (var i in selectedItems) {
			var item = selectedItems[i];
			var datum = layer.getDatumFromItem(item);
			var index = data.findIndex(function(a) { return a == datum; });
			data.splice(index, 1);
		}

		layer.data = [];
		_update_layer(layer);

		layer.data = data;
		_update_layer(layer);
	}

	proxyState.on('dblclick', function(time, e) {
		// PASSOS:
		// 1) Verificar qual foi a AnnotationTrackUI onde se clicou.
		// 2) Verificar se clicou em alguma anotação.
		// 3) Se clicou, emite um evento na AnnotationTrackUI correspondente.
	});
	
	proxyState.on('mousedown', function(time, e) {
		// INTERAÇÕES POSSÍVEIS:
		// 1) Toca no vazio, sem o shift activado, deseleccionando tudo.
		// 2) Toca numa anotação

	});

	proxyState.on('mousedrag', function(time, e) {

	});

	proxyState.on('mouseup', function(time, e) {

	});

	proxyState.on('keydown', function(e) {
		var _instantsLayer = 
		if (e.keyCode == 46) { // DELETE
			for (var i in _tracksUis) {
				remove_selected_items(_tracksUis[i].get_layer('intervals'));
				remove_selected_items(_tracksUis[i].get_layer('instants'));
			}
		} else if (e.keyCode == 65 && e.ctrlKey) { // Ctrl + A
			_tracksUis[i].get_layer('intervals').select(_instantsLayer.items);
			_tracksUis[i].get_layer('intervals').select(_intervalsLayer.items);
			for (var i in _tracksUis) {

			}
		}
	});

	/***************************************************************/
	/********************** BRUSH FUNCTIONS ************************/
	/***************************************************************/

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

}
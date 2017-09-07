
var map = L.map('map', {
	center:[62.3087, -5.9765],
	zoom:3,
	minZoom:3,
	boxZoom: false,
	trackResize:true,
	//dragging: false,
	keyboard: false,
	scrollWheelZoom:false,
	//doubleClickZoom:false,
	attributionControl: false,
	zoomControl: false,
}).fitWorld();


var stats = L.featureGroup().addTo(map);

var host = 'https://demo.keplerjs.io';
//var host = 'http://climbo.local';

$.when(
	$.getJSON('https://unpkg.com/geojson-resources@1.1.0/world.json'),
	$.ajax({
		url: host+'/stats/places',
	    jsonp: 'jsonp', dataType: 'jsonp',
	    timeout: 1000
	}),
	$.ajax({
		url: host+'/stats/users',
	    jsonp: 'jsonp', dataType: 'jsonp',
	    timeout: 1000
	})	
)
.then(function(ret0, ret1, ret2) {
	var base = ret0[0],
		places = ret1[0],
		users = ret2[0],
		$places = $('.stats .places')
		$users = $('.stats .users');

	$places.html('<big>'+(places && places.stats && places.stats.count)+'</big> places');
	$users.html('<big>'+(users && users.stats && users.stats.count)+'</big> users');

	L.geoJSON(base, {
		style: {
			weight:1,
			fillColor:'#9c0',
			opacity:0.3,
			fillOpacity:0.1,
			color:'#9c0'
		}
	}).addTo(map);

	var i = 0;
	var bbplaces = L.latLngBounds();
	var lplaces = L.geoJSON(places.geojson, {
		pointToLayer: function(point, loc) {
			var r = point.properties.rank;
			r = Math.min(r, 15);
			r = Math.max(r, 5);

			if(r>5)
				bbplaces.extend(loc);
			//TODO calc bbox server side

			if(++i==1) {	//the latest created
				return L.marker(loc, {
					icon: L.icon.pulse({
						heartbeat: 2,
						iconSize: [8,8],
						color:'#257'
					})
				})
			}
			else
				return L.circleMarker(loc, {radius: r })
		},
		style: {
			weight:0,
			fillOpacity:0.5,
			fillColor:'#257',
			color:'#257'
		}
	});

	//users 
	users.geojson.features = users.geojson.features.filter(function(f) {
		return f.geometry.coordinates.length;
	});

	var i = 0;
	var bbusers = L.latLngBounds();
	var lusers = L.geoJSON(users.geojson, {
		pointToLayer: function(point, loc) {
			var r = point.properties.rank;
			r = Math.min(r, 3);
			r = Math.max(r, 2);
			
			if(r>2)
				bbusers.extend(loc);
			//TODO calc bbox server side
			
			if(++i==1) {	//the latest created
				return L.marker(loc, {
					icon: L.icon.pulse({
						heartbeat: 2,
						iconSize: [8, 8],
						color:'#f72'
					})
				})
			}
			else
				return L.circleMarker(loc, {radius: r })		
		},
		style: {
			weight:0,
			fillOpacity:1,
			fillColor:'#f72',
			color:'#f72'
		}
	});

	function getPadding(anim) {
		var sOffset = $('.stats').offset();
		return {
			animate:anim,
			paddingTopLeft: L.point(-(sOffset.left/6),300+sOffset.top/2),
			paddingBottomRight: L.point(200,0)
		}
	}

	function fitStats() {
		stats.removeLayer(lusers);
		stats.removeLayer(lplaces);		
		stats.addLayer(lplaces);
		stats.addLayer(lusers);

		//var bb = stats.getBounds();
		//var bb = L.latLngBounds().extend(bbplaces).extend(bbusers);
		var bb = L.latLngBounds()
			.extend(lplaces.getBounds())
			.extend(lusers.getBounds());

		map.fitBounds(bb, getPadding(false) );

		var c = bb.getCenter(),
			z = map.getBoundsZoom(bb);
		//map.setView(c, z+1, getPadding() );
		//map.setZoom(z)
		map.zoomIn(1,{animate:false});
	}

	fitStats();

	$places.on('click', function(e) {
		stats.removeLayer(lusers);
		stats.removeLayer(lplaces);
		map.once('zoomend moveend', function(e) {
			stats.addLayer(lplaces);
		});
		map.flyToBounds(bbplaces, getPadding());
	});
	$users.on('click', function(e) {
		
		stats.removeLayer(lusers);
		stats.removeLayer(lplaces);
		map.once('zoomend moveend', function(e) {
			stats.addLayer(lusers);
		});		
		map.flyToBounds(bbusers, getPadding());
	});
	$('article').on('click', function() {
		fitStats();
	})
	//$('article').on('dblclick', function(e) { map.zoomIn() })
	//*/
});

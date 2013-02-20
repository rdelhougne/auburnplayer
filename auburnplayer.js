(function($) {
	$.fn.player = function(settings) {
		var config = {
			DefaultVolume: 0.8,
			SimultaneousPlayback: false,
			MediaTimeout: 0,
			Playlist: true,
			LoopPlaylist: true,
			UseBufferBar: true,
			TitleAboveContainer: false,
			ShowLoopButton: true,
			DisplayTime: 'time',
			AllowTimeChange: true
		};

		if (settings) {
			$.extend(config, settings);
		}

		this.each(function() {
			$(this).wrap('<div class="auburn-container">').after('<div class="button auburn-play-control"></div><div class="progressbar-background"><div class="progressbar"></div></div><div class="time"></div><div class="volume_div"></div>');

			var auburnplayer = $(this).get(0);
			var button = $(this).parent().find('.button');
			var progressbarbg = $(this).parent().find('.progressbar-background');
			var progressbar = $(this).parent().find('.progressbar');
			var time = $(this).parent().find('.time');
			var buttonheight = $(this).parent().find('.button').css('height').replace('px','') * 1;
			var barheight = $(this).parent().find('.progressbar-background').css('height').replace('px','') * 1;
			auburnplayer.volume = config.DefaultVolume;
			var length = progressbarbg.css('width').replace('px','') * 1;
			var duration;
			var dur_minutes;
			var dur_seconds;
			var minutes;
			var seconds;
			var rem;
			var rem_minutes;
			var rem_seconds;
			
			

			
			var volume_div = $(this).parent().find('.volume_div');
			
			volume_div.on('mousewheel', function(evt) {
			evt.preventDefault();
			fn_volchange(evt.originalEvent.wheelDelta);
			});
			
			volume_div.on('DOMMouseScroll', function(evt) {
			evt.preventDefault();
			det = evt.originalEvent.detail;
			det = det * -1;
			fn_volchange(det);
			});
			
			function fn_volchange(rate) {
			if ((rate >= 0) && (auburnplayer.volume <= 0.95)) {
				var vol = auburnplayer.volume;
				vol = vol + 0.05;
				vol = vol.toFixed(2); 
				auburnplayer.volume = vol;
			}
			else if ((rate <= 0) && (auburnplayer.volume >= 0.05)) {
				var vol = auburnplayer.volume;
				vol = vol - 0.05;
				vol = vol.toFixed(2);
				auburnplayer.volume = vol;
			}
			}
			
			
			
			

			if (config.UseBufferBar) {
				progressbar.wrap('<div class="bufferbar">');
				var bufferbar = $(this).parent().find('.bufferbar');
			}

			if (config.ShowLoopButton) {
				time.after('<div class="loopbutton"></div>');
				var loopbutton = $(this).parent().find('.loopbutton');
				loopbutton.addClass('loopbuttonno');
				loopbutton.click(function() {
					if (auburnplayer.loop) {
						auburnplayer.loop = false;
						loopbutton.addClass('loopbuttonno').removeClass('loopbuttonyes');
					} else {
						auburnplayer.loop = true;
						loopbutton.addClass('loopbuttonyes').removeClass('loopbuttonno');
					}
				});
			}

			if (($(this).attr('naming')) && (!config.TitleAboveContainer)) {
				$(this).after('<div class="namespace">' + $(this).attr('naming') + '</div>');
			} else if (($(this).attr('naming')) && (config.TitleAboveContainer)) {
				$(this).parent().before('<div class="namespace">' + $(this).attr('naming') + '</div>');
			}

			button.click(function() {
				if (auburnplayer.paused) {
					if ($('.playingaudio').length && !config.SimultaneousPlayback) {
						$('.playingaudio').trigger('click');
						setTimeout(function(){
							auburnplayer.play();
						},config.MediaTimeout);
					} else {
						auburnplayer.play();
					}
					$(this).addClass('auburn-stop-control').removeClass('auburn-play-control').addClass('playingaudio');
				} else {
					auburnplayer.pause();
					if ($('.lastplayed').length) {
						$('.lastplayed').removeClass('lastplayed');
					}
					$(this).addClass('auburn-play-control').removeClass('auburn-stop-control').removeClass('playingaudio').addClass('lastplayed');
				}
			});

			progressbarbg.click(function(e) {
				if (duration != 0) {
					left = $(this).offset().left;
					offset = e.pageX - left;
					percent = offset / progressbarbg.width();
					duration_seek = percent * duration;
					auburnplayer.currentTime = duration_seek;
				}
			});
			
			function fn_remaining() {
				rem = duration - auburnplayer.currentTime;
				rem_minutes = Math.floor(rem / 60);
				rem_seconds = Math.floor(rem) - rem_minutes * 60;
				time.text("- " + (rem_minutes<10?"0":"") + rem_minutes + ':' + (rem_seconds<10?"0":"") + rem_seconds);
			}
			
			function fn_time() {
				minutes = Math.floor(auburnplayer.currentTime / 60);
				seconds = Math.floor(auburnplayer.currentTime) - minutes * 60;
				time.text((minutes<10?"0":"") + minutes + ':' + (seconds<10?"0":"") + seconds);
			}

			function fn_timeduration() {
				minutes = Math.floor(auburnplayer.currentTime / 60);
				seconds = Math.floor(auburnplayer.currentTime) - minutes * 60;
				time.text((minutes<10?"0":"") + minutes + ':' + (seconds<10?"0":"") + seconds + ' / ' + (dur_minutes<10?"0":"") + dur_minutes + ':' + (dur_seconds<10?"0":"") + dur_seconds);
			}

			time.click(function() {
				if (config.AllowTimeChange) {
					switch (config.DisplayTime) {
						case "time":
							config.DisplayTime = 'remaining';
							fn_remaining();
						break;
						case "remaining":
							config.DisplayTime = 'time/duration';
							fn_timeduration();
						break;
						case "time/duration":
							config.DisplayTime = 'time';
							fn_time();
						break;
					}
				}
			});

			$(this).on('ended', function() {
				button.addClass('auburn-play-control').removeClass('auburn-stop-control').removeClass('playingaudio');
				progressbar.css('width', '0px');
				if ((config.Playlist) && ($(this).attr('pl') != 'undefined') && ($(this).attr('pl') != '') && (auburnplayer.loop == false)) {
					var current = $(this).attr('pl') * 1;
					current++;
					if ($('[pl="' + current + '"]').length == 1) {
						$(document).find('[pl="' + current + '"]').get(0).play();
						$(document).find('[pl="' + current + '"]').parent().find('.button').addClass('auburn-stop-control').removeClass('auburn-play-control').addClass('playingaudio');
					} else if (($('[pl="' + current + '"]').length == 0) && (config.LoopPlaylist)) {
						$(document).find('[pl="1"]').get(0).play();
						$(document).find('[pl="1"]').parent().find('.button').addClass('auburn-stop-control').removeClass('auburn-play-control').addClass('playingaudio');
					}
				}
			});
			
			$(this).on('loadedmetadata', function() {
				duration = this.duration;
				dur_minutes = Math.floor(this.duration / 60);
				dur_seconds = Math.floor(this.duration) - dur_minutes * 60;
				switch (config.DisplayTime) {
					case "none":
						time.css('display', 'none');
					break;
					case "time":
						fn_time();
					break;
					case "remaining":
						fn_remaining();
					break;
					case "time/duration":
						fn_timeduration();
					break;
				}
			});
			
			$(this).on('progress', function() {
					bufferbar.css('width', (this.buffered.end(0) / duration) * length + 'px');
					if (this.buffered.end(0) == duration)
						bufferbar.removeClass('bufferbar').addClass('bufferbar_finished');
			});

			$(this).on('timeupdate', function() {
				switch (config.DisplayTime) {
					case "time":
						fn_time();
					break;
					case "remaining":
						fn_remaining();
					break;
					case "time/duration":
						fn_timeduration();
					break;
				}
				progressbar.css('width', (this.currentTime / duration) * length + 'px');
			});
		});

		$(document).keypress(function(key) {
				if (key.which == 32) {
				if (($('.playingaudio').length == 0) && ($('.lastplayed').length)) {
						$('.lastplayed').parent().find('.auburn').get(0).play();
						$('.lastplayed').addClass('auburn-stop-control').removeClass('auburn-play-control').addClass('playingaudio');
					} else if ($('.playingaudio').length == 1) {
						$('.playingaudio').parent().find('.auburn').get(0).pause();
						if ($('.lastplayed').length) {
							$('.lastplayed').removeClass('lastplayed');
						}
						$('.playingaudio').addClass('auburn-play-control').removeClass('auburn-stop-control').removeClass('playingaudio').addClass('lastplayed');
					}
				}
			});
		return this;
	};
})(jQuery);

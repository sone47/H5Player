document.addEventListener('DOMContentLoaded', function() {
			
	var player = $('player'),
		video = $('video'),
		videoWrap = $('video-wrap'),
		progress = $('progress'),
		progressWrap = $('progress-wrap'),
		progressTime = $('progress-time'),
		progressBuffer = $('progress-buffer'),
		loading = $('loading'),
		play = $('play'),
		current = getClass('current')[0],
		duration = getClass('duration')[0],
		control = $('control'),
		soundWrap = getClass('sound-wrap')[0],
		sound = getClass('sound')[0],
		soundControl = getClass('soundControl')[0],
		soundNum = getClass('soundNum')[0],
		soundNumProgress = getClass('soundNumProgress')[0],
		rateWrap = getClass('rate-wrap')[0],
		rate = getClass('rate')[0],
		rateControl = getClass('rateControl')[0],
		selectRate = getClass('selectRate')[0],
		fullScreen = getClass('fullScreen')[0],
		contextMenu = $('contextMenu'),
		closeContextMenu = getClass('close', contextMenu);

	loading.style.display = 'block';

	//当元数据准备好时启动
	video.addEventListener('loadedmetadata', function() {
		video.width = 860;
		video.style.visibility = 'visible';
		video.style.marginTop = (videoWrap.clientHeight - video.clientHeight)/2 + 'px';

		soundControl.style.display = 'block';
		soundNumProgress.style.height = video.volume * soundNum.clientHeight + 'px';
		soundControl.style.display = 'none';

		duration.innerHTML = checkTime(Math.floor(video.duration/60) + ':' + Math.floor(video.duration%60));

		loading.style.display = '';

		//开始、暂停
		play.onclick = function(e) {
			e.stopPropagation();

			if(video.paused) {
				playVideo();
			} else {
				pauseVideo();
			}
		};
		player.onclick = function(e) {
			e.stopPropagation();
			if(e.target.id === 'video-wrap' || e.target.id === 'video') {
				playVideo();
			}
			contextMenu.style.display = 'none';
		};

		//当点击网页其他地方的时候空格暂停失效
		document.onclick = function() {
			document.onkeydown = null;
		};

		//进度条
		progressWrap.onmouseenter = function(e) {
			var time = e.offsetX/progressWrap.clientWidth * video.duration;
			progressTime.style.display = 'block';

			progressTime.style.left = e.offsetX + 'px';
			progressTime.innerHTML = checkTime( Math.floor(time/60) + ':' + Math.floor(time%60) );

			this.onmousemove = function(e) {
				var time = e.offsetX/progressWrap.clientWidth * video.duration;

				progressTime.style.left = e.offsetX + 'px';
				progressTime.innerHTML = checkTime( Math.floor(time/60) + ':' + Math.floor(time%60) );
			}
		};
		progressWrap.onmouseleave = function() {
			progressTime.style.display = 'none';
			this.onmousemove = null;
		};
		progressWrap.onclick = function(e) {
			e.stopPropagation();

			progress.style.width = e.offsetX + 'px';
			video.currentTime = e.offsetX/progressWrap.clientWidth * video.duration;
					
			playVideo();
		};
		//缓冲数据
		video.buffer = setInterval(function(){
			var buf = video.buffered;
			progressBuffer.style.width = buf.end(buf.length - 1)/video.duration * progressWrap.clientWidth + 'px';
		},300);

		//音量
		sound.onclick = function(e) {
			e.stopPropagation();

			if(video.muted) {
				video.muted = false;
			} else {
				video.muted = true;
			}
		};
		soundWrap.onmouseenter = function() {
			soundControl.style.display = 'block';
			if(video.muted) {
				soundNumProgress.style.height = 0;
			} else {
				soundNumProgress.style.height = soundNum.clientHeight * video.volume + 'px';
			}
			soundNum.onclick = function(e) {
				e.stopPropagation();

				var height = e.target.clientHeight - e.offsetY;
				video.muted = false;
				soundNumProgress.style.height = height + 'px';
				video.volume = height/soundNum.clientHeight;
				
			};
		};
		soundWrap.onmouseleave = function() {
			soundControl.style.display = 'none';
			soundNum.onclick = null;
		};
		video.addEventListener('volumechange', function() {
			soundNumProgress.style.height = soundNum.clientHeight * video.volume + 'px';

			if(video.volume === 0 || video.muted) {
				sound.style.background = 'url("images/muted.png")';
				soundNumProgress.style.height = 0;
			} else {
				sound.style.background = 'url("images/sound.png")';
			}
		});

		//速度
		selectRate.onclick = function(e) {
			e.stopPropagation();
			var rateNum = e.target.innerHTML;

			video.playbackRate = rateNum;
			rate.innerHTML = rateNum;

		};	

		//全屏
		fullScreen.onclick = function() {
			clearInterval(fullScreen.timer);

			if(fullScreen.isFullScreen) {
				exitFullScreen();
			} else {
				toFullScreen();
			}
		};
		video.ondblclick = function(e) {
			e.stopPropagation();
			fullScreen.onclick();
		};
	    
	});

	//播放的时候事件和进度条变化
	video.addEventListener('timeupdate', function() {
		current.innerHTML = checkTime(Math.floor(video.currentTime/60) + ':' + Math.floor(video.currentTime%60));
		progress.style.width = (video.currentTime/video.duration) * progressWrap.clientWidth + 'px';
		progressBuffer.style.width = (video.buffered.end(video.buffered.length - 1)/video.duration) * progressWrap.clientWidth + 'px';
	});

	//播放完毕时，要让播放按钮变成待播放
	video.addEventListener('ended', function() {
		pauseVideo();
		
		//缓冲完毕
		if(video.readyState === 4) {
			clearInterval(video.buffer);
			delete video.buffer;
		}
	});

	//等待缓冲时显示等待gif
	video.addEventListener('waiting', function() {
		loading.style.display = 'block';
	});
	video.addEventListener('playing', function() {
		loading.style.display = '';
	});

	//右键自定义
	videoWrap.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		e.stopPropagation();

		contextMenu.style.display = 'block';
		contextMenu.style.left = e.clientX + 'px';
		contextMenu.style.top = e.clientY + 'px';

		contextMenu.onclick = function(e) {
			e.stopPropagation();
			contextMenu.style.display = 'none';
		};
	});
	//当鼠标在网页其他地方按下时，contextmenu消失
	document.addEventListener('contextmenu', function() {
		contextMenu.style.display = 'none';
	});

	//开始播放
	function playVideo() {
		video.play();
		play.className = 'pause';

		videoWrap.onclick = function(e) {
			e.stopPropagation();
			pauseVideo();
		};
		document.onkeydown = function(e) {
			switch(e.keyCode) {
				case 32:
					pauseVideo();
					break;
				case 37: // 快退
					playBack();
					break;
				case 39: // 快退
					playForward();
					break;
				case 38: // 音量放大
					volUp();
					break;
				case 40: // 音量减小
					volDown();
			}
		};
	}
	//暂停播放
	function pauseVideo() {
		video.pause();
		play.className = 'play';

		videoWrap.onclick = function() {
			playVideo();
		};
		document.onkeydown = function(e) {
			switch(e.keyCode) {
				case 32:
					playVideo();
					break;
				case 37: // 快退
					playBack();
					break;
				case 39: // 快退
					playForward();
					break;
				case 38: // 音量放大
					volUp();
					break;
				case 40: // 音量减小
					volDown();
			}
		};
	}
	//快进
	function playForward() {
		var time = video.duration * 0.01;
		video.currentTime += (time > 5 ? time : 5);
	}
	//快退
	function playBack() {
		var time = video.duration * 0.01;
		video.currentTime -= (time > 5 ? time : 5);
	}
	// 音量放大
	function volUp() {
		video.muted = false;
		if(video.volume <= 0.9) {
			video.volume += 0.1;
		} else {
			video.volume = 1;
		}
	}
	// 音量减小
	function volDown() {
		if(video.volume >= 0.1) {
			video.volume -= 0.1;
		} else {
			video.volume = 0;
		}
	}

	//退出全屏
	function exitFullScreen() {

		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}

		clearInterval(fullScreen.timer);

		player.style.width = '';
		player.style.height = '';
		player.style.margin = '';
		video.width = 860;
		videoWrap.style.width = '';
		videoWrap.style.height = '';
		video.style.marginTop = (videoWrap.clientHeight - video.clientHeight)/2 + 'px';

		control.className = '';
		control.style.width = '';

		progressWrap.style.height = '';
		progressBuffer.style.height = '';
		progress.style.height = '';
		progress.style.width = (video.currentTime/video.duration) * progressWrap.clientWidth + 'px';

		fullScreen.style.background = '';

		player.onmousemove = null;
	};
	//进入全屏
	function fullScreenChange() {
	    requestPointerLock(player);

	    if(fullScreen.isFullScreen) {
			exitFullScreen();
			exitPointerLock()
			fullScreen.isFullScreen = false;
		} else {
			fullScreen.isFullScreen = true;
		}
	}
	document.addEventListener('fullscreenchange', fullScreenChange, false);
	document.addEventListener('mozfullscreenchange', fullScreenChange, false);
	document.addEventListener('webkitfullscreenchange', fullScreenChange, false);

	function toFullScreen() {

		var width = window.screen.width,
			height = window.screen.height;
			
		if(player.requestFullScreen) {
			player.requestFullScreen();
		} else if( player.webkitRequestFullScreen ) {
			player.webkitRequestFullScreen();
		} else if(player.mozRequestFullScreen) {
			player.mozRequestFullScreen();
		}

		player.style.width = width + 'px';
		player.style.height = height + 'px';
		player.style.margin = 0;
		video.width = width;
		videoWrap.style.width = width + 'px';
		videoWrap.style.height = height + 'px';
		video.style.marginTop = (videoWrap.clientHeight - video.clientHeight)/2 + 'px';

		control.className = 'fullScreenControl';
		control.style.width = width + 'px';

		progress.style.width = (video.currentTime/video.duration) * progressWrap.clientWidth + 'px';
		progressBuffer.style.width = (video.buffered.end(video.buffered.length - 1)/video.duration) * progressWrap.clientWidth + 'px';
		controlAnimation();

		fullScreen.style.background = 'url("images/exitFullScreen.png")';

		player.onmousemove = function(e) {
			e.stopPropagation();

			clearInterval(fullScreen.timer);
			control.style.height = 40 + 'px';
			progressWrap.style.height = '8px';
			progressBuffer.style.height = '8px';
			progress.style.height = '8px';
			exitPointerLock();

			fullScreen.timer = setInterval(controlAnimation, 2000);
		}
	}

	function controlAnimation() {
		control.style.height = '';
		progressWrap.style.height = '3px';
		progressBuffer.style.height = '3px';
		progress.style.height = '3px';
		requestPointerLock(player);
	}

	function requestPointerLock(ele) {
		ele.requestPointerLock = ele.requestPointerLock || 
	                             ele.mozRequestPointerLock || 
	                             ele.webkitRequestPointerLock;
	    ele.requestPointerLock();
	}
	function exitPointerLock() {
		document.exitPointerLock = document.exitPointerLock || 
								document.mozExitPointerLock || 
	                          	document.webkitExitPointerLock;
	    document.exitPointerLock();
	}

});

//检查时间
function checkTime(t) {
	var ts = t.split(':');
	for(var i = 0;i < ts.length; i++) {
		if(ts[i] < 10) {
			ts[i] = '0' + ts[i];
		}
	}
			
	return ts.join(':');
}

//获取id、class
function $(id) {
	return document.getElementById(id);
}
function getClass(cls, parent) {
	parent = parent || document;
	return parent.getElementsByClassName(cls);
}
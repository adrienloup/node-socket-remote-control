(function($, window, undefined) {

	var socket = io.connect('http://{myIP}:8080')
		,random = Math.floor(1000 + Math.random() * 9000)
		,ignore = false
		,key = ''
		,client = 0

	var body = $('body')
		,scrolling = false
		,currentPanel = 1
		,previousPanel = 0

	$(document).on('click', '.arrow', onClick)
	$(document).on('mouseenter', '#control', onMouseenter)
	$(document).on('mouseleave', '#control__text', onMouseleave)
	$(window).on('load', onLoad)

	body.on('click', '#nav a.nav__item', function(e) {
		e.preventDefault()
		let path = $(this).attr('href')
		if (path != window.location) {
			window.history.pushState({path: path}, '', path)
			loadPageContent(path)
		}
	})

	body.on('click', '#live-the-experience', function() {
		$('#control__value').text(random)
		$('#control__text').toggleClass('step-1 step-2')
		if (!body.hasClass('is-granted')) {
			socket.emit('load', {room: random})
		}
	})

	socket.on('access', function(data) {

		if (data.access === 'granted') {

			socket.emit('message', { connect: '0' })

			socket.on('messageSuccess', function(data) {
				body.addClass('is-granted is-started')
				setTimeout(function() {
					body.removeClass('is-started')
				},2000)
			})

			ignore = false

			socket.on('navigate', function(data) {
				ignore = true
				if (data.hash != window.location) {
					body.removeClass('is-flying')
					window.history.pushState({ path: data.hash }, '', data.hash)
					loadPageContent(data.hash)
				}
				setInterval(function () {
					ignore = false
				},100)
			})

			socket.on('stop', function() {
				if (body.hasClass('is-granted')) {
					body.removeClass('is-granted')
				}
				body.addClass('is-started')
				setTimeout(function() {
					body.removeClass('is-started')
				},2000)
			})
			
			socket.on('slide-up', function() {
				$('#main #content .arrow:eq(0)').trigger('click')
			})
			
			socket.on('slide-down', function() {
				$('#main #content .arrow:eq(1)').trigger('click')
			})
			
		} else {
			console.log('wrong secret key')
		}
		
	})
	
	function loadPageContent(page) {
		$.ajax({  
			type: 'get',
			url: page + '?partial=true',
			data: {},						
			success: function(response) {
				$('#content').html(response)
				updatePanel(1, 0)
			}
		})
	}

  function updatePanel(a, b) {

    scrolling = true
    previousPanel = currentPanel
    currentPanel = a

    $('.panel').removeClass('active previous-panel')
    $('.panel-' + a).addClass('active')
	
   if (b) {
    	previousPanel = currentPanel + 1
    } else {
    	previousPanel = currentPanel - 1
    }

    if (a > 1) {
      while(--a) {
        $('.panel-' + a).addClass('previous-panel')
      }
    }

    if (currentPanel == 1) {
    	$('.arrow--up').addClass('disable')
    } else {
    	$('.arrow--up').removeClass('disable')
    }

    if (currentPanel == 3) {
    	$('.arrow--down').addClass('disable')
    } else {
    	$('.arrow--down').removeClass('disable')
    }

    scrolling = false

  }

	function up() {
		if (currentPanel > 1) {
			currentPanel--
			updatePanel(currentPanel, true)
		}
	}

	function down() {
		if (currentPanel < 3) {
			currentPanel++
			updatePanel(currentPanel)
		}
	}

	function onClick() {
		if (scrolling) return
		if ($(this).hasClass('arrow--up')) {
			up()
		} else {
			down()
		}
	}

	function onMouseenter() {
		if (!$(this).hasClass('active')) {
			$(this).addClass('active')
		}
	}

	function onMouseleave() {
		if ($('#control').hasClass('active')) {
			$('#control').removeClass('active')
			$('#control__text').removeClass('step-2').addClass('step-1')
		}
	}

	function onLoad() {
		updatePanel(1, 0)
	}

})(jQuery, window)

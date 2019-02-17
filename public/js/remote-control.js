(function($, window, undefined) {
  
  var body = $('body')
      ,socket = io.connect('http://{myIP}:8080')
      ,number = 0
      ,item = 0
      ,room = 0
      ,value = ''

  $(window).on('load', onLoad)

  body.on('click', '#keypad ul li', function() {
    item = $(this).text()
    number++
    $('#value').append(item)
    if (number === 1) $('#screen-display span:eq(0)').html(item)
    if (number === 2) $('#screen-display span:eq(1)').html(item)
    if (number === 3) $('#screen-display span:eq(2)').html(item)
    if (number === 4) {
      $('#screen-display span:eq(3)').html(item)
      setTimeout(function() {
        value = $('#value').text()
        if (room == value) {
          $('#remote-control').addClass('active')
          socket.emit('load', {room: value})
          socket.emit('message', {connect: '0'})
        } else {
          $('#screen-display span').html('<span></span>')
          $('#value').html('')
          number = 0
        }
      }, 100)
    }
  })

  body.on('click', '#tabs .tab', function(e) {
    e.preventDefault()
    let hash = $(this).attr('href')
    socket.emit('page-changed', {hash: hash})
  })

  body.on('click', '#disconnect', function() {
    socket.emit('stop-control')
  })

  body.on('click', '#control-arrow__up', function() {
    socket.emit('arrow-up')
  })

  body.on('click', '#control-arrow__down', function() {
    socket.emit('arrow-down')
  })

  socket.on('room', function(data) {
    room = data.room
  })

  socket.on('stop', function() {
    $('#remote-control').html('<div>Disconnect</div>')
  })

  function onLoad() {
    socket.emit('rooms')
  }

})(jQuery, window)
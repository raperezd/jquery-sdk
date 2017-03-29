class InternetConnectionChecker {
  constructor ({ onDisconnect, onReconnect, intervalLength }) {
    this._onDisconnect = onDisconnect || (() => {})
    this._onReconnect = onReconnect || (() => {})
    this._intervalLength = intervalLength || 3000

    this._interval = null
    this._isOnline = true
  }

  start () {
    if (this._interval) {
      return
    }

    const self = this
    this._interval = setInterval(
      () => {
        self.onlineCheck(online => {
          if (self._isOnline && !online) {
            self._onDisconnect()
          }
          if (!self._isOnline && online) {
            self._onReconnect()
          }
          self._isOnline = online
        })
      },
      this._intervalLength
    )
  }

  onlineCheck (cb) {
    const v4 = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}'
    let regex = new RegExp(v4, 'g')

    let urls = [
      'https://api2.transloadit.com/',
      'https://ipv4.icanhazip.com/'
    ]
    let cbCalled = false
    let numResultsGathered = 0

    for (var i = 0; i < urls.length; i++) {
      this._onlineCheck(urls[i], (online) => {
        numResultsGathered++

        if (cbCalled) {
          return
        }

        if (online) {
          cbCalled = true
          cb(true)
        }

        if (numResultsGathered === urls.length ) {
          cbCalled = true
          cb(false)
        }
      })
    }
  }

  _onlineCheck (url, cb) {
    $.ajax({
      url: url,
    }).done(data => {
      cb(true)
    })
    .fail(() => {
      cb(false)
    })
  }


  isOnline () {
    return this._isOnline
  }

  isCurrentlyOnline (cb) {
    isOnline(cb)
  }
}

module.exports = InternetConnectionChecker

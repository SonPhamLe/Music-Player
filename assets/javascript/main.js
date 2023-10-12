const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'SHINE'
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'The EDGE (feat. NEVVE)',
            singer: 'GRANT',
            path: './assets/music/music-1.mp3',
            image: './assets/img/image-4.png'
        },
        {
            name: 'Fly Again [NCS Release]',
            singer: 'Kisma',
            path: './assets/music/music-2.mp3',
            image: './assets/img/image-3.png'
        },
        {
            name: 'VERDANT',
            singer: '|DAKOOKA|',
            path: './assets/music/music-3.mp3',
            image: './assets/img/image-2.png'
        },
        {
            name: 'Oui',
            singer: 'Jeremil',
            path: './assets/music/music-4.mp3',
            image: './assets/img/image-1.png'
        }
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((songs, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${songs.image}')">
            </div>
            <div class="body">
              <h3 class="title">${songs.name}</h3>
              <p class="author">${songs.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentMusic', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const cdWidth = cd.offsetWidth
        const _this = this
        // 
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        //Xử lý phóng to / thu nhỏ CD 
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        // Xử lý click play music
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        // Play music
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // Pause music
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // Update Time music
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        // Change playtime music
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        //
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomMusic()
            } else {
                _this.nextMusic()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveMusic()
        }
        //
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomMusic()
            } else {
                _this.prevMusic()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveMusic()
        }
        // Random active song 
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)

        }
        //Next song if ended song
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        // repeat song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        //listening click on playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if( songNode|| e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if(e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveMusic: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            })
        }, 300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentMusic.name
        cdThumb.style.backgroundImage = `url('${this.currentMusic.image}')`
        audio.src = this.currentMusic.path
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextMusic: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevMusic: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomMusic: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function () {
        this.loadConfig()
        this.defineProperties()
        this.handleEvents()
        this.loadCurrentSong()
        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}
app.start()
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER';


const Cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');

const Playlist = $('.playlist');
const PlayBtn = $('.btn-toggle-play');
const Player = $('.player');
const Progress = $('#progress');
const NextBtn = $('.btn-next');
const PrevBtn = $('.btn-prev');
const ranDomBtn = $('.btn-random');
const RepeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: '2002',
            singer: 'Anne-Marie',
            path: '../../musics/song\ 1.mp3',
            image: '../../imgs/song\ 1.jpg'
        },
        {
            name:'Bên Trên Tầng Lầu',
            singer: 'Johny Nguyễn , Tăng Duy Tân',
            path: '../../musics/song\ 2.mp3',
            image: '../../imgs/song\ 2.jpg'
        },
        {
            name:'Like My Father',
            singer: 'Jax',
            path: '../../musics/song\ 3.mp3',
            image: '../../imgs/song\ 3.jpg'
        },
        {
            name:'Photograph',
            singer: 'Ed Sherran',
            path: '../../musics/song\ 4.mp3',
            image: '../../imgs/song\ 4.jpg'
        },
        {
            name:'River',
            singer: 'Charlie Puth',
            path: '../../musics/song\ 5.mp3',
            image: '../../imgs/song\ 5.jpg'
        },
        {
            name:'Bên Trên Tầng Lầu Remix',
            singer: 'Johny Nguyễn , Tăng Duy Tân',
            path: '../../musics/song\ 6.mp3',
            image: '../../imgs/song\ 6.jpg'
        },
        {
            name:'The Night',
            singer: 'Avicci',
            path: '../../musics/song\ 7.mp3',
            image: '../../imgs/song\ 7.jpg'
        }
    ],

    playedSongs: [],

    //Luu vao LocalStorage
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    render: function() {
        var htmls = this.songs.map((song , index) => {
            return `
            <div id=data-${index} data-index=${index} class="song ${ index == this.currentIndex ? 'active' : ''}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        });
        Playlist.innerHTML = htmls.join('');
    },

    setConfig: function(key , value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY , JSON.stringify(this.config));
    },

    defineProperties: function() {
        Object.defineProperty(this , 'currentSong' , {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function() {
        //Adjust size CD when Scroll
        const cdWidth = Cd.offsetWidth ;
        const _this = this;

        //Bat tat khi dung phim Space
        window.onkeypress = function(e) {
            if(e.charCode === 32) {
                if(_this.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            }
        }
        
        //Next song when the song ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                NextBtn.click();
            }
        }
        //Repeat song when the song ended
        RepeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat' , _this.isRepeat);
            this.classList.toggle('active' , _this.isRepeat);
        }

        //Xu ly dia CD quay
        const CDthumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //miliseconds
            iterations: Infinity
        });
        CDthumbAnimate.pause();

        //Xu ly khi click play 
        PlayBtn.onclick = function() {
            if( _this.isPlaying) {
                audio.pause();
            } else {

                audio.play();
            }
        }
        //Khi audio dc play 
        audio.onplay = function() {
            _this.isPlaying = true;
            Player.classList.add('playing');
            CDthumbAnimate.play();
            // _this.render();
        }
        audio.onpause = function() {
            _this.isPlaying = false;
            Player.classList.remove('playing');
            CDthumbAnimate.pause();
        }

        //thoi gian bai hat bi thay doi 
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const currentProgress = Math.floor(audio.currentTime / audio.duration * 100);
                Progress.value = currentProgress;
            }
        }

        //Next song 
        NextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            }else {
                let Prevsong = _this.currentIndex;
                const deleteNode = $(`#data-${Prevsong}`);
                deleteNode.classList.remove('active');
                _this.nextSong();
                let thisSong = _this.currentIndex;
                const addNote = $(`#data-${thisSong}`);
                addNote.classList.add('active');
            }
            audio.play();
            _this.ScrolltoActiveSong();
        };

        //Prev song 
        PrevBtn.onclick = function() {
            if(_this.isRandom)
            {
                _this.playRandomSong();
            }
            else {
                let Prevsong = _this.currentIndex;
                const deleteNode = $(`#data-${Prevsong}`);
                deleteNode.classList.remove('active');
                _this.prevSong();
                let thisSong = _this.currentIndex;
                const addNote = $(`#data-${thisSong}`);
                addNote.classList.add('active');
            }
            audio.play();
            _this.ScrolltoActiveSong();
        }

        //Random bai hat xu ly khi random song 
        ranDomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom' , _this.isRandom);
            this.classList.toggle('active' , _this.isRandom);

        }

        //xu ly khi tua song 
        Progress.onchange = function(e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        }
        
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newcdWidth = cdWidth - scrollTop;
            
            Cd.style.width = (newcdWidth > 0) ? + newcdWidth +'px' : 0 ;
            Cd.style.opacity = (newcdWidth / cdWidth);
        }

        //Tra ve element da click trong Playlist 
        Playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            
            if(songNode || e.target.closest('.option')) {
                //Xu ly voi bai hat khi clicked
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                //Xu ly voi option khi clicked
                if(e.target.closest('.option')) {
                }
            }
        }


    },

    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    ScrolltoActiveSong: function() {
        setTimeout(()=> {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        },300);
    },

    nextSong: function() {
        this.currentIndex++ ;
        if(this.currentIndex >= this.songs.length ) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex-- ;
        if(this.currentIndex < 0 ) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);

        }while(this.currentIndex === newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.render();
    },

    start: function() {
        //Dinh nghia cac thuoc tinh cho Object
        this.defineProperties();

        //Render lai playlist
        this.render();

        //Phat bai hat hien tai trong Ui
        this.loadCurrentSong();
        //Ham lang nghe va xu ly cac su kien (DOM Events)
        this.handleEvents();
    }
}

app.start();


import React, { Component } from 'react';
import {alquran , mp3quran} from '../api/config';
import jsonData from '../assets/json/data.json';

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      currentAudioVolumeValue:1,
      duration:"00:00:00",
      currentAudioTime:"00:00:00",
      audioToastPosition : 0,
      audioBufferAmount :0,
      isShowSpiner : false,
      isPlayed: true,
      isShowModelSetting:false,
      isShowModelPlaylist:false,
      isKoraeErrorCheckingShow:false,
      isSurahErrorCheckingShow:false,
      isKoraeShowOption:false,
      isSuwarShowOption:false,
      koraeOptionSelectedItemText : "",
      surahOptionSelectedItemText : "",
      optionsAudioLink:undefined
      
    };

    // this.state = {
    //   data : undefined,
    //   playlist:{
    //     playingNow:1,
    //     playlistArr:[]
    //   },
    //   audio :{
    //     currentAudioVolumeValue:0.5,
    //     duration:"00:00:00",
    //     currentAudioTime:"00:00:00",
    //     audioToastPosition : 0,
    //     audioBufferAmount :0,
    //     isPlayed: true,
    //   },
    //   isShowModelOption:false,
    //   isKoraeShowOption:false,
    //   isSuwarShowOption:false,
    //   koraeOptionSelectedItemText : "",
    //   surahOptionSelectedItemText : "",
    //   koraeOptionItems : [],
    //   suwarOptionItems : []
    // };


    this.data = JSON.parse(JSON.stringify(jsonData));
    this.playlist = {
      playingNow:0,
      playlistTitle:"",
      playlistArr:[]
    };
    this.myAudioRef = React.createRef();
    this.timerLineRef = React.createRef();
    this.myAudioVolumeRef = React.createRef();
    this.myPlaylistRef = React.createRef();
    this.myModelRef = React.createRef();
    this.myReciterOptionRef = React.createRef();
    this.mySurahOptionRef = React.createRef();

    this.makePlayList_1();
  }

  // HANDELLERS

  handellePlayAudio = (submitType = null) => {
    if (!this.state.isPlayed) {
      this.myAudioRef.current.play();
    }else{
      this.myAudioRef.current.pause();
    }
    this.setState((state) => {
      if (submitType === "modelPlayListSubmit") {
        return {
          isPlayed : !state.isPlayed,
          isShowModelPlaylist : false
        }
      }
      return {
        isPlayed : !state.isPlayed,
        isShowModelPlaylist : false
      }
    })
  }

  handelleInputChange = (e) => {
    let currentTime = e.target.value;
    let audioToastPosition = this.setTimerToastPosition(currentTime);
    currentTime = this.getAudioValues(currentTime);
    this.myAudioRef.current.currentTime = this.convertToSeconds(currentTime);
    this.setState({
      currentAudioTime : currentTime,
      audioToastPosition
    })
  }

  handelleSettingClick = () => {
    this.setState((state) => {
      return {
        isShowModelSetting : true
      }
    });
  }

  handellePlayListClick = () => {
    this.setState((state) => {
      return {
        isShowModelPlaylist : true
      }
    });
  }

  handelleModelClose = (modelType) => {
    this.setState((state) => {
      return {
        [modelType] : false
      }
    });
  }

  handelleModelOption = (i, optionType) => {
    let data = this.data.filter((el) => {
      return el.reciterMedia.length === 114;
    }
    );

    if (optionType === "korae") {
      let koraeOptionSelectedItemText =data[i].reciterInfos;
      this.setState({
        isKoraeShowOption:false,
        koraeOptionSelectedItemText
      })
    }else{
      let surahOptionSelectedItemText =data[0].reciterMedia[i].surahName;
      this.setState({
        isSuwarShowOption:false,
        surahOptionSelectedItemText
      })
    }
  }

  handelleShowOptions = (optionType) => {
    this.setState((state) => {
      
      return {
        [optionType] : !state[optionType]
      }
    }
    )
  }

  handelleSubmitOptionsClick = () => {
    if (!this.state.surahOptionSelectedItemText && !this.state.koraeOptionSelectedItemText) {
      this.setState({
        isSurahErrorCheckingShow : true,
        isKoraeErrorCheckingShow : true
      });
      return
    }

    if (!this.state.surahOptionSelectedItemText) {
      this.setState({
        isSurahErrorCheckingShow : true,
        isKoraeErrorCheckingShow : false
      });
      return
    }else{
      this.setState({
        isSurahErrorCheckingShow : false
      });
    }

    if (!this.state.koraeOptionSelectedItemText) {
      this.setState({
        isKoraeErrorCheckingShow : true
      });
      return
    }else{
      this.setState({
        isKoraeErrorCheckingShow : false
      });
    }

    let data = this.data.filter((el) => {
      return el.reciterMedia.length === 114;
    }
    );

    let optionsAudioLink = data.filter((el) => {
      return el.reciterInfos === this.state.koraeOptionSelectedItemText;
    }).reduce((prevVal, currVal,i) => {
      return currVal;
    }
    );

    optionsAudioLink = optionsAudioLink.reciterMedia.filter((el) => {
      return el.surahName === this.state.surahOptionSelectedItemText;
    }).reduce((prevVal, currVal,i) => {
      return currVal;
    }
    );
    let index;
    const playlistArr = this.playlist.playlistArr.map((el,i) => {
      if(el.surahName === this.state.surahOptionSelectedItemText){
        el.reciter = this.state.koraeOptionSelectedItemText;
        el.link = optionsAudioLink.server;
        index = i;
      }
      return el;
    }
    )

    this.setState({
      optionsAudioLink: optionsAudioLink.server,
      isShowModelSetting: false,
      isSurahErrorCheckingShow : false,
      isKoraeErrorCheckingShow : false,
      playlist:{...this.playlist,playlistArr:playlistArr,playingNow : index}
    },()=>{
      let [currentReciter,currentSurah] = [this.state.koraeOptionSelectedItemText,this.state.surahOptionSelectedItemText];
      this.setPlaylistTitle(currentReciter,currentSurah);
    });
  }

  handelleAudioVolume = (e) => {
    let currentAudioVolumeValue = e.target.value / 100;
    this.setState((state) => {
      return {
        currentAudioVolumeValue
      }
    });
  }

  handelleModelIsPlayingNow = (index) => {
    if (index === this.playlist.playingNow) {
      this.handellePlayAudio("modelPlayListSubmit");
      return;
    } 
    this.setState((state) => {
      let data = this.data.filter((el) => {
        return el.reciterMedia.length === 114;
      }
      );
  
      let optionsAudioLink = data.filter((el,i) => {
        if(index === i){
          return el;
        }
      }).reduce((prevVal, currVal,i) => {
        return currVal;
      }
      );
      this.playlist={...this.playlist,playingNow : index};
      return {
        audioBufferAmount:0,
        currentAudioTime:"00:00:00",
        optionsAudioLink: optionsAudioLink.server,
      }
    },()=>{
        let playingNow,currentReciter,currentSurah;
        playingNow = this.playlist.playingNow;
        [currentReciter,currentSurah] = [this.playlist.playlistArr [playingNow].reciter,this.playlist.playlistArr[playingNow].surahName];
        this.setPlaylistTitle(currentReciter,currentSurah);
    }
    );
  }
  
  // GETTERS

  setJSONData = (data) => {
    if (!localStorage.getItem('data')) {
      localStorage.setItem('data', data);
    }
  }
  

  getReciters = (data) => {
    const korae = data.map((el) => {
      return {
        name : el.name,
        server : el.Server
      }
    });
    return korae;
  }

  getSurah = (data) => {
    const surah = data.data.data.surahs.map((el) => {
      return {
        num : el.number,
        surahName : el.name
      }
    });
    return surah;
  }

  getAudioValues = (value) => {
    value = Math.round(value);
    if (value < 10) {
      return value = `00:00:0${value}`;
    }
    if (value < 60) {
      
      return value = `00:00:${value}`
    }
    if (value < 3600) {
      let min = parseInt(value / 60);
      let s = value - min;
      min = min < 10 ? `0${min}` : `${min}`;
      if (s < 10) {
        value = `00:${min}:0${s}`;
        return value;
      }
    }
    let h = Math.floor(value / 3600);
    let min = Math.floor(((value / 3600) - h) * 60);
    let s = value % 60;
    h = h < 10 ? `0${h}` : `${h}`;
    min = min < 10 ? `0${min}` : `${min}`;
    s = s < 10 ? `0${s}` : `${s}`;
    value = `${h}:${min}:${s}`;
    
    return value;
  }

  // SETTERS

  makePlayList = (state) => {

    let data = this.data.filter((el) => {
      return el.reciterMedia.length === 114;
    }
    );

    if (!this.playlist.playlistArr.length) {
      const playlistArr = [];
        for (let index = 0; index < 114; index++) {
          let randNum = Math.round(Math.random() *111);
          
          let server,surahName,reciter;
          reciter= data[randNum].reciterInfos;
          server= data[randNum].reciterMedia[index].server;
          surahName= data[randNum].reciterMedia[index].surahName;
          playlistArr.push({
            reciter: reciter,
            surahName: surahName,
            link : server
          });
        }
        this.playlist = {
          ...this.playlist,
          playlistTitle:"",
          playlistArr:[...playlistArr]
        }
        this.setState((state)=>{
            let playingNow,currentReciter,currentSurah;
            playingNow = this.playlist.playingNow;
            [currentReciter,currentSurah] = [this.playlist.playlistArr [playingNow].reciter,this.playlist.playlistArr[playingNow].surahName];
            this.setPlaylistTitle(currentReciter,currentSurah);
          })
    }

  }

  makePlayList_1 = () => {
    if (!localStorage.getItem('playlist')) {
      console.log("entred 1");
      localStorage.setItem('playlist',JSON.stringify(this.playlist));
      let data = this.data.filter((el) => {
        return el.reciterMedia.length === 114;
      }
      );

      const playlistArr = [];
        for (let index = 0; index < 114; index++) {
          let randNum = Math.round(Math.random() *111);
          
          let server,surahName,reciter;
          reciter= data[randNum].reciterInfos;
          server= data[randNum].reciterMedia[index].server;
          surahName= data[randNum].reciterMedia[index].surahName;
          playlistArr.push({
            reciter: reciter,
            surahName: surahName,
            link : server
          });
        }
        let playingNow,currentReciter,currentSurah;
        playingNow = this.playlist.playingNow;
        [currentReciter,currentSurah] = [playlistArr [playingNow].reciter,playlistArr[playingNow].surahName];
        let playlistTitle = `${currentSurah} - ${currentReciter}`;
        this.playlist = {
          ...this.playlist,
          playlistTitle:playlistTitle,
          playlistArr:[...playlistArr]
        }
        localStorage.setItem('playlist',JSON.stringify(this.playlist));
    }else{
      console.log("entred 2");
      this.playlist = {...JSON.parse(localStorage.getItem('playlist'))};
    }

  }

  setPlaylist = () => {
    let playlistArr = this.playlist.playlistArr ;
    
    if (playlistArr.length) {
      
      playlistArr = playlistArr.map((el , i) => {
        let isPlaying = (this.playlist.playingNow === i) && (this.state.isPlayed);
        let isPlayingNow = (this.playlist.playingNow === i);
        return (
          <div 
            className={`model ${isPlayingNow ? 'activeOn490':''}`}
            key={i}
            id={i}
            ref={this.myModelRef}
            onClick={()=>this.handelleModelIsPlayingNow(i)}
            >
            <div 
              className="playingNow d-none-xm">
              {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
            </div>
            <div 
              className="modelInfos">
        <div className="modelInfosCurrentSuhar"><span className="CurrentSurah ml-5">{el.surahName}</span> - <span className="currentKaree mr-5">{el.reciter}</span></div>
              <div className="modelInfosTimer d-none-xm">
                {isPlayingNow ? this.state.currentAudioTime : "00:00:00" }
              </div>
            </div>
          </div>
        );
      }
      )
    }
    return playlistArr;
  }

  setTimerToastPosition = (currentTime) => {
    let audioToastPosition = (Math.round(currentTime )/ this.myAudioRef.current.duration) * Math.round(this.timerLineRef.current.offsetWidth - 10);
      return Math.round(audioToastPosition);
  }

  setAudioBufferAmount = () => {
    for (let i = 0; i < this.myAudioRef.current.buffered.length; i++) {
      if (this.myAudioRef.current.buffered.start(this.myAudioRef.current.buffered.length - 1 - i) < this.convertToSeconds(this.state.currentAudioTime)) {
        let audioBufferAmount = (this.myAudioRef.current.buffered.end(this.myAudioRef.current.buffered.length - 1 - i) / this.convertToSeconds(this.state.duration)) * 100;
        if (audioBufferAmount > 100) {
          audioBufferAmount = Math.round(audioBufferAmount);
        }
        this.setState((state) => {
          return {
            audioBufferAmount
        }});
      }
    }
  }

  setLink = () => {
    if (this.state.optionsAudioLink ) {
      return this.state.optionsAudioLink ;
    }
    if (this.playlist.playlistArr.length) {
      return this.playlist.playlistArr[this.playlist.playingNow].link;
    }
  }

  setPlaylistTitle =(currentReciter,currentSurah) => {
    let playlistTitle = `${currentSurah} - ${currentReciter}`;
    this.playlist={
      ...this.playlist,
      playlistTitle
  }
  }
  
  
  // HELPERS
  playAudio = () => {
    if (this.state.isPlayed) {
      this.myAudioRef.current.play();
      return
    }
    this.myAudioRef.current.pause();
    return
  }
  

  convertToSeconds = (str) => {
    let arr = str.split(":");
    if (arr.length === 2) {
      let [m,s] = arr;
      m = parseInt(m);
      s = parseInt(s);
      s += m *60;
      return s;
    }
    let [h,m,s] = arr;
    h = parseInt(h);
    m = parseInt(m);
    s = parseInt(s);
    s += (m *60) + (h*3600);
    return s;
  }

  formatSurahNum = (num) => {
    if (parseInt(num) < 10) {
      return `00${num}`;
    }
    if (parseInt(num) < 100) {
      return `0${num}`;
    }
    return `${num}`;
  }

  // scrollToModel = (id,state) => {
  //   if (!state.playlist.playlistArr.length || id === state.playlist.playingNow) {
  //     return;
  //   }
  //   this.myPlaylistRef.current.scrollTo(0,state.playlist.playingNow * 85);
  // }

  incrimentPlaylist = (currVal) => {
    if (currVal < 114) {
      currVal++;
      return currVal;
    }
    
    return 0;
  }
  
  UNSAFE_componentWillUpdate(nextP,nexpS){
  this.myAudioRef.current.volume = this.state.currentAudioVolumeValue;
  } 
  componentDidUpdate(prevP,prevS){
    // if (prevS.) {
      
    // }
    // this.scrollToModel(this.playlist.isPlayingNow,this.state);
  }
  

  componentDidMount(){
    this.myAudioRef.current.addEventListener('loadedmetadata', () => {
      let duration = this.myAudioRef.current.duration;
      duration = this.getAudioValues(duration);
      this.setState({
        duration,
        isShowSpiner:false
      })
    },false);
    
    this.myAudioRef.current.addEventListener("timeupdate", () => {
      this.setAudioBufferAmount();
      let currentTime = this.myAudioRef.current.currentTime;
      let audioToastPosition = this.setTimerToastPosition(currentTime);
      currentTime = this.getAudioValues(currentTime);
      this.setState({
        currentAudioTime : currentTime,
        audioToastPosition
      })
    });

    this.myAudioRef.current.addEventListener('ended', () => {
      if (this.state.optionsAudioLink) {
        this.setState({
          optionsAudioLink:undefined,
          audioToastPosition : 0,
          audioBufferAmount :0,
          isPlayed: false,
        })
      }else{
        this.playlist = {
          ...this.playlist,
          playingNow : this.incrimentPlaylist(this.playlist.playingNow)
        }
        this.setState((state) => {
          return {
            audioToastPosition : 0,
            audioBufferAmount :0,
            isPlayed: true,
            
          }
        },()=>{
          let playingNow,currentReciter,currentSurah;
          playingNow = this.playlist.playingNow;
          [currentReciter,currentSurah] = [this.playlist.playlistArr [playingNow].reciter,this.playlist.playlistArr[playingNow].surahName];
          this.setPlaylistTitle(currentReciter,currentSurah);
        }
        );

      }
      
    });
  }

  componentWillUnmount(){
    
    localStorage.removeItem('playlist');
  }

  render() {
    console.log(this.playlist);
    let audioDuration = this.state.duration;

    const currentAudioTime = this.state.currentAudioTime;
    const koraeOptions = this.data.filter((el) => {
      return el.reciterMedia.length === 114;
    }
    ).map((el, i) => {
      return (<div 
        key={i}
        className="optionItem"
        onClick={() => this.handelleModelOption(i, "korae")}>
        <p>{el.reciterInfos}</p>
      </div>)
    });

    let suwarOptions = this.data.filter((el) => {
      return el.reciterMedia.length === 114;
    }
    );
    suwarOptions = suwarOptions[0].reciterMedia.map((el, i) => {
      return (<div 
        key={i}
        className="optionItem"
        onClick={() => this.handelleModelOption(i, "surah")}>
        <p>{el.surahName}</p>
      </div>)
    });
    

    const playlist = this.setPlaylist();
    let maxRange = this.convertToSeconds(audioDuration);
    let value = this.convertToSeconds(currentAudioTime);
    let audioVal = this.state.currentAudioVolumeValue;
    let canPlay = this.state.isPlayed;
    return (
      <React.Fragment>
        <div 
          className="loading"
          style={{display: this.state.isShowSpiner ? "flex" : "none"}}>
          <div className="loader"></div>
        </div>
        <header>
          <nav>
            <a href="/" className="logo">القرآن الكريم</a>
            <ul className="navUlSocialMedia d-none">
              <li>
                <a href="/" className="youtube">
                <i className="fab fa-youtube"></i>
                </a>
              </li>
              <li>
                <a href="/" className="facebook">
                <i className="fab fa-facebook-f"></i>
                </a>
              </li>
            </ul>
          </nav>
          {/* <div className="navLinks">
            <ul className="links">
              <a href="/">
              <li>الهدف من الموقع</li>
              </a>
            </ul>
          </div> */}
        </header>
        <main>
          <div className="heading">
          <h1>
            <span className="subHeading d-bloc">
            بسم الله الرحمن الرحيم
            </span>
            <span>قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِّنَ الْجِنِّ فَقَالُوا إِنَّا سَمِعْنَا قُرْآنًا عَجَبًا
            <br className="d-none-xm d-none-s"/>

يَهْدِي إِلَى الرُّشْدِ فَآمَنَّا بِهِ وَلَن نُّشْرِكَ بِرَبِّنَا أَحَدًا</span>
          </h1>
          </div>
          <div className="playlist">
            <audio 
              autoPlay={canPlay}
              ref={this.myAudioRef}
              preload="metadata" 
              src={this.setLink()}>
              <source type="audio/ogg"/>
              Your browser does not support the audio element.
            </audio>
            <div 
              className="play"
              onClick={this.handellePlayAudio}>{this.state.isPlayed ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i> }</div>
            <div className="timer">
    <div className="startingTime">{this.state.currentAudioTime}</div>
              <div 
              className="rangeContainer"
              ref={this.timerLineRef}>
                <input 
                  className="InputRange"
                  type="range" 
                  min="0" 
                  max={maxRange} 
                  value={value}
                  onChange={(e)=>this.handelleInputChange(e)}
                />
                <div 
                  className="bufferAmount"
                  style={{width:`${this.state.audioBufferAmount}%`}}></div>
                <div 
                className="timerToast"
                style={{left:`${this.state.audioToastPosition}px`}}>
                  <div className="upperTimerToast">
    <p className="upperTimerToastText">{this.state.currentAudioTime}</p>
                  </div>
                  <div className="downTimerToast"></div>
                
                </div>
              </div>
              <div className="endingTimer mr-5">{audioDuration}</div>
              <div className="timerVolume d-none-xm">
                {this.state.currentAudioVolumeValue ? <i className="fas fa-volume-up mr-5"></i> : <i className="fas fa-volume-mute"></i>}
                
                <div className="rangeContainer">
                  <input 
                    type="range"
                    className="InputRange"
                    min="0"
                    max="100"
                    value={audioVal * 100}
                    ref={this.myAudioVolumeRef}
                    onChange={(e)=>this.handelleAudioVolume(e)}/>
                </div>
              </div>
            </div>
            <div 
              className="playlistSetting mr-5"
              onClick={this.handelleSettingClick}>
              <i className="fas fa-cog"></i>
            </div>
            <div 
              className="playlistInfos"
              onClick={this.handellePlayListClick}>
                <i className="fas fa-indent"></i>
            </div>
            <div className="currentPlayList d-none-xm d-none-s ">
              <div className="frontText slide-right-front">{this.playlist.playlistTitle}</div>
              <div className="backText slide-right-back">{this.playlist.playlistTitle}</div>
            </div>
          </div>
          <div className="currentPlayList d-flex-sm d-none">
            <div className="frontText slide-right-front">{this.playlist.playlistTitle}</div>
            <div className="backText slide-right-back">{this.playlist.playlistTitle}</div>
          </div>
        </main>
        <div 
          className="modelContainer"
          style={{display: this.state.isShowModelSetting ? "flex" : "none"}}>
          {/* onClick={()=>this.handelleModelClose("isShowModelSetting")}*/}
          <div className="model">
            <div 
              className="cancelModel"
              onClick={()=>this.handelleModelClose("isShowModelSetting")}><i className="fas fa-times"></i></div>
            <label 
              className="mr-5" > إختر السورة</label>
            <div 
              className="modelSelect"
              id="surahOption"
              onClick={() => this.handelleShowOptions("isKoraeShowOption")}>
              <p className="modelSelectText">{this.state.surahOptionSelectedItemText}</p>
              <div 
                className="optionErrorChecking"
                style={{display : this.state.isSurahErrorCheckingShow? "flex" : "none"}}>
              رجاءً إدخال السورة
              </div>
              <span><i className="fas fa-arrow-down"></i></span>
              <div 
                className="options generalSrolling"
                style={{display:this.state.isKoraeShowOption ? "flex" : "none"}}>
                {suwarOptions}
              </div>
            </div>
            <label htmlFor=""
              className="mr-5"> إختر القارئ</label>
            <div 
              className="modelSelect"
              id="reciterOption"
              onClick={() => this.handelleShowOptions("isSuwarShowOption")}>
              <div 
                className="optionErrorChecking"
                style={{display :this.state.isKoraeErrorCheckingShow? "flex" : "none"}}>
              رجاءً إدخال القارئ
              </div>
              <p className="modelSelectText">{this.state.koraeOptionSelectedItemText}</p>
              <span><i className="fas fa-arrow-down"></i></span>
              <div 
                className="options generalSrolling"
                style={{display:this.state.isSuwarShowOption ? "flex" : "none"}}>
                {koraeOptions}
              </div>
            </div>
            <div 
              className="modelSubmit mr-5"
              onClick={this.handelleSubmitOptionsClick}><i className="fas fa-sign-in-alt"></i></div>
          </div>
        </div>
        <div 
          className="modelContainer"
          style={{display: this.state.isShowModelPlaylist ? "flex" : "none"}}
          onClick={()=>this.handelleModelClose("isShowModelPlaylist")}>
          <div 
            className="playlist generalSrolling"
            ref={this.myPlaylistRef}>
            {playlist}
          </div>
        </div>
      </React.Fragment>
    )
  }
}

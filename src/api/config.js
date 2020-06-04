import axios from 'axios';

export const alquran = axios.create({
  baseURL : "http://api.alquran.cloud/v1/quran/quran-uthmani"
});

export const mp3quran = axios.create({
  baseURL: 'https://mp3quran.net/api/_arabic.json'
});




import axios from 'axios';

export const exchangeApi = axios.create({
  baseURL: 'https://api.apilayer.com/exchangerates_data',
  headers: {
    apikey: process.env.APILAYER_KEY!,
  },
});

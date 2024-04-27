const express = require('express')
const app = express()
const port = 3000
const knex = require('knex');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const database = knex({
  client: 'pg',
  connection: {
    host: 'localhost', // PostgreSQL host adresi
    port: '5432',
    user: 'postgres', // PostgreSQL kullanıcı adı
    password: '2013', // PostgreSQL şifre
    database: 'native' // Kullanmak istediğiniz PostgreSQL veritabanı
  }
})


app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello Worldddddd!')
})


app.post('/job/search', (req, res) => {
  const { searchInput } = req.body;
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: searchInput,
      page: '1',
      num_pages: '1'
    },
    headers: {
      'X-RapidAPI-Key': process.env.API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.request(options);
      const dataOfJobs = response.data.data;
      res.json({ status: 'success', dataOfJobs })
    } catch (error) {
      console.error(error);
    }
  }
  return fetchData();

})

app.get('/job/search/nearby', (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: 'Python developer in Texas, USA',
      page: '1',
      num_pages: '1'
    },
    headers: {
      'X-RapidAPI-Key': process.env.API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.request(options);
      const dataOfJobs = response.data.data;
      res.json({ status: 'success', dataOfJobs })
    } catch (error) {
      console.error(error);
    }
  }
  return fetchData();
})

app.get('/job/search/recent', (req, res) => {
  database('')
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: 'Python developer in Texas, USA',
      page: '1',
      num_pages: '1'
    },
    headers: {
      'X-RapidAPI-Key': process.env.API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.request(options);
      const dataOfJobs = response.data.data;
      res.json({ status: 'success', dataOfJobs })
    } catch (error) {
      console.error(error);
    }
  }
  return fetchData();
})


app.post('/users', (req, res) => {
  const { name, email, password } = req.body;
  database('native') // Tablo adını düzelt
    .select('*')
    .from('users')
    .where({ name: name, email: email, password: password })
    .then(user => {
      if (user.length !== null) {
        res.json({ status: 'success', user })
        console.log('backendden alinan kullanici : ', user)
      }
      else {
        res.json({ status: 'noUser' })
        console.log('kullanici bulunamadi')
      }
    })
    .catch(err => console.log('server error', err))
  console.log('bize ne geldi:', name, email, password)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


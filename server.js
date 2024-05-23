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

/* ####################################     NEARBY JOBS   ########################################## */
app.post('/job/search/nearby/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log('bize gelen id : ', userId)

  database('native')
    .select('*')
    .from('users')
    .where({ id: userId })
    .then(userInfo => {
      if (userInfo.length > 0) {
        const user = userInfo[0];
        console.log('User Info:', user);
        const jobUser = user.job;
        const countryUser = user.country;
        console.log('User Info:', user.job);
        console.log('User Info:', user.country);

        const options = {
          method: 'GET',
          url: 'https://jsearch.p.rapidapi.com/search',
          params: {
            query: `${jobUser} ${countryUser}`,
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
            res.json({ status: 'success', dataOfJobs });
          } catch (error) {
            console.error(error);
            res.status(500).json({ status: 'error', message: 'API request failed' });
          }
        };

        fetchData();
      } else {
        res.status(404).json({ status: 'error', message: 'User not found' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Database query failed' });
    });
});


/* ####################################     RECENT JOBS   ########################################## */
// ADDING THE RECEBT JOB TO THE DATABASE
app.post('/job/recent/:userId', (req, res) => {
  const userId = req.params.userId;
  const { companyId, employer_name, job_title, job_city, job_country } = req.body;

  database('recent_job')
    .select('*')
    .where({ user_id: userId, job_id: companyId })
    .then(checkTheRecentJob => {
      if (checkTheRecentJob.length > 0) {
        console.log('bu id ye ait recent job mevcut hicbir islem yapilmadi');
      } else {
        database('recent_job')
          .insert({
            user_id: userId,
            job_id: companyId,
            job_name: employer_name,
            job_title: job_title,
            job_city: job_city,
            job_country: job_country
          })
          .then(recentJobs => {
            res.json({ status: 'success', recentJobs });
            console.log('recent job ekledik');
          })
          .catch(err => {
            console.log('Veri tabanına recent job eklerken hata oluştu', err);
            res.status(500).json({ status: 'error', message: 'Veri tabanına recent job eklerken hata oluştu' });
          });
      }
    })
    .catch(err => {
      console.log('Veri tabanından recent job alırken hata oluştu', err);
      res.status(500).json({ status: 'error', message: 'Veri tabanından recent job alırken hata oluştu' });
    });
});


// GETTING RECENT JOBS FOR FILTERING ALL OF THEM
app.get('/job/recent/byuser/:userId', (req, res) => {
  const userId = req.params.userId;
  database('native')
    .table('recent_job')
    .select('*')
    .where({ user_id: userId })
    .then(allRecentJobs => {
      res.json({ status: 'success', allRecentJobs })
    })
    .catch(err => console.log('err', err))

});


// GETTING RECENT JOBS FOR LAST 4
app.get('/job/recent/byuser/4/:userId', (req, res) => {
  const userId = req.params.userId;

  database('recent_job')
    .select('*')
    .where({ user_id: userId })
    .orderBy('recent_job_id', 'desc')
    .limit(4)
    .then(company => {
      res.json({ status: 'success', company });
      console.log('son 4 taneyi aldik : ', company)
    })
    .catch(err => {
      console.log('Database query error:', err);
      res.status(500).json({ status: 'error', message: 'Database query failed' });
    });
});


/* ############################################################################## */


/*

const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search',
        params: {
          job_id: companyId,
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

*/


/* ####################################     LOGIN  ########################################## */
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  database('native')
    .select('*')
    .from('users')
    .where({ email: email, password: password })
    .then(user => {
      if (user.length !== null) {
        res.json({ status: 'success', user })
      }
      else {
        res.json({ status: 'noUser' })
        console.log('kullanici bulunamadi')
      }
    })
    .catch(err => console.log('server error', err))
})
/* ############################################################################## */



/* ####################################     SIGN UP    ########################################## */
app.post('/signup', (req, res) => {

  const { name, email, country, job, password } = req.body;

  database('native')
    .select('*')
    .from('users')
    .where({ email: email })
    .then(hasUser => {
      if (hasUser.length > 0) {
        res.json({ status: 'userFound', hasUser })
        console.log('eslesen email kullanicisi bulundu')
      } else {
        database('native')
          .insert({ name: name, country: country, job: job, password: password })
          .then(newUser => {
            res.json({ status: 'userAdded', newUser })
            console.log('kullanici basariyla eklendi')
          })
          .catch(err => {
            res.json({ status: 'error', err })
            console.log('kullaniciyi eklerken bir hata olustu', err)
          })
      }
    })

})
/* ############################################################################## */


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


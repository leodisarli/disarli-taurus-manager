const router = require('express').Router();

const logout = require('./logout');
const login = require('./login');
const auth = require('./auth');
const queueList = require('./queueList');
const queueDetails = require('./queueDetails');
const queueJobsByState = require('./queueJobsByState');
const jobDetails = require('./jobDetails');

router.get('/', login);
router.get('/logout', logout);
router.post('/auth', auth);
router.get('/list', queueList);
router.get('/:queueHost/:queueName', queueDetails);
router.get('/:queueHost/:queueName/:state(waiting|active|completed|succeeded|failed|delayed)\.:ext?', queueJobsByState);
router.get('/:queueHost/:queueName/:id', jobDetails);

module.exports = router;

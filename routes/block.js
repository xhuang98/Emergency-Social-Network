import express from 'express';
import blockerClass from '../services/blocker.js';
const router = express.Router();

router.post('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  const set = req.query.set;
  if (set === 'true') {
    let duration = 3000;
    if (req.query.duration) {
      duration = req.query.duration;
    }
    blockerClass.blocker.blockWebsite(duration);
    return res.status(200).json({ block: blockerClass.blocker.isBlocked() });
  }
  blockerClass.blocker.unblockWebsite();
  return res.status(200).json({ block: blockerClass.blocker.isBlocked() });
});

export default router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    listTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    assignEmployees,
    unassignEmployee
} = require('../controllers/teamController');


router.use(authMiddleware);

router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);


router.post('/:teamId/assign', assignEmployees);
router.delete('/:teamId/unassign', unassignEmployee);

module.exports = router;

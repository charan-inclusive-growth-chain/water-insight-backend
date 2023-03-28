const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Project = require('../database/models/Project');
const Stake = require("../database/models/Stake")
const auth = require("../middleware/auth")
const User = require("../database/models/User")
router.post('/createProject',auth, async (req, res) => {
      // Get user by ID
      const user = await User.findById(req.user._id);

      // Check if user is admin
      if (user.role !== 'contributor') {
        return res.status(400).send('You need to be contributor to access this route.');
      }
  try {
    const project = new Project({
      ...req.body,
      email: req.user.email
    });
    
    await project.save();
    res.status(201).send({
      status_code:201,
      message:"Project Created Succesfully"
    });
  } catch (error) {
    if (error.code === 11000) {
      // handle duplicate key error
      res.status(400).send({
        status_code: 400,
        message: 'Project with similar fields already exists'
      });
    }
    
  }
});


router.post('/getHash', auth,async (req,res) => {
    // Get user by ID
    const user = await User.findById(req.user._id);

    // Check if user is admin
    if (user.role !== 'contributor') {
      return res.status(400).send('You need to be contributor to access this route.');
    }

try {
  const hash = crypto.createHash('sha256');

  // Include the  title, description, and summary fields in the hash
  hash.update(req.body.title);
  hash.update(req.body.description);
  hash.update(req.body.summary);

  // If a file buffer is present, include it in the hash
  if (req.body.file) {
    hash.update(req.file);
  }

  // Set the dataHash field to the generated hash value
  dataHash = hash.digest('hex');

  res.status(200).send({
    status:200,
    hash:dataHash
  })
  
} catch (error) {
  res.status(400).send({
    status:400,
    error,
  })
  
}

})

router.post('/updateProject/:id',auth, async (req, res) => {

  const allowedUpdates = ['forVotes', 'againstVotes', 'abstainVotes', 'forAmount', 'againstAmount', 'abstainAmount', 'status'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  const id = req.params.id;
  const updateData = req.body;
  try {
    const project = await Project.findOneAndUpdate(
      { id: id },
      updateData,
      { new: true }
    );
    
    if (!project) {
      return res.status(404).send();
    }
    
    res.send(project);
  } catch (error) {
    return res.status(500).send({ error });
  }
  

 
});
router.post('/projects',auth,  async (req, res) => {
  
 const projects = await Project.find({}, 'id title description summary fundingTarget minimumStakeAmount closeTime forVotes againstVotes abstainVotes forAmount againstAmount abstainAmount status')

    res.send(projects);
  });



router.post('/projects/:id', async (req, res) => {
      // Get user by ID
      const user = await User.findById(req.user._id);

      // Check if user is admin
      if (user.role !== 'contributor') {
        return res.status(400).send('You need to be contributor to access this route.');
      }
  const id = req.params.id;

  Project.findOne({ _id: id }, (error, project) => {
    if (error) {
      return res.status(500).send({ error });
    }

    if (!project) {
      return res.status(404).send({ error: 'Project not found' });
    }

    res.send(project);
  });
});

router.post('/createStake',auth, async (req, res) => {
      // Get user by ID
      const user = await User.findById(req.user._id);

      // Check if user is admin
      if (user.role !== 'contributor') {
        return res.status(400).send('You need to be contributor to access this route.');
      }
  try {
    // Create a new stake based on the request body
    const stake = new Stake({
      walletId: req.body.walletId,
      projectId: req.body.projectId,
      stakeAmount: req.body.stakeAmount
    });

    // Save the stake to the database
    await stake.save();

    // Send a response indicating success
    res.status(201).send({ message: 'Stake created successfully' });
  } catch (error) {
    // Send a response indicating failure
    res.status(500).send({ message: 'Error creating stake', error });
  }
});

router.post('/myprojects',auth, async (req, res) => {
  try {
    const projects = await Project.find({ email: req.user.email });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});







module.exports = router;
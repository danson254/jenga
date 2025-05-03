const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get all projects for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user.id });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        
        // Check if user owns the project
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new project
router.post('/', auth, async (req, res) => {
    const { name, description, sceneData, thumbnail } = req.body;
    
    try {
        const newProject = new Project({
            name,
            description,
            sceneData,
            thumbnail,
            owner: req.user.id
        });
        
        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
    const { name, description, sceneData, thumbnail } = req.body;
    
    try {
        let project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        
        // Check if user owns the project
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        // Update fields
        project.name = name || project.name;
        project.description = description || project.description;
        project.sceneData = sceneData || project.sceneData;
        project.thumbnail = thumbnail || project.thumbnail;
        project.updatedAt = Date.now();
        
        await project.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        
        // Check if user owns the project
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        await project.remove();
        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
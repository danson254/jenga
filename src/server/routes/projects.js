const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all projects for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.userId })
            .select('-sceneData')
            .sort({ updatedAt: -1 });
        
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.userId
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new project
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, sceneData, thumbnail } = req.body;
        
        const project = new Project({
            name,
            description,
            owner: req.userId,
            sceneData,
            thumbnail
        });
        
        await project.save();
        
        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, sceneData, thumbnail } = req.body;
        
        // Find project and check ownership
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.userId
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Update fields
        if (name) project.name = name;
        if (description) project.description = description;
        if (sceneData) project.sceneData = sceneData;
        if (thumbnail) project.thumbnail = thumbnail;
        
        await project.save();
        
        res.json(project);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await Project.deleteOne({
            _id: req.params.id,
            owner: req.userId
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
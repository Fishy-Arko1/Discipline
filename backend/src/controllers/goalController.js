import Goal from '../models/Goal.js';

export const createGoal = async (req, res) => {
  try {
    const { title, description, type, category, target, priority } = req.body;

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      description,
      type,
      category,
      target,
      priority
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.user.id,
      active: true
    });

    res.status(200).json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const goal = await Goal.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({ success: true, message: 'Goal deleted', goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

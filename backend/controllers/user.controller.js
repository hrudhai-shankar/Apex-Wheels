const supabase = require('../supabase');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Return all users, excluding passwords
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map `id` to `_id` to preserve frontend properties
    const mappedUsers = users.map((u) => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
    }));

    res.json(mappedUsers);
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Do not allow deleting own admin account
    // req.user.id is a number/bigint, userIdToDelete is a string from req.params.
    if (userIdToDelete.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    // Delete user from Supabase
    // Cascading deletes bookings automatically as defined in foreign key schemas!
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userIdToDelete);

    if (error) {
      throw error;
    }

    res.json({ message: 'User account removed successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

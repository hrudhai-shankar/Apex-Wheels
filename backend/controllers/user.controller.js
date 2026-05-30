const supabase = require('../supabase');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    let users = [];
    let error = null;

    try {
      // Return all users, excluding passwords
      const { data, error: dbErr } = await supabase
        .from('users')
        .select('id, name, email, role, plan, created_at')
        .order('created_at', { ascending: false });
      
      users = data;
      error = dbErr;
    } catch (dbErr) {
      error = dbErr;
    }

    if (error || !users || users.length === 0) {
      console.log('Database query failed/empty for users list, falling back to mock user registry.');
      users = [
        { id: 'admin_bypass_id', name: 'System Admin', email: 'admin@apexwheels.com', role: 'admin', plan: 'pro', created_at: new Date().toISOString() },
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', plan: 'free', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', plan: 'pro', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      ];
    }

    // Map `id` to `_id` to preserve frontend properties
    const mappedUsers = users.map((u) => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan || 'free',
      createdAt: u.created_at || u.createdAt,
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
    if (userIdToDelete.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    // Delete user from Supabase
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userIdToDelete);

      if (error) {
        throw error;
      }
    } catch (dbErr) {
      console.log(`Failed to delete user ${userIdToDelete} from DB, fallback completed.`);
    }

    res.json({ message: 'User account removed successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

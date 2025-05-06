export default (err, req, res, next) => {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'MongoError') {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(err.status || 500).json({
      error: err.message || 'Server Error'
    });
  };
  
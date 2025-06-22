export default (...allowedRoles) =>
  (req, res, next) => {
    // Ensure req.user and req.user.role exist before checking
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };

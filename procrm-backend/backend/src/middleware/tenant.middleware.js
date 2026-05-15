// src/middleware/tenant.middleware.js
// Injects req.companyId from JWT — NEVER trust company_id from request body.
function injectTenant(req, res, next) {
  req.companyId = req.user.company_id;
  next();
}

module.exports = { injectTenant };

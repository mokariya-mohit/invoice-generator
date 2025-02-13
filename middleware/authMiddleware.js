const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

const checkRole = (roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(403).json({ message: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            req.business = decoded;

            if (!roles.includes(req.business.role)) {
                return res.status(403).json({ message: 'Access denied. Insufficient role.' });
            }

            next();
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
    };
};


const validateExpenseInput = (req, res, next) => {
    const { amount, date, description } = req.body;

      // Check if file is being uploaded, bypass the validation
      if (req.file) {
        return next();
    }


    if (!description) {
        return res.status(400).json({ error: 'Description is required' });
    }

    if (isNaN(Number(amount))) {
        return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    if (isNaN(new Date(date).getTime())) {
        return res.status(400).json({ error: 'Date must be a valid date' });
    }

    next();
};

module.exports = checkRole,validateExpenseInput;

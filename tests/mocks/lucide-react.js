// Mock for lucide-react icons in Jest tests
const React = require('react');

const mockIcon = React.forwardRef((props, ref) => 
  React.createElement('svg', { ...props, ref }, null)
);

module.exports = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '__esModule') {
      return true;
    }
    return mockIcon;
  }
});
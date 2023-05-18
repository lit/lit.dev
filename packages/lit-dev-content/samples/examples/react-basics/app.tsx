import React from 'react';
import {createRoot} from 'react-dom/client';
import './demo-greeting.js';

const root = createRoot(document.getElementById('app')!);

// Custom elements can be used directly in JSX!
root.render(<demo-greeting name="React"></demo-greeting>);

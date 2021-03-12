import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
 
import Home from '../pages/home';
 
describe('Home', () => {
    test('Renders the home page', () => {
        render(<Home />);

        screen.debug();
        
        expect(screen.getByText('Click Me')).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button"));

        screen.debug();

        expect(screen.getByText('PROCEED TO CHECKOUT')).toBeInTheDocument();

    });
});
import { render, screen } from '@testing-library/react';
import App from './App';

//Basic React Testing
test('Heading', () => {
  render(<App />);
  const element = screen.getByText(/Friend-Keeper/i)
  expect(element).toBeInTheDocument()

})

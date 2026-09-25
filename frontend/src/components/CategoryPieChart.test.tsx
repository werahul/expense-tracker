import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CategoryPieChart from './CategoryPieChart';

describe('CategoryPieChart', () => {
  it('shows a placeholder message when there is no data', () => {
    render(<CategoryPieChart data={[]} />);

    expect(screen.getByText(/no expenses recorded/i)).toBeInTheDocument();
  });
});

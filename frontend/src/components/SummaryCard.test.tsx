import { render, screen } from '@testing-library/react';
import { Wallet } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import SummaryCard from './SummaryCard';

describe('SummaryCard', () => {
  it('renders the label and value', () => {
    render(<SummaryCard label="Total expenses" value="$120.00" icon={Wallet} />);

    expect(screen.getByText('Total expenses')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
  });

  it('applies the negative tone class when remaining budget is negative', () => {
    render(<SummaryCard label="Remaining budget" value="-$20.00" icon={Wallet} tone="negative" />);

    expect(screen.getByText('-$20.00')).toHaveClass('text-red-600');
  });
});

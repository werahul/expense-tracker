import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ExpenseForm from './ExpenseForm';

describe('ExpenseForm', () => {
  it('prompts to create a category and blocks submission when none exist yet', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <ExpenseForm categories={[]} onSubmit={onSubmit} onCancel={vi.fn()} onCategoryCreated={vi.fn()} />
    );

    expect(screen.getByText(/create your first one/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/amount/i), '25');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/choose a category first/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered values for a valid expense', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    const categories = [{ id: 'cat-1', name: 'Groceries', color: '#000000' }];

    render(
      <ExpenseForm
        categories={categories}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        onCategoryCreated={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/amount/i), '42.50');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-1', amount: 42.5 })
    );
  });
});

import React from 'react';
import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';
import { ShoppingBag, CheckCircle, XCircle } from 'lucide-react';
import { BazaarExpense } from '../../../types';

interface BazaarApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: BazaarExpense | null;
  onApprove: (expenseId: string) => void;
  onReject: (expenseId: string) => void;
}

export const BazaarApprovalModal: React.FC<BazaarApprovalModalProps> = ({
  isOpen,
  onClose,
  expense,
  onApprove,
  onReject,
}) => {
  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accept / Verify Bazaar Cost">
      <div className="space-y-4">
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Date: {expense.date}</span>
            <span>Submitted By: {expense.userName || 'Member'}</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">৳{expense.totalCost}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Itemized Breakdown</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {expense.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-lg text-xs">
                <span className="text-zinc-300">{item.name}</span>
                <span className="font-mono text-zinc-100 font-bold">৳{item.cost}</span>
              </div>
            ))}
          </div>
        </div>

        {expense.receiptImage && (
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Receipt Image</h4>
            <img src={expense.receiptImage} alt="Receipt" className="w-full max-h-48 object-contain rounded-xl bg-zinc-900 border border-zinc-800" />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="danger"
            onClick={() => {
              onReject(expense.id);
              onClose();
            }}
            className="flex-1"
          >
            <XCircle className="w-4 h-4" /> Reject
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onApprove(expense.id);
              onClose();
            }}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4" /> Accept Bajar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
